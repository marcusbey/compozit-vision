/**
 * Reference Selection Screen
 * Replaces the old "References & Colors" screen with a Pinterest-style reference picker
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../stores/journeyStore';
import { ReferenceFilteringService } from '../../services/referenceFilteringService';
import { ReferenceImage, UserReferenceService } from '../../data/referencesDatabase';
import { SpaceType } from '../../data/stylesDatabase';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 36) / 2; // 2 columns with margins

const colors = {
  bgApp: '#FBF9F4',
  surface: '#FEFEFE',
  textPrimary: '#2D2B28',
  textSecondary: '#8B7F73',
  textMuted: '#B8AFA4',
  borderSoft: '#E6DDD1',
  brand: '#D4A574',
  brandLight: '#E8C097',
  success: '#4CAF50',
  error: '#E07A5F',
};

interface ReferenceSelectionScreenProps {
  route?: {
    params?: {
      selectedStyle?: string;
      spaceType?: SpaceType;
      projectName?: string;
      roomType?: string;
    };
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.borderSoft,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  infoSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  selectionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgApp,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
    marginLeft: 6,
  },
  noReferencesContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noReferencesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noReferencesMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  noReferencesButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  retryButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.brand,
    borderRadius: 20,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  skipButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brand,
    borderRadius: 20,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  masonryColumn: {
    flex: 1,
    paddingHorizontal: 6,
  },
  masonryItem: {
    marginBottom: 12,
  },
  referenceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  referenceCardSelected: {
    borderWidth: 3,
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.3,
  },
  referenceImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 6,
  },
  imageInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
    marginBottom: 2,
  },
  imageCategory: {
    fontSize: 12,
    color: 'rgba(253, 251, 247, 0.8)',
    textTransform: 'capitalize',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: colors.bgApp,
  },
  continueButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalImageContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: screenWidth - 40,
    maxHeight: '80%',
  },
  modalImage: {
    width: screenWidth - 40,
    height: 300,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.bgApp,
    borderRadius: 12,
  },
  modalTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.brand,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ReferenceSelectionScreen: React.FC<ReferenceSelectionScreenProps> = ({ route }) => {
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<ReferenceImage | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const journeyStore = useJourneyStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { selectedStyle, spaceType } = route?.params || {};
  const currentStyle = selectedStyle || journeyStore.projectWizard?.styleId || 'modern';
  const currentSpaceType = (spaceType || journeyStore.projectWizard?.roomName || 'living_room') as SpaceType;

  useEffect(() => {
    loadReferences();
  }, [currentStyle, currentSpaceType]);

  useEffect(() => {
    // Animate content in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadReferences = async () => {
    try {
      setIsLoading(true);
      
      // Get filtered references (from cache if available)
      const filteredRefs = await ReferenceFilteringService.getFilteredReferences(
        currentStyle,
        currentSpaceType
      );
      
      setReferences(filteredRefs);
      console.log(`📸 Loaded ${filteredRefs.length} references for ${currentStyle} + ${currentSpaceType}`);
    } catch (error) {
      console.error('❌ Failed to load references:', error);
      Alert.alert('Error', 'Failed to load design references. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReferenceSelection = (referenceId: string) => {
    setSelectedReferences(prev => 
      prev.includes(referenceId)
        ? prev.filter(id => id !== referenceId)
        : [...prev, referenceId]
    );
  };

  const toggleFavorite = async (referenceId: string) => {
    const newFavorites = new Set(favorites);
    
    if (favorites.has(referenceId)) {
      newFavorites.delete(referenceId);
      // TODO: Remove from user favorites in backend
    } else {
      newFavorites.add(referenceId);
      // TODO: Add to user favorites in backend
    }
    
    setFavorites(newFavorites);
  };

  const handleImageUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photo library to upload references.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        // TODO: Upload to user references
        console.log('📤 Upload reference image:', result.assets[0].uri);
        Alert.alert('Success', 'Your reference image has been uploaded!');
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleContinue = () => {
    if (selectedReferences.length === 0) {
      Alert.alert(
        'Select References', 
        'Please select at least one design reference to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Store selected references in journey store
    const selectedReferenceData = references.filter(ref => 
      selectedReferences.includes(ref.id)
    );

    journeyStore.updateProjectWizard({
      selectedReferences: selectedReferences,
      currentWizardStep: 'references_palettes'
    });

    console.log('🖼️ References selected:', selectedReferences.length);
    
    // Navigate to color palette selection screen  
    NavigationHelpers.navigateToScreen('colorPaletteSelection', {
      selectedStyle: currentStyle,
      spaceType: currentSpaceType,
      selectedReferences: selectedReferences
    });
  };

  const renderMasonryItem = (reference: ReferenceImage, index: number) => {
    const isSelected = selectedReferences.includes(reference.id);
    const isFavorite = favorites.has(reference.id);
    const cardHeight = Math.round(cardWidth / reference.aspectRatio);
    
    return (
      <Animated.View
        key={reference.id}
        style={[
          styles.masonryItem,
          {
            width: cardWidth,
            height: cardHeight,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.referenceCard,
            isSelected && styles.referenceCardSelected
          ]}
          onPress={() => toggleReferenceSelection(reference.id)}
          onLongPress={() => setPreviewImage(reference)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: reference.thumbnailUrl || reference.imageUrl }}
            style={styles.referenceImage}
            resizeMode="cover"
          />
          
          {/* Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          
          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(reference.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isFavorite ? colors.brand : colors.surface}
            />
          </TouchableOpacity>
          
          {/* Image Info */}
          <View style={styles.imageInfo}>
            <Text style={styles.imageTitle} numberOfLines={1}>
              {reference.title}
            </Text>
            {reference.category && (
              <Text style={styles.imageCategory}>
                {reference.category.replace('-', ' ')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderMasonryGrid = () => {
    const leftColumn: ReferenceImage[] = [];
    const rightColumn: ReferenceImage[] = [];
    
    // Distribute items between columns for masonry effect
    references.forEach((ref, index) => {
      if (index % 2 === 0) {
        leftColumn.push(ref);
      } else {
        rightColumn.push(ref);
      }
    });

    return (
      <View style={styles.masonryContainer}>
        <View style={styles.masonryColumn}>
          {leftColumn.map((ref, index) => renderMasonryItem(ref, index * 2))}
        </View>
        <View style={styles.masonryColumn}>
          {rightColumn.map((ref, index) => renderMasonryItem(ref, index * 2 + 1))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Loading design references...</Text>
          <Text style={styles.loadingSubtext}>
            Curating {currentStyle} designs for your {currentSpaceType.replace('_', ' ')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationHelpers.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>References</Text>
          <Text style={styles.headerSubtitle}>Step 5 of 10</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}
        >
          <Ionicons name="add" size={24} color={colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>5/10 Complete</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Choose Your Design References</Text>
          <Text style={styles.infoSubtitle}>
            Select images that inspire your {currentStyle} {currentSpaceType.replace('_', ' ')} design
          </Text>
          
          {selectedReferences.length > 0 && (
            <View style={styles.selectionCounter}>
              <Ionicons name="images" size={16} color={colors.brand} />
              <Text style={styles.counterText}>
                {selectedReferences.length} selected
              </Text>
            </View>
          )}
        </View>

        {/* No References Message */}
        {references.length === 0 && !isLoading && (
          <View style={styles.noReferencesContainer}>
            <Ionicons name="image-outline" size={64} color={colors.textMuted} />
            <Text style={styles.noReferencesTitle}>No References Found</Text>
            <Text style={styles.noReferencesMessage}>
              We couldn't find references for your selected style and space type.
              You can continue without references or try again.
            </Text>
            <View style={styles.noReferencesButtons}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadReferences}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => {
                  // Continue without references
                  journeyStore.updateProjectWizard({
                    selectedReferences: [],
                    currentWizardStep: 'references_palettes'
                  });
                  NavigationHelpers.navigateToScreen('colorPaletteSelection', {
                    selectedStyle: currentStyle,
                    spaceType: currentSpaceType,
                    selectedReferences: []
                  });
                }}
              >
                <Text style={styles.skipButtonText}>Skip References</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Masonry Grid */}
        {references.length > 0 && renderMasonryGrid()}
        
        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      {selectedReferences.length > 0 && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.brandLight, colors.brand]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                Continue with {selectedReferences.length} References
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        {previewImage && (
          <View style={styles.modalContainer}>
            <BlurView intensity={90} tint="dark" style={styles.modalBlur}>
              <TouchableOpacity
                style={styles.modalCloseArea}
                onPress={() => setPreviewImage(null)}
                activeOpacity={1}
              >
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: previewImage.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{previewImage.title}</Text>
                    {previewImage.description && (
                      <Text style={styles.modalDescription}>
                        {previewImage.description}
                      </Text>
                    )}
                    
                    <View style={styles.modalTags}>
                      {previewImage.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setPreviewImage(null)}
              >
                <Ionicons name="close" size={24} color={colors.surface} />
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default ReferenceSelectionScreen;