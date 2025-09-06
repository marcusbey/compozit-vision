import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { CameraSection } from '@components/camera/CameraSection';
import { ImageDisplayArea } from '@components/wizard/ImageDisplayArea';
import { PanelRouter } from '@components/wizard/PanelRouter';
import { SlidingBottomPanel } from '@components/panels/SlidingBottomPanel';
import { useWizardLogic } from './hooks/useWizardLogic';

interface UnifiedProjectScreenProps {
  navigation?: any;
  route?: any;
}

export default function UnifiedProjectScreen({ navigation, route }: UnifiedProjectScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    // State
    capturedImage,
    setCapturedImage,
    resultImage,
    showCamera,
    setShowCamera,
    panelMode,
    setPanelMode,
    userPrompt,
    setUserPrompt,
    isProcessing,
    facing,
    setFacing,

    // Advanced state
    contextAnalysis,
    availableFeatures,

    // Animation refs
    panelHeight,
    panelOpacity,

    // Functions
    handleTakePhoto,
    handleImportPhoto,
    handleProcessImage,
    resetProject,
  } = useWizardLogic();

  const handleBack = () => {
    if (panelMode !== 'initial') {
      setPanelMode('initial');
    } else {
      NavigationHelpers.goBack();
    }
  };

  const handleFeaturePress = (featureId: string) => {
    // Navigate to specific feature panel
    setPanelMode(featureId as any);
  };

  const handlePhotoTaken = (uri: string) => {
    setCapturedImage(uri);
    setPanelMode('prompt');
  };

  if (showCamera) {
    return (
      <CameraSection
        facing={facing}
        setFacing={setFacing}
        onPhotoTaken={handlePhotoTaken}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />

      {/* Full Image Display Area */}
      <View style={styles.imageContainer}>
        <ImageDisplayArea
          capturedImage={capturedImage}
          resultImage={resultImage}
          onBack={handleBack}
          onReset={resetProject}
        />
      </View>

      {/* Always Visible Bottom Panel */}
      <SlidingBottomPanel height={panelHeight} opacity={panelOpacity}>
        <PanelRouter
          panelMode={panelMode}
          onTakePhoto={handleTakePhoto}
          onImportPhoto={handleImportPhoto}
          userPrompt={userPrompt}
          onPromptChange={setUserPrompt}
          onProcess={handleProcessImage}
          contextAnalysis={contextAnalysis}
          availableFeatures={availableFeatures}
          onFeaturePress={handleFeaturePress}
          isProcessing={isProcessing}
          onBack={handleBack}
        />
      </SlidingBottomPanel>

      {/* Minimal Lower Navigation */}
      <View style={[styles.lowerNav, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.navContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => NavigationHelpers.navigateToScreen('tools')}>
            <Ionicons name="construct-outline" size={20} color={tokens.colors.text.secondary} />
            <Text style={styles.navLabel}>Tools</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
            <View style={styles.activeIndicator}>
              <Ionicons name="add" size={22} color={tokens.colors.primary.DEFAULT} />
            </View>
            <Text style={[styles.navLabel, styles.activeNavLabel]}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => NavigationHelpers.navigateToScreen('profile')}>
            <Ionicons name="person-circle-outline" size={20} color={tokens.colors.text.secondary} />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  lowerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.sm,
    backgroundColor: `${tokens.colors.background.secondary}F0`, // Using hex alpha instead
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    ...tokens.shadows.elevation2,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
    ...tokens.shadows.elevation1,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.sm,
    minWidth: 50,
  },
  activeNavButton: {
    backgroundColor: 'transparent',
  },
  activeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${tokens.colors.primary.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight,
    color: tokens.colors.text.secondary,
    marginTop: 2,
    fontWeight: '500',
    fontSize: 10,
  },
  activeNavLabel: {
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
  },
});
