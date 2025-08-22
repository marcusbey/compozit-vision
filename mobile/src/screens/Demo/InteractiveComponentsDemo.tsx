import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

/**
 * Comprehensive demo showcasing the integration of FurnitureCarousel and CustomPrompt
 * Demonstrates professional-grade swipe interactions and context-aware prompting
 */
export const InteractiveComponentsDemo: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<'carousel' | 'prompt' | 'complete'>('carousel');
  const [selections, setSelections] = useState<FurnitureSelection[]>([]);
  const [customPrompt, setCustomPrompt] = useState<CustomPromptType | null>(null);
  const [demoStats, setDemoStats] = useState({
    totalStyles: 0,
    liked: 0,
    skipped: 0,
    categories: 0,
    promptLength: 0,
  });

  // Mock context for demonstration
  const mockContext: PromptContext = {
    roomType: RoomType.LIVING_ROOM,
    spaceCharacteristics: {
      size: 'medium',
      lighting: 'bright',
      style: 'modern',
    },
    detectedObjects: ['sofa', 'coffee table', 'window', 'lamp'],
    userPreferences: {
      styles: ['modern', 'contemporary', 'minimalist'],
      colors: ['neutral', 'warm tones'],
      budget: { min: 1000, max: 5000 }
    }
  };

  const topCategories = FURNITURE_CATEGORIES.slice(0, 3);

  // Carousel event handlers
  const handleStyleSelect = useCallback((categoryId: string, style: FurnitureStyle) => {
    console.log(`✓ Liked: ${style.name} (${categoryId})`);
    
    setDemoStats(prev => ({
      ...prev,
      liked: prev.liked + 1,
      totalStyles: prev.totalStyles + 1,
    }));
  }, []);

  const handleStyleSkip = useCallback((categoryId: string, style: FurnitureStyle) => {
    console.log(`✗ Skipped: ${style.name} (${categoryId})`);
    
    setDemoStats(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      totalStyles: prev.totalStyles + 1,
    }));
  }, []);

  const handleCategoryComplete = useCallback((categoryId: string, selection: FurnitureSelection) => {
    console.log(`📁 Category completed: ${categoryId}`, selection);
    
    setSelections(prev => {
      const existing = prev.findIndex(s => s.categoryId === categoryId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = selection;
        return updated;
      }
      return [...prev, selection];
    });

    setDemoStats(prev => ({
      ...prev,
      categories: prev.categories + 1,
    }));
  }, []);

  const handleAllCategoriesComplete = useCallback((allSelections: FurnitureSelection[]) => {
    console.log('🎉 All categories completed!', allSelections);
    
    Alert.alert(
      'Style Selection Complete!',
      'Now add any specific requirements with the custom prompt.',
      [
        { text: 'Skip Prompt', onPress: () => setCurrentStep('complete') },
        { text: 'Add Requirements', onPress: () => setCurrentStep('prompt') },
      ]
    );
  }, []);

  // Custom prompt event handlers
  const handlePromptTextChange = useCallback((text: string) => {
    setDemoStats(prev => ({
      ...prev,
      promptLength: text.length,
    }));
  }, []);

  const handlePromptSubmit = useCallback((prompt: CustomPromptType) => {
    console.log('📝 Custom prompt submitted:', prompt);
    
    setCustomPrompt(prompt);
    setCurrentStep('complete');
    
    Alert.alert(
      'Requirements Added!',
      'Your custom prompt has been saved and will be used in AI generation.',
      [{ text: 'View Results', onPress: () => console.log('Navigate to results') }]
    );
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    console.log('💡 Suggestion selected:', suggestion);
  }, []);

  // Demo controls
  const resetDemo = () => {
    setCurrentStep('carousel');
    setSelections([]);
    setCustomPrompt(null);
    setDemoStats({
      totalStyles: 0,
      liked: 0,
      skipped: 0,
      categories: 0,
      promptLength: 0,
    });
  };

  const skipToPrompt = () => {
    setCurrentStep('prompt');
  };

  const skipToComplete = () => {
    setCurrentStep('complete');
  };

  // Statistics display
  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
    title, value, icon, color
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Icon name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
      
      {/* Demo Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Interactive Components Demo</Text>
        <Text style={styles.subtitle}>
          Professional furniture selection with gesture-based interactions
        </Text>
        
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.step, currentStep === 'carousel' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'carousel' && styles.activeStepText]}>
              1. Style Selection
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.step, currentStep === 'prompt' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'prompt' && styles.activeStepText]}>
              2. Custom Prompt
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.step, currentStep === 'complete' && styles.activeStep]}>
            <Text style={[styles.stepText, currentStep === 'complete' && styles.activeStepText]}>
              3. Complete
            </Text>
          </View>
        </View>
      </View>

      {/* Demo Statistics */}
      <View style={styles.statsContainer}>
        <StatCard title="Liked" value={demoStats.liked} icon="favorite" color={colors.primary[500]} />
        <StatCard title="Skipped" value={demoStats.skipped} icon="close" color={colors.gray[500]} />
        <StatCard title="Categories" value={demoStats.categories} icon="category" color={colors.secondary[500]} />
        <StatCard title="Prompt Chars" value={demoStats.promptLength} icon="edit" color={colors.primary[600]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentStep === 'carousel' && (
          <View style={styles.carouselStep}>
            <FurnitureCarousel
              categories={topCategories}
              onStyleSelect={handleStyleSelect}
              onStyleSkip={handleStyleSkip}
              onCategoryComplete={handleCategoryComplete}
              onAllCategoriesComplete={handleAllCategoriesComplete}
              animationDuration={300}
              gesturesEnabled={true}
            />
          </View>
        )}

        {currentStep === 'prompt' && (
          <View style={styles.promptStep}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.promptInstructions}>
                <Icon name="edit" size={24} color={colors.primary[500]} />
                <Text style={styles.instructionTitle}>Add Your Requirements</Text>
                <Text style={styles.instructionText}>
                  Describe any specific furniture preferences, room constraints, or style details
                </Text>
              </View>
              
              <CustomPrompt
                placeholder="Describe your ideal furniture style, specific requirements, or room constraints..."
                context={mockContext}
                maxLength={500}
                onTextChange={handlePromptTextChange}
                onPromptSubmit={handlePromptSubmit}
                onSuggestionSelect={handleSuggestionSelect}
                isExpanded={true}
              />
            </ScrollView>
          </View>
        )}

        {currentStep === 'complete' && (
          <View style={styles.completeStep}>
            <View style={styles.completeContent}>
              <Icon name="check-circle" size={64} color={colors.primary[500]} />
              <Text style={styles.completeTitle}>Demo Complete!</Text>
              <Text style={styles.completeSubtitle}>
                You've successfully navigated through the furniture selection process
              </Text>
              
              {/* Summary */}
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Selection Summary:</Text>
                <Text style={styles.summaryText}>
                  • {demoStats.liked} styles liked across {demoStats.categories} categories
                </Text>
                <Text style={styles.summaryText}>
                  • {demoStats.skipped} styles skipped
                </Text>
                {customPrompt && (
                  <Text style={styles.summaryText}>
                    • Custom requirements: "{customPrompt.text.substring(0, 50)}..."
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Demo Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={resetDemo}>
          <Icon name="refresh" size={20} color={colors.primary[600]} />
          <Text style={styles.controlText}>Reset Demo</Text>
        </TouchableOpacity>
        
        {currentStep === 'carousel' && (
          <TouchableOpacity style={styles.controlButton} onPress={skipToPrompt}>
            <Icon name="skip-next" size={20} color={colors.gray[600]} />
            <Text style={styles.controlText}>Skip to Prompt</Text>
          </TouchableOpacity>
        )}
        
        {currentStep === 'prompt' && (
          <TouchableOpacity style={styles.controlButton} onPress={skipToComplete}>
            <Icon name="skip-next" size={20} color={colors.gray[600]} />
            <Text style={styles.controlText}>Skip to Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
  },
  activeStep: {
    backgroundColor: colors.primary[500],
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[600],
  },
  activeStepText: {
    color: 'white',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: colors.gray[200],
    marginHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: 4,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray[600],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  carouselStep: {
    flex: 1,
  },
  promptStep: {
    flex: 1,
    padding: 20,
  },
  promptInstructions: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginTop: 8,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  completeStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeContent: {
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  summary: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  controlText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginLeft: 6,
  },
});