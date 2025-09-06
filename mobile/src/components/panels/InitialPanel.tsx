import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface InitialPanelProps {
  onTakePhoto: () => void;
  onImportPhoto: () => void;
}

export const InitialPanel: React.FC<InitialPanelProps> = ({
  onTakePhoto,
  onImportPhoto
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transform Your Space with AI</Text>
        <Text style={styles.subtitle}>
          Capture or import a photo to start creating your dream design
        </Text>
      </View>

      <View style={styles.actionSection}>
        {/* Primary Action - Take Photo */}
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
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Actions Row */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onImportPhoto}>
            <View style={styles.secondaryButtonContent}>
              <Ionicons name="image-outline" size={20} color={tokens.color.brand} />
              <Text style={styles.secondaryButtonText}>Upload photo</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={onImportPhoto}>
            <Text style={styles.linkButtonText}>Select from gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipItem}>
          <Ionicons name="bulb-outline" size={16} color={tokens.color.brand} />
          <Text style={styles.tipText}>
            Good lighting and clear angles produce the best AI results
          </Text>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    gap: tokens.spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
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
  linkButton: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
  },
  linkButtonText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textDecorationLine: 'underline',
  },
  tipsSection: {
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
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
});
