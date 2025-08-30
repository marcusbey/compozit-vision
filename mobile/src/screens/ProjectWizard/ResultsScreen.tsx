import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Share,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useJourneyStore } from '../../stores/journeyStore';
import { useProjectStore } from '../../stores/projectStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DesignResult {
  id: string;
  originalImage: string;
  enhancedImage: string;
  style: string;
  confidence: number;
  estimatedCost: number;
  furnitureItems: FurnitureItem[];
  designNotes: string[];
  colorPalette: string[];
}

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  vendor: string;
  inStock: boolean;
}

const SAMPLE_RESULT: DesignResult = {
  id: 'design_001',
  originalImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  enhancedImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  style: 'Modern Minimalist',
  confidence: 0.92,
  estimatedCost: 2850,
  furnitureItems: [
    {
      id: 'f1',
      name: 'Modern Sectional Sofa',
      category: 'Seating',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      vendor: 'West Elm',
      inStock: true,
    },
    {
      id: 'f2',
      name: 'Glass Coffee Table',
      category: 'Tables',
      price: 449,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      vendor: 'CB2',
      inStock: true,
    },
    {
      id: 'f3',
      name: 'Floor Lamp',
      category: 'Lighting',
      price: 199,
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200',
      vendor: 'IKEA',
      inStock: false,
    },
  ],
  designNotes: [
    'Added warm lighting to create a cozy atmosphere',
    'Selected neutral colors to maximize space perception',
    'Incorporated natural materials for texture contrast',
    'Optimized furniture placement for better flow',
  ],
  colorPalette: ['#F5F5F5', '#E8E2D8', '#C9A98C', '#B9906F', '#8B7355'],
};

export const ResultsScreen: React.FC = () => {
  const journeyStore = useJourneyStore();
  const projectStore = useProjectStore();
  
  const [designResult] = useState<DesignResult>(SAMPLE_RESULT);
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'enhanced'>('split');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  
  // Split view slider state
  const sliderPosition = useRef(new Animated.Value(0.5)).current;
  const [sliderValue, setSliderValue] = useState(0.5);

  useEffect(() => {
    // Mark journey as completed
    journeyStore.updateProgress('results', 11, 11);
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      sliderPosition.setOffset(sliderValue);
    },
    onPanResponderMove: (_, gestureState) => {
      const newValue = Math.max(0.1, Math.min(0.9, sliderValue + gestureState.dx / screenWidth));
      sliderPosition.setValue(newValue - sliderValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      const newValue = Math.max(0.1, Math.min(0.9, sliderValue + gestureState.dx / screenWidth));
      setSliderValue(newValue);
      sliderPosition.flattenOffset();
      sliderPosition.setValue(newValue);
    },
  });

  const handleSaveToProject = async () => {
    try {
      setIsLoading(true);
      
      // Create project with the design result
      await projectStore.createProject({
        name: `${designResult.style} Design`,
        style: designResult.style,
        estimatedCost: designResult.estimatedCost,
        designImageUrl: designResult.enhancedImage,
        originalImageUrl: designResult.originalImage,
        furnitureItems: designResult.furnitureItems,
        colorPalette: designResult.colorPalette,
      });
      
      Alert.alert(
        'Saved Successfully!',
        'Your design has been saved to your projects.',
        [
          {
            text: 'View Projects',
            onPress: () => NavigationHelpers.navigateToScreen('myProjects')
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
      
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('Save Failed', 'Unable to save your design. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareDesign = async () => {
    try {
      const result = await Share.share({
        message: `Check out my new ${designResult.style} design created with Compozit! 🏠✨`,
        url: designResult.enhancedImage, // In real app, this would be a shareable link
        title: 'My Interior Design',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleStartNewDesign = () => {
    Alert.alert(
      'Start New Design?',
      'This will take you through the design process again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start New',
          onPress: () => {
            journeyStore.resetJourney();
            NavigationHelpers.navigateToScreen('welcome');
          }
        }
      ]
    );
  };

  const handleFurnitureSelect = (furnitureId: string) => {
    setSelectedFurniture(prev => 
      prev.includes(furnitureId)
        ? prev.filter(id => id !== furnitureId)
        : [...prev, furnitureId]
    );
  };

  const getTotalSelectedPrice = () => {
    return designResult.furnitureItems
      .filter(item => selectedFurniture.includes(item.id))
      .reduce((total, item) => total + item.price, 0);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => NavigationHelpers.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color={tokens.color.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Your Design</Text>
        <View style={styles.confidenceScore}>
          <Ionicons name="checkmark-circle" size={16} color={tokens.color.success} />
          <Text style={styles.confidenceText}>
            {Math.round(designResult.confidence * 100)}% Match
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShareDesign}
      >
        <Ionicons name="share-outline" size={24} color={tokens.color.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderViewModeToggle = () => (
    <View style={styles.viewModeToggle}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.viewModeButton, viewMode === 'original' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('original')}
      >
        <Text style={[styles.viewModeButtonText, viewMode === 'original' && styles.viewModeButtonTextActive]}>
          Original
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.viewModeButton, viewMode === 'split' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('split')}
      >
        <Text style={[styles.viewModeButtonText, viewMode === 'split' && styles.viewModeButtonTextActive]}>
          Compare
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.viewModeButton, viewMode === 'enhanced' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('enhanced')}
      >
        <Text style={[styles.viewModeButtonText, viewMode === 'enhanced' && styles.viewModeButtonTextActive]}>
          Enhanced
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderImageComparison = () => {
    const imageHeight = screenWidth * 0.75; // 4:3 aspect ratio

    if (viewMode === 'original') {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: designResult.originalImage }}
            style={[styles.fullImage, { height: imageHeight }]}
            resizeMode="cover"
          />
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>Original</Text>
          </View>
        </View>
      );
    }

    if (viewMode === 'enhanced') {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: designResult.enhancedImage }}
            style={[styles.fullImage, { height: imageHeight }]}
            resizeMode="cover"
          />
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>Enhanced</Text>
          </View>
        </View>
      );
    }

    // Split view
    return (
      <View style={[styles.splitContainer, { height: imageHeight }]}>
        {/* Original Image */}
        <Animated.View
          style={[
            styles.splitImage,
            {
              width: sliderPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenWidth],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Image 
            source={{ uri: designResult.originalImage }}
            style={[styles.fullImage, { height: imageHeight }]}
            resizeMode="cover"
          />
          <View style={[styles.imageLabel, styles.originalLabel]}>
            <Text style={styles.imageLabelText}>Original</Text>
          </View>
        </Animated.View>

        {/* Enhanced Image */}
        <View style={[styles.splitImage, styles.enhancedImageContainer]}>
          <Image 
            source={{ uri: designResult.enhancedImage }}
            style={[styles.fullImage, { height: imageHeight }]}
            resizeMode="cover"
          />
          <View style={[styles.imageLabel, styles.enhancedLabel]}>
            <Text style={styles.imageLabelText}>Enhanced</Text>
          </View>
        </View>

        {/* Slider Handle */}
        <Animated.View
          style={[
            styles.sliderHandle,
            {
              left: sliderPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, screenWidth - 20],
                extrapolate: 'clamp',
              }),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderLine} />
          <View style={styles.sliderButton}>
            <Ionicons name="swap-horizontal" size={16} color={tokens.color.textInverse} />
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderDesignDetails = () => (
    <View style={styles.detailsSection}>
      <View style={styles.detailsHeader}>
        <Text style={styles.sectionTitle}>Design Details</Text>
        <View style={styles.styleTag}>
          <Text style={styles.styleTagText}>{designResult.style}</Text>
        </View>
      </View>

      <View style={styles.costSection}>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Estimated Total Cost:</Text>
          <Text style={styles.costAmount}>${designResult.estimatedCost.toLocaleString()}</Text>
        </View>
      </View>

      {/* Color Palette */}
      <View style={styles.colorPaletteSection}>
        <Text style={styles.subsectionTitle}>Color Palette</Text>
        <View style={styles.colorPalette}>
          {designResult.colorPalette.map((color, index) => (
            <View
              key={index}
              style={[styles.colorSwatch, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>

      {/* Design Notes */}
      <View style={styles.designNotesSection}>
        <Text style={styles.subsectionTitle}>Design Changes</Text>
        {designResult.designNotes.map((note, index) => (
          <View key={index} style={styles.designNote}>
            <Ionicons name="checkmark-circle" size={16} color={tokens.color.success} />
            <Text style={styles.designNoteText}>{note}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFurnitureSection = () => (
    <View style={styles.furnitureSection}>
      <View style={styles.furnitureSectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Furniture</Text>
        {selectedFurniture.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedFurniture.length} selected
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.furnitureList}>
          {designResult.furnitureItems.map((item) => (
            <FurnitureCard
              key={item.id}
              item={item}
              isSelected={selectedFurniture.includes(item.id)}
              onSelect={() => handleFurnitureSelect(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      {selectedFurniture.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.selectedSummaryText}>
            Selected Items: ${getTotalSelectedPrice().toLocaleString()}
          </Text>
          <TouchableOpacity style={styles.purchaseButton}>
            <Text style={styles.purchaseButtonText}>Purchase Selected</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.actionButton, styles.primaryAction]}
        onPress={handleSaveToProject}
        disabled={isLoading}
      >
        <Ionicons name="bookmark" size={20} color={tokens.color.textInverse} />
        <Text style={styles.actionButtonText}>Save to Projects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.actionButton, styles.secondaryAction]}
        onPress={handleStartNewDesign}
      >
        <Ionicons name="refresh" size={20} color={tokens.color.textPrimary} />
        <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
          New Design
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderViewModeToggle()}
        {renderImageComparison()}
        {renderDesignDetails()}
        {renderFurnitureSection()}
      </ScrollView>
      
      {renderActions()}
    </SafeAreaView>
  );
};

// Furniture Card Component
interface FurnitureCardProps {
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: () => void;
}

const FurnitureCard: React.FC<FurnitureCardProps> = ({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.furnitureCard, isSelected && styles.selectedFurnitureCard]}
    onPress={onSelect}
  >
    <Image source={{ uri: item.imageUrl }} style={styles.furnitureImage} />
    
    {isSelected && (
      <View style={styles.selectionIndicator}>
        <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
      </View>
    )}

    <View style={styles.furnitureInfo}>
      <Text style={styles.furnitureName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.furnitureCategory}>{item.category}</Text>
      <Text style={styles.furnitureVendor}>{item.vendor}</Text>
      
      <View style={styles.furnitureFooter}>
        <Text style={styles.furniturePrice}>${item.price}</Text>
        <View style={[styles.stockIndicator, !item.inStock && styles.outOfStock]}>
          <Text style={styles.stockText}>
            {item.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

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
    padding: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  confidenceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  confidenceText: {
    ...tokens.type.small,
    color: tokens.color.success,
    marginLeft: tokens.spacing.xs,
    fontWeight: '500',
  },
  shareButton: {
    padding: tokens.spacing.sm,
  },
  content: {
    flex: 1,
  },
  viewModeToggle: {
    flexDirection: 'row',
    marginHorizontal: tokens.spacing.xl,
    marginVertical: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.xs,
    ...tokens.shadow.e1,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
  },
  viewModeButtonActive: {
    backgroundColor: tokens.color.accent,
  },
  viewModeButtonText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    fontWeight: '500',
  },
  viewModeButtonTextActive: {
    color: tokens.color.textInverse,
  },
  imageContainer: {
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  fullImage: {
    width: '100%',
  },
  imageLabel: {
    position: 'absolute',
    top: tokens.spacing.lg,
    left: tokens.spacing.lg,
    backgroundColor: tokens.color.scrimHeavy,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  imageLabelText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  splitContainer: {
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...tokens.shadow.e2,
  },
  splitImage: {
    position: 'absolute',
    top: 0,
    height: '100%',
    overflow: 'hidden',
  },
  enhancedImageContainer: {
    width: '100%',
    left: 0,
  },
  originalLabel: {
    left: tokens.spacing.lg,
  },
  enhancedLabel: {
    right: tokens.spacing.lg,
    left: 'auto',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLine: {
    width: 2,
    height: '100%',
    backgroundColor: tokens.color.textInverse,
    position: 'absolute',
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e3,
  },
  detailsSection: {
    backgroundColor: tokens.color.surface,
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadow.e1,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  sectionTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  styleTag: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  styleTagText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  costSection: {
    marginBottom: tokens.spacing.lg,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costLabel: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  costAmount: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    fontWeight: '700',
  },
  colorPaletteSection: {
    marginBottom: tokens.spacing.lg,
  },
  subsectionTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.sm,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  designNotesSection: {
    marginTop: tokens.spacing.sm,
  },
  designNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.sm,
  },
  designNoteText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  furnitureSection: {
    marginBottom: tokens.spacing.lg,
  },
  furnitureSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  selectedCount: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '500',
  },
  furnitureList: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  furnitureCard: {
    width: 180,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  selectedFurnitureCard: {
    borderColor: tokens.color.success,
    borderWidth: 2,
  },
  furnitureImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
  },
  selectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.pill,
    padding: tokens.spacing.xs,
  },
  furnitureInfo: {
    padding: tokens.spacing.lg,
  },
  furnitureName: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  furnitureCategory: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  furnitureVendor: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  furnitureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  furniturePrice: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
  },
  stockIndicator: {
    backgroundColor: tokens.color.success,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  outOfStock: {
    backgroundColor: tokens.color.error,
  },
  stockText: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    ...tokens.shadow.e1,
  },
  selectedSummaryText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  purchaseButton: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  purchaseButtonText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    gap: tokens.spacing.lg,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  primaryAction: {
    backgroundColor: tokens.color.accent,
  },
  secondaryAction: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  actionButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  secondaryActionText: {
    color: tokens.color.textPrimary,
  },
});

export default ResultsScreen;