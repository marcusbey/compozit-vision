// Types for AI Context Analysis and Dynamic Icons System

export interface ImageAnalysisResult {
  // Primary Classifications
  spaceType: 'interior' | 'exterior' | 'mixed';
  
  // Detailed Room/Area Classification
  roomType?: {
    category: string; // 'living_room', 'kitchen', 'garden', etc.
    confidence: number; // 0-1 confidence score
    subType?: string; // 'master_bedroom', 'powder_room', etc.
  };
  
  // Style Detection
  currentStyle: {
    primary: string; // 'modern', 'traditional', etc.
    secondary?: string[]; // Additional style elements
    confidence: number;
  };
  
  // Environmental Context
  environment: {
    lighting: 'natural' | 'artificial' | 'mixed' | 'dark';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    weather?: 'sunny' | 'cloudy' | 'rainy'; // for exteriors
  };
  
  // Existing Elements Detection
  detectedElements: {
    furniture: string[]; // ['sofa', 'dining_table', 'bed']
    fixtures: string[]; // ['chandelier', 'fireplace', 'built_in_shelves']
    materials: string[]; // ['wood', 'marble', 'carpet']
    colors: ColorPalette; // Dominant colors in the image
  };
  
  // Spatial Analysis
  spatial: {
    perspective: 'wide_angle' | 'close_up' | 'detail';
    isEmpty: boolean; // Empty room detection
    scale: 'small' | 'medium' | 'large';
  };
  
  // Quality Metrics
  quality: {
    resolution: 'low' | 'medium' | 'high';
    clarity: number; // 0-1
    processable: boolean;
  };
}

export interface ColorPalette {
  primary: string;
  secondary: string[];
  accent?: string;
  neutral: string[];
}

export interface ProcessedContext extends ImageAnalysisResult {
  userPrompt?: string;
  confidence: number;
  timestamp: Date;
  enhancements?: NLPEnhancement;
}

export interface NLPEnhancement {
  intent: string[];
  stylePreferences: string[];
  functionalRequirements: string[];
  conflicts?: string[];
}

// Icon System Types
export interface IconConfig {
  id: string;
  label: string;
  icon: string; // Icon name or emoji
  category: IconCategory;
  
  // Visibility rules
  visibilityRules: {
    requiredSpaceTypes?: ('interior' | 'exterior')[];
    requiredRoomTypes?: string[];
    excludedRoomTypes?: string[];
    requiredStyles?: string[];
    excludedStyles?: string[];
    minConfidence?: number; // 0-1
  };
  
  // Panel configuration
  panelConfig: {
    type: 'compact' | 'expanded' | 'fullscreen';
    component: string; // Component name to render
    defaultExpanded?: boolean;
  };
  
  // Contextual data
  contextualOptions: {
    filterBy: string[]; // Fields to filter options by
    dataSource: string; // Where to get options from
    maxOptions?: number;
  };
}

export type IconCategory = 'style' | 'function' | 'budget' | 'location' | 'material' | 'furniture' | 'color' | 'cultural';

export interface RelevantIcon extends IconConfig {
  score: number;
  badge?: string;
  contextualData?: any;
}

export interface ScoredIcon {
  icon: IconConfig;
  score: number;
}

export interface FilteredOption {
  id: string;
  label: string;
  value: any;
  relevanceScore: number;
  metadata?: {
    image?: string;
    description?: string;
    tags?: string[];
  };
}

export interface UserPreferences {
  favoriteStyles: string[];
  budgetRange?: { min: number; max: number };
  excludedStyles?: string[];
  previousSelections: string[];
}