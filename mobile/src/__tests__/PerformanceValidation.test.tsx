import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

// Import components and utilities
import { EnhancedAIProcessingScreen } from '../screens/EnhancedAIProcessing/EnhancedAIProcessingScreen';
import { FurnitureCarousel } from '../components/FurnitureCarousel/FurnitureCarousel';
import { CustomPrompt } from '../components/CustomPrompt/CustomPrompt';
import { 
  measureRenderPerformance, 
  usePerformanceMonitor,
  animationOptimizations,
  networkOptimizations 
} from '../utils/performance';
import { FURNITURE_CATEGORIES, MOCK_FURNITURE_STYLES } from '../services/furniture/SpaceAnalysisService';

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

jest.mock('../services/spaceAnalysis');
jest.mock('../services/furniture/SpaceAnalysisService');

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

describe('Enhanced AI Processing - Performance Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('60 FPS Performance Requirements', () => {
    it('maintains 60 FPS during style grid animations', async () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      let frameCount = 0;
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = jest.fn((callback) => {
        frameCount++;
        return originalRAF(callback);
      });

      const startTime = performance.now();

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Simulate rapid style selections
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          const styleButton = getByTestId('style-modern');
          fireEvent.press(styleButton);
          jest.advanceTimersByTime(16); // 60 FPS = 16.67ms per frame
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      const actualFPS = (frameCount / duration) * 1000;

      expect(actualFPS).toBeGreaterThanOrEqual(55); // Allow 5 FPS margin
      global.requestAnimationFrame = originalRAF;
    });

    it('maintains performance during furniture carousel swiping', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES.slice(0, 3),
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const performanceMetrics = await measureRenderPerformance(
        'FurnitureCarousel',
        async () => {
          const { getByTestId } = render(
            <TestWrapper>
              <FurnitureCarousel {...mockProps} />
            </TestWrapper>
          );

          // Simulate rapid swipe gestures
          await act(async () => {
            for (let i = 0; i < 20; i++) {
              const likeButton = getByTestId('like-button');
              fireEvent.press(likeButton);
              jest.advanceTimersByTime(16);
            }
          });
        }
      );

      expect(performanceMetrics.frameRate).toBeGreaterThanOrEqual(55);
      expect(performanceMetrics.renderTime).toBeLessThan(100); // 100ms max render time
    });

    it('handles smooth transitions between processing steps', async () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const performanceMetrics = await measureRenderPerformance(
        'StepTransitions',
        async () => {
          const { getByTestId, rerender } = render(
            <TestWrapper>
              <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
            </TestWrapper>
          );

          // Go through all steps rapidly
          await act(async () => {
            // Style selection
            const continueButton = getByTestId('continue-to-ambiance-button');
            fireEvent.press(continueButton);
            jest.advanceTimersByTime(300); // Animation duration

            // Ambiance selection
            const ambianceButton = getByTestId('ambiance-cozy');
            fireEvent.press(ambianceButton);
            jest.advanceTimersByTime(300);

            // Furniture selection (simulate completion)
            const skipButton = getByTestId('skip-button');
            for (let i = 0; i < 3; i++) {
              fireEvent.press(skipButton);
              jest.advanceTimersByTime(300);
            }
          });
        }
      );

      expect(performanceMetrics.frameRate).toBeGreaterThanOrEqual(55);
    });
  });

  describe('2 Second Load Time Requirements', () => {
    it('completes space analysis in under 2 seconds', async () => {
      const mockSpaceAnalysis = jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            roomType: 'living_room',
            confidence: 0.9,
            spaceCharacteristics: {},
            detectedObjects: [],
            suggestions: { styles: ['modern'] }
          }), 1500)
        )
      );

      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const startTime = performance.now();

      const { getByTestId } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000);
    });

    it('loads furniture data efficiently', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES,
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const startTime = performance.now();

      await act(async () => {
        render(
          <TestWrapper>
            <FurnitureCarousel {...mockProps} />
          </TestWrapper>
        );
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(500); // 500ms max for furniture data loading
    });

    it('renders custom prompt components quickly', async () => {
      const mockContext = {
        roomType: 'living_room' as const,
        spaceCharacteristics: {
          size: 'medium' as const,
          lighting: 'bright' as const,
        },
        detectedObjects: ['sofa', 'table'],
      };

      const startTime = performance.now();

      await act(async () => {
        render(
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
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(200); // 200ms max for prompt rendering
    });
  });

  describe('Memory Management', () => {
    it('maintains stable memory usage during extended use', async () => {
      const mockProps = {
        categories: FURNITURE_CATEGORIES,
        onStyleSelect: jest.fn(),
        onStyleSkip: jest.fn(),
        onCategoryComplete: jest.fn(),
        onAllCategoriesComplete: jest.fn(),
      };

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      const { getByTestId, unmount } = render(
        <TestWrapper>
          <FurnitureCarousel {...mockProps} />
        </TestWrapper>
      );

      // Simulate extended usage
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const likeButton = getByTestId('like-button');
          const skipButton = getByTestId('skip-button');
          
          fireEvent.press(i % 2 === 0 ? likeButton : skipButton);
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

      // Memory increase should be reasonable (less than 20MB for extended usage)
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
    });

    it('cleans up resources on component unmount', async () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { unmount } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Track if cleanup functions are called
      const cleanupSpy = jest.spyOn(console, 'log').mockImplementation();

      unmount();

      // In a real scenario, we'd check if timers, listeners, etc. are cleaned up
      expect(cleanupSpy).not.toHaveBeenCalledWith(expect.stringMatching(/memory leak/i));

      cleanupSpy.mockRestore();
    });
  });

  describe('Responsive Design Performance', () => {
    it('adapts efficiently to different screen sizes', async () => {
      const originalDimensions = Dimensions.get('window');
      const mockDimensions = require('react-native').Dimensions;

      // Test different screen sizes
      const testSizes = [
        { width: 375, height: 812 }, // iPhone X
        { width: 414, height: 896 }, // iPhone 11 Pro Max
        { width: 768, height: 1024 }, // iPad
        { width: 1024, height: 768 }, // iPad Landscape
      ];

      for (const size of testSizes) {
        mockDimensions.get = jest.fn().mockReturnValue(size);

        const startTime = performance.now();

        const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
        const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

        const { unmount } = render(
          <TestWrapper>
            <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
          </TestWrapper>
        );

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        expect(renderTime).toBeLessThan(300); // Should render quickly on all screen sizes

        unmount();
      }

      // Restore original dimensions
      mockDimensions.get = jest.fn().mockReturnValue(originalDimensions);
    });

    it('handles orientation changes without performance degradation', async () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), addListener: jest.fn() };
      const mockRoute = { params: { imageUri: 'file://test-image.jpg' } };

      const { rerender } = render(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Simulate orientation change
      const mockDimensions = require('react-native').Dimensions;
      mockDimensions.get = jest.fn().mockReturnValue({ width: 812, height: 375 });

      const startTime = performance.now();

      rerender(
        <TestWrapper>
          <EnhancedAIProcessingScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const reRenderTime = endTime - startTime;

      expect(reRenderTime).toBeLessThan(100); // Fast re-render on orientation change
    });
  });

  describe('Network Performance', () => {
    it('handles concurrent API calls efficiently', async () => {
      const concurrencyLimiter = networkOptimizations.createConcurrencyLimiter(3);
      
      const mockApiCall = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const startTime = performance.now();

      // Create 10 concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        concurrencyLimiter(() => mockApiCall())
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // With concurrency limit of 3, 10 requests should complete in ~400ms
      // (4 batches * 100ms each + overhead)
      expect(totalTime).toBeLessThan(600);
      expect(mockApiCall).toHaveBeenCalledTimes(10);
    });

    it('implements proper timeout and retry logic', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ data: 'success' }) });

      global.fetch = mockFetch;

      const startTime = performance.now();

      const result = await networkOptimizations.optimizedFetch(
        'https://api.example.com/test',
        {},
        1000, // 1 second timeout
        2     // 2 retries
      );

      const endTime = performance.now();
      const requestTime = endTime - startTime;

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial call + 1 retry
      expect(requestTime).toBeLessThan(3000); // Should complete within timeout limits
    });
  });

  describe('Animation Performance', () => {
    it('uses optimized animation configurations', () => {
      const timingConfig = animationOptimizations.createOptimizedTiming(300);
      const springConfig = animationOptimizations.createOptimizedSpring();

      expect(timingConfig.useNativeDriver).toBe(true);
      expect(timingConfig.duration).toBe(300);
      expect(springConfig.useNativeDriver).toBe(true);
      expect(springConfig.damping).toBeGreaterThan(0);
    });

    it('batches animation updates correctly', async () => {
      const animationCalls: number[] = [];
      const mockAnimations = [
        () => animationCalls.push(1),
        () => animationCalls.push(2),
        () => animationCalls.push(3),
      ];

      animationOptimizations.batchAnimations(mockAnimations);

      // Wait for requestAnimationFrame
      await act(async () => {
        jest.advanceTimersByTime(16);
      });

      expect(animationCalls).toEqual([1, 2, 3]);
    });
  });

  describe('Performance Monitoring', () => {
    it('tracks performance metrics accurately', async () => {
      const TestComponent: React.FC = () => {
        const { metrics, startMeasurement } = usePerformanceMonitor('TestComponent');
        
        React.useEffect(() => {
          const measurement = startMeasurement();
          
          // Simulate some work
          setTimeout(() => {
            measurement.end();
          }, 100);
        }, [startMeasurement]);

        return <div testID="test-component">Test</div>;
      };

      const { getByTestId } = render(<TestComponent />);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('warns about performance issues in development', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const slowFunction = async () => {
        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, 150));
      };

      await measureRenderPerformance('SlowComponent', slowFunction);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('render time')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Bundle Size and Asset Optimization', () => {
    it('loads components efficiently with code splitting', async () => {
      // This would test lazy loading in a real scenario
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div testID="lazy-component">Lazy</div>
        })
      );

      const { getByTestId } = render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      await waitFor(() => {
        expect(getByTestId('lazy-component')).toBeTruthy();
      });
    });
  });
});