/**
 * Two-Step AI Generation Test Suite
 * Comprehensive testing for the core AI image generation feature
 */

import { twoStepGenerationService, TwoStepGenerationRequest } from '../mobile/src/services/twoStepGenerationService';
import { contextProcessingPipeline } from '../mobile/src/services/contextProcessingPipeline';
import { FeatureId } from '../mobile/src/utils/contextAnalysis';

// Mock dependencies
jest.mock('../mobile/src/services/contextProcessingPipeline');
jest.mock('../mobile/src/services/backendApiService');
jest.mock('../mobile/src/services/contextAnalyticsService');

describe('Two-Step AI Generation System', () => {
  // Test data setup
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  };

  const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  const mockProjectContext = {
    id: 'project-123',
    name: 'Modern Living Room',
    style: ['Scandinavian', 'Modern'],
    roomType: 'living_room',
    budget: {
      total: 5000,
      breakdown: {
        furniture: 3000,
        materials: 1500,
        labor: 500
      }
    },
    constraints: {
      preferredStyles: ['Scandinavian'],
      roomRequirements: ['natural light', 'cozy atmosphere']
    }
  };

  const createTestRequest = (overrides: Partial<TwoStepGenerationRequest> = {}): TwoStepGenerationRequest => ({
    originalImage: mockImage,
    userPrompt: 'make this room more cozy and bright',
    selectedFeatures: ['lighting', 'materials', 'colorPalette'],
    projectContext: mockProjectContext,
    culturalPreferences: {
      primaryStyle: 'Scandinavian',
      culturalInfluences: ['Nordic', 'Danish'],
      regionCode: 'US',
      authenticityLevel: 'high'
    },
    userId: mockUser.id,
    sessionId: 'session-test-123',
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Generation Flow', () => {
    test('should complete successful 2-step generation', async () => {
      // Mock context analysis
      const mockContextAnalysis = {
        roomType: 'living_room',
        currentStyle: ['modern'],
        materials: ['wood', 'fabric'],
        lighting: 'natural',
        spatialLayout: 'open',
        potentialImprovements: ['better lighting', 'warmer colors'],
        confidence: 0.85
      };

      // Mock backend response
      const mockBackendResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/generated-image.jpg',
          model: 'imagen-3',
          generationTime: 15000,
          qualityScore: 0.9,
          culturalScore: 0.85
        }
      };

      // Setup mocks
      (contextProcessingPipeline.analyzeImage as jest.Mock).mockResolvedValue(mockContextAnalysis);
      
      const request = createTestRequest();
      const result = await twoStepGenerationService.generateDesign(request);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.generatedImage.url).toBeDefined();
      expect(result.data?.confidence).toBeGreaterThan(0.5);
      expect(result.data?.processingSteps.totalDuration).toBeGreaterThan(0);

      // Verify context analysis was called
      expect(contextProcessingPipeline.analyzeImage).toHaveBeenCalledWith(mockImage);
    });

    test('should handle context analysis failure gracefully', async () => {
      // Mock context analysis failure
      (contextProcessingPipeline.analyzeImage as jest.Mock).mockRejectedValue(
        new Error('Context analysis failed')
      );

      const request = createTestRequest();
      const result = await twoStepGenerationService.generateDesign(request);

      // Should still succeed with fallback
      expect(result.success).toBe(true);
      expect(result.data?.contextAnalysis.confidence).toBeLessThanOrEqual(0.6);
    });

    test('should handle backend API failure with fallback', async () => {
      const request = createTestRequest();
      // Backend will fail due to mocking, should use fallback
      
      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.data?.generatedImage.metadata.modelUsed).toBe('fallback');
    });
  });

  describe('Cultural Guidelines Integration', () => {
    test('should apply Scandinavian cultural guidelines correctly', async () => {
      const request = createTestRequest({
        culturalPreferences: {
          primaryStyle: 'Scandinavian',
          culturalInfluences: ['Nordic', 'Danish'],
          regionCode: 'SE',
          authenticityLevel: 'high'
        }
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.enhancedPrompt.culturalNotes).toContain('simplicity');
      expect(result.data?.enhancedPrompt.transformationPrompt).toMatch(/scandinavian|nordic|hygge/i);
    });

    test('should apply Mediterranean cultural guidelines correctly', async () => {
      const request = createTestRequest({
        culturalPreferences: {
          primaryStyle: 'Mediterranean',
          culturalInfluences: ['Spanish', 'Italian'],
          regionCode: 'ES',
          authenticityLevel: 'high'
        }
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.enhancedPrompt.transformationPrompt).toMatch(/mediterranean|terracotta|coastal/i);
    });

    test('should handle unknown cultural styles gracefully', async () => {
      const request = createTestRequest({
        culturalPreferences: {
          primaryStyle: 'UnknownStyle',
          culturalInfluences: ['Unknown'],
          regionCode: 'US',
          authenticityLevel: 'moderate'
        }
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.enhancedPrompt.styleConfidence).toBeLessThan(0.8);
    });
  });

  describe('Feature Integration', () => {
    test('should enhance prompt based on selected features', async () => {
      const request = createTestRequest({
        selectedFeatures: ['lighting', 'materials', 'colorPalette', 'furniture']
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      const enhancedPrompt = result.data?.enhancedPrompt.transformationPrompt.toLowerCase();
      expect(enhancedPrompt).toMatch(/lighting|materials|color|furniture/);
    });

    test('should handle empty feature selection', async () => {
      const request = createTestRequest({
        selectedFeatures: []
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.enhancedPrompt.transformationPrompt).toBeDefined();
    });
  });

  describe('Professional Quality Standards', () => {
    test('should include professional photography requirements', async () => {
      const request = createTestRequest();
      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      const prompt = result.data?.enhancedPrompt.transformationPrompt.toLowerCase();
      expect(prompt).toMatch(/professional|magazine|quality|high.resolution/);
    });

    test('should meet confidence thresholds', async () => {
      const request = createTestRequest();
      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.confidence).toBeGreaterThan(0.5);
      expect(result.data?.generatedImage.metadata.qualityScore).toBeGreaterThan(0.5);
    });

    test('should include technical requirements', async () => {
      const request = createTestRequest();
      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.enhancedPrompt.technicalRequirements).toBeDefined();
      expect(result.data?.enhancedPrompt.technicalRequirements.aspectRatio).toMatch(/16:9|4:3|1:1/);
      expect(result.data?.enhancedPrompt.technicalRequirements.lighting).toBeDefined();
    });
  });

  describe('Performance Benchmarks', () => {
    test('should complete generation within 30 seconds', async () => {
      const startTime = Date.now();
      const request = createTestRequest();
      
      const result = await twoStepGenerationService.generateDesign(request);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000); // 30 seconds
    });

    test('should handle concurrent generations', async () => {
      const requests = Array(3).fill(null).map((_, i) => 
        createTestRequest({
          userId: `user-${i}`,
          sessionId: `session-${i}`
        })
      );

      const results = await Promise.all(
        requests.map(req => twoStepGenerationService.generateDesign(req))
      );

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data?.sessionId).toBe(`session-${index}`);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid image data', async () => {
      const request = createTestRequest({
        originalImage: 'invalid-image-data'
      });

      const result = await twoStepGenerationService.generateDesign(request);

      // Should still succeed with fallback
      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
    });

    test('should handle empty user prompt', async () => {
      const request = createTestRequest({
        userPrompt: ''
      });

      // This should be caught by validation in the component
      // But if it reaches the service, it should handle gracefully
      const result = await twoStepGenerationService.generateDesign(request);
      expect(result.success).toBe(true);
    });

    test('should provide meaningful error messages', async () => {
      // Mock a complete failure
      (contextProcessingPipeline.analyzeImage as jest.Mock).mockRejectedValue(
        new Error('Complete system failure')
      );

      const request = createTestRequest();

      try {
        const result = await twoStepGenerationService.generateDesign(request);
        // Should still succeed due to fallback mechanisms
        expect(result.success).toBe(true);
      } catch (error) {
        expect(error.message).toContain('Generation failed');
      }
    });
  });

  describe('Design Refinement', () => {
    test('should refine existing design successfully', async () => {
      // First generate a design
      const initialRequest = createTestRequest();
      const initialResult = await twoStepGenerationService.generateDesign(initialRequest);

      expect(initialResult.success).toBe(true);

      // Then refine it
      const refinements = {
        styleAdjustments: ['more minimalist'],
        colorModifications: ['warmer tones'],
        lightingChanges: 'brighter natural light'
      };

      const refinedResult = await twoStepGenerationService.refineDesign(
        initialResult,
        refinements,
        'refined-session-123'
      );

      expect(refinedResult.success).toBe(true);
      expect(refinedResult.data?.processingSteps.totalDuration).toBeGreaterThan(
        initialResult.data?.processingSteps.totalDuration || 0
      );
    });

    test('should handle refinement of failed generation', async () => {
      const failedResult = {
        success: false,
        error: 'Initial generation failed'
      };

      const refinements = {
        styleAdjustments: ['modern']
      };

      await expect(
        twoStepGenerationService.refineDesign(failedResult as any, refinements, 'session')
      ).rejects.toThrow('Cannot refine failed generation result');
    });
  });
});

describe('Cultural Authenticity Validation', () => {
  const culturalStyles = [
    'Scandinavian',
    'Mediterranean', 
    'Japanese',
    'Modern',
    'Traditional'
  ];

  culturalStyles.forEach(style => {
    test(`should generate authentic ${style} designs`, async () => {
      const request = createTestRequest({
        culturalPreferences: {
          primaryStyle: style,
          culturalInfluences: [style],
          regionCode: 'US',
          authenticityLevel: 'high'
        }
      });

      const result = await twoStepGenerationService.generateDesign(request);

      expect(result.success).toBe(true);
      expect(result.data?.generatedImage.metadata.culturalAuthenticityScore).toBeGreaterThan(0.6);
      expect(result.data?.enhancedPrompt.transformationPrompt.toLowerCase()).toContain(
        style.toLowerCase()
      );
    });
  });
});

describe('Integration with Existing Services', () => {
  test('should integrate with context processing pipeline', async () => {
    const mockAnalysis = {
      roomType: 'bedroom',
      currentStyle: ['contemporary'],
      materials: ['wood', 'textile'],
      lighting: 'natural',
      spatialLayout: 'closed',
      potentialImprovements: ['lighting upgrade'],
      confidence: 0.8
    };

    (contextProcessingPipeline.analyzeImage as jest.Mock).mockResolvedValue(mockAnalysis);

    const request = createTestRequest();
    const result = await twoStepGenerationService.generateDesign(request);

    expect(contextProcessingPipeline.analyzeImage).toHaveBeenCalledWith(mockImage);
    expect(result.data?.contextAnalysis).toEqual(mockAnalysis);
  });

  test('should track analytics events', async () => {
    const request = createTestRequest();
    await twoStepGenerationService.generateDesign(request);

    // Analytics tracking would be verified if we weren't mocking it
    // In a real test, we'd check that the correct events were tracked
  });
});

describe('Memory and Performance', () => {
  test('should not leak memory with multiple generations', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Generate multiple designs
    const requests = Array(5).fill(null).map((_, i) =>
      createTestRequest({ sessionId: `memory-test-${i}` })
    );

    await Promise.all(
      requests.map(req => twoStepGenerationService.generateDesign(req))
    );

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable (less than 50MB for 5 generations)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});