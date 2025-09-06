// Context Analytics Service for Feature Relevance and User Engagement Tracking
// This service tracks how users interact with the smart context detection system

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectContext, FeatureId, ContextAnalysis } from '../utils/contextAnalysis';

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  eventType: AnalyticsEventType;
  data: any;
}

export type AnalyticsEventType = 
  | 'context_analysis_triggered'
  | 'context_detection_result'
  | 'user_context_override'
  | 'feature_suggested'
  | 'feature_clicked'
  | 'feature_ignored'
  | 'gemini_api_used'
  | 'gemini_api_failed'
  | 'analysis_method_switched'
  | 'user_input_analyzed'
  | 'feature_relevance_feedback'
  | 'session_started'
  | 'session_ended';

export interface ContextDetectionEvent {
  userInput: string;
  detectedContext: ProjectContext;
  confidence: number;
  analysisMethod: 'keyword' | 'gemini' | 'user_override';
  suggestedFeatures: FeatureId[];
  processingTime: number;
}

export interface FeatureInteractionEvent {
  featureId: FeatureId;
  context: ProjectContext;
  suggested: boolean;
  interactionType: 'clicked' | 'ignored' | 'manually_added';
  timeSinceShown: number;
}

export interface UserOverrideEvent {
  originalContext: ProjectContext;
  overrideContext: ProjectContext;
  confidence: number;
  reason?: 'low_confidence' | 'user_disagreement' | 'manual_preference';
}

export interface GeminiUsageEvent {
  success: boolean;
  responseTime?: number;
  errorType?: string;
  fallbackUsed: boolean;
}

class ContextAnalyticsService {
  private sessionId: string = '';
  private userId?: string;
  private sessionStartTime: number = 0;
  private isEnabled: boolean = true;
  private events: AnalyticsEvent[] = [];
  private readonly STORAGE_KEY = 'context_analytics_events';
  private readonly MAX_STORED_EVENTS = 1000;
  private readonly BATCH_SIZE = 50;

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
    this.trackEvent('session_started', {
      sessionId: this.sessionId,
      timestamp: this.sessionStartTime
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Track context analysis events
  public trackContextAnalysis(data: ContextDetectionEvent) {
    this.trackEvent('context_detection_result', {
      ...data,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  public trackUserInput(userInput: string, analysisTriggered: boolean) {
    this.trackEvent('user_input_analyzed', {
      inputLength: userInput.length,
      wordCount: userInput.trim().split(/\s+/).length,
      analysisTriggered,
      containsNumbers: /\d/.test(userInput),
      containsSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(userInput)
    });
  }

  public trackContextOverride(data: UserOverrideEvent) {
    this.trackEvent('user_context_override', {
      ...data,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  public trackFeatureInteraction(data: FeatureInteractionEvent) {
    this.trackEvent('feature_clicked', {
      ...data,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  public trackFeatureSuggestion(
    featureId: FeatureId,
    context: ProjectContext,
    confidence: number,
    priority: number
  ) {
    this.trackEvent('feature_suggested', {
      featureId,
      context,
      confidence,
      priority,
      timestamp: Date.now()
    });
  }

  public trackGeminiUsage(data: GeminiUsageEvent) {
    this.trackEvent('gemini_api_used', {
      ...data,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  public trackAnalysisMethodSwitch(
    fromMethod: 'keyword' | 'gemini',
    toMethod: 'keyword' | 'gemini',
    reason: string
  ) {
    this.trackEvent('analysis_method_switched', {
      fromMethod,
      toMethod,
      reason,
      sessionDuration: Date.now() - this.sessionStartTime
    });
  }

  // Feature relevance feedback
  public trackFeatureRelevanceFeedback(
    featureId: FeatureId,
    context: ProjectContext,
    relevant: boolean,
    confidence: number
  ) {
    this.trackEvent('feature_relevance_feedback', {
      featureId,
      context,
      relevant,
      confidence,
      feedbackType: 'implicit' // Based on user interactions
    });
  }

  // Core event tracking
  private trackEvent(eventType: AnalyticsEventType, data: any) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType,
      data: {
        ...data,
        userAgent: 'react-native',
        platform: 'mobile'
      }
    };

    this.events.push(event);
    this.persistEvents();

    // Log in development
    if (__DEV__) {
      console.log('📊 Analytics Event:', eventType, data);
    }
  }

  // Persistence and storage
  private async persistEvents() {
    try {
      // Keep only recent events to prevent storage bloat
      if (this.events.length > this.MAX_STORED_EVENTS) {
        this.events = this.events.slice(-this.MAX_STORED_EVENTS);
      }

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  private async loadPersistedEvents() {
    try {
      const storedEvents = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Failed to load persisted analytics events:', error);
    }
  }

  // Analytics insights and reporting
  public async getAnalyticsInsights(): Promise<AnalyticsInsights> {
    await this.loadPersistedEvents();
    
    return {
      contextAccuracy: this.calculateContextAccuracy(),
      featureRelevanceScores: this.calculateFeatureRelevanceScores(),
      userEngagementMetrics: this.calculateEngagementMetrics(),
      geminiPerformanceMetrics: this.calculateGeminiMetrics(),
      topFeaturesByContext: this.getTopFeaturesByContext(),
      sessionAnalytics: this.calculateSessionMetrics(),
      userBehaviorPatterns: this.analyzeBehaviorPatterns()
    };
  }

  private calculateContextAccuracy(): ContextAccuracyMetrics {
    const contextEvents = this.events.filter(e => e.eventType === 'context_detection_result');
    const overrideEvents = this.events.filter(e => e.eventType === 'user_context_override');
    
    const totalAnalyses = contextEvents.length;
    const userOverrides = overrideEvents.length;
    const accuracy = totalAnalyses > 0 ? ((totalAnalyses - userOverrides) / totalAnalyses) * 100 : 0;

    return {
      totalAnalyses,
      userOverrides,
      accuracy,
      averageConfidence: this.calculateAverageConfidence(contextEvents),
      contextDistribution: this.calculateContextDistribution(contextEvents)
    };
  }

  private calculateFeatureRelevanceScores(): FeatureRelevanceScores {
    const suggestionEvents = this.events.filter(e => e.eventType === 'feature_suggested');
    const interactionEvents = this.events.filter(e => e.eventType === 'feature_clicked');
    
    const scores: Record<FeatureId, number> = {} as Record<FeatureId, number>;
    
    suggestionEvents.forEach(event => {
      const featureId = event.data.featureId as FeatureId;
      if (!scores[featureId]) scores[featureId] = 0;
      
      // Check if user interacted with this feature
      const wasClicked = interactionEvents.some(ie => 
        ie.data.featureId === featureId && 
        Math.abs(ie.timestamp - event.timestamp) < 300000 // Within 5 minutes
      );
      
      if (wasClicked) {
        scores[featureId] += 1;
      }
    });
    
    return scores;
  }

  private calculateEngagementMetrics(): UserEngagementMetrics {
    const sessionEvents = this.events.filter(e => e.eventType === 'session_started');
    const featureClicks = this.events.filter(e => e.eventType === 'feature_clicked');
    const inputEvents = this.events.filter(e => e.eventType === 'user_input_analyzed');
    
    return {
      totalSessions: sessionEvents.length,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      featuresClickedPerSession: featureClicks.length / Math.max(sessionEvents.length, 1),
      inputEventsPerSession: inputEvents.length / Math.max(sessionEvents.length, 1),
      contextOverrideRate: this.calculateOverrideRate()
    };
  }

  private calculateGeminiMetrics(): GeminiPerformanceMetrics {
    const geminiEvents = this.events.filter(e => e.eventType === 'gemini_api_used');
    
    const totalRequests = geminiEvents.length;
    const successfulRequests = geminiEvents.filter(e => e.data.success).length;
    const averageResponseTime = geminiEvents
      .filter(e => e.data.responseTime)
      .reduce((sum, e) => sum + e.data.responseTime, 0) / Math.max(successfulRequests, 1);
    
    return {
      totalRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageResponseTime,
      fallbackUsageRate: this.calculateFallbackRate(geminiEvents)
    };
  }

  private getTopFeaturesByContext(): Record<ProjectContext, FeatureId[]> {
    const clickEvents = this.events.filter(e => e.eventType === 'feature_clicked');
    
    const contextFeatureMap: Record<ProjectContext, Record<FeatureId, number>> = {
      interior: {} as Record<FeatureId, number>,
      garden: {} as Record<FeatureId, number>,
      exterior: {} as Record<FeatureId, number>,
      mixed: {} as Record<FeatureId, number>,
      unknown: {} as Record<FeatureId, number>
    };
    
    clickEvents.forEach(event => {
      const context = event.data.context as ProjectContext;
      const featureId = event.data.featureId as FeatureId;
      
      if (!contextFeatureMap[context][featureId]) {
        contextFeatureMap[context][featureId] = 0;
      }
      contextFeatureMap[context][featureId]++;
    });
    
    // Convert to sorted arrays
    const result: Record<ProjectContext, FeatureId[]> = {} as Record<ProjectContext, FeatureId[]>;
    
    Object.entries(contextFeatureMap).forEach(([context, features]) => {
      result[context as ProjectContext] = Object.entries(features)
        .sort(([, a], [, b]) => b - a)
        .map(([featureId]) => featureId as FeatureId)
        .slice(0, 5); // Top 5 features per context
    });
    
    return result;
  }

  private calculateSessionMetrics(): SessionAnalytics {
    const currentTime = Date.now();
    const sessionDuration = currentTime - this.sessionStartTime;
    
    return {
      currentSessionDuration: sessionDuration,
      eventsInCurrentSession: this.events.filter(e => e.sessionId === this.sessionId).length,
      averageTimeBetweenEvents: this.calculateAverageTimeBetweenEvents(),
      mostActiveTimeOfDay: this.calculateMostActiveTimeOfDay()
    };
  }

  private analyzeBehaviorPatterns(): UserBehaviorPatterns {
    return {
      preferredAnalysisMethod: this.calculatePreferredAnalysisMethod(),
      commonInputPatterns: this.findCommonInputPatterns(),
      featureDiscoveryRate: this.calculateFeatureDiscoveryRate(),
      contextSwitchingFrequency: this.calculateContextSwitchingFrequency()
    };
  }

  // Helper calculation methods
  private calculateAverageConfidence(events: AnalyticsEvent[]): number {
    const confidenceValues = events
      .map(e => e.data.confidence)
      .filter(c => typeof c === 'number');
    
    return confidenceValues.length > 0 
      ? confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length 
      : 0;
  }

  private calculateContextDistribution(events: AnalyticsEvent[]): Record<ProjectContext, number> {
    const distribution: Record<ProjectContext, number> = {
      interior: 0,
      garden: 0,
      exterior: 0,
      mixed: 0,
      unknown: 0
    };
    
    events.forEach(event => {
      const context = event.data.detectedContext as ProjectContext;
      if (distribution[context] !== undefined) {
        distribution[context]++;
      }
    });
    
    return distribution;
  }

  private calculateAverageSessionDuration(): number {
    // Simplified - would need more complex session tracking for real implementation
    return Date.now() - this.sessionStartTime;
  }

  private calculateOverrideRate(): number {
    const totalAnalyses = this.events.filter(e => e.eventType === 'context_detection_result').length;
    const overrides = this.events.filter(e => e.eventType === 'user_context_override').length;
    
    return totalAnalyses > 0 ? (overrides / totalAnalyses) * 100 : 0;
  }

  private calculateFallbackRate(geminiEvents: AnalyticsEvent[]): number {
    const fallbackEvents = geminiEvents.filter(e => e.data.fallbackUsed).length;
    return geminiEvents.length > 0 ? (fallbackEvents / geminiEvents.length) * 100 : 0;
  }

  private calculateAverageTimeBetweenEvents(): number {
    if (this.events.length < 2) return 0;
    
    const sortedEvents = this.events.sort((a, b) => a.timestamp - b.timestamp);
    const timeDifferences = [];
    
    for (let i = 1; i < sortedEvents.length; i++) {
      timeDifferences.push(sortedEvents[i].timestamp - sortedEvents[i - 1].timestamp);
    }
    
    return timeDifferences.reduce((sum, diff) => sum + diff, 0) / timeDifferences.length;
  }

  private calculateMostActiveTimeOfDay(): string {
    const hourCounts: Record<number, number> = {};
    
    this.events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const mostActiveHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    return mostActiveHour ? `${mostActiveHour}:00` : 'Unknown';
  }

  private calculatePreferredAnalysisMethod(): 'keyword' | 'gemini' | 'mixed' {
    const analysisEvents = this.events.filter(e => e.eventType === 'context_detection_result');
    const methodCounts = { keyword: 0, gemini: 0 };
    
    analysisEvents.forEach(event => {
      const method = event.data.analysisMethod;
      if (methodCounts[method] !== undefined) {
        methodCounts[method]++;
      }
    });
    
    if (methodCounts.gemini > methodCounts.keyword) return 'gemini';
    if (methodCounts.keyword > methodCounts.gemini) return 'keyword';
    return 'mixed';
  }

  private findCommonInputPatterns(): string[] {
    const inputEvents = this.events.filter(e => e.eventType === 'user_input_analyzed');
    const patterns: Record<string, number> = {};
    
    inputEvents.forEach(event => {
      const wordCount = event.data.wordCount;
      const hasNumbers = event.data.containsNumbers;
      const hasSpecialChars = event.data.containsSpecialChars;
      
      const pattern = `${wordCount}words_${hasNumbers ? 'nums' : 'noNums'}_${hasSpecialChars ? 'special' : 'noSpecial'}`;
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
    
    return Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([pattern]) => pattern);
  }

  private calculateFeatureDiscoveryRate(): number {
    const suggestionEvents = this.events.filter(e => e.eventType === 'feature_suggested');
    const uniqueFeatures = new Set(suggestionEvents.map(e => e.data.featureId));
    
    // Assume there are 8 total features available
    const totalFeatures = 8;
    return (uniqueFeatures.size / totalFeatures) * 100;
  }

  private calculateContextSwitchingFrequency(): number {
    const overrideEvents = this.events.filter(e => e.eventType === 'user_context_override');
    const analysisEvents = this.events.filter(e => e.eventType === 'context_detection_result');
    
    return analysisEvents.length > 0 ? (overrideEvents.length / analysisEvents.length) * 100 : 0;
  }

  // Data export and cleanup
  public async exportAnalyticsData(): Promise<string> {
    await this.loadPersistedEvents();
    return JSON.stringify({
      events: this.events,
      insights: await this.getAnalyticsInsights(),
      exportTimestamp: Date.now(),
      sessionId: this.sessionId
    }, null, 2);
  }

  public async clearAnalyticsData(): Promise<void> {
    this.events = [];
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  // Session management
  public endSession() {
    this.trackEvent('session_ended', {
      sessionDuration: Date.now() - this.sessionStartTime,
      totalEvents: this.events.filter(e => e.sessionId === this.sessionId).length
    });
  }
}

// Type definitions for analytics insights
export interface AnalyticsInsights {
  contextAccuracy: ContextAccuracyMetrics;
  featureRelevanceScores: FeatureRelevanceScores;
  userEngagementMetrics: UserEngagementMetrics;
  geminiPerformanceMetrics: GeminiPerformanceMetrics;
  topFeaturesByContext: Record<ProjectContext, FeatureId[]>;
  sessionAnalytics: SessionAnalytics;
  userBehaviorPatterns: UserBehaviorPatterns;
}

export interface ContextAccuracyMetrics {
  totalAnalyses: number;
  userOverrides: number;
  accuracy: number;
  averageConfidence: number;
  contextDistribution: Record<ProjectContext, number>;
}

export interface FeatureRelevanceScores {
  [key: string]: number; // FeatureId to relevance score
}

export interface UserEngagementMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  featuresClickedPerSession: number;
  inputEventsPerSession: number;
  contextOverrideRate: number;
}

export interface GeminiPerformanceMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  fallbackUsageRate: number;
}

export interface SessionAnalytics {
  currentSessionDuration: number;
  eventsInCurrentSession: number;
  averageTimeBetweenEvents: number;
  mostActiveTimeOfDay: string;
}

export interface UserBehaviorPatterns {
  preferredAnalysisMethod: 'keyword' | 'gemini' | 'mixed';
  commonInputPatterns: string[];
  featureDiscoveryRate: number;
  contextSwitchingFrequency: number;
}

// Export singleton instance
export const contextAnalyticsService = new ContextAnalyticsService();
export default contextAnalyticsService;