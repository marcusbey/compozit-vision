import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import stores and services
import { useContentStore } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Types
interface ColorSwatch {
  color: string;
  name?: string;
}

interface ColorPaletteDisplay {
  id: string;
  name: string;
  colors: string[];
  description?: string;
  mood_tags?: string[];
  style_compatibility?: string[];
  isUserCreated: boolean;
  isFavorite?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const paletteWidth = screenWidth - 32; // Full width minus padding

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#22C55E",
    warning: "#F59E0B",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  shadow: {
    e2: { 
      shadowColor: "#000", 
      shadowOpacity: 0.08, 
      shadowRadius: 12, 
      shadowOffset: { width: 0, height: 4 }, 
      elevation: 4 
    },
  },
  type: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
};

export const ColorPalettesScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPalettes, setSelectedPalettes] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'warm' | 'cool' | 'neutral'>('all');

  // Store data
  const {
    colorPalettes,
    userPalettes,
    loading,
    errors,
    loadColorPalettes,
    loadUserPalettes,
    togglePaletteSelection,
    togglePaletteFavorite,
  } = useContentStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadColorPalettes(),
        loadUserPalettes(),
      ]);
    } catch (error) {
      console.error('Error loading palette data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePaletteSelect = (paletteId: string) => {
    togglePaletteSelection(paletteId);
    setSelectedPalettes(prev => {
      const isSelected = prev.includes(paletteId);
      return isSelected
        ? prev.filter(id => id !== paletteId)
        : [...prev, paletteId];
    });
  };

  const handleContinue = () => {
    if (selectedPalettes.length === 0) {
      Alert.alert('No Selection', 'Please select at least one color palette to continue.');
      return;
    }
    
    // Navigate to enhanced AI processing
    NavigationHelpers.navigateToScreen('aiProcessing');
  };

  const handleSkip = () => {
    // Skip directly to AI processing
    NavigationHelpers.navigateToScreen('aiProcessing');
  };

  const handleGoBack = () => {
    // Go back to reference images
    NavigationHelpers.navigateToScreen('referenceImages');
  };

  const convertPalettesToDisplay = (): ColorPaletteDisplay[] => {
    const displayPalettes: ColorPaletteDisplay[] = [];

    // Add user palettes
    userPalettes.forEach(palette => {
      const colors = Array.isArray(palette.colors.colors) 
        ? palette.colors.colors 
        : [palette.colors.primary, palette.colors.secondary, palette.colors.accent].filter(Boolean);
      
      displayPalettes.push({
        id: palette.id,
        name: palette.name,
        colors: colors,
        description: palette.description,
        mood_tags: palette.mood_tags,
        style_compatibility: palette.style_compatibility,
        isUserCreated: true,
        isFavorite: palette.is_favorite,
      });
    });

    // Add preset palettes
    colorPalettes.forEach(palette => {
      const colors = Array.isArray(palette.colors.colors) 
        ? palette.colors.colors 
        : [];
      
      displayPalettes.push({
        id: palette.id,
        name: palette.display_name,
        colors: colors,
        description: palette.description,
        isUserCreated: false,
        isFavorite: false,
      });
    });

    // Filter by temperature
    if (activeFilter !== 'all') {
      return displayPalettes.filter(palette => {
        // Simple color temperature detection based on first color
        const firstColor = palette.colors[0];
        if (!firstColor) return true;
        
        const rgb = hexToRgb(firstColor);
        if (!rgb) return true;
        
        const temp = getColorTemperature(rgb);
        return temp === activeFilter;
      });
    }

    return displayPalettes;
  };

  const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getColorTemperature = (rgb: {r: number, g: number, b: number}): 'warm' | 'cool' | 'neutral' => {
    // Simple algorithm: more red/yellow = warm, more blue = cool
    const warmness = (rgb.r + (rgb.g * 0.5)) - rgb.b;
    if (warmness > 50) return 'warm';
    if (warmness < -50) return 'cool';
    return 'neutral';
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {(['all', 'warm', 'cool', 'neutral'] as const).map(filter => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterTab,
            activeFilter === filter && styles.filterTabActive
          ]}
          onPress={() => setActiveFilter(filter)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterTabText,
            activeFilter === filter && styles.filterTabTextActive
          ]}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderColorSwatch = (color: string, index: number, totalColors: number) => {
    const swatchWidth = (paletteWidth - 32) / totalColors; // Distribute width evenly
    
    return (
      <View 
        key={`${color}-${index}`}
        style={[
          styles.colorSwatch, 
          { 
            backgroundColor: color,
            width: swatchWidth,
            borderTopLeftRadius: index === 0 ? tokens.radius.md : 0,
            borderBottomLeftRadius: index === 0 ? tokens.radius.md : 0,
            borderTopRightRadius: index === totalColors - 1 ? tokens.radius.md : 0,
            borderBottomRightRadius: index === totalColors - 1 ? tokens.radius.md : 0,
          }
        ]}
      >
        {/* Color code overlay on hover/press */}
        <View style={styles.colorCode}>
          <Text style={[
            styles.colorCodeText,
            { color: getLuminance(color) > 0.5 ? '#000' : '#fff' }
          ]}>
            {color.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const renderPaletteList = () => {
    const palettes = convertPalettesToDisplay();
    
    if (loading.palettes || loading.userPalettes) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.color.brand} />
          <Text style={styles.loadingText}>Loading color palettes...</Text>
        </View>
      );
    }

    if (palettes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="color-palette-outline" size={64} color={tokens.color.textSecondary} />
          <Text style={styles.emptyTitle}>No Color Palettes</Text>
          <Text style={styles.emptySubtitle}>
            Create your first palette from reference images or wait for presets to load
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.paletteList}>
        {palettes.map((palette) => {
          const isSelected = selectedPalettes.includes(palette.id);
          
          return (
            <TouchableOpacity
              key={palette.id}
              style={[
                styles.paletteCard,
                isSelected && styles.paletteCardSelected
              ]}
              onPress={() => handlePaletteSelect(palette.id)}
              activeOpacity={0.9}
            >
              <View style={styles.paletteHeader}>
                <View style={styles.paletteInfo}>
                  <Text style={styles.paletteName}>{palette.name}</Text>
                  {palette.description && (
                    <Text style={styles.paletteDescription} numberOfLines={2}>
                      {palette.description}
                    </Text>
                  )}
                  
                  {/* Tags */}
                  {palette.mood_tags && palette.mood_tags.length > 0 && (
                    <View style={styles.tagContainer}>
                      {palette.mood_tags.slice(0, 3).map(tag => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.paletteActions}>
                  {palette.isUserCreated && (
                    <View style={styles.userIndicator}>
                      <Ionicons name="person-circle" size={16} color={tokens.color.brand} />
                    </View>
                  )}
                  
                  {/* Favorite button */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering palette selection
                      togglePaletteFavorite(palette.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={palette.isFavorite ? "heart" : "heart-outline"} 
                      size={20} 
                      color={palette.isFavorite ? tokens.color.warning : tokens.color.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <View style={styles.selectionIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
                    </View>
                  )}
                </View>
              </View>

              {/* Color swatches */}
              <View style={styles.colorSwatchContainer}>
                {palette.colors.slice(0, 6).map((color, index) => 
                  renderColorSwatch(color, index, Math.min(palette.colors.length, 6))
                )}
              </View>

              {/* Selection overlay */}
              {isSelected && (
                <View style={styles.selectionOverlay}>
                  <LinearGradient
                    colors={['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.2)']}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[tokens.color.bgApp, tokens.color.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Color Palettes</Text>
            <Text style={styles.headerSubtitle}>
              {selectedPalettes.length} selected • Perfect color combinations
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => {
              // TODO: Navigate to color palette creation from image
              Alert.alert('Coming Soon', 'Color palette creation from images is coming soon!');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={tokens.color.brand} />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        {renderFilterTabs()}

        {/* Palette list */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderPaletteList()}
        </ScrollView>

        {/* Continue button */}
        {selectedPalettes.length > 0 && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedPalettes.length} palette{selectedPalettes.length !== 1 ? 's' : ''}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  backButton: {
    padding: tokens.spacing.sm,
    marginRight: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  createButton: {
    padding: tokens.spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  filterTab: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    marginRight: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.bgApp,
  },
  filterTabActive: {
    backgroundColor: tokens.color.brand,
  },
  filterTabText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: tokens.color.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    paddingBottom: 120,
  },
  paletteList: {
    gap: tokens.spacing.lg,
  },
  paletteCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  paletteCardSelected: {
    borderColor: tokens.color.success,
    borderWidth: 2,
  },
  paletteHeader: {
    flexDirection: 'row',
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  paletteInfo: {
    flex: 1,
  },
  paletteName: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  paletteDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.xs,
  },
  tag: {
    backgroundColor: tokens.color.bgApp,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  tagText: {
    ...tokens.type.caption,
    color: tokens.color.textSecondary,
  },
  paletteActions: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  userIndicator: {
    backgroundColor: tokens.color.bgApp,
    borderRadius: 12,
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  selectionIndicator: {
    // Style applied via icon color
  },
  colorSwatchContainer: {
    flexDirection: 'row',
    height: 80,
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  colorSwatch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorCode: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  colorCodeText: {
    ...tokens.type.caption,
    fontSize: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginTop: tokens.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
    paddingHorizontal: tokens.spacing.lg,
  },
  emptyTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
  },
  emptySubtitle: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.accent,
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  continueButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
  },
});

export default ColorPalettesScreen;