import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import contextAnalyticsService, { AnalyticsInsights } from '../../services/contextAnalyticsService';
import { ProjectContext, FeatureId } from '../../utils/contextAnalysis';

const { width } = Dimensions.get('window');

interface AnalyticsScreenProps {
  navigation?: any;
  onBack?: () => void;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation, onBack }) => {
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'features' | 'context' | 'gemini'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsInsights = await contextAnalyticsService.getAnalyticsInsights();
      setInsights(analyticsInsights);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const handleExportData = async () => {
    try {
      const exportData = await contextAnalyticsService.exportAnalyticsData();
      // In a real app, you would use sharing API or save to device
      console.log('Analytics Export Data:', exportData);
      Alert.alert('Export Complete', 'Analytics data exported to console (in production, this would save to file)');
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export analytics data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Analytics Data',
      'Are you sure you want to clear all analytics data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await contextAnalyticsService.clearAnalyticsData();
            setInsights(null);
            loadAnalytics();
          }
        }
      ]
    );
  };

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, color?: string) => (
    <View style={[styles.metricCard, color && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderOverviewTab = () => {
    if (!insights) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Context Accuracy</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Overall Accuracy',
            `${insights.contextAccuracy.accuracy.toFixed(1)}%`,
            `${insights.contextAccuracy.totalAnalyses} total analyses`,
            tokens.colors.status.success
          )}
          {renderMetricCard(
            'User Overrides',
            insights.contextAccuracy.userOverrides,
            `${insights.userEngagementMetrics.contextOverrideRate.toFixed(1)}% override rate`,
            tokens.colors.status.warning
          )}
        </View>

        <Text style={styles.sectionTitle}>User Engagement</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Sessions',
            insights.userEngagementMetrics.totalSessions,
            undefined,
            tokens.colors.primary.DEFAULT
          )}
          {renderMetricCard(
            'Features per Session',
            insights.userEngagementMetrics.featuresClickedPerSession.toFixed(1),
            'average interactions',
            tokens.colors.text.primary
          )}
        </View>

        <Text style={styles.sectionTitle}>Session Analytics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Current Session',
            `${Math.floor(insights.sessionAnalytics.currentSessionDuration / 60000)}m`,
            `${insights.sessionAnalytics.eventsInCurrentSession} events`,
            tokens.colors.primary.DEFAULT
          )}
          {renderMetricCard(
            'Most Active Time',
            insights.sessionAnalytics.mostActiveTimeOfDay,
            'peak usage hour',
            tokens.colors.text.primary
          )}
        </View>
      </ScrollView>
    );
  };

  const renderFeaturesTab = () => {
    if (!insights) return null;

    const featureEntries = Object.entries(insights.featureRelevanceScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Feature Relevance Scores</Text>
        <Text style={styles.sectionSubtitle}>Based on user interaction rates with suggested features</Text>
        
        <View style={styles.featureList}>
          {featureEntries.map(([featureId, score], index) => (
            <View key={featureId} style={styles.featureItem}>
              <View style={styles.featureRank}>
                <Text style={styles.featureRankText}>{index + 1}</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureName}>{featureId}</Text>
                <View style={styles.featureScoreBar}>
                  <View 
                    style={[
                      styles.featureScoreFill,
                      { width: `${Math.min(score * 10, 100)}%` }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.featureScore}>{score}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>User Behavior Patterns</Text>
        <View style={styles.behaviorCard}>
          <View style={styles.behaviorItem}>
            <Text style={styles.behaviorLabel}>Preferred Analysis Method</Text>
            <Text style={styles.behaviorValue}>{insights.userBehaviorPatterns.preferredAnalysisMethod}</Text>
          </View>
          <View style={styles.behaviorItem}>
            <Text style={styles.behaviorLabel}>Feature Discovery Rate</Text>
            <Text style={styles.behaviorValue}>{insights.userBehaviorPatterns.featureDiscoveryRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.behaviorItem}>
            <Text style={styles.behaviorLabel}>Context Switching Frequency</Text>
            <Text style={styles.behaviorValue}>{insights.userBehaviorPatterns.contextSwitchingFrequency.toFixed(1)}%</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderContextTab = () => {
    if (!insights) return null;

    const contextEntries = Object.entries(insights.contextAccuracy.contextDistribution)
      .sort(([, a], [, b]) => b - a);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Context Distribution</Text>
        
        <View style={styles.contextGrid}>
          {contextEntries.map(([context, count]) => (
            <View key={context} style={styles.contextCard}>
              <Text style={styles.contextName}>{context}</Text>
              <Text style={styles.contextCount}>{count}</Text>
              <Text style={styles.contextPercentage}>
                {((count / insights.contextAccuracy.totalAnalyses) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Top Features by Context</Text>
        {Object.entries(insights.topFeaturesByContext).map(([context, features]) => (
          <View key={context} style={styles.contextFeatureCard}>
            <Text style={styles.contextFeatureTitle}>{context.charAt(0).toUpperCase() + context.slice(1)}</Text>
            <View style={styles.contextFeatureList}>
              {features.slice(0, 3).map((feature, index) => (
                <View key={feature} style={styles.contextFeatureItem}>
                  <Text style={styles.contextFeatureRank}>{index + 1}.</Text>
                  <Text style={styles.contextFeatureName}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderGeminiTab = () => {
    if (!insights) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Gemini AI Performance</Text>
        
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Success Rate',
            `${insights.geminiPerformanceMetrics.successRate.toFixed(1)}%`,
            `${insights.geminiPerformanceMetrics.totalRequests} total requests`,
            insights.geminiPerformanceMetrics.successRate > 90 ? tokens.colors.status.success : tokens.colors.status.warning
          )}
          {renderMetricCard(
            'Average Response Time',
            `${insights.geminiPerformanceMetrics.averageResponseTime.toFixed(0)}ms`,
            'milliseconds per request',
            insights.geminiPerformanceMetrics.averageResponseTime < 1000 ? tokens.colors.status.success : tokens.colors.status.warning
          )}
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Fallback Usage',
            `${insights.geminiPerformanceMetrics.fallbackUsageRate.toFixed(1)}%`,
            'requests that used fallback',
            insights.geminiPerformanceMetrics.fallbackUsageRate < 10 ? tokens.colors.status.success : tokens.colors.status.error
          )}
        </View>

        <Text style={styles.sectionTitle}>AI vs Keyword Analysis</Text>
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonText}>
            Users prefer <Text style={styles.comparisonHighlight}>
              {insights.userBehaviorPatterns.preferredAnalysisMethod}
            </Text> analysis method based on their usage patterns.
          </Text>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack || (() => navigation?.goBack())}>
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Context Analytics</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={tokens.colors.primary.DEFAULT} />
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
          { id: 'overview', title: 'Overview', icon: 'analytics' },
          { id: 'features', title: 'Features', icon: 'options' },
          { id: 'context', title: 'Context', icon: 'layers' },
          { id: 'gemini', title: 'Gemini AI', icon: 'flash' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, selectedTab === tab.id && styles.activeTabButton]}
            onPress={() => setSelectedTab(tab.id as any)}
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
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'features' && renderFeaturesTab()}
        {selectedTab === 'context' && renderContextTab()}
        {selectedTab === 'gemini' && renderGeminiTab()}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Ionicons name="download" size={20} color={tokens.colors.text.inverse} />
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearData}>
          <Ionicons name="trash" size={20} color={tokens.colors.text.inverse} />
          <Text style={styles.actionButtonText}>Clear Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.md,
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
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
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
    borderRadius: tokens.borderRadius.pill,
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
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  sectionSubtitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    borderLeftWidth: 0,
  },
  metricTitle: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginVertical: tokens.spacing.xs,
  },
  metricSubtitle: {
    ...tokens.typography.caption,
    color: tokens.colors.text.secondary,
  },
  featureList: {
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  featureRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRankText: {
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  featureScoreBar: {
    height: 4,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  featureScoreFill: {
    height: '100%',
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  featureScore: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  behaviorCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  behaviorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  behaviorLabel: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
  },
  behaviorValue: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  contextCard: {
    width: (width - tokens.spacing.xl * 2 - tokens.spacing.md) / 2,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    alignItems: 'center',
  },
  contextName: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  contextCount: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginVertical: tokens.spacing.xs,
  },
  contextPercentage: {
    ...tokens.typography.caption,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '500',
  },
  contextFeatureCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
  },
  contextFeatureTitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    marginBottom: tokens.spacing.md,
    textTransform: 'capitalize',
  },
  contextFeatureList: {
    gap: tokens.spacing.sm,
  },
  contextFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  contextFeatureRank: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
    width: 20,
  },
  contextFeatureName: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    textTransform: 'capitalize',
  },
  comparisonCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  comparisonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
  },
  comparisonHighlight: {
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    padding: tokens.spacing.xl,
    gap: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.md,
    paddingVertical: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  dangerButton: {
    backgroundColor: tokens.colors.status.error,
  },
  actionButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
});

export default AnalyticsScreen;