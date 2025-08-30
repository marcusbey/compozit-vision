/**
 * InteractiveComponentsDemo - Demo screen for testing interactive components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Design tokens
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

interface InteractiveComponentsDemoProps {
  navigation?: any;
  route?: any;
}

const InteractiveComponentsDemo: React.FC<InteractiveComponentsDemoProps> = ({ 
  navigation, 
  route 
}) => {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [counter, setCounter] = useState(0);
  const [isToggled, setIsToggled] = useState(false);

  const demoButtons = [
    { id: 'primary', label: 'Primary Button', color: tokens.color.accent },
    { id: 'secondary', label: 'Secondary Button', color: tokens.color.brand },
    { id: 'success', label: 'Success Button', color: tokens.color.success },
    { id: 'warning', label: 'Warning Button', color: tokens.color.warning },
    { id: 'error', label: 'Error Button', color: tokens.color.error },
  ];

  const handleButtonPress = (buttonId: string) => {
    setSelectedButton(buttonId);
    setCounter(prev => prev + 1);
  };

  const handleToggle = () => {
    setIsToggled(prev => !prev);
  };

  const handleReset = () => {
    setSelectedButton(null);
    setCounter(0);
    setIsToggled(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Interactive Components Demo</Text>
          <Text style={styles.subtitle}>
            Test various interactive elements and their states
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{counter}</Text>
            <Text style={styles.statLabel}>Button Presses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedButton || 'None'}</Text>
            <Text style={styles.statLabel}>Last Selected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{isToggled ? 'ON' : 'OFF'}</Text>
            <Text style={styles.statLabel}>Toggle State</Text>
          </View>
        </View>

        {/* Demo Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Buttons</Text>
          {demoButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              activeOpacity={0.8}
              style={[
                styles.demoButton,
                { backgroundColor: button.color },
                selectedButton === button.id && styles.selectedButton,
              ]}
              onPress={() => handleButtonPress(button.id)}
              testID={`demo-button-${button.id}`}
            >
              <Text style={styles.demoButtonText}>{button.label}</Text>
              {selectedButton === button.id && (
                <Ionicons name="checkmark-circle" size={20} color={tokens.color.textInverse} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Controls</Text>
          
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.toggleButton, isToggled && styles.toggleButtonActive]}
            onPress={handleToggle}
            testID="toggle-button"
          >
            <Ionicons 
              name={isToggled ? "toggle" : "toggle-outline"} 
              size={24} 
              color={isToggled ? tokens.color.success : tokens.color.textMuted} 
            />
            <Text style={[styles.toggleText, isToggled && styles.toggleTextActive]}>
              Toggle Switch {isToggled ? '(ON)' : '(OFF)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.counterButton}
            onPress={() => setCounter(prev => prev + 1)}
            testID="counter-button"
          >
            <Ionicons name="add" size={20} color={tokens.color.textInverse} />
            <Text style={styles.counterButtonText}>Increment Counter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.resetButton}
            onPress={handleReset}
            testID="reset-button"
          >
            <Ionicons name="refresh" size={20} color={tokens.color.error} />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Status Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Selected: <Text style={styles.statusValue}>{selectedButton || 'None'}</Text>
            </Text>
            <Text style={styles.statusText}>
              Counter: <Text style={styles.statusValue}>{counter}</Text>
            </Text>
            <Text style={styles.statusText}>
              Toggle: <Text style={styles.statusValue}>{isToggled ? 'Enabled' : 'Disabled'}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  header: {
    paddingVertical: tokens.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...tokens.type.display,
    color: tokens.color.textPrimary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: tokens.spacing.xl,
    gap: tokens.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    ...tokens.shadow.e1,
  },
  statValue: {
    ...tokens.type.h2,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  statLabel: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
  },
  section: {
    marginBottom: tokens.spacing.xxl,
  },
  sectionTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.lg,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.e1,
  },
  selectedButton: {
    ...tokens.shadow.e2,
    transform: [{ scale: 1.02 }],
  },
  demoButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '500',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
  },
  toggleButtonActive: {
    borderColor: tokens.color.success,
    backgroundColor: `${tokens.color.success}10`,
  },
  toggleText: {
    ...tokens.type.body,
    color: tokens.color.textMuted,
    marginLeft: tokens.spacing.md,
  },
  toggleTextActive: {
    color: tokens.color.success,
    fontWeight: '500',
  },
  counterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.brand,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.md,
    ...tokens.shadow.e1,
  },
  counterButtonText: {
    ...tokens.type.body,
    color: tokens.color.textInverse,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.error,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
  },
  resetButtonText: {
    ...tokens.type.body,
    color: tokens.color.error,
    fontWeight: '500',
    marginLeft: tokens.spacing.sm,
  },
  statusContainer: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    ...tokens.shadow.e1,
  },
  statusText: {
    ...tokens.type.body,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.sm,
  },
  statusValue: {
    fontWeight: '600',
    color: tokens.color.brand,
  },
});

export default InteractiveComponentsDemo;