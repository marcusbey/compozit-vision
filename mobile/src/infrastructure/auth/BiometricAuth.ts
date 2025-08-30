// Biometric Authentication Handler
import { Platform, Alert } from 'react-native';
import { AuthError, AuthErrorCode, BiometricAuthOptions } from './types';
import { TokenManager } from './TokenManager';

// Mock TouchID functionality for development
// TODO: Install and configure react-native-biometrics or react-native-touch-id for production
const TouchID = {
  isSupported: async (): Promise<string | null> => {
    // Mock implementation - in production, this should check actual biometric availability
    if (Platform.OS === 'ios') {
      return 'FaceID'; // or 'TouchID' based on device
    } else if (Platform.OS === 'android') {
      return 'Biometrics';
    }
    return null;
  },
  authenticate: async (title: string, config: any): Promise<boolean> => {
    // Mock implementation - shows alert instead of biometric prompt
    return new Promise((resolve) => {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication is not configured. Would you like to continue?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Continue', onPress: () => resolve(true) }
        ]
      );
    });
  }
};

export class BiometricAuth {
  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the type of biometric available
   */
  static async getBiometricType(): Promise<string | null> {
    try {
      const biometryType = await TouchID.isSupported();
      
      // Map the biometry type to user-friendly names
      switch (biometryType) {
        case 'FaceID':
          return 'Face ID';
        case 'TouchID':
          return 'Touch ID';
        case 'Biometrics':
          return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
        default:
          return biometryType;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(options?: BiometricAuthOptions): Promise<boolean> {
    try {
      const biometryType = await this.getBiometricType();
      
      if (!biometryType) {
        throw {
          code: AuthErrorCode.BIOMETRIC_NOT_AVAILABLE,
          message: 'Biometric authentication is not available on this device'
        } as AuthError;
      }

      const config = {
        title: options?.promptMessage || `Authenticate with ${biometryType}`,
        imageColor: '#007AFF',
        imageErrorColor: '#FF0000',
        sensorDescription: biometryType,
        sensorErrorDescription: 'Failed',
        cancelText: options?.cancelButtonText || 'Cancel',
        fallbackLabel: options?.fallbackPrompt || 'Use Passcode',
        unifiedErrors: false,
        passcodeFallback: true,
      };

      const result = await TouchID.authenticate(
        config.title,
        config
      );

      return result === true;
    } catch (error: any) {
      // Handle specific biometric errors
      if (error.code === 'UserCancel') {
        return false;
      } else if (error.code === 'UserFallback') {
        // User chose to use passcode instead
        return false;
      } else if (error.code === 'BiometryNotEnrolled') {
        throw {
          code: AuthErrorCode.BIOMETRIC_NOT_ENROLLED,
          message: 'No biometric authentication method is set up on this device',
          details: error
        } as AuthError;
      } else {
        throw {
          code: AuthErrorCode.BIOMETRIC_NOT_AVAILABLE,
          message: error.message || 'Biometric authentication failed',
          details: error
        } as AuthError;
      }
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  static async enable(): Promise<boolean> {
    try {
      // First check if biometric is available
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        throw {
          code: AuthErrorCode.BIOMETRIC_NOT_AVAILABLE,
          message: 'Biometric authentication is not available on this device'
        } as AuthError;
      }

      // Authenticate to confirm user intent
      const authenticated = await this.authenticate({
        promptMessage: 'Authenticate to enable biometric login',
        cancelButtonText: 'Cancel',
        fallbackPrompt: 'Use Passcode'
      });

      if (authenticated) {
        // Store the preference
        await TokenManager.setBiometricEnabled(true);
        return true;
      }

      return false;
    } catch (error) {
      if ((error as AuthError).code) {
        throw error;
      }
      
      throw {
        code: AuthErrorCode.UNKNOWN_ERROR,
        message: 'Failed to enable biometric authentication',
        details: error
      } as AuthError;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disable(): Promise<void> {
    await TokenManager.setBiometricEnabled(false);
  }

  /**
   * Check if biometric authentication is enabled
   */
  static async isEnabled(): Promise<boolean> {
    const isAvailable = await this.isAvailable();
    if (!isAvailable) return false;
    
    return await TokenManager.isBiometricEnabled();
  }

  /**
   * Prompt for biometric authentication if enabled
   */
  static async promptIfEnabled(): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    
    if (!isEnabled) {
      return true; // Skip biometric if not enabled
    }

    try {
      return await this.authenticate({
        promptMessage: 'Authenticate to access Compozit Vision',
        cancelButtonText: 'Cancel',
        fallbackPrompt: 'Use Passcode'
      });
    } catch (error) {
      // If biometric fails, return false to require password login
      return false;
    }
  }

  /**
   * Get biometric setup instructions based on platform
   */
  static getSetupInstructions(): string {
    if (Platform.OS === 'ios') {
      return 'To use biometric authentication, go to Settings > Face ID & Passcode (or Touch ID & Passcode) and set up your biometric authentication.';
    } else {
      return 'To use biometric authentication, go to Settings > Security > Fingerprint and add your fingerprint.';
    }
  }
}