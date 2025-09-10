import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import showcaseMasonryImages from '../../assets/masonry/galleryShowcase';
import StableMasonryGallery from '../../components/StableMasonryGallery';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen2Props {
  onNext?: () => void;
  onBack?: () => void;
  navigation?: any;
  route?: any;
}

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onBack, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const overlayAnim = useRef(new Animated.Value(1)).current; // full overlay at start
  const [overlayHidden, setOverlayHidden] = useState<boolean>(false);
  const [focusKey, setFocusKey] = useState<number>(0);
  const isFocused = useIsFocused();
  const progressRef = useRef<number>(0);

  const journeyStore = useJourneyStore();

  useFocusEffect(
    useCallback(() => {
      const hideOverlay = !!(route && route.params && route.params.hideOverlay);

      // Reset values on focus so animation always runs
      setFocusKey((k) => k + 1);
      overlayAnim.stopAnimation();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();

      overlayAnim.setValue(hideOverlay ? 0 : 1);
      setOverlayHidden(hideOverlay);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      const sequences: Animated.CompositeAnimation[] = [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          delay: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 900,
          delay: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ];

      if (!hideOverlay) {
        // Fade away the full-screen overlay to reveal the gradient + gallery
        sequences.push(
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 2000,
            delay: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        );
      }

      const animation = Animated.parallel(sequences);

      animation.start(() => {
        if (!hideOverlay) setOverlayHidden(true);
      });

      // Cleanup on blur: stop any running animations and ensure overlay is opaque again
      return () => {
        overlayAnim.stopAnimation(() => overlayAnim.setValue(hideOverlay ? 0 : 1));
        fadeAnim.stopAnimation(() => fadeAnim.setValue(0));
        slideAnim.stopAnimation(() => slideAnim.setValue(50));
        setOverlayHidden(hideOverlay);
      };
    }, [route])
  );

  return (
    <SafeAreaView edges={['left','right']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />

      <View style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding1')} style={styles.backButton} testID="back-button">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Full-screen dynamic Masonry */}
          <Animated.View
            style={[
              styles.gallerySection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Remount key to fix back/forward bug resetting state */}
            <StableMasonryGallery
              key={`masonry-${focusKey}`}
              autoPlay={true}
              showLabels={true}
              maxImages={40}
              images={showcaseMasonryImages}
              animationDuration={60000}
              isActive={isFocused}
              initialProgress={progressRef.current}
              onProgressChange={(v) => (progressRef.current = v)}
              height={height}
            />
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={[ 'transparent', tokens.colors.overlay.medium, tokens.colors.overlay.heavy ]}
                locations={[0, 0.5, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Startup overlay: fully opaque then fades out to reveal gradient */}
              {!overlayHidden && (
                <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tokens.colors.overlay.solid, opacity: overlayAnim }]} />
              )}
            </View>
            {/* Removed lower gradient overlay */}
          </Animated.View>

          {/* Bottom Half: Engaging Content */}
          <Animated.View
            style={[
              styles.contentSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Creative Headline */}
            <Animated.Text style={[
              styles.creativeTitle,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>Explore Endless Styles</Animated.Text>

            <Animated.Text style={[
              styles.engagingSubtitle,
              { opacity: fadeAnim, transform: [{ translateY: Animated.add(slideAnim, new Animated.Value(10)) }] }
            ]}>
              Compozit's AI transforms any space into your dream aesthetic — from modern minimalism to cozy bohemian vibes.
            </Animated.Text>

            {/* removed highlights */}

            {/* removed extra blocks to keep layout clean */}

            {/* Text only; button is positioned absolutely to match Screen 1 */}
          </Animated.View>
        </View>

        {/* Floating button positioned like Screen 1 */}
        <Animated.View
          style={[
            styles.buttonFloating,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
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
          {/* Removed progress hint */}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.deep,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing['2xl'],
    paddingBottom: tokens.spacing.sm,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {},
  progressBar: {},
  progressFill: {},
  progressText: {},
  mainContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  gallerySection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: tokens.spacing['5xl'],
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xl,
  },
  // Removed duplicate bottomContainer (kept the styled translucent one below)
  nextButtonContainer: {
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
    shadowColor: tokens.colors.primary.DEFAULT,
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
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    color: tokens.colors.text.primary,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
    backgroundColor: 'transparent',
  },
  lowerGradient: {},
  ctaSection: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  ctaTitle: {
    fontSize: tokens.typography.heading.h2.fontSize,
    lineHeight: tokens.typography.heading.h2.lineHeight,
    fontWeight: tokens.typography.heading.h2.fontWeight,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaSubtitle: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: tokens.typography.body.fontWeight,
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
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonFloating: {
    position: 'absolute',
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    bottom: tokens.spacing.xl,
  },
  blurScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  // New Creative Content Styles
  creativeTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: tokens.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  engagingSubtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'left',
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
  },
  styleHighlights: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  highlightChip: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.4)',
  },
  highlightText: {
    color: tokens.colors.primary.light,
    fontSize: tokens.typography.small.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  transformationPromise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: tokens.borderRadius.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  promiseIcon: {
    marginRight: tokens.spacing.md,
  },
  promiseText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});

export default OnboardingScreen2;
