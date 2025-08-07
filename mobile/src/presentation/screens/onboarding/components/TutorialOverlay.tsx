// Tutorial Overlay Component for Feature Highlights
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-blur/blur';

interface TutorialOverlayProps {
  visible: boolean;
  title: string;
  description: string;
  targetPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onNext?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  isLastStep?: boolean;
}

const { width, height } = Dimensions.get('window');

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  visible,
  title,
  description,
  targetPosition,
  onNext,
  onSkip,
  onClose,
  nextButtonText = 'Next',
  skipButtonText = 'Skip',
  isLastStep = false
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const renderHighlight = () => {
    if (!targetPosition) return null;

    const { x, y, width: targetWidth, height: targetHeight } = targetPosition;
    const spotlightRadius = Math.max(targetWidth, targetHeight) / 2 + 20;

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <View
          style={[
            styles.highlight,
            {
              left: x - 10,
              top: y - 10,
              width: targetWidth + 20,
              height: targetHeight + 20,
              borderRadius: Math.min(targetWidth, targetHeight) / 2 + 10,
            }
          ]}
        />
        <View
          style={[
            styles.spotlight,
            {
              left: x + targetWidth / 2 - spotlightRadius,
              top: y + targetHeight / 2 - spotlightRadius,
              width: spotlightRadius * 2,
              height: spotlightRadius * 2,
              borderRadius: spotlightRadius,
            }
          ]}
        />
      </View>
    );
  };

  const renderTooltip = () => {
    let tooltipStyle = styles.tooltip;
    let arrowStyle = styles.arrow;

    if (targetPosition) {
      const { x, y, width: targetWidth, height: targetHeight } = targetPosition;
      const tooltipY = y + targetHeight + 20;
      
      if (tooltipY + 150 > height) {
        // Position above target
        tooltipStyle = {
          ...tooltipStyle,
          top: y - 160,
          left: Math.max(20, Math.min(x - 100, width - 220)),
        };
        arrowStyle = {
          ...arrowStyle,
          top: 140,
          transform: [{ rotate: '180deg' }],
        };
      } else {
        // Position below target
        tooltipStyle = {
          ...tooltipStyle,
          top: tooltipY,
          left: Math.max(20, Math.min(x - 100, width - 220)),
        };
        arrowStyle = {
          ...arrowStyle,
          top: -10,
        };
      }
    } else {
      // Center tooltip
      tooltipStyle = {
        ...tooltipStyle,
        top: height / 2 - 100,
        left: 20,
        right: 20,
      };
    }

    return (
      <Animated.View
        style={[
          tooltipStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {targetPosition && <View style={arrowStyle} />}
        <Text style={styles.tooltipTitle}>{title}</Text>
        <Text style={styles.tooltipDescription}>{description}</Text>
        <View style={styles.buttonContainer}>
          {onSkip && !isLastStep && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{skipButtonText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={isLastStep ? onClose : onNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? 'Got it!' : nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.7)"
        />
        {renderHighlight()}
        {renderTooltip()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipDescription: {
    fontSize: 16,
    color: '#6E6E73',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#6E6E73',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});