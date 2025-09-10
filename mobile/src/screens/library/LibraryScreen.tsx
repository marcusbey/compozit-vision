import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import the library sections
import { ReferencesSection } from './sections/ReferencesSection';
import { ColorPalettesSection } from './sections/ColorPalettesSection';
import { FurnitureSection } from './sections/FurnitureSection';
import { PersonalPhotosSection } from './sections/PersonalPhotosSection';
import { MaterialsSection } from './sections/MaterialsSection';

interface LibrarySection {
  id: string;
  title: string;
  icon: string;
  description: string;
  count?: number;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon as any} size={24} color="#D4A574" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const LibraryScreen: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  const librarySections: LibrarySection[] = [
    {
      id: 'references',
      title: 'References',
      icon: 'bookmark-outline',
      description: 'Design references and inspiration materials',
      count: 156
    },
    {
      id: 'color-palettes',
      title: 'Color Palettes',
      icon: 'color-palette-outline',
      description: 'Custom and saved color combinations',
      count: 23
    },
    {
      id: 'furniture',
      title: 'Furniture',
      icon: 'bed-outline',
      description: 'Saved furniture items and wishlists',
      count: 45
    },
    {
      id: 'photos',
      title: 'Personal Photos',
      icon: 'camera-outline',
      description: 'Your uploaded images and project photos',
      count: 68
    },
    {
      id: 'materials',
      title: 'Materials',
      icon: 'layers-outline',
      description: 'Fabric swatches, finishes, and textures',
      count: 34
    }
  ];

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'references':
        return <ReferencesSection />;
      case 'color-palettes':
        return <ColorPalettesSection />;
      case 'furniture':
        return <FurnitureSection />;
      case 'photos':
        return <PersonalPhotosSection />;
      case 'materials':
        return <MaterialsSection />;
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <View style={styles.overviewContent}>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Items" value="326" icon="library" />
        <StatCard title="Collections" value="5" icon="folder" />
        <StatCard title="Recent" value="12" icon="time" />
      </View>

      {/* Library Sections Grid */}
      <View style={styles.sectionsGrid}>
        {librarySections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionCard}
            onPress={() => setActiveSection(section.id)}
          >
            <View style={styles.sectionIcon}>
              <Ionicons name={section.icon as any} size={32} color="#D4A574" />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.count} items</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
            <View style={styles.sectionArrow}>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recently Added</Text>
        <View style={styles.recentItems}>
          <View style={styles.recentItem}>
            <View style={[styles.recentItemIcon, { backgroundColor: '#F6F3EF' }]}>
              <Ionicons name="color-palette" size={16} color="#D4A574" />
            </View>
            <View style={styles.recentItemContent}>
              <Text style={styles.recentItemTitle}>Warm Neutrals</Text>
              <Text style={styles.recentItemMeta}>Color Palette • 2 hours ago</Text>
            </View>
          </View>
          <View style={styles.recentItem}>
            <View style={[styles.recentItemIcon, { backgroundColor: '#F6F3EF' }]}>
              <Ionicons name="bookmark" size={16} color="#D4A574" />
            </View>
            <View style={styles.recentItemContent}>
              <Text style={styles.recentItemTitle}>Modern Living Room</Text>
              <Text style={styles.recentItemMeta}>Reference • 1 day ago</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Library Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Design Library</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Section Navigation */}
      <ScrollView 
        horizontal 
        style={styles.sectionTabs} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContent}
      >
        <TouchableOpacity
          style={[
            styles.sectionTab,
            activeSection === 'overview' && styles.activeSectionTab
          ]}
          onPress={() => setActiveSection('overview')}
        >
          <Text style={[
            styles.sectionTabText,
            activeSection === 'overview' && styles.activeSectionTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        {librarySections.map(section => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionTab,
              activeSection === section.id && styles.activeSectionTab
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <Text style={[
              styles.sectionTabText,
              activeSection === section.id && styles.activeSectionTabText
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Content */}
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        {renderSectionContent(activeSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4', // bg.app from STYLE-GUIDE.json
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: '#0A0A0A',
    fontFamily: 'Inter',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD1',
  },
  sectionTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  activeSectionTab: {
    backgroundColor: '#F6F3EF',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  activeSectionTabText: {
    color: '#0A0A0A',
    fontWeight: '500',
  },
  sectionContent: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  overviewContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: '#0A0A0A',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    marginTop: 4,
  },
  sectionsGrid: {
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    position: 'relative',
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  sectionCount: {
    fontSize: 14,
    lineHeight: 20,
    color: '#D4A574',
    fontWeight: '500',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 16,
  },
  sectionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  recentTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 16,
  },
  recentItems: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  recentItemMeta: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginTop: 2,
  },
});

export default LibraryScreen;