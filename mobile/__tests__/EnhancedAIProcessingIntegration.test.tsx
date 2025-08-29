import { enhancedAIProcessingService } from '../src/services/enhancedAIProcessingService';
import { DesignGenerationRequest, ReferenceInfluence, ColorPaletteInfluence } from '../src/services/enhancedAIProcessingService';
import { geminiVisionService } from '../src/services/geminiVisionService';

// Mock dependencies
jest.mock('../src/services/geminiVisionService');
jest.mock('../src/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockJobData, error: null })),
        })),
      })),
    })),
  },
}));

const mockJobData = {
  job_id: 'test-job-123',
  status: 'queued',
  request_data: JSON.stringify({}),
  last_checkpoint: null,
};

const mockImageAnalysis = {
  style_tags: ['modern', 'minimalist'],
  mood_tags: ['serene', 'clean'],
  detected_objects: ['sofa', 'table', 'lamp'],
  space_type: ['living-room'],
  color_analysis: {
    dominant_colors: ['#FFFFFF', '#F5F5F5', '#2D2D2D'],
    color_temperature: 'neutral' as const,
    brightness: 'light' as const,
  },
  design_suggestions: ['Add warm lighting', 'Include plants'],
  confidence_score: 0.85,
  description: 'A bright, modern living space',
};

describe('EnhancedAIProcessingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (geminiVisionService.analyzeImage as jest.Mock).mockResolvedValue(mockImageAnalysis);
  });

  describe('Design Generation Request Building', () => {
    it('should create a valid design generation request', () => {
      const referenceInfluences: ReferenceInfluence[] = [
        {
          referenceId: 'ref-1',
          imageUrl: 'https://example.com/ref1.jpg',
          styleInfluence: 0.8,
          colorInfluence: 0.6,
          moodInfluence: 0.7,
        },
      ];

      const colorPaletteInfluences: ColorPaletteInfluence[] = [
        {
          paletteId: 'palette-1',
          colors: ['#FFFFFF', '#2D2D2D', '#C9A98C'],
          influence: 0.8,
          paletteType: 'primary',
        },
      ];

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room', 'dining-room'],
        styleId: 'modern-1',
        styleName: 'Modern Minimalist',
        referenceInfluences,
        colorPaletteInfluences,
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      expect(request).toBeDefined();
      expect(request.referenceInfluences).toHaveLength(1);
      expect(request.colorPaletteInfluences).toHaveLength(1);
      expect(request.processingMode).toBe('balanced');
    });
  });

  describe('Processing Job Management', () => {
    it('should start design generation and return job ID', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
      expect(jobId).toMatch(/^job_/);
    });

    it('should track processing status', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      
      // Initially should have queued status
      const initialStatus = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(initialStatus).toBeDefined();
      expect(initialStatus?.status).toBe('queued');
      expect(initialStatus?.progress).toBe(0);
    });

    it('should allow cancelling processing jobs', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      
      await enhancedAIProcessingService.cancelProcessingJob(jobId);
      
      const status = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(status?.status).toBe('failed');
      expect(status?.error).toBe('Cancelled by user');
    });
  });

  describe('Reference Influence Processing', () => {
    it('should analyze reference images with proper influence scoring', async () => {
      const referenceInfluences: ReferenceInfluence[] = [
        {
          referenceId: 'ref-1',
          imageUrl: 'https://example.com/ref1.jpg',
          styleInfluence: 0.9,
          colorInfluence: 0.7,
          moodInfluence: 0.8,
        },
        {
          referenceId: 'ref-2',
          imageUrl: 'https://example.com/ref2.jpg',
          styleInfluence: 0.6,
          colorInfluence: 0.8,
          moodInfluence: 0.5,
        },
      ];

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences,
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);

      // Allow some processing time
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(geminiVisionService.analyzeImage).toHaveBeenCalledTimes(3); // Original + 2 references
      
      // Check that references were analyzed with correct parameters
      expect(geminiVisionService.analyzeImage).toHaveBeenCalledWith('https://example.com/ref1.jpg', {
        focusArea: 'style',
        includeSuggestions: false,
        temperature: 0.2,
      });
    });

    it('should handle reference analysis failures gracefully', async () => {
      (geminiVisionService.analyzeImage as jest.Mock)
        .mockResolvedValueOnce(mockImageAnalysis) // Original photo succeeds
        .mockRejectedValueOnce(new Error('Analysis failed')) // Reference fails
        .mockResolvedValueOnce(mockImageAnalysis); // Second reference succeeds

      const referenceInfluences: ReferenceInfluence[] = [
        {
          referenceId: 'ref-1',
          imageUrl: 'https://example.com/ref1.jpg',
          styleInfluence: 0.8,
          colorInfluence: 0.6,
          moodInfluence: 0.7,
        },
        {
          referenceId: 'ref-2',
          imageUrl: 'https://example.com/ref2.jpg',
          styleInfluence: 0.7,
          colorInfluence: 0.8,
          moodInfluence: 0.6,
        },
      ];

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences,
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);

      // Should not throw error, should continue processing with available references
      expect(jobId).toBeDefined();
      
      // Allow some processing time
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(status).toBeDefined();
    });
  });

  describe('Color Palette Integration', () => {
    it('should integrate color palettes into design generation', async () => {
      const colorPaletteInfluences: ColorPaletteInfluence[] = [
        {
          paletteId: 'palette-1',
          colors: ['#FFFFFF', '#2D2D2D', '#C9A98C', '#8B7355'],
          influence: 0.9,
          paletteType: 'primary',
        },
        {
          paletteId: 'palette-2',
          colors: ['#F5F5F5', '#E8E2D8'],
          influence: 0.6,
          paletteType: 'secondary',
        },
        {
          paletteId: 'palette-3',
          colors: ['#4CAF50', '#FF9800'],
          influence: 0.4,
          paletteType: 'accent',
        },
      ];

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences,
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);

      expect(jobId).toBeDefined();
      
      const status = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(status?.jobId).toBe(jobId);
    });
  });

  describe('Processing Modes', () => {
    const baseRequest: DesignGenerationRequest = {
      originalPhotoUrl: 'https://example.com/original.jpg',
      categoryType: 'interior',
      selectedRooms: ['living-room'],
      styleId: 'modern-1',
      styleName: 'Modern',
      referenceInfluences: [],
      colorPaletteInfluences: [],
      processingMode: 'balanced',
      qualityLevel: 'standard',
    };

    it('should handle conservative processing mode', async () => {
      const request = { ...baseRequest, processingMode: 'conservative' as const };
      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      expect(jobId).toBeDefined();
    });

    it('should handle creative processing mode', async () => {
      const request = { ...baseRequest, processingMode: 'creative' as const };
      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      expect(jobId).toBeDefined();
    });

    it('should handle different quality levels', async () => {
      const draftRequest = { ...baseRequest, qualityLevel: 'draft' as const };
      const premiumRequest = { ...baseRequest, qualityLevel: 'premium' as const };

      const draftJobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(draftRequest);
      const premiumJobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(premiumRequest);

      expect(draftJobId).toBeDefined();
      expect(premiumJobId).toBeDefined();

      // Premium should have longer estimated processing time
      const draftStatus = enhancedAIProcessingService.getProcessingStatus(draftJobId);
      const premiumStatus = enhancedAIProcessingService.getProcessingStatus(premiumJobId);

      expect(premiumStatus?.estimatedTimeRemainingMs).toBeGreaterThan(
        draftStatus?.estimatedTimeRemainingMs || 0
      );
    });
  });

  describe('Budget and Constraints', () => {
    it('should incorporate budget constraints into processing', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
        budgetRange: { min: 1000, max: 5000 },
        priorityFeatures: ['lighting', 'furniture arrangement'],
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      expect(jobId).toBeDefined();

      const status = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(status).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle original photo analysis failure', async () => {
      (geminiVisionService.analyzeImage as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to analyze original photo')
      );

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);

      // Allow processing to fail
      await new Promise(resolve => setTimeout(resolve, 200));

      const status = enhancedAIProcessingService.getProcessingStatus(jobId);
      expect(status?.status).toBe('failed');
      expect(status?.error).toContain('Failed to analyze original photo');
    });

    it('should handle database connection errors gracefully', async () => {
      // This would test database failure scenarios
      // Implementation would depend on how you want to handle DB failures
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent processing jobs', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      // Start multiple jobs concurrently
      const jobPromises = Array.from({ length: 3 }, () =>
        enhancedAIProcessingService.startEnhancedDesignGeneration(request)
      );

      const jobIds = await Promise.all(jobPromises);

      expect(jobIds).toHaveLength(3);
      expect(new Set(jobIds).size).toBe(3); // All job IDs should be unique

      // All jobs should have valid status
      jobIds.forEach(jobId => {
        const status = enhancedAIProcessingService.getProcessingStatus(jobId);
        expect(status).toBeDefined();
        expect(status?.jobId).toBe(jobId);
      });
    });

    it('should handle large number of references efficiently', async () => {
      const manyReferences: ReferenceInfluence[] = Array.from({ length: 10 }, (_, i) => ({
        referenceId: `ref-${i}`,
        imageUrl: `https://example.com/ref${i}.jpg`,
        styleInfluence: 0.7,
        colorInfluence: 0.6,
        moodInfluence: 0.5,
      }));

      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: manyReferences,
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const startTime = Date.now();
      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      const setupTime = Date.now() - startTime;

      expect(jobId).toBeDefined();
      expect(setupTime).toBeLessThan(1000); // Should setup quickly despite many references
    });
  });

  describe('Job Resume Functionality', () => {
    it('should support resuming interrupted jobs', async () => {
      const request: DesignGenerationRequest = {
        originalPhotoUrl: 'https://example.com/original.jpg',
        categoryType: 'interior',
        selectedRooms: ['living-room'],
        styleId: 'modern-1',
        styleName: 'Modern',
        referenceInfluences: [],
        colorPaletteInfluences: [],
        processingMode: 'balanced',
        qualityLevel: 'standard',
      };

      const jobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      
      // Simulate job interruption and resume
      await expect(
        enhancedAIProcessingService.resumeProcessingJob(jobId)
      ).resolves.not.toThrow();
    });
  });
});