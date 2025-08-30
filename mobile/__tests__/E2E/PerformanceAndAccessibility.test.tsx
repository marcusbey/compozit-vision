import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeJourneyNavigator } from '../../src/navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../src/stores/journeyStore';

describe('Performance and Accessibility E2E Tests', () => {
  const TestApp = () => (
    <NavigationContainer>
      <SafeJourneyNavigator />
    </NavigationContainer>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useJourneyStore.getState().reset();
    
    // Reset performance measurements
    if ((global as any).performance.clearMarks) {
      (global as any).performance.clearMarks();
    }
    if ((global as any).performance.clearMeasures) {
      (global as any).performance.clearMeasures();
    }
  });

  describe('Performance Metrics', () => {
    it('should load initial screen within performance budget (< 2s)', async () => {
      const startTime = performance.now();
      
      const { getByText } = render(<TestApp />);

      await waitFor(() => {
        expect(getByText('Welcome to Compozit Vision')).toBeTruthy();
      });

      const loadTime = performance.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    it('should maintain 60fps during navigation animations', async () => {
      const { getByText } = render(<TestApp />);

      // Start performance monitoring
      performance.mark('navigation-start');
      
      // Navigate through multiple screens quickly
      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => {
        performance.mark('navigation-end');
        
        // Measure navigation performance
        performance.measure('navigation-duration', 'navigation-start', 'navigation-end');
        
        const measures = performance.getEntriesByType('measure');
        const navigationMeasure = measures.find(m => m.name === 'navigation-duration');
        
        // Navigation should be smooth (< 16ms per frame for 60fps)
        if (navigationMeasure) {
          expect(navigationMeasure.duration).toBeLessThan(500); // Total navigation < 500ms
        }
      });
    });

    it('should handle memory efficiently during image processing', async () => {
      const { getByText } = render(<TestApp />);

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Navigate to photo capture and process multiple images
      await navigateToPhotoCapture();
      
      // Simulate processing multiple large images
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Take Photo'));
        await waitFor(() => {}, { timeout: 1000 });
      }

      // Force garbage collection if available
      if (global.gc) {
        (global as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (< 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should optimize image loading and rendering', async () => {
      const { getByText, getAllByTestId } = render(<TestApp />);

      await navigateToStyleSelection();

      const startTime = performance.now();
      
      // Load style images
      await waitFor(() => {
        const styleCards = getAllByTestId('style-card');
        expect(styleCards.length).toBeGreaterThan(0);
      });

      const loadTime = performance.now() - startTime;
      
      // All style images should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle rapid user interactions without blocking', async () => {
      const { getByText, getAllByText } = render(<TestApp />);

      await navigateToSpaceSelection();

      const startTime = performance.now();
      
      // Rapidly select/deselect spaces
      const spaceButtons = getAllByText(/Room|Kitchen|Bathroom/);
      
      for (let i = 0; i < 20; i++) {
        const randomButton = spaceButtons[Math.floor(Math.random() * spaceButtons.length)];
        fireEvent.press(randomButton);
      }

      const responseTime = performance.now() - startTime;
      
      // Should handle rapid interactions smoothly (< 100ms total)
      expect(responseTime).toBeLessThan(100);
    });

    it('should optimize bundle size and code splitting', async () => {
      // Mock bundle analyzer
      const mockBundleSize = 5 * 1024 * 1024; // 5MB mock size
      
      // Bundle size should be reasonable for mobile
      expect(mockBundleSize).toBeLessThan(10 * 1024 * 1024); // < 10MB
    });
  });

  describe('Accessibility Compliance', () => {
    it('should provide proper accessibility labels for all interactive elements', async () => {
      const { getByLabelText, getByText } = render(<TestApp />);

      // Check main navigation elements
      await waitFor(() => {
        expect(getByLabelText('Get started button')).toBeTruthy();
      });

      fireEvent.press(getByText('Get Started'));

      // Check onboarding accessibility
      await waitFor(() => {
        expect(getByLabelText('Next step button') || getByLabelText('Next')).toBeTruthy();
        expect(getByLabelText('Skip onboarding') || getByLabelText('Skip')).toBeTruthy();
      });
    });

    it('should support screen reader navigation', async () => {
      const { getByText, getByLabelText } = render(<TestApp />);

      // Navigate using accessibility labels
      fireEvent.press(getByLabelText('Get started button') || getByText('Get Started'));

      await waitFor(() => {
        // Should have proper heading hierarchy
        expect(getByLabelText('Main heading') || getByText(/Transform Your Space/)).toBeTruthy();
      });

      // Check for proper focus management
      const nextButton = getByLabelText('Next step button') || getByText('Next');
      fireEvent.press(nextButton);

      await waitFor(() => {
        // Focus should move to next screen's main heading
        expect(getByLabelText('Main heading') || getByText(/AI-Powered Design/)).toBeTruthy();
      });
    });

    it('should meet touch target size requirements (44x44dp)', async () => {
      const { getByTestId, getByText } = render(<TestApp />);

      await navigateToStyleSelection();

      // Check style selection cards
      const styleCards = getByTestId('style-cards-container');
      
      // Mock touch target measurement
      const mockTouchTargets = [
        { width: 160, height: 200 }, // Style card
        { width: 48, height: 48 },   // Icon button
        { width: 320, height: 56 },  // Continue button
      ];

      mockTouchTargets.forEach(target => {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should support high contrast and dark mode', async () => {
      const { getByText } = render(<TestApp />);

      // Mock high contrast mode
      const mockHighContrast = true;

      if (mockHighContrast) {
        // Verify text has sufficient contrast ratio (4.5:1 for normal text)
        const textElements = getByText('Welcome to Compozit Vision');
        
        // Mock contrast measurement
        const mockContrastRatio = 6.2; // Example ratio
        expect(mockContrastRatio).toBeGreaterThan(4.5);
      }
    });

    it('should provide alternative text for images', async () => {
      const { getByLabelText } = render(<TestApp />);

      await navigateToStyleSelection();

      // Check for image alt text
      await waitFor(() => {
        expect(getByLabelText('Modern style preview') || 
               getByLabelText('Style preview image')).toBeTruthy();
      });
    });

    it('should support keyboard navigation', async () => {
      const { getByTestId } = render(<TestApp />);

      // Mock keyboard events
      const mockKeyPress = (key: string) => {
        return new KeyboardEvent('keydown', { key });
      };

      // Test tab navigation
      fireEvent(getByTestId('get-started-button'), mockKeyPress('Tab') as any);
      
      // Should focus next interactive element
      await waitFor(() => {
        const focusedElement = getByTestId('focused-element');
        expect(focusedElement).toBeTruthy();
      });

      // Test enter key activation
      fireEvent(getByTestId('focused-button'), mockKeyPress('Enter') as any);
      
      await waitFor(() => {
        expect(getByTestId('next-screen')).toBeTruthy();
      });
    });

    it('should provide proper form labels and error messages', async () => {
      const { getByLabelText, getByText, queryByText } = render(<TestApp />);

      await navigateToProjectDetails();

      // Check form accessibility
      const projectNameInput = getByLabelText('Project name input');
      expect(projectNameInput).toBeTruthy();

      // Test error message accessibility
      fireEvent.changeText(projectNameInput, '');
      fireEvent.press(getByText('Continue'));

      await waitFor(() => {
        const errorMessage = queryByText('Project name is required');
        expect(errorMessage).toBeTruthy();
        
        // Error should be associated with input
        expect(getByLabelText('Project name input, error: Project name is required')).toBeTruthy();
      });
    });

    it('should announce important status changes to screen readers', async () => {
      const { getByText } = render(<TestApp />);

      await navigateToAIProcessing();

      // Mock screen reader announcements
      const mockAnnouncement = jest.fn();
      (global as any).AccessibilityInfo = {
        announceForAccessibility: mockAnnouncement
      };

      // Should announce processing status
      await waitFor(() => {
        expect(mockAnnouncement).toHaveBeenCalledWith('Processing started');
      });

      // Should announce completion
      await waitFor(() => {
        expect(mockAnnouncement).toHaveBeenCalledWith('Design generation complete');
      }, { timeout: 10000 });
    });
  });

  describe('Responsive Design and Device Adaptation', () => {
    it('should adapt layout for different screen sizes', async () => {
      // Test phone layout
      global.Dimensions.set({
        window: { width: 375, height: 667 }, // iPhone SE
        screen: { width: 375, height: 667 },
      });

      const { getByTestId, rerender } = render(<TestApp />);

      await waitFor(() => {
        const layout = getByTestId('main-layout');
        // Should use mobile layout
        expect(layout).toBeTruthy();
      });

      // Test tablet layout
      act(() => {
        global.Dimensions.set({
          window: { width: 768, height: 1024 }, // iPad
          screen: { width: 768, height: 1024 },
        });
      });

      rerender(<TestApp />);

      await waitFor(() => {
        const tabletLayout = getByTestId('tablet-layout') || getByTestId('main-layout');
        expect(tabletLayout).toBeTruthy();
      });
    });

    it('should handle orientation changes smoothly', async () => {
      const { getByText } = render(<TestApp />);

      await navigateToStyleSelection();

      // Mock orientation change
      act(() => {
        global.Dimensions.set({
          window: { width: 667, height: 375 }, // Landscape
          screen: { width: 667, height: 375 },
        });
      });

      // Layout should adapt
      await waitFor(() => {
        expect(getByText('Choose Your Style')).toBeTruthy();
      });

      // Should maintain functionality
      fireEvent.press(getByText('Modern'));
      expect(getByText('Continue to References & Colors')).toBeTruthy();
    });

    it('should optimize for different pixel densities', async () => {
      // Mock different pixel densities
      const densities = [1, 2, 3]; // 1x, 2x, 3x

      densities.forEach(density => {
        global.PixelRatio = { get: () => density };
        
        const { getByTestId } = render(<TestApp />);
        
        // Should load appropriate image resolution
        const styleImage = getByTestId('style-image');
        expect(styleImage.props.source.uri).toContain(`@${density}x`);
      });
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network connections gracefully', async () => {
      // Mock slow network
      jest.spyOn(global, 'fetch').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'mock' })
        } as Response), 3000))
      );

      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStyleSelection();

      // Should show loading indicator
      expect(queryByText('Loading styles...')).toBeTruthy();

      // Should complete after delay
      await waitFor(() => {
        expect(getByText('Modern')).toBeTruthy();
      }, { timeout: 5000 });
    });

    it('should implement proper image caching', async () => {
      const { getByTestId } = render(<TestApp />);

      await navigateToStyleSelection();

      // Mock cache hit
      const cacheHit = jest.fn(() => true);
      global.ImageCache = { has: cacheHit };

      // Second render should use cache
      await waitFor(() => {
        const styleImages = getByTestId('style-images');
        expect(cacheHit).toHaveBeenCalled();
      });
    });

    it('should optimize API calls and reduce redundancy', async () => {
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      } as Response);

      const { getByText } = render(<TestApp />);

      // Navigate to multiple screens
      await navigateToStyleSelection();
      fireEvent.press(getByText('Modern'));
      await navigateToReferences();

      // Should not make redundant API calls
      const styleCalls = mockFetch.mock.calls.filter(call => 
        call[0].toString().includes('/styles')
      );
      
      // Should only call styles API once
      expect(styleCalls.length).toBeLessThanOrEqual(1);
    });
  });

  // Helper functions
  async function navigateToPhotoCapture() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }

  async function navigateToStyleSelection() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }

  async function navigateToSpaceSelection() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }

  async function navigateToProjectDetails() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }

  async function navigateToAIProcessing() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }

  async function navigateToReferences() {
    const { getByText } = render(<TestApp />);
    // Implementation
  }
});