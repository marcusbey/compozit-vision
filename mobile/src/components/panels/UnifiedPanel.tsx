import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState, useRef } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Animated as RNAnimated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeatureId } from '../../utils/contextAnalysis';
import { ProcessedContext, RelevantIcon } from '../../types/contextAnalysis';
import { contextProcessingPipeline } from '../../services/contextProcessingPipeline';
import { dynamicIconFilter } from '../../services/dynamicIconFilter';
import { DynamicIconRow } from '../DynamicIconRow';
import { ContextualPanelModal } from './ContextualPanelModal';

const { width: screenWidth } = Dimensions.get('window');

// Default sample images for new users
const DEFAULT_SAMPLES = [
  { id: 'sample1', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', label: 'Modern Living' },
  { id: 'sample2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', label: 'Minimalist' },
  { id: 'sample3', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', label: 'Cozy Space' },
  { id: 'sample4', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&q=80', label: 'Industrial' },
];

interface UnifiedPanelProps {
  // Gallery
  userGallery: string[];
  selectedImage: string | null;
  onImageSelect: (uri: string) => void;
  onAddImage: (uri: string) => void;

  // Actions
  onTakePhoto: () => void;
  onImportPhoto: () => void;

  // Prompt
  userPrompt: string;
  onPromptChange: (text: string) => void;
  onProcess: () => void;

  // Features
  availableFeatures: FeatureId[];
  onFeaturePress: (feature: FeatureId) => void;

  // State
  isProcessing: boolean;
}

export const UnifiedPanel: React.FC<UnifiedPanelProps> = ({
  userGallery,
  selectedImage,
  onImageSelect,
  onAddImage,
  onTakePhoto,
  onImportPhoto,
  userPrompt,
  onPromptChange,
  onProcess,
  availableFeatures,
  onFeaturePress,
  isProcessing
}) => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<FeatureId>>(new Set());
  const [showFeatures, setShowFeatures] = useState(false);
  const [context, setContext] = useState<ProcessedContext | null>(null);
  const [relevantIcons, setRelevantIcons] = useState<RelevantIcon[]>([]);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Animations (React Native Animated for feature reveal)
  const fadeAnim = useState(new RNAnimated.Value(0))[0];
  const slideAnim = useState(new RNAnimated.Value(50))[0];

  // Keyboard-aware bottom expansion (Reanimated)
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const bottomPaddingStyle = useAnimatedStyle(() => {
    const rawHeight = keyboard.height.value;
    const adjusted = Math.max(0, rawHeight - insets.bottom);
    const isOpen = keyboard.state.value === 2; // KeyboardState.OPEN
    return {
      marginBottom: withTiming(isOpen ? adjusted : 0, { duration: 180 })
    };
  });

  // Combine user gallery with default samples
  const allImages = [...userGallery, ...DEFAULT_SAMPLES];

  // Auto-select first image if none selected
  useEffect(() => {
    if (!selectedImage && allImages.length > 0) {
      onImageSelect(allImages[0].url || allImages[0]);
    }
  }, [selectedImage, allImages]);

  // Process image when selected
  useEffect(() => {
    if (selectedImage) {
      processImageContext();
    }
  }, [selectedImage]);

  // Update icons when context or prompt changes
  useEffect(() => {
    if (context) {
      updateRelevantIcons();
    }
  }, [context, userPrompt]);

  // Show features after user types (legacy support)
  useEffect(() => {
    if (userPrompt.length >= 3 && !showFeatures) {
      setShowFeatures(true);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (userPrompt.length < 3 && showFeatures) {
      setShowFeatures(false);
    }
  }, [userPrompt]);

  const processImageContext = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const processedContext = await contextProcessingPipeline.processImage(
        selectedImage,
        userPrompt
      );
      setContext(processedContext);
    } catch (error) {
      console.error('Error processing image context:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateRelevantIcons = async () => {
    if (!context) return;
    
    try {
      const icons = await dynamicIconFilter.getRelevantIcons(context);
      setRelevantIcons(icons);
    } catch (error) {
      console.error('Error getting relevant icons:', error);
    }
  };

  const handleIconPress = (icon: RelevantIcon) => {
    setActivePanel(icon.id);
    // Also trigger the legacy feature press for compatibility
    if (onFeaturePress) {
      onFeaturePress(icon.id as FeatureId);
    }
  };

  const handleAddPhoto = () => {
    setShowAddPanel(true);
  };

  const handleTakePhotoPress = () => {
    setShowAddPanel(false);
    onTakePhoto();
  };

  const handleImportPhotoPress = () => {
    setShowAddPanel(false);
    onImportPhoto();
  };

  const toggleFeature = (feature: FeatureId) => {
    const newExpanded = new Set(expandedFeatures);
    if (newExpanded.has(feature)) {
      newExpanded.delete(feature);
    } else {
      newExpanded.add(feature);
    }
    setExpandedFeatures(newExpanded);
  };

  const getFeatureIcon = (feature: FeatureId): string => {
    const icons: Record<FeatureId, string> = {
      colorPalette: '🎨',
      budget: '💰',
      furniture: '🪑',
      location: '📍',
      materials: '🏗️',
      texture: '🖼️',
    };
    return icons[feature] || '⚙️';
  };

  const getFeatureLabel = (feature: FeatureId): string => {
    const labels: Record<FeatureId, string> = {
      colorPalette: 'Color Palette',
      budget: 'Budget Range',
      furniture: 'Furniture Style',
      location: 'Room Details',
      materials: 'Materials',
      texture: 'Textures',
    };
    return labels[feature] || feature;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentWrapper, bottomPaddingStyle]}>
        {/* Transformation Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.promptInput}
              value={userPrompt}
              onChangeText={onPromptChange}
              placeholder="Describe your transformation (e.g., modern minimalist style)"
              placeholderTextColor={tokens.color.textMuted}
              multiline
              maxLength={500}
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.voiceButton}>
              <Ionicons name="mic" size={22} color={tokens.color.brand} />
            </TouchableOpacity>
          </View>
          <Text style={styles.charCount}>{userPrompt.length}/500</Text>
        </View>

        {/* Dynamic Icon Row */}
        <DynamicIconRow
          icons={relevantIcons}
          onIconPress={handleIconPress}
          loading={isAnalyzing}
          maxVisible={5}
        />

        {/* Progressive Features (Legacy Support) */}
        {showFeatures && availableFeatures.length > 0 && (
          <RNAnimated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {availableFeatures.map((feature) => (
              <TouchableOpacity
                key={feature}
                style={[
                  styles.featureCard,
                  expandedFeatures.has(feature) && styles.featureCardExpanded
                ]}
                onPress={() => toggleFeature(feature)}
                activeOpacity={0.8}
              >
                <View style={styles.featureHeader}>
                  <Text style={styles.featureIcon}>{getFeatureIcon(feature)}</Text>
                  <Text style={styles.featureLabel}>{getFeatureLabel(feature)}</Text>
                  <Ionicons
                    name={expandedFeatures.has(feature) ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={tokens.color.textSecondary}
                  />
                </View>
                {expandedFeatures.has(feature) && (
                  <TouchableOpacity
                    style={styles.featureAction}
                    onPress={() => onFeaturePress(feature)}
                  >
                    <Text style={styles.featureActionText}>Configure</Text>
                    <Ionicons name="arrow-forward" size={16} color={tokens.color.brand} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </RNAnimated.View>
        )}

        {/* Transform Button */}
        <TouchableOpacity
          style={[
            styles.transformButton,
            (!userPrompt.trim() || isProcessing) && styles.transformButtonDisabled
          ]}
          onPress={onProcess}
          disabled={!userPrompt.trim() || isProcessing}
        >
          <Ionicons
            name={isProcessing ? "refresh" : "sparkles"}
            size={20}
            color={tokens.color.textInverse}
          />
          <Text style={styles.transformButtonText}>
            {isProcessing ? 'Transforming...' : 'Transform Image'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Gallery Section */}
      <View style={styles.gallerySection}>
        {/* Fixed Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
          <View style={styles.addButtonInner}>
            <Ionicons name="add" size={32} color={tokens.color.brand} />
          </View>
        </TouchableOpacity>

        {/* Scrollable Gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {allImages.map((item, index) => {
            const imageUrl = typeof item === 'string' ? item : item.url;
            const isSelected = imageUrl === selectedImage;

            return (
              <TouchableOpacity
                key={`gallery-${index}`}
                style={[styles.galleryItem, isSelected && styles.galleryItemSelected]}
                onPress={() => onImageSelect(imageUrl)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                {typeof item !== 'string' && item.label && (
                  <Text style={styles.galleryLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Add Photo Panel Modal */}
      <Modal
        visible={showAddPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddPanel(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddPanel(false)}
        >
          <View style={styles.addPhotoPanel}>
            <View style={styles.panelHandle} />

            <Text style={styles.panelTitle}>Add New Photo</Text>

            <TouchableOpacity
              style={styles.primaryPanelButton}
              onPress={handleTakePhotoPress}
            >
              <LinearGradient
                colors={[tokens.color.brand, tokens.color.brandHover]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="camera" size={24} color={tokens.color.textInverse} />
                <Text style={styles.primaryButtonText}>Take a Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryPanelButton}
              onPress={handleImportPhotoPress}
            >
              <Ionicons name="folder-open-outline" size={22} color={tokens.color.brand} />
              <Text style={styles.secondaryButtonText}>Upload from Device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddPanel(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Contextual Panel Modal */}
      <ContextualPanelModal
        visible={activePanel !== null}
        icon={relevantIcons.find(icon => icon.id === activePanel) || null}
        context={context}
        onClose={() => setActivePanel(null)}
        onSelection={(selection) => {
          console.log('Panel selection:', selection);
          // Handle the selection here - could update context, trigger actions, etc.
          setActivePanel(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedBottomContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
  },
  inputSection: {
    marginBottom: tokens.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  promptInput: {
    flex: 1,
    fontSize: 16,
    color: tokens.color.textPrimary,
    minHeight: 60,
    maxHeight: 100,
    paddingRight: tokens.spacing.md,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.brand + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCount: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  featuresSection: {
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  featureCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    overflow: 'hidden',
  },
  featureCardExpanded: {
    borderColor: tokens.color.brand + '50',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureLabel: {
    flex: 1,
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  featureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.color.brand + '10',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  featureActionText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
  },
  transformButton: {
    backgroundColor: tokens.color.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    ...tokens.shadow.e2,
  },
  transformButtonDisabled: {
    backgroundColor: tokens.color.textMuted,
  },
  transformButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
    fontSize: 16,
  },
  gallerySection: {
    flexDirection: 'row',
    height: 110,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    backgroundColor: tokens.color.bgApp,
  },
  addButton: {
    width: 80,
    padding: tokens.spacing.sm,
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 70,
    height: 70,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    borderColor: tokens.color.brand + '40',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.brand + '08',
  },
  galleryScroll: {
    alignItems: 'center',
    paddingRight: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  galleryItem: {
    width: 70,
    height: 70,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryItemSelected: {
    borderColor: tokens.color.brand,
    transform: [{ scale: 1.05 }],
    ...tokens.shadow.e2,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addPhotoPanel: {
    backgroundColor: tokens.color.surface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    paddingTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing['3xl'],
    ...tokens.shadow.e3,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: tokens.spacing.lg,
  },
  panelTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.xl,
  },
  primaryPanelButton: {
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.lg,
  },
  primaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryPanelButton: {
    backgroundColor: tokens.color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: tokens.color.brand + '30',
    marginBottom: tokens.spacing.md,
  },
  secondaryButtonText: {
    ...tokens.type.body,
    color: tokens.color.brand,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
  },
  cancelButtonText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
  },
});
