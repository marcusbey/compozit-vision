import React from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/userStore';

// Screens
import AuthScreen from '../screens/Auth/AuthScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProjectsScreen from '../screens/Projects/ProjectsScreen';
import MyProjectsScreen from '../screens/Projects/MyProjectsScreen';
import CameraScreen from '../screens/Camera/CameraScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PlansScreen from '../screens/Plans/PlansScreen';

// New Flow Screens
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import DemoScreen from '../screens/Demo/DemoScreen';
import ProjectNameScreen from '../screens/ProjectName/ProjectNameScreen';
import StyleSelectionScreen from '../screens/StyleSelection/StyleSelectionScreen';
import BudgetSelectionScreen from '../screens/BudgetSelection/BudgetSelectionScreen';
import PhotoCaptureScreen from '../screens/PhotoCapture/PhotoCaptureScreen';
import ProcessingScreen from '../screens/Processing/ProcessingScreen';
import ResultsScreen from '../screens/Results/ResultsScreen';
import ProjectSettingsScreen from '../screens/ProjectSettings/ProjectSettingsScreen';
import BuyCreditsScreen from '../screens/BuyCredits/BuyCreditsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ref de navigation pour piloter le reset depuis les effets
export const navigationRef = createNavigationContainerRef();

// Navigation principale avec tabs
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navigation racine avec le nouveau flow
const AppNavigator = () => {
  const { isAuthenticated, user, initializeAuth } = useUserStore();
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [initialRoute, setInitialRoute] = React.useState('Auth');

  React.useEffect(() => {
    const initAuth = async () => {
      // Check if user was previously authenticated
      try {
        const savedAuthState = await AsyncStorage.getItem('userAuthState');
        if (savedAuthState) {
          const authData = JSON.parse(savedAuthState);
          console.log('🔄 Found saved auth state:', authData.email);
        }
      } catch (error) {
        console.log('No saved auth state found');
      }

      // Initialize Firebase auth listener
      const unsubscribe = initializeAuth();
      
      // Déterminer la route initiale
      await determineInitialRoute();
      
      // Wait for Firebase auth to initialize
      const timer = setTimeout(() => {
        setIsAuthReady(true);
      }, 2000);
      
      return () => {
        if (unsubscribe) unsubscribe();
        clearTimeout(timer);
      };
    };

    initAuth();
  }, []);

  const determineInitialRoute = async () => {
    if (isAuthenticated && user) {
      // Utilisateur connecté -> rediriger vers MyProjects
      setInitialRoute('MyProjects');
    } else {
      // Vérifier si c'est la première visite
      try {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          // Première visite -> Welcome
          setInitialRoute('Welcome');
        } else {
          // Pas première visite -> Auth directement
          setInitialRoute('Auth');
        }
      } catch (error) {
        // En cas d'erreur, aller vers Auth
        setInitialRoute('Auth');
      }
    }
  };

  // Rediriger automatiquement vers MyProjects dès que l'utilisateur est authentifié
  React.useEffect(() => {
    if (isAuthReady && isAuthenticated && user && navigationRef.isReady()) {
      const current = navigationRef.getCurrentRoute()?.name;
      if (current !== 'MyProjects') {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'MyProjects' as never }],
        });
      }
    }
  }, [isAuthReady, isAuthenticated, user]);

  // Don't render navigation until auth state is determined
  if (!isAuthReady) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        {/* First-time user onboarding flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Demo" component={DemoScreen} />
        
        {/* Project creation flow (both first-time and logged-in users) */}
        <Stack.Screen name="ProjectName" component={ProjectNameScreen} />
        <Stack.Screen name="StyleSelection" component={StyleSelectionScreen} />
        <Stack.Screen name="BudgetSelection" component={BudgetSelectionScreen} />
        <Stack.Screen name="PhotoCapture" component={PhotoCaptureScreen} />
        
        {/* Authentication */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        
        {/* Processing and Results */}
        <Stack.Screen name="Processing" component={ProcessingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="ProjectSettings" component={ProjectSettingsScreen} />
        <Stack.Screen name="BuyCredits" component={BuyCreditsScreen} />
        
        {/* Main app screens */}
        <Stack.Screen name="MyProjects" component={MyProjectsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        
        {/* Tab navigation for authenticated users */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
