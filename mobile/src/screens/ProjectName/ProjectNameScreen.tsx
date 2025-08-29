import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ProjectNameScreenProps {
  navigation: any;
}

const ProjectNameScreen: React.FC<ProjectNameScreenProps> = ({ navigation }) => {
  const [projectName, setProjectName] = useState('');
  const [roomType, setRoomType] = useState('');

  const roomTypes = [
    { id: 'living', name: 'Living Room', icon: 'home' },
    { id: 'bedroom', name: 'Bedroom', icon: 'bed' },
    { id: 'kitchen', name: 'Kitchen', icon: 'restaurant' },
    { id: 'bathroom', name: 'Bathroom', icon: 'water' },
    { id: 'office', name: 'Office', icon: 'briefcase' },
    { id: 'dining', name: 'Dining Room', icon: 'wine' },
  ];

  const handleContinue = () => {
    if (projectName.trim() && roomType) {
      navigation.navigate('StyleSelection', {
        projectName: projectName.trim(),
        roomType,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = projectName.trim().length > 0 && roomType.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" translucent={true} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.gradient}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#2D2B28" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Details</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Contenu principal */}
            <View style={styles.content}>
              <Text style={styles.title}>Name Your Project</Text>
              <Text style={styles.subtitle}>
                Give your room transformation a memorable name
              </Text>

              {/* Input pour le nom du projet */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Project Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={projectName}
                    onChangeText={setProjectName}
                    placeholder="e.g., My Dream Living Room"
                    placeholderTextColor="#B8AFA4"
                    maxLength={50}
                  />
                  <View style={styles.inputIcon}>
                    <Ionicons name="create-outline" size={20} color="#D4A574" />
                  </View>
                </View>
                <Text style={styles.characterCount}>
                  {projectName.length}/50 characters
                </Text>
              </View>

              {/* Sélection du type de pièce */}
              <View style={styles.roomSection}>
                <Text style={styles.inputLabel}>Room Type</Text>
                <Text style={styles.roomSubtitle}>
                  Select the type of room you want to transform
                </Text>
                
                <View style={styles.roomGrid}>
                  {roomTypes.map((room) => (
                    <TouchableOpacity
                      key={room.id}
                      style={[
                        styles.roomCard,
                        roomType === room.id && styles.roomCardSelected
                      ]}
                      onPress={() => setRoomType(room.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.roomIconContainer,
                        roomType === room.id && styles.roomIconContainerSelected
                      ]}>
                        <Ionicons 
                          name={room.icon as any} 
                          size={24} 
                          color={roomType === room.id ? '#FEFEFE' : '#2D2B28'} 
                        />
                      </View>
                      <Text style={[
                        styles.roomName,
                        roomType === room.id && styles.roomNameSelected
                      ]}>
                        {room.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bouton Continue */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isFormValid && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isFormValid}
            >
              <LinearGradient
                colors={isFormValid ? ['#E8C097', '#D4A574'] : ['#B8AFA4', '#8B7F73']}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  keyboardContainer: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
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
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D2B28',
    fontWeight: '500',
  },
  inputIcon: {
    marginLeft: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#B8AFA4',
    textAlign: 'right',
    marginTop: 8,
  },
  roomSection: {
    marginBottom: 40,
  },
  roomSubtitle: {
    fontSize: 14,
    color: '#8B7F73',
    marginBottom: 20,
    lineHeight: 20,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
    width: '48%',
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  roomCardSelected: {
    backgroundColor: '#F5F1E8',
    borderColor: '#D4A574',
    borderWidth: 2,
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  roomIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8C097',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4C7B5',
  },
  roomIconContainerSelected: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2B28',
    textAlign: 'center',
  },
  roomNameSelected: {
    color: '#2D2B28',
    fontWeight: '700',
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
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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

export default ProjectNameScreen;
