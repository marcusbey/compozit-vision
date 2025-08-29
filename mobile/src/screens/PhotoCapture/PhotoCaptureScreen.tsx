import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

const { width, height } = Dimensions.get('window');

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
    scrimHeavy: "rgba(28,28,28,0.65)",
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

// Photo quality assessment types
interface PhotoQuality {
  resolution: 'low' | 'medium' | 'high' | 'excellent';
  aspectRatio: 'poor' | 'acceptable' | 'good' | 'optimal';
  fileSize: number;
  dimensions: { width: number; height: number };
  score: number; // 0-100
  recommendations: string[];
}

interface PhotoCaptureScreenProps {
  navigation?: any;
  route?: any;
}

// Sample photos data - in real app, this would come from contentStore
const SAMPLE_PHOTOS = [
  {
    id: 'living-room-1',
    title: 'Modern Living Room',
    category: 'living-room',
    imageUri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    description: 'Bright, modern living space with neutral tones'
  },
  {
    id: 'bedroom-1', 
    title: 'Cozy Bedroom',
    category: 'bedroom',
    imageUri: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
    description: 'Minimalist bedroom with natural light'
  },
  {
    id: 'kitchen-1',
    title: 'Contemporary Kitchen',
    category: 'kitchen',
    imageUri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    description: 'Clean, contemporary kitchen design'
  },
  {
    id: 'bathroom-1',
    title: 'Spa Bathroom',
    category: 'bathroom', 
    imageUri: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400',
    description: 'Luxurious spa-like bathroom'
  },
  {
    id: 'dining-1',
    title: 'Elegant Dining Room',
    category: 'dining-room',
    imageUri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    description: 'Elegant dining space for entertaining'
  },
  {
    id: 'office-1',
    title: 'Home Office',
    category: 'home-office',
    imageUri: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
    description: 'Productive home office setup'
  }
];

const PhotoCaptureScreen: React.FC<PhotoCaptureScreenProps> = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [photoQuality, setPhotoQuality] = useState<PhotoQuality | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const journeyStore = useJourneyStore();
  
  // Animated values for guides
  const gridOpacity = useRef(new Animated.Value(0.6)).current;
  const cornersScale = useRef(new Animated.Value(1)).current;
  
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems } = route?.params || {};

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(6, 'photocapture');
  }, []);

  // Animate guides when camera opens
  useEffect(() => {
    if (showCamera && showGuides) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(gridOpacity, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(gridOpacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(cornersScale, {
              toValue: 1.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(cornersScale, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [showCamera, showGuides]);


  const handleTakePhoto = async () => {
    if (!permission) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre caméra pour prendre des photos.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleImportPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photo library to import images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Better aspect ratio for room photos
      quality: 0.9,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      try {
        setIsAnalyzing(true);
        const imageUri = result.assets[0].uri;
        setCapturedImage(imageUri);
        
        // Analyze imported photo quality
        const quality = await analyzePhotoQuality(imageUri);
        setPhotoQuality(quality);
        
        // Show quality assessment if score is low
        if (quality.score < 70) {
          setShowQualityModal(true);
        }
        
        journeyStore.updateProject({
          photoUri: imageUri,
          photoMetadata: {
            width: quality.dimensions.width,
            height: quality.dimensions.height,
            size: quality.fileSize,
            timestamp: new Date().toISOString(),
            qualityScore: quality.score,
          }
        });
        
      } catch (error) {
        console.error('Error analyzing imported photo:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const analyzePhotoQuality = async (imageUri: string): Promise<PhotoQuality> => {
    try {
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      const { size } = imageInfo as FileSystem.FileInfo & { size: number };
      
      // Get image dimensions
      const imageManipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
      );
      
      // Calculate image dimensions from manipulation result or use image measurement
      let dimensions = { width: 1920, height: 1080 }; // Default fallback
      
      // Try to get actual dimensions
      try {
        await new Promise<void>((resolve, reject) => {
          Image.getSize(
            imageUri,
            (width, height) => {
              dimensions = { width, height };
              resolve();
            },
            reject
          );
        });
      } catch (error) {
        console.warn('Could not get image dimensions:', error);
      }
      
      const { width: imgWidth, height: imgHeight } = dimensions;
      const aspectRatio = imgWidth / imgHeight;
      const megapixels = (imgWidth * imgHeight) / 1000000;
      
      // Assess resolution quality
      let resolution: PhotoQuality['resolution'];
      if (megapixels < 1) resolution = 'low';
      else if (megapixels < 3) resolution = 'medium';
      else if (megapixels < 8) resolution = 'high';
      else resolution = 'excellent';
      
      // Assess aspect ratio for interior design
      let aspectRatioQuality: PhotoQuality['aspectRatio'];
      const idealRatios = [16/9, 4/3, 3/2]; // Common good ratios for room photos
      const ratioMatch = idealRatios.some(ratio => Math.abs(aspectRatio - ratio) < 0.1);
      
      if (aspectRatio < 1) aspectRatioQuality = 'poor'; // Portrait not ideal for rooms
      else if (ratioMatch) aspectRatioQuality = 'optimal';
      else if (aspectRatio > 1.2 && aspectRatio < 2.5) aspectRatioQuality = 'good';
      else aspectRatioQuality = 'acceptable';
      
      // Calculate overall score
      const resolutionScore = { low: 20, medium: 50, high: 80, excellent: 100 }[resolution];
      const aspectScore = { poor: 30, acceptable: 60, good: 80, optimal: 100 }[aspectRatioQuality];
      const fileSizeScore = size > 500000 ? 100 : Math.min(100, (size / 500000) * 100); // Prefer files > 500KB
      
      const score = Math.round((resolutionScore * 0.5 + aspectScore * 0.3 + fileSizeScore * 0.2));
      
      // Generate recommendations
      const recommendations: string[] = [];
      if (resolution === 'low') recommendations.push('📱 Try using a higher camera resolution');
      if (aspectRatioQuality === 'poor') recommendations.push('🔄 Hold phone horizontally for room photos');
      if (size < 200000) recommendations.push('📏 Move closer to capture more detail');
      if (score > 85) recommendations.push('✨ Excellent photo quality!');
      else if (score > 70) recommendations.push('👍 Good photo quality');
      else recommendations.push('📸 Consider retaking for better AI processing');
      
      return {
        resolution,
        aspectRatio: aspectRatioQuality,
        fileSize: size,
        dimensions,
        score,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing photo quality:', error);
      return {
        resolution: 'medium',
        aspectRatio: 'acceptable',
        fileSize: 0,
        dimensions: { width: 0, height: 0 },
        score: 70,
        recommendations: ['📸 Photo captured successfully'],
      };
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsAnalyzing(true);
        
        // Take high-quality photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: false,
          skipProcessing: false,
        });
        
        setCapturedImage(photo.uri);
        setShowCamera(false);
        
        // Analyze photo quality
        const quality = await analyzePhotoQuality(photo.uri);
        setPhotoQuality(quality);
        
        // Show quality assessment if score is low
        if (quality.score < 70) {
          setShowQualityModal(true);
        }
        
        journeyStore.updateProject({
          photoUri: photo.uri,
          photoMetadata: {
            width: quality.dimensions.width,
            height: quality.dimensions.height,
            size: quality.fileSize,
            timestamp: new Date().toISOString(),
            qualityScore: quality.score,
          }
        });
        
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleContinue = () => {
    if (capturedImage) {
      // After photo capture, go to style selection screen (next step in wizard)
      console.log('📸 Photo captured, proceeding to style selection');
      
      if (navigation?.navigate) {
        navigation.navigate('styleSelection', {
          projectName,
          roomType,
          selectedStyle,
          budgetRange,
          selectedItems,
          capturedImage,
        });
      } else {
        NavigationHelpers.navigateToScreen('styleSelection');
      }
    }
  };

  const handleBack = () => {
    if (showCamera) {
      setShowCamera(false);
    } else {
      if (navigation?.goBack) {
        navigation.goBack();
      } else {
        NavigationHelpers.goBack();
      }
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
  };

  const handleShowSamples = () => {
    setShowSamples(true);
  };

  const handleSelectSample = async (samplePhoto: typeof SAMPLE_PHOTOS[0]) => {
    try {
      setIsAnalyzing(true);
      setCapturedImage(samplePhoto.imageUri);
      setShowSamples(false);
      
      // Analyze sample photo quality
      const quality = await analyzePhotoQuality(samplePhoto.imageUri);
      setPhotoQuality(quality);
      
      // Store additional metadata for AI processing
      journeyStore.updateProjectWizard({
        selectedSamplePhoto: {
          id: samplePhoto.id,
          title: samplePhoto.title,
          category: samplePhoto.category,
          description: samplePhoto.description,
          qualityScore: quality.score,
        }
      });
      
      journeyStore.updateProject({
        photoUri: samplePhoto.imageUri,
        photoMetadata: {
          width: quality.dimensions.width,
          height: quality.dimensions.height,
          size: quality.fileSize,
          timestamp: new Date().toISOString(),
          qualityScore: quality.score,
        }
      });
      
    } catch (error) {
      console.error('Error processing sample photo:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const toggleGuides = useCallback(() => {
    setShowGuides(!showGuides);
  }, [showGuides]);
  
  const renderCameraGuides = () => {
    if (!showGuides) return null;
    
    return (
      <View style={styles.guidesContainer}>
        {/* Grid overlay */}
        <Animated.View style={[styles.gridOverlay, { opacity: gridOpacity }]}>
          {/* Vertical lines */}
          <View style={[styles.gridLine, styles.verticalLine, { left: '33%' }]} />
          <View style={[styles.gridLine, styles.verticalLine, { left: '66%' }]} />
          {/* Horizontal lines */}
          <View style={[styles.gridLine, styles.horizontalLine, { top: '33%' }]} />
          <View style={[styles.gridLine, styles.horizontalLine, { top: '66%' }]} />
        </Animated.View>
        
        {/* Corner markers */}
        <Animated.View style={[styles.cornerMarkers, { transform: [{ scale: cornersScale }] }]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </Animated.View>
        
        {/* Center focus area */}
        <View style={styles.focusArea}>
          <View style={styles.focusRect} />
        </View>
        
        {/* Aspect ratio indicator */}
        <View style={styles.aspectRatioGuide}>
          <Text style={styles.aspectRatioText}>16:9 Optimal</Text>
        </View>
      </View>
    );
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            {/* Camera header with enhanced controls */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.cameraBackButton}>
                <Ionicons name="close" size={30} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.cameraHeaderCenter}>
                <TouchableOpacity
                  onPress={toggleGuides}
                  style={[styles.guideToggle, { backgroundColor: showGuides ? 'rgba(201, 169, 140, 0.8)' : 'rgba(0,0,0,0.5)' }]}
                >
                  <Ionicons 
                    name={showGuides ? "grid" : "grid-outline"} 
                    size={24} 
                    color="#ffffff" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                style={styles.flipButton}
              >
                <Ionicons name="camera-reverse" size={30} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Camera guides overlay */}
            {renderCameraGuides()}

            {/* Enhanced instructions */}
            <View style={styles.cameraInstructions}>
              <View style={styles.instructionCard}>
                <Text style={styles.instructionTitle}>Perfect Room Photo Tips</Text>
                <Text style={styles.instructionText}>
                  • Hold phone horizontally (landscape)
                </Text>
                <Text style={styles.instructionText}>
                  • Capture entire room corner-to-corner
                </Text>
                <Text style={styles.instructionText}>
                  • Ensure good natural lighting
                </Text>
                <Text style={styles.instructionText}>
                  • Keep camera level and steady
                </Text>
              </View>
            </View>

            {/* Camera controls with resolution indicator */}
            <View style={styles.cameraControls}>
              <View style={styles.resolutionIndicator}>
                <Text style={styles.resolutionText}>High Quality</Text>
                <View style={styles.resolutionDot} />
              </View>
              
              <TouchableOpacity 
                style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]} 
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <View style={styles.captureButtonInner}>
                    <Text style={styles.analyzingText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
              
              <View style={styles.aspectRatioHint}>
                <Text style={styles.aspectHintText}>16:9 Recommended</Text>
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" translucent={true} />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D2B28" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Room</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {!capturedImage ? (
            <>
              <Text style={styles.title}>Capture Your Room</Text>
              <Text style={styles.subtitle}>
                Take a photo or import an existing image{'\n'}of the room you want to transform
              </Text>

              {/* Zone de capture */}
              <View style={styles.captureArea}>
                <LinearGradient
                  colors={['rgba(212, 165, 116, 0.1)', 'rgba(232, 192, 151, 0.05)']}
                  style={styles.captureZone}
                >
                  <View style={styles.captureIcon}>
                    <Ionicons name="camera" size={60} color="#D4A574" />
                  </View>
                  <Text style={styles.captureText}>
                    Ready to capture your space
                  </Text>
                </LinearGradient>
              </View>

              {/* Boutons d'action */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E8C097', '#D4A574']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="camera" size={24} color="#2D2B28" />
                    <Text style={styles.actionButtonText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleImportPhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonSecondary}>
                    <Ionicons name="images" size={24} color="#D4A574" />
                    <Text style={styles.actionButtonSecondaryText}>Import Photo</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShowSamples}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonSecondary}>
                    <Ionicons name="library" size={24} color="#D4A574" />
                    <Text style={styles.actionButtonSecondaryText}>Try Sample Photos</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Enhanced Photography Tips */}
              <View style={styles.tipsContainer}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="camera" size={20} color={tokens.color.brand} />
                  <Text style={styles.tipsTitle}>Photography Tips for AI Processing</Text>
                </View>
                
                <ScrollView 
                  style={styles.tipsScroll} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.tipsContent}
                >
                  {/* Lighting Tips */}
                  <View style={styles.tipCategory}>
                    <Text style={styles.tipCategoryTitle}>Lighting</Text>
                    <View style={styles.tip}>
                      <Ionicons name="sunny" size={16} color={tokens.color.success} />
                      <Text style={styles.tipText}>Use natural daylight when possible</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="bulb" size={16} color={tokens.color.warning} />
                      <Text style={styles.tipText}>Turn on room lights to reduce shadows</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="close-circle" size={16} color={tokens.color.error} />
                      <Text style={styles.tipText}>Avoid backlighting from windows</Text>
                    </View>
                  </View>

                  {/* Composition Tips */}
                  <View style={styles.tipCategory}>
                    <Text style={styles.tipCategoryTitle}>Composition</Text>
                    <View style={styles.tip}>
                      <Ionicons name="crop" size={16} color={tokens.color.success} />
                      <Text style={styles.tipText}>Capture entire room from corner to corner</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="phone-landscape" size={16} color={tokens.color.success} />
                      <Text style={styles.tipText}>Hold phone horizontally (landscape mode)</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="resize" size={16} color={tokens.color.brand} />
                      <Text style={styles.tipText}>Include major furniture and architectural features</Text>
                    </View>
                  </View>

                  {/* Quality Tips */}
                  <View style={styles.tipCategory}>
                    <Text style={styles.tipCategoryTitle}>Image Quality</Text>
                    <View style={styles.tip}>
                      <Ionicons name="hand-left" size={16} color={tokens.color.success} />
                      <Text style={styles.tipText}>Keep camera steady - use both hands</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="eye" size={16} color={tokens.color.brand} />
                      <Text style={styles.tipText}>Stand at eye level, avoid tilting</Text>
                    </View>
                    <View style={styles.tip}>
                      <Ionicons name="checkmark-circle" size={16} color={tokens.color.success} />
                      <Text style={styles.tipText}>Min 2MP resolution for best AI results</Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Photo Captured</Text>
              <Text style={styles.subtitle}>
                Review your photo and continue when ready
              </Text>

              {/* Image capturée */}
              <View style={styles.imagePreview}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={handleRetakePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#D4A574" />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Bouton Continue */}
        {capturedImage && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E8C097', '#D4A574']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#2D2B28" style={styles.buttonIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Photo Quality Assessment Modal */}
        <Modal
          visible={showQualityModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQualityModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qualityModal}>
              <View style={styles.qualityHeader}>
                <Text style={styles.qualityTitle}>Photo Quality Assessment</Text>
                <TouchableOpacity
                  onPress={() => setShowQualityModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
                </TouchableOpacity>
              </View>
              
              {photoQuality && (
                <View style={styles.qualityContent}>
                  <View style={styles.qualityScore}>
                    <View style={[styles.scoreCircle, { backgroundColor: photoQuality.score > 70 ? tokens.color.success : photoQuality.score > 50 ? tokens.color.warning : tokens.color.error }]}>
                      <Text style={styles.scoreText}>{photoQuality.score}</Text>
                    </View>
                    <Text style={styles.scoreLabel}>Quality Score</Text>
                  </View>
                  
                  <View style={styles.qualityDetails}>
                    <View style={styles.qualityItem}>
                      <Text style={styles.qualityLabel}>Resolution:</Text>
                      <View style={[styles.qualityBadge, { backgroundColor: photoQuality.resolution === 'excellent' ? tokens.color.success : photoQuality.resolution === 'high' ? tokens.color.brand : tokens.color.warning }]}>
                        <Text style={styles.qualityBadgeText}>{photoQuality.resolution.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.qualityItem}>
                      <Text style={styles.qualityLabel}>Aspect Ratio:</Text>
                      <View style={[styles.qualityBadge, { backgroundColor: photoQuality.aspectRatio === 'optimal' ? tokens.color.success : photoQuality.aspectRatio === 'good' ? tokens.color.brand : tokens.color.warning }]}>
                        <Text style={styles.qualityBadgeText}>{photoQuality.aspectRatio.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.qualityItem}>
                      <Text style={styles.qualityLabel}>Dimensions:</Text>
                      <Text style={styles.qualityValue}>{photoQuality.dimensions.width}x{photoQuality.dimensions.height}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.recommendations}>
                    <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                    {photoQuality.recommendations.map((rec, index) => (
                      <Text key={index} style={styles.recommendationText}>{rec}</Text>
                    ))}
                  </View>
                  
                  <View style={styles.qualityActions}>
                    <TouchableOpacity
                      style={[styles.qualityButton, styles.retakeQualityButton]}
                      onPress={() => {
                        setShowQualityModal(false);
                        handleRetakePhoto();
                      }}
                    >
                      <Text style={styles.retakeQualityText}>Retake Photo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.qualityButton, styles.continueQualityButton]}
                      onPress={() => setShowQualityModal(false)}
                    >
                      <Text style={styles.continueQualityText}>Continue Anyway</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Sample Photos Modal */}
        <Modal
          visible={showSamples}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSamples(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sampleModal}>
              <View style={styles.sampleHeader}>
                <Text style={styles.sampleTitle}>Try Sample Photos</Text>
                <TouchableOpacity
                  onPress={() => setShowSamples(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#2D2B28" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sampleSubtitle}>
                Explore different room styles with our curated sample photos.{' '}
                <Text style={styles.sampleNote}>These are optimized for AI processing.</Text>
              </Text>

              <ScrollView 
                style={styles.samplesGrid}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.samplesContent}
              >
                <View style={styles.samplesRow}>
                  {SAMPLE_PHOTOS.map((sample, index) => (
                    <TouchableOpacity
                      key={sample.id}
                      style={[
                        styles.sampleCard,
                        index % 2 === 1 && styles.sampleCardRight
                      ]}
                      onPress={() => handleSelectSample(sample)}
                      activeOpacity={0.9}
                      disabled={isAnalyzing}
                    >
                      <Image 
                        source={{ uri: sample.imageUri }} 
                        style={styles.sampleImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.sampleOverlay}
                      >
                        <Text style={styles.sampleImageTitle}>{sample.title}</Text>
                        <Text style={styles.sampleImageDesc}>{sample.description}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  gradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  headerTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
  },
  title: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  captureArea: {
    width: '100%',
    height: 250,
    marginBottom: tokens.spacing.xxxl,
  },
  captureZone: {
    flex: 1,
    borderRadius: tokens.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    borderStyle: 'dashed',
  },
  captureIcon: {
    marginBottom: tokens.spacing.xl,
  },
  captureText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    marginBottom: tokens.spacing.xxxl,
  },
  actionButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: tokens.spacing.xxl,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: tokens.spacing.xxl,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  actionButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginLeft: tokens.spacing.sm,
  },
  actionButtonSecondaryText: {
    ...tokens.type.h2,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.sm,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
    maxHeight: 300,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  tipsTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  tipsScroll: {
    flex: 1,
  },
  tipsContent: {
    paddingBottom: tokens.spacing.lg,
  },
  tipCategory: {
    marginBottom: tokens.spacing.lg,
  },
  tipCategoryTitle: {
    ...tokens.type.small,
    fontWeight: '600',
    color: tokens.color.brand,
    marginBottom: tokens.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.sm,
    paddingLeft: tokens.spacing.sm,
  },
  tipText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: tokens.spacing.xxxl,
    ...tokens.shadow.e3,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  retakeButton: {
    position: 'absolute',
    top: tokens.spacing.lg,
    right: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.e2,
  },
  retakeText: {
    ...tokens.type.small,
    color: tokens.color.brand,
    marginLeft: tokens.spacing.xs,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: tokens.spacing.xxl,
    paddingBottom: tokens.spacing.xxxl,
    paddingTop: tokens.spacing.xl,
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: tokens.spacing.xxxl,
  },
  buttonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: tokens.spacing.sm,
  },
  // Enhanced camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: tokens.spacing.xl,
  },
  cameraHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraBackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.sm,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInstructions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    left: tokens.spacing.xl,
    right: tokens.spacing.xl,
  },
  instructionCard: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
  },
  instructionTitle: {
    ...tokens.type.h3,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  instructionText: {
    ...tokens.type.small,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'left',
    marginBottom: tokens.spacing.xs,
  },
  cameraControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 80 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  resolutionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
    marginBottom: tokens.spacing.lg,
  },
  resolutionText: {
    ...tokens.type.small,
    color: '#ffffff',
    marginRight: tokens.spacing.sm,
  },
  resolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.success,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: tokens.spacing.lg,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    ...tokens.type.caption,
    color: tokens.color.textPrimary,
    textAlign: 'center',
  },
  aspectRatioHint: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
  },
  aspectHintText: {
    ...tokens.type.small,
    color: '#ffffff',
  },
  // Camera guides styles
  guidesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  gridOverlay: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '25%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  cornerMarkers: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '25%',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: tokens.color.brand,
    borderWidth: 2,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  focusArea: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    right: '45%',
    bottom: '45%',
  },
  focusRect: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: tokens.radius.sm,
  },
  aspectRatioGuide: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    backgroundColor: 'rgba(201, 169, 140, 0.9)',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.pill,
  },
  aspectRatioText: {
    ...tokens.type.small,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Quality assessment modal styles
  qualityModal: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.xl,
    margin: tokens.spacing.xl,
    padding: tokens.spacing.xl,
    maxHeight: '70%',
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  qualityTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  qualityContent: {
    alignItems: 'center',
  },
  qualityScore: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  scoreText: {
    ...tokens.type.h1,
    color: '#ffffff',
  },
  scoreLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  qualityDetails: {
    width: '100%',
    marginBottom: tokens.spacing.xl,
  },
  qualityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  qualityLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  qualityBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  qualityBadgeText: {
    ...tokens.type.caption,
    color: '#ffffff',
    fontWeight: '600',
  },
  qualityValue: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  recommendations: {
    width: '100%',
    marginBottom: tokens.spacing.xl,
  },
  recommendationsTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  recommendationText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
    paddingLeft: tokens.spacing.lg,
  },
  qualityActions: {
    flexDirection: 'row',
    width: '100%',
    gap: tokens.spacing.lg,
  },
  qualityButton: {
    flex: 1,
    height: 48,
    borderRadius: tokens.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeQualityButton: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  continueQualityButton: {
    backgroundColor: tokens.color.accent,
  },
  retakeQualityText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  continueQualityText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
  },

  // Sample Photos Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sampleModal: {
    backgroundColor: tokens.color.bgApp,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    maxHeight: '80%',
    paddingTop: tokens.spacing.xl,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.sm,
  },
  sampleTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  sampleSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  sampleNote: {
    color: tokens.color.brand,
    fontWeight: '500',
  },
  samplesGrid: {
    flex: 1,
  },
  samplesContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  samplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sampleCard: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  sampleCardRight: {
    marginLeft: tokens.spacing.lg,
  },
  sampleImage: {
    width: '100%',
    height: '100%',
  },
  sampleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: tokens.spacing.md,
  },
  sampleImageTitle: {
    ...tokens.type.small,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: tokens.spacing.xs,
  },
  sampleImageDesc: {
    ...tokens.type.caption,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default PhotoCaptureScreen;
