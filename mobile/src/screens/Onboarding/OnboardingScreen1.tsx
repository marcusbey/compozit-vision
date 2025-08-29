import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design System Tokens
const tokens = {
  color: {
    bgApp: '#FBF9F4',
    surface: '#FEFEFE',
    accent: '#2D2B28',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textMuted: '#B8AFA4',
    borderSoft: '#E6DDD1',
    accentSoft: 'rgba(45, 43, 40, 0.1)',
    white: '#FEFEFE',
    brand: '#D4A574',
    brandLight: '#E8C097',
  },
  type: {
    display: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '500',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    pill: 25,
  },
  shadow: {
    e2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    brandShadow: {
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

const { width, height } = Dimensions.get('window');

interface OnboardingScreen1Props {
  onNext?: () => void;
}

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext }) => {
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
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.screenBackground}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 3</Text>
        </View>

        {/* Hero Visual */}
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
            <View style={styles.aiCircle}>
              <Ionicons name="camera" size={32} color={tokens.color.white} />
            </View>
            <View style={styles.sparkles}>
              <Ionicons name="sparkles" size={20} color={tokens.color.brand} style={[styles.sparkle, styles.sparkle1]} />
              <Ionicons name="sparkles" size={16} color={tokens.color.textSecondary} style={[styles.sparkle, styles.sparkle2]} />
              <Ionicons name="sparkles" size={18} color={tokens.color.brand} style={[styles.sparkle, styles.sparkle3]} />
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>AI-Powered Design{'\n'}at Your Fingertips</Text>
          
          <Text style={styles.subtitle}>
            Transform any space with professional interior design using just your phone's camera
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="scan" size={24} color={tokens.color.brand} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Room Analysis</Text>
                <Text style={styles.featureText}>AI detects room type, dimensions, and existing furniture automatically</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="color-palette" size={24} color={tokens.color.brand} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Professional Styles</Text>
                <Text style={styles.featureText}>Choose from curated design styles by interior design experts</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="flash" size={24} color={tokens.color.brand} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Results</Text>
                <Text style={styles.featureText}>Generate stunning designs in seconds, not hours</Text>
              </View>
            </View>
          </View>
        </Animated.View>

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
          <TouchableOpacity
            style={styles.nextButtonContainer}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding2')}
            activeOpacity={0.9}
            testID="continue-button"
          >
            <LinearGradient
              colors={[tokens.color.brandLight, tokens.color.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={tokens.color.accent} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            Join thousands of users transforming their spaces
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
  screenBackground: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.sm,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.sm,
  },
  progressText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl,
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
    backgroundColor: tokens.color.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
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
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
    lineHeight: 26,
    paddingHorizontal: tokens.spacing.md,
  },
  featuresContainer: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 17,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 15,
    color: tokens.color.textSecondary,
    lineHeight: 22,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
  },
  nextButtonContainer: {
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.brandShadow,
  },
  nextButton: {
    borderRadius: tokens.radius.pill,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.accent,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
});

export default OnboardingScreen1;