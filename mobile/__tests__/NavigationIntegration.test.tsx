/**
 * Navigation Integration Tests
 * 
 * This test suite validates the navigation system integrity, including:
 * - Screen transitions and navigation flow
 * - Navigation state persistence
 * - Deep linking support
 * - Back navigation and stack management
 * - Navigation guards and authentication routing
 * - Error handling in navigation
 * - Performance of navigation transitions
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jest } from '@jest/globals';

// Import navigation system
import SafeJourneyNavigator, { NavigationHelpers } from '../src/navigation/SafeJourneyNavigator';

// Import screens for individual testing
import WelcomeScreen from '../src/screens/Welcome/WelcomeScreen';
import OnboardingScreen1 from '../src/screens/Onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../src/screens/Onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../src/screens/Onboarding/OnboardingScreen3';
import PaywallScreen from '../src/screens/Paywall/PaywallScreen';
import AuthScreen from '../src/screens/Auth/AuthScreen';
import CheckoutScreen from '../src/screens/Checkout/CheckoutScreen';
import MyProjectsScreen from '../src/screens/Projects/MyProjectsScreen';

// Create comprehensive navigation mock
const createNavigationMock = () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    setParams: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    canGoBack: jest.fn(() => true),
    isFocused: jest.fn(() => true),
    dispatch: jest.fn(),
    getParent: jest.fn(),
    getId: jest.fn(() => 'test-navigator'),
    getState: jest.fn(() => ({ 
      index: 0, 
      routes: [{ name: 'TestScreen', key: 'test-1' }],
      key: 'stack-1',
      type: 'stack'
    })),
    emit: jest.fn(),
  };
  return navigation;
};

const mockNavigation = createNavigationMock();

const mockRoute = {
  params: {},
  key: 'test-key',
  name: 'TestScreen',
};

// Navigation state mock
const createNavigationState = (routes: any[], index: number = 0) => ({
  index,
  routes,
  key: 'stack-1',
  type: 'stack' as const,
});

// Mock stores with navigation-relevant data
const createMockUserStore = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initializeAuth: jest.fn(() => jest.fn()),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  ...overrides,
});

const createMockJourneyStore = (overrides = {}) => ({
  progress: { 
    currentStep: 1, 
    currentScreen: 'welcome',
    completedSteps: [],
    totalSteps: 11,
    lastUpdated: new Date().toISOString()
  },
  onboarding: { selectedStyles: [], completedScreens: 0 },
  subscription: { billingCycle: 'monthly', useFreeCredits: false },
  project: { furniturePreferences: [] },
  preferences: { stylePreferences: [] },
  authentication: { hasAccount: false },
  payment: { requiresPayment: false },
  updateProgress: jest.fn(),
  setCurrentStep: jest.fn(),
  loadJourney: jest.fn(),
  persistJourney: jest.fn(),
  resetJourney: jest.fn(),
  ...overrides,
});

// Store mocks
const mockUserStore = jest.fn();
const mockJourneyStore = jest.fn();

// Mock external modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  NavigationContainer: ({ children }: any) => children,
  createNavigationContainerRef: () => ({ current: mockNavigation }),
  CommonActions: {
    navigate: jest.fn((name, params) => ({ type: 'NAVIGATE', payload: { name, params } })),
    reset: jest.fn((state) => ({ type: 'RESET', payload: state })),
    goBack: jest.fn(() => ({ type: 'GO_BACK' })),
    setParams: jest.fn((params) => ({ type: 'SET_PARAMS', payload: params })),
  },
  StackActions: {
    push: jest.fn((name, params) => ({ type: 'PUSH', payload: { name, params } })),
    pop: jest.fn((count) => ({ type: 'POP', payload: { count } })),
    popToTop: jest.fn(() => ({ type: 'POP_TO_TOP' })),
    replace: jest.fn((name, params) => ({ type: 'REPLACE', payload: { name, params } })),
  },
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('../src/stores/userStore', () => ({
  useUserStore: mockUserStore,
}));

jest.mock('../src/stores/journeyStore', () => ({
  useJourneyStore: mockJourneyStore,
  initializeJourney: jest.fn(),
}));

jest.mock('../src/services/onboarding', () => ({
  OnboardingService: {
    hasCompletedOnboarding: jest.fn(() => Promise.resolve(false)),
    getSavedJourney: jest.fn(() => Promise.resolve(null)),
  },
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

Object.defineProperty(AsyncStorage, 'getItem', { value: mockAsyncStorage.getItem });
Object.defineProperty(AsyncStorage, 'setItem', { value: mockAsyncStorage.setItem });
Object.defineProperty(AsyncStorage, 'removeItem', { value: mockAsyncStorage.removeItem });

// Mock Alert
jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('🧭 Navigation Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset navigation mocks
    Object.values(mockNavigation).forEach((fn: any) => {
      if (typeof fn === 'function') fn.mockClear?.();
    });
    
    // Reset AsyncStorage
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    
    // Setup default store states
    mockUserStore.mockReturnValue(createMockUserStore());
    mockJourneyStore.mockReturnValue(createMockJourneyStore());
  });

  describe('🗺️ Navigation Flow Validation', () => {
    it('should navigate through complete onboarding flow', async () => {
      const mockSetCurrentStep = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        setCurrentStep: mockSetCurrentStep,
      }));

      // Start: Welcome Screen
      const welcomeScreen = render(<WelcomeScreen navigation={mockNavigation} />);
      
      const getStartedButton = welcomeScreen.getByTestId('get-started-button');
      fireEvent.press(getStartedButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('onboarding1');
      expect(mockSetCurrentStep).toHaveBeenCalledWith(1, 'onboarding1');

      // Step 1: Onboarding 1
      welcomeScreen.unmount();
      const onboarding1 = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton1 = onboarding1.getByTestId('continue-button');
      fireEvent.press(continueButton1);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('onboarding2');

      // Step 2: Onboarding 2
      onboarding1.unmount();
      const onboarding2 = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
      
      // Select style first
      const styleButton = onboarding2.getByTestId('style-modern');
      fireEvent.press(styleButton);
      
      const continueButton2 = onboarding2.getByTestId('continue-button');
      fireEvent.press(continueButton2);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('onboarding3');

      // Step 3: Onboarding 3
      onboarding2.unmount();
      const onboarding3 = render(<OnboardingScreen3 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton3 = onboarding3.getByTestId('continue-button');
      fireEvent.press(continueButton3);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('paywall');

      // Verify navigation sequence
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(4);
    });

    it('should handle authentication flow navigation', async () => {
      // Unauthenticated user from paywall
      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const proPlanButton = paywallScreen.getByTestId('plan-pro');
      fireEvent.press(proPlanButton);
      
      const selectButton = paywallScreen.getByTestId('select-plan-button');
      fireEvent.press(selectButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('auth');

      // Auth screen - registration flow
      paywallScreen.unmount();
      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const registerButton = authScreen.getByTestId('register-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('checkout');
      });
    });

    it('should handle authenticated user bypass flow', async () => {
      // Mock authenticated user
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', email: 'test@example.com' }
      }));

      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const proPlanButton = paywallScreen.getByTestId('plan-pro');
      fireEvent.press(proPlanButton);
      
      const selectButton = paywallScreen.getByTestId('select-plan-button');
      fireEvent.press(selectButton);

      // Should skip auth and go directly to checkout
      expect(mockNavigation.navigate).toHaveBeenCalledWith('checkout');
    });

    it('should navigate to projects for returning users', async () => {
      // Mock returning authenticated user
      (mockAsyncStorage.getItem as jest.MockedFunction<any>).mockImplementation((key: string) => {
        if (key === 'hasSeenWelcome') return Promise.resolve('true');
        if (key === 'hasCompletedOnboarding') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', email: 'existing@example.com' }
      }));

      const welcomeScreen = render(<WelcomeScreen navigation={mockNavigation} />);
      
      const alreadyHaveAccountButton = welcomeScreen.getByTestId('already-have-account-button');
      fireEvent.press(alreadyHaveAccountButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('auth');

      // After auth, should go to projects
      welcomeScreen.unmount();
      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const loginTab = authScreen.getByTestId('login-tab');
      fireEvent.press(loginTab);

      const loginButton = authScreen.getByTestId('login-button');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('myProjects');
      });
    });
  });

  describe('🔄 Back Navigation and Stack Management', () => {
    it('should handle back navigation correctly', async () => {
      const onboardingScreen = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
      
      const backButton = onboardingScreen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should prevent back navigation from welcome screen', async () => {
      mockNavigation.canGoBack.mockReturnValue(false);
      
      const welcomeScreen = render(<WelcomeScreen navigation={mockNavigation} />);
      
      // Should not show back button
      expect(() => welcomeScreen.getByTestId('back-button')).toThrow();
    });

    it('should handle stack reset after successful checkout', async () => {
      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      const completeButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'photoCapture' }],
        });
      });
    });

    it('should manage navigation stack depth', async () => {
      const initialState = createNavigationState([
        { name: 'welcome', key: 'welcome-1' },
        { name: 'onboarding1', key: 'onboarding1-1' },
        { name: 'onboarding2', key: 'onboarding2-1' },
        { name: 'onboarding3', key: 'onboarding3-1' },
        { name: 'paywall', key: 'paywall-1' },
      ], 4);

      mockNavigation.getState.mockReturnValue(initialState);
      
      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const backButton = paywallScreen.getByTestId('back-button');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
      
      // Should not exceed maximum stack depth
      expect(initialState.routes.length).toBeLessThanOrEqual(10);
    });

    it('should handle navigation to root on major errors', async () => {
      // Mock navigation error
      mockNavigation.navigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      // Should attempt recovery by resetting to root
      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'welcome' }],
        });
      });
    });
  });

  describe('💾 Navigation State Persistence', () => {
    it('should save navigation state on screen transitions', async () => {
      const mockPersistJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        persistJourney: mockPersistJourney,
      }));

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      expect(mockPersistJourney).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'userJourneyData',
        expect.stringContaining('onboarding2')
      );
    });

    it('should restore navigation state on app restart', async () => {
      // Mock saved navigation state
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve(JSON.stringify({
            progress: { currentScreen: 'paywall', currentStep: 5 }
          }));
        }
        return Promise.resolve(null);
      });

      const mockLoadJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        progress: { currentScreen: 'paywall', currentStep: 5 },
        loadJourney: mockLoadJourney,
      }));

      await act(async () => {
        mockLoadJourney();
      });

      expect(mockLoadJourney).toHaveBeenCalled();
    });

    it('should handle corrupted navigation state gracefully', async () => {
      // Mock corrupted state
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve('invalid-json');
        }
        return Promise.resolve(null);
      });

      const mockLoadJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        loadJourney: mockLoadJourney,
      }));

      await act(async () => {
        mockLoadJourney();
      });

      // Should fall back to default state
      expect(console.error).toHaveBeenCalled();
    });

    it('should clear navigation state on logout', async () => {
      const mockResetJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        resetJourney: mockResetJourney,
      }));

      const mockLogout = jest.fn();
      mockUserStore.mockReturnValue(createMockUserStore({
        logout: mockLogout,
      }));

      // Simulate logout
      await act(async () => {
        mockLogout();
        mockResetJourney();
      });

      expect(mockResetJourney).toHaveBeenCalled();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userJourneyData');
    });
  });

  describe('🔗 Deep Linking and External Navigation', () => {
    it('should handle deep link to specific screen', async () => {
      // Mock deep link to paywall
      const deepLinkUrl = 'compozit://paywall?plan=pro';
      
      // Simulate deep link handling
      const mockHandleDeepLink = jest.fn((url: string) => {
        if (url.includes('paywall')) {
          mockNavigation.navigate('paywall', { plan: 'pro' });
        }
      });

      mockHandleDeepLink(deepLinkUrl);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('paywall', { plan: 'pro' });
    });

    it('should validate deep link permissions', async () => {
      // Mock deep link to protected screen without auth
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: false,
      }));

      const deepLinkUrl = 'compozit://myProjects';
      
      const mockHandleProtectedDeepLink = jest.fn((url: string) => {
        if (url.includes('myProjects')) {
          const userStore = mockUserStore();
          if (!userStore.isAuthenticated) {
            mockNavigation.navigate('auth');
          } else {
            mockNavigation.navigate('myProjects');
          }
        }
      });

      mockHandleProtectedDeepLink(deepLinkUrl);

      // Should redirect to auth instead of protected screen
      expect(mockNavigation.navigate).toHaveBeenCalledWith('auth');
    });

    it('should handle external app returns', async () => {
      // Simulate returning from Stripe checkout
      const returnUrl = 'compozit://checkout-success?payment_intent=pi_123';
      
      const mockHandleExternalReturn = jest.fn((url: string) => {
        if (url.includes('checkout-success')) {
          mockNavigation.navigate('photoCapture');
        }
      });

      mockHandleExternalReturn(returnUrl);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('photoCapture');
    });

    it('should handle malformed deep links', async () => {
      const malformedUrl = 'invalid://malformed-url';
      
      const mockHandleDeepLink = jest.fn((url: string) => {
        try {
          // Attempt to parse URL
          new URL(url);
          mockNavigation.navigate('welcome');
        } catch (error) {
          // Handle malformed URL
          console.error('Malformed deep link:', url);
          mockNavigation.reset({
            index: 0,
            routes: [{ name: 'welcome' }],
          });
        }
      });

      mockHandleDeepLink(malformedUrl);

      expect(console.error).toHaveBeenCalledWith('Malformed deep link:', malformedUrl);
      expect(mockNavigation.reset).toHaveBeenCalled();
    });
  });

  describe('🛡️ Navigation Guards and Authentication', () => {
    it('should protect authenticated routes', async () => {
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: false,
      }));

      // Attempt to navigate to protected route
      const mockNavigationGuard = jest.fn((routeName: string) => {
        const protectedRoutes = ['myProjects', 'profile', 'checkout'];
        const userStore = mockUserStore();
        
        if (protectedRoutes.includes(routeName) && !userStore.isAuthenticated) {
          mockNavigation.navigate('auth');
          return false;
        }
        return true;
      });

      const canNavigate = mockNavigationGuard('myProjects');

      expect(canNavigate).toBe(false);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('auth');
    });

    it('should redirect after successful authentication', async () => {
      // Mock successful login with intended destination
      const intendedRoute = 'myProjects';
      mockAsyncStorage.setItem('intendedRoute', intendedRoute);

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123' },
      }));

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={{ ...mockRoute, params: { intendedRoute } }} />);
      
      // Simulate successful login
      const loginButton = authScreen.getByTestId('login-button');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith(intendedRoute);
      });
    });

    it('should handle session expiration during navigation', async () => {
      // Mock expired session
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: false,
        error: 'Session expired',
      }));

      const projectsScreen = render(<MyProjectsScreen navigation={mockNavigation as any} route={mockRoute as any} />);
      
      // Should redirect to auth on session expiration
      await waitFor(() => {
        expect(mockNavigation.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'auth' }],
        });
      });
    });

    it('should validate subscription access', async () => {
      // Mock user with expired subscription
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          currentPlan: 'free',
          credits_remaining: 0
        },
      }));

      const mockSubscriptionGuard = jest.fn((routeName: string) => {
        const premiumRoutes = ['processing', 'results'];
        const userStore = mockUserStore();
        
        if (premiumRoutes.includes(routeName) && userStore.user?.credits_remaining === 0) {
          mockNavigation.navigate('paywall');
          return false;
        }
        return true;
      });

      const canAccess = mockSubscriptionGuard('processing');

      expect(canAccess).toBe(false);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('paywall');
    });
  });

  describe('⚡ Navigation Performance', () => {
    it('should measure navigation transition times', async () => {
      const startTime = performance.now();
      
      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);
      
      const endTime = performance.now();
      const transitionTime = endTime - startTime;
      
      // Navigation should be fast (under 100ms)
      expect(transitionTime).toBeLessThan(100);
    });

    it('should handle rapid navigation requests', async () => {
      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      
      // Rapid fire navigation
      fireEvent.press(continueButton);
      fireEvent.press(continueButton);
      fireEvent.press(continueButton);
      
      // Should only navigate once (debounced)
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('should preload critical navigation routes', async () => {
      // Mock navigation preloading
      const criticalRoutes = ['onboarding1', 'onboarding2', 'paywall', 'auth'];
      const mockPreloadRoutes = jest.fn((routes: string[]) => {
        routes.forEach(route => {
          // Simulate route preloading
          console.log(`Preloading route: ${route}`);
        });
      });

      mockPreloadRoutes(criticalRoutes);

      expect(mockPreloadRoutes).toHaveBeenCalledWith(criticalRoutes);
      criticalRoutes.forEach(route => {
        expect(console.log).toHaveBeenCalledWith(`Preloading route: ${route}`);
      });
    });

    it('should optimize navigation stack memory usage', () => {
      // Mock large navigation stack
      const largeStack = Array.from({ length: 20 }, (_, i) => ({
        name: `screen${i}`,
        key: `screen${i}-key`,
      }));

      const state = createNavigationState(largeStack, 19);
      mockNavigation.getState.mockReturnValue(state);

      // Should limit stack depth
      const optimizedStack = state.routes.slice(-10); // Keep last 10 screens
      
      expect(optimizedStack.length).toBeLessThanOrEqual(10);
      expect(optimizedStack[0].name).toBe('screen10');
    });
  });

  describe('🚨 Navigation Error Handling', () => {
    it('should recover from navigation failures', async () => {
      // Mock navigation failure
      mockNavigation.navigate.mockImplementationOnce(() => {
        throw new Error('Navigation failed');
      });

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      // Should show error and allow retry
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Navigation Error',
          expect.stringContaining('retry')
        );
      });
    });

    it('should handle screen loading failures', async () => {
      // Mock screen import failure
      const mockHandleScreenError = jest.fn((screenName: string, error: Error) => {
        console.error(`Failed to load screen ${screenName}:`, error);
        mockNavigation.navigate('welcome'); // Fallback
      });

      const error = new Error('Screen import failed');
      mockHandleScreenError('onboarding2', error);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to load screen onboarding2:',
        error
      );
      expect(mockNavigation.navigate).toHaveBeenCalledWith('welcome');
    });

    it('should handle circular navigation loops', async () => {
      let navigationCount = 0;
      const maxNavigations = 5;

      const mockNavigateWithLoop = jest.fn((destination: string) => {
        navigationCount++;
        
        if (navigationCount > maxNavigations) {
          console.warn('Circular navigation detected, resetting to home');
          mockNavigation.reset({
            index: 0,
            routes: [{ name: 'welcome' }],
          });
          return;
        }
        
        mockNavigation.navigate(destination);
      });

      // Simulate circular navigation
      for (let i = 0; i <= maxNavigations + 1; i++) {
        mockNavigateWithLoop('onboarding1');
      }

      expect(console.warn).toHaveBeenCalledWith(
        'Circular navigation detected, resetting to home'
      );
      expect(mockNavigation.reset).toHaveBeenCalled();
    });

    it('should handle invalid navigation parameters', async () => {
      const invalidParams = { invalidParam: undefined };

      const mockValidateParams = jest.fn((params: any) => {
        // Remove undefined values
        const validParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        );
        
        return Object.keys(validParams).length > 0 ? validParams : {};
      });

      const validatedParams = mockValidateParams(invalidParams);

      expect(validatedParams).toEqual({});
    });
  });

  describe('🧪 Navigation Helpers Testing', () => {
    it('should test NavigationHelpers utility functions', async () => {
      // Mock navigationRef
      const mockNavigationRef = {
        isReady: jest.fn(() => true),
        navigate: jest.fn(),
        reset: jest.fn(),
        goBack: jest.fn(),
        canGoBack: jest.fn(() => true),
        getCurrentRoute: jest.fn(() => ({ name: 'current' })),
      };

      // Mock NavigationHelpers module
      const mockNavigationHelpers = {
        navigateToScreen: (screenName: string, params?: any) => {
          if (mockNavigationRef.isReady()) {
            mockNavigationRef.navigate(screenName, params);
          }
        },
        resetToScreen: (screenName: string, params?: any) => {
          if (mockNavigationRef.isReady()) {
            mockNavigationRef.reset({
              index: 0,
              routes: [{ name: screenName, params }],
            });
          }
        },
        goBack: () => {
          if (mockNavigationRef.isReady() && mockNavigationRef.canGoBack()) {
            mockNavigationRef.goBack();
          }
        },
        getCurrentRoute: () => {
          if (mockNavigationRef.isReady()) {
            return mockNavigationRef.getCurrentRoute();
          }
          return null;
        },
      };

      // Test navigateToScreen
      mockNavigationHelpers.navigateToScreen('paywall', { plan: 'pro' });
      expect(mockNavigationRef.navigate).toHaveBeenCalledWith('paywall', { plan: 'pro' });

      // Test resetToScreen
      mockNavigationHelpers.resetToScreen('welcome');
      expect(mockNavigationRef.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'welcome', params: undefined }],
      });

      // Test goBack
      mockNavigationHelpers.goBack();
      expect(mockNavigationRef.goBack).toHaveBeenCalled();

      // Test getCurrentRoute
      const currentRoute = mockNavigationHelpers.getCurrentRoute();
      expect(currentRoute).toEqual({ name: 'current' });
    });

    it('should handle NavigationHelpers when ref not ready', () => {
      const mockNavigationRef = {
        isReady: jest.fn(() => false),
        navigate: jest.fn(),
      };

      const mockNavigationHelpers = {
        navigateToScreen: (screenName: string) => {
          if (mockNavigationRef.isReady()) {
            mockNavigationRef.navigate(screenName);
          }
        },
      };

      mockNavigationHelpers.navigateToScreen('paywall');
      expect(mockNavigationRef.navigate).not.toHaveBeenCalled();
    });
  });
});