// Furniture-related types for mobile app
export interface FurnitureStyle {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  styleCategories: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  compatibility: {
    roomTypes: RoomType[];
    designStyles: string[];
    colorPalettes: string[];
  };
  visualImpactScore: number; // 1-10 for priority ordering
  popularity: number; // For sorting
}

export interface FurniturePriority {
  category: FurnitureCategory;
  priority: number; // 1-10, higher = more important
  reason: string; // Why this category is prioritized
  suggestedItems: string[]; // Item IDs
}

export interface FurnitureCategory {
  id: string;
  name: string;
  displayName: string;
  description: string;
  iconName: string; // For vector icons
  visualImpactScore: number;
  roomCompatibility: RoomType[];
}

export interface CustomPrompt {
  id: string;
  text: string;
  category?: string;
  isUserGenerated: boolean;
  context?: PromptContext;
  suggestions?: string[];
  tags?: string[];
}

export interface PromptContext {
  roomType?: RoomType;
  detectedObjects?: string[];
  spaceCharacteristics?: {
    size: 'small' | 'medium' | 'large';
    lighting: 'bright' | 'moderate' | 'dim';
    style?: string;
  };
  userPreferences?: {
    styles: string[];
    colors: string[];
    budget?: {
      min: number;
      max: number;
    };
  };
}

export interface FurnitureSelection {
  categoryId: string;
  selectedStyles: FurnitureStyle[];
  skippedStyles: FurnitureStyle[];
  customPrompt?: CustomPrompt;
  timestamp: number;
}

export interface CarouselState {
  currentCategoryIndex: number;
  currentStyleIndex: number;
  totalCategories: number;
  isTransitioning: boolean;
  gestureEnabled: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
  isValidSwipe: boolean;
}

// Room types enum for furniture context
export enum FurnitureRoomType {
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  DINING_ROOM = 'dining_room',
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  OFFICE = 'office',
  OUTDOOR = 'outdoor',
  ENTRYWAY = 'entryway',
  KIDS_ROOM = 'kids_room',
}

// Carousel actions
export type CarouselAction = 
  | 'SWIPE_LEFT'   // Skip/dislike
  | 'SWIPE_RIGHT'  // Like/select
  | 'SWIPE_UP'     // More details
  | 'SWIPE_DOWN'   // Quick reject
  | 'TAP_HEART'    // Like button
  | 'TAP_X'        // Skip button
  | 'NEXT_CATEGORY'
  | 'PREV_CATEGORY';

// Animation configurations
export interface AnimationConfig {
  duration: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  springConfig?: {
    tension: number;
    friction: number;
  };
}

// Component props interfaces
export interface FurnitureCarouselProps {
  categories: FurnitureCategory[];
  onStyleSelect: (categoryId: string, style: FurnitureStyle) => void;
  onStyleSkip: (categoryId: string, style: FurnitureStyle) => void;
  onCategoryComplete: (categoryId: string, selections: FurnitureSelection) => void;
  onAllCategoriesComplete: (allSelections: FurnitureSelection[]) => void;
  initialCategoryIndex?: number;
  animationDuration?: number;
  gesturesEnabled?: boolean;
}

export interface CustomPromptProps {
  initialText?: string;
  placeholder?: string;
  suggestions?: string[];
  context?: PromptContext;
  maxLength?: number;
  onTextChange: (text: string) => void;
  onPromptSubmit: (prompt: CustomPrompt) => void;
  onSuggestionSelect: (suggestion: string) => void;
  isExpanded?: boolean;
  onExpandToggle?: (expanded: boolean) => void;
}

export interface StyleCardProps {
  style: FurnitureStyle;
  isActive: boolean;
  onLike: () => void;
  onSkip: () => void;
  onTap?: () => void;
  gestureHandlers?: {
    panGesture: any; // PanGestureHandler ref
    onSwipeDetected: (gesture: SwipeGesture) => void;
  };
}

export interface ProgressIndicatorProps {
  currentCategory: number;
  totalCategories: number;
  categoryName: string;
  onCategoryTap?: (index: number) => void;
  showLabels?: boolean;
}