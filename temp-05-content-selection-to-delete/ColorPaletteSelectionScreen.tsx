import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { tokens } from '../../theme/tokens';
import { 
  ColorPaletteService, 
  ColorExtractionService,
  COLOR_PALETTES_DATABASE,
  ColorPalette 
} from '../../data/colorPalettesDatabase';

const { width: screenWidth } = Dimensions.get('window');
const paletteWidth = screenWidth - 32; // Full width minus padding


interface ColorPaletteSelectionProps {
  navigation?: any;
  route?: any;
}

const ColorPaletteSelectionScreen: React.FC<ColorPaletteSelectionProps> = ({ navigation, route }) => {
  const journeyStore = useJourneyStore();
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);

  // Get params from previous screen
  const { selectedStyle, spaceType } = route?.params || {};

  useEffect(() => {
    loadPalettes();
  }, [selectedStyle, spaceType]);

  const loadPalettes = async () => {
    setIsLoading(true);
    try {
      // Filter palettes based on selected style and space type
      const filteredPalettes = ColorPaletteService.getFilteredPalettes({
        style: selectedStyle,
        spaceType: spaceType,
        limit: 12 // Show 12 palettes
      });

      // If no filtered results, show popular palettes
      const palettesToShow = filteredPalettes.length > 0 
        ? filteredPalettes 
        : ColorPaletteService.getPopularPalettes(12);

      setPalettes(palettesToShow);
    } catch (error) {
      console.error('Error loading palettes:', error);
      // Fallback to showing all palettes
      setPalettes(COLOR_PALETTES_DATABASE.slice(0, 12));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    setSelectedPalette(paletteId);
  };

  const handleContinue = () => {
    if (!selectedPalette) {
      Alert.alert('Please select a color palette', 'Choose a color palette to continue with your project.');
      return;
    }

    // Save selected palette to journey store
    journeyStore.updateProjectWizard({
      selectedPalette: selectedPalette,
    });

    // Navigate to budget screen
    NavigationHelpers.navigateToScreen('budget', {
      selectedStyle,
      spaceType,
      selectedPalette,
    });
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to extract colors from your images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          const extraction = await ColorExtractionService.extractColorsFromImage(result.assets[0].uri);
          
          // Create a temporary palette from extracted colors
          const extractedPalette: ColorPalette = {
            ...extraction.palette,
            id: 'extracted_' + Date.now(),
            dateAdded: new Date().toISOString(),
          };

          // Add to current palettes list
          setPalettes(prevPalettes => [extractedPalette, ...prevPalettes]);
          
          // Auto-select the extracted palette
          setSelectedPalette(extractedPalette.id);
          
          Alert.alert('Colors extracted!', 'We\'ve created a palette from your image. You can select it or choose another.');
        } catch (error) {
          console.error('Color extraction error:', error);
          Alert.alert('Extraction failed', 'We couldn\'t extract colors from this image. Please try another.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Something went wrong accessing your images.');
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>
    );
  };

  const renderPaletteCard = (palette: ColorPalette) => {
    const isSelected = selectedPalette === palette.id;
    
    return (
      <TouchableOpacity
        key={palette.id}
        style={[styles.paletteCard, isSelected && styles.paletteCardSelected]}
        onPress={() => handlePaletteSelect(palette.id)}
        activeOpacity={0.8}
      >
        {/* Color swatches */}
        <View style={styles.colorSwatches}>
          {palette.colors.slice(0, 5).map((color, index) => (
            <View
              key={index}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                index === 0 && styles.colorSwatchFirst,
                index === palette.colors.slice(0, 5).length - 1 && styles.colorSwatchLast,
              ]}
            />
          ))}
        </View>
        
        {/* Palette info */}
        <View style={styles.paletteInfo}>
          <Text style={[styles.paletteName, isSelected && styles.paletteNameSelected]}>
            {palette.name}
          </Text>
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={tokens.colors.primary.DEFAULT} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={tokens.colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationHelpers.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.stepText}>Step 6 of 10</Text>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => NavigationHelpers.navigateToScreen('welcome')}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={tokens.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress bars */}
      {renderProgressBar()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Select Palette</Text>
          <Text style={styles.subtitle}>
            Choose a color palette to bring your vision to life!{'\n'}
            Select from curated shades to transform your space.
          </Text>
        </View>

        {/* Upload image button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color={tokens.colors.primary.DEFAULT} />
          <Text style={styles.uploadButtonText}>Extract from Image</Text>
        </TouchableOpacity>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tokens.colors.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading palettes...</Text>
          </View>
        )}

        {/* Palettes Grid */}
        {!isLoading && (
          <View style={styles.palettesGrid}>
            {palettes.map(palette => renderPaletteCard(palette))}
          </View>
        )}
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, selectedPalette && styles.continueButtonActive]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!selectedPalette}
        >
          <Text style={[styles.continueButtonText, selectedPalette && styles.continueButtonTextActive]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  backButton: {
    padding: tokens.spacing.xs,
  },
  stepText: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: tokens.colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.md,
    paddingBottom: 100, // Extra space for fixed footer + Continue button
  },
  titleContainer: {
    marginBottom: tokens.spacing.lg,
  },
  title: {
    ...tokens.typography.heading.h1,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    lineHeight: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1,
    borderColor: tokens.colors.primary.DEFAULT,
    borderRadius: 12,
    paddingVertical: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  uploadButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.primary.DEFAULT,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.md,
  },
  palettesGrid: {
    gap: tokens.spacing.md,
  },
  paletteCard: {
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  paletteCardSelected: {
    borderColor: tokens.colors.primary.DEFAULT,
    shadowColor: tokens.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  colorSwatches: {
    flexDirection: 'row',
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: tokens.spacing.md,
  },
  colorSwatch: {
    flex: 1,
  },
  colorSwatchFirst: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  colorSwatchLast: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  paletteInfo: {
    alignItems: 'center',
  },
  paletteName: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  paletteNameSelected: {
    color: tokens.colors.primary.DEFAULT,
  },
  selectionIndicator: {
    position: 'absolute',
    top: tokens.spacing.md,
    right: tokens.spacing.md,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 12,
    padding: 2,
  },
  footer: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.background.primary,
  },
  continueButton: {
    backgroundColor: tokens.colors.border.light,
    borderRadius: 25,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: tokens.colors.text.primary,
  },
  continueButtonText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: tokens.colors.text.inverse,
  },
});

export default ColorPaletteSelectionScreen;