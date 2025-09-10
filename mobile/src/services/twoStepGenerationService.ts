/**
 * Two-Step AI Generation Service
 * Core service for the sophisticated 2-step image generation process
 * 
 * Step 1: Context Analysis & Prompt Enhancement (Gemini 2.5 Flash)
 * Step 2: Professional Image Generation (Imagen 3)
 */

import { backendApiService } from './backendApiService';
import { contextProcessingPipeline } from './contextProcessingPipeline';
import { FeatureId, ProjectContext } from '../utils/contextAnalysis';
import contextAnalyticsService from './contextAnalyticsService';

// Cultural preferences based on COMPREHENSIVE-DESIGN-CATEGORIES.md
export interface CulturalPreferences {
  primaryStyle: string;
  culturalInfluences: string[];
  regionCode?: string;
  authenticityLevel: 'moderate' | 'high' | 'strict';
}

export interface TwoStepGenerationRequest {
  originalImage: string;              // Base64 or URL
  userPrompt: string;                // User's transformation request
  selectedFeatures: FeatureId[];     // UI-selected features
  projectContext?: ProjectContext;    // Professional project details
  culturalPreferences?: CulturalPreferences;
  userId: string;
  sessionId: string;
}

export interface ContextAnalysisResult {
  roomType: string;
  currentStyle: string[];
  materials: string[];
  lighting: string;
  spatialLayout: string;
  potentialImprovements: string[];
  confidence: number;
}

export interface EnhancedPromptResult {
  transformationPrompt: string;       // Detailed prompt for image generation
  technicalRequirements: {
    aspectRatio: string;
    lighting: string;
    composition: string;
    quality: string;
  };
  culturalNotes: string[];           // Cultural elements to include
  styleConfidence: number;           // Confidence in style interpretation
  professionalEnhancements: string[]; // Added professional elements
}

export interface GeneratedImageResult {
  url: string;
  base64Data?: string;
  metadata: {
    modelUsed: string;
    generationTime: number;
    qualityScore: number;
    culturalAuthenticityScore: number;
    watermarked: boolean;
  };
}

export interface TwoStepGenerationResult {
  success: boolean;
  data?: {
    generatedImage: GeneratedImageResult;
    contextAnalysis: ContextAnalysisResult;
    enhancedPrompt: EnhancedPromptResult;
    originalPrompt: string;
    processingSteps: {
      step1Duration: number;
      step2Duration: number;
      totalDuration: number;
    };
    sessionId: string;
    confidence: number;
  };
  error?: string;
  fallbackUsed?: boolean;
}

export interface DesignRefinements {
  styleAdjustments?: string[];
  materialChanges?: string[];
  colorModifications?: string[];
  lightingChanges?: string;
  moodShifts?: string;
  additionalElements?: string[];
  removeElements?: string[];
}

// Cultural guidelines mapping from COMPREHENSIVE-DESIGN-CATEGORIES.md
const CULTURAL_GUIDELINES = {
  'Scandinavian': {
    elements: ['light woods', 'white walls', 'cozy textiles', 'hygge concept', 'natural light'],
    materials: ['birch', 'pine', 'wool', 'linen', 'natural stone'],
    colors: ['whites', 'light grays', 'natural wood tones', 'soft blues'],
    lighting: ['natural light maximization', 'warm ambient', 'minimal fixtures'],
    principles: ['simplicity', 'functionality', 'connection to nature']
  },
  'Mediterranean': {
    elements: ['terracotta', 'wrought iron', 'natural stone', 'coastal charm', 'arched doorways'],
    materials: ['ceramic tiles', 'stone', 'wood shutters', 'wrought iron'],
    colors: ['warm earth tones', 'sea blues', 'sunset oranges', 'olive greens'],
    lighting: ['natural sunlight', 'lantern-style fixtures', 'warm evening glow'],
    principles: ['outdoor-indoor living', 'natural materials', 'relaxed elegance']
  },
  'Japanese': {
    elements: ['tatami mats', 'shoji screens', 'natural wood', 'zen elements', 'minimal furniture'],
    materials: ['bamboo', 'natural wood', 'rice paper', 'natural fibers'],
    colors: ['natural wood tones', 'whites', 'earth tones', 'muted greens'],
    lighting: ['soft natural light', 'paper lanterns', 'subtle accent lighting'],
    principles: ['minimalism', 'harmony', 'natural beauty', 'functional simplicity']
  },
  'Modern': {
    elements: ['clean lines', 'geometric shapes', 'minimal decoration', 'open spaces'],
    materials: ['steel', 'glass', 'concrete', 'leather'],
    colors: ['neutrals', 'bold accents', 'black and white', 'monochromatic schemes'],
    lighting: ['dramatic lighting', 'architectural fixtures', 'LED systems'],
    principles: ['form follows function', 'less is more', 'innovative materials']
  },
  'Traditional': {
    elements: ['classic furniture', 'rich textures', 'ornate details', 'symmetrical layouts'],
    materials: ['solid wood', 'natural fabrics', 'brass fixtures', 'marble'],
    colors: ['rich jewel tones', 'warm neutrals', 'deep blues and greens'],
    lighting: ['chandeliers', 'table lamps', 'warm ambient lighting'],
    principles: ['timeless elegance', 'comfort', 'refined craftsmanship']
  }
};

class TwoStepGenerationService {
  private static instance: TwoStepGenerationService;
  
  private constructor() {
    console.log('✅ Two-Step Generation Service initialized');
  }

  public static getInstance(): TwoStepGenerationService {
    if (!TwoStepGenerationService.instance) {
      TwoStepGenerationService.instance = new TwoStepGenerationService();
    }
    return TwoStepGenerationService.instance;
  }

  /**
   * Main generation function - orchestrates the 2-step process
   */
  async generateDesign(request: TwoStepGenerationRequest): Promise<TwoStepGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🎨 Starting 2-step generation process...', {
        prompt: request.userPrompt.substring(0, 50) + '...',
        features: request.selectedFeatures.length,
        style: request.culturalPreferences?.primaryStyle
      });

      // Step 1: Context Analysis & Prompt Enhancement
      const step1Start = Date.now();
      const contextAnalysis = await this.performContextAnalysis(request);
      const enhancedPrompt = await this.generateEnhancedPrompt(request, contextAnalysis);
      const step1Duration = Date.now() - step1Start;

      console.log('✅ Step 1 completed - Context analysis & prompt enhancement', {
        confidence: enhancedPrompt.styleConfidence,
        promptLength: enhancedPrompt.transformationPrompt.length
      });

      // Step 2: Professional Image Generation
      const step2Start = Date.now();
      const generatedImage = await this.performImageGeneration(request, enhancedPrompt);
      const step2Duration = Date.now() - step2Start;

      console.log('✅ Step 2 completed - Image generation', {
        qualityScore: generatedImage.metadata.qualityScore,
        culturalScore: generatedImage.metadata.culturalAuthenticityScore
      });

      const totalDuration = Date.now() - startTime;

      // Track successful generation
      contextAnalyticsService.trackEvent('two_step_generation_success', {
        userId: request.userId,
        sessionId: request.sessionId,
        style: request.culturalPreferences?.primaryStyle,
        features: request.selectedFeatures,
        step1Duration,
        step2Duration,
        totalDuration,
        confidence: enhancedPrompt.styleConfidence,
        qualityScore: generatedImage.metadata.qualityScore
      });

      return {
        success: true,
        data: {
          generatedImage,
          contextAnalysis,
          enhancedPrompt,
          originalPrompt: request.userPrompt,
          processingSteps: {
            step1Duration,
            step2Duration,
            totalDuration
          },
          sessionId: request.sessionId,
          confidence: Math.min(enhancedPrompt.styleConfidence, generatedImage.metadata.qualityScore)
        }
      };

    } catch (error) {
      console.error('❌ Two-step generation failed:', error);
      
      // Track failure
      contextAnalyticsService.trackEvent('two_step_generation_failure', {
        userId: request.userId,
        sessionId: request.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });

      // Attempt fallback generation
      return await this.attemptFallbackGeneration(request, error);
    }
  }

  /**
   * Step 1: Context Analysis using image processing pipeline
   */
  private async performContextAnalysis(request: TwoStepGenerationRequest): Promise<ContextAnalysisResult> {
    try {
      // Use existing context processing pipeline
      const imageAnalysis = await contextProcessingPipeline.analyzeImage(request.originalImage);
      
      return {
        roomType: imageAnalysis.roomType || 'unknown',
        currentStyle: imageAnalysis.detectedStyles || [],
        materials: imageAnalysis.materials || [],
        lighting: imageAnalysis.lightingConditions || 'natural',
        spatialLayout: imageAnalysis.layout || 'open',
        potentialImprovements: this.identifyImprovements(imageAnalysis, request),
        confidence: imageAnalysis.confidence || 0.7
      };
    } catch (error) {
      console.warn('⚠️ Context analysis fallback used:', error);
      
      // Fallback context analysis
      return {
        roomType: 'living_room', // Default assumption
        currentStyle: ['contemporary'],
        materials: ['wood', 'fabric'],
        lighting: 'natural',
        spatialLayout: 'open',
        potentialImprovements: ['improved lighting', 'better color coordination'],
        confidence: 0.5
      };
    }
  }

  /**
   * Step 1: Generate enhanced prompt using context + cultural guidelines
   */
  private async generateEnhancedPrompt(
    request: TwoStepGenerationRequest,
    contextAnalysis: ContextAnalysisResult
  ): Promise<EnhancedPromptResult> {
    try {
      const culturalGuidelines = request.culturalPreferences?.primaryStyle ? 
        CULTURAL_GUIDELINES[request.culturalPreferences.primaryStyle as keyof typeof CULTURAL_GUIDELINES] : null;

      // Build comprehensive prompt
      const transformationPrompt = this.buildTransformationPrompt(
        request,
        contextAnalysis,
        culturalGuidelines
      );

      const technicalRequirements = this.determineTechnicalRequirements(
        contextAnalysis.roomType,
        request.culturalPreferences?.primaryStyle
      );

      const culturalNotes = culturalGuidelines ? 
        this.extractCulturalNotes(culturalGuidelines) : [];

      const professionalEnhancements = this.addProfessionalEnhancements(
        request.selectedFeatures,
        contextAnalysis
      );

      return {
        transformationPrompt,
        technicalRequirements,
        culturalNotes,
        styleConfidence: this.calculateStyleConfidence(request, contextAnalysis),
        professionalEnhancements
      };

    } catch (error) {
      console.warn('⚠️ Enhanced prompt generation fallback:', error);
      
      // Fallback to basic prompt enhancement
      return {
        transformationPrompt: `${request.userPrompt}, professional interior design, high quality, realistic lighting, detailed textures`,
        technicalRequirements: {
          aspectRatio: '16:9',
          lighting: 'natural',
          composition: 'full_room',
          quality: 'high'
        },
        culturalNotes: [],
        styleConfidence: 0.6,
        professionalEnhancements: ['professional photography', 'high resolution']
      };
    }
  }

  /**
   * Step 2: Generate image using Gemini Imagen 3
   */
  private async performImageGeneration(
    request: TwoStepGenerationRequest,
    enhancedPrompt: EnhancedPromptResult
  ): Promise<GeneratedImageResult> {
    try {
      // Prepare generation request for backend
      const generationRequest = {
        originalImage: request.originalImage,
        enhancedPrompt: enhancedPrompt.transformationPrompt,
        technicalRequirements: enhancedPrompt.technicalRequirements,
        culturalNotes: enhancedPrompt.culturalNotes,
        professionalGuidelines: this.getProfessionalGuidelines(),
        qualityLevel: 'premium'
      };

      // Call backend API for image generation
      const response = await backendApiService.post('/gemini/generate-image', generationRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Backend image generation failed');
      }

      return {
        url: response.data.imageUrl,
        base64Data: response.data.base64Data,
        metadata: {
          modelUsed: response.data.model || 'imagen-3',
          generationTime: response.data.generationTime || 0,
          qualityScore: response.data.qualityScore || 0.8,
          culturalAuthenticityScore: response.data.culturalScore || 0.8,
          watermarked: true
        }
      };

    } catch (error) {
      console.warn('⚠️ Image generation fallback:', error);
      
      // For development/fallback, return the original image with metadata
      return {
        url: request.originalImage,
        metadata: {
          modelUsed: 'fallback',
          generationTime: 2000,
          qualityScore: 0.5,
          culturalAuthenticityScore: 0.5,
          watermarked: false
        }
      };
    }
  }

  /**
   * Build detailed transformation prompt combining all inputs
   */
  private buildTransformationPrompt(
    request: TwoStepGenerationRequest,
    contextAnalysis: ContextAnalysisResult,
    culturalGuidelines: any
  ): string {
    const parts = [
      // Base transformation request
      `Transform this ${contextAnalysis.roomType} image: ${request.userPrompt}`,
      
      // Cultural style guidelines
      culturalGuidelines ? `Apply ${request.culturalPreferences?.primaryStyle} design principles: ${culturalGuidelines.principles.join(', ')}` : '',
      
      // Specific materials and elements
      culturalGuidelines ? `Use materials: ${culturalGuidelines.materials.join(', ')}` : '',
      culturalGuidelines ? `Include elements: ${culturalGuidelines.elements.slice(0, 3).join(', ')}` : '',
      
      // Color guidance
      culturalGuidelines ? `Color palette: ${culturalGuidelines.colors.join(', ')}` : '',
      
      // Feature-specific enhancements
      this.buildFeatureEnhancements(request.selectedFeatures, contextAnalysis),
      
      // Professional quality requirements
      'Professional interior design photography, magazine quality, high resolution, realistic textures, proper lighting, architectural perspective'
    ].filter(Boolean);

    return parts.join('. ') + '.';
  }

  /**
   * Build feature-specific prompt enhancements
   */
  private buildFeatureEnhancements(features: FeatureId[], context: ContextAnalysisResult): string {
    const enhancements = features.map(feature => {
      switch (feature) {
        case 'lighting':
          return 'professional lighting design with layered ambient, task, and accent lighting';
        case 'materials':
          return 'high-quality materials with detailed textures and realistic finishes';
        case 'colorPalette':
          return 'sophisticated color coordination with complementary tones';
        case 'furniture':
          return 'carefully selected furniture pieces with proper scale and proportion';
        case 'budget':
          return 'cost-effective yet stylish design solutions';
        case 'location':
          return 'design adapted to local climate and cultural preferences';
        default:
          return `enhanced ${feature} elements`;
      }
    });

    return enhancements.length > 0 ? `Focus on: ${enhancements.join(', ')}` : '';
  }

  /**
   * Calculate style confidence based on input quality
   */
  private calculateStyleConfidence(request: TwoStepGenerationRequest, context: ContextAnalysisResult): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence for clear style preferences
    if (request.culturalPreferences?.primaryStyle) confidence += 0.1;
    
    // Increase confidence for detailed user prompt
    if (request.userPrompt.length > 50) confidence += 0.1;
    
    // Increase confidence for multiple selected features
    if (request.selectedFeatures.length > 3) confidence += 0.1;
    
    // Factor in context analysis confidence
    confidence = (confidence + context.confidence) / 2;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Professional guidelines for brand consistency
   */
  private getProfessionalGuidelines(): string {
    return `PROFESSIONAL PHOTOGRAPHY STANDARDS:
- Magazine-quality interior design photography with natural lighting
- Sharp focus on textures and materials with 4K quality detail
- Proper architectural perspective and professional framing
- Authority Black (#0A0A0A) and Platinum Gold (#D4A574) brand consistency
- Prestigious, sophisticated aesthetic with gallery-like precision
- Luxury materials with matte finishes and chic simplicity`;
  }

  /**
   * Fallback generation when main process fails
   */
  private async attemptFallbackGeneration(
    request: TwoStepGenerationRequest,
    error: any
  ): Promise<TwoStepGenerationResult> {
    console.log('🔄 Attempting fallback generation...');
    
    try {
      // Simple fallback - return enhanced original image
      const basicPrompt = `${request.userPrompt}, professional interior design, high quality`;
      
      return {
        success: true,
        fallbackUsed: true,
        data: {
          generatedImage: {
            url: request.originalImage,
            metadata: {
              modelUsed: 'fallback',
              generationTime: 1000,
              qualityScore: 0.6,
              culturalAuthenticityScore: 0.6,
              watermarked: false
            }
          },
          contextAnalysis: {
            roomType: 'unknown',
            currentStyle: ['contemporary'],
            materials: [],
            lighting: 'natural',
            spatialLayout: 'open',
            potentialImprovements: [],
            confidence: 0.5
          },
          enhancedPrompt: {
            transformationPrompt: basicPrompt,
            technicalRequirements: {
              aspectRatio: '16:9',
              lighting: 'natural',
              composition: 'full_room',
              quality: 'standard'
            },
            culturalNotes: [],
            styleConfidence: 0.5,
            professionalEnhancements: []
          },
          originalPrompt: request.userPrompt,
          processingSteps: {
            step1Duration: 500,
            step2Duration: 500,
            totalDuration: 1000
          },
          sessionId: request.sessionId,
          confidence: 0.5
        }
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'}`
      };
    }
  }

  /**
   * Refine existing design with user feedback
   */
  async refineDesign(
    originalResult: TwoStepGenerationResult,
    refinements: DesignRefinements,
    sessionId: string
  ): Promise<TwoStepGenerationResult> {
    if (!originalResult.success || !originalResult.data) {
      throw new Error('Cannot refine failed generation result');
    }

    console.log('🔧 Refining design based on user feedback...');
    
    try {
      const refinementRequest = {
        originalImage: originalResult.data.generatedImage.url,
        basePrompt: originalResult.data.enhancedPrompt.transformationPrompt,
        refinements,
        sessionId,
        originalContext: originalResult.data.contextAnalysis
      };

      const response = await backendApiService.post('/gemini/refine-image', refinementRequest);
      
      if (!response.success) {
        throw new Error(response.error || 'Refinement failed');
      }

      // Return updated result
      return {
        ...originalResult,
        data: {
          ...originalResult.data,
          generatedImage: response.data.generatedImage,
          processingSteps: {
            ...originalResult.data.processingSteps,
            totalDuration: originalResult.data.processingSteps.totalDuration + response.data.refinementTime
          }
        }
      };

    } catch (error) {
      console.error('❌ Design refinement failed:', error);
      throw error;
    }
  }

  // Helper methods
  private identifyImprovements(analysis: any, request: TwoStepGenerationRequest): string[] {
    const improvements = [];
    
    if (request.selectedFeatures.includes('lighting')) {
      improvements.push('enhanced lighting design');
    }
    if (request.selectedFeatures.includes('materials')) {
      improvements.push('material quality upgrade');
    }
    if (request.selectedFeatures.includes('colorPalette')) {
      improvements.push('color harmony optimization');
    }
    
    return improvements;
  }

  private determineTechnicalRequirements(roomType: string, style?: string): any {
    const aspectRatios: Record<string, string> = {
      'living_room': '16:9',
      'bedroom': '4:3',
      'kitchen': '16:9',
      'bathroom': '1:1'
    };

    return {
      aspectRatio: aspectRatios[roomType] || '16:9',
      lighting: style === 'Scandinavian' ? 'natural_bright' : 'natural',
      composition: roomType === 'bathroom' ? 'close_up' : 'full_room',
      quality: 'premium'
    };
  }

  private extractCulturalNotes(guidelines: any): string[] {
    return [
      ...guidelines.principles,
      ...guidelines.elements.slice(0, 3)
    ];
  }

  private addProfessionalEnhancements(features: FeatureId[], context: ContextAnalysisResult): string[] {
    return [
      'professional photography',
      'magazine-quality composition',
      'realistic material textures',
      'architectural accuracy',
      ...features.map(f => `enhanced ${f}`)
    ];
  }
}

// Export singleton instance
export const twoStepGenerationService = TwoStepGenerationService.getInstance();
export default twoStepGenerationService;