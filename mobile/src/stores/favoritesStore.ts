import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  userFavoritesService, 
  UserFavorite, 
  FavoriteCollection, 
  FavoriteStats 
} from '../services/userFavoritesService';

export interface FavoritesState {
  // Core favorites data
  favorites: UserFavorite[];
  collections: FavoriteCollection[];
  stats: FavoriteStats;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedCollection: string | null;
  
  // Local cache for offline support
  localFavorites: Set<string>; // itemType:itemId format
  lastSyncTime: number;
  
  // Actions
  loadFavorites: () => Promise<void>;
  loadCollections: () => Promise<void>;
  loadStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Favorite management
  toggleFavorite: (itemType: UserFavorite['item_type'], itemId: string, collectionId?: string) => Promise<boolean>;
  addToFavorites: (itemType: UserFavorite['item_type'], itemId: string, collectionId?: string) => Promise<void>;
  removeFromFavorites: (itemType: UserFavorite['item_type'], itemId: string) => Promise<void>;
  getFavoriteStatus: (itemType: UserFavorite['item_type'], itemId: string) => boolean;
  bulkToggleFavorites: (items: Array<{
    itemType: UserFavorite['item_type'];
    itemId: string;
    shouldFavorite: boolean;
    collectionId?: string;
  }>) => Promise<void>;
  
  // Collection management
  createCollection: (name: string, description?: string, itemType?: FavoriteCollection['item_type']) => Promise<FavoriteCollection>;
  updateCollection: (collectionId: string, updates: Partial<FavoriteCollection>) => Promise<void>;
  deleteCollection: (collectionId: string, moveToDefault?: boolean) => Promise<void>;
  setSelectedCollection: (collectionId: string | null) => void;
  addToCollection: (collectionId: string, items: Array<{ itemType: UserFavorite['item_type']; itemId: string }>) => Promise<void>;
  removeFromCollection: (collectionId: string, itemIds: string[]) => Promise<void>;
  
  // Filtered data getters
  getFavoritesByType: (itemType: UserFavorite['item_type']) => UserFavorite[];
  getFavoritesByCollection: (collectionId?: string) => UserFavorite[];
  getRecentFavorites: (limit?: number) => UserFavorite[];
  
  // Offline support
  syncWithServer: () => Promise<void>;
  addToLocalFavorites: (itemType: UserFavorite['item_type'], itemId: string) => void;
  removeFromLocalFavorites: (itemType: UserFavorite['item_type'], itemId: string) => void;
  
  // Utility actions
  clearError: () => void;
  reset: () => void;
}

const initialStats: FavoriteStats = {
  totalFavorites: 0,
  referenceImages: 0,
  colorPalettes: 0,
  designStyles: 0,
  furnitureItems: 0,
  collections: 0,
};

// Helper function to create local favorite key
const createLocalKey = (itemType: UserFavorite['item_type'], itemId: string): string => {
  return `${itemType}:${itemId}`;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],
      collections: [],
      stats: initialStats,
      isLoading: false,
      error: null,
      selectedCollection: null,
      localFavorites: new Set(),
      lastSyncTime: 0,

      // Load functions
      loadFavorites: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const favorites = await userFavoritesService.getUserFavorites();
          
          // Update local cache with server data
          const localFavorites = new Set<string>();
          favorites.forEach(fav => {
            localFavorites.add(createLocalKey(fav.item_type, fav.item_id));
          });
          
          set({ favorites, localFavorites, lastSyncTime: Date.now() });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load favorites';
          set({ error: errorMessage });
          console.error('Failed to load favorites:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadCollections: async () => {
        try {
          set({ error: null });
          
          const collections = await userFavoritesService.getUserCollections();
          set({ collections });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load collections';
          set({ error: errorMessage });
          console.error('Failed to load collections:', error);
        }
      },

      loadStats: async () => {
        try {
          set({ error: null });
          
          const stats = await userFavoritesService.getFavoriteStats();
          set({ stats });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load stats';
          set({ error: errorMessage });
          console.error('Failed to load stats:', error);
        }
      },

      refreshAll: async () => {
        const { loadFavorites, loadCollections, loadStats } = get();
        
        await Promise.all([
          loadFavorites(),
          loadCollections(),
          loadStats(),
        ]);
      },

      // Favorite management
      toggleFavorite: async (itemType, itemId, collectionId) => {
        try {
          set({ error: null });
          
          const isFavorite = await userFavoritesService.toggleFavorite(itemType, itemId, collectionId);
          
          // Update local state
          const { localFavorites } = get();
          const key = createLocalKey(itemType, itemId);
          const newLocalFavorites = new Set(localFavorites);
          
          if (isFavorite) {
            newLocalFavorites.add(key);
            get().addToLocalFavorites(itemType, itemId);
          } else {
            newLocalFavorites.delete(key);
            get().removeFromLocalFavorites(itemType, itemId);
          }
          
          set({ localFavorites: newLocalFavorites });
          
          // Refresh data to get updated server state
          await Promise.all([
            get().loadFavorites(),
            get().loadStats(),
          ]);
          
          return isFavorite;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to toggle favorite';
          set({ error: errorMessage });
          console.error('Failed to toggle favorite:', error);
          throw error;
        }
      },

      addToFavorites: async (itemType, itemId, collectionId) => {
        try {
          set({ error: null });
          
          await userFavoritesService.addToFavorites(itemType, itemId, collectionId);
          
          // Update local state
          get().addToLocalFavorites(itemType, itemId);
          
          // Refresh data
          await Promise.all([
            get().loadFavorites(),
            get().loadStats(),
          ]);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add favorite';
          set({ error: errorMessage });
          console.error('Failed to add favorite:', error);
          throw error;
        }
      },

      removeFromFavorites: async (itemType, itemId) => {
        try {
          set({ error: null });
          
          await userFavoritesService.removeFromFavorites(itemType, itemId);
          
          // Update local state
          get().removeFromLocalFavorites(itemType, itemId);
          
          // Refresh data
          await Promise.all([
            get().loadFavorites(),
            get().loadStats(),
          ]);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
          set({ error: errorMessage });
          console.error('Failed to remove favorite:', error);
          throw error;
        }
      },

      getFavoriteStatus: (itemType, itemId) => {
        const { localFavorites } = get();
        const key = createLocalKey(itemType, itemId);
        return localFavorites.has(key);
      },

      bulkToggleFavorites: async (items) => {
        try {
          set({ error: null });
          
          await userFavoritesService.bulkToggleFavorites(items);
          
          // Update local state
          const { localFavorites } = get();
          const newLocalFavorites = new Set(localFavorites);
          
          items.forEach(item => {
            const key = createLocalKey(item.itemType, item.itemId);
            if (item.shouldFavorite) {
              newLocalFavorites.add(key);
            } else {
              newLocalFavorites.delete(key);
            }
          });
          
          set({ localFavorites: newLocalFavorites });
          
          // Refresh data
          await get().refreshAll();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update favorites';
          set({ error: errorMessage });
          console.error('Failed to bulk update favorites:', error);
          throw error;
        }
      },

      // Collection management
      createCollection: async (name, description, itemType = 'mixed') => {
        try {
          set({ error: null });
          
          const collection = await userFavoritesService.createCollection(name, description, itemType);
          
          // Refresh collections
          await get().loadCollections();
          
          return collection;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create collection';
          set({ error: errorMessage });
          console.error('Failed to create collection:', error);
          throw error;
        }
      },

      updateCollection: async (collectionId, updates) => {
        try {
          set({ error: null });
          
          await userFavoritesService.updateCollection(collectionId, updates);
          
          // Refresh collections
          await get().loadCollections();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update collection';
          set({ error: errorMessage });
          console.error('Failed to update collection:', error);
          throw error;
        }
      },

      deleteCollection: async (collectionId, moveToDefault = false) => {
        try {
          set({ error: null });
          
          await userFavoritesService.deleteCollection(collectionId, moveToDefault);
          
          // Clear selected collection if it was deleted
          const { selectedCollection } = get();
          if (selectedCollection === collectionId) {
            set({ selectedCollection: null });
          }
          
          // Refresh all data
          await get().refreshAll();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete collection';
          set({ error: errorMessage });
          console.error('Failed to delete collection:', error);
          throw error;
        }
      },

      setSelectedCollection: (collectionId) => {
        set({ selectedCollection: collectionId });
      },

      addToCollection: async (collectionId, items) => {
        try {
          set({ error: null });
          
          await userFavoritesService.addToCollection(collectionId, items);
          
          // Refresh data
          await Promise.all([
            get().loadFavorites(),
            get().loadCollections(),
          ]);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add to collection';
          set({ error: errorMessage });
          console.error('Failed to add to collection:', error);
          throw error;
        }
      },

      removeFromCollection: async (collectionId, itemIds) => {
        try {
          set({ error: null });
          
          await userFavoritesService.removeFromCollection(collectionId, itemIds);
          
          // Refresh data
          await Promise.all([
            get().loadFavorites(),
            get().loadCollections(),
          ]);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove from collection';
          set({ error: errorMessage });
          console.error('Failed to remove from collection:', error);
          throw error;
        }
      },

      // Filtered data getters
      getFavoritesByType: (itemType) => {
        const { favorites } = get();
        return favorites.filter(fav => fav.item_type === itemType);
      },

      getFavoritesByCollection: (collectionId) => {
        const { favorites } = get();
        if (collectionId) {
          return favorites.filter(fav => fav.collection_id === collectionId);
        } else {
          return favorites.filter(fav => !fav.collection_id);
        }
      },

      getRecentFavorites: (limit = 10) => {
        const { favorites } = get();
        return favorites
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);
      },

      // Offline support
      syncWithServer: async () => {
        try {
          const { localFavorites, lastSyncTime } = get();
          
          // Only sync if we haven't synced recently (within last 5 minutes)
          const timeSinceLastSync = Date.now() - lastSyncTime;
          if (timeSinceLastSync < 5 * 60 * 1000) {
            return;
          }
          
          // Convert local favorites to array format
          const localFavoritesArray = Array.from(localFavorites).map(key => {
            const [itemType, itemId] = key.split(':');
            return {
              itemType: itemType as UserFavorite['item_type'],
              itemId,
            };
          });
          
          // Sync with server
          await userFavoritesService.syncFavoritesFromLocal(localFavoritesArray);
          
          // Refresh from server
          await get().refreshAll();
        } catch (error) {
          console.error('Failed to sync with server:', error);
        }
      },

      addToLocalFavorites: (itemType, itemId) => {
        const { localFavorites } = get();
        const key = createLocalKey(itemType, itemId);
        const newLocalFavorites = new Set(localFavorites);
        newLocalFavorites.add(key);
        set({ localFavorites: newLocalFavorites });
      },

      removeFromLocalFavorites: (itemType, itemId) => {
        const { localFavorites } = get();
        const key = createLocalKey(itemType, itemId);
        const newLocalFavorites = new Set(localFavorites);
        newLocalFavorites.delete(key);
        set({ localFavorites: newLocalFavorites });
      },

      // Utility actions
      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          favorites: [],
          collections: [],
          stats: initialStats,
          isLoading: false,
          error: null,
          selectedCollection: null,
          localFavorites: new Set(),
          lastSyncTime: 0,
        });
      },
    }),
    {
      name: 'favorites-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist local favorites and last sync time for offline support
      partialize: (state) => ({
        localFavorites: Array.from(state.localFavorites), // Convert Set to Array for JSON
        lastSyncTime: state.lastSyncTime,
        selectedCollection: state.selectedCollection,
      }),
      // Deserialize local favorites from array back to Set
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.localFavorites)) {
          state.localFavorites = new Set(state.localFavorites);
        }
      },
    }
  )
);