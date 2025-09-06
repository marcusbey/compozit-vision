import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { tokens } from '@theme';

interface CameraSectionProps {
  facing: CameraType;
  setFacing: (facing: CameraType) => void;
  onPhotoTaken: (uri: string) => void;
  onClose: () => void;
}

export const CameraSection: React.FC<CameraSectionProps> = ({
  facing,
  setFacing,
  onPhotoTaken,
  onClose
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        // Resize the image to optimize for AI processing
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1024, height: 1024 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        onPhotoTaken(manipResult.uri);
        onClose();
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(facing === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        mode="picture"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={tokens.color.textInverse} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Capture Your Space</Text>
          
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color={tokens.color.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsInner}>
            <View style={styles.placeholder} />
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
          
          <Text style={styles.captureHint}>
            Position your camera to capture the space you want to transform
          </Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.color.bgApp,
    padding: tokens.spacing.xl,
  },
  permissionMessage: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  permissionButton: {
    backgroundColor: tokens.color.brand,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  permissionButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.color.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.color.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  controlsInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  placeholder: {
    width: 60,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: tokens.color.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: tokens.color.scrim,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tokens.color.textInverse,
  },
  captureHint: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});