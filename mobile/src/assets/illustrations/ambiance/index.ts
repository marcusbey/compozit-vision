/**
 * Ambiance Illustrations Export
 */

// Export ambiance illustration components or data
export const ambianceIllustrations = {
  cozy: {
    id: 'cozy',
    name: 'Cozy',
    description: 'Warm and inviting atmosphere',
    mood: 'Comfortable, intimate, relaxing',
    elements: ['Soft lighting', 'Warm textures', 'Comfortable seating', 'Personal touches'],
  },
  energetic: {
    id: 'energetic',
    name: 'Energetic',
    description: 'Vibrant and stimulating environment',
    mood: 'Dynamic, inspiring, active',
    elements: ['Bright colors', 'Bold patterns', 'Natural light', 'Active spaces'],
  },
  serene: {
    id: 'serene',
    name: 'Serene',
    description: 'Peaceful and calming space',
    mood: 'Tranquil, balanced, harmonious',
    elements: ['Neutral tones', 'Natural materials', 'Clean lines', 'Minimal decor'],
  },
  luxurious: {
    id: 'luxurious',
    name: 'Luxurious',
    description: 'Elegant and sophisticated atmosphere',
    mood: 'Refined, opulent, prestigious',
    elements: ['Rich materials', 'Statement pieces', 'Quality finishes', 'Attention to detail'],
  },
  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and creative environment',
    mood: 'Cheerful, creative, spontaneous',
    elements: ['Bold colors', 'Unique shapes', 'Artistic elements', 'Interactive features'],
  },
};

export type AmbianceType = keyof typeof ambianceIllustrations;

export default ambianceIllustrations;