import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterOptions {
  contentTypes: string[];
  priceRange: [number, number];
  styles: string[];
  rooms: string[];
  colors: string[];
  sortBy: 'newest' | 'popular' | 'price-low' | 'price-high';
  showSponsored: boolean;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    contentTypes: [],
    priceRange: [0, 10000],
    styles: [],
    rooms: [],
    colors: [],
    sortBy: 'newest',
    showSponsored: true,
  });

  const contentTypes = [
    { id: 'project', name: 'Projects', icon: 'home' },
    { id: 'furniture', name: 'Furniture', icon: 'bed' },
    { id: 'color', name: 'Color Palettes', icon: 'color-palette' },
    { id: 'style', name: 'Style Guides', icon: 'brush' },
    { id: 'professional', name: 'Professionals', icon: 'person' },
  ];

  const styles = [
    'Modern', 'Scandinavian', 'Industrial', 'Bohemian', 'Minimalist',
    'Traditional', 'Contemporary', 'Rustic', 'Art Deco', 'Mid-Century'
  ];

  const rooms = [
    'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dining Room',
    'Office', 'Outdoor', 'Entryway', 'Nursery', 'Closet'
  ];

  const colors = [
    'White', 'Black', 'Gray', 'Beige', 'Brown', 'Blue', 'Green',
    'Pink', 'Yellow', 'Orange', 'Red', 'Purple'
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
  ];

  const toggleContentType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const toggleStyle = (style: string) => {
    setFilters(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  const toggleRoom = (room: string) => {
    setFilters(prev => ({
      ...prev,
      rooms: prev.rooms.includes(room)
        ? prev.rooms.filter(r => r !== room)
        : [...prev.rooms, room]
    }));
  };

  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      contentTypes: [],
      priceRange: [0, 10000],
      styles: [],
      rooms: [],
      colors: [],
      sortBy: 'newest',
      showSponsored: true,
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Content Types */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Type</Text>
            <View style={styles.optionsGrid}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionChip,
                    filters.contentTypes.includes(type.id) && styles.selectedChip
                  ]}
                  onPress={() => toggleContentType(type.id)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={16} 
                    color={filters.contentTypes.includes(type.id) ? '#FFFFFF' : '#666666'} 
                  />
                  <Text style={[
                    styles.optionText,
                    filters.contentTypes.includes(type.id) && styles.selectedText
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.radioGroup}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.radioOption}
                  onPress={() => setFilters(prev => ({ ...prev, sortBy: option.id as any }))}
                >
                  <View style={[
                    styles.radioButton,
                    filters.sortBy === option.id && styles.radioButtonSelected
                  ]}>
                    {filters.sortBy === option.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Styles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Styles</Text>
            <View style={styles.tagsContainer}>
              {styles.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.tag,
                    filters.styles.includes(style) && styles.selectedTag
                  ]}
                  onPress={() => toggleStyle(style)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.styles.includes(style) && styles.selectedTagText
                  ]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rooms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rooms</Text>
            <View style={styles.tagsContainer}>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room}
                  style={[
                    styles.tag,
                    filters.rooms.includes(room) && styles.selectedTag
                  ]}
                  onPress={() => toggleRoom(room)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.rooms.includes(room) && styles.selectedTagText
                  ]}>
                    {room}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Colors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <View style={styles.tagsContainer}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.tag,
                    filters.colors.includes(color) && styles.selectedTag
                  ]}
                  onPress={() => toggleColor(color)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.colors.includes(color) && styles.selectedTagText
                  ]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Show Sponsored Content</Text>
              <Switch
                value={filters.showSponsored}
                onValueChange={(value) => setFilters(prev => ({ ...prev, showSponsored: value }))}
                trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  clearText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#D4A574',
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 12,
  },
  optionsGrid: {
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    gap: 8,
  },
  selectedChip: {
    backgroundColor: '#0A0A0A',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8DDD1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#D4A574',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4A574',
  },
  radioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0A0A0A',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F6F3EF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTag: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  tagText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0A0A0A',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DDD1',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});