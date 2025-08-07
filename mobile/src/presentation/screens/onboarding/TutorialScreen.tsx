// Tutorial Screen - Interactive Camera and App Feature Guide
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OnboardingProgress } from './components/OnboardingProgress';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  tips: string[];
  illustration: string;
  buttonText?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Take Great Photos',
    description: 'The quality of your photo directly impacts the AI\'s ability to create amazing designs for your space.',
    tips: [
      'Use good lighting - natural light works best',
      'Capture the entire room in one shot',
      'Keep the camera steady and level',
      'Avoid clutter in the foreground'
    ],
    illustration: '📸',
    buttonText: 'Got it!'
  },
  {
    id: 2,
    title: 'Room Preparation Tips',
    description: 'A few simple steps can dramatically improve your results and design suggestions.',
    tips: [
      'Clear walkways and surfaces',
      'Open curtains and blinds for natural light',
      'Turn on room lights for even illumination',
      'Remove personal items from view'
    ],
    illustration: '🧹',
    buttonText: 'Makes sense!'
  },
  {
    id: 3,
    title: 'AI Magic Happens',
    description: 'Our AI analyzes your room\'s architecture, lighting, and existing elements to create personalized designs.',
    tips: [
      'AI identifies room type automatically',
      'Existing furniture is considered in new designs',
      'Style preferences influence suggestions',
      'Budget affects furniture recommendations'
    ],
    illustration: '🤖',
    buttonText: 'Awesome!'
  },
  {
    id: 4,
    title: 'Explore & Shop',
    description: 'Browse multiple design options, get product recommendations, and purchase items you love.',
    tips: [
      'Swipe through different design variations',
      'Tap items to see product details and prices',
      'Save designs to your favorites',
      'Share designs with friends and family'
    ],
    illustration: '🛍️',
    buttonText: 'Let\'s start!'
  }
];

interface TutorialStepComponentProps {
  step: TutorialStep;
  isActive: boolean;
  onNext: () => void;
}

const TutorialStepComponent: React.FC<TutorialStepComponentProps> = ({ step, isActive, onNext }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, fadeAnim, slideAnim]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.illustrationContainer}>
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>{step.illustration}</Text>
        </View>
      </View>

      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>

        <View style={styles.tipsList}>
          {step.tips.map((tip, index) => (
            <Animated.View
              key={index}
              style={[
                styles.tipItem,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>{tip}</Text>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{step.buttonText || 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export const TutorialScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuestion] = useState(3);
  const totalQuestions = 5;

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep + 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Save onboarding completion and user preferences
    try {
      // In a real app, this would save to the backend
      const onboardingData = {
        selectedStyles: route.params?.selectedStyles || [],
        budgetRange: route.params?.budgetRange || { min: 500, max: 2000 },
        tutorialCompleted: true,
        completedAt: new Date().toISOString(),
      };

      console.log('Onboarding completed with data:', onboardingData);

      // Navigate to main app
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still navigate to main app
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {tutorialSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            {
              backgroundColor: index <= currentStep ? '#007AFF' : '#E5E5EA',
              transform: [{ scale: index === currentStep ? 1.2 : 1 }],
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <OnboardingProgress
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Tutorial</Text>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tutorialSteps.map((step, index) => (
          <TutorialStepComponent
            key={step.id}
            step={step}
            isActive={index === currentStep}
            onNext={handleNext}
          />
        ))}
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.backNavButton,
            { opacity: currentStep === 0 ? 0.5 : 1 }
          ]}
          onPress={handleBack}
          disabled={currentStep === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.backNavButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.stepCounter}>
          <Text style={styles.stepCounterText}>
            {currentStep + 1} of {tutorialSteps.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.nextNavButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextNavButtonText}>
            {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 18,
    color: '#6E6E73',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  tipsList: {
    width: '100%',
    marginBottom: 40,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 160,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  backNavButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backNavButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  stepCounter: {
    paddingVertical: 12,
  },
  stepCounterText: {
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '500',
  },
  nextNavButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  nextNavButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});