import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import SafeJourneyNavigator from './src/navigation/SafeJourneyNavigator';

// Stripe publishable key - replace with your actual key
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

export default function App() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.compozit.vision" // Required for Apple Pay
    >
      <StatusBar style="light" />
      <SafeJourneyNavigator />
    </StripeProvider>
  );
}