import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import { MasonryGrid } from './components/MasonryGrid';
import { BrandContentCard } from './components/BrandContentCard';
import { ExploreContentCard } from './components/ExploreContentCard';
import { FilterModal } from './components/FilterModal';

const { width } = Dimensions.get('window');

interface ExploreContent {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  image: string;
  type: 'project' | 'furniture' | 'color' | 'style' | 'brand' | 'professional';
  category: string;
  tags: string[];
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  isSponsored?: boolean;
  brandId?: string;
  brandName?: string;
  price?: number;
  currency?: string;
  dateAdded: Date;
  description?: string;
}

interface BrandPartner {
  id: string;
  name: string;
  logo: string;
  isSponsored: boolean;
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    currency: string;
  }>;
  category: string;
}

interface ExploreScreenProps {
  navigation: any;
  route?: {
    params?: {
      category?: string;
      searchQuery?: string;
    };
  };
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation, route }) => {
  const [activeCategory, setActiveCategory] = useState(route?.params?.category || 'trending');
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [showFilter, setShowFilter] = useState(false);
  const [content, setContent] = useState<ExploreContent[]>([]);
  const [brandPartners, setBrandPartners] = useState<BrandPartner[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const exploreCategories = [
    { id: 'trending', name: 'Trending', icon: 'trending-up' },
    { id: 'projects', name: 'Projects', icon: 'home' },
    { id: 'furniture', name: 'Furniture', icon: 'bed' },
    { id: 'colors', name: 'Colors', icon: 'color-palette' },
    { id: 'styles', name: 'Styles', icon: 'brush' },
    { id: 'brands', name: 'Brands', icon: 'business' },
    { id: 'professionals', name: 'Pros', icon: 'people' },
  ];

  useEffect(() => {
    loadContent();
    loadBrandPartners();
  }, [activeCategory, searchQuery]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would be from API
      const mockContent: ExploreContent[] = [
        {
          id: '1',
          title: 'Modern Scandinavian Living Room',
          author: 'Sarah Design Studio',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b950?w=100',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
          type: 'project',
          category: 'living room',
          tags: ['scandinavian', 'modern', 'minimalist'],
          likes: 342,
          isLiked: false,
          isSaved: false,
          dateAdded: new Date('2024-01-15'),
          description: 'A perfect blend of functionality and style',
        },
        {
          id: '2',
          title: 'Emerald Green Velvet Sofa',
          author: 'West Elm',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
          type: 'furniture',
          category: 'seating',
          tags: ['velvet', 'green', 'luxury'],
          likes: 89,
          isLiked: true,
          isSaved: true,
          isSponsored: true,
          brandId: 'west-elm',
          brandName: 'West Elm',
          price: 1299,
          currency: 'USD',
          dateAdded: new Date('2024-01-14'),
        },
        {
          id: '3',
          title: 'Warm Earth Tone Palette',
          author: 'Color Collective',
          image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400',
          type: 'color',
          category: 'palette',
          tags: ['earth-tones', 'warm', 'natural'],
          likes: 156,
          isLiked: false,
          isSaved: false,
          dateAdded: new Date('2024-01-13'),
        },
        {
          id: '4',
          title: 'Industrial Kitchen Design',
          author: 'Marcus Johnson',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          type: 'project',
          category: 'kitchen',
          tags: ['industrial', 'modern', 'steel'],
          likes: 203,
          isLiked: false,
          isSaved: true,
          dateAdded: new Date('2024-01-12'),
        },
      ];

      // Filter content based on category and search
      let filteredContent = mockContent;
      
      if (activeCategory !== 'trending') {
        filteredContent = mockContent.filter(item => 
          item.type === activeCategory || item.category === activeCategory
        );
      }

      if (searchQuery) {
        filteredContent = filteredContent.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setContent(filteredContent);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandPartners = async () => {
    try {
      // Mock brand partners data
      const mockBrands: BrandPartner[] = [
        {
          id: 'west-elm',
          name: 'West Elm',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
          isSponsored: true,
          category: 'furniture',
          products: [
            {
              id: 'we1',
              name: 'Mid-Century Sofa',
              image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200',
              price: 1299,
              currency: 'USD',
            },
            {
              id: 'we2',
              name: 'Brass Floor Lamp',
              image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=200',
              price: 299,
              currency: 'USD',
            },
          ],
        },
        {
          id: 'cb2',
          name: 'CB2',
          logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
          isSponsored: false,
          category: 'furniture',
          products: [
            {
              id: 'cb1',
              name: 'Modern Dining Table',
              image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
              price: 899,
              currency: 'USD',
            },
          ],
        },
      ];

      setBrandPartners(mockBrands);
    } catch (error) {
      console.error('Error loading brand partners:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    await loadBrandPartners();
    setRefreshing(false);
  };

  const handleContentPress = (content: ExploreContent) => {
    console.log('Open content detail:', content.id);
    // TODO: Navigate to content detail screen
  };

  const handleLikeToggle = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const handleSaveToggle = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, isSaved: !item.isSaved }
        : item
    ));
    
    // TODO: Save to library
    console.log('Save to library:', contentId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name=\"filter\" size={20} color=\"#666666\" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name=\"search\" size={20} color=\"#666666\" />
          <TextInput
            style={styles.searchInput}
            placeholder=\"Search designs, furniture, colors...\"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor=\"#666666\"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name=\"close-circle\" size={20} color=\"#666666\" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Navigation */}
      <ScrollView 
        horizontal 
        style={styles.categories} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {exploreCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => handleCategoryChange(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={activeCategory === category.id ? '#FFFFFF' : '#666666'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content Feed */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor=\"#D4A574\"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Partners Section (for brands category) */}
        {activeCategory === 'brands' && brandPartners.length > 0 && (
          <View style={styles.brandsSection}>
            <Text style={styles.sectionTitle}>Featured Brands</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.brandsList}>
                {brandPartners.map(brand => (
                  <BrandContentCard 
                    key={brand.id} 
                    brand={brand}
                    onPress={() => console.log('Open brand:', brand.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Main Content Grid */}
        <View style={styles.contentGrid}>
          <MasonryGrid
            data={content}
            renderItem={({ item }) => (
              <ExploreContentCard
                content={item}
                onPress={() => handleContentPress(item)}
                onLikeToggle={() => handleLikeToggle(item.id)}
                onSaveToggle={() => handleSaveToggle(item.id)}
              />
            )}
            numColumns={2}
            loading={loading}
          />
        </View>

        {/* Load More */}
        {content.length > 0 && (
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApplyFilters={(filters) => {
          console.log('Apply filters:', filters);
          setShowFilter(false);
        }}
      />
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: '#0A0A0A',
    fontFamily: 'Inter',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#0A0A0A',
    fontFamily: 'Inter',
  },
  categories: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F6F3EF',
    marginRight: 8,
    gap: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#0A0A0A',
  },
  categoryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  brandsSection: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  brandsList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  contentGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadMoreButton: {
    backgroundColor: '#F6F3EF',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666',
    fontWeight: '500',
  },
});

export default ExploreScreen;