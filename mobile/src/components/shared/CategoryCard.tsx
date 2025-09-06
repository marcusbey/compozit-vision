import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { DatabaseCategory } from '../../screens/04-project-wizard/shared/hooks/useCategoryData';

interface CategoryCardProps {
  category: DatabaseCategory;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'home': 'home',
    'leaf': 'leaf',
    'color-palette': 'color-palette',
    'hammer': 'hammer',
    'square': 'square',
    'cube': 'cube',
    'business': 'business',
  };
  return iconMap[iconName] || 'help-circle';
};

const getComplexityLabel = (level: number): string => {
  const labels = ['Beginner', 'Easy', 'Medium', 'Advanced', 'Expert'];
  return labels[level - 1] || 'Unknown';
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onSelect
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        { borderColor: category.color_scheme.primary }
      ]}
      onPress={() => onSelect(category.id)}
      activeOpacity={0.9}
    >
      <View style={[
        styles.icon,
        { backgroundColor: category.color_scheme.primary + '15' }
      ]}>
        <Ionicons 
          name={getIconName(category.icon_name)} 
          size={32} 
          color={isSelected ? category.color_scheme.primary : tokens.colors.text.secondary} 
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isSelected && { color: category.color_scheme.primary }
          ]}>
            {category.name}
          </Text>
          {category.is_featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={tokens.colors.brand.primary} />
            </View>
          )}
        </View>
        
        <Text style={styles.description}>
          {category.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.complexityBadge}>
            <Text style={styles.complexityText}>
              {getComplexityLabel(category.complexity_level)}
            </Text>
          </View>
          
          {category.usage_count > 0 && (
            <Text style={styles.usageText}>
              {category.usage_count} projects
            </Text>
          )}
        </View>
      </View>

      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color={category.color_scheme.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.background.surface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.xl,
    borderWidth: 2,
    borderColor: tokens.colors.border.soft,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...tokens.shadow.e2,
  },
  selectedCard: {
    backgroundColor: tokens.colors.background.surface,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
    marginTop: tokens.spacing.xs,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  title: {
    ...tokens.type.h2,
    color: tokens.colors.text.primary,
    flex: 1,
  },
  featuredBadge: {
    marginLeft: tokens.spacing.xs,
  },
  description: {
    ...tokens.type.small,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: tokens.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  complexityBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.soft,
  },
  complexityText: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.colors.text.secondary,
  },
  usageText: {
    fontSize: 11,
    color: tokens.colors.text.muted,
  },
  selectedIndicator: {
    marginLeft: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
  },
});