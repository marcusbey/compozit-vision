import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { supabase } from '../../services/supabase';

// Design Tokens - Updated to match design system
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textMuted: "#9A9A9A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

// Enhanced style interface with space compatibility
interface EnhancedStyle {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  mood_tags: string[];
  color_palette: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  illustration_url?: string;
  is_popular: boolean;
  compatibility_score?: number;
  suitable_spaces?: string[];
  space_popularity?: Record<string, number>;
}

// Filter types for style organization
type StyleFilter = 'recommended' | 'popular' | 'all' | 'space-specific';

const { width } = Dimensions.get('window');

interface StyleSelectionScreenProps {
  navigation?: any;
  route?: any;
}

// Enhanced style data with space compatibility
const FALLBACK_STYLES: EnhancedStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    slug: 'modern',
    subtitle: 'Clean & Minimal',
    description: 'Clean lines, open spaces, and functional design',
    mood_tags: ['clean', 'minimal', 'sophisticated'],
    color_palette: { primary: '#2D2B28', secondary: '#F8F8F8', accent: '#4A4A4A' },
    is_popular: true,
    suitable_spaces: ['living-room', 'kitchen', 'home-office', 'dining-room'],
    space_popularity: {
      'living-room': 95,
      'kitchen': 90,
      'home-office': 85,
      'dining-room': 80,
      'bedroom': 70,
      'bathroom': 75,
    }
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    slug: 'scandinavian',
    subtitle: 'Light & Cozy',
    description: 'Light colors, natural materials, and hygge',
    mood_tags: ['cozy', 'natural', 'bright'],
    color_palette: { primary: '#F5F1E8', secondary: '#FFFFFF', accent: '#8B7355' },
    is_popular: true,
    suitable_spaces: ['bedroom', 'living-room', 'home-office'],
    space_popularity: {
      'bedroom': 95,
      'living-room': 85,
      'home-office': 80,
      'kitchen': 70,
      'bathroom': 65,
      'dining-room': 75,
    }
  },
  {
    id: 'industrial',
    name: 'Industrial',
    slug: 'industrial',
    subtitle: 'Urban & Raw',
    description: 'Exposed materials, metal, and urban aesthetics',
    mood_tags: ['urban', 'raw', 'edgy'],
    color_palette: { primary: '#8B7F73', secondary: '#3A3A3A', accent: '#B8935F' },
    is_popular: false,
    suitable_spaces: ['home-office', 'kitchen', 'living-room'],
    space_popularity: {
      'home-office': 90,
      'kitchen': 85,
      'living-room': 75,
      'dining-room': 70,
      'bedroom': 50,
      'bathroom': 60,
    }
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    slug: 'bohemian',
    subtitle: 'Eclectic & Artistic',
    description: 'Rich textures, patterns, and global influences',
    mood_tags: ['eclectic', 'artistic', 'vibrant'],
    color_palette: { primary: '#D4A574', secondary: '#8B4513', accent: '#CD853F' },
    is_popular: false,
    suitable_spaces: ['bedroom', 'living-room', 'dining-room'],
    space_popularity: {
      'bedroom': 90,
      'living-room': 80,
      'dining-room': 85,
      'home-office': 60,
      'kitchen': 55,
      'bathroom': 45,
    }
  },
  {
    id: 'traditional',
    name: 'Traditional',
    slug: 'traditional',
    subtitle: 'Classic & Timeless',
    description: 'Classic patterns, rich woods, and elegant details',
    mood_tags: ['classic', 'elegant', 'timeless'],
    color_palette: { primary: '#B8935F', secondary: '#8B4513', accent: '#CD853F' },
    is_popular: true,
    suitable_spaces: ['dining-room', 'living-room', 'bedroom'],
    space_popularity: {
      'dining-room': 95,
      'living-room': 90,
      'bedroom': 80,
      'home-office': 75,
      'kitchen': 70,
      'bathroom': 65,
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    slug: 'minimalist',
    subtitle: 'Less is More',
    description: 'Simple forms, neutral colors, and essential elements',
    mood_tags: ['simple', 'clean', 'zen'],
    color_palette: { primary: '#E6DDD1', secondary: '#FFFFFF', accent: '#8B7355' },
    is_popular: true,
    suitable_spaces: ['bedroom', 'bathroom', 'home-office'],
    space_popularity: {
      'bathroom': 90,
      'bedroom': 85,
      'home-office': 80,
      'kitchen': 75,
      'living-room': 70,
      'dining-room': 65,
    }
  },
];

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [styles, setStyles] = useState<EnhancedStyle[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<EnhancedStyle[]>([]);
  const [currentFilter, setCurrentFilter] = useState<StyleFilter>('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();

  // Load styles from database with fallback
  const loadStyles = async () => {
    setIsLoading(true);
    try {
      // Try to load from database first
      const { data: dbStyles, error } = await supabase
        .from('design_styles')
        .select('*')
        .eq('is_active', true)
        .order('is_popular', { ascending: false })
        .order('name');

      if (error) {
        console.warn('Database styles not available, using fallback:', error.message);
        setStyles(FALLBACK_STYLES);
      } else {
        // Map database styles to our enhanced interface
        const enhancedStyles: EnhancedStyle[] = dbStyles.map(style => ({
          id: style.id,
          name: style.name,
          slug: style.slug,
          subtitle: style.subtitle || 'Beautiful Design',
          description: style.description,
          mood_tags: style.mood_tags || [],
          color_palette: style.color_palette || { primary: '#D4A574', secondary: '#F8F8F8' },
          illustration_url: style.illustration_url,
          is_popular: style.is_popular,
          suitable_spaces: style.suitable_spaces || [],
          space_popularity: style.space_popularity || {},
        }));
        
        setStyles(enhancedStyles.length > 0 ? enhancedStyles : FALLBACK_STYLES);
      }
    } catch (error) {
      console.warn('Failed to load styles, using fallback:', error);
      setStyles(FALLBACK_STYLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStyles();
  }, []);

  useEffect(() => {
    // Get selected rooms from journey store for filtering
    const selectedRooms = journeyStore.projectWizard?.selectedRooms || [];
    const roomSlugs = selectedRooms.map(room => typeof room === 'string' ? room : room.slug || room.name?.toLowerCase().replace(/\s+/g, '-'));
    setSelectedRoomTypes(roomSlugs);

    // Filter and enhance styles based on selected rooms and current filter
    const enhanceAndFilterStyles = (stylesList: EnhancedStyle[]) => {
      return stylesList
        .map(style => {
          // Calculate compatibility score based on selected rooms
          let compatibilityScore = 0;
          if (roomSlugs.length > 0 && style.space_popularity) {
            compatibilityScore = roomSlugs.reduce((sum, roomSlug) => {
              return sum + (style.space_popularity![roomSlug] || 50);
            }, 0) / roomSlugs.length;
          }

          return {
            ...style,
            compatibility_score: compatibilityScore,
          };
        })
        .filter(style => {
          // Apply filter logic
          switch (currentFilter) {
            case 'recommended':
              return roomSlugs.length === 0 || 
                     (style.compatibility_score && style.compatibility_score >= 70) ||
                     style.is_popular;
            case 'popular':
              return style.is_popular;
            case 'space-specific':
              return roomSlugs.length > 0 && 
                     style.suitable_spaces &&
                     roomSlugs.some(room => style.suitable_spaces!.includes(room));
            case 'all':
            default:
              return true;
          }
        })
        .sort((a, b) => {
          // Sort by compatibility score, then popularity, then name
          if (a.compatibility_score !== b.compatibility_score) {
            return (b.compatibility_score || 0) - (a.compatibility_score || 0);
          }
          if (a.is_popular !== b.is_popular) {
            return a.is_popular ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
    };

    const enhanced = enhanceAndFilterStyles(styles);
    setFilteredStyles(enhanced);

    // Animate if styles are loaded
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [styles, currentFilter, journeyStore.projectWizard?.selectedRooms, isLoading]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    
    // Update journey store
    journeyStore.updateDesignInputs({
      selectedStyles: [styleId],
    });
  };

  const handleContinue = () => {
    if (selectedStyle) {
      // Update journey store with selected style
      const selectedStyleData = filteredStyles.find(s => s.id === selectedStyle);
      journeyStore.updateProjectWizard({
        selectedStyleId: selectedStyle,
        selectedStyleName: selectedStyleData?.name,
        selectedStyleSlug: selectedStyleData?.slug,
        currentWizardStep: 'references_colors'
      });
      
      // Continue to references and colors selection
      NavigationHelpers.navigateToScreen('referencesColors');
    }
  };

  const handleBack = () => {
    NavigationHelpers.navigateToScreen('spaceDefinition');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Style</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 6</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Context Info */}
          {selectedRoomTypes.length > 0 && (
            <View style={styles.contextInfo}>
              <View style={styles.contextRow}>
                <Text style={styles.contextLabel}>Designing for:</Text>
                <Text style={styles.contextValue}>
                  {selectedRoomTypes.length > 1 
                    ? `${selectedRoomTypes.length} spaces`
                    : selectedRoomTypes[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            {(['recommended', 'popular', 'all'] as StyleFilter[]).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, currentFilter === filter && styles.activeFilterTab]}
                onPress={() => setCurrentFilter(filter)}
              >
                <Text style={[styles.filterTabText, currentFilter === filter && styles.activeFilterTabText]}>
                  {filter === 'recommended' && selectedRoomTypes.length > 0 ? 'For Your Spaces' : 
                   filter === 'recommended' ? 'Recommended' :
                   filter === 'popular' ? 'Popular' : 'All Styles'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tokens.color.brand} />
              <Text style={styles.loadingText}>Loading styles...</Text>
            </View>
          ) : filteredStyles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="color-palette-outline" size={48} color={tokens.color.textMuted} />
              <Text style={styles.emptyTitle}>No styles found</Text>
              <Text style={styles.emptyDescription}>
                Try selecting "All Styles" to see our complete collection
              </Text>
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => setCurrentFilter('all')}
              >
                <Text style={styles.showAllButtonText}>Show All Styles</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stylesGrid}>
              {filteredStyles.map((style, index) => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    selectedStyle === style.id && styles.selectedStyleCard
                  ]}
                  onPress={() => handleStyleSelect(style.id)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.stylePreview, { backgroundColor: style.color_palette.primary }]}>
                    {/* High compatibility badge */}
                    {style.compatibility_score && style.compatibility_score >= 85 && (
                      <View style={styles.compatibilityBadge}>
                        <Ionicons name="star" size={12} color="#FFF" />
                        <Text style={styles.compatibilityBadgeText}>Great Match</Text>
                      </View>
                    )}
                    
                    {/* Popular badge */}
                    {style.is_popular && (
                      <View style={styles.popularBadge}>
                        <Ionicons name="trending-up" size={12} color={tokens.color.brand} />
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                    
                    {/* Compatibility Score Bar */}
                    {selectedRoomTypes.length > 0 && style.compatibility_score && (
                      <View style={styles.compatibilityIndicator}>
                        <View 
                          style={[
                            styles.compatibilityBar, 
                            { width: `${Math.min(100, style.compatibility_score)}%` }
                          ]} 
                        />
                      </View>
                    )}

                    {selectedStyle === style.id && (
                      <View style={styles.selectedOverlay}>
                        <Ionicons name="checkmark-circle" size={32} color={tokens.color.brand} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.styleInfo}>
                    <Text style={styles.styleName}>{style.name}</Text>
                    <Text style={styles.styleSubtitle}>{style.subtitle}</Text>
                    <Text style={styles.styleDescription} numberOfLines={2}>{style.description}</Text>
                    
                    {/* Compatibility score for selected rooms */}
                    {selectedRoomTypes.length > 0 && style.compatibility_score && (
                      <Text style={styles.compatibilityText}>
                        {Math.round(style.compatibility_score)}% space compatibility
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.bottomContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.continueButton, !selectedStyle && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedStyle}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={selectedStyle ? [tokens.color.accent, tokens.color.accent] : [tokens.color.borderSoft, tokens.color.borderSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButtonGradient}
          >
            <Text style={[styles.continueButtonText, !selectedStyle && styles.disabledButtonText]}>
              Continue to References & Colors
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  styleCard: {
    width: (width - (tokens.spacing.xl * 2) - tokens.spacing.md) / 2,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
    marginBottom: tokens.spacing.lg,
  },
  selectedStyleCard: {
    borderColor: tokens.color.brand,
    borderWidth: 2,
  },
  stylePreview: {
    width: '100%',
    height: 120,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleInfo: {
    alignItems: 'center',
  },
  styleName: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  styleSubtitle: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  styleDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  compatibilityText: {
    ...tokens.type.caption,
    color: tokens.color.brand,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: tokens.spacing.xs,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.bgSurface,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  contextInfo: {
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contextLabel: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  contextValue: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: 4,
    marginBottom: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  filterTab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: tokens.color.brand,
  },
  filterTabText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginTop: tokens.spacing.lg,
  },
  emptyContainer: {
    paddingVertical: tokens.spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  emptyDescription: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.xl,
  },
  showAllButton: {
    backgroundColor: tokens.color.brand,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.pill,
  },
  showAllButtonText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.brand,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  compatibilityBadgeText: {
    fontSize: 10,
    color: '#FFF',
    marginLeft: 2,
    fontWeight: '600',
  },
  popularBadge: {
    position: 'absolute',
    top: tokens.spacing.sm,
    left: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  popularBadgeText: {
    fontSize: 10,
    color: tokens.color.brand,
    marginLeft: 2,
    fontWeight: '600',
  },
  compatibilityIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  compatibilityBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  continueButton: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginTop: tokens.spacing.xl,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  continueButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: tokens.color.textMuted,
  },
});

export default StyleSelectionScreen;