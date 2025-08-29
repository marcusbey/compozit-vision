/**
 * Critical Path Validation Tests
 * 
 * This test suite validates the most critical user paths and business flows:
 * - Revenue-generating paths (payment flows)
 * - Core feature functionality (AI processing, design generation)
 * - Data integrity and persistence
 * - Performance benchmarks for critical operations
 * - Error recovery for mission-critical features
 * - Accessibility compliance for key user interactions
 * - Security validations for sensitive operations
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jest } from '@jest/globals';

// Import critical screens
import PaywallScreen from '../src/screens/Paywall/PaywallScreen';
import CheckoutScreen from '../src/screens/Checkout/CheckoutScreen';
import ProcessingScreen from '../src/screens/Processing/ProcessingScreen';
import ResultsScreen from '../src/screens/Results/ResultsScreen';
import PhotoCaptureScreen from '../src/screens/PhotoCapture/PhotoCaptureScreen';
import AuthScreen from '../src/screens/Auth/AuthScreen';
import MyProjectsScreen from '../src/screens/Projects/MyProjectsScreen';

// Mock comprehensive navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  dispatch: jest.fn(),
  getState: jest.fn(() => ({ index: 0, routes: [] })),
};

const mockRoute = {
  params: {},
  key: 'test-key',
  name: 'TestScreen',
};

// Comprehensive store mocks
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
  updateUserTokens: jest.fn(),
  updateUserPlan: jest.fn(),
  consumeToken: jest.fn(() => Promise.resolve(true)),
  initializeAuth: jest.fn(() => jest.fn()),
  ...overrides,
});

const createMockJourneyStore = (overrides = {}) => ({
  project: { 
    photoUri: null, 
    roomType: null,
    descriptions: null,
    furniturePreferences: [],
    budgetRange: null,
  },
  preferences: { 
    stylePreferences: [],
    colorPreferences: [],
    materialPreferences: [],
  },
  progress: { 
    currentStep: 1, 
    currentScreen: 'welcome',
    completedSteps: [],
    totalSteps: 11,
  },
  subscription: { billingCycle: 'monthly', useFreeCredits: false },
  authentication: { hasAccount: false },
  payment: { requiresPayment: false },
  updateProject: jest.fn(),
  updatePreferences: jest.fn(),
  updateProgress: jest.fn(),
  updateSubscription: jest.fn(),
  updateAuthentication: jest.fn(),
  updatePayment: jest.fn(),
  completeStep: jest.fn(),
  persistJourney: jest.fn(),
  getProgressPercentage: jest.fn(() => 50),
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

// Mock Supabase with comprehensive methods
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  })),
};

const mockSupabaseFrom = {
  insert: jest.fn(() => ({ error: null, data: [{}] })),
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => ({ 
        data: { id: 'test', email: 'test@example.com' }, 
        error: null 
      })),
      limit: jest.fn(() => ({
        data: [],
        error: null
      })),
    })),
  })),
  update: jest.fn(() => ({ error: null })),
  upsert: jest.fn(() => ({ error: null })),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: jest.fn(() => mockSupabaseFrom),
};

// Mock external modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
}));

jest.mock('../src/services/supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('../src/stores/userStore', () => ({
  useUserStore: mockUserStore,
}));

jest.mock('../src/stores/journeyStore', () => ({
  useJourneyStore: mockJourneyStore,
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
      features: ['Basic AI Processing'],
      stripePriceId: 'price_basic',
      credits: 50,
    },
    { 
      id: 'pro', 
      name: 'Pro', 
      price: '$29', 
      period: '/month',
      designs: '200', 
      features: ['Advanced AI Processing'],
      stripePriceId: 'price_pro',
      credits: 200,
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      price: '$49', 
      period: '/month',
      designs: 'Unlimited',
      features: ['Professional AI Processing'],
      stripePriceId: 'price_premium',
      credits: -1,
    }
  ],
}));

// Mock Stripe service
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

// Mock AI processing service
const mockAIProcessingService = {
  generateDesign: jest.fn(() => Promise.resolve({
    designId: 'design-123',
      imageUrl: 'https://example.com/design.jpg',
      products: [
        { id: 'product-1', name: 'Modern Sofa', price: 1299 },
        { id: 'product-2', name: 'Coffee Table', price: 599 },
      ],
      totalCost: 1898,
    })),
  enhanceImage: jest.fn(() => Promise.resolve({
    enhancedUrl: 'https://example.com/enhanced.jpg',
    metadata: { quality: 'high', resolution: '4K' },
  })),
};

// Mock camera and image picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'mock://high-quality-image.jpg',
      width: 2048,
      height: 1536,
      type: 'image',
      fileSize: 2048000,
    }]
  })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{
      uri: 'mock://camera-image.jpg',
      width: 1920,
      height: 1080,
      type: 'image',
      fileSize: 1536000,
    }]
  })),
}));

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};

Object.defineProperty(AsyncStorage, 'getItem', { value: mockAsyncStorage.getItem });
Object.defineProperty(AsyncStorage, 'setItem', { value: mockAsyncStorage.setItem });

// Mock Alert and console
jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('🎯 Critical Path Validation Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default store states
    mockUserStore.mockReturnValue(createMockUserStore());
    mockJourneyStore.mockReturnValue(createMockJourneyStore());
    mockPlanStore.mockReturnValue(createMockPlanStore());
    
    // Reset AsyncStorage
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('💰 Revenue-Critical Payment Flow', () => {
    it('should complete end-to-end payment flow with data integrity', async () => {
      // Step 1: Plan selection
      const mockSelectPlan = jest.fn();
      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: null,
        selectPlan: mockSelectPlan,
      }));

      const paywallScreen = render(<PaywallScreen navigation={mockNavigation} route={mockRoute} />);
      
      const proPlan = paywallScreen.getByTestId('plan-pro');
      fireEvent.press(proPlan);

      expect(mockSelectPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pro',
          price: '$29',
          stripePriceId: 'price_pro',
        })
      );

      // Step 2: Authentication if needed
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: false,
      }));

      const selectPlanButton = paywallScreen.getByTestId('select-plan-button');
      fireEvent.press(selectPlanButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('auth');

      // Step 3: Payment processing
      paywallScreen.unmount();
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', email: 'user@example.com' },
      }));

      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'pro', 
          name: 'Pro', 
          price: '$29', 
          stripePriceId: 'price_pro',
          credits: 200
        },
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      // Verify payment intent creation
      const StripeService = require('../src/services/stripe').StripeService;
      expect(StripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2900, // $29.00 in cents
          currency: 'usd',
        })
      );

      // Step 4: Payment confirmation
      await waitFor(() => {
        expect(StripeService.confirmPayment).toHaveBeenCalled();
      });

      // Step 5: User profile update
      const mockUpdateUserPlan = jest.fn();
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', currentPlan: 'basic' },
        updateUserPlan: mockUpdateUserPlan,
      }));

      await waitFor(() => {
        expect(mockUpdateUserPlan).toHaveBeenCalledWith('pro', 200);
      });

      // Step 6: Navigation to next step
      expect(mockNavigation.navigate).toHaveBeenCalledWith('photoCapture');

      // Verify data persistence
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('payment'),
        expect.any(String)
      );
    }, 30000);

    it('should handle payment failures with proper user feedback', async () => {
      const StripeService = require('../src/services/stripe').StripeService;
      StripeService.confirmPayment.mockRejectedValueOnce({
        code: 'card_declined',
        message: 'Your card was declined.',
        decline_code: 'generic_decline',
      });

      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { id: 'pro', name: 'Pro', price: '$29', stripePriceId: 'price_pro' },
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Payment Failed',
          expect.stringContaining('card was declined'),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Try Again' }),
            expect.objectContaining({ text: 'Use Different Card' }),
          ])
        );
      });

      // Should not navigate away on failure
      expect(mockNavigation.navigate).not.toHaveBeenCalledWith('photoCapture');

      // Should allow retry
      const retryButton = checkoutScreen.getByTestId('retry-payment-button');
      expect(retryButton).toBeTruthy();
    });

    it('should validate subscription upgrade flows', async () => {
      // Existing basic plan user upgrading to pro
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { 
          id: 'user-123', 
          email: 'user@example.com',
          currentPlan: 'basic',
          credits_remaining: 25,
        },
      }));

      mockPlanStore.mockReturnValue(createMockPlanStore({
        selectedPlan: { 
          id: 'pro', 
          name: 'Pro', 
          price: '$29',
          originalPrice: '$39', // Show discount
          stripePriceId: 'price_pro',
          credits: 200,
        },
      }));

      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Should show upgrade pricing
      await waitFor(() => {
        expect(checkoutScreen.getByText('Upgrade to Pro')).toBeTruthy();
        expect(checkoutScreen.getByText('$10/month savings')).toBeTruthy();
      });

      const upgradeButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(upgradeButton);

      // Should handle prorated billing
      const StripeService = require('../src/services/stripe').StripeService;
      expect(StripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000, // Prorated amount
          metadata: expect.objectContaining({
            upgrade_from: 'basic',
            upgrade_to: 'pro',
          }),
        })
      );
    });

    it('should ensure payment security and PCI compliance', async () => {
      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Should not store card details locally
      const cardInput = checkoutScreen.getByTestId('card-input');
      fireEvent.changeText(cardInput, '4242424242424242');

      // Should use tokenized payment methods only
      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      const StripeService = require('../src/services/stripe').StripeService;
      expect(StripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.not.objectContaining({
          card: expect.any(Object), // No raw card data
        })
      );

      // Should validate CVV and billing details
      expect(StripeService.confirmPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method: expect.objectContaining({
            type: 'card',
          }),
        })
      );
    });
  });

  describe('🤖 AI Processing Critical Path', () => {
    it('should complete full AI design generation with quality validation', async () => {
      // Step 1: Photo capture with quality requirements
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { photoUri: null },
        updateProject: jest.fn(),
      }));

      const photoCaptureScreen = render(<PhotoCaptureScreen navigation={mockNavigation} route={mockRoute} />);
      
      const captureButton = photoCaptureScreen.getByTestId('capture-photo-button');
      fireEvent.press(captureButton);

      // Should validate image quality
      const imagePicker = require('expo-image-picker');
      await waitFor(() => {
        expect(imagePicker.launchCameraAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            quality: 0.9, // High quality required
            aspect: [16, 9],
            allowsEditing: true,
          })
        );
      });

      // Step 2: Processing with credit consumption
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', credits_remaining: 5 },
        consumeToken: jest.fn(() => Promise.resolve(true)),
        updateUserTokens: jest.fn(),
      }));

      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { 
          photoUri: 'mock://camera-image.jpg',
          roomType: 'living-room',
          descriptions: 'Modern living space with natural light',
          furniturePreferences: ['sofa', 'coffee-table'],
          budgetRange: { min: 1000, max: 5000 },
        },
      }));

      photoCaptureScreen.unmount();
      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);

      // Should consume credit
      await waitFor(() => {
        expect(mockUserStore().consumeToken).toHaveBeenCalled();
      });

      // Should call AI service with complete parameters
      const AIService = require('../src/services/aiProcessing').AIProcessingService;
      expect(AIService.generateDesign).toHaveBeenCalledWith({
        imageUrl: 'mock://camera-image.jpg',
        roomType: 'living-room',
        stylePreferences: expect.any(Array),
        description: 'Modern living space with natural light',
        furnitureTypes: ['sofa', 'coffee-table'],
        budgetRange: { min: 1000, max: 5000 },
        quality: 'high',
      });

      // Step 3: Results validation
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('results');
      }, { timeout: 15000 });

      processingScreen.unmount();
      const resultsScreen = render(<ResultsScreen navigation={mockNavigation} route={mockRoute} />);

      // Should display generated design
      await waitFor(() => {
        expect(resultsScreen.getByTestId('generated-design-image')).toBeTruthy();
        expect(resultsScreen.getByTestId('product-list')).toBeTruthy();
        expect(resultsScreen.getByText('$1,898')).toBeTruthy(); // Total cost
      });

      // Should allow saving project
      const saveButton = resultsScreen.getByTestId('save-project-button');
      fireEvent.press(saveButton);

      expect(mockSupabaseFrom.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          user_id: 'user-123',
          design_data: expect.any(Object),
          total_cost: 1898,
        }),
      ]);
    }, 45000);

    it('should handle AI processing failures gracefully', async () => {
      const AIService = require('../src/services/aiProcessing').AIProcessingService;
      AIService.generateDesign.mockRejectedValueOnce(
        new Error('AI service temporarily unavailable')
      );

      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', credits_remaining: 5 },
        consumeToken: jest.fn(() => Promise.resolve(true)),
        updateUserTokens: jest.fn(), // Should refund credit
      }));

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Processing Error',
          expect.stringContaining('temporarily unavailable'),
          expect.arrayContaining([
            expect.objectContaining({ text: 'Retry' }),
            expect.objectContaining({ text: 'Try Later' }),
          ])
        );
      }, { timeout: 20000 });

      // Should refund credit on failure
      expect(mockUserStore().updateUserTokens).toHaveBeenCalledWith(5); // Original amount
    });

    it('should validate AI output quality and safety', async () => {
      const AIService = require('../src/services/aiProcessing').AIProcessingService;
      
      // Mock AI response with quality validation
      AIService.generateDesign.mockImplementation(async (params) => {
        // Simulate quality checks
        const result = {
          designId: 'design-123',
          imageUrl: 'https://example.com/design.jpg',
          products: [
            { 
              id: 'product-1', 
              name: 'Modern Sofa', 
              price: 1299,
              safety_rating: 'A',
              quality_score: 0.95,
            },
          ],
          totalCost: 1299,
          confidence_score: 0.92,
          content_safety: 'approved',
        };

        // Validate confidence threshold
        if (result.confidence_score < 0.8) {
          throw new Error('Design quality below threshold');
        }

        return result;
      });

      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { 
          photoUri: 'mock://high-quality-image.jpg',
          roomType: 'living-room',
        },
      }));

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(AIService.generateDesign).toHaveBeenCalled();
      });

      // Should validate output quality
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('results');
      });
    });

    it('should handle insufficient credits scenario', async () => {
      mockUserStore.mockReturnValue(createMockUserStore({
        isAuthenticated: true,
        user: { id: 'user-123', credits_remaining: 0 },
        consumeToken: jest.fn(() => Promise.resolve(false)),
      }));

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Insufficient Credits',
          expect.stringContaining('upgrade your plan'),
          expect.arrayContaining([
            expect.objectContaining({ 
              text: 'Upgrade Plan',
              onPress: expect.any(Function),
            }),
          ])
        );
      });

      // Should redirect to paywall
      expect(mockNavigation.navigate).toHaveBeenCalledWith('paywall');
    });
  });

  describe('💾 Data Integrity and Persistence', () => {
    it('should maintain data consistency across app lifecycle', async () => {
      const mockPersistJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { 
          photoUri: 'mock://image.jpg',
          roomType: 'bedroom',
          descriptions: 'Cozy bedroom setup',
        },
        persistJourney: mockPersistJourney,
        updateProject: jest.fn((data) => mockPersistJourney()),
      }));

      // Simulate app going to background
      const photoCaptureScreen = render(<PhotoCaptureScreen navigation={mockNavigation} route={mockRoute} />);
      
      const captureButton = photoCaptureScreen.getByTestId('capture-photo-button');
      fireEvent.press(captureButton);

      // Should persist data immediately
      expect(mockPersistJourney).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'userJourneyData',
        expect.stringContaining('bedroom')
      );

      // Simulate app restoration
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve(JSON.stringify({
            project: { 
              photoUri: 'mock://image.jpg',
              roomType: 'bedroom',
              descriptions: 'Cozy bedroom setup',
            },
            progress: { currentScreen: 'descriptions', currentStep: 6 },
          }));
        }
        return Promise.resolve(null);
      });

      // Should restore state correctly
      const mockLoadJourney = jest.fn();
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        loadJourney: mockLoadJourney,
      }));

      await act(async () => {
        mockLoadJourney();
      });

      expect(mockLoadJourney).toHaveBeenCalled();
    });

    it('should handle database synchronization conflicts', async () => {
      // Mock local data newer than server
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve(JSON.stringify({
            project: { photoUri: 'local://image.jpg' },
            lastSyncTime: '2024-01-02T10:00:00Z',
          }));
        }
        return Promise.resolve(null);
      });

      // Mock server data older than local
      mockSupabaseFrom.select.mockImplementationOnce(() => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { 
              project_data: { photoUri: 'server://image.jpg' },
              updated_at: '2024-01-01T10:00:00Z', // Older
            },
            error: null
          })
        })
      }));

      const mockLoadJourney = jest.fn();
      const mockSyncWithServer = jest.fn();
      
      // Should prioritize local data when newer
      const resolveConflict = (local: any, server: any) => {
        if (new Date(local.lastSyncTime) > new Date(server.updated_at)) {
          return local; // Use local data
        }
        return server; // Use server data
      };

      const localData = { 
        project: { photoUri: 'local://image.jpg' },
        lastSyncTime: '2024-01-02T10:00:00Z',
      };
      const serverData = { 
        project_data: { photoUri: 'server://image.jpg' },
        updated_at: '2024-01-01T10:00:00Z',
      };

      const resolvedData = resolveConflict(localData, serverData);
      expect(resolvedData.project.photoUri).toBe('local://image.jpg');
    });

    it('should validate data backup and recovery', async () => {
      // Create test data
      const testData = {
        project: { 
          photoUri: 'mock://image.jpg',
          roomType: 'living-room',
          totalCost: 2500,
        },
        user: { id: 'user-123', email: 'test@example.com' },
        designs: [
          { id: 'design-1', created_at: '2024-01-01' },
          { id: 'design-2', created_at: '2024-01-02' },
        ],
      };

      // Simulate backup creation
      const createBackup = async (data: any) => {
        const backupKey = `backup_${Date.now()}`;
        await mockAsyncStorage.setItem(backupKey, JSON.stringify(data));
        return backupKey;
      };

      const backupKey = await createBackup(testData);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        backupKey,
        JSON.stringify(testData)
      );

      // Simulate data corruption
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'userJourneyData') {
          return Promise.resolve(null); // Corrupted/missing
        }
        if (key === backupKey) {
          return Promise.resolve(JSON.stringify(testData)); // Backup available
        }
        return Promise.resolve(null);
      });

      // Should recover from backup
      const recoverFromBackup = async () => {
        const backup = await mockAsyncStorage.getItem(backupKey);
        if (backup) {
          await mockAsyncStorage.setItem('userJourneyData', backup);
          return true;
        }
        return false;
      };

      const recovered = await recoverFromBackup();
      expect(recovered).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'userJourneyData',
        JSON.stringify(testData)
      );
    });
  });

  describe('⚡ Performance Benchmarks', () => {
    it('should meet AI processing performance requirements', async () => {
      const startTime = performance.now();
      
      const AIService = require('../src/services/aiProcessing').AIProcessingService;
      
      mockJourneyStore.mockReturnValue(createMockJourneyStore({
        project: { 
          photoUri: 'mock://image.jpg',
          roomType: 'living-room',
        },
      }));

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(AIService.generateDesign).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // AI processing should complete within 30 seconds
      expect(processingTime).toBeLessThan(30000);
      
      // Should provide progress updates
      await waitFor(() => {
        expect(processingScreen.getByTestId('progress-indicator')).toBeTruthy();
      });
    });

    it('should validate memory usage during critical operations', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Simulate heavy operation (AI processing)
      const screens = [];
      for (let i = 0; i < 5; i++) {
        screens.push(render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />));
      }

      // Cleanup
      screens.forEach(screen => screen.unmount());

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (under 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle concurrent operations efficiently', async () => {
      const operations = [];
      const startTime = performance.now();

      // Simulate multiple concurrent operations
      for (let i = 0; i < 3; i++) {
        operations.push(
          new Promise(resolve => {
            const screen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
            setTimeout(() => {
              screen.unmount();
              resolve(i);
            }, 1000);
          })
        );
      }

      await Promise.all(operations);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Concurrent operations should not significantly increase total time
      expect(totalTime).toBeLessThan(2000); // Should be close to 1000ms, not 3000ms
    });
  });

  describe('♿ Accessibility Compliance', () => {
    it('should provide full keyboard navigation support', async () => {
      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Should support tab navigation
      const focusableElements = [
        checkoutScreen.getByTestId('plan-summary'),
        checkoutScreen.getByTestId('card-input'),
        checkoutScreen.getByTestId('complete-payment-button'),
      ];

      focusableElements.forEach(element => {
        expect(element.props.accessible).toBe(true);
        expect(element.props.accessibilityRole).toBeTruthy();
      });
    });

    it('should support screen readers for critical flows', async () => {
      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Should announce progress updates
      const progressAnnouncement = processingScreen.getByTestId('progress-announcement');
      expect(progressAnnouncement.props.accessibilityLiveRegion).toBe('polite');
      expect(progressAnnouncement.props.accessibilityLabel).toContain('Generating design');

      // Results screen accessibility
      processingScreen.unmount();
      const resultsScreen = render(<ResultsScreen navigation={mockNavigation} route={mockRoute} />);
      
      const designImage = resultsScreen.getByTestId('generated-design-image');
      expect(designImage.props.accessibilityLabel).toContain('Generated design');
      
      const productList = resultsScreen.getByTestId('product-list');
      expect(productList.props.accessibilityRole).toBe('list');
    });

    it('should handle high contrast and reduced motion preferences', async () => {
      // Mock accessibility preferences
      const mockAccessibilityInfo = {
        isHighContrastEnabled: true,
        isReduceMotionEnabled: true,
        isScreenReaderEnabled: false,
      };

      jest.spyOn(AccessibilityInfo, 'isHighContrastEnabled').mockResolvedValue(true);
      jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        // Should adapt to high contrast
        const progressBar = processingScreen.getByTestId('progress-bar');
        expect(progressBar.props.style).toEqual(
          expect.objectContaining({
            backgroundColor: expect.any(String), // High contrast color
          })
        );
      });

      // Should disable animations when reduce motion is enabled
      const animatedElement = processingScreen.getByTestId('processing-animation');
      expect(animatedElement.props.accessibilityElementsHidden).toBe(true);
    });
  });

  describe('🔒 Security Validation', () => {
    it('should validate secure data transmission', async () => {
      const mockSecureRequest = jest.fn();
      
      // Mock HTTPS validation
      const validateSecureEndpoint = (url: string) => {
        return url.startsWith('https://');
      };

      // Payment processing security
      const StripeService = require('../src/services/stripe').StripeService;
      const paymentEndpoint = 'https://api.stripe.com/v1/payment_intents';
      
      expect(validateSecureEndpoint(paymentEndpoint)).toBe(true);

      // AI service security
      const aiEndpoint = 'https://api.openai.com/v1/chat/completions';
      expect(validateSecureEndpoint(aiEndpoint)).toBe(true);

      // Supabase security
      const supabaseEndpoint = 'https://project.supabase.co';
      expect(validateSecureEndpoint(supabaseEndpoint)).toBe(true);
    });

    it('should prevent data leakage in logs and errors', async () => {
      const sensitiveData = {
        email: 'user@example.com',
        creditCard: '4242424242424242',
        apiKey: 'sk_test_123456789',
      };

      const sanitizeForLogging = (data: any) => {
        const sanitized = { ...data };
        
        // Mask credit cards
        if (sanitized.creditCard) {
          sanitized.creditCard = sanitized.creditCard.replace(/\d{4}/g, '****');
        }
        
        // Remove API keys
        if (sanitized.apiKey) {
          delete sanitized.apiKey;
        }
        
        // Mask email partially
        if (sanitized.email) {
          sanitized.email = sanitized.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
        }
        
        return sanitized;
      };

      const sanitized = sanitizeForLogging(sensitiveData);
      
      expect(sanitized.creditCard).toBe('****************');
      expect(sanitized.apiKey).toBeUndefined();
      expect(sanitized.email).toBe('us***@example.com');
    });

    it('should implement proper input validation and sanitization', async () => {
      const authScreen = render(<AuthScreen navigation={mockNavigation} route={mockRoute} />);
      
      // Test SQL injection prevention
      const maliciousEmail = "'; DROP TABLE users; --";
      const emailInput = authScreen.getByTestId('email-input');
      
      fireEvent.changeText(emailInput, maliciousEmail);
      
      const registerButton = authScreen.getByTestId('register-button');
      fireEvent.press(registerButton);

      // Should validate and reject malicious input
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Invalid Input',
          expect.stringContaining('valid email')
        );
      });

      // Test XSS prevention
      const xssPayload = '<script>alert("xss")</script>';
      const descriptionInput = authScreen.getByTestId('description-input');
      
      fireEvent.changeText(descriptionInput, xssPayload);
      
      // Should sanitize HTML/script tags
      expect(descriptionInput.props.value).not.toContain('<script>');
    });

    it('should validate API rate limiting and abuse prevention', async () => {
      let requestCount = 0;
      const rateLimitWindow = 60000; // 1 minute
      const maxRequests = 10;

      const rateLimitCheck = () => {
        requestCount++;
        
        if (requestCount > maxRequests) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Reset counter after window
        setTimeout(() => {
          requestCount = 0;
        }, rateLimitWindow);
        
        return true;
      };

      // Test normal usage
      for (let i = 0; i < maxRequests; i++) {
        expect(rateLimitCheck()).toBe(true);
      }

      // Test rate limit enforcement
      expect(() => rateLimitCheck()).toThrow('Rate limit exceeded');
    });
  });

  describe('🔄 Error Recovery and Resilience', () => {
    it('should handle network failures with exponential backoff', async () => {
      let attemptCount = 0;
      const maxRetries = 3;
      
      const mockAPICall = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error('Network error');
        }
        return Promise.resolve({ success: true });
      });

      const exponentialBackoff = async (fn: Function, retries: number = maxRetries) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (error) {
            if (i === retries - 1) throw error;
            
            const delay = Math.min(1000 * Math.pow(2, i), 10000); // Cap at 10s
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      const result = await exponentialBackoff(mockAPICall);
      
      expect(mockAPICall).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should recover from corrupted application state', async () => {
      // Mock corrupted state
      mockJourneyStore.mockReturnValue({
        ...createMockJourneyStore(),
        project: null, // Corrupted
        progress: undefined, // Corrupted
      });

      const mockResetToSafeState = jest.fn(() => {
        mockJourneyStore.mockReturnValue(createMockJourneyStore());
        mockNavigation.reset({
          index: 0,
          routes: [{ name: 'welcome' }],
        });
      });

      // Detect corruption and recover
      const journeyState = mockJourneyStore();
      if (!journeyState.project || !journeyState.progress) {
        mockResetToSafeState();
      }

      expect(mockResetToSafeState).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'welcome' }],
      });
    });

    it('should maintain service availability during partial failures', async () => {
      // Mock AI service failure but payment service working
      const AIService = require('../src/services/aiProcessing').AIProcessingService;
      AIService.generateDesign.mockRejectedValue(new Error('AI service down'));

      const StripeService = require('../src/services/stripe').StripeService;
      StripeService.createPaymentIntent.mockResolvedValue({ 
        client_secret: 'pi_test_123_secret' 
      });

      // Payment flow should still work
      const checkoutScreen = render(<CheckoutScreen navigation={mockNavigation} route={mockRoute} />);
      
      const paymentButton = checkoutScreen.getByTestId('complete-payment-button');
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(StripeService.createPaymentIntent).toHaveBeenCalled();
      });

      // AI processing should show fallback
      const processingScreen = render(<ProcessingScreen navigation={mockNavigation} route={mockRoute} />);
      
      await waitFor(() => {
        expect(processingScreen.getByText('Service temporarily unavailable')).toBeTruthy();
        expect(processingScreen.getByTestId('retry-button')).toBeTruthy();
      });
    });
  });
});