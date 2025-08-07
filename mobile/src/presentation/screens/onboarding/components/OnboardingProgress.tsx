// Onboarding Progress Indicator Component
import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  animatedValue?: Animated.Value;
}

const { width } = Dimensions.get('window');

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  animatedValue = new Animated.Value(0)
}) => {
  const progressWidth = (currentStep / totalSteps) * 100;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progressWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressWidth, animatedValue]);

  const animatedProgressWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressForeground,
            { width: animatedProgressWidth }
          ]}
        />
      </View>
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < currentStep 
                  ? '#007AFF' 
                  : index === currentStep 
                    ? '#007AFF' 
                    : '#E5E5EA'
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressForeground: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});