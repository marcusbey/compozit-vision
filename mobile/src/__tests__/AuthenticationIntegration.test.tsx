import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserStore } from '../stores/userStore';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
  removeItem: jest.fn(),
}));

describe('🔐 Authentication Integration Tests', () => {
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.multiRemove.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('🚨 Critical Authentication Bugs', () => {
    it('should handle Supabase authentication errors correctly', async () => {
      const mockError = {
        message: 'Invalid login credentials',
        status: 400
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      // Should set error state
      expect(result.current.error).toBe('Invalid login credentials');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should handle missing profile creation during registration', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        created_at: new Date().toISOString()
      };

      // Mock successful signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      // Mock profile creation failure
      const mockProfileInsert = jest.fn().mockResolvedValue({
        error: { message: 'Profile creation failed' }
      });

      mockSupabase.from.mockReturnValue({
        insert: mockProfileInsert,
        select: jest.fn(),
        update: jest.fn(),
        eq: jest.fn(),
      } as any);

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.register('newuser@example.com', 'password123');
      });

      expect(mockProfileInsert).toHaveBeenCalledWith([{
        id: 'user-123',
        email: 'newuser@example.com',
        full_name: 'newuser',
        avatar_url: null,
        subscription_tier: 'free',
        subscription_status: 'active',
        credits_remaining: 3,
        preferences: {},
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }]);

      // Should handle profile creation error
      expect(result.current.error).toBe('Failed to create user profile');
    });

    it('should handle session persistence correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        credits_remaining: 3,
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock successful login
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { user: mockUser, access_token: 'token' }
        },
        error: null
      });

      // Mock profile fetch
      const mockProfileSelect = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: mockProfileSelect
          })
        }),
        insert: jest.fn(),
        update: jest.fn(),
      } as any);

      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Should set user state correctly
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatarUrl: undefined,
        preferences: {},
        nbToken: 3,
        currentPlan: 'free',
        createdAt: mockProfile.created_at,
        updatedAt: mockProfile.updated_at,
      });
    });

    it('should handle auth state changes from Supabase', async () => {
      const mockCallback = jest.fn();
      const mockSubscription = { unsubscribe: jest.fn() };

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription }
      });

      const { result } = renderHook(() => useUserStore());

      // Initialize auth
      const unsubscribe = result.current.initializeAuth();

      // Simulate auth state change
      const authCallback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];
      
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };

      // Mock profile fetch for auth state change
      const mockProfileSelect = jest.fn().mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
          credits_remaining: 3,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: mockProfileSelect
          })
        }),
        insert: jest.fn(),
        update: jest.fn(),
      } as any);

      await act(async () => {
        await authCallback('SIGNED_IN', mockSession);
      });

      // Should update auth state
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('userAuthState', expect.any(String));

      // Should return unsubscribe function
      expect(unsubscribe).toBeDefined();
      if (unsubscribe) {
        unsubscribe();
        expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      }
    });

    it('should handle logout and cleanup correctly', async () => {
      // First, set up authenticated user
      const { result } = renderHook(() => useUserStore());
      
      // Mock current authenticated state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          nbToken: 3,
          currentPlan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      // Mock successful logout
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      await act(async () => {
        const success = await result.current.logout();
        expect(success).toBe(true);
      });

      // Should clear user state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null);

      // Should clear AsyncStorage
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'userAuthState',
        'userProfile', 
        'userProjects',
        'userPreferences'
      ]);
    });

    it('should handle logout errors', async () => {
      const { result } = renderHook(() => useUserStore());

      // Mock logout error
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Logout failed' }
      });

      await act(async () => {
        const success = await result.current.logout();
        expect(success).toBe(false);
      });

      // Should set error but not clear user state on failed logout
      expect(result.current.error).toBe('Logout failed');
    });
  });

  describe('🎯 Credit System Integration', () => {
    it('should update user tokens correctly in Supabase', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 5,
        currentPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => useUserStore());
      
      // Set initial user
      act(() => {
        result.current.setUser(mockUser);
      });

      // Mock successful token update
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        update: () => ({
          eq: mockUpdate
        }),
        select: jest.fn(),
        insert: jest.fn(),
      } as any);

      await act(async () => {
        await result.current.updateUserTokens(3);
      });

      expect(mockUpdate).toHaveBeenCalledWith('user-123');
      expect(result.current.user?.nbToken).toBe(3);
    });

    it('should handle token consumption correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 2,
        currentPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });

      // Mock successful token update
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        update: () => ({
          eq: mockUpdate
        }),
        select: jest.fn(),
        insert: jest.fn(),
      } as any);

      await act(async () => {
        const success = await result.current.consumeToken();
        expect(success).toBe(true);
      });

      // Should consume 1 token
      await waitFor(() => {
        expect(result.current.user?.nbToken).toBe(1);
      });
    });

    it('should handle insufficient tokens correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 0, // No tokens left
        currentPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });

      await act(async () => {
        const success = await result.current.consumeToken();
        expect(success).toBe(false);
      });

      // Should set error about insufficient tokens
      expect(result.current.error).toBe('Tokens insuffisants');
      expect(result.current.user?.nbToken).toBe(0); // Should remain 0
    });

    it('should update user plan correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 3,
        currentPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });

      // Mock successful plan update
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        update: () => ({
          eq: mockUpdate
        }),
        select: jest.fn(),
        insert: jest.fn(),
      } as any);

      await act(async () => {
        await result.current.updateUserPlan('pro', 200);
      });

      expect(result.current.user?.currentPlan).toBe('pro');
      expect(result.current.user?.nbToken).toBe(200);
    });
  });

  describe('🔧 Environment and Configuration Issues', () => {
    it('should handle missing Supabase configuration', () => {
      // This test would check if the app gracefully handles missing env vars
      // Since we're hardcoding values now, this tests the fallback behavior
      
      const originalUrl = process.env.SUPABASE_URL;
      const originalKey = process.env.SUPABASE_ANON_KEY;
      
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      
      // The service should still work with hardcoded values
      expect(() => {
        jest.isolateModules(() => {
          require('../services/supabase');
        });
      }).not.toThrow();
      
      // Restore env vars
      process.env.SUPABASE_URL = originalUrl;
      process.env.SUPABASE_ANON_KEY = originalKey;
    });

    it('should handle AsyncStorage permission errors', async () => {
      const { result } = renderHook(() => useUserStore());
      
      // Mock AsyncStorage permission error
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Permission denied'));
      
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      });

      // Mock profile fetch
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                full_name: 'Test User',
                credits_remaining: 3,
                subscription_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null
            })
          })
        }),
        insert: jest.fn(),
        update: jest.fn(),
      } as any);

      // Login should still work even if AsyncStorage fails
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      // Error might be set due to storage failure, but auth should still work
    });
  });

  describe('🌐 Network and Connectivity', () => {
    it('should handle network timeouts during authentication', async () => {
      const { result } = renderHook(() => useUserStore());
      
      // Mock network timeout
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network request timeout')
      );

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.error).toBe('Network request timeout');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle intermittent connectivity during profile sync', async () => {
      const { result } = renderHook(() => useUserStore());
      
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      
      // Mock successful auth but failed profile fetch
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockRejectedValue(new Error('Connection lost'))
          })
        }),
        insert: jest.fn(),
        update: jest.fn(),
      } as any);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Should handle profile fetch failure gracefully
      expect(result.current.error).toContain('Connection lost');
    });
  });
});