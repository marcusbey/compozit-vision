import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useUserStore } from './src/stores/userStore';
import { usePlanStore, getPlanById } from './src/stores/planStore';
import { useJourneyStore, initializeJourney } from './src/stores/journeyStore';
import { useContentStore, initializeAppContent } from './src/stores/contentStore';
import OnboardingService from './src/services/onboarding';
import NavigationPersistenceService from './src/services/navigation';
import { OnboardingScreen1, OnboardingScreen2, OnboardingScreen3 } from './src/screens/Onboarding';
import PaywallScreen from './src/screens/Paywall/PaywallScreen';
import CheckoutScreen from './src/screens/Checkout/CheckoutScreen';
import JourneyProgressBar from './src/components/ProgressBar/JourneyProgressBar';

// Import all screens used in renderScreen
import PhotoCaptureScreen from './src/screens/PhotoCapture/PhotoCaptureScreen';
import ProcessingScreen from './src/screens/Processing/ProcessingScreen';
import ResultsScreen from './src/screens/Results/ResultsScreen';
import AuthScreen from './src/screens/Auth/AuthScreen';
import MyProjectsScreen from './src/screens/Projects/MyProjectsScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import WelcomeScreen from './src/screens/Welcome/WelcomeScreen';
import DemoScreen from './src/screens/Demo/DemoScreen';
import ProjectNameScreen from './src/screens/ProjectName/ProjectNameScreen';
import StyleSelectionScreen from './src/screens/StyleSelection/StyleSelectionScreen';
import BudgetSelectionScreen from './src/screens/BudgetSelection/BudgetSelectionScreen';
import CameraScreen from './src/screens/Camera/CameraScreen';
import PlansScreen from './src/screens/Plans/PlansScreen';

// Manual navigation state management - Updated for proper user journey
type ScreenType = 
  | 'onboarding1'  // First onboarding screen
  | 'onboarding2'  // Style selection onboarding
  | 'onboarding3'  // Professional features onboarding
  | 'paywall'      // Subscription plans after onboarding
  | 'photoCapture' // Photo capture after plan selection
  | 'descriptions' // Optional descriptions
  | 'furniture'    // Furniture preferences
  | 'budget'       // Budget selection
  | 'auth'         // Login/Register before checkout
  | 'checkout'     // Payment screen after authentication
  | 'processing'   // AI processing (after payment)
  | 'results'      // Design results
  | 'myProjects'   // User projects dashboard
  | 'profile'      // User profile
  | 'demo'         // Legacy demo (to be removed)
  | 'welcome';

export default function FullAppWithoutNavigation() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding1');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<ScreenType[]>(['onboarding1']);
  const [userCredits, setUserCredits] = useState(3); // Track free credits
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]); // Store onboarding selections
  
  // Real Supabase authentication
  const { user, isAuthenticated, login, register, logout, isLoading, error, initializeAuth } = useUserStore();
  
  // Plan selection and payment tracking
  const { selectedPlan, paymentStatus, selectPlan, setPaymentStatus, setPaymentDetails } = usePlanStore();
  
  // Journey state management - collects all user selections
  const journeyStore = useJourneyStore();
  
  // Database-driven content store
  const contentStore = useContentStore();

  useEffect(() => {
    checkFirstTime();
    
    // CRITICAL FIX: Initialize authentication on app startup
    const unsubscribe = initializeAuth();
    
    // Initialize database-driven systems
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Compozit Vision app...');
        
        // Initialize journey store with database steps
        await initializeJourney();
        
        // Initialize all app content from database
        await initializeAppContent();
        
        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Continue with app startup even if database fails
      }
    };
    
    initializeApp();
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);


  // Check authentication state and redirect accordingly
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user just authenticated and has a selected plan that needs payment
      if (selectedPlan && paymentStatus === 'pending') {
        navigate('checkout', { replace: true });
      } else if (currentScreen === 'auth') {
        // If coming from auth screen without pending payment, go to projects
        navigate('myProjects', { replace: true });
      }
    }
  }, [isAuthenticated, user, selectedPlan, paymentStatus]);

  // Clear navigation state on logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // User logged out, clear navigation state and reset to appropriate screen
      NavigationPersistenceService.clearNavigationState();
      
      // Check if navigation state is stale and needs refresh
      NavigationPersistenceService.isNavigationStateStale().then(isStale => {
        if (isStale) {
          console.log('🔄 Navigation state is stale, clearing...');
          NavigationPersistenceService.clearNavigationState();
        }
      });
    }
  }, [isAuthenticated, isLoading]);

  const checkFirstTime = async () => {
    try {
      console.log('🔍 Checking user onboarding status...');
      
      // Get complete onboarding state
      const isFirstTime = await OnboardingService.isFirstTimeUser();
      setIsFirstTime(isFirstTime);
      
      // Migrate legacy navigation data
      await NavigationPersistenceService.migrateLegacyNavigationData();
      
      // Determine initial screen with navigation persistence
      const { screen: initialScreen, history } = await NavigationPersistenceService.getInitialScreenWithNavigation(
        isAuthenticated,
        await OnboardingService.getInitialScreen(isAuthenticated) as ScreenType
      );
      
      console.log(`📱 Initial screen determined: ${initialScreen}`);
      console.log(`👤 First time user: ${isFirstTime}`);
      console.log(`🔐 Authenticated: ${isAuthenticated}`);
      console.log(`📋 Navigation history: ${history.length} screens`);
      
      setCurrentScreen(initialScreen);
      setNavigationHistory(history);
      
      // Log analytics data
      const analytics = await OnboardingService.getOnboardingAnalytics();
      const navAnalytics = await NavigationPersistenceService.getNavigationAnalytics();
      console.log('📊 Onboarding analytics:', analytics);
      console.log('📊 Navigation analytics:', navAnalytics);
      
    } catch (error) {
      console.error('❌ Error checking first time user:', error);
      // Fallback to onboarding for safety
      setCurrentScreen('onboarding1');
      setNavigationHistory(['onboarding1']);
      setIsFirstTime(true);
    }
  };

  const navigate = (screen: ScreenType, options?: { replace?: boolean }) => {
    // Update navigation history
    const updatedHistory = NavigationPersistenceService.updateNavigationHistory(
      navigationHistory,
      screen,
      options?.replace || false
    );
    
    setNavigationHistory(updatedHistory);
    setCurrentScreen(screen);
    
    // Persist navigation state
    NavigationPersistenceService.saveNavigationState(screen, updatedHistory);
    
    // Update journey progress
    const stepInfo = journeyStore.progress;
    const stepNumber = getStepNumberForScreen(screen);
    if (stepNumber > 0) {
      journeyStore.setCurrentStep(stepNumber, screen);
    }
  };
  
  // Helper function to map screen to step number
  const getStepNumberForScreen = (screen: ScreenType): number => {
    const screenToStep: Record<ScreenType, number> = {
      'onboarding1': 1,
      'onboarding2': 2,
      'onboarding3': 3,
      'paywall': 4,
      'photoCapture': 5,
      'descriptions': 6,
      'furniture': 7,
      'budget': 8,
      'auth': 9,
      'checkout': 10,
      'processing': 11,
      'results': 12,
      'myProjects': 12, // Consider as completed
      'profile': 12,
      'demo': 0,
      'welcome': 0,
    };
    return screenToStep[screen] || 0;
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  // Screen Components
  const WelcomeScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>Compozit Vision</Text>
            <Text style={styles.tagline}>Transform Your Space with AI</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="camera" size={40} color="#4facfe" />
              <Text style={styles.featureTitle}>Snap & Transform</Text>
              <Text style={styles.featureDesc}>Take a photo of your room and watch AI redesign it</Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="palette" size={40} color="#4facfe" />
              <Text style={styles.featureTitle}>Choose Your Style</Text>
              <Text style={styles.featureDesc}>Modern, classic, minimalist - pick your perfect aesthetic</Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="bag" size={40} color="#4facfe" />
              <Text style={styles.featureTitle}>Shop the Look</Text>
              <Text style={styles.featureDesc}>Get real furniture recommendations with pricing</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={async () => {
                await AsyncStorage.setItem('hasSeenWelcome', 'true');
                navigate('demo');
              }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigate('auth')}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  const DemoScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>See the Magic</Text>
        </View>

        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Before & After</Text>
          <Text style={styles.demoSubtitle}>See how AI transforms ordinary rooms</Text>
          
          <View style={styles.demoImagePlaceholder}>
            <Ionicons name="image" size={60} color="#4facfe" />
            <Text style={styles.demoImageText}>Demo Room Transformation</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('projectName')}
          >
            <Text style={styles.primaryButtonText}>Start My Project</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handleAuth = async () => {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      setIsLoading(true);
      
      try {
        // First, try to sign in
        try {
          console.log('Attempting sign-in for:', email);
          await login(email, password);
          console.log('✅ Sign-in successful');
        } catch (loginError: any) {
          console.log('Sign-in failed, attempting registration:', loginError.message);
          
          // If sign-in fails due to user not found or invalid credentials, try registration
          if (loginError.message?.includes('Invalid login credentials') || 
              loginError.message?.includes('Email not confirmed') ||
              loginError.message?.includes('User not found')) {
            
            console.log('Attempting registration for:', email);
            await register(email, password);
            console.log('✅ Registration successful');
          } else {
            // If it's a different error (like weak password), throw it
            throw loginError;
          }
        }
        // Navigation will happen automatically via useEffect when isAuthenticated changes
      } catch (err: any) {
        console.error('Authentication error:', err);
        let friendlyMessage = 'Something went wrong. Please try again.';
        
        if (err.message?.includes('Database setup incomplete')) {
          friendlyMessage = 'App is setting up. Please try again in a moment.';
        } else if (err.message?.includes('Password should be at least 6 characters')) {
          friendlyMessage = 'Password must be at least 6 characters long.';
        } else if (err.message?.includes('Invalid email')) {
          friendlyMessage = 'Please enter a valid email address.';
        } else if (err.message?.includes('Email already registered')) {
          friendlyMessage = 'Invalid password for this email.';
        }
        
        Alert.alert('Authentication Error', friendlyMessage);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Header with Back Button */}
          <View style={styles.authHeader}>
            <TouchableOpacity onPress={goBack} style={styles.authBackButton} testID="back-button">
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.authHeaderSpace} />
          </View>

          <ScrollView 
            style={styles.authScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.authScrollContent}
          >
            <Animated.View 
              style={[
                styles.authFormContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Logo and Branding */}
              <View style={styles.authBranding}>
                <View style={styles.authLogoContainer}>
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.authLogo}
                  >
                    <Ionicons name="home" size={28} color="#ffffff" />
                  </LinearGradient>
                </View>
                <Text style={styles.authBrandName}>Compozit Vision</Text>
                <Text style={styles.authBrandTagline}>AI-Powered Interior Design</Text>
              </View>

              {/* Welcome Message */}
              <View style={styles.authWelcome}>
                <Text style={styles.authWelcomeTitle}>
                  Welcome to Compozit Vision
                </Text>
                <Text style={styles.authWelcomeSubtitle}>
                  Enter your email and password to continue your design journey. We'll automatically create your account if you're new.
                </Text>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View style={styles.authErrorContainer}>
                  <Ionicons name="warning" size={20} color="#ff6b6b" />
                  <Text style={styles.authErrorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Form Inputs */}
              <View style={styles.authForm}>
                <View style={styles.authInputGroup}>
                  <Text style={styles.authInputLabel}>Email Address</Text>
                  <View style={[styles.authInputContainer, email ? styles.authInputFocused : null]}>
                    <Ionicons name="mail-outline" size={20} color="#4facfe" style={styles.authInputIcon} />
                    <TextInput
                      style={styles.authTextInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#8892b0"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="email-input"
                    />
                  </View>
                </View>

                <View style={styles.authInputGroup}>
                  <Text style={styles.authInputLabel}>Password</Text>
                  <View style={[styles.authInputContainer, password ? styles.authInputFocused : null]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4facfe" style={styles.authInputIcon} />
                    <TextInput
                      style={styles.authTextInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#8892b0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="password-input"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.authForgotPassword}>
                  <Text style={styles.authForgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.authActions}>
                <TouchableOpacity
                  style={[styles.authPrimaryButton, isLoading && styles.authButtonDisabled]}
                  onPress={handleAuth}
                  disabled={isLoading}
                  testID="auth-submit-button"
                >
                  <LinearGradient
                    colors={isLoading ? ['#666', '#888'] : ['#4facfe', '#00f2fe']}
                    style={styles.authButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.authLoadingContainer}>
                        <Ionicons name="hourglass" size={20} color="#ffffff" />
                        <Text style={styles.authButtonText}>Processing...</Text>
                      </View>
                    ) : (
                      <View style={styles.authButtonContent}>
                        <Text style={styles.authButtonText}>
                          Continue
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Login Placeholder */}
                <View style={styles.authDivider}>
                  <View style={styles.authDividerLine} />
                  <Text style={styles.authDividerText}>or</Text>
                  <View style={styles.authDividerLine} />
                </View>

                <TouchableOpacity style={styles.authSecondaryButton} disabled>
                  <Ionicons name="logo-google" size={20} color="#8892b0" />
                  <Text style={styles.authSecondaryButtonText}>Continue with Google</Text>
                  <Text style={styles.authComingSoon}>(Coming Soon)</Text>
                </TouchableOpacity>
              </View>

              {/* Terms and Privacy */}
              <Text style={styles.authTerms}>
                By continuing, you agree to our{' '}
                <Text style={styles.authTermsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.authTermsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const MyProjectsScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>My Projects</Text>
            {user && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigate('profile')} style={styles.profileButton}>
            <Ionicons name="person-circle" size={30} color="#4facfe" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.projectsList}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.nbToken || 3}</Text>
              <Text style={styles.statLabel}>Credits Left</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.newProjectCard}
            onPress={() => navigate('projectName')}
          >
            <Ionicons name="add-circle" size={40} color="#4facfe" />
            <Text style={styles.newProjectText}>Start New Project</Text>
            <Text style={styles.newProjectSubtext}>Transform another room with AI</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('myProjects')}>
            <Ionicons name="folder" size={24} color="#4facfe" />
            <Text style={styles.navText}>Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('camera')}>
            <Ionicons name="camera" size={24} color="#b8c6db" />
            <Text style={styles.navTextInactive}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('profile')}>
            <Ionicons name="person" size={24} color="#b8c6db" />
            <Text style={styles.navTextInactive}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigate('plans')}>
            <Ionicons name="card" size={24} color="#b8c6db" />
            <Text style={styles.navTextInactive}>Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const ProjectNameScreen = () => {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customRoom, setCustomRoom] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const predefinedRooms = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];

    const handleRoomSelect = (room: string) => {
      if (room === 'Other') {
        setSelectedRoom('Other');
        setShowOtherInput(true);
        setCustomRoom('');
      } else {
        setSelectedRoom(room);
        setShowOtherInput(false);
        setCustomRoom('');
      }
    };

    const saveCustomRoomToDatabase = async (roomName: string) => {
      try {
        // In a real app, you would save to your Supabase database
        console.log('📝 Saving custom room to database:', roomName);
        
        // For now, we'll just store it locally and log it
        const customRooms = await AsyncStorage.getItem('customRooms') || '[]';
        const roomsArray = JSON.parse(customRooms);
        
        if (!roomsArray.includes(roomName)) {
          roomsArray.push(roomName);
          await AsyncStorage.setItem('customRooms', JSON.stringify(roomsArray));
          console.log('✅ Custom room saved locally');
        }
        
        return true;
      } catch (error) {
        console.error('❌ Failed to save custom room:', error);
        return false;
      }
    };

    const handleContinue = async () => {
      if (!selectedRoom) return;

      setIsSubmitting(true);

      try {
        let finalRoomName = selectedRoom;

        // Handle custom room input
        if (selectedRoom === 'Other' && customRoom.trim()) {
          finalRoomName = customRoom.trim();
          
          // Save custom room to database
          const saved = await saveCustomRoomToDatabase(finalRoomName);
          if (!saved) {
            Alert.alert('Error', 'Failed to save custom room. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }

        // Save to journey store
        journeyStore.updateProject({
          roomType: finalRoomName,
        });

        console.log('🏠 Room selected:', finalRoomName);
        
        // Navigate to next screen
        navigate('styleSelection');
      } catch (error) {
        console.error('❌ Error saving room selection:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const isValidSelection = selectedRoom && (selectedRoom !== 'Other' || customRoom.trim().length > 0);

    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4facfe" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>New Project</Text>
          </View>

          <ScrollView style={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Let's start with basics</Text>
              <Text style={styles.formSubtitle}>What room are we transforming?</Text>

              <View style={styles.roomTypes}>
                {predefinedRooms.map(room => (
                  <TouchableOpacity 
                    key={room} 
                    style={[
                      styles.roomType,
                      selectedRoom === room && styles.roomTypeSelected
                    ]}
                    onPress={() => handleRoomSelect(room)}
                  >
                    <Text style={[
                      styles.roomTypeText,
                      selectedRoom === room && styles.roomTypeTextSelected
                    ]}>
                      {room}
                    </Text>
                    {selectedRoom === room && (
                      <View style={styles.roomTypeCheckmark}>
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                
                {/* Other option */}
                <TouchableOpacity 
                  style={[
                    styles.roomType,
                    styles.roomTypeOther,
                    selectedRoom === 'Other' && styles.roomTypeSelected
                  ]}
                  onPress={() => handleRoomSelect('Other')}
                >
                  <Text style={[
                    styles.roomTypeText,
                    selectedRoom === 'Other' && styles.roomTypeTextSelected
                  ]}>
                    Other...
                  </Text>
                  {selectedRoom === 'Other' && (
                    <View style={styles.roomTypeCheckmark}>
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Custom room input */}
              {showOtherInput && (
                <View style={styles.customRoomContainer}>
                  <Text style={styles.customRoomLabel}>Specify your room type:</Text>
                  <TextInput
                    style={styles.customRoomInput}
                    placeholder="e.g., Home Office, Walk-in Closet, Laundry Room..."
                    placeholderTextColor="#8892b0"
                    value={customRoom}
                    onChangeText={setCustomRoom}
                    autoFocus={true}
                    maxLength={50}
                    returnKeyType="done"
                  />
                  <Text style={styles.customRoomHint}>
                    This will be saved for future projects
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !isValidSelection && styles.primaryButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={!isValidSelection || isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.primaryButtonText}>Saving...</Text>
                ) : (
                  <Text style={[
                    styles.primaryButtonText,
                    !isValidSelection && styles.primaryButtonTextDisabled
                  ]}>
                    Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const StyleSelectionScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Choose Style</Text>
        </View>

        <ScrollView style={styles.styleContainer}>
          <Text style={styles.formTitle}>What's your style?</Text>
          
          {['Modern', 'Classic', 'Minimalist', 'Industrial', 'Scandinavian', 'Bohemian'].map(style => (
            <TouchableOpacity key={style} style={styles.styleOption}>
              <Text style={styles.styleText}>{style}</Text>
              <Text style={styles.styleDesc}>Clean lines and contemporary feel</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('budgetSelection')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  const BudgetSelectionScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Set Budget</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>What's your budget?</Text>
          <Text style={styles.budgetRange}>$2,000 - $8,000</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('photoCapture')}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const PhotoCaptureScreen = () => {
    const [hasPhoto, setHasPhoto] = useState(!!journeyStore.project.photoUri);
    
    const handleCameraCapture = () => {
      // Simulate photo capture
      const mockPhotoUri = 'mock://photo/room-capture-' + Date.now() + '.jpg';
      
      // Save photo to journey store
      journeyStore.updateProject({
        photoUri: mockPhotoUri,
        photoMetadata: {
          width: 1920,
          height: 1080,
          size: 2.5 * 1024 * 1024, // 2.5MB
          timestamp: new Date().toISOString(),
        },
      });
      
      journeyStore.completeStep('photo');
      setHasPhoto(true);
      
      console.log('📸 Photo captured and saved');
    };
    
    const handleContinue = () => {
      if (hasPhoto) {
        navigate('descriptions');
      }
    };
    
    const handleGallerySelect = () => {
      // Simulate gallery selection
      const mockPhotoUri = 'mock://gallery/selected-' + Date.now() + '.jpg';
      
      journeyStore.updateProject({
        photoUri: mockPhotoUri,
        photoMetadata: {
          width: 1600,
          height: 1200,
          size: 1.8 * 1024 * 1024, // 1.8MB
          timestamp: new Date().toISOString(),
        },
      });
      
      journeyStore.completeStep('photo');
      setHasPhoto(true);
      
      console.log('🖼️ Gallery photo selected and saved');
    };
    
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Progress Bar */}
          <JourneyProgressBar />
          
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Capture Room</Text>
          </View>
  
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              {hasPhoto ? (
                <>
                  <Ionicons name="checkmark-circle" size={80} color="#4facfe" />
                  <Text style={styles.cameraText}>Photo captured!</Text>
                  <Text style={styles.cameraSubtext}>Ready to continue</Text>
                </>
              ) : (
                <>
                  <Ionicons name="camera" size={80} color="#4facfe" />
                  <Text style={styles.cameraText}>Take a photo of your room</Text>
                  <Text style={styles.cameraSubtext}>We'll analyze your space</Text>
                </>
              )}
            </View>
            
            {hasPhoto && (
              <View style={styles.photoSuccessContainer}>
                <Text style={styles.photoSuccessText}>
                  ✨ Perfect! We've captured your room and we're ready to create amazing designs.
                </Text>
              </View>
            )}
  
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.cameraButton} onPress={handleGallerySelect}>
                <Ionicons name="image" size={24} color="#ffffff" />
                <Text style={styles.cameraButtonText}>Gallery</Text>
              </TouchableOpacity>
  
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={hasPhoto ? handleContinue : handleCameraCapture}
              >
                <Ionicons 
                  name={hasPhoto ? "arrow-forward" : "camera"} 
                  size={30} 
                  color="#ffffff" 
                />
              </TouchableOpacity>
  
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="flash" size={24} color="#ffffff" />
                <Text style={styles.cameraButtonText}>Flash</Text>
              </TouchableOpacity>
            </View>
            
            {hasPhoto && (
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue to Details</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const ProcessingScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <Text style={styles.processingTitle}>Creating your design...</Text>
          <Text style={styles.processingSubtitle}>AI is analyzing your room and generating beautiful designs</Text>
          
          <View style={styles.processingAnimation}>
            <Ionicons name="refresh" size={60} color="#4facfe" />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('results')}
          >
            <Text style={styles.primaryButtonText}>View Results (Demo)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const ResultsScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate('myProjects')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Your Design</Text>
        </View>

        <ScrollView style={styles.resultsContainer}>
          <View style={styles.resultImagePlaceholder}>
            <Ionicons name="image" size={80} color="#4facfe" />
            <Text style={styles.resultImageText}>AI Generated Design</Text>
          </View>

          <Text style={styles.resultTitle}>Modern Living Room</Text>
          <Text style={styles.resultCost}>Estimated Cost: $4,500</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigate('myProjects')}
          >
            <Text style={styles.primaryButtonText}>Save to Projects</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // Additional screens (simplified)
  const ProfileScreen = () => {
    const handleLogout = async () => {
      try {
        await logout();
        navigate('welcome', { replace: true });
      } catch (error) {
        Alert.alert('Error', 'Failed to logout');
      }
    };

    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#4facfe" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Profile</Text>
          </View>
          <View style={styles.centerContent}>
            <View style={styles.profileInfo}>
              <Ionicons name="person-circle" size={80} color="#4facfe" />
              {user && (
                <>
                  <Text style={styles.profileName}>{user.email}</Text>
                  <Text style={styles.profileEmail}>{user.currentPlan || 'Free Plan'}</Text>
                  <Text style={styles.profileCredits}>{user.nbToken || 3} credits remaining</Text>
                </>
              )}
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('plans')}>
                <Text style={styles.primaryButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate('myProjects')}>
                <Text style={styles.secondaryButtonText}>Back to Projects</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out" size={20} color="#ff6b6b" />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const CameraScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Camera</Text>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="camera" size={80} color="#4facfe" />
          <Text style={styles.cameraText}>Direct Camera Access</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('myProjects')}>
            <Text style={styles.primaryButtonText}>Back to Projects</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const PlansScreen = () => (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4facfe" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Plans</Text>
        </View>
        <ScrollView style={styles.plansContainer}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>Pro Plan</Text>
            <Text style={styles.planPrice}>$29/month</Text>
            <Text style={styles.planFeatures}>200 designs included</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('myProjects')}>
            <Text style={styles.primaryButtonText}>Back to Projects</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );

  // New Journey Screen Components
  const PaywallScreenComponent = () => (
    <PaywallScreen 
      onSelectPlan={(planId) => {
        const plan = getPlanById(planId);
        if (plan) {
          selectPlan(plan); // Save selected plan to store
          
          // Update journey store with subscription details
          journeyStore.updateSubscription({
            selectedPlanId: planId,
            planName: plan.name,
            planPrice: plan.price,
            useFreeCredits: false,
          });
          
          // Update payment requirement
          journeyStore.updatePayment({
            requiresPayment: true,
          });
          
          console.log('✅ Plan selected and saved:', plan.name);
          navigate('photoCapture');
        }
      }}
      onContinueWithFree={async () => {
        // User chose free credits
        journeyStore.updateSubscription({
          useFreeCredits: true,
          planName: 'Free Trial',
          planPrice: '$0',
        });
        
        journeyStore.updatePayment({
          requiresPayment: false,
        });
        
        // Save journey state
        await OnboardingService.saveUserJourney({
          currentScreen: 'photoCapture',
          completedSteps: ['onboarding1', 'onboarding2', 'onboarding3', 'paywall'],
          selectedStyles: journeyStore.onboarding.selectedStyles,
          selectedPlan: 'free',
          lastSavedAt: new Date().toISOString(),
        });
        
        console.log('✅ Continuing with free credits');
        navigate('photoCapture');
      }}
      onBack={() => navigate('onboarding3')}
    />
  );

  const DescriptionsScreen = () => {
    const [description, setDescription] = useState(journeyStore.project.descriptions || '');
    
    const handleContinue = () => {
      // Save description to journey store
      journeyStore.updateProject({ descriptions: description });
      journeyStore.completeStep('descriptions');
      navigate('furniture');
    };
    
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Progress Bar */}
          <JourneyProgressBar />
          
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Describe Your Vision</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.subtitle}>Add specific requirements or constraints (optional)</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="e.g., Include a reading nook, pet-friendly materials..."
              placeholderTextColor="#8892b0"
              multiline
              value={description}
              onChangeText={setDescription}
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleContinue}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const FurnitureScreen = () => {
    const [selectedFurniture, setSelectedFurniture] = useState(journeyStore.project.furniturePreferences || []);
    
    const furnitureOptions = [
      { id: 'modern-sofa', emoji: '🛋️', name: 'Modern Sofa' },
      { id: 'classic-chairs', emoji: '🪑', name: 'Classic Chairs' },
      { id: 'dining-table', emoji: '🪑', name: 'Dining Table' },
      { id: 'bed-frame', emoji: '🛏️', name: 'Bed Frame' },
      { id: 'coffee-table', emoji: '☕', name: 'Coffee Table' },
      { id: 'bookshelf', emoji: '📚', name: 'Bookshelf' },
    ];
    
    const handleFurnitureToggle = (furnitureId: string) => {
      setSelectedFurniture(prev => {
        if (prev.includes(furnitureId)) {
          return prev.filter(id => id !== furnitureId);
        } else {
          return [...prev, furnitureId];
        }
      });
    };
    
    const handleContinue = () => {
      // Save furniture preferences to journey store
      journeyStore.updateProject({ furniturePreferences: selectedFurniture });
      journeyStore.completeStep('furniture');
      navigate('budget');
    };
    
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Progress Bar */}
          <JourneyProgressBar />
          
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Furniture Preferences</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.subtitle}>Select furniture styles you love (optional)</Text>
            <View style={styles.furnitureGrid}>
              {furnitureOptions.map((furniture) => (
                <TouchableOpacity 
                  key={furniture.id}
                  style={[
                    styles.furnitureOption,
                    selectedFurniture.includes(furniture.id) && styles.furnitureOptionSelected
                  ]}
                  onPress={() => handleFurnitureToggle(furniture.id)}
                >
                  {selectedFurniture.includes(furniture.id) && (
                    <View style={styles.furnitureCheckmark}>
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    </View>
                  )}
                  <Text style={styles.furnitureEmoji}>{furniture.emoji}</Text>
                  <Text style={styles.furnitureText}>{furniture.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionText}>
                {selectedFurniture.length > 0 
                  ? `${selectedFurniture.length} furniture types selected`
                  : 'No furniture selected (we\'ll suggest everything)'
                }
              </Text>
            </View>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const BudgetScreen = () => {
    const [budgetValue, setBudgetValue] = useState<number>(0.25); // Start at 25% of slider (50K)
    
    // Convert slider value to budget amount with 80/20 mapping
    const sliderValueToBudget = (value: number): number => {
      if (value <= 0.8) {
        // First 80%: 0-100K (detailed movement for most common budgets)
        return (value / 0.8) * 100000; // 0.8 = 100K
      } else {
        // Last 20%: 100K-500K+ (fast movement for high budgets)
        const remainingValue = value - 0.8; // 0-0.2 range
        return 100000 + (remainingValue / 0.2) * 400000; // 100K + 400K = 500K
      }
    };
    
    // Convert budget amount back to slider value
    const budgetToSliderValue = (budget: number): number => {
      if (budget <= 100000) {
        return (budget / 100000) * 0.8;
      } else {
        return 0.8 + ((budget - 100000) / 400000) * 0.2;
      }
    };
    
    const formatBudget = (amount: number): string => {
      if (amount >= 500000) return '$500,000+';
      if (amount >= 100000) return `$${Math.round(amount / 1000)}K`;
      if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
      return `$${Math.round(amount).toLocaleString()}`;
    };
    
    const getBudgetDescription = (amount: number): string => {
      if (amount < 5000) return 'Budget-friendly refresh';
      if (amount < 15000) return 'Moderate makeover';
      if (amount < 50000) return 'Full transformation';
      if (amount < 100000) return 'Premium redesign';
      return 'Luxury complete renovation';
    };
    
    const currentBudget = sliderValueToBudget(budgetValue);
    
    const handleSliderChange = (value: number) => {
      setBudgetValue(value);
    };
    
    const handleContinue = () => {
      const finalBudget = sliderValueToBudget(budgetValue);
      
      // Save budget selection to journey store
      journeyStore.updateProject({
        budgetRange: {
          min: Math.max(0, finalBudget - 5000), // Add some range around the selected value
          max: finalBudget >= 500000 ? 1000000 : finalBudget + 5000,
          currency: 'USD',
        }
      });
      
      journeyStore.completeStep('budget');
      
      console.log('💰 Budget selected:', formatBudget(finalBudget));
      
      // Navigate based on payment requirement
      if (journeyStore.payment.requiresPayment) {
        navigate('auth'); // Need to authenticate before payment
      } else {
        navigate('processing'); // Free tier goes directly to processing
      }
    };
    
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          
          {/* Progress Bar */}
          <JourneyProgressBar />
          
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Budget Range</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.subtitle}>What's your budget for this project?</Text>
            <Text style={styles.helperText}>Drag the slider to set your budget range</Text>
            
            {/* Budget Display */}
            <View style={styles.budgetDisplay}>
              <Text style={styles.budgetAmount}>
                {formatBudget(currentBudget)}
              </Text>
              <Text style={styles.budgetDescription}>
                {getBudgetDescription(currentBudget)}
              </Text>
            </View>
            
            {/* Custom Slider */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={budgetValue}
                onValueChange={handleSliderChange}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#4facfe"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
              />
              
              {/* Slider Labels */}
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>$0</Text>
                <Text style={styles.sliderLabel}>$100K</Text>
                <Text style={styles.sliderLabel}>$500K+</Text>
              </View>
              
              {/* Slider Guide */}
              <Text style={styles.sliderGuide}>
                💡 First 80% covers $0-$100K for precise selection, last 20% covers $100K-$500K+
              </Text>
            </View>
            
            {/* Selection Summary */}
            <View style={styles.selectionSummary}>
              <Text style={styles.selectionText}>
                ✨ Perfect! We'll find amazing options around {formatBudget(currentBudget)}.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>
                Continue with {formatBudget(currentBudget)}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  const CheckoutScreenComponent = () => {
    if (!selectedPlan || !user) {
      // Shouldn't happen, but handle gracefully
      console.warn('CheckoutScreen accessed without selected plan or user');
      navigate('paywall');
      return null;
    }

    return (
      <CheckoutScreen
        selectedPlan={selectedPlan}
        userEmail={user.email}
        onBack={() => navigate('budget')}
        onPaymentSuccess={(paymentDetails) => {
          console.log('Payment successful:', paymentDetails);
          setPaymentDetails(paymentDetails);
          setPaymentStatus('completed');
          // TODO: Update user's subscription in Supabase
          Alert.alert('Payment Successful!', 'Your subscription has been activated.', [
            { text: 'Continue', onPress: () => navigate('processing') }
          ]);
        }}
        onPaymentError={(error) => {
          console.error('Payment failed:', error);
          setPaymentStatus('failed');
          Alert.alert('Payment Failed', error, [
            { text: 'Try Again', onPress: () => setPaymentStatus('pending') },
            { text: 'Go Back', onPress: () => navigate('budget') }
          ]);
        }}
      />
    );
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      // New proper user journey
      case 'onboarding1': 
        return <OnboardingScreen1 onNext={() => navigate('onboarding2')} />;
      
      case 'onboarding2': 
        return <OnboardingScreen2 
          onNext={async () => {
            // Mark onboarding as started
            await OnboardingService.startOnboarding();
            navigate('onboarding3');
          }} 
          onBack={() => navigate('onboarding1')}
        />;
      
      case 'onboarding3': 
        return <OnboardingScreen3 
          onNext={async () => {
            // Mark onboarding as completed
            await OnboardingService.completeOnboarding();
            console.log('✅ Onboarding completed, navigating to paywall');
            navigate('paywall');
          }} 
          onBack={() => navigate('onboarding2')}
        />;
      
      case 'paywall': 
        return <PaywallScreenComponent />;
      
      case 'descriptions': 
        return <DescriptionsScreen />;
      
      case 'furniture': 
        return <FurnitureScreen />;
      
      case 'budget': 
        return <BudgetScreen />;
      
      case 'checkout':
        return <CheckoutScreenComponent />;
      
      // Existing screens (updated journey)
      case 'photoCapture': return <PhotoCaptureScreen />;
      case 'processing': return <ProcessingScreen />;
      case 'results': return <ResultsScreen />;
      case 'auth': return <AuthScreen />;
      case 'myProjects': return <MyProjectsScreen />;
      case 'profile': return <ProfileScreen />;
      
      // Legacy screens (to be removed)
      case 'welcome': return <WelcomeScreen />;
      case 'demo': return <DemoScreen />;
      case 'projectName': return <ProjectNameScreen />;
      case 'styleSelection': return <StyleSelectionScreen />;
      case 'budgetSelection': return <BudgetSelectionScreen />;
      case 'camera': return <CameraScreen />;
      case 'plans': return <PlansScreen />;
      
      default: return <OnboardingScreen1 onNext={() => navigate('onboarding2')} />;
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4facfe',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#b8c6db',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    // gap: 15, // Not supported in all RN versions
  },
  primaryButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4facfe',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4facfe',
    fontSize: 16,
    fontWeight: '500',
  },
  demoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  demoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  demoSubtitle: {
    fontSize: 16,
    color: '#b8c6db',
    marginBottom: 40,
    textAlign: 'center',
  },
  demoImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  demoImageText: {
    color: '#b8c6db',
    marginTop: 10,
    fontSize: 14,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#b8c6db',
    marginBottom: 30,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  formInputs: {
    marginBottom: 30,
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  tertiaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  tertiaryButtonText: {
    color: '#b8c6db',
    fontSize: 14,
  },
  userEmail: {
    fontSize: 14,
    color: '#b8c6db',
    marginTop: 2,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#4facfe',
    marginBottom: 5,
  },
  profileCredits: {
    fontSize: 14,
    color: '#b8c6db',
  },
  profileActions: {
    width: '100%',
    gap: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
  },
  projectsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4facfe',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#b8c6db',
    fontWeight: '500',
  },
  newProjectCard: {
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(79, 172, 254, 0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  newProjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4facfe',
    marginTop: 15,
    marginBottom: 8,
  },
  newProjectSubtext: {
    fontSize: 14,
    color: '#b8c6db',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: '#4facfe',
    fontWeight: '500',
  },
  navTextInactive: {
    fontSize: 12,
    color: '#b8c6db',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#b8c6db',
    marginBottom: 30,
  },
  roomTypes: {
    marginBottom: 40,
  },
  roomType: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomTypeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  roomTypeSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  roomTypeTextSelected: {
    color: '#4facfe',
    fontWeight: '600',
  },
  roomTypeOther: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roomTypeCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customRoomContainer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(79, 172, 254, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  customRoomLabel: {
    color: '#4facfe',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customRoomInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  customRoomHint: {
    color: '#8892b0',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  styleContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  styleOption: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  styleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  styleDesc: {
    color: '#b8c6db',
    fontSize: 14,
  },
  budgetRange: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4facfe',
    textAlign: 'center',
    marginBottom: 40,
  },
  cameraContainer: {
    flex: 1,
    padding: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  cameraText: {
    color: '#b8c6db',
    marginTop: 15,
    fontSize: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraButton: {
    alignItems: 'center',
    gap: 5,
  },
  cameraButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4facfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#b8c6db',
    marginBottom: 40,
    textAlign: 'center',
  },
  processingAnimation: {
    marginBottom: 40,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultImagePlaceholder: {
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultImageText: {
    color: '#b8c6db',
    marginTop: 10,
    fontSize: 14,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  resultCost: {
    fontSize: 18,
    color: '#4facfe',
    marginBottom: 30,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  profileText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 30,
  },
  plansContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4facfe',
    marginBottom: 10,
  },
  planFeatures: {
    fontSize: 14,
    color: '#b8c6db',
  },
  // New Journey Screen Styles
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 16,
  },
  furnitureOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
  },
  furnitureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  furnitureText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  budgetOptions: {
    marginBottom: 40,
  },
  budgetOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetOptionSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  budgetCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetContent: {
    flex: 1,
  },
  budgetText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetTextSelected: {
    color: '#4facfe',
  },
  budgetDescription: {
    fontSize: 14,
    color: '#8892b0',
    fontWeight: '400',
  },
  budgetDescriptionSelected: {
    color: '#b8c6db',
  },
  // New Slider Styles
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  budgetAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#4facfe',
    marginBottom: 8,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 60,
    marginBottom: 20,
  },
  sliderThumb: {
    backgroundColor: '#4facfe',
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#8892b0',
    fontWeight: '500',
  },
  sliderGuide: {
    fontSize: 12,
    color: '#8892b0',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  helperText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 24,
  },
  selectionSummary: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  selectionText: {
    fontSize: 14,
    color: '#4facfe',
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  primaryButtonTextDisabled: {
    color: '#8892b0',
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  furnitureOptionSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  furnitureCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // New Auth Screen Styles - Professional Design
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  authBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authHeaderSpace: {
    flex: 1,
  },
  authScrollView: {
    flex: 1,
  },
  authScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  authFormContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 600,
  },
  authBranding: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authLogoContainer: {
    marginBottom: 16,
  },
  authLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  authBrandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  authBrandTagline: {
    fontSize: 14,
    color: '#8892b0',
    fontWeight: '500',
  },
  authWelcome: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authWelcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  authWelcomeSubtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  authErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  authErrorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  authForm: {
    marginBottom: 32,
  },
  authInputGroup: {
    marginBottom: 20,
  },
  authInputLabel: {
    fontSize: 14,
    color: '#b8c6db',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  authInputFocused: {
    borderColor: 'rgba(79, 172, 254, 0.5)',
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
  },
  authInputIcon: {
    marginRight: 12,
  },
  authTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  authForgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  authForgotPasswordText: {
    color: '#4facfe',
    fontSize: 14,
    fontWeight: '600',
  },
  authActions: {
    marginBottom: 24,
  },
  authPrimaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  authDividerText: {
    color: '#8892b0',
    fontSize: 14,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  authSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  authSecondaryButtonText: {
    color: '#8892b0',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
  },
  authComingSoon: {
    color: '#8892b0',
    fontSize: 12,
    fontStyle: 'italic',
  },
  authSwitchMode: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  authSwitchText: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
  },
  authSwitchHighlight: {
    color: '#4facfe',
    fontWeight: '700',
  },
  authTerms: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  authTermsLink: {
    color: '#4facfe',
    fontWeight: '600',
  },
  
  // Additional Photo Capture styles
  cameraSubtext: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 8,
  },
  photoSuccessContainer: {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  photoSuccessText: {
    fontSize: 14,
    color: '#4facfe',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: 'rgba(79, 172, 254, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});