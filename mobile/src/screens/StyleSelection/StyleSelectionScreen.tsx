import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { SvgUri } from 'react-native-svg'; // Commented out for now

import { AssetManager, StyleType, StyleMetadata } from '../../assets';

const { width } = Dimensions.get('window');

interface StyleSelectionScreenProps {
  navigation: any;
  route: any;
}

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const { projectName, roomType } = route.params;

  // Get enhanced style data with illustrations
  const styles_data = AssetManager.getAllStyles().slice(0, 4).map(({ style, metadata }) => ({
    id: style,
    name: metadata.name,
    subtitle: metadata.mood,
    description: metadata.description,
    illustration: metadata.illustration,
    colorPalette: metadata.colorPalette,
    keyFeatures: metadata.keyFeatures,
  }));

  const handleContinue = () => {
    if (selectedStyle) {
      navigation.navigate('BudgetSelection', {
        projectName,
        roomType,
        selectedStyle,
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderStyleCard = (style: any) => {
    const isSelected = selectedStyle === style.id;
    
    return (
      <TouchableOpacity
        key={style.id}
        style={[
          styles.styleCard,
          isSelected && styles.styleCardSelected
        ]}
        onPress={() => setSelectedStyle(style.id)}
        activeOpacity={0.8}
      >
        {/* Enhanced illustration */}
        <View style={[
          styles.styleImageContainer,
          isSelected && styles.styleImageContainerSelected
        ]}>
          <LinearGradient
            colors={style.colorPalette?.slice(0, 2) || ['#f8f9fa', '#e9ecef']}
            style={styles.styleImageGradient}
          >
            {style.illustration ? (
              <View style={styles.illustrationWrapper}>
                {/* Style illustration placeholder */}
                <Ionicons 
                  name="home" 
                  size={48} 
                  color={isSelected ? '#4facfe' : '#666'} 
                />
              </View>
            ) : (
              renderStyleIllustration(style.id, isSelected)
            )}
          </LinearGradient>
          
          {/* Color palette preview */}
          {style.colorPalette && (
            <View style={styles.colorPalettePreview}>
              {style.colorPalette.slice(0, 4).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    isSelected && styles.colorSwatchSelected,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Contenu de la carte */}
        <View style={styles.styleContent}>
          <View style={styles.styleHeader}>
            <Text style={[
              styles.styleName,
              isSelected && styles.styleNameSelected
            ]}>
              {style.name}
            </Text>
            <Text style={[
              styles.styleSubtitle,
              isSelected && styles.styleSubtitleSelected
            ]}>
              {style.subtitle}
            </Text>
          </View>
          
          <Text style={[
            styles.styleDescription,
            isSelected && styles.styleDescriptionSelected
          ]}>
            {style.description}
          </Text>

          {/* Indicateur de sélection */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#4facfe" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStyleGradient = (styleId: string): readonly [string, string] => {
    switch (styleId) {
      case 'modern':
        return ['#f8f9fa', '#e9ecef'] as const;
      case 'classic':
        return ['#f5f3f0', '#e8e2db'] as const;
      case 'eclectic':
        return ['#fff3e0', '#ffe0b2'] as const;
      case 'minimalist':
        return ['#fafafa', '#f0f0f0'] as const;
      default:
        return ['#f8f9fa', '#e9ecef'] as const;
    }
  };

  const renderStyleIllustration = (styleId: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#4facfe' : '#666';
    
    switch (styleId) {
      case 'modern':
        return (
          <View style={styles.illustration}>
            <View style={[styles.modernSofa, { backgroundColor: iconColor }]} />
            <View style={[styles.modernTable, { backgroundColor: iconColor }]} />
            <View style={[styles.modernLamp, { backgroundColor: iconColor }]} />
          </View>
        );
      case 'classic':
        return (
          <View style={styles.illustration}>
            <View style={[styles.classicChair, { backgroundColor: iconColor }]} />
            <View style={[styles.classicTable, { backgroundColor: iconColor }]} />
            <View style={[styles.classicPlant, { backgroundColor: iconColor }]} />
          </View>
        );
      case 'eclectic':
        return (
          <View style={styles.illustration}>
            <View style={[styles.eclecticSofa, { backgroundColor: iconColor }]} />
            <View style={[styles.eclecticArt, { backgroundColor: iconColor }]} />
            <View style={[styles.eclecticRug, { backgroundColor: iconColor }]} />
          </View>
        );
      case 'minimalist':
        return (
          <View style={styles.illustration}>
            <View style={[styles.minimalChair, { backgroundColor: iconColor }]} />
            <View style={[styles.minimalTable, { backgroundColor: iconColor }]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Style</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Contenu principal */}
          <View style={styles.content}>
            <Text style={styles.title}>Interior Style</Text>
            <Text style={styles.subtitle}>
              Select the design style that matches your vision
            </Text>

            {/* Grille des styles */}
            <View style={styles.stylesGrid}>
              {styles_data.map(renderStyleCard)}
            </View>
          </View>
        </ScrollView>

        {/* Bouton Continue */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedStyle && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedStyle}
          >
            <LinearGradient
              colors={selectedStyle ? ['#4facfe', '#00f2fe'] : ['#666', '#888']}
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
  stylesGrid: {
    marginBottom: 40,
  },
  styleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  styleCardSelected: {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    borderColor: '#4facfe',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  styleImageContainer: {
    height: 120,
    overflow: 'hidden',
  },
  styleImageContainerSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#4facfe',
  },
  styleImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modern style illustrations
  modernSofa: {
    position: 'absolute',
    width: 60,
    height: 25,
    borderRadius: 8,
    bottom: 20,
    left: 30,
  },
  modernTable: {
    position: 'absolute',
    width: 30,
    height: 15,
    borderRadius: 4,
    bottom: 15,
    right: 40,
  },
  modernLamp: {
    position: 'absolute',
    width: 8,
    height: 40,
    borderRadius: 4,
    top: 20,
    right: 30,
  },
  // Classic style illustrations
  classicChair: {
    position: 'absolute',
    width: 40,
    height: 35,
    borderRadius: 6,
    bottom: 20,
    left: 40,
  },
  classicTable: {
    position: 'absolute',
    width: 35,
    height: 20,
    borderRadius: 4,
    bottom: 15,
    right: 30,
  },
  classicPlant: {
    position: 'absolute',
    width: 15,
    height: 30,
    borderRadius: 8,
    top: 25,
    right: 40,
  },
  // Eclectic style illustrations
  eclecticSofa: {
    position: 'absolute',
    width: 50,
    height: 30,
    borderRadius: 10,
    bottom: 20,
    left: 35,
  },
  eclecticArt: {
    position: 'absolute',
    width: 25,
    height: 20,
    borderRadius: 3,
    top: 25,
    right: 35,
  },
  eclecticRug: {
    position: 'absolute',
    width: 70,
    height: 10,
    borderRadius: 5,
    bottom: 10,
    alignSelf: 'center',
  },
  // Minimalist style illustrations
  minimalChair: {
    position: 'absolute',
    width: 35,
    height: 30,
    borderRadius: 4,
    bottom: 25,
    left: 50,
  },
  minimalTable: {
    position: 'absolute',
    width: 25,
    height: 12,
    borderRadius: 2,
    bottom: 20,
    right: 50,
  },
  styleContent: {
    padding: 20,
    position: 'relative',
  },
  styleHeader: {
    marginBottom: 12,
  },
  styleName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  styleNameSelected: {
    color: '#4facfe',
  },
  styleSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b8c6db',
  },
  styleSubtitleSelected: {
    color: '#4facfe',
  },
  styleDescription: {
    fontSize: 14,
    color: '#8892b0',
    lineHeight: 20,
  },
  styleDescriptionSelected: {
    color: '#b8c6db',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
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
  // Enhanced illustration styles
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPalettePreview: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  colorSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  colorSwatchSelected: {
    borderColor: '#4facfe',
    borderWidth: 2,
  },
});

export default StyleSelectionScreen;
