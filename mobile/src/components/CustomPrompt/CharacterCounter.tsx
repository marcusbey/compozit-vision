import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';

interface CharacterCounterProps {
  current: number;
  max: number;
  style?: ViewStyle;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  style,
}) => {
  const progress = current / max;

  // Animated color based on character count
  const animatedStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      progress,
      [0, 0.7, 0.9, 1],
      [colors.gray[400], colors.gray[500], colors.secondary[500], colors.red?.[500] || '#EF4444']
    );

    return {
      color: textColor,
    };
  });

  const getProgressMessage = () => {
    if (progress >= 1) {
      return 'Character limit reached';
    } else if (progress >= 0.9) {
      return `${max - current} characters left`;
    } else {
      return `${current}/${max}`;
    }
  };

  return (
    <Animated.Text style={[styles.counter, animatedStyle, style]}>
      {getProgressMessage()}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  counter: {
    fontSize: 10,
    fontWeight: '500',
  },
});