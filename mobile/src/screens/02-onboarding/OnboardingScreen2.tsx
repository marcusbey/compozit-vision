import React, { useRef, useEffect, useState } from 'react';
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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design Tokens - Unified Design System
const tokens = {
  color: {
    bgApp: '#FBF9F4',          // Warm beige background
    bgSecondary: '#F5F1E8',    // Slightly darker warm beige
    accent: '#2D2B28',         // Warm dark accent
    textPrimary: '#2D2B28',    // Warm dark text
    textSecondary: '#8B7F73',  // Warm gray for secondary text
    textTertiary: '#B8AFA4',   // Muted warm gray for tertiary text
    border: '#E6DDD1',         // Warm light border
    surface: '#FEFEFE',        // Soft white for cards
    success: '#7FB069',        // Green for success states
    warning: '#F2CC8F',        // Warm amber for warnings
    brand: '#D4A574',          // Brand color
    brandLight: '#E8C097',     // Light brand color
    brandDark: '#B8935F',      // Dark brand color
    accent20: 'rgba(45, 43, 40, 0.2)',  // 20% accent
    accent10: 'rgba(45, 43, 40, 0.1)',  // 10% accent
    accent05: 'rgba(45, 43, 40, 0.05)', // 5% accent
    scrim: 'rgba(45, 43, 40, 0.45)',    // Warm scrim
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
    h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
    caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 25,
  },
  shadow: {
    e1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    e2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    e3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

const { width, height } = Dimensions.get('window');

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Remove hardcoded styles - now using database-driven content

interface OnboardingScreen2Props {
  onNext?: () => void;
  onBack?: () => void;
  navigation?: any;
  route?: any;
}

// Design showcase data
const designExamples = [
  {
    id: 1,
    title: 'Modern Living Room',
    style: 'Clean lines, minimalist furniture',
    image: '🛋️',
    backgroundColor: '#F5F1E8',
  },
  {
    id: 2,
    title: 'Cozy Bedroom',
    style: 'Warm colors, soft textures',
    image: '🛏️',
    backgroundColor: '#E8F2F5',
  },
  {
    id: 3,
    title: 'Elegant Kitchen',
    style: 'Smart layouts, premium finishes',
    image: '🍽️',
    backgroundColor: '#F0F8F0',
  },
  {
    id: 4,
    title: 'Home Office',
    style: 'Productive workspace design',
    image: '💻',
    backgroundColor: '#FFF4E6',
  },
];

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onBack }) => {
  const [currentDesignIndex, setCurrentDesignIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const aiPulseAnim = useRef(new Animated.Value(1)).current;
  const pointingAnim = useRef(new Animated.Value(0)).current;
  const designSlideAnim = useRef(new Animated.Value(0)).current;
  
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Initial animation
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

    // AI assistant pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(aiPulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Pointing gesture animation
    const pointingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pointingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pointingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pointingAnimation.start();

    // Auto-slide design examples
    const slideTimer = setInterval(() => {
      setCurrentDesignIndex((prev) => (prev + 1) % designExamples.length);
    }, 3000);

    return () => {
      pulseAnimation.stop();
      pointingAnimation.stop();
      clearInterval(slideTimer);
    };
  }, []);

  // Animate design transitions
  useEffect(() => {
    Animated.spring(designSlideAnim, {
      toValue: currentDesignIndex * -width * 0.8,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [currentDesignIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      
      <View style={styles.gradient}>
        {/* Video Background */}
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={[
              'rgba(45, 43, 40, 0.8)',
              'rgba(45, 43, 40, 0.6)',
              'rgba(45, 43, 40, 0.9)'
            ]}
            locations={[0, 0.5, 1]}
            style={styles.videoGradientOverlay}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding1')} style={styles.backButton} testID="back-button">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressText}>2 of 4</Text>
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
            {/* Credits Introduction */}
            <View style={styles.creditsIntro}>
              <View style={styles.creditsIcon}>
                <Ionicons name="star" size={24} color={tokens.color.brand} />
              </View>
              <Text style={styles.creditsText}>
                You get <Text style={styles.creditsHighlight}>3 free designs</Text> to start
              </Text>
            </View>

            <Text style={styles.title}>Meet Your AI Design Assistant</Text>
            
            <Text style={styles.subtitle}>
              Our AI analyzes your space and creates personalized interior designs in any style you love.
            </Text>

            {/* AI Assistant and Design Showcase */}
            <View style={styles.showcaseContainer}>
              {/* AI Assistant Portrait */}
              <Animated.View 
                style={[
                  styles.aiAssistant,
                  {
                    transform: [{ scale: aiPulseAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={[tokens.color.brandLight, tokens.color.brand]}
                  style={styles.aiAvatarGradient}
                >
                  <Ionicons name="sparkles" size={40} color={tokens.color.textPrimary} />
                </LinearGradient>
                
                {/* Pointing Gesture */}
                <Animated.View
                  style={[
                    styles.pointingArrow,
                    {
                      opacity: pointingAnim,
                      transform: [
                        { 
                          translateX: pointingAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 20]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Ionicons name="arrow-forward" size={24} color={tokens.color.brand} />
                </Animated.View>
              </Animated.View>

              {/* Design Examples Showcase */}
              <View style={styles.designShowcase}>
                <View style={styles.showcaseImageContainer}>
                  <View style={styles.mockInteriorImage}>
                    {/* Using Unsplash-style interior design placeholder */}
                    <LinearGradient
                      colors={['#F5F1E8', '#E8DDD1']}
                      style={styles.interiorGradient}
                    >
                      <View style={styles.roomElements}>
                        <View style={[styles.window, { backgroundColor: '#D4A574' }]} />
                        <View style={[styles.sofa, { backgroundColor: tokens.color.brand }]} />
                        <View style={[styles.table, { backgroundColor: '#B8935F' }]} />
                        <View style={[styles.plant, { backgroundColor: '#7FB069' }]} />
                      </View>
                    </LinearGradient>
                    
                    {/* Floating design tag */}
                    <View style={styles.designTag}>
                      <Text style={styles.designTagText}>Modern Living</Text>
                    </View>
                  </View>
                </View>

                {/* Style indicators */}
                <View style={styles.styleIndicators}>
                  {designExamples.map((design, index) => (
                    <View
                      key={design.id}
                      style={[
                        styles.styleChip,
                        currentDesignIndex === index && styles.styleChipActive
                      ]}
                    >
                      <Text style={[
                        styles.styleChipText,
                        currentDesignIndex === index && styles.styleChipTextActive
                      ]}>
                        {design.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Enhanced Capabilities Section */}
            <View style={styles.capabilitiesContainer}>
              <Text style={styles.capabilitiesTitle}>What I can do for you</Text>
              
              <View style={styles.capabilitiesList}>
                <View style={styles.capabilityCard}>
                  <View style={styles.capabilityIcon}>
                    <Ionicons name="scan" size={24} color={tokens.color.success} />
                  </View>
                  <View style={styles.capabilityContent}>
                    <Text style={styles.capabilityTitle}>Smart Analysis</Text>
                    <Text style={styles.capabilityDescription}>
                      Analyze your room's layout and lighting conditions
                    </Text>
                  </View>
                </View>

                <View style={styles.capabilityCard}>
                  <View style={styles.capabilityIcon}>
                    <Ionicons name="color-palette" size={24} color={tokens.color.brand} />
                  </View>
                  <View style={styles.capabilityContent}>
                    <Text style={styles.capabilityTitle}>Style Matching</Text>
                    <Text style={styles.capabilityDescription}>
                      Match colors and design styles to your personal taste
                    </Text>
                  </View>
                </View>

                <View style={styles.capabilityCard}>
                  <View style={styles.capabilityIcon}>
                    <Ionicons name="storefront" size={24} color={tokens.color.accent20} />
                  </View>
                  <View style={styles.capabilityContent}>
                    <Text style={styles.capabilityTitle}>Budget Planning</Text>
                    <Text style={styles.capabilityDescription}>
                      Find furniture and decor that fits your budget perfectly
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Enhanced Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Call to Action Message */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Ready to Transform Your Space?</Text>
            <Text style={styles.ctaSubtitle}>
              Let's create your first AI-powered design together
            </Text>
          </View>

          {/* Enhanced Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding3')}
            activeOpacity={0.85}
          >
            <View style={styles.continueButtonContent}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#2D2B28" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.progressHint}>
            Step 2 of 4 • Discover the magic!
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background like other screens
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
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
    ...tokens.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  creditsIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
    ...tokens.shadow.e1,
  },
  creditsIcon: {
    marginRight: tokens.spacing.sm,
  },
  creditsText: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '500' as const,
  },
  creditsHighlight: {
    color: tokens.color.brand,
    fontWeight: '700' as const,
  },
  title: {
    ...tokens.typography.h1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    ...tokens.typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.color.textTertiary,
    textAlign: 'center',
  },
  styleOption: {
    width: (width - (tokens.spacing.xl * 2) - tokens.spacing.md) / 2,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.color.border,
    position: 'relative',
    ...tokens.shadow.e2,
  },
  styleOptionSelected: {
    borderColor: tokens.color.brand,
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  checkmark: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.brand,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    ...tokens.shadow.e2,
  },
  styleIconContainer: {
    marginBottom: tokens.spacing.md,
  },
  styleIcon: {
    fontSize: 32,
  },
  styleName: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  styleDescription: {
    ...tokens.typography.small,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  selectionCounter: {
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  counterText: {
    ...tokens.typography.body,
    color: tokens.color.brand,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.xs,
  },
  counterNote: {
    ...tokens.typography.caption,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  nextButtonContainer: {
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
    shadowColor: tokens.color.brand,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderRadius: 999,
  },
  nextButton: {
    borderRadius: 999,
    height: 54,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    paddingHorizontal: tokens.spacing.xl,
  },
  buttonText: {
    ...tokens.typography.bodyLarge,
    fontWeight: '600' as const,
    color: tokens.color.textPrimary,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    ...tokens.typography.caption,
    color: tokens.color.textTertiary,
    textAlign: 'center',
  },
  // New showcase styles
  showcaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.md,
  },
  aiAssistant: {
    alignItems: 'center',
    marginRight: tokens.spacing.xl,
  },
  aiAvatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.e3,
  },
  pointingArrow: {
    position: 'absolute',
    right: -30,
    top: 35,
  },
  designShowcase: {
    flex: 1,
    marginLeft: tokens.spacing.xl,
  },
  showcaseImageContainer: {
    width: width * 0.55,
    height: 180,
  },
  mockInteriorImage: {
    width: '100%',
    height: '100%',
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...tokens.shadow.e3,
  },
  interiorGradient: {
    flex: 1,
    padding: tokens.spacing.lg,
    justifyContent: 'space-between',
  },
  roomElements: {
    flex: 1,
    justifyContent: 'space-between',
  },
  window: {
    width: '60%',
    height: 30,
    borderRadius: tokens.radius.sm,
    alignSelf: 'center',
    opacity: 0.9,
  },
  sofa: {
    width: '80%',
    height: 40,
    borderRadius: tokens.radius.md,
    alignSelf: 'flex-start',
    marginLeft: tokens.spacing.md,
    opacity: 0.8,
  },
  table: {
    width: '40%',
    height: 25,
    borderRadius: tokens.radius.sm,
    alignSelf: 'center',
    opacity: 0.7,
  },
  plant: {
    width: 20,
    height: 35,
    borderRadius: tokens.radius.sm,
    alignSelf: 'flex-end',
    marginRight: tokens.spacing.lg,
    opacity: 0.9,
  },
  designTag: {
    position: 'absolute',
    bottom: tokens.spacing.md,
    left: tokens.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.e2,
  },
  designTagText: {
    ...tokens.typography.caption,
    color: tokens.color.textPrimary,
    fontWeight: '600' as const,
  },
  styleIndicators: {
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  styleChip: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  styleChipActive: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
  },
  styleChipText: {
    ...tokens.typography.small,
    color: tokens.color.brand,
    fontWeight: '500' as const,
  },
  styleChipTextActive: {
    color: tokens.color.textPrimary,
    fontWeight: '600' as const,
  },
  // Enhanced capabilities styles
  capabilitiesContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  capabilitiesTitle: {
    ...tokens.typography.h2,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    fontWeight: '600' as const,
  },
  capabilitiesList: {
    gap: tokens.spacing.lg,
  },
  capabilityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.border,
    ...tokens.shadow.e1,
  },
  capabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  capabilityContent: {
    flex: 1,
    paddingTop: tokens.spacing.xs,
  },
  capabilityTitle: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.xs,
  },
  capabilityDescription: {
    ...tokens.typography.caption,
    color: tokens.color.textSecondary,
    lineHeight: 18,
  },
  // Enhanced bottom section styles
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl, // Extra padding for safe area
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  ctaTitle: {
    ...tokens.typography.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaSubtitle: {
    ...tokens.typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 28,
    height: 56,
    marginBottom: tokens.spacing.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  continueButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2D2B28',
  },
  progressHint: {
    ...tokens.typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '500' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default OnboardingScreen2;