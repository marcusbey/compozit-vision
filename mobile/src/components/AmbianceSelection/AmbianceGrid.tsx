import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInUp, 
  FadeInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

import { AmbianceOption } from '../../types/aiProcessing';
import { spaceAnalysisService } from '../../services/spaceAnalysis';
import { colors } from '../../theme/colors';

interface AmbianceGridProps {
  styleId?: string;
  onSelectionChange: (selectedAmbiance: AmbianceOption | null) => void;
  initialSelectedId?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns
const ITEM_HEIGHT = ITEM_WIDTH * 0.8; // 0.8 aspect ratio

// Professional ambiance reference images
const AMBIANCE_IMAGES: Record<string, string> = {
  cozy: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
  elegant: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=80',
  vibrant: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
  minimalist: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80',
  warm: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80',
  sophisticated: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&q=80',
};

// Default ambiance options if API doesn't provide them
const DEFAULT_AMBIANCE_OPTIONS: AmbianceOption[] = [
  {
    id: 'cozy',
    name: 'Cozy & Comfortable',
    description: 'Warm, inviting atmosphere with soft textures and intimate lighting',
    moodTags: ['warm', 'intimate', 'comfortable', 'relaxing'],
    lightingPreset: 'warm',
    colorAdjustment: 'warmer',
    textureEmphasis: 'soft',
    previewImageUrl: AMBIANCE_IMAGES.cozy,
  },
  {
    id: 'elegant',
    name: 'Elegant & Refined',
    description: 'Sophisticated ambiance with luxurious finishes and balanced lighting',
    moodTags: ['sophisticated', 'luxurious', 'refined', 'classic'],
    lightingPreset: 'balanced',
    colorAdjustment: 'richer',
    textureEmphasis: 'smooth',
    previewImageUrl: AMBIANCE_IMAGES.elegant,
  },
  {
    id: 'vibrant',
    name: 'Vibrant & Energetic',
    description: 'Lively atmosphere with bold colors and dynamic lighting',
    moodTags: ['energetic', 'bold', 'dynamic', 'inspiring'],
    lightingPreset: 'bright',
    colorAdjustment: 'saturated',
    textureEmphasis: 'varied',
    previewImageUrl: AMBIANCE_IMAGES.vibrant,
  },
  {
    id: 'minimalist',
    name: 'Clean & Minimal',
    description: 'Serene environment with clean lines and natural lighting',
    moodTags: ['serene', 'clean', 'peaceful', 'minimal'],
    lightingPreset: 'natural',
    colorAdjustment: 'neutral',
    textureEmphasis: 'smooth',
    previewImageUrl: AMBIANCE_IMAGES.minimalist,
  },
  {
    id: 'warm',
    name: 'Warm & Inviting',
    description: 'Welcoming atmosphere with golden tones and ambient lighting',
    moodTags: ['welcoming', 'golden', 'ambient', 'homey'],
    lightingPreset: 'warm',
    colorAdjustment: 'golden',
    textureEmphasis: 'natural',
    previewImageUrl: AMBIANCE_IMAGES.warm,
  },
  {
    id: 'sophisticated',
    name: 'Modern & Sophisticated',
    description: 'Contemporary feel with sleek finishes and precise lighting',
    moodTags: ['contemporary', 'sleek', 'precise', 'urban'],
    lightingPreset: 'cool',
    colorAdjustment: 'cooler',
    textureEmphasis: 'sleek',
    previewImageUrl: AMBIANCE_IMAGES.sophisticated,
  },
];

const AmbianceGrid: React.FC<AmbianceGridProps> = ({
  styleId,
  onSelectionChange,
  initialSelectedId,
}) => {
  const [ambiances, setAmbiances] = useState<AmbianceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);

  const animationValue = useSharedValue(1);

  // Load ambiance options
  const loadAmbiances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from API, fallback to default options
      let loadedAmbiances: AmbianceOption[];
      try {
        loadedAmbiances = await spaceAnalysisService.getAmbianceOptions(styleId);
      } catch (apiError) {
        console.log('Using default ambiance options');
        loadedAmbiances = DEFAULT_AMBIANCE_OPTIONS;
      }

      // Ensure we have preview images
      const ambiancesWithImages = loadedAmbiances.map(ambiance => ({
        ...ambiance,
        previewImageUrl: ambiance.previewImageUrl || AMBIANCE_IMAGES[ambiance.id] || AMBIANCE_IMAGES.cozy,
      }));

      setAmbiances(ambiancesWithImages);
    } catch (err) {
      console.error('Failed to load ambiances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ambiance options');
      
      Alert.alert(
        'Loading Error',
        'Unable to load ambiance options. Using default options.',
        [{ text: 'OK' }]
      );
      
      // Fallback to default options
      setAmbiances(DEFAULT_AMBIANCE_OPTIONS);
    } finally {
      setLoading(false);
    }
  }, [styleId]);

  // Handle ambiance selection
  const handleAmbianceSelect = useCallback((ambiance: AmbianceOption) => {
    const isSelected = selectedId === ambiance.id;
    
    if (isSelected) {
      // Deselect
      setSelectedId(null);
      onSelectionChange(null);
    } else {
      // Select
      setSelectedId(ambiance.id);
      onSelectionChange(ambiance);
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
  }, [selectedId, onSelectionChange, animationValue]);

  // Load ambiances on mount
  useEffect(() => {
    loadAmbiances();
  }, [loadAmbiances]);

  // Animated style for selection feedback
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animationValue.value }],
    };
  });

  const renderAmbianceItem = (ambiance: AmbianceOption, index: number) => {
    const isSelected = selectedId === ambiance.id;
    
    // Create animated style for color transition
    const animatedItemStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        isSelected ? 1 : 0,
        [0, 1],
        [colors.gray[800], colors.primary[900]]
      );
      
      return {
        backgroundColor,
        borderColor: isSelected ? colors.primary[400] : colors.gray[700],
      };
    });

    return (
      <Animated.View
        key={ambiance.id}
        entering={FadeInUp.delay(index * 150).duration(600)}
        style={[
          styles.itemContainer,
          index % 2 === 1 && { marginLeft: 20 }, // Right column margin
        ]}
      >
        <TouchableOpacity
          onPress={() => handleAmbianceSelect(ambiance)}
          activeOpacity={0.9}
          accessible={true}
          accessibilityLabel={`${ambiance.name} ambiance`}
          accessibilityHint={`Tap to ${isSelected ? 'deselect' : 'select'} this ambiance`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Animated.View style={[styles.itemContent, animatedItemStyle]}>
            {/* Image with gradient overlay */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: ambiance.previewImageUrl || AMBIANCE_IMAGES.cozy }}
                style={styles.image}
                resizeMode="cover"
              />
              
              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
              />
              
              {/* Selection indicator */}
              {isSelected && (
                <Animated.View 
                  entering={FadeInLeft.duration(300)}
                  style={styles.selectionIndicator}
                >
                  <BlurView intensity={80} style={styles.selectionBlur}>
                    <Ionicons name="checkmark-circle" size={28} color={colors.primary[400]} />
                  </BlurView>
                </Animated.View>
              )}
              
              {/* Mood indicator */}
              <View style={[styles.moodIndicator, isSelected && styles.moodIndicatorSelected]}>
                <BlurView intensity={40} style={styles.moodBlur}>
                  <Ionicons 
                    name={getMoodIcon(ambiance.moodTags[0])} 
                    size={16} 
                    color={isSelected ? colors.primary[300] : colors.gray[300]} 
                  />
                </BlurView>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[
                styles.title,
                isSelected && styles.titleSelected,
              ]} numberOfLines={2}>
                {ambiance.name}
              </Text>
              
              <Text style={[
                styles.description,
                isSelected && styles.descriptionSelected,
              ]} numberOfLines={3}>
                {ambiance.description}
              </Text>
              
              {/* Mood tags */}
              <View style={styles.tags}>
                {ambiance.moodTags.slice(0, 3).map((tag, tagIndex) => (
                  <View key={tagIndex} style={[
                    styles.tag,
                    isSelected && styles.tagSelected,
                  ]}>
                    <Text style={[
                      styles.tagText,
                      isSelected && styles.tagTextSelected,
                    ]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadingItem = (index: number) => (
    <View
      key={`loading-${index}`}
      style={[
        styles.itemContainer,
        index % 2 === 1 && { marginLeft: 20 },
        styles.loadingItem,
      ]}
    >
      <LinearGradient
        colors={[colors.gray[800], colors.gray[700]]}
        style={styles.loadingGradient}
      >
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, index) => renderLoadingItem(index))}
        </View>
      </View>
    );
  }

  if (error && ambiances.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={colors.secondary[400]} />
        <Text style={styles.errorTitle}>Unable to Load Ambiance Options</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          onPress={loadAmbiances}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Selected indicator */}
      {selectedId && (
        <Animated.View 
          entering={FadeInUp.duration(300)}
          style={styles.selectedIndicator}
        >
          <BlurView intensity={80} style={styles.selectedBlur}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary[400]} />
            <Text style={styles.selectedText}>Ambiance Selected</Text>
          </BlurView>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {ambiances.map((ambiance, index) => renderAmbianceItem(ambiance, index))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

// Helper function to get appropriate icon for mood
const getMoodIcon = (mood: string): any => {
  const iconMap: Record<string, any> = {
    warm: 'sunny-outline',
    intimate: 'heart-outline',
    comfortable: 'home-outline',
    relaxing: 'leaf-outline',
    sophisticated: 'diamond-outline',
    luxurious: 'star-outline',
    refined: 'medal-outline',
    classic: 'library-outline',
    energetic: 'flash-outline',
    bold: 'color-palette-outline',
    dynamic: 'trending-up-outline',
    inspiring: 'bulb-outline',
    serene: 'water-outline',
    clean: 'snow-outline',
    peaceful: 'flower-outline',
    minimal: 'remove-circle-outline',
    welcoming: 'handshake-outline',
    golden: 'sunny',
    ambient: 'moon-outline',
    homey: 'home',
    contemporary: 'phone-portrait-outline',
    sleek: 'shapes-outline',
    precise: 'compass-outline',
    urban: 'business-outline',
  };
  
  return iconMap[mood] || 'ellipse-outline';
};

const styles = StyleSheet.create({
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
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[100],
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40, // Account for selected indicator
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 24,
  },
  itemContent: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  imageContainer: {
    height: ITEM_HEIGHT,
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
    height: '60%',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  selectionBlur: {
    padding: 6,
  },
  moodIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moodIndicatorSelected: {
    borderWidth: 1,
    borderColor: colors.primary[400],
  },
  moodBlur: {
    padding: 6,
  },
  content: {
    padding: 16,
    backgroundColor: colors.gray[800],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[100],
    marginBottom: 6,
    lineHeight: 20,
  },
  titleSelected: {
    color: colors.primary[300],
  },
  description: {
    fontSize: 13,
    color: colors.gray[400],
    lineHeight: 18,
    marginBottom: 12,
  },
  descriptionSelected: {
    color: colors.gray[300],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagSelected: {
    backgroundColor: colors.primary[700],
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[300],
  },
  tagTextSelected: {
    color: colors.primary[100],
  },
  loadingItem: {
    height: ITEM_HEIGHT + 100, // Account for content area
    backgroundColor: colors.gray[800],
    borderRadius: 18,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AmbianceGrid;