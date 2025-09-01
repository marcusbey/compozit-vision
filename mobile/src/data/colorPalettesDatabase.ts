/**
 * Color Palettes Database
 * Curated color palettes organized by style and mood, with user upload/extraction capability
 */

import { SpaceType } from './stylesDatabase';

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[]; // Array of hex colors (3-6 colors per palette)
  primaryColor: string; // Main color
  accentColor: string; // Secondary color
  style: string[]; // Compatible styles
  spaceType: SpaceType[]; // Compatible spaces
  mood: ColorMood[];
  category: PaletteCategory;
  source: PaletteSource;
  popularity: number;
  tags: string[];
  imageUrl?: string; // Preview image showing palette in use
  dateAdded: string;
  metadata?: {
    designer?: string;
    sourceUrl?: string;
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    colorTemperature?: 'warm' | 'cool' | 'neutral';
  };
}

export type ColorMood = 
  | 'calming' 
  | 'energizing' 
  | 'cozy' 
  | 'sophisticated' 
  | 'playful' 
  | 'dramatic' 
  | 'fresh' 
  | 'earthy' 
  | 'luxurious' 
  | 'minimalist';

export type PaletteCategory = 
  | 'monochromatic' 
  | 'complementary' 
  | 'analogous' 
  | 'triadic' 
  | 'neutral' 
  | 'earth-tones' 
  | 'pastels' 
  | 'bold';

export type PaletteSource = 
  | 'curated' 
  | 'nature' 
  | 'art' 
  | 'user-upload' 
  | 'extracted';

// Curated color palettes database
export const COLOR_PALETTES_DATABASE: ColorPalette[] = [
  // SCANDINAVIAN PALETTES
  {
    id: 'scand_neutral_001',
    name: 'Nordic Serenity',
    description: 'Soft whites and warm grays with natural wood undertones',
    colors: ['#FDFBF7', '#F5F5F5', '#E8E8E8', '#D2B48C', '#4A5568'],
    primaryColor: '#FDFBF7',
    accentColor: '#D2B48C',
    style: ['scandinavian', 'minimalist'],
    spaceType: ['living_room', 'bedroom', 'kitchen', 'home_office'],
    mood: ['calming', 'minimalist', 'cozy'],
    category: 'neutral',
    source: 'curated',
    popularity: 95,
    tags: ['white', 'gray', 'wood', 'natural', 'hygge'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-01',
    metadata: {
      colorTemperature: 'neutral',
      season: 'winter'
    }
  },
  {
    id: 'scand_sage_001',
    name: 'Scandinavian Sage',
    description: 'Muted sage green with creamy whites and soft beiges',
    colors: ['#F7F7F5', '#E8E6E1', '#C7C8AA', '#9CAF88', '#6B7C6B'],
    primaryColor: '#F7F7F5',
    accentColor: '#9CAF88',
    style: ['scandinavian', 'minimalist', 'modern'],
    spaceType: ['living_room', 'bedroom', 'kitchen'],
    mood: ['calming', 'fresh', 'earthy'],
    category: 'analogous',
    source: 'nature',
    popularity: 88,
    tags: ['sage', 'green', 'natural', 'muted', 'organic'],
    imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-02'
  },

  // MODERN PALETTES
  {
    id: 'mod_mono_001',
    name: 'Modern Monochrome',
    description: 'Bold blacks and whites with subtle gray transitions',
    colors: ['#FFFFFF', '#F0F0F0', '#808080', '#404040', '#000000'],
    primaryColor: '#FFFFFF',
    accentColor: '#000000',
    style: ['modern', 'minimalist', 'industrial'],
    spaceType: ['living_room', 'home_office', 'kitchen'],
    mood: ['sophisticated', 'dramatic', 'minimalist'],
    category: 'monochromatic',
    source: 'curated',
    popularity: 92,
    tags: ['black', 'white', 'gray', 'contrast', 'bold'],
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-03'
  },
  {
    id: 'mod_blue_001',
    name: 'Modern Ocean',
    description: 'Deep navy and ocean blues with crisp whites',
    colors: ['#FFFFFF', '#E6F2FF', '#4A90E2', '#2E5C8A', '#1A365D'],
    primaryColor: '#FFFFFF',
    accentColor: '#4A90E2',
    style: ['modern', 'transitional'],
    spaceType: ['living_room', 'home_office', 'bedroom'],
    mood: ['calming', 'sophisticated', 'fresh'],
    category: 'analogous',
    source: 'nature',
    popularity: 85,
    tags: ['blue', 'navy', 'ocean', 'calming', 'professional'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-04'
  },

  // MEDITERRANEAN GARDEN PALETTES
  {
    id: 'med_terracotta_001',
    name: 'Mediterranean Warmth',
    description: 'Warm terracotta and ochre with olive green accents',
    colors: ['#F4E4BC', '#CD853F', '#D2691E', '#8B4513', '#228B22'],
    primaryColor: '#CD853F',
    accentColor: '#228B22',
    style: ['mediterranean_garden'],
    spaceType: ['garden', 'patio', 'outdoor_kitchen'],
    mood: ['earthy', 'energizing', 'cozy'],
    category: 'earth-tones',
    source: 'nature',
    popularity: 90,
    tags: ['terracotta', 'olive', 'warm', 'mediterranean', 'outdoor'],
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-05',
    metadata: {
      colorTemperature: 'warm',
      season: 'summer'
    }
  },
  {
    id: 'med_coastal_001',
    name: 'Coastal Mediterranean',
    description: 'Sea blues and sandy beiges with white stucco',
    colors: ['#F8F8FF', '#F5F5DC', '#20B2AA', '#4682B4', '#2F4F4F'],
    primaryColor: '#F8F8FF',
    accentColor: '#20B2AA',
    style: ['mediterranean_garden', 'modern_landscape'],
    spaceType: ['garden', 'patio', 'pool_area'],
    mood: ['fresh', 'calming', 'luxurious'],
    category: 'complementary',
    source: 'nature',
    popularity: 87,
    tags: ['coastal', 'blue', 'beige', 'fresh', 'water'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-06'
  },

  // MODERN LANDSCAPE PALETTES
  {
    id: 'mod_land_001',
    name: 'Urban Jungle',
    description: 'Concrete grays with vibrant green plantings',
    colors: ['#F5F5F5', '#A0AEC0', '#68D391', '#38A169', '#2D3748'],
    primaryColor: '#F5F5F5',
    accentColor: '#68D391',
    style: ['modern_landscape'],
    spaceType: ['garden', 'patio', 'balcony'],
    mood: ['fresh', 'energizing', 'minimalist'],
    category: 'complementary',
    source: 'curated',
    popularity: 91,
    tags: ['concrete', 'green', 'urban', 'plants', 'modern'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-07'
  },

  // BOHEMIAN PALETTES
  {
    id: 'boho_jewel_001',
    name: 'Bohemian Jewels',
    description: 'Rich jewel tones with golden accents',
    colors: ['#F5E6D3', '#FFD700', '#8B008B', '#FF6347', '#20B2AA'],
    primaryColor: '#F5E6D3',
    accentColor: '#8B008B',
    style: ['bohemian', 'eclectic'],
    spaceType: ['living_room', 'bedroom', 'dining_room'],
    mood: ['dramatic', 'playful', 'luxurious'],
    category: 'bold',
    source: 'art',
    popularity: 78,
    tags: ['jewel tones', 'purple', 'gold', 'rich', 'vibrant'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-08'
  },

  // TRADITIONAL PALETTES
  {
    id: 'trad_classic_001',
    name: 'Classic Elegance',
    description: 'Deep burgundy and forest green with cream',
    colors: ['#F5F5DC', '#8B4513', '#800000', '#228B22', '#191970'],
    primaryColor: '#F5F5DC',
    accentColor: '#800000',
    style: ['traditional', 'transitional'],
    spaceType: ['living_room', 'dining_room', 'home_office'],
    mood: ['sophisticated', 'cozy', 'luxurious'],
    category: 'complementary',
    source: 'curated',
    popularity: 82,
    tags: ['burgundy', 'green', 'classic', 'elegant', 'formal'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-09'
  },

  // MINIMALIST PALETTES
  {
    id: 'min_zen_001',
    name: 'Zen Neutrals',
    description: 'Ultra-minimal palette with subtle warm undertones',
    colors: ['#FFFFFF', '#F8F8F8', '#E0E0E0', '#C0C0C0', '#424242'],
    primaryColor: '#FFFFFF',
    accentColor: '#424242',
    style: ['minimalist', 'modern', 'scandinavian'],
    spaceType: ['living_room', 'bedroom', 'home_office'],
    mood: ['calming', 'minimalist', 'sophisticated'],
    category: 'monochromatic',
    source: 'curated',
    popularity: 89,
    tags: ['minimal', 'white', 'zen', 'calm', 'simple'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-10'
  },

  // PASTEL PALETTES
  {
    id: 'past_spring_001',
    name: 'Spring Pastels',
    description: 'Soft pastels inspired by spring blooms',
    colors: ['#FFF8DC', '#FFB6C1', '#E6E6FA', '#98FB98', '#F0E68C'],
    primaryColor: '#FFF8DC',
    accentColor: '#FFB6C1',
    style: ['scandinavian', 'bohemian', 'transitional'],
    spaceType: ['bedroom', 'living_room', 'dining_room'],
    mood: ['playful', 'fresh', 'cozy'],
    category: 'pastels',
    source: 'nature',
    popularity: 75,
    tags: ['pastel', 'pink', 'soft', 'spring', 'feminine'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-11',
    metadata: {
      season: 'spring',
      colorTemperature: 'warm'
    }
  },

  // VIBRANT PALETTES (INSPIRED BY YOUR SCREENSHOTS)
  {
    id: 'vibrant_surprise_001',
    name: 'Surprise Me',
    description: 'Rainbow gradient of vibrant colors',
    colors: ['#FFEB3B', '#4CAF50', '#00BCD4', '#2196F3', '#9C27B0', '#F44336'],
    primaryColor: '#FFFF00',
    accentColor: '#FF00FF',
    style: ['modern', 'bohemian', 'eclectic'],
    spaceType: ['living_room', 'dining_room', 'kids_room'],
    mood: ['energizing', 'playful', 'dramatic'],
    category: 'bold',
    source: 'curated',
    popularity: 95,
    tags: ['rainbow', 'gradient', 'vibrant', 'surprise', 'colorful'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-11'
  },
  {
    id: 'modern_millennial_001',
    name: 'Millennial Gray',
    description: 'Classic monochrome grays in perfect gradient',
    colors: ['#F8F8F8', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575'],
    primaryColor: '#F8F8F8',
    accentColor: '#757575',
    style: ['modern', 'minimalist', 'industrial'],
    spaceType: ['living_room', 'home_office', 'kitchen'],
    mood: ['sophisticated', 'minimalist', 'calming'],
    category: 'monochromatic',
    source: 'curated',
    popularity: 92,
    tags: ['gray', 'monochrome', 'gradient', 'modern', 'millennial'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-11'
  },
  {
    id: 'terracotta_mirage_001',
    name: 'Terracotta Mirage',
    description: 'Warm terracotta and peach gradient tones',
    colors: ['#FFF5F5', '#FFCCCC', '#FF9999', '#E57373', '#D84315'],
    primaryColor: '#FFF5F5',
    accentColor: '#E57373',
    style: ['mediterranean_garden', 'bohemian', 'traditional'],
    spaceType: ['living_room', 'dining_room', 'bedroom'],
    mood: ['cozy', 'earthy', 'luxurious'],
    category: 'earth-tones',
    source: 'curated',
    popularity: 89,
    tags: ['terracotta', 'peach', 'warm', 'gradient', 'mirage'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-11'
  },
  {
    id: 'vibrant_sunset_001',
    name: 'Neon Sunset',
    description: 'Bold oranges, magentas and bright yellows',
    colors: ['#FF9800', '#E91E63', '#9C27B0', '#FFEB3B', '#FFB74D'],
    primaryColor: '#FF6B35',
    accentColor: '#FF006E',
    style: ['modern', 'bohemian', 'eclectic'],
    spaceType: ['living_room', 'dining_room', 'home_office'],
    mood: ['energizing', 'dramatic', 'playful'],
    category: 'bold',
    source: 'curated',
    popularity: 88,
    tags: ['neon', 'sunset', 'vibrant', 'bold', 'orange'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-12'
  },
  {
    id: 'nature_forest_001',
    name: 'Forest Hues',
    description: 'Deep greens and sage tones from nature',
    colors: ['#A8DADC', '#457B9D', '#1D3557', '#606C38', '#283618'],
    primaryColor: '#A8DADC',
    accentColor: '#457B9D',
    style: ['scandinavian', 'modern', 'traditional'],
    spaceType: ['living_room', 'bedroom', 'home_office'],
    mood: ['calming', 'earthy', 'sophisticated'],
    category: 'analogous',
    source: 'nature',
    popularity: 92,
    tags: ['forest', 'green', 'nature', 'calming', 'sage'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-13'
  },
  {
    id: 'peach_orchard_001',
    name: 'Peach Orchard',
    description: 'Soft peach and coral tones with cream',
    colors: ['#FDF6E3', '#FFCCB6', '#F4A261', '#E76F51', '#E9C46A'],
    primaryColor: '#FDF6E3',
    accentColor: '#E76F51',
    style: ['scandinavian', 'transitional', 'bohemian'],
    spaceType: ['bedroom', 'living_room', 'dining_room'],
    mood: ['cozy', 'fresh', 'playful'],
    category: 'analogous',
    source: 'nature',
    popularity: 85,
    tags: ['peach', 'coral', 'warm', 'soft', 'cream'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-14'
  },
  {
    id: 'fuschia_blossom_001',
    name: 'Fuschia Blossom',
    description: 'Bold fuchsia with soft pinks and whites',
    colors: ['#FFE5F1', '#FFB3DA', '#FF69B4', '#C71585', '#8B008B'],
    primaryColor: '#FFE5F1',
    accentColor: '#FF69B4',
    style: ['modern', 'bohemian', 'eclectic'],
    spaceType: ['bedroom', 'living_room', 'home_office'],
    mood: ['dramatic', 'playful', 'luxurious'],
    category: 'monochromatic',
    source: 'curated',
    popularity: 78,
    tags: ['fuschia', 'pink', 'bold', 'feminine', 'vibrant'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-15'
  },
  {
    id: 'emerald_gem_001',
    name: 'Emerald Gem',
    description: 'Rich emerald greens with neutral grays',
    colors: ['#F8F9FA', '#E9ECEF', '#50C878', '#228B22', '#355E3B'],
    primaryColor: '#F8F9FA',
    accentColor: '#50C878',
    style: ['modern', 'traditional', 'transitional'],
    spaceType: ['living_room', 'home_office', 'dining_room'],
    mood: ['sophisticated', 'luxurious', 'calming'],
    category: 'complementary',
    source: 'curated',
    popularity: 90,
    tags: ['emerald', 'green', 'luxury', 'sophisticated', 'gem'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-16'
  },
  {
    id: 'pastel_breeze_001',
    name: 'Pastel Breeze',
    description: 'Light pastels in mint, lavender and cream',
    colors: ['#F0F8FF', '#E6E6FA', '#98FB98', '#FFE4E1', '#F0E68C'],
    primaryColor: '#F0F8FF',
    accentColor: '#98FB98',
    style: ['scandinavian', 'minimalist', 'transitional'],
    spaceType: ['bedroom', 'living_room', 'bathroom'],
    mood: ['calming', 'fresh', 'minimalist'],
    category: 'pastels',
    source: 'curated',
    popularity: 82,
    tags: ['pastel', 'breeze', 'light', 'mint', 'lavender'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-17'
  },
  {
    id: 'azure_mirage_001',
    name: 'Azure Mirage',
    description: 'Cool blues from sky to ocean depths',
    colors: ['#F0F8FF', '#87CEEB', '#4682B4', '#1E90FF', '#000080'],
    primaryColor: '#F0F8FF',
    accentColor: '#1E90FF',
    style: ['modern', 'minimalist', 'transitional'],
    spaceType: ['living_room', 'home_office', 'bedroom'],
    mood: ['calming', 'sophisticated', 'fresh'],
    category: 'monochromatic',
    source: 'nature',
    popularity: 87,
    tags: ['azure', 'blue', 'ocean', 'sky', 'cool'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-18'
  },
  {
    id: 'twilight_blues_001',
    name: 'Twilight Blues',
    description: 'Deep navy and slate blues with silver',
    colors: ['#F8F9FA', '#B0C4DE', '#4682B4', '#2F4F4F', '#191970'],
    primaryColor: '#F8F9FA',
    accentColor: '#4682B4',
    style: ['modern', 'traditional', 'industrial'],
    spaceType: ['living_room', 'home_office', 'bedroom'],
    mood: ['sophisticated', 'dramatic', 'calming'],
    category: 'monochromatic',
    source: 'nature',
    popularity: 89,
    tags: ['twilight', 'navy', 'blue', 'sophisticated', 'evening'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-19'
  },
  {
    id: 'earthy_harmony_001',
    name: 'Earthy Harmony',
    description: 'Warm browns, tans and natural textures',
    colors: ['#F5F5DC', '#DEB887', '#D2691E', '#8B4513', '#654321'],
    primaryColor: '#F5F5DC',
    accentColor: '#D2691E',
    style: ['traditional', 'transitional', 'bohemian'],
    spaceType: ['living_room', 'dining_room', 'home_office'],
    mood: ['cozy', 'earthy', 'sophisticated'],
    category: 'earth-tones',
    source: 'nature',
    popularity: 93,
    tags: ['earthy', 'brown', 'natural', 'harmony', 'warm'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400&q=70',
    dateAdded: '2024-01-20'
  },

  // FARMHOUSE PALETTES
  {
    id: 'farmhouse_classic_001',
    name: 'Farmhouse Classic',
    description: 'Cream whites with weathered wood and sage green accents',
    colors: ['#FEFEFE', '#F5F5DC', '#DEB887', '#9CAF88', '#8B7D6B'],
    primaryColor: '#FEFEFE',
    accentColor: '#9CAF88',
    style: ['farmhouse', 'rustic', 'traditional'],
    spaceType: ['kitchen', 'living_room', 'dining_room', 'bedroom'],
    mood: ['cozy', 'calming', 'earthy'],
    category: 'neutral',
    source: 'curated',
    popularity: 92,
    tags: ['cream', 'sage', 'wood', 'rustic', 'cozy'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21',
    metadata: {
      colorTemperature: 'warm',
      season: 'fall'
    }
  },
  {
    id: 'farmhouse_barn_001',
    name: 'Barn Door Beauty',
    description: 'Rich barn red with crisp whites and natural wood tones',
    colors: ['#FFFFFF', '#F8F8F8', '#CD5C5C', '#8B4513', '#D2691E'],
    primaryColor: '#FFFFFF',
    accentColor: '#CD5C5C',
    style: ['farmhouse', 'rustic', 'country'],
    spaceType: ['kitchen', 'dining_room', 'living_room', 'home_office'],
    mood: ['cozy', 'energizing', 'dramatic'],
    category: 'complementary',
    source: 'curated',
    popularity: 88,
    tags: ['barn red', 'white', 'wood', 'country', 'bold'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21'
  },
  {
    id: 'farmhouse_lavender_001',
    name: 'Lavender Fields',
    description: 'Soft lavender with cream and muted purples',
    colors: ['#FAF0E6', '#E6E6FA', '#DDA0DD', '#9370DB', '#8B7D6B'],
    primaryColor: '#FAF0E6',
    accentColor: '#DDA0DD',
    style: ['farmhouse', 'shabby_chic', 'transitional'],
    spaceType: ['bedroom', 'bathroom', 'living_room'],
    mood: ['calming', 'cozy', 'sophisticated'],
    category: 'analogous',
    source: 'nature',
    popularity: 85,
    tags: ['lavender', 'purple', 'cream', 'floral', 'gentle'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21'
  },
  {
    id: 'farmhouse_sunflower_001',
    name: 'Sunflower Charm',
    description: 'Warm yellows with cream and earthy brown accents',
    colors: ['#FFFACD', '#F0E68C', '#DAA520', '#CD853F', '#8B4513'],
    primaryColor: '#FFFACD',
    accentColor: '#DAA520',
    style: ['farmhouse', 'country', 'traditional'],
    spaceType: ['kitchen', 'dining_room', 'living_room'],
    mood: ['energizing', 'cozy', 'cheerful'],
    category: 'analogous',
    source: 'nature',
    popularity: 90,
    tags: ['sunflower', 'yellow', 'warm', 'cheerful', 'bright'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21'
  },
  {
    id: 'farmhouse_bluebell_001',
    name: 'Bluebell Cottage',
    description: 'Soft powder blue with whites and gray-blue tones',
    colors: ['#F8F8FF', '#E0E6F8', '#B0C4DE', '#6495ED', '#708090'],
    primaryColor: '#F8F8FF',
    accentColor: '#B0C4DE',
    style: ['farmhouse', 'cottage', 'shabby_chic'],
    spaceType: ['bedroom', 'bathroom', 'living_room', 'home_office'],
    mood: ['calming', 'fresh', 'cozy'],
    category: 'monochromatic',
    source: 'nature',
    popularity: 87,
    tags: ['powder blue', 'cottage', 'soft', 'peaceful', 'airy'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21'
  },
  {
    id: 'farmhouse_harvest_001',
    name: 'Harvest Moon',
    description: 'Warm oranges and browns with cream for autumn comfort',
    colors: ['#FFF8DC', '#FFDAB9', '#CD853F', '#D2691E', '#8B4513'],
    primaryColor: '#FFF8DC',
    accentColor: '#D2691E',
    style: ['farmhouse', 'rustic', 'traditional'],
    spaceType: ['kitchen', 'dining_room', 'living_room'],
    mood: ['cozy', 'earthy', 'energizing'],
    category: 'analogous',
    source: 'nature',
    popularity: 89,
    tags: ['harvest', 'orange', 'autumn', 'warm', 'rustic'],
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=70',
    dateAdded: '2024-01-21',
    metadata: {
      colorTemperature: 'warm',
      season: 'fall'
    }
  }
];

/**
 * Color Palette Service
 */
export class ColorPaletteService {
  /**
   * Get palettes filtered by style and space type
   */
  static getFilteredPalettes(filters: {
    style?: string;
    spaceType?: SpaceType;
    mood?: ColorMood;
    category?: PaletteCategory;
    limit?: number;
  }): ColorPalette[] {
    let filteredPalettes = [...COLOR_PALETTES_DATABASE];
    const originalCount = filteredPalettes.length;

    // Filter by style (if provided)
    if (filters.style) {
      filteredPalettes = filteredPalettes.filter(palette => 
        palette.style.includes(filters.style!)
      );
    }

    // Filter by space type (if provided)
    if (filters.spaceType) {
      filteredPalettes = filteredPalettes.filter(palette => 
        palette.spaceType.includes(filters.spaceType!)
      );
    }

    // Filter by mood (if provided)
    if (filters.mood) {
      filteredPalettes = filteredPalettes.filter(palette => 
        palette.mood.includes(filters.mood!)
      );
    }

    // Filter by category (if provided)
    if (filters.category) {
      filteredPalettes = filteredPalettes.filter(palette => 
        palette.category === filters.category
      );
    }

    console.log(`🎨 Palette filtering: ${originalCount} -> ${filteredPalettes.length} palettes`);
    console.log(`🎨 Filters applied:`, filters);

    // If filtering resulted in too few palettes, use more permissive approach
    if (filteredPalettes.length < 8) {
      console.log(`🎨 Too few palettes (${filteredPalettes.length}), using permissive filtering...`);
      
      // Use OR logic instead of AND - show palettes that match ANY criteria
      filteredPalettes = COLOR_PALETTES_DATABASE.filter(palette => {
        let matches = 0;
        
        if (filters.style && palette.style.includes(filters.style)) matches++;
        if (filters.spaceType && palette.spaceType.includes(filters.spaceType)) matches++;
        if (filters.mood && palette.mood.includes(filters.mood)) matches++;
        if (filters.category && palette.category === filters.category) matches++;
        
        // If no filters provided, show all
        if (!filters.style && !filters.spaceType && !filters.mood && !filters.category) {
          return true;
        }
        
        // Show palettes that match at least one criteria
        return matches > 0;
      });

      // If still too few, show popular palettes
      if (filteredPalettes.length < 8) {
        console.log(`🎨 Still too few palettes, showing popular ones...`);
        filteredPalettes = this.getPopularPalettes(filters.limit || 12);
      }
    }

    // Sort by popularity
    filteredPalettes.sort((a, b) => b.popularity - a.popularity);

    // Apply limit
    if (filters.limit) {
      filteredPalettes = filteredPalettes.slice(0, filters.limit);
    }

    console.log(`🎨 Final palette count: ${filteredPalettes.length}`);
    return filteredPalettes;
  }

  /**
   * Get palette by ID
   */
  static getPaletteById(id: string): ColorPalette | undefined {
    return COLOR_PALETTES_DATABASE.find(palette => palette.id === id);
  }

  /**
   * Search palettes by name or tags
   */
  static searchPalettes(query: string): ColorPalette[] {
    const lowerQuery = query.toLowerCase();
    return COLOR_PALETTES_DATABASE.filter(palette =>
      palette.name.toLowerCase().includes(lowerQuery) ||
      palette.description.toLowerCase().includes(lowerQuery) ||
      palette.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    ).sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get palettes by mood
   */
  static getPalettesByMood(mood: ColorMood): ColorPalette[] {
    return COLOR_PALETTES_DATABASE
      .filter(palette => palette.mood.includes(mood))
      .sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Get popular palettes
   */
  static getPopularPalettes(limit: number = 10): ColorPalette[] {
    return [...COLOR_PALETTES_DATABASE]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate color brightness (for text contrast)
   */
  static getColorBrightness(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;
    // Using relative luminance formula
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  }

  /**
   * Determine if text should be light or dark for given background color
   */
  static getContrastColor(backgroundColor: string): string {
    const brightness = this.getColorBrightness(backgroundColor);
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate similar palettes based on color analysis
   */
  static getSimilarPalettes(paletteId: string, limit: number = 6): ColorPalette[] {
    const palette = this.getPaletteById(paletteId);
    if (!palette) return [];

    // Find palettes with similar moods, styles, or color families
    const similar = COLOR_PALETTES_DATABASE.filter(p => {
      if (p.id === paletteId) return false;
      
      // Check for mood overlap
      const hasMoodOverlap = p.mood.some(mood => palette.mood.includes(mood));
      
      // Check for style overlap
      const hasStyleOverlap = p.style.some(style => palette.style.includes(style));
      
      // Check for category match
      const hasCategoryMatch = p.category === palette.category;
      
      return hasMoodOverlap || hasStyleOverlap || hasCategoryMatch;
    });

    return similar
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
}

/**
 * Color Extraction Service for user-uploaded images
 */
export class ColorExtractionService {
  /**
   * Extract dominant colors from an image URL
   * This would typically use a color extraction library or API
   */
  static async extractColorsFromImage(imageUri: string): Promise<{
    dominantColors: string[];
    palette: Omit<ColorPalette, 'id' | 'dateAdded'>;
  }> {
    // TODO: Implement actual color extraction
    // For now, return mock colors
    console.log('🎨 Extracting colors from:', imageUri);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock extracted colors (in production, use libraries like ColorThief or Vibrant.js)
    const mockDominantColors = [
      '#F5F5F5', // Light gray
      '#8B4513', // Saddle brown
      '#228B22', // Forest green  
      '#4A90E2', // Blue
      '#2D2B28'  // Dark gray
    ];
    
    const palette: Omit<ColorPalette, 'id' | 'dateAdded'> = {
      name: 'Extracted Palette',
      description: 'Colors extracted from your uploaded image',
      colors: mockDominantColors,
      primaryColor: mockDominantColors[0],
      accentColor: mockDominantColors[1],
      style: ['modern', 'transitional'], // Default to versatile styles
      spaceType: ['living_room', 'bedroom'], // Default spaces
      mood: ['sophisticated', 'calming'],
      category: 'extracted',
      source: 'extracted',
      popularity: 1, // New extractions start with low popularity
      tags: ['custom', 'extracted', 'personal'],
      imageUrl: imageUri,
      metadata: {
        colorTemperature: 'neutral'
      }
    };
    
    return {
      dominantColors: mockDominantColors,
      palette
    };
  }

  /**
   * Create palette from user-selected colors
   */
  static createCustomPalette(
    colors: string[],
    name: string = 'Custom Palette',
    description: string = 'User-created color palette'
  ): Omit<ColorPalette, 'id' | 'dateAdded'> {
    return {
      name,
      description,
      colors,
      primaryColor: colors[0] || '#FFFFFF',
      accentColor: colors[1] || colors[0] || '#000000',
      style: ['modern', 'transitional'], // Default versatile styles
      spaceType: ['living_room', 'bedroom'],
      mood: ['sophisticated'],
      category: 'neutral',
      source: 'user-upload',
      popularity: 1,
      tags: ['custom', 'user-created', 'personal'],
      metadata: {
        colorTemperature: 'neutral'
      }
    };
  }
}

// Type exports
export type { ColorPalette, ColorMood, PaletteCategory, PaletteSource };