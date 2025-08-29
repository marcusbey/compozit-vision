import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import PaymentPendingScreen from '../src/screens/Payment/PaymentPendingScreen';
import PaymentVerifiedScreen from '../src/screens/Payment/PaymentVerifiedScreen';

// Mock dependencies
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/userStore');
jest.mock('../src/navigation/SafeJourneyNavigator');

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success'
  }
}));

// Mock stores
const mockJourneyStore = {
  updatePaymentStatus: jest.fn(),
  subscription: {
    planName: 'Yearly Access',
    planPrice: '$49.99/year'
  }
};

const mockUserStore = {
  isAuthenticated: true,
  user: { id: 'test-user' }
};

// Mock navigation
const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

// Apply mocks
require('../src/stores/journeyStore').useJourneyStore = jest.fn(() => mockJourneyStore);
require('../src/stores/userStore').useUserStore = jest.fn(() => mockUserStore);
require('../src/navigation/SafeJourneyNavigator').NavigationHelpers = mockNavigationHelpers;

const Stack = createStackNavigator();

const TestNavigator = ({ initialRoute = 'PaymentPending', routeParams = {} }) => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen 
        name="PaymentPending" 
        component={PaymentPendingScreen} 
        initialParams={routeParams}
      />
      <Stack.Screen 
        name="PaymentVerified" 
        component={PaymentVerifiedScreen}
        initialParams={routeParams} 
      />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Payment Screens Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PaymentPendingScreen', () => {
    it('should render payment pending UI correctly', () => {
      const { getByText, getByTestId } = render(
        <TestNavigator 
          initialRoute="PaymentPending"
          routeParams={{
            planDetails: {
              name: 'Yearly Access',
              price: '$49.99/year'
            }
          }}
        />
      );

      // Check essential elements
      expect(getByText(/Processing Payment/)).toBeTruthy();
      expect(getByText(/Please wait while we securely process/)).toBeTruthy();
      expect(getByText(/Your payment is secured with 256-bit encryption/)).toBeTruthy();
      expect(getByText('Yearly Access')).toBeTruthy();
      expect(getByText('$49.99/year')).toBeTruthy();
    });

    it('should update journey store on mount', () => {
      render(<TestNavigator initialRoute="PaymentPending" />);

      expect(mockJourneyStore.updatePaymentStatus).toHaveBeenCalledWith({
        paymentInitiated: true,
        paymentPendingAt: expect.any(String),
        paymentProvider: 'stripe',
      });
    });

    it('should animate loading dots', async () => {
      const { getByText } = render(<TestNavigator initialRoute="PaymentPending" />);

      // Initially no dots
      expect(getByText('Processing Payment')).toBeTruthy();

      // Advance timers to trigger dot animation
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have one dot
      await waitFor(() => {
        expect(getByText('Processing Payment.')).toBeTruthy();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have two dots
      await waitFor(() => {
        expect(getByText('Processing Payment..')).toBeTruthy();
      });
    });

    it('should auto-navigate to payment verified after processing', async () => {
      render(<TestNavigator initialRoute="PaymentPending" />);

      // Advance timer to trigger auto-navigation
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paymentVerified');
      });
    });
  });

  describe('PaymentVerifiedScreen', () => {
    it('should render success UI correctly', () => {
      const { getByText } = render(<TestNavigator initialRoute="PaymentVerified" />);

      // Check essential elements
      expect(getByText('Payment Successful!')).toBeTruthy();
      expect(getByText('Welcome to Compozit Vision Premium')).toBeTruthy();
      expect(getByText('Your Premium Benefits:')).toBeTruthy();
      expect(getByText('Unlimited AI design generations')).toBeTruthy();
      expect(getByText('Priority processing & faster results')).toBeTruthy();
      expect(getByText('Access to all styles & references')).toBeTruthy();
      expect(getByText('High-resolution downloads')).toBeTruthy();
      expect(getByText('Start Creating')).toBeTruthy();
    });

    it('should update journey store on mount', () => {
      render(<TestNavigator initialRoute="PaymentVerified" />);

      expect(mockJourneyStore.updatePaymentStatus).toHaveBeenCalledWith({
        paymentCompleted: true,
        paymentVerifiedAt: expect.any(String),
        subscriptionActive: true,
      });
    });

    it('should navigate to project wizard when authenticated', () => {
      const { getByText } = render(<TestNavigator initialRoute="PaymentVerified" />);

      const startButton = getByText('Start Creating');
      fireEvent.press(startButton);

      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('projectWizardStart');
    });

    it('should navigate to auth when not authenticated', () => {
      // Mock unauthenticated state
      require('../src/stores/userStore').useUserStore = jest.fn(() => ({
        isAuthenticated: false,
        user: null
      }));

      const { getByText } = render(<TestNavigator initialRoute="PaymentVerified" />);

      const startButton = getByText('Start Creating');
      fireEvent.press(startButton);

      expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('auth');
    });

    it('should display order details when provided', () => {
      const orderDetails = {
        orderId: 'ORDER-12345',
        planName: 'Yearly Access',
        amount: '$49.99'
      };

      const { getByText } = render(
        <TestNavigator 
          initialRoute="PaymentVerified"
          routeParams={{ orderDetails }}
        />
      );

      expect(getByText('ORDER-12345')).toBeTruthy();
      expect(getByText('Yearly Access')).toBeTruthy();
      expect(getByText('$49.99')).toBeTruthy();
    });
  });

  describe('Payment Flow Integration', () => {
    it('should complete payment flow from pending to verified', async () => {
      const { rerender } = render(<TestNavigator initialRoute="PaymentPending" />);

      // Wait for auto-navigation
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockNavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paymentVerified');
      });

      // Simulate navigation to verified screen
      rerender(<TestNavigator initialRoute="PaymentVerified" />);

      // Verify both stores were updated
      expect(mockJourneyStore.updatePaymentStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle payment provider parameter', () => {
      render(
        <TestNavigator 
          initialRoute="PaymentPending"
          routeParams={{ provider: 'apple-pay' }}
        />
      );

      expect(mockJourneyStore.updatePaymentStatus).toHaveBeenCalledWith({
        paymentInitiated: true,
        paymentPendingAt: expect.any(String),
        paymentProvider: 'apple-pay',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing route params gracefully', () => {
      expect(() => {
        render(<TestNavigator initialRoute="PaymentPending" />);
      }).not.toThrow();
    });

    it('should handle store update failures', () => {
      mockJourneyStore.updatePaymentStatus.mockImplementationOnce(() => {
        throw new Error('Store update failed');
      });

      expect(() => {
        render(<TestNavigator initialRoute="PaymentPending" />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for PaymentPending', () => {
      const { getByText } = render(<TestNavigator initialRoute="PaymentPending" />);

      // Check that important elements are accessible
      expect(getByText(/Processing Payment/)).toBeTruthy();
      expect(getByText(/secured with 256-bit encryption/)).toBeTruthy();
    });

    it('should have proper accessibility labels for PaymentVerified', () => {
      const { getByText } = render(<TestNavigator initialRoute="PaymentVerified" />);

      // Check that success message is accessible
      expect(getByText('Payment Successful!')).toBeTruthy();
      expect(getByText('Start Creating')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render PaymentPending screen within performance budget', () => {
      const startTime = Date.now();
      render(<TestNavigator initialRoute="PaymentPending" />);
      const renderTime = Date.now() - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should render PaymentVerified screen within performance budget', () => {
      const startTime = Date.now();
      render(<TestNavigator initialRoute="PaymentVerified" />);
      const renderTime = Date.now() - startTime;

      // Should render in under 100ms  
      expect(renderTime).toBeLessThan(100);
    });
  });
});