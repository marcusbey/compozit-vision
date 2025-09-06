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
import { tokens } from '../../theme';

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
          <ActivityIndicator size="large" color={tokens.colors.primary.DEFAULT} />
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
              colors={[tokens.colors.primary.DEFAULT + '20', tokens.colors.primary.DEFAULT + '10']}
              style={styles.emptyIconBackground}
            >
              <Ionicons name="images-outline" size={80} color={tokens.colors.primary.DEFAULT} />
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
                colors={[tokens.colors.primary.DEFAULT, tokens.colors.primary.dark]}
                style={styles.uploadButtonGradient}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={tokens.colors.text.inverse} />
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
              <Ionicons name="funnel-outline" size={16} color={tokens.colors.text.primary} />
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
                      <Ionicons name="checkmark" size={16} color={tokens.colors.text.inverse} />
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
                    color={isFavorite ? tokens.colors.status.warning : tokens.colors.background.secondary} 
                  />
                </TouchableOpacity>
                
                {/* User upload indicator */}
                {isUserImage && (
                  <View style={styles.userIndicator}>
                    <Ionicons name="person-circle" size={16} color={tokens.colors.text.inverse} />
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
        colors={[tokens.colors.background.primary, tokens.colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => NavigationHelpers.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
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
            <Ionicons name="add" size={24} color={tokens.colors.primary.DEFAULT} />
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
              <Ionicons name="arrow-forward" size={20} color={tokens.colors.text.inverse} />
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
                <Ionicons name="arrow-forward" size={20} color={tokens.colors.text.primary} />
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
    backgroundColor: tokens.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  backButton: {
    padding: tokens.spacing.sm,
    marginRight: tokens.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...tokens.typography.heading.h2,
    color: tokens.colors.text.primary,
  },
  headerSubtitle: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  uploadHeaderButton: {
    padding: tokens.spacing.sm,
  },
  filterContainer: {
    backgroundColor: tokens.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
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
    backgroundColor: tokens.colors.background.secondary,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.borderRadius.xxl,
    borderWidth: 1.5,
    borderColor: tokens.colors.border.light,
    marginRight: tokens.spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.elevation2,
  },
  filterChipActive: {
    backgroundColor: tokens.colors.primary.DEFAULT,
    borderColor: tokens.colors.primary.DEFAULT,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  filterChipText: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: tokens.colors.text.inverse,
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
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: tokens.colors.background.secondary,
    ...tokens.shadows.elevation2,
  },
  imageSelected: {
    borderWidth: 3,
    borderColor: tokens.colors.primary.DEFAULT,
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
    backgroundColor: tokens.colors.primary.DEFAULT,
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
    ...tokens.typography.small,
    color: tokens.colors.text.inverse,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  loadingText: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
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
    ...tokens.shadows.elevation2,
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: tokens.spacing.xxl,
  },
  emptyTitle: {
    ...tokens.typography.heading.h1,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...tokens.typography.body,
    color: tokens.colors.text.secondary,
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
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    ...tokens.shadows.elevation2,
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
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.inverse,
    fontWeight: '600',
  },
  secondaryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 1.5,
    borderColor: tokens.colors.text.primary,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.lg,
    gap: tokens.spacing.xs,
    minWidth: 140,
  },
  secondaryFilterButtonText: {
    ...tokens.typography.small,
    color: tokens.colors.text.primary,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.text.primary,
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    gap: tokens.spacing.sm,
    ...tokens.shadows.elevation2,
  },
  continueButtonText: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.inverse,
  },
  skipContainer: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  skipText: {
    ...tokens.typography.small,
    color: tokens.colors.text.secondary,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    borderWidth: 2,
    borderColor: tokens.colors.text.primary,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.lg,
    gap: tokens.spacing.sm,
  },
  skipButtonText: {
    ...tokens.typography.heading.h3,
    color: tokens.colors.text.primary,
  },
});

export default ReferenceImagesScreen;