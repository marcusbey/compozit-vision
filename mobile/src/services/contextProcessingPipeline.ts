import { 
  ImageAnalysisResult, 
  ProcessedContext, 
  NLPEnhancement 
} from '../types/contextAnalysis';
import { aiContextAnalysis } from './aiContextAnalysis';

export class ContextProcessingPipeline {
  private analysisCache = new Map<string, ProcessedContext>();
  private processingQueue = new Map<string, Promise<ProcessedContext>>();

  async processImage(
    imageUri: string,
    userPrompt?: string
  ): Promise<ProcessedContext> {
    const cacheKey = `${imageUri}_${userPrompt || 'no_prompt'}`;

    // Check cache first
    const cachedResult = this.analysisCache.get(cacheKey);
    if (cachedResult && this.isCacheValid(cachedResult)) {
      return cachedResult;
    }

    // Check if already processing
    const existingProcess = this.processingQueue.get(cacheKey);
    if (existingProcess) {
      return existingProcess;
    }

    // Start new processing
    const processingPromise = this.performProcessing(imageUri, userPrompt);
    this.processingQueue.set(cacheKey, processingPromise);

    try {
      const result = await processingPromise;
      this.analysisCache.set(cacheKey, result);
      return result;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }

  private async performProcessing(
    imageUri: string,
    userPrompt?: string
  ): Promise<ProcessedContext> {
    try {
      // Step 1: Run AI image analysis
      const analysisResult = await aiContextAnalysis.analyzeImage(imageUri);

      // Step 2: If no user prompt, return basic processed context
      if (!userPrompt) {
        return this.createBasicContext(analysisResult);
      }

      // Step 3: Process with user prompt for enhanced context
      const processedContext = await aiContextAnalysis.processWithUserPrompt(
        analysisResult,
        userPrompt
      );

      // Step 4: Apply additional enhancements
      const enhancedContext = await this.enhanceContext(processedContext);

      return enhancedContext;
    } catch (error) {
      console.error('Error in context processing pipeline:', error);
      // Return a default context on error
      return this.createDefaultContext(imageUri, userPrompt);
    }
  }

  private createBasicContext(analysis: ImageAnalysisResult): ProcessedContext {
    return {
      ...analysis,
      confidence: this.calculateBasicConfidence(analysis),
      timestamp: new Date()
    };
  }

  private async enhanceContext(context: ProcessedContext): Promise<ProcessedContext> {
    // Apply additional enhancements based on detected patterns
    const enhancements = { ...context };

    // Enhance room type detection
    if (!context.roomType && context.detectedElements.furniture.length > 0) {
      enhancements.roomType = this.inferRoomType(context.detectedElements.furniture);
    }

    // Enhance style detection with cultural influences
    if (context.currentStyle.primary) {
      enhancements.currentStyle = this.enhanceStyleDetection(context.currentStyle);
    }

    // Add budget estimation based on detected elements
    const budgetEstimate = this.estimateBudgetRange(context);
    if (budgetEstimate) {
      enhancements.budgetEstimate = budgetEstimate;
    }

    // Add location/climate inference
    const locationInference = this.inferLocationClimate(context);
    if (locationInference) {
      enhancements.location = locationInference;
    }

    return enhancements;
  }

  private inferRoomType(furniture: string[]): ProcessedContext['roomType'] {
    // Simple inference based on furniture types
    const roomIndicators: { [key: string]: string[] } = {
      'living_room': ['sofa', 'couch', 'coffee_table', 'tv_stand', 'armchair'],
      'bedroom': ['bed', 'nightstand', 'dresser', 'wardrobe', 'vanity'],
      'kitchen': ['stove', 'refrigerator', 'kitchen_island', 'dining_table'],
      'bathroom': ['toilet', 'sink', 'bathtub', 'shower', 'vanity'],
      'office': ['desk', 'office_chair', 'bookshelf', 'filing_cabinet'],
      'dining_room': ['dining_table', 'dining_chairs', 'buffet', 'china_cabinet']
    };

    let bestMatch = { category: 'unknown', score: 0 };

    Object.entries(roomIndicators).forEach(([room, indicators]) => {
      const matchCount = furniture.filter(item => 
        indicators.some(indicator => 
          item.toLowerCase().includes(indicator)
        )
      ).length;

      if (matchCount > bestMatch.score) {
        bestMatch = { category: room, score: matchCount };
      }
    });

    return bestMatch.score > 0 ? {
      category: bestMatch.category,
      confidence: Math.min(bestMatch.score / 3, 1) // Normalize confidence
    } : undefined;
  }

  private enhanceStyleDetection(currentStyle: ProcessedContext['currentStyle']) {
    // Add cultural influences based on style
    const culturalMap: { [key: string]: string[] } = {
      'modern': ['scandinavian', 'japanese', 'german'],
      'traditional': ['french', 'english', 'american_colonial'],
      'mediterranean': ['spanish', 'italian', 'greek'],
      'minimalist': ['japanese', 'scandinavian', 'contemporary'],
      'bohemian': ['moroccan', 'indian', 'global_eclectic']
    };

    const culturalInfluences = culturalMap[currentStyle.primary] || [];
    
    return {
      ...currentStyle,
      culturalInfluences
    };
  }

  private estimateBudgetRange(context: ProcessedContext) {
    // Estimate budget based on detected quality and materials
    const qualityFactors = {
      'high': { min: 50000, max: 200000 },
      'medium': { min: 20000, max: 50000 },
      'low': { min: 5000, max: 20000 }
    };

    const materialFactors: { [key: string]: number } = {
      'marble': 1.5,
      'hardwood': 1.3,
      'granite': 1.4,
      'luxury': 2.0,
      'basic': 0.7
    };

    let baseBudget = qualityFactors[context.quality.resolution] || qualityFactors.medium;
    let multiplier = 1;

    // Adjust based on detected materials
    context.detectedElements.materials.forEach(material => {
      const factor = materialFactors[material.toLowerCase()];
      if (factor) {
        multiplier = Math.max(multiplier, factor);
      }
    });

    return {
      min: Math.round(baseBudget.min * multiplier),
      max: Math.round(baseBudget.max * multiplier),
      confidence: 0.6
    };
  }

  private inferLocationClimate(context: ProcessedContext) {
    // Infer climate based on environmental factors
    if (context.spaceType === 'exterior') {
      const { lighting, weather } = context.environment;
      
      let climate = 'temperate';
      if (weather === 'sunny' && lighting === 'natural') {
        climate = 'tropical';
      } else if (weather === 'cloudy') {
        climate = 'temperate';
      }

      return { climate };
    }

    return undefined;
  }

  private calculateBasicConfidence(analysis: ImageAnalysisResult): number {
    let totalConfidence = 0;
    let factors = 0;

    // Quality factor
    if (analysis.quality.processable) {
      totalConfidence += analysis.quality.clarity;
      factors++;
    }

    // Style confidence
    if (analysis.currentStyle.confidence) {
      totalConfidence += analysis.currentStyle.confidence;
      factors++;
    }

    // Room type confidence
    if (analysis.roomType?.confidence) {
      totalConfidence += analysis.roomType.confidence;
      factors++;
    }

    // Element detection confidence (based on count)
    const elementCount = 
      analysis.detectedElements.furniture.length + 
      analysis.detectedElements.fixtures.length;
    
    if (elementCount > 0) {
      totalConfidence += Math.min(elementCount / 10, 1);
      factors++;
    }

    return factors > 0 ? totalConfidence / factors : 0.5;
  }

  private isCacheValid(cached: ProcessedContext): boolean {
    // Cache is valid for 5 minutes
    const cacheAge = Date.now() - cached.timestamp.getTime();
    return cacheAge < 5 * 60 * 1000;
  }

  private createDefaultContext(imageUri: string, userPrompt?: string): ProcessedContext {
    return {
      spaceType: 'interior',
      currentStyle: {
        primary: 'contemporary',
        confidence: 0.3
      },
      environment: {
        lighting: 'mixed'
      },
      detectedElements: {
        furniture: [],
        fixtures: [],
        materials: [],
        colors: {
          primary: '#FFFFFF',
          secondary: [],
          neutral: ['#F5F5F5']
        }
      },
      spatial: {
        perspective: 'wide_angle',
        isEmpty: false,
        scale: 'medium'
      },
      quality: {
        resolution: 'medium',
        clarity: 0.5,
        processable: true
      },
      confidence: 0.3,
      timestamp: new Date(),
      userPrompt
    };
  }

  clearCache() {
    this.analysisCache.clear();
  }

  getCacheSize(): number {
    return this.analysisCache.size;
  }
}

// Export singleton instance
export const contextProcessingPipeline = new ContextProcessingPipeline();