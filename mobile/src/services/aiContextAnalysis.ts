import { ImageAnalysisResult, ProcessedContext, NLPEnhancement } from '../types/contextAnalysis';
import { analyzeImageWithGemini } from './geminiVisionService';
import * as FileSystem from 'expo-file-system';

export class AIContextAnalysisService {
  private static instance: AIContextAnalysisService;
  private analysisCache = new Map<string, ImageAnalysisResult>();
  private initialized = false;

  static getInstance(): AIContextAnalysisService {
    if (!AIContextAnalysisService.instance) {
      AIContextAnalysisService.instance = new AIContextAnalysisService();
    }
    return AIContextAnalysisService.instance;
  }

  async initialize() {
    // Initialize any required models or services
    this.initialized = true;
  }

  async analyzeImage(imageUri: string): Promise<ImageAnalysisResult> {
    if (!this.initialized) await this.initialize();

    // Check cache first
    const cached = this.analysisCache.get(imageUri);
    if (cached) return cached;

    try {
      // Convert image to base64 for Gemini API
      const base64Image = await this.convertToBase64(imageUri);

      // Prepare structured prompt for Gemini
      const analysisPrompt = this.createAnalysisPrompt();

      // Call Gemini Vision API
      const geminiResponse = await analyzeImageWithGemini(base64Image, analysisPrompt);
      
      // Parse and structure the response
      const analysisResult = this.parseGeminiResponse(geminiResponse);

      // Cache the result
      this.analysisCache.set(imageUri, analysisResult);

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async processWithUserPrompt(
    imageAnalysis: ImageAnalysisResult,
    userPrompt: string
  ): Promise<ProcessedContext> {
    const nlpEnhancement = await this.analyzeUserPrompt(userPrompt, imageAnalysis);
    
    return {
      ...imageAnalysis,
      userPrompt,
      confidence: this.calculateOverallConfidence(imageAnalysis, nlpEnhancement),
      timestamp: new Date(),
      enhancements: nlpEnhancement
    };
  }

  private createAnalysisPrompt(): string {
    return `
    Analyze this image and provide a detailed response in JSON format with the following structure:
    
    {
      "spaceType": "interior" | "exterior" | "mixed",
      "roomType": {
        "category": "specific room type (e.g., living_room, bedroom, kitchen, garden, patio, facade)",
        "confidence": 0.0-1.0,
        "subType": "optional sub-category (e.g., master_bedroom, powder_room)"
      },
      "currentStyle": {
        "primary": "main design style (e.g., modern, traditional, minimalist, industrial)",
        "secondary": ["additional style elements"],
        "confidence": 0.0-1.0
      },
      "environment": {
        "lighting": "natural" | "artificial" | "mixed" | "dark",
        "timeOfDay": "morning" | "afternoon" | "evening" | "night",
        "weather": "sunny" | "cloudy" | "rainy" (for exteriors)
      },
      "detectedElements": {
        "furniture": ["list of furniture items visible"],
        "fixtures": ["built-in elements like fireplaces, shelves"],
        "materials": ["visible materials like wood, marble, concrete"],
        "colors": {
          "primary": "#hex color",
          "secondary": ["#hex colors"],
          "accent": "#hex color",
          "neutral": ["#hex colors"]
        }
      },
      "spatial": {
        "perspective": "wide_angle" | "close_up" | "detail",
        "isEmpty": boolean,
        "scale": "small" | "medium" | "large"
      },
      "quality": {
        "resolution": "low" | "medium" | "high",
        "clarity": 0.0-1.0,
        "processable": boolean
      }
    }
    
    Be specific and accurate. If unsure about something, use lower confidence scores.
    Focus on design-relevant aspects that would help in interior/exterior transformation.
    `;
  }

  private parseGeminiResponse(response: any): ImageAnalysisResult {
    try {
      // If response is already an object, use it directly
      if (typeof response === 'object') {
        return this.validateAndFillDefaults(response);
      }

      // Try to parse JSON from string response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndFillDefaults(parsed);
      }

      // Fallback to default structure
      return this.getDefaultAnalysisResult();
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.getDefaultAnalysisResult();
    }
  }

  private validateAndFillDefaults(data: any): ImageAnalysisResult {
    return {
      spaceType: data.spaceType || 'interior',
      roomType: data.roomType || undefined,
      currentStyle: {
        primary: data.currentStyle?.primary || 'contemporary',
        secondary: data.currentStyle?.secondary || [],
        confidence: data.currentStyle?.confidence || 0.5
      },
      environment: {
        lighting: data.environment?.lighting || 'mixed',
        timeOfDay: data.environment?.timeOfDay,
        weather: data.environment?.weather
      },
      detectedElements: {
        furniture: data.detectedElements?.furniture || [],
        fixtures: data.detectedElements?.fixtures || [],
        materials: data.detectedElements?.materials || [],
        colors: data.detectedElements?.colors || {
          primary: '#FFFFFF',
          secondary: [],
          neutral: ['#F5F5F5', '#E0E0E0']
        }
      },
      spatial: {
        perspective: data.spatial?.perspective || 'wide_angle',
        isEmpty: data.spatial?.isEmpty || false,
        scale: data.spatial?.scale || 'medium'
      },
      quality: {
        resolution: data.quality?.resolution || 'medium',
        clarity: data.quality?.clarity || 0.8,
        processable: data.quality?.processable !== false
      }
    };
  }

  private getDefaultAnalysisResult(): ImageAnalysisResult {
    return {
      spaceType: 'interior',
      currentStyle: {
        primary: 'contemporary',
        confidence: 0.5
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
          neutral: ['#F5F5F5', '#E0E0E0']
        }
      },
      spatial: {
        perspective: 'wide_angle',
        isEmpty: false,
        scale: 'medium'
      },
      quality: {
        resolution: 'medium',
        clarity: 0.8,
        processable: true
      }
    };
  }

  private async convertToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  private async analyzeUserPrompt(
    prompt: string,
    imageAnalysis: ImageAnalysisResult
  ): Promise<NLPEnhancement> {
    // Simple keyword extraction for now
    // In production, this would use NLP models or Gemini's text analysis
    
    const promptLower = prompt.toLowerCase();
    
    // Extract style preferences
    const styleKeywords = [
      'modern', 'traditional', 'minimalist', 'industrial', 'bohemian',
      'scandinavian', 'rustic', 'luxury', 'cozy', 'bright', 'dark'
    ];
    const stylePreferences = styleKeywords.filter(keyword => 
      promptLower.includes(keyword)
    );

    // Extract functional requirements
    const functionalKeywords = [
      'storage', 'workspace', 'entertainment', 'relaxation', 'dining',
      'cooking', 'sleeping', 'bathroom', 'outdoor', 'garden'
    ];
    const functionalRequirements = functionalKeywords.filter(keyword => 
      promptLower.includes(keyword)
    );

    // Extract intent
    const intentKeywords = {
      renovation: ['renovate', 'remodel', 'update', 'refresh'],
      decoration: ['decorate', 'style', 'furnish', 'accessorize'],
      transformation: ['transform', 'change', 'convert', 'makeover']
    };
    
    const intent: string[] = [];
    Object.entries(intentKeywords).forEach(([key, keywords]) => {
      if (keywords.some(k => promptLower.includes(k))) {
        intent.push(key);
      }
    });

    // Detect conflicts
    const conflicts = this.detectConflicts(
      stylePreferences,
      functionalRequirements,
      imageAnalysis
    );

    return {
      intent: intent.length > 0 ? intent : ['transformation'],
      stylePreferences,
      functionalRequirements,
      conflicts
    };
  }

  private detectConflicts(
    stylePreferences: string[],
    functionalRequirements: string[],
    imageAnalysis: ImageAnalysisResult
  ): string[] {
    const conflicts: string[] = [];

    // Check for style conflicts
    if (stylePreferences.includes('modern') && stylePreferences.includes('traditional')) {
      conflicts.push('Mixed style preferences: modern and traditional');
    }

    // Check for space conflicts
    if (imageAnalysis.spaceType === 'exterior' && 
        functionalRequirements.some(r => ['cooking', 'sleeping', 'bathroom'].includes(r))) {
      conflicts.push('Interior functions requested for exterior space');
    }

    return conflicts;
  }

  private calculateOverallConfidence(
    analysis: ImageAnalysisResult,
    nlpEnhancement: NLPEnhancement
  ): number {
    let confidence = 0;
    let weights = 0;

    // Image quality weight
    if (analysis.quality.processable) {
      confidence += analysis.quality.clarity * 0.2;
      weights += 0.2;
    }

    // Style detection confidence
    if (analysis.currentStyle.confidence) {
      confidence += analysis.currentStyle.confidence * 0.3;
      weights += 0.3;
    }

    // Room type confidence
    if (analysis.roomType?.confidence) {
      confidence += analysis.roomType.confidence * 0.3;
      weights += 0.3;
    }

    // NLP enhancement impact
    if (nlpEnhancement.conflicts && nlpEnhancement.conflicts.length === 0) {
      confidence += 0.2;
      weights += 0.2;
    }

    return weights > 0 ? confidence / weights : 0.5;
  }

  clearCache() {
    this.analysisCache.clear();
  }
}

// Export singleton instance
export const aiContextAnalysis = AIContextAnalysisService.getInstance();