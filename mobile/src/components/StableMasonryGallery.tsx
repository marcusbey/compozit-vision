import { Image as ExpoImage } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

// Use curated masonry images
import { MasonryImage } from '../assets/masonryImages';

interface StableMasonryGalleryProps {
  /** Auto-play the gallery showcase */
  autoPlay?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Show style labels on images */
  showLabels?: boolean;
  /** Gallery height (auto if not specified) */
  height?: number;
  /** Callback when an image is tapped */
  onImagePress?: (image: MasonryImage) => void;
  /** Explicit image list */
  images: MasonryImage[];
  /** Limit number of images */
  maxImages?: number;
  /** Whether the gallery is active/visible; pauses loop when false */
  isActive?: boolean;
  /** Initial progress (0..1) to restore position */
  initialProgress?: number;
  /** Callback to report current progress (0..1) */
  onProgressChange?: (value: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_PADDING = 20;
const IMAGE_GAP = 8;
const COLUMN_WIDTH = (SCREEN_WIDTH - GALLERY_PADDING * 2 - IMAGE_GAP) / 2;

export const StableMasonryGallery: React.FC<StableMasonryGalleryProps> = ({
  autoPlay = false,
  animationDuration = 3000,
  showLabels = true,
  height,
  onImagePress,
  images,
  maxImages = 30,
  isActive = true,
  initialProgress = 0,
  onProgressChange,
}) => {
  // Build the working image list
  const workingList: MasonryImage[] = React.useMemo(() => {
    const baseList = images || [];
    if (baseList.length >= maxImages) return baseList.slice(0, maxImages);
    
    // If fewer available, loop the array to reach target length
    const result: MasonryImage[] = [];
    let i = 0;
    while (result.length < maxImages && baseList.length > 0) {
      result.push(baseList[i % baseList.length]);
      i += 1;
    }
    return result;
  }, [images, maxImages]);

  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(workingList.length).fill(false)
  );

  // Simplified animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState<number>(height || 0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Track current scroll position for progress
  const currentScrollPosition = useRef(0);

  // Simplified image loading with fade animation
  const fadeAnims = useRef(
    workingList.map(() => new Animated.Value(0))
  ).current;

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    // Simple fade in animation
    Animated.timing(fadeAnims[index], {
      toValue: 1,
      duration: 100,
      delay: index * 7.5, // Stagger the appearance
      useNativeDriver: true,
    }).start();
  }, [fadeAnims]);

  // Simplified auto-scroll logic
  useEffect(() => {
    if (!autoPlay || !isActive || contentHeight <= containerHeight) {
      return;
    }

    const maxScroll = Math.max(0, contentHeight - containerHeight);
    if (maxScroll <= 0) return;

    // Set initial position based on initialProgress
    const initialScrollY = initialProgress * maxScroll;
    currentScrollPosition.current = initialScrollY;
    scrollY.setValue(initialScrollY);

    // Start continuous scroll animation
    const startScrollAnimation = () => {
      animationRef.current = Animated.loop(
        Animated.timing(scrollY, {
          toValue: maxScroll,
          duration: animationDuration,
          easing: Easing.linear,
          useNativeDriver: false, // ScrollView scrolling requires native driver false
        }),
        {
          resetBeforeIteration: true,
        }
      );

      animationRef.current.start();
    };

    // Add listener to sync ScrollView with animated value
    const listenerId = scrollY.addListener(({ value }) => {
      currentScrollPosition.current = value;
      scrollViewRef.current?.scrollTo({ y: value, animated: false });
      
      // Report progress
      const progress = maxScroll > 0 ? value / maxScroll : 0;
      if (onProgressChange) {
        onProgressChange(progress);
      }
    });

    // Start animation after a brief delay
    const timeoutId = setTimeout(startScrollAnimation, 50);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      scrollY.removeListener(listenerId);
    };
  }, [autoPlay, isActive, contentHeight, containerHeight, animationDuration, initialProgress, onProgressChange, scrollY]);

  // Calculate masonry layout
  const renderMasonryColumns = useCallback(() => {
    const leftColumn: Array<{ image: MasonryImage; y: number; h: number; idx: number }> = [];
    const rightColumn: Array<{ image: MasonryImage; y: number; h: number; idx: number }> = [];

    let leftHeight = 0;
    let rightHeight = 0;

    workingList.forEach((image, idx) => {
      const imageHeight = (image.dimensions.height / image.dimensions.width) * COLUMN_WIDTH;

      if (leftHeight <= rightHeight) {
        leftColumn.push({ image, y: leftHeight + GALLERY_PADDING, h: imageHeight, idx });
        leftHeight += imageHeight + IMAGE_GAP;
      } else {
        rightColumn.push({ image, y: rightHeight + GALLERY_PADDING, h: imageHeight, idx });
        rightHeight += imageHeight + IMAGE_GAP;
      }
    });

    const totalHeight = Math.max(leftHeight, rightHeight) + GALLERY_PADDING;
    
    // Update content height when it changes
    if (Math.abs(totalHeight - contentHeight) > 1) {
      setContentHeight(totalHeight);
    }

    return (
      <View style={{ height: totalHeight }}>
        {/* Left Column */}
        <View style={[styles.column, { left: GALLERY_PADDING }]}>
          {leftColumn.map(({ image, y, h, idx }) => (
            <Animated.View
              key={`left-${idx}`}
              style={[
                styles.imageWrapper,
                {
                  position: 'absolute',
                  top: y,
                  width: COLUMN_WIDTH,
                  height: h,
                  opacity: fadeAnims[idx] || 0,
                }
              ]}
            >
              <ExpoImage
                source={image.source}
                style={[styles.image, { width: COLUMN_WIDTH, height: h }]}
                onLoad={() => handleImageLoad(idx)}
                onError={() => console.warn(`Failed to load: ${image.filename}`)}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={50}
              />

              {showLabels && imagesLoaded[idx] && (
                <View style={[styles.imageLabel, { width: COLUMN_WIDTH }]}>
                  <Text style={styles.styleText} numberOfLines={1}>
                    {image.style}
                  </Text>
                  <Text style={styles.roomText} numberOfLines={1}>
                    {image.room}
                  </Text>
                </View>
              )}

              {!imagesLoaded[idx] && (
                <View style={[styles.loadingPlaceholder, { width: COLUMN_WIDTH, height: h }]}>
                  <Animated.View
                    style={[
                      styles.loadingShimmer,
                      {
                        opacity: 0.4,
                      }
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        {/* Right Column */}
        <View style={[styles.column, { left: GALLERY_PADDING + COLUMN_WIDTH + IMAGE_GAP }]}>
          {rightColumn.map(({ image, y, h, idx }) => (
            <Animated.View
              key={`right-${idx}`}
              style={[
                styles.imageWrapper,
                {
                  position: 'absolute',
                  top: y,
                  width: COLUMN_WIDTH,
                  height: h,
                  opacity: fadeAnims[idx] || 0,
                }
              ]}
            >
              <ExpoImage
                source={image.source}
                style={[styles.image, { width: COLUMN_WIDTH, height: h }]}
                onLoad={() => handleImageLoad(idx)}
                onError={() => console.warn(`Failed to load: ${image.filename}`)}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={50}
              />

              {showLabels && imagesLoaded[idx] && (
                <View style={[styles.imageLabel, { width: COLUMN_WIDTH }]}>
                  <Text style={styles.styleText} numberOfLines={1}>
                    {image.style}
                  </Text>
                  <Text style={styles.roomText} numberOfLines={1}>
                    {image.room}
                  </Text>
                </View>
              )}

              {!imagesLoaded[idx] && (
                <View style={[styles.loadingPlaceholder, { width: COLUMN_WIDTH, height: h }]}>
                  <Animated.View
                    style={[
                      styles.loadingShimmer,
                      {
                        opacity: 0.4,
                      }
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }, [workingList, imagesLoaded, showLabels, fadeAnims, handleImageLoad, contentHeight]);

  return (
    <View 
      style={[styles.container, { height: containerHeight }]}
      onLayout={(event) => {
        const { height: measuredHeight } = event.nativeEvent.layout;
        if (!height && Math.abs(measuredHeight - containerHeight) > 1) {
          setContainerHeight(measuredHeight);
        }
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={false} // Disable manual scrolling for auto-play
      >
        {renderMasonryColumns()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  column: {
    position: 'absolute',
    top: 0,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  image: {
    borderRadius: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  styleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  roomText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '400',
  },
  loadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingShimmer: {
    width: '80%',
    height: '60%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
});

export default StableMasonryGallery;