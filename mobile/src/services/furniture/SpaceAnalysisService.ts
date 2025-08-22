// Mock SpaceAnalysis service - to be replaced by Agent 1's actual implementation
import { 
  FurnitureCategory, 
  FurniturePriority, 
  FurnitureStyle, 
  RoomType, 
  PromptContext 
} from '../../types/furniture';

export interface SpaceAnalysisResult {
  roomType: RoomType;
  roomCharacteristics: {
    size: 'small' | 'medium' | 'large';
    lighting: 'bright' | 'moderate' | 'dim';
    existingStyle?: string;
    colorScheme?: string[];
  };
  detectedObjects: string[];
  furniturePriorities: FurniturePriority[];
  contextualPrompts: string[];
}

export class SpaceAnalysisService {
  // Mock implementation - Agent 1 will replace with real AI analysis
  static analyzeSpace(imageUrl: string): Promise<SpaceAnalysisResult> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const mockResult: SpaceAnalysisResult = {
          roomType: RoomType.LIVING_ROOM,
          roomCharacteristics: {
            size: 'medium',
            lighting: 'bright',
            existingStyle: 'modern',
            colorScheme: ['#FFFFFF', '#E5E5E5', '#8B7355']
          },
          detectedObjects: ['sofa', 'coffee table', 'window', 'lamp'],
          furniturePriorities: [
            {
              category: FURNITURE_CATEGORIES[0], // Seating
              priority: 9,
              reason: 'Missing primary seating arrangement',
              suggestedItems: ['modern-sofa-1', 'sectional-2', 'accent-chair-3']
            },
            {
              category: FURNITURE_CATEGORIES[1], // Tables
              priority: 7,
              reason: 'Coffee table would enhance functionality',
              suggestedItems: ['coffee-table-1', 'side-table-2']
            },
            {
              category: FURNITURE_CATEGORIES[2], // Storage
              priority: 6,
              reason: 'Additional storage would reduce clutter',
              suggestedItems: ['bookshelf-1', 'media-console-2']
            }
          ],
          contextualPrompts: [
            'Add cozy seating for family gatherings',
            'Include modern storage solutions',
            'Enhance the room with warm lighting'
          ]
        };
        resolve(mockResult);
      }, 1500);
    });
  }

  static getTopFurnitureCategories(priorities: FurniturePriority[], limit = 3): FurnitureCategory[] {
    return priorities
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
      .map(p => p.category);
  }

  static generateContextualPrompts(context: PromptContext): string[] {
    const prompts: string[] = [];

    if (context.roomType) {
      const roomSpecific = ROOM_SPECIFIC_PROMPTS[context.roomType];
      if (roomSpecific) {
        prompts.push(...roomSpecific);
      }
    }

    if (context.detectedObjects && context.detectedObjects.length > 0) {
      prompts.push(`Complement the existing ${context.detectedObjects.join(', ')}`);
    }

    if (context.spaceCharacteristics?.size) {
      const sizePrompts = SIZE_SPECIFIC_PROMPTS[context.spaceCharacteristics.size];
      prompts.push(...sizePrompts);
    }

    return prompts.slice(0, 6); // Return max 6 suggestions
  }
}

// Mock furniture categories data
export const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  {
    id: 'seating',
    name: 'seating',
    displayName: 'Seating',
    description: 'Sofas, chairs, and seating solutions',
    iconName: 'seat',
    visualImpactScore: 9,
    roomCompatibility: [RoomType.LIVING_ROOM, RoomType.BEDROOM, RoomType.OFFICE]
  },
  {
    id: 'tables',
    name: 'tables',
    displayName: 'Tables',
    description: 'Coffee tables, side tables, and surfaces',
    iconName: 'table',
    visualImpactScore: 7,
    roomCompatibility: [RoomType.LIVING_ROOM, RoomType.DINING_ROOM, RoomType.OFFICE]
  },
  {
    id: 'storage',
    name: 'storage',
    displayName: 'Storage',
    description: 'Shelves, cabinets, and organization',
    iconName: 'archive',
    visualImpactScore: 6,
    roomCompatibility: [RoomType.LIVING_ROOM, RoomType.BEDROOM, RoomType.OFFICE]
  },
  {
    id: 'lighting',
    name: 'lighting',
    displayName: 'Lighting',
    description: 'Lamps, fixtures, and ambient lighting',
    iconName: 'bulb',
    visualImpactScore: 8,
    roomCompatibility: [RoomType.LIVING_ROOM, RoomType.BEDROOM, RoomType.OFFICE]
  },
  {
    id: 'decor',
    name: 'decor',
    displayName: 'Decor',
    description: 'Art, plants, and decorative accessories',
    iconName: 'star',
    visualImpactScore: 5,
    roomCompatibility: [RoomType.LIVING_ROOM, RoomType.BEDROOM, RoomType.OFFICE, RoomType.DINING_ROOM]
  }
];

// Mock furniture styles data
export const MOCK_FURNITURE_STYLES: Record<string, FurnitureStyle[]> = {
  seating: [
    {
      id: 'modern-sectional',
      name: 'Modern Sectional',
      description: 'Clean lines with contemporary appeal',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['modern', 'contemporary'],
      priceRange: { min: 1200, max: 2500, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM],
        designStyles: ['modern', 'contemporary', 'minimalist'],
        colorPalettes: ['neutral', 'monochrome', 'earth tones']
      },
      visualImpactScore: 9,
      popularity: 85
    },
    {
      id: 'vintage-armchair',
      name: 'Vintage Leather Armchair',
      description: 'Classic design with timeless appeal',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['vintage', 'traditional'],
      priceRange: { min: 600, max: 1200, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.OFFICE],
        designStyles: ['traditional', 'vintage', 'eclectic'],
        colorPalettes: ['warm tones', 'rich colors']
      },
      visualImpactScore: 7,
      popularity: 72
    },
    {
      id: 'mid-century-loveseat',
      name: 'Mid-Century Loveseat',
      description: 'Retro charm with modern comfort',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['mid-century', 'retro'],
      priceRange: { min: 800, max: 1600, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.BEDROOM],
        designStyles: ['mid-century', 'retro', 'eclectic'],
        colorPalettes: ['bold colors', 'warm tones']
      },
      visualImpactScore: 8,
      popularity: 78
    }
  ],
  tables: [
    {
      id: 'glass-coffee-table',
      name: 'Glass Coffee Table',
      description: 'Transparent elegance for modern spaces',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['modern', 'contemporary'],
      priceRange: { min: 400, max: 800, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM],
        designStyles: ['modern', 'contemporary', 'minimalist'],
        colorPalettes: ['any']
      },
      visualImpactScore: 6,
      popularity: 68
    },
    {
      id: 'wood-side-table',
      name: 'Solid Wood Side Table',
      description: 'Natural warmth and durability',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['rustic', 'natural'],
      priceRange: { min: 200, max: 500, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.BEDROOM],
        designStyles: ['rustic', 'natural', 'farmhouse'],
        colorPalettes: ['warm tones', 'earth tones']
      },
      visualImpactScore: 5,
      popularity: 75
    },
    {
      id: 'industrial-console',
      name: 'Industrial Console Table',
      description: 'Raw materials with urban style',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['industrial', 'urban'],
      priceRange: { min: 600, max: 1200, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.ENTRYWAY],
        designStyles: ['industrial', 'urban', 'loft'],
        colorPalettes: ['dark tones', 'metallic']
      },
      visualImpactScore: 7,
      popularity: 64
    }
  ],
  storage: [
    {
      id: 'floating-shelves',
      name: 'Floating Wall Shelves',
      description: 'Space-saving modern storage',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['modern', 'minimalist'],
      priceRange: { min: 150, max: 400, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.OFFICE, RoomType.BEDROOM],
        designStyles: ['modern', 'minimalist', 'contemporary'],
        colorPalettes: ['any']
      },
      visualImpactScore: 4,
      popularity: 82
    },
    {
      id: 'vintage-bookcase',
      name: 'Vintage Wooden Bookcase',
      description: 'Classic storage with character',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['vintage', 'traditional'],
      priceRange: { min: 500, max: 1000, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.OFFICE],
        designStyles: ['traditional', 'vintage', 'classic'],
        colorPalettes: ['warm tones', 'rich colors']
      },
      visualImpactScore: 6,
      popularity: 71
    },
    {
      id: 'modular-cube-storage',
      name: 'Modular Cube Storage',
      description: 'Flexible and functional organization',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600',
      styleCategories: ['modern', 'functional'],
      priceRange: { min: 300, max: 700, currency: 'USD' },
      compatibility: {
        roomTypes: [RoomType.LIVING_ROOM, RoomType.KIDS_ROOM, RoomType.OFFICE],
        designStyles: ['modern', 'contemporary', 'minimalist'],
        colorPalettes: ['bright colors', 'neutral']
      },
      visualImpactScore: 5,
      popularity: 79
    }
  ]
};

// Prompt suggestions by room type
const ROOM_SPECIFIC_PROMPTS: Record<RoomType, string[]> = {
  [RoomType.LIVING_ROOM]: [
    'Create a cozy conversation area',
    'Add a statement piece for the focal wall',
    'Include comfortable seating for entertaining'
  ],
  [RoomType.BEDROOM]: [
    'Design a peaceful retreat for relaxation',
    'Add storage for clothing and personal items',
    'Create ambient lighting for evening'
  ],
  [RoomType.DINING_ROOM]: [
    'Design for memorable family meals',
    'Include elegant serving solutions',
    'Add lighting for intimate dining'
  ],
  [RoomType.KITCHEN]: [
    'Optimize for cooking and storage',
    'Add functional workspace elements',
    'Include organization solutions'
  ],
  [RoomType.OFFICE]: [
    'Create a productive work environment',
    'Add ergonomic furniture for long hours',
    'Include smart storage for documents'
  ],
  [RoomType.BATHROOM]: [
    'Maximize storage in small spaces',
    'Add luxurious spa-like elements',
    'Include practical organization'
  ],
  [RoomType.OUTDOOR]: [
    'Design for weather resistance',
    'Add comfortable outdoor seating',
    'Include elements for entertaining'
  ],
  [RoomType.ENTRYWAY]: [
    'Create a welcoming first impression',
    'Add storage for coats and shoes',
    'Include a console for keys and mail'
  ],
  [RoomType.KIDS_ROOM]: [
    'Design for play and learning',
    'Add safe, child-friendly furniture',
    'Include organization for toys and clothes'
  ]
};

// Size-specific prompt suggestions
const SIZE_SPECIFIC_PROMPTS: Record<string, string[]> = {
  small: [
    'Maximize space with multi-functional furniture',
    'Use vertical storage solutions',
    'Choose light colors to open up the space'
  ],
  medium: [
    'Balance furniture scale with room proportions',
    'Create distinct zones for different activities',
    'Add statement pieces without overwhelming'
  ],
  large: [
    'Fill the space with appropriately scaled furniture',
    'Create multiple conversation areas',
    'Use large statement pieces as focal points'
  ]
};