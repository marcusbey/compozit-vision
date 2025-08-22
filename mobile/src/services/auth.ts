// Authentication service using Supabase Auth
import { supabase, Profile, supabaseHelpers } from './supabase';
import { StripeService } from './stripe';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
}

class AuthService {
  private static instance: AuthService;
  private authStateListeners: Array<(authState: AuthState) => void> = [];
  private currentState: AuthState = {
    user: null,
    loading: true,
    initialized: false
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
      AuthService.instance.initialize();
    }
    return AuthService.instance;
  }

  private async initialize() {
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const profile = await supabaseHelpers.getProfile(session.user.id);
        
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          profile: profile || undefined
        };

        this.updateState({
          user: authUser,
          loading: false,
          initialized: true
        });

        // Track sign in event
        if (event === 'SIGNED_IN') {
          await supabaseHelpers.trackEvent(
            session.user.id,
            'user_signed_in',
            { method: 'email' }
          );
        }
      } else {
        this.updateState({
          user: null,
          loading: false,
          initialized: true
        });
      }
    });

    // Get initial session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await supabaseHelpers.getProfile(session.user.id);
        
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          profile: profile || undefined
        };

        this.updateState({
          user: authUser,
          loading: false,
          initialized: true
        });
      } else {
        this.updateState({
          user: null,
          loading: false,
          initialized: true
        });
      }
    } catch (error) {
      console.error('Error getting initial session:', error);
      this.updateState({
        user: null,
        loading: false,
        initialized: true
      });
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.authStateListeners.forEach(listener => listener(this.currentState));
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (authState: AuthState) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Call immediately with current state
    callback(this.currentState);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== callback);
    };
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.currentState;
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (authData.user) {
        // Create profile
        await supabaseHelpers.updateProfile(authData.user.id, {
          email: data.email,
          full_name: data.fullName,
          subscription_tier: 'free',
          credits_remaining: 3, // Free tier gets 3 credits
        } as any);

        // Create Stripe customer
        const stripeService = StripeService.getInstance();
        const stripeCustomerId = await stripeService.createCustomer(
          data.email,
          data.fullName
        );

        if (stripeCustomerId) {
          await supabaseHelpers.updateProfile(authData.user.id, {
            stripe_customer_id: stripeCustomerId
          } as any);
        }

        // Track sign up event
        await supabaseHelpers.trackEvent(
          authData.user.id,
          'user_signed_up',
          { 
            method: 'email',
            has_name: !!data.fullName
          }
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message || 'Sign up failed' };
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Sign in failed' };
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message || 'Google sign in failed' };
    }
  }

  // Sign in with Apple
  async signInWithApple(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      return { success: false, error: error.message || 'Apple sign in failed' };
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Track sign out event
      if (this.currentState.user) {
        await supabaseHelpers.trackEvent(
          this.currentState.user.id,
          'user_signed_out',
          {}
        );
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        'userProfile',
        'userProjects',
        'userPreferences'
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message || 'Sign out failed' };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Password reset failed' };
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Track password update event
      if (this.currentState.user) {
        await supabaseHelpers.trackEvent(
          this.currentState.user.id,
          'password_updated',
          {}
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { success: false, error: error.message || 'Password update failed' };
    }
  }

  // Update profile
  async updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string; profile?: Profile }> {
    try {
      if (!this.currentState.user) {
        return { success: false, error: 'Not authenticated' };
      }

      const updatedProfile = await supabaseHelpers.updateProfile(
        this.currentState.user.id,
        updates
      );

      if (!updatedProfile) {
        return { success: false, error: 'Failed to update profile' };
      }

      // Update local state
      this.updateState({
        user: {
          ...this.currentState.user,
          profile: updatedProfile
        }
      });

      // Track profile update event
      await supabaseHelpers.trackEvent(
        this.currentState.user.id,
        'profile_updated',
        { fields: Object.keys(updates) }
      );

      return { success: true, profile: updatedProfile };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentState.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentState.user;
  }

  // Check if user has specific subscription
  hasSubscription(tier: 'pro' | 'business'): boolean {
    const profile = this.currentState.user?.profile;
    return profile?.subscription_tier === tier;
  }

  // Check if user has credits
  hasCredits(): boolean {
    const profile = this.currentState.user?.profile;
    return (profile?.credits_remaining || 0) > 0;
  }

  // Consume credits
  async consumeCredits(amount: number = 1): Promise<boolean> {
    try {
      if (!this.currentState.user?.profile) {
        return false;
      }

      const currentCredits = this.currentState.user.profile.credits_remaining;
      
      if (currentCredits < amount) {
        return false; // Not enough credits
      }

      const updatedProfile = await supabaseHelpers.updateProfile(
        this.currentState.user.id,
        { credits_remaining: currentCredits - amount } as any
      );

      if (updatedProfile) {
        this.updateState({
          user: {
            ...this.currentState.user,
            profile: updatedProfile
          }
        });

        // Track credit consumption
        await supabaseHelpers.trackEvent(
          this.currentState.user.id,
          'credits_consumed',
          { amount, remaining: updatedProfile.credits_remaining }
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }
}

export default AuthService;