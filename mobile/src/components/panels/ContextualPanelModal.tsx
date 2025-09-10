import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RelevantIcon, ProcessedContext } from '../../types/contextAnalysis';
import { tokens } from '../../theme/tokens';
import { 
  getFilteredStyles, 
  getFilteredColorPalettes, 
  getFilteredBudgetRanges,
  DESIGN_STYLES,
  COLOR_PALETTES,
  BUDGET_RANGES
} from '../../data/designCategories';

const { height: screenHeight } = Dimensions.get('window');

interface ContextualPanelModalProps {
  visible: boolean;
  icon: RelevantIcon | null;
  context: ProcessedContext | null;
  onClose: () => void;
  onSelection?: (selection: any) => void;
}

export const ContextualPanelModal: React.FC<ContextualPanelModalProps> = ({
  visible,
  icon,
  context,
  onClose,
  onSelection
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !icon) return null;

  const renderContent = () => {
    switch (icon.id) {
      case 'style':
        return <StylePanel context={context} icon={icon} onSelection={onSelection} />;
      case 'colorPalette':
        return <ColorPalettePanel context={context} icon={icon} onSelection={onSelection} />;
      case 'budget':
        return <BudgetPanel context={context} icon={icon} onSelection={onSelection} />;
      case 'furniture':
        return <FurniturePanel context={context} icon={icon} onSelection={onSelection} />;
      case 'materials':
        return <MaterialsPanel context={context} icon={icon} onSelection={onSelection} />;
      case 'location':
        return <LocationPanel context={context} icon={icon} onSelection={onSelection} />;
      default:
        return <DefaultPanel context={context} icon={icon} onSelection={onSelection} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerContent}>
                <Text style={styles.iconEmoji}>{icon.icon}</Text>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{icon.label}</Text>
                  {icon.badge && (
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>{icon.badge}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color={tokens.color.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {renderContent()}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Individual panel components
const StylePanel: React.FC<PanelProps> = ({ context, icon, onSelection }) => (
  <View style={styles.panelContent}>
    <Text style={styles.description}>
      Choose a design style that matches your vision
    </Text>
    <View style={styles.optionsGrid}>
      {getStyleOptions(context).map((style, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionCard}
          onPress={() => onSelection?.(style)}
        >
          <Text style={styles.optionEmoji}>{style.icon}</Text>
          <Text style={styles.optionLabel}>{style.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const ColorPalettePanel: React.FC<PanelProps> = ({ context, onSelection }) => (
  <View style={styles.panelContent}>
    <Text style={styles.description}>
      Select a color palette for your space
    </Text>
    <View style={styles.colorPaletteGrid}>
      {getColorPalettes(context).map((palette, index) => (
        <TouchableOpacity
          key={index}
          style={styles.colorPaletteCard}
          onPress={() => onSelection?.(palette)}
        >
          <View style={styles.colorSwatches}>
            {palette.colors.slice(0, 4).map((color, colorIndex) => (
              <View
                key={colorIndex}
                style={[styles.colorSwatch, { backgroundColor: color }]}
              />
            ))}
          </View>
          <Text style={styles.paletteLabel}>{palette.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const BudgetPanel: React.FC<PanelProps> = ({ context, onSelection }) => (
  <View style={styles.panelContent}>
    <Text style={styles.description}>
      Set your project budget range
    </Text>
    <View style={styles.budgetOptions}>
      {getBudgetRanges(context).map((range, index) => (
        <TouchableOpacity
          key={index}
          style={styles.budgetCard}
          onPress={() => onSelection?.(range)}
        >
          <Text style={styles.budgetAmount}>{range.label}</Text>
          <Text style={styles.budgetDescription}>{range.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const DefaultPanel: React.FC<PanelProps> = ({ icon }) => (
  <View style={styles.panelContent}>
    <Text style={styles.description}>
      {icon.label} options will be available soon
    </Text>
    <View style={styles.comingSoon}>
      <Ionicons name="construct-outline" size={48} color={tokens.color.textMuted} />
      <Text style={styles.comingSoonText}>Coming Soon</Text>
    </View>
  </View>
);

// Helper components for other panels
const FurniturePanel: React.FC<PanelProps> = ({ context, onSelection }) => (
  <DefaultPanel icon={{ id: 'furniture', label: 'Furniture', icon: '🪑' } as RelevantIcon} />
);

const MaterialsPanel: React.FC<PanelProps> = ({ context, onSelection }) => (
  <DefaultPanel icon={{ id: 'materials', label: 'Materials', icon: '🏗️' } as RelevantIcon} />
);

const LocationPanel: React.FC<PanelProps> = ({ context, onSelection }) => (
  <DefaultPanel icon={{ id: 'location', label: 'Location', icon: '📍' } as RelevantIcon} />
);

// Helper functions
function getStyleOptions(context: ProcessedContext | null) {
  if (!context) return DESIGN_STYLES.slice(0, 6);

  return getFilteredStyles({
    spaceType: context.spaceType,
    roomType: context.roomType?.category,
    currentStyle: context.currentStyle.primary
  }).slice(0, 6);
}

function getColorPalettes(context: ProcessedContext | null) {
  if (!context) return COLOR_PALETTES.slice(0, 4);

  return getFilteredColorPalettes({
    currentStyle: context.currentStyle.primary
  }).slice(0, 4);
}

function getBudgetRanges(context: ProcessedContext | null) {
  if (!context) return BUDGET_RANGES;

  return getFilteredBudgetRanges({
    roomType: context.roomType?.category,
    scale: context.spatial.scale
  });
}

interface PanelProps {
  context: ProcessedContext | null;
  icon: RelevantIcon;
  onSelection?: (selection: any) => void;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: screenHeight * 0.8,
    backgroundColor: tokens.color.surface,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
  },
  modalContent: {
    flex: 1,
  },
  header: {
    paddingTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: tokens.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: tokens.spacing.md,
  },
  iconEmoji: {
    fontSize: 28,
    marginRight: tokens.spacing.md,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginRight: tokens.spacing.sm,
  },
  headerBadge: {
    backgroundColor: tokens.color.brand + '20',
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  headerBadgeText: {
    ...tokens.type.caption,
    color: tokens.color.brand,
    fontWeight: '600',
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
  },
  panelContent: {
    paddingVertical: tokens.spacing.lg,
  },
  description: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.md,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: tokens.spacing.xs,
  },
  optionLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  colorPaletteGrid: {
    gap: tokens.spacing.md,
  },
  colorPaletteCard: {
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  colorSwatches: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  colorSwatch: {
    flex: 1,
    height: 40,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  paletteLabel: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  budgetOptions: {
    gap: tokens.spacing.md,
  },
  budgetCard: {
    backgroundColor: tokens.color.bgApp,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  budgetAmount: {
    ...tokens.type.h4,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  budgetDescription: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  comingSoonText: {
    ...tokens.type.h4,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.md,
  },
});