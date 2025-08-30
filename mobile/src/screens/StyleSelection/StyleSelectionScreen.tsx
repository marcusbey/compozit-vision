import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

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

interface StyleOption {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  compatibility: string;
}

const styleOptions: StyleOption[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    subtitle: 'Beautiful Design',
    description: 'Less is more philosophy with clean, uncluttered spaces',
    icon: 'square-outline',
    compatibility: '90% space compatibility'
  },
  {
    id: 'modern',
    name: 'Modern',
    subtitle: 'Beautiful Design', 
    description: 'Clean lines, minimalist approach, and contemporary elements',
    icon: 'triangle-outline',
    compatibility: '80% space compatibility'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    subtitle: 'Beautiful Design',
    description: 'Light woods, neutral colors, and functional design',
    icon: 'home-outline',
    compatibility: '85% space compatibility'
  },
  {
    id: 'traditional',
    name: 'Traditional',
    subtitle: 'Beautiful Design',
    description: 'Classic elegance with timeless furniture and warm colors',
    icon: 'library-outline',
    compatibility: '75% space compatibility'
  }
];

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const { projectName, roomType } = route.params || {};

  const handleContinue = () => {
    if (selectedStyle) {
      NavigationHelpers.navigateToScreen('referencesColors', {
        projectName,
        roomType,
        selectedStyle,
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
          <Text style={styles.headerSubtitle}>Step 3 of 6</Text>
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
          <Text style={styles.roomType}>{roomType || 'Balcony'}</Text>
          <Text style={styles.spacesLabel}>For Your Spaces</Text>
          <Text style={styles.popularLabel}>Popular</Text>
          <Text style={styles.allStylesLabel}>All Styles</Text>
        </View>

        {/* Style Cards */}
        <View style={styles.stylesContainer}>
          {styleOptions.map((style, index) => {
            const isSelected = selectedStyle === style.id;
            
            return (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  isSelected && styles.styleCardSelected
                ]}
                onPress={() => setSelectedStyle(style.id)}
                activeOpacity={0.9}
              >
                {/* Card Background */}
                <LinearGradient
                  colors={isSelected ? 
                    [tokens.color.brandLight, tokens.color.brand] : 
                    [tokens.color.surface, tokens.color.bgSecondary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={[
                        styles.popularTag,
                        isSelected && styles.popularTagSelected
                      ]}>
                        Popular
                      </Text>
                      {isSelected && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={24} 
                          color={tokens.color.textInverse} 
                        />
                      )}
                    </View>

                    <Text style={[
                      styles.styleName,
                      isSelected && styles.styleNameSelected
                    ]}>
                      {style.name}
                    </Text>

                    <Text style={[
                      styles.styleSubtitle,
                      isSelected && styles.styleSubtitleSelected
                    ]}>
                      {style.subtitle}
                    </Text>

                    <Text style={[
                      styles.styleDescription,
                      isSelected && styles.styleDescriptionSelected
                    ]}>
                      {style.description}
                    </Text>

                    <Text style={[
                      styles.styleCompatibility,
                      isSelected && styles.styleCompatibilitySelected
                    ]}>
                      {style.compatibility}
                    </Text>

                    {isSelected && (
                      <Text style={styles.continueText}>
                        Continue to References & Colors
                      </Text>
                    )}
                  </View>

                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <Ionicons 
                      name={style.icon} 
                      size={32} 
                      color={isSelected ? tokens.color.textInverse : tokens.color.textSecondary} 
                    />
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
});

export default StyleSelectionScreen;