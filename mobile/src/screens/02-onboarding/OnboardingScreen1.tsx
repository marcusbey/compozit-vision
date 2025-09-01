import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
      <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 4</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
      >
        {/* Video Section */}
        <View style={styles.videoSection}>
          <Text style={styles.videoText}>Before & After Demo</Text>
          <View style={styles.demoContainer}>
            <View style={styles.beforeRoom}>
              <View style={styles.roomElement} />
              <Text style={styles.roomLabel}>Before</Text>
            </View>
            <View style={styles.afterRoom}>
              <View style={[styles.roomElement, styles.enhanced]} />
              <Text style={styles.roomLabel}>After</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#E8C097', '#D4A574']}
                style={styles.aiIcon}
              >
                <Ionicons name="camera" size={32} color="#2D2B28" />
              </LinearGradient>
              <Ionicons name="sparkles" size={16} color="#E8C097" style={styles.sparkle1} />
              <Ionicons name="sparkles" size={12} color="#D4A574" style={styles.sparkle2} />
            </View>
            
            <Text style={styles.title}>AI-Powered Design{'\n'}at Your Fingertips</Text>
            <Text style={styles.subtitle}>
              Transform any space with professional interior design using just your phone's camera
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <LinearGradient colors={['#E8C097', '#D4A574']} style={styles.featureIcon}>
                <Ionicons name="scan" size={20} color="#2D2B28" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Analysis</Text>
                <Text style={styles.featureText}>AI understands your space layout and lighting conditions</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <LinearGradient colors={['#E8C097', '#D4A574']} style={styles.featureIcon}>
                <Ionicons name="color-palette" size={20} color="#2D2B28" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Perfect Styling</Text>
                <Text style={styles.featureText}>Professional design recommendations tailored to your preferences</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <LinearGradient colors={['#E8C097', '#D4A574']} style={styles.featureIcon}>
                <Ionicons name="flash" size={20} color="#2D2B28" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Instant Results</Text>
                <Text style={styles.featureText}>Generate stunning designs in seconds, not hours of planning</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <LinearGradient colors={['#E8C097', '#D4A574']} style={styles.featureIcon}>
                <Ionicons name="images" size={20} color="#2D2B28" />
              </LinearGradient>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>High Quality</Text>
                <Text style={styles.featureText}>Professional-grade visualizations you can share and implement</Text>
              </View>
            </View>
          </View>

          {/* Additional Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Choose Compozit Vision?</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#7FB069" />
              <Text style={styles.benefitText}>Save thousands on interior design consultations</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#7FB069" />
              <Text style={styles.benefitText}>Get results in minutes, not weeks</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#7FB069" />
              <Text style={styles.benefitText}>Try risk-free with 3 complimentary designs</Text>
            </View>

            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#7FB069" />
              <Text style={styles.benefitText}>Access to professional design library</Text>
            </View>
          </View>

          {/* Testimonial Preview */}
          <View style={styles.testimonialPreview}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={16} color="#D4A574" />
              ))}
            </View>
            <Text style={styles.testimonialText}>
              "Transformed my living room in minutes. The AI recommendations were spot-on!"
            </Text>
            <Text style={styles.testimonialAuthor}>— Sarah M., Real Estate Agent</Text>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Bottom Container - Always Visible */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
          testID="continue-button"
          onPressIn={() => console.log('🔥 BUTTON PRESS IN')}
          onPressOut={() => console.log('🔥 BUTTON PRESS OUT')}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
        
        <Text style={styles.skipText}>Join thousands of users transforming their spaces</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
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
  videoSection: {
    backgroundColor: '#2D2B28',
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  contentSection: {
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 48,
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
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
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FDFBF7',
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
  },
  continueButton: {
    backgroundColor: '#D4A574',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
    textAlign: 'center',
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