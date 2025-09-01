import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { supabase } from '../../services/supabase';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { ValidationErrorDisplay } from '../../components/ValidationErrorDisplay';
import type { SpaceDefinitionValidationData } from '../../types/validation';

// Import design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textMuted: "#9A9A9A",
    textInverse: "#FDFBF7",
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

// Room/Space interface based on database
interface Space {
  slug: string;
  name: string;
  category_type: string;
  icon_name: string;
  description?: string;
  is_primary?: boolean;
  compatibility_score?: number;
  estimated_area?: number;
  typical_features?: string[];
}

// Predefined spaces by category type
const SPACES_BY_CATEGORY: Record<string, Space[]> = {
  interior: [
    { slug: 'living-room', name: 'Living Room', category_type: 'interior', icon_name: 'tv', description: 'Main gathering space', is_primary: true },
    { slug: 'bedroom', name: 'Bedroom', category_type: 'interior', icon_name: 'bed', description: 'Personal retreat', is_primary: true },
    { slug: 'kitchen', name: 'Kitchen', category_type: 'interior', icon_name: 'restaurant', description: 'Culinary workspace' },
    { slug: 'dining-room', name: 'Dining Room', category_type: 'interior', icon_name: 'wine', description: 'Formal dining area' },
    { slug: 'bathroom', name: 'Bathroom', category_type: 'interior', icon_name: 'water', description: 'Essential facilities' },
    { slug: 'home-office', name: 'Home Office', category_type: 'interior', icon_name: 'laptop', description: 'Work from home space' },
    { slug: 'kids-room', name: "Kids' Room", category_type: 'interior', icon_name: 'color-palette', description: 'Children\'s bedroom' },
    { slug: 'guest-room', name: 'Guest Room', category_type: 'interior', icon_name: 'people', description: 'Visitor accommodation' },
    { slug: 'hallway', name: 'Hallway', category_type: 'interior', icon_name: 'arrow-forward', description: 'Connecting spaces' },
    { slug: 'closet', name: 'Walk-in Closet', category_type: 'interior', icon_name: 'shirt', description: 'Storage space' },
    { slug: 'basement', name: 'Basement', category_type: 'interior', icon_name: 'cube', description: 'Lower level space' },
    { slug: 'attic', name: 'Attic', category_type: 'interior', icon_name: 'triangle', description: 'Upper storage area' },
  ],
  garden: [
    { slug: 'front-yard', name: 'Front Yard', category_type: 'garden', icon_name: 'home', description: 'Curb appeal area', is_primary: true },
    { slug: 'backyard', name: 'Backyard', category_type: 'garden', icon_name: 'sunny', description: 'Private outdoor space', is_primary: true },
    { slug: 'patio', name: 'Patio', category_type: 'garden', icon_name: 'grid', description: 'Outdoor living area' },
    { slug: 'deck', name: 'Deck', category_type: 'garden', icon_name: 'layers', description: 'Raised platform area' },
    { slug: 'garden-beds', name: 'Garden Beds', category_type: 'garden', icon_name: 'flower', description: 'Planting areas' },
    { slug: 'lawn', name: 'Lawn', category_type: 'garden', icon_name: 'leaf', description: 'Grass areas' },
    { slug: 'pool-area', name: 'Pool Area', category_type: 'garden', icon_name: 'water', description: 'Swimming pool surrounds' },
    { slug: 'balcony', name: 'Balcony', category_type: 'garden', icon_name: 'square', description: 'Elevated outdoor space' },
    { slug: 'terrace', name: 'Terrace', category_type: 'garden', icon_name: 'layers', description: 'Outdoor platform' },
    { slug: 'greenhouse', name: 'Greenhouse', category_type: 'garden', icon_name: 'leaf', description: 'Protected growing area' },
  ],
  surface: [
    { slug: 'accent-wall', name: 'Accent Wall', category_type: 'surface', icon_name: 'square', description: 'Feature wall', is_primary: true },
    { slug: 'kitchen-backsplash', name: 'Kitchen Backsplash', category_type: 'surface', icon_name: 'apps', description: 'Wall protection' },
    { slug: 'bathroom-tiles', name: 'Bathroom Tiles', category_type: 'surface', icon_name: 'grid', description: 'Wet area surfaces' },
    { slug: 'flooring', name: 'Flooring', category_type: 'surface', icon_name: 'layers', description: 'Floor surfaces' },
    { slug: 'ceiling', name: 'Ceiling', category_type: 'surface', icon_name: 'arrow-up', description: 'Overhead surface' },
    { slug: 'fireplace', name: 'Fireplace Surround', category_type: 'surface', icon_name: 'flame', description: 'Fireplace area' },
  ],
  object: [
    { slug: 'bookshelf', name: 'Bookshelf', category_type: 'object', icon_name: 'library', description: 'Book display', is_primary: true },
    { slug: 'mantel', name: 'Mantel', category_type: 'object', icon_name: 'square', description: 'Fireplace shelf' },
    { slug: 'console', name: 'Console Table', category_type: 'object', icon_name: 'desktop', description: 'Entry table' },
    { slug: 'gallery-wall', name: 'Gallery Wall', category_type: 'object', icon_name: 'images', description: 'Art display' },
    { slug: 'shelving', name: 'Open Shelving', category_type: 'object', icon_name: 'reorder-three', description: 'Display shelves' },
  ],
  exterior: [
    { slug: 'front-entrance', name: 'Front Entrance', category_type: 'exterior', icon_name: 'home', description: 'Main entry', is_primary: true },
    { slug: 'facade', name: 'House Facade', category_type: 'exterior', icon_name: 'business', description: 'Front exterior' },
    { slug: 'garage', name: 'Garage', category_type: 'exterior', icon_name: 'car', description: 'Vehicle storage' },
    { slug: 'driveway', name: 'Driveway', category_type: 'exterior', icon_name: 'trail-sign', description: 'Vehicle access' },
    { slug: 'porch', name: 'Porch', category_type: 'exterior', icon_name: 'home', description: 'Covered entrance' },
  ],
};

interface SpaceDefinitionScreenProps {
  navigation?: any;
  route?: any;
}

const SpaceDefinitionScreen: React.FC<SpaceDefinitionScreenProps> = ({ navigation, route }) => {
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [availableSpaces, setAvailableSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAreaInput, setShowAreaInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();
  
  // Initialize validation for this step
  const validation = useWizardValidation({
    stepId: 'spaceDefinition',
    autoValidate: false,
    validateOnMount: false
  });
  const { projectWizard } = journeyStore;

  useEffect(() => {
    // Load spaces based on selected category
    loadSpacesForCategory();
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadSpacesForCategory = async () => {
    try {
      setLoading(true);
      const categoryType = projectWizard.categoryType || 'interior';
      
      // Try to load from database first
      const { data: categoryMappings, error } = await supabase
        .from('category_room_mappings')
        .select('*')
        .eq('category_id', projectWizard.categoryId)
        .order('is_primary_match', { ascending: false })
        .order('compatibility_score', { ascending: false });

      if (!error && categoryMappings && categoryMappings.length > 0) {
        // Transform database mappings to Space objects
        const spaces: Space[] = categoryMappings.map(mapping => ({
          slug: mapping.room_slug,
          name: mapping.room_name,
          category_type: categoryType,
          icon_name: getIconForRoom(mapping.room_slug),
          is_primary: mapping.is_primary_match,
          compatibility_score: mapping.compatibility_score,
        }));
        setAvailableSpaces(spaces);
      } else {
        // Fallback to predefined spaces
        const spaces = SPACES_BY_CATEGORY[categoryType] || SPACES_BY_CATEGORY.interior;
        setAvailableSpaces(spaces);
      }

      // Restore previously selected spaces if any
      if (projectWizard.selectedRooms && projectWizard.selectedRooms.length > 0) {
        setSelectedSpaces(projectWizard.selectedRooms);
      }
    } catch (error) {
      console.error('Error loading spaces:', error);
      // Use fallback spaces
      const categoryType = projectWizard.categoryType || 'interior';
      const spaces = SPACES_BY_CATEGORY[categoryType] || SPACES_BY_CATEGORY.interior;
      setAvailableSpaces(spaces);
    } finally {
      setLoading(false);
    }
  };

  const getIconForRoom = (roomSlug: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'living-room': 'tv',
      'bedroom': 'bed',
      'kitchen': 'restaurant',
      'dining-room': 'wine',
      'bathroom': 'water',
      'home-office': 'laptop',
      'kids-room': 'color-palette',
      'guest-room': 'people',
      'hallway': 'arrow-forward',
      'closet': 'shirt',
      'basement': 'cube',
      'attic': 'triangle',
      'front-yard': 'home',
      'backyard': 'sunny',
      'patio': 'grid',
      'deck': 'layers',
      'garden-beds': 'flower',
      'lawn': 'leaf',
      'pool-area': 'water',
      'accent-wall': 'square',
      'bookshelf': 'library',
    };
    return iconMap[roomSlug] || 'square';
  };

  const handleSpaceToggle = (spaceSlug: string) => {
    setSelectedSpaces(prev => {
      if (prev.includes(spaceSlug)) {
        return prev.filter(s => s !== spaceSlug);
      } else {
        return [...prev, spaceSlug];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedSpaces.length === 0) {
      Alert.alert(
        'No Spaces Selected',
        'Please select at least one space to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Prepare validation data
      const validationData: SpaceDefinitionValidationData = {
        roomType: selectedSpaces[0], // Primary room
        dimensions: undefined, // Could be enhanced with actual dimensions input
        spaceCharacteristics: selectedSpaces,
        lighting: undefined,
        existingFeatures: []
      };
      
      // Validate before proceeding
      const result = await validation.validateStep(validationData, 'onSubmit');
      
      if (result.isValid) {
        // Get space names for selected spaces
        const selectedSpaceNames = selectedSpaces.map(slug => {
          const space = availableSpaces.find(s => s.slug === slug);
          return space?.name || slug;
        });

        // Update journey store with selected spaces
        journeyStore.updateProjectWizard({
          selectedRooms: selectedSpaces,
          roomName: selectedSpaceNames.join(', '),
          currentWizardStep: 'style_selection',
        });

        // Navigate to style selection (step 4 of 10)
        NavigationHelpers.navigateToScreen('styleSelection');
      } else {
        console.log('❌ Space definition validation failed:', result.errors);
      }
    } catch (error) {
      console.error('❌ Validation error:', error);
      Alert.alert('Validation Error', 'Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleBack = () => {
    NavigationHelpers.goBack();
  };

  const getCategoryColor = () => {
    const colors = {
      interior: tokens.color.brand,
      garden: '#7FB069',
      surface: '#D4A574',
      object: '#E07A5F',
      exterior: '#264653',
    };
    return colors[projectWizard.categoryType || 'interior'] || tokens.color.brand;
  };

  const getPrimarySpaces = () => availableSpaces.filter(s => s.is_primary);
  const getSecondarySpaces = () => availableSpaces.filter(s => !s.is_primary);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading spaces...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Select Your Spaces</Text>
            <Text style={styles.headerSubtitle}>Choose all areas you'd like to design</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '30%', backgroundColor: getCategoryColor() }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 10</Text>
        </View>

        {/* Category Reminder */}
        <View style={[styles.categoryReminder, { borderColor: getCategoryColor() }]}>
          <Ionicons name="information-circle" size={20} color={getCategoryColor()} />
          <Text style={styles.categoryReminderText}>
            {projectWizard.categoryName} • {selectedSpaces.length} space{selectedSpaces.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Primary Spaces */}
            {getPrimarySpaces().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Primary Spaces</Text>
                <Text style={styles.sectionDescription}>Most common spaces for {projectWizard.categoryName?.toLowerCase()}</Text>
                
                <View style={styles.spacesGrid}>
                  {getPrimarySpaces().map((space) => (
                    <TouchableOpacity
                      key={space.slug}
                      style={[
                        styles.spaceCard,
                        selectedSpaces.includes(space.slug) && [
                          styles.selectedSpaceCard,
                          { borderColor: getCategoryColor() }
                        ]
                      ]}
                      onPress={() => handleSpaceToggle(space.slug)}
                      activeOpacity={0.9}
                    >
                      <View style={[
                        styles.spaceIcon,
                        selectedSpaces.includes(space.slug) && {
                          backgroundColor: getCategoryColor() + '15'
                        }
                      ]}>
                        <Ionicons 
                          name={getIconForRoom(space.slug)} 
                          size={28} 
                          color={selectedSpaces.includes(space.slug) ? getCategoryColor() : tokens.color.textSecondary} 
                        />
                      </View>
                      
                      <Text style={[
                        styles.spaceName,
                        selectedSpaces.includes(space.slug) && styles.selectedSpaceName
                      ]}>
                        {space.name}
                      </Text>
                      
                      {space.description && (
                        <Text style={styles.spaceDescription}>
                          {space.description}
                        </Text>
                      )}

                      {selectedSpaces.includes(space.slug) && (
                        <View style={[styles.selectedIndicator, { backgroundColor: getCategoryColor() }]}>
                          <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Secondary Spaces */}
            {getSecondarySpaces().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Spaces</Text>
                <Text style={styles.sectionDescription}>Other areas you might want to include</Text>
                
                <View style={styles.spacesGrid}>
                  {getSecondarySpaces().map((space) => (
                    <TouchableOpacity
                      key={space.slug}
                      style={[
                        styles.spaceCard,
                        styles.secondarySpaceCard,
                        selectedSpaces.includes(space.slug) && [
                          styles.selectedSpaceCard,
                          { borderColor: getCategoryColor() }
                        ]
                      ]}
                      onPress={() => handleSpaceToggle(space.slug)}
                      activeOpacity={0.9}
                    >
                      <View style={[
                        styles.spaceIcon,
                        styles.secondarySpaceIcon,
                        selectedSpaces.includes(space.slug) && {
                          backgroundColor: getCategoryColor() + '15'
                        }
                      ]}>
                        <Ionicons 
                          name={getIconForRoom(space.slug)} 
                          size={24} 
                          color={selectedSpaces.includes(space.slug) ? getCategoryColor() : tokens.color.textMuted} 
                        />
                      </View>
                      
                      <Text style={[
                        styles.spaceName,
                        styles.secondarySpaceName,
                        selectedSpaces.includes(space.slug) && styles.selectedSpaceName
                      ]}>
                        {space.name}
                      </Text>

                      {selectedSpaces.includes(space.slug) && (
                        <View style={[styles.selectedIndicator, { backgroundColor: getCategoryColor() }]}>
                          <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Ionicons name="bulb" size={20} color={tokens.color.brand} />
              <Text style={styles.tipsText}>
                Select multiple spaces to create a cohesive design across your entire project
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedSpaces.length === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={selectedSpaces.length === 0}
          >
            <LinearGradient
              colors={selectedSpaces.length === 0
                ? [tokens.color.borderSoft, tokens.color.borderSoft] 
                : [getCategoryColor(), getCategoryColor() + 'DD']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                selectedSpaces.length === 0 && styles.continueButtonTextDisabled
              ]}>
                Continue to Style Selection
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={selectedSpaces.length === 0 ? tokens.color.textMuted : tokens.color.textInverse}
                style={styles.continueButtonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.color.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  categoryReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    ...tokens.shadow.e1,
  },
  categoryReminderText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    marginLeft: tokens.spacing.sm,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  section: {
    marginBottom: tokens.spacing.xxl,
  },
  sectionTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  sectionDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    marginBottom: tokens.spacing.lg,
  },
  spacesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -tokens.spacing.sm,
  },
  spaceCard: {
    width: (width - tokens.spacing.xl * 2 - tokens.spacing.md * 2) / 2,
    marginHorizontal: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  secondarySpaceCard: {
    padding: tokens.spacing.md,
  },
  selectedSpaceCard: {
    backgroundColor: tokens.color.surface,
  },
  spaceIcon: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  secondarySpaceIcon: {
    width: 44,
    height: 44,
  },
  spaceName: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  secondarySpaceName: {
    fontSize: 14,
  },
  selectedSpaceName: {
    fontWeight: '600',
  },
  spaceDescription: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.xs,
  },
  selectedIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.color.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    marginTop: tokens.spacing.lg,
  },
  tipsText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    marginLeft: tokens.spacing.md,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingTop: tokens.spacing.xl,
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    height: 52,
  },
  continueButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  continueButtonTextDisabled: {
    color: tokens.color.textMuted,
  },
  continueButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
});

export default SpaceDefinitionScreen;