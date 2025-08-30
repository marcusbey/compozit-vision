/**
 * FullAppWithoutNavigation - Test utility component
 * 
 * This component provides the full app context (stores, providers, etc.)
 * without the navigation container for easier testing.
 */

import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens that might be tested
import AuthScreen from './src/screens/Auth/AuthScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import WelcomeScreen from './src/screens/Welcome/WelcomeScreen';

interface FullAppWithoutNavigationProps {
  initialScreen?: 'Auth' | 'Home' | 'Welcome';
  children?: React.ReactNode;
}

const FullAppWithoutNavigation: React.FC<FullAppWithoutNavigationProps> = ({ 
  initialScreen = 'Auth',
  children 
}) => {
  // Mock navigation object for screens that require it
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => false),
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  };

  const mockRoute = {
    key: 'test-route',
    name: initialScreen,
    params: {},
  };

  const renderScreen = () => {
    if (children) {
      return children;
    }

    switch (initialScreen) {
      case 'Home':
        return <HomeScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Welcome':
        return <WelcomeScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Auth':
      default:
        return <AuthScreen navigation={mockNavigation} route={mockRoute} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          {renderScreen()}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default FullAppWithoutNavigation;