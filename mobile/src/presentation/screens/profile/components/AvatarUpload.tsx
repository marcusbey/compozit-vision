// Avatar Upload Component - Profile Picture Management
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse } from 'react-native-image-picker';
import ActionSheet from 'react-native-actionsheet';
import { User } from '../../../../infrastructure/auth/types';

interface AvatarUploadProps {
  user: User;
  onAvatarUpdate: (avatarUrl: string) => Promise<void>;
  size?: number;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  onAvatarUpdate,
  size = 100
}) => {
  const [uploading, setUploading] = useState(false);
  const [actionSheetRef, setActionSheetRef] = useState<ActionSheet | null>(null);

  const actionSheetOptions = [
    'Take Photo',
    'Choose from Library',
    'Remove Photo',
    'Cancel'
  ];

  const handleAvatarPress = () => {
    actionSheetRef?.show();
  };

  const handleActionSheet = (index: number) => {
    switch (index) {
      case 0:
        handleTakePhoto();
        break;
      case 1:
        handleChooseFromLibrary();
        break;
      case 2:
        handleRemovePhoto();
        break;
      default:
        break;
    }
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512,
      includeBase64: false,
    };

    launchCamera(options, handleImageResponse);
  };

  const handleChooseFromLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 512,
      maxHeight: 512,
      includeBase64: false,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (!response.assets || response.assets.length === 0) {
      return;
    }

    const asset = response.assets[0];
    if (!asset.uri) {
      return;
    }

    setUploading(true);

    try {
      // In a real app, you would upload the image to a storage service like Supabase Storage
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
      } as any);

      // Mock upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockAvatarUrl = `https://example.com/avatars/${user.id}_${Date.now()}.jpg`;

      await onAvatarUpdate(mockAvatarUrl);

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await onAvatarUpdate('');
              Alert.alert('Success', 'Profile picture removed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove profile picture.');
            }
          }
        }
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const renderAvatar = () => {
    if (user.avatarUrl) {
      return (
        <Image
          source={{ uri: user.avatarUrl }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        />
      );
    }

    return (
      <View style={[
        styles.avatarPlaceholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#007AFF'
        }
      ]}>
        <Text style={[
          styles.avatarInitials,
          { fontSize: size * 0.4 }
        ]}>
          {getInitials(user.displayName || user.email)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        disabled={uploading}
        activeOpacity={0.7}
      >
        {renderAvatar()}
        
        <View style={[
          styles.editBadge,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            bottom: 0,
            right: 0,
          }
        ]}>
          <Text style={[
            styles.editIcon,
            { fontSize: size * 0.15 }
          ]}>
            ✏️
          </Text>
        </View>

        {uploading && (
          <View style={[
            styles.uploadingOverlay,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            }
          ]}>
            <Text style={styles.uploadingText}>📤</Text>
          </View>
        )}
      </TouchableOpacity>

      <ActionSheet
        ref={setActionSheetRef}
        title="Update Profile Picture"
        options={actionSheetOptions}
        cancelButtonIndex={3}
        destructiveButtonIndex={2}
        onPress={handleActionSheet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#F2F2F7',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: 'white',
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    textAlign: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 24,
  },
});