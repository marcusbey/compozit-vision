// A/B Testing Framework for Context Analysis Feature Filtering
// This service manages experiments to optimize feature suggestion algorithms

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectContext, FeatureId, ContextAnalysis } from '../utils/contextAnalysis';
import contextAnalyticsService from './contextAnalyticsService';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  targetMetric: 'feature_engagement' | 'context_accuracy' | 'user_satisfaction' | 'session_duration';
  variants: ABTestVariant[];
  allocation: ABTestAllocation;
  results?: ABTestResults;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  config: ABTestConfig;
  weight: number; // Percentage allocation (0-100)
}

export interface ABTestConfig {
  // Feature suggestion algorithm parameters
  confidenceThreshold?: number;
  maxFeatures?: number;
  priorityBoost?: Record<FeatureId, number>;
  contextWeights?: Record<ProjectContext, number>;
  
  // UI/UX variations
  animationDuration?: number;
  debounceDelay?: number;
  showConfidenceScores?: boolean;
  featureGrouping?: 'none' | 'by_priority' | 'by_context';
  
  // Analysis method defaults
  defaultAnalysisMethod?: 'keyword' | 'gemini';
  fallbackBehavior?: 'immediate' | 'delayed' | 'retry';
}

export interface ABTestAllocation {
  strategy: 'random' | 'hash_based' | 'geographic' | 'user_segment';
  seed?: string; // For consistent hash-based allocation
  segments?: string[]; // For user segment-based allocation
}

export interface ABTestResults {
  totalParticipants: number;
  variantResults: Record<string, VariantResults>;
  statisticalSignificance: number;
  winner?: string;
  confidenceInterval: [number, number];
  lastUpdated: string;
}

export interface VariantResults {
  participants: number;
  metrics: {
    featureEngagement: number;
    contextAccuracy: number;
    userSatisfaction: number;
    sessionDuration: number;
    conversionRate: number;
  };
  events: {
    featureClicks: number;
    contextOverrides: number;
    sessionCompletions: number;
    errors: number;
  };
}

export interface UserAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: string;
  sessionId: string;
}

export interface ABTestEvent {
  testId: string;
  variantId: string;
  userId: string;
  eventType: ABTestEventType;
  eventData: any;
  timestamp: number;
}

export type ABTestEventType =
  | 'variant_assigned'
  | 'feature_interaction'
  | 'context_override'
  | 'session_completed'
  | 'conversion'
  | 'error_occurred';

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private currentUserId?: string;
  private events: ABTestEvent[] = [];
  
  private readonly STORAGE_KEY_TESTS = 'ab_tests';
  private readonly STORAGE_KEY_ASSIGNMENTS = 'ab_test_assignments';
  private readonly STORAGE_KEY_EVENTS = 'ab_test_events';

  constructor() {
    this.loadStoredData();
  }

  // Initialize with user ID
  public setUserId(userId: string) {
    this.currentUserId = userId;
  }

  // Test Management
  public async createTest(testConfig: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate variant weights sum to 100
    const totalWeight = testConfig.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100%');
    }

    const test: ABTest = {
      ...testConfig,
      id: testId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tests.set(testId, test);
    await this.persistTests();
    
    console.log('✅ AB Test Created:', testId, test.name);
    return testId;
  }

  public async startTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    
    await this.persistTests();
    console.log('🚀 AB Test Started:', testId, test.name);
  }

  public async stopTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);
    
    test.status = 'completed';
    test.endDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    
    // Calculate final results
    test.results = await this.calculateTestResults(testId);
    
    await this.persistTests();
    console.log('🏁 AB Test Completed:', testId, test.name);
  }

  public getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  public getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  public getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  // User Assignment and Variant Selection
  public async getVariantForUser(testId: string, userId: string): Promise<string | null> {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;

    // Check existing assignment
    const userAssignments = this.userAssignments.get(userId) || [];
    const existingAssignment = userAssignments.find(assignment => assignment.testId === testId);
    
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Assign new variant
    const variantId = this.assignVariant(test, userId);
    const assignment: UserAssignment = {
      userId,
      testId,
      variantId,
      assignedAt: new Date().toISOString(),
      sessionId: `session_${Date.now()}`
    };

    userAssignments.push(assignment);
    this.userAssignments.set(userId, userAssignments);
    
    await this.persistAssignments();
    
    // Track assignment event
    this.trackEvent(testId, variantId, userId, 'variant_assigned', { assignment });
    
    console.log('👥 User assigned to variant:', userId, testId, variantId);
    return variantId;
  }

  private assignVariant(test: ABTest, userId: string): string {
    const { allocation, variants } = test;
    
    switch (allocation.strategy) {
      case 'random':
        return this.randomVariantAssignment(variants);
      
      case 'hash_based':
        return this.hashBasedAssignment(variants, userId, allocation.seed);
      
      default:
        return this.randomVariantAssignment(variants);
    }
  }

  private randomVariantAssignment(variants: ABTestVariant[]): string {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return variants[0].id;
  }

  private hashBasedAssignment(variants: ABTestVariant[], userId: string, seed?: string): string {
    // Simple hash function for consistent assignment
    const hashInput = `${userId}_${seed || 'default'}`;
    let hash = 0;
    
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const random = Math.abs(hash) % 100;
    let cumulativeWeight = 0;
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant.id;
      }
    }
    
    return variants[0].id;
  }

  // Context Analysis Integration
  public async getTestConfigForUser(userId: string, testType: 'feature_filtering'): Promise<ABTestConfig | null> {
    // Get active tests that affect feature filtering
    const activeTests = this.getActiveTests().filter(test => 
      test.name.includes('feature') || test.name.includes('filtering')
    );
    
    if (activeTests.length === 0) return null;
    
    // For simplicity, use the first active test (in production, handle multiple tests)
    const test = activeTests[0];
    const variantId = await this.getVariantForUser(test.id, userId);
    
    if (!variantId) return null;
    
    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  // Event Tracking
  public trackEvent(
    testId: string, 
    variantId: string, 
    userId: string, 
    eventType: ABTestEventType, 
    eventData: any
  ): void {
    const event: ABTestEvent = {
      testId,
      variantId,
      userId,
      eventType,
      eventData,
      timestamp: Date.now()
    };

    this.events.push(event);
    this.persistEvents();
    
    if (__DEV__) {
      console.log('📊 AB Test Event:', eventType, testId, variantId);
    }
  }

  // Results Calculation
  private async calculateTestResults(testId: string): Promise<ABTestResults> {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test ${testId} not found`);

    const testEvents = this.events.filter(event => event.testId === testId);
    const variantResults: Record<string, VariantResults> = {};
    
    // Initialize results for each variant
    for (const variant of test.variants) {
      variantResults[variant.id] = {
        participants: 0,
        metrics: {
          featureEngagement: 0,
          contextAccuracy: 0,
          userSatisfaction: 0,
          sessionDuration: 0,
          conversionRate: 0,
        },
        events: {
          featureClicks: 0,
          contextOverrides: 0,
          sessionCompletions: 0,
          errors: 0,
        }
      };
    }

    // Calculate metrics from events
    const userSessions = new Map<string, Set<string>>();
    
    testEvents.forEach(event => {
      const results = variantResults[event.variantId];
      if (!results) return;

      // Track unique participants
      if (!userSessions.has(event.variantId)) {
        userSessions.set(event.variantId, new Set());
      }
      userSessions.get(event.variantId)!.add(event.userId);

      // Count events
      switch (event.eventType) {
        case 'feature_interaction':
          results.events.featureClicks++;
          break;
        case 'context_override':
          results.events.contextOverrides++;
          break;
        case 'session_completed':
          results.events.sessionCompletions++;
          break;
        case 'error_occurred':
          results.events.errors++;
          break;
      }
    });

    // Calculate final metrics
    for (const [variantId, results] of Object.entries(variantResults)) {
      const participants = userSessions.get(variantId)?.size || 0;
      results.participants = participants;

      if (participants > 0) {
        results.metrics.featureEngagement = results.events.featureClicks / participants;
        results.metrics.conversionRate = results.events.sessionCompletions / participants;
        
        // Additional metrics would be calculated from analytics data
        // This is a simplified version
      }
    }

    const totalParticipants = Object.values(variantResults)
      .reduce((sum, results) => sum + results.participants, 0);

    // Simple statistical significance calculation (would use proper statistical tests in production)
    const statisticalSignificance = totalParticipants > 100 ? 0.95 : 0.5;

    // Determine winner based on target metric
    let winner: string | undefined;
    let bestScore = -1;

    for (const [variantId, results] of Object.entries(variantResults)) {
      const score = this.getMetricScore(results, test.targetMetric);
      if (score > bestScore) {
        bestScore = score;
        winner = variantId;
      }
    }

    return {
      totalParticipants,
      variantResults,
      statisticalSignificance,
      winner,
      confidenceInterval: [bestScore * 0.9, bestScore * 1.1], // Simplified CI
      lastUpdated: new Date().toISOString()
    };
  }

  private getMetricScore(results: VariantResults, metric: ABTest['targetMetric']): number {
    switch (metric) {
      case 'feature_engagement':
        return results.metrics.featureEngagement;
      case 'context_accuracy':
        return results.metrics.contextAccuracy;
      case 'user_satisfaction':
        return results.metrics.userSatisfaction;
      case 'session_duration':
        return results.metrics.sessionDuration;
      default:
        return 0;
    }
  }

  // Data Persistence
  private async loadStoredData(): Promise<void> {
    try {
      const [testsData, assignmentsData, eventsData] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEY_TESTS),
        AsyncStorage.getItem(this.STORAGE_KEY_ASSIGNMENTS),
        AsyncStorage.getItem(this.STORAGE_KEY_EVENTS),
      ]);

      if (testsData) {
        const tests: ABTest[] = JSON.parse(testsData);
        this.tests = new Map(tests.map(test => [test.id, test]));
      }

      if (assignmentsData) {
        const assignments: Record<string, UserAssignment[]> = JSON.parse(assignmentsData);
        this.userAssignments = new Map(Object.entries(assignments));
      }

      if (eventsData) {
        this.events = JSON.parse(eventsData);
      }
    } catch (error) {
      console.error('Failed to load AB testing data:', error);
    }
  }

  private async persistTests(): Promise<void> {
    try {
      const testsArray = Array.from(this.tests.values());
      await AsyncStorage.setItem(this.STORAGE_KEY_TESTS, JSON.stringify(testsArray));
    } catch (error) {
      console.error('Failed to persist AB tests:', error);
    }
  }

  private async persistAssignments(): Promise<void> {
    try {
      const assignmentsObj = Object.fromEntries(this.userAssignments);
      await AsyncStorage.setItem(this.STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignmentsObj));
    } catch (error) {
      console.error('Failed to persist AB test assignments:', error);
    }
  }

  private async persistEvents(): Promise<void> {
    try {
      // Keep only recent events to prevent storage bloat
      if (this.events.length > 5000) {
        this.events = this.events.slice(-5000);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY_EVENTS, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to persist AB test events:', error);
    }
  }

  // Utility Methods
  public async exportTestData(testId?: string): Promise<string> {
    const exportData = {
      tests: testId ? [this.tests.get(testId)] : Array.from(this.tests.values()),
      assignments: Object.fromEntries(this.userAssignments),
      events: testId ? this.events.filter(e => e.testId === testId) : this.events,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  public async clearTestData(): Promise<void> {
    this.tests.clear();
    this.userAssignments.clear();
    this.events = [];

    await Promise.all([
      AsyncStorage.removeItem(this.STORAGE_KEY_TESTS),
      AsyncStorage.removeItem(this.STORAGE_KEY_ASSIGNMENTS),
      AsyncStorage.removeItem(this.STORAGE_KEY_EVENTS),
    ]);
  }

  // Integration with Context Analysis
  public async applyTestConfig(
    baseAnalysis: ContextAnalysis,
    testConfig: ABTestConfig
  ): Promise<ContextAnalysis> {
    let modifiedAnalysis = { ...baseAnalysis };

    // Apply confidence threshold adjustment
    if (testConfig.confidenceThreshold) {
      modifiedAnalysis.confidence = Math.max(
        modifiedAnalysis.confidence,
        testConfig.confidenceThreshold
      );
    }

    // Apply feature limits
    if (testConfig.maxFeatures && modifiedAnalysis.suggestedFeatures.length > testConfig.maxFeatures) {
      modifiedAnalysis.suggestedFeatures = modifiedAnalysis.suggestedFeatures
        .slice(0, testConfig.maxFeatures);
    }

    // Apply priority boosts
    if (testConfig.priorityBoost) {
      // This would modify the feature suggestion algorithm
      // Implementation depends on how features are prioritized
    }

    return modifiedAnalysis;
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();
export default abTestingService;

// Predefined test templates for common experiments
export const TEST_TEMPLATES = {
  FEATURE_COUNT_TEST: {
    name: 'Feature Count Optimization',
    description: 'Test different numbers of suggested features to optimize engagement',
    targetMetric: 'feature_engagement' as const,
    variants: [
      {
        id: 'control',
        name: 'Control (6 features)',
        description: 'Current default behavior',
        config: { maxFeatures: 6 },
        weight: 50
      },
      {
        id: 'reduced',
        name: 'Reduced (4 features)',
        description: 'Show fewer features to reduce cognitive load',
        config: { maxFeatures: 4 },
        weight: 50
      }
    ]
  },

  CONFIDENCE_THRESHOLD_TEST: {
    name: 'Context Confidence Threshold',
    description: 'Test different confidence thresholds for showing context-specific features',
    targetMetric: 'context_accuracy' as const,
    variants: [
      {
        id: 'low_threshold',
        name: 'Low Threshold (0.3)',
        description: 'Show context features with low confidence',
        config: { confidenceThreshold: 0.3 },
        weight: 33.33
      },
      {
        id: 'medium_threshold',
        name: 'Medium Threshold (0.6)',
        description: 'Current default threshold',
        config: { confidenceThreshold: 0.6 },
        weight: 33.33
      },
      {
        id: 'high_threshold',
        name: 'High Threshold (0.8)',
        description: 'Only show context features with high confidence',
        config: { confidenceThreshold: 0.8 },
        weight: 33.34
      }
    ]
  },

  ANIMATION_SPEED_TEST: {
    name: 'Feature Animation Speed',
    description: 'Test different animation durations for feature appearance',
    targetMetric: 'user_satisfaction' as const,
    variants: [
      {
        id: 'fast',
        name: 'Fast (200ms)',
        description: 'Quick, snappy animations',
        config: { animationDuration: 200 },
        weight: 50
      },
      {
        id: 'slow',
        name: 'Slow (600ms)',
        description: 'Smoother, more deliberate animations',
        config: { animationDuration: 600 },
        weight: 50
      }
    ]
  }
};