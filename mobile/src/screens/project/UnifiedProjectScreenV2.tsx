import { CameraSection } from '@components/camera/CameraSection';
import { UnifiedPanel } from '@components/panels/UnifiedPanel';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokens } from '@theme';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ScrollView
} from 'react-native';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { FeatureId } from '../../utils/contextAnalysis';
import { EnhancedProject, ClientInfo, ProjectBudget } from '../../types/project';
import { useUserStore } from '../../stores/userStore';
import { correctedTwoStepGenerationService, UserInteractionData } from '../../services/correctedTwoStepGenerationService';
import { ProfessionalToolsOverlay } from './components/ProfessionalToolsOverlay';
import { ProjectContextHeader } from './components/ProjectContextHeader';
import { ExportModal } from './components/ExportModal';

const GALLERY_STORAGE_KEY = '@user_gallery';

interface ProjectContextProps {
  projectId?: string;
  clientInfo?: ClientInfo;
  projectBudget?: ProjectBudget;
  projectStyle?: string[];
}

interface UnifiedProjectScreenV2Props {
  navigation?: any;
  route?: any;
}

interface ProjectContext {
  id: string;
  name: string;
  client?: ClientInfo;
  style: string[];
  roomType: string;
  budget?: ProjectBudget;
  constraints?: {
    maxBudget?: number;
    preferredStyles?: string[];
    roomRequirements?: string[];
  };
}

export default function UnifiedProjectScreenV2({ navigation, route }: UnifiedProjectScreenV2Props) {
  // Authentication store
  const { user } = useUserStore();
  
  // Extract project context from route params
  const { projectId, clientInfo, projectBudget, projectStyle } = (route?.params || {}) as ProjectContextProps;
  
  // Gallery State
  const [userGallery, setUserGallery] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // UI State
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');

  // Transform State
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Professional Features State
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMeasurementTools, setShowMeasurementTools] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);

  // AI Generation State
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureId[]>([]);
  const [generationMetadata, setGenerationMetadata] = useState<any>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // User Interaction State for Corrected 2-Step Process
  const [locationClicks, setLocationClicks] = useState<{ x: number; y: number; description?: string }[]>([]);
  const [referenceImages, setReferenceImages] = useState<{ url: string; description: string; type: string }[]>([]);
  const [colorPalette, setColorPalette] = useState<string[]>(['#0A0A0A', '#D4A574', '#FFFFFF']);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number; currency: string }>({ min: 1000, max: 10000, currency: 'USD' });
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['wood', 'fabric']);
  const [selectedLighting, setSelectedLighting] = useState<string>('natural');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('living_room');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Modern']);

  // Features with professional context
  const availableFeatures: FeatureId[] = ['colorPalette', 'budget', 'furniture', 'materials', 'lighting', 'layout'];

  // Load user gallery and project context on mount
  useEffect(() => {
    loadUserGallery();
    loadProjectContext();
  }, [projectId]);

  // Handle generation resume after authentication
  useEffect(() => {
    const resumeData = route?.params?.resumeGeneration;
    if (resumeData && user) {
      // Restore generation state
      setSelectedImage(resumeData.image);
      setUserPrompt(resumeData.prompt);
      if (resumeData.context) {
        setProjectContext(resumeData.context);
      }
      
      // Auto-trigger generation after brief delay
      setTimeout(() => {
        handleProcess();
      }, 500);
      
      // Clear params to prevent re-trigger
      navigation.setParams({ resumeGeneration: null });
    }
  }, [route?.params?.resumeGeneration, user]);

  const loadProjectContext = async () => {
    if (projectId) {
      try {
        // In a real app, this would fetch from your API/database
        const mockProjectContext: ProjectContext = {
          id: projectId,
          name: 'Modern Living Room Redesign',
          client: clientInfo || {
            name: 'John & Jane Smith',
            email: 'smith.family@email.com',
          },
          style: projectStyle || ['modern', 'minimalist'],
          roomType: 'living room',
          budget: projectBudget || {
            total: 15000,
            spent: 3500,
            currency: 'USD',
          },
          constraints: {
            maxBudget: 20000,
            preferredStyles: ['modern', 'scandinavian'],
            roomRequirements: ['pet-friendly', 'kid-safe'],
          },
        };
        setProjectContext(mockProjectContext);
      } catch (error) {
        console.error('Error loading project context:', error);
      }
    }
  };

  const loadUserGallery = async () => {
    try {
      const savedGallery = await AsyncStorage.getItem(GALLERY_STORAGE_KEY);
      if (savedGallery) {
        setUserGallery(JSON.parse(savedGallery));
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const saveUserGallery = async (gallery: string[]) => {
    try {
      await AsyncStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery));
    } catch (error) {
      console.error('Error saving gallery:', error);
    }
  };

  const handleAddImage = (uri: string) => {
    const newGallery = [uri, ...userGallery];
    setUserGallery(newGallery);
    setSelectedImage(uri);
    saveUserGallery(newGallery);
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handleImportPhoto = async () => {
    // Import photo logic here (using ImagePicker)
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
    });

    if (!result.canceled) {
      handleAddImage(result.assets[0].uri);
    }
  };

  const handlePhotoTaken = (uri: string) => {
    handleAddImage(uri);
    setShowCamera(false);
  };

  const handleProcess = async () => {
    if (!selectedImage || !userPrompt.trim()) return;

    // 🔐 AUTHENTICATION CHECK BEFORE GENERATION
    if (!user) {
      // Navigate to authentication screen with generation context
      navigation.navigate('auth', {
        from: 'generation',
        nextScreen: 'Create',
        message: 'Sign in to generate your design and save your results',
        preserveGeneration: {
          image: selectedImage,
          prompt: userPrompt,
          context: projectContext
        }
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 Starting CORRECTED 2-step AI generation process...');

      // Create complete user interaction data for the corrected flow
      const userInteractionData: UserInteractionData = {
        userPrompt,
        originalImage: selectedImage,
        locationClicks: locationClicks.length > 0 ? locationClicks : undefined,
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
        selectedFeatures: {
          colorPalette,
          priceRange,
          materials: selectedMaterials,
          lighting: selectedLighting,
          roomType: selectedRoomType,
          style: selectedStyles
        },
        projectContext: projectContext ? {
          clientName: projectContext.client?.name,
          timeline: projectContext.timeline,
          constraints: projectContext.constraints?.roomRequirements
        } : undefined,
        sessionId,
        userId: user.id
      };

      console.log('📋 User interaction data prepared:', {
        promptLength: userPrompt.length,
        hasLocationClicks: !!locationClicks.length,
        hasReferenceImages: !!referenceImages.length,
        colorPaletteCount: colorPalette.length,
        selectedStyles: selectedStyles.join(', '),
        priceRange: `$${priceRange.min}-${priceRange.max}`
      });

      // Validate interaction data
      const validation = correctedTwoStepGenerationService.validateUserInteractionData(userInteractionData);
      if (!validation.valid) {
        throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
      }

      // Call corrected 2-step generation service
      const result = await correctedTwoStepGenerationService.processCompleteGeneration(userInteractionData);

      if (result.success && result.data) {
        // Update UI with generated image
        setResultImage(result.data.generatedDesign.generatedImage.url);
        setGenerationMetadata(result.data);

        console.log('✅ Corrected 2-step generation completed successfully:', {
          step1Duration: result.data.steps.step1Duration,
          step2Duration: result.data.steps.step2Duration,
          totalTime: result.data.totalProcessingTime,
          fallbackUsed: result.data.enhancedPromptResult.fallbackUsed
        });

        // Show success message with processing details
        const styleText = selectedStyles.join(' & ') || 'custom';
        const processingTimeSeconds = Math.round(result.data.totalProcessingTime / 1000);
        
        Alert.alert(
          '✨ Design Generated Successfully!',
          `Your ${styleText} design transformation is ready.\n\n` +
          `Step 1 (Prompt): ${Math.round(result.data.steps.step1Duration / 1000)}s\n` +
          `Step 2 (Image): ${Math.round(result.data.steps.step2Duration / 1000)}s\n` +
          `Total time: ${processingTimeSeconds}s`,
          [
            { text: 'View Result', onPress: () => handleViewResult() },
            { text: 'Refine Design', onPress: () => handleRefinementMode() },
            { text: 'Export', onPress: () => setShowExportModal(true) }
          ]
        );

      } else {
        throw new Error(result.error || 'Generation failed');
      }

    } catch (error) {
      console.error('❌ Corrected 2-step generation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      Alert.alert(
        'Generation Failed',
        `Unable to generate your design: ${errorMessage}`,
        [
          { text: 'Retry', onPress: () => handleProcess() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get selected features from UI state
  const getSelectedFeatures = (): FeatureId[] => {
    // TODO: This should come from UI selection state
    // For now, return default features based on project context
    const defaultFeatures: FeatureId[] = ['lighting', 'materials'];
    
    if (projectContext?.budget) {
      defaultFeatures.push('budget');
    }
    
    if (projectContext?.style) {
      defaultFeatures.push('colorPalette');
    }
    
    return [...new Set([...selectedFeatures, ...defaultFeatures])];
  };

  // Helper function to handle viewing result
  const handleViewResult = () => {
    console.log('📱 Viewing generation result');
    // TODO: Navigate to detailed result view or expand current view
    // Could show metadata, allow refinements, etc.
  };

  // Helper function to handle refinement mode
  const handleRefinementMode = () => {
    console.log('🔧 Entering refinement mode');
    // TODO: Show refinement UI - simple text input for direct prompts
    // "Make the lighting warmer", "Change sofa color to blue", etc.
  };

  // Helper function to handle location clicks on image
  const handleImageClick = (x: number, y: number) => {
    console.log('📍 Image clicked at:', x, y);
    
    // Add location click with user description
    Alert.prompt(
      'Focus Area',
      'What would you like to change in this area?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Focus',
          onPress: (description) => {
            if (description) {
              setLocationClicks(prev => [...prev, { x, y, description }]);
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  // Helper function to add reference image
  const handleAddReferenceImage = async () => {
    console.log('📸 Adding reference image');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        Alert.prompt(
          'Reference Image',
          'How should this image inspire the design?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Reference',
              onPress: (description) => {
                if (description) {
                  setReferenceImages(prev => [...prev, {
                    url: result.assets[0].uri,
                    description,
                    type: 'style' // TODO: Let user choose type
                  }]);
                }
              }
            }
          ],
          'plain-text',
          'Style inspiration from this image',
          'default'
        );
      }
    } catch (error) {
      console.error('Reference image selection failed:', error);
    }
  };

  // Helper function to clear location clicks
  const handleClearLocationClicks = () => {
    setLocationClicks([]);
  };

  // Helper function to clear reference images
  const handleClearReferenceImages = () => {
    setReferenceImages([]);
  };

  const buildEnhancedPrompt = (userPrompt: string, context: ProjectContext | null): string => {
    if (!context) return userPrompt;
    
    const contextualPrompt = [
      userPrompt,
      `Style: ${context.style.join(', ')}`,
      `Room: ${context.roomType}`,
      context.budget ? `Budget: $${context.budget.total}` : '',
      context.constraints?.preferredStyles ? `Preferred styles: ${context.constraints.preferredStyles.join(', ')}` : '',
      context.constraints?.roomRequirements ? `Requirements: ${context.constraints.roomRequirements.join(', ')}` : '',
    ].filter(Boolean).join(' | ');
    
    return contextualPrompt;
  };

  const handleFeaturePress = (feature: FeatureId) => {
    // Navigate to feature-specific configuration with project context
    console.log('Configure feature:', feature, 'for project:', projectContext?.id);
    
    // Pass project context to feature panels
    const featureConfig = {
      projectId: projectContext?.id,
      clientConstraints: projectContext?.constraints,
      budget: projectContext?.budget,
      style: projectContext?.style,
    };
    
    // TODO: Navigate to enhanced feature panels
    console.log('Feature config:', featureConfig);
  };

  const handleMeasurementToggle = () => {
    setShowMeasurementTools(!showMeasurementTools);
  };

  const handleAnnotationAdd = (annotation: any) => {
    setAnnotations([...annotations, { ...annotation, id: Date.now() }]);
  };

  const handleMeasurementAdd = (measurement: any) => {
    setMeasurements([...measurements, { ...measurement, id: Date.now() }]);
  };

  const handleExportPress = () => {
    setShowExportModal(true);
  };

  const handleClientPresentationExport = () => {
    console.log('Export for client presentation');
    // TODO: Generate clean export for client viewing
  };

  const handleTechnicalExport = () => {
    console.log('Export technical specifications');
    // TODO: Generate detailed technical export
  };

  const handleBack = () => {
    if (resultImage) {
      setResultImage(null);
      setUserPrompt('');
    } else {
      NavigationHelpers.goBack();
    }
  };

  const handleReset = () => {
    setResultImage(null);
    setUserPrompt('');
    setSelectedImage(null);
  };

  // Show camera if active
  if (showCamera) {
    return (
      <CameraSection
        facing={facing}
        setFacing={setFacing}
        onPhotoTaken={handlePhotoTaken}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  const displayImage = resultImage || selectedImage;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Project Context Header */}
      {projectContext && (
        <ProjectContextHeader 
          projectContext={projectContext}
          onSettingsPress={() => console.log('Open project settings')}
        />
      )}

      {/* Image Display Area (tap to dismiss keyboard) */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.imageContainer}>
        {displayImage ? (
          <>
            <Image
              source={{ uri: displayImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent']}
              style={styles.headerGradient}
            />

            {/* Header Controls */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleExportPress}
                >
                  <Ionicons name="share" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                {displayImage && (
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleReset}
                  >
                    <Ionicons name="refresh" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Professional Tools Overlay */}
            <ProfessionalToolsOverlay
              onMeasurePress={handleMeasurementToggle}
              onAnnotatePress={() => console.log('Add annotation')}
              onExportPress={handleExportPress}
              showMeasurementTools={showMeasurementTools}
              annotations={annotations}
              measurements={measurements}
              onAnnotationAdd={handleAnnotationAdd}
              onMeasurementAdd={handleMeasurementAdd}
            />
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={64} color={tokens.color.textMuted} />
            <Text style={styles.noImageText}>Select an image to start designing</Text>
            {projectContext && (
              <Text style={styles.noImageSubtext}>
                Creating designs for {projectContext.name}
              </Text>
            )}
          </View>
        )}
      </View>
      </TouchableWithoutFeedback>

      {/* Enhanced Unified Panel with Professional Context */}
      <UnifiedPanel
        userGallery={userGallery}
        selectedImage={selectedImage}
        onImageSelect={setSelectedImage}
        onAddImage={handleAddImage}
        onTakePhoto={handleTakePhoto}
        onImportPhoto={handleImportPhoto}
        userPrompt={userPrompt}
        onPromptChange={setUserPrompt}
        onProcess={handleProcess}
        availableFeatures={availableFeatures}
        onFeaturePress={handleFeaturePress}
        isProcessing={isProcessing}
        projectContext={projectContext}
        professionalMode={true}
      />

      {/* Professional Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onClientExport={handleClientPresentationExport}
        onTechnicalExport={handleTechnicalExport}
        projectContext={projectContext}
        imageUri={displayImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
    margin: 0,
    padding: 0,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: tokens.color.placeholder,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: tokens.spacing.lg,
    paddingTop: tokens.spacing['2xl'],
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageSubtext: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.xs,
    textAlign: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
});
