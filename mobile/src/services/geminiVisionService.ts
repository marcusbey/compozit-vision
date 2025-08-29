import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
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
  focusArea?: 'style' | 'mood' | 'objects' | 'comprehensive';
}

/**
 * Service for analyzing images using Google Gemini Vision API
 */
export class GeminiVisionService {
  private static instance: GeminiVisionService;
  private genAI: GoogleGenerativeAI;
  private model: any;

  private constructor() {
    // Initialize with API key from environment
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('Gemini API key not found. Vision analysis will be limited.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision-latest' });
  }

  public static getInstance(): GeminiVisionService {
    if (!GeminiVisionService.instance) {
      GeminiVisionService.instance = new GeminiVisionService();
    }
    return GeminiVisionService.instance;
  }

  /**
   * Convert image URI to base64 for Gemini API
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
   * Comprehensive image analysis using Gemini Vision
   */
  async analyzeImage(
    imageUri: string, 
    options: GeminiVisionOptions = {}
  ): Promise<ImageAnalysisResult> {
    try {
      const {
        maxTokens = 1500,
        temperature = 0.3,
        includeSuggestions = true,
        focusArea = 'comprehensive'
      } = options;

      // Convert image to base64
      const base64Image = await this.imageUriToBase64(imageUri);

      // Create comprehensive analysis prompt
      const analysisPrompt = this.createAnalysisPrompt(focusArea, includeSuggestions);

      // Prepare image data for Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      // Generate content with Gemini Vision
      const result = await this.model.generateContent([
        analysisPrompt,
        imagePart
      ]);

      const response = await result.response;
      const analysisText = response.text();

      // Parse the structured response
      return this.parseAnalysisResponse(analysisText);

    } catch (error) {
      console.error('Gemini Vision analysis failed:', error);
      
      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Analyze image specifically for interior design styles
   */
  async analyzeInteriorStyle(imageUri: string): Promise<StyleAnalysis> {
    try {
      const base64Image = await this.imageUriToBase64(imageUri);

      const stylePrompt = `
        Analyze this interior space image and identify the design style(s). 
        Respond in JSON format with:
        {
          "detected_styles": [
            {
              "style": "style_name",
              "confidence": 0.85,
              "reasoning": "explanation of why this style was detected"
            }
          ],
          "primary_style": "most_dominant_style",
          "secondary_styles": ["style1", "style2"],
          "style_compatibility": ["compatible_style1", "compatible_style2"]
        }

        Consider these interior design styles:
        Modern, Contemporary, Traditional, Transitional, Minimalist, 
        Scandinavian, Industrial, Mid-Century Modern, Bohemian, Rustic, 
        Farmhouse, Art Deco, Mediterranean, Coastal, Eclectic
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([stylePrompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();

      return JSON.parse(this.extractJsonFromResponse(analysisText));

    } catch (error) {
      console.error('Style analysis failed:', error);
      return this.getFallbackStyleAnalysis();
    }
  }

  /**
   * Analyze image for mood and atmosphere
   */
  async analyzeMood(imageUri: string): Promise<MoodAnalysis> {
    try {
      const base64Image = await this.imageUriToBase64(imageUri);

      const moodPrompt = `
        Analyze the mood and atmosphere of this interior space.
        Respond in JSON format with:
        {
          "detected_moods": ["cozy", "elegant", "modern"],
          "atmosphere": "cozy",
          "energy_level": "calm",
          "sophistication": "refined"
        }

        Consider lighting, colors, textures, furniture arrangement, and overall feeling.
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([moodPrompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();

      return JSON.parse(this.extractJsonFromResponse(analysisText));

    } catch (error) {
      console.error('Mood analysis failed:', error);
      return this.getFallbackMoodAnalysis();
    }
  }

  /**
   * Detect and analyze objects in the image
   */
  async detectObjects(imageUri: string): Promise<ObjectDetection> {
    try {
      const base64Image = await this.imageUriToBase64(imageUri);

      const objectPrompt = `
        Identify and analyze all visible objects in this interior space.
        Respond in JSON format with:
        {
          "furniture": [
            {
              "type": "sofa",
              "confidence": 0.95,
              "condition": "good",
              "style_hint": "modern sectional"
            }
          ],
          "architectural_features": ["large windows", "exposed beams"],
          "decorative_elements": ["throw pillows", "artwork"],
          "lighting_sources": ["ceiling fixture", "table lamps"]
        }

        Be specific and accurate. Include furniture, decor, architectural elements, and lighting.
      `;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([objectPrompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();

      return JSON.parse(this.extractJsonFromResponse(analysisText));

    } catch (error) {
      console.error('Object detection failed:', error);
      return this.getFallbackObjectDetection();
    }
  }

  /**
   * Generate design recommendations based on image analysis
   */
  async generateDesignSuggestions(
    imageUri: string,
    userPreferences?: {
      styles?: string[];
      colors?: string[];
      budget?: 'low' | 'medium' | 'high';
      mood?: string;
    }
  ): Promise<string[]> {
    try {
      const base64Image = await this.imageUriToBase64(imageUri);

      let suggestionPrompt = `
        Based on this interior space image, provide 5-7 specific design improvement suggestions.
        Consider the current state and provide actionable recommendations.
        
        Format as a JSON array of strings:
        ["suggestion 1", "suggestion 2", ...]
      `;

      if (userPreferences) {
        suggestionPrompt += `
        
        User preferences:
        - Preferred styles: ${userPreferences.styles?.join(', ') || 'any'}
        - Preferred colors: ${userPreferences.colors?.join(', ') || 'any'}
        - Budget level: ${userPreferences.budget || 'medium'}
        - Desired mood: ${userPreferences.mood || 'comfortable'}
        `;
      }

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([suggestionPrompt, imagePart]);
      const response = await result.response;
      const analysisText = response.text();

      return JSON.parse(this.extractJsonFromResponse(analysisText));

    } catch (error) {
      console.error('Design suggestions failed:', error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * Create comprehensive analysis prompt based on focus area
   */
  private createAnalysisPrompt(
    focusArea: string, 
    includeSuggestions: boolean
  ): string {
    let basePrompt = `
      Analyze this interior space image comprehensively. 
      Respond in JSON format with:
      {
        "style_tags": ["modern", "minimalist"],
        "mood_tags": ["cozy", "elegant"],
        "detected_objects": ["sofa", "coffee_table", "artwork"],
        "space_type": ["living_room"],
        "color_analysis": {
          "dominant_colors": ["#F5F5F5", "#C9A98C"],
          "color_temperature": "warm",
          "brightness": "medium"
        },
        "confidence_score": 0.85,
        "description": "A modern living room with..."
      `;

    if (includeSuggestions) {
      basePrompt += `,
        "design_suggestions": ["suggestion1", "suggestion2"]`;
    }

    basePrompt += `
      }

      Focus particularly on: ${focusArea}
      
      Be accurate and specific in your analysis.
    `;

    return basePrompt;
  }

  /**
   * Parse the AI response and structure the data
   */
  private parseAnalysisResponse(responseText: string): ImageAnalysisResult {
    try {
      const jsonResponse = this.extractJsonFromResponse(responseText);
      return JSON.parse(jsonResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Extract JSON from AI response (handles cases where AI adds extra text)
   */
  private extractJsonFromResponse(text: string): string {
    // Find JSON object in response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON found, throw error
    throw new Error('No valid JSON found in AI response');
  }

  /**
   * Fallback analysis when AI fails
   */
  private getFallbackAnalysis(): ImageAnalysisResult {
    return {
      style_tags: ['contemporary'],
      mood_tags: ['comfortable'],
      detected_objects: ['room'],
      space_type: ['interior'],
      color_analysis: {
        dominant_colors: ['#FFFFFF', '#F5F5F5'],
        color_temperature: 'neutral',
        brightness: 'medium'
      },
      design_suggestions: ['Consider adding more lighting', 'Add some decorative elements'],
      confidence_score: 0.3,
      description: 'Analysis unavailable - using fallback data'
    };
  }

  /**
   * Fallback style analysis
   */
  private getFallbackStyleAnalysis(): StyleAnalysis {
    return {
      detected_styles: [
        {
          style: 'contemporary',
          confidence: 0.3,
          reasoning: 'Fallback analysis - unable to determine specific style'
        }
      ],
      primary_style: 'contemporary',
      secondary_styles: [],
      style_compatibility: ['modern', 'transitional']
    };
  }

  /**
   * Fallback mood analysis
   */
  private getFallbackMoodAnalysis(): MoodAnalysis {
    return {
      detected_moods: ['comfortable'],
      atmosphere: 'modern',
      energy_level: 'moderate',
      sophistication: 'casual'
    };
  }

  /**
   * Fallback object detection
   */
  private getFallbackObjectDetection(): ObjectDetection {
    return {
      furniture: [],
      architectural_features: [],
      decorative_elements: [],
      lighting_sources: []
    };
  }

  /**
   * Fallback design suggestions
   */
  private getFallbackSuggestions(): string[] {
    return [
      'Consider improving the lighting in the space',
      'Add some decorative elements for visual interest',
      'Ensure furniture is properly scaled for the room',
      'Add plants or greenery for a natural touch'
    ];
  }

  /**
   * Update reference image with AI analysis results
   */
  async updateReferenceWithAnalysis(
    referenceImage: any,
    analysisResult: ImageAnalysisResult
  ): Promise<any> {
    try {
      const updatedReference = {
        ...referenceImage,
        ai_description: analysisResult.description,
        style_tags: analysisResult.style_tags,
        mood_tags: analysisResult.mood_tags,
        detected_objects: analysisResult.detected_objects,
        processing_status: 'completed'
      };

      return updatedReference;

    } catch (error) {
      console.error('Failed to update reference with analysis:', error);
      throw error;
    }
  }

  /**
   * Batch analyze multiple images
   */
  async batchAnalyze(
    imageUris: string[],
    options: GeminiVisionOptions = {}
  ): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];
    
    for (const imageUri of imageUris) {
      try {
        const result = await this.analyzeImage(imageUri, options);
        results.push(result);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to analyze image ${imageUri}:`, error);
        results.push(this.getFallbackAnalysis());
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const geminiVisionService = GeminiVisionService.getInstance();