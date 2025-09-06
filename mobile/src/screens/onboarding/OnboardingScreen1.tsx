import { tokens } from '@theme';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

interface OnboardingScreen1Props {
  navigation?: any;
  route?: any;
  onNext?: () => void;
  onBack?: () => void;
}

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext, onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    ]).start();
  }, []);

  const handleContinue = () => {
    console.log('🚀 BUTTON PRESSED - Continue button clicked!');
    console.log('📍 Current props:', { hasOnNext: !!onNext });

    try {
      if (onNext) {
        console.log('✅ Using onNext callback');
        onNext();
      } else {
        console.log('✅ Using NavigationHelpers');
        NavigationHelpers.navigateToScreen('onboarding2');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />

      {/* Background warm gradient */}
      <LinearGradient
        colors={[tokens.colors.background.primary, '#F5E9D7']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top half: transition video */}
      <View style={styles.topHalf}>
        <Video
          source={require('../../assets/animations/videos/backgrounds/transition01-compozit.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
        <LinearGradient
          colors={[ 'rgba(0,0,0,0.0)', 'rgba(0,0,0,0.18)' ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Bottom half: copy + CTA */}
      <View style={styles.bottomHalf}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.headline}>Your Design Assistant</Text>
          <Text style={styles.body}>
            Compozit turns your photos into professional interior concepts —
            warm, precise, and production-ready.
          </Text>
        </Animated.View>

        <TouchableOpacity onPress={handleContinue} activeOpacity={0.9} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FDFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D8',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#E8E2D8',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#7A7A7A',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topHalf: {
    flex: 1,
    marginHorizontal: tokens.spacing.lg,
    marginTop: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    ...tokens.shadows.elevation2,
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  demoContainer: {
    flexDirection: 'row',
    gap: 32,
  },
  beforeRoom: {
    alignItems: 'center',
  },
  afterRoom: {
    alignItems: 'center',
  },
  roomElement: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginBottom: 8,
  },
  enhanced: {
    backgroundColor: 'rgba(212, 165, 116, 0.6)',
  },
  roomLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  bottomHalf: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    justifyContent: 'space-between',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  aiIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A574',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: -8,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: tokens.spacing.sm,
  },
  body: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.sm,
  },
  featuresSection: {
    paddingBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#D4A574',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 15,
    color: '#7A7A7A',
    lineHeight: 21,
  },
  nextButton: {
    backgroundColor: '#1C1C1C',
    borderRadius: 999,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FDFBF7',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: -24,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  benefitText: {
    fontSize: 16,
    color: '#1C1C1C',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  testimonialPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 32,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  testimonialText: {
    fontSize: 16,
    color: '#1C1C1C',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#7A7A7A',
    fontWeight: '500',
  },
});

export default OnboardingScreen1;
