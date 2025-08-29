import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { UserFavorite } from '../../services/userFavoritesService';

// Design tokens
const tokens = {
  color: {
    brand: "#C9A98C",
    brandHover: "#B9906F",
    textMuted: "#7A7A7A",
    error: "#F44336",
    surface: "#FFFFFF",
    scrim: "rgba(28,28,28,0.45)",
  },
  radius: { sm: 8, md: 12 },
  shadow: {
    e2: { 
      shadowColor: "#000", 
      shadowOpacity: 0.08, 
      shadowRadius: 12, 
      shadowOffset: { width: 0, height: 4 }, 
      elevation: 4 
    },
  },
};

export interface FavoriteButtonProps {
  itemType: UserFavorite['item_type'];
  itemId: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showBackground?: boolean;
  collectionId?: string;
  onToggle?: (isFavorite: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemType,
  itemId,
  size = 'medium',
  style,
  showBackground = false,
  collectionId,
  onToggle,
  disabled = false,
  accessibilityLabel,
}) => {
  // Store and state
  const { 
    getFavoriteStatus, 
    toggleFavorite, 
    isLoading, 
    error 
  } = useFavoritesStore();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [optimisticFavorite, setOptimisticFavorite] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Animation values
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(1);

  // Get initial favorite status
  const isFavorite = getFavoriteStatus(itemType, itemId);

  // Update optimistic state when store updates
  useEffect(() => {
    setOptimisticFavorite(isFavorite);
    setHasError(false);
  }, [isFavorite]);

  // Clear error when not loading
  useEffect(() => {
    if (!localLoading && !isLoading) {
      setHasError(false);
    }
  }, [localLoading, isLoading]);

  // Size configurations
  const sizeConfig = {
    small: { 
      containerSize: 32, 
      iconSize: 16, 
      touchTarget: 44 
    },
    medium: { 
      containerSize: 40, 
      iconSize: 20, 
      touchTarget: 44 
    },
    large: { 
      containerSize: 48, 
      iconSize: 24, 
      touchTarget: 48 
    },
  };

  const config = sizeConfig[size];

  // Animation functions
  const animatePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateError = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle favorite toggle
  const handleToggle = async () => {
    if (disabled || localLoading) return;

    try {
      setLocalLoading(true);
      setHasError(false);

      // Haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Optimistic update
      const newFavoriteStatus = !optimisticFavorite;
      setOptimisticFavorite(newFavoriteStatus);
      animatePress();

      // Call the store action
      const result = await toggleFavorite(itemType, itemId, collectionId);
      
      // Callback for parent components
      onToggle?.(result);

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      
      // Rollback optimistic update
      setOptimisticFavorite(!optimisticFavorite);
      setHasError(true);
      animateError();

      // Show error feedback
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Show error alert
      Alert.alert(
        'Error',
        'Failed to update favorite. Please try again.',
        [{ text: 'OK', onPress: () => setHasError(false) }]
      );

    } finally {
      setLocalLoading(false);
    }
  };

  // Rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  // Dynamic styles
  const containerStyle = [
    styles.container,
    {
      width: config.containerSize,
      height: config.containerSize,
      minWidth: config.touchTarget,
      minHeight: config.touchTarget,
    },
    showBackground && styles.backgroundContainer,
    showBackground && tokens.shadow.e2,
    hasError && styles.errorContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const iconColor = optimisticFavorite 
    ? tokens.color.brand 
    : hasError 
    ? tokens.color.error 
    : tokens.color.textMuted;

  const iconName = optimisticFavorite ? 'heart' : 'heart-outline';

  // Accessibility
  const accessibilityState = {
    selected: optimisticFavorite,
    busy: localLoading || isLoading,
    disabled: disabled,
  };

  const defaultAccessibilityLabel = optimisticFavorite 
    ? `Remove from favorites` 
    : `Add to favorites`;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handleToggle}
      disabled={disabled || localLoading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityState={accessibilityState}
      accessibilityHint={optimisticFavorite ? "Double tap to remove from favorites" : "Double tap to add to favorites"}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <Ionicons 
          name={iconName}
          size={config.iconSize}
          color={iconColor}
        />
        
        {/* Loading indicator overlay */}
        {(localLoading || isLoading) && (
          <Animated.View style={styles.loadingOverlay}>
            <Ionicons 
              name="hourglass-outline"
              size={config.iconSize * 0.8}
              color={tokens.color.textMuted}
            />
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
  },
  backgroundContainer: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.brand,
  },
  errorContainer: {
    backgroundColor: `${tokens.color.error}10`,
    borderColor: tokens.color.error,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.color.scrim,
    borderRadius: tokens.radius.sm,
    width: '100%',
    height: '100%',
  },
});

export default FavoriteButton;