import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../stores/contentStore';
import { supabase } from '../../services/supabase';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Import design tokens
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
    scrim: "rgba(28,28,28,0.45)",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

const { width } = Dimensions.get('window');

// Enhanced database-driven category interface
interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_type: 'interior' | 'garden' | 'surface' | 'object' | 'exterior';
  icon_name: string;
  image_url?: string;
  thumbnail_url?: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  display_order: number;
  is_featured: boolean;
  usage_count: number;
  popularity_score: number;
  complexity_level: number;
  compatible_rooms?: string[];
  compatible_styles?: string[];
  created_at: string;
}

interface CategorySelectionScreenProps {
  navigation?: any;
  route?: any;
}

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const contentStore = useContentStore();
  const { loadCategories } = contentStore;
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Load categories from database
    loadCategoriesData();
    
    // Entrance animations
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
  }, []);

  // Reload categories when filter changes
  useEffect(() => {
    if (selectedTypeFilter) {
      loadCategoriesData();
    }
  }, [selectedTypeFilter]);

  const loadCategoriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use database function to get categories by type
      const { data: categoriesData, error: dbError } = await supabase
        .rpc('get_categories_by_type', {
          p_category_type: selectedTypeFilter === 'all' ? null : selectedTypeFilter,
          p_include_inactive: false
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (categoriesData && categoriesData.length > 0) {
        // Transform database response to our interface
        const transformedCategories: DatabaseCategory[] = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          category_type: cat.category_type,
          icon_name: cat.icon_name,
          image_url: cat.image_url,
          thumbnail_url: cat.thumbnail_url,
          color_scheme: cat.color_scheme || { primary: tokens.color.brand, secondary: tokens.color.brandHover },
          display_order: cat.display_order,
          is_featured: cat.is_featured,
          usage_count: cat.usage_count,
          popularity_score: cat.popularity_score,
          complexity_level: cat.complexity_level || 1,
          created_at: cat.created_at
        }));
        setCategories(transformedCategories);
      } else {
        // Fallback to basic categories if database is empty
        await createFallbackCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      
      // Fallback to hardcoded categories
      await createFallbackCategories();
    } finally {
      setLoading(false);
    }
  };

  const createFallbackCategories = async () => {
    const fallbackCategories: DatabaseCategory[] = [
      {
        id: '1',
        name: 'Interior Design',
        slug: 'interior-design',
        description: 'Transform your indoor spaces with style and functionality',
        category_type: 'interior',
        icon_name: 'home',
        color_scheme: { primary: '#C9A98C', secondary: '#B9906F', accent: '#8B7355' },
        display_order: 1,
        is_featured: true,
        usage_count: 0,
        popularity_score: 1.0,
        complexity_level: 3,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Garden & Landscape',
        slug: 'garden-landscape',
        description: 'Create beautiful outdoor spaces and landscapes',
        category_type: 'garden',
        icon_name: 'leaf',
        color_scheme: { primary: '#7FB069', secondary: '#588B8B', accent: '#4A5D23' },
        display_order: 2,
        is_featured: true,
        usage_count: 0,
        popularity_score: 0.8,
        complexity_level: 4,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Surface Design',
        slug: 'surface-design',
        description: 'Focus on walls, floors, and surface treatments',
        category_type: 'surface',
        icon_name: 'square',
        color_scheme: { primary: '#D4A574', secondary: '#C9A98C', accent: '#B8935F' },
        display_order: 3,
        is_featured: false,
        usage_count: 0,
        popularity_score: 0.6,
        complexity_level: 2,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Object Styling',
        slug: 'object-styling',
        description: 'Curate and style individual pieces and collections',
        category_type: 'object',
        icon_name: 'cube',
        color_scheme: { primary: '#E07A5F', secondary: '#F4A261', accent: '#E76F51' },
        display_order: 4,
        is_featured: false,
        usage_count: 0,
        popularity_score: 0.5,
        complexity_level: 2,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Exterior Design',
        slug: 'exterior-design',
        description: 'Enhance your home\'s curb appeal and outdoor aesthetics',
        category_type: 'exterior',
        icon_name: 'business',
        color_scheme: { primary: '#264653', secondary: '#2A9D8F', accent: '#1D3557' },
        display_order: 5,
        is_featured: false,
        usage_count: 0,
        popularity_score: 0.4,
        complexity_level: 5,
        created_at: new Date().toISOString()
      }
    ];
    setCategories(fallbackCategories);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleContinue = async () => {
    if (!selectedCategory) return;
    
    const selected = categories.find(c => c.id === selectedCategory);
    if (selected) {
      try {
        // Increment usage count in database
        await supabase.rpc('increment_category_usage', {
          p_category_id: selectedCategory
        });
      } catch (error) {
        console.warn('Failed to update category usage:', error);
      }
      
      // Update journey store with selected category
      journeyStore.updateProjectWizard({
        categoryId: selectedCategory,
        categoryName: selected.name,
        categoryType: selected.category_type,
        categorySlug: selected.slug,
        currentWizardStep: 'space_definition'
      });
      
      // Navigate to space definition screen (room selection)
      NavigationHelpers.navigateToScreen('spaceDefinition');
    }
  };

  const handleBack = () => {
    // Go back to paywall or previous screen
    NavigationHelpers.navigateToScreen('paywall');
  };

  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'home': 'home',
      'leaf': 'leaf',
      'color-palette': 'color-palette',
      'hammer': 'hammer',
      'square': 'square',
      'cube': 'cube',
      'business': 'business',
    };
    return iconMap[iconName] || 'help-circle';
  };

  const getCategoryTypeDisplayName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'interior': 'Interior',
      'garden': 'Garden',
      'surface': 'Surface',
      'object': 'Object',
      'exterior': 'Exterior',
      'all': 'All Types'
    };
    return typeMap[type] || 'Unknown';
  };

  const getComplexityLabel = (level: number): string => {
    const labels = ['Beginner', 'Easy', 'Medium', 'Advanced', 'Expert'];
    return labels[level - 1] || 'Unknown';
  };

  const getFilteredCategories = () => {
    if (selectedTypeFilter === 'all') {
      return categories;
    }
    return categories.filter(cat => cat.category_type === selectedTypeFilter);
  };

  const categoryTypes = [
    { key: 'all', label: 'All Types', count: categories.length },
    { key: 'interior', label: 'Interior', count: categories.filter(c => c.category_type === 'interior').length },
    { key: 'garden', label: 'Garden', count: categories.filter(c => c.category_type === 'garden').length },
    { key: 'surface', label: 'Surface', count: categories.filter(c => c.category_type === 'surface').length },
    { key: 'object', label: 'Object', count: categories.filter(c => c.category_type === 'object').length },
    { key: 'exterior', label: 'Exterior', count: categories.filter(c => c.category_type === 'exterior').length },
  ].filter(type => type.count > 0 || type.key === 'all');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Choose Your Project</Text>
            <Text style={styles.headerSubtitle}>What would you like to transform?</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '16.67%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 6</Text>
        </View>

        {/* Category Type Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Project Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {categoryTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.filterChip,
                  selectedTypeFilter === type.key && styles.filterChipActive
                ]}
                onPress={() => setSelectedTypeFilter(type.key)}
                activeOpacity={0.9}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedTypeFilter === type.key && styles.filterChipTextActive
                ]}>
                  {type.label}
                </Text>
                {type.count > 0 && (
                  <View style={[
                    styles.filterChipBadge,
                    selectedTypeFilter === type.key && styles.filterChipBadgeActive
                  ]}>
                    <Text style={[
                      styles.filterChipBadgeText,
                      selectedTypeFilter === type.key && styles.filterChipBadgeTextActive
                    ]}>
                      {type.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={24} color={tokens.color.accent} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadCategoriesData} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Categories Grid */}
            <View style={styles.categoriesContainer}>
              {getFilteredCategories().map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.selectedCard,
                    { borderColor: category.color_scheme.primary }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.9}
                >
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: category.color_scheme.primary + '15' }
                  ]}>
                    <Ionicons 
                      name={getIconName(category.icon_name)} 
                      size={32} 
                      color={selectedCategory === category.id ? category.color_scheme.primary : tokens.color.textSecondary} 
                    />
                  </View>
                  
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryHeader}>
                      <Text style={[
                        styles.categoryTitle,
                        selectedCategory === category.id && { color: category.color_scheme.primary }
                      ]}>
                        {category.name}
                      </Text>
                      {category.is_featured && (
                        <View style={styles.featuredBadge}>
                          <Ionicons name="star" size={12} color={tokens.color.brand} />
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.categoryDescription}>
                      {category.description}
                    </Text>
                    
                    <View style={styles.categoryMeta}>
                      <View style={styles.complexityBadge}>
                        <Text style={styles.complexityText}>
                          {getComplexityLabel(category.complexity_level)}
                        </Text>
                      </View>
                      
                      {category.usage_count > 0 && (
                        <Text style={styles.usageText}>
                          {category.usage_count} projects
                        </Text>
                      )}
                    </View>
                  </View>

                  {selectedCategory === category.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color={category.color_scheme.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              {getFilteredCategories().length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={48} color={tokens.color.textMuted} />
                  <Text style={styles.emptyTitle}>No categories found</Text>
                  <Text style={styles.emptyDescription}>Try selecting a different project type</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, !selectedCategory && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={!selectedCategory}
          >
            <LinearGradient
              colors={!selectedCategory 
                ? [tokens.color.borderSoft, tokens.color.borderSoft] 
                : [tokens.color.brand, tokens.color.brandHover]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                !selectedCategory && styles.continueButtonTextDisabled
              ]}>
                Continue
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={!selectedCategory ? tokens.color.textMuted : tokens.color.textInverse}
                style={styles.continueButtonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.color.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  filterContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  filterTitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.md,
    fontWeight: '500',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingRight: tokens.spacing.xl,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    marginRight: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
  },
  filterChipActive: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
  },
  filterChipText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: tokens.color.textInverse,
  },
  filterChipBadge: {
    marginLeft: tokens.spacing.xs,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipBadgeActive: {
    backgroundColor: tokens.color.textInverse,
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.color.textSecondary,
  },
  filterChipBadgeTextActive: {
    color: tokens.color.brand,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: tokens.spacing.lg,
  },
  errorText: {
    ...tokens.type.small,
    color: tokens.color.accent,
    flex: 1,
    marginLeft: tokens.spacing.md,
  },
  retryButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.sm,
  },
  retryText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  categoriesContainer: {
    gap: tokens.spacing.lg,
  },
  categoryCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...tokens.shadow.e2,
  },
  selectedCard: {
    backgroundColor: tokens.color.surface,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
    marginTop: tokens.spacing.xs,
  },
  categoryContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  categoryTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    flex: 1,
  },
  featuredBadge: {
    marginLeft: tokens.spacing.xs,
  },
  categoryDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    lineHeight: 20,
    marginBottom: tokens.spacing.md,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  complexityBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  complexityText: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.color.textSecondary,
  },
  usageText: {
    fontSize: 11,
    color: tokens.color.textMuted,
  },
  selectedIndicator: {
    marginLeft: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  emptyTitle: {
    ...tokens.type.h2,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.xs,
  },
  emptyDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingTop: tokens.spacing.xl,
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    height: 52,
  },
  continueButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  continueButtonTextDisabled: {
    color: tokens.color.textMuted,
  },
  continueButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
});

export default CategorySelectionScreen;