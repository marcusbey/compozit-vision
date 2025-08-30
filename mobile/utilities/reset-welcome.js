// Quick script to reset the welcome screen flag
// Run this with: node reset-welcome.js

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function resetWelcomeFlag() {
  try {
    // This would work in a React Native environment
    console.log('To reset the welcome screen:');
    console.log('1. In your app, add this code temporarily to any screen:');
    console.log('   AsyncStorage.removeItem("hasSeenWelcome");');
    console.log('2. Or use Expo dev menu -> Clear AsyncStorage');
    console.log('3. Or add a dev button in your app (see instructions below)');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetWelcomeFlag();