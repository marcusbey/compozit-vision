import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
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
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { StyleReference, RoomType } from '../../types/aiProcessing';
import { spaceAnalysisService } from '../../services/spaceAnalysis';
import { colors } from '../../theme/colors';

interface StyleGridProps {
  roomType?: RoomType;
  onSelectionChange: (selectedStyles: StyleReference[]) => void;
  maxSelections?: number;
  initialSelectedIds?: string[];
  refreshTrigger?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with 20px padding and 20px gap
const ITEM_HEIGHT = ITEM_WIDTH * 1.2; // 1.2 aspect ratio for cards

// Professional style reference images (high-quality placeholders)
const STYLE_IMAGES: Record<string, string> = {
  modern: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
  traditional: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
  eclectic: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80',
  minimalist: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80',
  industrial: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80',
  scandinavian: 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=500&q=80',
  bohemian: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80',
};

const StyleGrid: React.FC<StyleGridProps> = ({
  roomType,
  onSelectionChange,
  maxSelections = 2,
  initialSelectedIds = [],
  refreshTrigger = 0,
}) => {
  const [styles, setStyles] = useState<StyleReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const animationValue = useSharedValue(1);

  // Load initial styles
  const loadStyles = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const newStyles = await spaceAnalysisService.getStyleReferences();
      
      // Mock additional styles for demonstration (in real app, this comes from API)
      const mockStyles = generateMockStyles(pageNum);
      const allNewStyles = [...newStyles, ...mockStyles];

      if (append) {
        setStyles(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNewStyles = allNewStyles.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNewStyles];
        });
      } else {
        setStyles(allNewStyles);
      }

      // Check if there's more data (in real app, this comes from API pagination)
      setHasMoreData(pageNum < 4); // Mock: 4 pages total
      
    } catch (err) {
      console.error('Failed to load styles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load styles');
      
      // Show user-friendly error
      Alert.alert(
        'Loading Error',
        'Unable to load style references. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  // Generate mock styles for demonstration
  const generateMockStyles = (pageNum: number): StyleReference[] => {
    const baseStyles = [
      'modern', 'traditional', 'eclectic', 'minimalist', 
      'industrial', 'scandinavian', 'bohemian'
    ];
    
    return baseStyles.map((style, index) => ({
      id: `${style}-${pageNum}-${index}`,
      name: style.charAt(0).toUpperCase() + style.slice(1),
      slug: style,
      description: `${style.charAt(0).toUpperCase() + style.slice(1)} style design with professional quality references`,
      category: style as any,
      characteristicTags: [`${style} design`, 'professional', 'curated'],
      colorPalettes: [],
      furnitureStyles: [],
      ambianceOptions: [],
      roomExamples: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Handle style selection
  const handleStyleSelect = useCallback((style: StyleReference) => {
    const isSelected = selectedIds.includes(style.id);
    
    if (isSelected) {
      // Remove from selection
      const newSelectedIds = selectedIds.filter(id => id !== style.id);
      setSelectedIds(newSelectedIds);
      
      const newSelectedStyles = styles.filter(s => newSelectedIds.includes(s.id));
      onSelectionChange(newSelectedStyles);
    } else {
      // Add to selection
      if (selectedIds.length >= maxSelections) {
        Alert.alert(
          'Selection Limit',
          `You can select up to ${maxSelections} styles. Please remove a style first.`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      const newSelectedIds = [...selectedIds, style.id];
      setSelectedIds(newSelectedIds);
      
      const newSelectedStyles = styles.filter(s => newSelectedIds.includes(s.id));
      onSelectionChange(newSelectedStyles);
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      const { HapticFeedbackTypes, impactAsync } = require('expo-haptics');
      impactAsync(HapticFeedbackTypes.Light);
    }

    // Animate selection
    animationValue.value = withSpring(0.95, { duration: 100 }, () => {
      animationValue.value = withSpring(1, { duration: 150 });
    });
  }, [selectedIds, styles, maxSelections, onSelectionChange, animationValue]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadStyles(nextPage, true);
    }
  }, [loadingMore, hasMoreData, page, loadStyles]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    setSelectedIds([]);
    loadStyles(1, false);
  }, [loadStyles]);

  // Memoized style calculations
  const gridItemStyle = useMemo(() => ({
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: 20,
  }), []);

  // Load styles on mount and refresh trigger
  useEffect(() => {
    loadStyles();
  }, [loadStyles, refreshTrigger]);

  // Animated style for selection feedback
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animationValue.value }],
    };
  });

  const renderStyleItem = (style: StyleReference, index: number) => {
    const isSelected = selectedIds.includes(style.id);
    const imageUri = STYLE_IMAGES[style.slug] || STYLE_IMAGES.modern;
    
    return (
      <Animated.View
        key={style.id}
        entering={FadeInUp.delay(index * 100).duration(600)}
        style={[
          gridItemStyle,
          index % 2 === 1 && { marginLeft: 20 }, // Add margin for right column
        ]}
      >
        <TouchableOpacity
          onPress={() => handleStyleSelect(style)}
          activeOpacity={0.9}
          style={[
            styles_sheet.itemContainer,
            isSelected && styles_sheet.itemSelected,
          ]}
          accessible={true}
          accessibilityLabel={`${style.name} style reference`}
          accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} this style`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          {/* Image with gradient overlay */}
          <View style={styles_sheet.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles_sheet.image}
              resizeMode="cover"
            />
            
            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles_sheet.imageOverlay}
            />
            
            {/* Selection indicator */}
            {isSelected && (
              <Animated.View 
                entering={FadeInRight.duration(300)}
                style={styles_sheet.selectionBadge}
              >
                <BlurView intensity={80} style={styles_sheet.selectionBadgeBlur}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
                </BlurView>
              </Animated.View>
            )}
          </View>

          {/* Content */}
          <View style={styles_sheet.content}>
            <Text style={[
              styles_sheet.title,
              isSelected && styles_sheet.titleSelected,
            ]} numberOfLines={1}>
              {style.name}
            </Text>
            <Text style={[
              styles_sheet.description,
              isSelected && styles_sheet.descriptionSelected,
            ]} numberOfLines={2}>
              {style.description}
            </Text>
            
            {/* Tags */}
            <View style={styles_sheet.tags}>
              {style.characteristicTags.slice(0, 2).map((tag, tagIndex) => (
                <View key={tagIndex} style={[
                  styles_sheet.tag,
                  isSelected && styles_sheet.tagSelected,
                ]}>
                  <Text style={[
                    styles_sheet.tagText,
                    isSelected && styles_sheet.tagTextSelected,
                  ]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadingItem = (index: number) => (
    <View
      key={`loading-${index}`}
      style={[
        gridItemStyle,
        index % 2 === 1 && { marginLeft: 20 },
        styles_sheet.loadingItem,
      ]}
    >
      <LinearGradient
        colors={[colors.gray[800], colors.gray[700]]}
        style={styles_sheet.loadingGradient}
      >
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </LinearGradient>
    </View>
  );

  if (loading && styles.length === 0) {
    return (
      <View style={styles_sheet.loadingContainer}>
        <View style={styles_sheet.grid}>
          {Array.from({ length: 8 }).map((_, index) => renderLoadingItem(index))}
        </View>
      </View>
    );
  }

  if (error && styles.length === 0) {
    return (
      <View style={styles_sheet.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={colors.secondary[400]} />
        <Text style={styles_sheet.errorTitle}>Unable to Load Styles</Text>
        <Text style={styles_sheet.errorMessage}>{error}</Text>
        <TouchableOpacity
          onPress={() => loadStyles()}
          style={styles_sheet.retryButton}
        >
          <Text style={styles_sheet.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles_sheet.container, animatedContainerStyle]}>
      {/* Selection counter */}
      {selectedIds.length > 0 && (
        <Animated.View 
          entering={FadeInUp.duration(300)}
          style={styles_sheet.selectionCounter}
        >
          <BlurView intensity={80} style={styles_sheet.counterBlur}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[400]} />
            <Text style={styles_sheet.counterText}>
              {selectedIds.length} of {maxSelections} selected
            </Text>
          </BlurView>
        </Animated.View>
      )}

      <ScrollView
        style={styles_sheet.scrollView}
        contentContainerStyle={styles_sheet.scrollContent}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        refreshControl={
          Platform.OS === 'ios' ? 
          require('react-native').RefreshControl && (
            <require('react-native').RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[400]}
            />
          ) : undefined
        }
      >
        <View style={styles_sheet.grid}>
          {styles.map((style, index) => renderStyleItem(style, index))}
          
          {/* Load more indicator */}
          {loadingMore && (
            <View style={styles_sheet.loadMoreContainer}>
              <ActivityIndicator size="large" color={colors.primary[400]} />
              <Text style={styles_sheet.loadMoreText}>Loading more styles...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles_sheet = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[100],
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[50],
  },
  selectionCounter: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  counterBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[100],
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50, // Account for selection counter
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    backgroundColor: colors.gray[800],
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  itemSelected: {
    borderWidth: 2,
    borderColor: colors.primary[400],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  imageContainer: {
    height: ITEM_HEIGHT * 0.65,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  selectionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectionBadgeBlur: {
    padding: 6,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[100],
    marginBottom: 4,
  },
  titleSelected: {
    color: colors.primary[300],
  },
  description: {
    fontSize: 12,
    color: colors.gray[400],
    lineHeight: 16,
    marginBottom: 8,
  },
  descriptionSelected: {
    color: colors.gray[300],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagSelected: {
    backgroundColor: colors.primary[600],
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray[300],
  },
  tagTextSelected: {
    color: colors.gray[50],
  },
  loadingItem: {
    backgroundColor: colors.gray[800],
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.gray[400],
    marginTop: 8,
  },
});

export default StyleGrid;