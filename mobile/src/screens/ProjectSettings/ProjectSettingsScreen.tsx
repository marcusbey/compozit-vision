import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../stores/userStore';

interface ProjectSettingsScreenProps {
  navigation: any;
  route: any;
}

const ProjectSettingsScreen: React.FC<ProjectSettingsScreenProps> = ({ navigation, route }) => {
  const {
    projectId = null,
    projectName: initialName = '',
    roomType: initialRoomType = 'living',
    budgetRange: initialBudgetRange = [4000, 6000],
    selectedItems: initialSelectedItems = [],
    selectedStyle, // on ne l'édite pas ici, mais on le transmet pour Results
    capturedImage,
  } = route.params || {};

  const [name, setName] = useState<string>(initialName);
  const [roomType, setRoomType] = useState<string>(initialRoomType);
  const [budgetRange, setBudgetRange] = useState<number[]>(initialBudgetRange);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems);

  const { user } = useUserStore();

  const furnitureItems = [
    { id: 'sofa', name: 'Sofa', icon: 'bed-outline', priceRange: '$1,799 - 2,599', minPrice: 1799, maxPrice: 2599 },
    { id: 'table', name: 'Table', icon: 'grid-outline', priceRange: '$299 - 449', minPrice: 299, maxPrice: 449 },
    { id: 'chair', name: 'Chair', icon: 'square-outline', priceRange: '$199 - 299', minPrice: 199, maxPrice: 299 },
    { id: 'armchair', name: 'Armchair', icon: 'square-outline', priceRange: '$250 - 4000', minPrice: 250, maxPrice: 4000 },
    { id: 'coffee-table', name: 'Coffee Table', icon: 'grid-outline', priceRange: '$150 - 3000', minPrice: 150, maxPrice: 3000 },
    { id: 'floor-lamp', name: 'Floor Lamp', icon: 'bulb-outline', priceRange: '$100 - 2000', minPrice: 100, maxPrice: 2000 },
  ];

  const roomTypes = [
    { id: 'living', label: 'Living' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'bathroom', label: 'Bathroom' },
  ];

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      // Confirmation via modale système
      // Utilisation de Alert pour une confirmation simple et native
      const yesNo = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete project',
          'Are you sure you want to delete this project? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
      });

      if (!yesNo) return;

      if (!user?.id) return;
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting project:', error);
        return;
      }

      // Aller vers la liste des projets après suppression
      navigation.navigate('myProjects');
    } catch (e) {
      console.error('Erreur lors de la suppression du projet:', e);
    }
  };

  const formatBudget = (value: number) => `$${Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    try {
      if (!user?.id) return;

      const payload: any = {
        name,
        room_type: roomType,
        style_preferences: selectedStyle ? [selectedStyle] : [],
        budget_min: typeof budgetRange[0] === 'number' ? budgetRange[0] : parseFloat(String(budgetRange[0] || 0).replace('$', '')),
        budget_max: typeof budgetRange[1] === 'number' ? budgetRange[1] : parseFloat(String(budgetRange[1] || 0).replace('$', '')),
        original_images: capturedImage ? [{ url: capturedImage }] : [],
        updated_at: new Date().toISOString(),
      };

      if (projectId) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', projectId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating project:', error);
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...payload,
            user_id: user.id,
            status: 'completed',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating project:', error);
          return;
        }
      }

      // Retourner vers results avec les paramètres à jour
      navigation.replace('results', {
        projectId: projectId,
        projectName: name,
        roomType,
        selectedStyle,
        budgetRange,
        selectedItems,
        capturedImage,
      });
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des paramètres:', e);
    }
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
          <Text style={styles.headerTitle}>Project Settings</Text>
          <View style={{ width: 40, height: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Name */}
            <Text style={styles.sectionTitle}>Project Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter project name"
                placeholderTextColor="#8B7F73"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Room Type */}
            <Text style={styles.sectionTitle}>Room Type</Text>
            <View style={styles.roomTypeRow}>
              {roomTypes.map(rt => {
                const selected = rt.id === roomType;
                return (
                  <TouchableOpacity
                    key={rt.id}
                    style={[styles.roomTypeChip, selected && styles.roomTypeChipSelected]}
                    onPress={() => setRoomType(rt.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roomTypeText, selected && styles.roomTypeTextSelected]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Budget */}
            <Text style={styles.sectionTitle}>Budget</Text>
            <Text style={styles.budgetDisplay}>
              {formatBudget(budgetRange[0])} – {formatBudget(budgetRange[1])}
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1000}
                maximumValue={10000}
                step={1}
                value={Math.round((budgetRange[0] + budgetRange[1]) / 2)}
                onValueChange={(value) => {
                  const base = Math.round(value);
                  const range = 1000;
                  setBudgetRange([Math.max(1000, base - range), Math.min(10000, base + range)]);
                }}
                minimumTrackTintColor="#D4A574"
                maximumTrackTintColor="#E6DDD1"
                thumbTintColor="#D4A574"
              />
            </View>

            {/* Selected Items */}
            <Text style={styles.sectionTitle}>Selected Items</Text>
            <View style={styles.itemsList}>
              {furnitureItems.map(item => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <View style={[styles.itemIcon, isSelected && styles.itemIconSelected]}>
                        <Ionicons name={item.icon as any} size={22} color={isSelected ? '#2D2B28' : '#D4A574'} />
                      </View>
                      <View>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>{item.priceRange}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.selectButton, isSelected && styles.selectButtonSelected]}
                      onPress={() => toggleItemSelection(item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name={isSelected ? 'checkmark' : 'add'} size={20} color={isSelected ? '#2D2B28' : '#D4A574'} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

          </View>
        </ScrollView>

        {/* Save & Delete Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient colors={["#E8C097", "#D4A574"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="save-outline" size={20} color="#2D2B28" />
              <Text style={styles.buttonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>

          {projectId && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
              <View style={styles.deleteInner}>
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                <Text style={styles.deleteText}>Delete project</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF9F4' },
  gradient: { flex: 1, backgroundColor: '#FBF9F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEFEFE', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#2D2B28', letterSpacing: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D2B28', marginBottom: 10 },
  inputWrapper: { backgroundColor: '#FEFEFE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#E6DDD1', marginBottom: 20 },
  textInput: { color: '#2D2B28', fontSize: 16, paddingVertical: 8 },
  roomTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  roomTypeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(212, 165, 116, 0.1)', borderWidth: 1, borderColor: 'rgba(212, 165, 116, 0.3)' },
  roomTypeChipSelected: { backgroundColor: '#D4A574', borderColor: '#D4A574' },
  roomTypeText: { color: '#D4A574', fontWeight: '600' },
  roomTypeTextSelected: { color: '#2D2B28', fontWeight: '700' },
  budgetDisplay: { fontSize: 22, fontWeight: '700', color: '#D4A574', marginBottom: 10 },
  sliderContainer: { width: '100%', paddingHorizontal: 10, marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  itemsList: { marginTop: 10, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FEFEFE', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E6DDD1' },
  itemInfo: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(212, 165, 116, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(212, 165, 116, 0.3)' },
  itemIconSelected: { backgroundColor: '#D4A574', borderColor: '#D4A574' },
  itemName: { color: '#2D2B28', fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#8B7F73', fontSize: 13 },
  selectButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212, 165, 116, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212, 165, 116, 0.3)' },
  selectButtonSelected: { backgroundColor: '#D4A574', borderColor: '#D4A574' },
  buttonContainer: { paddingHorizontal: 30, paddingBottom: 40, paddingTop: 10 },
  saveButton: { borderRadius: 30, overflow: 'hidden', shadowColor: '#D4A574', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40 },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#2D2B28', letterSpacing: 1, marginLeft: 10 },
  deleteButton: { marginTop: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(224, 122, 95, 0.6)', backgroundColor: 'rgba(224, 122, 95, 0.08)' },
  deleteInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 40 },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#E07A5F', letterSpacing: 0.5, marginLeft: 10 },
});

export default ProjectSettingsScreen;
