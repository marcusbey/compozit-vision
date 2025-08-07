// Style Quiz Screen - Design Preference Assessment
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingProgress } from './components/OnboardingProgress';
import { DesignStyle } from '../../../infrastructure/auth/types';

const { width } = Dimensions.get('window');

interface StyleOption {
  id: DesignStyle;
  name: string;
  description: string;
  image: string; // In a real app, this would be an actual image URI
  colors: string[];
}

const styleOptions: StyleOption[] = [
  {
    id: DesignStyle.MODERN,
    name: 'Modern',
    description: 'Clean lines, minimal clutter, neutral colors',
    image: '🏢',
    colors: ['#FFFFFF', '#F5F5F7', '#1D1D1F']
  },
  {
    id: DesignStyle.TRADITIONAL,
    name: 'Traditional',
    description: 'Classic elegance, rich fabrics, warm tones',
    image: '🏛️',
    colors: ['#8B4513', '#D2691E', '#F5DEB3']
  },
  {
    id: DesignStyle.MINIMALIST,
    name: 'Minimalist',
    description: 'Less is more, functional design, open spaces',
    image: '⚪',
    colors: ['#FFFFFF', '#F8F8F8', '#E5E5E7']
  },
  {
    id: DesignStyle.INDUSTRIAL,
    name: 'Industrial',
    description: 'Raw materials, exposed elements, urban vibe',
    image: '🏭',
    colors: ['#2F2F2F', '#8B4513', '#CD853F']
  },
  {
    id: DesignStyle.SCANDINAVIAN,
    name: 'Scandinavian',
    description: 'Light woods, cozy textures, hygge feeling',
    image: '🌲',
    colors: ['#F5F5DC', '#DEB887', '#8FBC8F']
  },
  {
    id: DesignStyle.BOHEMIAN,
    name: 'Bohemian',
    description: 'Eclectic mix, vibrant colors, global influences',
    image: '🌺',
    colors: ['#FFB6C1', '#DDA0DD', '#F0E68C']
  }
];

interface StyleCardProps {
  style: StyleOption;
  selected: boolean;
  onSelect: () => void;
  animationDelay: number;
}

const StyleCard: React.FC<StyleCardProps> = ({ style, selected, onSelect, animationDelay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const selectionAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, animationDelay]);

  useEffect(() => {
    Animated.timing(selectionAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected, selectionAnim]);

  const borderColor = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E5EA', '#007AFF'],
  });

  const shadowOpacity = selectionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.styleCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          borderColor,
          shadowOpacity,
        }
      ]}
    >
      <TouchableOpacity
        onPress={onSelect}
        style={styles.styleCardContent}
        activeOpacity={0.7}
      >
        <View style={styles.styleImageContainer}>
          <Text style={styles.styleEmoji}>{style.image}</Text>
          <View style={styles.colorPalette}>
            {style.colors.map((color, index) => (
              <View
                key={index}
                style={[styles.colorSwatch, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.styleInfo}>
          <Text style={styles.styleName}>{style.name}</Text>
          <Text style={styles.styleDescription}>{style.description}</Text>
        </View>

        {selected && (
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const StyleQuizScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedStyles, setSelectedStyles] = useState<DesignStyle[]>([]);
  const [currentQuestion] = useState(1);
  const totalQuestions = 5; // This would be dynamic in a real quiz

  const handleStyleSelect = (styleId: DesignStyle) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        // Allow multiple selections but limit to 3
        if (prev.length >= 3) {
          return [...prev.slice(1), styleId];
        }
        return [...prev, styleId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedStyles.length === 0) return;
    
    // Store selected styles in context or async storage
    // @ts-ignore
    navigation.navigate('BudgetSetup', { selectedStyles });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <OnboardingProgress
        currentStep={currentQuestion}
        totalSteps={totalQuestions}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>What's your style?</Text>
          <Text style={styles.subtitle}>
            Select up to 3 design styles that speak to you.
            We'll use this to personalize your experience.
          </Text>
        </View>

        <View style={styles.stylesGrid}>
          {styleOptions.map((style, index) => (
            <StyleCard
              key={style.id}
              style={style}
              selected={selectedStyles.includes(style.id)}
              onSelect={() => handleStyleSelect(style.id)}
              animationDelay={index * 100}
            />
          ))}
        </View>

        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>
            {selectedStyles.length === 0
              ? 'Select at least 1 style to continue'
              : selectedStyles.length === 1
              ? '1 style selected'
              : `${selectedStyles.length} styles selected`}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { opacity: selectedStyles.length === 0 ? 0.5 : 1 }
          ]}
          onPress={handleContinue}
          disabled={selectedStyles.length === 0}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6E6E73',
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stylesGrid: {
    paddingHorizontal: 16,
  },
  styleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  styleCardContent: {
    padding: 20,
    position: 'relative',
  },
  styleImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  styleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  styleInfo: {
    alignItems: 'center',
  },
  styleName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  styleDescription: {
    fontSize: 16,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionIndicator: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#6E6E73',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});