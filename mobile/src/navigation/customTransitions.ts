import { StackCardInterpolationProps, StackCardInterpolatedStyle } from '@react-navigation/stack';
import { Animated } from 'react-native';

// Track navigation direction globally
let navigationDirection: 'forward' | 'backward' = 'forward';

export const setNavigationDirection = (direction: 'forward' | 'backward') => {
  navigationDirection = direction;
};

export const getNavigationDirection = () => navigationDirection;

// Custom interpolator that handles directional transitions
export const directionalCardInterpolator = ({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle => {
  const isGoingBack = navigationDirection === 'backward';
  
  // Progress interpolation for the focused screen (the one being navigated to)
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [isGoingBack ? -screen.width : screen.width, 0],
      extrapolate: 'clamp',
    }),
    inverted
  );

  // Progress interpolation for the unfocused screen (the one being navigated from)
  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, isGoingBack ? screen.width : -screen.width],
          extrapolate: 'clamp',
        }),
        inverted
      )
    : 0;

  // Opacity for fade effect
  const opacity = current.progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.9, 1, 1],
    extrapolate: 'clamp',
  });

  // Shadow opacity for depth effect
  const shadowOpacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.1, 0],
    extrapolate: 'clamp',
  });

  return {
    cardStyle: {
      opacity,
      transform: [
        { translateX: translateFocused },
        { translateX: translateUnfocused },
      ],
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: shadowOpacity as any,
      shadowRadius: 5,
      elevation: 4,
    },
  };
};

// Screen-specific transition configurations
export const getScreenOptions = (screenName: string) => {
  // Apply directional transitions to all screens
  return {
    cardStyleInterpolator: directionalCardInterpolator,
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    // Add transition spec for smoother animations
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
      },
      close: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 500,
          mass: 3,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
      },
    },
  };
};