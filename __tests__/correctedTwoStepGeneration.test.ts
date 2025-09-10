/**
 * Corrected Two-Step AI Generation Test Suite
 * Tests the corrected flow: JSON → Enhanced Prompt → Image Generation
 */

import { correctedTwoStepGenerationService, UserInteractionData } from '../mobile/src/services/correctedTwoStepGenerationService';
import { backendApiService } from '../mobile/src/services/backendApiService';

// Mock dependencies
jest.mock('../mobile/src/services/backendApiService');
jest.mock('../mobile/src/services/contextAnalyticsService');

const mockBackendApiService = backendApiService as jest.Mocked<typeof backendApiService>;

describe('Corrected Two-Step AI Generation System', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  };

  const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  const createTestUserInteractionData = (overrides: Partial<UserInteractionData> = {}): UserInteractionData => ({
    userPrompt: 'make this room more modern and cozy',
    originalImage: mockImage,
    locationClicks: [
      { x: 150, y: 200, description: 'focus on the sofa area' },
      { x: 300, y: 100, description: 'change this wall' }
    ],
    referenceImages: [
      {
        url: 'data:image/jpeg;base64,mockReferenceImage1',
        description: 'Scandinavian style inspiration',
        type: 'style'
      },
      {
        url: 'data:image/jpeg;base64,mockReferenceImage2',
        description: 'warm color palette',
        type: 'color'
      }
    ],
    selectedFeatures: {
      colorPalette: ['#0A0A0A', '#D4A574', '#FFFFFF'],
      priceRange: { min: 5000, max: 15000, currency: 'USD' },
      materials: ['wood', 'linen', 'marble'],
      lighting: 'natural',
      roomType: 'living_room',
      style: ['Scandinavian', 'Modern']
    },
    projectContext: {
      clientName: 'Test Client',
      timeline: '3 weeks',
      constraints: ['budget conscious', 'pet friendly']
    },
    sessionId: 'test-session-123',
    userId: mockUser.id,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: Enhanced Prompt Generation', () => {
    test('should generate enhanced prompt from user interaction data', async () => {
      const mockResponse = {
        success: true,
        data: {
          enhancedPrompt: 'Transform this living room into a modern Scandinavian space focusing on the sofa area. Replace current seating with light wood frame sectional with cream linen upholstery. Apply charcoal accent wall and warm gold fixtures. Include natural materials and cozy textiles.',
          originalData: expect.any(Object),
          processingTime: 1500,
          metadata: {
            step: 1,
            model: 'gemini-2.0-flash-exp',
            promptEnhancementApplied: true
          }
        }
      };

      mockBackendApiService.post.mockResolvedValue(mockResponse);

      const userInteractionData = createTestUserInteractionData();
      const result = await correctedTwoStepGenerationService.generateEnhancedPrompt(userInteractionData);

      expect(mockBackendApiService.post).toHaveBeenCalledWith('/gemini/enhance-prompt', {
        userInteractionData
      });

      expect(result.enhancedPrompt).toBeDefined();
      expect(result.enhancedPrompt.length).toBeGreaterThan(50);
      expect(result.metadata.step).toBe(1);
      expect(result.metadata.promptEnhancementApplied).toBe(true);
    });

    test('should handle Step 1 failure with fallback', async () => {
      mockBackendApiService.post.mockRejectedValue(new Error('API failure'));

      const userInteractionData = createTestUserInteractionData();
      const result = await correctedTwoStepGenerationService.generateEnhancedPrompt(userInteractionData);

      expect(result.fallbackUsed).toBe(true);
      expect(result.enhancedPrompt).toContain('Transform this interior space');
      expect(result.enhancedPrompt).toContain(userInteractionData.userPrompt);
    });

    test('should incorporate location clicks in enhanced prompt', async () => {
      const mockResponse = {
        success: true,
        data: {
          enhancedPrompt: 'Transform focusing on sofa area at (150, 200) and wall at (300, 100)...',
          originalData: expect.any(Object),
          processingTime: 1200,
          metadata: { step: 1, model: 'gemini-2.0-flash-exp', promptEnhancementApplied: true }
        }
      };

      mockBackendApiService.post.mockResolvedValue(mockResponse);

      const userInteractionData = createTestUserInteractionData({
        locationClicks: [
          { x: 150, y: 200, description: 'focus on sofa' },
          { x: 300, y: 100, description: 'change wall color' }
        ]
      });

      const result = await correctedTwoStepGenerationService.generateEnhancedPrompt(userInteractionData);

      expect(result.enhancedPrompt).toContain('sofa area');
      expect(result.enhancedPrompt).toContain('wall');
    });

    test('should incorporate reference images in prompt context', async () => {
      const mockResponse = {
        success: true,
        data: {
          enhancedPrompt: 'Transform with Scandinavian style inspiration and warm color palette from references...',
          originalData: expect.any(Object),
          processingTime: 1400,
          metadata: { step: 1, model: 'gemini-2.0-flash-exp', promptEnhancementApplied: true }
        }
      };

      mockBackendApiService.post.mockResolvedValue(mockResponse);

      const userInteractionData = createTestUserInteractionData({
        referenceImages: [
          { url: 'ref1.jpg', description: 'Scandinavian minimalism', type: 'style' },
          { url: 'ref2.jpg', description: 'warm earth tones', type: 'color' }
        ]
      });

      const result = await correctedTwoStepGenerationService.generateEnhancedPrompt(userInteractionData);

      expect(result.enhancedPrompt).toContain('Scandinavian');
      expect(result.enhancedPrompt).toContain('warm');
    });
  });

  describe('Step 2: Design Image Generation', () => {
    test('should generate design image with original + enhanced prompt + references', async () => {
      const mockResponse = {
        success: true,
        data: {
          generatedImage: {
            url: 'https://example.com/generated-design.jpg',
            base64Data: null,
            metadata: {
              model: 'nano-banana',
              modelId: 'gemini-2.0-flash-exp',
              processingTime: 12000,
              promptUsed: 'Enhanced prompt with professional standards...',
              referenceImagesUsed: 2,
              generationResponse: 'Generated successfully with Nano Banana...'
            }
          },
          sessionId: 'test-session-123',
          enhancedPrompt: 'Transform this living room...',
          applicationPrompt: 'PROFESSIONAL RENDERING REQUIREMENTS...',
          referenceImages: [
            { type: 'style', description: 'Scandinavian inspiration', processed: true },
            { type: 'color', description: 'warm palette', processed: true }
          ]
        }
      };

      mockBackendApiService.post.mockResolvedValue(mockResponse);

      const result = await correctedTwoStepGenerationService.generateDesignImage(
        mockImage,
        'Enhanced prompt text',
        [
          { url: 'ref1.jpg', description: 'Scandinavian inspiration', type: 'style' },
          { url: 'ref2.jpg', description: 'warm palette', type: 'color' }
        ],
        'test-session-123',
        mockUser.id
      );

      expect(mockBackendApiService.post).toHaveBeenCalledWith('/gemini/generate-design', {
        originalImage: mockImage,
        enhancedPrompt: 'Enhanced prompt text',
        referenceImages: expect.any(Array),
        sessionId: 'test-session-123',
        userId: mockUser.id
      });

      expect(result.generatedImage.url).toBeDefined();
      expect(result.generatedImage.metadata.model).toBe('nano-banana');
      expect(result.generatedImage.metadata.referenceImagesUsed).toBe(2);
    });

    test('should handle Step 2 failure', async () => {
      mockBackendApiService.post.mockRejectedValue(new Error('Image generation failed'));

      await expect(
        correctedTwoStepGenerationService.generateDesignImage(
          mockImage,
          'Enhanced prompt',
          [],
          'session-123',
          'user-123'
        )
      ).rejects.toThrow('Image generation failed');
    });
  });

  describe('Complete 2-Step Process', () => {
    test('should complete full generation process successfully', async () => {
      // Mock Step 1 response
      const step1Response = {
        success: true,
        data: {
          enhancedPrompt: 'Transform this living room into modern Scandinavian space...',
          originalData: expect.any(Object),
          processingTime: 1500,
          metadata: { step: 1, model: 'gemini-2.0-flash-exp', promptEnhancementApplied: true }
        }
      };

      // Mock Step 2 response
      const step2Response = {
        success: true,
        data: {
          generatedImage: {
            url: 'https://example.com/generated.jpg',
            metadata: {
              model: 'nano-banana',
              processingTime: 12000,
              referenceImagesUsed: 2
            }
          },
          sessionId: 'test-session-123'
        }
      };

      mockBackendApiService.post
        .mockResolvedValueOnce(step1Response)
        .mockResolvedValueOnce(step2Response);

      const userInteractionData = createTestUserInteractionData();
      const result = await correctedTwoStepGenerationService.processCompleteGeneration(userInteractionData);

      expect(result.success).toBe(true);
      expect(result.data?.generatedDesign.generatedImage.url).toBeDefined();
      expect(result.data?.enhancedPromptResult.enhancedPrompt).toBeDefined();
      expect(result.data?.steps.step1Duration).toBeGreaterThan(0);
      expect(result.data?.steps.step2Duration).toBeGreaterThan(0);

      // Verify both API calls were made
      expect(mockBackendApiService.post).toHaveBeenCalledTimes(2);
      expect(mockBackendApiService.post).toHaveBeenNthCalledWith(1, '/gemini/enhance-prompt', {
        userInteractionData
      });
      expect(mockBackendApiService.post).toHaveBeenNthCalledWith(2, '/gemini/generate-design', {
        originalImage: userInteractionData.originalImage,
        enhancedPrompt: step1Response.data.enhancedPrompt,
        referenceImages: userInteractionData.referenceImages,
        sessionId: userInteractionData.sessionId,
        userId: userInteractionData.userId
      });
    });

    test('should handle complete process failure', async () => {
      mockBackendApiService.post.mockRejectedValue(new Error('Complete failure'));

      const userInteractionData = createTestUserInteractionData();
      const result = await correctedTwoStepGenerationService.processCompleteGeneration(userInteractionData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Complete failure');
    });
  });

  describe('Single-Step Design Refinement', () => {
    test('should refine design with direct prompt', async () => {
      const mockResponse = {
        success: true,
        data: {
          refinedImage: {
            url: 'https://example.com/refined-design.jpg',
            metadata: {
              model: 'nano-banana',
              refinementApplied: 'Make the lighting warmer',
              processingTime: 8000
            }
          },
          sessionId: 'test-session-123',
          originalRefinementPrompt: 'Make the lighting warmer',
          appliedRefinementPrompt: 'Make the lighting warmer\n\nREFINEMENT REQUIREMENTS...'
        }
      };

      mockBackendApiService.post.mockResolvedValue(mockResponse);

      const result = await correctedTwoStepGenerationService.refineDesign(
        'https://example.com/generated-design.jpg',
        'Make the lighting warmer',
        'test-session-123',
        mockUser.id
      );

      expect(mockBackendApiService.post).toHaveBeenCalledWith('/gemini/refine-design', {
        generatedImage: 'https://example.com/generated-design.jpg',
        refinementPrompt: 'Make the lighting warmer',
        sessionId: 'test-session-123',
        userId: mockUser.id
      });

      expect(result.refinedImage.url).toBeDefined();
      expect(result.refinedImage.metadata.refinementApplied).toBe('Make the lighting warmer');
      expect(result.originalRefinementPrompt).toBe('Make the lighting warmer');
    });

    test('should handle refinement failure', async () => {
      mockBackendApiService.post.mockRejectedValue(new Error('Refinement failed'));

      await expect(
        correctedTwoStepGenerationService.refineDesign(
          'generated-image.jpg',
          'Change sofa color',
          'session-123',
          'user-123'
        )
      ).rejects.toThrow('Refinement failed');
    });
  });

  describe('Data Validation', () => {
    test('should validate complete user interaction data', () => {
      const validData = createTestUserInteractionData();
      const validation = correctedTwoStepGenerationService.validateUserInteractionData(validData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const invalidData = createTestUserInteractionData({
        userPrompt: '',
        originalImage: '',
        userId: ''
      });

      const validation = correctedTwoStepGenerationService.validateUserInteractionData(invalidData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('User prompt is required');
      expect(validation.errors).toContain('Original image is required');
      expect(validation.errors).toContain('User ID is required');
    });

    test('should validate location clicks format', () => {
      const invalidData = createTestUserInteractionData({
        locationClicks: [
          { x: 'invalid' as any, y: 200 },
          { x: 100, y: 'invalid' as any }
        ]
      });

      const validation = correctedTwoStepGenerationService.validateUserInteractionData(invalidData);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes('numeric x and y coordinates'))).toBe(true);
    });

    test('should validate reference images format', () => {
      const invalidData = createTestUserInteractionData({
        referenceImages: [
          { url: '', description: 'test', type: 'style' },
          { url: 'test.jpg', description: '', type: 'style' },
          { url: 'test.jpg', description: 'test', type: '' }
        ]
      });

      const validation = correctedTwoStepGenerationService.validateUserInteractionData(invalidData);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes('must have url, description, and type'))).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should create user interaction data from parameters', () => {
      const data = correctedTwoStepGenerationService.createUserInteractionData(
        'test prompt',
        'test-image.jpg',
        { colorPalette: ['#000000'], materials: ['wood'] },
        'user-123',
        'session-123',
        [{ x: 100, y: 200, description: 'focus area' }],
        [{ url: 'ref.jpg', description: 'style ref', type: 'style' }],
        { clientName: 'Test Client' }
      );

      expect(data.userPrompt).toBe('test prompt');
      expect(data.originalImage).toBe('test-image.jpg');
      expect(data.selectedFeatures.colorPalette).toEqual(['#000000']);
      expect(data.locationClicks).toHaveLength(1);
      expect(data.referenceImages).toHaveLength(1);
      expect(data.projectContext?.clientName).toBe('Test Client');
    });
  });

  describe('Integration with Corrected Flow', () => {
    test('should follow correct sequence: JSON → Prompt → Image', async () => {
      const step1Response = {
        success: true,
        data: {
          enhancedPrompt: 'Enhanced prompt from JSON data',
          metadata: { step: 1, model: 'gemini-2.0-flash-exp' }
        }
      };

      const step2Response = {
        success: true,
        data: {
          generatedImage: { url: 'generated.jpg', metadata: { model: 'nano-banana' } },
          sessionId: 'test'
        }
      };

      mockBackendApiService.post
        .mockResolvedValueOnce(step1Response)
        .mockResolvedValueOnce(step2Response);

      const userInteractionData = createTestUserInteractionData();
      const result = await correctedTwoStepGenerationService.processCompleteGeneration(userInteractionData);

      // Verify Step 1: JSON object sent (no image)
      expect(mockBackendApiService.post).toHaveBeenNthCalledWith(1, '/gemini/enhance-prompt', {
        userInteractionData: expect.objectContaining({
          userPrompt: expect.any(String),
          locationClicks: expect.any(Array),
          referenceImages: expect.any(Array),
          selectedFeatures: expect.any(Object)
        })
      });

      // Verify Step 2: Original image + enhanced prompt + reference images sent
      expect(mockBackendApiService.post).toHaveBeenNthCalledWith(2, '/gemini/generate-design', {
        originalImage: userInteractionData.originalImage,
        enhancedPrompt: 'Enhanced prompt from JSON data',
        referenceImages: userInteractionData.referenceImages,
        sessionId: userInteractionData.sessionId,
        userId: userInteractionData.userId
      });

      expect(result.success).toBe(true);
    });
  });
});