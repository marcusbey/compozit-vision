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
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

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
    // Update journey store
    const selectedPlan = subscriptionPlans.find(p => p.id === planId);
    if (selectedPlan) {
      journeyStore.updateSubscription({
        selectedPlanId: planId,
        planName: selectedPlan.display_name,
        planPrice: `$${selectedPlan.price_amount}`,
        selectedAt: new Date().toISOString()
      });
    }
    
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      // Navigate to checkout when no callback provided
      NavigationHelpers.navigateToScreen('checkout');
    }
  };

  const handleContinueWithFree = () => {
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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                <Ionicons name="gift" size={24} color="#FFD700" />
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
                    activeOpacity={0.8}
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
                        <Ionicons name="checkmark-circle" size={20} color="#4facfe" />
                        <Text style={styles.featureText}>
                          {plan.description || 'Full access to AI design features'}
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4facfe" />
                        <Text style={styles.featureText}>
                          High-quality design generations
                        </Text>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4facfe" />
                        <Text style={styles.featureText}>
                          {plan.id === 'basic' ? 'Standard support' : 'Priority support'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>
                        {plan.is_popular ? 'Choose Pro' : `Choose ${plan.display_name}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Features Highlight */}
            <View style={styles.highlightContainer}>
              <Text style={styles.highlightTitle}>What you get with any plan:</Text>
              <View style={styles.highlightFeatures}>
                <View style={styles.highlightFeature}>
                  <Ionicons name="flash" size={20} color="#4facfe" />
                  <Text style={styles.highlightText}>AI-powered design generation</Text>
                </View>
                <View style={styles.highlightFeature}>
                  <Ionicons name="storefront" size={20} color="#4facfe" />
                  <Text style={styles.highlightText}>Real furniture with pricing</Text>
                </View>
                <View style={styles.highlightFeature}>
                  <Ionicons name="download" size={20} color="#4facfe" />
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
            style={styles.freeTrialButton}
            onPress={handleContinueWithFree}
            activeOpacity={0.8}
          >
            <Text style={styles.freeTrialButtonText}>
              Continue with 3 Free Designs
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.bottomText}>
            No credit card required • Upgrade anytime
          </Text>
        </Animated.View>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b8c6db',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  freeCreditsContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  creditsIcon: {
    marginBottom: 8,
  },
  freeCreditsText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  creditsHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  freeCreditsSubtext: {
    fontSize: 14,
    color: '#b8c6db',
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#4facfe',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4facfe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4facfe',
  },
  planPeriod: {
    fontSize: 16,
    color: '#b8c6db',
    marginLeft: 4,
  },
  planDesigns: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  highlightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  highlightFeatures: {
    gap: 12,
  },
  highlightFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 15,
    color: '#b8c6db',
    marginLeft: 12,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  freeTrialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  freeTrialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomText: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default PaywallScreen;