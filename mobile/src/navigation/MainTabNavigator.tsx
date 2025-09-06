import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tokens } from '../theme';

// Import screens for the tabs
import ToolsScreen from '../screens/dashboard/ToolsScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';
import UnifiedProjectScreen from '../screens/project/UnifiedProjectScreen';

// Placeholder screen for Explore (to be implemented)
const ExploreScreen = () => (
  <View style={styles.placeholderContainer}>
    <Ionicons name="compass-outline" size={64} color={tokens.colors.primary.DEFAULT} />
    <Text style={styles.placeholderText}>Explore</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);


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
        color={focused ? tokens.colors.text.primary : tokens.colors.text.tertiary} 
      />
      <Text style={[
        styles.tabLabel,
        { color: focused ? tokens.colors.text.primary : tokens.colors.text.tertiary }
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
        component={UnifiedProjectScreen}
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
    backgroundColor: tokens.colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
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
    ...tokens.typography.caption,
    marginTop: tokens.spacing.xs,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: tokens.colors.text.primary,
    marginTop: tokens.spacing.lg,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.sm,
  },
});

export default MainTabNavigator;