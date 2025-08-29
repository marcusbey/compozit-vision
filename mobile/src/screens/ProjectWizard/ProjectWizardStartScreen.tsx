import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();

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

  const handleStartWizard = () => {
    // Update journey store and start wizard
    journeyStore.updateProjectWizard({
      currentWizardStep: 'category_selection'
    });
    
    // Navigate to first wizard step
    NavigationHelpers.navigateToScreen('categorySelection');
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
            style={styles.startButton}
            onPress={handleStartWizard}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[tokens.color.brand, tokens.color.brandHover]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>Start Your Project</Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={tokens.color.textInverse}
                style={styles.startButtonIcon}
              />
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
  },
  content: {
    flex: 1,
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
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  welcomeSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: tokens.spacing.md,
  },
  stepsContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  stepsTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  stepsList: {
    gap: tokens.spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.md,
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
    padding: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  timeText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingTop: tokens.spacing.xl,
  },
  startButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    height: 52,
  },
  startButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  startButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
});

export default ProjectWizardStartScreen;