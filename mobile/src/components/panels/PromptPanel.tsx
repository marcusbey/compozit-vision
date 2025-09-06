import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeatureId, ProjectContext } from '../../utils/contextAnalysis';
import { tokens } from '@theme';

interface PromptPanelProps {
  userPrompt: string;
  onPromptChange: (text: string) => void;
  onProcess: () => void;
  contextAnalysis?: {
    primaryContext: ProjectContext;
    confidence: number;
    suggestedFeatures: FeatureId[];
  };
  availableFeatures: FeatureId[];
  onFeaturePress: (feature: FeatureId) => void;
  isProcessing: boolean;
}

export const PromptPanel: React.FC<PromptPanelProps> = ({
  userPrompt,
  onPromptChange,
  onProcess,
  contextAnalysis,
  availableFeatures,
  onFeaturePress,
  isProcessing
}) => {
  const [expandedFeatures, setExpandedFeatures] = useState<Record<FeatureId, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const getFeatureLabel = (feature: FeatureId): string => {
    const labels: Record<FeatureId, string> = {
      colorPalette: '🎨 Colors',
      budget: '💰 Budget',
      furniture: '🪑 Furniture',
      location: '📍 Location',
      materials: '🏗️ Materials',
      texture: '🖼️ Textures',
    };
    return labels[feature] || feature;
  };

  const getFeatureDescription = (feature: FeatureId): string => {
    const descriptions: Record<FeatureId, string> = {
      colorPalette: 'Choose specific colors or let AI extract palette from your image',
      budget: 'Set your budget range to get appropriate furniture recommendations',
      furniture: 'Specify furniture preferences, styles, and must-have pieces',
      location: 'Specify room location, size, and spatial constraints',
      materials: 'Choose preferred materials like wood, metal, fabric textures',
      texture: 'Select surface textures and finishes for walls, floors, furniture',
    };
    return descriptions[feature] || 'Additional customization options';
  };

  const toggleFeature = (feature: FeatureId) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording logic
    console.log(isRecording ? '🎤 Stop recording' : '🎤 Start recording');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Describe Your Vision</Text>
          <Text style={styles.subtitle}>
            Tell us how you'd like to transform this space
          </Text>
        </View>

        {/* Context Indicator */}
        {contextAnalysis && (
          <View style={styles.contextContainer}>
            <View style={styles.contextIndicator}>
              <Ionicons 
                name="bulb" 
                size={16} 
                color={tokens.color.brand} 
              />
              <Text style={styles.contextText}>
                Detected: {contextAnalysis.primaryContext} design 
                ({Math.round(contextAnalysis.confidence * 100)}% confident)
              </Text>
            </View>
          </View>
        )}

        {/* Prompt Input with Voice Recording */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="E.g., Make this living room more modern with neutral colors and contemporary furniture"
              placeholderTextColor={tokens.color.textMuted}
              value={userPrompt}
              onChangeText={onPromptChange}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              onPress={handleVoiceToggle}
            >
              <Ionicons 
                name={isRecording ? 'stop-circle' : 'mic'} 
                size={24} 
                color={isRecording ? tokens.color.error : tokens.color.brand} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputFooter}>
            <Text style={styles.characterCount}>
              {userPrompt.length}/500
            </Text>
            {isRecording && (
              <Text style={styles.recordingIndicator}>
                🔴 Recording...
              </Text>
            )}
          </View>
        </View>

        {/* Extensible Feature Sections */}
        {availableFeatures.length > 0 && (
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Additional Features:</Text>
            {availableFeatures.map((feature) => (
              <View key={feature} style={styles.featureSection}>
                <TouchableOpacity
                  style={styles.featureHeader}
                  onPress={() => toggleFeature(feature)}
                >
                  <Text style={styles.featureHeaderText}>
                    {getFeatureLabel(feature)}
                  </Text>
                  <Ionicons 
                    name={expandedFeatures[feature] ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={tokens.color.textSecondary} 
                  />
                </TouchableOpacity>
                
                {expandedFeatures[feature] && (
                  <View style={styles.featureDetails}>
                    <Text style={styles.featureDescription}>
                      {getFeatureDescription(feature)}
                    </Text>
                    <TouchableOpacity
                      style={styles.featureActionButton}
                      onPress={() => onFeaturePress(feature)}
                    >
                      <Text style={styles.featureActionText}>
                        Configure {getFeatureLabel(feature).replace(/🎨|💰|🪑|📍|🏗️|🖼️/g, '').trim()}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color={tokens.color.brand} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Process Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.processButton,
            (!userPrompt.trim() || isProcessing) && styles.processButtonDisabled
          ]}
          onPress={onProcess}
          disabled={!userPrompt.trim() || isProcessing}
        >
          {isProcessing ? (
            <>
              <Ionicons name="refresh" size={20} color={tokens.color.textInverse} />
              <Text style={styles.processButtonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color={tokens.color.textInverse} />
              <Text style={styles.processButtonText}>Transform Image</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: tokens.spacing.lg,
  },
  title: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
  },
  contextContainer: {
    marginBottom: tokens.spacing.md,
  },
  contextIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: '#F0E68C',
    gap: tokens.spacing.xs,
  },
  contextText: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: tokens.spacing.lg,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.md,
    paddingRight: 56,
    fontSize: 16,
    color: tokens.color.textPrimary,
    minHeight: 100,
    maxHeight: 150,
  },
  voiceButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.e1,
  },
  voiceButtonActive: {
    backgroundColor: tokens.color.error + '20',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  characterCount: {
    ...tokens.type.caption,
    color: tokens.color.textMuted,
  },
  recordingIndicator: {
    ...tokens.type.caption,
    color: tokens.color.error,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: tokens.spacing.lg,
  },
  featuresTitle: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '600',
    marginBottom: tokens.spacing.md,
  },
  featureSection: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
  },
  featureHeaderText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    fontWeight: '500',
  },
  featureDetails: {
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    padding: tokens.spacing.md,
  },
  featureDescription: {
    ...tokens.type.small,
    color: tokens.color.textSecondary,
    lineHeight: 20,
    marginBottom: tokens.spacing.md,
  },
  featureActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.color.brand + '10',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
  },
  featureActionText: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    paddingTop: tokens.spacing.md,
  },
  processButton: {
    backgroundColor: tokens.color.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  processButtonDisabled: {
    backgroundColor: tokens.color.textMuted,
    ...tokens.shadow.e1,
  },
  processButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
});