import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';

const { width } = Dimensions.get('window');

interface ProcessingScreenProps {
  navigation: any;
  route: any;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ navigation, route }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const progressAnim = new Animated.Value(0);
  
  const { projectName, roomType, selectedStyle, budgetRange, selectedItems, capturedImage } = route.params;

  const processingSteps = [
    'Analyzing your space...',
    'Detecting room elements...',
    'Applying AI transformation...',
    'Matching furniture styles...',
    'Generating design options...',
    'Finalizing your design...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            // Consume a token for the generation
            const { consumeToken } = useUserStore.getState();
            const success = await consumeToken();
            
            if (success) {
              navigation.navigate('Results', {
                projectName,
                roomType,
                selectedStyle,
                budgetRange,
                selectedItems,
                capturedImage,
              });
            } else {
              // Not enough tokens, navigate back or show error
              navigation.goBack();
            }
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.floor((progress / 100) * processingSteps.length);
    setCurrentStep(Math.min(stepIndex, processingSteps.length - 1));
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header avec tags de style */}
        <View style={styles.header}>
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Ionicons name="home" size={16} color="#4facfe" />
              <Text style={styles.tagText}>AI</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Modern</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Minimalist</Text>
            </View>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Illustration de la pièce en cours d'analyse */}
          <View style={styles.roomIllustration}>
            <LinearGradient
              colors={['#f8f9fa', '#e9ecef']}
              style={styles.roomContainer}
            >
              {/* Simulation d'une pièce en cours d'analyse */}
              <View style={styles.room}>
                <View style={styles.wall}>
                  <View style={styles.artwork} />
                </View>
                <View style={styles.furniture}>
                  <View style={[styles.sofa, { opacity: progress > 30 ? 1 : 0.3 }]} />
                  <View style={[styles.coffeeTable, { opacity: progress > 50 ? 1 : 0.3 }]} />
                  <View style={[styles.lamp, { opacity: progress > 70 ? 1 : 0.3 }]} />
                </View>
                <View style={[styles.rug, { opacity: progress > 40 ? 1 : 0.3 }]} />
              </View>
              
              {/* Overlay d'analyse avec effet de scan */}
              <View style={styles.analysisOverlay}>
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: [0, 200],
                        })
                      }]
                    }
                  ]}
                />
              </View>
            </LinearGradient>
          </View>

          {/* Texte de progression */}
          <Text style={styles.processingTitle}>
            {processingSteps[currentStep]}
          </Text>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>

          {/* Informations du projet */}
          <View style={styles.projectInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="home-outline" size={20} color="#4facfe" />
              <Text style={styles.infoText}>{roomType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="color-palette-outline" size={20} color="#4facfe" />
              <Text style={styles.infoText}>{selectedStyle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color="#4facfe" />
              <Text style={styles.infoText}>
                ${Math.round(budgetRange[0]).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} - ${Math.round(budgetRange[1]).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Message d'encouragement */}
          <View style={styles.encouragementContainer}>
            <Text style={styles.encouragementText}>
              Creating your perfect space...
            </Text>
            <Text style={styles.encouragementSubtext}>
              This usually takes 30-60 seconds
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  tagText: {
    fontSize: 14,
    color: '#4facfe',
    fontWeight: '500',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  roomIllustration: {
    width: width * 0.8,
    height: 250,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  roomContainer: {
    flex: 1,
    position: 'relative',
  },
  room: {
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
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 4,
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4facfe',
  },
  projectInfo: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  encouragementContainer: {
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 8,
  },
  encouragementSubtext: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default ProcessingScreen;
