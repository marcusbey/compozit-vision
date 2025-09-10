import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  ListRenderItem,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CarouselImage {
  id: string;
  source: any; // Image source (can be import or URI)
  label?: string;
  dimensions: {
    width: number;
    height: number;
  };
}

interface StableCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  showLabels?: boolean;
  height?: number;
  isActive?: boolean;
  onImagePress?: (image: CarouselImage) => void;
}

export const StableCarousel: React.FC<StableCarouselProps> = ({
  images,
  autoPlay = true,
  showLabels = true,
  height = SCREEN_HEIGHT,
  isActive = true,
  onImagePress,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  
  // Reanimated shared values for smooth animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  
  // Auto-scroll logic using shared values
  const scrollProgress = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  
  // Initialize entrance animation
  useEffect(() => {
    if (isActive) {
      fadeAnim.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      slideAnim.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      fadeAnim.value = 0;
      slideAnim.value = 30;
    }
  }, [isActive]);
  
  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || !isActive || images.length <= 1) return;
    
    const interval = setInterval(() => {
      if (isScrolling.value) return; // Don't auto-scroll if user is interacting
      
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // Change image every 4 seconds
    
    return () => clearInterval(interval);
  }, [autoPlay, isActive, currentIndex, images.length]);
  
  // Handle image loading
  const handleImageLoad = (imageId: string) => {
    setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
  };
  
  // Handle scroll events
  const handleScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };
  
  const handleScrollBegin = () => {
    isScrolling.value = true;
  };
  
  const handleScrollEndDrag = () => {
    // Reset scroll flag after a delay to allow auto-scroll to resume
    setTimeout(() => {
      isScrolling.value = false;
    }, 2000);
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));
  
  const renderImageItem: ListRenderItem<CarouselImage> = ({ item, index }) => {
    const isLoaded = imageLoadStates[item.id];
    
    return (
      <View style={[styles.imageContainer, { width: SCREEN_WIDTH, height }]}>
        <ExpoImage
          source={item.source}
          style={styles.image}
          contentFit="cover"
          onLoad={() => handleImageLoad(item.id)}
          onError={() => console.warn(`Failed to load image: ${item.id}`)}
          cachePolicy="memory-disk"
          transition={200}
        />
        
        {/* Overlay gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Image label */}
        {showLabels && item.label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        )}
        
        {/* Loading state */}
        {!isLoaded && (
          <View style={styles.loadingContainer}>
            <Animated.View 
              style={[
                styles.loadingIndicator,
                {
                  opacity: withRepeat(
                    withSequence(
                      withTiming(0.3, { duration: 800 }),
                      withTiming(0.8, { duration: 800 })
                    ),
                    -1,
                    true
                  ),
                }
              ]}
            />
          </View>
        )}
      </View>
    );
  };
  
  // Handle scroll to index errors
  const handleScrollToIndexFailed = (info: any) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };
  
  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No images to display</Text>
        </View>
      </View>
    );
  }
  
  return (
    <Animated.View style={[styles.container, { height }, containerAnimatedStyle]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEndDrag}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
      
      {/* Page indicators */}
      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorActive: {
    backgroundColor: 'rgba(212,165,116,0.9)',
    width: 24,
  },
});