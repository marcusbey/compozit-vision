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
    <View style={styles.fullScreen}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Progress Bar */}
        <JourneyProgressBar />
        
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#2D2B28" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Describe Your Vision</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.subtitle}>Add specific requirements or constraints (optional)</Text>
          
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput}
              placeholder="e.g., Include a reading nook, pet-friendly materials..."
              placeholderTextColor="#B8AFA4"
              multiline
              value={description}
              onChangeText={setDescription}
              numberOfLines={4}
            />
          </View>
          
          <TouchableOpacity activeOpacity={0.9} onPress={handleContinue}>
            <LinearGradient
              colors={['#E8C097', '#D4A574']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#FBF9F4',
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
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D2B28',
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
    color: '#8B7F73',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D2B28',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#D4A574',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryButtonText: {
    color: '#2D2B28',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 16,
    color: '#8B7F73',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DescriptionsScreen;