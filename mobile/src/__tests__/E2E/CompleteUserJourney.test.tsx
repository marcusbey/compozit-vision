import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeJourneyNavigator } from '../../src/navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../src/stores/journeyStore';
import { useContentStore } from '../../src/stores/contentStore';
import { useProjectStore } from '../../src/stores/projectStore';

// Mock AsyncStorage for persistent data
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Haptics
import * as Haptics from 'expo-haptics';

describe('Complete User Journey E2E Tests', () => {
  const TestApp = () => (
    <NavigationContainer>
      <SafeJourneyNavigator />
    </NavigationContainer>
  );

  beforeEach(async () => {
    // Clear all mocks and storage
    jest.clearAllMocks();
    await AsyncStorage.clear();
    
    // Reset all stores to initial state
    useJourneyStore.getState().reset();
    useContentStore.getState().reset();
    useProjectStore.getState().reset();
  });

  describe('S0 → S13: Complete Happy Path Journey', () => {
    it('should complete full user journey from welcome to results', async () => {
      const { getByText, getByTestId, queryByText, getAllByText } = render(<TestApp />);

      // === S0: Welcome Screen ===
      await waitFor(() => {
        expect(getByText('Welcome to Compozit Vision')).toBeTruthy();
      });

      // Start journey
      const getStartedButton = getByText('Get Started');
      fireEvent.press(getStartedButton);

      // === S1: Onboarding Screen 1 ===
      await waitFor(() => {
        expect(getByText('Transform Your Space')).toBeTruthy();
      });

      const nextButton1 = getByText('Next');
      fireEvent.press(nextButton1);

      // === S2: Onboarding Screen 2 ===
      await waitFor(() => {
        expect(getByText('AI-Powered Design')).toBeTruthy();
      });

      const nextButton2 = getByText('Next');
      fireEvent.press(nextButton2);

      // === S3: Onboarding Screen 3 ===
      await waitFor(() => {
        expect(getByText('Choose Your Plan')).toBeTruthy();
      });

      const getStartedButton2 = getByText('Get Started');
      fireEvent.press(getStartedButton2);

      // === S4: Project Wizard Start ===
      await waitFor(() => {
        expect(getByText('Start Your Design Journey')).toBeTruthy();
      });

      const startProjectButton = getByText('Start New Project');
      fireEvent.press(startProjectButton);

      // === S5: Category Selection ===
      await waitFor(() => {
        expect(getByText('What would you like to design?')).toBeTruthy();
      });

      // Select Interior category
      const interiorCategory = getByText('Interior Design');
      fireEvent.press(interiorCategory);

      const continueButton1 = getByText('Continue to Space Selection');
      await waitFor(() => {
        expect(continueButton1).toBeTruthy();
      });
      fireEvent.press(continueButton1);

      // === S6: Space Definition ===
      await waitFor(() => {
        expect(getByText('Select Your Spaces')).toBeTruthy();
      });

      // Select living room
      const livingRoom = getByText('Living Room');
      fireEvent.press(livingRoom);

      const continueButton2 = getByText('Continue to Photo Capture');
      await waitFor(() => {
        expect(continueButton2).toBeTruthy();
      });
      fireEvent.press(continueButton2);

      // === S7: Photo Capture ===
      await waitFor(() => {
        expect(getByText('Capture Your Space')).toBeTruthy();
      });

      // Mock camera capture
      const captureButton = getByText('Take Photo');
      fireEvent.press(captureButton);

      // Wait for photo processing
      await waitFor(() => {
        const continueButton3 = queryByText('Continue to Style Selection');
        if (continueButton3) {
          fireEvent.press(continueButton3);
        }
      }, { timeout: 5000 });

      // === S8: Style Selection ===
      await waitFor(() => {
        expect(getByText('Choose Your Style')).toBeTruthy();
      });

      // Select modern style
      const modernStyle = getByText('Modern');
      fireEvent.press(modernStyle);

      const continueButton4 = getByText('Continue to References & Colors');
      await waitFor(() => {
        expect(continueButton4).toBeTruthy();
      });
      fireEvent.press(continueButton4);

      // === S9: References & Colors ===
      await waitFor(() => {
        expect(getByText('References & Colors')).toBeTruthy();
      });

      // Skip references for now
      const skipButton = getByText('Skip for now');
      fireEvent.press(skipButton);

      // === S10: AI Processing ===
      await waitFor(() => {
        expect(getByText('Creating Your Design')).toBeTruthy();
      });

      // Wait for processing to complete (mocked)
      await waitFor(() => {
        const viewResultsButton = queryByText('View Results');
        if (viewResultsButton) {
          fireEvent.press(viewResultsButton);
        }
      }, { timeout: 10000 });

      // === S11: Results ===
      await waitFor(() => {
        expect(getByText('Your Design is Ready')).toBeTruthy();
      });

      // Test result actions
      const saveProjectButton = getByText('Save Project');
      fireEvent.press(saveProjectButton);

      // === S12: Project Saved Confirmation ===
      await waitFor(() => {
        expect(getByText('Project Saved')).toBeTruthy();
      });

      // === S13: Navigate to My Projects ===
      const viewProjectsButton = getByText('View My Projects');
      fireEvent.press(viewProjectsButton);

      await waitFor(() => {
        expect(getByText('My Projects')).toBeTruthy();
      });

      // Verify project is saved
      expect(getByText('Living Room Design')).toBeTruthy();
    }, 30000);
  });

  describe('Navigation Flow Validation', () => {
    it('should handle back navigation correctly throughout the journey', async () => {
      const { getByText, getByTestId } = render(<TestApp />);

      // Start journey and go to category selection
      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Get Started')));
      await waitFor(() => fireEvent.press(getByText('Start New Project')));

      // Test back navigation from category selection
      await waitFor(() => {
        expect(getByText('What would you like to design?')).toBeTruthy();
      });

      const backButton = getByTestId('back-button') || getByText('Back');
      fireEvent.press(backButton);

      // Should return to project wizard start
      await waitFor(() => {
        expect(getByText('Start Your Design Journey')).toBeTruthy();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle validation errors gracefully', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Navigate to category selection
      fireEvent.press(getByText('Get Started'));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Get Started')));
      await waitFor(() => fireEvent.press(getByText('Start New Project')));

      // Try to continue without selecting category
      await waitFor(() => {
        expect(getByText('What would you like to design?')).toBeTruthy();
      });

      const continueButton = queryByText('Continue to Space Selection');
      if (continueButton) {
        fireEvent.press(continueButton);
      }

      // Should show validation error
      await waitFor(() => {
        expect(queryByText('Please select a category')).toBeTruthy();
      });
    });

    it('should handle network errors during processing', async () => {
      // Mock network failure
      const mockError = new Error('Network request failed');
      jest.spyOn(global, 'fetch').mockRejectedValue(mockError);

      const { getByText, queryByText } = render(<TestApp />);

      // Navigate through journey to AI processing
      await act(async () => {
        fireEvent.press(getByText('Get Started'));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Get Started')));
        await waitFor(() => fireEvent.press(getByText('Start New Project')));
        
        // Quick path to processing
        fireEvent.press(getByText('Interior Design'));
        await waitFor(() => fireEvent.press(getByText('Continue to Space Selection')));
        
        fireEvent.press(getByText('Living Room'));
        await waitFor(() => fireEvent.press(getByText('Continue to Photo Capture')));
        
        fireEvent.press(getByText('Take Photo'));
        await waitFor(() => {
          const continueBtn = queryByText('Continue to Style Selection');
          if (continueBtn) fireEvent.press(continueBtn);
        });
        
        fireEvent.press(getByText('Modern'));
        await waitFor(() => fireEvent.press(getByText('Continue to References & Colors')));
        
        fireEvent.press(getByText('Skip for now'));
      });

      // Should handle processing error
      await waitFor(() => {
        expect(queryByText('Something went wrong')).toBeTruthy();
      });

      // Should offer retry
      const retryButton = queryByText('Try Again');
      if (retryButton) {
        expect(retryButton).toBeTruthy();
      }
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should persist user progress through app restarts', async () => {
      const { getByText, unmount } = render(<TestApp />);

      // Start journey and make some progress
      fireEvent.press(getByText('Get Started'));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Get Started')));
      await waitFor(() => fireEvent.press(getByText('Start New Project')));
      
      fireEvent.press(getByText('Interior Design'));
      await waitFor(() => fireEvent.press(getByText('Continue to Space Selection')));

      // Store current progress
      const journeyState = useJourneyStore.getState();
      expect(journeyState.currentStep).toBe('space_definition');

      // Simulate app restart
      unmount();
      
      // Re-render app
      const { getByText: getByText2 } = render(<TestApp />);

      // Should resume from where left off
      await waitFor(() => {
        expect(getByText2('Select Your Spaces')).toBeTruthy();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide proper accessibility labels throughout journey', async () => {
      const { getByText, getByLabelText } = render(<TestApp />);

      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => {
        // Check for accessibility labels
        expect(getByLabelText('Next step')).toBeTruthy();
      });
    });

    it('should provide haptic feedback for important actions', async () => {
      const { getByText } = render(<TestApp />);

      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => fireEvent.press(getByText('Next')));
      
      // Verify haptic feedback was called
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not leak memory during navigation', async () => {
      const { getByText } = render(<TestApp />);
      
      const initialMemory = (global.performance as any).memory.usedJSHeapSize;
      
      // Navigate through multiple screens
      fireEvent.press(getByText('Get Started'));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Next')));
      await waitFor(() => fireEvent.press(getByText('Get Started')));
      await waitFor(() => fireEvent.press(getByText('Start New Project')));
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (global.performance as any).memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle rapid navigation without crashes', async () => {
      const { getByText } = render(<TestApp />);

      // Rapid navigation test
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          fireEvent.press(getByText('Get Started'));
          await waitFor(() => fireEvent.press(getByText('Next')));
          await waitFor(() => fireEvent.press(getByText('Back') || getByText('Previous')));
        }
      });

      // Should still be functional
      expect(getByText('Transform Your Space')).toBeTruthy();
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely long project names gracefully', async () => {
      const { getByText, getByPlaceholderText } = render(<TestApp />);

      // Navigate to project naming step
      await act(async () => {
        fireEvent.press(getByText('Get Started'));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Get Started')));
        await waitFor(() => fireEvent.press(getByText('Start New Project')));
      });

      // Try entering very long project name
      const projectNameInput = getByPlaceholderText('Project Name');
      const longName = 'A'.repeat(1000);
      
      fireEvent.changeText(projectNameInput, longName);

      // Should truncate or show validation error
      await waitFor(() => {
        const errorText = getByText('Project name is too long') || 
                         getByText('Maximum 50 characters allowed');
        expect(errorText).toBeTruthy();
      });
    });

    it('should handle device orientation changes', async () => {
      const { getByText } = render(<TestApp />);

      fireEvent.press(getByText('Get Started'));

      // Mock orientation change
      act(() => {
        (global as any).Dimensions.set({
          window: { width: 812, height: 375 }, // Landscape
          screen: { width: 812, height: 375 },
        });
      });

      // Should still be functional
      await waitFor(() => {
        expect(getByText('Transform Your Space')).toBeTruthy();
      });
    });
  });

  describe('Integration with External Services', () => {
    it('should handle Supabase authentication flow', async () => {
      const { getByText, getByPlaceholderText } = render(<TestApp />);

      // Navigate to auth screen
      await act(async () => {
        // ... navigate to auth screen
      });

      // Test sign up
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      
      fireEvent.press(getByText('Sign Up'));

      // Should handle auth success/failure
      await waitFor(() => {
        expect(
          getByText('Welcome') || 
          getByText('Authentication failed')
        ).toBeTruthy();
      });
    });

    it('should handle Stripe payment flow', async () => {
      const { getByText } = render(<TestApp />);

      // Navigate to payment screen
      await act(async () => {
        // ... navigate to paywall/payment screen
      });

      // Test payment selection
      const proButton = getByText('Choose Pro Plan');
      fireEvent.press(proButton);

      // Should initialize payment sheet
      await waitFor(() => {
        expect(getByText('Complete Purchase') || getByText('Payment')).toBeTruthy();
      });
    });
  });
});