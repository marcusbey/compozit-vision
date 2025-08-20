import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useProjectStore } from '../../stores/projectStore';

const ProjectsScreen = ({ navigation }: any) => {
  const { 
    projects, 
    fetchProjects, 
    createProject, 
    deleteProject,
    setCurrentProject,
    isLoading 
  } = useProjectStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de projet');
      return;
    }

    try {
      await createProject(newProjectName, newProjectDescription);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le projet');
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      'Supprimer le projet',
      `Êtes-vous sûr de vouloir supprimer "${projectName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => deleteProject(projectId)
        }
      ]
    );
  };

  const handleProjectPress = (project: any) => {
    setCurrentProject(project);
    navigation.navigate('Camera');
  };

  const renderProject = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => handleProjectPress(item)}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteProject(item.id, item.name)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      {item.description && (
        <Text style={styles.projectDescription}>{item.description}</Text>
      )}
      
      <View style={styles.projectFooter}>
        <Text style={styles.projectStatus}>
          Status: {item.status}
        </Text>
        <Text style={styles.projectDate}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Projets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {projects.length > 0 ? (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucun projet pour le moment
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Créez votre premier projet pour commencer
          </Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createFirstButtonText}>
              Créer mon premier projet
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de création de projet */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouveau Projet</Text>
            <TouchableOpacity
              onPress={handleCreateProject}
              style={styles.saveButton}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Création...' : 'Créer'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Nom du projet *</Text>
            <TextInput
              style={styles.input}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Ex: Rénovation salon"
              maxLength={50}
            />

            <Text style={styles.inputLabel}>Description (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              placeholder="Décrivez votre projet..."
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 24,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectStatus: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default ProjectsScreen;
