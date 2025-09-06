// Image Generation Service - Level 2 of Two-Level AI System
// Handles integration with various image generation APIs (Midjourney, DALL-E, Stable Diffusion)

import { OptimizedPrompt } from './promptOptimizationService';
import contextAnalyticsService from './contextAnalyticsService';

export interface ImageGenerationRequest {
  prompt: OptimizedPrompt;
  provider: ImageProvider;
  parameters?: ImageGenerationParameters;
  userId?: string;
  sessionId?: string;
}

export interface ImageGenerationParameters {
  width?: number;
  height?: number;
  quality?: 'draft' | 'standard' | 'hd';
  style?: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  guidance?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  promptId: string;
  provider: ImageProvider;
  parameters: ImageGenerationParameters;
  metadata: {
    generationTime: number;
    cost?: number;
    width: number;
    height: number;
    fileSize?: number;
    format: string;
    quality: string;
  };
  status: ImageStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface ImageRefinementRequest {
  baseImageId: string;
  refinedPrompt: OptimizedPrompt;
  refinementType: 'style_change' | 'material_swap' | 'color_adjustment' | 'detail_enhancement' | 'mood_shift';
  strength?: number; // 0.1-1.0 for how much to change the image
}

export type ImageProvider = 'openai_dalle' | 'stability_ai' | 'midjourney' | 'leonardo' | 'mock';
export type ImageStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'expired';

export interface ImageProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  maxResolution: { width: number; height: number };
  supportedFormats: string[];
  costPerImage: number;
  averageGenerationTime: number;
  supportsRefinement: boolean;
  supportsNegativePrompts: boolean;
}

class ImageGenerationService {
  private providers: Map<ImageProvider, ImageProviderConfig> = new Map();
  private generatedImages: Map<string, GeneratedImage> = new Map();
  private defaultProvider: ImageProvider = 'mock'; // Default to mock for development

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // OpenAI DALL-E Configuration
    this.providers.set('openai_dalle', {
      name: 'OpenAI DALL-E 3',
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
      maxResolution: { width: 1792, height: 1792 },
      supportedFormats: ['png'],
      costPerImage: 0.040, // DALL-E 3 HD pricing
      averageGenerationTime: 15000,
      supportsRefinement: false,
      supportsNegativePrompts: false
    });

    // Stability AI Configuration
    this.providers.set('stability_ai', {
      name: 'Stability AI SDXL',
      apiKey: process.env.STABILITY_API_KEY || '',
      baseUrl: 'https://api.stability.ai/v1',
      maxResolution: { width: 1536, height: 1536 },
      supportedFormats: ['png', 'jpeg'],
      costPerImage: 0.020,
      averageGenerationTime: 10000,
      supportsRefinement: true,
      supportsNegativePrompts: true
    });

    // Mock Provider for Development
    this.providers.set('mock', {
      name: 'Mock Provider',
      apiKey: 'mock',
      baseUrl: 'https://picsum.photos',
      maxResolution: { width: 1024, height: 1024 },
      supportedFormats: ['jpeg'],
      costPerImage: 0,
      averageGenerationTime: 2000,
      supportsRefinement: true,
      supportsNegativePrompts: false
    });
  }

  // Main function: Generate image from optimized prompt
  public async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const startTime = Date.now();
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('🎨 Generating image with provider:', request.provider);

      // Track generation start
      contextAnalyticsService.trackEvent('image_generation_started', {
        promptId: request.prompt.id,
        provider: request.provider,
        userId: request.userId,
        sessionId: request.sessionId
      });

      // Create pending image record
      const pendingImage: GeneratedImage = {
        id: imageId,
        url: '',
        promptId: request.prompt.id,
        provider: request.provider,
        parameters: this.normalizeParameters(request.parameters || {}, request.provider),
        metadata: {
          generationTime: 0,
          width: 0,
          height: 0,
          format: 'png',
          quality: request.parameters?.quality || 'standard'
        },
        status: 'generating',
        createdAt: new Date().toISOString()
      };

      this.generatedImages.set(imageId, pendingImage);

      // Generate image based on provider
      let generatedImage: GeneratedImage;
      
      switch (request.provider) {
        case 'openai_dalle':
          generatedImage = await this.generateWithOpenAI(pendingImage, request);
          break;
        case 'stability_ai':
          generatedImage = await this.generateWithStabilityAI(pendingImage, request);
          break;
        case 'mock':
          generatedImage = await this.generateWithMock(pendingImage, request);
          break;
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }

      // Update generation time
      generatedImage.metadata.generationTime = Date.now() - startTime;
      generatedImage.status = 'completed';

      // Store final result
      this.generatedImages.set(imageId, generatedImage);

      // Track successful generation
      contextAnalyticsService.trackEvent('image_generation_completed', {
        imageId: generatedImage.id,
        promptId: request.prompt.id,
        provider: request.provider,
        generationTime: generatedImage.metadata.generationTime,
        cost: generatedImage.metadata.cost,
        dimensions: `${generatedImage.metadata.width}x${generatedImage.metadata.height}`
      });

      console.log('✅ Image generated successfully:', generatedImage.id);
      return generatedImage;

    } catch (error) {
      console.error('❌ Image generation failed:', error);

      const failedImage = this.generatedImages.get(imageId);
      if (failedImage) {
        failedImage.status = 'failed';
        failedImage.metadata.generationTime = Date.now() - startTime;
        this.generatedImages.set(imageId, failedImage);
      }

      contextAnalyticsService.trackEvent('image_generation_failed', {
        imageId,
        promptId: request.prompt.id,
        provider: request.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime
      });

      throw error;
    }
  }

  // Refine existing image with new prompt
  public async refineImage(request: ImageRefinementRequest): Promise<GeneratedImage> {
    const baseImage = this.generatedImages.get(request.baseImageId);
    if (!baseImage) {
      throw new Error(`Base image not found: ${request.baseImageId}`);
    }

    const provider = baseImage.provider;
    const providerConfig = this.providers.get(provider);

    if (!providerConfig?.supportsRefinement) {
      return this.generateImage({
        prompt: request.refinedPrompt,
        provider: provider,
        parameters: baseImage.parameters
      });
    }

    const startTime = Date.now();
    const refinedImageId = `refined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('🔧 Refining image:', request.baseImageId, request.refinementType);

      const pendingRefinedImage: GeneratedImage = {
        id: refinedImageId,
        url: '',
        promptId: request.refinedPrompt.id,
        provider: provider,
        parameters: { ...baseImage.parameters },
        metadata: {
          generationTime: 0,
          width: baseImage.metadata.width,
          height: baseImage.metadata.height,
          format: baseImage.metadata.format,
          quality: baseImage.metadata.quality
        },
        status: 'generating',
        createdAt: new Date().toISOString()
      };

      this.generatedImages.set(refinedImageId, pendingRefinedImage);

      let refinedImage: GeneratedImage;

      switch (provider) {
        case 'stability_ai':
          refinedImage = await this.refineWithStabilityAI(pendingRefinedImage, baseImage, request);
          break;
        case 'mock':
          refinedImage = await this.refineWithMock(pendingRefinedImage, baseImage, request);
          break;
        default:
          refinedImage = await this.generateImage({
            prompt: request.refinedPrompt,
            provider: provider,
            parameters: baseImage.parameters
          });
      }

      refinedImage.metadata.generationTime = Date.now() - startTime;
      refinedImage.status = 'completed';
      this.generatedImages.set(refinedImageId, refinedImage);

      contextAnalyticsService.trackEvent('image_refinement_completed', {
        originalImageId: request.baseImageId,
        refinedImageId: refinedImage.id,
        refinementType: request.refinementType,
        generationTime: refinedImage.metadata.generationTime
      });

      console.log('✅ Image refined successfully:', refinedImage.id);
      return refinedImage;

    } catch (error) {
      console.error('❌ Image refinement failed:', error);

      contextAnalyticsService.trackEvent('image_refinement_failed', {
        originalImageId: request.baseImageId,
        refinementType: request.refinementType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  // Mock Implementation for Development
  private async generateWithMock(pendingImage: GeneratedImage, request: ImageGenerationRequest): Promise<GeneratedImage> {
    const { width, height } = this.getOptimalSize(request.parameters, this.providers.get('mock')!);
    
    console.log('🎭 MOCK Generation Details:');
    console.log('📝 Prompt:', request.prompt.optimizedPrompt);
    console.log('🖼️ Input image provided:', request.parameters?.inputImage ? 'YES' : 'NO');
    console.log('📐 Dimensions:', width + 'x' + height);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // If we have an input image, just return it transformed (in real implementation)
    // For mock, we'll use the input image if available, otherwise use random
    if (request.parameters?.inputImage) {
      console.log('🔄 Mock: Using input image as base for transformation');
      // In a real implementation, this would send the image + prompt to an AI service
      // For now, return the original image to show it's being used
      return {
        ...pendingImage,
        url: request.parameters.inputImage,
        thumbnailUrl: request.parameters.inputImage,
        metadata: {
          ...pendingImage.metadata,
          width,
          height,
          cost: 0,
          format: 'jpeg',
          fileSize: Math.floor(Math.random() * 500000) + 100000,
          note: 'Mock mode: Returning original image. Real AI would transform based on prompt.'
        }
      };
    }

    // No input image, generate random
    const seed = this.generateSeedFromPrompt(request.prompt.optimizedPrompt);
    const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    return {
      ...pendingImage,
      url: imageUrl,
      thumbnailUrl: `https://picsum.photos/seed/${seed}/400/300`,
      metadata: {
        ...pendingImage.metadata,
        width,
        height,
        cost: 0,
        format: 'jpeg',
        fileSize: Math.floor(Math.random() * 500000) + 100000,
        note: 'Mock mode: Random image generated. No input image provided.'
      }
    };
  }

  private async refineWithMock(pendingImage: GeneratedImage, baseImage: GeneratedImage, request: ImageRefinementRequest): Promise<GeneratedImage> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const baseSeed = this.generateSeedFromPrompt(baseImage.promptId);
    const refinementSeed = this.generateSeedFromPrompt(request.refinementType);
    const combinedSeed = `${baseSeed}${refinementSeed}`.substring(0, 8);
    
    const imageUrl = `https://picsum.photos/seed/${combinedSeed}/${baseImage.metadata.width}/${baseImage.metadata.height}`;

    return {
      ...pendingImage,
      url: imageUrl,
      thumbnailUrl: `https://picsum.photos/seed/${combinedSeed}/400/300`,
      metadata: {
        ...baseImage.metadata,
        cost: 0
      }
    };
  }

  // Provider implementations (for future use)
  private async generateWithOpenAI(pendingImage: GeneratedImage, request: ImageGenerationRequest): Promise<GeneratedImage> {
    const config = this.providers.get('openai_dalle')!;
    
    if (!config.apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    // Implementation would go here - for now return mock
    return this.generateWithMock(pendingImage, request);
  }

  private async generateWithStabilityAI(pendingImage: GeneratedImage, request: ImageGenerationRequest): Promise<GeneratedImage> {
    const config = this.providers.get('stability_ai')!;
    
    if (!config.apiKey) {
      throw new Error('Stability AI API key not configured. Please set STABILITY_API_KEY environment variable.');
    }

    // Implementation would go here - for now return mock
    return this.generateWithMock(pendingImage, request);
  }

  private async refineWithStabilityAI(pendingImage: GeneratedImage, baseImage: GeneratedImage, request: ImageRefinementRequest): Promise<GeneratedImage> {
    return this.generateWithStabilityAI(pendingImage, {
      prompt: request.refinedPrompt,
      provider: 'stability_ai',
      parameters: baseImage.parameters
    });
  }

  // Utility functions
  private generateSeedFromPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString().substring(0, 8);
  }

  private normalizeParameters(params: ImageGenerationParameters, provider: ImageProvider): ImageGenerationParameters {
    const config = this.providers.get(provider)!;
    
    return {
      width: Math.min(params.width || 1024, config.maxResolution.width),
      height: Math.min(params.height || 1024, config.maxResolution.height),
      quality: params.quality || 'standard',
      steps: Math.min(Math.max(params.steps || 20, 1), 50),
      guidance: Math.min(Math.max(params.guidance || 7, 1), 20),
      ...params
    };
  }

  private getOptimalSize(params: ImageGenerationParameters | undefined, config: ImageProviderConfig): { width: number; height: number } {
    const requestedWidth = params?.width || 1024;
    const requestedHeight = params?.height || 1024;

    const width = Math.min(requestedWidth, config.maxResolution.width);
    const height = Math.min(requestedHeight, config.maxResolution.height);

    if (config.name.includes('Stability')) {
      return {
        width: Math.floor(width / 64) * 64,
        height: Math.floor(height / 64) * 64
      };
    }

    return { width, height };
  }

  // Public utility methods
  public getImage(imageId: string): GeneratedImage | undefined {
    return this.generatedImages.get(imageId);
  }

  public getImagesByPrompt(promptId: string): GeneratedImage[] {
    return Array.from(this.generatedImages.values()).filter(img => img.promptId === promptId);
  }

  public getSupportedProviders(): ImageProvider[] {
    return Array.from(this.providers.keys());
  }

  public getDefaultProvider(): ImageProvider {
    return this.defaultProvider;
  }

  public isProviderAvailable(provider: ImageProvider): boolean {
    const config = this.providers.get(provider);
    if (!config) return false;
    if (provider === 'mock') return true;
    return !!config.apiKey;
  }

  public getAvailableProviders(): ImageProvider[] {
    return this.getSupportedProviders().filter(provider => this.isProviderAvailable(provider));
  }

  public clearImageHistory(): void {
    this.generatedImages.clear();
  }

  public async generateImageVariations(prompt: OptimizedPrompt, count: number = 3): Promise<GeneratedImage[]> {
    const variations: Promise<GeneratedImage>[] = [];
    const availableProviders = this.getAvailableProviders();
    const provider = availableProviders.length > 0 ? availableProviders[0] : this.defaultProvider;

    for (let i = 0; i < count; i++) {
      variations.push(
        this.generateImage({
          prompt,
          provider,
          parameters: {
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      );
    }

    return Promise.all(variations);
  }
}

export const imageGenerationService = new ImageGenerationService();
export default imageGenerationService;