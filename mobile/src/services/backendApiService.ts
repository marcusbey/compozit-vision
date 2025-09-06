// Backend API Service - Secure server-side API calls
// Handles all sensitive operations that require API keys

// Default to empty string to trigger fallback behavior
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class BackendApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method for API calls
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      // Check if we should skip backend calls (for development)
      if (!this.baseUrl || this.baseUrl === '') {
        console.log('🔧 Backend not configured, using local fallback');
        return {
          success: false,
          error: 'Backend API not configured. Using local fallback.'
        };
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.log('📡 Backend unreachable, using local fallback');
        return {
          success: false,
          error: 'Backend server not available. Using local fallback.'
        };
      }
      
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Gemini prompt optimization
  async optimizePrompt(request: {
    userInput: string;
    context: string;
    selectedFeatures: string[];
    additionalPreferences?: any;
  }) {
    return this.makeRequest<any>('/gemini/optimize-prompt', 'POST', request);
  }

  // Gemini prompt refinement
  async refinePrompt(request: {
    basePrompt: any;
    refinements: any;
    iterationType: string;
  }) {
    return this.makeRequest<any>('/gemini/refine-prompt', 'POST', request);
  }

  // Gemini context analysis
  async analyzeContext(userInput: string) {
    return this.makeRequest<any>('/gemini/analyze-context', 'POST', { userInput });
  }

  // Image generation (placeholder for future implementation)
  async generateImage(prompt: string, provider: string = 'mock') {
    return this.makeRequest<any>('/image/generate', 'POST', { prompt, provider });
  }
}

export default new BackendApiService();