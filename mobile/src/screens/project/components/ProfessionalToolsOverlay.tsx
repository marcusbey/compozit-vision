import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Annotation {
  id: number;
  x: number;
  y: number;
  text: string;
  type: 'note' | 'measurement' | 'change';
}

interface Measurement {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
  unit: string;
}

interface ProfessionalToolsOverlayProps {
  onMeasurePress: () => void;
  onAnnotatePress: () => void;
  onExportPress: () => void;
  showMeasurementTools: boolean;
  annotations: Annotation[];
  measurements: Measurement[];
  onAnnotationAdd: (annotation: Omit<Annotation, 'id'>) => void;
  onMeasurementAdd: (measurement: Omit<Measurement, 'id'>) => void;
}

export const ProfessionalToolsOverlay: React.FC<ProfessionalToolsOverlayProps> = ({
  onMeasurePress,
  onAnnotatePress,
  onExportPress,
  showMeasurementTools,
  annotations,
  measurements,
  onAnnotationAdd,
  onMeasurementAdd,
}) => {
  return (
    <>
      {/* Professional Tools Panel */}
      <View style={styles.toolsPanel}>
        <TouchableOpacity 
          style={[styles.toolButton, showMeasurementTools && styles.toolButtonActive]} 
          onPress={onMeasurePress}
        >
          <Ionicons name="ruler" size={20} color="#D4A574" />
          <Text style={styles.toolLabel}>Measure</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={onAnnotatePress}>
          <Ionicons name="chatbubble" size={20} color="#D4A574" />
          <Text style={styles.toolLabel}>Note</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolButton} onPress={onExportPress}>
          <Ionicons name="download" size={20} color="#D4A574" />
          <Text style={styles.toolLabel}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Annotations Overlay */}
      {annotations.map((annotation) => (
        <View
          key={annotation.id}
          style={[
            styles.annotation,
            {
              left: annotation.x - 12,
              top: annotation.y - 12,
            },
          ]}
        >
          <View style={styles.annotationPin}>
            <Ionicons 
              name={
                annotation.type === 'note' ? 'chatbubble' :
                annotation.type === 'measurement' ? 'ruler' : 'construct'
              } 
              size={12} 
              color="#FFFFFF" 
            />
          </View>
          {annotation.text && (
            <View style={styles.annotationTooltip}>
              <Text style={styles.annotationText}>{annotation.text}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Measurements Overlay */}
      {measurements.map((measurement) => (
        <View key={measurement.id} style={styles.measurementOverlay}>
          {/* Measurement Line */}
          <View
            style={[
              styles.measurementLine,
              {
                left: measurement.startX,
                top: measurement.startY,
                width: Math.abs(measurement.endX - measurement.startX),
                height: Math.abs(measurement.endY - measurement.startY),
              },
            ]}
          />
          
          {/* Measurement Label */}
          <View
            style={[
              styles.measurementLabel,
              {
                left: (measurement.startX + measurement.endX) / 2 - 25,
                top: (measurement.startY + measurement.endY) / 2 - 15,
              },
            ]}
          >
            <Text style={styles.measurementText}>
              {measurement.length}{measurement.unit}
            </Text>
          </View>
        </View>
      ))}

      {/* Measurement Tools Instructions */}
      {showMeasurementTools && (
        <View style={styles.instructionsPanel}>
          <View style={styles.instructionsContent}>
            <Ionicons name="information-circle" size={16} color="#D4A574" />
            <Text style={styles.instructionsText}>
              Tap two points to measure distance
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.instructionsClose}
            onPress={onMeasurePress}
          >
            <Ionicons name="close" size={16} color="#666666" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toolsPanel: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    gap: 8,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 8,
    minWidth: 100,
  },
  toolButtonActive: {
    backgroundColor: '#F6F3EF',
  },
  toolLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    fontWeight: '500',
  },
  annotation: {
    position: 'absolute',
    zIndex: 100,
  },
  annotationPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  annotationTooltip: {
    position: 'absolute',
    top: -40,
    left: -50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 100,
  },
  annotationText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  measurementOverlay: {
    position: 'absolute',
    zIndex: 99,
  },
  measurementLine: {
    borderWidth: 2,
    borderColor: '#D4A574',
    borderStyle: 'dashed',
  },
  measurementLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(212, 165, 116, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    width: 50,
    alignItems: 'center',
  },
  measurementText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  instructionsPanel: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  instructionsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  instructionsClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});