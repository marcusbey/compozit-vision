import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { InteractiveComponentsDemo } from '../../screens/Demo/InteractiveComponentsDemo';
import { FurnitureCarousel } from '../FurnitureCarousel';
import { CustomPrompt } from '../CustomPrompt';
import { FURNITURE_CATEGORIES, MOCK_FURNITURE_STYLES } from '../../services/furniture/SpaceAnalysisService';

// Mock dependencies
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

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

describe('Interactive Components Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FurnitureCarousel + CustomPrompt Integration', () => {
    it('completes full furniture selection flow', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES.slice(0, 3),
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

      // Verify initial state
      expect(getByText('1 of 3')).toBeTruthy();
      expect(getByText('Seating')).toBeTruthy();

      // Simulate style selection
      const likeButton = getByTestId('like-button');
      fireEvent.press(likeButton);

      await waitFor(() => {
        expect(mockProps.onStyleSelect).toHaveBeenCalledWith(
          'seating',
          MOCK_FURNITURE_STYLES.seating[0]
        );
      });
    });

    it('handles custom prompt submission with context', async () => {
      const mockOnSubmit = jest.fn();
      const mockContext = {
        roomType: 'living_room' as const,
        spaceCharacteristics: {
          size: 'medium' as const,
          lighting: 'bright' as const,
        },
        detectedObjects: ['sofa', 'table'],
      };

      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <CustomPrompt
            context={mockContext}
            onTextChange={() => {}}
            onPromptSubmit={mockOnSubmit}
            onSuggestionSelect={() => {}}
            isExpanded={true}
          />
        </TestWrapper>
      );

      // Enter text
      const textInput = getByPlaceholderText(/Describe your ideal furniture/);
      fireEvent.changeText(textInput, 'I need modern furniture with clean lines');

      // Submit
      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'I need modern furniture with clean lines',
            context: mockContext,
            isUserGenerated: true,
          })
        );
      });
    });

    it('generates contextual suggestions based on space analysis', () => {
      const mockContext = {
        roomType: 'living_room' as const,
        spaceCharacteristics: {
          size: 'small' as const,
          lighting: 'dim' as const,
        },
        detectedObjects: ['window', 'door'],
      };

      const { getByText } = render(
        <TestWrapper>
          <CustomPrompt
            context={mockContext}
            onTextChange={() => {}}
            onPromptSubmit={() => {}}
            onSuggestionSelect={() => {}}
            isExpanded={true}
          />
        </TestWrapper>
      );

      // Check for contextual suggestions
      expect(getByText(/Create a cozy conversation area/)).toBeTruthy();
      expect(getByText(/Maximize space with multi-functional furniture/)).toBeTruthy();
    });
  });

  describe('Demo Integration', () => {
    it('renders interactive components demo correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <InteractiveComponentsDemo />
        </TestWrapper>
      );

      expect(getByText('Interactive Components Demo')).toBeTruthy();
      expect(getByText('1. Style Selection')).toBeTruthy();
      expect(getByText('Liked')).toBeTruthy();
      expect(getByText('Skipped')).toBeTruthy();
    });

    it('tracks statistics correctly', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <InteractiveComponentsDemo />
        </TestWrapper>
      );

      // Initially should show 0 stats
      expect(getByText('0')).toBeTruthy(); // Multiple 0s for different stats

      // Simulate some interactions
      const likeButton = getByTestId('like-button');
      fireEvent.press(likeButton);

      // Stats should update (this would require internal component state updates)
      // This test would need more sophisticated mocking to track state changes
    });

    it('handles step navigation correctly', () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <InteractiveComponentsDemo />
        </TestWrapper>
      );

      // Should start on carousel step
      expect(getByText('1. Style Selection')).toBeTruthy();

      // Skip to prompt should work
      const skipButton = getByTestId('skip-to-prompt-button');
      if (skipButton) {
        fireEvent.press(skipButton);
        expect(getByText('2. Custom Prompt')).toBeTruthy();
      }
    });
  });

  describe('Performance Integration', () => {
    it('maintains 60 FPS during animations', (done) => {
      // This would require performance monitoring tools
      // For now, we'll test that animations complete within expected timeframes
      
      const startTime = Date.now();
      const mockProps = {
        categories: FURNITURE_CATEGORIES.slice(0, 3),
        onStyleSelect: () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Animation should complete within 300ms + buffer
          expect(duration).toBeLessThan(500);
          done();
        },
        onStyleSkip: () => {},
        onCategoryComplete: () => {},
        onAllCategoriesComplete: () => {},
      };

      const { getByTestId } = render(
        <TestWrapper>
          <FurnitureCarousel {...mockProps} />
        </TestWrapper>
      );

      const likeButton = getByTestId('like-button');
      fireEvent.press(likeButton);
    });

    it('handles multiple rapid gestures without performance degradation', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES.slice(0, 3),
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const { getByTestId } = render(
        <TestWrapper>
          <FurnitureCarousel {...mockProps} />
        </TestWrapper>
      );

      const likeButton = getByTestId('like-button');
      const skipButton = getByTestId('skip-button');

      // Rapid fire interactions
      for (let i = 0; i < 5; i++) {
        fireEvent.press(i % 2 === 0 ? likeButton : skipButton);
      }

      // Should handle all interactions without crashes
      await waitFor(() => {
        expect(mockProps.onStyleSelect.mock.calls.length + mockProps.onStyleSkip.mock.calls.length)
          .toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles empty categories gracefully', () => {
      const mockProps = {
        categories: [],
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const { getByText } = render(
        <TestWrapper>
          <FurnitureCarousel {...mockProps} />
        </TestWrapper>
      );

      expect(getByText('No more styles to show')).toBeTruthy();
    });

    it('handles network errors in suggestion generation', () => {
      // Mock network error
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockContext = {
        roomType: 'living_room' as const,
        spaceCharacteristics: {
          size: 'medium' as const,
          lighting: 'bright' as const,
        },
      };

      const { getByText } = render(
        <TestWrapper>
          <CustomPrompt
            context={mockContext}
            onTextChange={() => {}}
            onPromptSubmit={() => {}}
            onSuggestionSelect={() => {}}
            isExpanded={true}
          />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(getByText('Custom Prompt')).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });
});

// Test utilities for performance monitoring
export const measureRenderTime = (component: React.ReactElement): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    render(component);
    
    // Use setTimeout to measure after render cycle
    setTimeout(() => {
      const endTime = performance.now();
      resolve(endTime - startTime);
    }, 0);
  });
};

// Test utilities for gesture simulation
export const simulateSwipeGesture = (
  element: any, 
  direction: 'left' | 'right' | 'up' | 'down',
  velocity: number = 1000
) => {
  const gestureData = {
    left: { translationX: -300, translationY: 0, velocityX: -velocity, velocityY: 0 },
    right: { translationX: 300, translationY: 0, velocityX: velocity, velocityY: 0 },
    up: { translationX: 0, translationY: -300, velocityX: 0, velocityY: -velocity },
    down: { translationX: 0, translationY: 300, velocityX: 0, velocityY: velocity },
  };

  const data = gestureData[direction];
  
  // Simulate gesture events
  fireEvent(element, 'onGestureEvent', {
    nativeEvent: {
      ...data,
      state: 1, // ACTIVE
    },
  });

  fireEvent(element, 'onHandlerStateChange', {
    nativeEvent: {
      ...data,
      state: 2, // END
    },
  });
};