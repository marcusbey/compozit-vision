import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { ValidationErrorDisplay } from '../../components/ValidationErrorDisplay';
import type { ProjectStartValidationData } from '../../types/validation';

// Import design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textMuted: "#9A9A9A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

interface ProjectWizardStartScreenProps {
  navigation?: any;
  route?: any;
}

const ProjectWizardStartScreen: React.FC<ProjectWizardStartScreenProps> = ({ navigation, route }) => {
  const [isValidating, setIsValidating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();
  const { user, availableCredits, currentPlan } = useUserStore();
  
  // Initialize validation for this step
  const validation = useWizardValidation({
    stepId: 'projectWizardStart',
    autoValidate: true,
    validateOnMount: true
  });

  useEffect(() => {
    // Initialize wizard start
    journeyStore.updateProjectWizard({
      currentWizardStep: 'start',
      wizardStartedAt: new Date().toISOString(),
    });

    // Entrance animations
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

  const handleStartWizard = async () => {
    setIsValidating(true);
    
    try {
      // Prepare validation data
      const validationData: ProjectStartValidationData = {
        projectName: undefined, // Optional for now
        isAuthenticated: !!user,
        availableCredits: availableCredits || 0,
        userPlan: currentPlan || 'free'
      };
      
      console.log('🚀 Project wizard validation data:', {
        isAuthenticated: !!user,
        availableCredits: availableCredits || 0,
        userPlan: currentPlan || 'free',
        isDev: __DEV__,
        nodeEnv: process.env.NODE_ENV,
        appEnv: process.env.APP_ENV
      });
      
      // Validate before proceeding
      const result = await validation.validateStep(validationData, 'onSubmit');
      
      if (result.isValid) {
        // Update journey store and start wizard
        journeyStore.updateProjectWizard({
          currentWizardStep: 'category_selection'
        });
        
        // Navigate to first wizard step
        NavigationHelpers.navigateToScreen('categorySelection');
      } else {
        // Validation failed - errors will be displayed by ValidationErrorDisplay
        console.log('❌ Project wizard start validation failed:', result.errors);
      }
    } catch (error) {
      console.error('❌ Validation error:', error);
      Alert.alert(
        'Validation Error',
        'There was an issue validating your request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleBack = () => {
    // Go back to payment/auth flow
    NavigationHelpers.navigateToScreen('paywall');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
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
            {/* Welcome Message */}
            <View style={styles.welcomeContainer}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="rocket" size={40} color={tokens.color.brand} />
                </View>
              </View>
              
              <Text style={styles.welcomeTitle}>Let's Create Your Dream Space!</Text>
              <Text style={styles.welcomeSubtitle}>
                Follow our simple 5-step wizard to transform your space with AI-powered design
              </Text>
            </View>

            {/* Steps Preview */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>What to Expect</Text>
              
              <View style={styles.stepsList}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Choose Category</Text>
                    <Text style={styles.stepDescription}>Select your project type - Interior, Garden, Surface, or Renovation</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Select Space</Text>
                    <Text style={styles.stepDescription}>Tell us which room or area you want to transform</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Capture or Upload</Text>
                    <Text style={styles.stepDescription}>Take a photo or try one of our sample spaces</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Pick Your Style</Text>
                    <Text style={styles.stepDescription}>Choose from Modern, Traditional, Minimalist, and more</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>5</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>References & Colors</Text>
                    <Text style={styles.stepDescription}>Fine-tune with inspiration images and color palettes</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Time Estimate */}
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={20} color={tokens.color.brand} />
              <Text style={styles.timeText}>Takes about 3-5 minutes</Text>
            </View>
            
            {/* Validation Errors */}
            {validation.validationResult && !validation.validationResult.isValid && (
              <ValidationErrorDisplay
                result={validation.validationResult}
                recoveryActions={validation.recoveryActions}
                onActionPress={validation.handleRecoveryAction}
                showSummary={true}
                style={styles.validationContainer}
              />
            )}
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.startButton,
              (isValidating || validation.isValidating) && styles.startButtonDisabled
            ]}
            onPress={handleStartWizard}
            disabled={isValidating || validation.isValidating}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.color.brand, tokens.color.brandHover]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={[
                styles.startButtonText,
                (isValidating || validation.isValidating) && styles.startButtonTextDisabled
              ]}>
                {(isValidating || validation.isValidating) ? 'Validating...' : 'Start Your Project'}
              </Text>
              {!(isValidating || validation.isValidating) && (
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={tokens.color.textInverse}
                  style={styles.startButtonIcon}
                />
              )}
              {(isValidating || validation.isValidating) && (
                <Ionicons 
                  name="hourglass" 
                  size={20} 
                  color={tokens.color.textInverse}
                  style={styles.startButtonIcon}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl, // Extra space for bottom button
  },
  content: {
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  iconContainer: {
    marginBottom: tokens.spacing.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  welcomeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: tokens.color.textSecondary,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  stepsContainer: {
    marginBottom: tokens.spacing.xl,
  },
  stepsTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xl,
    textAlign: 'center',
  },
  stepsList: {
    // gap handled by stepItem marginBottom
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.color.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  stepNumberText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    paddingTop: tokens.spacing.xs,
  },
  stepTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  stepDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    marginBottom: tokens.spacing.xl,
    ...tokens.shadow.e2,
  },
  timeText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl, // 48px safe area
    paddingTop: tokens.spacing.xl,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    minHeight: 120, // Ensure minimum height for button
  },
  startButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    marginBottom: tokens.spacing.md, // Extra margin from bottom
    ...tokens.shadow.e2,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, // Slightly more padding
    paddingHorizontal: tokens.spacing.xl,
    height: 56, // Slightly taller button
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  startButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
  validationContainer: {
    marginTop: tokens.spacing.xl,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonTextDisabled: {
    color: tokens.color.textMuted,
  },
});

export default ProjectWizardStartScreen;