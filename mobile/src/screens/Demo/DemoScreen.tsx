import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

interface DemoScreenProps {
  navigation: any;
}

const DemoScreen: React.FC<DemoScreenProps> = ({ navigation }) => {
  const [sliderValue, setSliderValue] = useState(0.5);

  const handleContinue = () => {
    navigation.navigate('ProjectName');
  };

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.headerTitle}>See the Magic</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          <Text style={styles.title}>Transform Your Space</Text>
          <Text style={styles.subtitle}>
            See how AI can redesign your room in seconds
          </Text>

          {/* Container de comparaison d'images */}
          <View style={styles.imageContainer}>
            {/* Image de fond (Enhanced) */}
            <View style={styles.imageWrapper}>
              <LinearGradient
                colors={['#e8e8e8', '#f5f5f5']}
                style={styles.imagePlaceholder}
              >
                <View style={styles.enhancedRoom}>
                  {/* Simulation d'une pièce transformée */}
                  <View style={styles.wall}>
                    <View style={styles.artwork} />
                  </View>
                  <View style={styles.furniture}>
                    <View style={styles.sofa} />
                    <View style={styles.coffeeTable} />
                    <View style={styles.lamp} />
                  </View>
                  <View style={styles.rug} />
                </View>
              </LinearGradient>
              
              {/* Overlay pour l'image originale */}
              <View 
                style={[
                  styles.originalOverlay, 
                  { width: width * 0.8 * sliderValue }
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
                  { left: width * 0.8 * sliderValue - 1 }
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
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instruction}>
              <Ionicons name="finger-print" size={20} color="#4facfe" />
              <Text style={styles.instructionText}>Slide to compare</Text>
            </View>
          </View>
        </View>

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  content: {
    flex: 1,
    alignItems: 'center',
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
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
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
    height: 60,
    backgroundColor: '#f0f0f0',
  },
  artwork: {
    position: 'absolute',
    top: 10,
    right: 30,
    width: 40,
    height: 30,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  furniture: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 80,
  },
  sofa: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    width: 80,
    height: 40,
    backgroundColor: '#666',
    borderRadius: 8,
  },
  coffeeTable: {
    position: 'absolute',
    bottom: 0,
    left: 100,
    width: 40,
    height: 20,
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },
  lamp: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 15,
    height: 50,
    backgroundColor: '#444',
    borderRadius: 2,
  },
  rug: {
    position: 'absolute',
    bottom: 10,
    left: 30,
    right: 30,
    height: 15,
    backgroundColor: '#8B0000',
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
    width: width * 0.8,
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
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  instructionText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
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

export default DemoScreen;
