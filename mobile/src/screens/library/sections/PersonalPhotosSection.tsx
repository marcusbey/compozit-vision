import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 3 columns with padding

interface PersonalPhoto {
  id: string;
  imageUrl: string;
  title: string;
  category: 'before' | 'after' | 'inspiration' | 'progress' | 'reference';
  projectId?: string;
  projectName?: string;
  dateAdded: Date;
  tags: string[];
  location?: string;
  isFavorite: boolean;
}

interface PhotoCardProps {
  photo: PersonalPhoto;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, 
  onPress, 
  onFavoriteToggle 
}) => (
  <TouchableOpacity style={styles.photoCard} onPress={onPress}>
    <Image 
      source={{ uri: photo.imageUrl }} 
      style={styles.photoImage}
      defaultSource={require('../../../assets/placeholder-image.png')}
    />
    
    {/* Overlay */}
    <View style={styles.photoOverlay}>
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={onFavoriteToggle}
      >
        <Ionicons 
          name={photo.isFavorite ? 'heart' : 'heart-outline'} 
          size={16} 
          color={photo.isFavorite ? '#E07A5F' : '#FFFFFF'} 
        />
      </TouchableOpacity>
      
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{photo.category}</Text>
      </View>
    </View>
    
    {/* Project Link */}
    {photo.projectId && (
      <View style={styles.projectLink}>
        <Ionicons name="link" size={12} color="#D4A574" />
        <Text style={styles.projectLinkText} numberOfLines={1}>
          {photo.projectName}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

export const PersonalPhotosSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const categories = [
    { id: 'all', name: 'All Photos', count: 68 },
    { id: 'before', name: 'Before', count: 15 },
    { id: 'after', name: 'After', count: 12 },
    { id: 'progress', name: 'Progress', count: 18 },
    { id: 'inspiration', name: 'Inspiration', count: 14 },
    { id: 'reference', name: 'Reference', count: 9 },
  ];

  const photos: PersonalPhoto[] = [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      title: 'Living Room Before',
      category: 'before',
      projectId: 'project1',
      projectName: 'Modern Living Room',
      dateAdded: new Date('2024-01-15'),
      tags: ['living-room', 'before', 'renovation'],
      location: 'San Francisco, CA',
      isFavorite: false,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
      title: 'Kitchen Progress',
      category: 'progress',
      projectId: 'project2',
      projectName: 'Kitchen Renovation',
      dateAdded: new Date('2024-01-14'),
      tags: ['kitchen', 'progress', 'renovation'],
      location: 'New York, NY',
      isFavorite: true,
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      title: 'Bathroom After',
      category: 'after',
      projectId: 'project3',
      projectName: 'Bathroom Remodel',
      dateAdded: new Date('2024-01-13'),
      tags: ['bathroom', 'after', 'completed'],
      location: 'Los Angeles, CA',
      isFavorite: true,
    },
    {
      id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400',
      title: 'Color Inspiration',
      category: 'inspiration',
      dateAdded: new Date('2024-01-12'),
      tags: ['color', 'inspiration', 'palette'],
      isFavorite: false,
    },
    {
      id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
      title: 'Lighting Reference',
      category: 'reference',
      dateAdded: new Date('2024-01-11'),
      tags: ['lighting', 'reference', 'fixtures'],
      isFavorite: false,
    },
    {
      id: '6',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      title: 'Bedroom Progress',
      category: 'progress',
      projectId: 'project4',
      projectName: 'Master Bedroom',
      dateAdded: new Date('2024-01-10'),
      tags: ['bedroom', 'progress', 'staging'],
      location: 'Chicago, IL',
      isFavorite: true,
    },
  ];

  const filteredPhotos = photos.filter(photo => 
    activeCategory === 'all' || photo.category === activeCategory
  );

  const handlePhotoPress = (photo: PersonalPhoto) => {
    console.log('Open photo:', photo.id);
  };

  const handleFavoriteToggle = (photoId: string) => {
    console.log('Toggle favorite:', photoId);
  };

  const handleAddPhoto = () => {
    console.log('Add new photo');
  };

  const handleProjectLink = (projectId: string) => {
    console.log('Open project:', projectId);
  };

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Personal Photos</Text>
          <Text style={styles.itemCount}>{filteredPhotos.length} photos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'grid' : 'apps'} 
              size={20} 
              color="#666666" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
            <Ionicons name="camera" size={20} color="#D4A574" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        style={styles.categoryFilter}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              activeCategory === category.id && styles.activeCategoryChip
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text style={[
              styles.categoryChipText,
              activeCategory === category.id && styles.activeCategoryChipText
            ]}>
              {category.name}
            </Text>
            <Text style={[
              styles.categoryCount,
              activeCategory === category.id && styles.activeCategoryCount
            ]}>
              {category.count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={handleAddPhoto}>
          <Ionicons name="camera" size={20} color="#D4A574" />
          <Text style={styles.quickActionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="image" size={20} color="#D4A574" />
          <Text style={styles.quickActionText}>Import</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="albums" size={20} color="#D4A574" />
          <Text style={styles.quickActionText}>Create Album</Text>
        </TouchableOpacity>
      </View>

      {/* Photos Grid */}
      <ScrollView 
        style={styles.photosContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.photosContent}
      >
        <View style={styles.photosGrid}>
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onPress={() => handlePhotoPress(photo)}
              onFavoriteToggle={() => handleFavoriteToggle(photo.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color="#D4A574" />
            <Text style={styles.emptyStateTitle}>No Photos Found</Text>
            <Text style={styles.emptyStateDescription}>
              Start documenting your design projects by adding photos
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddPhoto}>
              <Text style={styles.emptyStateButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFilter: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F6F3EF',
    marginRight: 8,
    gap: 6,
  },
  activeCategoryChip: {
    backgroundColor: '#0A0A0A',
  },
  categoryChipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '400',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    backgroundColor: '#E8DDD1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeCategoryCount: {
    color: '#0A0A0A',
    backgroundColor: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  photosContainer: {
    flex: 1,
  },
  photosContent: {
    padding: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  projectLink: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 80,
  },
  projectLinkText: {
    fontSize: 8,
    lineHeight: 12,
    color: '#666666',
    marginLeft: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0A0A0A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 240,
  },
  emptyStateButton: {
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyStateButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});