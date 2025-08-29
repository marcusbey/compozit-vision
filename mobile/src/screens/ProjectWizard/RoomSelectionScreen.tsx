import React, { useState, useEffect, useRef } from 'react';
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
import { useJourneyStore } from '../../stores/journeyStore';
import { useContentStore, type Room } from '../../stores/contentStore';
import { NavigationHelpers } from '../../navigation/SafeJourneyNavigator';

// Import design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textSecondary: "#7A7A7A",
    textMuted: "#9A9A9A",
    textInverse: "#FDFBF7",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

interface Room {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon_name: string;
}

interface RoomSelectionScreenProps {
  navigation?: any;
  route?: any;
}

const RoomSelectionScreen: React.FC<RoomSelectionScreenProps> = ({ navigation, route }) => {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const journeyStore = useJourneyStore();

  useEffect(() => {
    loadRoomsData();
    
    // Entrance animations
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

  const loadRoomsData = async () => {
    try {
      setLoading(true);
      // Mock room data based on selected category
      const mockRooms: Room[] = [
        {
          id: '1',
          name: 'living_room',
          display_name: 'Living Room',
          description: 'Main gathering space for relaxation and entertainment',
          icon_name: 'tv'
        },
        {
          id: '2',
          name: 'bedroom',
          display_name: 'Bedroom',
          description: 'Personal sleeping and relaxation space',
          icon_name: 'bed'
        },
        {
          id: '3',
          name: 'kitchen',
          display_name: 'Kitchen',
          description: 'Cooking and dining preparation area',
          icon_name: 'restaurant'
        },
        {
          id: '4',
          name: 'dining_room',
          display_name: 'Dining Room',
          description: 'Formal dining and entertainment space',
          icon_name: 'wine'
        },
        {
          id: '5',
          name: 'bathroom',
          display_name: 'Bathroom',
          description: 'Personal care and hygiene space',
          icon_name: 'water'
        },
        {
          id: '6',
          name: 'office',
          display_name: 'Home Office',
          description: 'Work and productivity space',
          icon_name: 'briefcase'
        }
      ];
      
      setRooms(mockRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    if (multiSelectMode) {
      setSelectedRooms(prev => {
        if (prev.includes(roomId)) {
          return prev.filter(id => id !== roomId);
        } else {
          return [...prev, roomId];
        }
      });
    } else {
      setSelectedRooms([roomId]);
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (!multiSelectMode && selectedRooms.length > 1) {
      setSelectedRooms([selectedRooms[0]]);
    }
  };

  const handleContinue = () => {
    if (selectedRooms.length === 0) return;
    
    const selectedRoomData = rooms.filter(r => selectedRooms.includes(r.id));
    
    if (selectedRoomData.length > 0) {
      // Update journey store with selected rooms
      journeyStore.updateProjectWizard({
        selectedRooms: selectedRoomData.map(room => ({
          id: room.id,
          name: room.display_name,
          type: room.name
        })),
        multipleRooms: selectedRooms.length > 1,
        currentWizardStep: 'photo_capture'
      });
      
      // Navigate to photo capture screen
      NavigationHelpers.navigateToScreen('photoCapture');
    }
  };

  const handleBack = () => {
    NavigationHelpers.navigateToScreen('categorySelection');
  };

  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'tv': 'tv',
      'bed': 'bed',
      'restaurant': 'restaurant',
      'wine': 'wine',
      'water': 'water',
      'briefcase': 'briefcase',
    };
    return iconMap[iconName] || 'home';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.color.bgApp} translucent={false} />
      
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={24} color={tokens.color.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Select Your Space</Text>
            <Text style={styles.headerSubtitle}>Which room are you redesigning?</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 5</Text>
        </View>

        {/* Multi-Select Toggle */}
        <View style={styles.multiSelectContainer}>
          <TouchableOpacity
            style={styles.multiSelectToggle}
            onPress={toggleMultiSelectMode}
            activeOpacity={0.7}
          >
            <View style={[styles.toggle, multiSelectMode && styles.toggleActive]}>
              <View style={[styles.toggleSlider, multiSelectMode && styles.toggleSliderActive]} />
            </View>
            <Text style={styles.multiSelectText}>
              Select multiple rooms ({selectedRooms.length})
            </Text>
          </TouchableOpacity>
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
            {/* Rooms Grid */}
            <View style={styles.roomsContainer}>
              {rooms.map((room, index) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomCard,
                    selectedRooms.includes(room.id) && styles.selectedCard,
                    index % 2 === 0 ? styles.leftCard : styles.rightCard
                  ]}
                  onPress={() => handleRoomSelect(room.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.roomIcon}>
                    <Ionicons 
                      name={getIconName(room.icon_name)} 
                      size={28} 
                      color={selectedRooms.includes(room.id) ? tokens.color.brand : tokens.color.textSecondary} 
                    />
                  </View>
                  
                  <Text style={[
                    styles.roomTitle,
                    selectedRooms.includes(room.id) && styles.selectedTitle
                  ]}>
                    {room.display_name}
                  </Text>
                  
                  <Text style={styles.roomDescription}>
                    {room.description}
                  </Text>

                  {selectedRooms.includes(room.id) && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons 
                        name={multiSelectMode ? "checkmark-circle" : "radio-button-on"} 
                        size={20} 
                        color={tokens.color.brand} 
                      />
                    </View>
                  )}

                  {multiSelectMode && !selectedRooms.includes(room.id) && (
                    <View style={styles.unselectedIndicator}>
                      <Ionicons name="ellipse-outline" size={20} color={tokens.color.borderSoft} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.continueButton, selectedRooms.length === 0 && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={selectedRooms.length === 0}
          >
            <LinearGradient
              colors={selectedRooms.length === 0 
                ? [tokens.color.borderSoft, tokens.color.borderSoft] 
                : [tokens.color.brand, tokens.color.brandHover]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                selectedRooms.length === 0 && styles.continueButtonTextDisabled
              ]}>
                {selectedRooms.length > 1 
                  ? `Continue with ${selectedRooms.length} rooms` 
                  : 'Continue to Photos'
                }
              </Text>
              <Ionicons 
                name="camera" 
                size={20} 
                color={selectedRooms.length === 0 ? tokens.color.textMuted : tokens.color.textInverse}
                style={styles.continueButtonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
    backgroundColor: tokens.color.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadow.e2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...tokens.type.h1,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  headerSubtitle: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: tokens.color.borderSoft,
    borderRadius: 2,
    marginBottom: tokens.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.brand,
    borderRadius: 2,
  },
  progressText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  roomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -tokens.spacing.sm,
  },
  roomCard: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    borderWidth: 2,
    borderColor: tokens.color.borderSoft,
    width: '48%',
    alignItems: 'center',
    position: 'relative',
    ...tokens.shadow.e2,
  },
  leftCard: {
    marginRight: tokens.spacing.sm,
  },
  rightCard: {
    marginLeft: tokens.spacing.sm,
  },
  selectedCard: {
    borderColor: tokens.color.brand,
  },
  roomIcon: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  roomTitle: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
    fontSize: 18,
  },
  selectedTitle: {
    color: tokens.color.accent,
  },
  roomDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: tokens.spacing.md,
    right: tokens.spacing.md,
  },
  unselectedIndicator: {
    position: 'absolute',
    top: tokens.spacing.md,
    right: tokens.spacing.md,
  },
  multiSelectContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  multiSelectToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.borderSoft,
    marginRight: tokens.spacing.md,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: tokens.color.brand,
  },
  toggleSlider: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.surface,
    alignSelf: 'flex-start',
    ...tokens.shadow.e2,
  },
  toggleSliderActive: {
    alignSelf: 'flex-end',
  },
  multiSelectText: {
    ...tokens.type.body,
    color: tokens.color.textSecondary,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: 40,
    backgroundColor: tokens.color.bgApp,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingTop: tokens.spacing.xl,
  },
  continueButton: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    height: 52,
  },
  continueButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  continueButtonTextDisabled: {
    color: tokens.color.textMuted,
  },
  continueButtonIcon: {
    marginLeft: tokens.spacing.xs,
  },
});

export default RoomSelectionScreen;