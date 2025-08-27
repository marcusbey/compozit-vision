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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthScreenProps {
  navigation: any;
  route: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, error } = useUserStore();
  const journeyStore = useJourneyStore();

  // Auth screen is not part of the main journey anymore
  // Users are auto-created during Apple/Google payment
  useEffect(() => {
    // Only show this screen for cross-platform login scenarios
    console.log('Auth screen accessed - likely for cross-platform login');
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      
      // Only proceed if authentication was successful (no error thrown)
      const { user, error: authError } = useUserStore.getState();
      
      // Check if there was an authentication error
      if (authError) {
        Alert.alert('Authentication Error', authError);
        return;
      }
      
      // Check if user exists
      if (!user) {
        Alert.alert('Error', 'Authentication failed. Please try again.');
        return;
      }
      
      // Update journey with authentication info
      journeyStore.updateAuthentication({
        hasAccount: true,
        email: user.email,
        method: 'email',
        registeredAt: isLogin ? undefined : new Date().toISOString()
      });
      
      // Route based on user type and journey context
      const journeyProgress = journeyStore.progress;
      const isInPaywallFlow = journeyProgress.completedSteps.includes('paywall');
      
      if (isLogin && !isInPaywallFlow) {
        // Existing user logging in directly → My Projects
        NavigationHelpers.navigateToScreen('myProjects');
      } else if (!isLogin || isInPaywallFlow) {
        // New user signup OR user in paywall flow → Continue to checkout
        if (user.nbToken <= 0) {
          Alert.alert(
            'Insufficient Credits', 
            'You need credits to generate a design. Please select a plan.',
            [{ text: 'OK', onPress: () => NavigationHelpers.navigateToScreen('paywall') }]
          );
          return;
        }
        NavigationHelpers.navigateToScreen('checkout');
      } else {
        // Default fallback
        NavigationHelpers.navigateToScreen('myProjects');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Authentication Failed', 'Invalid credentials. Please check your email and password.');
      // Do not navigate - stay on auth screen
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

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.form}>
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
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleAuth}
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
              >
                <Text style={styles.switchText}>
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>

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
    paddingTop: 100,
    paddingBottom: 20,
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    paddingBottom: 30,
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
});

export default AuthScreen;
