import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nativeAuthService, NativeAuthResult } from '../../services/nativeAuth';

interface AuthScreenProps {
  navigation: any;
  route: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [socialAuthLoading, setSocialAuthLoading] = useState<'apple' | 'google' | null>(null);
  const { setUser, error } = useUserStore();
  const journeyStore = useJourneyStore();
  
  // Check for pending payment account on mount
  useEffect(() => {
    checkPendingPayment();
  }, []);

  const checkPendingPayment = async () => {
    const hasPending = await nativeAuthService.hasPendingPayment();
    if (hasPending) {
      const pendingAccount = await nativeAuthService.getPendingPaymentAccount();
      console.log('💳 Pending payment account found:', pendingAccount?.email);
      Alert.alert(
        'Complete Account Setup',
        `You have a pending subscription from ${pendingAccount?.email}. Create your account to activate it.`
      );
    }
  };

  // Auth screen is not part of the main journey anymore
  // Users are auto-created during Apple/Google payment
  useEffect(() => {
    // Only show this screen for cross-platform login scenarios
    console.log('Auth screen accessed - likely for cross-platform login');
  }, []);

  /**
   * Handle Apple ID Authentication
   */
  const handleAppleAuth = async () => {
    setSocialAuthLoading('apple');
    
    try {
      const result = await nativeAuthService.signInWithApple();
      await handleAuthResult(result, 'apple');
    } catch (error) {
      console.error('Apple auth error:', error);
      Alert.alert('Apple Sign-In Failed', 'Please try again or use another sign-in method.');
    } finally {
      setSocialAuthLoading(null);
    }
  };

  /**
   * Handle Google Authentication
   */
  const handleGoogleAuth = async () => {
    setSocialAuthLoading('google');
    
    try {
      const result = await nativeAuthService.signInWithGoogle();
      await handleAuthResult(result, 'google');
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert('Google Sign-In Failed', 'Please try again or use another sign-in method.');
    } finally {
      setSocialAuthLoading(null);
    }
  };

  /**
   * Handle Email/Password Authentication
   */
  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = isLogin 
        ? await nativeAuthService.signInWithEmail(email, password)
        : await nativeAuthService.signUpWithEmail(email, password);
      
      await handleAuthResult(result, 'email');
    } catch (error) {
      console.error('Email auth error:', error);
      Alert.alert('Authentication Failed', 'Invalid credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle authentication result from any provider
   */
  const handleAuthResult = async (result: NativeAuthResult, method: 'apple' | 'google' | 'email') => {
    if (!result.success || !result.email || !result.userId) {
      Alert.alert('Authentication Failed', result.error || 'Unknown error occurred');
      return;
    }

    // Create user object for store
    const userData = {
      id: result.userId,
      email: result.email,
      fullName: null,
      avatarUrl: null,
      preferences: {},
      nbToken: 10, // Default credits
      currentPlan: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Set user in store
    setUser(userData);

    // Link any pending payment accounts
    const linkResult = await nativeAuthService.linkAccounts(result.userId);
    if (linkResult.success && linkResult.linkedAccountId) {
      console.log('✅ Payment account linked successfully');
      // Update user with subscription info if linked
      userData.currentPlan = 'pro'; // Will be updated based on actual plan
    }

    // Update journey with authentication info
    journeyStore.updateAuthentication({
      hasAccount: true,
      email: result.email,
      method,
      registeredAt: isLogin ? undefined : new Date().toISOString()
    });
    
    // Complete auth step
    journeyStore.completeStep('auth');

    // Route based on context
    await routeAfterAuth(userData, linkResult.success);
  };

  /**
   * Route user after successful authentication
   */
  const routeAfterAuth = async (user: any, hasLinkedPayment: boolean) => {
    const journeyProgress = journeyStore.progress;
    const isInPaywallFlow = journeyProgress.completedSteps.includes('paywall');
    
    if (isLogin && !isInPaywallFlow) {
      // Existing user logging in directly → My Projects
      NavigationHelpers.navigateToScreen('myProjects');
    } else if (hasLinkedPayment || isInPaywallFlow) {
      // User with subscription or in paywall flow → Start project wizard
      NavigationHelpers.navigateToScreen('categorySelection');
    } else if (user.nbToken <= 0) {
      // User without credits → Back to paywall
      Alert.alert(
        'Insufficient Credits', 
        'You need credits to generate a design. Please select a plan.',
        [{ text: 'OK', onPress: () => NavigationHelpers.navigateToScreen('paywall') }]
      );
    } else {
      // Default → Start project wizard
      NavigationHelpers.navigateToScreen('categorySelection');
    }
  };

  // Development bypass for testing
  const handleDevelopmentBypass = () => {
    Alert.alert(
      'Development Mode', 
      'Skip authentication for testing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip Auth', 
          onPress: () => {
            // Create a mock user for development with proper UUID format
            const generateUUID = () => {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            };
            
            const mockUser = {
              id: generateUUID(),
              email: 'dev@compozit.com',
              fullName: 'Development User',
              avatarUrl: null,
              preferences: {},
              nbToken: 10,
              currentPlan: 'pro',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            const { setUser } = useUserStore.getState();
            setUser(mockUser);
            
            console.log('🚀 Development bypass: Mock user created');
            NavigationHelpers.navigateToScreen('processing');
          }
        }
      ]
    );
  };

  // Reset welcome screen for testing
  const handleResetWelcome = () => {
    Alert.alert(
      'Reset Welcome Screen', 
      'This will clear the welcome flag and restart the app from the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('hasSeenWelcome');
              await AsyncStorage.clear(); // Clear all app data
              console.log('✅ Welcome screen reset - app will restart from welcome');
              Alert.alert('Success', 'Please reload the app to see the welcome screen');
            } catch (error) {
              console.error('Error resetting welcome:', error);
              Alert.alert('Error', 'Failed to reset welcome screen');
            }
          }
        }
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#E8C097', '#D4A574']}
                style={styles.logoGradient}
              >
                <Ionicons name="home" size={30} color="#2D2B28" />
              </LinearGradient>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.title}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin 
                  ? 'Sign in to continue your project' 
                  : 'Join Compozit Vision to transform your spaces'
                }
              </Text>
              
              {/* Development Mode Instructions */}
              {__DEV__ && (
                <View style={styles.devInstructionsContainer}>
                  <Text style={styles.devInstructionsTitle}>🚀 Development Mode</Text>
                  <Text style={styles.devInstructionsText}>
                    For testing, use:
                    {'\n'}• Email: dev@compozit.com or test@example.com
                    {'\n'}• Password: test123 (or any password)
                  </Text>
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.form}>
                {/* Social Authentication Buttons */}
                <View style={styles.socialAuthSection}>
                  <Text style={styles.socialAuthTitle}>
                    {isLogin ? 'Sign in with' : 'Create account with'}
                  </Text>
                  
                  {/* Apple Sign In */}
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={[styles.socialButton, styles.appleButton]}
                      onPress={handleAppleAuth}
                      disabled={socialAuthLoading === 'apple'}
                      activeOpacity={0.9}
                    >
                      {socialAuthLoading === 'apple' ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                      )}
                      <Text style={styles.appleButtonText}>
                        Continue with Apple
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Google Sign In */}
                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={handleGoogleAuth}
                    disabled={socialAuthLoading === 'google'}
                    activeOpacity={0.9}
                  >
                    {socialAuthLoading === 'google' ? (
                      <ActivityIndicator size="small" color="#DB4437" />
                    ) : (
                      <Ionicons name="logo-google" size={20} color="#DB4437" />
                    )}
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or with email</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Email/Password Form */}
                <View style={styles.emailAuthSection}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#8B7F73" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#B8AFA4"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#8B7F73" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#B8AFA4"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleEmailAuth}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={isLoading ? ['#B8AFA4', '#B8AFA4'] : ['#E8C097', '#D4A574']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? 'LOADING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsLogin(!isLogin)}
                    disabled={isLoading || socialAuthLoading !== null}
                  >
                    <Text style={styles.switchText}>
                      {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Development Bypass Button */}
                {__DEV__ && (
                  <>
                    <TouchableOpacity
                      style={styles.devBypassButton}
                      onPress={handleDevelopmentBypass}
                    >
                      <Text style={styles.devBypassText}>
                        🚀 Skip Auth (Dev Mode)
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.devBypassButton, { backgroundColor: 'rgba(255, 0, 0, 0.2)', borderColor: 'rgba(255, 0, 0, 0.4)' }]}
                      onPress={handleResetWelcome}
                    >
                      <Text style={[styles.devBypassText, { color: '#FF6B6B' }]}>
                        🔄 Reset Welcome Screen
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our terms of service
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  scrollContent: {
    flex: 1,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2D2B28',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8B7F73',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  
  // Social Authentication Styles
  socialAuthSection: {
    marginBottom: 30,
  },
  socialAuthTitle: {
    fontSize: 16,
    color: '#8B7F73',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6DDD1',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  googleButtonText: {
    color: '#2D2B28',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6DDD1',
  },
  dividerText: {
    fontSize: 14,
    color: '#B8AFA4',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  
  // Email Auth Section
  emailAuthSection: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D2B28',
    fontWeight: '500',
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#2D2B28',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  switchButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  switchText: {
    color: '#8B7F73',
    fontSize: 14,
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 15,
  },
  skipText: {
    color: '#B8AFA4',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#E07A5F',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(224, 122, 95, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.2)',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#B8AFA4',
    textAlign: 'center',
  },
  devBypassButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.4)',
  },
  devBypassText: {
    color: '#D4A574',
    fontSize: 14,
    fontWeight: '600',
  },
  devInstructionsContainer: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  devInstructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 8,
  },
  devInstructionsText: {
    fontSize: 14,
    color: '#8B7F73',
    lineHeight: 20,
  },
});

export default AuthScreen;
