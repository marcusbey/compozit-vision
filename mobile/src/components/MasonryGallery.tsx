import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';

// Use curated masonry images
import { MasonryImage, masonryImages } from '../assets/masonryImages';

interface MasonryGalleryProps {
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
  /** Optional explicit image list override */
  images?: MasonryImage[];
  /** Limit number of images (images will loop if fewer are available) */
  maxImages?: number;
  /** If set (e.g., 3), restart autoplay when last N images begin to enter viewport */
  restartOnLastNVisible?: number;
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

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  autoPlay = false,
  animationDuration = 3000,
  showLabels = true,
  height,
  onImagePress,
  images,
  maxImages = 40,
  restartOnLastNVisible,
  isActive = true,
  initialProgress,
  onProgressChange,
}) => {
  // Build the working image list
  const baseList = images && images.length > 0 ? images : masonryImages;
  const workingList: MasonryImage[] = React.useMemo(() => {
    if (baseList.length >= maxImages) return baseList.slice(0, maxImages);
    // If fewer available, loop the array to reach target length
    const result: MasonryImage[] = [];
    let i = 0;
    while (result.length < maxImages) {
      result.push(baseList[i % baseList.length]);
      i += 1;
    }
    return result;
  }, [baseList, maxImages]);

  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(workingList.length).fill(false)
  );

  const fadeAnims = useRef(
    workingList.map(() => new Animated.Value(0))
  ).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [containerH, setContainerH] = useState<number>(0);
  const containerHeight = height ?? containerH; // prefer explicit height, else measured
  const [viewportY, setViewportY] = useState(0);
  const CHUNK_SIZE = 14;
  const [preloadCount, setPreloadCount] = useState<number>(CHUNK_SIZE);
  const restartedRef = useRef<boolean>(false);

  const safeScrollTo = (y: number) => {
    try {
      const refAny: any = scrollRef.current as any;
      if (refAny?.scrollTo) {
        refAny.scrollTo({ y, animated: false });
      } else if (refAny?.getNode?.()) {
        refAny.getNode().scrollTo({ y, animated: false });
      }
    } catch {}
  };

  // Auto-play animation: continuous vertical scrolling with pause/resume and duration caps
  useEffect(() => {
    if (!autoPlay) return;

    let progressListenerId: string | number | undefined;
    let loopAnim: Animated.CompositeAnimation | undefined;

    // Start continuous scroll when we know content height
    const startLoop = () => {
      const maxScroll = Math.max(0, contentHeight - (containerHeight || 0));
      if (maxScroll <= 0) return; // nothing to scroll

      // Restore progress if provided
      if (typeof initialProgress === 'number' && initialProgress >= 0 && initialProgress <= 1) {
        const y0 = initialProgress * maxScroll;
        progressAnim.setValue(initialProgress);
        safeScrollTo(y0);
        setViewportY(y0);
      }

      // map progress 0..1 -> scroll 0..maxScroll
      progressListenerId = progressAnim.addListener(({ value }) => {
        const y = value * maxScroll; // top -> bottom
        safeScrollTo(y);
        setViewportY(y);
        if (onProgressChange) onProgressChange(value);
      });

      const pxPerSecond = 60; // speed target
      const computedDuration = Math.round((maxScroll / pxPerSecond) * 1000);
      const duration = Math.min(45000, Math.max(15000, computedDuration)); // clamp 15s..45s

      loopAnim = Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      if (isActive) {
        loopAnim.start();
      }
    };

    const timeout = setTimeout(startLoop, 100); // slight delay to ensure sizes ready

    return () => {
      clearTimeout(timeout);
      if (loopAnim && (loopAnim as any).stop) (loopAnim as any).stop();
      if (progressListenerId !== undefined) progressAnim.removeListener(progressListenerId as any);
    };
  }, [autoPlay, isActive, initialProgress, onProgressChange, scrollRef, contentHeight, containerHeight, progressAnim]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    // Fade in the image when loaded
    Animated.timing(fadeAnims[index], {
      toValue: 1,
      duration: 500,
      delay: index * 50, // Stagger the appearance
      useNativeDriver: true,
    }).start();
  };

  // Progressively unlock more images once current chunk mostly loaded
  useEffect(() => {
    const loadedInChunk = imagesLoaded.slice(0, preloadCount).filter(Boolean).length;
    if (preloadCount < workingList.length && loadedInChunk >= Math.max(6, preloadCount - 2)) {
      const t = setTimeout(() => setPreloadCount(prev => Math.min(prev + CHUNK_SIZE, workingList.length)), 200);
      return () => clearTimeout(t);
    }
  }, [imagesLoaded, preloadCount, workingList.length]);

  type LayoutItem = { image: MasonryImage; y: number; h: number; idx: number };
  const renderMasonryColumns = () => {
    const leftColumn: LayoutItem[] = [];
    const rightColumn: LayoutItem[] = [];

    // Distribute images to create balanced columns
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

    return { leftColumn, rightColumn };
  };

  const renderImageColumn = (items: LayoutItem[], columnIndex: number, preloadSet: Set<number>) => {
    // Shared upward drift applied to all tiles (creates floating feel)
    const driftBase = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -40], // 40px upward over a full loop
    });
    return (
      <View style={styles.column} key={columnIndex}>
        {items.map((it, imageIndex) => {
          const image = it.image;
          const globalIndex = it.idx;
          const imageWidth = COLUMN_WIDTH;
          const imageHeight = (image.dimensions.height / image.dimensions.width) * imageWidth;
          const phaseFactor = 0.4 + ((globalIndex % 6) / 10); // slight variance 0.4..0.9
          const buffer = 600; // expand to avoid starvation near edges
          const isVisible = preloadSet.has(globalIndex) || ((it.y + imageHeight) >= (viewportY - buffer) && it.y <= (viewportY + containerHeight + buffer));

          if (!isVisible) {
            return (
              <View
                key={`${image.filename}-${columnIndex}-${imageIndex}`}
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  borderRadius: 12,
                  backgroundColor: '#e9ecef',
                  marginBottom: IMAGE_GAP,
                }}
              />
            );
          }

          return (
            <Animated.View
              key={`${image.filename}-${columnIndex}-${imageIndex}`}
              style={[
                styles.imageContainer,
                {
                  opacity: fadeAnims[globalIndex],
                  transform: [{
                    scale: scrollY.interpolate({
                      inputRange: [0, 100],
                      outputRange: [1, 0.98],
                      extrapolate: 'clamp',
                    }),
                  }, { translateY: Animated.multiply(driftBase, phaseFactor) }],
                },
              ]}
            >
              <ExpoImage
                source={image.source}
                style={[
                  styles.image,
                  {
                    width: imageWidth,
                    height: imageHeight,
                  },
                ]}
                onLoad={() => handleImageLoad(globalIndex)}
                onError={() => console.warn(`Failed to load: ${image.filename}`)}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={250}
              />

              {showLabels && imagesLoaded[globalIndex] && (
                <View
                  style={[
                    styles.imageLabel,
                    {
                      width: imageWidth,
                    }
                  ]}
                >
                  <Text style={styles.styleText} numberOfLines={1}>
                    {image.style}
                  </Text>
                  <Text style={styles.roomText} numberOfLines={1}>
                    {image.room}
                  </Text>
                </View>
              )}

              {/* Loading placeholder */}
              {!imagesLoaded[globalIndex] && (
                <View style={[styles.loadingPlaceholder, { width: imageWidth, height: imageHeight }]}>
                  <Animated.View
                    style={[
                      styles.loadingShimmer,
                      {
                        opacity: scrollY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.6],
                          extrapolate: 'clamp',
                        }),
                      }
                    ]}
                  />
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const { leftColumn, rightColumn } = renderMasonryColumns();
  const contentTotalHeight = React.useMemo(() => {
    const lastLeft = leftColumn[leftColumn.length - 1];
    const lastRight = rightColumn[rightColumn.length - 1];
    const leftEnd = lastLeft ? lastLeft.y + lastLeft.h + GALLERY_PADDING : 0;
    const rightEnd = lastRight ? lastRight.y + lastRight.h + GALLERY_PADDING : 0;
    return Math.max(leftEnd, rightEnd);
  }, [leftColumn, rightColumn]);

  // Build a distributed order across the full height (stratified by rows)
  const distributedOrder: number[] = React.useMemo(() => {
    const all = [...leftColumn, ...rightColumn].sort((a, b) => a.y - b.y);
    if (all.length === 0) return [];
    const strata = Math.max(1, Math.ceil(all.length / CHUNK_SIZE));
    const result: number[] = [];
    for (let s = 0; s < strata; s += 1) {
      for (let i = s; i < all.length; i += strata) {
        result.push(all[i].idx);
      }
    }
    return result;
  }, [leftColumn, rightColumn]);

  // Preload set uses the first N of the distributed order to spread initial tiles evenly
  const preloadSet: Set<number> = React.useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(preloadCount, distributedOrder.length); i += 1) {
      set.add(distributedOrder[i]);
    }
    return set;
  }, [distributedOrder, preloadCount]);

  // Compute threshold Y for restarting autoplay early when last N items enter viewport
  const restartThresholdY = React.useMemo(() => {
    if (!restartOnLastNVisible || restartOnLastNVisible <= 0) return undefined;
    const allItems = [...leftColumn, ...rightColumn].sort((a, b) => a.y - b.y);
    if (allItems.length === 0) return undefined;
    const index = Math.max(0, allItems.length - restartOnLastNVisible);
    return allItems[index]?.y ?? undefined;
  }, [leftColumn, rightColumn, restartOnLastNVisible]);

  // Watch viewport to trigger early restart
  useEffect(() => {
    if (!autoPlay) return;
    if (!restartOnLastNVisible || restartOnLastNVisible <= 0) return;
    if (containerHeight <= 0) return;
    if (restartThresholdY == null) return;

    const viewportBottom = viewportY + containerHeight;
    if (!restartedRef.current && viewportBottom >= restartThresholdY) {
      // Jump back to top and reset progress for a seamless loop
      progressAnim.setValue(0);
      safeScrollTo(0);
      restartedRef.current = true;
    }
    // Reset the guard once we are back near the top
    if (restartedRef.current && viewportY < 24) {
      restartedRef.current = false;
    }
  }, [autoPlay, viewportY, containerHeight, restartOnLastNVisible, restartThresholdY]);

  return (
    <View style={[styles.container, height ? { height } : undefined]} onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}>
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        ref={scrollRef}
        onContentSizeChange={(_, h) => setContentHeight(h || contentTotalHeight)}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: (e: any) => setViewportY(e.nativeEvent.contentOffset.y) }
        )}
      >
        <View style={styles.masonryContainer}>
          {renderImageColumn(leftColumn, 0, preloadSet)}
          {renderImageColumn(rightColumn, 1, preloadSet)}
        </View>
      </Animated.ScrollView>

      {/* No header overlay to keep gallery clean */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  masonryContainer: {
    flexDirection: 'row',
    padding: GALLERY_PADDING,
    gap: IMAGE_GAP,
  },
  column: {
    flex: 1,
    gap: IMAGE_GAP,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    borderRadius: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  styleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  roomText: {
    color: '#e0e0e0',
    fontSize: 10,
    fontWeight: '400',
  },
  loadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingShimmer: {
    flex: 1,
    backgroundColor: '#f1f3f4',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
});

export default MasonryGallery;
