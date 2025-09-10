// Secure Gemini Service - Uses backend API instead of exposing API key
// This replaces direct Gemini API calls with secure backend proxying

// Types (same as original)
export interface ImageAnalysisResult {
  style_tags: string[];
  mood_tags: string[];
  detected_objects: string[];
  space_type: string[];
  color_analysis: {
    dominant_colors: string[];
    color_temperature: 'warm' | 'cool' | 'neutral';
    brightness: 'dark' | 'medium' | 'light';
  };
  design_suggestions: string[];
  confidence_score: number;
  description: string;
}

export interface StyleAnalysis {
  detected_styles: Array<{
    style: string;
    confidence: number;
    reasoning: string;
  }>;
  primary_style: string;
  secondary_styles: string[];
  style_compatibility: string[];
}

export interface MoodAnalysis {
  detected_moods: string[];
  atmosphere: 'cozy' | 'elegant' | 'modern' | 'rustic' | 'minimalist' | 'bold' | 'serene';
  energy_level: 'calm' | 'moderate' | 'energetic';
  sophistication: 'casual' | 'refined' | 'luxury';
}

export interface ObjectDetection {
  furniture: Array<{
    type: string;
    confidence: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    style_hint: string;
  }>;
  architectural_features: string[];
  decorative_elements: string[];
  lighting_sources: string[];
}

export interface GeminiVisionOptions {
  maxTokens?: number;
  temperature?: number;
  includeSuggestions?: boolean;
  focusArea?: 'comprehensive' | 'style' | 'mood' | 'objects' | 'colors';
}

export class SecureGeminiService {
  private static instance: SecureGeminiService;
  private apiBaseUrl: string;

  private constructor() {
    // Use backend API URL from environment
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  }

  public static getInstance(): SecureGeminiService {
    if (!SecureGeminiService.instance) {
      SecureGeminiService.instance = new SecureGeminiService();
    }
    return SecureGeminiService.instance;
  }

  /**
   * Convert image URI to base64 for backend API
   */
  private async imageUriToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Make secure API call to backend
   */
  private async callBackendAPI(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Backend API error');
      }

      return result;
    } catch (error) {
      console.error('Backend API call failed:', error);
      throw error;
    }
  }

  /**
   * Analyze context from user input using backend API
   */
  async analyzeContext(userInput: string): Promise<{ context: string; confidence: number }> {
    try {
      const result = await this.callBackendAPI('/gemini/analyze-context', {
        userInput
      });

      return {
        context: result.data.context || 'unknown',
        confidence: result.data.confidence || 0.5
      };
    } catch (error) {
      console.error('Context analysis failed:', error);
      // Fallback to basic keyword analysis
      return this.fallbackContextAnalysis(userInput);
    }
  }

  /**
   * Optimize prompt using backend API
   */
  async optimizePrompt(params: {
    userInput: string;
    context: string;
    selectedFeatures?: string[];
    additionalPreferences?: any;
  }): Promise<any> {
    try {
      const result = await this.callBackendAPI('/gemini/optimize-prompt', params);
      return result.data;
    } catch (error) {
      console.error('Prompt optimization failed:', error);
      // Return original input as fallback
      return { optimizedPrompt: params.userInput };
    }
  }

  /**
   * Refine prompt using backend API
   */
  async refinePrompt(params: {
    basePrompt: string;
    refinements: any;
    iterationType: string;
  }): Promise<any> {
    try {
      const result = await this.callBackendAPI('/gemini/refine-prompt', params);
      return result.data;
    } catch (error) {
      console.error('Prompt refinement failed:', error);
      // Return original prompt as fallback
      return { refinedPrompt: params.basePrompt };
    }
  }

  /**
   * Comprehensive image analysis (TODO: Add backend endpoint)
   * For now, returns mock data - implement backend endpoint when needed
   */
  async analyzeImage(
    imageUri: string, 
    options: GeminiVisionOptions = {}
  ): Promise<ImageAnalysisResult> {
    console.warn('Image analysis endpoint not yet implemented in backend');
    
    // TODO: Implement backend endpoint for image analysis
    // const base64Image = await this.imageUriToBase64(imageUri);
    // const result = await this.callBackendAPI('/gemini/analyze-image', {
    //   image: base64Image,
    //   options
    // });
    
    // Return fallback analysis for now
    return this.getFallbackAnalysis();
  }

  /**
   * Fallback context analysis using keywords
   */
  private fallbackContextAnalysis(userInput: string): { context: string; confidence: number } {
    const input = userInput.toLowerCase();
    
    if (input.includes('room') || input.includes('furniture') || input.includes('interior')) {
      return { context: 'interior', confidence: 0.7 };
    } else if (input.includes('garden') || input.includes('plant') || input.includes('outdoor')) {
      return { context: 'garden', confidence: 0.7 };
    } else if (input.includes('facade') || input.includes('building') || input.includes('exterior')) {
      return { context: 'exterior', confidence: 0.7 };
    }
    
    return { context: 'unknown', confidence: 0.3 };
  }

  /**
   * Get fallback analysis when API is unavailable
   */
  private getFallbackAnalysis(): ImageAnalysisResult {
    return {
      style_tags: ['modern', 'minimalist'],
      mood_tags: ['clean', 'bright', 'welcoming'],
      detected_objects: ['furniture', 'decor'],
      space_type: ['residential'],
      color_analysis: {
        dominant_colors: ['neutral', 'white', 'beige'],
        color_temperature: 'neutral',
        brightness: 'light'
      },
      design_suggestions: [
        'Consider adding accent colors',
        'Enhance lighting for ambiance',
        'Add textural elements for warmth'
      ],
      confidence_score: 0.5,
      description: 'Unable to perform detailed analysis. Using default suggestions.'
    };
  }
}

// Export singleton instance getter for backward compatibility
export const getSecureGeminiService = () => SecureGeminiService.getInstance();