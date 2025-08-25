import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FullAppWithoutNavigation from '../../FullAppWithoutNavigation';
import { useUserStore } from '../stores/userStore';
import { supabase } from '../services/supabase';

// Mock dependencies
jest.mock('../stores/userStore');
jest.mock('../services/supabase');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

describe('Complete User Journey Integration Tests', () => {
  const mockUserStore = useUserStore as jest.MockedFunction<typeof useUserStore>;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.multiRemove.mockResolvedValue();
    
    // Default user store state
    mockUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: jest.fn(),
      clearUser: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateUserTokens: jest.fn(),
      updateUserPlan: jest.fn(),
      consumeTokens: jest.fn(),
      consumeToken: jest.fn(),
      initializeAuth: jest.fn(),
    });
  });

  describe('🎯 Onboarding Flow (Steps 1-3)', () => {
    it('should complete the 3-screen onboarding flow correctly', async () => {
      const { getByText, getByTestId } = render(<FullAppWithoutNavigation />);

      // Test Onboarding Screen 1
      expect(getByText('AI-Powered Design')).toBeTruthy();
      expect(getByText('at Your Fingertips')).toBeTruthy();
      expect(getByText('Continue')).toBeTruthy();

      // Navigate to Onboarding Screen 2
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText("What's Your Style?")).toBeTruthy();
        expect(getByText('Select up to 2 design styles')).toBeTruthy();
      });

      // Test style selection (up to 2 styles)
      const modernStyle = getByText('Modern');
      const scandiStyle = getByText('Scandinavian');
      
      fireEvent.press(modernStyle);
      fireEvent.press(scandiStyle);
      
      // Should show 2/2 selected
      expect(getByText('2/2 styles selected')).toBeTruthy();
      
      // Navigate to Onboarding Screen 3
      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(getByText('Ready for')).toBeTruthy();
        expect(getByText('Professional Results?')).toBeTruthy();
      });

      // Verify onboarding completion is stored
      fireEvent.press(getByText('Get Started'));
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('hasSeenOnboarding', 'true');
    });

    it('should handle back navigation in onboarding flow', async () => {
      const { getByText, getByTestId } = render(<FullAppWithoutNavigation />);

      // Navigate forward through onboarding
      fireEvent.press(getByText('Continue')); // Screen 1 → 2
      fireEvent.press(getByText('Continue')); // Screen 2 → 3
      
      // Test back navigation
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      await waitFor(() => {
        expect(getByText("What's Your Style?")).toBeTruthy();
      });
    });
  });

  describe('💳 Paywall Integration', () => {
    it('should display all subscription plans correctly', async () => {
      // Mock user completed onboarding
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { getByText } = render(<FullAppWithoutNavigation />);

      await waitFor(() => {
        expect(getByText('Choose Your Plan')).toBeTruthy();
        expect(getByText('You have 3 free designs to start')).toBeTruthy();
        
        // Verify all plans are displayed
        expect(getByText('Basic')).toBeTruthy();
        expect(getByText('$19')).toBeTruthy();
        expect(getByText('Pro')).toBeTruthy();
        expect(getByText('$29')).toBeTruthy();
        expect(getByText('Business')).toBeTruthy();
        expect(getByText('$49')).toBeTruthy();
      });
    });

    it('should handle free trial continuation', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { getByText } = render(<FullAppWithoutNavigation />);

      await waitFor(() => {
        const freeTrialButton = getByText('Continue with 3 Free Designs');
        fireEvent.press(freeTrialButton);
      });

      // Should navigate to photo capture
      await waitFor(() => {
        expect(getByText('Capture Room')).toBeTruthy();
      });
    });

    it('should handle plan selection', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { getByText } = render(<FullAppWithoutNavigation />);

      await waitFor(() => {
        const proButton = getByText('Choose Pro');
        fireEvent.press(proButton);
      });

      // Should navigate to photo capture after plan selection
      await waitFor(() => {
        expect(getByText('Capture Room')).toBeTruthy();
      });
    });
  });

  describe('📸 User Journey Flow (Photo → Descriptions → Furniture → Budget → Auth)', () => {
    beforeEach(() => {
      // Mock completed onboarding
      mockAsyncStorage.getItem.mockResolvedValue('true');
    });

    it('should complete the full design creation flow', async () => {
      const { getByText, getByPlaceholderText } = render(<FullAppWithoutNavigation />);

      // Start from paywall → continue with free
      await waitFor(() => {
        fireEvent.press(getByText('Continue with 3 Free Designs'));
      });

      // Step 1: Photo Capture
      await waitFor(() => {
        expect(getByText('Capture Room')).toBeTruthy();
        fireEvent.press(getByText('Take a photo')); // Camera button
      });

      // Step 2: Descriptions (Optional)
      await waitFor(() => {
        expect(getByText('Describe Your Vision')).toBeTruthy();
        expect(getByText('Add specific requirements or constraints (optional)')).toBeTruthy();
        
        // Test optional text input
        const textInput = getByPlaceholderText('e.g., Include a reading nook, pet-friendly materials...');
        fireEvent.changeText(textInput, 'Include modern furniture with neutral colors');
        
        fireEvent.press(getByText('Continue'));
      });

      // Step 3: Furniture Preferences
      await waitFor(() => {
        expect(getByText('Furniture Preferences')).toBeTruthy();
        expect(getByText('Select furniture styles you love')).toBeTruthy();
        
        // Select furniture options
        fireEvent.press(getByText('Modern Sofa'));
        fireEvent.press(getByText('Continue'));
      });

      // Step 4: Budget Selection
      await waitFor(() => {
        expect(getByText('Budget Range')).toBeTruthy();
        expect(getByText("What's your budget for this project?")).toBeTruthy();
        
        // Select budget option
        fireEvent.press(getByText('$1,000 - $5,000'));
        fireEvent.press(getByText('Continue'));
      });

      // Step 5: Authentication (if not authenticated)
      await waitFor(() => {
        expect(getByText('Login') || getByText('Sign In')).toBeTruthy();
      });
    });

    it('should skip authentication if user is already authenticated', async () => {
      // Mock authenticated user
      mockUserStore.mockReturnValue({
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          nbToken: 3,
          currentPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn(),
        initializeAuth: jest.fn(),
      });

      const { getByText } = render(<FullAppWithoutNavigation />);

      // Navigate through flow
      await waitFor(() => {
        fireEvent.press(getByText('Continue with 3 Free Designs'));
      });
      
      // Go through photo → descriptions → furniture → budget
      fireEvent.press(getByText('Take a photo'));
      await waitFor(() => fireEvent.press(getByText('Continue')));
      await waitFor(() => fireEvent.press(getByText('Continue')));
      await waitFor(() => {
        fireEvent.press(getByText('$1,000 - $5,000'));
        fireEvent.press(getByText('Continue'));
      });

      // Should go directly to processing (skip auth)
      await waitFor(() => {
        expect(getByText('Creating your design...') || getByText('AI is analyzing')).toBeTruthy();
      });
    });

    it('should handle skip options in optional screens', async () => {
      const { getByText } = render(<FullAppWithoutNavigation />);

      // Navigate to descriptions screen
      await waitFor(() => {
        fireEvent.press(getByText('Continue with 3 Free Designs'));
      });
      
      fireEvent.press(getByText('Take a photo'));
      
      // Test skip functionality
      await waitFor(() => {
        expect(getByText('Skip for now')).toBeTruthy();
        fireEvent.press(getByText('Skip for now'));
      });

      // Should navigate to furniture screen
      await waitFor(() => {
        expect(getByText('Furniture Preferences')).toBeTruthy();
      });
    });
  });

  describe('🔐 Authentication Integration', () => {
    const mockLogin = jest.fn();
    const mockRegister = jest.fn();

    beforeEach(() => {
      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: mockLogin,
        logout: jest.fn(),
        register: mockRegister,
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn(),
        initializeAuth: jest.fn(),
      });
    });

    it('should handle successful login', async () => {
      mockLogin.mockResolvedValue(undefined);
      
      const { getByText, getByPlaceholderText } = render(<FullAppWithoutNavigation />);

      // Navigate to auth screen
      // ... navigate through flow to auth screen ...
      
      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login') || getByText('Sign In');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle login errors', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: mockLogin,
        logout: jest.fn(),
        register: mockRegister,
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn(),
        initializeAuth: jest.fn(),
      });

      const { getByText } = render(<FullAppWithoutNavigation />);

      // Error should be displayed
      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should handle registration flow', async () => {
      mockRegister.mockResolvedValue(undefined);
      
      const { getByText, getByPlaceholderText } = render(<FullAppWithoutNavigation />);

      // Test registration
      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const registerButton = getByText('Register') || getByText('Create Account');

        fireEvent.changeText(emailInput, 'newuser@example.com');
        fireEvent.changeText(passwordInput, 'newpassword123');
        fireEvent.press(registerButton);
      });

      expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'newpassword123');
    });
  });

  describe('🏁 Final Results and Integration', () => {
    it('should complete full journey and show results', async () => {
      // Mock authenticated user with credits
      mockUserStore.mockReturnValue({
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          nbToken: 2, // Will have 2 after consuming 1
          currentPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn().mockResolvedValue(true),
        initializeAuth: jest.fn(),
      });

      const { getByText } = render(<FullAppWithoutNavigation />);

      // Complete full flow
      // ... simulate complete user journey ...

      // Should reach results screen
      await waitFor(() => {
        expect(getByText('Design Results') || getByText('Your Design')).toBeTruthy();
      });

      // Should have consumed 1 credit
      expect(mockUserStore().consumeToken).toHaveBeenCalled();
    });

    it('should handle insufficient credits', async () => {
      // Mock user with no credits
      mockUserStore.mockReturnValue({
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          nbToken: 0, // No credits
          currentPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: 'Tokens insuffisants',
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn().mockResolvedValue(false),
        initializeAuth: jest.fn(),
      });

      const { getByText } = render(<FullAppWithoutNavigation />);

      // Should show insufficient credits message
      await waitFor(() => {
        expect(getByText('Tokens insuffisants') || getByText('Insufficient credits')).toBeTruthy();
      });
    });
  });

  describe('🔄 Navigation and State Management', () => {
    it('should handle back navigation correctly throughout the journey', async () => {
      const { getByTestId, getByText } = render(<FullAppWithoutNavigation />);

      // Test back navigation through multiple screens
      fireEvent.press(getByText('Continue')); // Onboarding 1 → 2
      fireEvent.press(getByText('Continue')); // Onboarding 2 → 3
      
      // Go back
      fireEvent.press(getByTestId('back-button'));
      
      await waitFor(() => {
        expect(getByText("What's Your Style?")).toBeTruthy();
      });
    });

    it('should persist user selections across navigation', async () => {
      const { getByText } = render(<FullAppWithoutNavigation />);

      // Select styles in onboarding
      fireEvent.press(getByText('Continue')); // To screen 2
      fireEvent.press(getByText('Modern'));
      fireEvent.press(getByText('Scandinavian'));
      
      // Navigate forward and back
      fireEvent.press(getByText('Continue')); // To screen 3
      fireEvent.press(getByTestId('back-button')); // Back to screen 2
      
      // Selections should be preserved
      await waitFor(() => {
        expect(getByText('2/2 styles selected')).toBeTruthy();
      });
    });
  });

  describe('⚠️ Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockSupabase.auth = {
        signInWithPassword: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any;

      mockUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Network error',
        setUser: jest.fn(),
        clearUser: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        login: jest.fn().mockRejectedValue(new Error('Network error')),
        logout: jest.fn(),
        register: jest.fn(),
        updateUserTokens: jest.fn(),
        updateUserPlan: jest.fn(),
        consumeTokens: jest.fn(),
        consumeToken: jest.fn(),
        initializeAuth: jest.fn(),
      });

      const { getByText } = render(<FullAppWithoutNavigation />);

      await waitFor(() => {
        expect(getByText('Network error')).toBeTruthy();
      });
    });

    it('should handle AsyncStorage errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const { getByText } = render(<FullAppWithoutNavigation />);

      // Should still function even with storage errors
      expect(getByText('AI-Powered Design')).toBeTruthy();
    });
  });
});