import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@theme';

interface ToolsScreenProps {
  navigation: any;
}

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity 
    style={styles.toolCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.toolIconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={28} color={color} />
    </View>
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={tokens.colors.text.tertiary} />
  </TouchableOpacity>
);

const ToolsScreen: React.FC<ToolsScreenProps> = ({ navigation }) => {
  const tools = [
    {
      title: 'My Projects',
      description: 'View and manage your design projects',
      icon: 'home',
      color: '#2196F3',
      screen: 'myProjects',
    },
    {
      title: 'Color Palettes',
      description: 'Browse and create custom color schemes',
      icon: 'color-palette',
      color: '#9C27B0',
      screen: 'myPalettes',
    },
    {
      title: 'Reference Library',
      description: 'Explore design inspiration and references',
      icon: 'images',
      color: '#FF9800',
      screen: 'referenceLibrary',
    },
    {
      title: 'Style Guide',
      description: 'Learn about different design styles',
      icon: 'book',
      color: '#4CAF50',
      screen: 'styleSelection',
    },
    {
      title: 'Budget Calculator',
      description: 'Estimate costs for your projects',
      icon: 'calculator',
      color: '#F44336',
      screen: 'budget',
    },
    {
      title: 'Settings',
      description: 'Manage your account and preferences',
      icon: 'settings',
      color: '#607D8B',
      screen: 'profile',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={tokens.colors.background.primary} barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools</Text>
        <Text style={styles.headerSubtitle}>Everything you need to design</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.toolsGrid}>
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              color={tool.color}
              onPress={() => navigation?.navigate(tool.screen)}
            />
          ))}
        </View>

        <View style={styles.promoCard}>
          <LinearGradient
            colors={[tokens.colors.primary.DEFAULT, tokens.colors.primary.dark]}
            style={styles.promoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={24} color={tokens.colors.text.inverse} />
            <Text style={styles.promoTitle}>Unlock Pro Features</Text>
            <Text style={styles.promoDescription}>
              Get unlimited designs and exclusive tools
            </Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  headerTitle: {
    ...tokens.typography.heading.h1,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl + 80, // Account for tab bar
  },
  toolsGrid: {
    gap: tokens.spacing.md,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.elevation1,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    ...tokens.typography.heading.h4,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  toolDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  promoCard: {
    marginTop: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.xxl,
    overflow: 'hidden',
    ...tokens.shadows.elevation2,
  },
  promoGradient: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  promoTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.inverse,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  promoDescription: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  promoButton: {
    backgroundColor: tokens.colors.background.secondary,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius.xxl,
  },
  promoButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
  },
});

export default ToolsScreen;