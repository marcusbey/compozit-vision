import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  ValidationResult, 
  ValidationError, 
  ValidationRecoveryAction,
  ValidationSeverity
} from '../../types/validation';

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
    scrim: "rgba(28,28,28,0.45)",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};

interface ValidationErrorDisplayProps {
  result: ValidationResult;
  recoveryActions?: ValidationRecoveryAction[];
  onActionPress?: (action: ValidationRecoveryAction) => void;
  onErrorPress?: (error: ValidationError) => void;
  showSummary?: boolean;
  collapsible?: boolean;
  style?: any;
}

interface ErrorItemProps {
  error: ValidationError;
  onPress?: (error: ValidationError) => void;
  onHelpPress?: (error: ValidationError) => void;
}

interface RecoveryActionProps {
  action: ValidationRecoveryAction;
  onPress: (action: ValidationRecoveryAction) => void;
}

const ErrorItem: React.FC<ErrorItemProps> = ({ error, onPress, onHelpPress }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error': return tokens.color.error;
      case 'warning': return tokens.color.warning;
      case 'info': return tokens.color.info;
      default: return tokens.color.textMuted;
    }
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const handlePress = () => {
    if (error.helpText || error.helpLink) {
      setExpanded(!expanded);
    }
    onPress?.(error);
  };

  const handleHelpPress = async () => {
    if (error.helpLink) {
      await Linking.openURL(error.helpLink);
    }
    onHelpPress?.(error);
  };

  return (
    <TouchableOpacity
      style={[
        styles.errorItem,
        { borderLeftColor: getSeverityColor(error.severity) }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.errorHeader}>
        <Ionicons
          name={getSeverityIcon(error.severity)}
          size={20}
          color={getSeverityColor(error.severity)}
          style={styles.errorIcon}
        />
        <Text style={[styles.errorMessage, { color: getSeverityColor(error.severity) }]}>
          {error.message}
        </Text>
        {(error.helpText || error.helpLink) && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={tokens.color.textMuted}
          />
        )}
      </View>

      {expanded && (error.helpText || error.helpLink) && (
        <View style={styles.errorHelp}>
          {error.helpText && (
            <Text style={styles.helpText}>{error.helpText}</Text>
          )}
          {error.helpLink && (
            <TouchableOpacity
              style={styles.helpLink}
              onPress={handleHelpPress}
            >
              <Text style={styles.helpLinkText}>Learn More</Text>
              <Ionicons name="open-outline" size={14} color={tokens.color.brand} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const RecoveryAction: React.FC<RecoveryActionProps> = ({ action, onPress }) => {
  const isPrimary = action.priority === 'primary';
  
  return (
    <TouchableOpacity
      style={[
        styles.recoveryAction,
        isPrimary ? styles.primaryAction : styles.secondaryAction
      ]}
      onPress={() => onPress(action)}
      activeOpacity={0.9}
    >
      <View style={styles.actionContent}>
        {action.icon && (
          <Ionicons
            name={action.icon as any}
            size={18}
            color={isPrimary ? tokens.color.textInverse : tokens.color.brand}
            style={styles.actionIcon}
          />
        )}
        <View style={styles.actionText}>
          <Text style={[
            styles.actionLabel,
            { color: isPrimary ? tokens.color.textInverse : tokens.color.brand }
          ]}>
            {action.label}
          </Text>
          <Text style={[
            styles.actionDescription,
            { color: isPrimary ? tokens.color.textInverse : tokens.color.textMuted }
          ]}>
            {action.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  result,
  recoveryActions = [],
  onActionPress,
  onErrorPress,
  showSummary = true,
  collapsible = false,
  style
}) => {
  const [collapsed, setCollapsed] = useState(collapsible);
  const [fadeAnim] = useState(new Animated.Value(1));

  const allIssues = [...result.errors, ...result.warnings, ...result.infos];
  
  if (allIssues.length === 0 && recoveryActions.length === 0) {
    return null;
  }

  const handleActionPress = (action: ValidationRecoveryAction) => {
    onActionPress?.(action);
  };

  const toggleCollapsed = () => {
    if (!collapsible) return;
    
    Animated.timing(fadeAnim, {
      toValue: collapsed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    setCollapsed(!collapsed);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Summary Header */}
      {showSummary && (
        <TouchableOpacity
          style={styles.summaryHeader}
          onPress={toggleCollapsed}
          disabled={!collapsible}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryStats}>
              {result.summary.errorCount > 0 && (
                <View style={[styles.summaryBadge, styles.errorBadge]}>
                  <Text style={styles.badgeText}>{result.summary.errorCount}</Text>
                  <Text style={styles.badgeLabel}>errors</Text>
                </View>
              )}
              {result.summary.warningCount > 0 && (
                <View style={[styles.summaryBadge, styles.warningBadge]}>
                  <Text style={styles.badgeText}>{result.summary.warningCount}</Text>
                  <Text style={styles.badgeLabel}>warnings</Text>
                </View>
              )}
              {result.infos.length > 0 && (
                <View style={[styles.summaryBadge, styles.infoBadge]}>
                  <Text style={styles.badgeText}>{result.infos.length}</Text>
                  <Text style={styles.badgeLabel}>info</Text>
                </View>
              )}
            </View>
            {collapsible && (
              <Ionicons
                name={collapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={tokens.color.textMuted}
              />
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Error Details */}
      {(!collapsible || !collapsed) && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView 
            style={styles.errorsList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {/* Errors */}
            {result.errors.map((error, index) => (
              <ErrorItem
                key={`error-${index}`}
                error={error}
                onPress={onErrorPress}
              />
            ))}

            {/* Warnings */}
            {result.warnings.map((warning, index) => (
              <ErrorItem
                key={`warning-${index}`}
                error={warning}
                onPress={onErrorPress}
              />
            ))}

            {/* Info messages */}
            {result.infos.map((info, index) => (
              <ErrorItem
                key={`info-${index}`}
                error={info}
                onPress={onErrorPress}
              />
            ))}
          </ScrollView>

          {/* Recovery Actions */}
          {recoveryActions.length > 0 && (
            <View style={styles.recoverySection}>
              <Text style={styles.recoveryTitle}>Suggested Actions</Text>
              <View style={styles.recoveryActions}>
                {recoveryActions.map((action, index) => (
                  <RecoveryAction
                    key={`action-${index}`}
                    action={action}
                    onPress={handleActionPress}
                  />
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.color.surface,
    borderRadius: tokens.radius.md,
    marginVertical: tokens.spacing.sm,
    ...tokens.shadow.e2,
  },
  summaryHeader: {
    padding: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.pill,
    gap: tokens.spacing.xs,
  },
  errorBadge: {
    backgroundColor: tokens.color.error,
  },
  warningBadge: {
    backgroundColor: tokens.color.warning,
  },
  infoBadge: {
    backgroundColor: tokens.color.info,
  },
  badgeText: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
    fontWeight: '600',
  },
  badgeLabel: {
    ...tokens.type.caption,
    color: tokens.color.textInverse,
  },
  errorsList: {
    maxHeight: 300,
  },
  errorItem: {
    padding: tokens.spacing.lg,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.borderSoft,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: tokens.spacing.sm,
  },
  errorMessage: {
    ...tokens.type.body,
    flex: 1,
    fontWeight: '500',
  },
  errorHelp: {
    marginTop: tokens.spacing.sm,
    marginLeft: tokens.spacing.xl,
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  helpText: {
    ...tokens.type.small,
    color: tokens.color.textMuted,
    marginBottom: tokens.spacing.sm,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  helpLinkText: {
    ...tokens.type.small,
    color: tokens.color.brand,
    fontWeight: '500',
  },
  recoverySection: {
    padding: tokens.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
  },
  recoveryTitle: {
    ...tokens.type.h3,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.md,
  },
  recoveryActions: {
    gap: tokens.spacing.sm,
  },
  recoveryAction: {
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
  primaryAction: {
    backgroundColor: tokens.color.accent,
  },
  secondaryAction: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.brand,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  actionIcon: {
    marginRight: tokens.spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    ...tokens.type.body,
    fontWeight: '600',
    marginBottom: tokens.spacing.xs,
  },
  actionDescription: {
    ...tokens.type.small,
  },
});

export default ValidationErrorDisplay;