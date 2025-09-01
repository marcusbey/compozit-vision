import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationProps } from '../../types';

const { width, height } = Dimensions.get('window');

const OnboardingScreen4: React.FC<NavigationProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('paywall');
  };

  const handleSkip = () => {
    navigation.navigate('paywall');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>4 of 4</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <LinearGradient
              colors={['#E8C097', '#D4A574']}
              style={styles.iconGradient}
            >
              <Ionicons name="heart" size={32} color="#2D2B28" />
            </LinearGradient>
            <Text style={styles.title}>Loved by Thousands</Text>
            <Text style={styles.subtitle}>
              Join professionals and homeowners transforming their spaces
            </Text>
          </View>

          {/* User Testimonials & Social Proof Section */}
          <View style={styles.testimonialContainer}>
            <View style={styles.testimonialCard}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#F2CC8F" />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "Helped me stage 3 homes this month - each sold 2 weeks faster than usual. My clients love the visualizations!"
              </Text>
              <Text style={styles.testimonialAuthor}>— Maria L, Real Estate Agent</Text>
            </View>

            <View style={styles.testimonialCard}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#F2CC8F" />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "Finally found my style! The AI understood exactly what I wanted for my living room renovation."
              </Text>
              <Text style={styles.testimonialAuthor}>— James K, Homeowner</Text>
            </View>

            <View style={styles.testimonialCard}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#F2CC8F" />
                ))}
              </View>
              <Text style={styles.testimonialText}>
                "Saved me hours of mood boarding. My clients are impressed with how quickly I deliver concepts now."
              </Text>
              <Text style={styles.testimonialAuthor}>— Sophie M, Interior Designer</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Happy Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={styles.statLabel}>App Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1M+</Text>
              <Text style={styles.statLabel}>Designs Created</Text>
            </View>
          </View>

          {/* Trust Badges */}
          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>Trusted By</Text>
            <View style={styles.trustBadges}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={24} color="#7FB069" />
                <Text style={styles.badgeText}>Secure</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="lock-closed" size={24} color="#7FB069" />
                <Text style={styles.badgeText}>Private</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="checkmark-circle" size={24} color="#7FB069" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#E8C097', '#D4A574']}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#2D2B28" />
          </LinearGradient>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8E2D8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
  },
  progressText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginTop: 4,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#7A7A7A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  mainContent: {
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  testimonialContainer: {
    width: '100%',
    marginBottom: 32,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 16,
    color: '#1C1C1C',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#7A7A7A',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E2D8',
  },
  trustSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trustTitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 24,
  },
  badge: {
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2B28',
    marginRight: 8,
  },
});

export default OnboardingScreen4;