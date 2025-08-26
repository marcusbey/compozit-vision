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

const { width, height } = Dimensions.get('window');

interface OnboardingScreen3Props {
  onNext?: () => void;
  onBack?: () => void;
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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding2')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>3 of 3</Text>
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
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.professionalBadge}
              >
                <Ionicons name="star" size={24} color="#ffffff" />
                <Text style={styles.badgeText}>Professional Grade</Text>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Ready for{'\n'}Professional Results?</Text>
            
            <Text style={styles.subtitle}>
              Join thousands of real estate agents, designers, and architects who trust Compozit Vision for their projects.
            </Text>

            {/* Professional Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="scan-outline" size={28} color="#4facfe" />
                  </View>
                  <Text style={styles.featureTitle}>Advanced Room Analysis</Text>
                </View>
                <Text style={styles.featureDescription}>
                  AI detects room type, dimensions, lighting, and existing furniture with 95% accuracy
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="color-palette-outline" size={28} color="#4facfe" />
                  </View>
                  <Text style={styles.featureTitle}>Style Customization</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Choose multiple design styles, furniture preferences, and custom atmosphere settings
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="storefront-outline" size={28} color="#4facfe" />
                  </View>
                  <Text style={styles.featureTitle}>Smart Product Matching</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Get exact furniture matches with prices, availability, and purchase links from trusted retailers
                </Text>
              </View>

              <View style={styles.professionalFeature}>
                <View style={styles.featureHeader}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="calculator-outline" size={28} color="#4facfe" />
                  </View>
                  <Text style={styles.featureTitle}>Budget Planning</Text>
                </View>
                <Text style={styles.featureDescription}>
                  Detailed cost breakdowns by category with budget optimization suggestions
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
            <Text style={styles.ctaTitle}>Start Your First Design</Text>
            <Text style={styles.ctaSubtext}>
              Use your 3 free credits to experience professional-grade AI design
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="camera" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            No credit card required • Cancel anytime
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
  },
  gradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#b8c6db',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  professionalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  professionalFeature: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
  featureDescription: {
    fontSize: 15,
    color: '#8892b0',
    lineHeight: 22,
    paddingLeft: 64,
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4facfe',
    marginBottom: 4,
  },
  trustLabel: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  ctaSubtext: {
    fontSize: 15,
    color: '#b8c6db',
    textAlign: 'center',
    lineHeight: 22,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default OnboardingScreen3;