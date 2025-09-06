// Design Tokens - Centralized design system constants
// Used across the application for consistent theming and styling

export const designTokens = {
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
  
  // Typography scale
  typography: {
    display: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
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
  },
  
  // Spacing scale (based on 4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius scale
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
  
  // Shadow definitions
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
  
  // Animation durations
  animation: {
    fast: 150,
    medium: 300,
    slow: 500,
  },
  
  // Z-index scale
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
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Common component variants
  variants: {
    button: {
      sizes: {
        small: {
          height: 32,
          paddingHorizontal: 12,
          fontSize: 14,
        },
        medium: {
          height: 40,
          paddingHorizontal: 16,
          fontSize: 16,
        },
        large: {
          height: 48,
          paddingHorizontal: 20,
          fontSize: 18,
        },
      },
    },
    input: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
    },
  },
  
  // Layout constants
  layout: {
    headerHeight: 56,
    tabBarHeight: 80,
    bottomSafeArea: 34, // For devices with home indicator
    sidebarWidth: 280,
  },
} as const;

// Type exports for TypeScript support
export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof designTokens.colors;
export type TypographyTokens = typeof designTokens.typography;
export type SpacingTokens = typeof designTokens.spacing;

// Helper functions for common operations
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || '#000000';
};

export const getSpacing = (multiplier: number): number => {
  return designTokens.spacing.md * multiplier;
};

// Common combinations for ease of use
export const commonStyles = {
  card: {
    backgroundColor: designTokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.md,
    ...designTokens.shadows.elevation2,
  },
  
  button: {
    primary: {
      backgroundColor: designTokens.colors.primary.DEFAULT,
      borderRadius: designTokens.borderRadius.md,
      height: designTokens.variants.button.sizes.medium.height,
      paddingHorizontal: designTokens.variants.button.sizes.medium.paddingHorizontal,
    },
    
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: designTokens.colors.border.medium,
      borderRadius: designTokens.borderRadius.md,
      height: designTokens.variants.button.sizes.medium.height,
      paddingHorizontal: designTokens.variants.button.sizes.medium.paddingHorizontal,
    },
  },
  
  input: {
    backgroundColor: designTokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: designTokens.colors.border.light,
    borderRadius: designTokens.borderRadius.md,
    height: designTokens.variants.input.height,
    paddingHorizontal: designTokens.variants.input.paddingHorizontal,
    fontSize: designTokens.variants.input.fontSize,
    color: designTokens.colors.text.primary,
  },
  
  text: {
    heading: {
      fontSize: designTokens.typography.heading.h3.fontSize,
      fontWeight: designTokens.typography.heading.h3.fontWeight,
      color: designTokens.colors.text.primary,
      lineHeight: designTokens.typography.heading.h3.lineHeight,
    },
    
    body: {
      fontSize: designTokens.typography.body.fontSize,
      fontWeight: designTokens.typography.body.fontWeight,
      color: designTokens.colors.text.primary,
      lineHeight: designTokens.typography.body.lineHeight,
    },
    
    caption: {
      fontSize: designTokens.typography.caption.fontSize,
      fontWeight: designTokens.typography.caption.fontWeight,
      color: designTokens.colors.text.secondary,
      lineHeight: designTokens.typography.caption.lineHeight,
    },
  },
};

export default designTokens;