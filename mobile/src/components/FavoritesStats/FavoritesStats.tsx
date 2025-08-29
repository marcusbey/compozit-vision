import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { FavoriteStats } from '../../services/userFavoritesService';

const { width } = Dimensions.get('window');

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#4CAF50",
    warning: "#FF9800",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  shadow: {
    e2: { 
      shadowColor: "#000", 
      shadowOpacity: 0.08, 
      shadowRadius: 12, 
      shadowOffset: { width: 0, height: 4 }, 
      elevation: 4 
    },
  },
  type: {
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
};

export interface FavoritesStatsProps {
  showDetailedView?: boolean;
  onCategoryPress?: (category: string) => void;
  style?: any;
}

interface StatItem {
  key: keyof FavoriteStats;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description: string;
}

const FavoritesStats: React.FC<FavoritesStatsProps> = ({
  showDetailedView = false,
  onCategoryPress,
  style,
}) => {
  const { stats, loadStats, isLoading, error } = useFavoritesStore();
  const [refreshing, setRefreshing] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  // Stat items configuration
  const statItems: StatItem[] = [
    {
      key: 'referenceImages',
      label: 'References',
      icon: 'image-outline',
      color: tokens.color.brand,
      description: 'Saved reference images',
    },
    {
      key: 'colorPalettes',
      label: 'Palettes',
      icon: 'color-palette-outline',
      color: tokens.color.warning,
      description: 'Color palettes you love',
    },
    {
      key: 'designStyles',
      label: 'Styles',
      icon: 'brush-outline',
      color: tokens.color.success,
      description: 'Design styles',
    },
    {
      key: 'collections',
      label: 'Collections',
      icon: 'folder-outline',
      color: tokens.color.accent,
      description: 'Organized collections',
    },
  ];

  // Calculate percentages for visual representation
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Render stat card
  const renderStatCard = (item: StatItem, index: number) => {
    const value = stats[item.key] as number;
    const percentage = getPercentage(value, stats.totalFavorites);
    
    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.statCard, { backgroundColor: `${item.color}15` }]}
        onPress={() => onCategoryPress?.(item.key)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${item.label}: ${value} items`}
        accessibilityHint={`View ${item.label.toLowerCase()}`}
      >
        <LinearGradient
          colors={[`${item.color}20`, `${item.color}10`]}
          style={styles.statCardGradient}
        >
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: `${item.color}25` }]}>
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={item.color} 
              />
            </View>
            <Text style={styles.statValue}>{value}</Text>
          </View>
          
          <Text style={styles.statLabel}>{item.label}</Text>
          
          {showDetailedView && (
            <View style={styles.statDetails}>
              <Text style={styles.statDescription}>
                {item.description}
              </Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statBarFill, 
                    { 
                      width: `${Math.max(percentage, 5)}%`,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.statPercentage}>{percentage}%</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render compact overview
  const renderCompactView = () => (
    <View style={[styles.compactContainer, style]}>
      <View style={styles.totalSection}>
        <View style={styles.totalIconContainer}>
          <Ionicons 
            name="heart" 
            size={24} 
            color={tokens.color.brand} 
          />
        </View>
        <View style={styles.totalContent}>
          <Text style={styles.totalValue}>{stats.totalFavorites}</Text>
          <Text style={styles.totalLabel}>Total Favorites</Text>
        </View>
        {!isLoading && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={16} 
              color={tokens.color.textMuted} 
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScroll}
      >
        {statItems.map((item, index) => renderStatCard(item, index))}
      </ScrollView>

      {error && (
        <Text style={styles.errorText}>
          Failed to load statistics
        </Text>
      )}
    </View>
  );

  // Render detailed view
  const renderDetailedView = () => (
    <View style={[styles.detailedContainer, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Favorites</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={tokens.color.textMuted} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <LinearGradient
          colors={[tokens.color.brand, tokens.color.brandHover]}
          style={styles.totalCardGradient}
        >
          <Ionicons 
            name="heart" 
            size={32} 
            color={tokens.color.surface} 
          />
          <Text style={styles.totalValueLarge}>{stats.totalFavorites}</Text>
          <Text style={styles.totalLabelLarge}>Items Favorited</Text>
        </LinearGradient>
      </View>

      <View style={styles.statsGrid}>
        {statItems.map((item, index) => renderStatCard(item, index))}
      </View>

      {error && (
        <Text style={styles.errorText}>
          Failed to load statistics
        </Text>
      )}
    </View>
  );

  return showDetailedView ? renderDetailedView() : renderCompactView();
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  detailedContainer: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadow.e2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  title: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  refreshButton: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.borderSoft,
  },
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: `${tokens.color.brand}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  totalContent: {
    flex: 1,
  },
  totalValue: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  totalLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  totalCard: {
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    overflow: 'hidden',
  },
  totalCardGradient: {
    padding: tokens.spacing.xl,
    alignItems: 'center',
  },
  totalValueLarge: {
    ...tokens.type.h2,
    fontSize: 36,
    color: tokens.color.surface,
    marginTop: tokens.spacing.sm,
  },
  totalLabelLarge: {
    ...tokens.type.body,
    color: tokens.color.surface,
    marginTop: tokens.spacing.xs,
  },
  statsScroll: {
    paddingHorizontal: tokens.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: showDetailedView ? (width - 80) / 2 - tokens.spacing.sm : 120,
    marginRight: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: tokens.spacing.md,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  statLabel: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  statDetails: {
    marginTop: tokens.spacing.sm,
  },
  statDescription: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  statBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    marginBottom: tokens.spacing.xs,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statPercentage: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'right',
  },
  errorText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
});

export default FavoritesStats;