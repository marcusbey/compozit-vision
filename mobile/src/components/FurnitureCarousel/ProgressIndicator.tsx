import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ProgressIndicatorProps } from '../../types/furniture';
import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentCategory,
  totalCategories,
  categoryName,
  onCategoryTap,
  showLabels = true,
}) => {
  const progressWidth = (currentCategory / totalCategories) * 100;

  const renderDots = () => {
    return Array.from({ length: totalCategories }, (_, index) => {
      const isActive = index + 1 <= currentCategory;
      const isCurrent = index + 1 === currentCategory;
      
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.dot,
            isActive && styles.activeDot,
            isCurrent && styles.currentDot,
          ]}
          onPress={() => onCategoryTap?.(index)}
          disabled={!onCategoryTap}
        >
          {isActive && (
            <Icon 
              name="check" 
              size={12} 
              color="white" 
            />
          )}
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.countContainer}>
          <Text style={styles.currentCount}>{currentCategory}</Text>
          <Text style={styles.separator}>of</Text>
          <Text style={styles.totalCount}>{totalCategories}</Text>
        </View>
        
        {showLabels && (
          <Text style={styles.categoryName}>{categoryName}</Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: `${progressWidth}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {renderDots()}
      </View>

      {/* Step Labels */}
      {showLabels && (
        <View style={styles.stepLabelsContainer}>
          <Text style={styles.stepLabel}>Select Styles</Text>
          <Text style={styles.stepProgress}>
            {Math.round(progressWidth)}% Complete
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  separator: {
    fontSize: 18,
    color: colors.gray[500],
    marginHorizontal: 8,
  },
  totalCount: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[700],
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  activeDot: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  currentDot: {
    borderColor: colors.primary[600],
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  stepProgress: {
    fontSize: 12,
    color: colors.gray[500],
  },
});