import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../stores/contentStore';
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
    accentSoft: '#5A564F',
    brand: '#D4A574',
    brandLight: '#E8C097',
    brandDark: '#B8935F',
    warm: '#E8C097',
    warmDark: '#D4A574',
    success: '#7FB069',
    warning: '#F2CC8F',
    danger: '#E07A5F',
    border: '#E6DDD1',
    borderLight: '#E6DDD1',
    borderWarm: '#D4C7B5',
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
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
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
  onSelectPlan?: (planId: string) => void;
  onContinueWithFree?: () => void;
  onBack?: () => void;
}


interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  designs: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

// Remove hardcoded plans - now using database-driven content

const PaywallScreen: React.FC<PaywallScreenProps> = ({ 
  onSelectPlan, 
  onContinueWithFree,
  onBack 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Database-driven content
  const { subscriptionPlans, loadingPlans, loadSubscriptionPlans } = useContentStore();
  const journeyStore = useJourneyStore();
  const { isAuthenticated, user } = useUserStore();

  useEffect(() => {
    // Load subscription plans from database when component mounts
    loadSubscriptionPlans();
    
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

  const handleSelectPlan = (planId: string) => {
    // Mark paywall step as completed in journey
    journeyStore.completeStep('paywall');
    
    // Route based on authentication state
    if (isAuthenticated && user) {
      // Authenticated user -> Direct to checkout
      completePlanSelection(planId);
    } else {
      // Non-authenticated user -> Authentication first, then checkout
      journeyStore.updateSubscription({ selectedPlanId: planId });
      const selectedPlan = subscriptionPlans.find(p => p.id === planId);
      if (selectedPlan) {
        journeyStore.updateSubscription({
          planName: selectedPlan.display_name,
          planPrice: `$${selectedPlan.price_amount}`,
          selectedAt: new Date().toISOString()
        });
      }
      
      // Navigate to auth with context that user is in paywall flow
      NavigationHelpers.navigateToScreen('auth');
    }
  };

  const completePlanSelection = (planId: string) => {
    // Update journey store with selected plan
    const selectedPlan = subscriptionPlans.find(p => p.id === planId);
    if (selectedPlan) {
      journeyStore.updateSubscription({
        selectedPlanId: planId,
        planName: selectedPlan.display_name,
        planPrice: `$${selectedPlan.price_amount}`,
        selectedAt: new Date().toISOString()
      });
    }
    
    // Mark payment as required
    journeyStore.updatePayment({
      requiresPayment: true,
      amount: selectedPlan ? selectedPlan.price_amount : 0,
      currency: 'USD'
    });
    
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      // Navigate to checkout when no callback provided
      NavigationHelpers.navigateToScreen('checkout');
    }
  };


  const handleContinueWithFree = () => {
    // Mark that user chose free option
    journeyStore.updateSubscription({
      selectedPlanId: 'free',
      planName: 'Free',
      planPrice: '$0',
      useFreeCredits: true,
      selectedAt: new Date().toISOString()
    });
    
    // Complete paywall step
    journeyStore.completeStep('paywall');
    
    if (onContinueWithFree) {
      onContinueWithFree();
    } else {
      // Navigate to photo capture for free users
      NavigationHelpers.navigateToScreen('photoCapture');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate to the logical previous screen (onboarding3)
      NavigationHelpers.navigateToScreen('onboarding3');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
            <Text style={styles.headerSubtitle}>Start with 3 free designs</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
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
            {/* Free Credits Notice */}
            <View style={styles.freeCreditsContainer}>
              <View style={styles.creditsIcon}>
                <Ionicons name="gift" size={24} color={tokens.color.brand} />
              </View>
              <Text style={styles.freeCreditsText}>
                You have <Text style={styles.creditsHighlight}>3 free designs</Text> to start
              </Text>
              <Text style={styles.freeCreditsSubtext}>
                Try our AI-powered design before choosing a plan
              </Text>
            </View>

            {/* Plans Grid - Database Driven */}
            <View style={styles.plansContainer}>
              {loadingPlans ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading plans...</Text>
                </View>
              ) : subscriptionPlans.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>No subscription plans available</Text>
                  <Text style={styles.loadingText}>Check database connection</Text>
                </View>
              ) : (
                subscriptionPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      plan.is_popular && styles.popularPlan
                    ]}
                    onPress={() => handleSelectPlan(plan.id)}
                    activeOpacity={0.9}
                  >
                    {plan.badge_text && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.badge_text}</Text>
                      </View>
                    )}
                    
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.display_name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.planPrice}>${plan.price_amount}</Text>
                        <Text style={styles.planPeriod}>/{plan.billing_period}</Text>
                      </View>
                      <Text style={styles.planDesigns}>
                        {plan.designs_included === -1 
                          ? 'Unlimited designs' 
                          : `${plan.designs_included} designs`}
                      </Text>
                    </View>

                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
                        <Text style={styles.featureText}>
                          {plan.description || 'Full access to AI design features'}
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
                        <Text style={styles.featureText}>
                          High-quality design generations
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
                        <Text style={styles.featureText}>
                          {plan.id === 'basic' ? 'Standard support' : 'Priority support'}
                        </Text>
                      </View>
                    </View>

                    <LinearGradient
                      colors={[tokens.color.brandLight, tokens.color.brand]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.selectButton}
                    >
                      <Text style={styles.selectButtonText}>
                        {plan.is_popular ? 'Choose Pro' : `Choose ${plan.display_name}`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Features Highlight */}
            <View style={styles.highlightContainer}>
              <Text style={styles.highlightTitle}>What you get with any plan:</Text>
              <View style={styles.highlightFeatures}>
                <View style={styles.highlightFeature}>
                  <Ionicons name="flash" size={20} color={tokens.color.accent} />
                  <Text style={styles.highlightText}>AI-powered design generation</Text>
                </View>
                <View style={styles.highlightFeature}>
                  <Ionicons name="storefront" size={20} color={tokens.color.accent} />
                  <Text style={styles.highlightText}>Real furniture with pricing</Text>
                </View>
                <View style={styles.highlightFeature}>
                  <Ionicons name="download" size={20} color={tokens.color.accent} />
                  <Text style={styles.highlightText}>High-resolution downloads</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            onPress={handleContinueWithFree}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.color.bgSecondary, tokens.color.borderLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.freeTrialButton}
            >
              <Text style={styles.freeTrialButtonText}>
                Continue with 3 Free Designs
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.bottomText}>
            No credit card required • Upgrade anytime
          </Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
    backgroundColor: tokens.color.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.typography.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  freeCreditsContainer: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.borderLight,
    ...tokens.shadow.md,
  },
  creditsIcon: {
    marginBottom: tokens.spacing.sm,
  },
  freeCreditsText: {
    ...tokens.typography.h4,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xs,
  },
  creditsHighlight: {
    color: tokens.color.brand,
    fontWeight: '700',
  },
  freeCreditsSubtext: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: tokens.spacing.xxxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 2,
    borderColor: tokens.color.border,
    position: 'relative',
    ...tokens.shadow.md,
  },
  popularPlan: {
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.bgSurface,
    ...tokens.shadow.lg,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: tokens.spacing.lg,
    backgroundColor: tokens.color.brand,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.sm,
  },
  savingsText: {
    ...tokens.typography.caption,
    fontWeight: '600',
    color: tokens.color.textInverse,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  planName: {
    ...tokens.typography.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: tokens.spacing.xs,
  },
  planPrice: {
    ...tokens.typography.h1,
    color: tokens.color.brand,
    fontWeight: '700',
  },
  planPeriod: {
    ...tokens.typography.body,
    color: tokens.color.textSecondary,
    marginLeft: tokens.spacing.xs,
  },
  planDesigns: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: tokens.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  featureText: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  selectButton: {
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    ...tokens.shadow.md,
  },
  selectButtonText: {
    ...tokens.typography.button,
    color: tokens.color.accent,
    fontWeight: '600',
  },
  highlightContainer: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.color.borderLight,
    ...tokens.shadow.sm,
  },
  highlightTitle: {
    ...tokens.typography.h4,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  highlightFeatures: {
    gap: tokens.spacing.md,
  },
  highlightFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textSecondary,
    marginLeft: tokens.spacing.md,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderLight,
  },
  freeTrialButton: {
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.borderWarm,
    ...tokens.shadow.sm,
  },
  freeTrialButtonText: {
    ...tokens.typography.button,
    color: tokens.color.textPrimary,
    textAlign: 'center',
  },
  bottomText: {
    ...tokens.typography.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  
  // Authentication Modal Styles
  authOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.color.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  authModal: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xxl,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.85,
    ...tokens.shadow.lg,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderLight,
  },
  authTitle: {
    ...tokens.typography.h4,
    color: tokens.color.textPrimary,
    flex: 1,
    paddingRight: tokens.spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authContent: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  socialAuthSection: {
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  socialAuthTitle: {
    ...tokens.typography.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.bgSurface,
    borderWidth: 1.5,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.sm,
  },
  socialButtonText: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.md,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.color.borderLight,
  },
  dividerText: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textMuted,
    paddingHorizontal: tokens.spacing.lg,
  },
  emailAuthSection: {
    paddingBottom: tokens.spacing.xl,
  },
  inputLabel: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
    fontWeight: '500',
  },
  emailInput: {
    backgroundColor: tokens.color.bgSecondary,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xl,
  },
  authButton: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.md,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: {
    ...tokens.typography.button,
    color: tokens.color.accent,
    fontWeight: '600',
  },
  toggleAuthMode: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
  },
  toggleAuthText: {
    ...tokens.typography.bodySmall,
    color: tokens.color.brand,
    fontWeight: '500',
  },
  termsText: {
    ...tokens.typography.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
  },
});

export default PaywallScreen;