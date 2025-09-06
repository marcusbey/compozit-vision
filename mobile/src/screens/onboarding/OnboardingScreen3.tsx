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
import { tokens } from '@theme';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen3Props {
  onNext?: () => void;
  onBack?: () => void;
  navigation?: any;
  route?: any;
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
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      
      <View style={styles.gradient}>
        {/* Video Background - Human & AI Collaboration */}
        <View style={styles.videoBackground}>
          {/* Video placeholder for human-AI collaboration */}
          <LinearGradient
            colors={[
              'rgba(45, 43, 40, 0.85)',
              'rgba(45, 43, 40, 0.65)',
              'rgba(45, 43, 40, 0.9)'
            ]}
            locations={[0, 0.5, 1]}
            style={styles.videoGradientOverlay}
          />
          
          {/* Mock Human-AI Collaboration Visual */}
          <View style={styles.collaborationDemo}>
            <View style={styles.humanSide}>
              <View style={styles.humanAvatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.designElements}>
                <View style={styles.designElement} />
                <View style={[styles.designElement, styles.designElement2]} />
              </View>
            </View>
            
            <View style={styles.aiSide}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={24} color={tokens.colors.primary.light} />
              </View>
              <View style={styles.precisionGrid}>
                <View style={styles.measurementLine} />
                <View style={[styles.measurementLine, styles.measurementLine2]} />
                <View style={styles.accuracyIndicator} />
              </View>
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding2')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>3 of 4</Text>
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
                <Ionicons name="star" size={24} color={tokens.colors.primary.light} />
                <Text style={styles.badgeText}>Professional Grade</Text>
              </View>
            </Animated.View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Ready for{'\n'}Professional Results?</Text>
            </View>
            
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>
                Join thousands of real estate agents, designers, and architects who trust Compozit Vision for precision and accuracy.
              </Text>
            </View>

            {/* Professional Features - Precision & Accuracy Focus */}
            <View style={styles.featuresContainer}>
              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="scan-outline" size={28} color={tokens.colors.primary.light} />
                  </View>
                  <Text style={styles.featureTitle}>Millimeter-Precise Scanning</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Advanced AI scans detect exact room dimensions, lighting conditions, and spatial relationships with 98.5% accuracy
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="color-palette-outline" size={28} color={tokens.colors.primary.light} />
                  </View>
                  <Text style={styles.featureTitle}>Expert Color Matching</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Professional-grade color analysis ensures perfect palette coordination with existing elements and lighting
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="pricetags-outline" size={28} color={tokens.colors.primary.light} />
                  </View>
                  <Text style={styles.featureTitle}>Real-Time Price Alignment</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Instant price matching across 500+ retailers with live inventory and delivery tracking for perfect budget planning
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="library-outline" size={28} color={tokens.colors.primary.light} />
                  </View>
                  <Text style={styles.featureTitle}>Curated References Library</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Access thousands of professionally selected design references, textures, and style combinations for authentic results
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

            {/* Testimonials and social proof moved to screen 4 */}
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
            <Text style={styles.ctaTitle}>Professional-Grade AI Design</Text>
            <Text style={styles.ctaSubtext}>
              Experience millimeter-precise scanning and expert color matching
            </Text>
            <Text style={styles.ctaSubtext2}>
              Trusted by architects, designers & real estate professionals
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding4')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="camera" size={20} color={tokens.colors.text.primary} />
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
  collaborationDemo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    opacity: 0.4,
  },
  humanSide: {
    alignItems: 'center',
  },
  aiSide: {
    alignItems: 'center',
  },
  humanAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 165, 116, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  designElements: {
    width: 80,
    height: 100,
  },
  designElement: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 10,
    borderRadius: 4,
  },
  designElement2: {
    width: '70%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  precisionGrid: {
    width: 80,
    height: 100,
    position: 'relative',
  },
  measurementLine: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(212, 165, 116, 0.6)',
    marginBottom: 15,
  },
  measurementLine2: {
    width: '60%',
    backgroundColor: 'rgba(212, 165, 116, 0.4)',
  },
  accuracyIndicator: {
    position: 'absolute',
    right: 0,
    top: 20,
    width: 10,
    height: 10,
    backgroundColor: tokens.colors.primary.light,
    borderRadius: 5,
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
    backgroundColor: tokens.colors.primary.light,
    borderRadius: 2,
  },
  progressText: {
    fontSize: tokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  titleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    marginBottom: tokens.spacing['3xl'],
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
    borderRadius: tokens.borderRadius.xxl,
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: `${tokens.color.brand}30`,
    shadowColor: tokens.colors.primary.DEFAULT,
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
    fontSize: 32,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing['3xl'],
    lineHeight: 26,
    paddingHorizontal: tokens.spacing.md,
  },
  featuresContainer: {
    marginBottom: tokens.spacing['3xl'],
  },
  professionalFeature: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.borderRadius.xxl,
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  featureTitle: {
    fontSize: 18,
    color: tokens.colors.text.primary,
    fontWeight: '600' as const,
    flex: 1,
  },
  featureDescription: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 22,
    paddingLeft: tokens.spacing['6xl'],
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.xl,
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation1,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: tokens.colors.primary.DEFAULT,
    marginBottom: tokens.spacing.xs,
  },
  trustLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing['3xl'],
    paddingBottom: tokens.spacing['4xl'],
    backgroundColor: tokens.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing['2xl'],
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  ctaSubtext: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: tokens.spacing.xs,
  },
  ctaSubtext2: {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Testimonial and Social Proof Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.border.light,
  },
  dividerText: {
    fontSize: tokens.typography.small.fontSize,
    fontWeight: '500' as const,
    color: tokens.colors.text.secondary,
    marginHorizontal: tokens.spacing.lg,
  },
  testimonialContainer: {
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  testimonialCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.sm,
  },
  testimonialText: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: tokens.spacing.sm,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.color.textSecondary,
    fontWeight: '500' as const,
  },
  impactStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xs,
  },
  impactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  impactLabel: {
    fontSize: tokens.typography.small.fontSize,
    fontWeight: '600' as const,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  impactDetail: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  finalStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
    backgroundColor: tokens.colors.background.secondary,
    marginHorizontal: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.xl,
    paddingVertical: tokens.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  finalStat: {
    alignItems: 'center',
    flex: 1,
  },
  finalStatNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: tokens.colors.primary.DEFAULT,
    marginBottom: 2,
  },
  finalStatLabel: {
    fontSize: 12,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: tokens.colors.border.light,
  },

  nextButton: {
    borderRadius: tokens.borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
    shadowColor: tokens.colors.primary.DEFAULT,
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
    borderRadius: tokens.borderRadius.xxl,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: tokens.colors.text.primary,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default OnboardingScreen3;