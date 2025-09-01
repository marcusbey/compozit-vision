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
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

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
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    inactive: "#B0B0B0",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, fontWeight: '500' as const },
  },
};

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
    <Ionicons name="chevron-forward" size={20} color={tokens.color.textMuted} />
  </TouchableOpacity>
);

const ToolsScreen: React.FC = () => {
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
      <StatusBar backgroundColor={tokens.color.bgApp} barStyle="dark-content" />
      
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
              onPress={() => NavigationHelpers.navigateToScreen(tool.screen as any)}
            />
          ))}
        </View>

        <View style={styles.promoCard}>
          <LinearGradient
            colors={[tokens.color.brand, tokens.color.brandHover]}
            style={styles.promoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={24} color={tokens.color.textInverse} />
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
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
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
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.e1,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.md,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  toolDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  promoCard: {
    marginTop: tokens.spacing.xl,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  promoGradient: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  promoTitle: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  promoDescription: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  promoButton: {
    backgroundColor: tokens.color.surface,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.xl,
  },
  promoButtonText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
  },
});

export default ToolsScreen;