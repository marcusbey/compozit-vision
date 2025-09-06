import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// Store imports
import { OnboardingService } from '../services/onboarding';
import { useUserStore } from '../stores/userStore';

// Import the tab navigator
import MainTabNavigator from './MainTabNavigator';

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
    <ActivityIndicator size="large" color="#D4A574" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

export type JourneyScreens =
  | 'welcome'
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding3'
  | 'onboarding4'
  | 'planSelection'
  | 'paymentFrequency'
  | 'paywall'
  | 'paymentPending'
  | 'paymentVerified'
  | 'unifiedProject'
  | 'results'
  | 'descriptions'
  | 'furniture'
  | 'budget'
  | 'auth'
  | 'checkout'
  | 'processing'
  | 'myProjects'
  | 'tools'
  | 'profile'
  | 'plans'
  | 'projectSettings'
  | 'referenceLibrary'
  | 'myPalettes'
  | 'analytics'
  | 'adminPanel'
  | 'abTesting'
  | 'imageRefinement'
  | 'mainApp';

// Safe screen imports with error handling - Updated to use organized structure
const screenImports: Record<JourneyScreens, () => Promise<{ default: React.ComponentType<any> }>> = {
  welcome: () => import('../screens/auth/WelcomeScreen').catch(() => ({ default: () => <ErrorScreen error="WelcomeScreen not found" /> })),
  onboarding1: () => import('../screens/onboarding/OnboardingScreen1').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen1 not found" /> })),
  onboarding2: () => import('../screens/onboarding/OnboardingScreen2').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen2 not found" /> })),
  onboarding3: () => import('../screens/onboarding/OnboardingScreen3').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen3 not found" /> })),
  onboarding4: () => import('../screens/onboarding/OnboardingScreen4').catch(() => ({ default: () => <ErrorScreen error="OnboardingScreen4 not found" /> })),
  planSelection: () => import('../screens/payment/PlanSelectionScreen').catch(() => ({ default: () => <ErrorScreen error="PlanSelectionScreen not found" /> })),
  paymentFrequency: () => import('../screens/payment/PaywallScreen').catch(() => ({ default: () => <ErrorScreen error="PaymentFrequencyScreen not found" /> })),
  paywall: () => import('../screens/payment/PaywallScreen').catch(() => ({ default: () => <ErrorScreen error="PaywallScreen not found" /> })),
  paymentPending: () => import('../screens/payment/PaymentPendingScreen').catch(() => ({ default: () => <ErrorScreen error="PaymentPendingScreen not found" /> })),
  paymentVerified: () => import('../screens/payment/PaymentVerifiedScreen').catch(() => ({ default: () => <ErrorScreen error="PaymentVerifiedScreen not found" /> })),
  unifiedProject: () => import('../screens/project/UnifiedProjectScreen').catch(() => ({ default: () => <ErrorScreen error="UnifiedProjectScreen not found" /> })),
  results: () => import('../screens/results/ResultsScreen').catch(() => ({ default: () => <ErrorScreen error="ResultsScreen not found" /> })),
  descriptions: () => import('../screens/results/DescriptionsScreen').catch(() => ({ default: () => <ErrorScreen error="DescriptionsScreen not found" /> })),
  furniture: () => import('../screens/results/FurnitureScreen').catch(() => ({ default: () => <ErrorScreen error="FurnitureScreen not found" /> })),
  budget: () => import('../screens/results/BudgetScreen').catch(() => ({ default: () => <ErrorScreen error="BudgetScreen not found" /> })),
  auth: () => import('../screens/auth/AuthScreen').catch(() => ({ default: () => <ErrorScreen error="AuthScreen not found" /> })),
  checkout: () => import('../screens/results/CheckoutScreen').catch(() => ({ default: () => <ErrorScreen error="CheckoutScreen not found" /> })),
  processing: () => import('../screens/results/ProcessingScreen').catch(() => ({ default: () => <ErrorScreen error="ProcessingScreen not found" /> })),
  myProjects: () => import('../screens/dashboard/MyProjectsScreen').catch(() => ({ default: () => <ErrorScreen error="MyProjectsScreen not found" /> })),
  tools: () => import('../screens/dashboard/ToolsScreen').catch(() => ({ default: () => <ErrorScreen error="ToolsScreen not found" /> })),
  profile: () => import('../screens/dashboard/ProfileScreen').catch(() => ({ default: () => <ErrorScreen error="ProfileScreen not found" /> })),
  plans: () => import('../screens/dashboard/PlansScreen').catch(() => ({ default: () => <ErrorScreen error="PlansScreen not found" /> })),
  projectSettings: () => import('../screens/project/ProjectSettingsScreen').catch(() => ({ default: () => <ErrorScreen error="ProjectSettingsScreen not found" /> })),
  referenceLibrary: () => import('../screens/dashboard/ReferenceLibraryScreen').catch(() => ({ default: () => <ErrorScreen error="ReferenceLibraryScreen not found" /> })),
  myPalettes: () => import('../screens/dashboard/MyPalettesScreen').catch(() => ({ default: () => <ErrorScreen error="MyPalettesScreen not found" /> })),
  analytics: () => import('../screens/dashboard/AnalyticsScreen').catch(() => ({ default: () => <ErrorScreen error="AnalyticsScreen not found" /> })),
  adminPanel: () => import('../screens/dashboard/AdminPanelScreen').catch(() => ({ default: () => <ErrorScreen error="AdminPanelScreen not found" /> })),
  abTesting: () => import('../screens/dashboard/ABTestingScreen').catch(() => ({ default: () => <ErrorScreen error="ABTestingScreen not found" /> })),
  imageRefinement: () => import('../screens/project/ImageRefinementScreen').catch(() => ({ default: () => <ErrorScreen error="ImageRefinementScreen not found" /> })),
  mainApp: () => Promise.resolve({ default: MainTabNavigator }),
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
              const Component = (module && module.default)
                ? module.default
                : () => <ErrorScreen error={`Screen '${name}' has no default export`} />;
              return [name, Component];
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
      // Check if user has seen welcome screen
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');

      if (!hasSeenWelcome) {
        console.log('🔄 First time user -> Welcome screen');
        return 'welcome';
      }

      // Check if user is authenticated and has completed payment
      if (isAuthenticated && user) {
        console.log('✅ Authenticated user -> Main App');
        return 'mainApp';
      }

      // Check if user has completed onboarding before
      const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();

      if (hasCompletedOnboarding) {
        // Check if there's saved journey progress
        const savedJourney = await OnboardingService.getSavedJourney();

        if (savedJourney && savedJourney.currentScreen) {
          // Validate the saved screen is a valid continuation point
          const validContinueScreens: JourneyScreens[] = [
            'planSelection', 'paymentFrequency', 'paywall', 'unifiedProject', 'descriptions', 'furniture', 'budget', 'auth', 'checkout'
          ];

          const savedScreen = savedJourney.currentScreen as JourneyScreens;
          if (validContinueScreens.includes(savedScreen)) {
            console.log('📍 Resuming journey from:', savedScreen);
            return savedScreen;
          }
        }

        // Default to plan selection for users who completed onboarding
        console.log('🎯 Returning user -> Plan Selection');
        return 'planSelection';
      } else {
        console.log('🎯 New user flow -> Onboarding1');
        return 'onboarding1';
      }
    } catch (error) {
      console.error('Error determining initial route:', error);
      return 'welcome';
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
    backgroundColor: '#FBF9F4',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E07A5F',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#2D2B28',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHint: {
    fontSize: 14,
    color: '#8B7F73',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF9F4',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#2D2B28',
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
export { SafeJourneyNavigator };
