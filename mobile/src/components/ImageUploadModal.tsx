import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

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
    scrimHeavy: "rgba(28,28,28,0.65)",
    success: "#4CAF50",
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

interface ImageUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUpload: (metadata: ImageMetadata) => Promise<void>;
  imageUri?: string;
  previewImage?: string;
}

interface ImageMetadata {
  title: string;
  description: string;
  tags: string[];
  spaceTypes: string[];
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const PREDEFINED_TAGS = [
  'Modern', 'Traditional', 'Minimalist', 'Cozy', 'Elegant',
  'Colorful', 'Neutral', 'Bright', 'Dark', 'Rustic',
  'Industrial', 'Scandinavian', 'Bohemian', 'Contemporary'
];

const SPACE_TYPES = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room',
  'Office', 'Hallway', 'Closet', 'Outdoor', 'Other'
];

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  visible,
  onClose,
  onUpload,
  imageUri,
  previewImage
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'crop' | 'metadata'>('crop');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  
  // Image editing state
  const [processedImageUri, setProcessedImageUri] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (visible && imageUri) {
      processImage();
    }
  }, [visible, imageUri]);

  React.useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSelectedTags([]);
        setSelectedSpaces([]);
        setCustomTag('');
        setStep('crop');
        setProcessedImageUri('');
      }, 300);
    }
  }, [visible]);

  const processImage = async () => {
    if (!imageUri) return;
    
    setIsProcessing(true);
    try {
      // Crop to square and optimize
      const result = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 800, height: 800 } }
        ],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
        }
      );
      
      setProcessedImageUri(result.uri);
    } catch (error) {
      console.error('Image processing failed:', error);
      setProcessedImageUri(imageUri); // Fallback to original
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSpaceToggle = (space: string) => {
    setSelectedSpaces(prev => 
      prev.includes(space) 
        ? prev.filter(s => s !== space)
        : [...prev, space]
    );
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags(prev => [...prev, trimmedTag]);
      setCustomTag('');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reference image.');
      return;
    }

    if (selectedSpaces.length === 0) {
      Alert.alert('Missing Space Type', 'Please select at least one space type.');
      return;
    }

    setIsUploading(true);
    try {
      const metadata: ImageMetadata = {
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        spaceTypes: selectedSpaces,
      };

      await onUpload(metadata);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderCropStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Preview & Crop</Text>
      <Text style={styles.stepSubtitle}>
        We'll automatically crop your image to focus on the key elements
      </Text>

      <View style={styles.imagePreviewContainer}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={tokens.color.brand} />
            <Text style={styles.processingText}>Processing image...</Text>
          </View>
        ) : processedImageUri ? (
          <Image
            source={{ uri: processedImageUri }}
            style={styles.imagePreview}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color={tokens.color.textMuted} />
            <Text style={styles.placeholderText}>Loading image...</Text>
          </View>
        )}
      </View>

      <View style={styles.cropInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="crop" size={16} color={tokens.color.brand} />
          <Text style={styles.infoText}>Optimized for 800x800px</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="resize" size={16} color={tokens.color.brand} />
          <Text style={styles.infoText}>Compressed for faster uploads</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.nextButton, !processedImageUri && styles.nextButtonDisabled]}
        onPress={() => setStep('metadata')}
        disabled={!processedImageUri}
      >
        <Text style={styles.nextButtonText}>Add Details</Text>
        <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
      </TouchableOpacity>
    </View>
  );

  const renderMetadataStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Details</Text>
      <Text style={styles.stepSubtitle}>
        Help us understand your inspiration better
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Cozy Living Room"
            placeholderTextColor={tokens.color.textMuted}
            maxLength={50}
          />
          <Text style={styles.inputHelper}>{title.length}/50</Text>
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What inspired you about this image?"
            placeholderTextColor={tokens.color.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.inputHelper}>{description.length}/200</Text>
        </View>

        {/* Space Types */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Space Type *</Text>
          <View style={styles.tagContainer}>
            {SPACE_TYPES.map((space) => (
              <TouchableOpacity
                key={space}
                activeOpacity={0.9}
                style={[
                  styles.tag,
                  selectedSpaces.includes(space) && styles.selectedTag
                ]}
                onPress={() => handleSpaceToggle(space)}
              >
                <Text style={[
                  styles.tagText,
                  selectedSpaces.includes(space) && styles.selectedTagText
                ]}>
                  {space}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Style Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Style Tags</Text>
          <View style={styles.tagContainer}>
            {PREDEFINED_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.9}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Tag Input */}
          <View style={styles.customTagContainer}>
            <TextInput
              style={[styles.textInput, styles.customTagInput]}
              value={customTag}
              onChangeText={setCustomTag}
              placeholder="Add custom tag"
              placeholderTextColor={tokens.color.textMuted}
              onSubmitEditing={handleAddCustomTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddCustomTag}
              disabled={!customTag.trim()}
            >
              <Ionicons 
                name="add" 
                size={20} 
                color={customTag.trim() ? tokens.color.brand : tokens.color.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedTagsPreview}>
            <Text style={styles.previewLabel}>Selected tags:</Text>
            <View style={styles.tagContainer}>
              {selectedTags.map((tag) => (
                <View key={tag} style={styles.selectedTagPreview}>
                  <Text style={styles.selectedTagPreviewText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleTagToggle(tag)}
                    style={styles.removeTagButton}
                  >
                    <Ionicons name="close" size={14} color={tokens.color.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.metadataActions}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('crop')}
        >
          <Ionicons name="chevron-back" size={20} color={tokens.color.textPrimary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={isUploading || !title.trim() || selectedSpaces.length === 0}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={tokens.color.textInverse} />
          ) : (
            <>
              <Text style={styles.uploadButtonText}>Upload</Text>
              <Ionicons name="cloud-upload" size={20} color={tokens.color.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BlurView intensity={10} style={styles.blurHeader}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Upload Reference</Text>

            <View style={styles.stepIndicator}>
              <View style={[
                styles.stepDot,
                step === 'crop' ? styles.activeDot : styles.completeDot
              ]} />
              <View style={[
                styles.stepDot,
                step === 'metadata' && styles.activeDot
              ]} />
            </View>
          </View>
        </BlurView>

        <View style={styles.content}>
          {step === 'crop' ? renderCropStep() : renderMetadataStep()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  blurHeader: {
    paddingTop: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
  },
  closeButton: {
    padding: tokens.spacing.sm,
  },
  headerTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.color.borderSoft,
  },
  activeDot: {
    backgroundColor: tokens.color.brand,
  },
  completeDot: {
    backgroundColor: tokens.color.success,
  },
  content: {
    flex: 1,
    padding: tokens.spacing.xl,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  stepSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xxl,
  },
  imagePreviewContainer: {
    aspectRatio: 1,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.color.surface,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e2,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.sm,
  },
  cropInfo: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  infoText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  nextButton: {
    height: 52,
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  nextButtonDisabled: {
    backgroundColor: tokens.color.borderSoft,
  },
  nextButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  inputGroup: {
    marginBottom: tokens.spacing.xl,
  },
  inputLabel: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.sm,
  },
  textInput: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHelper: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'right',
    marginTop: tokens.spacing.xs,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
  },
  tag: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  selectedTag: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
  },
  tagText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
  },
  selectedTagText: {
    color: tokens.color.textInverse,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  customTagInput: {
    flex: 1,
  },
  addTagButton: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
  },
  selectedTagsPreview: {
    marginBottom: tokens.spacing.xl,
  },
  previewLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  selectedTagPreview: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTagPreviewText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.xs,
  },
  removeTagButton: {
    padding: tokens.spacing.xs,
  },
  metadataActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.sm,
  },
  backButtonText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.xs,
  },
  uploadButton: {
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  uploadButtonDisabled: {
    backgroundColor: tokens.color.borderSoft,
  },
  uploadButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '500',
    marginRight: tokens.spacing.sm,
  },
});

export default ImageUploadModal;