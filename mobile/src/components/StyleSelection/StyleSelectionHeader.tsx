import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { RoomType, getRoomTypeLabel } from '../../types/aiProcessing';

interface StyleSelectionHeaderProps {
  onBack: () => void;
  roomType?: RoomType;
  projectName?: string;
  selectedCount?: number;
  maxSelections?: number;
  showProgressBar?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const StyleSelectionHeader: React.FC<StyleSelectionHeaderProps> = ({
  onBack,
  roomType,
  projectName,
  selectedCount = 0,
  maxSelections = 2,
  showProgressBar = true,
  currentStep = 1,
  totalSteps = 3,
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={[colors.gray[900], colors.gray[800]]}
        style={styles.gradient}
      >
        {/* Progress Bar */}
        {showProgressBar && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>
        )}

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Back Button */}
          <Animated.View entering={FadeInLeft.duration(600)}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <BlurView intensity={20} style={styles.backButtonBlur}>
                <Ionicons name="chevron-back" size={24} color={colors.gray[100]} />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Title Section */}
          <Animated.View entering={FadeInRight.delay(200).duration(600)} style={styles.titleSection}>
            <Text style={styles.title}>Choose Your Style</Text>
            {roomType && (
              <Text style={styles.subtitle}>
                For your {getRoomTypeLabel(roomType).toLowerCase()}
              </Text>
            )}
            {projectName && (
              <Text style={styles.projectName}>
                Project: {projectName}
              </Text>
            )}
          </Animated.View>

          {/* Selection Info */}
          <Animated.View entering={FadeInRight.delay(400).duration(600)}>
            <View style={styles.selectionInfo}>
              <BlurView intensity={20} style={styles.selectionInfoBlur}>
                <View style={styles.selectionBadge}>
                  <Text style={styles.selectionCount}>
                    {selectedCount}
                  </Text>
                  <Text style={styles.selectionMax}>
                    /{maxSelections}
                  </Text>
                </View>
                <Text style={styles.selectionLabel}>Selected</Text>
              </BlurView>
            </View>
          </Animated.View>
        </View>

        {/* Instructions */}
        <Animated.View 
          entering={FadeInRight.delay(600).duration(600)}
          style={styles.instructionsContainer}
        >
          <View style={styles.instructions}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary[400]} />
            <Text style={styles.instructionsText}>
              Select up to {maxSelections} styles that inspire you
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[900],
  },
  gradient: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.gray[700],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
    marginTop: 5,
  },
  backButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleSection: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray[50],
    lineHeight: 34,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[300],
    fontWeight: '500',
    marginBottom: 2,
  },
  projectName: {
    fontSize: 14,
    color: colors.primary[400],
    fontWeight: '600',
    fontStyle: 'italic',
  },
  selectionInfo: {
    alignItems: 'center',
  },
  selectionInfoBlur: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  selectionCount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary[400],
  },
  selectionMax: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[400],
  },
  selectionLabel: {
    fontSize: 12,
    color: colors.gray[400],
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderColor: colors.primary[600],
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.primary[300],
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
});

export default StyleSelectionHeader;