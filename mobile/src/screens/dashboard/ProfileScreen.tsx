import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../stores/userStore';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, isLoading } = useUserStore();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            const success = await logout();
            if (success) {
              // Navigate to Auth screen after successful logout
              navigation.reset({
                index: 0,
                routes: [{ name: 'auth' }],
              });
            }
          }
        }
      ]
    );
  };

  const accountMenuItems = [
    { id: 'personal-info', title: 'Personal Information', icon: 'person-outline' },
    { id: 'business-profile', title: 'Business Profile', icon: 'business-outline' },
    { id: 'subscription', title: 'Subscription & Billing', icon: 'card-outline' },
  ];

  const preferencesItems = [
    { id: 'app-settings', title: 'App Settings', icon: 'settings-outline' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications-outline' },
    { id: 'dark-mode', title: 'Dark Mode', icon: 'moon-outline', toggle: true },
  ];

  const professionalItems = [
    { id: 'portfolio', title: 'Portfolio Settings', icon: 'briefcase-outline' },
    { id: 'team', title: 'Team Management', icon: 'people-outline' },
    { id: 'analytics', title: 'Usage Analytics', icon: 'analytics-outline' },
  ];

  const supportItems = [
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
    { id: 'about', title: 'About', icon: 'information-circle-outline' },
    { id: 'bug-report', title: 'Report Issue', icon: 'bug-outline' },
  ];

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'personal-info':
        console.log('Navigate to personal information');
        break;
      case 'business-profile':
        console.log('Navigate to business profile');
        break;
      case 'subscription':
        console.log('Navigate to subscription settings');
        break;
      case 'app-settings':
        console.log('Navigate to app settings');
        break;
      case 'notifications':
        console.log('Navigate to notification settings');
        break;
      case 'portfolio':
        console.log('Navigate to portfolio settings');
        break;
      case 'team':
        console.log('Navigate to team management');
        break;
      case 'analytics':
        console.log('Navigate to usage analytics');
        break;
      case 'help':
        console.log('Navigate to help & support');
        break;
      case 'about':
        console.log('Navigate to about');
        break;
      case 'bug-report':
        console.log('Navigate to bug report');
        break;
      default:
        Alert.alert('Coming Soon', `The "${itemId}" section will be available soon`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF9F4" />
      <View style={styles.gradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#E8C097', '#D4A574']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'email@example.com'}
          </Text>
          
          {/* Professional Stats */}
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="briefcase-outline" size={24} color="#D4A574" />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="diamond-outline" size={24} color="#D4A574" />
              <Text style={styles.statValue}>{user?.nbToken || 450}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('plans')}
            >
              <Ionicons name="card-outline" size={24} color="#D4A574" />
              <Text style={[styles.statValue, styles.planValue]}>{user?.currentPlan || 'Pro'}</Text>
              <Text style={styles.statLabel}>Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {accountMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={20} color="#D4A574" style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B7F73" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {preferencesItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={20} color="#D4A574" style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              {item.toggle ? (
                <View style={styles.toggleContainer}>
                  {/* TODO: Add actual toggle functionality */}
                  <View style={styles.toggleOff}>
                    <View style={styles.toggleThumb} />
                  </View>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#8B7F73" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional</Text>
          {professionalItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={20} color="#D4A574" style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B7F73" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={20} color="#D4A574" style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B7F73" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.logoutText}>
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Compozit Vision v1.0.0 • Professional Edition</Text>
          <Text style={styles.footerSubtext}>Made for interior design professionals</Text>
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FBF9F4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D2B28',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2B28',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8B7F73',
    marginTop: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2B28',
    marginTop: 8,
  },
  planValue: {
    color: '#2D2B28',
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 14,
    color: '#8B7F73',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E6DDD1',
    marginHorizontal: 20,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2B28',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6DDD1',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: '#2D2B28',
    flex: 1,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: '#8B7F73',
  },
  logoutButton: {
    backgroundColor: '#E07A5F',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#E07A5F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#FEFEFE',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#8B7F73',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#8B7F73',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  toggleContainer: {
    marginRight: 4,
  },
  toggleOff: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E6DDD1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ProfileScreen;
