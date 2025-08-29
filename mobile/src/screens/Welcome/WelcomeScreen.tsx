import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';

const { width, height } = Dimensions.get('window');

// Grid of interior design example colors (representing different rooms/styles)
const designExamples = [
  { id: 1, color: '#2C3E50', style: 'Modern Kitchen' },
  { id: 2, color: '#E74C3C', style: 'Traditional Living' },
  { id: 3, color: '#34495E', style: 'Minimalist Bath' },
  { id: 4, color: '#16A085', style: 'Bohemian Room' },
  { id: 5, color: '#7F8C8D', style: 'Industrial Loft' },
  { id: 6, color: '#ECF0F1', style: 'Scandinavian' },
  { id: 7, color: '#E67E22', style: 'Mid-Century' },
  { id: 8, color: '#3498DB', style: 'Contemporary' },
  { id: 9, color: '#8B4513', style: 'Rustic Charm' },
  { id: 10, color: '#9B59B6', style: 'Eclectic Mix' },
  { id: 11, color: '#1ABC9C', style: 'Coastal Style' },
  { id: 12, color: '#F39C12', style: 'Warm Modern' },
];

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
      
      {/* Background with design examples grid */}
      <View style={styles.backgroundContainer}>
        <ScrollView 
          style={styles.gridScrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.gridContainer}>
            {designExamples.map((item, index) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: item.color,
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.roomOverlay}>
                  <Ionicons 
                    name={index % 4 === 0 ? "bed" : index % 4 === 1 ? "restaurant" : index % 4 === 2 ? "library" : "home"} 
                    size={24} 
                    color="rgba(255,255,255,0.7)" 
                  />
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
        
        {/* Light gradient overlay for content readability */}
        <LinearGradient
          colors={['rgba(251,249,244,0.1)', 'rgba(251,249,244,0.7)', 'rgba(251,249,244,0.95)']}
          style={styles.gradientOverlay}
          locations={[0, 0.5, 1]}
        />
      </View>

      {/* Content overlay */}
      <SafeAreaView style={styles.contentContainer}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Compozit AI</Text>
            <Text style={styles.subtitle}>
              Instantly redesign your home with AI
            </Text>
          </View>

          {/* Trust indicators */}
          <View style={styles.trustContainer}>
            <View style={styles.trustItem}>
              <View style={styles.trustBadge}>
                <View style={styles.laurelContainer}>
                  <Text style={styles.laurelIcon}>🏆</Text>
                </View>
                <Text style={styles.trustLabel}>Trusted by over</Text>
                <Text style={styles.trustValue}>1,000,000+</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star} 
                      name="star" 
                      size={12} 
                      color={tokens.color.brand} 
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.trustSeparator} />

            <View style={styles.trustItem}>
              <View style={styles.trustBadge}>
                <View style={styles.laurelContainer}>
                  <Text style={styles.laurelIcon}>🏆</Text>
                </View>
                <Text style={styles.trustValue}>4.8</Text>
                <Text style={styles.trustLabel}>Average Rating</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star} 
                      name="star" 
                      size={12} 
                      color={tokens.color.brand} 
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity 
            onPress={handleGetStarted}
            activeOpacity={0.9}
            style={styles.ctaButtonContainer}
          >
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Get Started</Text>
            </View>
          </TouchableOpacity>

          {/* Login Link for Existing Users */}
          <TouchableOpacity 
            onPress={handleLogin}
            activeOpacity={0.7}
            style={styles.loginButtonContainer}
          >
            <Text style={styles.loginText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

// Design tokens from unified design system
const tokens = {
  color: {
    bgApp: '#FBF9F4',
    surface: '#FEFEFE',
    accent: '#2D2B28',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textMuted: '#B8AFA4',
    textInverse: '#FEFEFE',
    brand: '#D4A574',
    brandLight: '#E8C097',
    borderSoft: '#E6DDD1',
    scrim: 'rgba(45,43,40,0.45)',
    overlayGradient: 'rgba(45,43,40,0.6)',
  },
  type: {
    display: { size: 32, lineHeight: 40, weight: '700' as '700' },
    subtitle: { size: 16, lineHeight: 22, weight: '500' as '500' },
    body: { size: 16, lineHeight: 22, weight: '400' as '400' },
    bodySmall: { size: 14, lineHeight: 20, weight: '400' as '400' },
    caption: { size: 12, lineHeight: 16, weight: '400' as '400' },
  },
  spacing: {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48,
  },
  radius: {
    sm: 8, md: 12, lg: 16, xl: 24, pill: 999,
  },
  shadow: {
    e2: '0 4px 12px rgba(0,0,0,0.08)',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridScrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: tokens.spacing.sm,
    minHeight: height + 200, // Extra height to ensure full coverage
  },
  gridItem: {
    width: (width - 40) / 3,
    height: (height - 100) / 4.5,
    margin: tokens.spacing.xs,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28,28,28,0.15)',
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
    paddingBottom: tokens.spacing.xxxl + tokens.spacing.sm,
  },
  content: {
    paddingHorizontal: tokens.spacing.xxl - tokens.spacing.sm,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxxl - tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.type.display.size,
    lineHeight: tokens.type.display.lineHeight,
    fontWeight: tokens.type.display.weight,
    color: tokens.color.accent,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    fontSize: tokens.type.subtitle.size,
    lineHeight: tokens.type.subtitle.lineHeight,
    fontWeight: tokens.type.subtitle.weight,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: tokens.spacing.xxxl,
    paddingHorizontal: tokens.spacing.md,
  },
  trustItem: {
    flex: 1,
  },
  trustBadge: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  trustSeparator: {
    width: tokens.spacing.md,
  },
  laurelContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  laurelIcon: {
    fontSize: 20,
  },
  trustLabel: {
    fontSize: tokens.type.caption.size,
    lineHeight: tokens.type.caption.lineHeight,
    fontWeight: tokens.type.caption.weight,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  trustValue: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.color.accent,
    marginBottom: tokens.spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaButtonContainer: {
    width: '100%',
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    shadowColor: tokens.color.brand,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 999,
  },
  ctaText: {
    color: '#FFFFFF',
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
    color: tokens.color.textSecondary,
    fontSize: tokens.type.bodySmall.size,
    lineHeight: tokens.type.bodySmall.lineHeight,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
