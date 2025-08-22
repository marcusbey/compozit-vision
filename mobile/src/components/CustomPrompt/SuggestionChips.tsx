import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { colors } from '../../theme/colors';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
  maxChips?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSuggestionPress,
  maxChips = 8,
}) => {
  const displayedSuggestions = suggestions.slice(0, maxChips);

  const ChipComponent: React.FC<{ suggestion: string; index: number }> = ({
    suggestion,
    index,
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handlePress = () => {
      // Animate press
      scale.value = withSpring(0.95, { duration: 100 }, () => {
        scale.value = withSpring(1);
      });
      
      // Add slight fade effect
      opacity.value = withSpring(0.7, { duration: 50 }, () => {
        opacity.value = withSpring(1);
      });

      onSuggestionPress(suggestion);
    };

    const getChipColor = () => {
      const colors_list = [
        colors.primary[100],
        colors.secondary[100],
        colors.gray[100],
      ];
      return colors_list[index % colors_list.length];
    };

    const getTextColor = () => {
      const text_colors = [
        colors.primary[700],
        colors.secondary[700],
        colors.gray[700],
      ];
      return text_colors[index % text_colors.length];
    };

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: getChipColor() },
          animatedStyle,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Icon name="add" size={14} color={getTextColor()} />
        <Text style={[styles.chipText, { color: getTextColor() }]}>
          {suggestion}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  if (displayedSuggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No suggestions available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quick suggestions:</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.chipsContainer}>
          {displayedSuggestions.map((suggestion, index) => (
            <ChipComponent
              key={`${suggestion}-${index}`}
              suggestion={suggestion}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
    marginBottom: 8,
  },
  scrollContainer: {
    paddingRight: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.gray[400],
    fontStyle: 'italic',
  },
});