import React, { useRef, useEffect, useState } from 'react';
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
import { useContentStore } from '../../stores/contentStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design Tokens - Unified Design System
const tokens = {
  color: {
    bgApp: '#FBF9F4',          // Warm beige background
    bgSecondary: '#F5F1E8',    // Slightly darker warm beige
    accent: '#2D2B28',         // Warm dark accent
    textPrimary: '#2D2B28',    // Warm dark text
    textSecondary: '#8B7F73',  // Warm gray for secondary text
    textTertiary: '#B8AFA4',   // Muted warm gray for tertiary text
    border: '#E6DDD1',         // Warm light border
    surface: '#FEFEFE',        // Soft white for cards
    success: '#7FB069',        // Green for success states
    warning: '#F2CC8F',        // Warm amber for warnings
    brand: '#D4A574',          // Brand color
    brandLight: '#E8C097',     // Light brand color
    brandDark: '#B8935F',      // Dark brand color
    accent20: 'rgba(45, 43, 40, 0.2)',  // 20% accent
    accent10: 'rgba(45, 43, 40, 0.1)',  // 10% accent
    accent05: 'rgba(45, 43, 40, 0.05)', // 5% accent
    scrim: 'rgba(45, 43, 40, 0.45)',    // Warm scrim
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
    h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
    caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 25,
  },
  shadow: {
    e1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    e2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    e3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

const { width, height } = Dimensions.get('window');

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Remove hardcoded styles - now using database-driven content

interface OnboardingScreen2Props {
  onNext?: () => void;
  onBack?: () => void;
}

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onBack }) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Database-driven content
  const { styles: styleCategories, loadingStyles, loadStyles } = useContentStore();
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Load styles from database when component mounts
    loadStyles();
    
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

  const handleStyleSelect = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(id => id !== styleId));
    } else if (selectedStyles.length < 2) {
      setSelectedStyles([...selectedStyles, styleId]);
    }
    
    // Update journey store with selections
    journeyStore.updateOnboarding({
      selectedStyles: selectedStyles.includes(styleId) 
        ? selectedStyles.filter(id => id !== styleId)
        : [...selectedStyles, styleId].slice(0, 2) // Limit to 2
    });
  };

  const canContinue = selectedStyles.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding1')} style={styles.backButton} testID="back-button">
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Text style={styles.progressText}>2 of 3</Text>
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
            {/* Credits Introduction */}
            <View style={styles.creditsIntro}>
              <View style={styles.creditsIcon}>
                <Ionicons name="star" size={24} color={tokens.color.brand} />
              </View>
              <Text style={styles.creditsText}>
                You get <Text style={styles.creditsHighlight}>3 free designs</Text> to start
              </Text>
            </View>

            <Text style={styles.title}>What's Your Style?</Text>
            
            <Text style={styles.subtitle}>
              Select up to 2 design styles that inspire you. This helps our AI create personalized designs just for you.
            </Text>

            {/* Style Options Grid - Database Driven */}
            <View style={styles.styleGrid}>
              {loadingStyles ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading styles...</Text>
                </View>
              ) : styleCategories.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>No styles available</Text>
                  <Text style={styles.loadingText}>Check database connection</Text>
                </View>
              ) : (
                styleCategories.map((style) => {
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleOption,
                        isSelected && styles.styleOptionSelected
                      ]}
                      onPress={() => handleStyleSelect(style.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </View>
                    )}
                    <View style={styles.styleIconContainer}>
                      <Text style={styles.styleIcon}>{style.emoji || '🎨'}</Text>
                    </View>
                    <Text style={styles.styleName}>{style.display_name}</Text>
                    <Text style={styles.styleDescription}>{style.description || 'Stylish design choice'}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Selection Counter */}
            <View style={styles.selectionCounter}>
              <Text style={styles.counterText}>
                {selectedStyles.length}/2 styles selected
              </Text>
              {selectedStyles.length === 2 && (
                <Text style={styles.counterNote}>
                  Perfect! You can change these later in settings.
                </Text>
              )}
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
          <TouchableOpacity
            style={[
              styles.nextButtonContainer,
              !canContinue && styles.nextButtonDisabled
            ]}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding3')}
            activeOpacity={0.9}
            disabled={!canContinue}
          >
            <LinearGradient
              colors={canContinue ? ['#E8C097', '#D4A574'] : ['#B8AFA4', '#B8AFA4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={tokens.color.textPrimary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            Don't worry, you can always change your preferences later
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
  wrapper: {
    flex: 1,
    paddingTop: tokens.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.border,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    ...tokens.typography.caption,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  creditsIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
    ...tokens.shadow.e1,
  },
  creditsIcon: {
    marginRight: tokens.spacing.sm,
  },
  creditsText: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '500' as const,
  },
  creditsHighlight: {
    color: tokens.color.brand,
    fontWeight: '700' as const,
  },
  title: {
    ...tokens.typography.h1,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  subtitle: {
    ...tokens.typography.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.md,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.color.textTertiary,
    textAlign: 'center',
  },
  styleOption: {
    width: (width - (tokens.spacing.xl * 2) - tokens.spacing.md) / 2,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.color.border,
    position: 'relative',
    ...tokens.shadow.e2,
  },
  styleOptionSelected: {
    borderColor: tokens.color.brand,
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
  },
  checkmark: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.brand,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    ...tokens.shadow.e2,
  },
  styleIconContainer: {
    marginBottom: tokens.spacing.md,
  },
  styleIcon: {
    fontSize: 32,
  },
  styleName: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  styleDescription: {
    ...tokens.typography.small,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  selectionCounter: {
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  counterText: {
    ...tokens.typography.body,
    color: tokens.color.brand,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.xs,
  },
  counterNote: {
    ...tokens.typography.caption,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxl,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  nextButtonContainer: {
    marginBottom: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
    shadowColor: tokens.color.brand,
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
    ...tokens.typography.bodyLarge,
    fontWeight: '600' as const,
    color: tokens.color.textPrimary,
    marginRight: tokens.spacing.sm,
  },
  skipText: {
    ...tokens.typography.caption,
    color: tokens.color.textTertiary,
    textAlign: 'center',
  },
});

export default OnboardingScreen2;