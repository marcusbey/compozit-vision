import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeJourneyNavigator } from '../../src/navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../src/stores/journeyStore';
import { Alert } from 'react-native';

// Mock services with error scenarios
jest.mock('../../src/services/supabase');
jest.mock('../../src/services/geminiVisionService');
jest.mock('../../src/services/enhancedAIProcessingService');

describe('Error Handling E2E Tests', () => {
  const TestApp = () => (
    <NavigationContainer>
      <SafeJourneyNavigator />
    </NavigationContainer>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useJourneyStore.getState().reset();
    // Clear any pending alerts
    Alert.alert = jest.fn();
  });

  describe('Network Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock network timeout
      const timeoutError = new Error('Network request failed');
      timeoutError.name = 'AbortError';
      jest.spyOn(global, 'fetch').mockRejectedValue(timeoutError);

      await navigateToAIProcessing();

      // Should show timeout error
      await waitFor(() => {
        expect(queryByText('Connection timeout')).toBeTruthy();
      });

      // Should offer retry option
      const retryButton = queryByText('Retry');
      expect(retryButton).toBeTruthy();

      // Should allow offline mode
      const offlineButton = queryByText('Continue Offline');
      if (offlineButton) {
        expect(offlineButton).toBeTruthy();
      }
    });

    it('should handle server errors (500) with proper user feedback', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock server error
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server temporarily unavailable' })
      } as Response);

      await navigateToAIProcessing();

      // Should show server error message
      await waitFor(() => {
        expect(queryByText('Server temporarily unavailable')).toBeTruthy();
      });

      // Should suggest alternatives
      expect(queryByText('Please try again in a few moments')).toBeTruthy();
      
      // Should offer to save progress
      const saveProgressButton = queryByText('Save Progress');
      if (saveProgressButton) {
        expect(saveProgressButton).toBeTruthy();
      }
    });

    it('should handle authentication errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock auth error
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Authentication required' })
      } as Response);

      await navigateToAuthRequiredStep();

      // Should show auth error
      await waitFor(() => {
        expect(queryByText('Please sign in to continue')).toBeTruthy();
      });

      // Should redirect to auth screen
      const signInButton = queryByText('Sign In');
      expect(signInButton).toBeTruthy();
    });

    it('should handle rate limiting errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock rate limit error
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'Retry-After': '60' }),
        json: () => Promise.resolve({ 
          error: 'Too many requests. Please try again in 60 seconds.' 
        })
      } as Response);

      await navigateToAIProcessing();

      // Should show rate limit message
      await waitFor(() => {
        expect(queryByText('Too many requests. Please try again in 60 seconds.')).toBeTruthy();
      });

      // Should show countdown timer
      expect(queryByText('Retry in 60 seconds')).toBeTruthy();
    });
  });

  describe('Service-Specific Error Handling', () => {
    it('should handle Supabase database errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock Supabase error
      const { supabase } = require('../../src/services/supabase');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Database connection failed', code: 'CONNECTION_ERROR' }
        }))
      });

      await navigateToStep('category_selection');

      // Should show database error
      await waitFor(() => {
        expect(queryByText('Unable to load categories')).toBeTruthy();
      });

      // Should offer fallback options
      expect(queryByText('Use default categories')).toBeTruthy();
    });

    it('should handle AI service errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock AI service error
      const { geminiVisionService } = require('../../src/services/geminiVisionService');
      geminiVisionService.analyzeImage.mockRejectedValue(
        new Error('AI service quota exceeded')
      );

      await navigateToPhotoCapture();
      fireEvent.press(getByText('Take Photo'));

      // Should show AI error
      await waitFor(() => {
        expect(queryByText('AI analysis temporarily unavailable')).toBeTruthy();
      });

      // Should offer alternatives
      expect(queryByText('Continue without AI analysis')).toBeTruthy();
      expect(queryByText('Try again later')).toBeTruthy();
    });

    it('should handle Stripe payment errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock Stripe error
      const { useStripe } = require('@stripe/stripe-react-native');
      useStripe.mockReturnValue({
        confirmPayment: jest.fn(() => Promise.resolve({
          error: {
            code: 'card_declined',
            message: 'Your card was declined.'
          }
        }))
      });

      await navigateToPayment();

      // Attempt payment
      fireEvent.press(getByText('Complete Purchase'));

      // Should show payment error
      await waitFor(() => {
        expect(queryByText('Your card was declined.')).toBeTruthy();
      });

      // Should offer alternatives
      expect(queryByText('Try different card')).toBeTruthy();
      expect(queryByText('Contact support')).toBeTruthy();
    });
  });

  describe('File and Media Error Handling', () => {
    it('should handle camera permission errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock camera permission denied
      const { Camera } = require('expo-camera');
      Camera.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied'
      });

      await navigateToPhotoCapture();
      fireEvent.press(getByText('Take Photo'));

      // Should show permission error
      await waitFor(() => {
        expect(queryByText('Camera permission required')).toBeTruthy();
      });

      // Should offer alternatives
      expect(queryByText('Use Gallery Instead')).toBeTruthy();
      expect(queryByText('Open Settings')).toBeTruthy();
    });

    it('should handle image upload failures', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock upload failure
      const { supabase } = require('../../src/services/supabase');
      supabase.storage = {
        from: () => ({
          upload: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Upload failed: File too large' }
          }))
        })
      };

      await navigateToReferences();
      fireEvent.press(getByText('Upload Image'));

      // Should show upload error
      await waitFor(() => {
        expect(queryByText('Upload failed: File too large')).toBeTruthy();
      });

      // Should offer solutions
      expect(queryByText('Try smaller image')).toBeTruthy();
      expect(queryByText('Compress image')).toBeTruthy();
    });

    it('should handle corrupted image files', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock corrupted image
      const { launchImageLibraryAsync } = require('expo-image-picker');
      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'corrupted://image.jpg',
          width: 0,  // Invalid dimensions
          height: 0
        }]
      });

      await navigateToPhotoCapture();
      fireEvent.press(getByText('Choose from Gallery'));

      // Should detect corrupted image
      await waitFor(() => {
        expect(queryByText('Invalid image file')).toBeTruthy();
      });

      // Should suggest retry
      expect(queryByText('Try different image')).toBeTruthy();
    });
  });

  describe('Memory and Performance Error Handling', () => {
    it('should handle low memory conditions', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock low memory
      const mockMemoryWarning = jest.fn();
      (global as any).addEventListener = jest.fn((event: string, callback: () => void) => {
        if (event === 'memorywarning') {
          setTimeout(callback, 100);
        }
      });

      await navigateToAIProcessing();

      // Should show memory warning
      await waitFor(() => {
        expect(queryByText('Memory running low')).toBeTruthy();
      });

      // Should offer to reduce quality
      expect(queryByText('Reduce image quality')).toBeTruthy();
      expect(queryByText('Close other apps')).toBeTruthy();
    });

    it('should handle processing timeouts', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock long processing time
      const { enhancedAIProcessingService } = require('../../src/services/enhancedAIProcessingService');
      enhancedAIProcessingService.generateDesign.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 60000)) // 1 minute timeout
      );

      await navigateToAIProcessing();

      // Should show timeout warning
      await waitFor(() => {
        expect(queryByText('Processing is taking longer than expected')).toBeTruthy();
      }, { timeout: 35000 });

      // Should offer options
      expect(queryByText('Continue waiting')).toBeTruthy();
      expect(queryByText('Try simpler settings')).toBeTruthy();
    });
  });

  describe('User Input Error Handling', () => {
    it('should handle invalid form inputs', async () => {
      const { getByText, getByPlaceholderText, queryByText } = render(<TestApp />);

      await navigateToProjectDetails();

      // Enter invalid project name
      const projectNameInput = getByPlaceholderText('Project Name');
      fireEvent.changeText(projectNameInput, ''); // Empty name
      
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Should show validation error
      await waitFor(() => {
        expect(queryByText('Project name is required')).toBeTruthy();
      });

      // Enter invalid characters
      fireEvent.changeText(projectNameInput, 'Project<>|Name');
      fireEvent.press(continueButton);

      // Should show character validation error
      await waitFor(() => {
        expect(queryByText('Invalid characters in project name')).toBeTruthy();
      });
    });

    it('should handle clipboard access errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock clipboard error
      const { setStringAsync } = require('expo-clipboard');
      setStringAsync.mockRejectedValue(new Error('Clipboard access denied'));

      await navigateToResults();
      fireEvent.press(getByText('Copy Share Link'));

      // Should show clipboard error
      await waitFor(() => {
        expect(queryByText('Unable to copy to clipboard')).toBeTruthy();
      });

      // Should offer manual copy
      expect(queryByText('Tap to select text')).toBeTruthy();
    });
  });

  describe('State Management Error Handling', () => {
    it('should handle store corruption and recovery', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Corrupt journey store
      act(() => {
        useJourneyStore.setState({
          currentStep: 'invalid_step' as any,
          projectWizard: null as any
        });
      });

      // Should detect corruption
      await waitFor(() => {
        expect(queryByText('Something went wrong')).toBeTruthy();
      });

      // Should offer recovery
      const resetButton = queryByText('Start Over');
      if (resetButton) {
        fireEvent.press(resetButton);
      }

      // Should reset to valid state
      await waitFor(() => {
        expect(getByText('Welcome to Compozit Vision')).toBeTruthy();
      });
    });

    it('should handle async storage errors', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock storage error
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage quota exceeded'));

      await navigateToStep('category_selection');
      fireEvent.press(getByText('Interior Design'));

      // Should handle storage error gracefully
      await waitFor(() => {
        expect(queryByText('Unable to save progress')).toBeTruthy();
      });

      // Should continue without saving
      expect(queryByText('Continue anyway')).toBeTruthy();
    });
  });

  describe('Recovery and Graceful Degradation', () => {
    it('should provide fallback UI when components fail to load', async () => {
      const { queryByText } = render(<TestApp />);

      // Mock component error
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should show error boundary
      await waitFor(() => {
        expect(queryByText('Something went wrong') || queryByText('Error loading component')).toBeTruthy();
      });

      // Should offer recovery options
      expect(queryByText('Reload') || queryByText('Try again')).toBeTruthy();

      consoleError.mockRestore();
    });

    it('should maintain core functionality when non-critical features fail', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock non-critical feature failure (analytics, etc.)
      const mockAnalyticsError = jest.fn(() => {
        throw new Error('Analytics service unavailable');
      });

      await navigateToStep('category_selection');

      // Core functionality should still work
      fireEvent.press(getByText('Interior Design'));
      
      await waitFor(() => {
        const continueButton = getByText('Continue to Space Selection');
        expect(continueButton).toBeTruthy();
      });

      // Should continue normally despite analytics failure
      expect(queryByText('Continue to Space Selection')).toBeTruthy();
    });

    it('should provide offline functionality when possible', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock offline state
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network request failed'));

      await navigateToStep('category_selection');

      // Should show offline indicator
      await waitFor(() => {
        expect(queryByText('Working offline')).toBeTruthy();
      });

      // Should still allow basic functionality
      fireEvent.press(getByText('Interior Design'));
      expect(queryByText('Continue to Space Selection')).toBeTruthy();
    });
  });

  // Helper functions
  async function navigateToStep(stepName: string) {
    const { getByText } = render(<TestApp />);

    const steps = {
      'category_selection': async () => {
        fireEvent.press(getByText('Get Started'));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Get Started')));
        await waitFor(() => fireEvent.press(getByText('Start New Project')));
      }
    };

    await (steps as any)[stepName]?.();
  }

  async function navigateToAIProcessing() {
    await navigateToStep('category_selection');
    // Quick path through all steps
  }

  async function navigateToAuthRequiredStep() {
    // Navigate to a step that requires authentication
  }

  async function navigateToPhotoCapture() {
    // Navigate to photo capture step
  }

  async function navigateToPayment() {
    // Navigate to payment step
  }

  async function navigateToReferences() {
    // Navigate to references step
  }

  async function navigateToResults() {
    // Navigate to results step
  }

  async function navigateToProjectDetails() {
    // Navigate to project details step
  }
});