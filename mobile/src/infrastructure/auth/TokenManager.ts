// Secure Token Management with React Native Keychain
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, AuthError, AuthErrorCode } from './types';
import DeviceInfo from 'react-native-device-info';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  deviceId: string;
  biometricEnabled: boolean;
}

export class TokenManager {
  private static readonly KEYCHAIN_SERVICE = 'CompozitVision';
  private static readonly TOKEN_KEY = 'auth_tokens';
  private static readonly BIOMETRIC_KEY = 'biometric_enabled';
  private static readonly DEVICE_ID_KEY = 'device_id';

  /**
   * Store tokens securely in keychain
   */
  static async storeTokens(session: Session): Promise<void> {
    try {
      const tokens: StoredTokens = {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt.toISOString(),
        deviceId: session.deviceId || await this.getDeviceId(),
        biometricEnabled: session.biometricEnabled || false
      };

      // Store in keychain for security
      await Keychain.setInternetCredentials(
        this.KEYCHAIN_SERVICE,
        this.TOKEN_KEY,
        JSON.stringify(tokens)
      );

      // Store biometric preference separately for quick access
      await AsyncStorage.setItem(
        this.BIOMETRIC_KEY, 
        JSON.stringify(session.biometricEnabled)
      );
    } catch (error) {
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to store authentication tokens',
        details: error
      } as AuthError;
    }
  }

  /**
   * Retrieve tokens from secure storage
   */
  static async getTokens(): Promise<Session | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        this.KEYCHAIN_SERVICE
      );

      if (!credentials) {
        return null;
      }

      const tokens: StoredTokens = JSON.parse(credentials.password);
      
      // Check if tokens are expired
      if (new Date(tokens.expiresAt) < new Date()) {
        await this.clearTokens();
        return null;
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(tokens.expiresAt),
        deviceId: tokens.deviceId,
        biometricEnabled: tokens.biometricEnabled
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get only the access token
   */
  static async getAccessToken(): Promise<string | null> {
    const session = await this.getTokens();
    return session?.accessToken || null;
  }

  /**
   * Get refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    const session = await this.getTokens();
    return session?.refreshToken || null;
  }

  /**
   * Update tokens (used after refresh)
   */
  static async updateTokens(
    accessToken: string, 
    refreshToken: string,
    expiresIn: number
  ): Promise<void> {
    const currentSession = await this.getTokens();
    if (!currentSession) {
      throw {
        code: AuthErrorCode.SESSION_EXPIRED,
        message: 'No active session to update'
      } as AuthError;
    }

    const updatedSession: Session = {
      ...currentSession,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    };

    await this.storeTokens(updatedSession);
  }

  /**
   * Clear all tokens (logout)
   */
  static async clearTokens(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(this.KEYCHAIN_SERVICE);
      await AsyncStorage.multiRemove([
        this.BIOMETRIC_KEY,
        this.DEVICE_ID_KEY
      ]);
    } catch (error) {
      // Ignore errors during cleanup
    }
  }

  /**
   * Check if user has active session
   */
  static async hasValidSession(): Promise<boolean> {
    const session = await this.getTokens();
    return session !== null && new Date(session.expiresAt) > new Date();
  }

  /**
   * Enable/disable biometric authentication
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    const session = await this.getTokens();
    if (!session) {
      throw {
        code: AuthErrorCode.SESSION_EXPIRED,
        message: 'No active session'
      } as AuthError;
    }

    session.biometricEnabled = enabled;
    await this.storeTokens(session);
  }

  /**
   * Check if biometric is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_KEY);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Get or generate device ID
   */
  private static async getDeviceId(): Promise<string> {
    try {
      // Try to get existing device ID
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generate new device ID
        deviceId = DeviceInfo.getUniqueId();
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      // Fallback to a generated ID
      const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(this.DEVICE_ID_KEY, fallbackId);
      return fallbackId;
    }
  }

  /**
   * Get secure headers for API requests
   */
  static async getAuthHeaders(): Promise<Record<string, string> | null> {
    const token = await this.getAccessToken();
    if (!token) {
      return null;
    }

    return {
      'Authorization': `Bearer ${token}`,
      'X-Device-ID': await this.getDeviceId()
    };
  }
}