import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface BrandContentCardProps {
  brand: BrandPartner;
  onPress: () => void;
}

export const BrandContentCard: React.FC<BrandContentCardProps> = ({
  brand,
  onPress,
}) => {
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <TouchableOpacity style={styles.brandCard} onPress={onPress}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <Image source={{ uri: brand.logo }} style={styles.brandLogo} />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.brandCategory}>{brand.category}</Text>
        </View>
        {brand.isSponsored && (
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
          </View>
        )}
      </View>

      {/* Product Preview */}
      <ScrollView 
        horizontal 
        style={styles.productsContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsContent}
      >
        {brand.products.map((product, index) => (
          <View key={product.id} style={styles.productCard}>
            <Image 
              source={{ uri: product.image }} 
              style={styles.productImage}
              defaultSource={require('../../../assets/placeholder-image.png')}
            />
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>
              {formatPrice(product.price, product.currency)}
            </Text>
          </View>
        ))}
        
        {/* View All Button */}
        <TouchableOpacity style={styles.viewAllCard}>
          <View style={styles.viewAllContent}>
            <Ionicons name="arrow-forward" size={20} color="#D4A574" />
            <Text style={styles.viewAllText}>View All</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Brand Actions */}
      <View style={styles.brandActions}>
        <TouchableOpacity style={styles.followButton}>
          <Ionicons name="add" size={16} color="#D4A574" />
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.visitButton}>
          <Text style={styles.visitText}>Visit Store</Text>
          <Ionicons name="external-link" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  brandCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3EF',
  },
  brandInfo: {
    flex: 1,
    marginLeft: 12,
  },
  brandName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 2,
  },
  brandCategory: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    textTransform: 'capitalize',
  },
  sponsoredBadge: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#0A0A0A',
    fontWeight: '600',
  },
  productsContainer: {
    marginBottom: 16,
  },
  productsContent: {
    gap: 12,
  },
  productCard: {
    width: 100,
  },
  productImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F6F3EF',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#D4A574',
  },
  viewAllCard: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F6F3EF',
    borderWidth: 1,
    borderColor: '#E8DDD1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllContent: {
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    fontWeight: '500',
  },
  brandActions: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F6F3EF',
    borderRadius: 8,
    gap: 6,
  },
  followText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    gap: 6,
  },
  visitText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});