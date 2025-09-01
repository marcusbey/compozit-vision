/**
 * Comprehensive Style Database with Project-Type Compatibility
 * Addresses the issue where garden projects were showing inappropriate indoor styles
 */

export interface StyleDefinition {
  id: string;
  name: string;
  description: string;
  compatibleSpaces: SpaceType[];
  incompatibleSpaces: SpaceType[];
  colorPalette: string[];
  keyCharacteristics: string[];
  popularity: number; // Higher = more popular
  category: StyleCategory;
  icon: string; // Ionicons name
  previewColors: string[]; // For UI preview
}

export type SpaceType = 
  | 'living_room'
  | 'bedroom' 
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'home_office'
  | 'entryway'
  | 'hallway'
  | 'basement'
  | 'attic'
  | 'laundry_room'
  | 'closet'
  | 'pantry'
  | 'garage'
  | 'garden'
  | 'patio'
  | 'balcony'
  | 'deck'
  | 'backyard'
  | 'front_yard'
  | 'outdoor_kitchen'
  | 'pool_area';

export type StyleCategory = 'indoor' | 'outdoor' | 'universal';

// Complete styles database
export const STYLES_DATABASE: StyleDefinition[] = [
  // OUTDOOR/GARDEN STYLES
  {
    id: 'mediterranean_garden',
    name: 'Mediterranean Garden',
    description: 'Warm, sun-soaked aesthetic with terracotta, stone, and drought-resistant plants',
    compatibleSpaces: ['garden', 'patio', 'backyard', 'front_yard', 'pool_area', 'deck'],
    incompatibleSpaces: ['bedroom', 'bathroom', 'closet', 'pantry', 'laundry_room'],
    colorPalette: ['#8B4513', '#CD853F', '#F4A460', '#228B22', '#6B8E23'],
    keyCharacteristics: [
      'Terracotta pots and tiles',
      'Stone pathways', 
      'Olive trees and lavender',
      'Water features',
      'Wrought iron accents'
    ],
    popularity: 85,
    category: 'outdoor',
    icon: 'sunny-outline',
    previewColors: ['#CD853F', '#228B22', '#8B4513']
  },
  {
    id: 'modern_landscape',
    name: 'Modern Landscape',
    description: 'Clean lines, geometric shapes, and contemporary materials for outdoor spaces',
    compatibleSpaces: ['garden', 'patio', 'backyard', 'front_yard', 'deck', 'balcony'],
    incompatibleSpaces: ['bedroom', 'bathroom', 'closet'],
    colorPalette: ['#2F2F2F', '#FFFFFF', '#4A5568', '#68D391', '#A0AEC0'],
    keyCharacteristics: [
      'Geometric planters',
      'Steel and concrete elements',
      'Minimalist plant selection',
      'Linear water features',
      'LED lighting integration'
    ],
    popularity: 90,
    category: 'outdoor',
    icon: 'square-outline',
    previewColors: ['#2F2F2F', '#68D391', '#A0AEC0']
  },
  {
    id: 'cottage_garden',
    name: 'Cottage Garden',
    description: 'Charming, romantic style with abundant flowers and informal planting',
    compatibleSpaces: ['garden', 'backyard', 'front_yard'],
    incompatibleSpaces: ['garage', 'basement', 'office'],
    colorPalette: ['#FFB6C1', '#98FB98', '#FFFAF0', '#DDA0DD', '#F0E68C'],
    keyCharacteristics: [
      'Mixed flower borders',
      'Picket fences',
      'Climbing roses',
      'Gravel paths',
      'Vintage garden furniture'
    ],
    popularity: 75,
    category: 'outdoor',
    icon: 'flower-outline',
    previewColors: ['#FFB6C1', '#98FB98', '#DDA0DD']
  },
  {
    id: 'japanese_garden',
    name: 'Japanese Garden',
    description: 'Serene, contemplative design emphasizing harmony and natural elements',
    compatibleSpaces: ['garden', 'patio', 'backyard', 'balcony'],
    incompatibleSpaces: ['kitchen', 'bathroom', 'laundry_room'],
    colorPalette: ['#2F4F2F', '#8FBC8F', '#A0522D', '#708090', '#F5F5DC'],
    keyCharacteristics: [
      'Stone lanterns',
      'Bamboo features',
      'Koi ponds',
      'Moss and ferns',
      'Zen rock arrangements'
    ],
    popularity: 70,
    category: 'outdoor',
    icon: 'leaf-outline',
    previewColors: ['#2F4F2F', '#8FBC8F', '#A0522D']
  },
  {
    id: 'tropical_garden',
    name: 'Tropical Garden',
    description: 'Lush, vibrant paradise with bold foliage and exotic plants',
    compatibleSpaces: ['garden', 'patio', 'backyard', 'pool_area', 'balcony'],
    incompatibleSpaces: ['closet', 'pantry', 'garage'],
    colorPalette: ['#228B22', '#FF6347', '#FFD700', '#FF69B4', '#20B2AA'],
    keyCharacteristics: [
      'Large-leaf plants',
      'Bright flowering trees',
      'Natural wood decking',
      'Water features',
      'Colorful outdoor furniture'
    ],
    popularity: 80,
    category: 'outdoor',
    icon: 'color-palette-outline',
    previewColors: ['#228B22', '#FF6347', '#20B2AA']
  },

  // INDOOR STYLES
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light woods, neutral colors, and functional design emphasizing hygge',
    compatibleSpaces: ['living_room', 'bedroom', 'kitchen', 'dining_room', 'home_office', 'entryway'],
    incompatibleSpaces: ['garden', 'patio', 'pool_area', 'outdoor_kitchen'],
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D2B48C', '#4A5568'],
    keyCharacteristics: [
      'Light wood furniture',
      'Neutral textiles',
      'Minimalist decor',
      'Natural light emphasis',
      'Cozy textures'
    ],
    popularity: 95,
    category: 'indoor',
    icon: 'home-outline',
    previewColors: ['#FFFFFF', '#D2B48C', '#4A5568']
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, minimalist approach, and contemporary materials',
    compatibleSpaces: ['living_room', 'kitchen', 'home_office', 'dining_room', 'entryway', 'hallway'],
    incompatibleSpaces: ['garden', 'backyard', 'pool_area'],
    colorPalette: ['#FFFFFF', '#2D2D2D', '#808080', '#4A90E2', '#F0F0F0'],
    keyCharacteristics: [
      'Sleek furniture',
      'Metal and glass accents',
      'Open floor plans',
      'Neutral color schemes',
      'Statement lighting'
    ],
    popularity: 92,
    category: 'indoor',
    icon: 'apps-outline',
    previewColors: ['#FFFFFF', '#2D2D2D', '#4A90E2']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Less is more philosophy with clean, uncluttered spaces',
    compatibleSpaces: ['living_room', 'bedroom', 'home_office', 'entryway', 'hallway'],
    incompatibleSpaces: ['garden', 'patio', 'outdoor_kitchen'],
    colorPalette: ['#FFFFFF', '#F8F8F8', '#E0E0E0', '#424242', '#757575'],
    keyCharacteristics: [
      'Essential furniture only',
      'Hidden storage',
      'Monochromatic schemes',
      'Clean surfaces',
      'Natural materials'
    ],
    popularity: 88,
    category: 'indoor',
    icon: 'remove-outline',
    previewColors: ['#FFFFFF', '#424242', '#E0E0E0']
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials, exposed elements, and urban loft aesthetic',
    compatibleSpaces: ['living_room', 'kitchen', 'home_office', 'dining_room', 'basement'],
    incompatibleSpaces: ['garden', 'bedroom', 'bathroom'],
    colorPalette: ['#2F2F2F', '#8B4513', '#CD853F', '#696969', '#A0522D'],
    keyCharacteristics: [
      'Exposed brick and pipes',
      'Metal furniture',
      'Edison bulb lighting',
      'Reclaimed wood',
      'High ceilings'
    ],
    popularity: 78,
    category: 'indoor',
    icon: 'construct-outline',
    previewColors: ['#2F2F2F', '#CD853F', '#696969']
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic, colorful, and free-spirited with global influences',
    compatibleSpaces: ['living_room', 'bedroom', 'dining_room', 'patio', 'balcony'],
    incompatibleSpaces: ['garage', 'laundry_room', 'pantry'],
    colorPalette: ['#8B008B', '#FF6347', '#FFD700', '#20B2AA', '#CD853F'],
    keyCharacteristics: [
      'Layered textiles',
      'Global artifacts',
      'Rich colors and patterns',
      'Floor cushions',
      'Hanging plants'
    ],
    popularity: 72,
    category: 'indoor',
    icon: 'color-filter-outline',
    previewColors: ['#8B008B', '#FF6347', '#20B2AA']
  },
  {
    id: 'mid_century_modern',
    name: 'Mid-Century Modern',
    description: 'Retro 1950s-60s design with clean lines and bold colors',
    compatibleSpaces: ['living_room', 'dining_room', 'home_office', 'entryway'],
    incompatibleSpaces: ['garden', 'bathroom', 'closet'],
    colorPalette: ['#D2691E', '#4169E1', '#FFD700', '#228B22', '#2F2F2F'],
    keyCharacteristics: [
      'Tapered furniture legs',
      'Bold geometric patterns',
      'Starburst clocks',
      'Rich wood tones',
      'Statement colors'
    ],
    popularity: 82,
    category: 'indoor',
    icon: 'radio-outline',
    previewColors: ['#D2691E', '#4169E1', '#228B22']
  },
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic, timeless elegance with refined furnishings',
    compatibleSpaces: ['living_room', 'dining_room', 'bedroom', 'home_office', 'entryway'],
    incompatibleSpaces: ['garden', 'garage', 'basement'],
    colorPalette: ['#8B4513', '#228B22', '#191970', '#DC143C', '#F5F5DC'],
    keyCharacteristics: [
      'Rich wood furniture',
      'Elegant fabrics',
      'Symmetrical layouts',
      'Classic patterns',
      'Formal arrangements'
    ],
    popularity: 85,
    category: 'indoor',
    icon: 'library-outline',
    previewColors: ['#8B4513', '#228B22', '#191970']
  },
  {
    id: 'farmhouse',
    name: 'Modern Farmhouse',
    description: 'Rustic charm meets contemporary comfort',
    compatibleSpaces: ['kitchen', 'dining_room', 'living_room', 'entryway', 'laundry_room'],
    incompatibleSpaces: ['garden', 'pool_area', 'balcony'],
    colorPalette: ['#FFFFFF', '#2F2F2F', '#8B4513', '#228B22', '#F5F5DC'],
    keyCharacteristics: [
      'Shiplap walls',
      'Barn doors',
      'Farmhouse sinks',
      'Rustic wood beams',
      'Vintage accessories'
    ],
    popularity: 87,
    category: 'indoor',
    icon: 'home-outline',
    previewColors: ['#FFFFFF', '#8B4513', '#228B22']
  },

  // UNIVERSAL STYLES (work everywhere)
  {
    id: 'transitional',
    name: 'Transitional',
    description: 'Perfect blend of traditional and contemporary elements',
    compatibleSpaces: [], // Empty means compatible with all
    incompatibleSpaces: [],
    colorPalette: ['#F5F5F5', '#8B4513', '#4A5568', '#228B22', '#DC143C'],
    keyCharacteristics: [
      'Mixed textures',
      'Balanced proportions',
      'Neutral base colors',
      'Classic with modern twist',
      'Comfortable elegance'
    ],
    popularity: 90,
    category: 'universal',
    icon: 'swap-horizontal-outline',
    previewColors: ['#F5F5F5', '#8B4513', '#4A5568']
  },
  {
    id: 'eclectic',
    name: 'Eclectic',
    description: 'Curated mix of styles, periods, and personal collections',
    compatibleSpaces: [], // Universal
    incompatibleSpaces: [],
    colorPalette: ['#FF6347', '#4169E1', '#FFD700', '#8B008B', '#228B22'],
    keyCharacteristics: [
      'Mixed furniture styles',
      'Personal collections',
      'Bold color combinations',
      'Unique accessories',
      'Creative arrangements'
    ],
    popularity: 75,
    category: 'universal',
    icon: 'shuffle-outline',
    previewColors: ['#FF6347', '#4169E1', '#8B008B']
  }
];

// Utility functions for filtering styles
export class StyleService {
  /**
   * Get styles appropriate for a specific space type
   */
  static getStylesForSpace(spaceType: SpaceType): StyleDefinition[] {
    return STYLES_DATABASE.filter(style => {
      // Universal styles (empty compatibleSpaces) work everywhere
      if (style.compatibleSpaces.length === 0) {
        return !style.incompatibleSpaces.includes(spaceType);
      }
      
      // Check if space is compatible and not incompatible
      return style.compatibleSpaces.includes(spaceType) && 
             !style.incompatibleSpaces.includes(spaceType);
    }).sort((a, b) => b.popularity - a.popularity); // Sort by popularity
  }

  /**
   * Get style by ID
   */
  static getStyleById(id: string): StyleDefinition | undefined {
    return STYLES_DATABASE.find(style => style.id === id);
  }

  /**
   * Get styles by category
   */
  static getStylesByCategory(category: StyleCategory): StyleDefinition[] {
    return STYLES_DATABASE
      .filter(style => style.category === category)
      .sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Search styles by name or characteristics
   */
  static searchStyles(query: string): StyleDefinition[] {
    const lowerQuery = query.toLowerCase();
    return STYLES_DATABASE.filter(style =>
      style.name.toLowerCase().includes(lowerQuery) ||
      style.description.toLowerCase().includes(lowerQuery) ||
      style.keyCharacteristics.some(char => 
        char.toLowerCase().includes(lowerQuery)
      )
    ).sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get popular styles (top 10)
   */
  static getPopularStyles(): StyleDefinition[] {
    return STYLES_DATABASE
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);
  }

  /**
   * Check if a style is appropriate for outdoor spaces
   */
  static isOutdoorStyle(styleId: string): boolean {
    const style = this.getStyleById(styleId);
    return style?.category === 'outdoor' || false;
  }

  /**
   * Check if a style is appropriate for indoor spaces
   */
  static isIndoorStyle(styleId: string): boolean {
    const style = this.getStyleById(styleId);
    return style?.category === 'indoor' || style?.category === 'universal' || false;
  }

  /**
   * Get recommended styles based on space characteristics
   */
  static getRecommendedStyles(spaceType: SpaceType, preferences?: {
    colorPreference?: 'warm' | 'cool' | 'neutral';
    complexity?: 'simple' | 'moderate' | 'complex';
  }): StyleDefinition[] {
    let styles = this.getStylesForSpace(spaceType);
    
    if (preferences?.complexity === 'simple') {
      // Prioritize minimalist and modern styles
      styles = styles.filter(style => 
        ['minimalist', 'modern', 'scandinavian'].includes(style.id)
      );
    }
    
    return styles.slice(0, 8); // Top 8 recommendations
  }
}

// Type exports
export type { StyleDefinition, SpaceType, StyleCategory };