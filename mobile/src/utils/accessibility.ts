import { AccessibilityInfo, Platform } from 'react-native';

// WCAG 2.1 AA Compliance Utilities

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 
    | 'button'
    | 'link'
    | 'search'
    | 'image'
    | 'imagebutton'
    | 'text'
    | 'header'
    | 'summary'
    | 'tab'
    | 'tablist'
    | 'grid'
    | 'cell'
    | 'list'
    | 'listitem';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

// Create accessible props for style selection items
export const createStyleItemAccessibility = (
  styleName: string,
  isSelected: boolean,
  index: number,
  totalItems: number
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `${styleName} style reference`,
  accessibilityHint: `${isSelected ? 'Currently selected. ' : ''}Tap to ${isSelected ? 'deselect' : 'select'} this style. ${index + 1} of ${totalItems} styles.`,
  accessibilityRole: 'button',
  accessibilityState: {
    selected: isSelected,
  },
});

// Create accessible props for ambiance selection items
export const createAmbianceItemAccessibility = (
  ambianceName: string,
  description: string,
  isSelected: boolean,
  index: number,
  totalItems: number
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `${ambianceName} ambiance option`,
  accessibilityHint: `${description}. ${isSelected ? 'Currently selected. ' : ''}Tap to ${isSelected ? 'deselect' : 'select'} this ambiance. ${index + 1} of ${totalItems} options.`,
  accessibilityRole: 'button',
  accessibilityState: {
    selected: isSelected,
  },
});

// Create accessible props for navigation elements
export const createNavigationAccessibility = (
  action: string,
  destination?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: action,
  accessibilityHint: destination ? `Navigate to ${destination}` : undefined,
  accessibilityRole: 'button',
});

// Create accessible props for progress indicators
export const createProgressAccessibility = (
  currentStep: number,
  totalSteps: number,
  stepName?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `Progress indicator`,
  accessibilityValue: {
    now: currentStep,
    min: 1,
    max: totalSteps,
    text: stepName ? `Step ${currentStep} of ${totalSteps}: ${stepName}` : `Step ${currentStep} of ${totalSteps}`,
  },
  accessibilityRole: 'progressbar' as any, // Note: React Native doesn't have this role, but screen readers understand it
});

// Create accessible props for selection counters
export const createSelectionCounterAccessibility = (
  selectedCount: number,
  maxSelections: number,
  itemType: string = 'items'
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `Selection counter`,
  accessibilityValue: {
    now: selectedCount,
    min: 0,
    max: maxSelections,
    text: `${selectedCount} of ${maxSelections} ${itemType} selected`,
  },
});

// Color contrast utilities (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
export const calculateColorContrast = (
  foreground: string,
  background: string
): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }): number => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgLuminance = getLuminance(hexToRgb(foreground));
  const bgLuminance = getLuminance(hexToRgb(background));
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

// Check if color combination meets WCAG AA standards
export const meetsWCAGAA = (
  foreground: string,
  background: string,
  isLargeText = false
): boolean => {
  const contrast = calculateColorContrast(foreground, background);
  return contrast >= (isLargeText ? 3.0 : 4.5);
};

// Screen reader announcements
export const announceForScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else if (Platform.OS === 'android') {
    // Android uses different methods
    AccessibilityInfo.announceForAccessibilityWithOptions(message, {
      queue: priority === 'assertive' ? false : true,
    });
  }
};

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn('Failed to check screen reader status:', error);
    return false;
  }
};

// Focus management for navigation
export const setAccessibilityFocus = (ref: any): void => {
  if (ref?.current && Platform.OS === 'ios') {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
};

// Semantic headings for screen readers
export const createHeadingAccessibility = (
  level: 1 | 2 | 3 | 4 | 5 | 6,
  text: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: text,
  accessibilityRole: 'header',
  // iOS specific heading level
  ...(Platform.OS === 'ios' && {
    accessibilityTraits: ['header' as any],
    accessibilityValue: { text: `heading level ${level}` },
  }),
});

// Landmark regions for better navigation
export const createLandmarkAccessibility = (
  type: 'main' | 'navigation' | 'search' | 'banner' | 'complementary' | 'contentinfo',
  label?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: type === 'navigation' ? 'tab' : 'text',
  // Custom accessibility traits for landmarks
  ...(Platform.OS === 'ios' && {
    accessibilityTraits: [type as any],
  }),
});

// Group related elements for better screen reader navigation
export const createGroupAccessibility = (
  groupLabel: string,
  itemCount?: number
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: groupLabel + (itemCount ? `, ${itemCount} items` : ''),
  // Group elements together
  importantForAccessibility: 'yes',
});

// Export common accessibility constants
export const ACCESSIBILITY_CONSTANTS = {
  MIN_TOUCH_TARGET_SIZE: 44, // iOS HIG and Material Design minimum
  ANIMATION_DURATION_SHORT: 200,
  ANIMATION_DURATION_MEDIUM: 300,
  ANIMATION_DURATION_LONG: 500,
  FOCUS_DELAY: 100, // Delay before setting focus to allow layout to complete
} as const;