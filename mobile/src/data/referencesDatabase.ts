/**
 * Reference Images Database Architecture
 * Provides curated design references filtered by style and space type
 */

import { SpaceType } from './stylesDatabase';

export interface ReferenceImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  tags: string[];
  style: string[]; // Compatible styles
  spaceType: SpaceType[]; // Compatible spaces
  dominantColors: string[]; // Extracted color palette
  category: ReferenceCategory;
  source: ReferenceSource;
  popularity: number; // Engagement score
  aspectRatio: number; // width/height for masonry layout
  dateAdded: string;
  metadata?: {
    photographer?: string;
    sourceUrl?: string;
    license?: string;
    attribution?: string;
  };
}

export type ReferenceCategory = 
  | 'furniture' 
  | 'decor' 
  | 'layout' 
  | 'color-scheme'
  | 'lighting'
  | 'textures'
  | 'plants'
  | 'art';

export type ReferenceSource = 
  | 'internal' 
  | 'pinterest' 
  | 'unsplash' 
  | 'user-upload'
  | 'curated';

// Initial seeded reference collection
export const REFERENCES_DATABASE: ReferenceImage[] = [
  // SCANDINAVIAN LIVING ROOM REFERENCES
  {
    id: 'scand_lr_001',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Minimalist Scandinavian Living Room',
    description: 'Light wood furniture, neutral textiles, and natural lighting',
    tags: ['minimalist', 'light wood', 'neutral', 'cozy', 'natural light'],
    style: ['scandinavian', 'minimalist', 'modern'],
    spaceType: ['living_room'],
    dominantColors: ['#FFFFFF', '#F5F5F5', '#D2B48C', '#4A5568'],
    category: 'layout',
    source: 'unsplash',
    popularity: 95,
    aspectRatio: 1.33,
    dateAdded: '2024-01-01',
    metadata: {
      photographer: 'Spacejoy',
      sourceUrl: 'https://unsplash.com/photos/minimalist-living-room',
      license: 'Unsplash License'
    }
  },
  {
    id: 'scand_lr_002',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Scandinavian Sofa Styling',
    description: 'White sofa with textured pillows and wooden coffee table',
    tags: ['white sofa', 'wood coffee table', 'textured pillows', 'hygge'],
    style: ['scandinavian', 'minimalist'],
    spaceType: ['living_room'],
    dominantColors: ['#FFFFFF', '#E8E8E8', '#D2B48C'],
    category: 'furniture',
    source: 'unsplash',
    popularity: 88,
    aspectRatio: 1.5,
    dateAdded: '2024-01-02'
  },

  // MODERN LIVING ROOM REFERENCES
  {
    id: 'mod_lr_001',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Modern Living Room Layout',
    description: 'Clean lines, statement lighting, open floor plan',
    tags: ['clean lines', 'modern furniture', 'statement lighting', 'open plan'],
    style: ['modern', 'minimalist'],
    spaceType: ['living_room'],
    dominantColors: ['#FFFFFF', '#2D2D2D', '#4A90E2'],
    category: 'layout',
    source: 'unsplash',
    popularity: 92,
    aspectRatio: 1.2,
    dateAdded: '2024-01-03'
  },

  // GARDEN REFERENCES
  {
    id: 'med_garden_001',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Mediterranean Garden Terracotta',
    description: 'Terracotta pots, olive trees, stone pathways',
    tags: ['terracotta', 'olive trees', 'stone', 'mediterranean', 'drought resistant'],
    style: ['mediterranean_garden'],
    spaceType: ['garden', 'patio', 'backyard'],
    dominantColors: ['#8B4513', '#CD853F', '#228B22'],
    category: 'layout',
    source: 'unsplash',
    popularity: 85,
    aspectRatio: 1.4,
    dateAdded: '2024-01-04'
  },
  {
    id: 'mod_garden_001',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Modern Landscape Design',
    description: 'Geometric planters, steel elements, minimalist plants',
    tags: ['geometric', 'steel', 'concrete', 'minimalist plants', 'linear'],
    style: ['modern_landscape'],
    spaceType: ['garden', 'patio', 'front_yard'],
    dominantColors: ['#2F2F2F', '#68D391', '#A0AEC0'],
    category: 'layout',
    source: 'unsplash',
    popularity: 90,
    aspectRatio: 1.1,
    dateAdded: '2024-01-05'
  },

  // BEDROOM REFERENCES
  {
    id: 'scand_bed_001',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Scandinavian Bedroom Serenity',
    description: 'Platform bed, linen bedding, floating nightstands',
    tags: ['platform bed', 'linen', 'floating nightstand', 'serene', 'natural'],
    style: ['scandinavian', 'minimalist'],
    spaceType: ['bedroom'],
    dominantColors: ['#FFFFFF', '#F5F5F5', '#D2B48C'],
    category: 'furniture',
    source: 'unsplash',
    popularity: 87,
    aspectRatio: 1.6,
    dateAdded: '2024-01-06'
  },

  // KITCHEN REFERENCES
  {
    id: 'mod_kitchen_001',
    imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Modern Kitchen Island',
    description: 'Marble countertops, pendant lighting, bar stools',
    tags: ['marble', 'pendant lights', 'bar stools', 'island', 'modern'],
    style: ['modern', 'minimalist'],
    spaceType: ['kitchen'],
    dominantColors: ['#FFFFFF', '#2D2D2D', '#C0C0C0'],
    category: 'layout',
    source: 'unsplash',
    popularity: 93,
    aspectRatio: 1.3,
    dateAdded: '2024-01-07'
  },

  // DECOR REFERENCES
  {
    id: 'plants_001',
    imageUrl: 'https://images.unsplash.com/photo-1463620910506-d0458143143e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1463620910506-d0458143143e?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Indoor Plant Styling',
    description: 'Fiddle leaf fig, hanging plants, natural pot materials',
    tags: ['plants', 'fiddle leaf fig', 'hanging plants', 'natural pots'],
    style: ['scandinavian', 'modern', 'bohemian'],
    spaceType: ['living_room', 'bedroom', 'home_office'],
    dominantColors: ['#228B22', '#8B4513', '#FFFFFF'],
    category: 'plants',
    source: 'unsplash',
    popularity: 78,
    aspectRatio: 0.8,
    dateAdded: '2024-01-08'
  },
  {
    id: 'lighting_001',
    imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&w=300&q=60',
    title: 'Pendant Light Collection',
    description: 'Modern pendant lights, brass fixtures, ambient lighting',
    tags: ['pendant lights', 'brass', 'ambient lighting', 'modern fixtures'],
    style: ['modern', 'minimalist', 'industrial'],
    spaceType: ['kitchen', 'dining_room', 'living_room'],
    dominantColors: ['#B8860B', '#2F2F2F', '#FFFFFF'],
    category: 'lighting',
    source: 'unsplash',
    popularity: 82,
    aspectRatio: 1.2,
    dateAdded: '2024-01-09'
  }
];

/**
 * Reference Service - Core functionality for managing references
 */
export class ReferenceService {
  /**
   * Get references filtered by style and space type
   */
  static getFilteredReferences(filters: {
    style?: string;
    spaceType?: SpaceType;
    category?: ReferenceCategory;
    limit?: number;
  }): ReferenceImage[] {
    let filteredRefs = [...REFERENCES_DATABASE];

    // Filter by style
    if (filters.style) {
      filteredRefs = filteredRefs.filter(ref => 
        ref.style.includes(filters.style!)
      );
    }

    // Filter by space type
    if (filters.spaceType) {
      filteredRefs = filteredRefs.filter(ref => 
        ref.spaceType.includes(filters.spaceType!)
      );
    }

    // Filter by category
    if (filters.category) {
      filteredRefs = filteredRefs.filter(ref => 
        ref.category === filters.category
      );
    }

    // Sort by popularity
    filteredRefs.sort((a, b) => b.popularity - a.popularity);

    // Apply limit
    if (filters.limit) {
      filteredRefs = filteredRefs.slice(0, filters.limit);
    }

    return filteredRefs;
  }

  /**
   * Search references by tags or title
   */
  static searchReferences(query: string, filters?: {
    style?: string;
    spaceType?: SpaceType;
  }): ReferenceImage[] {
    const lowerQuery = query.toLowerCase();
    let results = REFERENCES_DATABASE.filter(ref => 
      ref.title.toLowerCase().includes(lowerQuery) ||
      ref.description?.toLowerCase().includes(lowerQuery) ||
      ref.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    // Apply additional filters
    if (filters) {
      results = this.getFilteredReferences({
        ...filters,
        limit: undefined
      }).filter(ref => results.includes(ref));
    }

    return results.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get references by category for a specific style
   */
  static getReferencesByCategory(
    category: ReferenceCategory,
    style: string,
    spaceType?: SpaceType
  ): ReferenceImage[] {
    return this.getFilteredReferences({
      category,
      style,
      spaceType,
      limit: 20
    });
  }

  /**
   * Get popular references (trending)
   */
  static getPopularReferences(limit: number = 10): ReferenceImage[] {
    return [...REFERENCES_DATABASE]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Get random references for discovery
   */
  static getRandomReferences(count: number = 5): ReferenceImage[] {
    const shuffled = [...REFERENCES_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get reference by ID
   */
  static getReferenceById(id: string): ReferenceImage | undefined {
    return REFERENCES_DATABASE.find(ref => ref.id === id);
  }

  /**
   * Get similar references based on style and colors
   */
  static getSimilarReferences(referenceId: string, limit: number = 6): ReferenceImage[] {
    const reference = this.getReferenceById(referenceId);
    if (!reference) return [];

    // Find references with matching styles and similar colors
    const similar = REFERENCES_DATABASE.filter(ref => {
      if (ref.id === referenceId) return false;
      
      // Check for style overlap
      const hasStyleOverlap = ref.style.some(style => reference.style.includes(style));
      
      // Check for color similarity (at least one matching color)
      const hasColorSimilarity = ref.dominantColors.some(color => 
        reference.dominantColors.includes(color)
      );
      
      return hasStyleOverlap || hasColorSimilarity;
    });

    return similar
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Calculate layout for masonry grid
   */
  static calculateMasonryLayout(
    references: ReferenceImage[],
    columnWidth: number,
    columns: number = 2
  ): Array<{ reference: ReferenceImage; height: number; column: number }> {
    const columnHeights = new Array(columns).fill(0);
    const layout: Array<{ reference: ReferenceImage; height: number; column: number }> = [];

    references.forEach(reference => {
      // Calculate height based on aspect ratio
      const height = Math.round(columnWidth / reference.aspectRatio);
      
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      layout.push({
        reference,
        height,
        column: shortestColumnIndex
      });
      
      // Update column height
      columnHeights[shortestColumnIndex] += height + 12; // 12px gap
    });

    return layout;
  }
}

// External API Integration Services
export class ExternalReferenceService {
  /**
   * Pinterest API integration placeholder
   */
  static async fetchPinterestReferences(
    query: string,
    boardId?: string
  ): Promise<ReferenceImage[]> {
    // TODO: Implement Pinterest API integration
    console.log('🔗 Pinterest API call would happen here:', { query, boardId });
    
    // Mock implementation - replace with actual Pinterest API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return []; // Return empty for now
  }

  /**
   * Unsplash API integration
   */
  static async fetchUnsplashReferences(
    query: string,
    count: number = 12
  ): Promise<ReferenceImage[]> {
    // TODO: Implement Unsplash API integration
    console.log('📸 Unsplash API call would happen here:', { query, count });
    
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return []; // Return empty for now
  }

  /**
   * Refresh and cache external references
   */
  static async refreshReferenceCache(
    style: string,
    spaceType: SpaceType
  ): Promise<void> {
    console.log('🔄 Refreshing reference cache for:', { style, spaceType });
    
    try {
      // Fetch from multiple sources in parallel
      const [pinterestRefs, unsplashRefs] = await Promise.all([
        this.fetchPinterestReferences(`${style} ${spaceType} interior design`),
        this.fetchUnsplashReferences(`${style} ${spaceType} room`)
      ]);
      
      // TODO: Store in cache/database
      console.log('✅ Cache refreshed with external references');
    } catch (error) {
      console.error('❌ Failed to refresh reference cache:', error);
    }
  }
}

// User Collection Management
export class UserReferenceService {
  /**
   * Add reference to user favorites
   */
  static async addToFavorites(userId: string, referenceId: string): Promise<void> {
    // TODO: Implement user favorites storage
    console.log('⭐ Adding to favorites:', { userId, referenceId });
  }

  /**
   * Remove from user favorites
   */
  static async removeFromFavorites(userId: string, referenceId: string): Promise<void> {
    console.log('🗑️ Removing from favorites:', { userId, referenceId });
  }

  /**
   * Get user's favorite references
   */
  static async getUserFavorites(userId: string): Promise<ReferenceImage[]> {
    // TODO: Fetch from user's favorites collection
    console.log('📋 Getting user favorites for:', userId);
    return [];
  }

  /**
   * Upload user's custom reference
   */
  static async uploadUserReference(
    userId: string,
    imageUri: string,
    metadata: Partial<ReferenceImage>
  ): Promise<ReferenceImage> {
    // TODO: Implement image upload to cloud storage
    console.log('📤 Uploading user reference:', { userId, imageUri });
    
    const reference: ReferenceImage = {
      id: `user_${userId}_${Date.now()}`,
      imageUrl: imageUri, // Would be cloud URL after upload
      title: metadata.title || 'My Reference',
      tags: metadata.tags || [],
      style: metadata.style || [],
      spaceType: metadata.spaceType || ['living_room'],
      dominantColors: metadata.dominantColors || ['#FFFFFF'],
      category: metadata.category || 'decor',
      source: 'user-upload',
      popularity: 1, // New uploads start with low popularity
      aspectRatio: metadata.aspectRatio || 1.33,
      dateAdded: new Date().toISOString()
    };
    
    return reference;
  }
}

// Type exports
export type { ReferenceImage, ReferenceCategory, ReferenceSource };