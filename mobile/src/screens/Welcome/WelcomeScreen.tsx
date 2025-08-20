import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = async () => {
    // Marquer que l'utilisateur a vu l'écran Welcome
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    navigation.navigate('Demo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" translucent={true} />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header avec logo conceptuel */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.logoGradient}
            >
              <Ionicons name="home" size={40} color="#ffffff" />
            </LinearGradient>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to{'\n'}Compozit Vision</Text>
          
          <Text style={styles.subtitle}>
            Transform your space with{'\n'}AI-powered design
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="camera" size={24} color="#4facfe" />
              </View>
              <Text style={styles.featureText}>Capture your room</Text>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="color-wand" size={24} color="#4facfe" />
              </View>
              <Text style={styles.featureText}>AI transformation</Text>
            </View>
            
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="storefront" size={24} color="#4facfe" />
              </View>
              <Text style={styles.featureText}>Shop furniture</Text>
            </View>
          </View>
        </View>

        {/* Bouton Get Started */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>GET STARTED</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Redesign your interior with confidence
          </Text>
        </View>
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 18,
    color: '#b8c6db',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 26,
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  getStartedButton: {
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
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
  },
});

export default WelcomeScreen;
