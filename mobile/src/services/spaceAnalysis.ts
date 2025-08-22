import { supabase } from './supabase';
import { 
  SpaceAnalysis, 
  EnhancedGenerationRequest,
  EnhancedGenerationResult,
  StyleReference,
  AmbianceOption,
  AnalysisStatus,
  GenerationStatus,
  RoomType
} from '../types/aiProcessing';

// Base configuration
const AI_SERVICE_BASE_URL = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://localhost:8080';

export class SpaceAnalysisService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${AI_SERVICE_BASE_URL}/api/v1`;
  }

  /**
   * Analyze a space from an uploaded image
   */
  async analyzeSpace(imageFile: File | Blob, projectId?: string): Promise<SpaceAnalysis> {
    try {
      // First upload the image to Supabase storage
      const imageUrl = await this.uploadImage(imageFile);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User authentication required');
      }

      // Create the analysis request
      const formData = new FormData();
      formData.append('image_url', imageUrl);
      formData.append('user_id', user.id);
      if (projectId) {
        formData.append('project_id', projectId);
      }

      const response = await fetch(`${this.apiUrl}/space/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as SpaceAnalysis;
    } catch (error) {
      console.error('Space analysis error:', error);
      throw error;
    }
  }

  /**
   * Get analysis status and results
   */
  async getAnalysis(analysisId: string): Promise<SpaceAnalysis> {
    try {
      const response = await fetch(`${this.apiUrl}/space/analysis/${analysisId}`, {
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get analysis: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as SpaceAnalysis;
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  }

  /**
   * Get user's analysis history
   */
  async getUserAnalyses(limit = 20, offset = 0): Promise<SpaceAnalysis[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/space/analyses?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': await this.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get analyses: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as SpaceAnalysis[];
    } catch (error) {
      console.error('Get user analyses error:', error);
      throw error;
    }
  }

  /**
   * Get available style references
   */
  async getStyleReferences(category?: string): Promise<StyleReference[]> {
    try {
      const queryParams = new URLSearchParams();
      if (category) {
        queryParams.append('category', category);
      }

      const response = await fetch(`${this.apiUrl}/styles/references?${queryParams}`, {
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get style references: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as StyleReference[];
    } catch (error) {
      console.error('Get style references error:', error);
      throw error;
    }
  }

  /**
   * Get a specific style reference
   */
  async getStyleReference(styleId: string): Promise<StyleReference> {
    try {
      const response = await fetch(`${this.apiUrl}/styles/references/${styleId}`, {
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get style reference: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as StyleReference;
    } catch (error) {
      console.error('Get style reference error:', error);
      throw error;
    }
  }

  /**
   * Get ambiance options for a style
   */
  async getAmbianceOptions(styleId?: string): Promise<AmbianceOption[]> {
    try {
      const queryParams = new URLSearchParams();
      if (styleId) {
        queryParams.append('style_id', styleId);
      }

      const response = await fetch(`${this.apiUrl}/styles/ambiance?${queryParams}`, {
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get ambiance options: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as AmbianceOption[];
    } catch (error) {
      console.error('Get ambiance options error:', error);
      throw error;
    }
  }

  /**
   * Generate enhanced design
   */
  async generateEnhancedDesign(request: EnhancedGenerationRequest): Promise<EnhancedGenerationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/generate/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await this.getAuthHeader(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as EnhancedGenerationResult;
    } catch (error) {
      console.error('Enhanced generation error:', error);
      throw error;
    }
  }

  /**
   * Get generation result
   */
  async getGenerationResult(resultId: string): Promise<EnhancedGenerationResult> {
    try {
      const response = await fetch(`${this.apiUrl}/generate/result/${resultId}`, {
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get generation result: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as EnhancedGenerationResult;
    } catch (error) {
      console.error('Get generation result error:', error);
      throw error;
    }
  }

  /**
   * Get user's generation history
   */
  async getUserGenerations(limit = 20, offset = 0): Promise<EnhancedGenerationResult[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/generate/results?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': await this.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get generations: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data as EnhancedGenerationResult[];
    } catch (error) {
      console.error('Get user generations error:', error);
      throw error;
    }
  }

  /**
   * Poll for analysis completion
   */
  async pollAnalysisStatus(
    analysisId: string, 
    onStatusUpdate?: (status: AnalysisStatus) => void,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<SpaceAnalysis> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const analysis = await this.getAnalysis(analysisId);
        
        if (onStatusUpdate) {
          onStatusUpdate(analysis.status);
        }

        if (analysis.status === 'completed') {
          return analysis;
        }
        
        if (analysis.status === 'failed') {
          throw new Error('Space analysis failed');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          throw error;
        }
        attempts++;
      }
    }

    throw new Error('Analysis polling timeout');
  }

  /**
   * Poll for generation completion
   */
  async pollGenerationStatus(
    resultId: string,
    onStatusUpdate?: (status: GenerationStatus) => void,
    maxAttempts = 60,
    intervalMs = 3000
  ): Promise<EnhancedGenerationResult> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const result = await this.getGenerationResult(resultId);
        
        if (onStatusUpdate) {
          onStatusUpdate(result.status);
        }

        if (result.status === 'completed') {
          return result;
        }
        
        if (result.status === 'failed' || result.status === 'cancelled') {
          throw new Error(`Generation ${result.status}`);
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          throw error;
        }
        attempts++;
      }
    }

    throw new Error('Generation polling timeout');
  }

  /**
   * Cancel a generation in progress
   */
  async cancelGeneration(resultId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/generate/result/${resultId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': await this.getAuthHeader(),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Cancel generation error:', error);
      return false;
    }
  }

  /**
   * Get room type suggestions based on image analysis
   */
  async getRoomTypeSuggestions(imageUrl: string): Promise<Array<{ roomType: RoomType; confidence: number }>> {
    try {
      const response = await fetch(`${this.apiUrl}/space/suggest-room-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': await this.getAuthHeader(),
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error(`Room type suggestion failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Room type suggestion error:', error);
      throw error;
    }
  }

  // Private helper methods

  private async uploadImage(file: File | Blob): Promise<string> {
    try {
      const fileName = `space-analysis/${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  private async getAuthHeader(): Promise<string> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.access_token) {
        throw new Error('Authentication required');
      }

      return `Bearer ${session.access_token}`;
    } catch (error) {
      console.error('Auth header error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const spaceAnalysisService = new SpaceAnalysisService();

// Hook for React components
import { useState, useEffect } from 'react';

export const useSpaceAnalysis = (analysisId?: string) => {
  const [analysis, setAnalysis] = useState<SpaceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId);
    }
  }, [analysisId]);

  const loadAnalysis = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await spaceAnalysisService.getAnalysis(id);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpace = async (imageFile: File | Blob, projectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await spaceAnalysisService.analyzeSpace(imageFile, projectId);
      setAnalysis(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    loading,
    error,
    analyzeSpace,
    loadAnalysis,
  };
};