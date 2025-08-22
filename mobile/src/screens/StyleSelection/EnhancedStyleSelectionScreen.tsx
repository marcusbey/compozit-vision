import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { StyleSelectionHeader, StyleGrid } from '../../components/StyleSelection';
import { AmbianceGrid } from '../../components/AmbianceSelection';
import { StyleReference, AmbianceOption, RoomType } from '../../types/aiProcessing';
import { colors } from '../../theme/colors';

interface EnhancedStyleSelectionScreenProps {
  navigation: any;
  route: {
    params: {
      projectName?: string;
      roomType?: RoomType;
      analysisId?: string;
      fromCamera?: boolean;
    };
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EnhancedStyleSelectionScreen: React.FC<EnhancedStyleSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { projectName, roomType, analysisId, fromCamera } = route.params || {};

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'styles', title: 'Styles' },
    { key: 'ambiance', title: 'Ambiance' },
  ]);

  // Selection state
  const [selectedStyles, setSelectedStyles] = useState<StyleReference[]>([]);
  const [selectedAmbiance, setSelectedAmbiance] = useState<AmbianceOption | null>(null);
  const [canProceed, setCanProceed] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const progressValue = useSharedValue(0);

  // Update button state and animations
  useEffect(() => {
    const hasValidSelection = selectedStyles.length > 0 && selectedAmbiance !== null;
    setCanProceed(hasValidSelection);
    
    // Animate progress
    progressValue.value = withSpring(hasValidSelection ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [selectedStyles, selectedAmbiance, progressValue]);

  // Handle style selection changes
  const handleStyleSelectionChange = useCallback((styles: StyleReference[]) => {
    setSelectedStyles(styles);
    
    // Haptic feedback for style selection
    if (Platform.OS === 'ios') {
      const { HapticFeedbackTypes, impactAsync } = require('expo-haptics');
      impactAsync(HapticFeedbackTypes.Light);
    }
  }, []);

  // Handle ambiance selection changes
  const handleAmbianceSelectionChange = useCallback((ambiance: AmbianceOption | null) => {
    setSelectedAmbiance(ambiance);
    
    // Haptic feedback for ambiance selection
    if (Platform.OS === 'ios') {
      const { HapticFeedbackTypes, impactAsync } = require('expo-haptics');
      impactAsync(HapticFeedbackTypes.Medium);
    }
  }, []);

  // Handle continue button press
  const handleContinue = useCallback(() => {
    if (!canProceed) {
      Alert.alert(
        'Incomplete Selection',
        'Please select at least one style and one ambiance before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Animate button press
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 150 });
    });

    // Navigate to next screen with selections
    navigation.navigate('BudgetSelection', {
      projectName,
      roomType,
      analysisId,
      selectedStyles: selectedStyles.map(s => ({ id: s.id, name: s.name })),
      selectedAmbiance: {
        id: selectedAmbiance!.id,
        name: selectedAmbiance!.name,
        description: selectedAmbiance!.description,
      },
      fromCamera,
    });
  }, [canProceed, selectedStyles, selectedAmbiance, projectName, roomType, analysisId, fromCamera, navigation, buttonScale]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (selectedStyles.length > 0 || selectedAmbiance) {
      Alert.alert(
        'Discard Changes?',
        'You have made selections that will be lost if you go back.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Back', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [selectedStyles, selectedAmbiance, navigation]);

  // Tab scenes
  const renderStylesScene = useCallback(() => (
    <StyleGrid
      roomType={roomType}
      onSelectionChange={handleStyleSelectionChange}
      maxSelections={2}
      refreshTrigger={tabIndex === 0 ? 1 : 0}
    />
  ), [roomType, handleStyleSelectionChange, tabIndex]);

  const renderAmbianceScene = useCallback(() => (
    <AmbianceGrid
      styleId={selectedStyles[0]?.id}
      onSelectionChange={handleAmbianceSelectionChange}
    />
  ), [selectedStyles, handleAmbianceSelectionChange]);

  const scenes = SceneMap({
    styles: renderStylesScene,
    ambiance: renderAmbianceScene,
  });

  // Custom tab bar
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={colors.primary[400]}
      inactiveColor={colors.gray[400]}
      indicatorStyle={styles.tabIndicator}
      renderIcon={({ route, focused }) => (
        <Ionicons
          name={route.key === 'styles' ? 'color-palette-outline' : 'sunny-outline'}
          size={20}
          color={focused ? colors.primary[400] : colors.gray[400]}
          style={{ marginBottom: 4 }}
        />
      )}
      renderLabel={({ route, focused }) => (
        <Text style={[
          styles.tabLabel,
          { color: focused ? colors.primary[400] : colors.gray[400] }
        ]}>
          {route.title}
          {route.key === 'styles' && selectedStyles.length > 0 && (
            <Text style={styles.tabCount}> ({selectedStyles.length})</Text>
          )}
          {route.key === 'ambiance' && selectedAmbiance && (
            <Text style={styles.tabCount}> (1)</Text>
          )}
        </Text>
      )}
    />
  );

  // Animated button style
  const animatedButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progressValue.value, [0, 1], [0.6, 1]);
    const scale = buttonScale.value;
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Progress indicator style
  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(progressValue.value, [0, 1], [0, 100]);
    
    return {
      width: `${width}%`,
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gray[900], colors.gray[800]]}
        style={styles.gradient}
      >
        {/* Header */}
        <StyleSelectionHeader
          onBack={handleBack}
          roomType={roomType}
          projectName={projectName}
          selectedCount={selectedStyles.length + (selectedAmbiance ? 1 : 0)}
          maxSelections={3} // 2 styles + 1 ambiance
          currentStep={2}
          totalSteps={4}
        />

        {/* Tab View */}
        <View style={styles.tabContainer}>
          <TabView
            navigationState={{ index: tabIndex, routes }}
            renderScene={scenes}
            onIndexChange={setTabIndex}
            initialLayout={{ width: SCREEN_WIDTH }}
            renderTabBar={renderTabBar}
            lazy={true}
            lazyPreloadDistance={1}
          />
        </View>

        {/* Continue Button */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.buttonContainer}
        >
          {/* Progress indicator */}
          <View style={styles.progressIndicator}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            style={styles.continueButton}
            activeOpacity={0.9}
            disabled={!canProceed}
            accessible={true}
            accessibilityLabel="Continue to budget selection"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canProceed }}
          >
            <Animated.View style={animatedButtonStyle}>
              <LinearGradient
                colors={canProceed 
                  ? [colors.primary[500], colors.primary[400]] 
                  : [colors.gray[600], colors.gray[700]]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={[
                    styles.buttonText,
                    !canProceed && styles.buttonTextDisabled
                  ]}>
                    Continue
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={20} 
                    color={canProceed ? colors.gray[50] : colors.gray[400]}
                    style={styles.buttonIcon}
                  />
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          {/* Selection status */}
          <View style={styles.selectionStatus}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={selectedStyles.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={selectedStyles.length > 0 ? colors.primary[400] : colors.gray[500]} 
              />
              <Text style={[
                styles.statusText,
                selectedStyles.length > 0 && styles.statusTextCompleted
              ]}>
                {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons 
                name={selectedAmbiance ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={selectedAmbiance ? colors.primary[400] : colors.gray[500]} 
              />
              <Text style={[
                styles.statusText,
                selectedAmbiance && styles.statusTextCompleted
              ]}>
                {selectedAmbiance ? 'Ambiance selected' : 'No ambiance selected'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[900],
  },
  gradient: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
    marginHorizontal: 20,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  tabCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIndicator: {
    backgroundColor: colors.primary[400],
    height: 3,
    borderRadius: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  progressIndicator: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[700],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: 2,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[50],
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: colors.gray[400],
  },
  buttonIcon: {
    marginLeft: 8,
  },
  selectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 6,
    fontWeight: '500',
  },
  statusTextCompleted: {
    color: colors.primary[400],
  },
});

export default EnhancedStyleSelectionScreen;