// Profile Screen - Main Profile View
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '../../../infrastructure/auth/AuthService';
import { BiometricAuth } from '../../../infrastructure/auth/BiometricAuth';
import { User } from '../../../infrastructure/auth/types';
import { AvatarUpload } from './components/AvatarUpload';
import { PreferenceCard } from './components/PreferenceCard';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    checkBiometricStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const checkBiometricStatus = async () => {
    try {
      const available = await AuthService.isBiometricAvailable();
      const enabled = await AuthService.isBiometricEnabled();
      
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error checking biometric status:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      checkBiometricStatus()
    ]);
    setRefreshing(false);
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    // In a real app, this would update the user's avatar in the backend
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  const handleEditProfile = () => {
    // @ts-ignore
    navigation.navigate('EditProfile', { user });
  };

  const handlePreferences = () => {
    // @ts-ignore
    navigation.navigate('Preferences');
  };

  const handleSettings = () => {
    // @ts-ignore
    navigation.navigate('Settings');
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const success = await AuthService.enableBiometric();
        setBiometricEnabled(success);
        if (success) {
          const biometricType = await BiometricAuth.getBiometricType();
          Alert.alert(
            'Success',
            `${biometricType} authentication has been enabled for secure sign-in.`
          );
        }
      } else {
        await AuthService.disableBiometric();
        setBiometricEnabled(false);
        Alert.alert('Disabled', 'Biometric authentication has been disabled.');
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert(
        'Error',
        'Failed to update biometric settings. Please try again.'
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.signOut();
              // Navigation will be handled by auth state change
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getBiometricTitle = async () => {
    const biometricType = await BiometricAuth.getBiometricType();
    return `${biometricType} Sign In`;
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <AvatarUpload
            user={user}
            onAvatarUpdate={handleAvatarUpdate}
            size={120}
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {user.displayName || 'Welcome'}
            </Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.joinDate}>
              Member since {formatJoinDate(user.createdAt)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <PreferenceCard
              icon="👤"
              title="Personal Information"
              subtitle="Update your profile details"
              type="navigation"
              onPress={handleEditProfile}
            />
            
            <PreferenceCard
              icon="🎨"
              title="Design Preferences"
              subtitle="Styles, colors, and room types"
              type="navigation"
              onPress={handlePreferences}
            />
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            {biometricAvailable && (
              <PreferenceCard
                icon="🔒"
                title="Biometric Sign In"
                subtitle="Use biometric authentication for secure access"
                type="switch"
                value={biometricEnabled}
                onToggle={handleBiometricToggle}
              />
            )}
            
            <PreferenceCard
              icon="🔑"
              title="Change Password"
              subtitle="Update your account password"
              type="navigation"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('ChangePassword');
              }}
            />
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <PreferenceCard
              icon="⚙️"
              title="General Settings"
              subtitle="Notifications, privacy, and more"
              type="navigation"
              onPress={handleSettings}
            />
            
            <PreferenceCard
              icon="❓"
              title="Help & Support"
              subtitle="FAQ, contact us, and tutorials"
              type="navigation"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Support');
              }}
            />
            
            <PreferenceCard
              icon="📄"
              title="Privacy Policy"
              subtitle="View our privacy policy"
              type="navigation"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('PrivacyPolicy');
              }}
            />
          </View>

          {/* Sign Out Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6E6E73',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6E6E73',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editProfileButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  editProfileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionsContainer: {
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
    marginLeft: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});