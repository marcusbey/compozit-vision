// Prompt Optimization Service - Two-Level AI Prompting System
// Converts raw user input + context + features into optimized image generation prompts

import { ProjectContext, FeatureId, ContextAnalysis } from '../utils/contextAnalysis';
import contextAnalyticsService from './contextAnalyticsService';
import backendApiService from './backendApiService';

export interface PromptOptimizationRequest {
  userInput: string;
  context: ProjectContext;
  selectedFeatures: FeatureId[];
  contextAnalysis?: ContextAnalysis;
  additionalPreferences?: {
    style?: string;
    budget?: string;
    materials?: string[];
    colors?: string[];
    lighting?: string;
    size?: string;
  };
}

export interface OptimizedPrompt {
  id: string;
  originalInput: string;
  optimizedPrompt: string;
  context: ProjectContext;
  features: FeatureId[];
  promptType: 'initial' | 'refinement';
  technicalParameters: {
    aspectRatio: string;
    style: string;
    quality: string;
    lighting: string;
  };
  metadata: {
    confidence: number;
    processingTime: number;
    promptLength: number;
    createdAt: string;
  };
}

export interface PromptRefinementRequest {
  basePrompt: OptimizedPrompt;
  refinements: {
    materials?: string[];
    style?: string;
    colors?: string[];
    lighting?: string;
    mood?: string;
    details?: string[];
  };
  iterationType: 'style_change' | 'material_swap' | 'color_adjustment' | 'detail_enhancement' | 'mood_shift';
}

class PromptOptimizationService {
  private promptHistory: Map<string, OptimizedPrompt[]> = new Map();

  constructor() {
    // No need for API key initialization - backend handles it
    console.log('✅ Prompt optimization service initialized (using secure backend)');
  }

  // Main function: Convert raw input to optimized image generation prompt
  public async optimizePrompt(request: PromptOptimizationRequest): Promise<OptimizedPrompt> {
    const startTime = Date.now();

    try {
      console.log('🎨 Optimizing prompt for image generation...', request.userInput);

      // Call backend API for optimization
      const response = await backendApiService.optimizePrompt({
        userInput: request.userInput,
        context: request.context,
        selectedFeatures: request.selectedFeatures,
        additionalPreferences: request.additionalPreferences
      });

      if (!response.success || !response.data) {
        console.warn('⚠️ Backend API failed, using fallback prompt');
        return this.createFallbackPrompt(request, startTime);
      }

      // Parse the response from backend
      const optimizedPrompt = this.parseBackendResponse(response.data, request, startTime);

      // Store in history
      this.addToHistory(request.userInput, optimizedPrompt);

      // Track analytics
      contextAnalyticsService.trackEvent('prompt_optimization', {
        originalLength: request.userInput.length,
        optimizedLength: optimizedPrompt.optimizedPrompt.length,
        context: request.context,
        features: request.selectedFeatures,
        processingTime: optimizedPrompt.metadata.processingTime,
        confidence: optimizedPrompt.metadata.confidence
      });

      console.log('✅ Prompt optimized successfully');
      return optimizedPrompt;

    } catch (error) {
      console.error('❌ Prompt optimization failed:', error);
      
      // Fallback to basic prompt construction
      const fallbackPrompt = this.createFallbackPrompt(request, startTime);
      
      contextAnalyticsService.trackEvent('prompt_optimization_fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: request.context,
        fallbackUsed: true
      });

      return fallbackPrompt;
    }
  }

  // Refine existing prompt based on user selections
  public async refinePrompt(request: PromptRefinementRequest): Promise<OptimizedPrompt> {
    const startTime = Date.now();

    try {
      console.log('🔧 Refining prompt for iteration...', request.iterationType);

      // Call backend API for refinement
      const response = await backendApiService.refinePrompt({
        basePrompt: request.basePrompt,
        refinements: request.refinements,
        iterationType: request.iterationType
      });

      if (!response.success || !response.data) {
        console.warn('⚠️ Backend API failed, using fallback refinement');
        return this.createFallbackRefinement(request, startTime);
      }

      const refinedPrompt = this.parseBackendResponse(response.data, request, startTime);

      // Store refined version
      this.addToHistory(request.basePrompt.originalInput, refinedPrompt);

      contextAnalyticsService.trackEvent('prompt_refinement', {
        iterationType: request.iterationType,
        basePromptId: request.basePrompt.id,
        refinedPromptId: refinedPrompt.id,
        processingTime: refinedPrompt.metadata.processingTime
      });

      console.log('✅ Prompt refined successfully');
      return refinedPrompt;

    } catch (error) {
      console.error('❌ Prompt refinement failed:', error);
      
      // Return modified version of base prompt
      const fallbackRefined = this.createFallbackRefinement(request, startTime);
      
      contextAnalyticsService.trackEvent('prompt_refinement_fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        iterationType: request.iterationType,
        fallbackUsed: true
      });

      return fallbackRefined;
    }
  }

  // Build optimization prompt for initial generation
  private buildOptimizationPrompt(request: PromptOptimizationRequest): string {
    const contextDescriptions = {
      interior: 'indoor residential spaces, architecture, furniture, lighting, materials',
      exterior: 'outdoor spaces, landscaping, facades, structures, hardscaping',
      garden: 'botanical design, plant compositions, outdoor living, natural elements',
      mixed: 'indoor-outdoor integration, transitional spaces, hybrid environments',
      unknown: 'versatile design approach'
    };

    const featureContext = this.getFeatureContextualInfo(request.selectedFeatures, request.context);

    return `You are an expert prompt engineer for AI image generation tools like Midjourney and DALL-E. Your task is to convert a user's raw design input into a highly detailed, optimized prompt that will generate stunning, professional-quality design images.

USER INPUT: "${request.userInput}"
PROJECT CONTEXT: ${request.context} (${contextDescriptions[request.context]})
SELECTED FEATURES: ${request.selectedFeatures.join(', ')}
FEATURE DETAILS: ${featureContext}

${request.additionalPreferences ? `ADDITIONAL PREFERENCES:
${Object.entries(request.additionalPreferences).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')}` : ''}

TASK: Transform this into a detailed image generation prompt that includes:
1. **Core Design Elements**: Specific architectural/design features
2. **Visual Style**: Professional design aesthetic, lighting, composition
3. **Materials & Textures**: Detailed surface descriptions
4. **Color Palette**: Sophisticated color schemes
5. **Technical Quality**: Camera angle, lighting setup, resolution hints
6. **Context-Specific Details**: Elements unique to ${request.context} projects

OUTPUT FORMAT:
OPTIMIZED_PROMPT: [Your detailed prompt here - aim for 150-300 words]
ASPECT_RATIO: [16:9, 4:3, 1:1, or 3:4 based on the design type]
STYLE: [Contemporary, Traditional, Modern, Minimalist, etc.]
LIGHTING: [Natural, Dramatic, Soft, Professional, etc.]
CONFIDENCE: [0.0-1.0 based on how well the input translates to visual design]

Focus on creating prompts that will generate magazine-quality, professional design images that architects and designers would be proud to present to clients.`;
  }

  // Build refinement prompt for iterations
  private buildRefinementPrompt(request: PromptRefinementRequest): string {
    const basePrompt = request.basePrompt.optimizedPrompt;
    const refinements = request.refinements;

    return `You are refining an existing image generation prompt for iterative improvements. The user wants to modify specific aspects while maintaining the overall design vision.

CURRENT PROMPT: "${basePrompt}"

REFINEMENT TYPE: ${request.iterationType}
REQUESTED CHANGES:
${Object.entries(refinements).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')}

TASK: Modify the existing prompt to incorporate these changes while:
1. Preserving the core design concept and quality
2. Seamlessly integrating the new elements
3. Maintaining professional design standards
4. Ensuring the changes work harmoniously together

REFINEMENT STRATEGY:
- For style_change: Update aesthetic direction while keeping layout
- For material_swap: Replace materials while maintaining design integrity  
- For color_adjustment: Modify color palette while preserving mood
- For detail_enhancement: Add specific details without cluttering
- For mood_shift: Adjust atmosphere while keeping design elements

OUTPUT FORMAT:
REFINED_PROMPT: [Your modified prompt here]
CHANGES_MADE: [Summary of key modifications]
CONFIDENCE: [0.0-1.0 based on how well changes integrate]

Keep the refined prompt length similar to the original while making targeted improvements.`;
  }

  // Get contextual information about selected features
  private getFeatureContextualInfo(features: FeatureId[], context: ProjectContext): string {
    const featureDescriptions: Record<FeatureId, Record<ProjectContext, string>> = {
      colorPalette: {
        interior: 'warm neutrals, accent walls, coordinated furnishings',
        exterior: 'facade colors, trim details, landscape coordination',
        garden: 'seasonal color schemes, flower bed arrangements',
        mixed: 'transitional color flow, indoor-outdoor harmony',
        unknown: 'versatile color selection'
      },
      materials: {
        interior: 'flooring, wall treatments, countertops, cabinetry',
        exterior: 'siding, stone, brick, roofing materials',
        garden: 'natural stone, wood elements, metal accents',
        mixed: 'weather-resistant materials, seamless transitions',
        unknown: 'durable, aesthetic material choices'
      },
      furniture: {
        interior: 'seating, storage, lighting, decorative pieces',
        exterior: 'outdoor furniture, pergolas, built-in seating',
        garden: 'benches, planters, garden structures',
        mixed: 'weather-resistant indoor-style furniture',
        unknown: 'functional and aesthetic furniture selection'
      },
      lighting: {
        interior: 'ambient, task, accent lighting systems',
        exterior: 'landscape lighting, security, architectural highlights',
        garden: 'pathway lights, uplighting, string lights',
        mixed: 'integrated lighting systems, day-night transitions',
        unknown: 'layered lighting approach'
      },
      budget: {
        interior: 'cost-effective materials and finishes',
        exterior: 'value-engineered outdoor solutions',
        garden: 'sustainable, low-maintenance plantings',
        mixed: 'strategic investment in key transition areas',
        unknown: 'balanced cost and quality approach'
      },
      location: {
        interior: 'climate-appropriate materials, regional style',
        exterior: 'weather considerations, local architecture',
        garden: 'native plantings, climate zone appropriate',
        mixed: 'regional design integration',
        unknown: 'adaptable to various locations'
      }
    };

    return features.map(feature => {
      const description = featureDescriptions[feature]?.[context] || featureDescriptions[feature]?.unknown || feature;
      return `${feature}: ${description}`;
    }).join(', ');
  }

  // Parse Gemini's response into structured format
  private parseOptimizedPrompt(response: string, request: PromptOptimizationRequest, startTime: number): OptimizedPrompt {
    const processingTime = Date.now() - startTime;

    // Extract components from response
    const optimizedMatch = response.match(/OPTIMIZED_PROMPT:\s*(.+?)(?=ASPECT_RATIO|$)/s);
    const aspectMatch = response.match(/ASPECT_RATIO:\s*(.+?)(?=STYLE|$)/);
    const styleMatch = response.match(/STYLE:\s*(.+?)(?=LIGHTING|$)/);
    const lightingMatch = response.match(/LIGHTING:\s*(.+?)(?=CONFIDENCE|$)/);
    const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/);

    const optimizedPrompt = optimizedMatch?.[1]?.trim() || this.createBasicPrompt(request);
    const aspectRatio = aspectMatch?.[1]?.trim() || '16:9';
    const style = styleMatch?.[1]?.trim() || 'Contemporary';
    const lighting = lightingMatch?.[1]?.trim() || 'Natural';
    const confidence = parseFloat(confidenceMatch?.[1] || '0.7');

    return {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: request.userInput,
      optimizedPrompt: optimizedPrompt,
      context: request.context,
      features: request.selectedFeatures,
      promptType: 'initial',
      technicalParameters: {
        aspectRatio,
        style,
        quality: 'high',
        lighting
      },
      metadata: {
        confidence,
        processingTime,
        promptLength: optimizedPrompt.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Parse refined prompt response
  private parseRefinedPrompt(response: string, request: PromptRefinementRequest, startTime: number): OptimizedPrompt {
    const processingTime = Date.now() - startTime;

    const refinedMatch = response.match(/REFINED_PROMPT:\s*(.+?)(?=CHANGES_MADE|$)/s);
    const changesMatch = response.match(/CHANGES_MADE:\s*(.+?)(?=CONFIDENCE|$)/s);
    const confidenceMatch = response.match(/CONFIDENCE:\s*([\d.]+)/);

    const refinedPrompt = refinedMatch?.[1]?.trim() || request.basePrompt.optimizedPrompt;
    const confidence = parseFloat(confidenceMatch?.[1] || '0.7');

    return {
      id: `refined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: request.basePrompt.originalInput,
      optimizedPrompt: refinedPrompt,
      context: request.basePrompt.context,
      features: request.basePrompt.features,
      promptType: 'refinement',
      technicalParameters: {
        ...request.basePrompt.technicalParameters,
        // Inherit technical parameters but allow style updates
        style: this.extractStyleFromRefinements(request.refinements) || request.basePrompt.technicalParameters.style
      },
      metadata: {
        confidence,
        processingTime,
        promptLength: refinedPrompt.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Extract style information from refinements
  private extractStyleFromRefinements(refinements: PromptRefinementRequest['refinements']): string | null {
    if (refinements.style) return refinements.style;
    if (refinements.mood) {
      // Convert mood to style
      const moodToStyle: Record<string, string> = {
        'modern': 'Contemporary',
        'cozy': 'Traditional',
        'minimal': 'Minimalist',
        'luxurious': 'Luxury',
        'rustic': 'Rustic',
        'elegant': 'Classic'
      };
      return moodToStyle[refinements.mood.toLowerCase()] || null;
    }
    return null;
  }

  // Create basic prompt when AI optimization fails
  private createBasicPrompt(request: PromptOptimizationRequest): string {
    const contextStyles = {
      interior: 'professional interior photography, well-lit room, modern furniture',
      exterior: 'architectural photography, building exterior, landscaping',
      garden: 'landscape photography, garden design, natural lighting',
      mixed: 'indoor-outdoor space, transitional design, natural lighting',
      unknown: 'professional design photography, high quality'
    };

    const featureElements = request.selectedFeatures.map(feature => {
      switch (feature) {
        case 'colorPalette': return 'coordinated color scheme';
        case 'materials': return 'high-quality materials';
        case 'furniture': return 'stylish furniture';
        case 'lighting': return 'excellent lighting';
        default: return feature;
      }
    }).join(', ');

    return `${request.userInput}, ${contextStyles[request.context]}, ${featureElements}, professional quality, detailed, realistic, high resolution`;
  }

  // Fallback prompt creation
  private createFallbackPrompt(request: PromptOptimizationRequest, startTime: number): OptimizedPrompt {
    const basicPrompt = this.createBasicPrompt(request);

    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: request.userInput,
      optimizedPrompt: basicPrompt,
      context: request.context,
      features: request.selectedFeatures,
      promptType: 'initial',
      technicalParameters: {
        aspectRatio: '16:9',
        style: 'Contemporary',
        quality: 'high',
        lighting: 'Natural'
      },
      metadata: {
        confidence: 0.5,
        processingTime: Date.now() - startTime,
        promptLength: basicPrompt.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Fallback refinement creation
  private createFallbackRefinement(request: PromptRefinementRequest, startTime: number): OptimizedPrompt {
    let modifiedPrompt = request.basePrompt.optimizedPrompt;

    // Simple text replacement based on refinements
    Object.entries(request.refinements).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        modifiedPrompt += `, ${key}: ${value}`;
      } else if (Array.isArray(value)) {
        modifiedPrompt += `, ${key}: ${value.join(' and ')}`;
      }
    });

    return {
      id: `fallback_refined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: request.basePrompt.originalInput,
      optimizedPrompt: modifiedPrompt,
      context: request.basePrompt.context,
      features: request.basePrompt.features,
      promptType: 'refinement',
      technicalParameters: request.basePrompt.technicalParameters,
      metadata: {
        confidence: 0.4,
        processingTime: Date.now() - startTime,
        promptLength: modifiedPrompt.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Parse response from backend API
  private parseBackendResponse(
    data: any,
    request: PromptOptimizationRequest | PromptRefinementRequest,
    startTime: number
  ): OptimizedPrompt {
    const processingTime = Date.now() - startTime;
    
    // If backend returns a properly formatted response, use it
    if (data.id && data.optimizedPrompt) {
      return {
        ...data,
        metadata: {
          ...data.metadata,
          processingTime
        }
      };
    }

    // Otherwise, construct from the response
    const id = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isRefinement = 'basePrompt' in request;
    
    return {
      id,
      originalInput: isRefinement ? request.basePrompt.originalInput : request.userInput,
      optimizedPrompt: data.prompt || data.optimizedPrompt || this.createFallbackPromptText(request),
      context: data.context || (isRefinement ? request.basePrompt.context : request.context),
      features: data.features || (isRefinement ? request.basePrompt.features : request.selectedFeatures),
      promptType: isRefinement ? 'refinement' : 'initial',
      technicalParameters: data.technicalParameters || {
        aspectRatio: '16:9',
        style: 'photorealistic',
        quality: 'high',
        lighting: 'natural'
      },
      metadata: {
        confidence: data.confidence || 0.8,
        processingTime,
        promptLength: (data.prompt || data.optimizedPrompt || '').length,
        createdAt: new Date().toISOString()
      }
    };
  }

  // Create fallback prompt text
  private createFallbackPromptText(request: PromptOptimizationRequest | PromptRefinementRequest): string {
    if ('basePrompt' in request) {
      // Refinement request
      return request.basePrompt.optimizedPrompt;
    }
    
    // Initial optimization request
    return request.userInput;
  }

  // History management
  private addToHistory(originalInput: string, prompt: OptimizedPrompt): void {
    const existing = this.promptHistory.get(originalInput) || [];
    existing.push(prompt);
    
    // Keep only last 10 prompts per input
    if (existing.length > 10) {
      existing.splice(0, existing.length - 10);
    }
    
    this.promptHistory.set(originalInput, existing);
  }

  // Public methods for accessing history and utilities
  public getPromptHistory(originalInput: string): OptimizedPrompt[] {
    return this.promptHistory.get(originalInput) || [];
  }

  public getLatestPrompt(originalInput: string): OptimizedPrompt | null {
    const history = this.getPromptHistory(originalInput);
    return history.length > 0 ? history[history.length - 1] : null;
  }

  public clearHistory(): void {
    this.promptHistory.clear();
  }

  // Generate quick style variations
  public async generateStyleVariations(basePrompt: OptimizedPrompt, styles: string[]): Promise<OptimizedPrompt[]> {
    const variations: OptimizedPrompt[] = [];

    for (const style of styles) {
      try {
        const refined = await this.refinePrompt({
          basePrompt,
          refinements: { style },
          iterationType: 'style_change'
        });
        variations.push(refined);
      } catch (error) {
        console.warn(`Failed to generate ${style} variation:`, error);
      }
    }

    return variations;
  }
}

// Export singleton instance
export const promptOptimizationService = new PromptOptimizationService();
export default promptOptimizationService;