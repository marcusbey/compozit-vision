import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import * as Haptics from 'expo-haptics';

// Import design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textMuted: "#9A9A9A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#7FB069",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
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
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

interface PaymentVerifiedScreenProps {
  navigation?: any;
  route?: any;
}

const PaymentVerifiedScreen: React.FC<PaymentVerifiedScreenProps> = ({ navigation, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  
  const journeyStore = useJourneyStore();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    // Update journey state
    journeyStore.updatePayment({
      requiresPayment: false,
      completedAt: new Date().toISOString(),
      amount: route?.params?.amount || 4999,
      currency: 'USD',
    });

    // Haptic feedback for success
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    try {
      // Reset journey for fresh start
      journeyStore.resetJourney();
      
      // Clear any saved journey progress to prevent resuming at wrong point
      await AsyncStorage.removeItem('savedJourneyProgress');
      await AsyncStorage.removeItem('currentJourneyScreen');
      
      // Initialize new project wizard session
      journeyStore.updateProjectWizard({
        currentWizardStep: 'category_selection',
        wizardStartedAt: new Date().toISOString(),
      });

      // Update progress to indicate start of project creation
      journeyStore.updateProgress({
        currentScreen: 'categorySelection',
        currentStep: 1,
        totalSteps: 8
      });

      console.log('🚀 Payment verified - starting fresh project wizard flow');

      // If authenticated, go directly to category selection
      // If not, go to auth link screen
      if (isAuthenticated) {
        NavigationHelpers.navigateToScreen('categorySelection');
      } else {
        NavigationHelpers.navigateToScreen('auth');
      }
    } catch (error) {
      console.error('❌ Error in payment verification flow:', error);
      // Fallback to category selection
      NavigationHelpers.navigateToScreen('categorySelection');
    }
  };

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 1],
  });

  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={[tokens.color.success, '#6B9B5A']}
              style={styles.successCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: checkScale }],
                  opacity: checkOpacity,
                }}
              >
                <Ionicons name="checkmark" size={60} color={tokens.color.textInverse} />
              </Animated.View>
            </LinearGradient>
            
            {/* Celebration particles */}
            <View style={styles.particlesContainer}>
              {[...Array(6)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      transform: [
                        {
                          translateX: checkAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, Math.sin(index) * 50],
                          }),
                        },
                        {
                          translateY: checkAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, Math.cos(index) * 50],
                          }),
                        },
                      ],
                      opacity: checkAnim.interpolate({
                        inputRange: [0, 0.8, 1],
                        outputRange: [0, 1, 0],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Success Message */}
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Welcome to Compozit Vision Premium
          </Text>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Your Premium Benefits:</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={20} color={tokens.color.brand} />
              <Text style={styles.benefitText}>Unlimited AI design generations</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="rocket" size={20} color={tokens.color.brand} />
              <Text style={styles.benefitText}>Priority processing & faster results</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="color-palette" size={20} color={tokens.color.brand} />
              <Text style={styles.benefitText}>Access to all styles & references</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="cloud-download" size={20} color={tokens.color.brand} />
              <Text style={styles.benefitText}>High-resolution downloads</Text>
            </View>
          </View>

          {/* Order Details */}
          {route?.params?.orderDetails && (
            <View style={styles.orderDetails}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Order ID:</Text>
                <Text style={styles.orderValue}>{route.params.orderDetails.orderId}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Plan:</Text>
                <Text style={styles.orderValue}>{route.params.orderDetails.planName}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Amount:</Text>
                <Text style={styles.orderValue}>{route.params.orderDetails.amount}</Text>
              </View>
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <View style={styles.continueButtonSolid}>
              <Text style={styles.continueButtonText}>Start Creating</Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color="#FFFFFF"
                style={styles.continueButtonIcon}
              />
            </View>
          </TouchableOpacity>

          {/* Support Link */}
          <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
            <Text style={styles.supportText}>
              Need help? Contact support
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: tokens.spacing.xxl,
    position: 'relative',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e3,
  },
  particlesContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.brand,
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  title: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.type.h3,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  benefitsCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    width: '100%',
    ...tokens.shadow.e2,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  benefitsTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  benefitText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  orderDetails: {
    backgroundColor: `${tokens.color.brand}10`,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    width: '100%',
    marginBottom: tokens.spacing.xxl,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  orderLabel: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  orderValue: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
    marginBottom: tokens.spacing.lg,
    width: '100%',
  },
  continueButtonSolid: {
    backgroundColor: '#C9A98C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xxxl,
    height: 56,
  },
  continueButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: tokens.spacing.sm,
  },
  continueButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
  supportLink: {
    padding: tokens.spacing.md,
  },
  supportText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textDecorationLine: 'underline',
  },
});

export default PaymentVerifiedScreen;