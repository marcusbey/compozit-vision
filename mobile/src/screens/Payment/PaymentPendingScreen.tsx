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
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

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
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <LinearGradient
        colors={[tokens.color.bgApp, '#F7F3ED']}
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
                    <Ionicons name="card" size={32} color={tokens.color.brand} />
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
              <ActivityIndicator size="large" color={tokens.color.brand} />
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="lock-closed" size={16} color={tokens.color.success} />
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
    backgroundColor: tokens.color.bgApp,
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
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
    borderWidth: 3,
    borderColor: tokens.color.brand,
    borderStyle: 'dashed',
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${tokens.color.brand}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  description: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
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
    backgroundColor: `${tokens.color.success}15`,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.pill,
    marginBottom: tokens.spacing.xl,
  },
  securityText: {
    ...tokens.type.small,
    color: tokens.color.success,
    marginLeft: tokens.spacing.sm,
    fontWeight: '500',
  },
  planDetails: {
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.e2,
    alignItems: 'center',
    minWidth: 200,
  },
  planName: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.xs,
  },
  planPrice: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
});

export default PaymentPendingScreen;