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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design Tokens - Warm Color Palette
const tokens = {
  color: {
    bgApp: '#FBF9F4',
    bgSecondary: '#F5F1E8',
    bgSurface: '#FEFEFE',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textMuted: '#B8AFA4',
    textInverse: '#FEFEFE',
    accent: '#2D2B28',
    brand: '#D4A574',
    brandLight: '#E8C097',
    success: '#7FB069',
    danger: '#E07A5F',
    border: '#E6DDD1',
    scrim: 'rgba(45,43,40,0.45)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  },
};

const { width, height } = Dimensions.get('window');

interface PaywallScreenProps {
  navigation?: any;
  onSelectPlan?: (planId: string) => void;
  onContinueWithFree?: () => void;
  onBack?: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ 
  navigation,
  onSelectPlan, 
  onContinueWithFree,
  onBack 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const journeyStore = useJourneyStore();
  const { isAuthenticated, user } = useUserStore();

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

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    
    // Show success modal for demonstration
    setShowSuccessModal(true);
    
    // Update journey store
    const planData = {
      yearly: { name: 'Yearly Access', price: '$49.99/year', credits: 'Unlimited' },
      weekly: { name: 'Weekly Access', price: '$12.99/week', credits: 'Unlimited' }
    }[planId];

    journeyStore.updateSubscription({
      selectedPlanId: planId,
      planName: planData?.name || 'Premium',
      planPrice: planData?.price || '$49.99',
      selectedAt: new Date().toISOString(),
      hasPayment: true
    });

    journeyStore.completeStep('paywall');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Navigate to payment pending screen for proper flow
    NavigationHelpers.navigateToScreen('paymentPending', {
      planDetails: {
        name: journeyStore.subscription?.planName || 'Premium',
        price: journeyStore.subscription?.planPrice || '$49.99',
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
          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
              <Text style={styles.featureText}>Faster Rendering</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
              <Text style={styles.featureText}>Ad-free Experience</Text>
            </View>
          </View>

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
              <Text style={styles.freeTrialText}>Free trial</Text>
            </View>
          </TouchableOpacity>

          {/* Yearly Access Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
            onPress={() => handleSelectPlan('yearly')}
            activeOpacity={0.9}
          >
            <View style={styles.bestOfferBadge}>
              <Text style={styles.bestOfferText}>BEST OFFER</Text>
            </View>
            
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>YEARLY ACCESS</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.weeklyPrice}>$0.96</Text>
                <Text style={styles.weeklyLabel}>per week</Text>
              </View>
              <Text style={styles.yearlyPrice}>Just $49.99 per year</Text>
            </View>
          </TouchableOpacity>

          {/* Weekly Access Plan */}
          <TouchableOpacity 
            style={[styles.planCard, styles.weeklyPlan, selectedPlan === 'weekly' && styles.selectedPlan]}
            onPress={() => handleSelectPlan('weekly')}
            activeOpacity={0.9}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>WEEKLY ACCESS</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.weeklyPriceHigher}>then $12.99</Text>
                <Text style={styles.weeklyLabel}>per week</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* No Payment Option */}
          <View style={styles.noPaymentContainer}>
            <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
            <Text style={styles.noPaymentText}>No Payment Now</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} activeOpacity={0.9}>
            <Text style={styles.continueButtonText}>→</Text>
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
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  freeTrialContent: {
    flexDirection: 'row',
    alignItems: 'center',
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