// Image Refinement Screen - Upscale Mode with Iterative Improvements
// This is where users refine and enhance AI-generated images through style, material, and detail modifications

import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { designTokens, tokens } from '@theme';
import contextAnalyticsService from '../../services/contextAnalyticsService';
import imageGenerationService, { GeneratedImage, ImageRefinementRequest } from '../../services/imageGenerationService';
import imageVersionManager, { ImageSession, ImageVersion } from '../../services/imageVersionManager';
import promptOptimizationService, { OptimizedPrompt } from '../../services/promptOptimizationService';
import { useUserStore } from '../../stores/userStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

type ImageRefinementRouteProp = RouteProp<{
  ImageRefinement: {
    generatedImage: GeneratedImage;
    originalPrompt: OptimizedPrompt;
    sessionId?: string;
    context?: string;
    features?: string[];
  };
}, 'ImageRefinement'>;

type ImageRefinementNavigationProp = StackNavigationProp<{
  ImageRefinement: {
    generatedImage: GeneratedImage;
    originalPrompt: OptimizedPrompt;
    sessionId?: string;
    context?: string;
    features?: string[];
  };
}>;

interface Props {
  route: ImageRefinementRouteProp;
  navigation: ImageRefinementNavigationProp;
}

// Removed - using ImageVersion from imageVersionManager

interface RefinementOption {
  id: string;
  title: string;
  icon: string;
  type: ImageRefinementRequest['refinementType'];
  options: RefinementChoice[];
}

interface RefinementChoice {
  id: string;
  label: string;
  value: string;
  preview?: string;
  description?: string;
}

const ImageRefinementScreen: React.FC<Props> = ({ route, navigation }) => {
  const { generatedImage, originalPrompt, sessionId: existingSessionId, context, features } = route.params;
  const user = useUserStore(state => state.user);
  const insets = useSafeAreaInsets();

  // State management
  const [session, setSession] = useState<ImageSession | null>(null);
  const [currentVersion, setCurrentVersion] = useState<ImageVersion | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [selectedRefinement, setSelectedRefinement] = useState<RefinementOption | null>(null);
  const [zoomScale] = useState(new Animated.Value(1));
  const [panTranslation] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonVersion, setComparisonVersion] = useState<ImageVersion | null>(null);
  const [showVersionNotes, setShowVersionNotes] = useState(false);
  const [selectedVersionForNotes, setSelectedVersionForNotes] = useState<string | null>(null);

  // Keyboard state
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Custom prompt state
  const [customPrompt, setCustomPrompt] = useState('');

  // Refs
  const customPromptInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate available height when keyboard is visible
  const getAvailableHeight = () => {
    if (keyboardVisible && Platform.OS === 'ios') {
      // Give a bit more space by reducing keyboard height slightly
      return windowHeight - (keyboardHeight * 0.85) - insets.top;
    }
    return windowHeight;
  };

  // Helper function to dismiss keyboard when tapping ScrollView content
  const handleScrollViewPress = () => {
    if (keyboardVisible && Platform.OS === 'ios') {
      Keyboard.dismiss();
    }
  };

  // Initialize or load session
  useEffect(() => {
    const initializeSession = async () => {
      if (existingSessionId) {
        // Load existing session
        const existingSession = imageVersionManager.getSession(existingSessionId);
        if (existingSession) {
          setSession(existingSession);
          const currentVer = existingSession.versions.find(v => v.id === existingSession.currentVersionId);
          setCurrentVersion(currentVer || null);
        }
      } else {
        // Create new session
        const newSession = await imageVersionManager.createSession(
          originalPrompt.originalInput,
          generatedImage,
          originalPrompt,
          context,
          features,
          user?.id
        );
        setSession(newSession);
        setCurrentVersion(newSession.versions[0]);
      }
    };

    initializeSession();
  }, [existingSessionId, generatedImage, originalPrompt, context, features, user]);

  // Enhanced keyboard listeners for iOS compatibility
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);

        // Aggressive scrolling for iOS to ensure content is visible
        if (Platform.OS === 'ios') {
          const delay = isInputFocused ? 200 : 100;
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, delay);

          // Additional scroll after a longer delay to ensure visibility
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 500);
        } else if (isInputFocused) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 200);
        }
      }
    );

    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        setIsInputFocused(false);
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [isInputFocused]);

  // Pan and zoom gestures for image
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderMove: (_, gestureState) => {
      panTranslation.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: () => {
      Animated.spring(panTranslation, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    },
  });

  // Refinement options
  const refinementOptions: RefinementOption[] = [
    {
      id: 'style',
      title: 'Change Style',
      icon: 'color-palette',
      type: 'style_change',
      options: [
        { id: 'modern', label: 'Modern', value: 'modern minimalist style' },
        { id: 'traditional', label: 'Traditional', value: 'traditional classic style' },
        { id: 'industrial', label: 'Industrial', value: 'industrial urban style' },
        { id: 'scandinavian', label: 'Scandinavian', value: 'scandinavian nordic style' },
        { id: 'mediterranean', label: 'Mediterranean', value: 'mediterranean coastal style' },
        { id: 'rustic', label: 'Rustic', value: 'rustic farmhouse style' }
      ]
    },
    {
      id: 'materials',
      title: 'Swap Materials',
      icon: 'layers',
      type: 'material_swap',
      options: [
        { id: 'wood', label: 'Natural Wood', value: 'natural wood materials, warm wood tones' },
        { id: 'stone', label: 'Natural Stone', value: 'natural stone materials, marble, granite' },
        { id: 'metal', label: 'Metal Accents', value: 'brushed metal, stainless steel, brass accents' },
        { id: 'glass', label: 'Glass Elements', value: 'glass materials, transparent elements' },
        { id: 'concrete', label: 'Concrete', value: 'concrete materials, industrial finish' },
        { id: 'fabric', label: 'Soft Fabrics', value: 'textile materials, soft fabrics, upholstery' }
      ]
    },
    {
      id: 'colors',
      title: 'Adjust Colors',
      icon: 'color-filter',
      type: 'color_adjustment',
      options: [
        { id: 'warm', label: 'Warm Tones', value: 'warm color palette, earth tones, beige, brown' },
        { id: 'cool', label: 'Cool Tones', value: 'cool color palette, blues, greens, grays' },
        { id: 'neutral', label: 'Neutral Palette', value: 'neutral color palette, whites, grays, beiges' },
        { id: 'bold', label: 'Bold Colors', value: 'bold vibrant colors, accent walls, statement pieces' },
        { id: 'monochrome', label: 'Monochrome', value: 'monochromatic color scheme, single color family' },
        { id: 'pastel', label: 'Pastel Colors', value: 'soft pastel colors, light tones, gentle hues' }
      ]
    },
    {
      id: 'details',
      title: 'Enhance Details',
      icon: 'add-circle',
      type: 'detail_enhancement',
      options: [
        { id: 'lighting', label: 'Better Lighting', value: 'enhanced lighting, dramatic shadows, ambient lighting' },
        { id: 'texture', label: 'More Texture', value: 'rich textures, detailed surfaces, tactile elements' },
        { id: 'plants', label: 'Add Plants', value: 'indoor plants, greenery, botanical elements' },
        { id: 'artwork', label: 'Add Artwork', value: 'wall art, decorative pieces, artistic elements' },
        { id: 'accessories', label: 'More Accessories', value: 'decorative accessories, pillows, throws, ornaments' },
        { id: 'furniture', label: 'Extra Furniture', value: 'additional furniture pieces, complementary items' }
      ]
    },
    {
      id: 'mood',
      title: 'Change Mood',
      icon: 'sunny',
      type: 'mood_shift',
      options: [
        { id: 'cozy', label: 'Cozy', value: 'cozy intimate atmosphere, warm comfortable feeling' },
        { id: 'elegant', label: 'Elegant', value: 'elegant sophisticated atmosphere, luxury feel' },
        { id: 'energetic', label: 'Energetic', value: 'vibrant energetic atmosphere, lively dynamic feel' },
        { id: 'serene', label: 'Serene', value: 'peaceful serene atmosphere, calm relaxing feel' },
        { id: 'dramatic', label: 'Dramatic', value: 'dramatic bold atmosphere, striking visual impact' },
        { id: 'minimal', label: 'Minimal', value: 'clean minimal atmosphere, simple uncluttered feel' }
      ]
    }
  ];

  // Handle refinement selection
  const handleRefinementSelect = useCallback(async (option: RefinementOption, choice: RefinementChoice) => {
    if (isRefining || !session || !currentVersion) return;

    setIsRefining(true);
    setSelectedRefinement(null);

    try {
      console.log('🔧 Starting refinement:', option.type, choice.label);

      // Track refinement attempt
      contextAnalyticsService.trackEvent('image_refinement_started', {
        refinementType: option.type,
        choice: choice.id,
        currentImageId: currentVersion.image.id,
        promptId: currentVersion.prompt.id,
        sessionId: session.id
      });

      // Create refined prompt
      const refinedPrompt = await promptOptimizationService.refinePrompt({
        basePrompt: currentVersion.prompt,
        refinements: {
          [option.id]: choice.value
        },
        iterationType: option.type
      });

      // Generate refined image
      const refinedImage = await imageGenerationService.refineImage({
        baseImageId: currentVersion.image.id,
        refinedPrompt,
        refinementType: option.type
      });

      // Add version to manager
      const newVersion = await imageVersionManager.addVersion(
        session.id,
        refinedImage,
        refinedPrompt,
        currentVersion.id,
        option.type,
        `${option.title}: ${choice.label}`
      );

      // Update local state
      setCurrentVersion(newVersion);
      const updatedSession = imageVersionManager.getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }

      // Track successful refinement
      contextAnalyticsService.trackEvent('image_refinement_completed', {
        refinementType: option.type,
        choice: choice.id,
        originalImageId: currentVersion.image.id,
        refinedImageId: refinedImage.id,
        versionNumber: newVersion.versionNumber,
        sessionId: session.id
      });

      console.log('✅ Refinement completed successfully');

    } catch (error) {
      console.error('❌ Refinement failed:', error);
      Alert.alert(
        'Refinement Failed',
        'Sorry, we couldn\'t process your refinement. Please try again.',
        [{ text: 'OK' }]
      );

      // Track refinement failure
      contextAnalyticsService.trackEvent('image_refinement_failed', {
        refinementType: option.type,
        choice: choice.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: session.id
      });
    } finally {
      setIsRefining(false);
    }
  }, [currentVersion, session, isRefining]);

  // Handle reset to original
  const handleReset = useCallback(async () => {
    if (!session) return;

    const baselineVersion = session.versions.find(v => v.metadata.isBaseline);
    if (baselineVersion) {
      await imageVersionManager.resetToVersion(session.id, baselineVersion.id);
      setCurrentVersion(baselineVersion);

      contextAnalyticsService.trackEvent('image_reset_to_baseline', {
        originalImageId: baselineVersion.image.id,
        currentImageId: currentVersion?.image.id,
        iterationsReset: session.versions.length - 1,
        sessionId: session.id
      });
    }
  }, [session, currentVersion]);

  // Handle comparison mode
  const toggleComparison = useCallback((compareVersion?: ImageVersion) => {
    if (showComparison && !compareVersion) {
      setShowComparison(false);
      setComparisonVersion(null);
    } else if (compareVersion) {
      setComparisonVersion(compareVersion);
      setShowComparison(true);
    }
  }, [showComparison]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (versionId: string) => {
    if (!session) return;
    await imageVersionManager.toggleFavorite(session.id, versionId);
    const updatedSession = imageVersionManager.getSession(session.id);
    if (updatedSession) {
      setSession(updatedSession);
    }
  }, [session]);

  // Navigate to specific version
  const navigateToVersion = useCallback(async (version: ImageVersion) => {
    if (!session) return;
    await imageVersionManager.resetToVersion(session.id, version.id);
    setCurrentVersion(version);
    const updatedSession = imageVersionManager.getSession(session.id);
    if (updatedSession) {
      setSession(updatedSession);
    }
  }, [session]);

  // Render refinement panel
  const renderRefinementPanel = () => (
    <View style={styles.refinementPanel}>
      <Text style={styles.panelTitle}>Refine Your Design</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.refinementOptionsContainer}
      >
        {refinementOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.refinementOptionCard,
              selectedRefinement?.id === option.id && styles.selectedOption
            ]}
            onPress={() => setSelectedRefinement(
              selectedRefinement?.id === option.id ? null : option
            )}
            disabled={isRefining}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={
                selectedRefinement?.id === option.id
                  ? tokens.colors.primary.DEFAULT
                  : tokens.colors.text.secondary
              }
            />
            <Text style={[
              styles.optionTitle,
              selectedRefinement?.id === option.id && styles.selectedOptionText
            ]}>
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Refinement Choices */}
      {selectedRefinement && (
        <View style={styles.choicesContainer}>
          <Text style={styles.choicesTitle}>Choose {selectedRefinement.title}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.choicesScrollContainer}
          >
            {selectedRefinement.options.map((choice) => (
              <TouchableOpacity
                key={choice.id}
                style={styles.choiceCard}
                onPress={() => handleRefinementSelect(selectedRefinement, choice)}
                disabled={isRefining}
              >
                <Text style={styles.choiceLabel}>{choice.label}</Text>
                <Text style={styles.choiceDescription} numberOfLines={2}>
                  {choice.description || choice.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Custom Prompt Section */}
      <View style={[
        styles.customPromptContainer,
        keyboardVisible && Platform.OS === 'ios' && styles.customPromptContainerCompact
      ]}>
        <Text style={styles.customPromptTitle}>Describe Your Vision</Text>
        <Text style={styles.customPromptSubtitle}>Tell us what you'd like to change or enhance</Text>
        <TextInput
          ref={customPromptInputRef}
          style={[
            styles.customPromptInput,
            keyboardVisible && Platform.OS === 'ios' && styles.customPromptInputCompact
          ]}
          multiline
          numberOfLines={keyboardVisible && Platform.OS === 'ios' ? 2 : 3}
          placeholder="e.g., Make it more modern with neutral colors..."
          placeholderTextColor={tokens.colors.text.tertiary}
          value={customPrompt}
          onChangeText={setCustomPrompt}
          textAlignVertical="top"
          onFocus={() => {
            setIsInputFocused(true);

            if (Platform.OS === 'ios') {
              // Immediate scroll for iOS
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);

              // Follow-up scroll to ensure visibility
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 400);

              // Final scroll to guarantee the input is visible
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 700);
            } else {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }
          }}
          onBlur={() => {
            setIsInputFocused(false);
          }}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.customPromptButton,
            !customPrompt.trim() && styles.customPromptButtonDisabled
          ]}
          onPress={() => {
            if (customPrompt.trim()) {
              const customChoice = {
                id: 'custom',
                label: 'Custom',
                value: customPrompt.trim(),
                description: customPrompt.trim()
              };
              const customOption = {
                id: 'custom',
                title: 'Custom Refinement',
                icon: 'create-outline',
                type: 'custom_refinement' as const,
                options: [customChoice]
              };
              handleRefinementSelect(customOption, customChoice);
              setCustomPrompt(''); // Clear after use
            }
          }}
          disabled={!customPrompt.trim() || isRefining}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={
              !customPrompt.trim() || isRefining
                ? tokens.colors.text.disabled
                : tokens.colors.text.inverse
            }
          />
          <Text style={[
            styles.customPromptButtonText,
            (!customPrompt.trim() || isRefining) && styles.customPromptButtonTextDisabled
          ]}>
            Transform Image
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render image history
  const renderImageHistory = () => {
    if (!session) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Version History ({session.versions.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.historyScrollContainer}
        >
          {session.versions.map((version) => (
            <TouchableOpacity
              key={version.id}
              style={[
                styles.historyImageCard,
                currentVersion?.id === version.id && styles.currentVersionCard
              ]}
              onPress={() => navigateToVersion(version)}
              onLongPress={() => toggleComparison(version)}
            >
              <Image
                source={{ uri: version.image.thumbnailUrl || version.image.url }}
                style={styles.historyImage}
              />
              <View style={styles.historyImageOverlay}>
                <Text style={styles.historyImageIndex}>v{version.versionNumber}</Text>
                <View style={styles.historyImageActions}>
                  {version.metadata.isBaseline && (
                    <View style={styles.baselineIndicator}>
                      <Ionicons name="star" size={12} color={tokens.colors.status.warning} />
                    </View>
                  )}
                  {version.metadata.isFavorite && (
                    <TouchableOpacity
                      onPress={() => toggleFavorite(version.id)}
                      style={styles.favoriteIndicator}
                    >
                      <Ionicons name="heart" size={12} color={tokens.colors.status.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {version.refinementDetails && (
                <Text style={styles.historyRefinementType} numberOfLines={1}>
                  {version.refinementDetails}
                </Text>
              )}
              {!version.metadata.isFavorite && (
                <TouchableOpacity
                  style={styles.historyFavoriteButton}
                  onPress={() => toggleFavorite(version.id)}
                >
                  <Ionicons name="heart-outline" size={16} color={tokens.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Session Stats */}
        {session.versions.length > 3 && (
          <TouchableOpacity style={styles.sessionStatsButton} onPress={() => {
            const stats = imageVersionManager.getSessionStats(session.id);
            Alert.alert('Session Statistics',
              `Total Versions: ${stats.totalVersions}\n` +
              `Favorites: ${stats.favoriteCount}\n` +
              `Avg Generation Time: ${(stats.averageGenerationTime / 1000).toFixed(1)}s\n` +
              `Most Used: ${Object.entries(stats.refinementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
              [{ text: 'OK' }]
            );
          }}>
            <Ionicons name="stats-chart" size={16} color={tokens.colors.primary.DEFAULT} />
            <Text style={styles.sessionStatsText}>View Stats</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <SafeAreaView
          style={[
            styles.container,
            keyboardVisible && Platform.OS === 'ios' && {
              height: getAvailableHeight()
            }
          ]}
        >
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Refine Image</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleReset}
            disabled={!session || session.versions.length <= 1}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={
                !session || session.versions.length <= 1
                  ? tokens.colors.text.disabled
                  : tokens.colors.text.secondary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => toggleComparison()}
          >
            <Ionicons
              name="copy"
              size={20}
              color={tokens.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: keyboardVisible && Platform.OS === 'ios'
              ? 200 // More padding to show refinement options
              : keyboardVisible && Platform.OS === 'android'
              ? keyboardHeight + designTokens.spacing.xl
              : designTokens.spacing.xl
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current Image Display */}
        <View style={styles.imageContainer}>
          {isRefining && (
            <View style={styles.loadingOverlay}>
              <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                style={styles.loadingGradient}
              >
                <ActivityIndicator size="large" color={tokens.colors.primary.DEFAULT} />
                <Text style={styles.loadingText}>Refining your image...</Text>
              </LinearGradient>
            </View>
          )}

          <Animated.View
            style={[
              styles.imageWrapper,
              {
                transform: [
                  { scale: zoomScale },
                  { translateX: panTranslation.x },
                  { translateY: panTranslation.y }
                ]
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: currentVersion?.image.url || generatedImage.url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </Animated.View>

          {/* Comparison Mode */}
          {showComparison && comparisonVersion && currentVersion && (
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonImages}>
                <View style={styles.comparisonImageWrapper}>
                  <Image source={{ uri: comparisonVersion.image.url }} style={styles.comparisonImage} />
                  <Text style={styles.comparisonLabel}>v{comparisonVersion.versionNumber}</Text>
                </View>
                <View style={styles.comparisonImageWrapper}>
                  <Image source={{ uri: currentVersion.image.url }} style={styles.comparisonImage} />
                  <Text style={styles.comparisonLabel}>v{currentVersion.versionNumber} (Current)</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeComparisonButton}
                onPress={() => toggleComparison()}
              >
                <Ionicons name="close" size={20} color={tokens.colors.text.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Image Metadata */}
        {currentVersion && (
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Version:</Text>
              <Text style={styles.metadataValue}>v{currentVersion.versionNumber}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Dimensions:</Text>
              <Text style={styles.metadataValue}>
                {currentVersion.image.metadata.width} × {currentVersion.image.metadata.height}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Quality:</Text>
              <Text style={styles.metadataValue}>{currentVersion.image.metadata.quality}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Provider:</Text>
              <Text style={styles.metadataValue}>
                {imageGenerationService.getProviderConfig(currentVersion.image.provider)?.name}
              </Text>
            </View>
            {currentVersion.metadata.notes && (
              <View style={[styles.metadataRow, { alignItems: 'flex-start' }]}>
                <Text style={styles.metadataLabel}>Notes:</Text>
                <Text style={[styles.metadataValue, { flex: 1, textAlign: 'right' }]}>
                  {currentVersion.metadata.notes}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Image History */}
        {renderImageHistory()}

        {/* Refinement Panel */}
        {renderRefinementPanel()}
      </ScrollView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: tokens.typography.heading.h3.fontSize,
    fontWeight: tokens.typography.heading.h3.fontWeight as any,
    color: tokens.colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: tokens.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tokens.spacing.xl,
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
    height: screenHeight * 0.4,
    backgroundColor: tokens.colors.background.secondary,
    margin: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: tokens.borderRadius.lg,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  },
  loadingText: {
    color: tokens.colors.text.inverse,
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '500',
  },
  comparisonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.primary,
    zIndex: 5,
  },
  comparisonImages: {
    flex: 1,
    flexDirection: 'row',
  },
  comparisonImageWrapper: {
    flex: 1,
    position: 'relative',
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
  },
  comparisonLabel: {
    position: 'absolute',
    bottom: tokens.spacing.sm,
    left: tokens.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: tokens.colors.text.inverse,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 4,
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.typography.caption.fontSize,
    fontWeight: '500',
  },
  closeComparisonButton: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metadataContainer: {
    marginHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metadataLabel: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.secondary,
  },
  metadataValue: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  historyContainer: {
    marginHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },
  historyTitle: {
    fontSize: designTokens.typography.heading.h4.fontSize,
    fontWeight: designTokens.typography.heading.h4.fontWeight as any,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
  },
  historyScrollContainer: {
    paddingRight: designTokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  historyImageCard: {
    width: 80,
    position: 'relative',
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: tokens.colors.background.secondary,
  },
  historyImageOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyImageIndex: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: designTokens.colors.text.inverse,
    fontSize: designTokens.typography.caption.fontSize,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: designTokens.borderRadius.sm,
    fontWeight: '500',
  },
  historyImageActions: {
    flexDirection: 'row',
    gap: 4,
  },
  baselineIndicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: designTokens.borderRadius.sm,
    padding: 4,
  },
  favoriteIndicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: designTokens.borderRadius.sm,
    padding: 4,
  },
  currentVersionCard: {
    borderWidth: 2,
    borderColor: designTokens.colors.primary.DEFAULT,
  },
  historyFavoriteButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.elevation1,
  },
  sessionStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.sm,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: designTokens.borderRadius.sm,
    gap: tokens.spacing.xs,
  },
  sessionStatsText: {
    fontSize: designTokens.typography.caption.fontSize,
    color: designTokens.colors.primary.DEFAULT,
    fontWeight: '500',
  },
  historyRefinementType: {
    fontSize: designTokens.typography.caption.fontSize,
    color: designTokens.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  refinementPanel: {
    marginHorizontal: designTokens.spacing.md,
  },
  panelTitle: {
    fontSize: tokens.typography.heading.h4.fontSize,
    fontWeight: tokens.typography.heading.h4.fontWeight as any,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  },
  refinementOptionsContainer: {
    paddingRight: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  refinementOptionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 80,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: tokens.spacing.xs,
  },
  selectedOption: {
    borderColor: tokens.colors.primary.DEFAULT,
    backgroundColor: tokens.colors.primary.light + '20',
  },
  optionTitle: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: tokens.colors.primary.DEFAULT,
  },
  choicesContainer: {
    marginTop: tokens.spacing.md,
  },
  choicesTitle: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  choicesScrollContainer: {
    paddingRight: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  choiceCard: {
    width: 140,
    padding: tokens.spacing.sm,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  choiceLabel: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '500',
    color: tokens.colors.text.primary,
    marginBottom: 4,
  },
  choiceDescription: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 16,
  },
  customPromptContainer: {
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    ...Platform.select({
      ios: {
        paddingBottom: tokens.spacing.lg,
        marginBottom: tokens.spacing.xl,
      },
    }),
  },
  customPromptContainerCompact: {
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    paddingBottom: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  customPromptTitle: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  },
  customPromptSubtitle: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.sm,
  },
  customPromptInput: {
    backgroundColor: tokens.colors.background.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
    borderRadius: tokens.borderRadius.sm,
    padding: tokens.spacing.sm,
    fontSize: tokens.typography.body.fontSize,
    color: tokens.colors.text.primary,
    minHeight: Platform.OS === 'ios' ? 100 : 80,
    marginBottom: tokens.spacing.md,
    ...Platform.select({
      ios: {
        paddingTop: tokens.spacing.sm + 4,
        paddingBottom: tokens.spacing.sm + 4,
      },
    }),
  },
  customPromptInputCompact: {
    minHeight: 60,
    marginBottom: tokens.spacing.sm,
    paddingTop: tokens.spacing.xs,
    paddingBottom: tokens.spacing.xs,
  },
  customPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderRadius: tokens.borderRadius.sm,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  customPromptButtonDisabled: {
    backgroundColor: tokens.colors.text.disabled,
  },
  customPromptButtonText: {
    fontSize: tokens.typography.body.fontSize,
    fontWeight: '500',
    color: tokens.colors.text.inverse,
  },
  customPromptButtonTextDisabled: {
    color: tokens.colors.background.secondary,
  },
});

export default ImageRefinementScreen;
