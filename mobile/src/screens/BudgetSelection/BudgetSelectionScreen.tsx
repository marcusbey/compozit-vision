import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

interface BudgetSelectionScreenProps {
  navigation: any;
  route: any;
}

const BudgetSelectionScreen: React.FC<BudgetSelectionScreenProps> = ({ navigation, route }) => {
  const [budgetRange, setBudgetRange] = useState([4000, 6000]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { projectName, roomType, selectedStyle } = route.params;

  const furnitureItems = [
    {
      id: 'sofa',
      name: 'Sofa',
      icon: 'bed-outline',
      priceRange: '$1,799 - 2,599',
      minPrice: 1799,
      maxPrice: 2599,
    },
    {
      id: 'table',
      name: 'Table',
      icon: 'grid-outline',
      priceRange: '$299 - 449',
      minPrice: 299,
      maxPrice: 449,
    },
    {
      id: 'chair',
      name: 'Chair',
      icon: 'square-outline',
      priceRange: '$199 - 299',
      minPrice: 199,
      maxPrice: 299,
    },
    {
      id: 'armchair',
      name: 'Armchair',
      icon: 'square-outline',
      priceRange: '$250 - 4000',
      minPrice: 250,
      maxPrice: 4000,
    },
    {
      id: 'coffee-table',
      name: 'Coffee Table',
      icon: 'grid-outline',
      priceRange: '$150 - 3000',
      minPrice: 150,
      maxPrice: 3000,
    },
    {
      id: 'floor-lamp',
      name: 'Floor Lamp',
      icon: 'bulb-outline',
      priceRange: '$100 - 2000',
      minPrice: 100,
      maxPrice: 2000,
    },
  ];

  const handleContinue = () => {
    navigation.navigate('PhotoCapture', {
      projectName,
      roomType,
      selectedStyle,
      budgetRange,
      selectedItems,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const formatBudget = (value: number) => {
    return `$${Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;
  };

  const renderFurnitureItem = (item: any) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <View key={item.id} style={styles.furnitureItem}>
        <View style={styles.furnitureInfo}>
          <View style={[
            styles.furnitureIcon,
            isSelected && styles.furnitureIconSelected
          ]}>
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color={isSelected ? '#FEFEFE' : '#D4A574'} 
            />
          </View>
          
          <View style={styles.furnitureDetails}>
            <Text style={styles.furnitureName}>{item.name}</Text>
            <Text style={styles.furniturePrice}>{item.priceRange}</Text>
          </View>
        </View>

        <View style={styles.furnitureActions}>
          <TouchableOpacity
            style={[
              styles.selectButton,
              isSelected && styles.selectButtonSelected
            ]}
            onPress={() => toggleItemSelection(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isSelected ? 'checkmark' : 'add'} 
              size={20} 
              color={isSelected ? '#FEFEFE' : '#D4A574'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" translucent={true} />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D2B28" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Budget</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Contenu principal */}
          <View style={styles.content}>
            <Text style={styles.title}>Set Your Furniture Budget</Text>
            <Text style={styles.subtitle}>
              Choose a budget range before the{'\n'}AI generates your design.
            </Text>

            {/* Budget Range Slider */}
            <View style={styles.budgetSection}>
              <Text style={styles.budgetDisplay}>
                {formatBudget(budgetRange[0])} – {formatBudget(budgetRange[1])}
              </Text>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1000}
                  maximumValue={10000}
                  step={1}
                  value={Math.round((budgetRange[0] + budgetRange[1]) / 2)}
                  onValueChange={(value) => {
                    const base = Math.round(value);
                    const range = 1000;
                    setBudgetRange([Math.max(1000, base - range), Math.min(10000, base + range)]);
                  }}
                  minimumTrackTintColor="#D4A574"
                  maximumTrackTintColor="#E6DDD1"
                  thumbTintColor="#D4A574"
                />
              </View>
            </View>

            {/* Furniture Categories */}
            <View style={styles.furnitureSection}>
              <Text style={styles.sectionTitle}>Select Furniture Categories</Text>
              <Text style={styles.sectionSubtitle}>
                Choose items you want to include in your design
              </Text>

              <View style={styles.furnitureGrid}>
                {furnitureItems.map(renderFurnitureItem)}
              </View>
            </View>

            {/* Budget Summary */}
            {selectedItems.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Selected Items</Text>
                <View style={styles.summaryItems}>
                  {selectedItems.map(itemId => {
                    const item = furnitureItems.find(f => f.id === itemId);
                    return (
                      <View key={itemId} style={styles.summaryItem}>
                        <Text style={styles.summaryItemName}>{item?.name}</Text>
                        <Text style={styles.summaryItemPrice}>{item?.priceRange}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* See Items Button */}
            <TouchableOpacity style={styles.seeItemsButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#F5F1E8', '#E6DDD1']}
                style={styles.seeItemsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.seeItemsText}>See Items</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bouton Continue */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E8C097', '#D4A574']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#2D2B28" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FBF9F4',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6DDD1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2B28',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7F73',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  budgetSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  budgetDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 30,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#D4A574',
    width: 24,
    height: 24,
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  furnitureSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2B28',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8B7F73',
    marginBottom: 25,
    lineHeight: 20,
  },
  furnitureGrid: {
    marginBottom: 20,
  },
  furnitureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6DDD1',
  },
  furnitureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  furnitureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#D4C7B5',
  },
  furnitureIconSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  furnitureDetails: {
    flex: 1,
  },
  furnitureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B28',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 14,
    color: '#8B7F73',
  },
  furnitureActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C7B5',
    marginLeft: 10,
  },
  selectButtonSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  summarySection: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6DDD1',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
    marginBottom: 15,
  },
  summaryItems: {
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemName: {
    fontSize: 14,
    color: '#2D2B28',
    fontWeight: '500',
  },
  summaryItemPrice: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '600',
  },
  seeItemsButton: {
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  seeItemsGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C7B5',
  },
  seeItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B28',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2B28',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default BudgetSelectionScreen;
