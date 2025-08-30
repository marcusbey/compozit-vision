import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { StyleCard } from './StyleCard';
import { ProgressIndicator } from './ProgressIndicator';
import { ActionButtons } from './ActionButtons';
import {
  FurnitureCarouselProps,
  FurnitureStyle,
  FurnitureSelection,
  SwipeGesture,
  CarouselState,
  CarouselAction
} from '../../types/furniture';
import { MOCK_FURNITURE_STYLES } from '../../services/furniture/SpaceAnalysisService';
import { colors } from '../../theme/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Swipe thresholds and animation config
const SWIPE_THRESHOLD = screenWidth * 0.25;
const VELOCITY_THRESHOLD = 800;
const CARD_ROTATION_MAX = 15; // degrees
const CARD_SCALE_MIN = 0.95;

const SPRING_CONFIG = {
  damping: 20,
  mass: 1,
  stiffness: 100,
};

export const FurnitureCarousel: React.FC<FurnitureCarouselProps> = ({
  categories,
  onStyleSelect,
  onStyleSkip,
  onCategoryComplete,
  onAllCategoriesComplete,
  initialCategoryIndex = 0,
  animationDuration = 300,
  gesturesEnabled = true,
}) => {
  // State management
  const [carouselState, setCarouselState] = useState<CarouselState>({
    currentCategoryIndex: initialCategoryIndex,
    currentStyleIndex: 0,
    totalCategories: categories.length,
    isTransitioning: false,
    gestureEnabled: gesturesEnabled,
  });

  const [selections, setSelections] = useState<FurnitureSelection[]>([]);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Refs
  // Gesture ref not needed with new API

  // Get current category and styles
  const currentCategory = categories[carouselState.currentCategoryIndex];
  const currentStyles = useMemo(() => {
    if (!currentCategory) return [];
    return MOCK_FURNITURE_STYLES[currentCategory.id] || [];
  }, [currentCategory]);

  const currentStyle = currentStyles[carouselState.currentStyleIndex];

  // Animation reset function
  const resetCardPosition = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    rotate.value = withSpring(0, SPRING_CONFIG);
    scale.value = withSpring(1, SPRING_CONFIG);
    opacity.value = withSpring(1, SPRING_CONFIG);
  }, [translateX, translateY, rotate, scale, opacity]);

  // Handle swipe gesture detection
  const detectSwipeGesture = (
    translationX: number,
    translationY: number,
    velocityX: number,
    velocityY: number
  ): SwipeGesture | null => {
    'worklet';
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);
    const absVelX = Math.abs(velocityX);
    const absVelY = Math.abs(velocityY);

    // Check if it's a valid swipe (distance or velocity based)
    const isValidDistance = absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD;
    const isValidVelocity = absVelX > VELOCITY_THRESHOLD || absVelY > VELOCITY_THRESHOLD;

    if (!isValidDistance && !isValidVelocity) {
      return null;
    }

    // Determine primary direction
    let direction: 'left' | 'right' | 'up' | 'down';
    if (absX > absY) {
      direction = translationX > 0 ? 'right' : 'left';
    } else {
      direction = translationY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      velocity: direction === 'left' || direction === 'right' ? velocityX : velocityY,
      distance: direction === 'left' || direction === 'right' ? translationX : translationY,
      isValidSwipe: true,
    };
  };

  // Handle card actions
  const handleCardAction = useCallback((action: CarouselAction) => {
    if (!currentStyle || carouselState.isTransitioning) return;

    setCarouselState(prev => ({ ...prev, isTransitioning: true }));

    const isLike = action === 'SWIPE_RIGHT' || action === 'TAP_HEART';
    const isSkip = action === 'SWIPE_LEFT' || action === 'TAP_X' || action === 'SWIPE_DOWN';

    if (isLike) {
      onStyleSelect(currentCategory.id, currentStyle);
    } else if (isSkip) {
      onStyleSkip(currentCategory.id, currentStyle);
    }

    // Update selections
    setSelections(prev => {
      const existing = prev.find(s => s.categoryId === currentCategory.id);
      if (existing) {
        return prev.map(s => 
          s.categoryId === currentCategory.id
            ? {
                ...s,
                selectedStyles: isLike ? [...s.selectedStyles, currentStyle] : s.selectedStyles,
                skippedStyles: isSkip ? [...s.skippedStyles, currentStyle] : s.skippedStyles,
                timestamp: Date.now(),
              }
            : s
        );
      } else {
        return [...prev, {
          categoryId: currentCategory.id,
          selectedStyles: isLike ? [currentStyle] : [],
          skippedStyles: isSkip ? [currentStyle] : [],
          timestamp: Date.now(),
        }];
      }
    });

    // Move to next style or category
    setTimeout(() => {
      const nextStyleIndex = carouselState.currentStyleIndex + 1;
      
      if (nextStyleIndex >= currentStyles.length) {
        // Category complete
        const currentSelection = selections.find(s => s.categoryId === currentCategory.id) || {
          categoryId: currentCategory.id,
          selectedStyles: isLike ? [currentStyle] : [],
          skippedStyles: isSkip ? [currentStyle] : [],
          timestamp: Date.now(),
        };
        
        onCategoryComplete(currentCategory.id, currentSelection);
        
        if (carouselState.currentCategoryIndex + 1 >= categories.length) {
          // All categories complete
          onAllCategoriesComplete([...selections, currentSelection]);
        } else {
          // Move to next category
          setCarouselState(prev => ({
            ...prev,
            currentCategoryIndex: prev.currentCategoryIndex + 1,
            currentStyleIndex: 0,
            isTransitioning: false,
          }));
        }
      } else {
        // Move to next style in same category
        setCarouselState(prev => ({
          ...prev,
          currentStyleIndex: nextStyleIndex,
          isTransitioning: false,
        }));
      }

      resetCardPosition();
    }, animationDuration);
  }, [
    currentStyle,
    currentCategory,
    currentStyles,
    carouselState,
    selections,
    onStyleSelect,
    onStyleSkip,
    onCategoryComplete,
    onAllCategoriesComplete,
    resetCardPosition,
    animationDuration,
  ]);

  // Gesture handler using new Gesture API
  const panGestureHandler = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      // Store starting position using shared values
      const startX = translateX.value;
      const startY = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (!carouselState.gestureEnabled) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Calculate rotation based on horizontal movement
      const rotationIntensity = event.translationX / screenWidth;
      rotate.value = rotationIntensity * CARD_ROTATION_MAX;

      // Calculate scale based on distance from center
      const distance = Math.sqrt(
        Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
      );
      const scaleIntensity = distance / (screenWidth * 0.5);
      scale.value = Math.max(CARD_SCALE_MIN, 1 - scaleIntensity * 0.1);

      // Calculate opacity based on horizontal movement
      const opacityIntensity = Math.abs(event.translationX) / screenWidth;
      opacity.value = Math.max(0.7, 1 - opacityIntensity * 0.3);
    })
    .onEnd((event) => {
      'worklet';
      if (!carouselState.gestureEnabled) return;

      const gesture = detectSwipeGesture(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (gesture) {
        // Animate card off screen
        const exitX = gesture.direction === 'left' ? -screenWidth * 1.5 : screenWidth * 1.5;
        const exitY = gesture.direction === 'up' ? -screenHeight * 1.5 : 
                     gesture.direction === 'down' ? screenHeight * 1.5 : 0;

        translateX.value = withTiming(exitX, { duration: animationDuration });
        translateY.value = withTiming(exitY, { duration: animationDuration });
        opacity.value = withTiming(0, { duration: animationDuration });

        // Handle the action
        let action: CarouselAction;
        switch (gesture.direction) {
          case 'right':
            action = 'SWIPE_RIGHT';
            break;
          case 'left':
            action = 'SWIPE_LEFT';
            break;
          case 'up':
            action = 'SWIPE_UP';
            break;
          case 'down':
            action = 'SWIPE_DOWN';
            break;
        }

        runOnJS(handleCardAction)(action);
      } else {
        // Snap back to center
        resetCardPosition();
      }
    });

  // Animated style for the card
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Handle action button presses
  const handleActionPress = useCallback((action: CarouselAction) => {
    if (action === 'TAP_HEART') {
      // Animate to right
      translateX.value = withTiming(screenWidth * 1.5, { duration: animationDuration });
      opacity.value = withTiming(0, { duration: animationDuration });
    } else if (action === 'TAP_X') {
      // Animate to left  
      translateX.value = withTiming(-screenWidth * 1.5, { duration: animationDuration });
      opacity.value = withTiming(0, { duration: animationDuration });
    }
    
    handleCardAction(action);
  }, [handleCardAction, translateX, opacity, animationDuration]);

  if (!currentStyle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more styles to show</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      <ProgressIndicator
        currentCategory={carouselState.currentCategoryIndex + 1}
        totalCategories={carouselState.totalCategories}
        categoryName={currentCategory.displayName}
        showLabels
      />

      {/* Card Container */}
      <View style={styles.cardContainer}>
        <GestureDetector gesture={panGestureHandler}>
          <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
            <StyleCard
              style={currentStyle}
              isActive
              onLike={() => handleActionPress('TAP_HEART')}
              onSkip={() => handleActionPress('TAP_X')}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action Buttons */}
      <ActionButtons
        onLike={() => handleActionPress('TAP_HEART')}
        onSkip={() => handleActionPress('TAP_X')}
        disabled={carouselState.isTransitioning}
      />

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{currentCategory.displayName}</Text>
        <Text style={styles.categoryDescription}>{currentCategory.description}</Text>
        <Text style={styles.styleCounter}>
          {carouselState.currentStyleIndex + 1} of {currentStyles.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.gray[500],
    textAlign: 'center',
  },
  categoryInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  styleCounter: {
    fontSize: 14,
    color: colors.gray[500],
  },
});