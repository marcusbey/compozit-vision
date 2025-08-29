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
  ScrollView,
  Modal,
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

  const handleSelectSample = (samplePhoto: typeof SAMPLE_PHOTOS[0]) => {
    setCapturedImage(samplePhoto.imageUri);
    setShowSamples(false);
    
    // Store additional metadata for AI processing
    journeyStore.updateProjectWizard({
      selectedSamplePhoto: {
        id: samplePhoto.id,
        title: samplePhoto.title,
        category: samplePhoto.category,
        description: samplePhoto.description,
      }
    });
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

              {/* Conseils */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips for best results:</Text>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
                  <Text style={styles.tipText}>Ensure good lighting</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
                  <Text style={styles.tipText}>Capture the entire room</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
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
                Explore different room styles with our curated sample photos
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
    backgroundColor: '#FBF9F4',
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
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
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
    color: '#2D2B28',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7F73',
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
    borderColor: '#E6DDD1',
    borderStyle: 'dashed',
  },
  captureIcon: {
    marginBottom: 20,
  },
  captureText: {
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#D4C7B5',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B28',
    marginLeft: 10,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
    marginLeft: 10,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B28',
    marginBottom: 15,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#8B7F73',
    marginLeft: 10,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
    backgroundColor: 'rgba(254,254,254,0.95)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  retakeText: {
    fontSize: 14,
    color: '#D4A574',
    marginLeft: 5,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
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
    color: '#2D2B28',
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
  // Sample Photos Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sampleModal: {
    backgroundColor: '#FBF9F4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sampleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2B28',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sampleSubtitle: {
    fontSize: 16,
    color: '#8B7F73',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 22,
  },
  samplesGrid: {
    flex: 1,
  },
  samplesContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  samplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sampleCard: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sampleCardRight: {
    marginLeft: 16,
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
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sampleImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sampleImageDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
});

export default PhotoCaptureScreen;
