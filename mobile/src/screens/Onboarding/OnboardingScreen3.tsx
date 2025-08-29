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
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design tokens for consistent theming
const tokens = {
  color: {
    bgApp: '#FBF9F4',         // Warm beige background
    bgSurface: '#FEFEFE',     // Soft white for cards
    accent: '#2D2B28',        // Dark accent
    accentSoft: '#5A564F',    // Lighter accent for hover states
    textPrimary: '#2D2B28',   // Warm dark text
    textSecondary: '#8B7F73', // Warm gray
    textTertiary: '#B8AFA4',  // Muted warm gray
    border: '#E6DDD1',        // Warm light border
    shadow: '#000000',        // Shadow color
    brand: '#D4A574',         // Brand color
    brandLight: '#E8C097',    // Light brand color
    brandDark: '#B8935F',     // Dark brand color
    success: '#7FB069',       // Warmer green for positive states
    warning: '#F2CC8F',       // Warm orange for warnings
    blue: '#7FB069',          // Using warmer blue-green for highlights
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 999,
  },
  shadow: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

const { width, height } = Dimensions.get('window');

interface OnboardingScreen3Props {
  onNext?: () => void;
  onBack?: () => void;
}

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onNext, onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding2')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>3 of 3</Text>
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
            {/* Professional Badge */}
            <Animated.View 
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.professionalBadge}>
                <Ionicons name="star" size={24} color={tokens.color.brand} />
                <Text style={styles.badgeText}>Professional Grade</Text>
              </View>
            </Animated.View>

            <Text style={styles.title}>Ready for{'\n'}Professional Results?</Text>
            
            <Text style={styles.subtitle}>
              Join thousands of real estate agents, designers, and architects who trust Compozit Vision for their projects.
            </Text>

            {/* Professional Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="scan-outline" size={28} color={tokens.color.blue} />
                  </View>
                  <Text style={styles.featureTitle}>Advanced Room Analysis</Text>
                </View>
                <Text style={styles.featureDescription}>
                  AI detects room type, dimensions, lighting, and existing furniture with 95% accuracy
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="color-palette-outline" size={28} color={tokens.color.blue} />
                  </View>
                  <Text style={styles.featureTitle}>Style Customization</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Choose multiple design styles, furniture preferences, and custom atmosphere settings
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="storefront-outline" size={28} color={tokens.color.blue} />
                  </View>
                  <Text style={styles.featureTitle}>Smart Product Matching</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Get exact furniture matches with prices, availability, and purchase links from trusted retailers
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="calculator-outline" size={28} color={tokens.color.blue} />
                  </View>
                  <Text style={styles.featureTitle}>Budget Planning</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Detailed cost breakdowns by category with budget optimization suggestions
                </Text>
              </View>
            </View>

            {/* Trust Indicators */}
            <View style={styles.trustContainer}>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>50K+</Text>
                <Text style={styles.trustLabel}>Designs Created</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>4.9★</Text>
                <Text style={styles.trustLabel}>User Rating</Text>
              </View>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>98%</Text>
                <Text style={styles.trustLabel}>Satisfaction</Text>
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
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaTitle}>Start Your First Design</Text>
            <Text style={styles.ctaSubtext}>
              Use your 3 free credits to experience professional-grade AI design
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('paywall')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.color.brandLight, tokens.color.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="camera" size={20} color={tokens.color.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            No credit card required • Cancel anytime
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
  gradient: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: tokens.color.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
    ...tokens.shadow.sm,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.border,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    fontWeight: tokens.typography.fontWeight.medium as any,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing['3xl'],
    paddingBottom: tokens.spacing.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing['3xl'],
  },
  professionalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius['3xl'],
    backgroundColor: tokens.color.bgSurface,
    borderWidth: 1,
    borderColor: `${tokens.color.brand}30`,
    shadowColor: tokens.color.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.fontSize['4xl'],
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
    lineHeight: tokens.typography.fontSize['4xl'] * tokens.typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing['3xl'],
    lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.relaxed,
    paddingHorizontal: tokens.spacing.md,
  },
  featuresContainer: {
    marginBottom: tokens.spacing['3xl'],
  },
  professionalFeature: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.border,
    ...tokens.shadow.sm,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.borderRadius['3xl'],
    backgroundColor: `${tokens.color.blue}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  featureTitle: {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.color.textPrimary,
    fontWeight: tokens.typography.fontWeight.semiBold as any,
    flex: 1,
  },
  featureDescription: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.textSecondary,
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
    paddingLeft: tokens.spacing['6xl'],
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.borderRadius.xl,
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.border,
    ...tokens.shadow.sm,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.color.brand,
    marginBottom: tokens.spacing.xs,
  },
  trustLabel: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing['3xl'],
    paddingBottom: tokens.spacing['4xl'],
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing['2xl'],
  },
  ctaTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  ctaSubtext: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
  },
  nextButton: {
    borderRadius: tokens.borderRadius['3xl'],
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
    shadowColor: tokens.color.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing['3xl'],
    borderRadius: tokens.borderRadius['3xl'],
  },
  buttonText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semiBold as any,
    color: tokens.color.textPrimary,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.textTertiary,
    textAlign: 'center',
  },
});

export default OnboardingScreen3;