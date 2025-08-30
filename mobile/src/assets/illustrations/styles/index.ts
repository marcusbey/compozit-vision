/**
 * Style Illustrations Export
 */

// Export style illustration components or data
export const styleIllustrations = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines and minimalist aesthetic',
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#B0B0B0'],
    features: ['Minimalist', 'Clean lines', 'Neutral colors', 'Open spaces'],
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic and timeless design elements',
    colorPalette: ['#8B4513', '#D2691E', '#F4A460', '#FFF8DC'],
    features: ['Rich textures', 'Warm colors', 'Classic patterns', 'Elegant details'],
  },
  scandinavian: {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light, functional, and cozy Nordic style',
    colorPalette: ['#FFFFFF', '#F0F0F0', '#E8E2D8', '#C9A98C'],
    features: ['Light woods', 'Functional design', 'Hygge elements', 'Natural materials'],
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials and urban aesthetic',
    colorPalette: ['#2F2F2F', '#696969', '#A0A0A0', '#CD853F'],
    features: ['Exposed materials', 'Metal accents', 'Raw textures', 'Urban elements'],
  },
  bohemian: {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic and free-spirited design',
    colorPalette: ['#800080', '#FF6347', '#FFD700', '#228B22'],
    features: ['Rich patterns', 'Vibrant colors', 'Mixed textures', 'Artistic elements'],
  },
};

export type StyleType = keyof typeof styleIllustrations;

export default styleIllustrations;