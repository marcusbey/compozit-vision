import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

// Services and stores
import { useJourneyStore } from '../../stores/journeyStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { colorExtractionService, type ColorPalette, type DominantColors } from '../../services/colorExtractionService';
import { referenceImageService } from '../../services/referenceImageService';
import { FavoriteButton } from '../../components/FavoriteButton';

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
    info: "#2196F3",
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
type SortMode = 'newest' | 'oldest' | 'mostUsed' | 'alphabetical' | 'temperature' | 'brightness';
type FilterType = 'all' | 'extracted' | 'created' | 'preset';

interface PaletteFilters {
  temperature?: 'warm' | 'cool' | 'neutral';
  brightness?: 'dark' | 'medium' | 'light';
  saturation?: 'muted' | 'moderate' | 'vibrant';
  sourceType?: FilterType;
}

interface MyPalettesScreenProps {
  navigation?: any;
  route?: any;
}

interface CreatePaletteModalState {
  visible: boolean;
  name: string;
  description: string;
  colors: string[];
  sourceImageUri?: string;
}

interface PaletteDetailsModalState {
  visible: boolean;
  palette: ColorPalette | null;
}

const MyPalettesScreen: React.FC<MyPalettesScreenProps> = ({ navigation, route }) => {
  // State management
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [filteredPalettes, setFilteredPalettes] = useState<ColorPalette[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [filters, setFilters] = useState<PaletteFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPalettes, setSelectedPalettes] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  
  // Modals
  const [createPaletteModal, setCreatePaletteModal] = useState<CreatePaletteModalState>({
    visible: false,
    name: '',
    description: '',
    colors: [],
    sourceImageUri: undefined,
  });
  
  const [paletteDetailsModal, setPaletteDetailsModal] = useState<PaletteDetailsModalState>({
    visible: false,
    palette: null,
  });

  // Stores
  const journeyStore = useJourneyStore();
  const favoritesStore = useFavoritesStore();

  // Load palettes on screen focus
  useFocusEffect(
    useCallback(() => {
      loadPalettes();
    }, [])
  );

  // Load user's palettes
  const loadPalettes = async () => {
    try {
      setIsLoading(true);
      const userPalettes = await colorExtractionService.getUserColorPalettes();
      setPalettes(userPalettes);
      filterAndSortPalettes(userPalettes, searchQuery, filters, sortMode);
    } catch (error) {
      console.error('Failed to load palettes:', error);
      Alert.alert('Error', 'Failed to load your color palettes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPalettes();
    setIsRefreshing(false);
  };

  // Filter and sort palettes
  const filterAndSortPalettes = (
    allPalettes: ColorPalette[], 
    search: string, 
    activeFilters: PaletteFilters, 
    sort: SortMode
  ) => {
    let filtered = [...allPalettes];

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(palette => 
        palette.name.toLowerCase().includes(searchLower) ||
        palette.description?.toLowerCase().includes(searchLower) ||
        palette.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        palette.mood_tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (activeFilters.temperature) {
      filtered = filtered.filter(palette => palette.color_temperature === activeFilters.temperature);
    }
    if (activeFilters.brightness) {
      filtered = filtered.filter(palette => palette.brightness_level === activeFilters.brightness);
    }
    if (activeFilters.saturation) {
      filtered = filtered.filter(palette => palette.saturation_level === activeFilters.saturation);
    }
    if (activeFilters.sourceType && activeFilters.sourceType !== 'all') {
      filtered = filtered.filter(palette => palette.source_type === activeFilters.sourceType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'mostUsed':
          return b.times_used - a.times_used;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'temperature':
          const tempOrder = { warm: 0, neutral: 1, cool: 2 };
          return tempOrder[a.color_temperature] - tempOrder[b.color_temperature];
        case 'brightness':
          const brightOrder = { dark: 0, medium: 1, light: 2 };
          return brightOrder[a.brightness_level] - brightOrder[b.brightness_level];
        default:
          return 0;
      }
    });

    setFilteredPalettes(filtered);
  };

  // Handle search changes
  useEffect(() => {
    filterAndSortPalettes(palettes, searchQuery, filters, sortMode);
  }, [palettes, searchQuery, filters, sortMode]);

  // Toggle palette selection
  const togglePaletteSelection = (paletteId: string) => {
    const newSelection = new Set(selectedPalettes);
    if (newSelection.has(paletteId)) {
      newSelection.delete(paletteId);
    } else {
      newSelection.add(paletteId);
    }
    setSelectedPalettes(newSelection);
  };

  // Apply selected palettes to project
  const applyToProject = () => {
    if (selectedPalettes.size === 0) return;

    const selectedPalettesList = palettes.filter(palette => 
      selectedPalettes.has(palette.id!)
    );

    // Update journey store
    journeyStore.updateProjectWizard({
      selectedPalettes: Array.from(selectedPalettes),
    });

    setSelectionMode(false);
    setSelectedPalettes(new Set());

    Alert.alert(
      'Success', 
      `${selectedPalettes.size} palette(s) added to your project.`,
      [
        { text: 'Continue', style: 'default' },
        { 
          text: 'Go to Project', 
          onPress: () => navigation?.navigate('aiProcessing')
        }
      ]
    );
  };

  // Delete selected palettes
  const deleteSelectedPalettes = async () => {
    if (selectedPalettes.size === 0) return;

    Alert.alert(
      'Delete Palettes',
      `Are you sure you want to delete ${selectedPalettes.size} palette(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const deletePromises = Array.from(selectedPalettes).map(id =>
                colorExtractionService.deleteColorPalette(id)
              );
              
              await Promise.all(deletePromises);

              setPalettes(prevPalettes => 
                prevPalettes.filter(palette => !selectedPalettes.has(palette.id!))
              );

              setSelectedPalettes(new Set());
              setSelectionMode(false);

              Alert.alert('Success', `${selectedPalettes.size} palette(s) deleted successfully.`);
            } catch (error) {
              console.error('Failed to delete palettes:', error);
              Alert.alert('Error', 'Failed to delete some palettes. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Create palette from scratch
  const createManualPalette = async () => {
    const { name, description, colors } = createPaletteModal;

    if (!name.trim() || colors.length < 2) {
      Alert.alert('Invalid Palette', 'Please provide a name and at least 2 colors.');
      return;
    }

    try {
      // Generate dominant colors structure
      const dominantColors: DominantColors = {
        primary: colors[0],
        secondary: colors[1],
        palette: colors,
        harmony: colorExtractionService.analyzeColor(colors[0]).harmony,
        temperature: colorExtractionService.analyzeColor(colors[0]).temperature,
        brightness: colorExtractionService.analyzeColor(colors[0]).brightness,
        saturation: colorExtractionService.analyzeColor(colors[0]).saturation,
      };

      const newPalette = await colorExtractionService.createColorPalette(
        'user-id', // This should come from auth
        name,
        dominantColors,
        {
          description,
          tags: ['manual', 'custom'],
        }
      );

      setPalettes([newPalette, ...palettes]);
      setCreatePaletteModal({
        visible: false,
        name: '',
        description: '',
        colors: [],
        sourceImageUri: undefined,
      });

      Alert.alert('Success', 'Color palette created successfully!');
    } catch (error) {
      console.error('Failed to create palette:', error);
      Alert.alert('Error', 'Failed to create color palette. Please try again.');
    }
  };

  // Extract palette from image
  const extractPaletteFromImage = async () => {
    try {
      const result = await referenceImageService.pickFromGallery({
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Extract colors
        const extractedColors = await colorExtractionService.extractColorsFromImage(imageUri);
        
        // Pre-fill the create modal with extracted colors
        setCreatePaletteModal({
          visible: true,
          name: `Palette from ${new Date().toLocaleDateString()}`,
          description: 'Extracted from uploaded image',
          colors: extractedColors.palette.slice(0, 6), // Limit to 6 colors
          sourceImageUri: imageUri,
        });
      }
    } catch (error) {
      console.error('Failed to extract palette from image:', error);
      Alert.alert('Error', 'Failed to extract colors from image. Please try again.');
    }
  };

  // Copy color to clipboard
  const copyColorToClipboard = async (color: string) => {
    await Clipboard.setStringAsync(color);
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Copied', `Color ${color} copied to clipboard!`);
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>My Palettes</Text>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setCreatePaletteModal({ ...createPaletteModal, visible: true })}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new palette"
      >
        <Ionicons name="add" size={24} color={tokens.color.textPrimary} />
      </TouchableOpacity>
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
          accessibilityRole="button"
          accessibilityLabel="Toggle search"
        >
          <Ionicons name="search" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, showFilters && styles.activeToolButton]}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle filters"
        >
          <Ionicons name="filter" size={20} color={tokens.color.textPrimary} />
          {Object.keys(filters).length > 0 && <View style={styles.filterIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarCenter}>
        <Text style={styles.itemCount}>{filteredPalettes.length} palettes</Text>
      </View>

      <View style={styles.toolbarRight}>
        <TouchableOpacity
          style={styles.toolButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sort options"
        >
          <Ionicons name="swap-vertical" size={20} color={tokens.color.textPrimary} />
        </TouchableOpacity>
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
            placeholder="Search palettes..."
            placeholderTextColor={tokens.color.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render filters
  const renderFilters = () => {
    if (!showFilters) return null;

    const filterOptions = {
      temperature: ['warm', 'cool', 'neutral'] as const,
      brightness: ['dark', 'medium', 'light'] as const,
      saturation: ['muted', 'moderate', 'vibrant'] as const,
      sourceType: ['all', 'extracted', 'created', 'preset'] as const,
    };

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {Object.entries(filterOptions).map(([key, values]) => (
          <View key={key} style={styles.filterGroup}>
            <Text style={styles.filterLabel}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
            <View style={styles.filterOptions}>
              {values.map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.filterOption,
                    filters[key as keyof PaletteFilters] === value && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    const newFilters = { ...filters };
                    if (newFilters[key as keyof PaletteFilters] === value) {
                      delete newFilters[key as keyof PaletteFilters];
                    } else {
                      (newFilters as any)[key] = value;
                    }
                    setFilters(newFilters);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters[key as keyof PaletteFilters] === value && styles.activeFilterOptionText
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render palette item
  const renderPaletteItem = ({ item, index }: { item: ColorPalette; index: number }) => {
    const isSelected = selectedPalettes.has(item.id!);

    return (
      <TouchableOpacity
        style={[
          styles.paletteCard,
          isSelected && styles.selectedPaletteCard
        ]}
        onPress={() => {
          if (selectionMode) {
            togglePaletteSelection(item.id!);
          } else {
            setPaletteDetailsModal({ visible: true, palette: item });
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          togglePaletteSelection(item.id!);
          if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        activeOpacity={0.8}
      >
        {/* Color swatches */}
        <View style={styles.colorSwatches}>
          {item.colors.colors.slice(0, 6).map((color, colorIndex) => (
            <TouchableOpacity
              key={colorIndex}
              style={[styles.colorSwatch, { backgroundColor: color }]}
              onPress={() => copyColorToClipboard(color)}
              activeOpacity={0.8}
              accessibilityLabel={`Color ${colorIndex + 1}: ${color}`}
            />
          ))}
        </View>

        {/* Palette info */}
        <View style={styles.paletteInfo}>
          <View style={styles.paletteHeader}>
            <Text style={styles.paletteName} numberOfLines={1}>
              {item.name}
            </Text>
            <FavoriteButton
              itemType="color_palette"
              itemId={item.id!}
              size="small"
            />
          </View>
          
          {item.description && (
            <Text style={styles.paletteDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.paletteMeta}>
            <View style={styles.metaItem}>
              <Ionicons 
                name="thermometer-outline" 
                size={14} 
                color={tokens.color.textMuted} 
              />
              <Text style={styles.metaText}>{item.color_temperature}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons 
                name="sunny-outline" 
                size={14} 
                color={tokens.color.textMuted} 
              />
              <Text style={styles.metaText}>{item.brightness_level}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons 
                name="color-filter-outline" 
                size={14} 
                color={tokens.color.textMuted} 
              />
              <Text style={styles.metaText}>{item.colors.harmony}</Text>
            </View>
          </View>

          {item.tags.length > 0 && (
            <View style={styles.tagsList}>
              {item.tags.slice(0, 3).map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{item.tags.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.paletteStats}>
            <Text style={styles.statsText}>
              Used {item.times_used} times
            </Text>
            {item.popularity_score > 0 && (
              <Text style={styles.statsText}>
                • {item.popularity_score}% popular
              </Text>
            )}
          </View>
        </View>

        {/* Selection indicator */}
        {selectionMode && (
          <View style={styles.selectionIndicator}>
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="color-palette-outline" 
        size={64} 
        color={tokens.color.textMuted} 
      />
      <Text style={styles.emptyTitle}>No palettes yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first color palette to get started
      </Text>
      
      <View style={styles.emptyActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCreatePaletteModal({ ...createPaletteModal, visible: true })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={tokens.color.textInverse} />
          <Text style={styles.primaryButtonText}>Create Palette</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={extractPaletteFromImage}
          activeOpacity={0.8}
        >
          <Ionicons name="image" size={20} color={tokens.color.brand} />
          <Text style={styles.secondaryButtonText}>Extract from Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render selection toolbar
  const renderSelectionToolbar = () => {
    if (!selectionMode || selectedPalettes.size === 0) return null;

    return (
      <View style={styles.selectionToolbar}>
        <TouchableOpacity
          onPress={() => {
            setSelectionMode(false);
            setSelectedPalettes(new Set());
          }}
          accessibilityRole="button"
          accessibilityLabel="Cancel selection"
        >
          <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.selectionCount}>
          {selectedPalettes.size} selected
        </Text>
        
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={applyToProject}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={tokens.color.brand} />
            <Text style={styles.selectionButtonText}>Apply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={deleteSelectedPalettes}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={tokens.color.error} />
            <Text style={[styles.selectionButtonText, { color: tokens.color.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render create palette modal
  const renderCreatePaletteModal = () => (
    <Modal
      visible={createPaletteModal.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setCreatePaletteModal({ ...createPaletteModal, visible: false })}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setCreatePaletteModal({ ...createPaletteModal, visible: false })}
            activeOpacity={0.8}
          >
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Create Palette</Text>
          
          <TouchableOpacity
            onPress={createManualPalette}
            activeOpacity={0.8}
            disabled={!createPaletteModal.name.trim() || createPaletteModal.colors.length < 2}
          >
            <Text style={[
              styles.modalSave,
              (!createPaletteModal.name.trim() || createPaletteModal.colors.length < 2) && styles.modalSaveDisabled
            ]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
          {/* Palette name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Sunset Vibes"
              placeholderTextColor={tokens.color.textMuted}
              value={createPaletteModal.name}
              onChangeText={name => setCreatePaletteModal({ ...createPaletteModal, name })}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe this palette..."
              placeholderTextColor={tokens.color.textMuted}
              value={createPaletteModal.description}
              onChangeText={description => setCreatePaletteModal({ ...createPaletteModal, description })}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Source image preview */}
          {createPaletteModal.sourceImageUri && (
            <View style={styles.sourceImageContainer}>
              <Text style={styles.inputLabel}>Source Image</Text>
              <Image
                source={{ uri: createPaletteModal.sourceImageUri }}
                style={styles.sourceImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Color selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Colors ({createPaletteModal.colors.length}/6) *
            </Text>
            <Text style={styles.inputHint}>Tap a color to edit or remove</Text>
            
            <View style={styles.colorGrid}>
              {createPaletteModal.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorGridItem, { backgroundColor: color }]}
                  onPress={() => {
                    // Remove color
                    const newColors = createPaletteModal.colors.filter((_, i) => i !== index);
                    setCreatePaletteModal({ ...createPaletteModal, colors: newColors });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              ))}
              
              {createPaletteModal.colors.length < 6 && (
                <TouchableOpacity
                  style={[styles.colorGridItem, styles.addColorButton]}
                  onPress={() => {
                    // Add random color for demo - in production, use color picker
                    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
                    setCreatePaletteModal({
                      ...createPaletteModal,
                      colors: [...createPaletteModal.colors, randomColor]
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={24} color={tokens.color.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={extractPaletteFromImage}
              activeOpacity={0.8}
            >
              <Ionicons name="image" size={20} color={tokens.color.brand} />
              <Text style={styles.quickActionText}>Extract from Image</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Render palette details modal
  const renderPaletteDetailsModal = () => {
    const { palette } = paletteDetailsModal;
    if (!palette) return null;

    return (
      <Modal
        visible={paletteDetailsModal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPaletteDetailsModal({ visible: false, palette: null })}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setPaletteDetailsModal({ visible: false, palette: null })}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{palette.name}</Text>
            
            <FavoriteButton
              itemType="color_palette"
              itemId={palette.id!}
              size="medium"
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Large color display */}
            <View style={styles.paletteDisplay}>
              {palette.colors.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.paletteDisplayColor, { backgroundColor: color }]}
                  onPress={() => copyColorToClipboard(color)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.colorHex}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Palette details */}
            <View style={styles.detailsSection}>
              {palette.description && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{palette.description}</Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Properties</Text>
                <View style={styles.propertiesGrid}>
                  <View style={styles.propertyItem}>
                    <Ionicons name="thermometer" size={20} color={tokens.color.textMuted} />
                    <Text style={styles.propertyText}>{palette.color_temperature}</Text>
                  </View>
                  <View style={styles.propertyItem}>
                    <Ionicons name="sunny" size={20} color={tokens.color.textMuted} />
                    <Text style={styles.propertyText}>{palette.brightness_level}</Text>
                  </View>
                  <View style={styles.propertyItem}>
                    <Ionicons name="contrast" size={20} color={tokens.color.textMuted} />
                    <Text style={styles.propertyText}>{palette.saturation_level}</Text>
                  </View>
                  <View style={styles.propertyItem}>
                    <Ionicons name="color-filter" size={20} color={tokens.color.textMuted} />
                    <Text style={styles.propertyText}>{palette.colors.harmony}</Text>
                  </View>
                </View>
              </View>

              {palette.style_compatibility.length > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Compatible Styles</Text>
                  <View style={styles.tagsList}>
                    {palette.style_compatibility.map((style, index) => (
                      <View key={index} style={styles.compatibilityTag}>
                        <Text style={styles.compatibilityTagText}>{style}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {palette.mood_tags.length > 0 && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Mood</Text>
                  <View style={styles.tagsList}>
                    {palette.mood_tags.map((mood, index) => (
                      <View key={index} style={styles.moodTag}>
                        <Text style={styles.moodTagText}>{mood}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Usage</Text>
                <Text style={styles.detailValue}>
                  Used {palette.times_used} times • Created {new Date(palette.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  journeyStore.updateProjectWizard({
                    selectedPalettes: [palette.id!],
                  });
                  setPaletteDetailsModal({ visible: false, palette: null });
                  navigation?.navigate('aiProcessing');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="brush" size={20} color={tokens.color.textInverse} />
                <Text style={styles.primaryButtonText}>Use in Project</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={async () => {
                  // Copy all colors to clipboard as JSON
                  const colorsJson = JSON.stringify(palette.colors.colors, null, 2);
                  await Clipboard.setStringAsync(colorsJson);
                  Alert.alert('Copied', 'All colors copied to clipboard!');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="copy" size={20} color={tokens.color.brand} />
                <Text style={styles.secondaryButtonText}>Copy All Colors</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      {renderHeader()}
      {renderToolbar()}
      {renderSearchBar()}
      {renderFilters()}
      {renderSelectionToolbar()}

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your palettes...</Text>
          </View>
        ) : filteredPalettes.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredPalettes}
            renderItem={renderPaletteItem}
            keyExtractor={(item) => item.id!}
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
            testID="palettes-list"
          />
        )}
      </View>

      {/* Quick action FAB */}
      {!isLoading && filteredPalettes.length > 0 && !selectionMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCreatePaletteModal({ ...createPaletteModal, visible: true })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[tokens.color.brand, tokens.color.brandHover]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color={tokens.color.textInverse} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modals */}
      {renderCreatePaletteModal()}
      {renderPaletteDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Search
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

  // Filters
  filtersContainer: {
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    maxHeight: 120,
  },
  filtersContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
  },
  filterGroup: {
    marginRight: tokens.spacing.xl,
  },
  filterLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.bgApp,
    marginRight: tokens.spacing.sm,
  },
  activeFilterOption: {
    backgroundColor: tokens.color.brand,
  },
  filterOptionText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
  },
  activeFilterOptionText: {
    color: tokens.color.textInverse,
  },

  // Content
  content: {
    flex: 1,
  },
  listContent: {
    padding: tokens.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.lg,
  },

  // Palette card
  paletteCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
    overflow: 'hidden',
  },
  selectedPaletteCard: {
    borderWidth: 2,
    borderColor: tokens.color.brand,
  },
  colorSwatches: {
    flexDirection: 'row',
    height: 80,
  },
  colorSwatch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorHex: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    backgroundColor: tokens.color.scrim,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  paletteInfo: {
    padding: tokens.spacing.lg,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  paletteName: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    flex: 1,
    marginRight: tokens.spacing.md,
  },
  paletteDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  paletteMeta: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  metaText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.xs,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: tokens.spacing.sm,
  },
  tag: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.borderSoft,
    marginRight: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  tagText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  paletteStats: {
    flexDirection: 'row',
  },
  statsText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },

  // Selection
  selectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.lg,
    right: tokens.spacing.lg,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.color.brand,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    backgroundColor: tokens.color.brand,
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  selectionCount: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    marginLeft: tokens.spacing.md,
  },
  selectionButtonText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.xs,
    fontWeight: '500',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xxxl,
  },
  emptyTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.xl,
  },
  emptyDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.xxl,
  },
  emptyActions: {
    gap: tokens.spacing.md,
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.xl,
    height: 48,
    ...tokens.shadow.e2,
  },
  primaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    marginLeft: tokens.spacing.sm,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.color.brand,
    paddingHorizontal: tokens.spacing.xl,
    height: 48,
  },
  secondaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.sm,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: tokens.spacing.xxl,
    right: tokens.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...tokens.shadow.e3,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  modalCancel: {
    ...tokens.type.body,
    color: tokens.color.brand,
  },
  modalTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  modalSave: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
  },
  modalSaveDisabled: {
    color: tokens.color.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: tokens.spacing.xl,
  },
  modalActions: {
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.xxl,
  },

  // Inputs
  inputGroup: {
    marginBottom: tokens.spacing.xl,
  },
  inputLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
    fontWeight: '500',
  },
  inputHint: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  textInput: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Color grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  colorGridItem: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  addColorButton: {
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    borderStyle: 'dashed',
  },

  // Source image
  sourceImageContainer: {
    marginBottom: tokens.spacing.xl,
  },
  sourceImage: {
    width: '100%',
    height: 200,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.borderSoft,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: tokens.spacing.xl,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  quickActionText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.sm,
  },

  // Palette display
  paletteDisplay: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginBottom: tokens.spacing.xxl,
    ...tokens.shadow.e2,
  },
  paletteDisplayColor: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Details
  detailsSection: {
    gap: tokens.spacing.xl,
  },
  detailItem: {
    gap: tokens.spacing.sm,
  },
  detailLabel: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.lg,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  propertyText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  compatibilityTag: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.brand + '20',
    marginRight: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  compatibilityTagText: {
    ...tokens.type.small,
    color: tokens.color.brand,
  },
  moodTag: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.info + '20',
    marginRight: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  moodTagText: {
    ...tokens.type.small,
    color: tokens.color.info,
  },
});

export default MyPalettesScreen;