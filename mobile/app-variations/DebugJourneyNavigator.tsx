import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugJourneyNavigator() {
  useEffect(() => {
    console.log('DebugJourneyNavigator mounted');
    
    // Test imports one by one
    try {
      console.log('Testing userStore import...');
      const { useUserStore } = require('./src/stores/userStore');
      console.log('✅ userStore imported successfully');
      
      console.log('Testing journeyStore import...');
      const { useJourneyStore } = require('./src/stores/journeyStore');
      console.log('✅ journeyStore imported successfully');
      
      console.log('Testing OnboardingService import...');
      const { OnboardingService } = require('./src/services/onboarding');
      console.log('✅ OnboardingService imported successfully');
      
      console.log('Testing navigation imports...');
      const { NavigationContainer } = require('@react-navigation/native');
      const { createStackNavigator } = require('@react-navigation/stack');
      console.log('✅ Navigation imports successful');
      
      console.log('Testing screen imports...');
      const screens = [
        'OnboardingScreen1',
        'OnboardingScreen2', 
        'OnboardingScreen3',
        'PaywallScreen',
        'PhotoCaptureScreen',
        'CheckoutScreen',
        'AuthScreen',
        'ProcessingScreen',
        'ResultsScreen',
        'MyProjectsScreen',
        'ProfileScreen',
        'PlansScreen',
        'BudgetScreen',
        'DescriptionsScreen',
        'FurnitureScreen'
      ];
      
      for (const screen of screens) {
        try {
          require(`./src/screens/${screen.replace('Screen', '/')}${screen}`);
          console.log(`✅ ${screen} imported successfully`);
        } catch (error) {
          console.error(`❌ Failed to import ${screen}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Import error:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Debug JourneyNavigator</Text>
      <Text style={styles.subtext}>Check console for import test results</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  text: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#8892b0',
  },
});