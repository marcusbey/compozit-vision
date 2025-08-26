import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '../../stores/contentStore';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

const { width, height } = Dimensions.get('window');

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Remove hardcoded styles - now using database-driven content

interface OnboardingScreen2Props {
  onNext?: () => void;
  onBack?: () => void;
}

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onBack }) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Database-driven content
  const { styles: styleCategories, loadingStyles, loadStyles } = useContentStore();
  const journeyStore = useJourneyStore();

  useEffect(() => {
    // Load styles from database when component mounts
    loadStyles();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStyleSelect = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(id => id !== styleId));
    } else if (selectedStyles.length < 2) {
      setSelectedStyles([...selectedStyles, styleId]);
    }
    
    // Update journey store with selections
    journeyStore.updateOnboarding({
      selectedStyles: selectedStyles.includes(styleId) 
        ? selectedStyles.filter(id => id !== styleId)
        : [...selectedStyles, styleId].slice(0, 2) // Limit to 2
    });
  };

  const canContinue = selectedStyles.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onBack ? onBack() : NavigationHelpers.navigateToScreen('onboarding1')} style={styles.backButton} testID="back-button">
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>
            <Text style={styles.progressText}>2 of 3</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Credits Introduction */}
            <View style={styles.creditsIntro}>
              <View style={styles.creditsIcon}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <Text style={styles.creditsText}>
                You get <Text style={styles.creditsHighlight}>3 free designs</Text> to start
              </Text>
            </View>

            <Text style={styles.title}>What's Your Style?</Text>
            
            <Text style={styles.subtitle}>
              Select up to 2 design styles that inspire you. This helps our AI create personalized designs just for you.
            </Text>

            {/* Style Options Grid - Database Driven */}
            <View style={styles.styleGrid}>
              {loadingStyles ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading styles...</Text>
                </View>
              ) : styleCategories.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>No styles available</Text>
                  <Text style={styles.loadingText}>Check database connection</Text>
                </View>
              ) : (
                styleCategories.map((style) => {
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleOption,
                        isSelected && styles.styleOptionSelected
                      ]}
                      onPress={() => handleStyleSelect(style.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </View>
                    )}
                    <View style={styles.styleIconContainer}>
                      <Text style={styles.styleIcon}>{style.emoji || '🎨'}</Text>
                    </View>
                    <Text style={styles.styleName}>{style.display_name}</Text>
                    <Text style={styles.styleDescription}>{style.description || 'Stylish design choice'}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Selection Counter */}
            <View style={styles.selectionCounter}>
              <Text style={styles.counterText}>
                {selectedStyles.length}/2 styles selected
              </Text>
              {selectedStyles.length === 2 && (
                <Text style={styles.counterNote}>
                  Perfect! You can change these later in settings.
                </Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canContinue && styles.nextButtonDisabled
            ]}
            onPress={() => onNext ? onNext() : NavigationHelpers.navigateToScreen('onboarding3')}
            activeOpacity={0.8}
            disabled={!canContinue}
          >
            <LinearGradient
              colors={canContinue ? ['#4facfe', '#00f2fe'] : ['#666', '#888']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.skipText}>
            Don't worry, you can always change your preferences later
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e'
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
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#b8c6db',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  creditsIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  creditsIcon: {
    marginRight: 8,
  },
  creditsText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  creditsHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
  },
  styleOption: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  styleOptionSelected: {
    borderColor: '#4facfe',
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4facfe',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  styleIconContainer: {
    marginBottom: 12,
  },
  styleIcon: {
    fontSize: 32,
  },
  styleName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  styleDescription: {
    fontSize: 13,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectionCounter: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  counterText: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: '600',
    marginBottom: 4,
  },
  counterNote: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 20,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default OnboardingScreen2;