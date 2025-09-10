/**
 * Masonry Style Images for Compozit Vision
 * Complete collection of design style images organized by category
 */

// Interior Styles - Real AI-Generated Images
import InteriorModern from './masonry/interior-modern.png';
import InteriorScandinavian from './masonry/interior-scandinavian.png';
import InteriorIndustrial from './masonry/interior-industrial.png';
import InteriorBohemian from './masonry/interior-bohemian.png';
import InteriorMinimalist from './masonry/interior-minimalist.png';

// Exterior Styles - Real AI-Generated Images
import ExteriorModern from './masonry/exterior-modern.png';
import ExteriorMediterranean from './masonry/exterior-mediterranean.png';

// Garden Styles - Real AI-Generated Images
import GardenJapanese from './masonry/garden-japanese.png';
import GardenModern from './masonry/garden-modern.png';

// Hotel Styles - Real AI-Generated Images
import HotelsLuxury from './masonry/hotels-luxury.png';
import HotelsBoutique from './masonry/hotels-boutique.png';

// Commercial Styles - Real AI-Generated Images
import CommercialModern from './masonry/commercial-modern.png';
import CommercialRestaurant from './masonry/commercial-restaurant.png';

export interface MasonryStyleImage {
  id: string;
  source: any;
  category: string;
  style: string;
  categoryName: string;
  styleName: string;
  dimensions: {
    width: number;
    height: number;
  };
  orientation: 'square' | 'landscape' | 'portrait';
}

export const masonryStyleImages: MasonryStyleImage[] = [
  // Interior Designs
  {
    id: 'interior-modern',
    source: InteriorModern,
    category: 'interior',
    style: 'modern',
    categoryName: 'Interior',
    styleName: 'Modern',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'interior-scandinavian',
    source: InteriorScandinavian,
    category: 'interior',
    style: 'scandinavian',
    categoryName: 'Interior',
    styleName: 'Scandinavian',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'interior-industrial',
    source: InteriorIndustrial,
    category: 'interior',
    style: 'industrial',
    categoryName: 'Interior',
    styleName: 'Industrial',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'interior-bohemian',
    source: InteriorBohemian,
    category: 'interior',
    style: 'bohemian',
    categoryName: 'Interior',
    styleName: 'Bohemian',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'interior-minimalist',
    source: InteriorMinimalist,
    category: 'interior',
    style: 'minimalist',
    categoryName: 'Interior',
    styleName: 'Minimalist',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },

  // Exterior Designs
  {
    id: 'exterior-modern',
    source: ExteriorModern,
    category: 'exterior',
    style: 'modern',
    categoryName: 'Exterior',
    styleName: 'Modern',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'exterior-mediterranean',
    source: ExteriorMediterranean,
    category: 'exterior',
    style: 'mediterranean',
    categoryName: 'Exterior',
    styleName: 'Mediterranean',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },

  // Garden Designs
  {
    id: 'garden-japanese',
    source: GardenJapanese,
    category: 'garden',
    style: 'japanese',
    categoryName: 'Garden',
    styleName: 'Japanese Zen',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'garden-modern',
    source: GardenModern,
    category: 'garden',
    style: 'modern',
    categoryName: 'Garden',
    styleName: 'Modern',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },

  // Hotel Designs
  {
    id: 'hotels-luxury',
    source: HotelsLuxury,
    category: 'hotels',
    style: 'luxury',
    categoryName: 'Hotels',
    styleName: 'Luxury',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'hotels-boutique',
    source: HotelsBoutique,
    category: 'hotels',
    style: 'boutique',
    categoryName: 'Hotels',
    styleName: 'Boutique',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },

  // Commercial Designs
  {
    id: 'commercial-modern',
    source: CommercialModern,
    category: 'commercial',
    style: 'modern',
    categoryName: 'Commercial',
    styleName: 'Modern',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  },
  {
    id: 'commercial-restaurant',
    source: CommercialRestaurant,
    category: 'commercial',
    style: 'restaurant',
    categoryName: 'Commercial',
    styleName: 'Restaurant',
    dimensions: { width: 512, height: 512 },
    orientation: 'square'
  }
];

// Category filters
export const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'interior', name: 'Interior' },
  { id: 'exterior', name: 'Exterior' },
  { id: 'garden', name: 'Garden' },
  { id: 'hotels', name: 'Hotels' },
  { id: 'commercial', name: 'Commercial' }
];

// Style filters
export const styles = [
  { id: 'all', name: 'All Styles' },
  { id: 'modern', name: 'Modern' },
  { id: 'scandinavian', name: 'Scandinavian' },
  { id: 'industrial', name: 'Industrial' },
  { id: 'bohemian', name: 'Bohemian' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'mediterranean', name: 'Mediterranean' },
  { id: 'japanese', name: 'Japanese Zen' },
  { id: 'luxury', name: 'Luxury' },
  { id: 'boutique', name: 'Boutique' },
  { id: 'restaurant', name: 'Restaurant' }
];

// Utility functions
export const getImagesByCategory = (category: string) => {
  if (category === 'all') return masonryStyleImages;
  return masonryStyleImages.filter(img => img.category === category);
};

export const getImagesByStyle = (style: string) => {
  if (style === 'all') return masonryStyleImages;
  return masonryStyleImages.filter(img => img.style === style);
};

export const getImagesByCategoryAndStyle = (category: string, style: string) => {
  let filtered = masonryStyleImages;

  if (category !== 'all') {
    filtered = filtered.filter(img => img.category === category);
  }

  if (style !== 'all') {
    filtered = filtered.filter(img => img.style === style);
  }

  return filtered;
};

// Get random subset of images
export const getRandomImages = (count: number = 10) => {
  const shuffled = [...masonryStyleImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get images for masonry gallery display
export const getMasonryGalleryImages = () => {
  // Mix different orientations for better masonry layout
  // For now all are square, but this will change when actual images are generated
  return masonryStyleImages.map((img, index) => ({
    ...img,
    // Vary dimensions slightly for visual interest
    dimensions: {
      width: 512,
      height: index % 3 === 0 ? 384 : index % 3 === 1 ? 512 : 640
    },
    orientation: index % 3 === 0 ? 'landscape' : index % 3 === 1 ? 'square' : 'portrait'
  }));
};
