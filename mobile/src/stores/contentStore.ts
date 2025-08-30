import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { referenceImageService, ReferenceImage as ReferenceImageType } from '../services/referenceImageService';
import { colorExtractionService, ColorPalette as ColorPaletteType, DominantColors } from '../services/colorExtractionService';

// Type definitions based on database structure
export interface Category {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Room {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category_id: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export interface DesignStyle {
  id: string;
  name: string;
  display_name: string;
  description: string;
  mood_tags: string[];
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  illustration_url?: string;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface ReferenceImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url?: string;
  style_id?: string;
  room_id?: string;
  tags: string[];
  color_palette?: any;
  is_featured: boolean;
  likes_count: number;
  sort_order: number;
  is_active: boolean;
}

// Re-export from services for backward compatibility
export type ColorPalette = ColorPaletteType;
export type UserReferenceImage = ReferenceImageType;
export type ExtractedColors = DominantColors;

// Legacy interface for existing reference images
export interface ColorPaletteOld {
  id: string;
  name: string;
  display_name: string;
  description: string;
  colors: {
    colors: string[];
  };
  style_id?: string;
  preview_image_url?: string;
  is_trending: boolean;
  usage_count: number;
  sort_order: number;
  is_active: boolean;
}

export interface ExamplePhoto {
  id: string;
  category_id: string;
  room_id?: string;
  image_url: string;
  thumbnail_url?: string;
  title: string;
  description: string;
}

// Store interface
export interface ContentState {
  // Data
  categories: Category[];
  rooms: Room[];
  styles: DesignStyle[];
  referenceImages: ReferenceImage[];
  colorPalettes: ColorPaletteOld[];
  examplePhotos: ExamplePhoto[];
  
  // Enhanced user content with new services
  userReferences: UserReferenceImage[]; // User's uploaded reference images
  userPalettes: ColorPalette[]; // User's saved/extracted color palettes
  selectedReferences: string[]; // IDs of selected references for current project
  selectedPalettes: string[]; // IDs of selected palettes for current project
  
  // Upload and processing state
  uploadProgress: {
    isUploading: boolean;
    progress: number;
    stage: string;
    message: string;
  };
  
  // Color extraction state
  colorExtraction: {
    isExtracting: boolean;
    extractedColors?: DominantColors;
  };
  
  // Loading states
  loading: {
    categories: boolean;
    rooms: boolean;
    styles: boolean;
    references: boolean;
    palettes: boolean;
    examplePhotos: boolean;
    userReferences: boolean;
    userPalettes: boolean;
  };
  
  // Error states
  errors: {
    categories: string | null;
    rooms: string | null;
    styles: string | null;
    references: string | null;
    palettes: string | null;
    examplePhotos: string | null;
    userReferences: string | null;
    userPalettes: string | null;
  };
  
  // Actions
  loadCategories: () => Promise<void>;
  loadRooms: (categoryId?: string) => Promise<void>;
  loadStyles: () => Promise<void>;
  loadReferenceImages: (filters?: { styleId?: string; roomId?: string; featured?: boolean }) => Promise<void>;
  loadColorPalettes: (styleId?: string) => Promise<void>;
  loadExamplePhotos: (categoryId?: string, roomId?: string) => Promise<void>;
  
  // Enhanced user actions with new services
  // Reference management
  uploadReferenceImage: (imageUri: string, metadata?: { title?: string; description?: string; tags?: string[] }) => Promise<UserReferenceImage>;
  loadUserReferences: () => Promise<void>;
  deleteUserReference: (referenceId: string) => Promise<void>;
  toggleReferenceSelection: (referenceId: string) => void;
  toggleReferenceFavorite: (referenceId: string) => Promise<void>;
  
  // Color palette management
  extractColorsFromImage: (imageUri: string) => Promise<DominantColors>;
  createColorPalette: (name: string, colors: DominantColors, options?: { description?: string; sourceReferenceId?: string }) => Promise<ColorPalette>;
  loadUserPalettes: () => Promise<void>;
  deletePalette: (paletteId: string) => Promise<void>;
  togglePaletteSelection: (paletteId: string) => void;
  togglePaletteFavorite: (paletteId: string) => Promise<void>;
  
  // Legacy methods (deprecated but maintained for compatibility)
  saveUserReference: (imageUrl: string, projectContext: { styleId?: string; roomId?: string }) => Promise<void>;
  saveUserPalette: (colors: string[], name: string) => Promise<void>;
  extractPaletteFromImage: (imageUrl: string) => Promise<string[]>;
  toggleFavoriteReference: (referenceId: string) => Promise<void>;
  getUserFavoriteReferences: () => ReferenceImage[];
  
  // Utility functions
  getCategoryById: (id: string) => Category | undefined;
  getRoomById: (id: string) => Room | undefined;
  getStyleById: (id: string) => DesignStyle | undefined;
  getPopularStyles: () => DesignStyle[];
  getFeaturedReferences: () => ReferenceImage[];
  getTrendingPalettes: () => ColorPaletteOld[];
  getFilteredReferences: (roomId?: string, styleId?: string) => ReferenceImage[];
  
  // Reset method for backward compatibility with tests
  reset: () => void;
}

// Create the content store
export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  categories: [],
  rooms: [],
  styles: [],
  referenceImages: [],
  colorPalettes: [],
  examplePhotos: [],
  
  // Enhanced user content
  userReferences: [],
  userPalettes: [],
  selectedReferences: [],
  selectedPalettes: [],
  
  // Upload and processing state
  uploadProgress: {
    isUploading: false,
    progress: 0,
    stage: 'idle',
    message: ''
  },
  
  colorExtraction: {
    isExtracting: false,
    extractedColors: undefined
  },
  
  loading: {
    categories: false,
    rooms: false,
    styles: false,
    references: false,
    palettes: false,
    examplePhotos: false,
    userReferences: false,
    userPalettes: false,
  },
  
  errors: {
    categories: null,
    rooms: null,
    styles: null,
    references: null,
    palettes: null,
    examplePhotos: null,
    userReferences: null,
    userPalettes: null,
  },
  
  // Load categories
  loadCategories: async () => {
    set((state) => ({
      loading: { ...state.loading, categories: true },
      errors: { ...state.errors, categories: null },
    }));
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      set({
        categories: data || [],
        loading: { ...get().loading, categories: false },
      });
      
      console.log('📂 Categories loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      set((state) => ({
        loading: { ...state.loading, categories: false },
        errors: { ...state.errors, categories: error.message },
      }));
    }
  },
  
  // Load rooms filtered by category
  loadRooms: async (categoryId?: string) => {
    set((state) => ({
      loading: { ...state.loading, rooms: true },
      errors: { ...state.errors, rooms: null },
    }));
    
    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({
        rooms: data || [],
        loading: { ...get().loading, rooms: false },
      });
      
      console.log('🏠 Rooms loaded:', data?.length || 0, categoryId ? `for category ${categoryId}` : '');
    } catch (error: any) {
      console.error('Error loading rooms:', error);
      set((state) => ({
        loading: { ...state.loading, rooms: false },
        errors: { ...state.errors, rooms: error.message },
      }));
    }
  },
  
  // Load design styles
  loadStyles: async () => {
    set((state) => ({
      loading: { ...state.loading, styles: true },
      errors: { ...state.errors, styles: null },
    }));
    
    try {
      const { data, error } = await supabase
        .from('design_styles')
        .select('*')
        .eq('is_active', true)
        .order('is_popular', { ascending: false })
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.warn('Database query failed, using fallback:', error);
        // Use fallback data when database is not available
        const fallbackStyles = [
          {
            id: '1',
            name: 'modern',
            display_name: 'Modern',
            description: 'Clean lines, minimalist approach with contemporary elements',
            mood_tags: ['sleek', 'contemporary', 'minimalist'],
            color_palette: { primary: '#000000', secondary: '#FFFFFF', accent: '#2196F3' },
            illustration_url: null,
            is_popular: true,
            sort_order: 1,
            is_active: true
          },
          {
            id: '2',
            name: 'scandinavian',
            display_name: 'Scandinavian',
            description: 'Light, airy spaces with natural materials and cozy elements',
            mood_tags: ['cozy', 'natural', 'bright'],
            color_palette: { primary: '#F5F5F5', secondary: '#8B4513', accent: '#4CAF50' },
            illustration_url: null,
            is_popular: true,
            sort_order: 2,
            is_active: true
          },
          {
            id: '3',
            name: 'minimalist',
            display_name: 'Minimalist',
            description: 'Less is more philosophy with focus on essential elements',
            mood_tags: ['simple', 'clean', 'uncluttered'],
            color_palette: { primary: '#FFFFFF', secondary: '#CCCCCC', accent: '#333333' },
            illustration_url: null,
            is_popular: false,
            sort_order: 3,
            is_active: true
          }
        ];
        
        set({
          styles: fallbackStyles,
          loading: { ...get().loading, styles: false },
        });
        
        console.log('🎨 Fallback styles loaded:', fallbackStyles.length);
        return;
      }
      
      set({
        styles: data || [],
        loading: { ...get().loading, styles: false },
      });
      
      console.log('🎨 Styles loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('Error loading styles:', error);
      // Provide fallback data even on complete failure
      const fallbackStyles = [
        {
          id: '1',
          name: 'modern',
          display_name: 'Modern',
          description: 'Clean lines and contemporary design',
          mood_tags: ['sleek', 'contemporary'],
          color_palette: { primary: '#000000', secondary: '#FFFFFF' },
          illustration_url: null,
          is_popular: true,
          sort_order: 1,
          is_active: true
        }
      ];
      
      set({
        styles: fallbackStyles,
        loading: { ...get().loading, styles: false },
        errors: { ...get().errors, styles: error.message },
      });
      
      console.log('🎨 Emergency fallback styles loaded:', fallbackStyles.length);
    }
  },
  
  // Load reference images filtered by style and room
  loadReferenceImages: async (filters?: { styleId?: string; roomId?: string; featured?: boolean }) => {
    set((state) => ({
      loading: { ...state.loading, references: true },
      errors: { ...state.errors, references: null },
    }));
    
    try {
      let query = supabase
        .from('reference_images')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('likes_count', { ascending: false })
        .order('sort_order', { ascending: true })
        .limit(50);
      
      if (filters?.styleId) {
        query = query.eq('style_id', filters.styleId);
      }
      if (filters?.roomId) {
        query = query.eq('room_id', filters.roomId);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.warn('Database query failed, using fallback:', error);
        // Use fallback reference images when database is not available
        const fallbackReferences = [
          {
            id: '1',
            title: 'Modern Living Room',
            description: 'Clean and contemporary living space',
            image_url: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Modern+Living',
            style_id: '1',
            room_id: 'living-room',
            color_tags: ['blue', 'white', 'gray'],
            mood_tags: ['contemporary', 'minimalist'],
            is_featured: true,
            likes_count: 120,
            sort_order: 1,
            is_active: true
          },
          {
            id: '2',
            title: 'Scandinavian Bedroom',
            description: 'Cozy and natural bedroom design',
            image_url: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Scandinavian+Bedroom',
            style_id: '2',
            room_id: 'bedroom',
            color_tags: ['green', 'white', 'wood'],
            mood_tags: ['cozy', 'natural'],
            is_featured: true,
            likes_count: 95,
            sort_order: 2,
            is_active: true
          }
        ];
        
        // Filter fallback data based on provided filters
        let filteredReferences = fallbackReferences;
        if (filters?.styleId) {
          filteredReferences = filteredReferences.filter(ref => ref.style_id === filters.styleId);
        }
        if (filters?.roomId) {
          filteredReferences = filteredReferences.filter(ref => ref.room_id === filters.roomId);
        }
        if (filters?.featured !== undefined) {
          filteredReferences = filteredReferences.filter(ref => ref.is_featured === filters.featured);
        }
        
        set({
          referenceImages: filteredReferences,
          loading: { ...get().loading, references: false },
        });
        
        console.log('🖼️ Fallback references loaded:', filteredReferences.length);
        return;
      }
      
      set({
        referenceImages: data || [],
        loading: { ...get().loading, references: false },
      });
      
      console.log('🖼️ References loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('Error loading reference images:', error);
      // Provide basic fallback even on complete failure
      const basicFallback = [
        {
          id: '1',
          title: 'Sample Design',
          description: 'Design inspiration',
          image_url: 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Design+Sample',
          style_id: '1',
          room_id: 'living-room',
          color_tags: ['gray'],
          mood_tags: ['neutral'],
          is_featured: true,
          likes_count: 0,
          sort_order: 1,
          is_active: true
        }
      ];
      
      set({
        referenceImages: basicFallback,
        loading: { ...get().loading, references: false },
        errors: { ...get().errors, references: error.message },
      });
      
      console.log('🖼️ Emergency fallback references loaded:', basicFallback.length);
    }
  },
  
  // Load color palettes
  loadColorPalettes: async (styleId?: string) => {
    set((state) => ({
      loading: { ...state.loading, palettes: true },
      errors: { ...state.errors, palettes: null },
    }));
    
    try {
      let query = supabase
        .from('color_palettes')
        .select('*')
        .eq('is_active', true)
        .order('is_trending', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('sort_order', { ascending: true });
      
      if (styleId) {
        query = query.eq('style_id', styleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      set({
        colorPalettes: data || [],
        loading: { ...get().loading, palettes: false },
      });
      
      console.log('🎨 Palettes loaded:', data?.length || 0);
    } catch (error: any) {
      console.error('Error loading color palettes:', error);
      set((state) => ({
        loading: { ...state.loading, palettes: false },
        errors: { ...state.errors, palettes: error.message },
      }));
    }
  },
  
  // Load example photos for trying the app
  loadExamplePhotos: async (categoryId?: string, roomId?: string) => {
    set((state) => ({
      loading: { ...state.loading, examplePhotos: true },
      errors: { ...state.errors, examplePhotos: null },
    }));
    
    try {
      // For now, using mock data - this would come from a dedicated table
      const mockExamples: ExamplePhoto[] = [
        {
          id: '1',
          category_id: categoryId || 'interior',
          room_id: roomId,
          image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
          thumbnail_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
          title: 'Empty Living Space',
          description: 'Try designing this empty living room'
        },
        {
          id: '2',
          category_id: categoryId || 'interior',
          room_id: roomId,
          image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500',
          thumbnail_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=300',
          title: 'Blank Bedroom',
          description: 'Transform this blank bedroom'
        }
      ];
      
      set({
        examplePhotos: mockExamples,
        loading: { ...get().loading, examplePhotos: false },
      });
    } catch (error: any) {
      console.error('Error loading example photos:', error);
      set((state) => ({
        loading: { ...state.loading, examplePhotos: false },
        errors: { ...state.errors, examplePhotos: error.message },
      }));
    }
  },
  
  // Enhanced reference management
  uploadReferenceImage: async (imageUri: string, metadata = {}) => {
    try {
      set((state) => ({
        uploadProgress: {
          ...state.uploadProgress,
          isUploading: true,
          progress: 0,
          stage: 'preparing',
          message: 'Preparing upload...'
        },
        errors: { ...state.errors, userReferences: null }
      }));
      
      const uploadedImage = await referenceImageService.uploadReferenceImage(
        imageUri,
        {
          createThumbnail: true,
          metadata: {
            title: metadata.title || 'Reference Image',
            description: metadata.description,
            tags: metadata.tags || []
          }
        },
        (progress) => {
          set((state) => ({
            uploadProgress: {
              ...state.uploadProgress,
              progress: progress.percentage,
              stage: progress.stage,
              message: progress.message
            }
          }));
        }
      );
      
      set((state) => ({
        userReferences: [...state.userReferences, uploadedImage],
        uploadProgress: {
          isUploading: false,
          progress: 100,
          stage: 'complete',
          message: 'Upload complete!'
        }
      }));
      
      console.log('📷 Reference image uploaded successfully');
      return uploadedImage;
      
    } catch (error: any) {
      console.error('Error uploading reference image:', error);
      set((state) => ({
        uploadProgress: {
          isUploading: false,
          progress: 0,
          stage: 'error',
          message: error.message || 'Upload failed'
        },
        errors: { ...state.errors, userReferences: error.message }
      }));
      throw error;
    }
  },
  
  loadUserReferences: async () => {
    set((state) => ({
      loading: { ...state.loading, userReferences: true },
      errors: { ...state.errors, userReferences: null }
    }));
    
    try {
      const references = await referenceImageService.getUserReferenceImages();
      set((state) => ({
        userReferences: references,
        loading: { ...state.loading, userReferences: false }
      }));
      console.log('📷 User references loaded:', references.length);
    } catch (error: any) {
      console.error('Error loading user references:', error);
      set((state) => ({
        loading: { ...state.loading, userReferences: false },
        errors: { ...state.errors, userReferences: error.message }
      }));
    }
  },
  
  deleteUserReference: async (referenceId: string) => {
    try {
      await referenceImageService.deleteReferenceImage(referenceId);
      set((state) => ({
        userReferences: state.userReferences.filter(ref => ref.id !== referenceId),
        selectedReferences: state.selectedReferences.filter(id => id !== referenceId)
      }));
      console.log('🗑️ Reference image deleted');
    } catch (error: any) {
      console.error('Error deleting reference image:', error);
      set((state) => ({
        errors: { ...state.errors, userReferences: error.message }
      }));
    }
  },
  
  toggleReferenceSelection: (referenceId: string) => {
    set((state) => {
      const isSelected = state.selectedReferences.includes(referenceId);
      return {
        selectedReferences: isSelected
          ? state.selectedReferences.filter(id => id !== referenceId)
          : [...state.selectedReferences, referenceId]
      };
    });
  },
  
  toggleReferenceFavorite: async (referenceId: string) => {
    try {
      const updatedReference = await referenceImageService.toggleFavorite(referenceId);
      set((state) => ({
        userReferences: state.userReferences.map(ref => 
          ref.id === referenceId ? updatedReference : ref
        )
      }));
      console.log('❤️ Reference favorite toggled');
    } catch (error: any) {
      console.error('Error toggling reference favorite:', error);
      set((state) => ({
        errors: { ...state.errors, userReferences: error.message }
      }));
    }
  },
  
  // Enhanced color palette management
  extractColorsFromImage: async (imageUri: string) => {
    try {
      set((state) => ({
        colorExtraction: {
          isExtracting: true,
          extractedColors: undefined
        },
        errors: { ...state.errors, userPalettes: null }
      }));
      
      const colors = await colorExtractionService.extractColorsFromImage(imageUri);
      
      set((state) => ({
        colorExtraction: {
          isExtracting: false,
          extractedColors: colors
        }
      }));
      
      console.log('🎨 Colors extracted from image:', colors.palette.length);
      return colors;
      
    } catch (error: any) {
      console.error('Error extracting colors:', error);
      set((state) => ({
        colorExtraction: {
          isExtracting: false,
          extractedColors: undefined
        },
        errors: { ...state.errors, userPalettes: error.message }
      }));
      throw error;
    }
  },
  
  createColorPalette: async (name: string, colors: DominantColors, options = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const palette = await colorExtractionService.createColorPalette(
        user.id,
        name,
        colors,
        options
      );
      
      set((state) => ({
        userPalettes: [...state.userPalettes, palette]
      }));
      
      console.log('🎨 Color palette created:', name);
      return palette;
      
    } catch (error: any) {
      console.error('Error creating color palette:', error);
      set((state) => ({
        errors: { ...state.errors, userPalettes: error.message }
      }));
      throw error;
    }
  },
  
  loadUserPalettes: async () => {
    set((state) => ({
      loading: { ...state.loading, userPalettes: true },
      errors: { ...state.errors, userPalettes: null }
    }));
    
    try {
      const palettes = await colorExtractionService.getUserColorPalettes();
      set((state) => ({
        userPalettes: palettes,
        loading: { ...state.loading, userPalettes: false }
      }));
      console.log('🎨 User palettes loaded:', palettes.length);
    } catch (error: any) {
      console.error('Error loading user palettes:', error);
      set((state) => ({
        loading: { ...state.loading, userPalettes: false },
        errors: { ...state.errors, userPalettes: error.message }
      }));
    }
  },
  
  deletePalette: async (paletteId: string) => {
    try {
      await colorExtractionService.deleteColorPalette(paletteId);
      set((state) => ({
        userPalettes: state.userPalettes.filter(palette => palette.id !== paletteId),
        selectedPalettes: state.selectedPalettes.filter(id => id !== paletteId)
      }));
      console.log('🗑️ Color palette deleted');
    } catch (error: any) {
      console.error('Error deleting color palette:', error);
      set((state) => ({
        errors: { ...state.errors, userPalettes: error.message }
      }));
    }
  },
  
  togglePaletteSelection: (paletteId: string) => {
    set((state) => {
      const isSelected = state.selectedPalettes.includes(paletteId);
      return {
        selectedPalettes: isSelected
          ? state.selectedPalettes.filter(id => id !== paletteId)
          : [...state.selectedPalettes, paletteId]
      };
    });
  },
  
  togglePaletteFavorite: async (paletteId: string) => {
    try {
      const updatedPalette = await colorExtractionService.togglePaletteFavorite(paletteId);
      set((state) => ({
        userPalettes: state.userPalettes.map(palette => 
          palette.id === paletteId ? updatedPalette : palette
        )
      }));
      console.log('❤️ Palette favorite toggled');
    } catch (error: any) {
      console.error('Error toggling palette favorite:', error);
      set((state) => ({
        errors: { ...state.errors, userPalettes: error.message }
      }));
    }
  },
  
  // Legacy methods (maintained for compatibility)
  saveUserReference: async (imageUrl: string, projectContext: { styleId?: string; roomId?: string }) => {
    try {
      const newReference: ReferenceImage = {
        id: `user-ref-${Date.now()}`,
        title: 'User Reference',
        description: 'User uploaded reference',
        image_url: imageUrl,
        style_id: projectContext.styleId,
        room_id: projectContext.roomId,
        tags: ['user-uploaded'],
        is_featured: false,
        likes_count: 0,
        sort_order: 999,
        is_active: true,
      };
      
      set((state) => ({
        referenceImages: [...state.referenceImages, newReference]
      }));
      
      console.log('💾 User reference saved (legacy)');
    } catch (error) {
      console.error('Error saving user reference:', error);
    }
  },
  
  // Legacy save user palette method
  saveUserPalette: async (colors: string[], name: string) => {
    try {
      const newPalette: ColorPaletteOld = {
        id: `user-palette-${Date.now()}`,
        name: name.toLowerCase().replace(/\s+/g, '_'),
        display_name: name,
        description: 'User extracted palette',
        colors: { colors },
        is_trending: false,
        usage_count: 0,
        sort_order: 999,
        is_active: true,
      };
      
      set((state) => ({
        colorPalettes: [...state.colorPalettes, newPalette]
      }));
      
      console.log('🎨 User palette saved (legacy):', name);
    } catch (error) {
      console.error('Error saving user palette:', error);
    }
  },
  
  // Extract palette from image (mock implementation)
  extractPaletteFromImage: async (imageUrl: string): Promise<string[]> => {
    // This would use an image processing service or computer vision API
    // For now, returning mock colors based on common palettes
    const mockPalettes = [
      ['#F5F5DC', '#DEB887', '#D2B48C', '#BC9A6A'], // Warm neutrals
      ['#2D2D2D', '#FFFFFF', '#C9A98C', '#8B4513'], // Modern contrast
      ['#F5F5F5', '#D2B48C', '#2F4F4F', '#FFFFFF'], // Scandinavian
      ['#4A4A4A', '#D2691E', '#CD853F', '#F5DEB3'], // Industrial
    ];
    
    const randomPalette = mockPalettes[Math.floor(Math.random() * mockPalettes.length)];
    return randomPalette;
  },
  
  // Legacy toggle favorite reference
  toggleFavoriteReference: async (referenceId: string) => {
    // This would update user's favorites in database
    console.log('❤️ Toggling favorite (legacy):', referenceId);
  },
  
  // Get user's favorite references
  getUserFavoriteReferences: () => {
    // This would fetch from user's favorites table
    return [];
  },
  
  // Utility functions
  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },
  
  getRoomById: (id: string) => {
    return get().rooms.find(room => room.id === id);
  },
  
  getStyleById: (id: string) => {
    return get().styles.find(style => style.id === style.id);
  },
  
  getPopularStyles: () => {
    return get().styles.filter(style => style.is_popular);
  },
  
  getFeaturedReferences: () => {
    return get().referenceImages.filter(ref => ref.is_featured);
  },
  
  getTrendingPalettes: () => {
    // Filter old palettes by is_trending, user palettes don't have this field
    return get().colorPalettes.filter(palette => palette.is_trending);
  },
  
  getUserTrendingPalettes: () => {
    // For user palettes, we could sort by usage or creation date instead
    return get().userPalettes.slice(0, 10); // Top 10 most recent
  },
  
  // Get filtered references based on room and style selection
  getFilteredReferences: (roomId?: string, styleId?: string) => {
    let filtered = get().referenceImages;
    
    if (roomId) {
      filtered = filtered.filter(ref => ref.room_id === roomId);
    }
    if (styleId) {
      filtered = filtered.filter(ref => ref.style_id === styleId);
    }
    
    return filtered;
  },

  // Reset method for tests
  reset: () => {
    set({
      categories: [],
      rooms: [],
      styles: [],
      referenceImages: [],
      colorPalettes: [],
      examplePhotos: [],
      userReferences: [],
      userPalettes: [],
      selectedReferences: [],
      selectedPalettes: [],
      uploadProgress: {
        isUploading: false,
        progress: 0,
        stage: '',
        message: '',
      },
      colorExtraction: {
        isExtracting: false,
      },
      loading: {
        categories: false,
        rooms: false,
        styles: false,
        references: false,
        palettes: false,
        examplePhotos: false,
        userReferences: false,
        userPalettes: false,
      },
      errors: {
        categories: null,
        rooms: null,
        styles: null,
        references: null,
        palettes: null,
        examplePhotos: null,
        userReferences: null,
        userPalettes: null,
      },
    });
  },
}));