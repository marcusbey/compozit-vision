import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';
import JourneyProgressBar from '../../components/ProgressBar/JourneyProgressBar';

interface DescriptionsScreenProps {
  navigation?: any;
  route?: any;
}

const DescriptionsScreen: React.FC<DescriptionsScreenProps> = ({ navigation }) => {
  const journeyStore = useJourneyStore();
  const [description, setDescription] = useState(journeyStore.project.descriptions || '');

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(7, 'descriptions');
  }, []);

  const handleContinue = () => {
    // Save description to journey store
    journeyStore.updateProject({ descriptions: description });
    journeyStore.completeStep('descriptions');
    NavigationHelpers.navigateToScreen('furniture');
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
          <Text style={styles.screenTitle}>Describe Your Vision</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.subtitle}>Add specific requirements or constraints (optional)</Text>
          
          <TextInput 
            style={styles.textInput}
            placeholder="e.g., Include a reading nook, pet-friendly materials..."
            placeholderTextColor="#8892b0"
            multiline
            value={description}
            onChangeText={setDescription}
            numberOfLines={4}
          />
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleContinue}>
            <Text style={styles.skipText}>Skip for now</Text>
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
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  skipText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DescriptionsScreen;