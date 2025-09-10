/**
 * Corrected Two-Step AI Generation Service
 * 
 * Step 1: User Interaction Data (JSON) → Enhanced Prompt (Gemini 2.5 Flash - Text only)
 * Step 2: Original Image + Enhanced Prompt + Reference Images → Generated Design (Nano Banana)
 * Refinements: Generated Image + Direct Prompt → Refined Design (Nano Banana - Single step)
 */

import { backendApiService } from './backendApiService';
import contextAnalyticsService from './contextAnalyticsService';

export interface UserInteractionData {
  userPrompt: string;                    // Text from user input area
  originalImage: string;                 // Base64 or URL of uploaded image
  locationClicks?: {                     // Where user clicked on image
    x: number;
    y: number;
    description?: string;                // "focus on sofa", "change this wall"
  }[];
  referenceImages?: {                    // User-provided reference images
    url: string;                         // Base64 or URL
    description: string;                 // "style like this", "color inspiration"
    type: 'style' | 'color' | 'material' | 'furniture';
  }[];
  selectedFeatures: {                   // Features selected from UI
    colorPalette?: string[];            // ["#0A0A0A", "#D4A574", "#FFFFFF"]
    priceRange?: {
      min: number;
      max: number;
      currency: string;
    };
    materials?: string[];               // ["wood", "marble", "fabric"]
    lighting?: string;                  // "natural", "dramatic", "ambient"
    roomType?: string;                  // "living_room", "bedroom", etc.
    style?: string[];                   // ["Scandinavian", "Modern"]
  };
  projectContext?: {                    // Professional project details
    clientName?: string;
    timeline?: string;
    constraints?: string[];
  };
  sessionId: string;
  userId: string;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  originalData: UserInteractionData;
  processingTime: number;
  fallbackUsed?: boolean;
  metadata: {
    step: number;
    model: string;
    promptEnhancementApplied: boolean;
  };
}

export interface GeneratedDesignResult {
  generatedImage: {
    url: string;
    base64Data?: string;
    metadata: {
      model: string;
      modelId: string;
      processingTime: number;
      promptUsed: string;
      referenceImagesUsed: number;
      generationResponse: string;
    };
  };
  sessionId: string;
  enhancedPrompt: string;
  applicationPrompt: string;
  referenceImages: any[];
}

export interface RefinedDesignResult {
  refinedImage: {
    url: string;
    base64Data?: string;
    metadata: {
      model: string;
      modelId: string;
      refinementApplied: string;
      processingTime: number;
      promptUsed: string;
      generationResponse: string;
    };
  };
  sessionId: string;
  originalRefinementPrompt: string;
  appliedRefinementPrompt: string;
}

export interface CompleteGenerationResult {
  success: boolean;
  data?: {
    generatedDesign: GeneratedDesignResult;
    enhancedPromptResult: EnhancedPromptResult;
    totalProcessingTime: number;
    steps: {
      step1Duration: number;
      step2Duration: number;
    };
  };
  error?: string;
  fallbackUsed?: boolean;
}

class CorrectedTwoStepGenerationService {
  private static instance: CorrectedTwoStepGenerationService;
  
  private constructor() {
    console.log('✅ Corrected Two-Step Generation Service initialized');
  }

  public static getInstance(): CorrectedTwoStepGenerationService {
    if (!CorrectedTwoStepGenerationService.instance) {
      CorrectedTwoStepGenerationService.instance = new CorrectedTwoStepGenerationService();
    }
    return CorrectedTwoStepGenerationService.instance;
  }

  /**
   * Step 1: Generate Enhanced Prompt from User Interaction Data
   * INPUT: JSON object with all user interactions
   * OUTPUT: Enhanced text prompt
   * AI MODEL: Gemini 2.5 Flash (TEXT ONLY - NO IMAGE)
   */
  async generateEnhancedPrompt(userInteractionData: UserInteractionData): Promise<EnhancedPromptResult> {
    console.log('🧠 Step 1: Generating enhanced prompt from user interaction data...');
    
    try {
      const response = await backendApiService.post('/gemini/enhance-prompt', {
        userInteractionData
      });

      if (!response.success) {
        throw new Error(response.error || 'Enhanced prompt generation failed');
      }

      console.log('✅ Step 1 completed - Enhanced prompt generated:', {
        originalLength: userInteractionData.userPrompt.length,
        enhancedLength: response.data.enhancedPrompt.length,
        fallbackUsed: response.data.fallbackUsed
      });

      return response.data;

    } catch (error) {
      console.error('❌ Step 1 failed - Enhanced prompt generation:', error);
      
      // Create fallback enhanced prompt
      const fallbackPrompt = this.createFallbackEnhancedPrompt(userInteractionData);
      
      return {
        enhancedPrompt: fallbackPrompt,
        originalData: userInteractionData,
        processingTime: 500,
        fallbackUsed: true,
        metadata: {
          step: 1,
          model: 'fallback',
          promptEnhancementApplied: false
        }
      };
    }
  }

  /**
   * Step 2: Generate Design Image
   * INPUT: Original image + Enhanced prompt + Reference images
   * OUTPUT: Generated design image
   * AI MODEL: Nano Banana (Gemini 2.5 Flash with Vision)
   */
  async generateDesignImage(
    originalImage: string,
    enhancedPrompt: string,
    referenceImages: UserInteractionData['referenceImages'] = [],
    sessionId: string,
    userId: string
  ): Promise<GeneratedDesignResult> {
    console.log('🎨 Step 2: Generating design with enhanced prompt + references...');
    
    try {
      const response = await backendApiService.post('/gemini/generate-design', {
        originalImage,
        enhancedPrompt,
        referenceImages,
        sessionId,
        userId
      });

      if (!response.success) {
        throw new Error(response.error || 'Design generation failed');
      }

      console.log('✅ Step 2 completed - Design generated by Nano Banana:', {
        processingTime: response.data.generatedImage.metadata.processingTime,
        referenceImagesUsed: response.data.generatedImage.metadata.referenceImagesUsed
      });

      return response.data;

    } catch (error) {
      console.error('❌ Step 2 failed - Design generation:', error);
      throw error;
    }
  }

  /**
   * Complete 2-Step Generation Process
   * Orchestrates both steps and returns combined result
   */
  async processCompleteGeneration(userInteractionData: UserInteractionData): Promise<CompleteGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting complete 2-step generation process...');

      // Step 1: Generate Enhanced Prompt (JSON → Text)
      const step1Start = Date.now();
      const enhancedPromptResult = await this.generateEnhancedPrompt(userInteractionData);
      const step1Duration = Date.now() - step1Start;

      // Step 2: Generate Design Image (Image + Text → Image)
      const step2Start = Date.now();
      const generatedDesign = await this.generateDesignImage(
        userInteractionData.originalImage,
        enhancedPromptResult.enhancedPrompt,
        userInteractionData.referenceImages,
        userInteractionData.sessionId,
        userInteractionData.userId
      );
      const step2Duration = Date.now() - step2Start;

      const totalProcessingTime = Date.now() - startTime;

      // Track successful generation
      contextAnalyticsService.trackEvent('corrected_two_step_generation_success', {
        userId: userInteractionData.userId,
        sessionId: userInteractionData.sessionId,
        step1Duration,
        step2Duration,
        totalProcessingTime,
        hasLocationClicks: !!userInteractionData.locationClicks?.length,
        hasReferenceImages: !!userInteractionData.referenceImages?.length,
        selectedFeatures: Object.keys(userInteractionData.selectedFeatures || {}),
        fallbackUsed: enhancedPromptResult.fallbackUsed
      });

      return {
        success: true,
        data: {
          generatedDesign,
          enhancedPromptResult,
          totalProcessingTime,
          steps: {
            step1Duration,
            step2Duration
          }
        }
      };

    } catch (error) {
      console.error('❌ Complete 2-step generation failed:', error);
      
      // Track failure
      contextAnalyticsService.trackEvent('corrected_two_step_generation_failure', {
        userId: userInteractionData.userId,
        sessionId: userInteractionData.sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Single-Step Design Refinement
   * INPUT: Generated image + Direct refinement prompt
   * OUTPUT: Refined image
   * AI MODEL: Nano Banana (Gemini 2.5 Flash with Vision)
   * NO JSON PROCESSING NEEDED
   */
  async refineDesign(
    generatedImage: string,
    refinementPrompt: string,
    sessionId: string,
    userId: string
  ): Promise<RefinedDesignResult> {
    console.log('🔄 Single-step refinement with direct prompt...');
    
    try {
      const response = await backendApiService.post('/gemini/refine-design', {
        generatedImage,
        refinementPrompt,
        sessionId,
        userId
      });

      if (!response.success) {
        throw new Error(response.error || 'Design refinement failed');
      }

      console.log('✅ Refinement completed:', {
        processingTime: response.data.refinedImage.metadata.processingTime,
        refinementApplied: response.data.originalRefinementPrompt
      });

      // Track successful refinement
      contextAnalyticsService.trackEvent('design_refinement_success', {
        userId,
        sessionId,
        refinementPrompt: refinementPrompt.substring(0, 100),
        processingTime: response.data.refinedImage.metadata.processingTime
      });

      return response.data;

    } catch (error) {
      console.error('❌ Design refinement failed:', error);
      
      // Track failure
      contextAnalyticsService.trackEvent('design_refinement_failure', {
        userId,
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        refinementPrompt: refinementPrompt.substring(0, 100)
      });

      throw error;
    }
  }

  /**
   * Create fallback enhanced prompt when Step 1 fails
   */
  private createFallbackEnhancedPrompt(userInteractionData: UserInteractionData): string {
    const {
      userPrompt = 'improve the space',
      selectedFeatures = {},
      locationClicks = [],
      referenceImages = []
    } = userInteractionData;

    const parts = [
      `Transform this interior space: ${userPrompt}.`,
      
      locationClicks.length > 0 ? 
        `Focus on ${locationClicks.length} specific areas where user clicked.` : '',
      
      selectedFeatures.colorPalette ? 
        `Use colors: ${selectedFeatures.colorPalette.join(', ')}.` : '',
      
      selectedFeatures.materials ? 
        `Incorporate materials: ${selectedFeatures.materials.join(', ')}.` : '',
      
      selectedFeatures.lighting ? 
        `Apply ${selectedFeatures.lighting} lighting design.` : 'Improve lighting.',
      
      selectedFeatures.style ? 
        `Design in ${selectedFeatures.style.join(' and ')} style.` : '',
      
      referenceImages.length > 0 ? 
        `Draw inspiration from ${referenceImages.length} reference images.` : '',
      
      selectedFeatures.priceRange ? 
        `Keep within $${selectedFeatures.priceRange.min}-${selectedFeatures.priceRange.max} budget.` : '',
      
      'Use professional interior design with realistic materials, proper lighting, and magazine-quality finishes.'
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Utility: Create user interaction data from UI state
   */
  public createUserInteractionData(
    userPrompt: string,
    originalImage: string,
    selectedFeatures: any,
    userId: string,
    sessionId: string,
    locationClicks?: any[],
    referenceImages?: any[],
    projectContext?: any
  ): UserInteractionData {
    return {
      userPrompt,
      originalImage,
      locationClicks,
      referenceImages,
      selectedFeatures,
      projectContext,
      sessionId,
      userId
    };
  }

  /**
   * Utility: Validate user interaction data
   */
  public validateUserInteractionData(data: UserInteractionData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userPrompt || data.userPrompt.trim().length === 0) {
      errors.push('User prompt is required');
    }

    if (!data.originalImage) {
      errors.push('Original image is required');
    }

    if (!data.userId) {
      errors.push('User ID is required');
    }

    if (!data.sessionId) {
      errors.push('Session ID is required');
    }

    // Validate location clicks format
    if (data.locationClicks) {
      data.locationClicks.forEach((click, index) => {
        if (typeof click.x !== 'number' || typeof click.y !== 'number') {
          errors.push(`Location click ${index} must have numeric x and y coordinates`);
        }
      });
    }

    // Validate reference images format
    if (data.referenceImages) {
      data.referenceImages.forEach((ref, index) => {
        if (!ref.url || !ref.description || !ref.type) {
          errors.push(`Reference image ${index} must have url, description, and type`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const correctedTwoStepGenerationService = CorrectedTwoStepGenerationService.getInstance();
export default correctedTwoStepGenerationService;