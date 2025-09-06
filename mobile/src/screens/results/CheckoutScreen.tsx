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
import { tokens } from '../../theme/tokens';

interface CheckoutScreenProps {
  navigation?: any;
  route?: any;
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
  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentDetails);
    } else {
      try {
        // Auto-create user account from payment data
        const userEmail = paymentDetails.customerEmail || paymentDetails.email;
        const displayName = paymentDetails.customerName || userEmail?.split('@')[0] || 'User';
        
        // Create user account automatically
        console.log('🔐 Auto-creating user account from payment data...');
        
        // Mock user creation for now (will be handled by backend after payment webhook)
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        const mockUser = {
          id: generateUUID(),
          email: userEmail,
          fullName: displayName,
          avatarUrl: null,
          preferences: {},
          nbToken: paymentDetails.planId === 'basic' ? 10 : paymentDetails.planId === 'pro' ? 50 : 100,
          currentPlan: paymentDetails.planId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Set user as authenticated
        const { setUser } = useUserStore.getState();
        setUser(mockUser);
        
        // Store subscription info in journey store
        journeyStore.updateSubscription({
          selectedPlanId: paymentDetails.planId,
          planName: paymentDetails.planId,
          planPrice: paymentDetails.amount,
          billingCycle: paymentDetails.billingPeriod === 'annual' ? 'yearly' : 'monthly',
          useFreeCredits: false,
          selectedAt: new Date().toISOString(),
        });
        
        // Mark payment as completed in journey
        journeyStore.updatePayment({
          requiresPayment: false,
          paymentIntentId: paymentDetails.paymentId,
          completedAt: new Date().toISOString(),
          amount: parseInt(paymentDetails.amount.replace('$', '')),
          currency: 'USD'
        });
        
        // Mark authentication as completed (auto-created via payment)
        journeyStore.updateAuthentication({
          hasAccount: true,
          email: userEmail,
          method: paymentDetails.method === 'apple' ? 'apple' : 'email',
          registeredAt: new Date().toISOString()
        });
        
        // Complete checkout step
        journeyStore.completeStep('checkout');
        
        // After payment success and auto-account creation, continue to photo capture
        console.log('✅ Payment successful, user account created, continuing to photo capture');
        NavigationHelpers.navigateToScreen('photoCapture');
      } catch (error) {
        console.error('Error creating user account:', error);
        Alert.alert('Setup Error', 'Payment successful but account setup failed. Please contact support.');
      }
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
      // In production, this would use react-native-apple-pay or Stripe's Apple Pay integration
      // Apple Pay provides user's email from their Apple ID automatically
      console.log('🍎 Processing Apple Pay for:', selectedPlan.id);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Apple Pay returns user data including email from Apple ID
      const paymentDetails = {
        method: 'apple',
        planId: selectedPlan.id,
        amount: billingPeriod === 'annual' ? 
          '$' + (getAnnualAmount() * 0.8).toFixed(0) : 
          selectedPlan.price,
        billingPeriod: billingPeriod,
        // In production, email comes from Apple Pay response
        customerEmail: 'user@icloud.com', // This would be extracted from Apple Pay
        customerName: 'Apple User', // Optional: name from Apple ID
        paymentId: `apple_${Date.now()}`,
        appleTransactionId: `sandbox_${Date.now()}`, // Apple's transaction ID
      };
      
      console.log('✅ Apple Pay authorization successful');
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
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} translucent={false} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton} 
            testID="back-button"
            activeOpacity={0.9}
          >
            <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Purchase</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View 
            style={[
              styles.scrollContainer,
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
                      <Ionicons name="checkmark-circle" size={16} color={tokens.colors.status.success} />
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
                style={[
                  styles.billingOption,
                  billingPeriod === 'monthly' && styles.billingOptionSelected
                ]}
                onPress={() => setBillingPeriod('monthly')}
                activeOpacity={0.9}
              >
                <View style={styles.billingOptionLeft}>
                  <View style={[
                    styles.radioButton, 
                    billingPeriod === 'monthly' ? styles.radioButtonActive : styles.radioButtonInactive
                  ]}>
                    {billingPeriod === 'monthly' && (
                      <Ionicons name="checkmark" size={16} color="#FEFEFE" />
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
                style={[
                  styles.billingOption,
                  billingPeriod === 'annual' && styles.billingOptionSelected
                ]}
                onPress={() => setBillingPeriod('annual')}
                activeOpacity={0.9}
              >
                <View style={styles.billingOptionLeft}>
                  <View style={[
                    styles.radioButton, 
                    billingPeriod === 'annual' ? styles.radioButtonActive : styles.radioButtonInactive
                  ]}>
                    {billingPeriod === 'annual' && (
                      <Ionicons name="checkmark" size={16} color="#FEFEFE" />
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
                activeOpacity={0.9}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="card" size={24} color={tokens.colors.text.primary} />
                  </View>
                  <View>
                    <Text style={styles.paymentMethodTitle}>Credit/Debit Card</Text>
                    <Text style={styles.paymentMethodDesc}>Visa, Mastercard, Amex</Text>
                  </View>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === 'stripe' 
                    ? styles.radioButtonActive 
                    : styles.radioButtonInactive
                ]}>
                  {selectedPaymentMethod === 'stripe' && (
                    <Ionicons name="checkmark" size={16} color="#FEFEFE" />
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
                  activeOpacity={0.9}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.paymentIcon}>
                      <Ionicons name="logo-apple" size={24} color={tokens.colors.text.primary} />
                    </View>
                    <View>
                      <Text style={styles.paymentMethodTitle}>Apple Pay</Text>
                      <Text style={styles.paymentMethodDesc}>Touch ID or Face ID</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentMethod === 'apple' 
                      ? styles.radioButtonActive 
                      : styles.radioButtonInactive
                  ]}>
                    {selectedPaymentMethod === 'apple' && (
                      <Ionicons name="checkmark" size={16} color="#FEFEFE" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={20} color={tokens.colors.status.success} />
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
            onPress={selectedPaymentMethod === 'apple' ? handleApplePayment : handleStripePayment}
            disabled={!selectedPaymentMethod || isProcessing}
            testID="complete-payment-button"
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#E8C097', '#D4A574']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.payButton,
                !selectedPaymentMethod && styles.payButtonDisabled,
                isProcessing && styles.payButtonProcessing
              ]}
            >
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <Ionicons name="hourglass" size={20} color="#2D2B28" />
                  <Text style={styles.payButtonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.payButtonContent}>
                  <Text style={styles.payButtonText}>
                    {selectedPaymentMethod === 'apple' ? 'Pay with Apple Pay' : `Pay ${selectedPlan.price}`}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#2D2B28" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.elevation2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tokens.spacing.xxl,
  },
  scrollContainer: {
    paddingHorizontal: tokens.spacing.lg,
  },
  planSummary: {
    marginBottom: tokens.spacing.xl,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  planCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
  },
  planPeriod: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing.xs,
  },
  planDesigns: {
    fontSize: 16,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
    fontWeight: '600' as const,
  },
  planFeatures: {
    gap: tokens.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing.sm,
  },
  moreFeatures: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.primary,
    fontWeight: '500' as const,
    marginTop: tokens.spacing.xs,
  },
  billingOptions: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  billingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation2,
  },
  billingOptionSelected: {
    borderColor: tokens.colors.primary.DEFAULT,
    borderWidth: 2,
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
    marginRight: tokens.spacing.md,
  },
  radioButtonActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  radioButtonInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
    marginRight: tokens.spacing.md,
  },
  billingOptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  billingOptionDesc: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  billingPrice: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
  },
  annualPricing: {
    alignItems: 'flex-end',
  },
  savingsBadgeText: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.status.success,
    fontWeight: '600' as const,
  },
  paymentMethods: {
    marginBottom: tokens.spacing.xl,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation2,
  },
  paymentMethodSelected: {
    borderColor: tokens.colors.primary.DEFAULT,
    borderWidth: 2,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: tokens.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  paymentMethodDesc: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation2,
  },
  securityText: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  termsText: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: tokens.spacing.lg,
  },
  termsLink: {
    color: tokens.colors.text.primary,
    fontWeight: '600' as const,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
    backgroundColor: tokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  payButton: {
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing.md + 2,
    paddingHorizontal: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevation4,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonProcessing: {
    opacity: 0.8,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  payButtonText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#2D2B28',
  },
});

export default CheckoutScreen;