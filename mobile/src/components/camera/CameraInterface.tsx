import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';

interface CameraInterfaceProps {
  facing: CameraType;
  onClose: () => void;
  onFlip: () => void;
  onCapture: (cameraRef: any) => void;
  onShowGuidelines: () => void;
  isProcessing: boolean;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({
  facing,
  onClose,
  onFlip,
  onCapture,
  onShowGuidelines,
  isProcessing
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={64} color={tokens.color.textMuted} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionMessage}>
          We need camera access to capture photos of your space
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={tokens.color.textInverse} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Capture Your Space</Text>
          
          <TouchableOpacity style={styles.headerButton} onPress={onShowGuidelines}>
            <Ionicons name="help-circle" size={24} color={tokens.color.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Camera guidelines overlay */}
        <View style={styles.guidelinesOverlay}>
          <View style={styles.guideline} />
          <View style={[styles.guideline, styles.guidelineVertical]} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          <Text style={styles.tip}>
            💡 Keep the camera steady and ensure good lighting
          </Text>
          
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.flipButton} onPress={onFlip}>
              <Ionicons name="camera-reverse" size={24} color={tokens.color.textInverse} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]} 
              onPress={() => onCapture({ current: cameraRef.current })}
              disabled={isProcessing}
            >
              <View style={styles.captureButtonInner}>
                {isProcessing && (
                  <Ionicons name="hourglass" size={24} color={tokens.color.brand} />
                )}
              </View>
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.accent,
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
  permissionTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  permissionMessage: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
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
  headerButton: {
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
  guidelinesOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  guideline: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  guidelineVertical: {
    width: 1,
    height: '100%',
  },
  controls: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  tip: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    textAlign: 'center',
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: tokens.screen.width,
    paddingHorizontal: tokens.spacing.xl,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tokens.color.scrim,
    alignItems: 'center',
    justifyContent: 'center',
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
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: tokens.color.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 50,
  },
});