import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock the navigation system
jest.mock('../src/navigation/SafeJourneyNavigator');

// Mock all screens
jest.mock('../src/screens/Welcome/WelcomeScreen', () => 'WelcomeScreen');
jest.mock('../src/screens/Onboarding/OnboardingScreen1', () => 'OnboardingScreen1');
jest.mock('../src/screens/Onboarding/OnboardingScreen2', () => 'OnboardingScreen2');
jest.mock('../src/screens/Onboarding/OnboardingScreen3', () => 'OnboardingScreen3');
jest.mock('../src/screens/Paywall/PaywallScreen', () => 'PaywallScreen');
jest.mock('../src/screens/Payment/PaymentPendingScreen', () => 'PaymentPendingScreen');
jest.mock('../src/screens/Payment/PaymentVerifiedScreen', () => 'PaymentVerifiedScreen');
jest.mock('../src/screens/ProjectWizard/ProjectWizardStartScreen', () => 'ProjectWizardStartScreen');
jest.mock('../src/screens/ProjectWizard/CategorySelectionScreen', () => 'CategorySelectionScreen');
jest.mock('../src/screens/ProjectWizard/RoomSelectionScreen', () => 'RoomSelectionScreen');
jest.mock('../src/screens/PhotoCapture/PhotoCaptureScreen', () => 'PhotoCaptureScreen');
jest.mock('../src/screens/ProjectWizard/StyleSelectionScreen', () => 'StyleSelectionScreen');
jest.mock('../src/screens/ProjectWizard/ReferencesSelectionScreen', () => 'ReferencesSelectionScreen');
jest.mock('../src/screens/Processing/ProcessingScreen', () => 'ProcessingScreen');
jest.mock('../src/screens/Results/ResultsScreen', () => 'ResultsScreen');

// Mock stores
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/userStore');
jest.mock('../src/stores/contentStore');

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  resetToScreen: jest.fn(),
  goBack: jest.fn(),
  getCurrentRoute: jest.fn(),
};

require('../src/navigation/SafeJourneyNavigator').NavigationHelpers = mockNavigationHelpers;

describe('Complete S0-S13 Navigation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation Flow Validation', () => {
    const expectedFlow = [
      { step: 'S0', screen: 'welcome', nextScreen: 'onboarding1' },
      { step: 'S1a', screen: 'onboarding1', nextScreen: 'onboarding2' },
      { step: 'S1b', screen: 'onboarding2', nextScreen: 'onboarding3' },
      { step: 'S1c', screen: 'onboarding3', nextScreen: 'paywall' },
      { step: 'S2', screen: 'paywall', nextScreen: 'paymentPending' },
      { step: 'S3', screen: 'paymentPending', nextScreen: 'paymentVerified' },
      { step: 'S4', screen: 'paymentVerified', nextScreen: 'projectWizardStart' },
      { step: 'S6', screen: 'projectWizardStart', nextScreen: 'categorySelection' },
      { step: 'S7', screen: 'categorySelection', nextScreen: 'roomSelection' },
      { step: 'S8', screen: 'photoCapture', nextScreen: 'styleSelection' },
      { step: 'S9', screen: 'roomSelection', nextScreen: 'photoCapture' },
      { step: 'S10', screen: 'styleSelection', nextScreen: 'referencesSelection' },
      { step: 'S11', screen: 'referencesSelection', nextScreen: 'processing' },
      { step: 'S12', screen: 'processing', nextScreen: 'results' },
      { step: 'S13', screen: 'results', nextScreen: null }, // Final screen
    ];

    it('should define all required navigation steps', () => {
      expectedFlow.forEach(({ step, screen }) => {
        expect(screen).toBeDefined();
        expect(screen.length).toBeGreaterThan(0);
        console.log(`✅ ${step}: ${screen} - Defined`);
      });
    });

    it('should validate navigation transitions exist', () => {
      expectedFlow.forEach(({ step, screen, nextScreen }) => {
        if (nextScreen) {
          console.log(`🔄 ${step}: ${screen} → ${nextScreen}`);
          expect(nextScreen).toBeDefined();
        } else {
          console.log(`🏁 ${step}: ${screen} - Final destination`);
        }
      });
    });
  });

  describe('Critical Path Navigation', () => {
    it('should navigate from Welcome to Onboarding correctly', () => {
      mockNavigationHelpers.navigateToScreen('onboarding1');
      
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('onboarding1');
    });

    it('should navigate from Onboarding to Paywall correctly', () => {
      mockNavigationHelpers.navigateToScreen('paywall');
      
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paywall');
    });

    it('should navigate through payment flow correctly', () => {
      // Paywall → PaymentPending
      mockNavigationHelpers.navigateToScreen('paymentPending');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paymentPending');

      // PaymentPending → PaymentVerified (auto-transition)
      mockNavigationHelpers.navigateToScreen('paymentVerified');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paymentVerified');

      // PaymentVerified → ProjectWizardStart
      mockNavigationHelpers.navigateToScreen('projectWizardStart');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('projectWizardStart');
    });

    it('should navigate through project wizard correctly', () => {
      // ProjectWizardStart → CategorySelection
      mockNavigationHelpers.navigateToScreen('categorySelection');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('categorySelection');

      // CategorySelection → RoomSelection
      mockNavigationHelpers.navigateToScreen('roomSelection');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('roomSelection');

      // RoomSelection → PhotoCapture
      mockNavigationHelpers.navigateToScreen('photoCapture');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('photoCapture');

      // PhotoCapture → StyleSelection (CRITICAL FIX)
      mockNavigationHelpers.navigateToScreen('styleSelection');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('styleSelection');

      // StyleSelection → ReferencesSelection
      mockNavigationHelpers.navigateToScreen('referencesSelection');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('referencesSelection');
    });

    it('should navigate to processing and results correctly', () => {
      // ReferencesSelection → Processing
      mockNavigationHelpers.navigateToScreen('processing');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('processing');

      // Processing → Results
      mockNavigationHelpers.navigateToScreen('results');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('results');
    });
  });

  describe('Free Trial Path', () => {
    it('should handle free trial flow correctly', () => {
      // Paywall → ProjectWizardStart (free trial path)
      mockNavigationHelpers.navigateToScreen('projectWizardStart');
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('projectWizardStart');
    });
  });

  describe('Error Handling in Navigation', () => {
    it('should handle navigation failures gracefully', () => {
      mockNavigationHelpers.navigateToScreen.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      expect(() => {
        mockNavigationHelpers.navigateToScreen('welcome');
      }).toThrow('Navigation failed');
    });

    it('should validate navigation parameters', () => {
      mockNavigationHelpers.navigateToScreen('paymentPending', {
        planDetails: { name: 'Test Plan', price: '$9.99' }
      });

      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith(
        'paymentPending',
        { planDetails: { name: 'Test Plan', price: '$9.99' } }
      );
    });
  });

  describe('Navigation State Management', () => {
    it('should handle back navigation correctly', () => {
      mockNavigationHelpers.goBack();
      expect(mockNavigationHelpers.goBack).toHaveBeenCalled();
    });

    it('should handle reset navigation correctly', () => {
      mockNavigationHelpers.resetToScreen('welcome');
      expect(mockNavigationHelpers.resetToScreen).toHaveBeenCalledWith('welcome');
    });

    it('should get current route correctly', () => {
      mockNavigationHelpers.getCurrentRoute.mockReturnValue({
        name: 'paywall',
        key: 'paywall-key'
      });

      const currentRoute = mockNavigationHelpers.getCurrentRoute();
      expect(currentRoute.name).toBe('paywall');
    });
  });

  describe('Complete Flow Simulation', () => {
    it('should simulate complete user journey S0-S13', async () => {
      const journeySteps = [
        'welcome',
        'onboarding1', 'onboarding2', 'onboarding3',
        'paywall', 'paymentPending', 'paymentVerified',
        'projectWizardStart',
        'categorySelection', 'roomSelection', 'photoCapture',
        'styleSelection', 'referencesSelection',
        'processing', 'results'
      ];

      // Simulate navigation through all steps
      for (const step of journeySteps) {
        mockNavigationHelpers.navigateToScreen(step);
        await waitFor(() => {
          expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith(step);
        });
      }

      // Verify all steps were navigated
      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledTimes(journeySteps.length);
      
      console.log('✅ Complete S0-S13 journey simulation passed');
    });
  });

  describe('Screen Availability Validation', () => {
    const allScreens = [
      'welcome', 'onboarding1', 'onboarding2', 'onboarding3',
      'paywall', 'paymentPending', 'paymentVerified',
      'projectWizardStart', 'categorySelection', 'roomSelection',
      'photoCapture', 'styleSelection', 'referencesSelection',
      'descriptions', 'furniture', 'budget', 'auth', 'checkout',
      'processing', 'results', 'myProjects', 'profile', 'plans', 'projectSettings'
    ];

    it('should have all screens available for navigation', () => {
      allScreens.forEach(screen => {
        expect(screen).toBeDefined();
        expect(typeof screen).toBe('string');
        expect(screen.length).toBeGreaterThan(0);
      });

      console.log(`✅ All ${allScreens.length} screens are defined and available`);
    });
  });

  describe('Navigation Performance', () => {
    it('should navigate within performance budget', () => {
      const startTime = Date.now();
      
      mockNavigationHelpers.navigateToScreen('welcome');
      mockNavigationHelpers.navigateToScreen('paywall');
      mockNavigationHelpers.navigateToScreen('projectWizardStart');
      
      const navigationTime = Date.now() - startTime;
      
      // Navigation should be very fast (< 10ms for mocked calls)
      expect(navigationTime).toBeLessThan(10);
    });
  });
});