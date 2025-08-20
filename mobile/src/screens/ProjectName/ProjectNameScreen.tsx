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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                    placeholderTextColor="#8892b0"
                    maxLength={50}
                  />
                  <View style={styles.inputIcon}>
                    <Ionicons name="create-outline" size={20} color="#4facfe" />
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
                          color={roomType === room.id ? '#ffffff' : '#4facfe'} 
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
                colors={isFormValid ? ['#4facfe', '#00f2fe'] : ['#666', '#888']}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  keyboardContainer: {
    flex: 1,
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
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  inputIcon: {
    marginLeft: 10,
  },
  characterCount: {
    fontSize: 12,
    color: '#8892b0',
    textAlign: 'right',
    marginTop: 8,
  },
  roomSection: {
    marginBottom: 40,
  },
  roomSubtitle: {
    fontSize: 14,
    color: '#b8c6db',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomCardSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    borderColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roomIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  roomIconContainerSelected: {
    backgroundColor: '#4facfe',
    borderColor: '#4facfe',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  roomNameSelected: {
    color: '#ffffff',
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
    color: '#ffffff',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default ProjectNameScreen;
