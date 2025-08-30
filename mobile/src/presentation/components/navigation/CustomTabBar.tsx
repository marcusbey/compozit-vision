// Custom Tab Bar - Enhanced Tab Navigation with Animations
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 83;

interface TabIconProps {
  name: string;
  focused: boolean;
  size?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, size = 24 }) => {
  const getIcon = (tabName: string) => {
    switch (tabName) {
      case 'Home':
        return focused ? '🏠' : '🏡';
      case 'Camera':
        return '📸';
      case 'Projects':
        return focused ? '📁' : '📂';
      case 'Shop':
        return focused ? '🛍️' : '🛒';
      case 'Profile':
        return focused ? '👤' : '👤';
      default:
        return '•';
    }
  };

  return (
    <Text style={[styles.tabIcon, { fontSize: size }]}>
      {getIcon(name)}
    </Text>
  );
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const animatedValues = React.useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: state.index === index ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [state.index, animatedValues]);

  const handleTabPress = (route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      // Add haptic feedback
      if (Platform.OS === 'ios') {
        // Haptics would be implemented here
      }

      navigation.navigate(route.name);
    }
  };

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const animValue = animatedValues[index];

    const tabWidth = width / state.routes.length;

    // Animated styles
    const scaleValue = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1.1],
    });

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -4],
    });

    const labelOpacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    });

    const indicatorScale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Special handling for camera button
    const isCameraTab = route.name === 'Camera';
    
    if (isCameraTab) {
      return (
        <TouchableOpacity
          key={index}
          style={[styles.cameraTab, { width: tabWidth }]}
          onPress={() => handleTabPress(route, index, isFocused)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.cameraButton,
              {
                transform: [{ scale: scaleValue }],
              }
            ]}
          >
            <TabIcon name={route.name} focused={isFocused} size={28} />
          </Animated.View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={[styles.tab, { width: tabWidth }]}
        onPress={() => handleTabPress(route, index, isFocused)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [
                { scale: scaleValue },
                { translateY: translateY }
              ]
            }
          ]}
        >
          {/* Active indicator */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                transform: [{ scale: indicatorScale }],
                opacity: animValue,
              }
            ]}
          />

          <TabIcon name={route.name} focused={isFocused} />
          
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: isFocused ? '#007AFF' : '#8E8E93',
                opacity: labelOpacity,
              }
            ]}
          >
            {options.tabBarLabel || route.name}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="ultraThinMaterial"
          blurAmount={10}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.androidBackground]} />
      )}
      
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => renderTab(route, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: Platform.OS === 'android' ? 1 : 0,
    borderTopColor: '#E5E5EA',
  },
  androidBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  cameraTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
});