import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';

interface PhotoGuidelinesProps {
  visible: boolean;
  onClose: () => void;
}

const guidelines = [
  {
    icon: 'sunny',
    title: 'Good Lighting',
    description: 'Natural light works best. Avoid harsh shadows and dark corners.',
    color: tokens.color.warning
  },
  {
    icon: 'crop',
    title: 'Full Room View',
    description: 'Capture the entire space including walls, floors, and key furniture.',
    color: tokens.color.brand
  },
  {
    icon: 'camera',
    title: 'Hold Steady',
    description: 'Keep the camera level and stable for sharp, clear images.',
    color: tokens.color.success
  },
  {
    icon: 'resize',
    title: 'Right Distance',
    description: 'Stand back far enough to capture the whole room without distortion.',
    color: tokens.color.accent
  },
  {
    icon: 'eye',
    title: 'Clear Details',
    description: 'Ensure important features like windows, doors, and furniture are visible.',
    color: '#6366F1'
  },
  {
    icon: 'close-circle',
    title: 'Avoid Clutter',
    description: 'Remove unnecessary items that might distract from the space design.',
    color: '#EF4444'
  }
];

export const PhotoGuidelines: React.FC<PhotoGuidelinesProps> = ({
  visible,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Photo Guidelines</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.subtitle}>
            Follow these tips to get the best AI results for your space transformation
          </Text>

          <View style={styles.guidelinesList}>
            {guidelines.map((guideline, index) => (
              <View key={index} style={styles.guidelineCard}>
                <View style={[styles.iconContainer, { backgroundColor: guideline.color + '15' }]}>
                  <Ionicons 
                    name={guideline.icon as any} 
                    size={24} 
                    color={guideline.color} 
                  />
                </View>
                
                <View style={styles.guidelineContent}>
                  <Text style={styles.guidelineTitle}>{guideline.title}</Text>
                  <Text style={styles.guidelineDescription}>{guideline.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Example section */}
          <View style={styles.exampleSection}>
            <Text style={styles.exampleTitle}>💡 Pro Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tip}>• Take multiple photos from different angles</Text>
              <Text style={styles.tip}>• Shoot during daytime for natural lighting</Text>
              <Text style={styles.tip}>• Clean and organize the space beforehand</Text>
              <Text style={styles.tip}>• Include architectural features like fireplaces or built-ins</Text>
              <Text style={styles.tip}>• Avoid using flash as it can create harsh shadows</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItButtonText}>Got It!</Text>
            <Ionicons name="checkmark" size={20} color={tokens.color.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  title: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e1,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
    lineHeight: 24,
  },
  guidelinesList: {
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  guidelineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.e1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  guidelineDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    lineHeight: 22,
  },
  exampleSection: {
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.xl,
    ...tokens.shadow.e1,
  },
  exampleTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.md,
  },
  tipsList: {
    gap: tokens.spacing.sm,
  },
  tip: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    paddingTop: tokens.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  gotItButton: {
    backgroundColor: tokens.color.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  gotItButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
  },
});