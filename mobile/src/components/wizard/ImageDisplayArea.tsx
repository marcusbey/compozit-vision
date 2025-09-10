import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { ProgressHeader } from '@ui/ProgressHeader';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImageDisplayAreaProps {
  capturedImage?: string | null;
  resultImage?: string | null;
  onBack: () => void;
  onReset?: () => void;
  onTakePhoto?: () => void;
  onImportPhoto?: () => void;
}

export const ImageDisplayArea: React.FC<ImageDisplayAreaProps> = ({
  capturedImage,
  resultImage,
  onBack,
  onReset,
  onTakePhoto,
  onImportPhoto,
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

          {/* Inline CTAs */}
          {(onTakePhoto || onImportPhoto) && (
            <View style={styles.inlineCtas}>
              {onTakePhoto && (
                <TouchableOpacity style={styles.primaryCta} onPress={onTakePhoto} activeOpacity={0.9}>
                  <Ionicons name="camera" size={18} color={tokens.color.textInverse} />
                  <Text style={styles.primaryCtaText}>Take a Photo</Text>
                </TouchableOpacity>
              )}
              {onImportPhoto && (
                <TouchableOpacity style={styles.secondaryCta} onPress={onImportPhoto} activeOpacity={0.9}>
                  <Ionicons name="cloud-upload-outline" size={18} color={tokens.color.brand} />
                  <Text style={styles.secondaryCtaText}>Upload a Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
      <Image
        source={typeof displayImage === 'string'
          ? { uri: displayImage }  // URI string
          : displayImage}          // require() source
        style={styles.image}
      />

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
  inlineCtas: {
    width: '85%',
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  primaryCta: {
    height: 48,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  primaryCtaText: {
    ...tokens.type.subtitle,
    color: tokens.color.textInverse,
    fontWeight: '700',
  },
  secondaryCta: {
    height: 48,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.brand + '30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    ...tokens.shadow.e1,
  },
  secondaryCtaText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
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
