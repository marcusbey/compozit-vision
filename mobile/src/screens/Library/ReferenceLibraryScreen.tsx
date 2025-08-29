import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

// Services and stores
import { useContentStore } from '../../stores/contentStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { referenceImageService, type ReferenceImage } from '../../services/referenceImageService';
import { colorExtractionService, type ColorPalette } from '../../services/colorExtractionService';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FavoritesStats } from '../../components/FavoritesStats';

const { width, height } = Dimensions.get('window');

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    scrim: "rgba(28,28,28,0.45)",
    scrimHeavy: "rgba(28,28,28,0.65)",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
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

// Types
type TabType = 'all' | 'favorites' | 'palettes' | 'recent';
type ViewMode = 'grid' | 'list';
type SortMode = 'newest' | 'oldest' | 'mostUsed' | 'alphabetical';

interface SearchFilters {
  spaceTypes: string[];
  categories: string[];
  tags: string[];
}

interface ReferenceLibraryScreenProps {
  navigation?: any;
  route?: any;
}

const ReferenceLibraryScreen: React.FC<ReferenceLibraryScreenProps> = ({ navigation, route }) => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    spaceTypes: [],
    categories: [],
    tags: [],
  });
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Data state
  const [userReferences, setUserReferences] = useState<ReferenceImage[]>([]);
  const [userPalettes, setUserPalettes] = useState<ColorPalette[]>([]);
  const [filteredItems, setFilteredItems] = useState<(ReferenceImage | ColorPalette)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection and editing
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferenceImage | ColorPalette | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);

  // Stores
  const contentStore = useContentStore();
  const journeyStore = useJourneyStore();
  const favoritesStore = useFavoritesStore();

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadLibraryData();
      // Initialize favorites store
      favoritesStore.refreshAll();
    }, [favoritesStore])
  );

  // Load all library data
  const loadLibraryData = async () => {
    try {
      setIsLoading(true);
      
      // Load user references and palettes in parallel
      const [references, palettes] = await Promise.all([
        referenceImageService.getUserReferenceImages(),
        colorExtractionService.getUserColorPalettes(),
      ]);

      setUserReferences(references);
      setUserPalettes(palettes);
      
    } catch (error) {
      console.error('Failed to load library data:', error);
      Alert.alert('Error', 'Failed to load your reference library. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLibraryData();
    setIsRefreshing(false);
  };

  // Filter and sort items based on current settings
  const processedItems = useMemo(() => {
    let items: (ReferenceImage | ColorPalette)[] = [];

    // Combine data based on active tab
    switch (activeTab) {
      case 'all':
        items = [...userReferences, ...userPalettes];
        break;
      case 'favorites':
        items = [
          ...userReferences.filter(ref => ref.is_favorite),
          ...userPalettes.filter(palette => palette.is_favorite),
        ];
        break;
      case 'palettes':
        items = userPalettes;
        break;
      case 'recent':
        items = [...userReferences, ...userPalettes]
          .filter(item => {
            const lastUsed = item.last_used_at || item.updated_at;
            const daysSinceUsed = (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceUsed <= 7; // Used within last week
          });
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      items = items.filter(item => {
        const searchText = searchQuery.toLowerCase();
        
        if ('user_title' in item) {
          // Reference image
          const ref = item as ReferenceImage;
          return (
            ref.user_title?.toLowerCase().includes(searchText) ||
            ref.user_description?.toLowerCase().includes(searchText) ||
            ref.ai_description?.toLowerCase().includes(searchText) ||
            ref.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
            ref.style_tags.some(tag => tag.toLowerCase().includes(searchText)) ||
            ref.mood_tags.some(tag => tag.toLowerCase().includes(searchText))
          );
        } else {
          // Color palette
          const palette = item as ColorPalette;
          return (
            palette.name.toLowerCase().includes(searchText) ||
            palette.description?.toLowerCase().includes(searchText) ||
            palette.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
            palette.mood_tags.some(tag => tag.toLowerCase().includes(searchText))
          );
        }
      });
    }

    // Apply advanced filters
    if (searchFilters.spaceTypes.length > 0) {
      items = items.filter(item => {
        if ('space_types' in item) {
          return (item as ReferenceImage).space_types.some(type => 
            searchFilters.spaceTypes.includes(type)
          );
        }
        if ('space_compatibility' in item) {
          return (item as ColorPalette).space_compatibility.some(type => 
            searchFilters.spaceTypes.includes(type)
          );
        }
        return false;
      });
    }

    if (searchFilters.tags.length > 0) {
      items = items.filter(item => 
        item.tags.some(tag => searchFilters.tags.includes(tag))
      );
    }

    // Sort items
    items.sort((a, b) => {
      switch (sortMode) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'mostUsed':
          return b.times_used - a.times_used;
        case 'alphabetical':
          const nameA = ('user_title' in a) ? a.user_title || '' : a.name;
          const nameB = ('user_title' in b) ? b.user_title || '' : b.name;
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return items;
  }, [userReferences, userPalettes, activeTab, searchQuery, searchFilters, sortMode]);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Toggle favorite status using the new unified favorites system
  const toggleFavorite = async (item: ReferenceImage | ColorPalette) => {
    try {
      const itemType = 'user_title' in item ? 'reference_image' : 'color_palette';
      const itemId = item.id!;
      
      // Use the new favorites store
      const isFavorite = await favoritesStore.toggleFavorite(itemType, itemId);
      
      // Update local state for immediate UI feedback
      if ('user_title' in item) {
        setUserReferences(refs => refs.map(ref => 
          ref.id === item.id ? { ...ref, is_favorite: isFavorite } : ref
        ));
      } else {
        setUserPalettes(palettes => palettes.map(palette => 
          palette.id === item.id ? { ...palette, is_favorite: isFavorite } : palette
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status.');
    }
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedItems.size} item(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Separate references and palettes
              const selectedRefs = userReferences.filter(ref => selectedItems.has(ref.id));
              const selectedPalettes = userPalettes.filter(palette => selectedItems.has(palette.id!));

              // Delete in parallel
              const deletePromises = [
                ...selectedRefs.map(ref => referenceImageService.deleteReferenceImage(ref.id)),
                ...selectedPalettes.map(palette => colorExtractionService.deleteColorPalette(palette.id!))
              ];

              await Promise.all(deletePromises);

              // Update state
              setUserReferences(refs => refs.filter(ref => !selectedItems.has(ref.id)));
              setUserPalettes(palettes => palettes.filter(palette => !selectedItems.has(palette.id!)));
              
              setSelectedItems(new Set());
              setSelectionMode(false);

              Alert.alert('Success', `${selectedItems.size} item(s) deleted successfully.`);
            } catch (error) {
              console.error('Failed to delete items:', error);
              Alert.alert('Error', 'Failed to delete some items. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Export selected items to current project
  const exportToProject = () => {
    if (selectedItems.size === 0) return;

    const selectedRefs = userReferences.filter(ref => selectedItems.has(ref.id));
    const selectedPalettes = userPalettes.filter(palette => selectedItems.has(palette.id!));

    // Update journey store with selected items
    journeyStore.updateProjectWizard({
      selectedReferences: selectedRefs.map(ref => ref.id),
      selectedPalettes: selectedPalettes.map(palette => palette.id!),
    });

    // Update content store
    selectedRefs.forEach(ref => contentStore.toggleReferenceSelection(ref.id));
    selectedPalettes.forEach(palette => contentStore.togglePaletteSelection(palette.id!));

    setSelectionMode(false);
    setSelectedItems(new Set());

    Alert.alert('Success', `${selectedItems.size} item(s) added to your project.`);
  };

  // Render tab bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {[
          { key: 'all' as TabType, title: 'All Items', icon: 'grid' },
          { key: 'favorites' as TabType, title: 'Favorites', icon: 'heart' },
          { key: 'palettes' as TabType, title: 'Palettes', icon: 'color-palette' },
          { key: 'recent' as TabType, title: 'Recent', icon: 'time' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? tokens.color.textInverse : tokens.color.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render toolbar
  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <TouchableOpacity
          style={[styles.toolButton, showSearch && styles.activeToolButton]}
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={20} color={tokens.color.textPrimary} />
          {(searchFilters.spaceTypes.length > 0 || searchFilters.categories.length > 0 || searchFilters.tags.length > 0) && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowSortOptions(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarCenter}>
        <Text style={styles.itemCount}>
          {processedItems.length} item{processedItems.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.toolbarRight}>
        <TouchableOpacity
          style={[styles.toolButton, viewMode === 'grid' && styles.activeToolButton]}
          onPress={() => setViewMode('grid')}
          activeOpacity={0.7}
        >
          <Ionicons name="grid" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, viewMode === 'list' && styles.activeToolButton]}
          onPress={() => setViewMode('list')}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>

        {selectionMode ? (
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => {
              setSelectionMode(false);
              setSelectedItems(new Set());
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={tokens.color.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => setSelectionMode(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={tokens.color.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render search bar
  const renderSearchBar = () => {
    if (!showSearch) return null;

    return (
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={tokens.color.textMuted} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search references and palettes..."
            placeholderTextColor={tokens.color.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render reference image item
  const renderReferenceItem = (item: ReferenceImage, index: number) => {
    const isSelected = selectedItems.has(item.id);
    const imageUri = item.thumbnail_url || item.image_url;

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={[
            styles.gridItem,
            isSelected && styles.selectedGridItem,
            index % 2 === 1 && styles.gridItemRight
          ]}
          onPress={() => {
            if (selectionMode) {
              toggleItemSelection(item.id);
            } else {
              setEditingItem(item);
              setShowItemDetails(true);
            }
          }}
          onLongPress={() => {
            setSelectionMode(true);
            toggleItemSelection(item.id);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.referenceImage}
              resizeMode="cover"
            />
            
            {selectionMode && (
              <View style={styles.selectionOverlay}>
                <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
                  )}
                </View>
              </View>
            )}

            <FavoriteButton
              itemType="reference_image"
              itemId={item.id}
              size="small"
              showBackground={true}
              style={styles.favoriteButtonOverlay}
              onToggle={() => toggleFavorite(item)}
            />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.user_title || 'Untitled Reference'}
            </Text>
            <Text style={styles.itemMeta}>
              {item.space_types.join(', ') || 'No space type'}
            </Text>
            <View style={styles.itemStats}>
              <Text style={styles.statText}>Used {item.times_used} times</Text>
              {item.tags.length > 0 && (
                <Text style={styles.statText}>• {item.tags.length} tags</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // List view
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.selectedListItem]}
        onPress={() => {
          if (selectionMode) {
            toggleItemSelection(item.id);
          } else {
            setEditingItem(item);
            setShowItemDetails(true);
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleItemSelection(item.id);
        }}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.listItemImage}
          resizeMode="cover"
        />

        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {item.user_title || 'Untitled Reference'}
          </Text>
          <Text style={styles.listItemDescription} numberOfLines={2}>
            {item.user_description || item.ai_description || 'No description available'}
          </Text>
          <View style={styles.listItemMeta}>
            <Text style={styles.listMetaText}>
              {item.space_types.join(', ') || 'No space type'} • Used {item.times_used} times
            </Text>
          </View>
        </View>

        <View style={styles.listItemActions}>
          {selectionMode && (
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
              )}
            </View>
          )}
          
          <FavoriteButton
            itemType="reference_image"
            itemId={item.id}
            size="medium"
            onToggle={() => toggleFavorite(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Render color palette item
  const renderPaletteItem = (item: ColorPalette, index: number) => {
    const isSelected = selectedItems.has(item.id!);

    if (viewMode === 'grid') {
      return (
        <TouchableOpacity
          style={[
            styles.gridItem,
            isSelected && styles.selectedGridItem,
            index % 2 === 1 && styles.gridItemRight
          ]}
          onPress={() => {
            if (selectionMode) {
              toggleItemSelection(item.id!);
            } else {
              setEditingItem(item);
              setShowItemDetails(true);
            }
          }}
          onLongPress={() => {
            setSelectionMode(true);
            toggleItemSelection(item.id!);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.paletteContainer}>
            <View style={styles.paletteColors}>
              {item.colors.colors.slice(0, 5).map((color, colorIndex) => (
                <View
                  key={colorIndex}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
            </View>

            {selectionMode && (
              <View style={styles.selectionOverlay}>
                <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
                  )}
                </View>
              </View>
            )}

            <FavoriteButton
              itemType="color_palette"
              itemId={item.id!}
              size="small"
              showBackground={true}
              style={styles.favoriteButtonOverlay}
              onToggle={() => toggleFavorite(item)}
            />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.itemMeta}>
              {item.colors.harmony} • {item.color_temperature}
            </Text>
            <View style={styles.itemStats}>
              <Text style={styles.statText}>Used {item.times_used} times</Text>
              {item.tags.length > 0 && (
                <Text style={styles.statText}>• {item.tags.length} tags</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // List view for palettes
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.selectedListItem]}
        onPress={() => {
          if (selectionMode) {
            toggleItemSelection(item.id!);
          } else {
            setEditingItem(item);
            setShowItemDetails(true);
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleItemSelection(item.id!);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.listPalettePreview}>
          {item.colors.colors.slice(0, 4).map((color, colorIndex) => (
            <View
              key={colorIndex}
              style={[styles.listColorSwatch, { backgroundColor: color }]}
            />
          ))}
        </View>

        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.listItemDescription} numberOfLines={2}>
            {item.description || `${item.colors.harmony} color harmony`}
          </Text>
          <View style={styles.listItemMeta}>
            <Text style={styles.listMetaText}>
              {item.color_temperature} • Used {item.times_used} times
            </Text>
          </View>
        </View>

        <View style={styles.listItemActions}>
          {selectionMode && (
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
              )}
            </View>
          )}
          
          <FavoriteButton
            itemType="color_palette"
            itemId={item.id!}
            size="medium"
            onToggle={() => toggleFavorite(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="library-outline" 
        size={64} 
        color={tokens.color.textMuted} 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'favorites' ? 'No favorites yet' : 
         activeTab === 'palettes' ? 'No palettes saved' :
         activeTab === 'recent' ? 'No recent items' : 'Your library is empty'}
      </Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'favorites' ? 'Heart items to add them to your favorites' : 
         activeTab === 'palettes' ? 'Create color palettes from your reference images' :
         activeTab === 'recent' ? 'Items you use will appear here' : 'Start by uploading reference images and creating color palettes'}
      </Text>
      
      {(activeTab === 'all' || activeTab === 'palettes') && (
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={() => navigation?.navigate('references')}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyActionText}>Add References</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render selection toolbar
  const renderSelectionToolbar = () => {
    if (!selectionMode || selectedItems.size === 0) return null;

    return (
      <View style={styles.selectionToolbar}>
        <Text style={styles.selectionCount}>
          {selectedItems.size} selected
        </Text>
        
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={exportToProject}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={tokens.color.brand} />
            <Text style={styles.selectionButtonText}>Add to Project</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={deleteSelectedItems}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={tokens.color.error} />
            <Text style={[styles.selectionButtonText, { color: tokens.color.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Reference Library</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation?.navigate('references')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Toolbar */}
      {renderToolbar()}

      {/* Search Bar */}
      {renderSearchBar()}

      {/* Favorites Stats */}
      {!isLoading && processedItems.length > 0 && (
        <View style={styles.statsContainer}>
          <FavoritesStats 
            showDetailedView={false}
            onCategoryPress={(category) => {
              // Navigate to filtered view based on category
              if (category === 'referenceImages') {
                setActiveTab('all');
              } else if (category === 'colorPalettes') {
                setActiveTab('palettes');
              }
            }}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your library...</Text>
          </View>
        ) : processedItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={processedItems}
            renderItem={({ item, index }) => {
              if ('user_title' in item) {
                return renderReferenceItem(item as ReferenceImage, index);
              } else {
                return renderPaletteItem(item as ColorPalette, index);
              }
            }}
            keyExtractor={(item) => ('user_title' in item) ? item.id : item.id!}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[tokens.color.brand]}
                tintColor={tokens.color.brand}
              />
            }
          />
        )}
      </View>

      {/* Selection Toolbar */}
      {renderSelectionToolbar()}
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
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
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
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  tabScroll: {
    flexGrow: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    marginHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
  },
  activeTab: {
    backgroundColor: tokens.color.accent,
  },
  tabText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
  },
  activeTabText: {
    color: tokens.color.textInverse,
    fontWeight: '600',
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xs,
  },
  activeToolButton: {
    backgroundColor: tokens.color.brand,
  },
  filterIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.brand,
  },
  itemCount: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },

  // Search Bar
  searchBar: {
    backgroundColor: tokens.color.surface,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing.lg,
    height: 44,
  },
  searchTextInput: {
    flex: 1,
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },

  // Content
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
  },
  listContent: {
    padding: tokens.spacing.lg,
  },

  // Grid View
  gridItem: {
    width: (width - tokens.spacing.xl * 2 - tokens.spacing.lg) / 2,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  gridItemRight: {
    marginLeft: tokens.spacing.lg,
  },
  selectedGridItem: {
    borderWidth: 2,
    borderColor: tokens.color.brand,
  },

  // Image Container
  imageContainer: {
    position: 'relative',
    height: 150,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  referenceImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
  },

  // Palette Container
  paletteContainer: {
    position: 'relative',
    height: 150,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  paletteColors: {
    flexDirection: 'row',
    height: '100%',
  },
  colorSwatch: {
    flex: 1,
  },

  // Item Info
  itemInfo: {
    padding: tokens.spacing.lg,
  },
  itemTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  itemMeta: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  itemStats: {
    flexDirection: 'row',
  },
  statText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },

  // List View
  listItem: {
    flexDirection: 'row',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e1,
    overflow: 'hidden',
  },
  selectedListItem: {
    borderWidth: 2,
    borderColor: tokens.color.brand,
  },
  listItemImage: {
    width: 80,
    height: 80,
  },
  listPalettePreview: {
    width: 80,
    height: 80,
    flexDirection: 'row',
  },
  listColorSwatch: {
    flex: 1,
  },
  listItemInfo: {
    flex: 1,
    padding: tokens.spacing.lg,
    justifyContent: 'center',
  },
  listItemTitle: {
    ...tokens.type.body,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  listItemDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  listItemMeta: {
    marginTop: 'auto',
  },
  listMetaText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  listItemActions: {
    padding: tokens.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listFavoriteButton: {
    marginTop: tokens.spacing.sm,
  },

  // Selection
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: tokens.color.textInverse,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
  },

  // Selection Toolbar
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
  },
  selectionCount: {
    ...tokens.type.body,
    fontWeight: '600',
    color: tokens.color.textPrimary,
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    marginLeft: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.bgApp,
  },
  selectionButtonText: {
    ...tokens.type.small,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.sm,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xxxl,
  },
  emptyTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
  },
  emptyDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  emptyAction: {
    backgroundColor: tokens.color.accent,
    paddingHorizontal: tokens.spacing.xxl,
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.pill,
  },
  emptyActionText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
});

export default ReferenceLibraryScreen;