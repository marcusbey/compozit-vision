import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';

const { width, height } = Dimensions.get('window');

// Background & brand assets
const backgroundImage = require('../../assets/background/compozit-intro06.png');
const logoImage = require('../../assets/logo.png');

interface WelcomeScreenProps {
  navigation?: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const journeyStore = useJourneyStore();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    // Mark that user has seen welcome screen
    await AsyncStorage.setItem('hasSeenWelcome', 'true');

    // Reset journey for new user onboarding flow
    journeyStore.resetJourney();

    // Set journey progress for new user flow
    journeyStore.updateProgress({
      currentScreen: 'onboarding1',
      currentStep: 1
    });

    if (navigation?.navigate) {
      navigation.navigate('onboarding1');
    } else {
      NavigationHelpers.navigateToScreen('onboarding1');
    }
  };

  const handleLogin = async () => {
    // Mark that user has seen welcome screen
    await AsyncStorage.setItem('hasSeenWelcome', 'true');

    // Set context for existing user login
    journeyStore.updateAuthentication({
      hasAccount: true,
      method: 'email'
    });

    // Navigate directly to auth screen for existing users
    if (navigation?.navigate) {
      navigation.navigate('auth');
    } else {
      NavigationHelpers.navigateToScreen('auth');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Photo background */}
      <ImageBackground source={backgroundImage} style={styles.bgImage} resizeMode="cover">
        {/* Warm gradient overlay */}
        <LinearGradient
          colors={[ '#FDFBF7', '#F5E9D7' ]}
          style={styles.gradientOverlay}
        />
      </ImageBackground>

      {/* Content overlay */}
      <SafeAreaView style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <ImageBackground source={logoImage} style={styles.brandLogo} resizeMode="contain" />
            <Text style={styles.brandText}>Compozit</Text>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>
            Transform your space with precision
          </Text>

          {/* CTA */}
          <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.9} style={styles.ctaButtonContainer}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Get Started</Text>
            </View>
          </TouchableOpacity>

          {/* Login hint */}
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.7} style={styles.loginButtonContainer}>
            <Text style={styles.loginText}>Log in (if you already have an account)</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: tokens.spacing.xxl,
  },
  content: {
    paddingHorizontal: tokens.spacing.xxl,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  brandText: {
    fontSize: 16,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  brandLogo: {
    width: 18,
    height: 18,
    tintColor: '#1C1C1C',
  },
  headline: {
    fontSize: 34,
    lineHeight: 40,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    letterSpacing: 0.2,
  },
  ctaButtonContainer: {
    width: '100%',
    borderRadius: tokens.borderRadius.pill,
    overflow: 'hidden',
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButton: {
    backgroundColor: '#1C1C1C',
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 999,
  },
  ctaText: {
    color: '#FDFBF7',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loginButtonContainer: {
    marginTop: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
  },
  loginText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
