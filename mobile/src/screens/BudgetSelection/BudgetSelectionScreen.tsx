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
              color={isSelected ? '#ffffff' : '#4facfe'} 
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
              color={isSelected ? '#ffffff' : '#4facfe'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                  minimumTrackTintColor="#4facfe"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#4facfe"
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
                colors={['rgba(79, 172, 254, 0.1)', 'rgba(79, 172, 254, 0.2)']}
                style={styles.seeItemsGradient}
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
              colors={['#4facfe', '#00f2fe']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
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
    color: '#4facfe',
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
    backgroundColor: '#4facfe',
    width: 24,
    height: 24,
    shadowColor: '#4facfe',
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
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#b8c6db',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  furnitureIconSelected: {
    backgroundColor: '#4facfe',
    borderColor: '#4facfe',
  },
  furnitureDetails: {
    flex: 1,
  },
  furnitureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  furniturePrice: {
    fontSize: 14,
    color: '#b8c6db',
  },
  furnitureActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    marginLeft: 10,
  },
  selectButtonSelected: {
    backgroundColor: '#4facfe',
    borderColor: '#4facfe',
  },
  summarySection: {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    color: '#ffffff',
    fontWeight: '500',
  },
  summaryItemPrice: {
    fontSize: 14,
    color: '#4facfe',
    fontWeight: '600',
  },
  seeItemsButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 40,
  },
  seeItemsGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  seeItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4facfe',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default BudgetSelectionScreen;
