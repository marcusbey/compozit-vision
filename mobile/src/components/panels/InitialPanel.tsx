import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { masonryImages } from '../../assets/masonryImages';

const { width: screenWidth } = Dimensions.get('window');

const SAMPLE_IMAGES = [
  { id: 's1', source: masonryImages[0].source, label: 'Living Room' },
  { id: 's2', source: masonryImages[2].source, label: 'Cozy Bedr...' },
  { id: 's3', source: masonryImages[1].source, label: 'Kitchen In...' },
  { id: 's4', source: masonryImages[3].source, label: 'Office Sp...' },
];

interface InitialPanelProps {
  onTakePhoto: () => void;
  onImportPhoto: () => void;
  onSampleSelect: (uri: string) => void;
}

export const InitialPanel: React.FC<InitialPanelProps> = ({
  onTakePhoto,
  onImportPhoto,
  onSampleSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transform Your Space with AI</Text>
        <Text style={styles.subtitle}>
          Capture or import a photo to start creating your dream design
        </Text>
      </View>

      {/* Sample Carousel */}
      <View style={styles.carouselSection}>
        <Text style={styles.carouselTitle}>Or choose from examples</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselRow}>
          {SAMPLE_IMAGES.map(sample => (
            <TouchableOpacity key={sample.id} style={styles.sampleCard} onPress={() => onSampleSelect(sample.source)}>
              <Image
                source={sample.source}
                style={styles.sampleImage}
                resizeMode="cover"
              />
              <Text style={styles.sampleLabel} numberOfLines={1}>{sample.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom CTA Section */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.primaryActionContainer} onPress={onTakePhoto}>
          <LinearGradient
            colors={[tokens.color.brand, tokens.color.brandHover]}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="camera" size={28} color={tokens.color.textInverse} />
              </View>
              <Text style={styles.primaryButtonText}>Take a Photo</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onImportPhoto}>
          <View style={styles.secondaryButtonContent}>
            <Ionicons name="cloud-upload-outline" size={20} color={tokens.color.brand} />
            <Text style={styles.secondaryButtonText}>Upload a Photo</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xl,
  },
  title: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: tokens.spacing.sm,
  },
  actionSection: {
    flex: 0,
  },
  primaryActionContainer: {
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.e3,
  },
  primaryButton: {
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${tokens.color.textInverse}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.brand + '30',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  secondaryRow: {
    alignItems: 'center',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  secondaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginVertical: tokens.spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.color.borderSoft,
  },
  dividerText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    paddingHorizontal: tokens.spacing.sm,
  },
  tipsSection: {
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  carouselSection: {
    marginTop: tokens.spacing.lg,
  },
  carouselTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
  },
  carouselRow: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    paddingRight: tokens.spacing.lg,
  },
  sampleCard: {
    width: (screenWidth - tokens.spacing.xl * 2 - tokens.spacing.sm * 3) / 3.5,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    overflow: 'hidden',
  },
  sampleImage: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: tokens.color.placeholder,
  },
  sampleLabel: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
  },
  tipText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    lineHeight: 20,
    flex: 1,
    fontStyle: 'italic',
  },
  ctaSection: {
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
});
