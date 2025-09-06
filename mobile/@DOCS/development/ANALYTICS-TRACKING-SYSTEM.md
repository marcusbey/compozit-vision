# Context Analytics Tracking System

## Overview

The Context Analytics Tracking System provides comprehensive insights into how users interact with the smart contextual feature filtering system in Compozit Vision. It tracks user behavior, feature relevance, context detection accuracy, and AI performance to continuously improve the user experience.

## Features Implemented

### 1. Comprehensive Event Tracking
- **Context Analysis Events**: Track AI vs keyword analysis usage, confidence scores, processing times
- **User Interactions**: Monitor feature clicks, context overrides, input patterns
- **Gemini API Performance**: Response times, success rates, fallback usage
- **Session Analytics**: Duration, event frequency, engagement patterns

### 2. Real-Time Analytics Dashboard
- **Multiple Views**: Overview, Features, Context Distribution, Gemini AI Performance
- **Interactive Metrics**: Drill down into specific insights and trends
- **Export Functionality**: JSON export of all analytics data
- **Data Management**: Clear analytics data with confirmation

### 3. Smart Insights Generation
- **Feature Relevance Scoring**: Based on user interaction rates
- **Context Accuracy Measurement**: Track override rates and confidence levels
- **User Behavior Patterns**: Analysis method preferences, discovery rates
- **Performance Monitoring**: API response times and reliability metrics

## Architecture

### Core Components

#### 1. ContextAnalyticsService (`contextAnalyticsService.ts`)
The main analytics engine that handles:
- Event tracking and storage
- Data aggregation and insights generation
- Local storage management with AsyncStorage
- Export and cleanup functionality

#### 2. AnalyticsScreen (`AnalyticsScreen.tsx`)
Admin dashboard providing:
- Multi-tab interface for different analytics views
- Real-time data visualization
- Export and data management controls
- Responsive design with design tokens

#### 3. Integration Points
- **UnifiedProjectScreen**: Tracks all user interactions
- **contextAnalysis.ts**: Tracks AI performance metrics
- **Navigation**: Analytics screen accessible via admin routes

### Data Architecture

#### Event Types Tracked
```typescript
type AnalyticsEventType = 
  | 'context_analysis_triggered'    // When analysis starts
  | 'context_detection_result'      // Analysis completion
  | 'user_context_override'         // Manual context selection
  | 'feature_suggested'             // Feature recommendation
  | 'feature_clicked'               // User feature interaction
  | 'gemini_api_used'              // AI API calls
  | 'analysis_method_switched'      // AI/keyword toggle
  | 'user_input_analyzed'          // Text input analysis
  | 'session_started'              // Session tracking
  | 'session_ended'                // Session completion
```

#### Key Data Structures
```typescript
interface ContextDetectionEvent {
  userInput: string;
  detectedContext: ProjectContext;
  confidence: number;
  analysisMethod: 'keyword' | 'gemini' | 'user_override';
  suggestedFeatures: FeatureId[];
  processingTime: number;
}

interface FeatureInteractionEvent {
  featureId: FeatureId;
  context: ProjectContext;
  suggested: boolean;
  interactionType: 'clicked' | 'ignored' | 'manually_added';
  timeSinceShown: number;
}
```

## Analytics Insights Generated

### 1. Context Accuracy Metrics
- **Overall Accuracy**: Percentage of correct context detection
- **User Override Rate**: How often users manually correct context
- **Average Confidence**: Mean confidence scores from analysis
- **Context Distribution**: Usage patterns across project types

### 2. Feature Relevance Scores
- **Interaction Rates**: Which features users click most
- **Context-Specific Preferences**: Top features by project type
- **Discovery Rate**: How many features users explore
- **Engagement Patterns**: Time spent with different features

### 3. User Engagement Metrics
- **Session Analytics**: Duration, event frequency, active times
- **Behavior Patterns**: Analysis method preferences
- **Context Switching**: How often users override AI
- **Feature Adoption**: Rate of new feature discovery

### 4. Gemini AI Performance
- **Success Rates**: API reliability metrics
- **Response Times**: Performance benchmarks
- **Fallback Usage**: How often keyword analysis is used
- **Cost Efficiency**: Token usage and optimization

## Implementation Details

### 1. Event Tracking Integration

**User Input Analysis**
```typescript
// Track user input patterns
contextAnalyticsService.trackUserInput(userPrompt, true);

// Track analysis results
contextAnalyticsService.trackContextAnalysis({
  userInput: userPrompt,
  detectedContext: analysis.primaryContext,
  confidence: analysis.confidence,
  analysisMethod: useGeminiAnalysis ? 'gemini' : 'keyword',
  suggestedFeatures: analysis.suggestedFeatures,
  processingTime
});
```

**Feature Interactions**
```typescript
// Track feature clicks
contextAnalyticsService.trackFeatureInteraction({
  featureId,
  context: contextAnalysis?.primaryContext || 'unknown',
  suggested: true,
  interactionType: 'clicked',
  timeSinceShown: Date.now() - startTime
});
```

**Context Overrides**
```typescript
// Track manual context selection
contextAnalyticsService.trackContextOverride({
  originalContext: contextAnalysis.primaryContext,
  overrideContext: selectedContext,
  confidence: contextAnalysis.confidence,
  reason: 'manual_preference'
});
```

### 2. Data Storage Strategy

**Local Storage with AsyncStorage**
- Events stored locally for privacy and performance
- Configurable storage limits (1000 events max)
- Automatic cleanup to prevent bloat
- JSON serialization for easy export

**Session Management**
- Unique session IDs for tracking user journeys
- User ID association when available
- Session duration and event counting
- Automatic session lifecycle management

### 3. Performance Optimizations

**Efficient Data Handling**
- Debounced event processing (300ms)
- Batch operations for multiple events
- Lazy loading of analytics insights
- Memory-efficient data structures

**Privacy-First Design**
- Local data storage only
- No automatic data transmission
- User-controlled data export
- Clear data deletion options

## Usage Instructions

### 1. Accessing Analytics
```typescript
// Navigate to analytics screen
NavigationHelpers.navigateToScreen('analytics');

// Or programmatically get insights
const insights = await contextAnalyticsService.getAnalyticsInsights();
```

### 2. Configuring Analytics
```typescript
// Set user ID for tracking
contextAnalyticsService.setUserId(userId);

// Enable/disable analytics
contextAnalyticsService.setEnabled(true);
```

### 3. Exporting Data
```typescript
// Export all analytics data
const exportData = await contextAnalyticsService.exportAnalyticsData();

// Clear analytics data
await contextAnalyticsService.clearAnalyticsData();
```

## Dashboard Features

### Overview Tab
- Context accuracy metrics
- User engagement statistics
- Session analytics
- Key performance indicators

### Features Tab
- Feature relevance ranking
- User behavior patterns
- Interaction rates by feature
- Discovery and adoption metrics

### Context Tab
- Project type distribution
- Top features by context
- Context switching patterns
- Accuracy by project type

### Gemini AI Tab
- API performance metrics
- Success vs fallback rates
- Response time analytics
- Cost efficiency tracking

## Privacy and Security

### Data Protection
- **Local Storage Only**: No data sent to external servers
- **User Control**: Users can export or delete their data anytime
- **Anonymous by Default**: User ID is optional
- **Development Logging**: Analytics logs only shown in development mode

### Compliance Considerations
- **GDPR Ready**: User-controlled data with export/deletion
- **Minimal Data Collection**: Only necessary interaction data
- **Transparent Processing**: Clear purpose for all tracked events
- **Opt-out Capability**: Analytics can be disabled entirely

## Future Enhancements

### Planned Features
1. **Real-time Insights**: Live dashboard updates during sessions
2. **Comparative Analytics**: A/B testing framework integration
3. **Predictive Analytics**: ML-based user behavior predictions
4. **Advanced Visualizations**: Charts and graphs for trend analysis
5. **Custom Event Tracking**: User-defined analytics events

### Integration Opportunities
1. **Admin Panel**: Centralized analytics management
2. **A/B Testing Framework**: Experiment tracking and analysis
3. **Performance Monitoring**: System health and optimization insights
4. **User Feedback Integration**: Combine analytics with user ratings

## Troubleshooting

### Common Issues

**Analytics not tracking**
- Check if analytics is enabled: `contextAnalyticsService.setEnabled(true)`
- Verify user ID is set if required
- Check console for error messages

**Dashboard not loading**
- Ensure AsyncStorage permissions
- Check for corrupted data in storage
- Try clearing analytics data and restarting

**Performance issues**
- Check storage limits (max 1000 events)
- Verify event debouncing is working
- Monitor memory usage during analytics operations

### Debug Mode
Enable detailed logging in development:
```typescript
// All analytics events are logged in development mode
if (__DEV__) {
  console.log('📊 Analytics Event:', eventType, data);
}
```

## Cost and Performance Impact

### Storage Usage
- Average event size: ~500 bytes
- Maximum storage: ~500KB (1000 events)
- Cleanup frequency: Automatic when limit reached
- Export size: Variable based on usage

### Performance Impact
- Event tracking: < 1ms overhead
- Insights generation: 10-50ms (cached)
- Dashboard loading: 100-500ms
- Storage operations: 5-20ms

This analytics system provides comprehensive insights while maintaining user privacy and system performance, enabling continuous improvement of the contextual feature filtering system.