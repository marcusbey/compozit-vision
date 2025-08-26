import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { FurnitureCarousel } from '../../components/FurnitureCarousel';
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
} from '../../services/furniture/SpaceAnalysisService';
import { colors } from '../../theme/colors';

interface RouteParams {
  imageUrl?: string;
  roomType?: RoomType;
  userPreferences?: any;
}

export const FurnitureSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  // State
  const [categories, setCategories] = useState<FurnitureCategory[]>([]);
  const [selections, setSelections] = useState<FurnitureSelection[]>([]);
  const [customPrompt, setCustomPrompt] = useState<CustomPromptType | null>(null);
  const [promptContext, setPromptContext] = useState<PromptContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      Alert.alert(
        'Analysis Error',
        'Unable to analyze the space. Using default categories.',
        [{ text: 'OK' }]
      );
      
      // Fallback to default categories
      setCategories(FURNITURE_CATEGORIES.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle style selection
  const handleStyleSelect = useCallback((categoryId: string, style: FurnitureStyle) => {
    console.log(`Style selected: ${style.name} in category ${categoryId}`);
  }, []);

  // Handle style skip
  const handleStyleSkip = useCallback((categoryId: string, style: FurnitureStyle) => {
    console.log(`Style skipped: ${style.name} in category ${categoryId}`);
  }, []);

  // Handle category completion
  const handleCategoryComplete = useCallback((categoryId: string, selection: FurnitureSelection) => {
    console.log(`Category completed: ${categoryId}`, selection);
    
    setSelections(prev => {
      const existing = prev.findIndex(s => s.categoryId === categoryId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = selection;
        return updated;
      }
      return [...prev, selection];
    });
  }, []);

  // Handle all categories completion
  const handleAllCategoriesComplete = useCallback((allSelections: FurnitureSelection[]) => {
    console.log('All categories completed:', allSelections);
    
    // Navigate to next screen with selections and custom prompt
    navigation.navigate('ProcessingScreen' as never, {
      selections: allSelections,
      customPrompt,
      originalImage: params.imageUrl,
      roomType: promptContext?.roomType,
    } as never);
  }, [navigation, customPrompt, params.imageUrl, promptContext]);

  // Handle custom prompt changes
  const handlePromptTextChange = useCallback((text: string) => {
    // Real-time text change handling
    console.log('Prompt text changed:', text);
  }, []);

  // Handle custom prompt submission
  const handlePromptSubmit = useCallback((prompt: CustomPromptType) => {
    console.log('Custom prompt submitted:', prompt);
    setCustomPrompt(prompt);
    
    Alert.alert(
      'Custom Prompt Added',
      'Your custom requirements will be used in the AI generation.',
      [{ text: 'OK' }]
    );
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    console.log('Suggestion selected:', suggestion);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Add loading spinner here */}
        </View>
      </SafeAreaView>
    );
  }

  if (categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          {/* Add error state here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Furniture Carousel */}
        <View style={styles.carouselContainer}>
          <FurnitureCarousel
            categories={categories}
            onStyleSelect={handleStyleSelect}
            onStyleSkip={handleStyleSkip}
            onCategoryComplete={handleCategoryComplete}
            onAllCategoriesComplete={handleAllCategoriesComplete}
            animationDuration={300}
            gesturesEnabled={true}
          />
        </View>

        {/* Custom Prompt */}
        <View style={styles.promptContainer}>
          <CustomPrompt
            placeholder="Describe your ideal furniture style or specific requirements..."
            context={promptContext || undefined}
            maxLength={500}
            onTextChange={handlePromptTextChange}
            onPromptSubmit={handlePromptSubmit}
            onSuggestionSelect={handleSuggestionSelect}
            isExpanded={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
  },
  promptContainer: {
    // Custom prompt at bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FurnitureSelectionScreen;