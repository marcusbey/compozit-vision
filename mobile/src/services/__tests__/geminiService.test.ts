/**
 * Google Gemini Service Tests
 * Comprehensive testing for AI-powered interior design processing
 */

import { jest } from '@jest/globals';
import GeminiService, { getGeminiService, analyzeRoomWithGemini, RoomAnalysisInput } from '../geminiService';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

describe('GeminiService', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-api-key';
  const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHw8f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckriSNyDf7BLUiTJe7ZlY9qWk0K0Y3VXLGnj/9k=';

  beforeEach(() => {
    jest.clearAllMocks();
    geminiService = new GeminiService(mockApiKey);
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with valid API key', () => {
      expect(geminiService).toBeInstanceOf(GeminiService);
    });

    it('should throw error with missing API key', () => {
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
    it('should validate required image data', async () => {
      const invalidInput: RoomAnalysisInput = {
        imageData: ''
      };

      const result = await geminiService.analyzeRoom(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Image data is required');
    });

    it('should validate image data format', async () => {
      const invalidInput: RoomAnalysisInput = {
        imageData: 'invalid-short-data'
      };

      const result = await geminiService.analyzeRoom(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid image data format');
    });

    it('should validate room dimensions when provided', async () => {
      const invalidInput: RoomAnalysisInput = {
        imageData: mockImageData,
        roomDimensions: {
          width: -1,
          height: 0,
          length: 5,
          roomType: 'living-room',
          lightingSources: ['window']
        }
      };

      const result = await geminiService.analyzeRoom(invalidInput);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid room dimensions');
    });
  });

  describe('Room Analysis', () => {
    const validInput: RoomAnalysisInput = {
      imageData: mockImageData,
      roomDimensions: {
        width: 4,
        height: 3,
        length: 5,
        roomType: 'living-room',
        lightingSources: ['north-window', 'ceiling-light']
      },
      stylePreferences: {
        primaryStyle: 'modern',
        colors: ['white', 'gray', 'blue'],
        budget: '5000-10000',
        preferredMaterials: ['wood', 'metal']
      },
      customPrompt: 'Focus on space optimization for small apartment'
    };

    it('should analyze room successfully with complete input', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            roomLayout: {
              suggestions: ['Arrange seating to face the main window'],
              optimizationTips: ['Use multi-functional furniture']
            },
            furniture: [{
              item: 'Sectional sofa',
              dimensions: '200 x 90 x 85 cm',
              placement: 'Against the east wall',
              reasoning: 'Maximizes seating while maintaining flow',
              estimatedCost: '$800-1200'
            }],
            colorScheme: {
              primary: 'Warm white #F8F8F8',
              secondary: 'Light gray #E0E0E0',
              accent: 'Navy blue #1B365D',
              description: 'Clean and calming palette'
            },
            lighting: {
              recommendations: ['Add task lighting near seating area'],
              fixtures: ['Floor lamp', 'Table lamps']
            },
            decorativeElements: ['Throw pillows', 'Wall art', 'Plants'],
            overallDesignConcept: 'Modern minimalist with comfort focus',
            confidenceScore: 0.92
          }))
        }
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue(mockResponse)
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      const result = await geminiService.analyzeRoom(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.roomLayout.suggestions).toHaveLength(1);
      expect(result.data?.furniture).toHaveLength(1);
      expect(result.data?.confidenceScore).toBe(0.92);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle malformed API response gracefully', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Invalid JSON response from AI')
        }
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue(mockResponse)
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      const result = await geminiService.analyzeRoom(validInput);

      expect(result.success).toBe(true);
      expect(result.data?.overallDesignConcept).toContain('Invalid JSON response');
      expect(result.data?.confidenceScore).toBe(0.5);
    });

    it('should build comprehensive prompt with all input parameters', () => {
      // Access private method through type assertion for testing
      const prompt = (geminiService as any).buildInteriorDesignPrompt(validInput);

      expect(prompt).toContain('professional interior designer');
      expect(prompt).toContain('4m × 5m × 3m');
      expect(prompt).toContain('living-room');
      expect(prompt).toContain('modern');
      expect(prompt).toContain('5000-10000');
      expect(prompt).toContain('Focus on space optimization');
      expect(prompt).toContain('FORMAT RESPONSE AS STRUCTURED JSON');
    });
  });

  describe('Rate Limiting and Error Handling', () => {
    it('should enforce rate limiting between requests', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(JSON.stringify({
              roomLayout: { suggestions: [], optimizationTips: [] },
              furniture: [],
              colorScheme: { primary: '', secondary: '', accent: '', description: '' },
              lighting: { recommendations: [], fixtures: [] },
              decorativeElements: [],
              overallDesignConcept: '',
              confidenceScore: 0.8
            }))
          }
        })
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      
      const startTime = Date.now();
      
      // Make two rapid requests
      await geminiService.analyzeRoom({ imageData: mockImageData });
      await geminiService.analyzeRoom({ imageData: mockImageData });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should take at least 1 second due to rate limiting
      expect(totalTime).toBeGreaterThanOrEqual(1000);
    });

    it('should retry on transient errors', async () => {
      const mockModel = {
        generateContent: jest.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Temporary failure'))
          .mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue(JSON.stringify({
                roomLayout: { suggestions: [], optimizationTips: [] },
                furniture: [],
                colorScheme: { primary: '', secondary: '', accent: '', description: '' },
                lighting: { recommendations: [], fixtures: [] },
                decorativeElements: [],
                overallDesignConcept: 'Success after retries',
                confidenceScore: 0.8
              }))
            }
          })
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      const result = await geminiService.analyzeRoom({ imageData: mockImageData });

      expect(result.success).toBe(true);
      expect(result.data?.overallDesignConcept).toBe('Success after retries');
      expect(mockModel.generateContent).toHaveBeenCalledTimes(3);
    });

    it('should handle API key errors without retrying', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Invalid API key'))
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      const result = await geminiService.analyzeRoom({ imageData: mockImageData });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid API key');
      expect(mockModel.generateContent).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('Visualization Generation', () => {
    const mockDesignRecommendation = {
      roomLayout: {
        suggestions: ['Test suggestion'],
        optimizationTips: ['Test tip']
      },
      furniture: [{
        item: 'Test sofa',
        dimensions: '200x90x85',
        placement: 'Center of room',
        reasoning: 'Test reasoning'
      }],
      colorScheme: {
        primary: 'White',
        secondary: 'Gray',
        accent: 'Blue',
        description: 'Test description'
      },
      lighting: {
        recommendations: ['Test lighting'],
        fixtures: ['Test fixture']
      },
      decorativeElements: ['Test decor'],
      overallDesignConcept: 'Test concept',
      confidenceScore: 0.8
    };

    it('should generate visualization description', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Detailed visualization description with spatial relationships and lighting effects')
        }
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue(mockResponse)
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      const result = await geminiService.generateVisualization(
        mockImageData,
        mockDesignRecommendation,
        'Focus on natural lighting'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockModel.generateContent).toHaveBeenCalledWith([
        expect.stringContaining('Focus on natural lighting'),
        expect.objectContaining({
          inlineData: expect.objectContaining({
            mimeType: 'image/jpeg'
          })
        })
      ]);
    });
  });

  describe('Usage Statistics', () => {
    it('should track usage statistics', async () => {
      const initialStats = geminiService.getUsageStats();
      expect(initialStats.requestCount).toBe(0);

      // Mock successful request
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(JSON.stringify({
              roomLayout: { suggestions: [], optimizationTips: [] },
              furniture: [],
              colorScheme: { primary: '', secondary: '', accent: '', description: '' },
              lighting: { recommendations: [], fixtures: [] },
              decorativeElements: [],
              overallDesignConcept: '',
              confidenceScore: 0.8
            }))
          }
        })
      };

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel)
      }));

      geminiService = new GeminiService(mockApiKey);
      await geminiService.analyzeRoom({ imageData: mockImageData });

      const updatedStats = geminiService.getUsageStats();
      expect(updatedStats.requestCount).toBe(1);
      expect(updatedStats.lastRequestTime).toBeGreaterThan(initialStats.lastRequestTime);
    });

    it('should reset usage statistics', () => {
      geminiService.resetUsageStats();
      const stats = geminiService.getUsageStats();
      
      expect(stats.requestCount).toBe(0);
      expect(stats.lastRequestTime).toBe(0);
    });
  });

  describe('Singleton Pattern and Convenience Functions', () => {
    it('should create singleton instance through getGeminiService', () => {
      process.env.GEMINI_API_KEY = 'test-env-key';
      
      const service1 = getGeminiService();
      const service2 = getGeminiService();
      
      expect(service1).toBe(service2);
    });

    it('should throw error when no API key available', () => {
      delete process.env.GEMINI_API_KEY;
      
      expect(() => {
        getGeminiService();
      }).toThrow('Gemini API key not found');
    });

    it('should use provided API key over environment variable', () => {
      process.env.GEMINI_API_KEY = 'env-key';
      
      expect(() => {
        getGeminiService('custom-key');
      }).not.toThrow();
    });

    it('should use convenience function for room analysis', async () => {
      // Mock the singleton service
      const mockService = {
        analyzeRoom: jest.fn().mockResolvedValue({
          success: true,
          data: { overallDesignConcept: 'Convenience function test' }
        })
      };

      jest.doMock('../geminiService', () => ({
        ...jest.requireActual('../geminiService'),
        getGeminiService: jest.fn().mockReturnValue(mockService)
      }));

      const { analyzeRoomWithGemini: mockAnalyzeRoomWithGemini } = require('../geminiService');
      const result = await mockAnalyzeRoomWithGemini(mockImageData, {
        stylePreferences: { primaryStyle: 'modern', colors: [], budget: '', preferredMaterials: [] }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling Categories', () => {
    const testCases = [
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
      },
      {
        error: new Error('JSON parse error'),
        expectedMessage: 'Failed to process AI response. Please try again.'
      },
      {
        error: new Error('Unknown error'),
        expectedMessage: 'Unknown error'
      }
    ];

    testCases.forEach(({ error, expectedMessage }) => {
      it(`should categorize error: ${error.message}`, async () => {
        const mockModel = {
          generateContent: jest.fn().mockRejectedValue(error)
        };

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        GoogleGenerativeAI.mockImplementation(() => ({
          getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        }));

        geminiService = new GeminiService(mockApiKey);
        const result = await geminiService.analyzeRoom({ imageData: mockImageData });

        expect(result.success).toBe(false);
        expect(result.error).toBe(expectedMessage);
      });
    });
  });
});