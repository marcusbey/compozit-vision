import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressHeader } from '@ui/ProgressHeader';
import { tokens } from '@theme';

interface ImageDisplayAreaProps {
  capturedImage?: string | null;
  resultImage?: string | null;
  onBack: () => void;
  onReset?: () => void;
}

export const ImageDisplayArea: React.FC<ImageDisplayAreaProps> = ({
  capturedImage,
  resultImage,
  onBack,
  onReset
}) => {
  const displayImage = resultImage || capturedImage;
  const showReset = Boolean(displayImage);

  if (!displayImage) {
    return (
      <View style={styles.placeholderContainer}>
        <LinearGradient
          colors={[tokens.color.brand + '40', tokens.color.brand + '20', tokens.color.brandHover + '30']}
          style={styles.placeholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Photo Placeholder Frame */}
          <View style={styles.photoFrame}>
            <View style={styles.frameInner}>
              <View style={styles.photoIconContainer}>
                <Ionicons 
                  name="camera-outline" 
                  size={60} 
                  color={tokens.color.textInverse + '80'} 
                />
              </View>
              <Text style={styles.placeholderTitle}>Add Your Photo</Text>
              <Text style={styles.placeholderSubtitle}>
                Capture or upload a photo of your space{'\n'}to start transforming it with AI
              </Text>
              
              {/* Decorative Frame Corners */}
              <View style={styles.frameCorners}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View>
        </LinearGradient>
        
        <ProgressHeader 
          onBack={onBack}
          onReset={onReset}
          showReset={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: displayImage }} style={styles.image} />
      
      {/* Overlay gradient for better header visibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent']}
        style={styles.headerGradient}
      />
      
      <ProgressHeader 
        onBack={onBack}
        onReset={onReset}
        showReset={showReset}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  placeholderContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  photoFrame: {
    width: '85%',
    aspectRatio: 4/3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${tokens.color.textInverse}15`,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: `${tokens.color.textInverse}30`,
    borderStyle: 'dashed',
    position: 'relative',
  },
  frameInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
  },
  photoIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${tokens.color.textInverse}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.lg,
  },
  placeholderTitle: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  placeholderSubtitle: {
    ...tokens.type.body,
    color: `${tokens.color.textInverse}90`,
    textAlign: 'center',
    lineHeight: 22,
  },
  frameCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: tokens.color.textInverse,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: tokens.radius.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: tokens.radius.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: tokens.radius.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: tokens.radius.lg,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 5,
  },
});