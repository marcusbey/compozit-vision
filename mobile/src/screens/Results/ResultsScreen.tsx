import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useUserStore } from '../../stores/userStore';
const { width, height } = Dimensions.get('window');

interface ResultsScreenProps {
  navigation: any;
  route: any;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const [sliderValue, setSliderValue] = useState(0.5);
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems, capturedImage } = route.params;
  const { user } = useUserStore();

  const handleNextDesign = () => {
    // Générer un nouveau design
    navigation.navigate('Processing', route.params);
  };

  const handleZoom = () => {
    // Fonction zoom (à implémenter)
  };

  const handleSaveProject = async () => {
    try {
      if (!user?.id) {
        // Rediriger vers Auth si non connecté
        navigation.navigate('Auth');
        return;
      }

      if (!firestore) {
        console.warn('Firestore non disponible, navigation vers MyProjects');
        navigation.navigate('MyProjects');
        return;
      }

      const projectsCol = collection(firestore, 'users', user.id, 'projects');
      const payload: any = {
        name: projectName,
        roomType,
        style: selectedStyle,
        budgetRange,
        selectedItems,
        capturedImage: capturedImage ?? null,
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (route.params?.projectId) {
        // Mettre à jour le projet existant
        const ref = doc(firestore, 'users', user.id, 'projects', route.params.projectId);
        await updateDoc(ref, payload);
      } else {
        // Créer un nouveau projet
        await addDoc(projectsCol, payload);
      }

      navigation.navigate('MyProjects');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du projet:', e);
    }
  };

  const handleViewProjects = () => {
    navigation.navigate('MyProjects');
  };

  const handleBack = () => {
    navigation.navigate('MyProjects');
  };

  const handleOpenSettings = () => {
    // Ouvrir l'écran de paramètres du projet (édition)
    navigation.navigate('ProjectSettings', {
      projectId: route.params?.projectId ?? null,
      projectName,
      roomType,
      selectedStyle,
      budgetRange,
      selectedItems,
      capturedImage,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{projectName}</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Contenu principal */}
          <View style={styles.content}>
            {/* Container de comparaison d'images */}
            <View style={styles.imageContainer}>
              {/* Image de fond (Enhanced) */}
              <View style={styles.imageWrapper}>
                <LinearGradient
                  colors={['#e8e8e8', '#f5f5f5']}
                  style={styles.imagePlaceholder}
                >
                  <View style={styles.enhancedRoom}>
                    {/* Simulation d'une pièce transformée avec plus de détails */}
                    <View style={styles.wall}>
                      <View style={styles.artwork} />
                      <View style={styles.wallDecor} />
                    </View>
                    <View style={styles.furniture}>
                      <View style={styles.modernSofa} />
                      <View style={styles.coffeeTable} />
                      <View style={styles.sideTable} />
                      <View style={styles.floorLamp} />
                      <View style={styles.plant} />
                    </View>
                    <View style={styles.rug} />
                    <View style={styles.lighting} />
                  </View>
                </LinearGradient>
                
                {/* Overlay pour l'image originale */}
                <View 
                  style={[
                    styles.originalOverlay, 
                    { width: width * 0.9 * sliderValue }
                  ]}
                >
                  <LinearGradient
                    colors={['#d0d0d0', '#e0e0e0']}
                    style={styles.originalRoom}
                  >
                    {/* Simulation d'une pièce originale simple */}
                    <View style={styles.simpleWall}>
                      <View style={styles.simpleFrame} />
                    </View>
                    <View style={styles.simpleFurniture}>
                      <View style={styles.simpleChair} />
                      <View style={styles.simpleTable} />
                    </View>
                  </LinearGradient>
                </View>

                {/* Ligne de séparation */}
                <View 
                  style={[
                    styles.dividerLine, 
                    { left: width * 0.9 * sliderValue - 1 }
                  ]}
                />
              </View>

              {/* Labels */}
              <View style={styles.labelsContainer}>
                <View style={styles.labelLeft}>
                  <Text style={styles.labelText}>ORIGINAL</Text>
                </View>
                <View style={styles.labelRight}>
                  <Text style={styles.labelText}>ENHANCED</Text>
                </View>
              </View>

              {/* Slider */}
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  minimumTrackTintColor="#4facfe"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#4facfe"
                />
              </View>
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNextDesign}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <Ionicons name="refresh" size={20} color="#4facfe" />
                  <Text style={styles.actionButtonText}>Re-Generate</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Informations du projet */}
            <View style={styles.projectDetails}>
              <Text style={styles.projectName}>{projectName}</Text>
              <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="home-outline" size={16} color="#b8c6db" />
                  <Text style={styles.metaText}>{roomType}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="color-palette-outline" size={16} color="#b8c6db" />
                  <Text style={styles.metaText}>{selectedStyle}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={16} color="#b8c6db" />
                  <Text style={styles.metaText}>
                    ${Math.round(budgetRange[0]).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} - ${Math.round(budgetRange[1]).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Navigation du bas retirée */}

        {/* Bouton Save Project */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProject}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="bookmark" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Save Project</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.5,
    marginBottom: 30,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedRoom: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  wall: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  artwork: {
    position: 'absolute',
    top: 15,
    right: 30,
    width: 50,
    height: 35,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  wallDecor: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: 30,
    height: 25,
    backgroundColor: '#666',
    borderRadius: 3,
  },
  furniture: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 120,
  },
  modernSofa: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    width: 100,
    height: 50,
    backgroundColor: '#4a4a4a',
    borderRadius: 10,
  },
  coffeeTable: {
    position: 'absolute',
    bottom: 10,
    left: 120,
    width: 60,
    height: 25,
    backgroundColor: '#8B4513',
    borderRadius: 6,
  },
  sideTable: {
    position: 'absolute',
    bottom: 25,
    right: 80,
    width: 30,
    height: 30,
    backgroundColor: '#654321',
    borderRadius: 4,
  },
  floorLamp: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 12,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  plant: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    width: 20,
    height: 40,
    backgroundColor: '#228B22',
    borderRadius: 10,
  },
  rug: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    height: 20,
    backgroundColor: '#8B0000',
    borderRadius: 10,
  },
  lighting: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 15,
    height: 15,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  originalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  originalRoom: {
    width: width * 0.9,
    height: '100%',
    position: 'relative',
  },
  simpleWall: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: '#e8e8e8',
  },
  simpleFrame: {
    position: 'absolute',
    top: 15,
    right: 40,
    width: 25,
    height: 20,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  simpleFurniture: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 80,
  },
  simpleChair: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 40,
    height: 35,
    backgroundColor: '#999',
    borderRadius: 4,
  },
  simpleTable: {
    position: 'absolute',
    bottom: 0,
    left: 80,
    width: 30,
    height: 15,
    backgroundColor: '#aaa',
    borderRadius: 2,
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  labelLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  labelRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b8c6db',
    letterSpacing: 1,
  },
  sliderContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#4facfe',
    width: 20,
    height: 20,
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4facfe',
    marginLeft: 8,
  },
  projectDetails: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 15,
  },
  projectMeta: {
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#b8c6db',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  saveButton: {
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
    marginLeft: 10,
  },
});

export default ResultsScreen;
