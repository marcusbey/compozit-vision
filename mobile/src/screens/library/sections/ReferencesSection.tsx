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
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface Reference {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  source: string;
  tags: string[];
  dateAdded: Date;
  isFavorite: boolean;
}

interface ReferenceCardProps {
  reference: Reference;
  onPress: () => void;
  onFavoriteToggle: () => void;
}

const ReferenceCard: React.FC<ReferenceCardProps> = ({ 
  reference, 
  onPress, 
  onFavoriteToggle 
}) => (
  <TouchableOpacity style={styles.referenceCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: reference.imageUrl }} 
        style={styles.referenceImage}
        defaultSource={require('../../../assets/placeholder-image.png')}
      />
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={onFavoriteToggle}
      >
        <Ionicons 
          name={reference.isFavorite ? 'heart' : 'heart-outline'} 
          size={20} 
          color={reference.isFavorite ? '#E07A5F' : '#FFFFFF'} 
        />
      </TouchableOpacity>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{reference.category}</Text>
      </View>
    </View>
    <View style={styles.referenceInfo}>
      <Text style={styles.referenceTitle} numberOfLines={2}>
        {reference.title}
      </Text>
      <Text style={styles.referenceSource} numberOfLines={1}>
        {reference.source}
      </Text>
      <View style={styles.referenceTags}>
        {reference.tags.slice(0, 2).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {reference.tags.length > 2 && (
          <Text style={styles.moreTagsText}>+{reference.tags.length - 2}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export const ReferencesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All References', count: 156 },
    { id: 'living', name: 'Living Room', count: 45 },
    { id: 'bedroom', name: 'Bedroom', count: 32 },
    { id: 'kitchen', name: 'Kitchen', count: 28 },
    { id: 'bathroom', name: 'Bathroom', count: 21 },
    { id: 'office', name: 'Office', count: 18 },
    { id: 'outdoor', name: 'Outdoor', count: 12 },
  ];

  // Mock data - in real app, this would come from a store or API
  const references: Reference[] = [
    {
      id: '1',
      title: 'Modern Scandinavian Living Room',
      category: 'Living Room',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      source: 'Pinterest',
      tags: ['minimalist', 'scandinavian', 'neutral'],
      dateAdded: new Date('2024-01-15'),
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Bohemian Bedroom Design',
      category: 'Bedroom',
      imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
      source: 'Instagram',
      tags: ['bohemian', 'colorful', 'eclectic'],
      dateAdded: new Date('2024-01-14'),
      isFavorite: false,
    },
    {
      id: '3',
      title: 'Industrial Kitchen Design',
      category: 'Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      source: 'Design Milk',
      tags: ['industrial', 'modern', 'steel'],
      dateAdded: new Date('2024-01-13'),
      isFavorite: true,
    },
    {
      id: '4',
      title: 'Minimalist Bathroom',
      category: 'Bathroom',
      imageUrl: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400',
      source: 'Dezeen',
      tags: ['minimalist', 'white', 'clean'],
      dateAdded: new Date('2024-01-12'),
      isFavorite: false,
    },
  ];

  const filteredReferences = references.filter(ref => 
    activeCategory === 'all' || ref.category.toLowerCase().includes(activeCategory)
  );

  const handleReferencePress = (reference: Reference) => {
    // Navigate to reference detail view
    console.log('Open reference:', reference.id);
  };

  const handleFavoriteToggle = (referenceId: string) => {
    // Toggle favorite status
    console.log('Toggle favorite:', referenceId);
  };

  const handleAddReference = () => {
    // Navigate to add reference screen
    console.log('Add new reference');
  };

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>References</Text>
          <Text style={styles.itemCount}>{filteredReferences.length} items</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={20} 
              color="#666666" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddReference}>
            <Ionicons name="add" size={20} color="#D4A574" />
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

      {/* References Grid */}
      <ScrollView 
        style={styles.referencesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.referencesContent}
      >
        <View style={styles.referencesGrid}>
          {filteredReferences.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              onPress={() => handleReferencePress(reference)}
              onFavoriteToggle={() => handleFavoriteToggle(reference.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredReferences.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color="#D4A574" />
            <Text style={styles.emptyStateTitle}>No References Found</Text>
            <Text style={styles.emptyStateDescription}>
              Add some design references to build your inspiration library
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddReference}>
              <Text style={styles.emptyStateButtonText}>Add Reference</Text>
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
  referencesContainer: {
    flex: 1,
  },
  referencesContent: {
    padding: 16,
  },
  referencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  referenceCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: CARD_WIDTH * 0.75,
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  referenceInfo: {
    padding: 12,
  },
  referenceTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  referenceSource: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    marginBottom: 8,
  },
  referenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  tag: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#666666',
  },
  moreTagsText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#D4A574',
    fontWeight: '500',
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