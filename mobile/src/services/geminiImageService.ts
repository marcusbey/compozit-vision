/**
 * Gemini Image Generation Service
 * Service for generating interior design images using Gemini 2.5 Flash
 */

import { GEMINI_API_KEY } from '@env';

export interface ImageGenerationRequest {
  prompt: string;
  style: string;
  category: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  prompt: string;
  style: string;
  category: string;
  timestamp: Date;
}

class GeminiImageService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Generate an interior design image using Gemini
   */
  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const { prompt, style, category, dimensions } = request;
    
    // Enhance prompt with quality modifiers
    const enhancedPrompt = `${prompt}. Professional architectural photography, photorealistic, high resolution, magazine quality, award-winning design, 8K quality`;

    try {
      // Note: The actual Gemini image generation endpoint may differ
      // This is a placeholder for when the API is available
      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a photorealistic interior design image: ${enhancedPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract image URL or base64 from response
      // The actual response structure may vary
      const imageUrl = data.candidates?.[0]?.content?.parts?.[0]?.imageUrl || '';
      const imageBase64 = data.candidates?.[0]?.content?.parts?.[0]?.imageBase64 || '';

      return {
        url: imageUrl,
        base64: imageBase64,
        prompt: enhancedPrompt,
        style,
        category,
        timestamp: new Date(),
      };
      
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Generate multiple images in batch
   */
  async generateBatch(requests: ImageGenerationRequest[]): Promise<GeneratedImage[]> {
    const results: GeneratedImage[] = [];
    
    // Process in smaller batches to avoid rate limits
    const batchSize = 3;
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      const batchPromises = batch.map(request => 
        this.generateImage(request).catch(error => {
          console.error(`Failed to generate ${request.category}-${request.style}:`, error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as GeneratedImage[]);
      
      // Rate limit delay between batches
      if (i + batchSize < requests.length) {
        await this.delay(2000); // 2 second delay
      }
    }
    
    return results;
  }

  /**
   * Generate all style images for the masonry gallery
   */
  async generateMasonryGalleryImages() {
    const imageRequests: ImageGenerationRequest[] = [
      // Interior styles
      {
        prompt: 'Modern interior living room with minimalist furniture, clean lines, neutral colors',
        style: 'modern',
        category: 'interior'
      },
      {
        prompt: 'Scandinavian living room with white walls, light wood, cozy textiles, hygge atmosphere',
        style: 'scandinavian', 
        category: 'interior'
      },
      {
        prompt: 'Industrial loft with exposed brick, metal beams, concrete floors, vintage furniture',
        style: 'industrial',
        category: 'interior'
      },
      {
        prompt: 'Bohemian bedroom with layered textiles, plants, warm colors, eclectic decor',
        style: 'bohemian',
        category: 'interior'
      },
      {
        prompt: 'Minimalist bedroom with white walls, simple furniture, maximum negative space',
        style: 'minimalist',
        category: 'interior'
      },
      
      // Exterior styles
      {
        prompt: 'Modern house exterior with flat roof, glass walls, minimalist landscaping',
        style: 'modern',
        category: 'exterior'
      },
      {
        prompt: 'Mediterranean villa with stucco walls, terracotta roof, arched windows',
        style: 'mediterranean',
        category: 'exterior'
      },
      
      // Garden styles
      {
        prompt: 'Japanese zen garden with raked gravel, stones, bamboo, koi pond',
        style: 'japanese',
        category: 'garden'
      },
      {
        prompt: 'Modern minimalist garden with geometric planters, structured hedges',
        style: 'modern',
        category: 'garden'
      },
      
      // Add more as needed...
    ];

    console.log(`Starting batch generation of ${imageRequests.length} images...`);
    
    const generatedImages = await this.generateBatch(imageRequests);
    
    console.log(`Successfully generated ${generatedImages.length} images`);
    
    return generatedImages;
  }

  /**
   * Save generated image to device
   */
  async saveImageToDevice(image: GeneratedImage, filename: string): Promise<string> {
    // Implementation depends on platform (React Native vs Web)
    // For React Native, use react-native-fs
    // For web, use browser download API
    
    // Placeholder implementation
    console.log(`Saving image: ${filename}`);
    return `/path/to/saved/${filename}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const geminiImageService = new GeminiImageService();

// Export types and main functions
export const generateDesignImage = (request: ImageGenerationRequest) => 
  geminiImageService.generateImage(request);

export const generateMasonryImages = () =>
  geminiImageService.generateMasonryGalleryImages();