// API Configuration
// Centralized configuration for all API endpoints

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Gemini AI endpoints (secure backend proxy)
  gemini: {
    analyzeContext: `${API_BASE_URL}/gemini/analyze-context`,
    optimizePrompt: `${API_BASE_URL}/gemini/optimize-prompt`,
    refinePrompt: `${API_BASE_URL}/gemini/refine-prompt`,
    // TODO: Add these endpoints to backend
    analyzeImage: `${API_BASE_URL}/gemini/analyze-image`,
    generateImage: `${API_BASE_URL}/gemini/generate-image`,
  },
  
  // Other API endpoints can be added here
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  
  // Add more as needed
};

// API request helper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}