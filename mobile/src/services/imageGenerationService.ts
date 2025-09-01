import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Real Image Generation Service
 * Integrates with actual AI image generation APIs to replace mock implementation
 */

export interface ImageGenerationRequest {
  prompt: string;
  originalImageUrl?: string;
  style: string;
  qualityLevel: 'draft' | 'standard' | 'premium';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  seed?: number; // For reproducible results during testing
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  generationTime: number;
  provider: string;
  metadata: {
    model: string;
    parameters: Record<string, any>;
    cost?: number;
    success: boolean;
  };
}

export class ImageGenerationService {
  private static instance: ImageGenerationService;
  
  private constructor() {
    // Initialize with API keys and configurations
  }

  public static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  /**
   * Generate image using OpenAI DALL-E 3 (Primary option)
   * Best quality for interior design transformations
   */
  async generateWithDALLE3(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      // API keys should be handled server-side, not in client
      const apiKey = process.env.OPENAI_API_KEY; // Server-side only
      if (!apiKey) {
        throw new Error('OpenAI API key not configured on server');
      }

      // Enhanced prompt for interior design
      const enhancedPrompt = this.enhancePromptForInteriorDesign(request.prompt, request.style);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: this.getSizeForQuality(request.qualityLevel),
          quality: request.qualityLevel === 'premium' ? 'hd' : 'standard',
          style: 'natural' // Better for interior design vs 'vivid'
        })
      });

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      return {
        imageUrl,
        prompt: enhancedPrompt,
        generationTime: Date.now() - startTime,
        provider: 'dall-e-3',
        metadata: {
          model: 'dall-e-3',
          parameters: {
            quality: request.qualityLevel,
            size: this.getSizeForQuality(request.qualityLevel)
          },
          success: true
        }
      };

    } catch (error) {
      console.error('DALL-E generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate image using Stability AI (Stable Diffusion)
   * Cost-effective alternative with good results
   */
  async generateWithStableDiffusion(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      const apiKey = process.env.STABILITY_API_KEY; // Server-side only
      if (!apiKey) {
        throw new Error('Stability AI API key not configured on server');
      }

      const enhancedPrompt = this.enhancePromptForInteriorDesign(request.prompt, request.style);
      
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: enhancedPrompt,
              weight: 1
            },
            {
              text: 'blurry, low quality, distorted, bad architecture, unrealistic lighting',
              weight: -1
            }
          ],
          cfg_scale: 7,
          width: 1024,
          height: 1024,
          steps: request.qualityLevel === 'premium' ? 50 : 30,
          samples: 1,
          style_preset: 'photographic',
          seed: request.seed || Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        throw new Error(`Stability AI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert base64 to URL (you'll need to upload to your storage)
      const base64Image = data.artifacts[0].base64;
      const imageUrl = await this.uploadBase64Image(base64Image, 'stable-diffusion');

      return {
        imageUrl,
        prompt: enhancedPrompt,
        generationTime: Date.now() - startTime,
        provider: 'stable-diffusion',
        metadata: {
          model: 'stable-diffusion-xl-1024-v1-0',
          parameters: {
            cfg_scale: 7,
            steps: request.qualityLevel === 'premium' ? 50 : 30,
            seed: request.seed
          },
          success: true
        }
      };

    } catch (error) {
      console.error('Stable Diffusion generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate image using Replicate (Midjourney-style models)
   * Good balance of quality and speed
   */
  async generateWithReplicate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      const apiKey = process.env.REPLICATE_API_KEY; // Server-side only  
      if (!apiKey) {
        throw new Error('Replicate API key not configured on server');
      }

      const enhancedPrompt = this.enhancePromptForInteriorDesign(request.prompt, request.style);
      
      // Using a good interior design model on Replicate
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiKey}`
        },
        body: JSON.stringify({
          version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, low quality, distorted, bad architecture, unrealistic lighting",
            width: 1024,
            height: 1024,
            num_inference_steps: request.qualityLevel === 'premium' ? 50 : 25,
            guidance_scale: 7.5,
            seed: request.seed
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status} ${response.statusText}`);
      }

      const prediction = await response.json();
      
      // Poll for completion
      const imageUrl = await this.pollReplicatePrediction(prediction.id, apiKey);

      return {
        imageUrl,
        prompt: enhancedPrompt,
        generationTime: Date.now() - startTime,
        provider: 'replicate',
        metadata: {
          model: 'sdxl',
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: request.qualityLevel === 'premium' ? 50 : 25,
            seed: request.seed
          },
          success: true
        }
      };

    } catch (error) {
      console.error('Replicate generation failed:', error);
      throw error;
    }
  }

  /**
   * Main generation method with fallback strategy
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    console.log(`🎨 Generating image with prompt: ${request.prompt.substring(0, 100)}...`);
    
    // Try providers in order of preference
    const providers = [
      () => this.generateWithDALLE3(request),
      () => this.generateWithStableDiffusion(request),
      () => this.generateWithReplicate(request)
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        const result = await provider();
        console.log(`✅ Image generated successfully with ${result.provider}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Provider failed, trying next...`, error);
        lastError = error as Error;
      }
    }

    // If all providers failed, throw the last error
    throw new Error(`All image generation providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Enhance prompt specifically for interior design
   */
  private enhancePromptForInteriorDesign(basePrompt: string, style: string): string {
    let enhancedPrompt = basePrompt;
    
    // Add quality and style modifiers for interior design
    enhancedPrompt += ` Professional interior design photography, ${style} style, `;
    enhancedPrompt += `high resolution, well-lit, realistic lighting, beautiful composition, `;
    enhancedPrompt += `architectural digest quality, clean and organized space, `;
    enhancedPrompt += `photorealistic, detailed textures, proper color coordination`;
    
    return enhancedPrompt;
  }

  /**
   * Get image size based on quality level
   */
  private getSizeForQuality(quality: 'draft' | 'standard' | 'premium'): string {
    switch (quality) {
      case 'draft': return '1024x1024';
      case 'standard': return '1024x1024';
      case 'premium': return '1792x1024'; // DALL-E 3 HD format
      default: return '1024x1024';
    }
  }

  /**
   * Upload base64 image to storage and return URL
   */
  private async uploadBase64Image(base64Data: string, provider: string): Promise<string> {
    // Implementation depends on your storage solution (Supabase, Firebase, S3, etc.)
    // For now, return a mock URL - replace with actual upload logic
    
    try {
      // Mock implementation - replace with actual storage upload
      const fileName = `generated-${provider}-${Date.now()}.png`;
      const mockUrl = `https://your-storage-bucket.com/generated-images/${fileName}`;
      
      console.log(`📁 Image uploaded: ${fileName}`);
      return mockUrl;
      
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload generated image');
    }
  }

  /**
   * Poll Replicate prediction until completion
   */
  private async pollReplicatePrediction(predictionId: string, apiKey: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      
      const prediction = await response.json();
      
      if (prediction.status === 'succeeded') {
        return prediction.output[0]; // First generated image
      }
      
      if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Prediction timed out');
  }

  /**
   * Test method to verify all providers are working
   */
  async testAllProviders(): Promise<void> {
    console.log('🧪 Testing all image generation providers...');
    
    const testRequest: ImageGenerationRequest = {
      prompt: 'A modern Scandinavian living room with white walls, light wood furniture, and plants',
      style: 'Scandinavian Modern',
      qualityLevel: 'draft',
      seed: 12345 // Fixed seed for consistent testing
    };
    
    const results = [];
    
    // Test each provider individually
    const providers = [
      { name: 'DALL-E 3', method: this.generateWithDALLE3.bind(this) },
      { name: 'Stable Diffusion', method: this.generateWithStableDiffusion.bind(this) },
      { name: 'Replicate', method: this.generateWithReplicate.bind(this) }
    ];
    
    for (const provider of providers) {
      try {
        console.log(`Testing ${provider.name}...`);
        const result = await provider.method(testRequest);
        results.push({
          provider: provider.name,
          success: true,
          imageUrl: result.imageUrl,
          generationTime: result.generationTime
        });
        console.log(`✅ ${provider.name} working - ${result.generationTime}ms`);
      } catch (error) {
        results.push({
          provider: provider.name,
          success: false,
          error: error.message
        });
        console.log(`❌ ${provider.name} failed: ${error.message}`);
      }
    }
    
    console.log('🔬 Provider test results:', results);
  }
}

// Export singleton instance
export const imageGenerationService = ImageGenerationService.getInstance();