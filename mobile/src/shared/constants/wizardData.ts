// Panel modes
export type PanelMode = 
  | 'initial' 
  | 'prompt' 
  | 'category' 
  | 'style' 
  | 'reference' 
  | 'colorPalette'
  | 'budget'
  | 'furniture'
  | 'location'
  | 'materials'
  | 'texture'
  | 'processing' 
  | 'auth';

// Categories and styles data
export const CATEGORIES = [
  { id: 'interior', title: 'Interior Design', icon: 'home' },
  { id: 'garden', title: 'Garden & Outdoor', icon: 'leaf' },
  { id: 'surface', title: 'Surface Design', icon: 'color-palette' },
  { id: 'renovation', title: 'Renovation', icon: 'construct' },
];

export const STYLES = [
  { id: 'modern', title: 'Modern', description: 'Clean lines, minimal design' },
  { id: 'traditional', title: 'Traditional', description: 'Classic, timeless elegance' },
  { id: 'industrial', title: 'Industrial', description: 'Raw materials, urban feel' },
  { id: 'bohemian', title: 'Bohemian', description: 'Eclectic, artistic vibes' },
  { id: 'scandinavian', title: 'Scandinavian', description: 'Light, functional, cozy' },
  { id: 'minimalist', title: 'Minimalist', description: 'Less is more philosophy' },
];