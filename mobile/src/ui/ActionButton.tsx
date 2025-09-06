import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  loadingText?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  loadingText = 'Loading...'
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={isDisabled}
    >
      <LinearGradient
        colors={isDisabled
          ? [tokens.color.borderSoft, tokens.color.borderSoft] 
          : [tokens.color.brand, tokens.color.brandHover]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[
          styles.text,
          isDisabled && styles.textDisabled
        ]}>
          {loading ? loadingText : title}
        </Text>
        
        {!loading && icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isDisabled ? tokens.color.textMuted : tokens.color.textInverse}
            style={styles.icon}
          />
        )}
        
        {loading && (
          <Ionicons 
            name="hourglass" 
            size={20} 
            color={tokens.color.textInverse}
            style={styles.icon}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    ...tokens.shadow.e2,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.xl,
    height: 52,
  },
  text: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
    marginRight: tokens.spacing.sm,
  },
  textDisabled: {
    color: tokens.color.textMuted,
  },
  icon: {
    marginLeft: tokens.spacing.xs,
  },
});