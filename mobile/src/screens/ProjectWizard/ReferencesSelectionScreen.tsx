import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useJourneyStore } from '../../stores/journeyStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Design Tokens
const tokens = {
  color: {
    bgApp: '#FBF9F4',
    bgSurface: '#FEFEFE',
    textPrimary: '#2D2B28',
    textSecondary: '#8B7F73',
    textMuted: '#B8AFA4',
    brand: '#D4A574',
    brandLight: '#E8C097',
    border: '#E6DDD1',
    success: '#7FB069',
  },
  spacing: {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
  },
  radius: {
    sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  },
};

const { width } = Dimensions.get('window');

interface ReferencesSelectionScreenProps {
  navigation?: any;
  route?: any;
}

// Mock reference images data
const references_data = [
  {
    id: 'ref1',
    name: 'Cozy Living Room',
    category: 'Living Room',
    style: 'Scandinavian',
    color: '#F5F1E8',
  },
  {
    id: 'ref2',
    name: 'Modern Kitchen',
    category: 'Kitchen',
    style: 'Modern',
    color: '#2D2B28',
  },
  {
    id: 'ref3',
    name: 'Industrial Loft',
    category: 'Bedroom',
    style: 'Industrial',
    color: '#8B7F73',
  },
  {
    id: 'ref4',
    name: 'Bohemian Corner',
    category: 'Living Room',
    style: 'Bohemian',
    color: '#D4A574',
  },
  {
    id: 'ref5',
    name: 'Classic Study',
    category: 'Office',
    style: 'Traditional',
    color: '#B8935F',
  },
  {
    id: 'ref6',
    name: 'Minimal Bedroom',
    category: 'Bedroom',
    style: 'Minimalist',
    color: '#E6DDD1',
  },
];

const ReferencesSelectionScreen: React.FC<ReferencesSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();

  useEffect(() => {
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

  const handleReferenceSelect = (referenceId: string) => {
    setSelectedReferences(prev => {
      if (prev.includes(referenceId)) {
        return prev.filter(id => id !== referenceId);
      } else if (prev.length < 3) { // Limit to 3 references
        return [...prev, referenceId];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    // Update journey store
    journeyStore.updateDesignInputs({
      referenceImages: selectedReferences,
    });
    
    // Mark step as completed
    journeyStore.completeStep('referencesSelection');
    
    // Continue to descriptions (or skip if no references selected)
    NavigationHelpers.navigateToScreen('descriptions');
  };

  const handleSkip = () => {
    // Mark step as completed without selecting references
    journeyStore.completeStep('referencesSelection');
    NavigationHelpers.navigateToScreen('descriptions');
  };

  const handleBack = () => {
    NavigationHelpers.navigateToScreen('styleSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reference Images</Text>
          <Text style={styles.headerSubtitle}>Choose up to 3 inspiration images</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              {selectedReferences.length}/3 selected
            </Text>
            <Text style={styles.selectionSubtext}>
              These images will inspire your AI-generated design
            </Text>
          </View>

          <View style={styles.referencesGrid}>
            {references_data.map((reference) => (
              <TouchableOpacity
                key={reference.id}
                style={[
                  styles.referenceCard,
                  selectedReferences.includes(reference.id) && styles.selectedReferenceCard
                ]}
                onPress={() => handleReferenceSelect(reference.id)}
                activeOpacity={0.9}
                disabled={!selectedReferences.includes(reference.id) && selectedReferences.length >= 3}
              >
                <View style={[styles.referencePreview, { backgroundColor: reference.color }]}>
                  {selectedReferences.includes(reference.id) && (
                    <View style={styles.selectedOverlay}>
                      <View style={styles.selectionBadge}>
                        <Text style={styles.selectionBadgeText}>
                          {selectedReferences.indexOf(reference.id) + 1}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {!selectedReferences.includes(reference.id) && selectedReferences.length >= 3 && (
                    <View style={styles.disabledOverlay} />
                  )}
                </View>
                
                <View style={styles.referenceInfo}>
                  <Text style={styles.referenceName}>{reference.name}</Text>
                  <Text style={styles.referenceCategory}>{reference.category}</Text>
                  <Text style={styles.referenceStyle}>{reference.style}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

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
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[tokens.color.brandLight, tokens.color.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              {selectedReferences.length > 0 ? `Continue with ${selectedReferences.length} reference${selectedReferences.length > 1 ? 's' : ''}` : 'Continue without references'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.color.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  headerTitle: {
    ...tokens.typography.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  skipText: {
    ...tokens.typography.body,
    color: tokens.color.brand,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  selectionInfo: {
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  selectionText: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  selectionSubtext: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  referencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  referenceCard: {
    width: (width - (tokens.spacing.xl * 2) - tokens.spacing.md) / 2,
    backgroundColor: tokens.color.bgSurface,
    borderRadius: tokens.radius.xl,
    padding: tokens.spacing.lg,
    borderWidth: 2,
    borderColor: tokens.color.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: tokens.spacing.lg,
  },
  selectedReferenceCard: {
    borderColor: tokens.color.brand,
    shadowColor: tokens.color.brand,
    shadowOpacity: 0.2,
  },
  referencePreview: {
    width: '100%',
    height: 100,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: tokens.spacing.sm,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  selectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.color.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  referenceInfo: {
    alignItems: 'center',
  },
  referenceName: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
    fontSize: 14,
    textAlign: 'center',
  },
  referenceCategory: {
    ...tokens.typography.bodySmall,
    color: tokens.color.brand,
    fontWeight: '500',
    fontSize: 12,
  },
  referenceStyle: {
    ...tokens.typography.bodySmall,
    color: tokens.color.textMuted,
    fontSize: 11,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  continueButton: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    marginTop: tokens.spacing.xl,
  },
  continueButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  continueButtonText: {
    ...tokens.typography.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
  },
});

export default ReferencesSelectionScreen;