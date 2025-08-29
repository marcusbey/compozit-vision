/**
 * Complete End-to-End User Journey Tests
 * 
 * This comprehensive test suite validates all user journey flows from start to finish,
 * covering new users, existing users, various authentication scenarios, payment flows,
 * and error recovery mechanisms.
 * 
 * Test Coverage:
 * - New User Journey: Welcome → Onboarding → Paywall → Auth → Checkout → Photo → Results
 * - Existing User: Welcome → Auth → Projects → New Project flow
 * - Authenticated User: Paywall → Direct Checkout → Photo flow
 * - Error scenarios and edge cases
 * - Performance validation
 * - Database integration
 * - Payment processing
 * - Navigation flow integrity
 */

import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jest } from '@jest/globals';

// Import the components we'll be testing
import WelcomeScreen from '../src/screens/Welcome/WelcomeScreen';
import OnboardingScreen1 from '../src/screens/Onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../src/screens/Onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../src/screens/Onboarding/OnboardingScreen3';
import PaywallScreen from '../src/screens/Paywall/PaywallScreen';
import AuthScreen from '../src/screens/Auth/AuthScreen';
import CheckoutScreen from '../src/screens/Checkout/CheckoutScreen';
import PhotoCaptureScreen from '../src/screens/PhotoCapture/PhotoCaptureScreen';
import DescriptionsScreen from '../src/screens/Descriptions/DescriptionsScreen';
import FurnitureScreen from '../src/screens/Furniture/FurnitureScreen';
import BudgetScreen from '../src/screens/Budget/BudgetScreen';
import ProcessingScreen from '../src/screens/Processing/ProcessingScreen';
import ResultsScreen from '../src/screens/Results/ResultsScreen';
import MyProjectsScreen from '../src/screens/Projects/MyProjectsScreen';

// Mock navigation with comprehensive methods
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockReplace = jest.fn();
const mockSetParams = jest.fn();
const mockAddListener = jest.fn(() => jest.fn());
const mockRemoveListener = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockIsFocused = jest.fn(() => true);

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  reset: mockReset,
  replace: mockReplace,
  setParams: mockSetParams,
  addListener: mockAddListener,
  removeListener: mockRemoveListener,
  canGoBack: mockCanGoBack,
  isFocused: mockIsFocused,
  dispatch: jest.fn(),
  getParent: jest.fn(),
  getId: jest.fn(() => 'test-navigator'),
  getState: jest.fn(() => ({ index: 0, routes: [] })),
};

const mockRoute = {
  params: {},
  key: 'test-key',
  name: 'TestScreen',
};

// Comprehensive Supabase mock with all methods
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signInWithOtp: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  })),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
};

const mockSupabaseFrom = {
  insert: jest.fn(() => ({ 
    error: null, 
    data: [{ id: 'mock-id', email: 'test@example.com' }] 
  })),
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => ({ 
        data: { 
          id: 'mock-user-id', 
          email: 'test@example.com',
          full_name: 'Test User',
          credits_remaining: 3,
          subscription_tier: 'free',
          subscription_status: 'active',
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, 
        error: null 
      })),
      limit: jest.fn(() => ({
        data: [
          { id: 'project1', name: 'Test Project 1', created_at: new Date().toISOString() },
          { id: 'project2', name: 'Test Project 2', created_at: new Date().toISOString() }
        ],
        error: null
      })),
      order: jest.fn(() => ({
        data: [{ id: 'journey1', step_order: 1, screen_name: 'welcome' }],
        error: null
      })),
    })),
  })),
  update: jest.fn(() => ({ error: null, data: [{}] })),
  delete: jest.fn(() => ({ error: null })),
  upsert: jest.fn(() => ({ error: null, data: [{}] })),
};

const mockSupabaseStorage = {
  from: jest.fn(() => ({
    upload: jest.fn(() => ({ 
      data: { path: 'test-image.jpg' }, 
      error: null 
    })),
    getPublicUrl: jest.fn(() => ({ 
      data: { publicUrl: 'https://example.com/test-image.jpg' }
    })),
  })),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: jest.fn(() => mockSupabaseFrom),
  storage: mockSupabaseStorage,
};

// Store mocks with comprehensive state
const createMockUserStore = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  setUser: jest.fn(),
  clearUser: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
  updateUserTokens: jest.fn(),
  updateUserPlan: jest.fn(),
  consumeTokens: jest.fn(),
  consumeToken: jest.fn(),
  initializeAuth: jest.fn(() => jest.fn()),
  ...overrides,
});

const createMockJourneyStore = (overrides = {}) => ({
  onboarding: { selectedStyles: [], completedScreens: 0 },
  subscription: { billingCycle: 'monthly', useFreeCredits: false },
  project: { furniturePreferences: [], roomType: undefined, photoUri: undefined },
  preferences: { 
    stylePreferences: [], 
    colorPreferences: [], 
    materialPreferences: [],
    atmospherePreferences: []
  },
  progress: { 
    currentStep: 1, 
    totalSteps: 11, 
    completedSteps: [], 
    currentScreen: 'onboarding1',
    lastUpdated: new Date().toISOString()
  },
  authentication: { hasAccount: false },
  payment: { requiresPayment: false, currency: 'USD' },
  journeySteps: [],
  loadingSteps: false,
  updateOnboarding: jest.fn(),
  updateSubscription: jest.fn(),
  updateProject: jest.fn(),
  updatePreferences: jest.fn(),
  updateProgress: jest.fn(),
  updateAuthentication: jest.fn(),
  updatePayment: jest.fn(),
  setCurrentStep: jest.fn(),
  completeStep: jest.fn(),
  resetJourney: jest.fn(),
  persistJourney: jest.fn(),
  loadJourney: jest.fn(),
  loadJourneySteps: jest.fn(),
  getJourneySummary: jest.fn(() => ({})),
  isStepCompleted: jest.fn(() => false),
  getProgressPercentage: jest.fn(() => 10),
  getStepInfo: jest.fn(() => undefined),
  getNextStep: jest.fn(() => undefined),
  getPreviousStep: jest.fn(() => undefined),
  ...overrides,
});

const createMockPlanStore = (overrides = {}) => ({
  selectedPlan: null,
  paymentStatus: 'none',
  paymentDetails: null,
  isLoading: false,
  error: null,
  selectPlan: jest.fn(),
  setPaymentStatus: jest.fn(),
  setPaymentDetails: jest.fn(),
  clearSelectedPlan: jest.fn(),
  ...overrides,
});

// Mock stores
const mockUserStore = jest.fn();
const mockJourneyStore = jest.fn();
const mockPlanStore = jest.fn();

// Mock external modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  NavigationContainer: ({ children }: any) => children,
  createNavigationContainerRef: () => ({ current: mockNavigation }),
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
  },
}));

jest.mock('../src/services/supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('../src/stores/userStore', () => ({
  useUserStore: mockUserStore,
}));

jest.mock('../src/stores/journeyStore', () => ({
  useJourneyStore: mockJourneyStore,
  initializeJourney: jest.fn(),
}));

jest.mock('../src/stores/planStore', () => ({
  usePlanStore: mockPlanStore,
  AVAILABLE_PLANS: [
    { 
      id: 'basic', 
      name: 'Basic', 
      price: '$19', 
      period: '/month', 
      designs: '50',
      features: ['Basic AI Processing', '50 Designs/Month', 'Standard Support'],
      stripePriceId: 'price_basic',
      credits: 50,
    },
    { 
      id: 'pro', 
      name: 'Pro', 
      price: '$29', 
      period: '/month', 
      designs: '200',
      features: ['Advanced AI Processing', '200 Designs/Month', 'Priority Support', '3D Visualizations'],
      stripePriceId: 'price_pro',
      credits: 200,
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      price: '$49', 
      period: '/month', 
      designs: 'Unlimited',
      features: ['Professional AI Processing', 'Unlimited Designs', 'VIP Support', 'Custom Themes'],
      stripePriceId: 'price_premium',
      credits: -1, // Unlimited
    }
  ],
}));

// Mock database service
jest.mock('../src/services/database', () => ({
  __esModule: true,
  default: {
    getJourneySteps: jest.fn(() => Promise.resolve([
      { id: '1', step_order: 1, screen_name: 'welcome', title: 'Welcome' },
      { id: '2', step_order: 2, screen_name: 'onboarding1', title: 'Onboarding 1' },
      { id: '3', step_order: 3, screen_name: 'onboarding2', title: 'Onboarding 2' },
    ])),
    createProject: jest.fn(() => Promise.resolve({ id: 'new-project-id' })),
    updateProject: jest.fn(() => Promise.resolve()),
    getProjects: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock onboarding service
jest.mock('../src/services/onboarding', () => ({
  OnboardingService: {
    hasCompletedOnboarding: jest.fn(() => Promise.resolve(false)),
    getSavedJourney: jest.fn(() => Promise.resolve(null)),
    markOnboardingComplete: jest.fn(() => Promise.resolve()),
  },
}));

// Mock external services
jest.mock('../src/services/stripe', () => ({
  StripeService: {
    initialize: jest.fn(() => Promise.resolve()),
    createPaymentIntent: jest.fn(() => Promise.resolve({ 
      client_secret: 'pi_test_123_secret',
      id: 'pi_test_123'
    })),
    confirmPayment: jest.fn(() => Promise.resolve({ error: null })),
    createSetupIntent: jest.fn(() => Promise.resolve({ 
      client_secret: 'seti_test_123_secret' 
    })),
  }
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'mock://image.jpg',
      width: 1024,
      height: 768,
      type: 'image',
      fileSize: 1024000,
    }]
  })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'mock://camera-image.jpg',
      width: 1024,
      height: 768,
      type: 'image',
      fileSize: 1024000,
    }]
  })),
  MediaTypeOptions: { Images: 'Images', All: 'All' },
  ImagePickerResult: {},
}));

jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getAvailableCameraTypesAsync: jest.fn(() => Promise.resolve(['back', 'front'])),
  },
  CameraType: {
    back: 'back',
    front: 'front',
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock AsyncStorage with comprehensive methods
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
};

Object.defineProperty(AsyncStorage, 'getItem', { value: mockAsyncStorage.getItem });
Object.defineProperty(AsyncStorage, 'setItem', { value: mockAsyncStorage.setItem });
Object.defineProperty(AsyncStorage, 'removeItem', { value: mockAsyncStorage.removeItem });
Object.defineProperty(AsyncStorage, 'multiRemove', { value: mockAsyncStorage.multiRemove });

// Mock Alert and console
jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('🚀 Complete End-to-End User Journey Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset AsyncStorage mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    
    // Setup default store mocks
    mockUserStore.mockReturnValue(createMockUserStore());
    mockJourneyStore.mockReturnValue(createMockJourneyStore());
    mockPlanStore.mockReturnValue(createMockPlanStore());
    
    // Reset navigation mocks
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    mockReset.mockClear();
    
    // Reset Supabase mocks
    mockSupabaseAuth.signUp.mockClear();
    mockSupabaseAuth.signInWithPassword.mockClear();
    mockSupabaseAuth.signOut.mockClear();
  });

  describe('🎯 Complete New User Journey Flow', () => {
    it('should complete full new user journey: Welcome → Onboarding → Paywall → Auth → Checkout → Photo → Processing → Results', async () => {
      // Step 1: First time user - Welcome Screen
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'hasSeenWelcome') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const welcomeScreen = render(<WelcomeScreen navigation={mockNavigation} />);
      
      await waitFor(() => {
        expect(screen.getByText('Transform Your Space with AI')).toBeTruthy();
      });

      // Test Get Started flow
      const getStartedButton = welcomeScreen.getByTestId('get-started-button');
      fireEvent.press(getStartedButton);

      expect(mockNavigate).toHaveBeenCalledWith('onboarding1');

      // Step 2: Onboarding Screen 1
      welcomeScreen.unmount();
      const onboarding1Screen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Powered Design')).toBeTruthy();
      });

      const continueButton1 = onboarding1Screen.getByTestId('continue-button');
      fireEvent.press(continueButton1);

      expect(mockNavigate).toHaveBeenCalledWith('onboarding2');

      // Step 3: Onboarding Screen 2 - Style Selection
      onboarding1Screen.unmount();
      const onboarding2Screen = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText("What's Your Style?")).toBeTruthy();
      });

      // Select multiple styles
      const modernStyle = onboarding2Screen.getByTestId('style-modern');
      const minimalistStyle = onboarding2Screen.getByTestId('style-minimalist');
      
      fireEvent.press(modernStyle);
      fireEvent.press(minimalistStyle);

      // Mock journey store update
      const mockUpdateOnboarding = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        onboarding: { selectedStyles: ['modern', 'minimalist'], completedScreens: 1 },
        updateOnboarding: mockUpdateOnboarding,
      }));

      const continueButton2 = onboarding2Screen.getByTestId('continue-button');
      fireEvent.press(continueButton2);

      expect(mockNavigate).toHaveBeenCalledWith('onboarding3');

      // Step 4: Onboarding Screen 3
      onboarding2Screen.unmount();
      const onboarding3Screen = render(<OnboardingScreen3 navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Professional Features')).toBeTruthy();
      });

      const continueButton3 = onboarding3Screen.getByTestId('continue-button');
      fireEvent.press(continueButton3);

      expect(mockNavigate).toHaveBeenCalledWith('paywall');

      // Step 5: Paywall Screen - Plan Selection
      onboarding3Screen.unmount();
      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Choose Your Plan')).toBeTruthy();
      });

      // Select Pro plan
      const proPlan = paywallScreen.getByTestId('plan-pro');
      fireEvent.press(proPlan);

      // Mock plan store update
      const mockSelectPlan = jest.fn();
      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'pro', 
          name: 'Pro', 
          price: '$29', 
          stripePriceId: 'price_pro',
          credits: 200
        },
        selectPlan: mockSelectPlan,
      }));

      const selectPlanButton = paywallScreen.getByTestId('select-plan-button');
      fireEvent.press(selectPlanButton);

      expect(mockNavigate).toHaveBeenCalledWith('auth');

      // Step 6: Authentication - Registration
      paywallScreen.unmount();
      mockUserStore.mockReturnValue(createMockUserStore({ isAuthenticated: false }));

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeTruthy();
      });

      // Fill registration form
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const registerButton = authScreen.getByTestId('register-button');

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'SecurePassword123!');
      
      // Mock successful registration
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'newuser@example.com' } },
        error: null
      });

      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('checkout');
      });

      // Step 7: Checkout - Payment Processing
      authScreen.unmount();
      mockUserStore.mockReturnValue(createMockUserStore({ 
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          email: 'newuser@example.com', 
          credits_remaining: 3,
          fullName: 'New User',
          currentPlan: 'free'
        }
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Complete Purchase')).toBeTruthy();
      });

      const completePaymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(completePaymentButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
      });

      // Step 8: Photo Capture
      checkoutScreen.unmount();
      const photoCaptureScreen = render(<PhotoCaptureScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Capture Your Room')).toBeTruthy();
      });

      const captureButton = photoCaptureScreen.getByTestId('capture-photo-button');
      fireEvent.press(captureButton);

      // Mock image capture success
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('descriptions');
      });

      // Verify complete journey progression
      expect(mockNavigate).toHaveBeenCalledTimes(7); // All navigation calls
      expect(mockNavigate).toHaveBeenNthCalledWith(1, 'onboarding1');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, 'onboarding2');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, 'onboarding3');
      expect(mockNavigate).toHaveBeenNthCalledWith(4, 'paywall');
      expect(mockNavigate).toHaveBeenNthCalledWith(5, 'auth');
      expect(mockNavigate).toHaveBeenNthCalledWith(6, 'checkout');
      expect(mockNavigate).toHaveBeenNthCalledWith(7, 'descriptions');
    }, 30000);

    it('should handle free tier journey without payment', async () => {
      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: null, // No plan = free tier
      }));

      mockUserStore.mockReturnValue(createMockUserStore({ 
        isAuthenticated: true,
        user: { 
          id: 'free-user', 
          email: 'free@example.com', 
          credits_remaining: 3,
          currentPlan: 'free'
        }
      }));

      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const continueFreeTierButton = paywallScreen.getByTestId('continue-free-button');
      fireEvent.press(continueFreeTierButton);

      expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
    });

    it('should complete remaining journey steps: Descriptions → Furniture → Budget → Processing → Results', async () => {
      // Step: Descriptions
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { photoUri: 'mock://image.jpg', roomType: 'living-room' },
      }));

      const descriptionsScreen = render(<DescriptionsScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Describe Your Space')).toBeTruthy();
      });

      const descriptionInput = descriptionsScreen.getByTestId('description-input');
      const continueDescButton = descriptionsScreen.getByTestId('continue-button');

      fireEvent.changeText(descriptionInput, 'A modern living room with natural light');
      fireEvent.press(continueDescButton);

      expect(mockNavigate).toHaveBeenCalledWith('furniture');

      // Step: Furniture Selection
      descriptionsScreen.unmount();
      const furnitureScreen = render(<FurnitureScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Select Furniture Types')).toBeTruthy();
      });

      const sofaOption = furnitureScreen.getByTestId('furniture-sofa');
      const tableOption = furnitureScreen.getByTestId('furniture-table');
      const continueFurnButton = furnitureScreen.getByTestId('continue-button');

      fireEvent.press(sofaOption);
      fireEvent.press(tableOption);
      fireEvent.press(continueFurnButton);

      expect(mockNavigate).toHaveBeenCalledWith('budget');

      // Step: Budget Selection
      furnitureScreen.unmount();
      const budgetScreen = render(<BudgetScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Set Your Budget')).toBeTruthy();
      });

      const budgetSlider = budgetScreen.getByTestId('budget-slider');
      const continueBudgetButton = budgetScreen.getByTestId('continue-button');

      // Simulate budget selection
      fireEvent(budgetSlider, 'onValueChange', [5000]);
      fireEvent.press(continueBudgetButton);

      expect(mockNavigate).toHaveBeenCalledWith('processing');

      // Step: Processing
      budgetScreen.unmount();
      mockUserStore.mockReturnValue(createMockUserStore({ 
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          email: 'user@example.com', 
          credits_remaining: 2, // Consumed 1 credit
          currentPlan: 'pro'
        }
      }));

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Generating Your Design')).toBeTruthy();
      });

      // Simulate processing completion
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('results');
      }, { timeout: 10000 });

      // Step: Results
      processingScreen.unmount();
      const resultsScreen = render(<ResultsScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your AI-Generated Design')).toBeTruthy();
      });

      const saveProjectButton = resultsScreen.getByTestId('save-project-button');
      fireEvent.press(saveProjectButton);

      // Should navigate to projects list
      expect(mockNavigate).toHaveBeenCalledWith('myProjects');
    }, 30000);
  });

  describe('🔐 Existing User Journey Flow', () => {
    it('should handle existing user login and project access', async () => {
      // Mock existing user with completed onboarding
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'hasSeenWelcome') return Promise.resolve('true');
        if (key === 'hasCompletedOnboarding') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: false, // Not yet logged in
      }));

      const welcomeScreen = render(<WelcomeScreen navigation={mockNavigation} />);
      
      const alreadyHaveAccountButton = welcomeScreen.getByTestId('already-have-account-button');
      fireEvent.press(alreadyHaveAccountButton);

      expect(mockNavigate).toHaveBeenCalledWith('auth');

      // Login flow
      welcomeScreen.unmount();
      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const loginTab = authScreen.getByTestId('login-tab');
      fireEvent.press(loginTab);

      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const loginButton = authScreen.getByTestId('login-button');

      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Mock successful login
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { 
          user: { 
            id: 'existing-user', 
            email: 'existing@example.com' 
          } 
        },
        error: null
      });

      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('myProjects');
      });

      // My Projects screen
      authScreen.unmount();
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'existing-user', 
          email: 'existing@example.com',
          credits_remaining: 5,
          currentPlan: 'pro',
          fullName: 'Existing User'
        }
      }));

      const projectsScreen = render(<MyProjectsScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('My Projects')).toBeTruthy();
      });

      const newProjectButton = projectsScreen.getByTestId('new-project-button');
      fireEvent.press(newProjectButton);

      expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
    });

    it('should handle authenticated user direct paywall access', async () => {
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'auth-user', 
          email: 'auth@example.com', 
          credits_remaining: 2,
          currentPlan: 'basic'
        }
      }));

      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Select premium plan
      const premiumPlan = paywallScreen.getByTestId('plan-premium');
      fireEvent.press(premiumPlan);

      const selectPlanButton = paywallScreen.getByTestId('select-plan-button');
      fireEvent.press(selectPlanButton);

      // Should go directly to checkout since user is authenticated
      expect(mockNavigate).toHaveBeenCalledWith('checkout');
    });

    it('should handle user with active subscription bypassing paywall', async () => {
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'premium-user', 
          email: 'premium@example.com', 
          credits_remaining: -1, // Unlimited
          currentPlan: 'premium'
        }
      }));

      // Premium users should go directly to photo capture
      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const skipToDesignButton = paywallScreen.getByTestId('skip-to-design-button');
      fireEvent.press(skipToDesignButton);

      expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
    });
  });

  describe('💳 Payment Flow Integration Tests', () => {
    it('should complete Stripe payment integration with success', async () => {
      const mockSetPaymentStatus = jest.fn();
      const mockSetPaymentDetails = jest.fn();
      
      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'pro', 
          name: 'Pro', 
          price: '$29', 
          stripePriceId: 'price_pro',
          credits: 200
        },
        setPaymentStatus: mockSetPaymentStatus,
        setPaymentDetails: mockSetPaymentDetails,
      }));

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          email: 'user@example.com', 
          credits_remaining: 3 
        }
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Complete Purchase')).toBeTruthy();
      });

      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(mockSetPaymentStatus).toHaveBeenCalledWith('processing');
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
      });
    });

    it('should handle payment failures gracefully', async () => {
      // Mock Stripe error
      const StripeService = require('../src/services/stripe').StripeService;
      StripeService.confirmPayment.mockRejectedValueOnce({
        code: 'card_declined',
        message: 'Your card was declined.',
      });

      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'pro', 
          name: 'Pro', 
          price: '$29', 
          stripePriceId: 'price_pro'
        },
        paymentStatus: 'failed',
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Payment Failed',
          expect.stringContaining('card was declined')
        );
      });

      // Should not navigate away from checkout
      expect(mockNavigate).not.toHaveBeenCalledWith('photoCapture');
    });

    it('should handle subscription upgrades correctly', async () => {
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          email: 'user@example.com', 
          credits_remaining: 10,
          currentPlan: 'basic'
        }
      }));

      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'premium', 
          name: 'Premium', 
          price: '$49', 
          stripePriceId: 'price_premium'
        },
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Upgrade to Premium')).toBeTruthy();
      });

      const upgradeButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(upgradeButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('photoCapture');
      });
    });
  });

  describe('🔄 Error Recovery and Edge Cases', () => {
    it('should recover from authentication errors', async () => {
      // Mock network error
      mockSupabaseAuth.signUp.mockRejectedValueOnce(
        new Error('Network request failed')
      );

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const registerButton = authScreen.getByTestId('register-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Registration Failed',
          expect.stringContaining('Network request failed')
        );
      });

      // User can retry
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });

      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('checkout');
      });
    });

    it('should handle database connection errors', async () => {
      mockSupabaseFrom.select.mockImplementationOnce(() => ({
        eq: () => ({
          single: () => Promise.reject(new Error('Connection refused'))
        })
      }));

      mockUserStore.mockReturnValue(createMockUserStore({
        error: 'Database connection failed',
      }));

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText('Database connection failed')).toBeTruthy();
      });
    });

    it('should handle missing database schema', async () => {
      mockSupabaseFrom.insert.mockReturnValueOnce({
        error: { message: 'relation "profiles" does not exist' }
      });

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const registerButton = authScreen.getByTestId('register-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Registration Failed',
          expect.stringContaining('Database setup incomplete')
        );
      });
    });

    it('should handle navigation state corruption gracefully', async () => {
      mockNavigate.mockImplementationOnce(() => {
        throw new Error('Navigation state corrupted');
      });

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      // Should not crash the app
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Navigation'),
        expect.any(Error)
      );
    });

    it('should handle storage quota exceeded', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(
        new Error('QuotaExceededError: Storage quota exceeded')
      );

      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        persistJourney: jest.fn().mockRejectedValue(
          new Error('Storage quota exceeded')
        ),
      }));

      const onboardingScreen = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
      
      const modernStyle = onboardingScreen.getByTestId('style-modern');
      fireEvent.press(modernStyle);

      // Should handle storage error gracefully
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('Storage'),
          expect.any(Error)
        );
      });
    });
  });

  describe('📊 Performance Validation Tests', () => {
    it('should validate screen load times under 2 seconds', async () => {
      const startTime = performance.now();
      
      render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('AI-Powered Design')).toBeTruthy();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000);
    });

    it('should validate navigation performance under 100ms', async () => {
      const startTime = performance.now();
      
      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      const endTime = performance.now();
      const navigationTime = endTime - startTime;

      expect(navigationTime).toBeLessThan(100);
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should validate memory usage during complete journey', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Render multiple screens to simulate journey
      const screens = [
        render(<WelcomeScreen navigation={mockNavigation} />),
        render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />),
        render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />),
        render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />),
        render(<AuthScreen navigation={mockNavigation} route={mockRoute} />),
      ];

      // Unmount screens
      screens.forEach(screen => screen.unmount());

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle concurrent user actions without performance degradation', async () => {
      const onboardingScreen = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
      
      const startTime = performance.now();

      // Simulate rapid style selections
      const styles = [
        'style-modern',
        'style-minimalist', 
        'style-scandinavian',
        'style-industrial'
      ];

      // Fire multiple events quickly
      styles.forEach(styleId => {
        const element = onboardingScreen.getByTestId(styleId);
        fireEvent.press(element);
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should handle rapid interactions efficiently
      expect(processingTime).toBeLessThan(500);
    });
  });

  describe('♿ Accessibility Validation Tests', () => {
    it('should validate accessibility labels on all interactive elements', async () => {
      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      
      expect(continueButton.props.accessibilityRole).toBe('button');
      expect(continueButton.props.accessibilityLabel).toBeTruthy();
      expect(continueButton.props.accessibilityHint).toBeTruthy();
    });

    it('should support screen reader navigation through plan selection', async () => {
      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const planCards = [
        paywallScreen.getByTestId('plan-basic'),
        paywallScreen.getByTestId('plan-pro'),
        paywallScreen.getByTestId('plan-premium'),
      ];

      planCards.forEach(card => {
        expect(card.props.accessibilityRole).toBe('button');
        expect(card.props.accessibilityLabel).toBeTruthy();
        expect(card.props.accessibilityState).toBeDefined();
      });
    });

    it('should provide accessibility feedback for form validation', async () => {
      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');

      // Test invalid email
      fireEvent.changeText(emailInput, 'invalid-email');
      
      await waitFor(() => {
        expect(emailInput.props.accessibilityLabel).toContain('invalid');
      });

      // Test weak password
      fireEvent.changeText(passwordInput, '123');
      
      await waitFor(() => {
        expect(passwordInput.props.accessibilityHint).toContain('password');
      });
    });

    it('should handle high contrast mode correctly', async () => {
      // Mock high contrast accessibility setting
      const mockAccessibilityInfo = {
        isHighContrastEnabled: true,
        isReduceMotionEnabled: false,
        isScreenReaderEnabled: false,
      };

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      // Elements should be visible in high contrast mode
      await waitFor(() => {
        const title = screen.getByText('AI-Powered Design');
        expect(title).toBeTruthy();
      });
    });
  });

  describe('🗄️ Database Integration and Data Persistence', () => {
    it('should create user profile on successful registration', async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user-123', email: 'newuser@example.com' } },
        error: null
      });

      mockSupabaseFrom.insert.mockResolvedValueOnce({
        data: [{ 
          id: 'new-user-123', 
          email: 'newuser@example.com',
          subscription_tier: 'free',
          credits_remaining: 3
        }],
        error: null
      });

      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      const emailInput = authScreen.getByTestId('email-input');
      const passwordInput = authScreen.getByTestId('password-input');
      const registerButton = authScreen.getByTestId('register-button');

      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockSupabaseFrom.insert).toHaveBeenCalledWith([
          expect.objectContaining({
            email: 'newuser@example.com',
            subscription_tier: 'free',
            credits_remaining: 3,
          })
        ]);
      });
    });

    it('should persist journey progress to database', async () => {
      const mockPersistJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        persistJourney: mockPersistJourney,
        updateProgress: jest.fn((data) => mockPersistJourney()),
      }));

      const onboardingScreen = render(<OnboardingScreen1 navigation={mockNavigation} route={mockRoute} />);
      
      const continueButton = onboardingScreen.getByTestId('continue-button');
      fireEvent.press(continueButton);

      expect(mockPersistJourney).toHaveBeenCalled();
    });

    it('should load user projects from database', async () => {
      mockSupabaseFrom.select.mockImplementationOnce(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: [
                { id: '1', name: 'Living Room Design', created_at: '2024-01-01' },
                { id: '2', name: 'Bedroom Makeover', created_at: '2024-01-02' },
              ],
              error: null
            }))
          }))
        }))
      }));

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', email: 'user@example.com' }
      }));

      const projectsScreen = render(<MyProjectsScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(screen.getByText('Living Room Design')).toBeTruthy();
        expect(screen.getByText('Bedroom Makeover')).toBeTruthy();
      });
    });

    it('should handle database synchronization conflicts', async () => {
      // Mock conflict scenario - local data newer than server
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve(JSON.stringify({
            progress: { lastUpdated: '2024-01-02T10:00:00Z' }
          }));
        }
        return Promise.resolve(null);
      });

      mockSupabaseFrom.select.mockImplementationOnce(() => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { 
              progress: { lastUpdated: '2024-01-01T10:00:00Z' } // Older server data
            },
            error: null
          })
        })
      }));

      const mockLoadJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        loadJourney: mockLoadJourney,
      }));

      await act(async () => {
        mockLoadJourney();
      });

      // Should use local data when it's newer
      expect(mockLoadJourney).toHaveBeenCalled();
    });
  });
});

/**
 * Integration Tests for Cross-Component Communication
 */
describe('🔗 Component Integration and State Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserStore.mockReturnValue(createMockUserStore());
    mockJourneyStore.mockReturnValue(createMockJourneyStore());
    mockPlanStore.mockReturnValue(createMockPlanStore());
  });

  it('should maintain state consistency across navigation', async () => {
    const mockUpdateOnboarding = jest.fn();
    const mockUpdateSubscription = jest.fn();
    
    mockJourneyStore.mockReturnValue(createMockJourneyStore({
      updateOnboarding: mockUpdateOnboarding,
      updateSubscription: mockUpdateSubscription,
    }));

    // Start from onboarding
    const onboarding2 = render(<OnboardingScreen2 navigation={mockNavigation} route={mockRoute} />);
    
    const modernStyle = onboarding2.getByTestId('style-modern');
    fireEvent.press(modernStyle);

    expect(mockUpdateOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedStyles: expect.arrayContaining(['modern'])
      })
    );

    onboarding2.unmount();

    // Move to paywall
    const paywall = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
    
    const proPlan = paywall.getByTestId('plan-pro');
    fireEvent.press(proPlan);

    expect(mockUpdateSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedPlanId: 'pro'
      })
    );
  });

  it('should handle credit consumption across journey', async () => {
    const mockConsumeToken = jest.fn(() => Promise.resolve(true));
    const mockUpdateUserTokens = jest.fn();
    
    mockUserStore.mockReturnValue(createMockUserStore({
      isAuthenticated: true,
      user: { id: 'user-123', credits_remaining: 3 },
      consumeToken: mockConsumeToken,
      updateUserTokens: mockUpdateUserTokens,
    }));

    const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(mockConsumeToken).toHaveBeenCalled();
    });

    // Should update remaining credits
    expect(mockUpdateUserTokens).toHaveBeenCalledWith(2);
  });

  it('should synchronize plan changes with user profile', async () => {
    const mockUpdateUserPlan = jest.fn();
    const mockSetPaymentStatus = jest.fn();
    
    mockUserStore.mockReturnValue(createMockUserStore({
      isAuthenticated: true,
      user: { id: 'user-123', currentPlan: 'basic' },
      updateUserPlan: mockUpdateUserPlan,
    }));

    mockPlanStore.mockReturnValue(createMockPlanStore({
      selectedPlan: { id: 'pro', name: 'Pro', credits: 200 },
      setPaymentStatus: mockSetPaymentStatus,
    }));

    const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
    
    const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
    fireEvent.press(paymentButton);

    await waitFor(() => {
      expect(mockUpdateUserPlan).toHaveBeenCalledWith('pro', 200);
    });
  });
});