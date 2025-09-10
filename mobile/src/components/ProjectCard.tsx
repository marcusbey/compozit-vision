import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    client?: string;
    status: 'active' | 'completed' | 'archived';
    progress: number; // 0-100
    lastModified: Date;
    heroImage?: string;
    roomType: string;
    budget?: number;
    deadline?: Date;
  };
  onPress: () => void;
  onEditPress?: () => void;
  onSharePress?: () => void;
  onMenuPress?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onPress, 
  onEditPress, 
  onSharePress, 
  onMenuPress 
}) => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#D4A574' };
      case 'active':
        return { backgroundColor: '#FFA500' };
      case 'archived':
        return { backgroundColor: '#666666' };
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
      case 'kitchen':
        return ['#f3e5f5', '#e1bee7'];
      case 'bathroom':
        return ['#e8f5e8', '#c8e6c9'];
      default:
        return ['#f8f9fa', '#e9ecef'];
    }
  };

  const renderProjectIllustration = (roomType: string) => {
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
    <TouchableOpacity
      style={styles.projectCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Hero Image */}
      <View style={styles.cardHero}>
        {project.heroImage ? (
          <Image style={styles.heroImage} source={{uri: project.heroImage}} />
        ) : (
          <LinearGradient
            colors={getProjectGradient(project.roomType)}
            style={styles.projectImageGradient}
          >
            {renderProjectIllustration(project.roomType)}
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
        {project.client && (
          <Text style={styles.clientName}>{project.client}</Text>
        )}
        <Text style={styles.roomType}>{project.roomType}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, {width: `${project.progress}%`}]} />
        </View>
        <Text style={styles.progressText}>{project.progress}% Complete</Text>
        
        {/* Last Modified */}
        <Text style={styles.lastModified}>
          Modified {formatRelativeTime(project.lastModified)}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEditPress}>
          <Ionicons name="pencil" size={16} color="#D4A574" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onSharePress}>
          <Ionicons name="share" size={16} color="#D4A574" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onMenuPress}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#666666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    overflow: 'hidden',
  },
  cardHero: {
    width: '100%',
    height: 160,
    backgroundColor: '#F6F3EF',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#D4A574',
  },
  statusText: {
    color: '#0A0A0A',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardContent: {
    padding: 16,
  },
  projectName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 8,
  },
  roomType: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E8DDD1',
    borderRadius: 2,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4A574',
  },
  progressText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#D4A574',
    fontWeight: '500',
  },
  lastModified: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F6F3EF',
    gap: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProjectCard;