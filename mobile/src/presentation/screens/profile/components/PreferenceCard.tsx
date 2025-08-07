// Preference Card Component - Settings Cards
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';

interface PreferenceCardProps {
  title: string;
  subtitle?: string;
  value?: string | boolean;
  type: 'navigation' | 'switch' | 'value';
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon?: string;
  disabled?: boolean;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({
  title,
  subtitle,
  value,
  type,
  onPress,
  onToggle,
  icon,
  disabled = false
}) => {
  const renderRightElement = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={typeof value === 'boolean' ? value : false}
            onValueChange={onToggle}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={disabled ? '#F2F2F7' : 'white'}
            disabled={disabled}
          />
        );
      
      case 'value':
        return (
          <View style={styles.valueContainer}>
            <Text style={[
              styles.valueText,
              { color: disabled ? '#C7C7CC' : '#6E6E73' }
            ]}>
              {typeof value === 'string' ? value : ''}
            </Text>
            <Text style={[
              styles.chevron,
              { color: disabled ? '#C7C7CC' : '#C7C7CC' }
            ]}>
              ›
            </Text>
          </View>
        );
      
      case 'navigation':
      default:
        return (
          <Text style={[
            styles.chevron,
            { color: disabled ? '#C7C7CC' : '#C7C7CC' }
          ]}>
            ›
          </Text>
        );
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#F8F8F8' : 'white'
        }
      ]}
      onPress={handlePress}
      disabled={disabled || type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {icon && (
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}
          <View style={styles.textContent}>
            <Text style={[
              styles.title,
              { color: disabled ? '#8E8E93' : '#1D1D1F' }
            ]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[
                styles.subtitle,
                { color: disabled ? '#C7C7CC' : '#6E6E73' }
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {renderRightElement()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    lineHeight: 20,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 17,
    color: '#6E6E73',
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C7C7CC',
  },
});