import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import abTestingService, { ABTest, TEST_TEMPLATES } from '../../services/abTestingService';

const { width } = Dimensions.get('window');

interface ABTestingScreenProps {
  navigation?: any;
  onBack?: () => void;
}

type ViewMode = 'overview' | 'create' | 'details';

const ABTestingScreen: React.FC<ABTestingScreenProps> = ({ navigation, onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const allTests = abTestingService.getAllTests();
      setTests(allTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
      Alert.alert('Error', 'Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateKey: keyof typeof TEST_TEMPLATES) => {
    const template = TEST_TEMPLATES[templateKey];
    
    try {
      const testId = await abTestingService.createTest({
        name: newTestName || template.name,
        description: template.description,
        targetMetric: template.targetMetric,
        variants: template.variants.map(variant => ({
          ...variant,
          id: `${templateKey}_${variant.id}`,
        })),
        allocation: { strategy: 'hash_based', seed: `test_${Date.now()}` },
      });

      Alert.alert('Success', `Test "${newTestName || template.name}" created successfully`);
      setShowTemplateModal(false);
      setNewTestName('');
      await loadTests();
    } catch (error) {
      Alert.alert('Error', 'Failed to create test');
    }
  };

  const handleStartTest = async (testId: string) => {
    Alert.alert(
      'Start Test',
      'Are you sure you want to start this A/B test? Users will immediately start receiving variants.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await abTestingService.startTest(testId);
              await loadTests();
              Alert.alert('Success', 'Test started successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to start test');
            }
          }
        }
      ]
    );
  };

  const handleStopTest = async (testId: string) => {
    Alert.alert(
      'Stop Test',
      'Are you sure you want to stop this test? Results will be calculated and the test will end.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await abTestingService.stopTest(testId);
              await loadTests();
              Alert.alert('Success', 'Test stopped and results calculated');
            } catch (error) {
              Alert.alert('Error', 'Failed to stop test');
            }
          }
        }
      ]
    );
  };

  const handleExportTest = async (testId: string) => {
    try {
      const exportData = await abTestingService.exportTestData(testId);
      console.log('Test Export Data:', exportData);
      Alert.alert('Export Complete', 'Test data exported to console (in production, this would save to file)');
    } catch (error) {
      Alert.alert('Error', 'Failed to export test data');
    }
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'draft': return tokens.colors.text.secondary;
      case 'running': return tokens.colors.status.success;
      case 'completed': return tokens.colors.primary.DEFAULT;
      case 'paused': return tokens.colors.status.warning;
      default: return tokens.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'draft': return 'create-outline';
      case 'running': return 'play-circle';
      case 'completed': return 'checkmark-circle';
      case 'paused': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>A/B Testing</Text>
          <Text style={styles.headerSubtitle}>Optimize feature filtering algorithms through experimentation</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowTemplateModal(true)}
        >
          <Ionicons name="add" size={20} color={tokens.colors.text.inverse} />
          <Text style={styles.createButtonText}>New Test</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {[
          { label: 'Total Tests', value: tests.length, icon: 'flask' },
          { label: 'Running', value: tests.filter(t => t.status === 'running').length, icon: 'play-circle' },
          { label: 'Completed', value: tests.filter(t => t.status === 'completed').length, icon: 'checkmark-circle' },
        ].map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name={stat.icon as any} size={20} color={tokens.colors.primary.DEFAULT} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.testsSection}>
        <Text style={styles.sectionTitle}>Tests</Text>
        
        {tests.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={48} color={tokens.colors.text.secondary} />
            <Text style={styles.emptyTitle}>No tests created yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first A/B test to start optimizing the context analysis experience
            </Text>
          </View>
        ) : (
          tests.map((test) => (
            <View key={test.id} style={styles.testCard}>
              <View style={styles.testHeader}>
                <View style={styles.testTitleRow}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
                    <Ionicons 
                      name={getStatusIcon(test.status) as any} 
                      size={12} 
                      color={tokens.colors.text.inverse} 
                    />
                    <Text style={styles.statusText}>{test.status}</Text>
                  </View>
                </View>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>

              <View style={styles.testMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Target</Text>
                  <Text style={styles.metricValue}>{test.targetMetric.replace('_', ' ')}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Variants</Text>
                  <Text style={styles.metricValue}>{test.variants.length}</Text>
                </View>
                {test.results && (
                  <View style={styles.metric}>
                    <Text style={styles.metricLabel}>Participants</Text>
                    <Text style={styles.metricValue}>{test.results.totalParticipants}</Text>
                  </View>
                )}
              </View>

              <View style={styles.testActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedTest(test);
                    setViewMode('details');
                  }}
                >
                  <Ionicons name="eye" size={16} color={tokens.colors.primary.DEFAULT} />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {test.status === 'draft' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => handleStartTest(test.id)}
                  >
                    <Ionicons name="play" size={16} color={tokens.colors.text.inverse} />
                    <Text style={[styles.actionButtonText, styles.primaryActionText]}>Start</Text>
                  </TouchableOpacity>
                )}

                {test.status === 'running' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerAction]}
                    onPress={() => handleStopTest(test.id)}
                  >
                    <Ionicons name="stop" size={16} color={tokens.colors.text.inverse} />
                    <Text style={[styles.actionButtonText, styles.primaryActionText]}>Stop</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleExportTest(test.id)}
                >
                  <Ionicons name="download" size={16} color={tokens.colors.text.secondary} />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderTestDetails = () => {
    if (!selectedTest) return null;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setViewMode('overview')}
          >
            <Ionicons name="arrow-back" size={20} color={tokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.detailsTitle}>{selectedTest.name}</Text>
        </View>

        <View style={styles.testInfo}>
          <Text style={styles.testDescription}>{selectedTest.description}</Text>
          <View style={styles.testMeta}>
            <Text style={styles.metaItem}>Created: {new Date(selectedTest.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.metaItem}>Target Metric: {selectedTest.targetMetric.replace('_', ' ')}</Text>
            {selectedTest.startDate && (
              <Text style={styles.metaItem}>Started: {new Date(selectedTest.startDate).toLocaleDateString()}</Text>
            )}
          </View>
        </View>

        <View style={styles.variantsSection}>
          <Text style={styles.sectionTitle}>Variants</Text>
          {selectedTest.variants.map((variant) => (
            <View key={variant.id} style={styles.variantCard}>
              <View style={styles.variantHeader}>
                <Text style={styles.variantName}>{variant.name}</Text>
                <Text style={styles.variantWeight}>{variant.weight}%</Text>
              </View>
              <Text style={styles.variantDescription}>{variant.description}</Text>
              
              {Object.keys(variant.config).length > 0 && (
                <View style={styles.configSection}>
                  <Text style={styles.configTitle}>Configuration:</Text>
                  {Object.entries(variant.config).map(([key, value]) => (
                    <Text key={key} style={styles.configItem}>
                      {key}: {JSON.stringify(value)}
                    </Text>
                  ))}
                </View>
              )}

              {selectedTest.results?.variantResults[variant.id] && (
                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>Results:</Text>
                  <View style={styles.resultsGrid}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Participants</Text>
                      <Text style={styles.resultValue}>
                        {selectedTest.results.variantResults[variant.id].participants}
                      </Text>
                    </View>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Feature Engagement</Text>
                      <Text style={styles.resultValue}>
                        {selectedTest.results.variantResults[variant.id].metrics.featureEngagement.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {selectedTest.results && (
          <View style={styles.overallResults}>
            <Text style={styles.sectionTitle}>Overall Results</Text>
            <View style={styles.resultsCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Participants</Text>
                <Text style={styles.resultValue}>{selectedTest.results.totalParticipants}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Statistical Significance</Text>
                <Text style={styles.resultValue}>
                  {(selectedTest.results.statisticalSignificance * 100).toFixed(1)}%
                </Text>
              </View>
              {selectedTest.results.winner && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Winner</Text>
                  <Text style={[styles.resultValue, styles.winnerText]}>
                    {selectedTest.variants.find(v => v.id === selectedTest.results?.winner)?.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />
      
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack || (() => navigation?.goBack())}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>A/B Testing</Text>
        <View style={{ width: 24 }} />
      </View>

      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'details' && renderTestDetails()}

      {/* Template Selection Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New Test</Text>
            <Text style={styles.modalSubtitle}>Choose from a template or start from scratch</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Test name (optional)"
              value={newTestName}
              onChangeText={setNewTestName}
            />

            <View style={styles.templatesList}>
              {Object.entries(TEST_TEMPLATES).map(([key, template]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.templateCard}
                  onPress={() => handleCreateFromTemplate(key as keyof typeof TEST_TEMPLATES)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templateMetric}>Target: {template.targetMetric.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowTemplateModal(false);
                setNewTestName('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  topTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  },
  container: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  createButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${tokens.colors.primary.DEFAULT}33`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  testsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl * 2,
  },
  emptyTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  emptyDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  testCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  testHeader: {
    marginBottom: tokens.spacing.lg,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  testName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: tokens.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  statusText: {
    ...tokens.typography.caption,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  testDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    lineHeight: 18,
  },
  testMetrics: {
    flexDirection: 'row',
    gap: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tokens.spacing.xs,
  },
  metricValue: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  testActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.xs,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  primaryAction: {
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderColor: tokens.colors.primary.DEFAULT,
  },
  dangerAction: {
    backgroundColor: tokens.colors.status.error,
    borderColor: tokens.colors.status.error,
  },
  actionButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
  primaryActionText: {
    color: tokens.colors.text.inverse,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  backButton: {
    padding: tokens.spacing.sm,
  },
  detailsTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    flex: 1,
  },
  testInfo: {
    marginBottom: tokens.spacing.xl,
  },
  testMeta: {
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  metaItem: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  variantsSection: {
    marginBottom: tokens.spacing.xl,
  },
  variantCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  variantName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  variantWeight: {
    ...tokens.typography.small,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
  },
  variantDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.md,
  },
  configSection: {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.sm,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  configTitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
  },
  configItem: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    fontFamily: 'monospace',
  },
  resultsSection: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    paddingTop: tokens.spacing.md,
  },
  resultsTitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.sm,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultLabel: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.xs,
  },
  resultValue: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  overallResults: {
    marginBottom: tokens.spacing.xl,
  },
  resultsCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  winnerText: {
    color: tokens.colors.status.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  modal: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
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
    marginBottom: tokens.spacing.lg,
  },
  templatesList: {
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  templateCard: {
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
  },
  templateName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  templateDescription: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  templateMetric: {
    ...tokens.typography.caption,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '500',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  modalCancelText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
  },
});

export default ABTestingScreen;