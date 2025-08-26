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

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(10, 'auth');
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
      
      // Check if user exists and has enough tokens
      if (!user) {
        Alert.alert('Error', 'Authentication failed. Please try again.');
        return;
      }
      
      if (user.nbToken <= 0) {
        Alert.alert(
          'Insufficient Credits', 
          'You need at least 1 credit to generate a design. Please upgrade your plan.',
          [{ text: 'OK' }]
        );
        return;
      }

      // After successful auth, continue to processing to complete the journey
      NavigationHelpers.navigateToScreen('processing');
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Authentication Failed', 'Invalid credentials. Please check your email and password.');
      // Do not navigate - stay on auth screen
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.logoGradient}
              >
                <Ionicons name="home" size={30} color="#ffffff" />
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
                <Ionicons name="mail-outline" size={20} color="#b8c6db" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#8892b0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#b8c6db" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#8892b0"
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
                  colors={isLoading ? ['#666', '#666'] : ['#4facfe', '#00f2fe']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
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

            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our terms of service
            </Text>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
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
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#b8c6db',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  button: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  switchButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  switchText: {
    color: '#b8c6db',
    fontSize: 14,
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 15,
  },
  skipText: {
    color: '#8892b0',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default AuthScreen;
