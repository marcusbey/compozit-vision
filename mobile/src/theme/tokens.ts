// Design Tokens - Unified Design System (Centralized)
// Single source of truth for all design tokens across the application

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const tokens = {
  // Color system
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: '#C9A98C',
      light: '#E8C097',
      dark: '#B9906F',
    },

    // Background colors
    background: {
      primary: '#FDFBF7',
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
    },

    // Text colors
    text: {
      primary: '#1C1C1C',
      secondary: '#7A7A7A',
      tertiary: '#B0B0B0',
      muted: '#8B7F73',
      inverse: '#FDFBF7',
      disabled: '#D1D1D1',
    },

    // Border colors
    border: {
      light: '#E8E2D8',
      medium: '#D0D0D0',
      dark: '#A0A0A0',
    },

    // Status colors
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },

    // Overlay colors
    overlay: {
      light: 'rgba(28, 28, 28, 0.45)',
      medium: 'rgba(28, 28, 28, 0.65)',
      heavy: 'rgba(28, 28, 28, 0.85)',
    }
  },

  // Typography system
  typography: {
    display: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '500' as const,
    },
    // Legacy fontSize/fontWeight map for older screens
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    heading: {
      h1: {
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '600' as const,
      },
      h2: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600' as const,
      },
      h3: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600' as const,
      },
      h4: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '500' as const,
      },
    },
    body: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
  },

  // Spacing system (4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    // String alias keys used in some screens
    '2xl': 48,
    '3xl': 64,
    '4xl': 80,
    '5xl': 96,
    '6xl': 112,
  },

  // Border radius system
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    pill: 999,
  },

  // Shadow system
  shadows: {
    elevation1: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    elevation2: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    elevation3: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    elevation4: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 12,
    },
  },

  // Animation timing
  animation: {
    fast: 150,
    medium: 300,
    slow: 500,
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    max: 2147483647,
  },

  // Layout constants
  layout: {
    headerHeight: 56,
    tabBarHeight: 80,
    bottomSafeArea: 34,
    sidebarWidth: 280,
  },

  // Legacy shims for backward compatibility during refactor
  // Old tokens.color.* → mapped to new tokens.colors.*
  color: {
    bgApp: '#FDFBF7',
    surface: '#FFFFFF',
    textPrimary: '#1C1C1C',
    textSecondary: '#7A7A7A',
    textMuted: '#B0B0B0',
    textInverse: '#FDFBF7',
    brand: '#C9A98C',
    brandHover: '#E8C097',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    borderSoft: '#E8E2D8',
    border: '#D0D0D0',
    // Semi-transparent overlay used in old UI
    scrim: 'rgba(28, 28, 28, 0.65)',
    // No separate accent in new system; use brand light
    accent: '#E8C097',
  },

  // Old tokens.type.* → mapped to new tokens.typography.*
  type: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  },

  // Old tokens.radius → new borderRadius
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    pill: 999,
  },

  // Old tokens.shadow.e1..e4 → new shadows.elevation*
  shadow: {
    e1: {
      shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
    },
    e2: {
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    e3: {
      shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
    },
    e4: {
      shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12,
    },
  },

  // Old tokens.screen.width/height helper
  screen: {
    width,
    height,
  },
} as const;

// Legacy aliases for backward compatibility
export const designTokens = tokens;

// Type definitions
export type Tokens = typeof tokens;
export type ColorTokens = typeof tokens.colors;
export type TypographyTokens = typeof tokens.typography;
export type SpacingTokens = typeof tokens.spacing;

// Helper functions
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = tokens.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '#000000';
};

export const getSpacing = (multiplier: number): number => {
  return tokens.spacing.md * multiplier;
};

export default tokens;
