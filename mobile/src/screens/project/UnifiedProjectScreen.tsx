import { CameraSection } from '@components/camera/CameraSection';
import { SlidingBottomPanel } from '@components/panels/SlidingBottomPanel';
import { ImageDisplayArea } from '@components/wizard/ImageDisplayArea';
import { PanelRouter } from '@components/wizard/PanelRouter';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { SafeAreaView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
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
    handleSampleSelect,
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
          onTakePhoto={handleTakePhoto}
          onImportPhoto={handleImportPhoto}
        />
      </View>

      {/* Bottom Panel + Compact Prompt (when not in prompt mode) */}
      <SlidingBottomPanel height={panelHeight} opacity={panelOpacity}>
        <PanelRouter
          panelMode={panelMode}
          onTakePhoto={handleTakePhoto}
          onImportPhoto={handleImportPhoto}
          onSampleSelect={handleSampleSelect}
          userPrompt={userPrompt}
          onPromptChange={setUserPrompt}
          onProcess={handleProcessImage}
          contextAnalysis={contextAnalysis}
          availableFeatures={availableFeatures}
          onFeaturePress={handleFeaturePress}
          isProcessing={isProcessing}
          onBack={handleBack}
        />

        {panelMode === 'prompt' && capturedImage && (
          <View style={[styles.promptContainer, { marginBottom: insets.bottom + tokens.spacing.sm }]}>
            <TextInput
              style={styles.promptInput}
              value={userPrompt}
              onChangeText={setUserPrompt}
              placeholder="Describe your goal (e.g., modern cozy living room)"
              placeholderTextColor={tokens.colors.text.muted}
              multiline
              numberOfLines={2}
              returnKeyType="send"
              onSubmitEditing={() => !isProcessing && userPrompt.trim() && handleProcessImage()}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!userPrompt?.trim() || isProcessing) && styles.sendButtonDisabled]}
              onPress={handleProcessImage}
              disabled={!userPrompt?.trim() || isProcessing}
            >
              <Ionicons name="send" size={18} color={(!userPrompt?.trim() || isProcessing) ? tokens.colors.text.muted : tokens.colors.background.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </SlidingBottomPanel>
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
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs,
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
    ...tokens.shadows.elevation1,
  },
  promptInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 92,
    color: tokens.colors.text.primary,
    paddingVertical: tokens.spacing.xs,
    paddingRight: tokens.spacing.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary.DEFAULT,
  },
  sendButtonDisabled: {
    backgroundColor: tokens.colors.border.light,
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
  },
  activeNavLabel: {
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
  },
});
