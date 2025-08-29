/**
 * Native Authentication Service
 * Handles platform-specific authentication and account linking
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Types
export interface NativeAuthResult {
  success: boolean;
  email?: string;
  error?: string;
  platform?: 'apple' | 'google' | 'email';
  userId?: string;
}

export interface PaymentAccount {
  id: string;
  email: string;
  platform: 'apple' | 'google';
  subscriptionId?: string;
  planId?: string;
  createdAt: string;
}

export interface AccountLinkResult {
  success: boolean;
  linkedAccountId?: string;
  error?: string;
}

/**
 * Native Authentication Service Class
 */
export class NativeAuthService {
  private static instance: NativeAuthService;
  
  public static getInstance(): NativeAuthService {
    if (!NativeAuthService.instance) {
      NativeAuthService.instance = new NativeAuthService();
    }
    return NativeAuthService.instance;
  }

  /**
   * Handle Apple ID Sign-In (iOS)
   */
  async signInWithApple(): Promise<NativeAuthResult> {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign-In only available on iOS' };
    }

    try {
      // TODO: Implement Apple Authentication
      // For now, simulate Apple ID sign-in
      console.log('🍎 Initiating Apple ID Sign-In...');
      
      // Simulate Apple ID response
      const appleResponse = {
        email: 'user@privaterelay.appleid.com',
        fullName: { givenName: 'John', familyName: 'Doe' },
        identityToken: 'mock-identity-token',
        user: 'mock-apple-user-id'
      };

      // Create or update user with Supabase
      const authResult = await this.handleNativeAuthResult({
        email: appleResponse.email,
        platform: 'apple',
        providerId: appleResponse.user
      });

      return {
        success: true,
        email: appleResponse.email,
        platform: 'apple',
        userId: authResult.userId
      };

    } catch (error) {
      console.error('Apple Sign-In error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple Sign-In failed'
      };
    }
  }

  /**
   * Handle Google Sign-In (Android/iOS)
   */
  async signInWithGoogle(): Promise<NativeAuthResult> {
    try {
      // TODO: Implement Google Authentication
      // For now, simulate Google sign-in
      console.log('🔍 Initiating Google Sign-In...');
      
      // Simulate Google response
      const googleResponse = {
        email: 'user@gmail.com',
        name: 'John Doe',
        photo: 'https://example.com/photo.jpg',
        id: 'mock-google-user-id'
      };

      // Create or update user with Supabase
      const authResult = await this.handleNativeAuthResult({
        email: googleResponse.email,
        platform: 'google',
        providerId: googleResponse.id
      });

      return {
        success: true,
        email: googleResponse.email,
        platform: 'google',
        userId: authResult.userId
      };

    } catch (error) {
      console.error('Google Sign-In error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Sign-In failed'
      };
    }
  }

  /**
   * Handle Email/Password Authentication
   */
  async signInWithEmail(email: string, password: string): Promise<NativeAuthResult> {
    try {
      console.log('📧 Authenticating with email:', email);

      // Development bypass for testing
      if (__DEV__ && (email.includes('dev@') || email.includes('test@') || password === 'test123')) {
        console.log('🚀 Development bypass: Mock email authentication');
        const mockUserId = 'dev-user-' + Date.now().toString();
        return {
          success: true,
          email,
          platform: 'email',
          userId: mockUserId
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        email: data.user?.email,
        platform: 'email',
        userId: data.user?.id
      };

    } catch (error) {
      console.error('Email sign-in error:', error);
      
      // In development, provide helpful error message
      if (__DEV__) {
        return {
          success: false,
          error: 'Authentication failed. For development testing, use email containing "dev@" or "test@" with any password, or use password "test123"'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sign-in failed'
      };
    }
  }

  /**
   * Sign up with Email/Password
   */
  async signUpWithEmail(email: string, password: string): Promise<NativeAuthResult> {
    try {
      console.log('📧 Signing up with email:', email);

      // Development bypass for testing
      if (__DEV__ && (email.includes('dev@') || email.includes('test@') || password === 'test123')) {
        console.log('🚀 Development bypass: Mock email signup');
        const mockUserId = 'dev-user-' + Date.now().toString();
        return {
          success: true,
          email,
          platform: 'email',
          userId: mockUserId
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        email: data.user?.email,
        platform: 'email',
        userId: data.user?.id
      };

    } catch (error) {
      console.error('Email sign-up error:', error);
      
      // In development, provide helpful error message
      if (__DEV__) {
        return {
          success: false,
          error: 'Signup failed. For development testing, use email containing "dev@" or "test@" with any password, or use password "test123"'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sign-up failed'
      };
    }
  }

  /**
   * Handle native authentication result and create/update user
   */
  private async handleNativeAuthResult(params: {
    email: string;
    platform: 'apple' | 'google';
    providerId: string;
  }): Promise<{ userId: string }> {
    const { email, platform, providerId } = params;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update existing user
      await supabase
        .from('profiles')
        .update({
          [`${platform}_provider_id`]: providerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

      return { userId: existingUser.id };
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert({
          email,
          [`${platform}_provider_id`]: providerId,
          subscription_tier: 'free',
          subscription_status: 'inactive',
          credits_remaining: 3,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error || !newUser) {
        throw new Error('Failed to create user account');
      }

      return { userId: newUser.id };
    }
  }

  /**
   * Create payment account during subscription purchase
   */
  async createPaymentAccount(params: {
    email: string;
    platform: 'apple' | 'google';
    planId: string;
    subscriptionId?: string;
  }): Promise<PaymentAccount> {
    const { email, platform, planId, subscriptionId } = params;

    try {
      // Store payment account info temporarily
      const paymentAccount: PaymentAccount = {
        id: `${platform}_${Date.now()}`,
        email,
        platform,
        subscriptionId,
        planId,
        createdAt: new Date().toISOString()
      };

      // Store in AsyncStorage temporarily until account linking
      await AsyncStorage.setItem(
        'pendingPaymentAccount',
        JSON.stringify(paymentAccount)
      );

      console.log('💳 Payment account created:', paymentAccount);
      return paymentAccount;

    } catch (error) {
      console.error('Error creating payment account:', error);
      throw error;
    }
  }

  /**
   * Link payment account with user account
   */
  async linkAccounts(userId: string): Promise<AccountLinkResult> {
    try {
      // Get pending payment account
      const pendingAccountData = await AsyncStorage.getItem('pendingPaymentAccount');
      
      if (!pendingAccountData) {
        return { success: true }; // No pending account to link
      }

      const paymentAccount: PaymentAccount = JSON.parse(pendingAccountData);

      // Update user profile with subscription info
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: this.getPlanTier(paymentAccount.planId),
          subscription_status: 'active',
          stripe_customer_id: paymentAccount.subscriptionId,
          payment_email: paymentAccount.email || null,
          payment_platform: paymentAccount.platform,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Clear pending payment account
      await AsyncStorage.removeItem('pendingPaymentAccount');

      console.log('🔗 Accounts linked successfully');
      return { 
        success: true, 
        linkedAccountId: paymentAccount.id 
      };

    } catch (error) {
      console.error('Error linking accounts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Account linking failed'
      };
    }
  }

  /**
   * Get pending payment account
   */
  async getPendingPaymentAccount(): Promise<PaymentAccount | null> {
    try {
      const data = await AsyncStorage.getItem('pendingPaymentAccount');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting pending payment account:', error);
      return null;
    }
  }

  /**
   * Helper to determine plan tier
   */
  private getPlanTier(planId: string): 'free' | 'pro' | 'business' {
    switch (planId) {
      case 'pro': return 'pro';
      case 'business': return 'business';
      default: return 'free';
    }
  }

  /**
   * Check if user has pending payment
   */
  async hasPendingPayment(): Promise<boolean> {
    const pendingAccount = await this.getPendingPaymentAccount();
    return pendingAccount !== null;
  }

  /**
   * Clear all stored auth data
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'pendingPaymentAccount',
        'userAuthData'
      ]);
      console.log('🗑️ Auth data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}

// Export singleton instance
export const nativeAuthService = NativeAuthService.getInstance();

// Export types
export default NativeAuthService;