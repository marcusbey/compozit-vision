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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { PLAN_TIERS, PlanTier, PlanTierId } from '../../config/planTiers';

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    scrim: "rgba(28,28,28,0.45)",
    success: "#4CAF50",
    warning: "#FF9800",
    info: "#2196F3",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

const { width, height } = Dimensions.get('window');

interface PlanSelectionScreenProps {
  navigation?: any;
  route?: any;
}

const PlanSelectionScreen: React.FC<PlanSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTierId>('pro');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const journeyStore = useJourneyStore();

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

  const handlePlanSelect = (planId: PlanTierId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    // Store selected plan in journey
    journeyStore.updatePlanSelection({
      selectedPlanTier: selectedPlan,
      planName: PLAN_TIERS[selectedPlan].name,
      planPrice: PLAN_TIERS[selectedPlan].monthlyPrice,
    });
    
    journeyStore.completeStep('planSelection');
    
    // Navigate to payment frequency screen
    NavigationHelpers.navigateToScreen('paymentFrequency', {
      selectedPlan: PLAN_TIERS[selectedPlan]
    });
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      NavigationHelpers.navigateToScreen('onboarding3');
    }
  };

  const renderPlanCard = (plan: PlanTier, index: number) => {
    const isSelected = selectedPlan === plan.id;
    const delay = index * 100;

    return (
      <Animated.View
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [delay, delay + 50],
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePlanSelect(plan.id)}
          activeOpacity={0.9}
          style={styles.planCardTouchable}
        >
          {/* Popular/Best Value Badge */}
          {plan.badge && (
            <View style={[styles.badge, { backgroundColor: plan.color }]}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </View>
          )}

          {/* Plan Header */}
          <View style={styles.planHeader}>
            <View style={[styles.planIconContainer, { backgroundColor: `${plan.color}20` }]}>
              <Ionicons name={plan.icon as any} size={24} color={plan.color} />
            </View>
            <View style={styles.planTitleContainer}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>
            {isSelected && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
              </View>
            )}
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <Text style={[styles.price, { color: plan.color }]}>
              ${plan.monthlyPrice}
              <Text style={styles.priceUnit}>/month</Text>
            </Text>
            <Text style={styles.yearlyPrice}>
              or ${plan.yearlyPrice}/year (save 17%)
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {plan.features.map((feature, featureIndex) => (
              <View key={featureIndex} style={styles.featureItem}>
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={tokens.color.success} 
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Selection Border */}
          {isSelected && <View style={[styles.selectionBorder, { borderColor: plan.color }]} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>
            Select the perfect plan for your design needs
          </Text>
          <Text style={styles.subtitle}>
            All plans include AI-powered interior design generation with different limits and features
          </Text>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {Object.values(PLAN_TIERS).map((plan, index) => renderPlanCard(plan, index))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[tokens.color.accent, tokens.color.accent]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              Continue with {PLAN_TIERS[selectedPlan].name}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    backgroundColor: tokens.color.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxl,
  },
  title: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  plansContainer: {
    gap: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl,
  },
  planCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.e2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPlanCard: {
    ...tokens.shadow.e3,
  },
  planCardTouchable: {
    padding: tokens.spacing.xl,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    zIndex: 1,
  },
  badgeText: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  planDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  checkmarkContainer: {
    marginLeft: tokens.spacing.sm,
  },
  pricingContainer: {
    marginBottom: tokens.spacing.lg,
  },
  price: {
    ...tokens.type.display,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: tokens.spacing.xs,
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: tokens.color.textMuted,
  },
  yearlyPrice: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  featuresContainer: {
    gap: tokens.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: tokens.spacing.sm,
    marginTop: 2,
  },
  featureText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    flex: 1,
  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    pointerEvents: 'none',
  },
  footer: {
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  continueButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
  },
});

export default PlanSelectionScreen;