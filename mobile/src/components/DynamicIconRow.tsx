import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RelevantIcon } from '../types/contextAnalysis';
import { tokens } from '../theme/tokens';

interface DynamicIconRowProps {
  icons: RelevantIcon[];
  onIconPress: (icon: RelevantIcon) => void;
  loading?: boolean;
  maxVisible?: number;
}

export const DynamicIconRow: React.FC<DynamicIconRowProps> = ({
  icons,
  onIconPress,
  loading = false,
  maxVisible = 5
}) => {
  const animatedValues = useRef<Animated.Value[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize animated values for each icon
  useEffect(() => {
    animatedValues.current = icons.map(() => new Animated.Value(0));
  }, [icons.length]);

  // Animate icons when they change
  useEffect(() => {
    if (!loading && icons.length > 0) {
      // Reset all values
      animatedValues.current.forEach(anim => anim.setValue(0));

      // Stagger animations
      const animations = animatedValues.current.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true
        })
      );

      Animated.stagger(50, animations).start();
    }
  }, [loading, icons]);

  if (loading) {
    return <IconRowSkeleton />;
  }

  if (icons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No suggestions available</Text>
      </View>
    );
  }

  const visibleIcons = icons.slice(0, maxVisible);
  const hiddenCount = icons.length - maxVisible;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {visibleIcons.map((icon, index) => (
          <Animated.View
            key={icon.id}
            style={[
              styles.iconWrapper,
              {
                opacity: animatedValues.current[index] || new Animated.Value(1),
                transform: [{
                  translateY: animatedValues.current[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  }) || 0
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.iconButton,
                icon.score > 0.8 && styles.highRelevanceIcon
              ]}
              onPress={() => onIconPress(icon)}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>{icon.icon}</Text>
                {icon.badge && (
                  <View style={[
                    styles.badge,
                    icon.badge === 'Recommended' && styles.recommendedBadge
                  ]}>
                    <Text style={styles.badgeText}>
                      {icon.badge === 'Recommended' ? '✓' : icon.badge.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text style={styles.iconLabel} numberOfLines={1}>
                {icon.label}
              </Text>

              {/* Relevance indicator */}
              {icon.score > 0.7 && (
                <View style={styles.relevanceIndicator}>
                  <View style={[
                    styles.relevanceDot,
                    { width: `${icon.score * 100}%` }
                  ]} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* More icons indicator */}
        {hiddenCount > 0 && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              // Could expand to show all icons or navigate to a full view
              console.log(`${hiddenCount} more icons available`);
            }}
          >
            <View style={styles.moreIconContainer}>
              <Ionicons name="ellipsis-horizontal" size={24} color={tokens.color.textSecondary} />
              <Text style={styles.moreText}>+{hiddenCount}</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Loading skeleton component
const IconRowSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {[1, 2, 3, 4, 5].map(index => (
          <Animated.View
            key={index}
            style={[
              styles.skeletonIcon,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7]
                })
              }
            ]}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    marginVertical: tokens.spacing.sm,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  iconWrapper: {
    marginRight: tokens.spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    padding: tokens.spacing.xs,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    minWidth: 70,
    height: 80,
  },
  highRelevanceIcon: {
    borderColor: tokens.color.brand + '40',
    backgroundColor: tokens.color.brand + '08',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: tokens.spacing.xs,
  },
  iconEmoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  iconLabel: {
    ...tokens.type.caption,
    color: tokens.color.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: tokens.color.brand,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadge: {
    backgroundColor: tokens.color.success,
  },
  badgeText: {
    color: tokens.color.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  relevanceIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: tokens.color.borderSoft,
    borderBottomLeftRadius: tokens.radius.md,
    borderBottomRightRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  relevanceDot: {
    height: '100%',
    backgroundColor: tokens.color.brand,
  },
  moreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  moreIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderStyle: 'dashed',
  },
  moreText: {
    ...tokens.type.caption,
    color: tokens.color.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  emptyText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  skeletonIcon: {
    width: 70,
    height: 80,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    marginRight: tokens.spacing.sm,
  },
});