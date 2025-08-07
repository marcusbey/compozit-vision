// Authentication Types and Interfaces

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  preferredCurrency: string;
  timezone: string;
  onboardingCompleted: boolean;
  tutorialStepsCompleted: string[];
}

export interface UserPreferences {
  designStyles: DesignStyle[];
  budgetRange: {
    min: number;
    max: number;
  };
  preferredRoomTypes: RoomType[];
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  accessibilitySettings: AccessibilitySettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  projectUpdates: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  shareProjects: boolean;
  publicProfile: boolean;
  analytics: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reduceMotion: boolean;
}

export enum DesignStyle {
  MODERN = 'modern',
  TRADITIONAL = 'traditional',
  MINIMALIST = 'minimalist',
  INDUSTRIAL = 'industrial',
  SCANDINAVIAN = 'scandinavian',
  BOHEMIAN = 'bohemian',
  RUSTIC = 'rustic',
  CONTEMPORARY = 'contemporary',
  MID_CENTURY = 'mid_century',
  ECLECTIC = 'eclectic'
}

export enum RoomType {
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  DINING_ROOM = 'dining_room',
  HOME_OFFICE = 'home_office',
  NURSERY = 'nursery',
  OUTDOOR = 'outdoor'
}

export interface AuthResult {
  user: User;
  session: Session;
  error?: AuthError;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  deviceId: string;
  biometricEnabled: boolean;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_EXISTS = 'email_exists',
  SOCIAL_AUTH_ERROR = 'social_auth_error',
  BIOMETRIC_NOT_AVAILABLE = 'biometric_not_available',
  BIOMETRIC_NOT_ENROLLED = 'biometric_not_enrolled',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export interface SocialAuthProvider {
  provider: 'google' | 'apple' | 'facebook';
  clientId: string;
  redirectUrl: string;
}

export interface BiometricAuthOptions {
  promptMessage: string;
  fallbackPrompt?: string;
  cancelButtonText?: string;
}

export interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

export interface EmailVerificationRequest {
  email: string;
  redirectUrl: string;
}