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
    bgApp: '#FBF9F4',
    bgSurface: '#FEFEFE',
    accent: '#2D2B28',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textTertiary: '#B8AFA4',
    border: '#E6DDD1',
    brand: '#D4A574',
    brandLight: '#E8C097',
    brandDark: '#B8935F',
    success: '#7FB069',
    warning: '#F2CC8F',
  },
  typography: {
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

interface OnboardingScreen4Props {
  navigation?: any;
  route?: any;
  onNext?: () => void;
  onBack?: () => void;
}

const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({ onNext, onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      
      <View style={styles.gradient}>
        {/* Community Video Background */}
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={[
              'rgba(45, 43, 40, 0.8)',
              'rgba(45, 43, 40, 0.6)',
              'rgba(45, 43, 40, 0.85)'
            ]}
            locations={[0, 0.5, 1]}
            style={styles.videoGradientOverlay}
          />
          
          {/* Mock Community Engagement Visual */}
          <View style={styles.communityDemo}>
            <View style={styles.userProfiles}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
              <View style={[styles.userAvatar, styles.userAvatar2]}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
              <View style={[styles.userAvatar, styles.userAvatar3]}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={styles.successMetrics}>
              <View style={styles.metricBar} />
              <View style={[styles.metricBar, styles.metricBar2]} />
              <View style={[styles.metricBar, styles.metricBar3]} />
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding3')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>4 of 4</Text>
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
            {/* Community Badge */}
            <Animated.View 
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.communityBadge}>
                <Ionicons name="trending-up" size={24} color={tokens.color.brandLight} />
                <Text style={styles.badgeText}>Life-Changing Results</Text>
              </View>
            </Animated.View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Real People,{'\n'}Real Transformations</Text>
            </View>
            
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                See how our users have transformed their spaces and elevated their careers in real estate and interior design.
              </Text>
            </View>

            {/* User Impact Stories */}
            <View style={styles.featuresContainer}>
              <View style={styles.communityFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="trending-up" size={28} color={tokens.color.brandLight} />
                  </View>
                  <Text style={styles.featureTitle}>Career Transformations</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Real estate agents report 40% faster home sales after using our staging visualizations
                </Text>
              </View>

              <View style={styles.communityFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="heart" size={28} color={tokens.color.brandLight} />
                  </View>
                  <Text style={styles.featureTitle}>Home Makeovers</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Homeowners save an average of $3,200 by visualizing before buying furniture and decor
                </Text>
              </View>

              <View style={styles.communityFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="share" size={28} color={tokens.color.brandLight} />
                  </View>
                  <Text style={styles.featureTitle}>Word of Mouth</Text>
                </View>
                <Text style={styles.featureDescription}>
                  85% of our users recommend us to friends - that's how most people discover Compozit Vision
                </Text>
              </View>
            </View>

            {/* Social Proof */}
            <View style={styles.socialProofContainer}>
              <View style={styles.testimonialCard}>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons key={i} name="star" size={16} color={tokens.color.warning} />
                  ))}
                </View>
                <Text style={styles.testimonialText}>
                  "Helped me stage 3 homes this month - each sold 2 weeks faster than usual. My clients love the visualizations!"
                </Text>
                <Text style={styles.testimonialAuthor}>— Maria L, Real Estate Agent</Text>
              </View>
            </View>

            {/* Impact Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>$3.2K</Text>
                <Text style={styles.statLabel}>Avg. Saved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8★</Text>
                <Text style={styles.statLabel}>User Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Recommend</Text>
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
            <Text style={styles.ctaTitle}>Ready to Transform Your Space?</Text>
            <Text style={styles.ctaSubtext}>
              Start your first design and see why users love sharing our app with others
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('planSelection')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.color.brandLight, tokens.color.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color={tokens.color.accent} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            Start your transformation journey today
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  // Video background styles
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  videoGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  communityDemo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    opacity: 0.4,
  },
  userProfiles: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  userAvatar2: {
    backgroundColor: 'rgba(212, 165, 116, 0.3)',
  },
  userAvatar3: {
    backgroundColor: 'rgba(127, 176, 105, 0.3)',
  },
  successMetrics: {
    width: 120,
    alignItems: 'center',
  },
  metricBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(212, 165, 116, 0.6)',
    marginBottom: 10,
    borderRadius: 4,
  },
  metricBar2: {
    width: '80%',
    backgroundColor: 'rgba(127, 176, 105, 0.6)',
  },
  metricBar3: {
    width: '95%',
    backgroundColor: 'rgba(242, 204, 143, 0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brandLight,
    borderRadius: 2,
  },
  progressText: {
    fontSize: tokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: tokens.typography.fontWeight.medium as any,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing['3xl'],
    paddingBottom: tokens.spacing.xl,
    zIndex: 10,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing['3xl'],
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius['3xl'],
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: `${tokens.color.brandLight}30`,
  },
  badgeText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: '#FFFFFF',
    marginLeft: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: tokens.typography.fontSize['4xl'],
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: tokens.typography.fontSize['4xl'] * tokens.typography.lineHeight.tight,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    marginBottom: tokens.spacing['3xl'],
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.relaxed,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    marginBottom: tokens.spacing['3xl'],
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
  },
  communityFeature: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  featureTitle: {
    fontSize: tokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: tokens.typography.fontWeight.semiBold as any,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: tokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.relaxed,
    paddingLeft: tokens.spacing['6xl'],
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  socialProofContainer: {
    marginBottom: tokens.spacing['3xl'],
  },
  testimonialCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.md,
    justifyContent: 'center',
  },
  testimonialText: {
    fontSize: tokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  testimonialAuthor: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.brandLight,
    textAlign: 'center',
    fontWeight: tokens.typography.fontWeight.semiBold as any,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: tokens.borderRadius.xl,
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: tokens.color.brandLight,
    marginBottom: tokens.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: tokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing['3xl'],
    paddingBottom: tokens.spacing['4xl'],
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing['2xl'],
  },
  ctaTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold as any,
    color: '#FFFFFF',
    marginBottom: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaSubtext: {
    fontSize: tokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
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
    gap: tokens.spacing.sm,
  },
  buttonText: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semiBold as any,
    color: tokens.color.accent,
  },
  skipText: {
    fontSize: tokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default OnboardingScreen4;