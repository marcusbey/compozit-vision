import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useDesignStore } from '../../stores/designStore';
import { useProjectStore } from '../../stores/projectStore';

const CameraScreen = ({ navigation }: any) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('moderne');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('salon');
  
  const { generateDesign, isGenerating } = useDesignStore();
  const { currentProject } = useProjectStore();

  const styles_data = [
    { id: 'moderne', name: 'Moderne', emoji: '🏢' },
    { id: 'scandinave', name: 'Scandinave', emoji: '🌲' },
    { id: 'industriel', name: 'Industriel', emoji: '🏭' },
    { id: 'boheme', name: 'Bohème', emoji: '🌸' },
    { id: 'minimaliste', name: 'Minimaliste', emoji: '⚪' },
    { id: 'vintage', name: 'Vintage', emoji: '📻' },
  ];

  const roomTypes = [
    { id: 'salon', name: 'Salon', emoji: '🛋️' },
    { id: 'chambre', name: 'Chambre', emoji: '🛏️' },
    { id: 'cuisine', name: 'Cuisine', emoji: '🍳' },
    { id: 'salle_bain', name: 'Salle de bain', emoji: '🛁' },
    { id: 'bureau', name: 'Bureau', emoji: '💻' },
    { id: 'salle_manger', name: 'Salle à manger', emoji: '🍽️' },
  ];

  const handleTakePhoto = () => {
    Alert.alert(
      'Prendre une photo',
      'Choisissez une option',
      [
        { text: 'Caméra', onPress: () => openCamera() },
        { text: 'Galerie', onPress: () => openGallery() },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    // TODO: Implémenter la caméra
    setSelectedImage('https://via.placeholder.com/300x200?text=Photo+prise');
  };

  const openGallery = () => {
    // TODO: Implémenter la galerie
    setSelectedImage('https://via.placeholder.com/300x200?text=Photo+galerie');
  };

  const handleGenerateDesign = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Veuillez d\'abord prendre une photo');
      return;
    }

    if (!currentProject) {
      Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un projet');
      return;
    }

    try {
      await generateDesign(
        currentProject.id,
        selectedImage,
        selectedStyle,
        selectedRoomType
      );
      
      Alert.alert(
        'Génération lancée',
        'Votre design est en cours de génération. Vous serez notifié quand il sera prêt.',
        [{ text: 'OK', onPress: () => navigation.navigate('myProjects') }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le design');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Créer un Design</Text>
          {currentProject && (
            <Text style={styles.projectName}>
              Projet: {currentProject.name}
            </Text>
          )}
        </View>

        {/* Section Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Photo de la pièce</Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.changePhotoText}>Changer la photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.photoButtonEmoji}>📸</Text>
              <Text style={styles.photoButtonText}>Prendre une photo</Text>
              <Text style={styles.photoButtonSubtext}>
                Photographiez la pièce à transformer
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Choisir un style</Text>
          <View style={styles.optionsGrid}>
            {styles_data.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.optionCard,
                  selectedStyle === style.id && styles.optionCardSelected
                ]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Text style={styles.optionEmoji}>{style.emoji}</Text>
                <Text style={styles.optionText}>{style.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section Type de pièce */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Type de pièce</Text>
          <View style={styles.optionsGrid}>
            {roomTypes.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.optionCard,
                  selectedRoomType === room.id && styles.optionCardSelected
                ]}
                onPress={() => setSelectedRoomType(room.id)}
              >
                <Text style={styles.optionEmoji}>{room.emoji}</Text>
                <Text style={styles.optionText}>{room.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton de génération */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!selectedImage || isGenerating) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateDesign}
            disabled={!selectedImage || isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? '🎨 Génération en cours...' : '🎨 Générer le design'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  photoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoButtonEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  photoButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  photoButtonSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  changePhotoButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CameraScreen;
