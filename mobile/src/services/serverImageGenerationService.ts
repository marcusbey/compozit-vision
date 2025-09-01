/**
 * Server-Side Image Generation Service
 * Calls your backend API which handles the actual AI image generation
 * Keeps API keys secure on the server
 */

export interface ServerImageGenerationRequest {
  prompt: string;
  originalImageUrl?: string;
  style: string;
  qualityLevel: 'draft' | 'standard' | 'premium';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  userId?: string;
}

export interface ServerImageGenerationResult {
  imageUrl: string;
  prompt: string;
  generationTime: number;
  provider: string;
  jobId: string;
  success: boolean;
  error?: string;
}

export class ServerImageGenerationService {
  private static instance: ServerImageGenerationService;
  private baseUrl: string;

  private constructor() {
    // Your backend API base URL
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-backend.com/api';
  }

  public static getInstance(): ServerImageGenerationService {
    if (!ServerImageGenerationService.instance) {
      ServerImageGenerationService.instance = new ServerImageGenerationService();
    }
    return ServerImageGenerationService.instance;
  }

  /**
   * Generate image via your backend API (secure)
   */
  async generateImage(request: ServerImageGenerationRequest): Promise<ServerImageGenerationResult> {
    console.log('🖼️ Requesting image generation from backend...');
    
    try {
      const response = await fetch(`${this.baseUrl}/generate-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your app's authentication headers here
          'Authorization': `Bearer ${await this.getUserToken()}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          originalImageUrl: request.originalImageUrl,
          style: request.style,
          qualityLevel: request.qualityLevel,
          aspectRatio: request.aspectRatio || '16:9',
          userId: request.userId
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ Image generated via backend: ${result.provider}`);
      
      return {
        imageUrl: result.imageUrl,
        prompt: request.prompt,
        generationTime: result.generationTime,
        provider: result.provider,
        jobId: result.jobId,
        success: true
      };

    } catch (error) {
      console.error('❌ Backend image generation failed:', error);
      
      return {
        imageUrl: '',
        prompt: request.prompt,
        generationTime: 0,
        provider: 'backend',
        jobId: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user authentication token
   */
  private async getUserToken(): Promise<string> {
    // Implement your user authentication logic here
    // Return JWT token, session token, etc.
    return 'user-auth-token';
  }

  /**
   * Check generation status (for async processing)
   */
  async checkGenerationStatus(jobId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    imageUrl?: string;
    error?: string;
    progress?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/generation-status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${await this.getUserToken()}`,
        }
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  }
}

// Export singleton
export const serverImageGenerationService = ServerImageGenerationService.getInstance();