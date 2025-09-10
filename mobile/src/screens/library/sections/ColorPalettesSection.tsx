import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PALETTE_WIDTH = (width - 48) / 2; // 2 columns with padding

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  category: string;
  dateCreated: Date;
  isCustom: boolean;
  isFavorite: boolean;
  projectsUsed: number;
  tags: string[];
}

interface PaletteCardProps {
  palette: ColorPalette;
  onPress: () => void;
  onEdit: () => void;
  onFavoriteToggle: () => void;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ 
  palette, 
  onPress, 
  onEdit, 
  onFavoriteToggle 
}) => (
  <TouchableOpacity style={styles.paletteCard} onPress={onPress}>
    {/* Color Swatches */}
    <View style={styles.colorSwatches}>
      {palette.colors.slice(0, 4).map((color, index) => (
        <View
          key={index}
          style={[
            styles.colorSwatch, 
            { 
              backgroundColor: color,
              borderRadius: index === 0 ? 8 : 0, // Only first swatch gets rounded corner
            }
          ]}
        />
      ))}
      {palette.colors.length > 4 && (
        <View style={[styles.colorSwatch, styles.moreColorsIndicator]}>
          <Text style={styles.moreColorsText}>+{palette.colors.length - 4}</Text>
        </View>
      )}
    </View>
    
    {/* Palette Info */}
    <View style={styles.paletteInfo}>
      <View style={styles.paletteHeader}>
        <Text style={styles.paletteName} numberOfLines={1}>
          {palette.name}
        </Text>
        <TouchableOpacity onPress={onFavoriteToggle}>
          <Ionicons 
            name={palette.isFavorite ? 'heart' : 'heart-outline'} 
            size={16} 
            color={palette.isFavorite ? '#E07A5F' : '#666666'} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.paletteCount}>
        {palette.colors.length} colors
      </Text>
      
      {palette.projectsUsed > 0 && (
        <Text style={styles.projectsUsed}>
          Used in {palette.projectsUsed} project{palette.projectsUsed !== 1 ? 's' : ''}
        </Text>
      )}
      
      <View style={styles.paletteFooter}>
        <View style={styles.paletteTags}>
          {palette.isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{palette.category}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil" size={14} color="#D4A574" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

export const ColorPalettesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All Palettes', count: 23 },
    { id: 'warm', name: 'Warm Tones', count: 8 },
    { id: 'cool', name: 'Cool Tones', count: 7 },
    { id: 'neutral', name: 'Neutrals', count: 6 },
    { id: 'monochrome', name: 'Monochrome', count: 2 },
  ];

  // Mock data - Enhanced from ProfileScreen
  const palettes: ColorPalette[] = [
    {
      id: '1',
      name: 'Warm Neutrals',
      colors: ['#F5F5DC', '#D2B48C', '#CD853F', '#A0522D', '#8B4513'],
      category: 'warm',
      dateCreated: new Date('2024-01-15'),
      isCustom: true,
      isFavorite: true,
      projectsUsed: 3,
      tags: ['beige', 'brown', 'cozy'],
    },
    {
      id: '2',
      name: 'Ocean Breeze',
      colors: ['#E0F6FF', '#87CEEB', '#4682B4', '#2F4F4F'],
      category: 'cool',
      dateCreated: new Date('2024-01-14'),
      isCustom: false,
      isFavorite: false,
      projectsUsed: 1,
      tags: ['blue', 'ocean', 'calm'],
    },
    {
      id: '3',
      name: 'Sage & Stone',
      colors: ['#9CAF88', '#8FBC8F', '#696969', '#2F4F4F', '#708090'],
      category: 'neutral',
      dateCreated: new Date('2024-01-13'),
      isCustom: true,
      isFavorite: true,
      projectsUsed: 2,
      tags: ['green', 'grey', 'natural'],
    },
    {
      id: '4',
      name: 'Sunset Glow',
      colors: ['#FFF8DC', '#FFE4B5', '#DDA0DD', '#CD853F', '#D2691E'],
      category: 'warm',
      dateCreated: new Date('2024-01-12'),
      isCustom: false,
      isFavorite: false,
      projectsUsed: 0,
      tags: ['orange', 'pink', 'sunset'],
    },
    {
      id: '5',
      name: 'Monochrome Classic',
      colors: ['#FFFFFF', '#F5F5F5', '#C0C0C0', '#808080', '#000000'],
      category: 'monochrome',
      dateCreated: new Date('2024-01-11'),
      isCustom: false,
      isFavorite: true,
      projectsUsed: 4,
      tags: ['black', 'white', 'classic'],
    },
    {
      id: '6',
      name: 'Forest Deep',
      colors: ['#228B22', '#32CD32', '#006400', '#2E8B57', '#8FBC8F'],
      category: 'cool',
      dateCreated: new Date('2024-01-10'),
      isCustom: true,
      isFavorite: false,
      projectsUsed: 1,
      tags: ['green', 'forest', 'nature'],
    },
  ];

  const filteredPalettes = palettes.filter(palette => 
    activeCategory === 'all' || palette.category === activeCategory
  );

  const handlePalettePress = (palette: ColorPalette) => {
    // Navigate to palette detail/editor
    console.log('Open palette:', palette.id);
  };

  const handleEditPalette = (palette: ColorPalette) => {
    // Navigate to palette editor
    console.log('Edit palette:', palette.id);
  };

  const handleFavoriteToggle = (paletteId: string) => {
    // Toggle favorite status
    console.log('Toggle favorite:', paletteId);
  };

  const handleCreatePalette = () => {
    // Navigate to create new palette
    console.log('Create new palette');
  };

  return (
    <View style={styles.container}>
      {/* Header with Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Color Palettes</Text>
          <Text style={styles.itemCount}>{filteredPalettes.length} palettes</Text>
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
          <TouchableOpacity style={styles.addButton} onPress={handleCreatePalette}>
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

      {/* Palettes Content */}
      <ScrollView 
        style={styles.palettesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.palettesContent}
      >
        {/* Create New Palette Card */}
        <TouchableOpacity style={styles.createPaletteCard} onPress={handleCreatePalette}>
          <View style={styles.createPaletteIcon}>
            <Ionicons name="add" size={32} color="#D4A574" />
          </View>
          <Text style={styles.createPaletteText}>Create New Palette</Text>
          <Text style={styles.createPaletteSubtext}>
            Mix colors for your next project
          </Text>
        </TouchableOpacity>

        {/* Palettes Grid */}
        <View style={styles.palettesGrid}>
          {filteredPalettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              onPress={() => handlePalettePress(palette)}
              onEdit={() => handleEditPalette(palette)}
              onFavoriteToggle={() => handleFavoriteToggle(palette.id)}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredPalettes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="color-palette-outline" size={64} color="#D4A574" />
            <Text style={styles.emptyStateTitle}>No Palettes Found</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first color palette to start building your design library
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreatePalette}>
              <Text style={styles.emptyStateButtonText}>Create Palette</Text>
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
  palettesContainer: {
    flex: 1,
  },
  palettesContent: {
    padding: 16,
  },
  createPaletteCard: {
    width: PALETTE_WIDTH,
    height: 140,
    backgroundColor: '#F6F3EF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8DDD1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  createPaletteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  createPaletteText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    textAlign: 'center',
    marginBottom: 4,
  },
  createPaletteSubtext: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    textAlign: 'center',
  },
  palettesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paletteCard: {
    width: PALETTE_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  colorSwatches: {
    flexDirection: 'row',
    height: 80,
  },
  colorSwatch: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  moreColorsIndicator: {
    backgroundColor: '#E8DDD1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreColorsText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    fontWeight: '500',
  },
  paletteInfo: {
    padding: 12,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paletteName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#0A0A0A',
    flex: 1,
  },
  paletteCount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#D4A574',
    fontWeight: '500',
    marginBottom: 4,
  },
  projectsUsed: {
    fontSize: 11,
    lineHeight: 15,
    color: '#666666',
    marginBottom: 8,
  },
  paletteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paletteTags: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  customBadge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  editButton: {
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