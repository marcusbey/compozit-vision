import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import integrated components
import { StyleGrid } from '../../components/StyleSelection/StyleGrid';
import { AmbianceGrid } from '../../components/AmbianceSelection/AmbianceGrid';
import { FurnitureCarousel } from '../../components/FurnitureCarousel/FurnitureCarousel';
import { CustomPrompt } from '../../components/CustomPrompt/CustomPrompt';
import { ProgressIndicator } from '../../components/FurnitureCarousel/ProgressIndicator';

// Import services
import { spaceAnalysisService } from '../../services/spaceAnalysis';
import { SpaceAnalysisService, FURNITURE_CATEGORIES } from '../../services/furniture/SpaceAnalysisService';

// Import types
import { 
  SpaceAnalysisResult, 
  EnhancedDesignRequest, 
  EnhancedDesignResult,
  StyleOption,
  AmbianceOption 
} from '../../types/aiProcessing';
import { FurnitureStyle, FurnitureCategory } from '../../types/furniture';
import { NavigationProps } from '../../types';

// Import theme and utilities
import { theme } from '../../theme';
import { useResponsiveDesign } from '../../hooks/useResponsiveDesign';
import { announceForAccessibility } from '../../utils/accessibility';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EnhancedAIProcessingScreenProps extends NavigationProps {
  route: {
    params: {
      imageUri: string;
      projectId?: string;
    };
  };
}

type ProcessingStep = 'space_analysis' | 'style_selection' | 'ambiance_selection' | 'furniture_selection' | 'custom_prompt' | 'generating' | 'complete';

interface ProcessingState {
  step: ProcessingStep;
  spaceAnalysis?: SpaceAnalysisResult;
  selectedStyles: string[];
  selectedAmbiance?: string;
  selectedFurniture: Record<string, FurnitureStyle[]>;
  customPrompt?: string;
  isLoading: boolean;
  error?: string;
  enhancedDesign?: EnhancedDesignResult;
}

export const EnhancedAIProcessingScreen: React.FC<EnhancedAIProcessingScreenProps> = ({
  navigation,
  route,
}) => {
  const { imageUri, projectId } = route.params;
  const { isMobile, isTablet, scalingFactor, spacing } = useResponsiveDesign();
  
  const [state, setState] = useState<ProcessingState>({
    step: 'space_analysis',
    selectedStyles: [],
    selectedFurniture: {},
    isLoading: false,
  });

  const [currentFurnitureCategory, setCurrentFurnitureCategory] = useState(0);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // Memoized style options based on space analysis
  const styleOptions = useMemo((): StyleOption[] => {
    const baseStyles: StyleOption[] = [
      { 
        id: 'modern', 
        name: 'Modern', 
        description: 'Clean lines and minimalist aesthetic',
        imageUrl: 'https://example.com/modern.jpg',
        popularity: 0.8 
      },
      { 
        id: 'scandinavian', 
        name: 'Scandinavian', 
        description: 'Light woods and cozy textiles',
        imageUrl: 'https://example.com/scandinavian.jpg',
        popularity: 0.7 
      },
      { 
        id: 'industrial', 
        name: 'Industrial', 
        description: 'Raw materials and urban vibe',
        imageUrl: 'https://example.com/industrial.jpg',
        popularity: 0.6 
      },
      { 
        id: 'traditional', 
        name: 'Traditional', 
        description: 'Classic elegance and timeless design',
        imageUrl: 'https://example.com/traditional.jpg',
        popularity: 0.5 
      },
    ];

    // Reorder based on space analysis recommendations
    if (state.spaceAnalysis?.suggestions?.styles) {
      const recommended = state.spaceAnalysis.suggestions.styles;
      return baseStyles.sort((a, b) => {
        const aIndex = recommended.indexOf(a.id);
        const bIndex = recommended.indexOf(b.id);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }

    return baseStyles;
  }, [state.spaceAnalysis]);

  // Memoized ambiance options based on selected styles
  const ambianceOptions = useMemo((): AmbianceOption[] => {
    const baseAmbiances: AmbianceOption[] = [
      { 
        id: 'cozy', 
        name: 'Cozy', 
        description: 'Warm and inviting atmosphere',
        imageUrl: 'https://example.com/cozy.jpg' 
      },
      { 
        id: 'energetic', 
        name: 'Energetic', 
        description: 'Vibrant and stimulating environment',
        imageUrl: 'https://example.com/energetic.jpg' 
      },
      { 
        id: 'serene', 
        name: 'Serene', 
        description: 'Calm and peaceful setting',
        imageUrl: 'https://example.com/serene.jpg' 
      },
      { 
        id: 'sophisticated', 
        name: 'Sophisticated', 
        description: 'Elegant and refined ambiance',
        imageUrl: 'https://example.com/sophisticated.jpg' 
      },
    ];

    // Filter based on selected styles
    if (state.selectedStyles.length > 0) {
      return baseAmbiances.filter(ambiance => {
        if (state.selectedStyles.includes('modern') && ambiance.id === 'sophisticated') return true;
        if (state.selectedStyles.includes('scandinavian') && ambiance.id === 'cozy') return true;
        if (state.selectedStyles.includes('industrial') && ambiance.id === 'energetic') return true;
        if (state.selectedStyles.includes('traditional') && ambiance.id === 'serene') return true;
        return true; // Show all options by default
      });
    }

    return baseAmbiances;
  }, [state.selectedStyles]);

  // Initialize space analysis
  useEffect(() => {
    analyzeSpace();
  }, [imageUri]);

  const analyzeSpace = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      announceForAccessibility('Analyzing your space...');
      
      const analysis = await spaceAnalysisService.analyzeSpace({
        imageUri,
        analysisTypes: ['room_type', 'objects', 'style', 'dimensions'],
        enhancedMode: true,
      });

      setState(prev => ({
        ...prev,
        spaceAnalysis: analysis,
        step: 'style_selection',
        isLoading: false,
      }));

      announceForAccessibility(`Space analysis complete. Detected ${analysis.roomType} with ${analysis.confidence * 100}% confidence.`);
    } catch (error) {
      console.error('Space analysis failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to analyze space. Please try again.',
        isLoading: false,
      }));
      
      announceForAccessibility('Space analysis failed. Please try again.');
    }
  };

  const handleStyleSelection = useCallback((styles: string[]) => {
    setState(prev => ({
      ...prev,
      selectedStyles: styles,
      step: 'ambiance_selection',
    }));
    
    announceForAccessibility(`Selected ${styles.length} style${styles.length !== 1 ? 's' : ''}: ${styles.join(', ')}`);
  }, []);

  const handleAmbianceSelection = useCallback((ambiance: string) => {
    setState(prev => ({
      ...prev,
      selectedAmbiance: ambiance,
      step: 'furniture_selection',
    }));
    
    announceForAccessibility(`Selected ${ambiance} ambiance`);
  }, []);

  const handleFurnitureSelection = useCallback((category: string, furniture: FurnitureStyle) => {
    setState(prev => ({
      ...prev,
      selectedFurniture: {
        ...prev.selectedFurniture,
        [category]: [...(prev.selectedFurniture[category] || []), furniture],
      },
    }));
    
    announceForAccessibility(`Added ${furniture.name} to ${category} selection`);
  }, []);

  const handleFurnitureSkip = useCallback((category: string) => {
    announceForAccessibility(`Skipped ${category} selection`);
  }, []);

  const handleCategoryComplete = useCallback((category: string) => {
    const nextCategoryIndex = currentFurnitureCategory + 1;
    
    if (nextCategoryIndex < FURNITURE_CATEGORIES.length) {
      setCurrentFurnitureCategory(nextCategoryIndex);
      announceForAccessibility(`Moving to ${FURNITURE_CATEGORIES[nextCategoryIndex].name} selection`);
    } else {
      setState(prev => ({ ...prev, step: 'custom_prompt' }));
      announceForAccessibility('Furniture selection complete. You can now add a custom prompt.');
    }
  }, [currentFurnitureCategory]);

  const handleCustomPromptSubmit = useCallback((prompt: { text: string; context: any }) => {
    setState(prev => ({
      ...prev,
      customPrompt: prompt.text,
    }));
    
    announceForAccessibility('Custom prompt added');
  }, []);

  const generateEnhancedDesign = async () => {
    setState(prev => ({ ...prev, step: 'generating', isLoading: true }));
    
    try {
      announceForAccessibility('Generating your enhanced design...');
      
      const request: EnhancedDesignRequest = {
        imageUri,
        spaceAnalysis: state.spaceAnalysis!,
        selectedStyles: state.selectedStyles,
        selectedAmbiance: state.selectedAmbiance,
        selectedFurniture: Object.values(state.selectedFurniture).flat(),
        customPrompt: state.customPrompt,
        enhancementLevel: 'high',
        outputFormat: 'high_resolution',
      };

      const result = await spaceAnalysisService.generateEnhancedDesign(request);

      setState(prev => ({
        ...prev,
        enhancedDesign: result,
        step: 'complete',
        isLoading: false,
      }));

      announceForAccessibility('Design generation complete!');

      // Navigate to results
      navigation.navigate('Results', {
        designId: result.designId,
        enhancedImageUrl: result.enhancedImageUrl,
        originalImageUri: imageUri,
        processingDetails: {
          selectedStyles: state.selectedStyles,
          selectedAmbiance: state.selectedAmbiance,
          selectedFurniture: state.selectedFurniture,
          customPrompt: state.customPrompt,
          processingTime: result.processingTime,
        },
      });
    } catch (error) {
      console.error('Design generation failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to generate design. Please try again.',
        isLoading: false,
        step: 'custom_prompt', // Go back to last valid step
      }));
      
      announceForAccessibility('Design generation failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setState(prev => ({ ...prev, error: undefined }));
    
    switch (state.step) {
      case 'space_analysis':
        analyzeSpace();
        break;
      case 'generating':
        generateEnhancedDesign();
        break;
      default:
        // For other steps, just clear the error
        break;
    }
  };

  const renderProgressHeader = () => (
    <View style={[styles.progressHeader, { paddingHorizontal: spacing.lg }]}>
      <View style={styles.progressContainer}>
        <ProgressIndicator
          currentStep={state.step}
          totalSteps={7}
          style={styles.progressIndicator}
        />
        <Text style={[styles.progressText, { fontSize: 14 * scalingFactor }]}>
          {getStepTitle()}
        </Text>
      </View>
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={[styles.thumbnailImage, { width: 60 * scalingFactor, height: 60 * scalingFactor }]}
        />
      )}
    </View>
  );

  const getStepTitle = (): string => {
    switch (state.step) {
      case 'space_analysis': return 'Analyzing Space...';
      case 'style_selection': return 'Select Styles';
      case 'ambiance_selection': return 'Choose Ambiance';
      case 'furniture_selection': return 'Select Furniture';
      case 'custom_prompt': return 'Add Details (Optional)';
      case 'generating': return 'Generating Design...';
      case 'complete': return 'Complete!';
      default: return 'Enhanced AI Processing';
    }
  };

  const renderSpaceAnalysis = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
        Analyzing Your Space
      </Text>
      {state.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { fontSize: 16 * scalingFactor }]}>
            Using AI to understand your space...
          </Text>
        </View>
      ) : state.error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: 16 * scalingFactor }]}>
            {state.error}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            testID="retry-button"
            accessibilityLabel="Retry space analysis"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  const renderStyleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
        Select Your Preferred Styles
      </Text>
      {state.spaceAnalysis && (
        <Text style={[styles.recommendationText, { fontSize: 14 * scalingFactor }]}>
          Recommended for {state.spaceAnalysis.roomType} ({Math.round(state.spaceAnalysis.confidence * 100)}% confidence)
        </Text>
      )}
      <StyleGrid
        styles={styleOptions}
        selectedStyles={state.selectedStyles}
        onStyleToggle={(styleId) => {
          const newStyles = state.selectedStyles.includes(styleId)
            ? state.selectedStyles.filter(id => id !== styleId)
            : [...state.selectedStyles, styleId];
          handleStyleSelection(newStyles);
        }}
        multiSelect={true}
        testID="style-grid"
      />
      <TouchableOpacity
        style={[
          styles.continueButton,
          state.selectedStyles.length === 0 && styles.continueButtonDisabled
        ]}
        onPress={() => handleStyleSelection(state.selectedStyles)}
        disabled={state.selectedStyles.length === 0}
        testID="continue-to-ambiance-button"
        accessibilityLabel="Continue to ambiance selection"
      >
        <Text style={styles.continueButtonText}>
          Continue ({state.selectedStyles.length} selected)
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAmbianceSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
        Choose Your Ambiance
      </Text>
      <Text style={[styles.descriptionText, { fontSize: 16 * scalingFactor }]}>
        How do you want your space to feel?
      </Text>
      <AmbianceGrid
        ambiances={ambianceOptions}
        selectedAmbiance={state.selectedAmbiance}
        onAmbianceSelect={handleAmbianceSelection}
        testID="ambiance-grid"
      />
    </View>
  );

  const renderFurnitureSelection = () => {
    const currentCategory = FURNITURE_CATEGORIES[currentFurnitureCategory];
    
    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
          Select {currentCategory.name}
        </Text>
        <Text style={[styles.progressText, { fontSize: 14 * scalingFactor }]}>
          Category {currentFurnitureCategory + 1} of {FURNITURE_CATEGORIES.length}
        </Text>
        <FurnitureCarousel
          categories={[currentCategory]}
          onStyleSelect={handleFurnitureSelection}
          onStyleSkip={handleFurnitureSkip}
          onCategoryComplete={handleCategoryComplete}
          onAllCategoriesComplete={() => setState(prev => ({ ...prev, step: 'custom_prompt' }))}
          testID="furniture-carousel"
        />
      </View>
    );
  };

  const renderCustomPrompt = () => {
    const spaceContext = state.spaceAnalysis ? {
      roomType: state.spaceAnalysis.roomType,
      spaceCharacteristics: state.spaceAnalysis.spaceCharacteristics,
      detectedObjects: state.spaceAnalysis.detectedObjects,
    } : undefined;

    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
          Add Personal Details
        </Text>
        <Text style={[styles.descriptionText, { fontSize: 16 * scalingFactor }]}>
          Describe specific preferences or requirements (optional)
        </Text>
        
        <CustomPrompt
          context={spaceContext}
          onTextChange={() => {}}
          onPromptSubmit={handleCustomPromptSubmit}
          onSuggestionSelect={(suggestion) => handleCustomPromptSubmit({ text: suggestion, context: spaceContext })}
          isExpanded={isPromptExpanded}
          onExpandToggle={() => setIsPromptExpanded(!isPromptExpanded)}
          testID="custom-prompt"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={generateEnhancedDesign}
            testID="skip-prompt-button"
            accessibilityLabel="Skip custom prompt and generate design"
          >
            <Text style={styles.skipButtonText}>Skip & Generate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateEnhancedDesign}
            testID="generate-design-button"
            accessibilityLabel="Generate enhanced design"
          >
            <Text style={styles.generateButtonText}>Generate Design</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGenerating = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { fontSize: 24 * scalingFactor }]}>
        Generating Your Enhanced Design
      </Text>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { fontSize: 16 * scalingFactor }]}>
          AI is creating your personalized design...
        </Text>
        <Text style={[styles.processingDetails, { fontSize: 14 * scalingFactor }]}>
          This may take up to 2 minutes for best results
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (state.step) {
      case 'space_analysis':
        return renderSpaceAnalysis();
      case 'style_selection':
        return renderStyleSelection();
      case 'ambiance_selection':
        return renderAmbianceSelection();
      case 'furniture_selection':
        return renderFurnitureSelection();
      case 'custom_prompt':
        return renderCustomPrompt();
      case 'generating':
        return renderGenerating();
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[theme.colors.background, theme.colors.surface]}
          style={styles.gradient}
        >
          {renderProgressHeader()}
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
            showsVerticalScrollIndicator={false}
            testID="enhanced-ai-processing-scroll"
          >
            {renderCurrentStep()}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressContainer: {
    flex: 1,
  },
  progressIndicator: {
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
  },
  thumbnailImage: {
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  stepContainer: {
    paddingVertical: theme.spacing.lg,
  },
  stepTitle: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  recommendationText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  processingDetails: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.surface,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  continueButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.surface,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  skipButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    fontSize: 16,
  },
  generateButton: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  generateButtonText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.surface,
    fontSize: 16,
  },
});

export default EnhancedAIProcessingScreen;