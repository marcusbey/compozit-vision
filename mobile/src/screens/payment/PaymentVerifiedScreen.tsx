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
import { tokens } from '@theme';

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

      // If authenticated, go to main app with tabs
      // If not, go to auth link screen
      if (isAuthenticated) {
        NavigationHelpers.resetToScreen('mainApp');
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
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} translucent={false} />
      
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
              colors={[tokens.colors.status.success, '#6B9B5A']}
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
                <Ionicons name="checkmark" size={60} color={tokens.colors.text.inverse} />
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
              <Ionicons name="flash" size={20} color={tokens.colors.primary.DEFAULT} />
              <Text style={styles.benefitText}>Unlimited AI design generations</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="rocket" size={20} color={tokens.colors.primary.DEFAULT} />
              <Text style={styles.benefitText}>Priority processing & faster results</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="color-palette" size={20} color={tokens.colors.primary.DEFAULT} />
              <Text style={styles.benefitText}>Access to all styles & references</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="cloud-download" size={20} color={tokens.colors.primary.DEFAULT} />
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
    backgroundColor: tokens.colors.background.primary,
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
    ...tokens.shadows.elevation3,
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
    backgroundColor: tokens.colors.primary.DEFAULT,
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  title: {
    ...tokens.typography.display,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  benefitsCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    width: '100%',
    ...tokens.shadows.elevation2,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  benefitsTitle: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  benefitText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  orderDetails: {
    backgroundColor: `${tokens.colors.primary.DEFAULT}10`,
    borderRadius: tokens.borderRadius.md,
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
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  orderValue: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: tokens.borderRadius.pill,
    overflow: 'hidden',
    ...tokens.shadows.elevation2,
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
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    textDecorationLine: 'underline',
  },
});

export default PaymentVerifiedScreen;