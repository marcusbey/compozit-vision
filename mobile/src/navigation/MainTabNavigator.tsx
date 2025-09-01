import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens for the tabs
import ToolsScreen from '../screens/07-dashboard/ToolsScreen';
import ProfileScreen from '../screens/07-dashboard/ProfileScreen';
import ProjectWizardStartScreen from '../screens/04-project-wizard/ProjectWizardStartScreen';

// Placeholder screen for Explore (to be implemented)
const ExploreScreen = () => (
  <View style={styles.placeholderContainer}>
    <Ionicons name="compass-outline" size={64} color="#C9A98C" />
    <Text style={styles.placeholderText}>Explore</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

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
    inactive: "#B0B0B0",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    md: 12,
    pill: 999,
  },
  type: {
    caption: { fontSize: 12, fontWeight: '500' as const },
  },
};

const Tab = createBottomTabNavigator();

interface TabBarIconProps {
  focused: boolean;
  name: string;
  iconName: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, name, iconName }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons 
        name={iconName as any} 
        size={24} 
        color={focused ? tokens.color.accent : tokens.color.inactive} 
      />
      <Text style={[
        styles.tabLabel,
        { color: focused ? tokens.color.accent : tokens.color.inactive }
      ]}>
        {name}
      </Text>
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.tabBarContainer,
      { paddingBottom: insets.bottom || tokens.spacing.md }
    ]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon name based on route
          let iconName = 'help-circle-outline';
          switch (route.name) {
            case 'Tools':
              iconName = isFocused ? 'construct' : 'construct-outline';
              break;
            case 'Create':
              iconName = isFocused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Explore':
              iconName = isFocused ? 'compass' : 'compass-outline';
              break;
            case 'Profile':
              iconName = isFocused ? 'person-circle' : 'person-circle-outline';
              break;
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <TabBarIcon
                focused={isFocused}
                name={label}
                iconName={iconName}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen 
        name="Tools" 
        component={ToolsScreen}
        options={{
          tabBarLabel: 'Tools',
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={ProjectWizardStartScreen}
        options={{
          tabBarLabel: 'Create',
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.color.borderSoft,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...tokens.type.caption,
    marginTop: tokens.spacing.xs,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: tokens.color.bgApp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: tokens.color.textPrimary,
    marginTop: tokens.spacing.lg,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: tokens.color.textMuted,
    marginTop: tokens.spacing.sm,
  },
});

export default MainTabNavigator;