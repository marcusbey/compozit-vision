import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../stores/userStore';
import { useJourneyStore } from '../../stores/journeyStore';
const { width, height } = Dimensions.get('window');

interface ResultsScreenProps {
  navigation: any;
  route: any;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const [sliderValue, setSliderValue] = useState(0.5);
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems, capturedImage } = route.params;
  const { user } = useUserStore();
  const journeyStore = useJourneyStore();

  // Set current step when screen mounts
  useEffect(() => {
    journeyStore.setCurrentStep(11, 'results');
  }, []);

  const handleNextDesign = () => {
    // Vérifier l'authentification
    if (!user?.id) {
      navigation.navigate('Auth');
      return;
    }

    // Vérifier les crédits disponibles avant de lancer la régénération
    const tokens = user?.nbToken ?? 0;
    if (tokens <= 0) {
      navigation.navigate('BuyCredits', {
        returnScreen: 'Processing',
        returnParams: route.params,
      });
      return;
    }

    // Générer un nouveau design
    navigation.navigate('processing', route.params);
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

      const now = new Date().toISOString();
      const payload: any = {
        user_id: user.id,
        name: projectName,
        room_type: roomType,
        style_preferences: [selectedStyle],
        budget_min: typeof budgetRange?.[0] === 'number' ? budgetRange[0] : parseFloat(String(budgetRange?.[0] || 0).replace('$', '')),
        budget_max: typeof budgetRange?.[1] === 'number' ? budgetRange[1] : parseFloat(String(budgetRange?.[1] || 0).replace('$', '')),
        original_images: capturedImage ? [{ url: capturedImage }] : [],
        status: 'completed',
        updated_at: now,
      };

      if (route.params?.projectId) {
        // Mettre à jour le projet existant
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', route.params.projectId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Erreur lors de la mise à jour du projet:', error);
          return;
        }
      } else {
        // Créer un nouveau projet
        payload.created_at = now;
        const { error } = await supabase
          .from('projects')
          .insert(payload);
        
        if (error) {
          console.error('Erreur lors de la création du projet:', error);
          return;
        }
      }

      navigation.navigate('myProjects');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du projet:', e);
    }
  };

  const handleViewProjects = () => {
    navigation.navigate('myProjects');
  };

  const handleBack = () => {
    navigation.navigate('myProjects');
  };

  const handleOpenSettings = () => {
    // Ouvrir l'écran de paramètres du projet (édition)
    navigation.navigate('projectSettings', {
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
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2D2B28" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{projectName}</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color="#2D2B28" />
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
                  colors={['#e8e8e8', '#f5f5f5'] as [string, string]}
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
                    colors={['#d0d0d0', '#e0e0e0'] as [string, string]}
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
                  minimumTrackTintColor="#D4A574"
                  maximumTrackTintColor="#E6DDD1"
                  thumbTintColor="#D4A574"
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
                  <Ionicons name="refresh" size={20} color="#D4A574" />
                  <Text style={styles.actionButtonText}>Re-Generate</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Informations du projet */}
            <View style={styles.projectDetails}>
              <Text style={styles.projectName}>{projectName}</Text>
              <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="home-outline" size={16} color="#8B7F73" />
                  <Text style={styles.metaText}>{roomType}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="color-palette-outline" size={16} color="#8B7F73" />
                  <Text style={styles.metaText}>{selectedStyle}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={16} color="#8B7F73" />
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
              colors={['#E8C097', '#D4A574'] as [string, string]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="bookmark" size={20} color="#2D2B28" />
              <Text style={styles.buttonText}>Save Project</Text>
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
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2B28',
    letterSpacing: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEFEFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
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
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FEFEFE',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E6DDD1',
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
    backgroundColor: '#D4A574',
    shadowColor: '#D4A574',
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
    color: '#8B7F73',
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
    backgroundColor: '#D4A574',
    width: 20,
    height: 20,
    shadowColor: '#D4A574',
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
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    color: '#D4A574',
    marginLeft: 8,
  },
  projectDetails: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2B28',
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
    color: '#8B7F73',
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
    marginLeft: 10,
  },
});

export default ResultsScreen;
