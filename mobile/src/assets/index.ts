/**
 * Compozit Vision - Asset Management System
 * Centralized asset management for style and ambiance illustrations
 * Supports both iOS and Android with optimized loading
 */

// Style Illustrations
export const StyleIllustrations = {
  modern: require('./illustrations/styles/modern.svg'),
  traditional: require('./illustrations/styles/traditional.svg'),
  minimalist: require('./illustrations/styles/minimalist.svg'),
  eclectic: require('./illustrations/styles/eclectic.svg'),
  industrial: require('./illustrations/styles/industrial.svg'),
  scandinavian: require('./illustrations/styles/scandinavian.svg'),
  bohemian: require('./illustrations/styles/bohemian.svg'),
  contemporary: require('./illustrations/styles/contemporary.svg'),
  rustic: require('./illustrations/styles/rustic.svg'),
  'mid-century': require('./illustrations/styles/mid-century.svg'),
} as const;

// Ambiance Illustrations  
export const AmbianceIllustrations = {
  cozy: require('./illustrations/ambiance/cozy.svg'),
  elegant: require('./illustrations/ambiance/elegant.svg'),
  vibrant: require('./illustrations/ambiance/vibrant.svg'),
} as const;

// Type definitions for better TypeScript support
export type StyleType = keyof typeof StyleIllustrations;
export type AmbianceType = keyof typeof AmbianceIllustrations;

// Style metadata for enhanced UX
export interface StyleMetadata {
  name: string;
  description: string;
  keyFeatures: string[];
  colorPalette: string[];
  mood: string;
  illustration: any;
}

export const StyleMetadataMap: Record<StyleType, StyleMetadata> = {
  modern: {
    name: 'Modern',
    description: 'Clean lines, minimal clutter, and functional beauty',
    keyFeatures: ['Geometric shapes', 'Neutral colors', 'Open spaces'],
    colorPalette: ['#FFFFFF', '#F8F9FA', '#6C757D', '#495057'],
    mood: 'Fresh & Contemporary',
    illustration: StyleIllustrations.modern,
  },
  traditional: {
    name: 'Traditional',
    description: 'Classic elegance with timeless furniture and warm colors',
    keyFeatures: ['Rich fabrics', 'Warm wood tones', 'Classic patterns'],
    colorPalette: ['#8B4513', '#DEB887', '#F5DEB3', '#CD853F'],
    mood: 'Elegant & Timeless',
    illustration: StyleIllustrations.traditional,
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Less is more - focused on essential elements only',
    keyFeatures: ['Bare essentials', 'Lots of white space', 'Hidden storage'],
    colorPalette: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#ADB5BD'],
    mood: 'Calm & Serene',
    illustration: StyleIllustrations.minimalist,
  },
  eclectic: {
    name: 'Eclectic',
    description: 'Creative mix of different styles, colors, and patterns',
    keyFeatures: ['Bold colors', 'Mix of patterns', 'Unique pieces'],
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    mood: 'Vibrant & Creative',
    illustration: StyleIllustrations.eclectic,
  },
  industrial: {
    name: 'Industrial',
    description: 'Raw materials, exposed elements, and urban aesthetics',
    keyFeatures: ['Metal & concrete', 'Exposed pipes', 'Dark colors'],
    colorPalette: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7'],
    mood: 'Urban & Raw',
    illustration: StyleIllustrations.industrial,
  },
  scandinavian: {
    name: 'Scandinavian',
    description: 'Light woods, cozy textiles, and hygge comfort',
    keyFeatures: ['Light wood', 'Cozy textiles', 'Natural light'],
    colorPalette: ['#F5F5DC', '#DEB887', '#D2691E', '#CD853F'],
    mood: 'Cozy & Natural',
    illustration: StyleIllustrations.scandinavian,
  },
  bohemian: {
    name: 'Bohemian',
    description: 'Free-spirited with global influences and rich textures',
    keyFeatures: ['Global patterns', 'Rich textures', 'Layered fabrics'],
    colorPalette: ['#8B4513', '#DC143C', '#FF8C00', '#228B22'],
    mood: 'Free-spirited & Global',
    illustration: StyleIllustrations.bohemian,
  },
  contemporary: {
    name: 'Contemporary',
    description: 'Current trends with sleek finishes and bold accents',
    keyFeatures: ['Current trends', 'Sleek finishes', 'Bold accents'],
    colorPalette: ['#2F3349', '#475569', '#64748B', '#E2E8F0'],
    mood: 'Sleek & Current',
    illustration: StyleIllustrations.contemporary,
  },
  rustic: {
    name: 'Rustic',
    description: 'Natural materials with countryside charm and warmth',
    keyFeatures: ['Natural wood', 'Stone elements', 'Earthy tones'],
    colorPalette: ['#8B4513', '#A0522D', '#D2691E', '#DEB887'],
    mood: 'Natural & Warm',
    illustration: StyleIllustrations.rustic,
  },
  'mid-century': {
    name: 'Mid-Century Modern',
    description: 'Retro-modern with atomic age elements and bold colors',
    keyFeatures: ['Atomic patterns', 'Bold colors', 'Tapered legs'],
    colorPalette: ['#FF6347', '#1E90FF', '#FFD700', '#FF69B4'],
    mood: 'Retro & Bold',
    illustration: StyleIllustrations['mid-century'],
  },
};

// Ambiance metadata
export interface AmbianceMetadata {
  name: string;
  description: string;
  lightingStyle: string;
  moodTags: string[];
  illustration: any;
}

export const AmbianceMetadataMap: Record<AmbianceType, AmbianceMetadata> = {
  cozy: {
    name: 'Cozy & Comfortable',
    description: 'Warm, inviting atmosphere perfect for relaxation',
    lightingStyle: 'Warm & Dim',
    moodTags: ['Relaxing', 'Intimate', 'Comfortable'],
    illustration: AmbianceIllustrations.cozy,
  },
  elegant: {
    name: 'Elegant & Refined',
    description: 'Sophisticated ambiance with luxurious touches',
    lightingStyle: 'Soft & Ambient',
    moodTags: ['Sophisticated', 'Luxurious', 'Refined'],
    illustration: AmbianceIllustrations.elegant,
  },
  vibrant: {
    name: 'Vibrant & Energetic',
    description: 'Bold, colorful atmosphere that energizes the space',
    lightingStyle: 'Bright & Dynamic',
    moodTags: ['Energetic', 'Bold', 'Playful'],
    illustration: AmbianceIllustrations.vibrant,
  },
};

// Utility functions for asset management
export class AssetManager {
  /**
   * Get style illustration by style type
   */
  static getStyleIllustration(style: StyleType): any {
    return StyleIllustrations[style];
  }

  /**
   * Get style metadata by style type
   */
  static getStyleMetadata(style: StyleType): StyleMetadata {
    return StyleMetadataMap[style];
  }

  /**
   * Get ambiance illustration by ambiance type
   */
  static getAmbianceIllustration(ambiance: AmbianceType): any {
    return AmbianceIllustrations[ambiance];
  }

  /**
   * Get ambiance metadata by ambiance type
   */
  static getAmbianceMetadata(ambiance: AmbianceType): AmbianceMetadata {
    return AmbianceMetadataMap[ambiance];
  }

  /**
   * Get all available styles with their metadata
   */
  static getAllStyles(): Array<{ style: StyleType; metadata: StyleMetadata }> {
    return Object.entries(StyleMetadataMap).map(([style, metadata]) => ({
      style: style as StyleType,
      metadata,
    }));
  }

  /**
   * Get styles filtered by mood
   */
  static getStylesByMood(mood: string): Array<{ style: StyleType; metadata: StyleMetadata }> {
    return this.getAllStyles().filter(({ metadata }) => 
      metadata.mood.toLowerCase().includes(mood.toLowerCase())
    );
  }

  /**
   * Preload critical style illustrations (for performance)
   */
  static preloadCriticalAssets(): Promise<void[]> {
    const criticalStyles: StyleType[] = ['modern', 'traditional', 'minimalist', 'eclectic'];
    
    return Promise.all(
      criticalStyles.map(style => 
        new Promise<void>((resolve) => {
          // For React Native, assets are bundled, so this is more for consistency
          const illustration = this.getStyleIllustration(style);
          resolve();
        })
      )
    );
  }
}

// Export everything for easy imports
export * from './illustrations/styles';
export * from './illustrations/ambiance';
export default AssetManager;