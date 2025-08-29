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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import { colorExtractionService, DominantColors } from '../services/colorExtractionService';

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

interface ColorPaletteCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, colors: DominantColors, description?: string) => Promise<void>;
  extractedColors?: DominantColors;
  sourceImageUri?: string;
}

interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

const PRESET_PALETTES = [
  {
    name: 'Modern Neutral',
    colors: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D3D3D3', '#C9A98C'],
    temperature: 'neutral' as const,
    brightness: 'light' as const,
    saturation: 'muted' as const,
  },
  {
    name: 'Warm Earth',
    colors: ['#F4E4BC', '#D4A574', '#B8935F', '#A0522D', '#8B4513'],
    temperature: 'warm' as const,
    brightness: 'medium' as const,
    saturation: 'moderate' as const,
  },
  {
    name: 'Cool Serenity',
    colors: ['#F0F8FF', '#E8F4F8', '#B8D8E0', '#7BB3C0', '#5A9FB8'],
    temperature: 'cool' as const,
    brightness: 'light' as const,
    saturation: 'muted' as const,
  },
  {
    name: 'Bold Contrast',
    colors: ['#FFFFFF', '#1C1C1C', '#C9A98C', '#B9906F', '#8B7355'],
    temperature: 'neutral' as const,
    brightness: 'medium' as const,
    saturation: 'vibrant' as const,
  },
];

export const ColorPaletteCreator: React.FC<ColorPaletteCreatorProps> = ({
  visible,
  onClose,
  onSave,
  extractedColors,
  sourceImageUri
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'extracted' | 'presets'>('extracted');
  const [paletteName, setPaletteName] = useState('');
  const [paletteDescription, setPaletteDescription] = useState('');
  const [customColors, setCustomColors] = useState<string[]>(['#FFFFFF', '#000000', '#C9A98C', '#B9906F']);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Color picker state
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(50);
  const [lightness, setLightness] = useState(50);

  React.useEffect(() => {
    if (extractedColors && visible) {
      setActiveTab('extracted');
      setPaletteName(`Palette ${Date.now()}`);
    }
  }, [extractedColors, visible]);

  React.useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setTimeout(() => {
        setPaletteName('');
        setPaletteDescription('');
        setSelectedPreset('');
        setActiveTab('extracted');
      }, 300);
    }
  }, [visible]);

  React.useEffect(() => {
    // Update color picker values when color is selected
    const currentColor = customColors[selectedColorIndex];
    if (currentColor) {
      const hsl = hexToHsl(currentColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [selectedColorIndex, customColors]);

  const hexToHsl = (hex: string): ColorHSL => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    if (s === 0) {
      const gray = Math.round(l * 255);
      return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const updateCustomColor = (colorValue: string) => {
    const newColors = [...customColors];
    newColors[selectedColorIndex] = colorValue;
    setCustomColors(newColors);
  };

  const handleSliderChange = (value: number, type: 'h' | 's' | 'l') => {
    let newH = hue;
    let newS = saturation;
    let newL = lightness;

    switch (type) {
      case 'h': newH = value; setHue(value); break;
      case 's': newS = value; setSaturation(value); break;
      case 'l': newL = value; setLightness(value); break;
    }

    const newHex = hslToHex(newH, newS, newL);
    updateCustomColor(newHex);
  };

  const generateHarmony = (baseColor: string, type: 'complementary' | 'triadic' | 'analogous') => {
    const analysis = colorExtractionService.analyzeColor(baseColor);
    let harmonyColors: string[] = [];

    switch (type) {
      case 'complementary':
        harmonyColors = colorExtractionService.generateComplementaryPalette(baseColor);
        break;
      case 'analogous':
        const hsl = hexToHsl(baseColor);
        const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
        const analogous2 = hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
        harmonyColors = [baseColor, analogous1, analogous2];
        break;
      case 'triadic':
        const hslTriadic = hexToHsl(baseColor);
        const triadic1 = hslToHex((hslTriadic.h + 120) % 360, hslTriadic.s, hslTriadic.l);
        const triadic2 = hslToHex((hslTriadic.h + 240) % 360, hslTriadic.s, hslTriadic.l);
        harmonyColors = [baseColor, triadic1, triadic2];
        break;
    }

    setCustomColors([...harmonyColors, ...customColors.slice(harmonyColors.length)]);
  };

  const handleSave = async () => {
    if (!paletteName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your color palette.');
      return;
    }

    setIsSaving(true);
    try {
      let colorsToSave: DominantColors;

      if (activeTab === 'extracted' && extractedColors) {
        colorsToSave = extractedColors;
      } else if (activeTab === 'presets' && selectedPreset) {
        const preset = PRESET_PALETTES.find(p => p.name === selectedPreset);
        if (preset) {
          colorsToSave = {
            primary: preset.colors[0],
            secondary: preset.colors[1],
            palette: preset.colors,
            harmony: 'preset' as any,
            temperature: preset.temperature,
            brightness: preset.brightness,
            saturation: preset.saturation,
          };
        } else {
          throw new Error('Selected preset not found');
        }
      } else {
        // Custom colors
        colorsToSave = {
          primary: customColors[0],
          secondary: customColors[1],
          palette: customColors.filter(color => color),
          harmony: 'custom' as any,
          temperature: 'neutral' as const,
          brightness: 'medium' as const,
          saturation: 'moderate' as const,
        };
      }

      await onSave(paletteName.trim(), colorsToSave, paletteDescription.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Save palette failed:', error);
      Alert.alert('Save Failed', 'Unable to save color palette. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {extractedColors && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.tab, activeTab === 'extracted' && styles.activeTab]}
          onPress={() => setActiveTab('extracted')}
        >
          <Text style={[styles.tabText, activeTab === 'extracted' && styles.activeTabText]}>
            Extracted
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.tab, activeTab === 'presets' && styles.activeTab]}
        onPress={() => setActiveTab('presets')}
      >
        <Text style={[styles.tabText, activeTab === 'presets' && styles.activeTabText]}>
          Presets
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.tab, activeTab === 'create' && styles.activeTab]}
        onPress={() => setActiveTab('create')}
      >
        <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
          Create
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderExtractedTab = () => {
    if (!extractedColors) return null;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Extracted Colors</Text>
        <Text style={styles.sectionSubtitle}>
          Colors automatically extracted from your reference image
        </Text>

        <View style={styles.colorPalettePreview}>
          {extractedColors.palette.map((color, index) => (
            <View
              key={index}
              style={[styles.colorSwatch, { backgroundColor: color }]}
            >
              <Text style={styles.colorLabel}>{color}</Text>
            </View>
          ))}
        </View>

        <View style={styles.colorProperties}>
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Temperature:</Text>
            <View style={[styles.propertyTag, getTemperatureStyle(extractedColors.temperature)]}>
              <Text style={styles.propertyText}>{extractedColors.temperature}</Text>
            </View>
          </View>
          
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Brightness:</Text>
            <View style={[styles.propertyTag, getBrightnessStyle(extractedColors.brightness)]}>
              <Text style={styles.propertyText}>{extractedColors.brightness}</Text>
            </View>
          </View>
          
          <View style={styles.propertyRow}>
            <Text style={styles.propertyLabel}>Saturation:</Text>
            <View style={[styles.propertyTag, getSaturationStyle(extractedColors.saturation)]}>
              <Text style={styles.propertyText}>{extractedColors.saturation}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPresetsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Preset Palettes</Text>
      <Text style={styles.sectionSubtitle}>
        Choose from professionally curated color combinations
      </Text>

      <ScrollView style={styles.presetsContainer} showsVerticalScrollIndicator={false}>
        {PRESET_PALETTES.map((preset) => (
          <TouchableOpacity
            key={preset.name}
            activeOpacity={0.9}
            style={[
              styles.presetCard,
              selectedPreset === preset.name && styles.selectedPresetCard
            ]}
            onPress={() => setSelectedPreset(preset.name)}
          >
            <View style={styles.presetColors}>
              {preset.colors.map((color, index) => (
                <View
                  key={index}
                  style={[styles.presetColorSwatch, { backgroundColor: color }]}
                />
              ))}
            </View>
            
            <View style={styles.presetInfo}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <View style={styles.presetProperties}>
                <Text style={styles.presetProperty}>{preset.temperature}</Text>
                <Text style={styles.presetProperty}>•</Text>
                <Text style={styles.presetProperty}>{preset.brightness}</Text>
                <Text style={styles.presetProperty}>•</Text>
                <Text style={styles.presetProperty}>{preset.saturation}</Text>
              </View>
            </View>

            {selectedPreset === preset.name && (
              <Ionicons name="checkmark-circle" size={24} color={tokens.color.success} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCreateTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Create Custom Palette</Text>
      <Text style={styles.sectionSubtitle}>
        Design your own color palette with precision controls
      </Text>

      {/* Color Swatches */}
      <View style={styles.customColorsContainer}>
        <View style={styles.colorSwatches}>
          {customColors.map((color, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              style={[
                styles.customColorSwatch,
                { backgroundColor: color },
                selectedColorIndex === index && styles.selectedColorSwatch
              ]}
              onPress={() => setSelectedColorIndex(index)}
            >
              {selectedColorIndex === index && (
                <Ionicons name="create" size={16} color={tokens.color.textInverse} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.selectedColorLabel}>
          Editing: {customColors[selectedColorIndex]}
        </Text>
      </View>

      {/* Color Controls */}
      <View style={styles.colorControls}>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Hue: {hue}°</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={360}
            value={hue}
            onValueChange={(value) => handleSliderChange(value, 'h')}
            minimumTrackTintColor={tokens.color.brand}
            maximumTrackTintColor={tokens.color.borderSoft}
            thumbStyle={styles.sliderThumb}
          />
        </View>

        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Saturation: {saturation}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={saturation}
            onValueChange={(value) => handleSliderChange(value, 's')}
            minimumTrackTintColor={tokens.color.brand}
            maximumTrackTintColor={tokens.color.borderSoft}
            thumbStyle={styles.sliderThumb}
          />
        </View>

        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Lightness: {lightness}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={lightness}
            onValueChange={(value) => handleSliderChange(value, 'l')}
            minimumTrackTintColor={tokens.color.brand}
            maximumTrackTintColor={tokens.color.borderSoft}
            thumbStyle={styles.sliderThumb}
          />
        </View>
      </View>

      {/* Harmony Generator */}
      <View style={styles.harmonySection}>
        <Text style={styles.harmonyLabel}>Generate Harmony:</Text>
        <View style={styles.harmonyButtons}>
          <TouchableOpacity
            style={styles.harmonyButton}
            onPress={() => generateHarmony(customColors[selectedColorIndex], 'complementary')}
          >
            <Text style={styles.harmonyButtonText}>Complementary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.harmonyButton}
            onPress={() => generateHarmony(customColors[selectedColorIndex], 'analogous')}
          >
            <Text style={styles.harmonyButtonText}>Analogous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.harmonyButton}
            onPress={() => generateHarmony(customColors[selectedColorIndex], 'triadic')}
          >
            <Text style={styles.harmonyButtonText}>Triadic</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getTemperatureStyle = (temperature: string) => {
    switch (temperature) {
      case 'warm': return { backgroundColor: '#FFEB3B' };
      case 'cool': return { backgroundColor: '#2196F3' };
      default: return { backgroundColor: tokens.color.borderSoft };
    }
  };

  const getBrightnessStyle = (brightness: string) => {
    switch (brightness) {
      case 'light': return { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: tokens.color.borderSoft };
      case 'dark': return { backgroundColor: '#1C1C1C' };
      default: return { backgroundColor: tokens.color.textMuted };
    }
  };

  const getSaturationStyle = (saturation: string) => {
    switch (saturation) {
      case 'vibrant': return { backgroundColor: '#FF5722' };
      case 'muted': return { backgroundColor: tokens.color.textMuted };
      default: return { backgroundColor: tokens.color.brand };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BlurView intensity={10} style={styles.blurHeader}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={tokens.color.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Color Palette</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving || !paletteName.trim()}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={tokens.color.textInverse} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <TextInput
            style={styles.nameInput}
            value={paletteName}
            onChangeText={setPaletteName}
            placeholder="Palette name"
            placeholderTextColor={tokens.color.textMuted}
            maxLength={50}
          />
          
          <TextInput
            style={styles.descriptionInput}
            value={paletteDescription}
            onChangeText={setPaletteDescription}
            placeholder="Description (optional)"
            placeholderTextColor={tokens.color.textMuted}
            multiline
            numberOfLines={2}
            maxLength={200}
          />
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'extracted' && renderExtractedTab()}
          {activeTab === 'presets' && renderPresetsTab()}
          {activeTab === 'create' && renderCreateTab()}
        </ScrollView>
      </View>
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
  saveButton: {
    backgroundColor: tokens.color.accent,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: tokens.color.borderSoft,
  },
  saveButtonText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  formSection: {
    padding: tokens.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  nameInput: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    paddingVertical: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  descriptionInput: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    textAlignVertical: 'top',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: tokens.spacing.xl,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.xs,
    ...tokens.shadow.e1,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
  },
  activeTab: {
    backgroundColor: tokens.color.accent,
  },
  tabText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: tokens.color.textInverse,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: tokens.spacing.xl,
  },
  sectionTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  sectionSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.xl,
  },
  colorPalettePreview: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.xl,
  },
  colorSwatch: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: tokens.radius.md,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  colorLabel: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    backgroundColor: tokens.color.scrim,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.xs,
    fontSize: 10,
  },
  colorProperties: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  propertyLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
  },
  propertyTag: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
  },
  propertyText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  presetsContainer: {
    maxHeight: 400,
  },
  presetCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    ...tokens.shadow.e1,
  },
  selectedPresetCard: {
    borderColor: tokens.color.success,
    borderWidth: 2,
  },
  presetColors: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
    marginRight: tokens.spacing.lg,
  },
  presetColorSwatch: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.xs,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  presetProperties: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  presetProperty: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  customColorsContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  customColorSwatch: {
    width: 60,
    height: 60,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorSwatch: {
    borderColor: tokens.color.accent,
    borderWidth: 3,
  },
  selectedColorLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    fontFamily: 'monospace',
  },
  colorControls: {
    marginBottom: tokens.spacing.xxl,
  },
  sliderGroup: {
    marginBottom: tokens.spacing.xl,
  },
  sliderLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: tokens.color.brand,
    width: 24,
    height: 24,
  },
  harmonySection: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    ...tokens.shadow.e1,
  },
  harmonyLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    marginBottom: tokens.spacing.lg,
  },
  harmonyButtons: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  harmonyButton: {
    flex: 1,
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.md,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
  },
  harmonyButtonText: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
});

export default ColorPaletteCreator;