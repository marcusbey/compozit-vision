import { useState, useRef, useCallback } from 'react';
import { Alert, Animated } from 'react-native';
import { CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useUserStore } from '../../../../stores/userStore';
import { useJourneyStore } from '../../../../stores/journeyStore';
import { NavigationHelpers } from '../../../../navigation/SafeJourneyNavigator';

export const usePhotoCapture = () => {
  // State management
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [previewMode, setPreviewMode] = useState(false);
  const [imageMetadata, setImageMetadata] = useState<any>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Store references
  const userStore = useUserStore();
  const journeyStore = useJourneyStore();

  // Camera interface functions
  const handleTakePhoto = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleImportPhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'We need access to your photo library to import images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri, result.assets[0]);
      }
    } catch (error) {
      console.error('Error importing photo:', error);
      Alert.alert('Import Error', 'Failed to import photo. Please try again.');
    }
  }, []);

  const takePicture = useCallback(async (cameraRef: any) => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        await processImage(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processImage = useCallback(async (uri: string, assetInfo?: any) => {
    try {
      setIsProcessing(true);

      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(uri);
      
      // Optimize image for AI processing
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1024 } }, // Maintain aspect ratio
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Extract metadata
      const metadata = {
        originalUri: uri,
        processedUri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
        size: imageInfo.size,
        aspectRatio: manipResult.width / manipResult.height,
        source: assetInfo ? 'gallery' : 'camera',
        timestamp: new Date().toISOString(),
      };

      setCapturedImage(manipResult.uri);
      setImageMetadata(metadata);
      setPreviewMode(true);

      // Animate image appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Processing Error', 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [fadeAnim, scaleAnim]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setImageMetadata(null);
    setPreviewMode(false);
    setShowCamera(true);
    
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
  }, [fadeAnim, scaleAnim]);

  const confirmPhoto = useCallback(async () => {
    if (!capturedImage || !imageMetadata) {
      Alert.alert('No Photo', 'Please capture or select a photo first.');
      return;
    }

    try {
      // Update journey store with photo data
      await journeyStore.updateProjectWizard({
        photoUri: capturedImage,
        photoMetadata: imageMetadata,
        currentWizardStep: 'space_definition'
      });

      // Navigate to next step
      NavigationHelpers.navigateToScreen('spaceDefinition');
      
    } catch (error) {
      console.error('Error confirming photo:', error);
      Alert.alert('Save Error', 'Failed to save photo. Please try again.');
    }
  }, [capturedImage, imageMetadata, journeyStore]);

  const handleBack = useCallback(() => {
    if (previewMode) {
      setPreviewMode(false);
      setCapturedImage(null);
      setImageMetadata(null);
    } else {
      NavigationHelpers.navigateToScreen('categorySelection');
    }
  }, [previewMode]);

  const toggleCameraFacing = useCallback(() => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  }, []);

  const showPhotoGuidelines = useCallback(() => {
    setShowGuidelines(true);
  }, []);

  const hidePhotoGuidelines = useCallback(() => {
    setShowGuidelines(false);
  }, []);

  // Image quality validation
  const validateImageQuality = useCallback((metadata: any) => {
    const warnings = [];
    
    if (metadata.width < 800 || metadata.height < 800) {
      warnings.push('Image resolution is low. For best results, use images with higher resolution.');
    }
    
    if (metadata.aspectRatio < 0.5 || metadata.aspectRatio > 2.0) {
      warnings.push('Image aspect ratio is unusual. Square or rectangular images work best.');
    }
    
    if (metadata.size && metadata.size > 10 * 1024 * 1024) {
      warnings.push('Image file is very large. It may take longer to process.');
    }

    return warnings;
  }, []);

  return {
    // State
    capturedImage,
    showCamera,
    setShowCamera,
    showGuidelines,
    isProcessing,
    facing,
    previewMode,
    imageMetadata,

    // Animation refs
    fadeAnim,
    scaleAnim,

    // Functions
    handleTakePhoto,
    handleImportPhoto,
    takePicture,
    processImage,
    retakePhoto,
    confirmPhoto,
    handleBack,
    toggleCameraFacing,
    showPhotoGuidelines,
    hidePhotoGuidelines,
    validateImageQuality,

    // Store references
    userStore,
    journeyStore,
  };
};