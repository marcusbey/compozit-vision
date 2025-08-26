import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
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
    journeyStore.setCurrentStep(8, 'furniture');
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
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Progress Bar */}
        <JourneyProgressBar />
        
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Furniture Preferences</Text>
        </View>
        
        <View style={styles.content}>
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
              >
                {selectedFurniture.includes(furniture.id) && (
                  <View style={styles.furnitureCheckmark}>
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </View>
                )}
                <Text style={styles.furnitureEmoji}>{furniture.emoji}</Text>
                <Text style={styles.furnitureText}>{furniture.name}</Text>
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
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    marginRight: 56,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  furnitureOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
  },
  furnitureOptionSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  furnitureCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  furnitureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  furnitureText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectionSummary: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.2)',
  },
  selectionText: {
    fontSize: 14,
    color: '#4facfe',
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#4facfe',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FurnitureScreen;