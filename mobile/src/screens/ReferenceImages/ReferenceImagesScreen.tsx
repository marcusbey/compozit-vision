import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Import stores and services
import { useContentStore } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Types
interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'style' | 'room' | 'mood';
}

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = (screenWidth - 48) / 2; // 2 columns with padding
const imageHeight = imageWidth * 1.2; // Pinterest-like aspect ratio

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#22C55E",
    warning: "#F59E0B",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  shadow: {
    e2: { 
      shadowColor: "#000", 
      shadowOpacity: 0.08, 
      shadowRadius: 12, 
      shadowOffset: { width: 0, height: 4 }, 
      elevation: 4 
    },
  },
  type: {
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
};

export const ReferenceImagesScreen: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Store data
  const {
    referenceImages,
    userReferences,
    styles: designStyles,
    loading,
    errors,
    loadReferenceImages,
    loadUserReferences,
    loadStyles,
    uploadReferenceImage,
    toggleReferenceSelection,
    toggleReferenceFavorite,
  } = useContentStore();

  // Filter options based on loaded styles and common room types
  const filterOptions: FilterChip[] = [
    // Style filters
    ...designStyles.slice(0, 6).map(style => ({
      id: `style-${style.id}`,
      label: style.display_name,
      value: style.id,
      type: 'style' as const
    })),
    // Room filters
    { id: 'room-living', label: 'Living Room', value: 'living_room', type: 'room' },
    { id: 'room-bedroom', label: 'Bedroom', value: 'bedroom', type: 'room' },
    { id: 'room-kitchen', label: 'Kitchen', value: 'kitchen', type: 'room' },
    { id: 'room-bathroom', label: 'Bathroom', value: 'bathroom', type: 'room' },
    // Mood filters
    { id: 'mood-cozy', label: 'Cozy', value: 'cozy', type: 'mood' },
    { id: 'mood-elegant', label: 'Elegant', value: 'elegant', type: 'mood' },
    { id: 'mood-modern', label: 'Modern', value: 'modern', type: 'mood' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadReferenceImages({ featured: true }),
        loadUserReferences(),
        loadStyles(),
      ]);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const isActive = prev.includes(filterId);
      const newFilters = isActive 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId];
      
      // Apply filters
      applyFilters(newFilters);
      return newFilters;
    });
  };

  const applyFilters = async (filters: string[]) => {
    const styleFilters = filters.filter(f => f.startsWith('style-')).map(f => f.replace('style-', ''));
    const roomFilters = filters.filter(f => f.startsWith('room-')).map(f => f.replace('room-', ''));
    
    // Load filtered reference images
    await loadReferenceImages({
      styleId: styleFilters[0], // Use first style filter
      roomId: roomFilters[0],   // Use first room filter
      featured: filters.length === 0 // Show featured when no filters
    });
  };

  const handleImageUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadReferenceImage(imageUri, {
          title: 'My Reference Image',
          description: 'User uploaded reference',
          tags: ['user-upload']
        });
        
        Alert.alert('Success', 'Reference image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleImageSelect = (imageId: string) => {
    toggleReferenceSelection(imageId);
    setSelectedImages(prev => {
      const isSelected = prev.includes(imageId);
      return isSelected
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId];
    });
  };

  const handleContinue = () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Selection', 'Please select at least one reference image to continue.');
      return;
    }
    
    // Navigate to color palettes screen
    NavigationHelpers.navigateToScreen('colorPalettes');
  };

  const handleSkip = () => {
    // Skip directly to color palettes
    NavigationHelpers.navigateToScreen('colorPalettes');
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive
              ]}
              onPress={() => toggleFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderImageGrid = () => {
    const allImages = [...userReferences, ...referenceImages];
    
    if (loading.references || loading.userReferences) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.color.brand} />
          <Text style={styles.loadingText}>Loading reference images...</Text>
        </View>
      );
    }

    if (allImages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          {/* Enhanced empty state illustration */}
          <View style={styles.emptyIllustration}>
            <LinearGradient
              colors={[tokens.color.brand + '20', tokens.color.brand + '10']}
              style={styles.emptyIconBackground}
            >
              <Ionicons name="images-outline" size={80} color={tokens.color.brand} />
            </LinearGradient>
          </View>
          
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>No Reference Images</Text>
            <Text style={styles.emptySubtitle}>
              Upload your own images or adjust filters above to discover Pinterest-style inspiration for your design
            </Text>
          </View>
          
          {/* Enhanced action buttons */}
          <View style={styles.emptyActions}>
            <TouchableOpacity 
              style={styles.primaryUploadButton}
              onPress={handleImageUpload}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[tokens.color.brand, tokens.color.brandHover]}
                style={styles.uploadButtonGradient}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={tokens.color.textInverse} />
                <Text style={styles.primaryUploadButtonText}>Upload Your Image</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryFilterButton}
              onPress={() => {
                // Reset filters to show all images
                setActiveFilters([]);
                applyFilters([]);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="funnel-outline" size={16} color={tokens.color.accent} />
              <Text style={styles.secondaryFilterButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.gridContainer}>
        {allImages.map((image, index) => {
          const isSelected = selectedImages.includes(image.id);
          const isUserImage = 'user_title' in image; // Type guard
          const isFavorite = isUserImage ? (image as any).is_favorite : false;
          
          return (
            <TouchableOpacity
              key={image.id}
              style={[
                styles.imageCard,
                { marginRight: index % 2 === 0 ? tokens.spacing.md : 0 }
              ]}
              onPress={() => handleImageSelect(image.id)}
              activeOpacity={0.9}
            >
              <View style={[styles.imageContainer, isSelected && styles.imageSelected]}>
                <Image 
                  source={{ uri: image.thumbnail_url || image.image_url }} 
                  style={styles.image}
                  resizeMode="cover"
                />
                
                {/* Selection indicator */}
                {isSelected && (
                  <View style={styles.selectionOverlay}>
                    <View style={styles.selectionIndicator}>
                      <Ionicons name="checkmark" size={16} color={tokens.color.textInverse} />
                    </View>
                  </View>
                )}
                
                {/* Favorite button */}
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent triggering image selection
                    if (isUserImage) {
                      toggleReferenceFavorite(image.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite ? tokens.color.warning : tokens.color.surface} 
                  />
                </TouchableOpacity>
                
                {/* User upload indicator */}
                {isUserImage && (
                  <View style={styles.userIndicator}>
                    <Ionicons name="person-circle" size={16} color={tokens.color.textInverse} />
                  </View>
                )}
                
                {/* Image info overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                >
                  <Text style={styles.imageTitle} numberOfLines={2}>
                    {isUserImage 
                      ? (image as any).user_title || (image as any).original_filename
                      : (image as any).title || 'Reference Image'
                    }
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

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
            <Text style={styles.headerTitle}>Reference Images</Text>
            <Text style={styles.headerSubtitle}>
              {selectedImages.length} selected • Pinterest-style inspiration
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.uploadHeaderButton}
            onPress={handleImageUpload}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={tokens.color.brand} />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        {renderFilterChips()}

        {/* Image grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderImageGrid()}
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.bottomContainer}>
          {selectedImages.length > 0 ? (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={tokens.color.textInverse} />
            </TouchableOpacity>
          ) : (
            <View style={styles.skipContainer}>
              <Text style={styles.skipText}>No images selected</Text>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.9}
              >
                <Text style={styles.skipButtonText}>Skip to Colors</Text>
                <Ionicons name="arrow-forward" size={20} color={tokens.color.accent} />
              </TouchableOpacity>
            </View>
          )}
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
    color: tokens.color.textSecondary,
  },
  uploadHeaderButton: {
    padding: tokens.spacing.sm,
  },
  filterContainer: {
    backgroundColor: tokens.color.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
    paddingVertical: tokens.spacing.md,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingRight: tokens.spacing.xxl, // Extra padding on right for better scrolling
  },
  filterChip: {
    backgroundColor: tokens.color.surface,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.xl,
    borderWidth: 1.5,
    borderColor: tokens.color.borderSoft,
    marginRight: tokens.spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  filterChipActive: {
    backgroundColor: tokens.color.brand,
    borderColor: tokens.color.brand,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  filterChipText: {
    ...tokens.type.small,
    color: tokens.color.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    paddingBottom: 120, // Extra space for continue button
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: imageWidth,
    marginBottom: tokens.spacing.lg,
  },
  imageContainer: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.color.surface,
    ...tokens.shadow.e2,
  },
  imageSelected: {
    borderWidth: 3,
    borderColor: tokens.color.brand,
  },
  image: {
    width: '100%',
    height: imageHeight,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201, 169, 140, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicator: {
    backgroundColor: tokens.color.brand,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: tokens.spacing.sm,
    right: tokens.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  userIndicator: {
    position: 'absolute',
    top: tokens.spacing.sm,
    left: tokens.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: tokens.spacing.md,
  },
  imageTitle: {
    ...tokens.type.small,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    marginTop: tokens.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.xxl,
    minHeight: 400,
  },
  emptyIllustration: {
    marginBottom: tokens.spacing.xxl,
  },
  emptyIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e2,
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  emptyTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  emptyActions: {
    width: '100%',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  primaryUploadButton: {
    width: '100%',
    maxWidth: 280,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  primaryUploadButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  secondaryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1.5,
    borderColor: tokens.color.accent,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.xs,
    minWidth: 140,
  },
  secondaryFilterButtonText: {
    ...tokens.type.small,
    color: tokens.color.accent,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.accent,
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  continueButtonText: {
    ...tokens.type.h3,
    color: tokens.color.textInverse,
  },
  skipContainer: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  skipText: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 2,
    borderColor: tokens.color.accent,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.sm,
  },
  skipButtonText: {
    ...tokens.type.h3,
    color: tokens.color.accent,
  },
});

export default ReferenceImagesScreen;