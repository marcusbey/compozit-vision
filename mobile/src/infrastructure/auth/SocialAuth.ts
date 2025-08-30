// Social Authentication Provider Integration
import { Platform, Alert } from 'react-native';
import { supabase } from '../supabase/client';
import { AuthResult, AuthError, AuthErrorCode, User } from './types';

// Mock Google Sign-In for development
// TODO: Install and configure @react-native-google-signin/google-signin for production
const GoogleSignin = {
  configure: (config: any) => {
    console.log('Google Sign-In configured (mock):', config);
  },
  hasPlayServices: async () => Promise.resolve(true),
  signIn: async () => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Google Sign-In',
        'Google Sign-In is not configured. Would you like to continue with mock authentication?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Sign in cancelled')) },
          { text: 'Continue', onPress: () => resolve({ idToken: 'mock-id-token' }) }
        ]
      );
    });
  },
  signOut: async () => Promise.resolve(),
  isSignedIn: async () => Promise.resolve(false),
  getCurrentUser: async () => Promise.resolve(null)
};

const GoogleStatusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
};

// Mock Apple Auth for development
const appleAuth = {
  Operation: { LOGIN: 'LOGIN' },
  Scope: { EMAIL: 'EMAIL', FULL_NAME: 'FULL_NAME' },
  Error: { CANCELED: 'CANCELED' },
  performRequest: async (options: any) => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Apple Sign-In',
        'Apple Sign-In is not configured. Would you like to continue with mock authentication?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Sign in cancelled')) },
          { text: 'Continue', onPress: () => resolve({ identityToken: 'mock-identity-token' }) }
        ]
      );
    });
  }
};

// Mock Facebook SDK for development
const LoginManager = {
  logInWithPermissions: async (permissions: string[]) => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Facebook Sign-In',
        'Facebook Sign-In is not configured. Would you like to continue with mock authentication?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ isCancelled: true }) },
          { text: 'Continue', onPress: () => resolve({ isCancelled: false }) }
        ]
      );
    });
  },
  logOut: () => console.log('Facebook logout (mock)')
};

const AccessToken = {
  getCurrentAccessToken: async () => Promise.resolve({ accessToken: 'mock-access-token' })
};

export class SocialAuth {
  /**
   * Initialize social auth providers
   */
  static async initialize() {
    // Configure Google Sign In
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }

  /**
   * Sign in with Google
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Check if Google Play Services are available (Android)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();

      if (!idToken) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Failed to get Google ID token'
        } as AuthError;
      }

      // Exchange the ID token with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: error.message,
          details: error
        } as AuthError;
      }

      if (!data.user || !data.session) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Failed to authenticate with Google'
        } as AuthError;
      }

      return {
        user: this.mapSupabaseUser(data.user),
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token || '',
          expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000),
          deviceId: '',
          biometricEnabled: false
        }
      };
    } catch (error: any) {
      if (error.code === GoogleStatusCodes.SIGN_IN_CANCELLED) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Google sign in was cancelled'
        } as AuthError;
      } else if (error.code === GoogleStatusCodes.IN_PROGRESS) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Google sign in is already in progress'
        } as AuthError;
      } else if (error.code === GoogleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Google Play Services are not available'
        } as AuthError;
      }

      throw {
        code: AuthErrorCode.SOCIAL_AUTH_ERROR,
        message: error.message || 'Failed to sign in with Google',
        details: error
      } as AuthError;
    }
  }

  /**
   * Sign in with Apple (iOS only)
   */
  static async signInWithApple(): Promise<AuthResult> {
    if (Platform.OS !== 'ios') {
      throw {
        code: AuthErrorCode.SOCIAL_AUTH_ERROR,
        message: 'Apple sign in is only available on iOS'
      } as AuthError;
    }

    try {
      // Request Apple authentication
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure we have the required fields
      if (!appleAuthRequestResponse.identityToken) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Failed to get Apple identity token'
        } as AuthError;
      }

      // Sign in with Supabase using the Apple token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken,
      });

      if (error) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: error.message,
          details: error
        } as AuthError;
      }

      if (!data.user || !data.session) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Failed to authenticate with Apple'
        } as AuthError;
      }

      // Update user profile with Apple provided name if available
      if (appleAuthRequestResponse.fullName?.givenName || appleAuthRequestResponse.fullName?.familyName) {
        const displayName = [
          appleAuthRequestResponse.fullName.givenName,
          appleAuthRequestResponse.fullName.familyName
        ].filter(Boolean).join(' ');

        await supabase.from('user_profiles').upsert({
          user_id: data.user.id,
          display_name: displayName
        });
      }

      return {
        user: this.mapSupabaseUser(data.user),
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token || '',
          expiresAt: new Date(Date.now() + (data.session.expires_in || 3600) * 1000),
          deviceId: '',
          biometricEnabled: false
        }
      };
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Apple sign in was cancelled'
        } as AuthError;
      }

      throw {
        code: AuthErrorCode.SOCIAL_AUTH_ERROR,
        message: error.message || 'Failed to sign in with Apple',
        details: error
      } as AuthError;
    }
  }

  /**
   * Sign in with Facebook
   */
  static async signInWithFacebook(): Promise<AuthResult> {
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Facebook sign in was cancelled'
        } as AuthError;
      }

      // Get the access token
      const accessTokenData = await AccessToken.getCurrentAccessToken();

      if (!accessTokenData) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: 'Failed to get Facebook access token'
        } as AuthError;
      }

      // Sign in with Supabase using the Facebook token
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'compozit://auth/callback',
        }
      });

      if (error) {
        throw {
          code: AuthErrorCode.SOCIAL_AUTH_ERROR,
          message: error.message,
          details: error
        } as AuthError;
      }

      // Note: Facebook OAuth flow will redirect, so we need to handle the callback
      // This is typically handled by deep linking
      return {
        user: {} as User, // Will be populated after OAuth callback
        session: {
          accessToken: '',
          refreshToken: '',
          expiresAt: new Date(),
          deviceId: '',
          biometricEnabled: false
        }
      };
    } catch (error: any) {
      throw {
        code: AuthErrorCode.SOCIAL_AUTH_ERROR,
        message: error.message || 'Failed to sign in with Facebook',
        details: error
      } as AuthError;
    }
  }

  /**
   * Sign out from social providers
   */
  static async signOut(provider?: 'google' | 'apple' | 'facebook') {
    try {
      if (!provider || provider === 'google') {
        await GoogleSignin.signOut();
      }
      
      if (!provider || provider === 'facebook') {
        LoginManager.logOut();
      }
      
      // Apple doesn't have a sign out method
      
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore sign out errors
    }
  }

  /**
   * Check if user is signed in with a social provider
   */
  static async isSignedIn(provider: 'google' | 'apple' | 'facebook'): Promise<boolean> {
    try {
      switch (provider) {
        case 'google':
          return await GoogleSignin.isSignedIn();
        case 'facebook':
          const token = await AccessToken.getCurrentAccessToken();
          return token !== null;
        case 'apple':
          // Check with Supabase session
          const { data } = await supabase.auth.getSession();
          return data.session?.user?.app_metadata?.provider === 'apple';
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current social user info
   */
  static async getCurrentUser(provider: 'google'): Promise<any> {
    try {
      switch (provider) {
        case 'google':
          return await GoogleSignin.getCurrentUser();
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Map Supabase user to our User type
   */
  private static mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
      phoneNumber: supabaseUser.phone,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
    };
  }
}