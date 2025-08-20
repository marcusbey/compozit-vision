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
import { collection, addDoc, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
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

      if (!user?.id || !firestore) return;
      const ref = doc(firestore, 'users', user.id, 'projects', projectId);
      await deleteDoc(ref);

      // Aller vers la liste des projets après suppression
      navigation.navigate('MyProjects');
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
      if (!user?.id || !firestore) return;

      const payload: any = {
        name,
        roomType,
        style: selectedStyle, // on conserve la valeur existante
        budgetRange,
        selectedItems,
        capturedImage: capturedImage ?? null,
        updatedAt: serverTimestamp(),
      };

      if (projectId) {
        const ref = doc(firestore, 'users', user.id, 'projects', projectId);
        await updateDoc(ref, payload);
      } else {
        const colRef = collection(firestore, 'users', user.id, 'projects');
        await addDoc(colRef, { ...payload, status: 'completed', createdAt: serverTimestamp() });
      }

      // Retourner vers Results avec les paramètres à jour
      navigation.replace('Results', {
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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <LinearGradient colors={["#1a1a2e", "#16213e", "#0f3460"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
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
                placeholderTextColor="#b8c6db"
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
                minimumTrackTintColor="#4facfe"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="#4facfe"
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
                        <Ionicons name={item.icon as any} size={22} color={isSelected ? '#ffffff' : '#4facfe'} />
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
                      <Ionicons name={isSelected ? 'checkmark' : 'add'} size={20} color={isSelected ? '#ffffff' : '#4facfe'} />
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
            <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="save-outline" size={20} color="#ffffff" />
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  gradient: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', letterSpacing: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 10 },
  inputWrapper: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  textInput: { color: '#ffffff', fontSize: 16, paddingVertical: 8 },
  roomTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  roomTypeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(79, 172, 254, 0.1)', borderWidth: 1, borderColor: 'rgba(79, 172, 254, 0.3)' },
  roomTypeChipSelected: { backgroundColor: '#4facfe', borderColor: '#4facfe' },
  roomTypeText: { color: '#4facfe', fontWeight: '600' },
  roomTypeTextSelected: { color: '#ffffff', fontWeight: '700' },
  budgetDisplay: { fontSize: 22, fontWeight: '700', color: '#4facfe', marginBottom: 10 },
  sliderContainer: { width: '100%', paddingHorizontal: 10, marginBottom: 20 },
  slider: { width: '100%', height: 40 },
  itemsList: { marginTop: 10, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  itemInfo: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(79, 172, 254, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(79, 172, 254, 0.3)' },
  itemIconSelected: { backgroundColor: '#4facfe', borderColor: '#4facfe' },
  itemName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#b8c6db', fontSize: 13 },
  selectButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(79, 172, 254, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79, 172, 254, 0.3)' },
  selectButtonSelected: { backgroundColor: '#4facfe', borderColor: '#4facfe' },
  buttonContainer: { paddingHorizontal: 30, paddingBottom: 40, paddingTop: 10 },
  saveButton: { borderRadius: 30, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40 },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#ffffff', letterSpacing: 1, marginLeft: 10 },
  deleteButton: { marginTop: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,107,107,0.6)', backgroundColor: 'rgba(255,107,107,0.08)' },
  deleteInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 40 },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#ff6b6b', letterSpacing: 0.5, marginLeft: 10 },
});

export default ProjectSettingsScreen;
