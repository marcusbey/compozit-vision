/**
 * Masonry Gallery Images for Onboarding Showcase
 * These are placeholder imports until AI-generated images are ready
 */

// Import existing room sample images as placeholders
import ModernLivingRoom from './images/photography-consolidated/rooms/sample-modern-living.png';
import IndustrialKitchen from './images/photography-consolidated/rooms/sample-contemporary-kitchen.png';
import BohemianBedroom from './images/photography-consolidated/rooms/sample-cozy-bedroom.png';
import VintageWorkspace from './images/photography-consolidated/rooms/sample-home-office.png';
import ScandinavianLivingRoom from './images/photography-consolidated/rooms/living-room-example.png';
import MinimalistBedroom from './images/photography-consolidated/rooms/bedroom-example.png';
import ModernKitchenIsland from './images/photography-consolidated/rooms/kitchen-example.png';
import IndustrialWorkspace from './images/photography-consolidated/rooms/office-example.png';
import CozyReadingNook from './images/photography-consolidated/rooms/sample-elegant-dining.png';
import ModernDiningRoom from './images/photography-consolidated/rooms/dining-example.png';

export const masonryImages = [
  {
    source: ModernLivingRoom,
    filename: 'modern-living-room.png',
    style: 'Modern Minimalist',
    room: 'Living Room',
    orientation: 'landscape' as const,
    dimensions: { width: 320, height: 240 }
  },
  {
    source: IndustrialKitchen,
    filename: 'industrial-kitchen.png',
    style: 'Industrial',
    room: 'Kitchen',
    orientation: 'square' as const,
    dimensions: { width: 256, height: 256 }
  },
  {
    source: BohemianBedroom,
    filename: 'bohemian-bedroom.png',
    style: 'Bohemian',
    room: 'Bedroom',
    orientation: 'portrait' as const,
    dimensions: { width: 240, height: 320 }
  },
  {
    source: VintageWorkspace,
    filename: 'vintage-workspace.png',
    style: 'Vintage',
    room: 'Workspace',
    orientation: 'landscape' as const,
    dimensions: { width: 320, height: 240 }
  },
  {
    source: ScandinavianLivingRoom,
    filename: 'scandinavian-living-room.png',
    style: 'Scandinavian',
    room: 'Living Room',
    orientation: 'square' as const,
    dimensions: { width: 256, height: 256 }
  },
  {
    source: MinimalistBedroom,
    filename: 'minimalist-bedroom.png',
    style: 'Minimalist',
    room: 'Bedroom',
    orientation: 'portrait' as const,
    dimensions: { width: 240, height: 320 }
  },
  {
    source: ModernKitchenIsland,
    filename: 'modern-kitchen-island.png',
    style: 'Contemporary',
    room: 'Kitchen',
    orientation: 'landscape' as const,
    dimensions: { width: 320, height: 240 }
  },
  {
    source: IndustrialWorkspace,
    filename: 'industrial-workspace.png',
    style: 'Industrial',
    room: 'Workspace',
    orientation: 'portrait' as const,
    dimensions: { width: 240, height: 320 }
  },
  {
    source: CozyReadingNook,
    filename: 'cozy-reading-nook.png',
    style: 'Cozy Traditional',
    room: 'Living Space',
    orientation: 'square' as const,
    dimensions: { width: 256, height: 256 }
  },
  {
    source: ModernDiningRoom,
    filename: 'modern-dining-room.png',
    style: 'Modern Contemporary',
    room: 'Dining Room',
    orientation: 'landscape' as const,
    dimensions: { width: 320, height: 240 }
  }
];

export type MasonryImage = typeof masonryImages[0];

// Export individual images for specific use
export {
  ModernLivingRoom,
  IndustrialKitchen,
  BohemianBedroom,
  VintageWorkspace,
  ScandinavianLivingRoom,
  MinimalistBedroom,
  ModernKitchenIsland,
  IndustrialWorkspace,
  CozyReadingNook,
  ModernDiningRoom
};

// Utility functions for the masonry gallery
export const getMasonryImagesByStyle = (style: string) => {
  return masonryImages.filter(image => 
    image.style.toLowerCase().includes(style.toLowerCase())
  );
};

export const getMasonryImagesByRoom = (room: string) => {
  return masonryImages.filter(image => 
    image.room.toLowerCase().includes(room.toLowerCase())
  );
};

export const getMasonryImagesByOrientation = (orientation: 'portrait' | 'landscape' | 'square') => {
  return masonryImages.filter(image => image.orientation === orientation);
};

// Masonry gallery configuration
export const MASONRY_CONFIG = {
  totalImages: masonryImages.length,
  orientations: {
    landscape: masonryImages.filter(img => img.orientation === 'landscape').length,
    portrait: masonryImages.filter(img => img.orientation === 'portrait').length,
    square: masonryImages.filter(img => img.orientation === 'square').length
  },
  styles: [...new Set(masonryImages.map(img => img.style))],
  rooms: [...new Set(masonryImages.map(img => img.room))],
  autoPlayDuration: 3000,
  animationDuration: 500,
  columnGap: 8,
  rowGap: 8
};

export default masonryImages;