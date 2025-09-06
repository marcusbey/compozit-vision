import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { tokens } from '@theme';

interface PaymentPendingScreenProps {
  navigation?: any;
  route?: any;
}

const PaymentPendingScreen: React.FC<PaymentPendingScreenProps> = ({ navigation, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');
  
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Update journey state
    journeyStore.updatePayment({
      requiresPayment: true,
      paymentMethod: (route?.params?.provider as 'stripe' | 'apple') || 'stripe',
      paymentIntentId: route?.params?.paymentIntentId,
    });

    // Entrance animations
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
    ]).start();

    // Continuous rotation for loading icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Animated dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Simulate payment processing (in real app, this would poll payment status)
    const timeout = setTimeout(() => {
      // Navigate to payment verified
      NavigationHelpers.navigateToScreen('paymentVerified');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} translucent={false} />
      
      <LinearGradient
        colors={[tokens.colors.background.primary, '#F7F3ED']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.centerContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Processing Icon */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconWrapper,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <View style={styles.iconOuter}>
                  <View style={styles.iconInner}>
                    <Ionicons name="card" size={32} color={tokens.colors.primary.DEFAULT} />
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Processing Payment{dots}</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              Please wait while we securely process your payment.
              This usually takes just a few seconds.
            </Text>

            {/* Loading Indicator */}
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.colors.primary.DEFAULT} />
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="lock-closed" size={16} color={tokens.colors.status.success} />
              <Text style={styles.securityText}>
                Your payment is secured with 256-bit encryption
              </Text>
            </View>

            {/* Payment Details */}
            {route?.params?.planDetails && (
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{route.params.planDetails.name}</Text>
                <Text style={styles.planPrice}>{route.params.planDetails.price}</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  centerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.elevation2,
    borderWidth: 3,
    borderColor: tokens.colors.primary.DEFAULT,
    borderStyle: 'dashed',
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${tokens.colors.primary.DEFAULT}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...tokens.typography.heading.h1,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  description: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.xxl,
  },
  loadingContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tokens.colors.status.success}15`,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius.pill,
    marginBottom: tokens.spacing.xl,
  },
  securityText: {
    ...tokens.typography.small,
    color: tokens.colors.status.success,
    marginLeft: tokens.spacing.sm,
    fontWeight: '500',
  },
  planDetails: {
    backgroundColor: tokens.colors.background.secondary,
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    ...tokens.shadow.e2,
    alignItems: 'center',
    minWidth: 200,
  },
  planName: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  planPrice: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
  },
});

export default PaymentPendingScreen;