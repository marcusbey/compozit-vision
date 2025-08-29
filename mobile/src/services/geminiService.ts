/**
 * Google Gemini API Service
 * Handles AI-powered interior design processing using Google Gemini 2.5 Flash
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for Gemini API integration
export interface RoomAnalysisInput {
  imageData: string; // Base64 encoded image
  roomDimensions?: {
    width: number;
    height: number;
    length: number;
    roomType: string;
    lightingSources: string[];
  };
  stylePreferences?: {
    primaryStyle: string;
    colors: string[];
    budget: string;
    preferredMaterials: string[];
  };
  customPrompt?: string;
}

export interface DesignRecommendation {
  roomLayout: {
    suggestions: string[];
    optimizationTips: string[];
  };
  furniture: {
    item: string;
    dimensions: string;
    placement: string;
    reasoning: string;
    estimatedCost?: string;
  }[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    description: string;
  };
  lighting: {
    recommendations: string[];
    fixtures: string[];
  };
  decorativeElements: string[];
  overallDesignConcept: string;
  confidenceScore: number;
}

export interface GeminiResponse {
  success: boolean;
  data?: DesignRecommendation;
  error?: string;
  processingTime?: number;
}

class GeminiService {
  private client: GoogleGenerativeAI;
  private model: any;
  private apiKey: string;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_MS = 1000; // 1 second between requests
  private readonly MAX_RETRIES = 3;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Analyze room and generate interior design recommendations
   */
  async analyzeRoom(input: RoomAnalysisInput): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      await this.enforceRateLimit();
      
      // Validate input
      this.validateInput(input);
      
      // Build the comprehensive prompt
      const prompt = this.buildInteriorDesignPrompt(input);
      
      // Prepare image data
      const imageData = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: input.imageData.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      };

      // Generate design recommendations with retries
      const result = await this.executeWithRetries(async () => {
        return await this.model.generateContent([prompt, imageData]);
      });

      // Parse and validate response
      const designRecommendation = this.parseDesignResponse(result.response.text());
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: designRecommendation,
        processingTime
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      return {
        success: false,
        error: this.handleError(error),
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate room transformation visualization
   */
  async generateVisualization(
    beforeImage: string,
    designRecommendation: DesignRecommendation,
    customInstructions?: string
  ): Promise<GeminiResponse> {
    try {
      await this.enforceRateLimit();

      const prompt = this.buildVisualizationPrompt(designRecommendation, customInstructions);
      
      const imageData = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: beforeImage.replace(/^data:image\/[a-z]+;base64,/, '')
        }
      };

      const result = await this.executeWithRetries(async () => {
        return await this.model.generateContent([prompt, imageData]);
      });

      // For visualization, we return the text description
      // In production, this would integrate with image generation models
      return {
        success: true,
        data: {
          visualizationDescription: result.response.text(),
          renderingInstructions: this.extractRenderingInstructions(result.response.text())
        } as any
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      };
    }
  }

  /**
   * Build comprehensive interior design prompt
   */
  private buildInteriorDesignPrompt(input: RoomAnalysisInput): string {
    const { roomDimensions, stylePreferences, customPrompt } = input;

    let prompt = `
    As a professional interior designer with 20+ years of experience, analyze this room photo and provide comprehensive design recommendations.

    ANALYSIS REQUIREMENTS:
    1. Identify room type, layout, and existing architectural features
    2. Assess natural light sources and quality
    3. Evaluate spatial flow and traffic patterns
    4. Consider existing furniture and fixtures
    5. Analyze color temperature and overall ambiance
    `;

    if (roomDimensions) {
      prompt += `
      ROOM SPECIFICATIONS:
      - Dimensions: ${roomDimensions.width}m × ${roomDimensions.length}m × ${roomDimensions.height}m
      - Room Type: ${roomDimensions.roomType}
      - Natural Light Sources: ${roomDimensions.lightingSources.join(', ')}
      `;
    }

    if (stylePreferences) {
      prompt += `
      STYLE PREFERENCES:
      - Primary Style: ${stylePreferences.primaryStyle}
      - Preferred Colors: ${stylePreferences.colors.join(', ')}
      - Budget Range: ${stylePreferences.budget}
      - Material Preferences: ${stylePreferences.preferredMaterials.join(', ')}
      `;
    }

    if (customPrompt) {
      prompt += `
      CUSTOM REQUIREMENTS:
      ${customPrompt}
      `;
    }

    prompt += `
    PROVIDE DETAILED RECOMMENDATIONS FOR:
    
    1. ROOM LAYOUT OPTIMIZATION:
       - Suggest furniture arrangement for optimal flow
       - Identify areas for improvement
       - Traffic pattern optimization
    
    2. FURNITURE RECOMMENDATIONS:
       - Specific furniture pieces with exact dimensions
       - Placement locations with reasoning
       - Multi-functional options where appropriate
       - Estimated cost ranges for each item
    
    3. COLOR SCHEME:
       - Primary, secondary, and accent colors
       - Paint recommendations for walls
       - Coordination with existing elements
    
    4. LIGHTING DESIGN:
       - Natural light optimization strategies
       - Artificial lighting recommendations
       - Fixture types and placement
    
    5. DECORATIVE ELEMENTS:
       - Wall art and decor suggestions
       - Plants and natural elements
       - Textiles and soft furnishings
    
    6. OVERALL DESIGN CONCEPT:
       - Central design theme
       - How elements work together
       - Long-term flexibility and adaptability

    FORMAT RESPONSE AS STRUCTURED JSON:
    {
      "roomLayout": {
        "suggestions": [],
        "optimizationTips": []
      },
      "furniture": [
        {
          "item": "specific furniture piece",
          "dimensions": "W x D x H in cm",
          "placement": "specific location and orientation",
          "reasoning": "why this piece works",
          "estimatedCost": "price range"
        }
      ],
      "colorScheme": {
        "primary": "color name and hex",
        "secondary": "color name and hex", 
        "accent": "color name and hex",
        "description": "how colors work together"
      },
      "lighting": {
        "recommendations": [],
        "fixtures": []
      },
      "decorativeElements": [],
      "overallDesignConcept": "comprehensive design philosophy",
      "confidenceScore": 0.0 to 1.0
    }

    IMPORTANT: Ensure all recommendations are practical, achievable, and considerate of the existing space constraints.
    `;

    return prompt;
  }

  /**
   * Build visualization generation prompt
   */
  private buildVisualizationPrompt(
    designRecommendation: DesignRecommendation,
    customInstructions?: string
  ): string {
    return `
    Generate a detailed description for transforming this room based on the following design recommendations:

    FURNITURE LAYOUT:
    ${designRecommendation.furniture.map(f => `- ${f.item}: ${f.placement}`).join('\n')}

    COLOR SCHEME:
    - Primary: ${designRecommendation.colorScheme.primary}
    - Secondary: ${designRecommendation.colorScheme.secondary}
    - Accent: ${designRecommendation.colorScheme.accent}

    LIGHTING: ${designRecommendation.lighting.recommendations.join(', ')}

    DECORATIVE ELEMENTS: ${designRecommendation.decorativeElements.join(', ')}

    ${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ''}

    Provide a detailed description of how this room would look after transformation, focusing on:
    1. Visual impact and atmosphere
    2. Spatial relationships between furniture
    3. Color harmony and material textures
    4. Lighting effects and ambiance
    5. Overall aesthetic coherence

    Include specific details that would help with 3D rendering or visualization.
    `;
  }

  /**
   * Parse AI response into structured design recommendation
   */
  private parseDesignResponse(responseText: string): DesignRecommendation {
    try {
      // Extract JSON from response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const required = ['roomLayout', 'furniture', 'colorScheme', 'lighting'];
      for (const field of required) {
        if (!parsedResponse[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Ensure confidence score
      if (!parsedResponse.confidenceScore) {
        parsedResponse.confidenceScore = 0.8; // Default confidence
      }

      return parsedResponse as DesignRecommendation;

    } catch (error) {
      console.error('Failed to parse design response:', error);
      
      // Return fallback response
      return this.getFallbackResponse(responseText);
    }
  }

  /**
   * Extract rendering instructions from visualization response
   */
  private extractRenderingInstructions(text: string): any {
    // Extract key visual elements for 3D rendering
    const instructions = {
      furniturePlacement: [],
      colorMapping: {},
      lightingSources: [],
      materialTextures: [],
      decorativeElements: []
    };

    // Simple extraction logic - in production would use more sophisticated NLP
    if (text.includes('furniture')) {
      // Extract furniture placement instructions
    }
    
    if (text.includes('lighting')) {
      // Extract lighting setup
    }

    return instructions;
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: RoomAnalysisInput): void {
    if (!input.imageData) {
      throw new Error('Image data is required');
    }

    if (input.imageData.length < 100) {
      throw new Error('Invalid image data format');
    }

    // Validate room dimensions if provided
    if (input.roomDimensions) {
      const { width, height, length } = input.roomDimensions;
      if (width <= 0 || height <= 0 || length <= 0) {
        throw new Error('Invalid room dimensions');
      }
    }
  }

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      const delay = this.RATE_LIMIT_MS - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Execute API call with retry logic
   */
  private async executeWithRetries<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message?.includes('API key') || error.message?.includes('quota')) {
          throw error;
        }
        
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Handle and categorize errors
   */
  private handleError(error: any): string {
    if (error.message?.includes('API key')) {
      return 'Invalid API key. Please check your Gemini API configuration.';
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return 'API rate limit exceeded. Please try again in a few minutes.';
    }
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    
    if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      return 'Failed to process AI response. Please try again.';
    }
    
    return error.message || 'An unexpected error occurred during AI processing.';
  }

  /**
   * Provide fallback response when parsing fails
   */
  private getFallbackResponse(originalText: string): DesignRecommendation {
    return {
      roomLayout: {
        suggestions: ['Unable to generate specific layout suggestions'],
        optimizationTips: ['Please try again with a clearer room photo']
      },
      furniture: [{
        item: 'General furniture recommendation',
        dimensions: 'Standard dimensions',
        placement: 'Optimal placement based on room layout',
        reasoning: 'AI analysis partially completed',
        estimatedCost: 'Contact designer for estimate'
      }],
      colorScheme: {
        primary: 'Neutral tones recommended',
        secondary: 'Complementary accents',
        accent: 'Bold accent colors',
        description: 'Color recommendations based on room analysis'
      },
      lighting: {
        recommendations: ['Improve natural light where possible'],
        fixtures: ['Consider layered lighting approach']
      },
      decorativeElements: ['Custom recommendations available with retry'],
      overallDesignConcept: originalText.substring(0, 500) + '...',
      confidenceScore: 0.5
    };
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      rateLimitStatus: Date.now() - this.lastRequestTime > this.RATE_LIMIT_MS
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

/**
 * Get or create Gemini service instance
 */
export const getGeminiService = (apiKey?: string): GeminiService => {
  if (!geminiService) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
    }
    geminiService = new GeminiService(key);
  }
  return geminiService;
};

/**
 * Convenience function for room analysis
 */
export const analyzeRoomWithGemini = async (
  imageData: string,
  options?: Partial<RoomAnalysisInput>
): Promise<GeminiResponse> => {
  const service = getGeminiService();
  return await service.analyzeRoom({
    imageData,
    ...options
  });
};

export default GeminiService;