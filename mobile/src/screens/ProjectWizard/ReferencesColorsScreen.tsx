import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';

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
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

const { width } = Dimensions.get('window');

interface ReferencesColorsScreenProps {
  route?: {
    params?: {
      projectName?: string;
      roomType?: string;
      selectedStyle?: string;
    };
  };
}

export const ReferencesColorsScreen: React.FC<ReferencesColorsScreenProps> = ({ route }) => {
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Store the selected style from route parameters
    if (route?.params?.selectedStyle) {
      const { selectedStyle } = route.params;
      
      // Map style ID to style name
      const styleMapping: Record<string, string> = {
        'minimalist': 'Minimalist',
        'modern': 'Modern',
        'scandinavian': 'Scandinavian',
        'traditional': 'Traditional'
      };
      
      const styleName = styleMapping[selectedStyle] || selectedStyle;
      
      console.log('🎨 Storing selected style from navigation:', {
        styleId: selectedStyle,
        styleName: styleName
      });
      
      // Update the journey store with the selected style
      journeyStore.updateProjectWizard({
        styleId: selectedStyle,
        styleName: styleName,
        currentWizardStep: 'references_palettes'
      });
    }

    // Automatically navigate to the Pinterest-style reference images screen
    const timer = setTimeout(() => {
      NavigationHelpers.navigateToScreen('referenceImages');
    }, 100);

    return () => clearTimeout(timer);
  }, [route?.params?.selectedStyle]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[tokens.color.bgApp, tokens.color.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => NavigationHelpers.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>References & Colors</Text>
            <Text style={styles.headerSubtitle}>Step 5 of 6</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '83%' }]} />
          </View>
          <Text style={styles.progressText}>5/6 Complete</Text>
        </View>

        {/* Main content - redirecting message */}
        <View style={styles.content}>
          <View style={styles.redirectingContainer}>
            <Ionicons name="images" size={64} color={tokens.color.brand} />
            <Text style={styles.redirectingTitle}>Loading Reference Images...</Text>
            <Text style={styles.redirectingSubtitle}>
              Taking you to our Pinterest-style reference collection
            </Text>
          </View>

          {/* Manual navigation buttons (fallback) */}
          <View style={styles.manualButtons}>
            <TouchableOpacity
              style={styles.referenceButton}
              onPress={() => NavigationHelpers.navigateToScreen('referenceImages')}
              activeOpacity={0.9}
            >
              <Ionicons name="images-outline" size={24} color={tokens.color.textInverse} />
              <Text style={styles.buttonText}>Browse Reference Images</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.colorButton}
              onPress={() => NavigationHelpers.navigateToScreen('colorPalettes')}
              activeOpacity={0.9}
            >
              <Ionicons name="color-palette-outline" size={24} color={tokens.color.accent} />
              <Text style={styles.colorButtonText}>View Color Palettes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  backButton: {
    padding: tokens.spacing.sm,
    marginRight: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.color.surface,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  redirectingContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxxl,
  },
  redirectingTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  redirectingSubtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  manualButtons: {
    width: '100%',
    gap: tokens.spacing.lg,
  },
  referenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.accent,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.md,
    ...tokens.shadow.e2,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.accent,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.md,
  },
  buttonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
  },
  colorButtonText: {
    ...tokens.type.h3,
    color: tokens.color.accent,
  },
});

export default ReferencesColorsScreen;