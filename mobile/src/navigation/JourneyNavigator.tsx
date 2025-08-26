import React, { useState, useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store imports
import { useUserStore } from '../stores/userStore';
import { useJourneyStore } from '../stores/journeyStore';
import { OnboardingService } from '../services/onboarding';

// Screen imports
import OnboardingScreen1 from '../screens/Onboarding/OnboardingScreen1';
import OnboardingScreen2 from '../screens/Onboarding/OnboardingScreen2';
import OnboardingScreen3 from '../screens/Onboarding/OnboardingScreen3';
import PaywallScreen from '../screens/Paywall/PaywallScreen';
import PhotoCaptureScreen from '../screens/PhotoCapture/PhotoCaptureScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import AuthScreen from '../screens/Auth/AuthScreen';
import ProcessingScreen from '../screens/Processing/ProcessingScreen';
import ResultsScreen from '../screens/Results/ResultsScreen';
import MyProjectsScreen from '../screens/Projects/MyProjectsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PlansScreen from '../screens/Plans/PlansScreen';

// Import screens from the new separate files
import BudgetScreen from '../screens/Budget/BudgetScreen';
import DescriptionsScreen from '../screens/Descriptions/DescriptionsScreen';
import FurnitureScreen from '../screens/Furniture/FurnitureScreen';

const Stack = createStackNavigator();
export const navigationRef = createNavigationContainerRef();

// Journey step mapping
const JOURNEY_STEPS = {
  'onboarding1': OnboardingScreen1,
  'onboarding2': OnboardingScreen2, 
  'onboarding3': OnboardingScreen3,
  'paywall': PaywallScreen,
  'photoCapture': PhotoCaptureScreen,
  'descriptions': DescriptionsScreen,
  'furniture': FurnitureScreen,
  'budget': BudgetScreen,
  'auth': AuthScreen,
  'checkout': CheckoutScreen,
  'processing': ProcessingScreen,
  'results': ResultsScreen,
  'myProjects': MyProjectsScreen,
  'profile': ProfileScreen,
  'plans': PlansScreen,
};

export type JourneyScreens = keyof typeof JOURNEY_STEPS;

const JourneyNavigator: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<JourneyScreens>('onboarding1');
  
  const { user, isAuthenticated, initializeAuth } = useUserStore();
  const journeyStore = useJourneyStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initializeApp = async () => {
      try {
        // Initialize authentication
        unsubscribe = initializeAuth();
        
        // Determine initial route based on user state and journey progress
        const route = await determineInitialRoute();
        setInitialRoute(route);
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitialRoute('onboarding1');
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
        // Authenticated user -> go to projects
        return 'myProjects';
      }

      // Check if user has completed onboarding before
      const hasCompletedOnboarding = await OnboardingService.hasCompletedOnboarding();
      
      if (hasCompletedOnboarding) {
        // User has seen onboarding before but not authenticated
        // Check if there's saved journey progress
        const savedJourney = await OnboardingService.getSavedJourney();
        
        if (savedJourney && savedJourney.currentScreen) {
          // Resume from saved journey
          console.log('📍 Resuming journey from:', savedJourney.currentScreen);
          return savedJourney.currentScreen as JourneyScreens;
        } else {
          // No saved journey, go to paywall (skip onboarding)
          return 'paywall';
        }
      } else {
        // First time user -> start onboarding
        return 'onboarding1';
      }
    } catch (error) {
      console.error('Error determining initial route:', error);
      return 'onboarding1';
    }
  };

  // Navigation helper functions
  const navigateToScreen = (screenName: JourneyScreens, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(screenName as never, params);
    }
  };

  const resetToScreen = (screenName: JourneyScreens, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: screenName as never, params }],
      });
    }
  };

  // Auto-redirect authenticated users to MyProjects
  useEffect(() => {
    if (isReady && isAuthenticated && user && navigationRef.isReady()) {
      const currentRoute = navigationRef.getCurrentRoute()?.name;
      if (currentRoute !== 'myProjects') {
        resetToScreen('myProjects');
      }
    }
  }, [isReady, isAuthenticated, user]);

  if (!isReady) {
    return null; // Could show a loading screen here
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        {/* Journey Flow Screens */}
        <Stack.Screen name="onboarding1" component={OnboardingScreen1} />
        <Stack.Screen name="onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="onboarding3" component={OnboardingScreen3} />
        <Stack.Screen name="paywall" component={PaywallScreen} />
        <Stack.Screen name="photoCapture" component={PhotoCaptureScreen} />
        <Stack.Screen name="descriptions" component={DescriptionsScreen} />
        <Stack.Screen name="furniture" component={FurnitureScreen} />
        <Stack.Screen name="budget" component={BudgetScreen} />
        <Stack.Screen name="auth" component={AuthScreen} />
        <Stack.Screen name="checkout" component={CheckoutScreen} />
        <Stack.Screen name="processing" component={ProcessingScreen} />
        <Stack.Screen name="results" component={ResultsScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="myProjects" component={MyProjectsScreen} />
        <Stack.Screen name="profile" component={ProfileScreen} />
        <Stack.Screen name="plans" component={PlansScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Export navigation helpers for use in components
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

export default JourneyNavigator;