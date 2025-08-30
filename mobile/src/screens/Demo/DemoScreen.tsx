/**
 * DemoScreen - Main demo screen for testing features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    accent: "#1C1C1C",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  },
  spacing: { sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
};

interface DemoScreenProps {
  navigation?: any;
  route?: any;
}

const DemoScreen: React.FC<DemoScreenProps> = ({ navigation, route }) => {
  const demoSections = [
    {
      id: 'components',
      title: 'Interactive Components',
      description: 'Test buttons, inputs, and interactive elements',
      icon: 'construct-outline',
      color: tokens.color.brand,
    },
    {
      id: 'navigation',
      title: 'Navigation Demo',
      description: 'Test navigation patterns and transitions',
      icon: 'navigate-outline',
      color: tokens.color.accent,
    },
    {
      id: 'forms',
      title: 'Form Components',
      description: 'Test form inputs and validation',
      icon: 'document-text-outline',
      color: '#4CAF50',
    },
    {
      id: 'media',
      title: 'Media Components',
      description: 'Test image and video components',
      icon: 'image-outline',
      color: '#FF9800',
    },
  ];

  const handleSectionPress = (sectionId: string) => {
    console.log(`Demo section pressed: ${sectionId}`);
    if (navigation) {
      navigation.navigate('InteractiveComponentsDemo');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Demo & Testing</Text>
          <Text style={styles.subtitle}>
            Interactive components and feature testing
          </Text>
        </View>

        {/* Demo Sections */}
        <View style={styles.sectionsContainer}>
          {demoSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              activeOpacity={0.8}
              style={styles.sectionCard}
              onPress={() => handleSectionPress(section.id)}
              testID={`demo-section-${section.id}`}
            >
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                <Ionicons 
                  name={section.icon as any} 
                  size={24} 
                  color={section.color} 
                />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={tokens.color.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} testID="quick-action-reset">
              <Ionicons name="refresh" size={20} color={tokens.color.textInverse} />
              <Text style={styles.quickActionText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} testID="quick-action-test">
              <Ionicons name="flask" size={20} color={tokens.color.textInverse} />
              <Text style={styles.quickActionText}>Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} testID="quick-action-debug">
              <Ionicons name="bug" size={20} color={tokens.color.textInverse} />
              <Text style={styles.quickActionText}>Debug</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  header: {
    paddingVertical: tokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  sectionsContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.e1,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.lg,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  sectionDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  quickActionsContainer: {
    marginBottom: tokens.spacing.xxl,
  },
  quickActionsTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e1,
  },
  quickActionText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    marginTop: tokens.spacing.sm,
    fontWeight: '500',
  },
});

export default DemoScreen;