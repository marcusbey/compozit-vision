import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useProjectStore } from '../../stores/projectStore';
import { useUserStore } from '../../stores/userStore';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useUserStore();
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    navigation.navigate('myProjects');
  };

  const handleTakePhoto = () => {
    navigation.navigate('Camera');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Bonjour {user?.fullName || 'utilisateur'} !
          </Text>
          <Text style={styles.subtitle}>
            Prêt à transformer vos espaces ?
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={handleTakePhoto}
          >
            <Text style={styles.primaryActionText}>
              📸 Prendre une photo
            </Text>
            <Text style={styles.primaryActionSubtext}>
              Commencez votre transformation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryAction}
            onPress={handleCreateProject}
          >
            <Text style={styles.secondaryActionText}>
              ➕ Nouveau projet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projets récents</Text>
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project) => (
              <TouchableOpacity key={project.id} style={styles.projectCard}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectStatus}>
                  Status: {project.status}
                </Text>
                <Text style={styles.projectDate}>
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucun projet pour le moment
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Créez votre premier projet pour commencer
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  primaryActionSubtext: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
  secondaryAction: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryActionText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  projectStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default HomeScreen;
