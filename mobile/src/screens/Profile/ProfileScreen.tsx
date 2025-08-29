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

  const menuItems = [
    { id: 'account', title: 'Account Information', icon: 'person-outline' },
    { id: 'preferences', title: 'Preferences', icon: 'settings-outline' },
    { id: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
    { id: 'about', title: 'About', icon: 'information-circle-outline' },
  ];

  const handleMenuPress = (itemId: string) => {
    Alert.alert('Coming Soon', `The "${itemId}" section will be available soon`);
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
          
          {/* Informations sur les tokens et le plan */}
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="diamond-outline" size={24} color="#D4A574" />
              <Text style={styles.statValue}>{user?.nbToken || 0}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('plans')}
            >
              <Ionicons name="card-outline" size={24} color="#D4A574" />
              <Text style={[styles.statValue, styles.planValue]}>{user?.currentPlan || 'free'}</Text>
              <Text style={styles.statLabel}>Plan • Upgrade ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map((item) => (
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
          <Text style={styles.footerText}>Compozit Vision v1.0.0</Text>
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
  },
});

export default ProfileScreen;
