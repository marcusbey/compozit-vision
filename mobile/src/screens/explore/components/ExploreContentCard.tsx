import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

interface ExploreContentCardProps {
  content: ExploreContent;
  onPress: () => void;
  onLikeToggle: () => void;
  onSaveToggle: () => void;
}

export const ExploreContentCard: React.FC<ExploreContentCardProps> = ({
  content,
  onPress,
  onLikeToggle,
  onSaveToggle,
}) => {
  const getCardHeight = () => {
    // Varying heights for masonry effect
    const baseHeight = 180;
    const variation = (content.id.charCodeAt(0) % 60) - 30; // -30 to +30
    return baseHeight + variation;
  };

  const formatLikes = (likes: number) => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`;
    }
    return likes.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'home';
      case 'furniture':
        return 'bed';
      case 'color':
        return 'color-palette';
      case 'style':
        return 'brush';
      case 'brand':
        return 'business';
      case 'professional':
        return 'person';
      default:
        return 'image';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { height: getCardHeight() }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Main Image */}
      <Image 
        source={{ uri: content.image }} 
        style={styles.image}
        defaultSource={require('../../../assets/placeholder-image.png')}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      />

      {/* Top Actions */}
      <View style={styles.topActions}>
        <View style={styles.typeContainer}>
          <View style={styles.typeBadge}>
            <Ionicons 
              name={getTypeIcon(content.type) as any} 
              size={12} 
              color="#FFFFFF" 
            />
            <Text style={styles.typeText}>{content.type}</Text>
          </View>
          {content.isSponsored && (
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>AD</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={onSaveToggle}
        >
          <Ionicons 
            name={content.isSaved ? 'bookmark' : 'bookmark-outline'} 
            size={20} 
            color={content.isSaved ? '#D4A574' : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>

      {/* Content Info */}
      <View style={styles.contentInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        
        <View style={styles.authorContainer}>
          {content.authorAvatar && (
            <Image 
              source={{ uri: content.authorAvatar }} 
              style={styles.authorAvatar}
            />
          )}
          <Text style={styles.author} numberOfLines={1}>
            {content.author}
          </Text>
        </View>

        {/* Price (for furniture/products) */}
        {content.price && (
          <Text style={styles.price}>
            {content.currency === 'USD' ? '$' : '€'}{content.price.toLocaleString()}
          </Text>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.likeContainer}
            onPress={onLikeToggle}
          >
            <Ionicons 
              name={content.isLiked ? 'heart' : 'heart-outline'} 
              size={16} 
              color={content.isLiked ? '#E07A5F' : '#FFFFFF'} 
            />
            <Text style={styles.likeText}>{formatLikes(content.likes)}</Text>
          </TouchableOpacity>

          <View style={styles.tags}>
            {content.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  topActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeContainer: {
    gap: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  sponsoredBadge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 8,
    lineHeight: 12,
    color: '#0A0A0A',
    fontWeight: '600',
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  author: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    flex: 1,
  },
  price: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#D4A574',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});