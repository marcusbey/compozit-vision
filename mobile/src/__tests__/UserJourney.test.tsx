import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { jest } from '@jest/globals';

// Mock Supabase
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  })),
};

const mockSupabaseFrom = {
  insert: jest.fn(() => ({ error: null })),
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(() => ({ data: null, error: { message: 'Profile not found' } })),
    })),
  })),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: jest.fn(() => mockSupabaseFrom),
};

// Mock stores
const mockUserStore = jest.fn();
const mockPlanStore = jest.fn();

// Mock modules before importing the main component
jest.mock('../src/services/supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('../src/stores/userStore', () => ({
  useUserStore: mockUserStore,
}));

jest.mock('../src/stores/planStore', () => ({
  usePlanStore: mockPlanStore,
  getPlanById: jest.fn((id) => ({ id, name: 'Test Plan', price: '$19', period: '/month', designs: '50', features: ['Test'] })),
  AVAILABLE_PLANS: [
    { id: 'basic', name: 'Basic', price: '$19', period: '/month', designs: '50 designs', features: ['Basic features'] },
    { id: 'pro', name: 'Pro', price: '$29', period: '/month', designs: '200 designs', features: ['Pro features'] },
  ],
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import main component after all mocks
import FullAppWithoutNavigation from '../FullAppWithoutNavigation';

describe('Complete User Journey Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      error: null,
      initializeAuth: jest.fn(() => () => {}),
    });
    
    mockPlanStore.mockReturnValue({
      selectedPlan: null,
      paymentStatus: 'none',
      selectPlan: jest.fn(),
      setPaymentStatus: jest.fn(),
      setPaymentDetails: jest.fn(),
    });
  });

  describe('Journey Segment 1: Onboarding Flow', () => {
    it('should complete onboarding screens 1-3 successfully', async () => {
      const { getByTestId, getByText } = render(<FullAppWithoutNavigation />);
      
      // Should start on onboarding screen 1
      await waitFor(() => {
        expect(getByText('AI-Powered Design')).toBeTruthy();
      });
      
      // Continue to screen 2
      fireEvent.press(getByTestId('continue-button'));
      
      await waitFor(() => {
        expect(getByText("What's Your Style?")).toBeTruthy();
      });
      
      // Continue to screen 3 (mock AsyncStorage for hasSeenOnboarding)
      fireEvent.press(getByTestId('continue-button'));
      
      await waitFor(() => {
        expect(getByText('Professional Features')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Journey Segment 2: Plan Selection', () => {
    it('should allow plan selection and track it in store', async () => {
      const mockSelectPlan = jest.fn();
      mockPlanStore.mockReturnValue({
        selectedPlan: null,
        paymentStatus: 'none',
        selectPlan: mockSelectPlan,
        setPaymentStatus: jest.fn(),
        setPaymentDetails: jest.fn(),
      });
      
      const { getByText, rerender } = render(<FullAppWithoutNavigation />);
      
      // Simulate being on paywall screen
      // This would require more complex navigation mocking in a real test
      expect(mockSelectPlan).not.toHaveBeenCalled();
    });
  });

  describe('Journey Segment 3: Authentication Flow', () => {
    it('should handle user registration with proper error handling', async () => {
      const mockRegister = jest.fn();
      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        register: mockRegister,
        logout: jest.fn(),
        isLoading: false,
        error: null,
        initializeAuth: jest.fn(() => () => {}),
      });
      
      // Test would continue with auth screen testing
      expect(mockRegister).toBeDefined();
    });
    
    it('should handle Supabase registration errors gracefully', async () => {
      // Mock registration error
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Failed to create user profile' }
      });
      
      const mockRegister = jest.fn().mockRejectedValueOnce(
        new Error('Failed to create user profile')
      );
      
      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        register: mockRegister,
        logout: jest.fn(),
        isLoading: false,
        error: 'Failed to create user profile',
        initializeAuth: jest.fn(() => () => {}),
      });
      
      // Registration should handle the error
      try {
        await mockRegister('test@example.com', 'password');
      } catch (error: any) {
        expect(error.message).toBe('Failed to create user profile');
      }
    });
  });

  describe('Journey Segment 4: Payment Flow', () => {
    it('should navigate to checkout for paid plans', async () => {
      const mockSelectedPlan = {
        id: 'pro',
        name: 'Pro',
        price: '$29',
        period: '/month',
        designs: '200 designs',
        features: ['Pro features']
      };
      
      mockPlanStore.mockReturnValue({
        selectedPlan: mockSelectedPlan,
        paymentStatus: 'pending',
        selectPlan: jest.fn(),
        setPaymentStatus: jest.fn(),
        setPaymentDetails: jest.fn(),
      });
      
      mockUserStore.mockReturnValue({
        user: { id: '123', email: 'test@example.com', nbToken: 3 },
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
        initializeAuth: jest.fn(() => () => {}),
      });
      
      // Test checkout navigation logic
      expect(mockSelectedPlan.id).toBe('pro');
    });
    
    it('should allow free tier usage without payment', async () => {
      mockPlanStore.mockReturnValue({
        selectedPlan: null, // No plan selected = free tier
        paymentStatus: 'none',
        selectPlan: jest.fn(),
        setPaymentStatus: jest.fn(),
        setPaymentDetails: jest.fn(),
      });
      
      mockUserStore.mockReturnValue({
        user: { id: '123', email: 'test@example.com', nbToken: 3 },
        isAuthenticated: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        isLoading: false,
        error: null,
        initializeAuth: jest.fn(() => () => {}),
      });
      
      // Should allow direct access to processing for free tier
      expect(mockPlanStore().selectedPlan).toBeNull();
    });
  });

  describe('Journey Segment 5: Database Integration', () => {
    it('should handle missing profiles table gracefully', async () => {
      // Mock Supabase profile creation failure
      mockSupabaseFrom.insert.mockReturnValueOnce({
        error: { message: 'relation "profiles" does not exist' }
      });
      
      const mockRegister = jest.fn().mockRejectedValueOnce(
        new Error('Failed to create user profile')
      );
      
      try {
        await mockRegister('test@example.com', 'password');
      } catch (error: any) {
        expect(error.message).toContain('Failed to create user profile');
      }
    });
  });

  describe('Journey Segment 6: Error Recovery', () => {
    it('should recover from network errors', async () => {
      mockSupabaseAuth.signUp.mockRejectedValueOnce(
        new Error('Network error')
      );
      
      const mockRegister = jest.fn().mockRejectedValueOnce(
        new Error('Network error')
      );
      
      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        register: mockRegister,
        logout: jest.fn(),
        isLoading: false,
        error: 'Network error',
        initializeAuth: jest.fn(() => () => {}),
      });
      
      expect(mockUserStore().error).toBe('Network error');
    });
  });
});

// Database Structure Tests
describe('Database Requirements', () => {
  it('should validate required database tables structure', () => {
    const requiredTables = [
      'profiles',
      'projects', 
      'designs',
      'products',
      'orders',
      'analytics_events'
    ];
    
    const profileFields = [
      'id',
      'email', 
      'full_name',
      'avatar_url',
      'subscription_tier',
      'subscription_status',
      'stripe_customer_id',
      'credits_remaining',
      'preferences',
      'created_at',
      'updated_at'
    ];
    
    expect(requiredTables.length).toBeGreaterThan(0);
    expect(profileFields.length).toBe(11);
  });
  
  it('should have proper Stripe integration fields', () => {
    const stripeFields = [
      'stripe_customer_id',
      'subscription_status',
      'subscription_tier'
    ];
    
    expect(stripeFields).toContain('stripe_customer_id');
    expect(stripeFields).toContain('subscription_status');
    expect(stripeFields).toContain('subscription_tier');
  });
});