import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../stores/userStore';

const { width } = Dimensions.get('window');
const HEADER_TOP = Platform.OS === 'android' ? ((StatusBar.currentHeight ?? 0) + 10) : 20;

interface MyProjectsScreenProps {
  navigation: any;
}

const MyProjectsScreen: React.FC<MyProjectsScreenProps> = ({ navigation }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const { user } = useUserStore();

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          return;
        }

        const items = (data || []).map((project: any) => ({
          id: project.id,
          name: project.name || 'Untitled Project',
          roomType: project.room_type || 'living',
          style: project.style_preferences?.[0] || 'modern',
          budgetRange: [project.budget_min || 0, project.budget_max || 0],
          selectedItems: [], // Will be populated from designs
          capturedImage: project.original_images?.[0]?.url || null,
          status: project.status || 'completed',
          progress: project.status === 'completed' ? 100 : 50,
          subtitle: `${project.room_type || 'Room'} • ${project.style_preferences?.[0] || 'Style'}`,
          updatedAt: project.updated_at,
        }));
        
        setProjects(items);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      }
    };

    fetchProjects();

    // Set up real-time subscription
    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchProjects(); // Refresh data when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const handleProjectPress = (project: any) => {
    // Always navigate to Results for existing projects to avoid regeneration
    navigation.navigate('results', {
      projectName: project.name,
      roomType: project.roomType,
      selectedStyle: project.style,
      budgetRange: project.budgetRange || [4000, 6000],
      selectedItems: project.selectedItems || ['sofa', 'table', 'chair'],
      capturedImage: project.capturedImage || null,
      projectId: project.id,
      isExistingProject: true,
    });
  };

  const handleCreateProject = () => {
    // For logged-in users, skip Welcome/Demo and go directly to project creation
    navigation.navigate('photoCapture');
  };

  const renderProjectCard = (project: any) => {
    return (
      <TouchableOpacity
        key={project.id}
        style={styles.projectCard}
        onPress={() => handleProjectPress(project)}
        activeOpacity={0.8}
      >
        <View style={styles.projectImage}>
          <LinearGradient
            colors={getProjectGradient(project.roomType)}
            style={styles.projectImageGradient}
          >
            {renderProjectIllustration(project.roomType, project.style)}
          </LinearGradient>
          
          {/* Status badge */}
          <View style={[
            styles.statusBadge,
            project.status === 'completed' ? styles.statusCompleted : styles.statusInProgress
          ]}>
            <Text style={styles.statusText}>
              {project.status === 'completed' ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        <View style={styles.projectInfo}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            <TouchableOpacity style={styles.projectMenu}>
              <Ionicons name="chevron-forward" size={20} color="#8B7F73" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.projectSubtitle}>{project.subtitle}</Text>
          
          {project.status === 'in_progress' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${project.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{project.progress}%</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getProjectGradient = (roomType: string): [string, string] => {
    switch (roomType) {
      case 'living':
        return ['#f8f9fa', '#e9ecef'];
      case 'bedroom':
        return ['#fff3e0', '#ffe0b2'];
      default:
        return ['#f8f9fa', '#e9ecef'];
    }
  };

  const renderProjectIllustration = (roomType: string, style: string) => {
    return (
      <View style={styles.illustration}>
        <View style={styles.illustrationWall}>
          <View style={styles.illustrationArt} />
        </View>
        <View style={styles.illustrationFurniture}>
          <View style={styles.illustrationSofa} />
          <View style={styles.illustrationTable} />
          <View style={styles.illustrationLamp} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" translucent={false} />
      
      <View style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Projects</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('profile')}>
            <Ionicons name="ellipsis-vertical" size={22} color="#D4A574" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Contenu principal */}
          <View style={styles.content}>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{projects.length}</Text>
                <Text style={styles.statLabel}>Total Projects</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{projects.filter(p => p.status === 'completed').length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{projects.filter(p => p.status === 'in_progress').length}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>

            {/* Projects List */}
            <View style={styles.projectsList}>
              {projects.map(renderProjectCard)}
            </View>

            {/* Empty state ou bouton d'ajout */}
            <TouchableOpacity
              style={styles.newProjectCard}
              onPress={handleCreateProject}
              activeOpacity={0.8}
            >
              <View style={styles.newProjectContent}>
                <View style={styles.newProjectIcon}>
                  <Ionicons name="add-circle" size={40} color="#D4A574" />
                </View>
                <Text style={styles.newProjectText}>Start New Project</Text>
                <Text style={styles.newProjectSubtext}>
                  Transform another room with AI
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: HEADER_TOP,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2B28',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FEFEFE',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E6DDD1',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7F73',
    fontWeight: '500',
  },
  projectsList: {
    marginBottom: 30,
  },
  projectCard: {
    backgroundColor: '#FEFEFE',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6DDD1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  projectImage: {
    height: 120,
    position: 'relative',
  },
  projectImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  illustrationWall: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  illustrationArt: {
    position: 'absolute',
    top: 8,
    right: 20,
    width: 20,
    height: 15,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  illustrationFurniture: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    height: 50,
  },
  illustrationSofa: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 50,
    height: 25,
    backgroundColor: '#666',
    borderRadius: 6,
  },
  illustrationTable: {
    position: 'absolute',
    bottom: 5,
    left: 70,
    width: 25,
    height: 12,
    backgroundColor: '#8B4513',
    borderRadius: 3,
  },
  illustrationLamp: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 8,
    height: 30,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  statusInProgress: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  projectInfo: {
    padding: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2B28',
  },
  projectMenu: {
    padding: 5,
  },
  projectSubtitle: {
    fontSize: 14,
    color: '#8B7F73',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E6DDD1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4A574',
    minWidth: 35,
  },
  newProjectCard: {
    backgroundColor: 'rgba(212, 165, 116, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(212, 165, 116, 0.2)',
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  newProjectContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  newProjectIcon: {
    marginBottom: 15,
  },
  newProjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 8,
  },
  newProjectSubtext: {
    fontSize: 14,
    color: '#8B7F73',
    textAlign: 'center',
  },
});

export default MyProjectsScreen;
