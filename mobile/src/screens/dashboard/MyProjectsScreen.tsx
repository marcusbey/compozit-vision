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
  Image,
  FlatList,
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
    navigation.navigate('Results', {
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
    navigation.navigate('PhotoCapture');
  };

  const renderProjectCard = (project: any) => {
    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    };

    return (
      <TouchableOpacity
        key={project.id}
        style={styles.projectCard}
        onPress={() => handleProjectPress(project)}
        activeOpacity={0.8}
      >
        {/* Hero Image */}
        <View style={styles.cardHero}>
          {project.capturedImage ? (
            <Image style={styles.heroImage} source={{uri: project.capturedImage}} />
          ) : (
            <LinearGradient
              colors={getProjectGradient(project.roomType)}
              style={styles.projectImageGradient}
            >
              {renderProjectIllustration(project.roomType, project.style)}
            </LinearGradient>
          )}
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, getStatusBadgeStyle(project.status)]}>
            <Text style={styles.statusText}>{project.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.cardContent}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.roomType}>{project.roomType}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, {width: `${project.progress}%`}]} />
          </View>
          <Text style={styles.progressText}>{project.progress}% Complete</Text>
          
          {/* Last Modified */}
          <Text style={styles.lastModified}>
            Modified {formatRelativeTime(project.updatedAt)}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="pencil" size={16} color="#D4A574" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share" size={16} color="#D4A574" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#D4A574' };
      case 'in_progress':
      case 'active':
        return { backgroundColor: '#FFA500' };
      default:
        return { backgroundColor: '#D4A574' };
    }
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
        {/* Professional Header */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Your Projects</Text>
          <Text style={styles.statusSummary}>
            {projects.filter(p => p.status === 'active' || p.status === 'in_progress').length} Active • {projects.filter(p => p.status === 'completed').length} Completed
          </Text>
        </View>

        {/* Quick Action Bar */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleCreateProject}>
            <Text style={styles.primaryActionText}>+ New Project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Import</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Contenu principal */}
          <View style={styles.content}>
            {/* Project Status Tabs */}
            <View style={styles.statusTabs}>
              <TouchableOpacity style={[styles.statusTab, styles.activeStatusTab]}>
                <Text style={[styles.statusTabText, styles.activeStatusTabText]}>
                  Active ({projects.filter(p => p.status === 'active' || p.status === 'in_progress').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statusTab}>
                <Text style={styles.statusTabText}>
                  Completed ({projects.filter(p => p.status === 'completed').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statusTab}>
                <Text style={styles.statusTabText}>
                  Archived (0)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Projects Grid */}
            <View style={styles.projectsContainer}>
              {projects.map(renderProjectCard)}
              
              {/* New Project Card */}
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
    backgroundColor: '#F6F3EF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8DDD1',
    borderStyle: 'dashed',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  newProjectContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  newProjectIcon: {
    marginBottom: 12,
  },
  newProjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 6,
  },
  newProjectSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default MyProjectsScreen;
