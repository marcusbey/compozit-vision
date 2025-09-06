import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectContext, FeatureId, CONTEXT_KEYWORDS, FEATURE_CONFIG } from '../../utils/contextAnalysis';
import contextAnalyticsService from '../../services/contextAnalyticsService';
import { tokens } from '../../theme';

const { width } = Dimensions.get('window');


interface AdminPanelScreenProps {
  navigation?: any;
  onBack?: () => void;
}

type AdminTab = 'keywords' | 'features' | 'analytics' | 'settings';

const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({ navigation, onBack }) => {
  const [selectedTab, setSelectedTab] = useState<AdminTab>('keywords');
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedContext, setSelectedContext] = useState<ProjectContext>('interior');
  const [selectedFeature, setSelectedFeature] = useState<FeatureId>('colorPalette');
  const [newKeyword, setNewKeyword] = useState('');
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  
  // Local state for managing keywords and features (in production, this would sync with a backend)
  const [localKeywords, setLocalKeywords] = useState<Record<ProjectContext, string[]>>({
    interior: [...CONTEXT_KEYWORDS.interior.keywords],
    garden: [...CONTEXT_KEYWORDS.garden.keywords],
    exterior: [...CONTEXT_KEYWORDS.exterior.keywords],
    mixed: [...CONTEXT_KEYWORDS.mixed.keywords],
    unknown: [...CONTEXT_KEYWORDS.unknown.keywords],
  });
  
  const [localFeatureConfig, setLocalFeatureConfig] = useState(FEATURE_CONFIG);

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    const updatedKeywords = [...localKeywords[selectedContext], newKeyword.trim()];
    setLocalKeywords(prev => ({
      ...prev,
      [selectedContext]: updatedKeywords
    }));
    
    setNewKeyword('');
    setShowKeywordModal(false);
    
    Alert.alert('Success', `Added "${newKeyword}" to ${selectedContext} keywords`);
  };

  const handleRemoveKeyword = (context: ProjectContext, index: number) => {
    Alert.alert(
      'Remove Keyword',
      `Are you sure you want to remove "${localKeywords[context][index]}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedKeywords = localKeywords[context].filter((_, i) => i !== index);
            setLocalKeywords(prev => ({
              ...prev,
              [context]: updatedKeywords
            }));
          }
        }
      ]
    );
  };

  const handleNavigateToAnalytics = () => {
    navigation?.navigate('analytics');
  };

  const handleExportConfig = () => {
    const exportData = {
      keywords: localKeywords,
      features: localFeatureConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // In production, this would save to file or send to server
    console.log('Admin Config Export:', JSON.stringify(exportData, null, 2));
    Alert.alert('Export Complete', 'Configuration exported to console (in production, this would save to file)');
  };

  const handleResetConfig = () => {
    Alert.alert(
      'Reset Configuration',
      'This will reset all keyword dictionaries and feature mappings to default values. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLocalKeywords({
              interior: [...CONTEXT_KEYWORDS.interior.keywords],
              garden: [...CONTEXT_KEYWORDS.garden.keywords],
              exterior: [...CONTEXT_KEYWORDS.exterior.keywords],
              mixed: [...CONTEXT_KEYWORDS.mixed.keywords],
              unknown: [...CONTEXT_KEYWORDS.unknown.keywords],
            });
            Alert.alert('Reset Complete', 'Configuration has been reset to defaults');
          }
        }
      ]
    );
  };

  const renderKeywordsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Keyword Dictionaries</Text>
        <Text style={styles.sectionSubtitle}>
          Manage keywords used for context detection across different project types
        </Text>
      </View>

      <View style={styles.contextSelector}>
        {Object.keys(localKeywords).map((context) => (
          <TouchableOpacity
            key={context}
            style={[
              styles.contextButton,
              selectedContext === context && styles.activeContextButton
            ]}
            onPress={() => setSelectedContext(context as ProjectContext)}
          >
            <Text style={[
              styles.contextButtonText,
              selectedContext === context && styles.activeContextButtonText
            ]}>
              {context.charAt(0).toUpperCase() + context.slice(1)}
            </Text>
            <View style={styles.keywordCount}>
              <Text style={styles.keywordCountText}>
                {localKeywords[context as ProjectContext].length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.keywordSection}>
        <View style={styles.keywordHeader}>
          <Text style={styles.keywordSectionTitle}>
            {selectedContext.charAt(0).toUpperCase() + selectedContext.slice(1)} Keywords
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowKeywordModal(true)}
          >
            <Ionicons name="add" size={20} color={tokens.colors.text.inverse} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.keywordGrid}>
          {localKeywords[selectedContext].map((keyword, index) => (
            <View key={index} style={styles.keywordChip}>
              <Text style={styles.keywordText}>{keyword}</Text>
              <TouchableOpacity
                style={styles.removeKeywordButton}
                onPress={() => handleRemoveKeyword(selectedContext, index)}
              >
                <Ionicons name="close" size={14} color={tokens.colors.status.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.keywordStats}>
          <Text style={styles.statsText}>
            Total keywords: {localKeywords[selectedContext].length} • 
            Average length: {(localKeywords[selectedContext].reduce((sum, kw) => sum + kw.length, 0) / localKeywords[selectedContext].length).toFixed(1)} characters
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderFeaturesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Feature Configuration</Text>
        <Text style={styles.sectionSubtitle}>
          Manage how features are mapped to different project contexts
        </Text>
      </View>

      <View style={styles.featureList}>
        {Object.entries(localFeatureConfig).map(([featureId, config]) => (
          <View key={featureId} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureName}>{featureId}</Text>
              <View style={[
                styles.featureBadge,
                config.universal ? styles.universalBadge : styles.contextualBadge
              ]}>
                <Text style={styles.featureBadgeText}>
                  {config.universal ? 'Universal' : 'Contextual'}
                </Text>
              </View>
            </View>

            <View style={styles.featureContexts}>
              {Object.entries(config.contexts).map(([context, contextConfig]) => (
                <View key={context} style={styles.contextMapping}>
                  <Text style={styles.contextName}>{context}</Text>
                  <Text style={styles.contextTitle}>{contextConfig.title}</Text>
                  <Text style={styles.contextDescription}>{contextConfig.description}</Text>
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>Priority: {contextConfig.priority}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Analytics Management</Text>
        <Text style={styles.sectionSubtitle}>
          Access detailed analytics and manage data collection
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={handleNavigateToAnalytics}
      >
        <View style={styles.actionCardIcon}>
          <Ionicons name="analytics" size={24} color={tokens.colors.primary.DEFAULT} />
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>View Analytics Dashboard</Text>
          <Text style={styles.actionCardDescription}>
            Access detailed insights on context accuracy, feature relevance, and user engagement
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={tokens.colors.text.secondary} />
      </TouchableOpacity>

      <View style={styles.analyticsControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.primaryControl]}
          onPress={async () => {
            const exportData = await contextAnalyticsService.exportAnalyticsData();
            console.log('Analytics Export:', exportData);
            Alert.alert('Export Complete', 'Analytics data exported to console');
          }}
        >
          <Ionicons name="download" size={20} color={tokens.colors.text.inverse} />
          <Text style={styles.controlButtonText}>Export Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.dangerControl]}
          onPress={() => {
            Alert.alert(
              'Clear Analytics Data',
              'This will permanently delete all collected analytics data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => contextAnalyticsService.clearAnalyticsData()
                }
              ]
            );
          }}
        >
          <Ionicons name="trash" size={20} color={tokens.colors.text.inverse} />
          <Text style={styles.controlButtonText}>Clear Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsInfo}>
        <Text style={styles.infoTitle}>Data Collection</Text>
        <Text style={styles.infoText}>
          Analytics are collected locally on the device and include user interaction patterns, 
          context detection accuracy, and feature relevance scores. No personal information 
          is stored, and users have full control over their data.
        </Text>
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Admin Settings</Text>
        <Text style={styles.sectionSubtitle}>
          Configuration management and system controls
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingSectionTitle}>Configuration Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleExportConfig}>
          <Ionicons name="download" size={20} color={tokens.colors.primary.DEFAULT} />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Export Configuration</Text>
            <Text style={styles.settingDescription}>
              Download current keyword dictionaries and feature mappings
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleResetConfig}>
          <Ionicons name="refresh" size={20} color={tokens.colors.status.warning} />
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Reset to Defaults</Text>
            <Text style={styles.settingDescription}>
              Restore original keyword dictionaries and feature configurations
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingSectionTitle}>System Information</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Keywords</Text>
            <Text style={styles.infoValue}>
              {Object.values(localKeywords).reduce((sum, keywords) => sum + keywords.length, 0)}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Features</Text>
            <Text style={styles.infoValue}>{Object.keys(localFeatureConfig).length}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Contexts</Text>
            <Text style={styles.infoValue}>{Object.keys(localKeywords).length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Admin Panel v1.0.0</Text>
        <Text style={styles.versionText}>Context Analysis System v2.0.0</Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack || (() => navigation?.goBack())}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={() => Alert.alert('Admin Panel', 'Version 1.0.0')}>
          <Ionicons name="information-circle-outline" size={24} color={tokens.colors.primary.DEFAULT} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabNav}
        contentContainerStyle={styles.tabNavContent}
      >
        {[
          { id: 'keywords', title: 'Keywords', icon: 'library' },
          { id: 'features', title: 'Features', icon: 'options' },
          { id: 'analytics', title: 'Analytics', icon: 'analytics' },
          { id: 'settings', title: 'Settings', icon: 'settings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, selectedTab === tab.id && styles.activeTabButton]}
            onPress={() => setSelectedTab(tab.id as AdminTab)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={16} 
              color={selectedTab === tab.id ? tokens.colors.text.inverse : tokens.colors.text.secondary} 
            />
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.id && styles.activeTabButtonText
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <View style={styles.content}>
        {selectedTab === 'keywords' && renderKeywordsTab()}
        {selectedTab === 'features' && renderFeaturesTab()}
        {selectedTab === 'analytics' && renderAnalyticsTab()}
        {selectedTab === 'settings' && renderSettingsTab()}
      </View>

      {/* Add Keyword Modal */}
      <Modal
        visible={showKeywordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKeywordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Keyword</Text>
            <Text style={styles.modalSubtitle}>
              Add a new keyword to the {selectedContext} context
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter keyword..."
              value={newKeyword}
              onChangeText={setNewKeyword}
              autoFocus
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setNewKeyword('');
                  setShowKeywordModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAddKeyword}
              >
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  headerTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
  },
  tabNav: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  tabNavContent: {
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    gap: tokens.spacing.xs,
  },
  activeTabButton: {
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  tabButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
  },
  sectionHeader: {
    marginBottom: tokens.spacing.xl,
  },
  sectionTitle: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  sectionSubtitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
  },
  contextSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xl,
  },
  contextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    gap: tokens.spacing.sm,
  },
  activeContextButton: {
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderColor: tokens.colors.primary.DEFAULT,
  },
  contextButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  activeContextButtonText: {
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  keywordCount: {
    backgroundColor: tokens.colors.border.light,
    borderRadius: 10,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  keywordCountText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },
  keywordSection: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
  },
  keywordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.lg,
  },
  keywordSectionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  addButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
    maxWidth: width - tokens.spacing.xl * 4,
  },
  keywordText: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
  },
  removeKeywordButton: {
    padding: 2,
  },
  keywordStats: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    paddingTop: tokens.spacing.md,
  },
  statsText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  featureList: {
    gap: tokens.spacing.lg,
  },
  featureCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.lg,
  },
  featureName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  featureBadge: {
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
  },
  universalBadge: {
    backgroundColor: tokens.colors.status.success,
  },
  contextualBadge: {
    backgroundColor: tokens.colors.status.warning,
  },
  featureBadgeText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  featureContexts: {
    gap: tokens.spacing.md,
  },
  contextMapping: {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
  },
  contextName: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  contextTitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  contextDescription: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
  },
  priorityText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: `${tokens.colors.primary.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  actionCardDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  analyticsControls: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  primaryControl: {
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  dangerControl: {
    backgroundColor: tokens.colors.status.error,
  },
  controlButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  analyticsInfo: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
  },
  infoTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
  },
  infoText: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    lineHeight: 20,
  },
  settingsSection: {
    marginBottom: tokens.spacing.xl,
  },
  settingSectionTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  settingDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    alignItems: 'center',
  },
  infoLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.xs,
  },
  infoValue: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  versionText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  modal: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  modalConfirmButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  modalCancelText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  modalConfirmText: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
});

export default AdminPanelScreen;