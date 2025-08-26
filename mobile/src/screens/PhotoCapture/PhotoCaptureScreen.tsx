import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

const { width, height } = Dimensions.get('window');

interface PhotoCaptureScreenProps {
  navigation?: any;
  route?: any;
}

const PhotoCaptureScreen: React.FC<PhotoCaptureScreenProps> = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const journeyStore = useJourneyStore();
  
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems } = route?.params || {};

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(6, 'photocapture');
  }, []);


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
      Alert.alert('Permission requise', 'Nous avons besoin d\'accéder à votre galerie pour importer des photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      setShowCamera(false);
    }
  };

  const handleContinue = () => {
    if (capturedImage) {
      // After photo capture, go to descriptions screen (next step in journey)
      console.log('📸 Photo captured, proceeding to descriptions');
      
      if (navigation?.navigate) {
        navigation.navigate('descriptions', {
          projectName,
          roomType,
          selectedStyle,
          budgetRange,
          selectedItems,
          capturedImage,
        });
      } else {
        NavigationHelpers.navigateToScreen('descriptions');
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

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            {/* Header caméra */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.cameraBackButton}>
                <Ionicons name="close" size={30} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                style={styles.flipButton}
              >
                <Ionicons name="camera-reverse" size={30} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.cameraInstructions}>
              <Text style={styles.instructionText}>
                Position your room in the frame
              </Text>
            </View>

            {/* Boutons caméra */}
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                  colors={['rgba(79, 172, 254, 0.1)', 'rgba(79, 172, 254, 0.05)']}
                  style={styles.captureZone}
                >
                  <View style={styles.captureIcon}>
                    <Ionicons name="camera" size={60} color="#4facfe" />
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
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="camera" size={24} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleImportPhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonSecondary}>
                    <Ionicons name="images" size={24} color="#4facfe" />
                    <Text style={styles.actionButtonSecondaryText}>Import Photo</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Conseils */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips for best results:</Text>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#4facfe" />
                  <Text style={styles.tipText}>Ensure good lighting</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#4facfe" />
                  <Text style={styles.tipText}>Capture the entire room</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#4facfe" />
                  <Text style={styles.tipText}>Hold the camera steady</Text>
                </View>
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
                  <Ionicons name="refresh" size={20} color="#4facfe" />
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
                colors={['#4facfe', '#00f2fe']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  captureArea: {
    width: '100%',
    height: 250,
    marginBottom: 40,
  },
  captureZone: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    borderStyle: 'dashed',
  },
  captureIcon: {
    marginBottom: 20,
  },
  captureText: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 10,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4facfe',
    marginLeft: 10,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#b8c6db',
    marginLeft: 10,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 40,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  retakeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeText: {
    fontSize: 14,
    color: '#4facfe',
    marginLeft: 5,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  // Styles pour la caméra
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cameraBackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cameraControls: {
    alignItems: 'center',
    paddingBottom: 50,
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
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});

export default PhotoCaptureScreen;
