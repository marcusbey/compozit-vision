import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { tokens } from '@theme';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(height * 0.55);
const VIDEO_ASPECT = 16 / 9; // force 16:9 composition width so left edge is true left of video

interface OnboardingScreen3Props {
  onNext?: () => void;
  onBack?: () => void;
  navigation?: any;
  route?: any;
}

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onNext, onBack, route }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const overlayAnim = useRef(new Animated.Value(1)).current; // full overlay at start
  const [overlayHidden, setOverlayHidden] = useState<boolean>(false);
  // keep hero perfectly flush-left; no scale transform
  const panAnim = useRef(new Animated.Value(0)).current;
  const [viewportWidth, setViewportWidth] = useState(width);
  const [containerWidth, setContainerWidth] = useState(Math.ceil(HERO_HEIGHT * VIDEO_ASPECT));

  // Staggered content animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(16)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descTranslate = useRef(new Animated.Value(18)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      const hideOverlay = !!(route && route.params && route.params.hideOverlay);

      // Reset values on focus so animation always runs
      overlayAnim.stopAnimation();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslate.stopAnimation();
      descOpacity.stopAnimation();
      descTranslate.stopAnimation();
      ctaOpacity.stopAnimation();
      ctaTranslate.stopAnimation();

      overlayAnim.setValue(hideOverlay ? 0 : 1);
      setOverlayHidden(hideOverlay);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      titleOpacity.setValue(0);
      titleTranslate.setValue(16);
      descOpacity.setValue(0);
      descTranslate.setValue(18);
      ctaOpacity.setValue(0);
      ctaTranslate.setValue(20);

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
        // Fade away the full-screen overlay to reveal the video + content
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

      const mainAnimation = Animated.parallel(sequences);

      // Run stagger animations in parallel with main animation
      const staggerAnimation = Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslate, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(descOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(descTranslate, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ctaOpacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ctaTranslate, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]);

      // Start both animations together
      Animated.parallel([mainAnimation, staggerAnimation]).start(() => {
        if (!hideOverlay) setOverlayHidden(true);
      });

      // Cleanup on blur: stop any running animations and ensure overlay is opaque again
      return () => {
        overlayAnim.stopAnimation(() => overlayAnim.setValue(hideOverlay ? 0 : 1));
        fadeAnim.stopAnimation(() => fadeAnim.setValue(0));
        slideAnim.stopAnimation(() => slideAnim.setValue(50));
        titleOpacity.stopAnimation(() => titleOpacity.setValue(0));
        titleTranslate.stopAnimation(() => titleTranslate.setValue(16));
        descOpacity.stopAnimation(() => descOpacity.setValue(0));
        descTranslate.stopAnimation(() => descTranslate.setValue(18));
        ctaOpacity.stopAnimation(() => ctaOpacity.setValue(0));
        ctaTranslate.stopAnimation(() => ctaTranslate.setValue(20));
        setOverlayHidden(hideOverlay);
      };
    }, [route])
  );

  useEffect(() => {
    // Pan from flush-left to exactly reveal the right edge.
    const requiredWidth = Math.ceil(HERO_HEIGHT * VIDEO_ASPECT);
    setContainerWidth(requiredWidth);
    const extraWidth = Math.max(0, requiredWidth - viewportWidth);
    panAnim.setValue(0);
    Animated.timing(panAnim, {
      toValue: -extraWidth,
      duration: 12000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [viewportWidth]);

  return (
    <SafeAreaView edges={['left','right']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.gradient}>
        {/* Top Hero: full-bleed video with slow left pan */}
        <Animated.View
          style={styles.hero}
          onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.panningContainer,
              { width: containerWidth, transform: [{ translateX: panAnim }] },
            ]}
          >
            <Video
              source={require('../../assets/animations/videos/heroes/transition03-compozit.mp4')}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted
            />
            {/* Warm precision scrim */}
            <LinearGradient
              colors={[ 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.50)' ]}
              style={StyleSheet.absoluteFill}
            />
            {/* Bottom gradient for depth */}
            <LinearGradient
              colors={['transparent', tokens.colors.overlay.light, tokens.colors.overlay.medium]}
              locations={[0, 0.8, 1]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 150,
              }}
            />
            {/* Startup overlay: fully opaque then fades out to reveal video */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {!overlayHidden && (
                <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: tokens.colors.overlay.solid, opacity: overlayAnim }]} />
              )}
            </View>
            {/* Thin geometric lines to evoke precision */}
            <View pointerEvents="none" style={styles.precisionOverlay}>
              <View style={[styles.lineHorizontal, { top: '30%' }]} />
              <View style={[styles.lineHorizontal, { top: '60%' }]} />
              <View style={[styles.lineVertical, { left: '33%' }]} />
              <View style={[styles.lineVertical, { left: '66%' }]} />
              <View style={styles.ruleMark} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Spacer to keep subsequent content below the hero's height */}
        <View style={styles.heroSpacer} />

        {/* Lower section background */}
        <View style={styles.lowerBackground} />

        {/* Header (no progress bar) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding2', { hideOverlay: true })} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Bottom Copy */}
        <Animated.View
          style={[
            styles.bottomCopy,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.titleContainer}>
            <Animated.Text
              style={[
                styles.title,
                { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] }
              ]}
            >
              Transform your space with precision.
            </Animated.Text>
          </View>
          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: descOpacity, transform: [{ translateY: descTranslate }] }
            ]}
          >
            Professional-level accuracy and artistic composition in every design. Compozit blends
            meticulous measurement with a refined, modern aesthetic.
          </Animated.Text>
        </Animated.View>

        {/* Bottom Action */}
        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslate }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding4')}
            activeOpacity={0.9}
          >
            <View style={styles.continueButtonContent}>
              <Text style={styles.continueButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#2D2B28" />
            </View>
          </TouchableOpacity>
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
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    borderRadius: 0,
    overflow: 'hidden',
  },
  panningContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  heroSpacer: {
    height: HERO_HEIGHT,
  },
  lowerBackground: {
    position: 'absolute',
    top: HERO_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.deep,
  },
  precisionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(212, 165, 116, 0.25)',
  },
  lineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(212, 165, 116, 0.25)',
  },
  ruleMark: {
    position: 'absolute',
    right: tokens.spacing.md,
    top: tokens.spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 221, 209, 0.55)',
    backgroundColor: 'rgba(232, 221, 209, 0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {},
  progressBar: {},
  progressFill: {},
  progressText: {},
  bottomCopy: {
    paddingHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing['2xl'],
    paddingBottom: Math.round(tokens.spacing['3xl'] * 0.75),
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
    maxWidth: 560,
    width: '100%',
  },
  title: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 560,
  },
  bottomContainer: {
    position: 'absolute',
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    bottom: tokens.spacing['2xl'],
    backgroundColor: 'transparent',
  },
  continueButton: {
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    borderRadius: 28,
    height: 56,
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
});

export default OnboardingScreen3;
