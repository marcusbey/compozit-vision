import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { tokens } from '@theme';

interface FilterTab {
  key: string;
  label: string;
  count: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  title?: string;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  selectedFilter,
  onFilterChange,
  title = "Filter"
}) => {
  const visibleTabs = tabs.filter(tab => tab.count > 0 || tab.key === 'all');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {visibleTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.chip,
              selectedFilter === tab.key && styles.chipActive
            ]}
            onPress={() => onFilterChange(tab.key)}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.chipText,
              selectedFilter === tab.key && styles.chipTextActive
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.badge,
                selectedFilter === tab.key && styles.badgeActive
              ]}>
                <Text style={[
                  styles.badgeText,
                  selectedFilter === tab.key && styles.badgeTextActive
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  title: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.md,
    fontWeight: '500',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingRight: tokens.spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    marginRight: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e2,
  },
  chipActive: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
  },
  chipText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: tokens.color.textInverse,
  },
  badge: {
    marginLeft: tokens.spacing.xs,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: tokens.color.textInverse,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.color.textSecondary,
  },
  badgeTextActive: {
    color: tokens.color.brand,
  },
});