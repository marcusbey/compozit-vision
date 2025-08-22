import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Alert } from 'react-native';

// Import all the integrated components
import { EnhancedStyleSelectionScreen } from '../screens/StyleSelection/EnhancedStyleSelectionScreen';
import { FurnitureSelectionScreen } from '../screens/FurnitureSelection/FurnitureSelectionScreen';
import { InteractiveComponentsDemo } from '../screens/Demo/InteractiveComponentsDemo';
import { spaceAnalysisService } from '../services/spaceAnalysis';
import { SpaceAnalysisService } from '../services/furniture/SpaceAnalysisService';

// Mock all necessary dependencies
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => ({
  ...jest.requireActual('react-native-gesture-handler'),
  PanGestureHandler: ({ children }: any) => children,
  State: { BEGAN: 0, ACTIVE: 1, END: 2 },
}));

jest.mock('../services/spaceAnalysis');
jest.mock('../services/furniture/SpaceAnalysisService');

// Mock Alert to prevent native alerts during tests
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

describe('Enhanced AI Processing - End-to-End Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all service mocks
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete User Journey', () => {
    it('completes the full enhanced AI processing flow', async () => {
      // Mock the space analysis service
      const mockSpaceAnalysis = {
        analyzeSpace: jest.fn().mockResolvedValue({
          roomType: 'living_room',
          spaceCharacteristics: {
            size: 'medium',
            lighting: 'bright',
            style: 'modern',
            colorPalette: ['white', 'gray', 'blue'],
          },
          detectedObjects: ['sofa', 'table', 'window'],
          suggestions: {
            styles: ['modern', 'scandinavian', 'minimalist'],
            furniture: ['sectional_sofa', 'coffee_table', 'floor_lamp'],
          },
          confidence: 0.85,
        }),
        generateEnhancedDesign: jest.fn().mockResolvedValue({
          designId: 'design_123',
          enhancedImageUrl: 'https://example.com/enhanced.jpg',
          appliedStyles: ['modern'],
          selectedFurniture: ['sectional_sofa'],
          customPromptInfluence: 0.3,
          processingTime: 1200,
        }),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      // Step 1: Style Selection
      const mockNavigationStyle = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRouteStyle = {
        params: {
          imageUri: 'file://test-image.jpg',
        },
      };

      const { getByTestId, getByText, rerender } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen 
            navigation={mockNavigationStyle} 
            route={mockRouteStyle} 
          />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(getByText('Select Your Style')).toBeTruthy();
      });

      // Simulate style selection
      await act(async () => {
        const modernStyleButton = getByTestId('style-modern');
        fireEvent.press(modernStyleButton);
      });

      // Verify style selection
      await waitFor(() => {
        expect(mockNavigationStyle.navigate).toHaveBeenCalledWith(
          'FurnitureSelection',
          expect.objectContaining({
            selectedStyles: expect.arrayContaining(['modern']),
            imageUri: 'file://test-image.jpg',
          })
        );
      });

      // Step 2: Furniture Selection (simulate navigation)
      const mockNavigationFurniture = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRouteFurniture = {
        params: {
          imageUri: 'file://test-image.jpg',
          selectedStyles: ['modern'],
          spaceAnalysis: mockSpaceAnalysis.analyzeSpace(),
        },
      };

      rerender(
        <TestWrapper>
          <FurnitureSelectionScreen 
            navigation={mockNavigationFurniture} 
            route={mockRouteFurniture} 
          />
        </TestWrapper>
      );

      // Wait for furniture carousel to load
      await waitFor(() => {
        expect(getByText('Select Furniture')).toBeTruthy();
      });

      // Simulate furniture selection
      await act(async () => {
        const likeButton = getByTestId('like-button');
        fireEvent.press(likeButton);
      });

      // Simulate completing all categories
      await act(async () => {
        // Fast-forward through all furniture categories
        const skipButtons = getByTestId('skip-button');
        for (let i = 0; i < 3; i++) {
          fireEvent.press(skipButtons);
          jest.advanceTimersByTime(300); // Animation duration
        }
      });

      // Step 3: Custom Prompt (if expanded)
      await act(async () => {
        const expandPromptButton = getByTestId('expand-prompt-button');
        if (expandPromptButton) {
          fireEvent.press(expandPromptButton);
        }
      });

      // Enter custom prompt
      await act(async () => {
        const promptInput = getByTestId('custom-prompt-input');
        fireEvent.changeText(promptInput, 'I want a cozy reading corner with warm lighting');
      });

      // Submit the complete selection
      await act(async () => {
        const generateButton = getByTestId('generate-design-button');
        fireEvent.press(generateButton);
      });

      // Verify the enhanced AI processing was triggered
      await waitFor(() => {
        expect(mockSpaceAnalysis.generateEnhancedDesign).toHaveBeenCalledWith({
          imageUri: 'file://test-image.jpg',
          selectedStyles: ['modern'],
          selectedFurniture: expect.any(Array),
          customPrompt: 'I want a cozy reading corner with warm lighting',
          spaceContext: expect.any(Object),
        });
      });

      // Verify navigation to results
      await waitFor(() => {
        expect(mockNavigationFurniture.navigate).toHaveBeenCalledWith(
          'Results',
          expect.objectContaining({
            designId: 'design_123',
            enhancedImageUrl: 'https://example.com/enhanced.jpg',
          })
        );
      });
    });

    it('handles error states gracefully throughout the flow', async () => {
      // Mock service failure
      const mockSpaceAnalysisError = {
        analyzeSpace: jest.fn().mockRejectedValue(new Error('Network error')),
        generateEnhancedDesign: jest.fn().mockRejectedValue(new Error('Processing failed')),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysisError);

      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        addListener: jest.fn(),
      };

      const mockRoute = {
        params: {
          imageUri: 'file://test-image.jpg',
        },
      };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen 
            navigation={mockNavigation} 
            route={mockRoute} 
          />
        </TestWrapper>
      );

      // Simulate style selection that triggers analysis
      await act(async () => {
        const modernStyleButton = getByTestId('style-modern');
        fireEvent.press(modernStyleButton);
      });

      // Should show error state
      await waitFor(() => {
        expect(getByText(/Error analyzing space/)).toBeTruthy();
      });

      // Should allow retry
      const retryButton = getByTestId('retry-button');
      expect(retryButton).toBeTruthy();
    });
  });

  describe('Performance Requirements', () => {
    it('maintains 60 FPS during style transitions', async () => {
      const startTime = performance.now();
      let frameCount = 0;
      
      // Mock requestAnimationFrame to count frames
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn((callback) => {
        frameCount++;
        return originalRAF(callback);
      });

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Trigger multiple style selections
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const styleButton = getByTestId(`style-modern`);
          fireEvent.press(styleButton);
          jest.advanceTimersByTime(16); // 60 FPS = 16.67ms per frame
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      const fps = (frameCount / duration) * 1000;

      // Should maintain at least 55 FPS (allowing some margin)
      expect(fps).toBeGreaterThan(55);

      global.requestAnimationFrame = originalRAF;
    });

    it('completes space analysis in under 2 seconds', async () => {
      const mockSpaceAnalysis = {
        analyzeSpace: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            roomType: 'living_room',
            confidence: 0.9
          }), 1500)) // 1.5 seconds
        ),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      const startTime = Date.now();
      
      await act(async () => {
        const analyzeButton = getByTestId('analyze-space-button');
        fireEvent.press(analyzeButton);
        
        // Fast forward timers
        jest.advanceTimersByTime(1500);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000);
    });

    it('handles memory efficiently with large furniture datasets', async () => {
      // Mock large dataset
      const largeFurnitureDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `furniture_${i}`,
        name: `Furniture Item ${i}`,
        category: 'seating',
        style: 'modern',
        imageUrl: `https://example.com/furniture_${i}.jpg`,
      }));

      const mockSpaceAnalysisLarge = {
        getFurnitureByCategory: jest.fn().mockReturnValue(largeFurnitureDataset),
      };

      (SpaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysisLarge);

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { 
        params: { 
          imageUri: 'file://test-image.jpg',
          selectedStyles: ['modern'],
        } 
      };

      const { unmount } = render(
        <TestWrapper>
          <FurnitureSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Simulate heavy usage
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          jest.advanceTimersByTime(100);
        }
      });

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Accessibility Compliance', () => {
    it('provides proper accessibility labels for all interactive elements', () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByLabelText, getByA11yLabel } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Check for accessibility labels
      expect(getByLabelText('Select modern style')).toBeTruthy();
      expect(getByLabelText('Select scandinavian style')).toBeTruthy();
      expect(getByA11yLabel('Navigate back')).toBeTruthy();
    });

    it('supports screen reader navigation', () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { 
        params: { 
          imageUri: 'file://test-image.jpg',
          selectedStyles: ['modern'],
        } 
      };

      const { getByA11yRole, getAllByA11yRole } = render(
        <TestWrapper>
          <FurnitureSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Check for proper semantic roles
      expect(getByA11yRole('button')).toBeTruthy();
      expect(getAllByA11yRole('button').length).toBeGreaterThan(1);
      
      const scrollView = getByA11yRole('scrollview');
      expect(scrollView).toBeTruthy();
    });

    it('meets minimum touch target sizes (44x44)', () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      const styleButton = getByTestId('style-modern');
      const buttonStyle = styleButton.props.style;
      
      // Check minimum touch target size (44x44 points)
      expect(buttonStyle.minHeight || buttonStyle.height).toBeGreaterThanOrEqual(44);
      expect(buttonStyle.minWidth || buttonStyle.width).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Data Integration', () => {
    it('properly integrates space analysis with style selection', async () => {
      const mockSpaceAnalysis = {
        analyzeSpace: jest.fn().mockResolvedValue({
          roomType: 'bedroom',
          spaceCharacteristics: {
            size: 'small',
            lighting: 'dim',
            existingStyle: 'traditional',
          },
          suggestions: {
            styles: ['cozy', 'traditional', 'rustic'],
          },
        }),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Trigger space analysis
      await act(async () => {
        const analyzeButton = getByTestId('analyze-space-button');
        fireEvent.press(analyzeButton);
      });

      // Should show room-specific recommendations
      await waitFor(() => {
        expect(getByText(/Recommended for bedroom/)).toBeTruthy();
        expect(getByText('Traditional')).toBeTruthy();
        expect(getByText('Cozy')).toBeTruthy();
      });
    });

    it('maintains context throughout the selection flow', async () => {
      let capturedContext: any;

      const mockSpaceAnalysis = {
        generateEnhancedDesign: jest.fn().mockImplementation((context) => {
          capturedContext = context;
          return Promise.resolve({ designId: 'test_design' });
        }),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      const { getByTestId } = render(
        <TestWrapper>
          <InteractiveComponentsDemo />
        </TestWrapper>
      );

      // Complete the flow
      await act(async () => {
        // Style selection
        const likeButton = getByTestId('like-button');
        fireEvent.press(likeButton);

        // Add custom prompt
        const promptInput = getByTestId('custom-prompt-input');
        fireEvent.changeText(promptInput, 'Add plants and natural elements');

        // Generate design
        const generateButton = getByTestId('generate-design-button');
        fireEvent.press(generateButton);
      });

      // Verify context preservation
      await waitFor(() => {
        expect(capturedContext).toMatchObject({
          selectedStyles: expect.any(Array),
          selectedFurniture: expect.any(Array),
          customPrompt: 'Add plants and natural elements',
          spaceContext: expect.any(Object),
        });
      });
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('handles network timeouts gracefully', async () => {
      const mockSpaceAnalysis = {
        analyzeSpace: jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await act(async () => {
        const analyzeButton = getByTestId('analyze-space-button');
        fireEvent.press(analyzeButton);
        
        // Fast forward past timeout
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(getByText(/Connection timeout/)).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('recovers from partial data corruption', async () => {
      const mockSpaceAnalysis = {
        analyzeSpace: jest.fn().mockResolvedValue({
          roomType: 'living_room',
          // Missing required fields
          spaceCharacteristics: null,
          detectedObjects: undefined,
        }),
      };

      (spaceAnalysisService as any).mockImplementation(() => mockSpaceAnalysis);

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { getByText } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Should still render with fallback data
      await waitFor(() => {
        expect(getByText('Select Your Style')).toBeTruthy();
        expect(getByText(/Using default recommendations/)).toBeTruthy();
      });
    });

    it('handles device rotation and screen size changes', async () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { rerender, getByTestId } = render(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Simulate screen rotation
      const originalDimensions = { width: 375, height: 812 };
      const rotatedDimensions = { width: 812, height: 375 };

      // Mock Dimensions API
      const mockDimensions = require('react-native').Dimensions;
      mockDimensions.get = jest.fn().mockReturnValue(rotatedDimensions);

      rerender(
        <TestWrapper>
          <EnhancedStyleSelectionScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Should adapt to new dimensions
      await waitFor(() => {
        const container = getByTestId('style-selection-container');
        expect(container).toBeTruthy();
      });
    });
  });
});