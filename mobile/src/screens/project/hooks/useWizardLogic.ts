import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Alert } from 'react-native';
import { CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '../../../stores/userStore';
import { useJourneyStore } from '../../../stores/journeyStore';
import { NavigationHelpers } from '../../../navigation/SafeJourneyNavigator';
import { 
  analyzeContext, 
  analyzeContextWithGemini, 
  ProjectContext, 
  FeatureId 
} from '../../../utils/contextAnalysis';
import contextAnalyticsService from '../../../services/contextAnalyticsService';
import promptOptimizationService from '../../../services/promptOptimizationService';
import imageGenerationService from '../../../services/imageGenerationService';
import imageVersionManager from '../../../services/imageVersionManager';

// Temporary PanelMode definition - should be moved to project constants
export type PanelMode = 'initial' | 'prompt' | 'processing' | 'category' | 'style' | 'reference' | 'results';
import { tokens } from '@theme';

export const useWizardLogic = () => {
  // Core state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('initial');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [customReferences, setCustomReferences] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  // Advanced state
  const [contextAnalysis, setContextAnalysis] = useState<any>(null);
  const [availableFeatures, setAvailableFeatures] = useState<FeatureId[]>([]);
  const [featureAnimations, setFeatureAnimations] = useState<Record<string, Animated.Value>>({});
  const [userOverrideContext, setUserOverrideContext] = useState<ProjectContext | null>(null);
  const [showContextOverride, setShowContextOverride] = useState(false);
  const [useGeminiAnalysis, setUseGeminiAnalysis] = useState(true);
  const [featureSelections, setFeatureSelections] = useState<Record<FeatureId, any>>({});

  // Animation refs
  const panelHeight = useRef(new Animated.Value(tokens.screen.height * 0.3)).current;
  const panelOpacity = useRef(new Animated.Value(1)).current;

  // Store references
  const userStore = useUserStore();
  const journeyStore = useJourneyStore();

  // Image handling functions
  const handleTakePhoto = useCallback(async () => {
    if (!userStore.user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access the camera and create AI-generated designs.',
        [
          { text: 'Sign In', onPress: () => setPanelMode('auth') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setShowCamera(true);
  }, [userStore.user]);

  const handleImportPhoto = useCallback(async () => {
    if (!userStore.user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to import photos and create AI-generated designs.',
        [
          { text: 'Sign In', onPress: () => setPanelMode('auth') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access to import images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setPanelMode('prompt');
    }
  }, [userStore.user]);

  const handleAddCustomReference = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access to import reference images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const newReference = {
        id: `custom-${Date.now()}`,
        uri: result.assets[0].uri,
        title: 'My Reference',
        category: 'custom'
      };
      setCustomReferences(prev => [...prev, newReference]);
    }
  }, []);

  // Main processing function
  const handleProcessImage = useCallback(async () => {
    if (!capturedImage || !userPrompt.trim()) {
      Alert.alert('Missing Information', 'Please capture an image and provide a description.');
      return;
    }

    if (!userStore.user) {
      Alert.alert('Authentication Required', 'Please sign in to process your image.');
      return;
    }

    const startTime = Date.now();
    setIsProcessing(true);
    setPanelMode('processing');

    try {
      console.log('🚀 Starting Two-Level AI Processing');
      console.log('📸 Using captured image:', capturedImage ? 'YES' : 'NO');
      console.log('📝 User prompt:', userPrompt);
      
      // LEVEL 1: Context Analysis & Feature Detection
      console.log('\n=== LEVEL 1: CONTEXT ANALYSIS ===');
      const startLevel1 = Date.now();
      
      const finalContext = userOverrideContext || contextAnalysis?.primaryContext || 'interior';
      
      console.log('🧠 Detected Context:', finalContext);
      console.log('🎯 Available Features:', availableFeatures);
      console.log('✅ Selected Features:', Object.keys(featureSelections));

      // LEVEL 2: Prompt Optimization & Image Generation
      console.log('\n=== LEVEL 2: PROMPT OPTIMIZATION ===');
      const startLevel2 = Date.now();
      
      const optimizationRequest = {
        userInput: userPrompt,
        context: finalContext,
        selectedFeatures: Object.entries(featureSelections)
          .filter(([_, value]) => value !== null && value !== undefined)
          .map(([feature, value]) => ({ feature: feature as FeatureId, value })),
        additionalPreferences: {
          category: selectedCategory,
          style: selectedStyle || undefined,
          capturedImage: capturedImage, // ADD THE IMAGE HERE!
        }
      };

      console.log('📋 Optimization Request:', JSON.stringify(optimizationRequest, null, 2));

      const optimizedPrompt = await promptOptimizationService.optimizePrompt(optimizationRequest);
      
      console.log('✨ Optimized Prompt:', optimizedPrompt.optimizedPrompt);
      console.log('🎨 Technical Adjustments:', optimizedPrompt.technicalAdjustments);

      // Image Generation
      console.log('\n=== IMAGE GENERATION ===');
      const provider = imageGenerationService.getDefaultProvider();
      
      const generationRequest = {
        prompt: optimizedPrompt,
        provider,
        parameters: {
          width: 1024,
          height: 1024,
          quality: 'hd' as const,
          inputImage: capturedImage // Pass the input image for transformation
        },
        userId: userStore.user?.id,
        sessionId: `session_${Date.now()}`
      };

      console.log('🖼️ Generation Request Parameters:', JSON.stringify({
        provider: generationRequest.provider,
        parameters: generationRequest.parameters,
        hasInputImage: !!generationRequest.parameters?.inputImage
      }, null, 2));

      const generatedImage = await imageGenerationService.generateImage(generationRequest);
      
      console.log('🎉 Generated Image:', {
        id: generatedImage.id,
        url: generatedImage.url,
        provider: generatedImage.provider,
        metadata: generatedImage.metadata
      });

      // Create session with imageVersionManager
      const session = await imageVersionManager.createSession(
        capturedImage,
        optimizedPrompt,
        finalContext,
        availableFeatures,
        userStore.user?.id
      );

      console.log('📚 Session Created:', session.id);

      // Update UI state
      setResultImage(generatedImage.url);
      setIsProcessing(false);
      
      // Save to journey store
      await journeyStore.updateProject({
        photoUri: capturedImage,
        prompt: userPrompt,
        category: selectedCategory,
        style: selectedStyle,
        referenceImages: selectedReferences,
        resultUri: generatedImage.url,
        optimizedPrompt: optimizedPrompt.optimizedPrompt,
        detectedContext: finalContext,
        selectedFeatures: availableFeatures,
        sessionId: session.id,
        imageId: generatedImage.id
      });

      // Track successful completion
      contextAnalyticsService.trackEvent('two_level_prompting_completed', {
        originalPromptLength: userPrompt.length,
        optimizedPromptLength: optimizedPrompt.optimizedPrompt.length,
        context: finalContext,
        featuresUsed: availableFeatures.length,
        provider: provider,
        totalProcessingTime: Date.now() - startTime,
        sessionId: session.id,
        imageId: generatedImage.id
      });

      // Show success with options
      Alert.alert(
        'Image Generated Successfully! 🎉', 
        'Your AI-generated design is ready! You can now refine it further or start a new project.',
        [
          { 
            text: 'Refine Image', 
            onPress: () => {
              NavigationHelpers.navigate('imageRefinement', {
                generatedImage,
                originalPrompt: optimizedPrompt,
                sessionId: session.id,
                context: finalContext,
                features: availableFeatures
              });
            }
          },
          { text: 'New Project', onPress: () => resetProject() },
          { text: 'Save & Continue', onPress: () => saveProject() },
        ]
      );

    } catch (error) {
      console.error('❌ Two-Level AI Processing Failed:', error);
      setIsProcessing(false);
      
      contextAnalyticsService.trackEvent('two_level_prompting_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userInput: userPrompt,
        processingTime: Date.now() - startTime
      });
      
      Alert.alert(
        'Processing Failed', 
        'We encountered an issue processing your request. Please try again or contact support if the problem persists.',
        [
          { text: 'Try Again', onPress: () => setPanelMode('prompt') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  }, [
    capturedImage, 
    userPrompt, 
    userStore.user, 
    userOverrideContext, 
    contextAnalysis, 
    availableFeatures, 
    featureSelections, 
    selectedCategory, 
    selectedStyle, 
    selectedReferences,
    journeyStore
  ]);

  // Helper functions
  const resetProject = useCallback(() => {
    setCapturedImage(null);
    setResultImage(null);
    setUserPrompt('');
    setSelectedCategory(null);
    setSelectedStyle(null);
    setSelectedReferences([]);
    setFeatureSelections({});
    setPanelMode('initial');
  }, []);

  const saveProject = useCallback(() => {
    NavigationHelpers.navigateToScreen('mainApp');
  }, []);

  const handleLogin = useCallback(() => {
    NavigationHelpers.navigateToScreen('auth');
  }, []);

  // Animation functions
  const animatePanelHeight = useCallback((toValue: number) => {
    Animated.timing(panelHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [panelHeight]);

  // Update panel height based on mode
  useEffect(() => {
    const hasImage = capturedImage || resultImage;
    
    switch (panelMode) {
      case 'initial':
        animatePanelHeight(tokens.screen.height * (hasImage ? 0.25 : 0.3));
        break;
      case 'prompt':
        animatePanelHeight(tokens.screen.height * (hasImage ? 0.35 : 0.4));
        break;
      case 'category':
      case 'style':
      case 'reference':
      case 'colorPalette':
      case 'budget':
      case 'furniture':
      case 'location':
      case 'materials':
      case 'texture':
        animatePanelHeight(tokens.screen.height * (hasImage ? 0.5 : 0.6));
        break;
      case 'processing':
        animatePanelHeight(tokens.screen.height * (hasImage ? 0.15 : 0.2));
        break;
      case 'auth':
        animatePanelHeight(tokens.screen.height * (hasImage ? 0.4 : 0.5));
        break;
    }
  }, [panelMode, capturedImage, resultImage, animatePanelHeight]);

  // Analyze user input in real-time
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const startTime = Date.now();
      
      if (userPrompt.trim()) {
        contextAnalyticsService.trackUserInput(userPrompt, true);
      }
      
      const analysis = useGeminiAnalysis 
        ? await analyzeContextWithGemini(userPrompt)
        : analyzeContext(userPrompt);
      
      const processingTime = Date.now() - startTime;
      
      contextAnalyticsService.trackContextAnalysis({
        userInput: userPrompt,
        detectedContext: analysis.primaryContext,
        confidence: analysis.confidence,
        analysisMethod: useGeminiAnalysis ? 'gemini' : 'keyword',
        suggestedFeatures: analysis.suggestedFeatures,
        processingTime
      });

      setContextAnalysis(analysis);
      setAvailableFeatures(analysis.suggestedFeatures);
      
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userPrompt, useGeminiAnalysis]);

  return {
    // State
    capturedImage,
    setCapturedImage,
    resultImage,
    setResultImage,
    showCamera,
    setShowCamera,
    panelMode,
    setPanelMode,
    userPrompt,
    setUserPrompt,
    selectedCategory,
    setSelectedCategory,
    selectedStyle,
    setSelectedStyle,
    selectedReferences,
    setSelectedReferences,
    customReferences,
    setCustomReferences,
    isProcessing,
    setIsProcessing,
    facing,
    setFacing,
    
    // Advanced state
    contextAnalysis,
    setContextAnalysis,
    availableFeatures,
    setAvailableFeatures,
    featureAnimations,
    setFeatureAnimations,
    userOverrideContext,
    setUserOverrideContext,
    showContextOverride,
    setShowContextOverride,
    useGeminiAnalysis,
    setUseGeminiAnalysis,
    featureSelections,
    setFeatureSelections,

    // Animation refs
    panelHeight,
    panelOpacity,

    // Store references
    userStore,
    journeyStore,

    // Functions
    handleTakePhoto,
    handleImportPhoto,
    handleAddCustomReference,
    handleProcessImage,
    resetProject,
    saveProject,
    handleLogin,
    animatePanelHeight,
  };
};