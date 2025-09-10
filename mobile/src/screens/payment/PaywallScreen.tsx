import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions, Easing, Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getWeeklyPrice, PaymentFrequency, PLAN_TIERS } from '../../config/planTiers';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { tokens } from '../../theme/tokens';


const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(height * 0.66);
const VIDEO_ASPECT = 16 / 9;

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
  const panAnim = useRef(new Animated.Value(0)).current;
  const [selectedFrequency, setSelectedFrequency] = useState<PaymentFrequency>('monthly');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [viewportWidth, setViewportWidth] = useState(width);
  const [containerWidth, setContainerWidth] = useState(Math.ceil(HERO_HEIGHT * VIDEO_ASPECT));
  const [currentVideo, setCurrentVideo] = useState(1); // 1 for first video, 2 for second video

  // Apparition cascade refs
  const aHeaderOp = useRef(new Animated.Value(0)).current;
  const aHeaderTr = useRef(new Animated.Value(18)).current;
  const aInputOp = useRef(new Animated.Value(0)).current;
  const aInputTr = useRef(new Animated.Value(18)).current;
  const aTitleOp = useRef(new Animated.Value(0)).current;
  const aTitleTr = useRef(new Animated.Value(18)).current;
  const aPlansOp = useRef(new Animated.Value(0)).current;
  const aPlansTr = useRef(new Animated.Value(18)).current;
  const aCtaOp = useRef(new Animated.Value(0)).current;
  const aCtaTr = useRef(new Animated.Value(18)).current;
  const aFooterOp = useRef(new Animated.Value(0)).current;
  const aFooterTr = useRef(new Animated.Value(18)).current;

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

    // Stagger top-to-bottom apparition
    Animated.stagger(140, [
      Animated.parallel([
        Animated.timing(aHeaderOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aHeaderTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aInputOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aInputTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aTitleOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aTitleTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aPlansOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aPlansTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aCtaOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aCtaTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aFooterOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(aFooterTr, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    const requiredWidth = Math.ceil(HERO_HEIGHT * VIDEO_ASPECT);
    setContainerWidth(requiredWidth);
    const extraWidth = Math.max(0, requiredWidth - viewportWidth);
    panAnim.setValue(-extraWidth);
    Animated.timing(panAnim, {
      toValue: 0,
      duration: 12000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [viewportWidth]);

  const handleSelectFrequency = async (frequency: PaymentFrequency) => {
    setSelectedFrequency(frequency);

    // Calculate pricing based on frequency
    const monthlyPrice = selectedPlan.monthlyPrice;
    const yearlyPrice = selectedPlan.yearlyPrice;

    let finalPrice: number;
    let displayPrice: string;

    switch (frequency) {
      case 'weekly':
        // Weekly selection maps to monthly billing under the hood
        finalPrice = monthlyPrice;
        displayPrice = `$${(monthlyPrice / 4.33).toFixed(2)}/week`;
        break;
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

      // Navigate to main app with bottom navigation
      NavigationHelpers.navigateToScreen('mainApp', {
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

    // Navigate to main app with bottom navigation (new streamlined flow)
    NavigationHelpers.navigateToScreen('mainApp', {
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
    NavigationHelpers.navigateToScreen('mainApp');
  };

  const handleVideoFinish = () => {
    // Switch to the other video when current one finishes
    setCurrentVideo(currentVideo === 1 ? 2 : 1);
  };

  const handleBack = () => {
    NavigationHelpers.navigateToScreen('onboarding4', { hideOverlay: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background: hero video */}
      <View style={styles.backgroundContainer} onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}>
        {/* First Video - Horizontal with panning animation */}
        {currentVideo === 1 && (
          <Animated.View style={[styles.panningContainer, { width: containerWidth, transform: [{ translateX: panAnim }] }]}>
            <Video
              source={require('../../assets/animations/videos/heroes/transition04-paywall.mp4')}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isMuted
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish) {
                  handleVideoFinish();
                }
              }}
            />
          </Animated.View>
        )}

        {/* Second Video - Vertical, fixed position and cropped */}
        {currentVideo === 2 && (
          <View style={styles.fixedVideoContainer}>
            <Video
              source={require('../../assets/animations/videos/heroes/transition05-paywall.mp4')}
              style={styles.verticalVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isMuted
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish) {
                  handleVideoFinish();
                }
              }}
            />
          </View>
        )}

        <LinearGradient colors={[ 'rgba(10,9,8,0.30)', tokens.colors.overlay.medium, tokens.colors.overlay.heavy ]} locations={[0,0.6,1]} style={styles.gradientOverlay} />

        {/* Bottom transition gradient */}
        <LinearGradient
          colors={['transparent', tokens.colors.background.deep]}
          locations={[0, 1]}
          style={styles.bottomTransitionGradient}
        />

        {/* Claim overlay */}
        <View pointerEvents="none" style={[styles.heroClaimContainer, { bottom: HERO_HEIGHT * 0.5 }]}>
          <Text style={styles.heroClaimText}>
            <Text style={styles.heroClaimHighlight}>Remodel</Text>
            {" with Unlimited Access"}
          </Text>
        </View>
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
          <Animated.View style={[styles.selectedPlanHeader, { opacity: aHeaderOp, transform: [{ translateY: aHeaderTr }] }]}>
            <View style={[styles.planIcon, { backgroundColor: `${selectedPlan.color}20` }]}>
              <Ionicons name={selectedPlan.icon as any} size={24} color={selectedPlan.color} />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.selectedPlanTitle}>{selectedPlan.name} Plan</Text>
              <Text style={styles.selectedPlanDescription}>{selectedPlan.description}</Text>
            </View>
          </Animated.View>

          {/* Test Mode Email Input */}
          {__DEV__ && (
            <Animated.View style={[styles.testEmailContainer, { opacity: aInputOp, transform: [{ translateY: aInputTr }] }]}>
              <Text style={styles.testEmailLabel}>Test Mode - Enter Email:</Text>
              <TextInput
                style={styles.testEmailInput}
                placeholder="test@example.com"
                value={testEmail}
                onChangeText={setTestEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>
          )}

          {/* Payment Frequency Options */}
          <Animated.Text style={[styles.frequencyTitle, { opacity: aTitleOp, transform: [{ translateY: aTitleTr }] }]}>Choose your billing plan</Animated.Text>

          {/* Three-up compact selector */}
          <Animated.View style={[styles.plansRow, { opacity: aPlansOp, transform: [{ translateY: aPlansTr }] }]}>
            <TouchableOpacity style={[styles.planPill, selectedFrequency === 'monthly' && styles.planPillSelected]} onPress={() => handleSelectFrequency('monthly')} activeOpacity={0.9}>
              <Text style={[styles.planPillTitle, selectedFrequency === 'monthly' && styles.planPillTitleSelected]}>1 Month</Text>
              <Text style={[styles.planPillPrice, selectedFrequency === 'monthly' && styles.planPillTitleSelected]}>${selectedPlan.monthlyPrice}/m</Text>
              <Text style={styles.planPillSub}>only ${getWeeklyPrice(selectedPlan.monthlyPrice)}/w</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planPill, styles.planPillWeekly, styles.planPillPopular, selectedFrequency === 'weekly' && styles.planPillSelected]} onPress={() => handleSelectFrequency('weekly')} activeOpacity={0.9}>
              <Text style={styles.planBadge}>POPULAR</Text>
              <Text style={[styles.planPillTitle, selectedFrequency === 'weekly' && styles.planPillTitleSelected]}>1 Week</Text>
              <Text style={[styles.planPillPrice, selectedFrequency === 'weekly' && styles.planPillTitleSelected]}>${(selectedPlan.monthlyPrice/4.33).toFixed(2)}/w</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planPill, selectedFrequency === 'yearly' && styles.planPillSelected]} onPress={() => handleSelectFrequency('yearly')} activeOpacity={0.9}>
              <Text style={styles.planBadgeAlt}>BEST VALUE</Text>
              <Text style={[styles.planPillTitle, selectedFrequency === 'yearly' && styles.planPillTitleSelected]}>1 Year</Text>
              <Text style={[styles.planPillPrice, selectedFrequency === 'yearly' && styles.planPillTitleSelected]}>${selectedPlan.yearlyPrice}/y</Text>
              <Text style={styles.planPillSub}>only ${(selectedPlan.yearlyPrice/52).toFixed(2)}/w</Text>
            </TouchableOpacity>
          </Animated.View>

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

          {/* Security text above CTA */}
          <Animated.View style={[styles.securityTextContainer, { opacity: aCtaOp, transform: [{ translateY: aCtaTr }] }]}>
            <Text style={styles.securityText}>Secured with Apple Store • Cancel anytime</Text>
          </Animated.View>

          {/* CTA aligned below free trial */}
          <Animated.View style={{ opacity: aCtaOp, transform: [{ translateY: aCtaTr }] }}>
            <TouchableOpacity style={styles.primaryCtaButton} onPress={() => handleSelectFrequency(selectedFrequency)} activeOpacity={0.9}>
              <Text style={styles.primaryCtaText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Terms and Privacy */}
          <Animated.View style={[styles.footer, { opacity: aFooterOp, transform: [{ translateY: aFooterTr }] }]}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Use</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Animated.View>
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
    backgroundColor: tokens.colors.background.deep,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
  },
  panningContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  fixedVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  verticalVideo: {
    width: width * 1.5, // Scale up to crop properly
    height: HERO_HEIGHT * 1.2, // Scale up to fill height and crop
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
  heroClaimContainer: {
    position: 'absolute',
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    bottom: tokens.spacing.lg,
  },
  heroClaimText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroClaimHighlight: {
    color: '#D4A574',
  },
  heroClaimSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.96)',
    fontSize: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: tokens.spacing.lg,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xs,
    paddingTop: tokens.spacing.sm,
  },
  spacingBuffer: {
    height: tokens.spacing.xxl, // 48px mandatory spacing buffer (using xxl which is 48px)
    marginVertical: tokens.spacing.lg,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: tokens.spacing.lg,
    marginVertical: tokens.spacing.md,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: tokens.spacing.sm,
  },
  planPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planPillWeekly: {
    flex: 1.25,
  },
  planPillPopular: {
    borderColor: '#D4A574',
  },
  planPillSelected: {
    borderColor: tokens.colors.primary.DEFAULT,
    backgroundColor: 'rgba(212,165,116,0.15)',
  },
  planPillTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  planPillTitleSelected: {
    color: '#FFFFFF',
  },
  planPillPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  planPillSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  planBadge: {
    color: '#0A0A0A',
    backgroundColor: '#D4A574',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    marginBottom: 4,
    overflow: 'hidden',
  },
  planBadgeAlt: {
    color: '#0A0A0A',
    backgroundColor: '#D4A574',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    marginBottom: 4,
    overflow: 'hidden',
  },
  primaryCtaButton: {
    backgroundColor: '#D4A574',
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryCtaText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '700',
  },
  selectedPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
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
    marginBottom: 12,
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
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
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
    borderColor: tokens.colors.primary.DEFAULT,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
    gap: tokens.spacing.lg,
  },
  footerLink: {
    color: 'rgba(232,221,209,0.95)',
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
    color: tokens.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
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
  securityTextContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  securityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomTransitionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
});

export default PaywallScreen;
