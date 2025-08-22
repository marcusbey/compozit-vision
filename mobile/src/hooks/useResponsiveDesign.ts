import { useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ResponsiveDesignConfig {
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  gridColumns: number;
  itemSpacing: number;
  containerPadding: number;
  headerHeight: number;
  bottomSafeArea: number;
}

export const useResponsiveDesign = (): ResponsiveDesignConfig => {
  return useMemo(() => {
    const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
    const isSmallDevice = SCREEN_WIDTH < 375;
    const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
    const isLargeDevice = SCREEN_WIDTH >= 768;
    const isTablet = SCREEN_WIDTH >= 768;

    // Grid configuration based on screen size
    let gridColumns = 2;
    let itemSpacing = 16;
    let containerPadding = 20;

    if (isTablet) {
      gridColumns = isLandscape ? 4 : 3;
      itemSpacing = 20;
      containerPadding = 30;
    } else if (isLargeDevice) {
      gridColumns = isLandscape ? 3 : 2;
      itemSpacing = 18;
      containerPadding = 25;
    } else if (isSmallDevice) {
      gridColumns = 2;
      itemSpacing = 12;
      containerPadding = 16;
    }

    // Header height based on device and platform
    let headerHeight = 120;
    if (Platform.OS === 'ios') {
      headerHeight = isSmallDevice ? 110 : 120;
    } else {
      headerHeight = isSmallDevice ? 100 : 110;
    }

    // Bottom safe area
    const bottomSafeArea = Platform.OS === 'ios' ? (isSmallDevice ? 20 : 34) : 20;

    return {
      isSmallDevice,
      isMediumDevice,
      isLargeDevice,
      isTablet,
      isLandscape,
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      gridColumns,
      itemSpacing,
      containerPadding,
      headerHeight,
      bottomSafeArea,
    };
  }, []);
};

export const getResponsiveItemSize = (
  screenWidth: number,
  columns: number,
  spacing: number,
  padding: number
): { width: number; height: number } => {
  const totalSpacing = (columns - 1) * spacing;
  const totalPadding = padding * 2;
  const availableWidth = screenWidth - totalSpacing - totalPadding;
  const itemWidth = availableWidth / columns;
  
  // Maintain aspect ratio based on content type
  const aspectRatio = 1.3; // Height is 1.3x width for style cards
  const itemHeight = itemWidth * aspectRatio;
  
  return {
    width: itemWidth,
    height: itemHeight,
  };
};

export const getResponsiveFontSize = (
  baseSize: number,
  isSmallDevice: boolean,
  isLargeDevice: boolean
): number => {
  if (isSmallDevice) {
    return Math.max(baseSize - 2, 12); // Minimum font size of 12
  }
  
  if (isLargeDevice) {
    return baseSize + 2;
  }
  
  return baseSize;
};