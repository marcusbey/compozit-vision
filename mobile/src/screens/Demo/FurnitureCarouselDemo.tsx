import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { FurnitureSelectionScreen } from '../FurnitureSelection';
import { RoomType } from '../../types/furniture';
import { colors } from '../../theme/colors';

/**
 * Demo screen to showcase the FurnitureCarousel and CustomPrompt components
 * This demonstrates the professional-grade swipe interactions and gesture handling
 */
export const FurnitureCarouselDemo: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[50]} />
      
      {/* Demo Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Furniture Style Carousel Demo</Text>
        <Text style={styles.subtitle}>
          Professional swipe interactions with Heart/X selection system
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>How to use:</Text>
        <Text style={styles.instructionText}>
          • Swipe RIGHT or tap ❤️ to like a style{'\n'}
          • Swipe LEFT or tap ✕ to skip{'\n'}
          • Swipe UP for more details{'\n'}
          • Swipe DOWN for quick reject{'\n'}
          • Use the custom prompt for specific requirements
        </Text>
      </View>

      {/* Main Demo Content */}
      <View style={styles.demoContent}>
        <FurnitureSelectionScreen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.primary[50],
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[800],
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: colors.primary[700],
    lineHeight: 18,
  },
  demoContent: {
    flex: 1,
  },
});