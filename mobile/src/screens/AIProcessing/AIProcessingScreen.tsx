/**
 * AI Processing Screen
 * Handles Google Gemini API integration for interior design generation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getGeminiService, RoomAnalysisInput, DesignRecommendation } from '../../services/geminiService';

// Design tokens from style guide - Updated to warm color scheme
const tokens = {
  color: {
    bgApp: "#FBF9F4",
    bgSecondary: "#F5F1E8",
    surface: "#FEFEFE",
    textPrimary: "#2D2B28",
    textSecondary: "#8B7F73",
    textMuted: "#B8AFA4",
    textInverse: "#FEFEFE",
    borderSoft: "#E6DDD1",
    borderWarm: "#D4C7B5",
    brand: "#D4A574",
    brandLight: "#E8C097",
    brandDark: "#B8935F",
    accent: "#2D2B28",
    accentSoft: "#5A564F",
    warm: "#E8C097",
    warmDark: "#D4A574",
    scrim: "rgba(45,43,40,0.45)",
    scrimHeavy: "rgba(45,43,40,0.65)",
    success: "#7FB069",
    error: "#E07A5F",
    warning: "#F2CC8F",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    brand: { shadowColor: "#D4A574", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  },
  gradient: {
    brand: ["#E8C097", "#D4A574"],
    accent: ["#2D2B28", "#5A564F"],
    processing: ["#D4A574", "#B8935F"],
    surface: ["#FEFEFE", "#F5F1E8"],
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

interface AIProcessingScreenProps {
  navigation: any;
  route: {
    params?: {
      imageUri?: string;
      roomType?: string;
      selectedStyle?: string;
      budget?: string;
    };
  };
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  result?: DesignRecommendation;
  error?: string;
  processingTime?: number;
}

const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({ navigation, route }) => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: 'Ready to analyze',
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [imageUri, setImageUri] = useState(route.params?.imageUri || '');

  useEffect(() => {
    // Auto-start processing if image is provided
    if (imageUri && !processingState.isProcessing) {
      handleStartProcessing();
    }
  }, [imageUri]);

  const handleStartProcessing = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please provide a room image to analyze');
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 10,
      currentStep: 'Initializing AI processing...',
    });

    try {
      const geminiService = getGeminiService();

      // Step 1: Prepare input
      setProcessingState(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Preparing image for analysis...',
      }));

      // Convert image URI to base64 if needed
      let imageData = imageUri;
      if (!imageUri.startsWith('data:image/')) {
        // In real implementation, convert file URI to base64
        imageData = `data:image/jpeg;base64,${imageUri}`;
      }

      const analysisInput: RoomAnalysisInput = {
        imageData,
        roomDimensions: {
          width: 4, // Default dimensions - in real app, get from AR measurement
          height: 3,
          length: 5,
          roomType: route.params?.roomType || 'living-room',
          lightingSources: ['window', 'ceiling-light'],
        },
        stylePreferences: {
          primaryStyle: route.params?.selectedStyle || 'modern',
          colors: ['white', 'gray', 'beige'],
          budget: route.params?.budget || '5000-10000',
          preferredMaterials: ['wood', 'fabric', 'metal'],
        },
        customPrompt: customPrompt || 'Create a functional and aesthetically pleasing design',
      };

      // Step 2: AI Analysis
      setProcessingState(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'Analyzing room with AI...',
      }));

      const startTime = Date.now();
      const result = await geminiService.analyzeRoom(analysisInput);
      const endTime = Date.now();

      if (!result.success) {
        throw new Error(result.error || 'AI processing failed');
      }

      // Step 3: Processing complete
      setProcessingState({
        isProcessing: false,
        progress: 100,
        currentStep: 'Processing complete!',
        result: result.data,
        processingTime: endTime - startTime,
      });

    } catch (error) {
      console.error('AI Processing Error:', error);
      
      setProcessingState({
        isProcessing: false,
        progress: 0,
        currentStep: 'Processing failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });

      Alert.alert(
        'Processing Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [{ text: 'Retry', onPress: handleStartProcessing }, { text: 'Cancel' }]
      );
    }
  };

  const renderProcessingStatus = () => (
    <View style={styles.processingContainer}>
      <LinearGradient
        colors={tokens.gradient.surface}
        style={styles.processingCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>AI Interior Design Processing</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={tokens.gradient.processing}
              style={[styles.progressBar, { width: `${processingState.progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>{processingState.progress}%</Text>
        </View>

        <Text style={styles.stepText}>{processingState.currentStep}</Text>

        {processingState.isProcessing && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size="large" 
              color={tokens.color.brand}
              style={styles.spinner}
            />
            <View style={styles.processingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        )}

        {processingState.processingTime && (
          <Text style={styles.timeText}>
            Processing completed in {processingState.processingTime}ms
          </Text>
        )}
      </LinearGradient>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <LinearGradient
        colors={tokens.gradient.surface}
        style={styles.errorCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.errorTitle}>Processing Error</Text>
        <Text style={styles.errorText}>{processingState.error}</Text>
        
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleStartProcessing}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={tokens.gradient.brand}
            style={styles.retryButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.retryButtonText}>Retry Analysis</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderResults = () => {
    if (!processingState.result) return null;

    const { result } = processingState;

    return (
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Design Recommendations</Text>

        {/* Confidence Score */}
        <LinearGradient
          colors={tokens.gradient.surface}
          style={styles.confidenceContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.confidenceLabel}>AI Confidence Score</Text>
          <View style={styles.confidenceBar}>
            <LinearGradient
              colors={tokens.gradient.processing}
              style={[
                styles.confidenceFill, 
                { width: `${(result.confidenceScore || 0) * 100}%` }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round((result.confidenceScore || 0) * 100)}%
          </Text>
        </LinearGradient>

        {/* Overall Concept */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Overall Design Concept</Text>
          <Text style={styles.sectionText}>{result.overallDesignConcept}</Text>
        </View>

        {/* Color Scheme */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Color Scheme</Text>
          <View style={styles.colorSchemeContainer}>
            <View style={styles.colorItem}>
              <Text style={styles.colorLabel}>Primary</Text>
              <Text style={styles.colorText}>{result.colorScheme.primary}</Text>
            </View>
            <View style={styles.colorItem}>
              <Text style={styles.colorLabel}>Secondary</Text>
              <Text style={styles.colorText}>{result.colorScheme.secondary}</Text>
            </View>
            <View style={styles.colorItem}>
              <Text style={styles.colorLabel}>Accent</Text>
              <Text style={styles.colorText}>{result.colorScheme.accent}</Text>
            </View>
          </View>
          <Text style={styles.sectionText}>{result.colorScheme.description}</Text>
        </View>

        {/* Furniture Recommendations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Furniture Recommendations</Text>
          {result.furniture.map((item, index) => (
            <View key={index} style={styles.furnitureItem}>
              <Text style={styles.furnitureTitle}>{item.item}</Text>
              <Text style={styles.furnitureDetails}>Dimensions: {item.dimensions}</Text>
              <Text style={styles.furnitureDetails}>Placement: {item.placement}</Text>
              <Text style={styles.furnitureReasoning}>{item.reasoning}</Text>
              {item.estimatedCost && (
                <Text style={styles.furnitureCost}>Est. Cost: {item.estimatedCost}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Room Layout */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Layout Suggestions</Text>
          {result.roomLayout.suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.listItem}>• {suggestion}</Text>
          ))}
          
          <Text style={styles.subsectionTitle}>Optimization Tips</Text>
          {result.roomLayout.optimizationTips.map((tip, index) => (
            <Text key={index} style={styles.listItem}>• {tip}</Text>
          ))}
        </View>

        {/* Lighting */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Lighting Design</Text>
          {result.lighting.recommendations.map((rec, index) => (
            <Text key={index} style={styles.listItem}>• {rec}</Text>
          ))}
          
          <Text style={styles.subsectionTitle}>Recommended Fixtures</Text>
          {result.lighting.fixtures.map((fixture, index) => (
            <Text key={index} style={styles.listItem}>• {fixture}</Text>
          ))}
        </View>

        {/* Decorative Elements */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Decorative Elements</Text>
          {result.decorativeElements.map((element, index) => (
            <Text key={index} style={styles.listItem}>• {element}</Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('results', { designData: result })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={tokens.gradient.accent}
              style={styles.primaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>View 3D Visualization</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setProcessingState({ isProcessing: false, progress: 0, currentStep: 'Ready to analyze' })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={tokens.gradient.surface}
              style={styles.secondaryButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.secondaryButtonText}>Start Over</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderCustomPromptInput = () => (
    <View style={styles.promptContainer}>
      <Text style={styles.promptLabel}>Custom Design Instructions (Optional)</Text>
      <TextInput
        style={styles.promptInput}
        value={customPrompt}
        onChangeText={setCustomPrompt}
        placeholder="e.g., Focus on maximizing natural light and storage..."
        multiline
        numberOfLines={3}
        placeholderTextColor={tokens.color.textMuted}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {!processingState.result && !processingState.error && renderProcessingStatus()}
      {!processingState.isProcessing && !processingState.result && !processingState.error && renderCustomPromptInput()}
      {processingState.error && renderError()}
      {processingState.result && renderResults()}

      {!processingState.isProcessing && !processingState.result && !processingState.error && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartProcessing}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={tokens.gradient.brand}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startButtonText}>Start AI Analysis</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
    padding: tokens.spacing.xl,
  },

  // Processing Status Styles
  processingContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  processingCard: {
    width: '100%',
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xxl,
    alignItems: 'center',
    ...tokens.shadow.e2,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  title: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    marginBottom: tokens.spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: tokens.radius.pill,
  },
  progressText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  stepText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  spinnerContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
  },
  spinner: {
    marginBottom: tokens.spacing.lg,
  },
  processingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.brand,
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  timeText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.lg,
  },

  // Custom Prompt Styles
  promptContainer: {
    marginBottom: tokens.spacing.xl,
  },
  promptLabel: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  promptInput: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },

  // Button Styles
  startButton: {
    height: 54,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.brand,
    marginTop: tokens.spacing.xl,
  },
  startButtonGradient: {
    height: '100%',
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...tokens.type.h2,
    color: tokens.color.accent,
    fontWeight: '600',
  },

  // Error Styles
  errorContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  errorCard: {
    width: '100%',
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xxl,
    alignItems: 'center',
    ...tokens.shadow.e2,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  errorTitle: {
    ...tokens.type.h2,
    color: tokens.color.error,
    marginBottom: tokens.spacing.lg,
  },
  errorText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  retryButton: {
    height: 48,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.brand,
  },
  retryButtonGradient: {
    height: '100%',
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  retryButtonText: {
    ...tokens.type.body,
    color: tokens.color.accent,
    fontWeight: '600',
  },

  // Results Styles
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
  },

  confidenceContainer: {
    marginBottom: tokens.spacing.xxl,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadow.e1,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  confidenceLabel: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  confidenceBar: {
    height: 12,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    marginBottom: tokens.spacing.sm,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: tokens.radius.pill,
  },
  confidenceText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
  },

  sectionContainer: {
    marginBottom: tokens.spacing.xxl,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadow.e1,
  },
  sectionTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  subsectionTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  sectionText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    lineHeight: 24,
  },
  listItem: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
    lineHeight: 22,
  },

  colorSchemeContainer: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.lg,
  },
  colorItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xs,
  },
  colorLabel: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  colorText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    textAlign: 'center',
  },

  furnitureItem: {
    marginBottom: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  furnitureTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  furnitureDetails: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  furnitureReasoning: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
    fontStyle: 'italic',
  },
  furnitureCost: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '600',
  },

  actionButtons: {
    marginTop: tokens.spacing.xxl,
    marginBottom: tokens.spacing.xxxl,
  },
  primaryButton: {
    height: 52,
    borderRadius: tokens.radius.pill,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  primaryButtonGradient: {
    height: '100%',
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
  },
  secondaryButton: {
    height: 48,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.color.borderWarm,
    ...tokens.shadow.e1,
  },
  secondaryButtonGradient: {
    height: '100%',
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
});

export default AIProcessingScreen;