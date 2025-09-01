import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { useUserStore } from '../../stores/userStore';

import { CustomPrompt } from '../../components/CustomPrompt';
import {
  FurnitureCategory,
  FurnitureStyle,
  FurnitureSelection,
  CustomPrompt as CustomPromptType,
  PromptContext,
  RoomType,
} from '../../types/furniture';
import {
  SpaceAnalysisService,
  FURNITURE_CATEGORIES,
  MOCK_FURNITURE_STYLES,
} from '../../services/furniture/SpaceAnalysisService';
import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = screenWidth * 0.4; // 40% of screen width for each furniture item

interface FurnitureSelectionScreenProps {
  navigation?: any;
  route?: any;
}

const FurnitureSelectionScreen: React.FC<FurnitureSelectionScreenProps> = ({ navigation, route }) => {
  const journeyStore = useJourneyStore();
  const { isAuthenticated } = useUserStore();
  const params = route?.params || {};

  // State
  const [categories, setCategories] = useState<FurnitureCategory[]>([]);
  const [categorySelections, setCategorySelections] = useState<Record<string, FurnitureStyle | null>>({});
  const [furnitureByCategory, setFurnitureByCategory] = useState<Record<string, FurnitureStyle[]>>({});
  const [customPrompt, setCustomPrompt] = useState<CustomPromptType | null>(null);
  const [promptContext, setPromptContext] = useState<PromptContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(7, 'furnitureSelection');
  }, []);

  // Initialize space analysis
  useEffect(() => {
    initializeSpaceAnalysis();
  }, []);

  const initializeSpaceAnalysis = async () => {
    try {
      setIsLoading(true);
      
      let analysisResult;
      if (params.imageUrl) {
        // Use real space analysis with image
        analysisResult = await SpaceAnalysisService.analyzeSpace(params.imageUrl);
      } else {
        // Use mock data for development
        analysisResult = await SpaceAnalysisService.analyzeSpace('mock-image-url');
      }

      // Get top 3 furniture categories based on space analysis
      const topCategories = SpaceAnalysisService.getTopFurnitureCategories(
        analysisResult.furniturePriorities,
        3
      );

      setCategories(topCategories);
      
      // Initialize furniture by category with room-based filtering
      const furnitureData: Record<string, FurnitureStyle[]> = {};
      const selections: Record<string, FurnitureStyle | null> = {};
      
      topCategories.forEach(category => {
        // Get furniture for this category filtered by room type
        const categoryFurniture = MOCK_FURNITURE_STYLES[category.id] || [];
        const filteredFurniture = categoryFurniture.filter(furniture => 
          furniture.compatibility.roomTypes.includes(analysisResult.roomType)
        );
        
        furnitureData[category.id] = filteredFurniture.slice(0, 8); // Show max 8 items per category for carousel
        selections[category.id] = null; // No selection initially
      });
      
      setFurnitureByCategory(furnitureData);
      setCategorySelections(selections);
      
      // Set up prompt context
      const context: PromptContext = {
        roomType: analysisResult.roomType,
        detectedObjects: analysisResult.detectedObjects,
        spaceCharacteristics: analysisResult.roomCharacteristics,
        userPreferences: params.userPreferences,
      };
      
      setPromptContext(context);
      
    } catch (error) {
      console.error('Failed to initialize space analysis:', error);
      
      // Fallback to default categories
      const fallbackCategories = FURNITURE_CATEGORIES.slice(0, 3);
      setCategories(fallbackCategories);
      
      // Initialize with fallback data
      const furnitureData: Record<string, FurnitureStyle[]> = {};
      const selections: Record<string, FurnitureStyle | null> = {};
      
      fallbackCategories.forEach(category => {
        furnitureData[category.id] = (MOCK_FURNITURE_STYLES[category.id] || []).slice(0, 8);
        selections[category.id] = null;
      });
      
      setFurnitureByCategory(furnitureData);
      setCategorySelections(selections);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle furniture selection (toggle single selection per category)
  const handleFurnitureSelect = useCallback((categoryId: string, furniture: FurnitureStyle) => {
    setCategorySelections(prev => {
      const currentSelection = prev[categoryId];
      const newSelection = currentSelection?.id === furniture.id ? null : furniture;
      
      console.log(`${newSelection ? 'Selected' : 'Deselected'} ${furniture.name} in ${categoryId}`);
      
      return {
        ...prev,
        [categoryId]: newSelection
      };
    });
  }, []);

  // Handle continue - proceed to auth check
  const handleContinue = useCallback(() => {
    // Collect all selections
    const selections = Object.entries(categorySelections)
      .filter(([_, selection]) => selection !== null)
      .map(([categoryId, furniture]) => ({
        categoryId,
        selectedStyles: [furniture!],
        skippedStyles: [],
        timestamp: Date.now()
      }));

    console.log('Furniture selection completed:', selections);
    
    // Save selections to journey store
    journeyStore.updateProject({ 
      furnitureSelections: selections,
      customFurniturePrompt: customPrompt 
    });
    
    journeyStore.completeStep('furnitureSelection');
    
    // Navigate to auth screen if not authenticated, otherwise go to AI processing
    if (!isAuthenticated) {
      NavigationHelpers.navigateToScreen('auth');
    } else {
      NavigationHelpers.navigateToScreen('aiProcessing');
    }
  }, [categorySelections, customPrompt, isAuthenticated]);

  // Handle skip - go directly to auth
  const handleSkip = useCallback(() => {
    console.log('Skipping furniture selection');
    
    // Mark step as completed but with no selections
    journeyStore.updateProject({ 
      furnitureSelections: [],
      customFurniturePrompt: null 
    });
    
    journeyStore.completeStep('furnitureSelection');
    
    // Navigate to auth screen if not authenticated, otherwise go to AI processing
    if (!isAuthenticated) {
      NavigationHelpers.navigateToScreen('auth');
    } else {
      NavigationHelpers.navigateToScreen('aiProcessing');
    }
  }, [isAuthenticated]);

  // Handle custom prompt submission
  const handlePromptSubmit = useCallback((prompt: CustomPromptType) => {
    console.log('Custom prompt submitted:', prompt);
    setCustomPrompt(prompt);
  }, []);

  const goBack = () => {
    NavigationHelpers.goBack();
  };

  // Render furniture item in carousel
  const renderFurnitureItem = ({ item, categoryId }: { item: FurnitureStyle; categoryId: string }) => {
    const isSelected = categorySelections[categoryId]?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.furnitureItem, isSelected && styles.furnitureItemSelected]}
        onPress={() => handleFurnitureSelect(categoryId, item)}
        activeOpacity={0.8}
      >
        {/* Furniture Image Placeholder */}
        <View style={[styles.furnitureImageContainer, isSelected && styles.furnitureImageSelected]}>
          <View style={[styles.furnitureImagePlaceholder, { backgroundColor: `hsl(${item.id.charCodeAt(0) * 7}, 40%, 85%)` }]} />
          
          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.selectionOverlay}>
              <View style={styles.selectionCheckmark}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            </View>
          )}
        </View>

        {/* Furniture Info */}
        <View style={styles.furnitureInfo}>
          <Text style={styles.furnitureName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.furniturePrice}>
            ${item.priceRange.min} - ${item.priceRange.max}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category section
  const renderCategorySection = (category: FurnitureCategory) => {
    const categoryFurniture = furnitureByCategory[category.id] || [];
    const hasSelection = categorySelections[category.id] !== null;
    
    return (
      <View key={category.id} style={styles.categorySection}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>{category.displayName}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
          {hasSelection && (
            <View style={styles.categoryCheck}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </View>

        {/* Furniture Carousel */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryFurniture}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderFurnitureItem({ item, categoryId: category.id })}
          contentContainerStyle={styles.carouselContainer}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          snapToInterval={itemWidth + 12}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading furniture options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No furniture categories available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1C" />
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 7 of 10</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainTitle}>Choose Your Furniture</Text>
          <Text style={styles.mainSubtitle}>
            Select pieces that fit your style and space. Swipe through each category or skip to continue.
          </Text>
        </View>

        {/* Categories */}
        {categories.map(category => renderCategorySection(category))}

        {/* Custom Prompt Section */}
        <View style={styles.customPromptSection}>
          <Text style={styles.sectionTitle}>Additional Requirements (Optional)</Text>
          <View style={styles.promptContainer}>
            <CustomPrompt
              placeholder="Describe any specific furniture requirements..."
              context={promptContext || undefined}
              maxLength={500}
              onPromptSubmit={handlePromptSubmit}
              isExpanded={false}
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            Continue to Next Step
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FDFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    minWidth: 60,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  skipButton: {
    padding: 4,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C9A98C',
  },
  scrollContainer: {
    flex: 1,
  },
  mainHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#7A7A7A',
  },
  categoryCheck: {
    marginLeft: 12,
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  furnitureItem: {
    width: itemWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  furnitureItemSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  furnitureImageContainer: {
    position: 'relative',
    height: 120,
  },
  furnitureImageSelected: {
    // Additional selected styling if needed
  },
  furnitureImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  furnitureInfo: {
    padding: 12,
  },
  furnitureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C9A98C',
  },
  customPromptSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 12,
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: '#FDFBF7',
    borderTopWidth: 1,
    borderTopColor: '#E8E2D8',
  },
  continueButton: {
    backgroundColor: '#1C1C1C',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDFBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
  },
  loadingText: {
    fontSize: 16,
    color: '#7A7A7A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
  },
  errorText: {
    fontSize: 16,
    color: '#7A7A7A',
  },
});

export default FurnitureSelectionScreen;
export { FurnitureSelectionScreen };