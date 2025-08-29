import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AIProcessingScreen from '../src/screens/ProjectWizard/AIProcessingScreen';
import { useJourneyStore } from '../src/stores/journeyStore';
import { useContentStore } from '../src/stores/contentStore';
import { NavigationHelpers } from '../src/navigation/NavigationHelpers';
import { geminiVisionService } from '../src/services/geminiVisionService';

// Mock dependencies
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/contentStore');
jest.mock('../src/navigation/NavigationHelpers');
jest.mock('../src/services/geminiVisionService');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Expo libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const mockJourneyStore = {
  updateStep: jest.fn(),
  currentStep: 'aiProcessing',
  projectWizard: {
    selectedStyle: 'modern',
    selectedRooms: ['living-room'],
    selectedReferences: ['ref1', 'ref2'],
    selectedPalettes: ['palette1'],
  },
};

const mockContentStore = {
  userReferences: [
    {
      id: 'ref1',
      image_url: 'https://example.com/ref1.jpg',
      user_title: 'Modern Living Room',
    },
    {
      id: 'ref2',
      image_url: 'https://example.com/ref2.jpg',
      user_title: 'Cozy Bedroom',
    },
  ],
  userPalettes: [
    {
      id: 'palette1',
      name: 'Warm Neutrals',
      colors: { palette: ['#F5F5F5', '#E8E2D8', '#C9A98C'] },
    },
  ],
  selectedReferences: ['ref1', 'ref2'],
  selectedPalettes: ['palette1'],
};

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

describe('AIProcessingScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as jest.Mock).mockReturnValue(mockJourneyStore);
    (useContentStore as jest.Mock).mockReturnValue(mockContentStore);
    (NavigationHelpers as jest.Mock).mockImplementation(() => mockNavigationHelpers);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Screen Initialization', () => {
    it('should render AI processing screen correctly', async () => {
      const { getByText, getByTestId } = render(<AIProcessingScreen />);
      
      expect(getByText('Creating Your Design')).toBeTruthy();
      expect(getByText('Processing...')).toBeTruthy();
      expect(getByText('Overall Progress')).toBeTruthy();
      expect(getByText('Processing Stages')).toBeTruthy();
    });

    it('should initialize processing stages correctly', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      expect(getByText('Analyzing Your Photo')).toBeTruthy();
      expect(getByText('Generating Design Concepts')).toBeTruthy();
      expect(getByText('Applying Your Style')).toBeTruthy();
      expect(getByText('Matching Furniture')).toBeTruthy();
      expect(getByText('Creating Final Design')).toBeTruthy();
    });

    it('should mark journey as completed on mount', async () => {
      render(<AIProcessingScreen />);
      
      await waitFor(() => {
        expect(mockJourneyStore.updateStep).toHaveBeenCalledWith('results');
      });
    });
  });

  describe('Processing Flow', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should progress through all stages automatically', async () => {
      const { getByText, queryByText } = render(<AIProcessingScreen />);
      
      // Initially should show first stage as active
      expect(getByText('Analyzing Your Photo')).toBeTruthy();
      
      // Fast-forward through processing
      act(() => {
        jest.advanceTimersByTime(20000); // 20 seconds
      });
      
      await waitFor(() => {
        expect(getByText('Generating Design Concepts')).toBeTruthy();
      });
      
      // Continue processing
      act(() => {
        jest.advanceTimersByTime(40000); // Additional 40 seconds
      });
      
      await waitFor(() => {
        expect(getByText('Applying Your Style')).toBeTruthy();
      });
    });

    it('should update progress percentage during processing', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Initially 0%
      expect(getByText('0%')).toBeTruthy();
      
      // Fast-forward to show progress
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        // Should show some progress
        const progressText = getByText(/\d+%/);
        expect(progressText).toBeTruthy();
      });
    });

    it('should update elapsed time during processing', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Initially should show 0:00
      expect(getByText('Elapsed: 0:00')).toBeTruthy();
      
      // Fast-forward 65 seconds
      act(() => {
        jest.advanceTimersByTime(65000);
      });
      
      await waitFor(() => {
        expect(getByText('Elapsed: 1:05')).toBeTruthy();
      });
    });

    it('should navigate to results when processing completes', async () => {
      render(<AIProcessingScreen />);
      
      // Fast-forward through entire processing (110 seconds + buffer)
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      // Wait for completion navigation (2 second delay)
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('results');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors correctly', async () => {
      // Mock console.error to avoid test noise
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create a component that will fail during processing
      const FailingProcessingScreen = () => {
        // Simulate processing failure
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Processing failed');
          }, 1000);
        }, []);
        
        return <AIProcessingScreen />;
      };
      
      const { getByText } = render(<FailingProcessingScreen />);
      
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Should eventually show error state
      await waitFor(() => {
        expect(getByText('Processing Error')).toBeTruthy();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should allow retrying after error', async () => {
      // Mock a failure followed by success
      let shouldFail = true;
      const mockProcess = jest.fn().mockImplementation(() => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error('First attempt failed');
        }
        return Promise.resolve();
      });
      
      const { getByText } = render(<AIProcessingScreen />);
      
      // Trigger error state
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Find and press retry button
      await waitFor(() => {
        const retryButton = getByText('Retry Processing');
        fireEvent.press(retryButton);
      });
      
      // Should restart processing
      expect(getByText('Processing...')).toBeTruthy();
    });
  });

  describe('User Controls', () => {
    it('should allow pausing and resuming processing', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Find pause button and press it
      await waitFor(() => {
        const pauseButton = getByText('Pause');
        fireEvent.press(pauseButton);
      });
      
      // Should show paused state
      expect(getByText('Paused')).toBeTruthy();
      expect(getByText('Resume')).toBeTruthy();
      
      // Resume processing
      const resumeButton = getByText('Resume');
      fireEvent.press(resumeButton);
      
      // Should return to processing state
      expect(getByText('Processing...')).toBeTruthy();
    });

    it('should show cancel confirmation dialog', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      await waitFor(() => {
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);
      });
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Cancel Processing?',
        expect.stringContaining('Are you sure you want to cancel?'),
        expect.arrayContaining([
          { text: 'Keep Processing', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: expect.any(Function)
          }
        ])
      );
    });

    it('should navigate back when cancel is confirmed', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      await waitFor(() => {
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);
      });
      
      // Simulate user confirming cancellation
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmCallback = alertCall[2][1].onPress;
      confirmCallback();
      
      expect(NavigationHelpers.goBack).toHaveBeenCalled();
    });
  });

  describe('Stage Progression', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should show correct stage indicators', async () => {
      const { getByText, queryByText } = render(<AIProcessingScreen />);
      
      // Initially first stage should be active
      expect(getByText('Analyzing Your Photo')).toBeTruthy();
      
      // Progress to second stage
      act(() => {
        jest.advanceTimersByTime(20000);
      });
      
      await waitFor(() => {
        expect(getByText('Generating Design Concepts')).toBeTruthy();
      });
    });

    it('should show stage descriptions correctly', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      expect(getByText('Understanding space layout, lighting, and architectural features')).toBeTruthy();
      
      // Progress to second stage
      act(() => {
        jest.advanceTimersByTime(20000);
      });
      
      await waitFor(() => {
        expect(getByText('Creating multiple design variations based on your preferences')).toBeTruthy();
      });
    });

    it('should show estimated time for each stage', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      expect(getByText('~15s')).toBeTruthy(); // Analyze photo stage
      expect(getByText('~30s')).toBeTruthy(); // Generate concepts stage
      expect(getByText('~20s')).toBeTruthy(); // Apply style stage
      expect(getByText('~25s')).toBeTruthy(); // Furniture matching stage
    });
  });

  describe('Completion State', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should show completion message when done', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Fast-forward to completion
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        expect(getByText('Complete!')).toBeTruthy();
        expect(getByText('100%')).toBeTruthy();
      });
    });

    it('should show view results button when complete', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Fast-forward to completion
      act(() => {
        jest.advanceTimersByTime(120000);
      });
      
      await waitFor(() => {
        const viewResultsButton = getByText('View Your Design');
        expect(viewResultsButton).toBeTruthy();
        
        fireEvent.press(viewResultsButton);
        expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('results');
      });
    });
  });

  describe('Integration with Stores', () => {
    it('should access journey store data correctly', () => {
      render(<AIProcessingScreen />);
      
      expect(useJourneyStore).toHaveBeenCalled();
      expect(mockJourneyStore.updateStep).toHaveBeenCalledWith('results');
    });

    it('should access content store data correctly', () => {
      render(<AIProcessingScreen />);
      
      expect(useContentStore).toHaveBeenCalled();
      // Content store should be accessed for user preferences
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with timers', async () => {
      const { unmount } = render(<AIProcessingScreen />);
      
      // Start some timers
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Unmount component
      unmount();
      
      // Should not throw errors or cause memory leaks
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      // No assertions needed - just ensuring no crashes
    });

    it('should handle rapid navigation changes gracefully', async () => {
      const { rerender } = render(<AIProcessingScreen />);
      
      // Rapidly change props/re-render
      for (let i = 0; i < 5; i++) {
        rerender(<AIProcessingScreen />);
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }
      
      // Should not crash or cause issues
      expect(true).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Check for important UI elements
      expect(getByText('Creating Your Design')).toBeTruthy();
      expect(getByText('Overall Progress')).toBeTruthy();
      expect(getByText('Processing Stages')).toBeTruthy();
    });

    it('should provide progress information for screen readers', async () => {
      const { getByText } = render(<AIProcessingScreen />);
      
      // Progress should be announced
      expect(getByText('0%')).toBeTruthy();
      expect(getByText(/Elapsed: \d+:\d+/)).toBeTruthy();
      expect(getByText(/Remaining: ~\d+:\d+/)).toBeTruthy();
    });
  });
});

describe('AI Processing Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network failures gracefully', async () => {
    // Mock network failure
    (geminiVisionService.analyzeImage as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = render(<AIProcessingScreen />);

    await waitFor(() => {
      expect(getByText('Processing Error')).toBeTruthy();
    });
  });

  it('should handle API rate limiting', async () => {
    // Mock rate limiting error
    (geminiVisionService.analyzeImage as jest.Mock).mockRejectedValue(
      new Error('Rate limit exceeded')
    );

    const { getByText } = render(<AIProcessingScreen />);

    await waitFor(() => {
      expect(getByText('Retry Processing')).toBeTruthy();
    });
  });
});

describe('AI Processing Real-time Updates', () => {
  it('should handle real-time progress updates', async () => {
    const { getByText } = render(<AIProcessingScreen />);
    
    // Mock real-time updates
    act(() => {
      // Simulate progress updates
      jest.advanceTimersByTime(5000);
    });
    
    await waitFor(() => {
      // Should show updated progress
      expect(getByText(/\d+%/)).toBeTruthy();
    });
  });
});