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

  const handleExistingAccount = () => {
    try {
      NavigationHelpers.navigateToScreen('auth');
    } catch (error) {
      console.error('❌ Navigation error (auth):', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-bleed video background */}
      <View style={styles.videoContainer}>
        <Video
          source={require('../../assets/animations/videos/backgrounds/transition01-compozit.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
        {/* Scrim to ensure readable foreground content */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.0)',
            'rgba(10,10,10,0.35)',
            'rgba(10,10,10,0.55)'
          ]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Bottom overlay content */}
      <View style={styles.overlayContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>Your Design Assistant</Text>
          <Text style={styles.subtitle}>
            Compozit turns your photos into professional interior concepts — warm, precise, and
            production-ready.
          </Text>
        </Animated.View>

        <TouchableOpacity onPress={handleContinue} activeOpacity={0.9} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExistingAccount} activeOpacity={0.9} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlayContent: {
    position: 'absolute',
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
    bottom: tokens.spacing.xxl,
    paddingTop: tokens.spacing.md,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: tokens.spacing.sm,
    marginBottom: tokens.spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    backgroundColor: '#D4A574',
    borderRadius: 999,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaButtonText: {
    color: '#2D2B28',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: tokens.spacing.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(0,0,0,0.15)'
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen1;
