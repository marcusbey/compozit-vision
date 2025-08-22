import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { StyleCardProps } from '../../types/furniture';
import { colors } from '../../theme/colors';

const { width: screenWidth } = Dimensions.get('window');

export const StyleCard: React.FC<StyleCardProps> = ({
  style,
  isActive,
  onLike,
  onSkip,
  onTap,
}) => {
  const formatPrice = (min: number, max: number, currency: string) => {
    if (min === max) {
      return `${currency === 'USD' ? '$' : currency}${min.toLocaleString()}`;
    }
    return `${currency === 'USD' ? '$' : currency}${min.toLocaleString()} - ${currency === 'USD' ? '$' : currency}${max.toLocaleString()}`;
  };

  const getCompatibilityText = () => {
    const styles = style.compatibility.designStyles.slice(0, 3);
    return styles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' • ');
  };

  const getPopularityColor = () => {
    if (style.popularity >= 80) return colors.primary[500];
    if (style.popularity >= 60) return colors.secondary[500];
    return colors.gray[400];
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onTap}
      activeOpacity={0.95}
    >
      {/* Main Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: style.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Popularity Badge */}
        <View style={[styles.popularityBadge, { backgroundColor: getPopularityColor() }]}>
          <Text style={styles.popularityText}>{style.popularity}%</Text>
        </View>

        {/* Visual Impact Score */}
        <View style={styles.impactScore}>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              name="star"
              size={16}
              color={i < Math.floor(style.visualImpactScore / 2) ? colors.secondary[500] : colors.gray[300]}
            />
          ))}
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        {/* Content Overlay */}
        <View style={styles.overlay}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{style.name}</Text>
            {style.description && (
              <Text style={styles.description}>{style.description}</Text>
            )}
          </View>

          <View style={styles.detailsSection}>
            {/* Price Range */}
            <View style={styles.priceContainer}>
              <Icon name="attach-money" size={20} color={colors.primary[400]} />
              <Text style={styles.price}>
                {formatPrice(style.priceRange.min, style.priceRange.max, style.priceRange.currency)}
              </Text>
            </View>

            {/* Style Categories */}
            <View style={styles.categoriesContainer}>
              {style.styleCategories.slice(0, 2).map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Compatibility Info */}
            <View style={styles.compatibilityContainer}>
              <Icon name="home" size={16} color={colors.gray[300]} />
              <Text style={styles.compatibilityText}>
                {getCompatibilityText()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Hints */}
      <View style={styles.actionHints}>
        <View style={styles.hintLeft}>
          <Icon name="close" size={24} color={colors.gray[400]} />
          <Text style={styles.hintText}>Skip</Text>
        </View>
        
        <View style={styles.hintRight}>
          <Icon name="favorite" size={24} color={colors.primary[400]} />
          <Text style={styles.hintText}>Like</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  activeContainer: {
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  popularityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  impactScore: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  detailsSection: {
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[400],
    marginLeft: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },
  actionHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  hintRight: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  hintText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
});