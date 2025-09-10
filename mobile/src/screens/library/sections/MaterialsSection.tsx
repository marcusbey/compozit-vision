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
const MATERIAL_WIDTH = (width - 48) / 2;

interface Material {
  id: string;
  name: string;
  category: 'fabric' | 'wood' | 'metal' | 'stone' | 'paint' | 'tile' | 'wallpaper';
  brand: string;
  color: string;
  finish?: string;
  imageUrl: string;
  swatchUrl?: string;
  price?: number;
  priceUnit?: string;
  currency?: string;
  isAvailable: boolean;
  tags: string[];
  dateAdded: Date;
  projectsUsed: string[];
  notes?: string;
}

interface MaterialCardProps {
  material: Material;
  onPress: () => void;
  onOrderSample: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ 
  material, 
  onPress, 
  onOrderSample 
}) => (
  <TouchableOpacity style={styles.materialCard} onPress={onPress}>
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: material.imageUrl }} 
        style={styles.materialImage}
        defaultSource={require('../../../assets/placeholder-image.png')}
      />
      {material.swatchUrl && (
        <View style={styles.swatchPreview}>
          <Image 
            source={{ uri: material.swatchUrl }} 
            style={styles.swatchImage}
          />
        </View>
      )}
      {!material.isAvailable && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
    </View>
    
    <View style={styles.materialInfo}>
      <View style={styles.materialHeader}>
        <Text style={styles.materialName} numberOfLines={2}>
          {material.name}
        </Text>
        <View style={[styles.colorIndicator, { backgroundColor: material.color }]} />
      </View>
      
      <Text style={styles.materialBrand} numberOfLines={1}>
        {material.brand}
      </Text>
      
      {material.finish && (
        <Text style={styles.materialFinish} numberOfLines={1}>
          {material.finish}
        </Text>
      )}
      
      {material.price && (
        <Text style={styles.materialPrice}>
          {material.currency === 'USD' ? '$' : '€'}{material.price}/{material.priceUnit}
        </Text>
      )}
      
      <View style={styles.materialFooter}>
        <View style={styles.materialTags}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{material.category}</Text>
          </View>
          {material.projectsUsed.length > 0 && (
            <Text style={styles.projectsUsedText}>
              {material.projectsUsed.length} project{material.projectsUsed.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        {material.isAvailable && (
          <TouchableOpacity style={styles.sampleButton} onPress={onOrderSample}>
            <Ionicons name="cube-outline" size={14} color="#D4A574" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export const MaterialsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'date'>('date');

  const categories = [
    { id: 'all', name: 'All Materials', count: 34 },
    { id: 'fabric', name: 'Fabric', count: 12 },
    { id: 'paint', name: 'Paint', count: 8 },
    { id: 'wood', name: 'Wood', count: 6 },
    { id: 'tile', name: 'Tile', count: 4 },
    { id: 'stone', name: 'Stone', count: 2 },
    { id: 'metal', name: 'Metal', count: 2 },
  ];

  const materials: Material[] = [
    {
      id: '1',
      name: 'Linen Blend Upholstery',
      category: 'fabric',
      brand: 'West Elm',
      color: '#F5F5DC',
      finish: 'Natural Weave',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      swatchUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
      price: 89,
      priceUnit: 'yard',
      currency: 'USD',
      isAvailable: true,
      tags: ['natural', 'sustainable', 'neutral'],
      dateAdded: new Date('2024-01-15'),
      projectsUsed: ['project1', 'project3'],
      notes: 'Perfect for dining chairs',
    },
    {
      id: '2',
      name: 'Benjamin Moore White Dove',
      category: 'paint',
      brand: 'Benjamin Moore',
      color: '#F8F8F0',
      finish: 'Satin',
      imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
      price: 75,
      priceUnit: 'gallon',
      currency: 'USD',
      isAvailable: true,
      tags: ['white', 'warm', 'classic'],
      dateAdded: new Date('2024-01-14'),
      projectsUsed: ['project2'],
      notes: 'Most popular white paint',
    },
    {
      id: '3',
      name: 'Reclaimed Oak Flooring',
      category: 'wood',
      brand: 'Vintage Millwork',
      color: '#8B4513',
      finish: 'Wire Brushed',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      price: 12,
      priceUnit: 'sq ft',
      currency: 'USD',
      isAvailable: false,
      tags: ['reclaimed', 'rustic', 'sustainable'],
      dateAdded: new Date('2024-01-13'),
      projectsUsed: [],
      notes: 'Limited availability',
    },
    {
      id: '4',
      name: 'Carrara Marble Subway Tile',
      category: 'tile',
      brand: 'Tile Bar',
      color: '#F8F8FF',
      finish: 'Polished',
      imageUrl: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400',
      price: 15,
      priceUnit: 'sq ft',
      currency: 'USD',
      isAvailable: true,
      tags: ['marble', 'classic', 'bathroom'],
      dateAdded: new Date('2024-01-12'),
      projectsUsed: ['project3'],
    },
    {
      id: '5',
      name: 'Velvet Curtain Fabric',
      category: 'fabric',
      brand: 'Calico Corners',
      color: '#2F4F4F',
      finish: 'Crushed Velvet',
      imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
      swatchUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=100',
      price: 125,
      priceUnit: 'yard',
      currency: 'USD',
      isAvailable: true,
      tags: ['luxury', 'formal', 'dark'],
      dateAdded: new Date('2024-01-11'),
      projectsUsed: ['project1'],
      notes: 'Perfect for formal dining room',
    },
    {
      id: '6',
      name: 'Sherwin Williams Agreeable Gray',
      category: 'paint',
      brand: 'Sherwin Williams',
      color: '#D3D0CB',
      finish: 'Eggshell',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      price: 68,
      priceUnit: 'gallon',
      currency: 'USD',
      isAvailable: true,
      tags: ['gray', 'neutral', 'popular'],
      dateAdded: new Date('2024-01-10'),
      projectsUsed: ['project2', 'project4'],
      notes: 'Best selling gray paint',
    },
  ];

  const filteredMaterials = materials.filter(material => 
    activeCategory === 'all' || material.category === activeCategory
  );

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'date':
        return b.dateAdded.getTime() - a.dateAdded.getTime();
      default:
        return 0;
    }
  });

  const handleMaterialPress = (material: Material) => {
    console.log('Open material:', material.id);
  };

  const handleOrderSample = (material: Material) => {
    console.log('Order sample:', material.id);
  };

  const handleAddMaterial = () => {
    console.log('Add new material');
  };

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Materials</Text>
          <Text style={styles.itemCount}>{sortedMaterials.length} materials</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="funnel" size={20} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMaterial}>
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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="color-palette" size={20} color="#D4A574" />
          <Text style={styles.quickActionText}>Create Mood Board</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="cube" size={20} color="#D4A574" />
          <Text style={styles.quickActionText}>Order Samples</Text>
        </TouchableOpacity>
      </View>

      {/* Materials Grid */}
      <ScrollView 
        style={styles.materialsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.materialsContent}
      >
        <View style={styles.materialsGrid}>
          {sortedMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onPress={() => handleMaterialPress(material)}
              onOrderSample={() => handleOrderSample(material)}
            />
          ))}
        </View>

        {/* Empty State */}
        {sortedMaterials.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={64} color="#D4A574" />
            <Text style={styles.emptyStateTitle}>No Materials Found</Text>
            <Text style={styles.emptyStateDescription}>
              Start building your material library with swatches and samples
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddMaterial}>
              <Text style={styles.emptyStateButtonText}>Add Material</Text>
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
  materialsContainer: {
    flex: 1,
  },
  materialsContent: {
    padding: 16,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  materialCard: {
    width: MATERIAL_WIDTH,
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
    height: MATERIAL_WIDTH * 0.6,
  },
  materialImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  swatchPreview: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  swatchImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(224, 122, 95, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  materialInfo: {
    padding: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  materialName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    flex: 1,
    marginRight: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DDD1',
  },
  materialBrand: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    marginBottom: 2,
  },
  materialFinish: {
    fontSize: 11,
    lineHeight: 15,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  materialPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 8,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialTags: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
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
  sampleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
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