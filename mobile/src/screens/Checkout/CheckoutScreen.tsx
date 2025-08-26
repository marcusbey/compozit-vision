import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useJourneyStore } from '../../stores/journeyStore';
import { useContentStore } from '../../stores/contentStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

interface CheckoutScreenProps {
  selectedPlan?: {
    id: string;
    name: string;
    price: string;
    period: string;
    designs: string;
    features: string[];
  };
  userEmail?: string;
  onBack?: () => void;
  onPaymentSuccess?: (paymentDetails: any) => void;
  onPaymentError?: (error: string) => void;
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  selectedPlan: propSelectedPlan,
  userEmail: propUserEmail,
  onBack,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'apple' | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get data from stores if props not provided
  const journeyStore = useJourneyStore();
  const { subscriptionPlans } = useContentStore();
  const { user } = useUserStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  // Use props if available, otherwise get from stores
  const selectedPlanId = journeyStore.subscription?.selectedPlanId;
  const planFromStore = subscriptionPlans.find(p => p.id === selectedPlanId);
  
  const selectedPlan = propSelectedPlan || (planFromStore ? {
    id: planFromStore.id,
    name: planFromStore.display_name,
    price: `$${planFromStore.price_amount}`,
    period: planFromStore.billing_period,
    designs: planFromStore.designs_included === -1 ? 'Unlimited designs' : `${planFromStore.designs_included} designs`,
    features: [
      planFromStore.description || 'Full access to AI design features',
      'High-quality design generations',
      planFromStore.id === 'basic' ? 'Standard support' : 'Priority support'
    ]
  } : null);
  
  const userEmail = propUserEmail || user?.email || '';

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      NavigationHelpers.navigateToScreen('paywall');
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentDetails: any) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentDetails);
    } else {
      // Store subscription info in journey store (user still needs to authenticate later)
      journeyStore.updateSubscription({
        selectedPlanId: paymentDetails.planId,
        planName: paymentDetails.planId,
        planPrice: paymentDetails.amount,
        billingCycle: paymentDetails.billingPeriod === 'annual' ? 'yearly' : 'monthly',
        useFreeCredits: false,
        selectedAt: new Date().toISOString(),
      });
      
      // After payment success, start the user journey with photo capture
      console.log('✅ Payment successful, starting user journey');
      NavigationHelpers.navigateToScreen('photoCapture');
    }
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    if (onPaymentError) {
      onPaymentError(error);
    } else {
      Alert.alert('Payment Error', error);
    }
  };

  useEffect(() => {
    // If no plan is selected, redirect back to paywall
    if (!selectedPlan) {
      Alert.alert(
        'No Plan Selected', 
        'Please select a subscription plan first.',
        [{ text: 'OK', onPress: handleBack }]
      );
      return;
    }
    
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
  }, [selectedPlan]);

  const handleStripePayment = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'No plan selected');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔄 Initiating Stripe payment for:', selectedPlan.id);
      console.log('💳 Billing period:', billingPeriod);
      
      // For now, simulate payment processing since backend isn't set up yet
      // TODO: Replace with real Stripe integration when backend is ready
      
      Alert.alert(
        'Payment Demo Mode',
        `This would charge ${billingPeriod === 'annual' ? 
          '$' + (getAnnualAmount() * 0.8).toFixed(0) + ' annually' : 
          selectedPlan.price + ' monthly'} for ${selectedPlan.name} plan.\n\nBackend API needed for real payments.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsProcessing(false)
          },
          {
            text: 'Simulate Success',
            style: 'default',
            onPress: () => {
              // Simulate successful payment
              const paymentDetails = {
                method: 'stripe',
                planId: selectedPlan.id,
                amount: billingPeriod === 'annual' ? 
                  '$' + (getAnnualAmount() * 0.8).toFixed(0) : 
                  selectedPlan.price,
                billingPeriod: billingPeriod,
                customerEmail: userEmail,
                paymentId: `stripe_demo_${Date.now()}`,
              };
              
              console.log('✅ Demo payment successful!', paymentDetails);
              handlePaymentSuccess(paymentDetails);
            }
          }
        ]
      );
      
      // Real Stripe implementation (commented out until backend is ready)
      /*
      // Step 1: Create payment intent on backend
      const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customerEmail: userEmail,
          billingPeriod: billingPeriod,
          amount: billingPeriod === 'annual' ? 
            Math.round(getAnnualAmount() * 0.8 * 100) : 
            Math.round(parseFloat(selectedPlan.price.replace('$', '')) * 100),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, customerId } = await response.json();
      console.log('✅ Payment intent created');

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Compozit Vision',
        paymentIntentClientSecret: clientSecret,
        customerId: customerId,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          email: userEmail,
        },
        returnURL: 'compozit://payment-return',
      });

      if (initError) {
        console.error('❌ Payment sheet init failed:', initError);
        throw new Error(initError.message);
      }

      // Step 3: Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          console.log('ℹ️ Payment cancelled by user');
          return;
        }
        console.error('❌ Payment failed:', paymentError);
        throw new Error(paymentError.message);
      }

      // Step 4: Payment successful
      console.log('✅ Payment successful!');
      const paymentDetails = {
        method: 'stripe',
        planId: selectedPlan.id,
        amount: billingPeriod === 'annual' ? 
          '$' + (getAnnualAmount() * 0.8).toFixed(0) : 
          selectedPlan.price,
        billingPeriod: billingPeriod,
        customerEmail: userEmail,
        paymentId: `stripe_${Date.now()}`,
      };
      
      handlePaymentSuccess(paymentDetails);
      */
      
    } catch (error: any) {
      console.error('❌ Stripe payment error:', error);
      handlePaymentError(error.message || 'Payment setup needed. Please deploy the backend API first.');
      setIsProcessing(false);
    }
  };

  const handleApplePayment = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Error', 'Apple Pay is only available on iOS devices');
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement Apple Pay
      // This would integrate with React Native Apple Pay
      console.log('Processing Apple Pay for:', selectedPlan.id);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, simulate success
      const paymentDetails = {
        method: 'apple',
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        customerEmail: userEmail,
        paymentId: `apple_${Date.now()}`,
      };
      
      handlePaymentSuccess(paymentDetails);
    } catch (error: any) {
      handlePaymentError(error.message || 'Apple Pay failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMonthlyAmount = () => {
    return parseFloat(selectedPlan.price.replace('$', ''));
  };

  const getAnnualAmount = () => {
    return getMonthlyAmount() * 12;
  };

  const getAnnualSavings = () => {
    return (getMonthlyAmount() * 12 * 0.2).toFixed(0); // 20% savings
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} testID="back-button">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Purchase</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Plan Summary */}
            <View style={styles.planSummary}>
              <Text style={styles.summaryTitle}>Plan Summary</Text>
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{selectedPlan.name} Plan</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{selectedPlan.price}</Text>
                    <Text style={styles.planPeriod}>{selectedPlan.period}</Text>
                  </View>
                </View>
                <Text style={styles.planDesigns}>{selectedPlan.designs}</Text>
                <View style={styles.planFeatures}>
                  {selectedPlan.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4facfe" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                  {selectedPlan.features.length > 3 && (
                    <Text style={styles.moreFeatures}>
                      +{selectedPlan.features.length - 3} more features
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Billing Options */}
            <View style={styles.billingOptions}>
              <Text style={styles.sectionTitle}>Billing Options</Text>
              
              <TouchableOpacity 
                style={styles.billingOption}
                onPress={() => setBillingPeriod('monthly')}
              >
                <View style={styles.billingOptionLeft}>
                  <View style={[
                    styles.radioButton, 
                    billingPeriod === 'monthly' ? { backgroundColor: '#4facfe' } : styles.radioButtonInactive
                  ]}>
                    {billingPeriod === 'monthly' && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.billingOptionTitle}>Monthly</Text>
                    <Text style={styles.billingOptionDesc}>Billed monthly • Cancel anytime</Text>
                  </View>
                </View>
                <Text style={styles.billingPrice}>{selectedPlan.price}/mo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.billingOption}
                onPress={() => setBillingPeriod('annual')}
              >
                <View style={styles.billingOptionLeft}>
                  <View style={[
                    styles.radioButton, 
                    billingPeriod === 'annual' ? { backgroundColor: '#4facfe' } : styles.radioButtonInactive
                  ]}>
                    {billingPeriod === 'annual' && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.billingOptionTitle}>Annual</Text>
                    <Text style={styles.billingOptionDesc}>
                      Save ${getAnnualSavings()}/year • Best Value
                    </Text>
                  </View>
                </View>
                <View style={styles.annualPricing}>
                  <Text style={styles.billingPrice}>
                    ${(getAnnualAmount() * 0.8 / 12).toFixed(0)}/mo
                  </Text>
                  <Text style={styles.savingsBadgeText}>Save 20%</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Payment Methods */}
            <View style={styles.paymentMethods}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              
              {/* Stripe Payment */}
              <TouchableOpacity 
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === 'stripe' && styles.paymentMethodSelected
                ]}
                onPress={() => setSelectedPaymentMethod('stripe')}
                testID="stripe-payment-method"
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="card" size={24} color="#4facfe" />
                  </View>
                  <View>
                    <Text style={styles.paymentMethodTitle}>Credit/Debit Card</Text>
                    <Text style={styles.paymentMethodDesc}>Visa, Mastercard, Amex</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === 'stripe' 
                    ? { backgroundColor: '#4facfe' } 
                    : styles.radioButtonInactive
                ]}>
                  {selectedPaymentMethod === 'stripe' && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Apple Pay (iOS only) */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={[
                    styles.paymentMethod,
                    selectedPaymentMethod === 'apple' && styles.paymentMethodSelected
                  ]}
                  onPress={() => setSelectedPaymentMethod('apple')}
                  testID="apple-pay-method"
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.paymentIcon}>
                      <Ionicons name="logo-apple" size={24} color="#4facfe" />
                    </View>
                    <View>
                      <Text style={styles.paymentMethodTitle}>Apple Pay</Text>
                      <Text style={styles.paymentMethodDesc}>Touch ID or Face ID</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentMethod === 'apple' 
                      ? { backgroundColor: '#4facfe' } 
                      : styles.radioButtonInactive
                  ]}>
                    {selectedPaymentMethod === 'apple' && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#4facfe" />
              <Text style={styles.securityText}>
                Your payment is secured with 256-bit SSL encryption
              </Text>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By completing your purchase, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>. 
              You can cancel your subscription anytime.
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              !selectedPaymentMethod && styles.payButtonDisabled,
              isProcessing && styles.payButtonProcessing
            ]}
            onPress={selectedPaymentMethod === 'apple' ? handleApplePayment : handleStripePayment}
            disabled={!selectedPaymentMethod || isProcessing}
            testID="complete-payment-button"
          >
            <LinearGradient
              colors={
                !selectedPaymentMethod || isProcessing 
                  ? ['#666', '#888'] 
                  : ['#4facfe', '#00f2fe']
              }
              style={styles.payButtonGradient}
            >
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <Ionicons name="hourglass" size={20} color="#ffffff" />
                  <Text style={styles.payButtonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    {selectedPaymentMethod === 'apple' ? 'Pay with Apple Pay' : `Pay ${selectedPlan.price}`}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  gradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planSummary: {
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4facfe',
  },
  planPeriod: {
    fontSize: 14,
    color: '#b8c6db',
    marginLeft: 4,
  },
  planDesigns: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    fontWeight: '600',
  },
  planFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#b8c6db',
    marginLeft: 8,
  },
  moreFeatures: {
    fontSize: 14,
    color: '#4facfe',
    fontWeight: '500',
    marginTop: 4,
  },
  billingOptions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  billingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  billingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  billingOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  billingOptionTitleInactive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8892b0',
    marginBottom: 2,
  },
  billingOptionDesc: {
    fontSize: 13,
    color: '#8892b0',
  },
  billingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4facfe',
  },
  billingPriceInactive: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8892b0',
  },
  annualPricing: {
    alignItems: 'flex-end',
  },
  savingsBadgeText: {
    fontSize: 12,
    color: '#4facfe',
    fontWeight: '600',
  },
  paymentMethods: {
    marginBottom: 30,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentMethodSelected: {
    borderColor: 'rgba(79, 172, 254, 0.5)',
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: 13,
    color: '#8892b0',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#b8c6db',
    marginLeft: 12,
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  termsLink: {
    color: '#4facfe',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  payButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonProcessing: {
    opacity: 0.8,
  },
  payButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default CheckoutScreen;