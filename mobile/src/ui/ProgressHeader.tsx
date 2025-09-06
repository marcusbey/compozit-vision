import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';

interface ProgressHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  step?: number;
  totalSteps?: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  title,
  subtitle,
  onBack,
  step,
  totalSteps
}) => {
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.9}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {step && totalSteps && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {step} of {totalSteps}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.pill,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.elevation2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: tokens.typography.heading.h1.fontSize,
    lineHeight: tokens.typography.heading.h1.lineHeight,
    fontWeight: tokens.typography.heading.h1.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.small.fontSize,
    lineHeight: tokens.typography.small.lineHeight,
    fontWeight: tokens.typography.small.fontWeight,
    color: tokens.colors.text.secondary,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: 2,
  },
  progressText: {
    fontSize: tokens.typography.small.fontSize,
    lineHeight: tokens.typography.small.lineHeight,
    fontWeight: tokens.typography.small.fontWeight,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
});