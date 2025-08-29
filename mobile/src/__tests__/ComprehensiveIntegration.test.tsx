import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import all integrated components
import { EnhancedAIProcessingScreen } from '../screens/EnhancedAIProcessing/EnhancedAIProcessingScreen';
import { StyleGrid } from '../components/StyleSelection/StyleGrid';
import { AmbianceGrid } from '../components/AmbianceSelection/AmbianceGrid';
import { FurnitureCarousel } from '../components/FurnitureCarousel/FurnitureCarousel';
import { CustomPrompt } from '../components/CustomPrompt/CustomPrompt';

// Import types and services
import { FURNITURE_CATEGORIES } from '../services/furniture/SpaceAnalysisService';

// Mock all necessary services
jest.mock('../services/spaceAnalysis', () => ({
  spaceAnalysisService: {
    analyzeSpace: jest.fn().mockResolvedValue({
      roomType: 'living_room',
      confidence: 0.9,
      spaceCharacteristics: {
        size: 'medium',
        lighting: 'bright',
        style: 'modern',
        colorPalette: ['white', 'gray', 'blue'],
      },
      detectedObjects: ['sofa', 'table', 'window'],
      suggestions: {
        styles: ['modern', 'scandinavian'],
        furniture: ['sectional_sofa', 'coffee_table'],
      },
    }),
    generateEnhancedDesign: jest.fn().mockResolvedValue({
      designId: 'test_design_123',
      enhancedImageUrl: 'https://example.com/enhanced.jpg',
      appliedStyles: ['modern'],
      selectedFurniture: ['sectional_sofa'],
      processingTime: 1500,
    }),
  },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

describe('Comprehensive Enhanced AI Processing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('End-to-End Integration Flow', () => {
    it('successfully completes the entire enhanced AI processing journey', async () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
          projectId: 'project_123',
        },
      };

      const { getByTestId, getByText, queryByText } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Step 1: Wait for space analysis to complete
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText('Select Your Preferred Styles')).toBeTruthy();
      });

      // Step 2: Style Selection
      await act(async () => {
        const modernStyleButton = getByTestId('style-modern');
        fireEvent.press(modernStyleButton);
      });

      await act(async () => {
        const continueButton = getByTestId('continue-to-ambiance-button');
        fireEvent.press(continueButton);
      });

      // Step 3: Ambiance Selection
      await waitFor(() => {
        expect(getByText('Choose Your Ambiance')).toBeTruthy();
      });

      await act(async () => {
        const cozyAmbianceButton = getByTestId('ambiance-cozy');
        fireEvent.press(cozyAmbianceButton);
      });

      // Step 4: Furniture Selection
      await waitFor(() => {
        expect(getByText('Select Seating')).toBeTruthy();
      });

      // Complete furniture selection for all categories
      await act(async () => {
        for (let i = 0; i < FURNITURE_CATEGORIES.length; i++) {
          const likeButton = getByTestId('like-button');
          fireEvent.press(likeButton);
          jest.advanceTimersByTime(500); // Wait for animation
        }
      });

      // Step 5: Custom Prompt (Optional)
      await waitFor(() => {
        expect(getByText('Add Personal Details')).toBeTruthy();
      });

      await act(async () => {
        const promptInput = getByTestId('custom-prompt-input');
        fireEvent.changeText(promptInput, 'Add some plants and natural lighting');
      });

      // Step 6: Generate Design
      await act(async () => {
        const generateButton = getByTestId('generate-design-button');
        fireEvent.press(generateButton);
      });

      // Wait for design generation
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // Verify navigation to results
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          'Results',
          expect.objectContaining({
            designId: 'test_design_123',
            enhancedImageUrl: 'https://example.com/enhanced.jpg',
          })
        );
      });
    });

    it('handles the complete flow with skip options', async () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
        },
      };

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Wait for space analysis
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Skip through style selection with minimal selection
      await waitFor(() => {
        expect(getByText('Select Your Preferred Styles')).toBeTruthy();
      });

      await act(async () => {
        const modernStyleButton = getByTestId('style-modern');
        fireEvent.press(modernStyleButton);
        const continueButton = getByTestId('continue-to-ambiance-button');
        fireEvent.press(continueButton);
      });

      // Quick ambiance selection
      await waitFor(() => {
        expect(getByText('Choose Your Ambiance')).toBeTruthy();
      });

      await act(async () => {
        const cozyAmbianceButton = getByTestId('ambiance-cozy');
        fireEvent.press(cozyAmbianceButton);
      });

      // Skip all furniture categories
      await waitFor(() => {
        expect(getByText('Select Seating')).toBeTruthy();
      });

      await act(async () => {
        for (let i = 0; i < FURNITURE_CATEGORIES.length; i++) {
          const skipButton = getByTestId('skip-button');
          fireEvent.press(skipButton);
          jest.advanceTimersByTime(300);
        }
      });

      // Skip custom prompt
      await waitFor(() => {
        expect(getByText('Skip & Generate')).toBeTruthy();
      });

      await act(async () => {
        const skipPromptButton = getByTestId('skip-prompt-button');
        fireEvent.press(skipPromptButton);
      });

      // Verify generation still works
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('results', expect.any(Object));
    });
  });

  describe('Component Integration', () => {
    it('integrates StyleGrid with space analysis recommendations', async () => {
      const mockStyles = [
        {
          id: 'modern',
          name: 'Modern',
          description: 'Clean and minimalist',
          imageUrl: 'https://example.com/modern.jpg',
          popularity: 0.8,
        },
        {
          id: 'scandinavian',
          name: 'Scandinavian',
          description: 'Light and cozy',
          imageUrl: 'https://example.com/scandinavian.jpg',
          popularity: 0.7,
        },
      ];

      const mockOnStyleToggle = jest.fn();

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <StyleGrid
            styles={mockStyles}
            selectedStyles={['modern']}
            onStyleToggle={mockOnStyleToggle}
            multiSelect={true}
            testID="style-grid"
          />
        </TestWrapper>
      );

      expect(getByText('Modern')).toBeTruthy();
      expect(getByText('Scandinavian')).toBeTruthy();

      await act(async () => {
        const scandinavianButton = getByTestId('style-scandinavian');
        fireEvent.press(scandinavianButton);
      });

      expect(mockOnStyleToggle).toHaveBeenCalledWith('scandinavian');
    });

    it('integrates AmbianceGrid with style selections', async () => {
      const mockAmbiances = [
        {
          id: 'cozy',
          name: 'Cozy',
          description: 'Warm and inviting',
          imageUrl: 'https://example.com/cozy.jpg',
        },
        {
          id: 'energetic',
          name: 'Energetic',
          description: 'Vibrant and stimulating',
          imageUrl: 'https://example.com/energetic.jpg',
        },
      ];

      const mockOnAmbianceSelect = jest.fn();

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <AmbianceGrid
            ambiances={mockAmbiances}
            selectedAmbiance="cozy"
            onAmbianceSelect={mockOnAmbianceSelect}
            testID="ambiance-grid"
          />
        </TestWrapper>
      );

      expect(getByText('Cozy')).toBeTruthy();
      expect(getByText('Energetic')).toBeTruthy();

      await act(async () => {
        const energeticButton = getByTestId('ambiance-energetic');
        fireEvent.press(energeticButton);
      });

      expect(mockOnAmbianceSelect).toHaveBeenCalledWith('energetic');
    });

    it('integrates FurnitureCarousel with style and ambiance context', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES.slice(0, 2),
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <FurnitureCarousel {...mockProps} />
        </TestWrapper>
      );

      expect(getByText('Seating')).toBeTruthy();

      // Test furniture selection
      await act(async () => {
        const likeButton = getByTestId('like-button');
        fireEvent.press(likeButton);
      });

      expect(mockProps.onStyleSelect).toHaveBeenCalled();
    });

    it('integrates CustomPrompt with space context', async () => {
      const mockContext = {
        roomType: 'living_room' as const,
        spaceCharacteristics: {
          size: 'medium' as const,
          lighting: 'bright' as const,
        },
        detectedObjects: ['sofa', 'table'],
      };

      const mockOnPromptSubmit = jest.fn();

      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <CustomPrompt
            context={mockContext}
            onTextChange={() => {}}
            onPromptSubmit={mockOnPromptSubmit}
            onSuggestionSelect={() => {}}
            isExpanded={true}
          />
        </TestWrapper>
      );

      const promptInput = getByPlaceholderText(/Describe your ideal furniture/);
      
      await act(async () => {
        fireEvent.changeText(promptInput, 'I want modern furniture with clean lines');
      });

      await act(async () => {
        const submitButton = getByTestId('submit-button');
        fireEvent.press(submitButton);
      });

      expect(mockOnPromptSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'I want modern furniture with clean lines',
          context: mockContext,
        })
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('handles space analysis failure gracefully', async () => {
      // Mock service failure
      const mockSpaceAnalysisError = {
        analyzeSpace: jest.fn().mockRejectedValue(new Error('Network timeout')),
        generateEnhancedDesign: jest.fn(),
      };

      jest.doMock('../services/spaceAnalysis', () => ({
        spaceAnalysisService: mockSpaceAnalysisError,
      }));

      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
        },
      };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText(/Failed to analyze space/)).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('handles design generation failure with recovery options', async () => {
      const mockServices = {
        analyzeSpace: jest.fn().mockResolvedValue({
          roomType: 'living_room',
          confidence: 0.9,
          spaceCharacteristics: {},
          detectedObjects: [],
          suggestions: { styles: ['modern'] },
        }),
        generateEnhancedDesign: jest.fn().mockRejectedValue(new Error('Processing failed')),
      };

      jest.doMock('../services/spaceAnalysis', () => ({
        spaceAnalysisService: mockServices,
      }));

      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
        },
      };

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Go through the flow quickly to reach generation
      await act(async () => {
        jest.advanceTimersByTime(2000); // Space analysis

        const continueButton = getByTestId('continue-to-ambiance-button');
        fireEvent.press(continueButton);

        const cozyButton = getByTestId('ambiance-cozy');
        fireEvent.press(cozyButton);

        // Skip furniture
        for (let i = 0; i < FURNITURE_CATEGORIES.length; i++) {
          const skipButton = getByTestId('skip-button');
          fireEvent.press(skipButton);
          jest.advanceTimersByTime(100);
        }

        const generateButton = getByTestId('generate-design-button');
        fireEvent.press(generateButton);

        jest.advanceTimersByTime(3000); // Generation failure
      });

      await waitFor(() => {
        expect(getByText(/Failed to generate design/)).toBeTruthy();
      });
    });
  });

  describe('Performance Integration', () => {
    it('maintains performance throughout the entire flow', async () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
        },
      };

      const startTime = performance.now();
      let frameCount = 0;

      // Mock requestAnimationFrame to count frames
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn((callback) => {
        frameCount++;
        return originalRAF(callback);
      });

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Rapidly go through the entire flow
      await act(async () => {
        jest.advanceTimersByTime(2000); // Space analysis

        // Style selection
        const modernButton = getByTestId('style-modern');
        fireEvent.press(modernButton);
        const continueButton = getByTestId('continue-to-ambiance-button');
        fireEvent.press(continueButton);

        // Ambiance selection
        const cozyButton = getByTestId('ambiance-cozy');
        fireEvent.press(cozyButton);

        // Furniture selection (rapid)
        for (let i = 0; i < FURNITURE_CATEGORIES.length; i++) {
          const likeButton = getByTestId('like-button');
          fireEvent.press(likeButton);
          jest.advanceTimersByTime(16); // 60 FPS timing
        }

        // Generate
        const generateButton = getByTestId('generate-design-button');
        fireEvent.press(generateButton);

        jest.advanceTimersByTime(1500); // Generation
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageFPS = (frameCount / totalTime) * 1000;

      // Should maintain reasonable performance throughout
      expect(averageFPS).toBeGreaterThan(30); // At least 30 FPS average
      expect(totalTime).toBeLessThan(10000); // Complete flow in under 10 seconds

      global.requestAnimationFrame = originalRAF;
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility throughout the entire flow', async () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-room.jpg',
        },
      };

      const { getByLabelText, getByA11yRole } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Wait for space analysis
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Check accessibility labels are present throughout the flow
      expect(getByLabelText('Select modern style')).toBeTruthy();
      expect(getByA11yRole('button')).toBeTruthy();

      // Navigate through flow and verify accessibility is maintained
      await act(async () => {
        const modernButton = getByLabelText('Select modern style');
        fireEvent.press(modernButton);
      });

      // Verify continue button is accessible
      expect(getByLabelText('Continue to ambiance selection')).toBeTruthy();
    });
  });
});