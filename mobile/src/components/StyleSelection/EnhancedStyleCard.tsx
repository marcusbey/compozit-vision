import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInUp, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { SvgProps } from 'react-native-svg';

import { StyleReference } from '../../types/aiProcessing';
import { AssetManager, StyleType, StyleMetadata } from '../../assets';
import { colors } from '../../theme/colors';

interface EnhancedStyleCardProps {
  style: StyleReference;
  isSelected: boolean;
  onSelect: (style: StyleReference) => void;
  index: number;
  size?: 'small' | 'medium' | 'large';
  showMetadata?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_SIZES = {
  small: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 120,
  },
  medium: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 160,
  },
  large: {
    width: SCREEN_WIDTH - 40,
    height: 200,
  },
};

const EnhancedStyleCard: React.FC<EnhancedStyleCardProps> = ({
  style,
  isSelected,
  onSelect,
  index,
  size = 'medium',
  showMetadata = true,
}) => {
  const animationValue = useSharedValue(1);
  
  // Get style metadata
  const styleType = style.slug as StyleType;
  const metadata: StyleMetadata | null = styleType ? AssetManager.getStyleMetadata(styleType) : null;
  const illustration = metadata?.illustration;
  
  const cardSize = CARD_SIZES[size];

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      const { HapticFeedbackTypes, impactAsync } = require('expo-haptics');
      impactAsync(HapticFeedbackTypes.Light);
    }

    // Animate press
    animationValue.value = withSpring(0.95, { duration: 100 }, () => {
      animationValue.value = withSpring(1, { duration: 150 }, () => {
        runOnJS(onSelect)(style);
      });
    });
  };

  // Animated style for press feedback
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animationValue.value }],
    };
  });

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600)}
      style={[
        {
          width: cardSize.width,
          height: cardSize.height,
        },
        index % 2 === 1 && size === 'medium' && { marginLeft: 20 },
        index % 3 !== 0 && size === 'small' && { marginLeft: 10 },
      ]}
    >
      <Animated.View style={animatedCardStyle}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={[
            styles.container,
            isSelected && styles.containerSelected,
            { height: cardSize.height },
          ]}
          accessible={true}
          accessibilityLabel={`${style.name} style reference`}
          accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} this style`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          {/* Illustration Background */}
          <View style={styles.illustrationContainer}>
            {illustration ? (
              <View style={styles.illustrationWrapper}>
                {/* SVG illustrations will be rendered here */}
                <Ionicons 
                  name="home-outline" 
                  size={32} 
                  color={colors.primary[400]} 
                />
              </View>
            ) : (
              <LinearGradient
                colors={metadata?.colorPalette?.slice(0, 2) as [string, string] || [colors.gray[700], colors.gray[600]] as [string, string]}
                style={styles.fallbackGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name="home-outline" 
                  size={32} 
                  color={colors.gray[300]} 
                />
              </LinearGradient>
            )}

            {/* Selection indicator */}
            {isSelected && (
              <Animated.View 
                entering={FadeInRight.duration(300)}
                style={styles.selectionBadge}
              >
                <BlurView intensity={80} style={styles.selectionBadgeBlur}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary[400]} />
                </BlurView>
              </Animated.View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[
              styles.title,
              isSelected && styles.titleSelected,
              size === 'small' && styles.titleSmall,
            ]} numberOfLines={1}>
              {style.name}
            </Text>
            
            {showMetadata && metadata && size !== 'small' && (
              <Text style={[
                styles.mood,
                isSelected && styles.moodSelected,
              ]} numberOfLines={1}>
                {metadata.mood}
              </Text>
            )}

            {/* Color palette preview */}
            {metadata?.colorPalette && size !== 'small' && (
              <View style={styles.colorPalette}>
                {metadata.colorPalette.slice(0, 4).map((color, colorIndex) => (
                  <View
                    key={colorIndex}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Key features */}
            {showMetadata && metadata?.keyFeatures && size === 'large' && (
              <View style={styles.features}>
                {metadata.keyFeatures.slice(0, 2).map((feature, featureIndex) => (
                  <View key={featureIndex} style={[
                    styles.featureTag,
                    isSelected && styles.featureTagSelected,
                  ]}>
                    <Text style={[
                      styles.featureText,
                      isSelected && styles.featureTextSelected,
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[800],
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: colors.primary[400],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  illustrationContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.gray[700],
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectionBadgeBlur: {
    padding: 6,
  },
  content: {
    padding: 12,
    backgroundColor: colors.gray[800],
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[100],
    marginBottom: 2,
  },
  titleSelected: {
    color: colors.primary[300],
  },
  titleSmall: {
    fontSize: 12,
  },
  mood: {
    fontSize: 11,
    color: colors.gray[400],
    marginBottom: 6,
    fontStyle: 'italic',
  },
  moodSelected: {
    color: colors.gray[300],
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: colors.gray[600],
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureTag: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureTagSelected: {
    backgroundColor: colors.primary[600],
  },
  featureText: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.gray[300],
  },
  featureTextSelected: {
    color: colors.gray[50],
  },
});

export default EnhancedStyleCard;