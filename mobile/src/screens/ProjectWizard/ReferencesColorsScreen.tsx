import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useJourneyStore } from '../../stores/journeyStore';
import { useContentStore } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/NavigationHelpers';
import { referenceImageService } from '../../services/referenceImageService';
import { colorExtractionService } from '../../services/colorExtractionService';
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

const { width } = Dimensions.get('window');

export const ReferencesColorsScreen: React.FC = () => {
  const journeyStore = useJourneyStore();
  const contentStore = useContentStore();
  
  const [activeTab, setActiveTab] = useState<'references' | 'colors'>('references');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserContent();
  }, []);

  const loadUserContent = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        contentStore.loadUserReferences(),
        contentStore.loadUserPalettes()
      ]);
    } catch (error) {
      console.error('Failed to load user content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadReference = useCallback(async () => {
    try {
      const result = await referenceImageService.pickFromGallery();
      
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        // Show upload progress
        const uploadedImage = await contentStore.uploadReferenceImage(
          asset.uri,
          {
            title: 'Reference Image',
            description: 'Uploaded for design inspiration',
            tags: ['user-uploaded']
          }
        );

        // Optionally analyze with AI
        try {
          const analysis = await geminiVisionService.analyzeImage(asset.uri);
          await referenceImageService.updateReferenceImage(uploadedImage.id, {
            ai_description: analysis.description,
            style_tags: analysis.style_tags,
            mood_tags: analysis.mood_tags,
            detected_objects: analysis.detected_objects
          });
        } catch (aiError) {
          console.warn('AI analysis failed, but upload succeeded:', aiError);
        }
        
        Alert.alert('Success', 'Reference image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Please try again.');
    }
  }, [contentStore]);

  const handleCameraCapture = useCallback(async () => {
    try {
      const result = await referenceImageService.pickFromCamera();
      
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        const uploadedImage = await contentStore.uploadReferenceImage(
          asset.uri,
          {
            title: 'Camera Capture',
            description: 'Captured reference image',
            tags: ['camera-capture']
          }
        );
        
        Alert.alert('Success', 'Reference image captured and uploaded!');
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      Alert.alert('Capture Failed', 'Please try again.');
    }
  }, [contentStore]);

  const handleExtractColors = useCallback(async (imageUri: string) => {
    try {
      const colors = await contentStore.extractColorsFromImage(imageUri);
      
      // Create palette from extracted colors
      const paletteName = `Palette ${Date.now()}`;
      await contentStore.createColorPalette(paletteName, colors, {
        description: 'Extracted from reference image'
      });
      
      Alert.alert('Success', 'Color palette extracted and saved!');
    } catch (error) {
      console.error('Color extraction failed:', error);
      Alert.alert('Extraction Failed', 'Unable to extract colors from this image.');
    }
  }, [contentStore]);

  const handleReferenceSelect = useCallback((referenceId: string) => {
    contentStore.toggleReferenceSelection(referenceId);
  }, [contentStore]);

  const handlePaletteSelect = useCallback((paletteId: string) => {
    contentStore.togglePaletteSelection(paletteId);
  }, [contentStore]);

  const handleContinue = () => {
    const hasSelections = contentStore.selectedReferences.length > 0 || contentStore.selectedPalettes.length > 0;
    
    if (!hasSelections) {
      Alert.alert(
        'No Selections', 
        'Please select at least one reference image or color palette to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Save selections to journey store
    journeyStore.updateProjectWizard({
      selectedReferences: contentStore.selectedReferences,
      selectedPalettes: contentStore.selectedPalettes
    });

    NavigationHelpers.navigateToScreen('aiProcessing');
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.tab, activeTab === 'references' && styles.activeTab]}
        onPress={() => setActiveTab('references')}
      >
        <Ionicons 
          name="images-outline" 
          size={20} 
          color={activeTab === 'references' ? tokens.color.accent : tokens.color.textMuted} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'references' && styles.activeTabText
        ]}>
          References
        </Text>
        {contentStore.selectedReferences.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{contentStore.selectedReferences.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.tab, activeTab === 'colors' && styles.activeTab]}
        onPress={() => setActiveTab('colors')}
      >
        <Ionicons 
          name="color-palette-outline" 
          size={20} 
          color={activeTab === 'colors' ? tokens.color.accent : tokens.color.textMuted} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'colors' && styles.activeTabText
        ]}>
          Colors
        </Text>
        {contentStore.selectedPalettes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{contentStore.selectedPalettes.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderReferencesTab = () => (
    <View style={styles.tabContent}>
      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Your Inspiration</Text>
        <Text style={styles.sectionSubtitle}>
          Share images that inspire your design vision
        </Text>
        
        <View style={styles.uploadButtons}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.uploadButton}
            onPress={handleCameraCapture}
          >
            <Ionicons name="camera" size={24} color={tokens.color.accent} />
            <Text style={styles.uploadButtonText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.uploadButton}
            onPress={handleUploadReference}
          >
            <Ionicons name="image" size={24} color={tokens.color.accent} />
            <Text style={styles.uploadButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload Progress */}
      {contentStore.uploadProgress.isUploading && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ActivityIndicator size="small" color={tokens.color.brand} />
            <Text style={styles.progressText}>{contentStore.uploadProgress.message}</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${contentStore.uploadProgress.progress}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {/* User References Grid */}
      <View style={styles.referencesSection}>
        <Text style={styles.sectionTitle}>Your References</Text>
        
        {contentStore.loading.userReferences ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.color.brand} />
            <Text style={styles.loadingText}>Loading references...</Text>
          </View>
        ) : contentStore.userReferences.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={tokens.color.textMuted} />
            <Text style={styles.emptyStateText}>No references uploaded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Upload some inspiration images to get started
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.referencesGrid}>
              {contentStore.userReferences.map((reference) => (
                <ReferenceCard
                  key={reference.id}
                  reference={reference}
                  isSelected={contentStore.selectedReferences.includes(reference.id)}
                  onSelect={handleReferenceSelect}
                  onExtractColors={handleExtractColors}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );

  const renderColorsTab = () => (
    <View style={styles.tabContent}>
      {/* Color Extraction Section */}
      {contentStore.colorExtraction.isExtracting && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ActivityIndicator size="small" color={tokens.color.brand} />
            <Text style={styles.progressText}>Extracting colors...</Text>
          </View>
        </View>
      )}

      {/* Extracted Colors Preview */}
      {contentStore.colorExtraction.extractedColors && (
        <View style={styles.extractedColorsSection}>
          <Text style={styles.sectionTitle}>Extracted Colors</Text>
          <View style={styles.colorPreview}>
            {contentStore.colorExtraction.extractedColors.palette.map((color, index) => (
              <View 
                key={index}
                style={[styles.colorSwatch, { backgroundColor: color }]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.saveColorsButton}
            onPress={() => {
              if (contentStore.colorExtraction.extractedColors) {
                contentStore.createColorPalette(
                  `Palette ${Date.now()}`,
                  contentStore.colorExtraction.extractedColors
                );
              }
            }}
          >
            <Text style={styles.saveColorsButtonText}>Save as Palette</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User Palettes */}
      <View style={styles.palettesSection}>
        <Text style={styles.sectionTitle}>Your Color Palettes</Text>
        
        {contentStore.loading.userPalettes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.color.brand} />
            <Text style={styles.loadingText}>Loading palettes...</Text>
          </View>
        ) : contentStore.userPalettes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="color-palette-outline" size={48} color={tokens.color.textMuted} />
            <Text style={styles.emptyStateText}>No color palettes yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Extract colors from reference images to create palettes
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.palettesGrid}>
              {contentStore.userPalettes.map((palette) => (
                <ColorPaletteCard
                  key={palette.id}
                  palette={palette}
                  isSelected={contentStore.selectedPalettes.includes(palette.id!)}
                  onSelect={handlePaletteSelect}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => NavigationHelpers.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>References & Colors</Text>
          <Text style={styles.headerSubtitle}>Step 5 of 5</Text>
        </View>

        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={tokens.color.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>5/5 Complete</Text>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'references' ? renderReferencesTab() : renderColorsTab()}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.continueButton,
            (contentStore.selectedReferences.length > 0 || contentStore.selectedPalettes.length > 0) 
              ? styles.continueButtonActive 
              : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue to AI Processing
          </Text>
          <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => NavigationHelpers.navigateToScreen('aiProcessing')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Reference Card Component
interface ReferenceCardProps {
  reference: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onExtractColors: (imageUri: string) => void;
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({
  reference,
  isSelected,
  onSelect,
  onExtractColors
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.referenceCard, isSelected && styles.selectedReferenceCard]}
    onPress={() => onSelect(reference.id)}
  >
    <Image 
      source={{ uri: reference.thumbnail_url || reference.image_url }} 
      style={styles.referenceImage}
      resizeMode="cover"
    />
    
    {isSelected && (
      <View style={styles.selectionOverlay}>
        <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
      </View>
    )}

    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.6)']}
      style={styles.referenceGradient}
    />

    <View style={styles.referenceActions}>
      <TouchableOpacity
        style={styles.extractButton}
        onPress={() => onExtractColors(reference.image_url)}
      >
        <Ionicons name="color-palette" size={16} color={tokens.color.textInverse} />
      </TouchableOpacity>
    </View>

    {reference.user_title && (
      <Text style={styles.referenceTitle}>{reference.user_title}</Text>
    )}
  </TouchableOpacity>
);

// Color Palette Card Component
interface ColorPaletteCardProps {
  palette: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ColorPaletteCard: React.FC<ColorPaletteCardProps> = ({
  palette,
  isSelected,
  onSelect
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.paletteCard, isSelected && styles.selectedPaletteCard]}
    onPress={() => onSelect(palette.id)}
  >
    <View style={styles.paletteColors}>
      {palette.colors.colors.slice(0, 5).map((color: string, index: number) => (
        <View
          key={index}
          style={[styles.paletteColorSwatch, { backgroundColor: color }]}
        />
      ))}
    </View>

    {isSelected && (
      <View style={styles.paletteSelectionIndicator}>
        <Ionicons name="checkmark-circle" size={20} color={tokens.color.success} />
      </View>
    )}

    <Text style={styles.paletteName}>{palette.name}</Text>
    
    <View style={styles.paletteInfo}>
      <Text style={styles.paletteTemperature}>
        {palette.color_temperature}
      </Text>
      <Text style={styles.paletteBrightness}>
        {palette.brightness_level}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.lg,
  },
  backButton: {
    padding: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.xs,
  },
  helpButton: {
    padding: tokens.spacing.sm,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.xs,
    ...tokens.shadow.e1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.sm,
  },
  activeTab: {
    backgroundColor: tokens.color.accent,
    ...tokens.shadow.e2,
  },
  tabText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.sm,
  },
  activeTabText: {
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    marginLeft: tokens.spacing.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: tokens.spacing.xl,
  },
  uploadSection: {
    marginBottom: tokens.spacing.xxl,
  },
  sectionTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  sectionSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.lg,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    borderStyle: 'dashed',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e1,
  },
  uploadButtonText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.sm,
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  progressText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
  },
  progressFill: {
    height: 4,
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  referencesSection: {
    marginBottom: tokens.spacing.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  emptyStateText: {
    ...tokens.type.h3,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.lg,
  },
  emptyStateSubtext: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
  },
  referencesGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
  },
  referenceCard: {
    width: 160,
    height: 200,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.color.surface,
    ...tokens.shadow.e2,
  },
  selectedReferenceCard: {
    borderWidth: 2,
    borderColor: tokens.color.success,
  },
  referenceImage: {
    width: '100%',
    height: '70%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.pill,
    padding: tokens.spacing.xs,
  },
  referenceGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  referenceActions: {
    position: 'absolute',
    bottom: tokens.spacing.sm,
    right: tokens.spacing.sm,
  },
  extractButton: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.pill,
    padding: tokens.spacing.sm,
  },
  referenceTitle: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    padding: tokens.spacing.sm,
    textAlign: 'center',
  },
  extractedColorsSection: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  saveColorsButton: {
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    alignSelf: 'flex-start',
  },
  saveColorsButtonText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  palettesSection: {
    marginBottom: tokens.spacing.xxl,
  },
  palettesGrid: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
  },
  paletteCard: {
    width: 140,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  selectedPaletteCard: {
    borderWidth: 2,
    borderColor: tokens.color.success,
  },
  paletteColors: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  paletteColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: tokens.radius.xs,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  paletteSelectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
  },
  paletteName: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  paletteInfo: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  paletteTemperature: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    backgroundColor: tokens.color.bgApp,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  paletteBrightness: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    backgroundColor: tokens.color.bgApp,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  bottomSection: {
    padding: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  continueButton: {
    height: 52,
    borderRadius: tokens.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  continueButtonActive: {
    backgroundColor: tokens.color.accent,
  },
  continueButtonDisabled: {
    backgroundColor: tokens.color.borderSoft,
  },
  continueButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  skipButtonText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
});

export default ReferencesColorsScreen;