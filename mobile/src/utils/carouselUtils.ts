import { MasonryImage } from '../assets/masonryImages';
import { CarouselImage } from '../components/StableCarousel';

/**
 * Converts MasonryImage format to CarouselImage format
 */
export const convertMasonryToCarousel = (masonryImages: MasonryImage[]): CarouselImage[] => {
  return masonryImages.map((image, index) => ({
    id: `masonry-${index}-${image.filename}`,
    source: image.source,
    label: `${image.style} • ${image.room}`,
    dimensions: {
      width: image.dimensions.width,
      height: image.dimensions.height,
    },
  }));
};

/**
 * Converts image source to URI string for FlatList compatibility
 */
export const getImageUri = (source: any): string => {
  if (typeof source === 'string') {
    return source;
  }
  
  // For imported images, React Native provides a uri property
  if (source && typeof source === 'object' && source.uri) {
    return source.uri;
  }
  
  // For static imports, use the source directly
  return source;
};