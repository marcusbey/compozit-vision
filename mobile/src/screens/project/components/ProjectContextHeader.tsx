import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProjectContext {
  id: string;
  name: string;
  client?: {
    name: string;
    email?: string;
  };
  style: string[];
  roomType: string;
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  constraints?: {
    maxBudget?: number;
    preferredStyles?: string[];
    roomRequirements?: string[];
  };
}

interface ProjectContextHeaderProps {
  projectContext: ProjectContext;
  onSettingsPress: () => void;
}

export const ProjectContextHeader: React.FC<ProjectContextHeaderProps> = ({
  projectContext,
  onSettingsPress,
}) => {
  const formatBudget = (budget: { total: number; spent: number; currency: string }) => {
    const remaining = budget.total - budget.spent;
    const percentage = (budget.spent / budget.total) * 100;
    
    return {
      remaining: `$${remaining.toLocaleString()}`,
      percentage: Math.round(percentage),
      isOverBudget: budget.spent > budget.total,
    };
  };

  const budgetInfo = projectContext.budget ? formatBudget(projectContext.budget) : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {projectContext.name}
          </Text>
          {projectContext.client && (
            <Text style={styles.clientName} numberOfLines={1}>
              {projectContext.client.name}
            </Text>
          )}
        </View>

        <View style={styles.contextTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{projectContext.roomType}</Text>
          </View>
          {projectContext.style.slice(0, 2).map((style, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{style}</Text>
            </View>
          ))}
          {projectContext.style.length > 2 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{projectContext.style.length - 2}</Text>
            </View>
          )}
        </View>

        {budgetInfo && (
          <View style={styles.budgetInfo}>
            <View style={styles.budgetText}>
              <Ionicons 
                name="card-outline" 
                size={14} 
                color={budgetInfo.isOverBudget ? '#E07A5F' : '#D4A574'} 
              />
              <Text style={[
                styles.budgetAmount,
                budgetInfo.isOverBudget && styles.overBudget
              ]}>
                {budgetInfo.remaining} remaining
              </Text>
            </View>
            <View style={styles.budgetBar}>
              <View 
                style={[
                  styles.budgetProgress, 
                  { 
                    width: `${Math.min(budgetInfo.percentage, 100)}%`,
                    backgroundColor: budgetInfo.isOverBudget ? '#E07A5F' : '#D4A574'
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={20} color="#666666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  projectInfo: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 2,
  },
  clientName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  contextTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetAmount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#D4A574',
    fontWeight: '500',
  },
  overBudget: {
    color: '#E07A5F',
  },
  budgetBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8DDD1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 2,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});