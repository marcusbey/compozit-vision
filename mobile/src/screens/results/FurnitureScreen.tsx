import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import JourneyProgressBar from '../../components/ProgressBar/JourneyProgressBar';

interface FurnitureScreenProps {
  navigation?: any;
  route?: any;
}

const FurnitureScreen: React.FC<FurnitureScreenProps> = ({ navigation }) => {
  const journeyStore = useJourneyStore();
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>(
    journeyStore.project.furniturePreferences || []
  );

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(7, 'furniture');
  }, []);

  const furnitureOptions = [
    { id: 'modern-sofa', emoji: '🛋️', name: 'Modern Sofa' },
    { id: 'classic-chairs', emoji: '🪑', name: 'Classic Chairs' },
    { id: 'dining-table', emoji: '🪑', name: 'Dining Table' },
    { id: 'bed-frame', emoji: '🛏️', name: 'Bed Frame' },
    { id: 'coffee-table', emoji: '☕', name: 'Coffee Table' },
    { id: 'bookshelf', emoji: '📚', name: 'Bookshelf' },
  ];

  const handleFurnitureToggle = (furnitureId: string) => {
    setSelectedFurniture(prev => {
      if (prev.includes(furnitureId)) {
        return prev.filter(id => id !== furnitureId);
      } else {
        return [...prev, furnitureId];
      }
    });
  };

  const handleContinue = () => {
    // Save furniture preferences to journey store
    journeyStore.updateProject({ furniturePreferences: selectedFurniture });
    journeyStore.completeStep('furniture');
    NavigationHelpers.navigateToScreen('budget');
  };

  const goBack = () => {
    NavigationHelpers.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <JourneyProgressBar />
      
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2D2B28" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.stepIndicator}>Step 7 of 10</Text>
          <Text style={styles.screenTitle}>Furniture Preferences</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Select furniture styles you love (optional)</Text>
        
        <View style={styles.furnitureGrid}>
          {furnitureOptions.map((furniture) => (
            <TouchableOpacity 
              key={furniture.id}
              style={[
                styles.furnitureOption,
                selectedFurniture.includes(furniture.id) && styles.furnitureOptionSelected
              ]}
              onPress={() => handleFurnitureToggle(furniture.id)}
              activeOpacity={0.7}
            >
              {selectedFurniture.includes(furniture.id) && (
                <View style={styles.furnitureCheckmark}>
                  <Ionicons name="checkmark" size={16} color="#FEFEFE" />
                </View>
              )}
              <Text style={styles.furnitureEmoji}>{furniture.emoji}</Text>
              <Text style={[
                styles.furnitureText,
                selectedFurniture.includes(furniture.id) && styles.furnitureTextSelected
              ]}>{furniture.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionText}>
            {selectedFurniture.length > 0 
              ? `${selectedFurniture.length} furniture types selected`
              : 'No furniture selected (we\'ll suggest everything)'
            }
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.9}>
          <LinearGradient
            colors={['#E8C097', '#D4A574']}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4', // warm beige background
  },
  screenHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEFEFE', // soft white
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  titleContainer: {
    marginTop: 20,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4A574', // brand color
    letterSpacing: 1,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2D2B28', // warm dark text
    lineHeight: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7F73', // warm gray
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  furnitureOption: {
    backgroundColor: '#FEFEFE', // soft white
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '31%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6DDD1', // warm light border
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  furnitureOptionSelected: {
    backgroundColor: '#FEFEFE',
    borderColor: '#D4A574', // brand color
    borderWidth: 2,
    shadowColor: '#D4A574',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  furnitureCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4A574', // brand color
    justifyContent: 'center',
    alignItems: 'center',
  },
  furnitureEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  furnitureText: {
    fontSize: 14,
    color: '#8B7F73', // warm gray
    fontWeight: '500',
    textAlign: 'center',
  },
  furnitureTextSelected: {
    color: '#2D2B28', // warm dark text when selected
    fontWeight: '600',
  },
  selectionSummary: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#F5F1E8', // bgSecondary
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6DDD1', // warm light border
  },
  selectionText: {
    fontSize: 15,
    color: '#D4A574', // brand color
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#2D2B28', // warm dark text
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default FurnitureScreen;