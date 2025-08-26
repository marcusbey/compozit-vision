import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store imports
import { useUserStore } from '../stores/userStore';
import { useJourneyStore } from '../stores/journeyStore';
import { OnboardingService } from '../services/onboarding';

// Fallback error screen
const ErrorScreen: React.FC<{ error: string }> = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Failed to Load Screen</Text>
    <Text style={styles.errorMessage}>{error}</Text>
  </View>
);

// Loading screen
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4facfe" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

export type JourneyScreens = 
  | 'onboarding1' 
  | 'onboarding2' 
  | 'onboarding3'
  | 'paywall'
  | 'photoCapture'
  | 'descriptions'
  | 'furniture'
  | 'budget'
  | 'auth'
  | 'checkout'
  | 'processing'
  | 'results'
  | 'myProjects'
  | 'profile'
  | 'plans';

// Safe screen imports with error handling
const screenImports: Record<JourneyScreens, () => Promise<{ default: React.ComponentType<any> }>> = {
  onboarding1: () => import('../screens/Onboarding/OnboardingScreen1').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen1 not found" /> })),
  onboarding2: () => import('../screens/Onboarding/OnboardingScreen2').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen2 not found" /> })),
  onboarding3: () => import('../screens/Onboarding/OnboardingScreen3').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen3 not found" /> })),
  paywall: () => import('../screens/Paywall/PaywallScreen').catch(() => ({ default: () => <ErrorScreen error="PaywallScreen not found" /> })),
  photoCapture: () => import('../screens/PhotoCapture/PhotoCaptureScreen').catch(() => ({ default: () => <ErrorScreen error="PhotoCaptureScreen not found" /> })),
  descriptions: () => import('../screens/Descriptions/DescriptionsScreen').catch(() => ({ default: () => <ErrorScreen error="DescriptionsScreen not found" /> })),
  furniture: () => import('../screens/Furniture/FurnitureScreen').catch(() => ({ default: () => <ErrorScreen error="FurnitureScreen not found" /> })),
  budget: () => import('../screens/Budget/BudgetScreen').catch(() => ({ default: () => <ErrorScreen error="BudgetScreen not found" /> })),
  auth: () => import('../screens/Auth/AuthScreen').catch(() => ({ default: () => <ErrorScreen error="AuthScreen not found" /> })),
  checkout: () => import('../screens/Checkout/CheckoutScreen').catch(() => ({ default: () => <ErrorScreen error="CheckoutScreen not found" /> })),
  processing: () => import('../screens/Processing/ProcessingScreen').catch(() => ({ default: () => <ErrorScreen error="ProcessingScreen not found" /> })),
  results: () => import('../screens/Results/ResultsScreen').catch(() => ({ default: () => <ErrorScreen error="ResultsScreen not found" /> })),
  myProjects: () => import('../screens/Projects/MyProjectsScreen').catch(() => ({ default: () => <ErrorScreen error="MyProjectsScreen not found" /> })),
  profile: () => import('../screens/Profile/ProfileScreen').catch(() => ({ default: () => <ErrorScreen error="ProfileScreen not found" /> })),
  plans: () => import('../screens/Plans/PlansScreen').catch(() => ({ default: () => <ErrorScreen error="PlansScreen not found" /> })),
};

const SafeJourneyNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<JourneyScreens>('onboarding1');
  const [screens, setScreens] = useState<Record<string, React.ComponentType<any>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const { user, isAuthenticated, initializeAuth } = useUserStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing SafeJourneyNavigator...');
        
        // Load all screens dynamically
        const screenEntries = await Promise.all(
          Object.entries(screenImports).map(async ([name, importFn]) => {
            try {
              console.log(`📱 Loading screen: ${name}`);
              const module = await importFn();
              return [name, module.default];
            } catch (error) {
              console.error(`❌ Failed to load screen ${name}:`, error);
              return [name, () => <ErrorScreen error={`Failed to load ${name}`} />];
            }
          })
        );
        
        const loadedScreens = Object.fromEntries(screenEntries);
        setScreens(loadedScreens);
        
        // Initialize authentication
        try {
          unsubscribe = initializeAuth();
        } catch (authError) {
          console.error('❌ Auth initialization failed:', authError);
        }
        
        // Determine initial route based on user state
        const route = await determineInitialRoute();
        setInitialRoute(route);
        
        console.log('✅ SafeJourneyNavigator initialized successfully');
        setIsReady(true);
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setLoadError(error instanceof Error ? error.message : 'Unknown error');
        setIsReady(true);
      }
    };

    initializeApp();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const determineInitialRoute = async (): Promise<JourneyScreens> => {
    try {
      // Check if user is authenticated
      if (isAuthenticated && user) {
        return 'myProjects';
      }

      // Check if user has completed onboarding before
      const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
      
      if (hasCompletedOnboarding) {
        // Check if there's saved journey progress
        const savedJourney = await OnboardingService.getSavedJourney();
        
        if (savedJourney && savedJourney.currentScreen) {
          console.log('📍 Resuming journey from:', savedJourney.currentScreen);
          return savedJourney.currentScreen as JourneyScreens;
        } else {
          return 'paywall';
        }
      } else {
        return 'onboarding1';
      }
    } catch (error) {
      console.error('Error determining initial route:', error);
      return 'onboarding1';
    }
  };

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Failed to Load</Text>
        <Text style={styles.errorMessage}>{loadError}</Text>
        <Text style={styles.errorHint}>Please restart the app</Text>
      </View>
    );
  }

  if (!isReady || Object.keys(screens).length === 0) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        {Object.entries(screens).map(([name, Component]) => (
          <Stack.Screen key={name} name={name} component={Component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHint: {
    fontSize: 14,
    color: '#8892b0',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#b8c6db',
  },
});

// Export navigation helpers
export const NavigationHelpers = {
  navigateToScreen: (screenName: JourneyScreens, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(screenName as never, params);
    }
  },
  
  resetToScreen: (screenName: JourneyScreens, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: screenName as never, params }],
      });
    }
  },
  
  goBack: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
  
  getCurrentRoute: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  }
};

export default SafeJourneyNavigator;