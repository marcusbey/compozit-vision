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
import { tokens } from '../../theme/tokens';

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

export const ResultsScreen: React.FC = ({ route }: { route?: any }) => {
  const journeyStore = useJourneyStore();
  const projectStore = useProjectStore();
  
  // Get actual data from navigation params (from AIProcessingScreen)
  const {
    originalImageUrl,
    enhancedImageUrl,
    processingResult,
    userJourneyData
  } = route?.params || {};

  // Create design result from actual data
  const createDesignResultFromData = () => {
    const journeyData = journeyStore.getProjectWizard();
    
    // Debug logging to see what images we're receiving
    console.log('🔍 ResultsScreen image sources:');
    console.log('  - originalImageUrl from params:', originalImageUrl);
    console.log('  - enhancedImageUrl from params:', enhancedImageUrl);
    console.log('  - journeyStore.project.photoUri:', journeyStore.project.photoUri);
    console.log('  - Using fallback SAMPLE_RESULT?', !originalImageUrl && !enhancedImageUrl);
    
    const originalImg = originalImageUrl || journeyStore.project.photoUri || SAMPLE_RESULT.originalImage;
    const enhancedImg = enhancedImageUrl || SAMPLE_RESULT.enhancedImage;
    
    // Debug image comparison
    console.log('🖼️ Image comparison check:');
    console.log('  - Original image:', originalImg?.substring(0, 80) + '...');
    console.log('  - Enhanced image:', enhancedImg?.substring(0, 80) + '...');
    console.log('  - Images are different:', originalImg !== enhancedImg);
    
    // Warn if images are the same (debugging)
    if (originalImg === enhancedImg) {
      console.warn('⚠️ WARNING: Original and Enhanced images are identical!');
      console.warn('  - This indicates AI processing may not have worked correctly');
    }
    
    return {
      id: `design_${Date.now()}`,
      originalImage: originalImg,
      enhancedImage: enhancedImg,
      style: journeyData.selectedStyle || userJourneyData?.selectedStyle || 'Modern Minimalist',
      confidence: processingResult?.confidenceScore || 0.92,
      estimatedCost: processingResult?.estimatedCost || 2850,
      furnitureItems: processingResult?.suggestedFurniture || SAMPLE_RESULT.furnitureItems,
      designNotes: [
        'Transformed based on your style preferences',
        `Applied ${journeyData.selectedStyle || 'your chosen'} design principles`,
        'Integrated your selected color palette',
        'Enhanced lighting and spatial flow',
        'Added elements from your reference images'
      ],
      colorPalette: processingResult?.appliedInfluences?.colorInfluences || 
                    journeyData.selectedPalette?.colors || 
                    SAMPLE_RESULT.colorPalette,
    };
  };
  
  const [designResult] = useState<DesignResult>(createDesignResultFromData());
  const [viewMode, setViewMode] = useState<'split' | 'original' | 'enhanced'>('enhanced');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  
  // Split view slider state
  const [sliderValue, setSliderValue] = useState(0.5);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    // Mark journey as completed
    journeyStore.updateProgress({
      currentScreen: 'results',
      currentStep: 11,
      totalSteps: 11
    });
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (containerWidth > 0) {
        const touchX = evt.nativeEvent.locationX;
        const newValue = Math.max(0, Math.min(1, touchX / containerWidth));
        setSliderValue(newValue);
      }
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
            NavigationHelpers.resetToScreen('mainApp');
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
        <Ionicons name="chevron-back" size={24} color={tokens.colors.text.primary} />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Your Design</Text>
        <View style={styles.confidenceScore}>
          <Ionicons name="checkmark-circle" size={16} color={tokens.colors.status.success} />
          <Text style={styles.confidenceText}>
            {Math.round(designResult.confidence * 100)}% Match
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.shareButton}
        onPress={handleShareDesign}
      >
        <Ionicons name="share-outline" size={24} color={tokens.colors.text.primary} />
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

    // Split view - Before/after slider with direct calculations
    const clipWidth = containerWidth * sliderValue;
    const handlePosition = clipWidth - 2; // Center handle on clip edge
    
    return (
      <View 
        style={[styles.splitContainer, { height: imageHeight }]}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setContainerWidth(width);
        }}
        {...panResponder.panHandlers}
      >
        {/* Enhanced Image (Background - Always visible) */}
        <Image 
          source={{ uri: designResult.enhancedImage }}
          style={[styles.fullImage, { height: imageHeight }]}
          resizeMode="cover"
        />
        <View style={[styles.imageLabel, styles.enhancedLabel]}>
          <Text style={styles.imageLabelText}>Enhanced</Text>
        </View>

        {/* Original Image Overlay (Clipped container) */}
        <View
          style={[
            styles.originalImageClipContainer,
            {
              width: clipWidth,
            },
          ]}
        >
          <Image 
            source={{ uri: designResult.originalImage }}
            style={[styles.fullImage, { height: imageHeight, width: containerWidth }]}
            resizeMode="cover"
          />
          <View style={[styles.imageLabel, styles.originalLabel]}>
            <Text style={styles.imageLabelText}>Original</Text>
          </View>
        </View>

        {/* Slider Line and Handle */}
        <View
          style={[
            styles.sliderHandle,
            {
              left: handlePosition,
            },
          ]}
        >
          <View style={styles.sliderLine} />
          <View style={styles.sliderButton}>
            <Ionicons name="swap-horizontal" size={16} color={tokens.colors.text.inverse} />
          </View>
        </View>
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
            <Ionicons name="checkmark-circle" size={16} color={tokens.colors.status.success} />
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
        <Ionicons name="bookmark" size={20} color={tokens.colors.text.inverse} />
        <Text style={styles.actionButtonText}>Save to Projects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.actionButton, styles.secondaryAction]}
        onPress={handleStartNewDesign}
      >
        <Ionicons name="refresh" size={20} color={tokens.colors.text.primary} />
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
        <Ionicons name="checkmark-circle" size={20} color={tokens.colors.status.success} />
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
    backgroundColor: tokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  backButton: {
    padding: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
  },
  confidenceScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  confidenceText: {
    ...tokens.typography.small,
    color: tokens.colors.status.success,
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
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.xs,
    ...tokens.shadows.elevation1,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: tokens.borderRadius.sm,
  },
  viewModeButtonActive: {
    backgroundColor: tokens.colors.text.primary,
  },
  viewModeButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  viewModeButtonTextActive: {
    color: tokens.colors.text.inverse,
  },
  imageContainer: {
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    ...tokens.shadows.elevation2,
  },
  fullImage: {
    width: '100%',
  },
  imageLabel: {
    position: 'absolute',
    top: tokens.spacing.lg,
    left: tokens.spacing.lg,
    backgroundColor: tokens.colors.overlay.medium,
    borderRadius: tokens.borderRadius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  imageLabelText: {
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
    fontWeight: '500',
  },
  splitContainer: {
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...tokens.shadows.elevation2,
  },
  originalImageClipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden', // This is key - clips the image inside
    zIndex: 2, // Above the enhanced image
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
    width: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Highest z-index to be above everything
  },
  sliderLine: {
    width: 4,
    height: '100%',
    backgroundColor: tokens.colors.text.inverse,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.text.inverse,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: tokens.colors.text.primary,
    ...tokens.shadows.elevation3,
  },
  detailsSection: {
    backgroundColor: tokens.colors.background.secondary,
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadows.elevation1,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  sectionTitle: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
  },
  styleTag: {
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  styleTagText: {
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
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
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  costAmount: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
    fontWeight: '700',
  },
  colorPaletteSection: {
    marginBottom: tokens.spacing.lg,
  },
  subsectionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
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
    borderRadius: tokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
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
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
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
    ...tokens.typography.small,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '500',
  },
  furnitureList: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.lg,
  },
  furnitureCard: {
    width: 180,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...tokens.shadows.elevation1,
  },
  selectedFurnitureCard: {
    borderColor: tokens.colors.status.success,
    borderWidth: 2,
  },
  furnitureImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: tokens.borderRadius.lg,
    borderTopRightRadius: tokens.borderRadius.lg,
  },
  selectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.pill,
    padding: tokens.spacing.xs,
  },
  furnitureInfo: {
    padding: tokens.spacing.lg,
  },
  furnitureName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  furnitureCategory: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  furnitureVendor: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  furnitureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  furniturePrice: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  stockIndicator: {
    backgroundColor: tokens.colors.status.success,
    borderRadius: tokens.borderRadius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  outOfStock: {
    backgroundColor: tokens.colors.status.error,
  },
  stockText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.inverse,
    fontWeight: '500',
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xl,
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    ...tokens.shadows.elevation1,
  },
  selectedSummaryText: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  purchaseButton: {
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  purchaseButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    gap: tokens.spacing.lg,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: tokens.borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevation2,
  },
  primaryAction: {
    backgroundColor: tokens.colors.text.primary,
  },
  secondaryAction: {
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  actionButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  secondaryActionText: {
    color: tokens.colors.text.primary,
  },
});

export default ResultsScreen;