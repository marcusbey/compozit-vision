import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { tokens } from '../../theme/tokens';

// 🚀 NEW: Import our AI service
import { getGeminiService, RoomAnalysisInput, DesignRecommendation } from '../../services/geminiService';

const { width } = Dimensions.get('window');

interface ProcessingScreenProps {
  navigation?: any;
  route?: any;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  result?: DesignRecommendation;
  error?: string;
  processingTime?: number;
  useRealAI: boolean;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ navigation, route }) => {
  // 🚀 NEW: Real AI processing state
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: 'Ready to analyze your space',
    useRealAI: true, // Toggle between real AI and mock processing
  });
  
  const [customPrompt, setCustomPrompt] = useState('');
  const progressAnim = new Animated.Value(0);
  
  // Get data from stores if route params not provided
  const journeyStore = useJourneyStore();
  const { user } = useUserStore();
  
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems, capturedImage } = route?.params || {
    projectName: journeyStore.projectName || 'My Project',
    roomType: journeyStore.roomType || 'living_room',
    selectedStyle: journeyStore.selectedStyle || 'modern',
    budgetRange: journeyStore.budgetRange || '$1000-$5000',
    selectedItems: journeyStore.selectedItems || [],
    capturedImage: journeyStore.capturedImage || null
  };

  const mockProcessingSteps = [
    'Analyzing your space...',
    'Detecting room elements...',
    'Applying AI transformation...',
    'Matching furniture styles...',
    'Generating design options...',
    'Finalizing your design...',
  ];

  useEffect(() => {
    journeyStore.setCurrentStep(10, 'processing');
    
    // Auto-start processing when screen loads
    if (processingState.useRealAI && capturedImage) {
      handleStartRealAIProcessing();
    } else {
      handleStartMockProcessing();
    }
  }, []);

  // 🚀 NEW: Real AI Processing Function
  const handleStartRealAIProcessing = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No room image found. Please go back and capture a photo.');
      return;
    }

    setProcessingState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 10,
      currentStep: 'Initializing AI processing...',
    }));

    try {
      const geminiService = getGeminiService();

      // Step 1: Prepare input
      setProcessingState(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Preparing image for analysis...',
      }));

      // Convert image URI to base64 if needed
      let imageData = capturedImage;
      if (typeof capturedImage === 'string' && !capturedImage.startsWith('data:image/')) {
        // In real implementation, convert file URI to base64
        imageData = `data:image/jpeg;base64,${capturedImage}`;
      }

      const analysisInput: RoomAnalysisInput = {
        imageData,
        roomDimensions: {
          width: 4, // Default dimensions - in real app, get from AR measurement
          height: 3,
          length: 5,
          roomType: roomType || 'living-room',
          lightingSources: ['window', 'ceiling-light'],
        },
        stylePreferences: {
          primaryStyle: selectedStyle || 'modern',
          colors: ['white', 'gray', 'beige'],
          budget: budgetRange || '5000-10000',
          preferredMaterials: ['wood', 'fabric', 'metal'],
        },
        customPrompt: customPrompt || 'Create a functional and aesthetically pleasing design',
      };

      // Step 2: AI Analysis
      setProcessingState(prev => ({
        ...prev,
        progress: 50,
        currentStep: 'AI is analyzing your room...',
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
        currentStep: 'AI analysis complete!',
        result: result.data,
        processingTime: endTime - startTime,
        useRealAI: true,
      });

      // Navigate to results after showing success
      setTimeout(() => {
        if (navigation?.navigate) {
          navigation.navigate('results', {
            projectName,
            roomType,
            selectedStyle,
            budgetRange,
            selectedItems,
            capturedImage,
            aiDesignData: result.data, // 🚀 Pass real AI results
          });
        } else {
          NavigationHelpers.navigateToScreen('results');
        }
      }, 2000);

    } catch (error) {
      console.error('AI Processing Error:', error);
      
      setProcessingState({
        isProcessing: false,
        progress: 0,
        currentStep: 'Processing failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        useRealAI: true,
      });

      Alert.alert(
        'AI Processing Failed',
        error instanceof Error ? error.message : 'An unknown error occurred',
        [
          { text: 'Use Mock Processing', onPress: () => {
            setProcessingState(prev => ({ ...prev, useRealAI: false }));
            handleStartMockProcessing();
          }},
          { text: 'Retry AI', onPress: handleStartRealAIProcessing },
          { text: 'Cancel' }
        ]
      );
    }
  };

  // Original mock processing (fallback)
  const handleStartMockProcessing = () => {
    setProcessingState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      currentStep: mockProcessingSteps[0],
      useRealAI: false,
    }));

    const interval = setInterval(() => {
      setProcessingState(prev => {
        const newProgress = prev.progress + Math.random() * 15 + 5;
        const stepIndex = Math.floor((newProgress / 100) * mockProcessingSteps.length);
        const currentStep = mockProcessingSteps[Math.min(stepIndex, mockProcessingSteps.length - 1)];
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (navigation?.navigate) {
              navigation.navigate('results', {
                projectName,
                roomType,
                selectedStyle,
                budgetRange,
                selectedItems,
                capturedImage,
              });
            } else {
              NavigationHelpers.navigateToScreen('results');
            }
          }, 1000);
          return { ...prev, progress: 100, currentStep: 'Design complete!', isProcessing: false };
        }
        return { ...prev, progress: newProgress, currentStep };
      });
    }, 800);
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: processingState.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [processingState.progress]);

  // Reset welcome screen for testing
  const handleResetWelcome = () => {
    Alert.alert(
      'Reset Welcome Screen', 
      'This will clear the welcome flag and restart the app from the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('hasSeenWelcome');
              await AsyncStorage.clear();
              console.log('✅ Welcome screen reset - app will restart from welcome');
              Alert.alert('Success', 'Please reload the app to see the welcome screen');
            } catch (error) {
              console.error('Error resetting welcome:', error);
              Alert.alert('Error', 'Failed to reset welcome screen');
            }
          }
        }
      ]
    );
  };

  // 🚀 NEW: Toggle between AI modes
  const handleToggleAIMode = () => {
    Alert.alert(
      'Switch Processing Mode',
      `Currently using: ${processingState.useRealAI ? 'Real AI Processing' : 'Mock Processing'}\n\nSwitch to ${processingState.useRealAI ? 'mock' : 'real AI'} processing?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            setProcessingState(prev => ({
              ...prev,
              useRealAI: !prev.useRealAI,
              isProcessing: false,
              progress: 0,
              currentStep: 'Ready to analyze your space',
              error: undefined,
              result: undefined,
            }));
          }
        }
      ]
    );
  };

  // 🚀 NEW: Render AI results preview
  const renderAIResults = () => {
    if (!processingState.result) return null;

    const { result } = processingState;

    return (
      <View style={styles.resultsPreview}>
        <LinearGradient
          colors={[tokens.colors.background.secondary, tokens.colors.background.tertiary]}
          style={styles.resultsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.resultsTitle}>AI Analysis Complete!</Text>
          
          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <View style={styles.confidenceBar}>
              <LinearGradient
                colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT]}
                style={[styles.confidenceFill, { width: `${(result.confidenceScore || 0) * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round((result.confidenceScore || 0) * 100)}%
            </Text>
          </View>

          <Text style={styles.conceptText} numberOfLines={3}>
            {result.overallDesignConcept}
          </Text>
          
          <Text style={styles.furnitureCount}>
            {result.furniture?.length || 0} furniture recommendations
          </Text>

          {processingState.processingTime && (
            <Text style={styles.timeText}>
              Processed in {processingState.processingTime}ms
            </Text>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />
      
      <LinearGradient
        colors={[tokens.colors.background.primary, tokens.colors.background.tertiary]}
        style={styles.gradient}
      >
        {/* Header with AI mode indicator */}
        <View style={styles.header}>
          <View style={styles.tagsContainer}>
            <TouchableOpacity style={styles.tag} onPress={handleToggleAIMode}>
              <Ionicons 
                name={processingState.useRealAI ? "flash" : "flash-off"} 
                size={16} 
                color="#D4A574" 
              />
              <Text style={styles.tagText}>
                {processingState.useRealAI ? 'Real AI' : 'Mock'}
              </Text>
            </TouchableOpacity>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{selectedStyle}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{roomType}</Text>
            </View>
          </View>
          
          {/* Development Reset Button */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.devResetButton}
              onPress={handleResetWelcome}
            >
              <Text style={styles.devResetText}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollContainer}>
          {/* Custom Prompt Input */}
          {processingState.useRealAI && !processingState.isProcessing && !processingState.result && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptLabel}>Custom Design Instructions (Optional)</Text>
              <TextInput
                style={styles.promptInput}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                placeholder="e.g., Focus on maximizing natural light and storage..."
                multiline
                numberOfLines={3}
                placeholderTextColor={tokens.colors.text.tertiary}
              />
            </View>
          )}

          {/* Room Illustration */}
          <View style={styles.roomIllustration}>
            <LinearGradient
              colors={[tokens.colors.background.secondary, tokens.colors.background.tertiary]}
              style={styles.roomContainer}
            >
              {/* Simulation of room being analyzed */}
              <View style={styles.room}>
                <View style={styles.wall}>
                  <View style={styles.artwork} />
                </View>
                <View style={styles.furniture}>
                  <View style={[styles.sofa, { opacity: processingState.progress > 30 ? 1 : 0.3 }]} />
                  <View style={[styles.coffeeTable, { opacity: processingState.progress > 50 ? 1 : 0.3 }]} />
                  <View style={[styles.lamp, { opacity: processingState.progress > 70 ? 1 : 0.3 }]} />
                </View>
                <View style={[styles.rug, { opacity: processingState.progress > 40 ? 1 : 0.3 }]} />
              </View>
              
              {/* Analysis overlay with scan effect */}
              {processingState.isProcessing && (
                <View style={styles.analysisOverlay}>
                  <Animated.View 
                    style={[
                      styles.scanLine,
                      {
                        transform: [{
                          translateY: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: [0, 200],
                          })
                        }]
                      }
                    ]}
                  />
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Processing Status */}
          <Text style={styles.processingTitle}>
            {processingState.currentStep}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFillContainer,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]}
              >
                <LinearGradient
                  colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>
              {Math.round(processingState.progress)}%
            </Text>
          </View>

          {/* Processing Indicator */}
          {processingState.isProcessing && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator 
                size="large" 
                color={tokens.colors.primary.DEFAULT}
                style={styles.spinner}
              />
              <View style={styles.processingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          )}

          {/* Error Display */}
          {processingState.error && (
            <View style={styles.errorContainer}>
              <LinearGradient
                colors={[tokens.colors.background.secondary, tokens.colors.background.tertiary]}
                style={styles.errorCard}
              >
                <Text style={styles.errorTitle}>Processing Error</Text>
                <Text style={styles.errorText}>{processingState.error}</Text>
                
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={processingState.useRealAI ? handleStartRealAIProcessing : handleStartMockProcessing}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT]}
                    style={styles.retryButtonGradient}
                  >
                    <Text style={styles.retryButtonText}>Retry Processing</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* AI Results Preview */}
          {renderAIResults()}

          {/* Project Info */}
          <View style={styles.projectInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="home-outline" size={20} color="#D4A574" />
              <Text style={styles.infoText}>{roomType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="color-palette-outline" size={20} color="#D4A574" />
              <Text style={styles.infoText}>{selectedStyle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color="#D4A574" />
              <Text style={styles.infoText}>{budgetRange}</Text>
            </View>
          </View>

          {/* Encouragement */}
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>
              {processingState.useRealAI ? 'AI is creating your perfect space...' : 'Creating your perfect space...'}
            </Text>
            <Text style={styles.encouragementSubtext}>
              {processingState.useRealAI ? 'Real AI analysis in progress' : 'This usually takes 30-60 seconds'}
            </Text>
          </View>

          {/* Start Processing Button */}
          {!processingState.isProcessing && !processingState.result && !processingState.error && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={processingState.useRealAI ? handleStartRealAIProcessing : handleStartMockProcessing}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[tokens.colors.primary.light, tokens.colors.primary.DEFAULT]}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>
                  Start {processingState.useRealAI ? 'AI' : 'Mock'} Processing
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 140, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  tagText: {
    fontSize: 14,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '500',
    marginLeft: 5,
  },
  
  // Custom Prompt Styles
  promptContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  promptLabel: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  promptInput: {
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  roomIllustration: {
    width: width * 0.8,
    height: 250,
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  roomContainer: {
    flex: 1,
    position: 'relative',
  },
  room: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  wall: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: tokens.colors.background.tertiary,
  },
  artwork: {
    position: 'absolute',
    top: 10,
    right: 30,
    width: 40,
    height: 30,
    backgroundColor: tokens.colors.text.primary,
    borderRadius: 4,
  },
  furniture: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 80,
  },
  sofa: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    width: 80,
    height: 40,
    backgroundColor: tokens.colors.text.secondary,
    borderRadius: 8,
  },
  coffeeTable: {
    position: 'absolute',
    bottom: 0,
    left: 100,
    width: 40,
    height: 20,
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: 4,
  },
  lamp: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 15,
    height: 50,
    backgroundColor: tokens.colors.text.secondary,
    borderRadius: 2,
  },
  rug: {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    height: 15,
    backgroundColor: tokens.colors.primary.light,
    borderRadius: 8,
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(201, 169, 140, 0.1)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: tokens.colors.primary.DEFAULT,
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFillContainer: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.primary.DEFAULT,
  },

  // Spinner Styles
  spinnerContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    backgroundColor: tokens.colors.primary.DEFAULT,
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

  // Error Styles
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorCard: {
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    alignItems: 'center',
    ...tokens.shadows.elevation2,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  errorTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.status.error,
    marginBottom: tokens.spacing.lg,
  },
  errorText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  retryButton: {
    height: 48,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.pill,
    ...tokens.shadows.elevation3,
  },
  retryButtonGradient: {
    height: '100%',
    borderRadius: tokens.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  retryButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },

  // AI Results Preview Styles
  resultsPreview: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultsCard: {
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.xl,
    alignItems: 'center',
    ...tokens.shadows.elevation2,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  resultsTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  },
  confidenceContainer: {
    width: '100%',
    marginBottom: tokens.spacing.lg,
  },
  confidenceLabel: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: tokens.colors.border.light,
    borderRadius: tokens.borderRadius.pill,
    overflow: 'hidden',
    marginBottom: tokens.spacing.xs,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: tokens.borderRadius.pill,
  },
  confidenceText: {
    ...tokens.typography.body,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
    textAlign: 'right',
  },
  conceptText: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  furnitureCount: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  timeText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.tertiary,
  },

  projectInfo: {
    marginHorizontal: 20,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: tokens.colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  encouragementContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  encouragementSubtext: {
    fontSize: 14,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },

  // Start Button Styles
  startButton: {
    marginHorizontal: 20,
    height: 54,
    borderRadius: tokens.borderRadius.pill,
    ...tokens.shadows.elevation3,
    marginBottom: 40,
  },
  startButtonGradient: {
    height: '100%',
    borderRadius: tokens.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },

  devResetButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devResetText: {
    fontSize: 18,
    color: tokens.colors.status.error,
  },
});

export default ProcessingScreen;