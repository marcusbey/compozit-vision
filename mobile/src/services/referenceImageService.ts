import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';

// Types
export interface ReferenceImage {
  id: string;
  user_id: string;
  project_id?: string;
  original_filename: string;
  storage_path: string;
  image_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type: string;
  user_title?: string;
  user_description?: string;
  tags: string[];
  dominant_colors?: {
    primary: string;
    secondary?: string;
    palette: string[];
  };
  color_palette_id?: string;
  ai_description?: string;
  style_tags: string[];
  mood_tags: string[];
  detected_objects: string[];
  category_id?: string;
  space_types: string[];
  times_used: number;
  last_used_at?: string;
  is_favorite: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceImageMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  spaceTypes?: string[];
  categoryId?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
}

export interface ImageUploadOptions {
  quality?: number; // 0-1, default 0.8
  maxWidth?: number; // default 1920
  maxHeight?: number; // default 1920
  createThumbnail?: boolean; // default true
  thumbnailSize?: number; // default 300
  projectId?: string;
  metadata?: ReferenceImageMetadata;
}

/**
 * Service for handling reference image uploads, processing, and management
 */
export class ReferenceImageService {
  private static instance: ReferenceImageService;

  public static getInstance(): ReferenceImageService {
    if (!ReferenceImageService.instance) {
      ReferenceImageService.instance = new ReferenceImageService();
    }
    return ReferenceImageService.instance;
  }

  /**
   * Request camera and media library permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraStatus === 'granted' && mediaStatus === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Pick image from camera
   */
  async pickFromCamera(options?: Partial<ImagePicker.ImagePickerOptions>): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'Camera and photo library access are required to upload reference images.');
      throw new Error('Camera permission not granted');
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square crop for consistency
      quality: 0.9,
      ...options
    });
  }

  /**
   * Pick image from gallery
   */
  async pickFromGallery(options?: Partial<ImagePicker.ImagePickerOptions>): Promise<ImagePicker.ImagePickerResult> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permissions Required', 'Photo library access is required to upload reference images.');
      throw new Error('Media library permission not granted');
    }

    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      ...options
    });
  }

  /**
   * Optimize and resize image
   */
  private async optimizeImage(
    uri: string, 
    options: ImageUploadOptions = {}
  ): Promise<{ uri: string; width: number; height: number; size: number }> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1920
    } = options;

    try {
      // Get image info first
      const imageInfo = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
      
      // Calculate optimal dimensions while maintaining aspect ratio
      let { width, height } = imageInfo;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      // Optimize image
      const optimized = await manipulateAsync(
        uri,
        [{ resize: { width: Math.round(width), height: Math.round(height) } }],
        {
          compress: quality,
          format: SaveFormat.JPEG
        }
      );

      // Get file size (approximate)
      const response = await fetch(optimized.uri);
      const blob = await response.blob();
      
      return {
        uri: optimized.uri,
        width: optimized.width,
        height: optimized.height,
        size: blob.size
      };
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw new Error('Failed to optimize image');
    }
  }

  /**
   * Create thumbnail from optimized image
   */
  private async createThumbnail(
    uri: string,
    size: number = 300
  ): Promise<{ uri: string; width: number; height: number }> {
    try {
      const thumbnail = await manipulateAsync(
        uri,
        [{ resize: { width: size, height: size } }],
        {
          compress: 0.7,
          format: SaveFormat.JPEG
        }
      );

      return thumbnail;
    } catch (error) {
      console.error('Thumbnail creation failed:', error);
      throw new Error('Failed to create thumbnail');
    }
  }

  /**
   * Generate secure storage path for user uploads
   */
  private generateStoragePath(userId: string, filename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 30); // Limit length

    return `${userId}/${timestamp}-${safeName}.${extension}`;
  }

  /**
   * Upload file to Supabase storage
   */
  private async uploadToStorage(
    bucketName: string,
    path: string,
    uri: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ path: string; url: string }> {
    try {
      // Convert URI to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload with progress tracking
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get signed URL for private bucket access
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(data.path, 3600 * 24); // 24 hour expiry

      if (urlError) {
        throw new Error(`Failed to create signed URL: ${urlError.message}`);
      }

      return {
        path: data.path,
        url: urlData.signedUrl
      };
    } catch (error) {
      console.error('Storage upload failed:', error);
      throw error;
    }
  }

  /**
   * Save reference image metadata to database
   */
  private async saveToDatabase(
    imageData: Partial<ReferenceImage>
  ): Promise<ReferenceImage> {
    try {
      const { data, error } = await supabase
        .from('user_reference_images')
        .insert({
          ...imageData,
          processing_status: 'completed'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database save failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Database save failed:', error);
      throw error;
    }
  }

  /**
   * Upload reference image with full processing pipeline
   */
  async uploadReferenceImage(
    imageUri: string,
    options: ImageUploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ReferenceImage> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
      const originalFilename = `reference-${Date.now()}.jpg`;

      // Stage 1: Preparing image
      onProgress?.({
        loaded: 0,
        total: 100,
        percentage: 10,
        stage: 'preparing',
        message: 'Optimizing image...'
      });

      // Optimize main image
      const optimized = await this.optimizeImage(imageUri, options);
      
      // Create thumbnail if requested
      let thumbnail: { uri: string; width: number; height: number } | null = null;
      if (options.createThumbnail !== false) {
        thumbnail = await this.createThumbnail(optimized.uri, options.thumbnailSize);
      }

      // Stage 2: Uploading
      onProgress?.({
        loaded: 30,
        total: 100,
        percentage: 30,
        stage: 'uploading',
        message: 'Uploading to cloud storage...'
      });

      // Generate storage paths
      const imagePath = this.generateStoragePath(userId, originalFilename);
      const thumbnailPath = thumbnail ? `thumbnails/${imagePath.split('/')[1]}-thumb.jpg` : undefined;

      // Upload main image to private bucket
      const imageUpload = await this.uploadToStorage(
        'reference-images',
        imagePath,
        optimized.uri
      );

      // Upload thumbnail to public bucket (if created)
      let thumbnailUpload: { path: string; url: string } | null = null;
      if (thumbnail && thumbnailPath) {
        thumbnailUpload = await this.uploadToStorage(
          'reference-thumbnails',
          thumbnailPath,
          thumbnail.uri
        );
      }

      // Stage 3: Processing
      onProgress?.({
        loaded: 70,
        total: 100,
        percentage: 70,
        stage: 'processing',
        message: 'Saving image details...'
      });

      // Prepare database record
      const imageData: Partial<ReferenceImage> = {
        user_id: userId,
        project_id: options.projectId,
        original_filename: originalFilename,
        storage_path: imageUpload.path,
        image_url: imageUpload.url,
        thumbnail_url: thumbnailUpload?.url,
        width: optimized.width,
        height: optimized.height,
        file_size: optimized.size,
        mime_type: 'image/jpeg',
        user_title: options.metadata?.title,
        user_description: options.metadata?.description,
        tags: options.metadata?.tags || [],
        space_types: options.metadata?.spaceTypes || [],
        category_id: options.metadata?.categoryId,
        style_tags: [],
        mood_tags: [],
        detected_objects: [],
        times_used: 0,
        is_favorite: false,
        processing_status: 'completed'
      };

      // Save to database
      const savedImage = await this.saveToDatabase(imageData);

      // Stage 4: Complete
      onProgress?.({
        loaded: 100,
        total: 100,
        percentage: 100,
        stage: 'complete',
        message: 'Upload complete!'
      });

      return savedImage;

    } catch (error) {
      console.error('Reference image upload failed:', error);
      
      onProgress?.({
        loaded: 0,
        total: 100,
        percentage: 0,
        stage: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
      
      throw error;
    }
  }

  /**
   * Get user's reference images
   */
  async getUserReferenceImages(userId?: string): Promise<ReferenceImage[]> {
    try {
      let query = supabase
        .from('user_reference_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch reference images: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get reference images:', error);
      throw error;
    }
  }

  /**
   * Get reference images for a specific project
   */
  async getProjectReferenceImages(projectId: string): Promise<ReferenceImage[]> {
    try {
      const { data, error } = await supabase
        .from('user_reference_images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch project reference images: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get project reference images:', error);
      throw error;
    }
  }

  /**
   * Delete reference image
   */
  async deleteReferenceImage(imageId: string): Promise<void> {
    try {
      // Get image details first
      const { data: image, error: fetchError } = await supabase
        .from('user_reference_images')
        .select('storage_path, thumbnail_url')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch image details: ${fetchError.message}`);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('reference-images')
        .remove([image.storage_path]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete thumbnail if exists
      if (image.thumbnail_url) {
        const thumbnailPath = image.thumbnail_url.split('/').pop();
        if (thumbnailPath) {
          await supabase.storage
            .from('reference-thumbnails')
            .remove([`thumbnails/${thumbnailPath}`]);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_reference_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        throw new Error(`Failed to delete from database: ${dbError.message}`);
      }

    } catch (error) {
      console.error('Failed to delete reference image:', error);
      throw error;
    }
  }

  /**
   * Update reference image metadata
   */
  async updateReferenceImage(
    imageId: string, 
    updates: Partial<ReferenceImage>
  ): Promise<ReferenceImage> {
    try {
      const { data, error } = await supabase
        .from('user_reference_images')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update reference image: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to update reference image:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(imageId: string): Promise<ReferenceImage> {
    try {
      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('user_reference_images')
        .select('is_favorite')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current status: ${fetchError.message}`);
      }

      // Toggle favorite
      return await this.updateReferenceImage(imageId, {
        is_favorite: !current.is_favorite
      });

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite reference images
   */
  async getFavoriteReferenceImages(userId?: string): Promise<ReferenceImage[]> {
    try {
      let query = supabase
        .from('user_reference_images')
        .select('*')
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch favorite images: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get favorite reference images:', error);
      throw error;
    }
  }

  /**
   * Search reference images by tags or description
   */
  async searchReferenceImages(
    query: string,
    filters?: {
      spaceTypes?: string[];
      categories?: string[];
      tags?: string[];
      favoritesOnly?: boolean;
    }
  ): Promise<ReferenceImage[]> {
    try {
      let dbQuery = supabase
        .from('user_reference_images')
        .select('*');

      // Text search in title and description
      if (query.trim()) {
        dbQuery = dbQuery.or(
          `user_title.ilike.%${query}%,user_description.ilike.%${query}%,ai_description.ilike.%${query}%`
        );
      }

      // Apply filters
      if (filters?.spaceTypes?.length) {
        dbQuery = dbQuery.overlaps('space_types', filters.spaceTypes);
      }

      if (filters?.categories?.length) {
        dbQuery = dbQuery.in('category_id', filters.categories);
      }

      if (filters?.tags?.length) {
        dbQuery = dbQuery.overlaps('tags', filters.tags);
      }

      if (filters?.favoritesOnly) {
        dbQuery = dbQuery.eq('is_favorite', true);
      }

      const { data, error } = await dbQuery.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Reference image search failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const referenceImageService = ReferenceImageService.getInstance();