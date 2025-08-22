import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

interface ActionButtonsProps {
  onLike: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onLike,
  onSkip,
  disabled = false,
}) => {
  const skipScale = useSharedValue(1);
  const likeScale = useSharedValue(1);
  const skipOpacity = useSharedValue(1);
  const likeOpacity = useSharedValue(1);

  // Animation styles
  const skipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
    opacity: skipOpacity.value,
  }));

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
    opacity: likeOpacity.value,
  }));

  const handleSkipPress = () => {
    if (disabled) return;
    
    // Animate button press
    skipScale.value = withSpring(0.9, { duration: 100 }, () => {
      skipScale.value = withSpring(1);
    });
    
    onSkip();
  };

  const handleLikePress = () => {
    if (disabled) return;
    
    // Animate button press
    likeScale.value = withSpring(0.9, { duration: 100 }, () => {
      likeScale.value = withSpring(1);
    });
    
    onLike();
  };

  // Update opacity based on disabled state
  React.useEffect(() => {
    const targetOpacity = disabled ? 0.5 : 1;
    skipOpacity.value = withTiming(targetOpacity, { duration: 200 });
    likeOpacity.value = withTiming(targetOpacity, { duration: 200 });
  }, [disabled, skipOpacity, likeOpacity]);

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <AnimatedTouchableOpacity
        style={[styles.button, styles.skipButton, skipAnimatedStyle]}
        onPress={handleSkipPress}
        disabled={disabled}
        activeOpacity={0.8}
        testID="skip-button"
      >
        <View style={styles.iconContainer}>
          <Icon 
            name="close" 
            size={28} 
            color={colors.gray[600]} 
          />
        </View>
      </AnimatedTouchableOpacity>

      {/* Like Button */}
      <AnimatedTouchableOpacity
        style={[styles.button, styles.likeButton, likeAnimatedStyle]}
        onPress={handleLikePress}
        disabled={disabled}
        activeOpacity={0.8}
        testID="like-button"
      >
        <View style={styles.iconContainer}>
          <Icon 
            name="favorite" 
            size={28} 
            color="white" 
          />
        </View>
      </AnimatedTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 20,
    backgroundColor: colors.gray[50],
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  skipButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  likeButton: {
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});