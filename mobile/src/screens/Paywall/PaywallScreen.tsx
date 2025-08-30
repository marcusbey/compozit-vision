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
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { PLAN_TIERS, getWeeklyPrice, getYearlySavings, getPaymentProductId, PaymentFrequency } from '../../config/planTiers';

// Design Tokens - Following @STYLE-GUIDE.json
const tokens = {
  color: {
    bgApp: '#FBF9F4',
    bgSecondary: '#F5F1E8',
    surface: '#FEFEFE',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textMuted: '#B8AFA4',
    textInverse: '#FEFEFE',
    borderSoft: '#E6DDD1',
    brand: '#D4A574',
    brandLight: '#E8C097',
    brandDark: '#B8935F',
    accent: '#2D2B28',
    accentSoft: '#5A564F',
    scrim: 'rgba(45,43,40,0.45)',
    scrimHeavy: 'rgba(45,43,40,0.65)',
    success: '#7FB069',
    error: '#E07A5F',
    warning: '#F2CC8F',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48, // MANDATORY 48px spacing for buttons
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  shadow: {
    e1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    e2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    e3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
  },
  typography: {
    display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h1: { fontSize: 28, fontWeight: '600' as const, lineHeight: 36 },
    h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
    small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  },
};

const { width, height } = Dimensions.get('window');

interface PaywallScreenProps {
  navigation?: any;
  route?: any;
  onSelectPlan?: (planId: string) => void;
  onContinueWithFree?: () => void;
  onBack?: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ 
  navigation,
  route,
  onSelectPlan, 
  onContinueWithFree,
  onBack 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequency>('monthly');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const journeyStore = useJourneyStore();
  const { isAuthenticated, user } = useUserStore();
  
  // Get selected plan from route params or journey store
  const selectedPlan = route?.params?.selectedPlan || 
    PLAN_TIERS[journeyStore.subscription?.selectedPlanTier || 'pro'];
  
  console.log('💰 PaymentFrequencyScreen - Selected plan:', selectedPlan);

  useEffect(() => {
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
  }, []);

  const handleSelectFrequency = async (frequency: PaymentFrequency) => {
    setSelectedFrequency(frequency);
    
    // Calculate pricing based on frequency
    const monthlyPrice = selectedPlan.monthlyPrice;
    const yearlyPrice = selectedPlan.yearlyPrice;
    
    let finalPrice: number;
    let displayPrice: string;
    
    switch (frequency) {
      case 'yearly':
        finalPrice = yearlyPrice;
        displayPrice = `$${yearlyPrice}/year`;
        break;
      default:
        finalPrice = monthlyPrice;
        displayPrice = `$${monthlyPrice}/month`;
    }

    // In test mode, skip payment and just provide credits
    if (__DEV__) {
      console.log('🧪 Test Mode: Skipping payment, providing plan credits directly');
      
      // Update user store with plan credits immediately
      const { updateUserPlan } = useUserStore.getState();
      const creditsForPlan = selectedPlan.id === 'basic' ? 100 : 
                            selectedPlan.id === 'pro' ? 500 : 1500;
      
      await updateUserPlan(selectedPlan.id, creditsForPlan).catch(error => {
        console.log('⚠️ Failed to update user plan locally:', error);
      });
      
      console.log(`✅ Test Mode: User plan updated: ${selectedPlan.name} with ${creditsForPlan} credits`);
      
      // Update journey store
      journeyStore.updateSubscription({
        selectedPlanId: selectedPlan.id,
        selectedPlanTier: selectedPlan.id,
        planName: selectedPlan.name,
        planPrice: finalPrice,
        paymentFrequency: frequency,
        selectedAt: new Date().toISOString(),
        hasPayment: true // Mark as paid in test mode
      });

      journeyStore.completeStep('paymentFrequency');
      
      // Navigate directly to project wizard
      NavigationHelpers.navigateToScreen('projectWizardStart', {
        planSelected: true,
        planDetails: {
          tier: selectedPlan.name,
          frequency: frequency,
          price: finalPrice,
        }
      });
      
      return; // Skip payment modal in test mode
    }

    // Production payment flow
    let paymentEmail = 'user@example.com'; // Would get from Apple/Google Pay

    // Update journey store with payment frequency and email
    journeyStore.updateSubscription({
      selectedPlanId: selectedPlan.id,
      selectedPlanTier: selectedPlan.id,
      planName: selectedPlan.name,
      planPrice: finalPrice,
      paymentFrequency: frequency,
      selectedAt: new Date().toISOString(),
      hasPayment: true
    });

    // Store payment email in authentication
    journeyStore.updateAuthentication({
      paymentEmail: paymentEmail
    });

    journeyStore.completeStep('paymentFrequency');
    
    // Show success modal for demonstration
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Update user store with plan credits after successful payment
    const { updateUserPlan } = useUserStore.getState();
    const creditsForPlan = selectedPlan.id === 'basic' ? 100 : 
                          selectedPlan.id === 'pro' ? 500 : 1500;
    
    updateUserPlan(selectedPlan.id, creditsForPlan).catch(error => {
      console.log('⚠️ Failed to update user plan locally:', error);
      // Continue navigation anyway in demo mode
    });
    
    console.log(`✅ User plan updated: ${selectedPlan.name} with ${creditsForPlan} credits`);
    
    // Navigate to project wizard - authentication will be handled before AI processing
    NavigationHelpers.navigateToScreen('projectWizardStart', {
      planSelected: true,
      planDetails: {
        tier: selectedPlan.name,
        frequency: selectedFrequency,
        price: journeyStore.subscription?.planPrice,
      }
    });
  };

  const handleFreeTrial = () => {
    journeyStore.updateSubscription({
      selectedPlanId: 'free',
      planName: 'Free Trial',
      planPrice: '$0',
      useFreeCredits: true,
      selectedAt: new Date().toISOString(),
      hasPayment: false
    });
    
    // Give user 3 free credits for trial
    const { updateUserPlan } = useUserStore.getState();
    updateUserPlan('free', 3).catch(error => {
      console.log('⚠️ Failed to update free trial credits:', error);
    });
    
    console.log('✅ Free trial: 3 credits provided');
    
    journeyStore.completeStep('paywall');
    NavigationHelpers.navigateToScreen('projectWizardStart');
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      NavigationHelpers.navigateToScreen('onboarding3');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      {/* Background with demo images - similar to reference */}
      <View style={styles.backgroundContainer}>
        <View style={styles.designGrid}>
          {/* Left column - darker design */}
          <View style={[styles.designColumn, styles.leftColumn]}>
            <View style={[styles.designCard, { backgroundColor: '#2D2B28' }]} />
          </View>
          
          {/* Center column - main golden design */}
          <View style={[styles.designColumn, styles.centerColumn]}>
            <View style={[styles.designCard, styles.mainCard, { backgroundColor: '#D4A574' }]}>
              <View style={styles.cardContent}>
                <View style={styles.window} />
                <View style={styles.furniture} />
                <View style={styles.decor} />
              </View>
            </View>
          </View>
          
          {/* Right column - light design */}
          <View style={[styles.designColumn, styles.rightColumn]}>
            <View style={[styles.designCard, { backgroundColor: '#F5F1E8' }]} />
          </View>
        </View>

        {/* Dark overlay gradient */}
        <LinearGradient
          colors={['rgba(45,43,40,0.0)', 'rgba(45,43,40,0.7)', 'rgba(45,43,40,0.95)']}
          style={styles.gradientOverlay}
          locations={[0, 0.6, 1]}
        />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Selected Plan Header */}
          <View style={styles.selectedPlanHeader}>
            <View style={[styles.planIcon, { backgroundColor: `${selectedPlan.color}20` }]}>
              <Ionicons name={selectedPlan.icon as any} size={24} color={selectedPlan.color} />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.selectedPlanTitle}>{selectedPlan.name} Plan</Text>
              <Text style={styles.selectedPlanDescription}>{selectedPlan.description}</Text>
            </View>
          </View>

          {/* Test Mode Email Input */}
          {__DEV__ && (
            <View style={styles.testEmailContainer}>
              <Text style={styles.testEmailLabel}>Test Mode - Enter Email:</Text>
              <TextInput
                style={styles.testEmailInput}
                placeholder="test@example.com"
                value={testEmail}
                onChangeText={setTestEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Payment Frequency Options */}
          <Text style={styles.frequencyTitle}>Choose your billing plan</Text>

          {/* Monthly Option */}
          <TouchableOpacity 
            style={[styles.frequencyCard, selectedFrequency === 'monthly' && styles.selectedFrequencyCard]}
            onPress={() => handleSelectFrequency('monthly')}
            activeOpacity={0.9}
          >
            <View style={styles.frequencyHeader}>
              <View>
                <Text style={styles.frequencyName}>Monthly</Text>
                <Text style={styles.weeklyPriceSubtext}>Just ${getWeeklyPrice(selectedPlan.monthlyPrice)}/week</Text>
              </View>
              {selectedFrequency === 'monthly' && (
                <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
              )}
            </View>
            <Text style={styles.frequencyPrice}>${selectedPlan.monthlyPrice}/month</Text>
            <Text style={styles.frequencyDescription}>Billed monthly • Cancel anytime</Text>
          </TouchableOpacity>

          {/* Yearly Option */}
          <TouchableOpacity 
            style={[styles.frequencyCard, selectedFrequency === 'yearly' && styles.selectedFrequencyCard]}
            onPress={() => handleSelectFrequency('yearly')}
            activeOpacity={0.9}
          >
            <View style={styles.bestOfferBadge}>
              <Text style={styles.bestOfferText}>SAVE {getYearlySavings(selectedPlan.monthlyPrice, selectedPlan.yearlyPrice)}%</Text>
            </View>
            <View style={styles.frequencyHeader}>
              <View>
                <Text style={styles.frequencyName}>Yearly</Text>
                <Text style={styles.weeklyPriceSubtext}>Just ${(selectedPlan.yearlyPrice / 52).toFixed(2)}/week</Text>
              </View>
              {selectedFrequency === 'yearly' && (
                <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
              )}
            </View>
            <Text style={styles.frequencyPrice}>${selectedPlan.yearlyPrice}/year</Text>
            <Text style={styles.frequencyDescription}>
              Save ${(selectedPlan.monthlyPrice * 12 - selectedPlan.yearlyPrice)} vs monthly • Best value
            </Text>
          </TouchableOpacity>

          {/* Mandatory Spacing Buffer - prevents cramped feeling */}
          <View style={styles.spacingBuffer} />

          {/* Visual Separator */}
          <View style={styles.sectionDivider} />

          {/* Free Trial Toggle */}
          <TouchableOpacity 
            style={styles.freeTrialContainer}
            onPress={handleFreeTrial}
            activeOpacity={0.8}
          >
            <View style={styles.freeTrialContent}>
              <View style={styles.freeTrialToggle}>
                <View style={styles.toggleSlider} />
              </View>
              <Text style={styles.freeTrialText}>Try free version instead</Text>
            </View>
          </TouchableOpacity>

          {/* Terms and Cancel */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms • Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.footerLink}>Cancel Anytime</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successTitle}>You're all set</Text>
            <Text style={styles.successMessage}>Your purchase was successful.</Text>
            <TouchableOpacity 
              style={styles.okButton}
              onPress={handleSuccessModalClose}
              activeOpacity={0.8}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  designGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  designColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftColumn: {
    paddingRight: 4,
  },
  centerColumn: {
    paddingHorizontal: 4,
  },
  rightColumn: {
    paddingLeft: 4,
  },
  designCard: {
    width: '100%',
    height: height * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainCard: {
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  window: {
    width: '60%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    alignSelf: 'center',
  },
  furniture: {
    width: '80%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignSelf: 'center',
  },
  decor: {
    width: '40%',
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: tokens.spacing.xl,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  spacingBuffer: {
    height: tokens.spacing.xxxl, // 48px mandatory spacing buffer
    marginVertical: tokens.spacing.lg,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  selectedPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  selectedPlanTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedPlanDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  testEmailContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testEmailLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  testEmailInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C1C1C',
  },
  frequencyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedFrequencyCard: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  frequencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  frequencyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  weeklyPriceSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  frequencyPrice: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  frequencyDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  freeTrialContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  freeTrialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeTrialToggle: {
    width: 50,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 2,
    marginRight: 12,
  },
  toggleSlider: {
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
  },
  freeTrialText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: tokens.color.brand,
  },
  weeklyPlan: {
    borderColor: '#8B4513',
    borderWidth: 2,
  },
  bestOfferBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#E07A5F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestOfferText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planHeader: {
    alignItems: 'flex-start',
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  weeklyPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  weeklyPriceHigher: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  weeklyLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  yearlyPrice: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noPaymentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: tokens.color.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  okButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PaywallScreen;