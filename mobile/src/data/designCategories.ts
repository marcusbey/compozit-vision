// Design categories based on COMPREHENSIVE-DESIGN-CATEGORIES.md

export interface DesignStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  compatibleStyles?: string[];
  spaceTypes?: ('interior' | 'exterior')[];
  culturalInfluences?: string[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  description: string;
  suitableStyles: string[];
  mood: string[];
}

export interface BudgetRange {
  id: string;
  label: string;
  description: string;
  value: { min: number; max: number };
  suitableFor: string[];
}

export interface Material {
  id: string;
  name: string;
  category: 'flooring' | 'wall' | 'ceiling' | 'accent' | 'furniture';
  durability: 'low' | 'medium' | 'high';
  cost: 'budget' | 'mid' | 'luxury';
  maintenance: 'low' | 'medium' | 'high';
  suitableSpaces: string[];
  climate: string[];
}

export interface FurnitureStyle {
  id: string;
  name: string;
  category: 'seating' | 'tables' | 'storage' | 'lighting' | 'decor';
  styles: string[];
  roomTypes: string[];
  description: string;
}

// Design Styles Data
export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    icon: '🏢',
    description: 'Clean lines, minimalist approach, functional design',
    tags: ['clean', 'functional', 'minimal'],
    compatibleStyles: ['minimalist', 'scandinavian', 'contemporary'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['scandinavian', 'german', 'japanese']
  },
  {
    id: 'traditional',
    name: 'Traditional',
    icon: '🏛️',
    description: 'Classic elements, warm colors, ornate details',
    tags: ['classic', 'elegant', 'timeless'],
    compatibleStyles: ['transitional', 'english_country', 'american_colonial'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['french', 'english', 'american']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '⚪',
    description: 'Less is more philosophy, ultra-clean, highly functional',
    tags: ['simple', 'clean', 'functional'],
    compatibleStyles: ['modern', 'scandinavian', 'zen'],
    spaceTypes: ['interior'],
    culturalInfluences: ['japanese', 'scandinavian']
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    icon: '🌲',
    description: 'Light woods, hygge concept, Nordic simplicity',
    tags: ['cozy', 'light', 'natural'],
    compatibleStyles: ['modern', 'minimalist', 'contemporary'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['nordic', 'danish', 'swedish']
  },
  {
    id: 'industrial',
    name: 'Industrial',
    icon: '🏭',
    description: 'Exposed elements, raw materials, warehouse aesthetic',
    tags: ['raw', 'urban', 'edgy'],
    compatibleStyles: ['modern', 'urban_loft', 'contemporary'],
    spaceTypes: ['interior'],
    culturalInfluences: ['american', 'german']
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    icon: '🌺',
    description: 'Free-spirited, layered textiles, global influences',
    tags: ['eclectic', 'colorful', 'artistic'],
    compatibleStyles: ['eclectic', 'maximalist', 'global'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['moroccan', 'indian', 'global']
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    icon: '🏖️',
    description: 'Coastal charm, warm colors, natural materials',
    tags: ['warm', 'coastal', 'relaxed'],
    compatibleStyles: ['traditional', 'rustic', 'coastal'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['spanish', 'italian', 'greek']
  },
  {
    id: 'rustic',
    name: 'Rustic',
    icon: '🪵',
    description: 'Natural materials, cabin-like feel, cozy atmosphere',
    tags: ['natural', 'cozy', 'warm'],
    compatibleStyles: ['farmhouse', 'lodge', 'traditional'],
    spaceTypes: ['interior', 'exterior'],
    culturalInfluences: ['american', 'mountain']
  }
];

// Color Palettes Data
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'warm_neutrals',
    name: 'Warm Neutrals',
    colors: ['#F5F5DC', '#D2B48C', '#CD853F', '#A0522D'],
    description: 'Cozy and inviting earth tones',
    suitableStyles: ['traditional', 'rustic', 'mediterranean'],
    mood: ['cozy', 'welcoming', 'comfortable']
  },
  {
    id: 'cool_blues',
    name: 'Cool Blues',
    colors: ['#E6F3FF', '#87CEEB', '#4682B4', '#2F4F4F'],
    description: 'Calming and serene blue palette',
    suitableStyles: ['scandinavian', 'coastal', 'modern'],
    mood: ['calm', 'peaceful', 'fresh']
  },
  {
    id: 'earth_tones',
    name: 'Earth Tones',
    colors: ['#8B4513', '#D2691E', '#CD853F', '#DEB887'],
    description: 'Natural and grounding colors',
    suitableStyles: ['rustic', 'bohemian', 'mediterranean'],
    mood: ['grounding', 'natural', 'warm']
  },
  {
    id: 'modern_grays',
    name: 'Modern Grays',
    colors: ['#F8F8FF', '#C0C0C0', '#808080', '#2F2F2F'],
    description: 'Sophisticated monochrome palette',
    suitableStyles: ['modern', 'minimalist', 'industrial'],
    mood: ['sophisticated', 'clean', 'professional']
  },
  {
    id: 'vibrant_jewels',
    name: 'Vibrant Jewels',
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5'],
    description: 'Bold and energetic color scheme',
    suitableStyles: ['bohemian', 'eclectic', 'maximalist'],
    mood: ['energetic', 'bold', 'creative']
  },
  {
    id: 'soft_pastels',
    name: 'Soft Pastels',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'],
    description: 'Gentle and soothing pastel tones',
    suitableStyles: ['scandinavian', 'minimalist', 'romantic'],
    mood: ['gentle', 'soothing', 'dreamy']
  }
];

// Budget Ranges Data
export const BUDGET_RANGES: BudgetRange[] = [
  {
    id: 'budget',
    label: '$2K - $8K',
    description: 'Budget-friendly refresh with DIY elements',
    value: { min: 2000, max: 8000 },
    suitableFor: ['refresh', 'diy', 'small_spaces']
  },
  {
    id: 'moderate',
    label: '$8K - $25K',
    description: 'Quality upgrades with some custom elements',
    value: { min: 8000, max: 25000 },
    suitableFor: ['renovation', 'medium_spaces', 'quality_materials']
  },
  {
    id: 'premium',
    label: '$25K - $60K',
    description: 'High-end materials and professional design',
    value: { min: 25000, max: 60000 },
    suitableFor: ['major_renovation', 'custom_work', 'large_spaces']
  },
  {
    id: 'luxury',
    label: '$60K+',
    description: 'Luxury finishes and bespoke design',
    value: { min: 60000, max: 200000 },
    suitableFor: ['luxury', 'bespoke', 'complete_transformation']
  }
];

// Materials Data
export const MATERIALS: Material[] = [
  {
    id: 'hardwood',
    name: 'Hardwood Flooring',
    category: 'flooring',
    durability: 'high',
    cost: 'mid',
    maintenance: 'medium',
    suitableSpaces: ['living_room', 'bedroom', 'dining_room'],
    climate: ['temperate', 'dry']
  },
  {
    id: 'marble',
    name: 'Marble',
    category: 'wall',
    durability: 'high',
    cost: 'luxury',
    maintenance: 'high',
    suitableSpaces: ['bathroom', 'kitchen', 'foyer'],
    climate: ['all']
  },
  {
    id: 'ceramic_tile',
    name: 'Ceramic Tile',
    category: 'flooring',
    durability: 'high',
    cost: 'budget',
    maintenance: 'low',
    suitableSpaces: ['bathroom', 'kitchen', 'utility'],
    climate: ['all']
  },
  {
    id: 'granite',
    name: 'Granite',
    category: 'accent',
    durability: 'high',
    cost: 'luxury',
    maintenance: 'low',
    suitableSpaces: ['kitchen', 'bathroom'],
    climate: ['all']
  },
  {
    id: 'vinyl_plank',
    name: 'Luxury Vinyl Plank',
    category: 'flooring',
    durability: 'medium',
    cost: 'budget',
    maintenance: 'low',
    suitableSpaces: ['living_room', 'bedroom', 'kitchen'],
    climate: ['all']
  }
];

// Furniture Styles Data
export const FURNITURE_STYLES: FurnitureStyle[] = [
  {
    id: 'mid_century_sofa',
    name: 'Mid-Century Modern Sofa',
    category: 'seating',
    styles: ['modern', 'mid_century', 'scandinavian'],
    roomTypes: ['living_room', 'family_room'],
    description: 'Clean lines with tapered legs and bold upholstery'
  },
  {
    id: 'farmhouse_table',
    name: 'Farmhouse Dining Table',
    category: 'tables',
    styles: ['rustic', 'farmhouse', 'traditional'],
    roomTypes: ['dining_room', 'kitchen'],
    description: 'Solid wood construction with rustic charm'
  },
  {
    id: 'industrial_shelving',
    name: 'Industrial Shelving Unit',
    category: 'storage',
    styles: ['industrial', 'modern', 'urban'],
    roomTypes: ['living_room', 'office', 'bedroom'],
    description: 'Metal frame with reclaimed wood shelves'
  },
  {
    id: 'scandinavian_pendant',
    name: 'Scandinavian Pendant Light',
    category: 'lighting',
    styles: ['scandinavian', 'modern', 'minimalist'],
    roomTypes: ['kitchen', 'dining_room', 'bedroom'],
    description: 'Clean geometric design in natural materials'
  }
];

// Helper functions to filter data based on context
export function getFilteredStyles(context: {
  spaceType?: 'interior' | 'exterior';
  roomType?: string;
  currentStyle?: string;
}): DesignStyle[] {
  return DESIGN_STYLES.filter(style => {
    if (context.spaceType && style.spaceTypes && !style.spaceTypes.includes(context.spaceType)) {
      return false;
    }
    return true;
  });
}

export function getFilteredColorPalettes(context: {
  currentStyle?: string;
  mood?: string;
}): ColorPalette[] {
  return COLOR_PALETTES.filter(palette => {
    if (context.currentStyle && !palette.suitableStyles.includes(context.currentStyle)) {
      return false;
    }
    return true;
  });
}

export function getFilteredBudgetRanges(context: {
  roomType?: string;
  scale?: string;
}): BudgetRange[] {
  // Could filter based on room type, but for now return all
  return BUDGET_RANGES;
}

export function getFilteredMaterials(context: {
  roomType?: string;
  climate?: string;
  budget?: string;
}): Material[] {
  return MATERIALS.filter(material => {
    if (context.roomType && !material.suitableSpaces.includes(context.roomType)) {
      return false;
    }
    if (context.climate && !material.climate.includes('all') && !material.climate.includes(context.climate)) {
      return false;
    }
    return true;
  });
}

export function getFilteredFurniture(context: {
  roomType?: string;
  currentStyle?: string;
}): FurnitureStyle[] {
  return FURNITURE_STYLES.filter(furniture => {
    if (context.roomType && !furniture.roomTypes.includes(context.roomType)) {
      return false;
    }
    if (context.currentStyle && !furniture.styles.includes(context.currentStyle)) {
      return false;
    }
    return true;
  });
}