// Main Authentication Service
import { supabase } from '../supabase/client';
import { TokenManager } from './TokenManager';
import { BiometricAuth } from './BiometricAuth';
import { SocialAuth } from './SocialAuth';
import {
  User,
  AuthResult,
  AuthError,
  AuthErrorCode,
  Session,
  PasswordResetRequest,
  EmailVerificationRequest,
  UserProfile,
  UserPreferences
} from './types';

export class AuthService {
  /**
   * Initialize authentication service
   */
  static async initialize(): Promise<void> {
    // Initialize social auth providers
    await SocialAuth.initialize();

    // Check for existing session
    const session = await TokenManager.getTokens();
    if (session) {
      // Validate session with backend
      await this.validateSession();
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw {
          code: AuthErrorCode.UNKNOWN_ERROR,
          message: 'Failed to create account'
        } as AuthError;
      }

      // Create user profile
      await this.createUserProfile(data.user.id, { displayName });

      // Store tokens
      const session: Session = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token || '',
        expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000),
        deviceId: '',
        biometricEnabled: false
      };

      await TokenManager.storeTokens(session);

      return {
        user: this.mapSupabaseUser(data.user),
        session
      };
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to sign up',
        details: error
      } as AuthError;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        } as AuthError;
      }

      // Store tokens
      const session: Session = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token || '',
        expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000),
        deviceId: '',
        biometricEnabled: await TokenManager.isBiometricEnabled()
      };

      await TokenManager.storeTokens(session);

      return {
        user: this.mapSupabaseUser(data.user),
        session
      };
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to sign in',
        details: error
      } as AuthError;
    }
  }

  /**
   * Sign in with biometric authentication
   */
  static async signInWithBiometric(): Promise<AuthResult> {
    try {
      // Check if biometric is enabled
      const isEnabled = await BiometricAuth.isEnabled();
      if (!isEnabled) {
        throw {
          code: AuthErrorCode.BIOMETRIC_NOT_ENROLLED,
          message: 'Biometric authentication is not enabled'
        } as AuthError;
      }

      // Authenticate with biometric
      const authenticated = await BiometricAuth.authenticate({
        promptMessage: 'Sign in to Compozit Vision'
      });

      if (!authenticated) {
        throw {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Biometric authentication failed'
        } as AuthError;
      }

      // Get stored session
      const session = await TokenManager.getTokens();
      if (!session) {
        throw {
          code: AuthErrorCode.SESSION_EXPIRED,
          message: 'No stored session found'
        } as AuthError;
      }

      // Validate session with backend
      const user = await this.validateSession();
      if (!user) {
        throw {
          code: AuthErrorCode.SESSION_EXPIRED,
          message: 'Session is invalid'
        } as AuthError;
      }

      return {
        user,
        session
      };
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to sign in with biometric',
        details: error
      } as AuthError;
    }
  }

  /**
   * Social authentication methods
   */
  static signInWithGoogle = SocialAuth.signInWithGoogle.bind(SocialAuth);
  static signInWithApple = SocialAuth.signInWithApple.bind(SocialAuth);
  static signInWithFacebook = SocialAuth.signInWithFacebook.bind(SocialAuth);

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      // Sign out from social providers
      await SocialAuth.signOut();

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear stored tokens
      await TokenManager.clearTokens();
    } catch (error) {
      // Always clear tokens even if sign out fails
      await TokenManager.clearTokens();
    }
  }

  /**
   * Request password reset
   */
  static async resetPassword(request: PasswordResetRequest): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: request.redirectUrl
        }
      );

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to send password reset email',
        details: error
      } as AuthError;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to update password',
        details: error
      } as AuthError;
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(request: EmailVerificationRequest): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: request.email,
        options: {
          emailRedirectTo: request.redirectUrl
        }
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to resend verification email',
        details: error
      } as AuthError;
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<void> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw {
          code: AuthErrorCode.SESSION_EXPIRED,
          message: 'No refresh token available'
        } as AuthError;
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.session) {
        throw {
          code: AuthErrorCode.SESSION_EXPIRED,
          message: 'Failed to refresh session'
        } as AuthError;
      }

      // Update stored tokens
      await TokenManager.updateTokens(
        data.session.access_token,
        data.session.refresh_token || refreshToken,
        data.session.expires_in || 3600
      );
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to refresh token',
        details: error
      } as AuthError;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return this.mapSupabaseUser(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate current session
   */
  static async validateSession(): Promise<User | null> {
    try {
      const token = await TokenManager.getAccessToken();
      if (!token) {
        return null;
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        await TokenManager.clearTokens();
        return null;
      }

      return this.mapSupabaseUser(user);
    } catch (error) {
      await TokenManager.clearTokens();
      return null;
    }
  }

  /**
   * Enable biometric authentication
   */
  static enableBiometric = BiometricAuth.enable.bind(BiometricAuth);

  /**
   * Disable biometric authentication
   */
  static disableBiometric = BiometricAuth.disable.bind(BiometricAuth);

  /**
   * Check if biometric is available
   */
  static isBiometricAvailable = BiometricAuth.isAvailable.bind(BiometricAuth);

  /**
   * Check if biometric is enabled
   */
  static isBiometricEnabled = BiometricAuth.isEnabled.bind(BiometricAuth);

  /**
   * Create user profile
   */
  private static async createUserProfile(userId: string, data: { displayName?: string }): Promise<void> {
    try {
      await supabase.from('user_profiles').insert({
        user_id: userId,
        display_name: data.displayName,
        onboarding_completed: false,
        tutorial_steps_completed: []
      });

      await supabase.from('user_preferences').insert({
        user_id: userId,
        design_styles: [],
        preferred_room_types: []
      });
    } catch (error) {
      // Ignore profile creation errors
    }
  }

  /**
   * Map Supabase user to our User type
   */
  private static mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      phoneNumber: supabaseUser.phone,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
    };
  }

  /**
   * Map Supabase errors to our error types
   */
  private static mapSupabaseError(error: any): AuthError {
    const message = error.message || 'Authentication failed';
    
    if (message.includes('Invalid login credentials')) {
      return {
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
        details: error
      };
    }
    
    if (message.includes('User already registered')) {
      return {
        code: AuthErrorCode.EMAIL_EXISTS,
        message: 'An account with this email already exists',
        details: error
      };
    }
    
    if (message.includes('Password should be at least')) {
      return {
        code: AuthErrorCode.WEAK_PASSWORD,
        message: 'Password must be at least 6 characters',
        details: error
      };
    }
    
    if (message.includes('Email not confirmed')) {
      return {
        code: AuthErrorCode.EMAIL_NOT_VERIFIED,
        message: 'Please verify your email address',
        details: error
      };
    }
    
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message,
      details: error
    };
  }
}