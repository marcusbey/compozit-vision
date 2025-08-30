import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useJourneyStore } from '../../stores/journeyStore';
import { useContentStore } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { geminiVisionService } from '../../services/geminiVisionService';
import { 
  enhancedAIProcessingService, 
  DesignGenerationRequest, 
  ProcessingProgress,
  ReferenceInfluence,
  ColorPaletteInfluence 
} from '../../services/enhancedAIProcessingService';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { ValidationErrorDisplay } from '../../components/ValidationErrorDisplay';
import type { AIProcessingValidationData } from '../../types/validation';

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

const { width, height } = Dimensions.get('window');

interface ProcessingStage {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // seconds
  icon: keyof typeof Ionicons.glyphMap;
  status: 'pending' | 'active' | 'completed' | 'error';
}

const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'analyze-photo',
    title: 'Analyzing Your Photo',
    description: 'Understanding space layout, lighting, and architectural features',
    estimatedTime: 15,
    icon: 'camera',
    status: 'pending',
  },
  {
    id: 'analyze-references',
    title: 'Processing Your References',
    description: 'Analyzing your selected reference images and color palettes',
    estimatedTime: 25,
    icon: 'images',
    status: 'pending',
  },
  {
    id: 'generate-concepts',
    title: 'Generating Design Concepts',
    description: 'Creating personalized design variations using your influences',
    estimatedTime: 35,
    icon: 'color-palette',
    status: 'pending',
  },
  {
    id: 'apply-influences',
    title: 'Applying Your Influences',
    description: 'Incorporating reference styles, colors, and mood preferences',
    estimatedTime: 20,
    icon: 'brush',
    status: 'pending',
  },
  {
    id: 'final-rendering',
    title: 'Creating Final Design',
    description: 'Rendering high-quality visualizations with all influences applied',
    estimatedTime: 25,
    icon: 'create',
    status: 'pending',
  },
];

export const AIProcessingScreen: React.FC = () => {
  const journeyStore = useJourneyStore();
  const contentStore = useContentStore();
  
  const [stages, setStages] = useState<ProcessingStage[]>(PROCESSING_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(110); // Total estimated time
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [processingJob, setProcessingJob] = useState<ProcessingProgress | null>(null);
  const [canCancel, setCanCancel] = useState(true);
  const [showInfluenceDetails, setShowInfluenceDetails] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Initialize validation for this step
  const validation = useWizardValidation({
    stepId: 'aiProcessing',
    autoValidate: false,
    validateOnMount: false
  });
  
  // Animation values
  const progressAnimation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    startEnhancedProcessing();
    return () => {
      // Cleanup any ongoing processes
      if (jobId && canCancel) {
        enhancedAIProcessingService.cancelProcessingJob(jobId).catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Update estimated time remaining
        const currentStage = stages[currentStageIndex];
        if (currentStage && currentStage.status === 'active') {
          setEstimatedTimeRemaining(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, isPaused, currentStageIndex, stages]);

  // Helper function to check if all required data is present for AI processing
  const checkAllRequiredDataPresent = useCallback((): boolean => {
    const wizard = journeyStore.projectWizard;
    const project = journeyStore.project;
    
    // Enhanced photo validation with debugging
    const hasSelectedSamplePhoto = !!wizard.selectedSamplePhoto;
    const hasProjectPhotoUri = !!project.photoUri;
    const hasPhoto = hasSelectedSamplePhoto || hasProjectPhotoUri;
    
    console.log('🔍 Photo validation debug:');
    console.log('  - wizard.selectedSamplePhoto:', wizard.selectedSamplePhoto ? '✅ Present' : '❌ Missing');
    console.log('  - project.photoUri:', project.photoUri ? '✅ Present' : '❌ Missing');
    console.log('  - hasPhoto result:', hasPhoto ? '✅ Valid' : '❌ Invalid');
    
    if (!hasPhoto) {
      console.log('❌ Missing photo for AI processing - No photo URI found in either wizard.selectedSamplePhoto or project.photoUri');
      return false;
    }
    
    // Check style selection
    if (!wizard.styleId) {
      console.log('❌ Missing style selection for AI processing');
      return false;
    }
    
    // Check category
    if (!wizard.categoryType) {
      console.log('❌ Missing category for AI processing');
      return false;
    }
    
    // Check rooms
    if (!wizard.selectedRooms || wizard.selectedRooms.length === 0) {
      console.log('❌ Missing room selection for AI processing');
      return false;
    }
    
    console.log('✅ All required data present for AI processing');
    console.log('  - Photo source:', hasSelectedSamplePhoto ? 'selectedSamplePhoto' : 'project.photoUri');
    console.log('  - Style ID:', wizard.styleId);
    console.log('  - Category:', wizard.categoryType);
    console.log('  - Rooms:', wizard.selectedRooms);
    return true;
  }, [journeyStore.projectWizard, journeyStore.project]);

  const startEnhancedProcessing = useCallback(async () => {
    // First validate before starting processing
    setIsValidating(true);
    
    try {
      // Ensure we have the latest journey data from storage before validation
      console.log('🔄 Reloading journey data before AI processing validation...');
      await journeyStore.loadJourney();
      console.log('✅ Journey data reloaded successfully');
      
      // Prepare validation data
      const validationData: AIProcessingValidationData = {
        allRequiredDataPresent: checkAllRequiredDataPresent(),
        processingCreditsRequired: 5, // Base credit cost
        customPrompt: undefined,
        enhancementOptions: [],
        processingComplexity: 'advanced' as const
      };
      
      // Validate before proceeding
      const result = await validation.validateStep(validationData, 'onSubmit');
      
      if (!result.isValid) {
        console.log('❌ AI processing validation failed:', result.errors);
        setIsValidating(false);
        return;
      }
      
      setIsProcessing(true);
      setHasError(false);
      
      // Build request from journey and content stores
      const request = buildProcessingRequest();
      
      if (!request) {
        throw new Error('Unable to build processing request. Missing required data.');
      }
      
      // Start enhanced processing
      const newJobId = await enhancedAIProcessingService.startEnhancedDesignGeneration(request);
      setJobId(newJobId);
      
      // Update journey store
      journeyStore.updateProjectWizard({
        currentWizardStep: 'completed'
      });
      
      // Poll for progress updates
      startProgressPolling(newJobId);
      
    } catch (error: any) {
      console.error('Enhanced processing failed:', error);
      handleProcessingError(error);
    } finally {
      setIsValidating(false);
    }
  }, [journeyStore, contentStore, validation]);

  const buildProcessingRequest = (): DesignGenerationRequest | null => {
    const wizard = journeyStore.projectWizard;
    const content = contentStore;
    
    // Validate required data
    if (!wizard.selectedSamplePhoto && !journeyStore.project.photoUri) {
      console.error('No photo available for processing');
      return null;
    }
    
    if (!wizard.styleId || !wizard.categoryType || !wizard.selectedRooms) {
      console.error('Missing wizard selections');
      return null;
    }
    
    // Build reference influences
    const referenceInfluences: ReferenceInfluence[] = wizard.selectedReferences
      .map(refId => {
        const reference = content.userReferences.find(ref => ref.id === refId);
        if (!reference) return null;
        
        return {
          referenceId: refId,
          imageUrl: reference.image_url,
          styleInfluence: 0.8, // High influence for style elements
          colorInfluence: 0.6, // Medium influence for colors
          moodInfluence: 0.7,  // High influence for mood
        };
      })
      .filter(Boolean) as ReferenceInfluence[];
    
    // Build color palette influences
    const colorPaletteInfluences: ColorPaletteInfluence[] = (wizard.selectedPalettes || [])
      .map(paletteId => {
        const palette = content.userPalettes.find(p => p.id === paletteId);
        if (!palette) return null;
        
        return {
          paletteId,
          colors: palette.colors.colors, // Extract the string array from the colors object
          influence: 0.8,
          paletteType: 'primary' as const,
        };
      })
      .filter(Boolean) as ColorPaletteInfluence[];
    
    return {
      originalPhotoUrl: wizard.selectedSamplePhoto || journeyStore.project.photoUri!,
      categoryType: wizard.categoryType,
      selectedRooms: wizard.selectedRooms,
      styleId: wizard.styleId!,
      styleName: wizard.styleName || 'Modern',
      referenceInfluences,
      colorPaletteInfluences,
      processingMode: 'balanced',
      qualityLevel: 'standard',
      budgetRange: journeyStore.project.budgetRange ? {
        min: journeyStore.project.budgetRange.min,
        max: journeyStore.project.budgetRange.max
      } : undefined,
    };
  };

  const startProgressPolling = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progress = enhancedAIProcessingService.getProcessingStatus(jobId);
        
        if (!progress) {
          clearInterval(pollInterval);
          return;
        }
        
        setProcessingJob(progress);
        setOverallProgress(progress.progress);
        setEstimatedTimeRemaining(Math.ceil(progress.estimatedTimeRemainingMs / 1000));
        
        // Update stages based on progress status
        updateStagesFromProgress(progress);
        
        // Check if completed or failed
        if (progress.status === 'completed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setCanCancel(false);
          
          // Navigate to results after a brief delay
          setTimeout(() => {
            NavigationHelpers.navigateToScreen('results');
          }, 2000);
        } else if (progress.status === 'failed') {
          clearInterval(pollInterval);
          setHasError(true);
          setIsProcessing(false);
          handleProcessingError(new Error(progress.error || 'Processing failed'));
        }
        
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Store interval for cleanup
    (window as any).processingPollInterval = pollInterval;
  };
  
  const updateStagesFromProgress = (progress: ProcessingProgress) => {
    const stageMap: Record<string, string> = {
      'analyzing_photo': 'analyze-photo',
      'analyzing_references': 'analyze-references',
      'generating_concepts': 'generate-concepts',
      'applying_influences': 'apply-influences',
      'rendering': 'final-rendering',
    };
    
    const currentStageId = stageMap[progress.status] || progress.status;
    const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
    
    if (currentStageIndex >= 0) {
      setCurrentStageIndex(currentStageIndex);
      
      setStages(prev => prev.map((stage, idx) => ({
        ...stage,
        status: idx < currentStageIndex ? 'completed' : 
                idx === currentStageIndex ? 'active' : 'pending'
      })));
    }
  };

  const cancelProcessing = async () => {
    if (jobId && canCancel) {
      try {
        await enhancedAIProcessingService.cancelProcessingJob(jobId);
        setIsProcessing(false);
        setCanCancel(false);
        setHasError(true);
      } catch (error) {
        console.error('Error cancelling job:', error);
      }
    }
  };

  const retryProcessing = async () => {
    setHasError(false);
    setOverallProgress(0);
    setElapsedTime(0);
    setStages(PROCESSING_STAGES.map(stage => ({ ...stage, status: 'pending' })));
    await startEnhancedProcessing();
  };

  const processStage = async (stageIndex: number) => {
    return new Promise<void>((resolve, reject) => {
      setCurrentStageIndex(stageIndex);
      
      // Update stage status to active
      setStages(prev => prev.map((stage, idx) => ({
        ...stage,
        status: idx === stageIndex ? 'active' : 
                idx < stageIndex ? 'completed' : 'pending'
      })));
      
      const stage = stages[stageIndex];
      const stageDuration = stage.estimatedTime * 1000; // Convert to milliseconds
      
      // Simulate stage processing with gradual progress
      const progressInterval = stageDuration / 100;
      let stageProgress = 0;
      
      const interval = setInterval(() => {
        stageProgress += 1;
        const totalProgress = ((stageIndex * 20) + (stageProgress * 0.2));
        setOverallProgress(totalProgress);
        
        // Animate progress
        Animated.timing(progressAnimation, {
          toValue: totalProgress / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();
        
        if (stageProgress >= 100) {
          clearInterval(interval);
          
          // Mark stage as completed
          setStages(prev => prev.map((s, idx) => ({
            ...s,
            status: idx === stageIndex ? 'completed' : s.status
          })));
          
          resolve();
        }
      }, progressInterval);
    });
  };

  const handleProcessingError = (error: any) => {
    setHasError(true);
    setIsProcessing(false);
    
    setStages(prev => prev.map((stage, idx) => ({
      ...stage,
      status: idx === currentStageIndex ? 'error' : stage.status
    })));
  };

  const handleRetry = () => {
    retryProcessing();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    cancelProcessing();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProcessingHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {hasError ? 'Processing Failed' : 
           overallProgress === 100 ? 'Design Complete!' : 
           isProcessing ? 'Creating Your Design' : 'Preparing...'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {hasError ? 'Something went wrong during processing' :
           overallProgress === 100 ? 'Your personalized design is ready to view' :
           isProcessing ? 'AI is analyzing and generating your design' :
           'Setting up processing pipeline'}
        </Text>
      </View>
    </View>
  );


  const renderProgressCard = () => (
    <View style={styles.progressCard}>
      {/* Overall Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
        </View>
        
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        
        {/* Time Information */}
        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color={tokens.color.textMuted} />
            <Text style={styles.timeText}>Elapsed: {formatTime(elapsedTime)}</Text>
          </View>
          
          {estimatedTimeRemaining > 0 && (
            <View style={styles.timeItem}>
              <Ionicons name="hourglass-outline" size={16} color={tokens.color.textMuted} />
              <Text style={styles.timeText}>Remaining: ~{formatTime(estimatedTimeRemaining)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Current Stage Highlight */}
      {!hasError && currentStageIndex < stages.length && (
        <View style={styles.currentStageCard}>
          <View style={styles.currentStageHeader}>
            <Ionicons 
              name={stages[currentStageIndex].icon} 
              size={24} 
              color={tokens.color.brand} 
            />
            <Text style={styles.currentStageTitle}>
              {stages[currentStageIndex].title}
            </Text>
          </View>
          <Text style={styles.currentStageDescription}>
            {stages[currentStageIndex].description}
          </Text>
        </View>
      )}
    </View>
  );

  const renderInfluencesSummary = () => {
    const wizard = journeyStore.projectWizard;
    const content = contentStore;
    
    // Get selected references and palettes
    const selectedReferences = wizard.selectedReferences
      .map(refId => content.userReferences.find(ref => ref.id === refId))
      .filter(Boolean);
    
    const selectedPalettes = (wizard.selectedPalettes || [])
      .map(paletteId => content.userPalettes.find(p => p.id === paletteId))
      .filter(Boolean);
    
    if (selectedReferences.length === 0 && selectedPalettes.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.influencesCard}>
        <TouchableOpacity 
          style={styles.influencesHeader}
          onPress={() => setShowInfluenceDetails(!showInfluenceDetails)}
          activeOpacity={0.7}
        >
          <View style={styles.influencesHeaderContent}>
            <Ionicons name="color-palette" size={20} color={tokens.color.brand} />
            <Text style={styles.influencesTitle}>
              Your Design Influences ({selectedReferences.length + selectedPalettes.length})
            </Text>
          </View>
          <Ionicons 
            name={showInfluenceDetails ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={tokens.color.textSecondary} 
          />
        </TouchableOpacity>
        
        {showInfluenceDetails && (
          <View style={styles.influencesDetails}>
            {/* Reference Images */}
            {selectedReferences.length > 0 && (
              <View style={styles.influenceSection}>
                <Text style={styles.influenceSectionTitle}>
                  Reference Images ({selectedReferences.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.influenceItems}>
                    {selectedReferences.map((ref, index) => (
                      <View key={ref.id} style={styles.referenceItem}>
                        <View style={styles.referenceImageContainer}>
                          {/* Placeholder for reference image */}
                          <View style={styles.referenceImagePlaceholder}>
                            <Ionicons name="image" size={16} color={tokens.color.textMuted} />
                          </View>
                        </View>
                        <Text style={styles.referenceTitle} numberOfLines={1}>
                          {ref.title || `Reference ${index + 1}`}
                        </Text>
                        <View style={styles.influenceIndicators}>
                          <View style={styles.influenceIndicator}>
                            <Text style={styles.influenceLabel}>Style</Text>
                            <View style={styles.influenceBar}>
                              <View style={[styles.influenceBarFill, { width: '80%' }]} />
                            </View>
                          </View>
                          <View style={styles.influenceIndicator}>
                            <Text style={styles.influenceLabel}>Color</Text>
                            <View style={styles.influenceBar}>
                              <View style={[styles.influenceBarFill, { width: '60%' }]} />
                            </View>
                          </View>
                          <View style={styles.influenceIndicator}>
                            <Text style={styles.influenceLabel}>Mood</Text>
                            <View style={styles.influenceBar}>
                              <View style={[styles.influenceBarFill, { width: '70%' }]} />
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
            
            {/* Color Palettes */}
            {selectedPalettes.length > 0 && (
              <View style={styles.influenceSection}>
                <Text style={styles.influenceSectionTitle}>
                  Color Palettes ({selectedPalettes.length})
                </Text>
                <View style={styles.paletteItems}>
                  {selectedPalettes.map((palette, index) => (
                    <View key={palette.id} style={styles.paletteItem}>
                      <View style={styles.paletteColors}>
                        {palette.colors.slice(0, 4).map((color, colorIndex) => (
                          <View
                            key={colorIndex}
                            style={[styles.colorSwatch, { backgroundColor: color }]}
                          />
                        ))}
                        {palette.colors.length > 4 && (
                          <View style={styles.colorCount}>
                            <Text style={styles.colorCountText}>+{palette.colors.length - 4}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.paletteTitle} numberOfLines={1}>
                        {palette.name || `Palette ${index + 1}`}
                      </Text>
                      <View style={styles.paletteInfluence}>
                        <Text style={styles.influenceLabel}>Influence: Strong</Text>
                        <View style={styles.influenceBar}>
                          <View style={[styles.influenceBarFill, { width: '80%' }]} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.processingNote}>
              <Ionicons name="information-circle-outline" size={16} color={tokens.color.textMuted} />
              <Text style={styles.processingNoteText}>
                These influences will be analyzed and applied to create your personalized design.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStagesList = () => (
    <View style={styles.stagesSection}>
      <Text style={styles.stagesTitle}>Processing Stages</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {stages.map((stage, index) => (
          <StageItem
            key={stage.id}
            stage={stage}
            isActive={index === currentStageIndex}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsSection}>
      {hasError ? (
        <View style={styles.errorControls}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color={tokens.color.textInverse} />
            <Text style={styles.retryButtonText}>Retry Processing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => NavigationHelpers.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : overallProgress === 100 ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.viewResultsButton}
          onPress={() => NavigationHelpers.navigateToScreen('results')}
        >
          <Text style={styles.viewResultsButtonText}>View Your Design</Text>
          <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
        </TouchableOpacity>
      ) : (
        <View style={styles.processingControls}>
          <TouchableOpacity
            style={[styles.controlButton, isPaused && styles.controlButtonActive]}
            onPress={handlePause}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={20} 
              color={isPaused ? tokens.color.brand : tokens.color.textMuted} 
            />
            <Text style={styles.controlButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={20} color={tokens.color.error} />
            <Text style={[styles.controlButtonText, { color: tokens.color.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderProcessingHeader()}
      
      {/* Validation Errors */}
      {validation.validationResult && !validation.validationResult.isValid && !(isProcessing || isValidating) && (
        <ValidationErrorDisplay
          result={validation.validationResult}
          recoveryActions={validation.recoveryActions}
          onActionPress={validation.handleRecoveryAction}
          showSummary={true}
          style={styles.validationContainer}
        />
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProgressCard()}
        {renderInfluencesSummary()}
        {renderStagesList()}
      </ScrollView>
      
      {renderControls()}
      
      {/* Background Animation */}
      {isProcessing && !hasError && (
        <LinearGradient
          colors={[tokens.color.bgApp, `${tokens.color.brand}10`]}
          style={styles.backgroundGradient}
          pointerEvents="none"
        />
      )}
    </SafeAreaView>
  );
};

// Stage Item Component
interface StageItemProps {
  stage: ProcessingStage;
  isActive: boolean;
  index: number;
}

const StageItem: React.FC<StageItemProps> = ({ stage, isActive, index }) => {
  const getStatusColor = () => {
    switch (stage.status) {
      case 'completed': return tokens.color.success;
      case 'active': return tokens.color.brand;
      case 'error': return tokens.color.error;
      default: return tokens.color.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed': return 'checkmark-circle';
      case 'active': return 'ellipse';
      case 'error': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  return (
    <View style={[styles.stageItem, isActive && styles.activeStageItem]}>
      <View style={styles.stageIndicator}>
        <View style={[styles.stageNumber, { borderColor: getStatusColor() }]}>
          {stage.status === 'active' ? (
            <ActivityIndicator size="small" color={tokens.color.brand} />
          ) : (
            <Ionicons 
              name={getStatusIcon()} 
              size={16} 
              color={getStatusColor()} 
            />
          )}
        </View>
        
        {index < PROCESSING_STAGES.length - 1 && (
          <View style={[
            styles.stageConnector,
            stage.status === 'completed' && styles.completedConnector
          ]} />
        )}
      </View>
      
      <View style={styles.stageContent}>
        <View style={styles.stageHeader}>
          <Ionicons 
            name={stage.icon} 
            size={20} 
            color={getStatusColor()} 
          />
          <Text style={[styles.stageTitle, isActive && styles.activeStageTitleMark]}>
            {stage.title}
          </Text>
        </View>
        
        <Text style={styles.stageDescription}>
          {stage.description}
        </Text>
        
        <Text style={styles.stageTime}>
          ~{stage.estimatedTime}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  progressCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    marginVertical: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  progressSection: {
    marginBottom: tokens.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  progressTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  progressPercentage: {
    ...tokens.type.h2,
    color: tokens.color.brand,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.xs,
  },
  currentStageCard: {
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.brand,
  },
  currentStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  currentStageTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  currentStageDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  stagesSection: {
    marginVertical: tokens.spacing.lg,
  },
  stagesTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  stageItem: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.lg,
  },
  activeStageItem: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    marginHorizontal: -tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    ...tokens.shadow.e1,
  },
  stageIndicator: {
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
  },
  stageConnector: {
    width: 2,
    flex: 1,
    backgroundColor: tokens.color.borderSoft,
    marginTop: tokens.spacing.xs,
  },
  completedConnector: {
    backgroundColor: tokens.color.success,
  },
  stageContent: {
    flex: 1,
    paddingTop: tokens.spacing.xs,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  stageTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  activeStageTitleMark: {
    color: tokens.color.brand,
    fontWeight: '600',
  },
  stageDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  stageTime: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  controlsSection: {
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  errorControls: {
    gap: tokens.spacing.lg,
  },
  retryButton: {
    height: 52,
    backgroundColor: tokens.color.error,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  retryButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginLeft: tokens.spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  backButtonText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  viewResultsButton: {
    height: 52,
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  viewResultsButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  processingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  controlButtonActive: {
    borderColor: tokens.color.brand,
    backgroundColor: `${tokens.color.brand}10`,
  },
  controlButtonText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  
  // Influences Summary Styles
  influencesCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  influencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.lg,
  },
  influencesHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  influencesTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  influencesDetails: {
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    padding: tokens.spacing.lg,
  },
  influenceSection: {
    marginBottom: tokens.spacing.xl,
  },
  influenceSectionTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.md,
  },
  influenceItems: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  referenceItem: {
    width: 120,
    alignItems: 'center',
  },
  referenceImageContainer: {
    width: 100,
    height: 80,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing.sm,
    ...tokens.shadow.e1,
  },
  referenceImagePlaceholder: {
    flex: 1,
    backgroundColor: tokens.color.borderSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referenceTitle: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  influenceIndicators: {
    width: '100%',
  },
  influenceIndicator: {
    marginBottom: tokens.spacing.xs,
  },
  influenceLabel: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    fontSize: 10,
  },
  influenceBar: {
    height: 2,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 1,
    marginTop: 2,
  },
  influenceBarFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 1,
  },
  paletteItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
  },
  paletteItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  paletteColors: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.sm,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: tokens.radius.sm,
    marginRight: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  colorCount: {
    backgroundColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.sm,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCountText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    fontSize: 8,
  },
  paletteTitle: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  paletteInfluence: {
    alignItems: 'flex-start',
  },
  processingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.color.bgApp,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    marginTop: tokens.spacing.md,
  },
  processingNoteText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  validationContainer: {
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
});

export default AIProcessingScreen;