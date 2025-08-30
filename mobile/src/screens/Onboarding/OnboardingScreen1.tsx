import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Import design tokens from the style guide
import designTokens from '../../../@STYLE-GUIDE.json';

// Design System Tokens
const tokens = {
  color: designTokens.tokens.color,
  spacing: designTokens.tokens.spacing,
  radius: designTokens.tokens.radius,
  shadow: designTokens.tokens.shadow,
  typography: designTokens.tokens.typography,
  components: designTokens.components,
};

const { width, height } = Dimensions.get('window');

interface OnboardingScreen1Props {
  navigation?: any;
  route?: any;
  onNext?: () => void;
}

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext }) => {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={tokens.components.onboarding.backgroundGradient.colors}
        start={tokens.components.onboarding.backgroundGradient.start}
        end={tokens.components.onboarding.backgroundGradient.end}
        style={styles.backgroundGradient}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Video Background Placeholder with enhanced gradient */}
        <View style={styles.videoBackground}>
          <LinearGradient
            colors={[
              tokens.color.scrim,
              'rgba(26, 24, 22, 0.35)',
              tokens.color.scrimHeavy
            ]}
            locations={[0, 0.5, 1]}
            style={styles.videoGradientOverlay}
          />
          
          {/* Enhanced Before/After Transition */}
          <View style={styles.beforeAfterDemo}>
            <View style={styles.beforeRoom}>
              <View style={styles.roomElement} />
              <View style={[styles.roomElement, styles.roomElement2]} />
            </View>
            <View style={styles.afterRoom}>
              <View style={[styles.roomElement, styles.enhanced]} />
              <View style={[styles.roomElement, styles.roomElement2, styles.enhanced]} />
            </View>
          </View>
        </View>

        {/* Enhanced Progress Indicator */}
        <View style={[styles.progressContainer, { paddingTop: insets.top + 20 }]}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={tokens.components.onboarding.progressBar.fillGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '25%' }]}
            />
          </View>
          <Text style={styles.progressText}>1 of 4</Text>
        </View>

        {/* Enhanced Hero Visual */}
        <Animated.View 
          style={[
            styles.heroContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.aiVisualization}>
            <LinearGradient
              colors={tokens.components.onboarding.featureIcon.gradientColors}
              start={tokens.components.onboarding.featureIcon.gradientStart}
              end={tokens.components.onboarding.featureIcon.gradientEnd}
              style={styles.aiCircle}
            >
              <Ionicons name="camera" size={32} color={tokens.color.textInverse} />
            </LinearGradient>
            <View style={styles.sparkles}>
              <Ionicons name="sparkles" size={20} color={tokens.color.brandLight} style={[styles.sparkle, styles.sparkle1]} />
              <Ionicons name="sparkles" size={16} color={tokens.color.brand} style={[styles.sparkle, styles.sparkle2]} />
              <Ionicons name="sparkles" size={18} color={tokens.color.brandLight} style={[styles.sparkle, styles.sparkle3]} />
            </View>
          </View>
        </Animated.View>

        {/* Content - Positioned for video background */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Enhanced Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>AI-Powered Design{'\n'}at Your Fingertips</Text>
          </View>
          
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Transform any space with professional interior design using just your phone's camera
            </Text>
          </View>

          {/* Enhanced Features with Glass Morphism */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <LinearGradient
                colors={tokens.components.onboarding.featureIcon.gradientColors}
                start={tokens.components.onboarding.featureIcon.gradientStart}
                end={tokens.components.onboarding.featureIcon.gradientEnd}
                style={styles.featureIcon}
              >
                <Ionicons name="scan" size={22} color={tokens.color.brand} />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Room Analysis</Text>
                <Text style={styles.featureText}>AI detects room type, dimensions, and existing furniture automatically</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <LinearGradient
                colors={tokens.components.onboarding.featureIcon.gradientColors}
                start={tokens.components.onboarding.featureIcon.gradientStart}
                end={tokens.components.onboarding.featureIcon.gradientEnd}
                style={styles.featureIcon}
              >
                <Ionicons name="color-palette" size={22} color={tokens.color.brand} />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Professional Styles</Text>
                <Text style={styles.featureText}>Choose from curated design styles by interior design experts</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <LinearGradient
                colors={tokens.components.onboarding.featureIcon.gradientColors}
                start={tokens.components.onboarding.featureIcon.gradientStart}
                end={tokens.components.onboarding.featureIcon.gradientEnd}
                style={styles.featureIcon}
              >
                <Ionicons name="flash" size={22} color={tokens.color.brand} />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Results</Text>
                <Text style={styles.featureText}>Generate stunning designs in seconds, not hours</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Action Container */}
      <Animated.View 
        style={[
          styles.fixedBottomContainer,
          { paddingBottom: insets.bottom + 20 },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.nextButtonContainer}
          onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding2')}
          activeOpacity={tokens.components.button.primary.pressedOpacity}
          testID="continue-button"
        >
          <LinearGradient
            colors={tokens.components.button.primary.gradientColors}
            start={tokens.components.button.primary.gradientStart}
            end={tokens.components.button.primary.gradientEnd}
            style={styles.nextButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={tokens.components.button.primary.textColor} />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.skipText}>
          Join thousands of users transforming their spaces
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 140, // Add padding for fixed bottom container
  },
  // Enhanced video background styles
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height, // Use specific height instead of bottom: 0
    backgroundColor: tokens.color.accent,
  },
  videoGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  beforeAfterDemo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.2,
  },
  beforeRoom: {
    flex: 1,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
  },
  afterRoom: {
    flex: 1,
    height: 200,
    backgroundColor: `rgba(${tokens.color.brand.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`,
    margin: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
  },
  roomElement: {
    width: '60%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
  },
  roomElement2: {
    width: '40%',
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  enhanced: {
    backgroundColor: `rgba(${tokens.color.brand.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.6)`,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
    zIndex: 10,
  },
  progressBar: {
    height: tokens.components.onboarding.progressBar.height,
    backgroundColor: tokens.components.onboarding.progressBar.backgroundColor,
    borderRadius: tokens.components.onboarding.progressBar.borderRadius,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: tokens.components.onboarding.progressBar.borderRadius,
  },
  progressText: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight as any,
    color: tokens.color.textInverse,
    textAlign: 'center',
    opacity: 0.8,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxxl,
    zIndex: 10,
  },
  aiVisualization: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e3,
    shadowColor: tokens.color.accent,
    borderWidth: tokens.components.onboarding.featureIcon.borderWidth,
    borderColor: tokens.components.onboarding.featureIcon.borderColor,
  },
  sparkles: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 10,
    right: 5,
  },
  sparkle2: {
    bottom: 15,
    left: 10,
  },
  sparkle3: {
    top: 30,
    left: -5,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    minHeight: height * 0.6, // Set minimum height for proper content spacing
  },
  titleContainer: {
    ...tokens.components.onboarding.titleContainer,
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: tokens.typography.display.fontSize,
    lineHeight: tokens.typography.display.lineHeight,
    fontWeight: tokens.typography.display.fontWeight as any,
    color: tokens.color.textInverse,
    textAlign: 'center',
    textShadowColor: tokens.color.scrim,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    ...tokens.components.glassMorphism.dark,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    marginBottom: tokens.spacing.xxxl,
  },
  subtitle: {
    fontSize: tokens.typography.h3.fontSize,
    lineHeight: tokens.typography.h3.lineHeight,
    color: tokens.color.textInverse,
    textAlign: 'center',
    opacity: 0.95,
    textShadowColor: tokens.color.scrim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuresContainer: {
    width: '100%',
    ...tokens.components.onboarding.featureCard,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.sm,
  },
  featureIcon: {
    width: tokens.components.onboarding.featureIcon.size,
    height: tokens.components.onboarding.featureIcon.size,
    borderRadius: tokens.components.onboarding.featureIcon.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
    borderWidth: tokens.components.onboarding.featureIcon.borderWidth,
    borderColor: tokens.components.onboarding.featureIcon.borderColor,
    ...tokens.shadow.e2,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight as any,
    color: tokens.color.textInverse,
    marginBottom: 4,
    textShadowColor: tokens.color.scrim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureText: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.color.textInverse,
    opacity: 0.85,
    textShadowColor: tokens.color.scrim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    ...tokens.components.glassMorphism.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 20,
  },
  nextButtonContainer: {
    marginBottom: tokens.spacing.lg,
    ...tokens.components.button.primary,
    shadowColor: tokens.components.button.primary.shadowColor,
    shadowOpacity: tokens.components.button.primary.shadowOpacity,
    shadowRadius: tokens.components.button.primary.shadowRadius,
    shadowOffset: tokens.components.button.primary.shadowOffset,
    elevation: tokens.components.button.primary.elevation,
  },
  nextButton: {
    borderRadius: tokens.components.button.primary.borderRadius,
    height: tokens.components.button.primary.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  buttonText: {
    fontSize: tokens.components.button.primary.fontSize,
    fontWeight: tokens.components.button.primary.fontWeight as any,
    color: tokens.components.button.primary.textColor,
  },
  skipText: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.color.textInverse,
    textAlign: 'center',
    opacity: 0.7,
    textShadowColor: tokens.color.scrim,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default OnboardingScreen1;