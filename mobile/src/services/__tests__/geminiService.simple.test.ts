/**
 * Simplified Google Gemini Service Tests
 * Tests core functionality without React Native dependencies
 */

// Mock Google Generative AI before any imports
const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel
  }))
}));

import GeminiService from '../geminiService';

describe('GeminiService - Core Functionality', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-api-key-123';
  const mockImageData = 'data:image/jpeg;base64,' + 'a'.repeat(200); // Valid length image data

  // Suppress console.error for expected errors in tests
  const originalConsoleError = console.error;
  
  beforeAll(() => {
    // Suppress expected error logging during tests
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    geminiService = new GeminiService(mockApiKey);
  });

  describe('Service Initialization', () => {
    it('should create instance with valid API key', () => {
      expect(geminiService).toBeInstanceOf(GeminiService);
    });

    it('should throw error with empty API key', () => {
      expect(() => {
        new GeminiService('');
      }).toThrow('Gemini API key is required');
    });

    it('should initialize Google Generative AI client', () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      expect(GoogleGenerativeAI).toHaveBeenCalledWith(mockApiKey);
    });
  });

  describe('Input Validation', () => {
    it('should reject empty image data', async () => {
      const result = await geminiService.analyzeRoom({
        imageData: ''
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image data is required');
    });

    it('should reject invalid image data format', async () => {
      const result = await geminiService.analyzeRoom({
        imageData: 'too-short'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid image data format');
    });

    it('should reject invalid room dimensions', async () => {
      const result = await geminiService.analyzeRoom({
        imageData: mockImageData,
        roomDimensions: {
          width: -1,
          height: 0,
          length: 5,
          roomType: 'living-room',
          lightingSources: ['window']
        }
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid room dimensions');
    });

    it('should accept valid input parameters', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            roomLayout: {
              suggestions: ['Test suggestion'],
              optimizationTips: ['Test tip']
            },
            furniture: [],
            colorScheme: {
              primary: 'White',
              secondary: 'Gray',
              accent: 'Blue',
              description: 'Test colors'
            },
            lighting: {
              recommendations: [],
              fixtures: []
            },
            decorativeElements: [],
            overallDesignConcept: 'Test concept',
            confidenceScore: 0.8
          })
        }
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.analyzeRoom({
        imageData: mockImageData,
        roomDimensions: {
          width: 4,
          height: 3,
          length: 5,
          roomType: 'living-room',
          lightingSources: ['window']
        }
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('API Response Processing', () => {
    it('should parse valid JSON response', async () => {
      const mockDesignData = {
        roomLayout: {
          suggestions: ['Arrange furniture to maximize flow'],
          optimizationTips: ['Use multi-functional pieces']
        },
        furniture: [{
          item: 'Sofa',
          dimensions: '200x90x85',
          placement: 'Against wall',
          reasoning: 'Optimal for traffic flow'
        }],
        colorScheme: {
          primary: 'White #FFFFFF',
          secondary: 'Gray #808080',
          accent: 'Blue #0066CC',
          description: 'Clean and modern palette'
        },
        lighting: {
          recommendations: ['Add task lighting'],
          fixtures: ['Floor lamp']
        },
        decorativeElements: ['Plants', 'Art'],
        overallDesignConcept: 'Modern minimalist approach',
        confidenceScore: 0.92
      };

      const mockResponse = {
        response: {
          text: () => JSON.stringify(mockDesignData)
        }
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.analyzeRoom({
        imageData: mockImageData
      });

      expect(result.success).toBe(true);
      expect(result.data?.confidenceScore).toBe(0.92);
      expect(result.data?.furniture).toHaveLength(1);
      expect(result.data?.overallDesignConcept).toBe('Modern minimalist approach');
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        response: {
          text: () => 'This is not JSON data'
        }
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.analyzeRoom({
        imageData: mockImageData
      });

      // Should still succeed with fallback response
      expect(result.success).toBe(true);
      expect(result.data?.confidenceScore).toBe(0.5);
      expect(result.data?.overallDesignConcept).toContain('This is not JSON data');
    });

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Network error'));

      const result = await geminiService.analyzeRoom({
        imageData: mockImageData
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    }, 10000);
  });

  describe('Error Handling', () => {
    const errorTestCases = [
      {
        error: new Error('API key invalid'),
        expectedMessage: 'Invalid API key. Please check your Gemini API configuration.'
      },
      {
        error: new Error('quota exceeded'),
        expectedMessage: 'API rate limit exceeded. Please try again in a few minutes.'
      },
      {
        error: new Error('network timeout'),
        expectedMessage: 'Network error. Please check your internet connection.'
      }
    ];

    errorTestCases.forEach(({ error, expectedMessage }) => {
      it(`should handle ${error.message} error`, async () => {
        mockGenerateContent.mockRejectedValue(error);

        const result = await geminiService.analyzeRoom({
          imageData: mockImageData
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe(expectedMessage);
      }, 10000);
    });
  });

  describe('Usage Statistics', () => {
    it('should track request count', () => {
      const initialStats = geminiService.getUsageStats();
      expect(initialStats.requestCount).toBe(0);
    });

    it('should reset statistics', () => {
      geminiService.resetUsageStats();
      const stats = geminiService.getUsageStats();
      
      expect(stats.requestCount).toBe(0);
      expect(stats.lastRequestTime).toBe(0);
    });
  });

  describe('Prompt Building', () => {
    it('should build comprehensive prompt with all parameters', () => {
      const input = {
        imageData: mockImageData,
        roomDimensions: {
          width: 4,
          height: 3,
          length: 5,
          roomType: 'bedroom',
          lightingSources: ['window', 'lamp']
        },
        stylePreferences: {
          primaryStyle: 'scandinavian',
          colors: ['white', 'wood'],
          budget: '5000-8000',
          preferredMaterials: ['wood', 'linen']
        },
        customPrompt: 'Focus on creating a calm sleeping environment'
      };

      // Access private method for testing
      const prompt = (geminiService as any).buildInteriorDesignPrompt(input);

      expect(prompt).toContain('professional interior designer');
      expect(prompt).toContain('4m × 5m × 3m');
      expect(prompt).toContain('bedroom');
      expect(prompt).toContain('scandinavian');
      expect(prompt).toContain('5000-8000');
      expect(prompt).toContain('calm sleeping environment');
      expect(prompt).toContain('FORMAT RESPONSE AS STRUCTURED JSON');
    });
  });
});