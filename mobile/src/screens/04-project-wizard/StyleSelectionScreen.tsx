import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { WizardValidationService } from '../../services/wizardValidationService';
import { StyleService, StyleDefinition, SpaceType } from '../../data/stylesDatabase';
import { useJourneyStore } from '../../stores/journeyStore';
import { ReferenceFilteringService } from '../../services/referenceFilteringService';

// Import design tokens from the style guide
import designTokens from '../../../@STYLE-GUIDE.json';

// Design System Tokens
const tokens = {
  color: designTokens.tokens.color,
  spacing: designTokens.tokens.spacing,
  radius: designTokens.tokens.radius,
  shadow: designTokens.tokens.shadow,
  typography: designTokens.tokens.typography,
  components: designTokens.components,
};

const { width, height } = Dimensions.get('window');

interface StyleSelectionScreenProps {
  navigation: any;
  route: any;
}

// Map space types from journey store to our database format
const mapSpaceType = (spaceType: string): SpaceType => {
  const mapping: Record<string, SpaceType> = {
    'living-room': 'living_room',
    'living_room': 'living_room',
    'bedroom': 'bedroom',
    'kitchen': 'kitchen',
    'bathroom': 'bathroom',
    'dining-room': 'dining_room',
    'dining_room': 'dining_room',
    'office': 'home_office',
    'home-office': 'home_office',
    'entryway': 'entryway',
    'hallway': 'hallway',
    'basement': 'basement',
    'attic': 'attic',
    'laundry': 'laundry_room',
    'laundry-room': 'laundry_room',
    'closet': 'closet',
    'pantry': 'pantry',
    'garage': 'garage',
    'garden': 'garden',
    'patio': 'patio',
    'balcony': 'balcony',
    'deck': 'deck',
    'backyard': 'backyard',
    'front-yard': 'front_yard',
    'front_yard': 'front_yard',
    'outdoor-kitchen': 'outdoor_kitchen',
    'pool': 'pool_area',
    'pool-area': 'pool_area',
  };
  return mapping[spaceType] || 'living_room';
};

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const journeyStore = useJourneyStore();
  const { projectName, roomType } = route.params || {};
  
  // Get space type from journey store or route params
  const currentSpaceType = useMemo(() => {
    const spaceFromStore = journeyStore.projectWizard?.roomName || 
                           journeyStore.currentProject?.spaceType || 
                           roomType;
    return mapSpaceType(spaceFromStore || 'living-room');
  }, [journeyStore, roomType]);
  
  // Get filtered styles for current space
  const availableStyles = useMemo(() => {
    const styles = StyleService.getStylesForSpace(currentSpaceType);
    console.log(`🎨 Showing ${styles.length} styles for space: ${currentSpaceType}`);
    console.log('Available styles:', styles.map(s => s.name));
    return styles;
  }, [currentSpaceType]);
  
  // Calculate compatibility percentage for UI display
  const getCompatibilityText = (style: StyleDefinition): string => {
    if (style.compatibleSpaces.length === 0) {
      return 'Universal compatibility';
    }
    const totalSpaces = 22; // Total number of space types we support
    const percentage = Math.round((style.compatibleSpaces.length / totalSpaces) * 100);
    return `${percentage}% space compatibility`;
  };

  const handleContinue = async () => {
    if (selectedStyle) {
      const selectedStyleData = StyleService.getStyleById(selectedStyle);
      
      // Update journey store with selected style
      journeyStore.updateProjectWizard({
        styleId: selectedStyle,
        styleName: selectedStyleData?.name || selectedStyle,
        currentWizardStep: 'style_selection'
      });
      
      console.log('🎨 Style selected:', {
        id: selectedStyle,
        name: selectedStyleData?.name,
        spaceType: currentSpaceType
      });

      // Trigger validation for styleSelection step to update validation state
      try {
        const validationResult = await WizardValidationService.validateWizardStep('styleSelection');
        console.log('✅ Style selection validation triggered:', validationResult.isValid);
      } catch (error) {
        console.warn('⚠️ Style selection validation failed:', error);
      }
      
      // Start background reference filtering (implemented!)
      ReferenceFilteringService.startBackgroundFiltering(
        selectedStyle,
        currentSpaceType
      ).catch(error => {
        console.warn('⚠️ Background reference filtering failed:', error);
      });
      
      NavigationHelpers.navigateToScreen('referenceSelection', {
        projectName,
        roomType,
        selectedStyle,
        spaceType: currentSpaceType
      });
    }
  };

  const handleBack = () => {
    NavigationHelpers.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={tokens.components.onboarding.backgroundGradient.colors}
        start={tokens.components.onboarding.backgroundGradient.start}
        end={tokens.components.onboarding.backgroundGradient.end}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Style</Text>
          <Text style={styles.headerSubtitle}>Step 4 of 10</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Info */}
        <View style={styles.projectInfo}>
          <Text style={styles.designingFor}>Designing for:</Text>
          <Text style={styles.roomType}>{currentSpaceType.replace('_', ' ').replace('-', ' ')}</Text>
          <Text style={styles.spacesLabel}>Styles for Your Space</Text>
          <Text style={styles.allStylesLabel}>
            {availableStyles.length} Compatible Styles
          </Text>
        </View>

        {/* Enhanced Error/Info Message */}
        {availableStyles.length === 0 && (
          <View style={styles.noStylesContainer}>
            <Ionicons name="information-circle-outline" size={48} color={tokens.color.textMuted} />
            <Text style={styles.noStylesTitle}>No Styles Available</Text>
            <Text style={styles.noStylesMessage}>
              No compatible styles found for {currentSpaceType.replace('_', ' ')}. 
              Please try selecting a different space type.
            </Text>
          </View>
        )}

        {/* Style Grid */}
        <View style={styles.stylesGrid}>
          {availableStyles.map((style, index) => {
            const isSelected = selectedStyle === style.id;
            
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleGridCard,
                  isSelected && styles.styleGridCardSelected
                ]}
                onPress={() => setSelectedStyle(style.id)}
                activeOpacity={0.8}
              >
                {/* Card Background */}
                <LinearGradient
                  colors={isSelected ? 
                    [tokens.color.brandLight, tokens.color.brand] : 
                    [tokens.color.surface, '#F8F6F2']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gridCardGradient}
                >
                  {/* Selection Indicator */}
                  <View style={styles.gridCardHeader}>
                    {style.popularity >= 85 && (
                      <View style={[
                        styles.popularBadge,
                        isSelected && styles.popularBadgeSelected
                      ]}>
                        <Text style={[
                          styles.popularBadgeText,
                          isSelected && styles.popularBadgeTextSelected
                        ]}>
                          Popular
                        </Text>
                      </View>
                    )}
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={tokens.color.textInverse} 
                      />
                    )}
                  </View>

                  {/* Style Icon and Color Preview */}
                  <View style={styles.gridCardCenter}>
                    <View style={[
                      styles.gridCardIcon,
                      isSelected && styles.gridCardIconSelected
                    ]}>
                      <Ionicons 
                        name={style.icon as any} 
                        size={24} 
                        color={isSelected ? tokens.color.textInverse : tokens.color.brand} 
                      />
                    </View>
                    
                    {/* Color Preview Dots */}
                    <View style={styles.colorPreview}>
                      {style.previewColors.slice(0, 3).map((color, colorIndex) => (
                        <View 
                          key={colorIndex}
                          style={[
                            styles.colorDot,
                            { backgroundColor: color }
                          ]} 
                        />
                      ))}
                    </View>
                  </View>

                  {/* Style Info */}
                  <View style={styles.gridCardContent}>
                    <Text style={[
                      styles.gridStyleName,
                      isSelected && styles.gridStyleNameSelected
                    ]}>
                      {style.name}
                    </Text>

                    <Text style={[
                      styles.gridStyleDescription,
                      isSelected && styles.gridStyleDescriptionSelected
                    ]}>
                      {style.description.split('.')[0]} {/* First sentence only */}
                    </Text>

                    <Text style={[
                      styles.gridStyleCompatibility,
                      isSelected && styles.gridStyleCompatibilitySelected
                    ]}>
                      {getCompatibilityText(style)}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.fixedBottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.continueButtonContainer,
            !selectedStyle && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={tokens.components.button.primary.pressedOpacity}
          disabled={!selectedStyle}
        >
          <LinearGradient
            colors={selectedStyle ? 
              tokens.components.button.primary.gradientColors : 
              [tokens.color.borderSoft, tokens.color.textMuted]
            }
            start={tokens.components.button.primary.gradientStart}
            end={tokens.components.button.primary.gradientEnd}
            style={styles.continueButton}
          >
            <Text style={[
              styles.buttonText,
              { color: selectedStyle ? tokens.components.button.primary.textColor : tokens.color.textSecondary }
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={selectedStyle ? tokens.components.button.primary.textColor : tokens.color.textSecondary}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: tokens.typography.h2.fontSize,
    lineHeight: tokens.typography.h2.lineHeight,
    fontWeight: tokens.typography.h2.fontWeight as any,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.color.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  projectInfo: {
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  designingFor: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight as any,
    color: tokens.color.textPrimary,
    marginBottom: 4,
  },
  roomType: {
    fontSize: tokens.typography.body.fontSize,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.lg,
  },
  spacesLabel: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight as any,
    color: tokens.color.textPrimary,
    marginBottom: 4,
  },
  popularLabel: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.md,
  },
  allStylesLabel: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight as any,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  stylesContainer: {
    paddingHorizontal: tokens.spacing.xl,
  },
  styleCard: {
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.lg,
    overflow: 'hidden',
    ...tokens.shadow.e1,
  },
  styleCardSelected: {
    ...tokens.shadow.e3,
    shadowColor: tokens.color.brand,
  },
  cardGradient: {
    flex: 1,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: tokens.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.sm,
  },
  popularTag: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.color.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  popularTagSelected: {
    color: tokens.color.textInverse,
  },
  styleName: {
    fontSize: tokens.typography.h3.fontSize,
    fontWeight: tokens.typography.h3.fontWeight as any,
    color: tokens.color.textPrimary,
    marginBottom: 2,
  },
  styleNameSelected: {
    color: tokens.color.textInverse,
  },
  styleSubtitle: {
    fontSize: tokens.typography.small.fontSize,
    fontWeight: '500',
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.sm,
  },
  styleSubtitleSelected: {
    color: tokens.color.textInverse,
    opacity: 0.9,
  },
  styleDescription: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.color.textMuted,
    lineHeight: tokens.typography.small.lineHeight,
    marginBottom: tokens.spacing.sm,
  },
  styleDescriptionSelected: {
    color: tokens.color.textInverse,
    opacity: 0.9,
  },
  styleCompatibility: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.color.textSecondary,
    fontWeight: '500',
  },
  styleCompatibilitySelected: {
    color: tokens.color.textInverse,
    opacity: 0.9,
  },
  continueText: {
    fontSize: tokens.typography.small.fontSize,
    color: tokens.color.textInverse,
    fontWeight: '600',
    marginTop: tokens.spacing.sm,
    opacity: 0.9,
  },
  iconContainer: {
    paddingRight: tokens.spacing.lg,
    paddingLeft: tokens.spacing.md,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 20,
  },
  continueButtonContainer: {
    borderRadius: tokens.components.button.primary.borderRadius,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButton: {
    height: tokens.components.button.primary.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  buttonText: {
    fontSize: tokens.components.button.primary.fontSize,
    fontWeight: tokens.components.button.primary.fontWeight as any,
  },
  
  // New Grid Layout Styles
  noStylesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noStylesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noStylesMessage: {
    fontSize: 16,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: tokens.spacing.lg,
    justifyContent: 'space-between',
  },
  styleGridCard: {
    width: (width - 60) / 2, // 2 columns with spacing
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  styleGridCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  gridCardGradient: {
    padding: 12,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  popularBadge: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.color.brand,
  },
  popularBadgeTextSelected: {
    color: tokens.color.textInverse,
  },
  gridCardCenter: {
    alignItems: 'center',
    marginVertical: 8,
  },
  gridCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCardIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  gridCardContent: {
    alignItems: 'center',
  },
  gridStyleName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  gridStyleNameSelected: {
    color: tokens.color.textInverse,
  },
  gridStyleDescription: {
    fontSize: 11,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  gridStyleDescriptionSelected: {
    color: 'rgba(253, 251, 247, 0.9)',
  },
  gridStyleCompatibility: {
    fontSize: 10,
    color: tokens.color.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  gridStyleCompatibilitySelected: {
    color: 'rgba(253, 251, 247, 0.7)',
  },
});

export default StyleSelectionScreen;