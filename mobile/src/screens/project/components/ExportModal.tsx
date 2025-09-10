import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProjectContext {
  id: string;
  name: string;
  client?: {
    name: string;
    email?: string;
  };
  style: string[];
  roomType: string;
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
}

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onClientExport: () => void;
  onTechnicalExport: () => void;
  projectContext: ProjectContext | null;
  imageUri: string | null;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  format: string;
  audience: 'client' | 'team' | 'technical';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onClientExport,
  onTechnicalExport,
  projectContext,
  imageUri,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({
    includeImages: true,
    includeMetadata: true,
    includeTimeline: false,
    includeBudget: false,
    watermark: true,
    highResolution: false,
  });

  const exportOptions: ExportOption[] = [
    {
      id: 'client-presentation',
      title: 'Client Presentation',
      description: 'Clean, professional presentation for client review',
      icon: 'document-text',
      format: 'PDF',
      audience: 'client',
    },
    {
      id: 'high-res-image',
      title: 'High-Resolution Image',
      description: 'Print-quality image export',
      icon: 'image',
      format: 'PNG/JPG',
      audience: 'client',
    },
    {
      id: 'technical-specs',
      title: 'Technical Specifications',
      description: 'Detailed specs with measurements and materials',
      icon: 'construct',
      format: 'PDF',
      audience: 'technical',
    },
    {
      id: 'project-summary',
      title: 'Project Summary',
      description: 'Complete project overview with timeline and budget',
      icon: 'analytics',
      format: 'PDF',
      audience: 'team',
    },
    {
      id: 'mood-board',
      title: 'Mood Board',
      description: 'Visual inspiration board with references',
      icon: 'color-palette',
      format: 'PDF',
      audience: 'client',
    },
    {
      id: 'shopping-list',
      title: 'Shopping List',
      description: 'Furniture and materials list with links',
      icon: 'list',
      format: 'PDF',
      audience: 'client',
    },
  ];

  const handleExportOptionPress = (option: ExportOption) => {
    console.log('Export option selected:', option.id);
    
    switch (option.id) {
      case 'client-presentation':
        onClientExport();
        break;
      case 'technical-specs':
        onTechnicalExport();
        break;
      case 'high-res-image':
        handleHighResExport();
        break;
      case 'project-summary':
        handleProjectSummaryExport();
        break;
      case 'mood-board':
        handleMoodBoardExport();
        break;
      case 'shopping-list':
        handleShoppingListExport();
        break;
      default:
        console.log('Unknown export option');
    }
    
    onClose();
  };

  const handleHighResExport = () => {
    console.log('Exporting high-resolution image...');
    // TODO: Implement high-res image export
  };

  const handleProjectSummaryExport = () => {
    console.log('Exporting project summary...');
    // TODO: Implement project summary export
  };

  const handleMoodBoardExport = () => {
    console.log('Exporting mood board...');
    // TODO: Implement mood board export
  };

  const handleShoppingListExport = () => {
    console.log('Exporting shopping list...');
    // TODO: Implement shopping list export
  };

  const toggleOption = (key: keyof typeof selectedOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Export Options</Text>
            {projectContext && (
              <Text style={styles.subtitle}>{projectContext.name}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Export Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Formats</Text>
            <View style={styles.optionsGrid}>
              {exportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.exportOption}
                  onPress={() => handleExportOptionPress(option)}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name={option.icon as any} size={24} color="#D4A574" />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                  <View style={styles.optionFooter}>
                    <View style={styles.formatBadge}>
                      <Text style={styles.formatText}>{option.format}</Text>
                    </View>
                    <View style={[styles.audienceBadge, styles[`audience${option.audience}`]]}>
                      <Text style={styles.audienceText}>{option.audience}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export Settings</Text>
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Include Images</Text>
                  <Text style={styles.settingDescription}>Add all project images to export</Text>
                </View>
                <Switch
                  value={selectedOptions.includeImages}
                  onValueChange={() => toggleOption('includeImages')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Include Metadata</Text>
                  <Text style={styles.settingDescription}>Add project details and specifications</Text>
                </View>
                <Switch
                  value={selectedOptions.includeMetadata}
                  onValueChange={() => toggleOption('includeMetadata')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Include Timeline</Text>
                  <Text style={styles.settingDescription}>Add project timeline and milestones</Text>
                </View>
                <Switch
                  value={selectedOptions.includeTimeline}
                  onValueChange={() => toggleOption('includeTimeline')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Include Budget</Text>
                  <Text style={styles.settingDescription}>Add budget breakdown and costs</Text>
                </View>
                <Switch
                  value={selectedOptions.includeBudget}
                  onValueChange={() => toggleOption('includeBudget')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Add Watermark</Text>
                  <Text style={styles.settingDescription}>Brand exports with your logo</Text>
                </View>
                <Switch
                  value={selectedOptions.watermark}
                  onValueChange={() => toggleOption('watermark')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>High Resolution</Text>
                  <Text style={styles.settingDescription}>Export in print quality (larger file)</Text>
                </View>
                <Switch
                  value={selectedOptions.highResolution}
                  onValueChange={() => toggleOption('highResolution')}
                  trackColor={{ false: '#E8DDD1', true: '#D4A574' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Quick Export Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={onClientExport}>
                <Ionicons name="document" size={20} color="#D4A574" />
                <Text style={styles.quickActionText}>Client PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={onTechnicalExport}>
                <Ionicons name="construct" size={20} color="#D4A574" />
                <Text style={styles.quickActionText}>Tech Specs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} onPress={handleHighResExport}>
                <Ionicons name="image" size={20} color="#D4A574" />
                <Text style={styles.quickActionText}>Hi-Res Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
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
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 16,
  },
  optionsGrid: {
    gap: 16,
  },
  exportOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F6F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: '#0A0A0A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 12,
  },
  optionFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBadge: {
    backgroundColor: '#F6F3EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666666',
    fontWeight: '500',
  },
  audienceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  audienceText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  audienceclient: {
    backgroundColor: '#D4A574',
  },
  audienceteam: {
    backgroundColor: '#666666',
  },
  audiencetechnical: {
    backgroundColor: '#0A0A0A',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F3EF',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#0A0A0A',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  quickActionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
});