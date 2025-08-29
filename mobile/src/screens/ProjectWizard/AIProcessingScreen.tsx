import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useJourneyStore } from '../../stores/journeyStore';
import { useContentStore } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/NavigationHelpers';
import { geminiVisionService } from '../../services/geminiVisionService';

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    scrim: "rgba(28,28,28,0.45)",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

const { width, height } = Dimensions.get('window');

interface ProcessingStage {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // seconds
  icon: keyof typeof Ionicons.glyphMap;
  status: 'pending' | 'active' | 'completed' | 'error';
}

const PROCESSING_STAGES: ProcessingStage[] = [
  {
    id: 'analyze-photo',
    title: 'Analyzing Your Photo',
    description: 'Understanding space layout, lighting, and architectural features',
    estimatedTime: 15,
    icon: 'camera',
    status: 'pending',
  },
  {
    id: 'generate-concepts',
    title: 'Generating Design Concepts',
    description: 'Creating multiple design variations based on your preferences',
    estimatedTime: 30,
    icon: 'color-palette',
    status: 'pending',
  },
  {
    id: 'apply-style',
    title: 'Applying Your Style',
    description: 'Incorporating your selected style and color preferences',
    estimatedTime: 20,
    icon: 'brush',
    status: 'pending',
  },
  {
    id: 'furniture-matching',
    title: 'Matching Furniture',
    description: 'Finding furniture pieces that fit your space and budget',
    estimatedTime: 25,
    icon: 'home',
    status: 'pending',
  },
  {
    id: 'final-rendering',
    title: 'Creating Final Design',
    description: 'Rendering high-quality visualizations of your new space',
    estimatedTime: 20,
    icon: 'create',
    status: 'pending',
  },
];

export const AIProcessingScreen: React.FC = () => {
  const journeyStore = useJourneyStore();
  const contentStore = useContentStore();
  
  const [stages, setStages] = useState<ProcessingStage[]>(PROCESSING_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(110); // Total estimated time
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  
  // Animation values
  const progressAnimation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    startProcessing();
    return () => {
      // Cleanup any ongoing processes
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Update estimated time remaining
        const currentStage = stages[currentStageIndex];
        if (currentStage && currentStage.status === 'active') {
          setEstimatedTimeRemaining(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, isPaused, currentStageIndex, stages]);

  const startProcessing = useCallback(async () => {
    try {
      setIsProcessing(true);
      setHasError(false);
      
      // Generate a job ID for tracking
      const newJobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setJobId(newJobId);
      
      // Start processing stages
      for (let i = 0; i < stages.length; i++) {
        await processStage(i);
        
        if (hasError) {
          break;
        }
      }
      
      if (!hasError) {
        // Processing completed successfully
        setOverallProgress(100);
        setTimeout(() => {
          NavigationHelpers.navigateToScreen('results');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Processing failed:', error);
      handleProcessingError(error);
    }
  }, [stages, hasError]);

  const processStage = async (stageIndex: number) => {
    return new Promise<void>((resolve, reject) => {
      setCurrentStageIndex(stageIndex);
      
      // Update stage status to active
      setStages(prev => prev.map((stage, idx) => ({
        ...stage,
        status: idx === stageIndex ? 'active' : 
                idx < stageIndex ? 'completed' : 'pending'
      })));
      
      const stage = stages[stageIndex];
      const stageDuration = stage.estimatedTime * 1000; // Convert to milliseconds
      
      // Simulate stage processing with gradual progress
      const progressInterval = stageDuration / 100;
      let stageProgress = 0;
      
      const interval = setInterval(() => {
        stageProgress += 1;
        const totalProgress = ((stageIndex * 20) + (stageProgress * 0.2));
        setOverallProgress(totalProgress);
        
        // Animate progress
        Animated.timing(progressAnimation, {
          toValue: totalProgress / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();
        
        if (stageProgress >= 100) {
          clearInterval(interval);
          
          // Mark stage as completed
          setStages(prev => prev.map((s, idx) => ({
            ...s,
            status: idx === stageIndex ? 'completed' : s.status
          })));
          
          resolve();
        }
      }, progressInterval);
    });
  };

  const handleProcessingError = (error: any) => {
    setHasError(true);
    setIsProcessing(false);
    
    setStages(prev => prev.map((stage, idx) => ({
      ...stage,
      status: idx === currentStageIndex ? 'error' : stage.status
    })));
  };

  const handleRetry = () => {
    setHasError(false);
    setOverallProgress(0);
    setElapsedTime(0);
    setEstimatedTimeRemaining(110);
    setCurrentStageIndex(0);
    
    setStages(PROCESSING_STAGES.map(stage => ({ ...stage, status: 'pending' })));
    
    startProcessing();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Processing?',
      'Are you sure you want to cancel? You\'ll lose your current progress.',
      [
        { text: 'Keep Processing', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => {
            setIsProcessing(false);
            NavigationHelpers.goBack();
          }
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProcessingHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Creating Your Design</Text>
        <Text style={styles.headerSubtitle}>
          {hasError ? 'Processing Error' : 
           overallProgress === 100 ? 'Complete!' : 
           isPaused ? 'Paused' : 'Processing...'}
        </Text>
      </View>
    </View>
  );

  const renderProgressCard = () => (
    <View style={styles.progressCard}>
      {/* Overall Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
        </View>
        
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        
        {/* Time Information */}
        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color={tokens.color.textMuted} />
            <Text style={styles.timeText}>Elapsed: {formatTime(elapsedTime)}</Text>
          </View>
          
          {estimatedTimeRemaining > 0 && (
            <View style={styles.timeItem}>
              <Ionicons name="hourglass-outline" size={16} color={tokens.color.textMuted} />
              <Text style={styles.timeText}>Remaining: ~{formatTime(estimatedTimeRemaining)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Current Stage Highlight */}
      {!hasError && currentStageIndex < stages.length && (
        <View style={styles.currentStageCard}>
          <View style={styles.currentStageHeader}>
            <Ionicons 
              name={stages[currentStageIndex].icon} 
              size={24} 
              color={tokens.color.brand} 
            />
            <Text style={styles.currentStageTitle}>
              {stages[currentStageIndex].title}
            </Text>
          </View>
          <Text style={styles.currentStageDescription}>
            {stages[currentStageIndex].description}
          </Text>
        </View>
      )}
    </View>
  );

  const renderStagesList = () => (
    <View style={styles.stagesSection}>
      <Text style={styles.stagesTitle}>Processing Stages</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {stages.map((stage, index) => (
          <StageItem
            key={stage.id}
            stage={stage}
            isActive={index === currentStageIndex}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsSection}>
      {hasError ? (
        <View style={styles.errorControls}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color={tokens.color.textInverse} />
            <Text style={styles.retryButtonText}>Retry Processing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => NavigationHelpers.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : overallProgress === 100 ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.viewResultsButton}
          onPress={() => NavigationHelpers.navigateToScreen('results')}
        >
          <Text style={styles.viewResultsButtonText}>View Your Design</Text>
          <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
        </TouchableOpacity>
      ) : (
        <View style={styles.processingControls}>
          <TouchableOpacity
            style={[styles.controlButton, isPaused && styles.controlButtonActive]}
            onPress={handlePause}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={20} 
              color={isPaused ? tokens.color.brand : tokens.color.textMuted} 
            />
            <Text style={styles.controlButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={20} color={tokens.color.error} />
            <Text style={[styles.controlButtonText, { color: tokens.color.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderProcessingHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProgressCard()}
        {renderStagesList()}
      </ScrollView>
      
      {renderControls()}
      
      {/* Background Animation */}
      {isProcessing && !hasError && (
        <LinearGradient
          colors={[tokens.color.bgApp, `${tokens.color.brand}10`]}
          style={styles.backgroundGradient}
          pointerEvents="none"
        />
      )}
    </SafeAreaView>
  );
};

// Stage Item Component
interface StageItemProps {
  stage: ProcessingStage;
  isActive: boolean;
  index: number;
}

const StageItem: React.FC<StageItemProps> = ({ stage, isActive, index }) => {
  const getStatusColor = () => {
    switch (stage.status) {
      case 'completed': return tokens.color.success;
      case 'active': return tokens.color.brand;
      case 'error': return tokens.color.error;
      default: return tokens.color.textMuted;
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed': return 'checkmark-circle';
      case 'active': return 'ellipse';
      case 'error': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  return (
    <View style={[styles.stageItem, isActive && styles.activeStageItem]}>
      <View style={styles.stageIndicator}>
        <View style={[styles.stageNumber, { borderColor: getStatusColor() }]}>
          {stage.status === 'active' ? (
            <ActivityIndicator size="small" color={tokens.color.brand} />
          ) : (
            <Ionicons 
              name={getStatusIcon()} 
              size={16} 
              color={getStatusColor()} 
            />
          )}
        </View>
        
        {index < PROCESSING_STAGES.length - 1 && (
          <View style={[
            styles.stageConnector,
            stage.status === 'completed' && styles.completedConnector
          ]} />
        )}
      </View>
      
      <View style={styles.stageContent}>
        <View style={styles.stageHeader}>
          <Ionicons 
            name={stage.icon} 
            size={20} 
            color={getStatusColor()} 
          />
          <Text style={[styles.stageTitle, isActive && styles.activeStageTitleMark]}>
            {stage.title}
          </Text>
        </View>
        
        <Text style={styles.stageDescription}>
          {stage.description}
        </Text>
        
        <Text style={styles.stageTime}>
          ~{stage.estimatedTime}s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  progressCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    marginVertical: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  progressSection: {
    marginBottom: tokens.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  progressTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  progressPercentage: {
    ...tokens.type.h2,
    color: tokens.color.brand,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: tokens.spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.xs,
  },
  currentStageCard: {
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.color.brand,
  },
  currentStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  currentStageTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  currentStageDescription: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  stagesSection: {
    marginVertical: tokens.spacing.lg,
  },
  stagesTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  stageItem: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.lg,
  },
  activeStageItem: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    marginHorizontal: -tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    ...tokens.shadow.e1,
  },
  stageIndicator: {
    alignItems: 'center',
    marginRight: tokens.spacing.lg,
  },
  stageNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
  },
  stageConnector: {
    width: 2,
    flex: 1,
    backgroundColor: tokens.color.borderSoft,
    marginTop: tokens.spacing.xs,
  },
  completedConnector: {
    backgroundColor: tokens.color.success,
  },
  stageContent: {
    flex: 1,
    paddingTop: tokens.spacing.xs,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  stageTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  activeStageTitleMark: {
    color: tokens.color.brand,
    fontWeight: '600',
  },
  stageDescription: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xs,
  },
  stageTime: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  controlsSection: {
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  errorControls: {
    gap: tokens.spacing.lg,
  },
  retryButton: {
    height: 52,
    backgroundColor: tokens.color.error,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  retryButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginLeft: tokens.spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  backButtonText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  viewResultsButton: {
    height: 52,
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  viewResultsButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  processingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  controlButtonActive: {
    borderColor: tokens.color.brand,
    backgroundColor: `${tokens.color.brand}10`,
  },
  controlButtonText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

export default AIProcessingScreen;