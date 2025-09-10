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
const CARD_WIDTH = (width - 48) / 2;

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  isWishlisted: boolean;
  inStock: boolean;
  tags: string[];
  dateAdded: Date;
  projectsUsed: string[];
}

interface FurnitureCardProps {
  item: FurnitureItem;
  onPress: () => void;
  onWishlistToggle: () => void;
}

const FurnitureCard: React.FC<FurnitureCardProps> = ({ 
  item, 
  onPress, 
  onWishlistToggle 
}) => (
  <TouchableOpacity style={styles.furnitureCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.furnitureImage}
        defaultSource={require('../../../assets/placeholder-image.png')}
      />
      <TouchableOpacity 
        style={styles.wishlistButton}
        onPress={onWishlistToggle}
      >
        <Ionicons 
          name={item.isWishlisted ? 'heart' : 'heart-outline'} 
          size={20} 
          color={item.isWishlisted ? '#E07A5F' : '#FFFFFF'} 
        />
      </TouchableOpacity>
      {!item.inStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
    </View>
    
    <View style={styles.furnitureInfo}>
      <Text style={styles.furnitureName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.furnitureBrand} numberOfLines={1}>
        {item.brand}
      </Text>
      <Text style={styles.furniturePrice}>
        {item.currency === 'USD' ? '$' : '€'}{item.price.toLocaleString()}
      </Text>
      
      <View style={styles.furnitureTags}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
        {item.projectsUsed.length > 0 && (
          <Text style={styles.projectsUsedText}>
            Used in {item.projectsUsed.length} project{item.projectsUsed.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export const FurnitureSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');

  const categories = [
    { id: 'all', name: 'All Furniture', count: 45 },
    { id: 'seating', name: 'Seating', count: 12 },
    { id: 'tables', name: 'Tables', count: 8 },
    { id: 'storage', name: 'Storage', count: 10 },
    { id: 'lighting', name: 'Lighting', count: 9 },
    { id: 'decor', name: 'Decor', count: 6 },
  ];

  const furnitureItems: FurnitureItem[] = [
    {
      id: '1',
      name: 'Eames Lounge Chair',
      category: 'seating',
      brand: 'Herman Miller',
      price: 5495,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      isWishlisted: true,
      inStock: true,
      tags: ['iconic', 'leather', 'comfortable'],
      dateAdded: new Date('2024-01-15'),
      projectsUsed: ['project1', 'project3'],
    },
    {
      id: '2',
      name: 'Tulip Table',
      category: 'tables',
      brand: 'Knoll',
      price: 2890,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      isWishlisted: false,
      inStock: false,
      tags: ['round', 'marble', 'mid-century'],
      dateAdded: new Date('2024-01-14'),
      projectsUsed: [],
    },
    {
      id: '3',
      name: 'Barcelona Daybed',
      category: 'seating',
      brand: 'Knoll',
      price: 4200,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      isWishlisted: true,
      inStock: true,
      tags: ['leather', 'modern', 'luxury'],
      dateAdded: new Date('2024-01-13'),
      projectsUsed: ['project2'],
    },
    {
      id: '4',
      name: 'Arco Floor Lamp',
      category: 'lighting',
      brand: 'Flos',
      price: 3200,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
      isWishlisted: false,
      inStock: true,
      tags: ['arc', 'marble', 'statement'],
      dateAdded: new Date('2024-01-12'),
      projectsUsed: ['project1'],
    },
  ];

  const filteredItems = furnitureItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'date':
        return b.dateAdded.getTime() - a.dateAdded.getTime();
      default:
        return 0;
    }
  });

  const handleItemPress = (item: FurnitureItem) => {
    console.log('Open furniture item:', item.id);
  };

  const handleWishlistToggle = (itemId: string) => {
    console.log('Toggle wishlist:', itemId);
  };

  const handleAddFurniture = () => {
    console.log('Add new furniture item');
  };

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Furniture</Text>
          <Text style={styles.itemCount}>{sortedItems.length} items</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel" size={20} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFurniture}>
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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortOptions}>
          {(['date', 'name', 'price'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortOption,
                sortBy === option && styles.activeSortOption
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option && styles.activeSortOptionText
              ]}>
                {option === 'date' ? 'Recently Added' : 
                 option === 'name' ? 'Name' : 'Price'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Furniture Grid */}
      <ScrollView 
        style={styles.furnitureContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.furnitureContent}
      >
        <View style={styles.furnitureGrid}>
          {sortedItems.map((item) => (
            <FurnitureCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
              onWishlistToggle={() => handleWishlistToggle(item.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bed-outline" size={64} color="#D4A574" />
            <Text style={styles.emptyStateTitle}>No Furniture Found</Text>
            <Text style={styles.emptyStateDescription}>
              Add furniture items to build your wishlist and track prices
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddFurniture}>
              <Text style={styles.emptyStateButtonText}>Add Furniture</Text>
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
  sortButton: {
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F6F3EF',
    marginRight: 8,
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  sortLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginRight: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  activeSortOption: {
    backgroundColor: '#F6F3EF',
  },
  sortOptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  activeSortOptionText: {
    color: '#0A0A0A',
    fontWeight: '500',
  },
  furnitureContainer: {
    flex: 1,
  },
  furnitureContent: {
    padding: 16,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  furnitureCard: {
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
    height: CARD_WIDTH * 0.8,
  },
  furnitureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
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
  outOfStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(224, 122, 95, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  furnitureInfo: {
    padding: 12,
  },
  furnitureName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  furnitureBrand: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 8,
  },
  furnitureTags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTag: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  projectsUsedText: {
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