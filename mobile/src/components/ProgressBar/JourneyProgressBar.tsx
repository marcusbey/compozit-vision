import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore, getStepInfo } from '../../stores/journeyStore';

const { width } = Dimensions.get('window');

interface JourneyProgressBarProps {
  showTitle?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  style?: any;
}

const JourneyProgressBar: React.FC<JourneyProgressBarProps> = ({ 
  showTitle = true,
  showPercentage = true,
  animated = true,
  style 
}) => {
  const { progress } = useJourneyStore();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const progressPercentage = useJourneyStore(state => state.getProgressPercentage());
  const currentStepInfo = getStepInfo(progress.currentScreen);
  
  // Calculate progress width
  const progressWidth = (progressPercentage / 100) * (width - 60); // Account for padding

  useEffect(() => {
    if (animated) {
      // Animate progress bar
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: progressWidth,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      progressAnim.setValue(progressWidth);
      fadeAnim.setValue(1);
    }
  }, [progressWidth, animated]);

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      {/* Step Information */}
      {showTitle && (
        <View style={styles.stepInfo}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>
              Step {progress.currentStep} of {progress.totalSteps}
            </Text>
            {showPercentage && (
              <Text style={styles.percentage}>{progressPercentage}%</Text>
            )}
          </View>
          {currentStepInfo && (
            <Text style={styles.stepTitle}>{currentStepInfo.title}</Text>
          )}
        </View>
      )}

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        {/* Background Bar */}
        <View style={styles.progressBackground}>
          {/* Active Progress */}
          <Animated.View style={[styles.progressForeground, { width: animated ? progressAnim : progressWidth }]}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
          
          {/* Progress Indicator Dot */}
          <Animated.View 
            style={[
              styles.progressDot,
              {
                left: animated ? Animated.add(progressAnim, -6) : progressWidth - 6,
              }
            ]}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.dotGradient}
            >
              <Ionicons name="checkmark" size={12} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Step Markers */}
        <View style={styles.stepMarkers}>
          {Array.from({ length: progress.totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < progress.currentStep;
            const isCurrent = stepNumber === progress.currentStep;
            
            return (
              <View
                key={stepNumber}
                style={[
                  styles.stepMarker,
                  {
                    left: ((stepNumber - 1) / (progress.totalSteps - 1)) * (width - 60) - 4,
                  }
                ]}
              >
                <View
                  style={[
                    styles.markerDot,
                    isCompleted && styles.markerCompleted,
                    isCurrent && styles.markerCurrent,
                  ]}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={8} color="#ffffff" />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationContainer}>
        <Text style={styles.motivationText}>
          {getMotivationalMessage(progressPercentage)}
        </Text>
      </View>
    </Animated.View>
  );
};

const getMotivationalMessage = (percentage: number): string => {
  if (percentage <= 25) {
    return "Great start! Let's create your perfect space 🏠";
  } else if (percentage <= 50) {
    return "You're doing amazing! Halfway there ⭐";
  } else if (percentage <= 75) {
    return "Almost ready for your AI design! 🎨";
  } else if (percentage < 100) {
    return "So close! Your design is almost ready ✨";
  } else {
    return "Perfect! Your AI-powered design is ready 🎉";
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepInfo: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b8c6db',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4facfe',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressForeground: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 3,
  },
  progressDot: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#4facfe',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  dotGradient: {
    flex: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stepMarker: {
    position: 'absolute',
    top: '50%',
    marginTop: -4,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerCompleted: {
    backgroundColor: '#4facfe',
  },
  markerCurrent: {
    backgroundColor: '#4facfe',
    transform: [{ scale: 1.2 }],
  },
  motivationContainer: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default JourneyProgressBar;