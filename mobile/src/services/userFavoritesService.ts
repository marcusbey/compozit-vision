import { supabase } from './supabase';

// Types for user favorites system
export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: 'reference_image' | 'color_palette' | 'design_style' | 'furniture_item';
  item_id: string;
  collection_id?: string; // Optional grouping into collections
  created_at: string;
  updated_at: string;
}

export interface FavoriteCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  item_type: 'reference_image' | 'color_palette' | 'design_style' | 'furniture_item' | 'mixed';
  item_count: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FavoriteStats {
  totalFavorites: number;
  referenceImages: number;
  colorPalettes: number;
  designStyles: number;
  furnitureItems: number;
  collections: number;
}

/**
 * Service for managing user favorites across all content types
 * Provides persistent storage, collections, and sync across devices
 */
export class UserFavoritesService {
  private static instance: UserFavoritesService;

  public static getInstance(): UserFavoritesService {
    if (!UserFavoritesService.instance) {
      UserFavoritesService.instance = new UserFavoritesService();
    }
    return UserFavoritesService.instance;
  }

  /**
   * Add item to user's favorites
   */
  async addToFavorites(
    itemType: UserFavorite['item_type'],
    itemId: string,
    collectionId?: string
  ): Promise<UserFavorite> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already favorited
      const existing = await this.getFavoriteStatus(itemType, itemId);
      if (existing) {
        return existing;
      }

      const favoriteData = {
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        collection_id: collectionId,
      };

      const { data, error } = await supabase
        .from('user_favorites')
        .insert(favoriteData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add favorite: ${error.message}`);
      }

      // Update the source item's favorite status
      await this.updateSourceItemFavoriteStatus(itemType, itemId, true);

      // Update collection count if applicable
      if (collectionId) {
        await this.updateCollectionCount(collectionId);
      }

      return data;

    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove item from user's favorites
   */
  async removeFromFavorites(
    itemType: UserFavorite['item_type'],
    itemId: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (error) {
        throw new Error(`Failed to remove favorite: ${error.message}`);
      }

      // Update the source item's favorite status
      await this.updateSourceItemFavoriteStatus(itemType, itemId, false);

    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for an item
   */
  async toggleFavorite(
    itemType: UserFavorite['item_type'],
    itemId: string,
    collectionId?: string
  ): Promise<boolean> {
    try {
      const existing = await this.getFavoriteStatus(itemType, itemId);
      
      if (existing) {
        await this.removeFromFavorites(itemType, itemId);
        return false;
      } else {
        await this.addToFavorites(itemType, itemId, collectionId);
        return true;
      }

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  /**
   * Get favorite status for an item
   */
  async getFavoriteStatus(
    itemType: UserFavorite['item_type'],
    itemId: string
  ): Promise<UserFavorite | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to check favorite status: ${error.message}`);
      }

      return data || null;

    } catch (error) {
      console.error('Failed to get favorite status:', error);
      return null;
    }
  }

  /**
   * Get all user favorites with optional filtering
   */
  async getUserFavorites(
    filters: {
      itemType?: UserFavorite['item_type'];
      collectionId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UserFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.itemType) {
        query = query.eq('item_type', filters.itemType);
      }

      if (filters.collectionId) {
        query = query.eq('collection_id', filters.collectionId);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get user favorites: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Failed to get user favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite statistics
   */
  async getFavoriteStats(): Promise<FavoriteStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          totalFavorites: 0,
          referenceImages: 0,
          colorPalettes: 0,
          designStyles: 0,
          furnitureItems: 0,
          collections: 0,
        };
      }

      // Get counts by type
      const { data: stats, error } = await supabase
        .from('user_favorites')
        .select('item_type')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to get favorite stats: ${error.message}`);
      }

      const counts = stats.reduce((acc, item) => {
        acc[item.item_type] = (acc[item.item_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get collections count
      const { data: collections, error: collectionsError } = await supabase
        .from('favorite_collections')
        .select('id')
        .eq('user_id', user.id);

      if (collectionsError) {
        console.warn('Failed to get collections count:', collectionsError);
      }

      return {
        totalFavorites: stats.length,
        referenceImages: counts.reference_image || 0,
        colorPalettes: counts.color_palette || 0,
        designStyles: counts.design_style || 0,
        furnitureItems: counts.furniture_item || 0,
        collections: collections?.length || 0,
      };

    } catch (error) {
      console.error('Failed to get favorite stats:', error);
      throw error;
    }
  }

  /**
   * Create a new favorite collection
   */
  async createCollection(
    name: string,
    description?: string,
    itemType: FavoriteCollection['item_type'] = 'mixed'
  ): Promise<FavoriteCollection> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const collectionData = {
        user_id: user.id,
        name,
        description,
        item_type: itemType,
        item_count: 0,
        is_default: false,
      };

      const { data, error } = await supabase
        .from('favorite_collections')
        .insert(collectionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create collection: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite collections
   */
  async getUserCollections(): Promise<FavoriteCollection[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorite_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get collections: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Failed to get user collections:', error);
      throw error;
    }
  }

  /**
   * Update collection
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<FavoriteCollection>
  ): Promise<FavoriteCollection> {
    try {
      const { data, error } = await supabase
        .from('favorite_collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update collection: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  }

  /**
   * Delete collection and optionally move items to default
   */
  async deleteCollection(
    collectionId: string,
    moveToDefault: boolean = false
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (moveToDefault) {
        // Update all items in this collection to have no collection
        const { error: updateError } = await supabase
          .from('user_favorites')
          .update({ collection_id: null })
          .eq('collection_id', collectionId)
          .eq('user_id', user.id);

        if (updateError) {
          console.warn('Failed to move items to default:', updateError);
        }
      } else {
        // Delete all items in this collection
        const { error: deleteItemsError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('collection_id', collectionId)
          .eq('user_id', user.id);

        if (deleteItemsError) {
          console.warn('Failed to delete collection items:', deleteItemsError);
        }
      }

      // Delete the collection
      const { error } = await supabase
        .from('favorite_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete collection: ${error.message}`);
      }

    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }

  /**
   * Add items to collection
   */
  async addToCollection(
    collectionId: string,
    items: Array<{ itemType: UserFavorite['item_type']; itemId: string }>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update existing favorites or create new ones
      for (const item of items) {
        const existing = await this.getFavoriteStatus(item.itemType, item.itemId);
        
        if (existing) {
          // Update existing favorite to be in this collection
          await supabase
            .from('user_favorites')
            .update({ collection_id: collectionId })
            .eq('id', existing.id);
        } else {
          // Create new favorite in this collection
          await this.addToFavorites(item.itemType, item.itemId, collectionId);
        }
      }

      // Update collection count
      await this.updateCollectionCount(collectionId);

    } catch (error) {
      console.error('Failed to add items to collection:', error);
      throw error;
    }
  }

  /**
   * Remove items from collection (keeps as favorites without collection)
   */
  async removeFromCollection(
    collectionId: string,
    itemIds: string[]
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_favorites')
        .update({ collection_id: null })
        .eq('collection_id', collectionId)
        .eq('user_id', user.id)
        .in('item_id', itemIds);

      if (error) {
        throw new Error(`Failed to remove from collection: ${error.message}`);
      }

      // Update collection count
      await this.updateCollectionCount(collectionId);

    } catch (error) {
      console.error('Failed to remove from collection:', error);
      throw error;
    }
  }

  /**
   * Get favorites with detailed item information
   */
  async getFavoritesWithDetails(
    itemType?: UserFavorite['item_type'],
    collectionId?: string
  ): Promise<any[]> {
    try {
      const favorites = await this.getUserFavorites({ itemType, collectionId });
      const detailedFavorites = [];

      for (const favorite of favorites) {
        let itemDetails = null;

        try {
          switch (favorite.item_type) {
            case 'reference_image':
              const { data: refImage } = await supabase
                .from('user_reference_images')
                .select('*')
                .eq('id', favorite.item_id)
                .single();
              itemDetails = refImage;
              break;

            case 'color_palette':
              const { data: palette } = await supabase
                .from('user_color_palettes')
                .select('*')
                .eq('id', favorite.item_id)
                .single();
              itemDetails = palette;
              break;

            case 'design_style':
              const { data: style } = await supabase
                .from('design_styles')
                .select('*')
                .eq('id', favorite.item_id)
                .single();
              itemDetails = style;
              break;

            case 'furniture_item':
              const { data: furniture } = await supabase
                .from('furniture_items')
                .select('*')
                .eq('id', favorite.item_id)
                .single();
              itemDetails = furniture;
              break;
          }

          if (itemDetails) {
            detailedFavorites.push({
              favorite,
              item: itemDetails,
              itemType: favorite.item_type,
            });
          }
        } catch (itemError) {
          console.warn(`Failed to get details for ${favorite.item_type} ${favorite.item_id}:`, itemError);
        }
      }

      return detailedFavorites;

    } catch (error) {
      console.error('Failed to get favorites with details:', error);
      throw error;
    }
  }

  /**
   * Update source item's favorite status in its original table
   */
  private async updateSourceItemFavoriteStatus(
    itemType: UserFavorite['item_type'],
    itemId: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      const updates = { is_favorite: isFavorite, updated_at: new Date().toISOString() };

      switch (itemType) {
        case 'reference_image':
          await supabase
            .from('user_reference_images')
            .update(updates)
            .eq('id', itemId);
          break;

        case 'color_palette':
          await supabase
            .from('user_color_palettes')
            .update(updates)
            .eq('id', itemId);
          break;

        case 'design_style':
          await supabase
            .from('design_styles')
            .update(updates)
            .eq('id', itemId);
          break;

        case 'furniture_item':
          await supabase
            .from('furniture_items')
            .update(updates)
            .eq('id', itemId);
          break;
      }
    } catch (error) {
      console.warn('Failed to update source item favorite status:', error);
    }
  }

  /**
   * Update collection item count
   */
  private async updateCollectionCount(collectionId: string): Promise<void> {
    try {
      // Get current count
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('collection_id', collectionId);

      if (error) {
        console.warn('Failed to count collection items:', error);
        return;
      }

      // Update collection
      await supabase
        .from('favorite_collections')
        .update({
          item_count: favorites?.length || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId);

    } catch (error) {
      console.warn('Failed to update collection count:', error);
    }
  }

  /**
   * Sync favorites from local storage (for offline support)
   */
  async syncFavoritesFromLocal(
    localFavorites: Array<{ itemType: UserFavorite['item_type']; itemId: string }>
  ): Promise<void> {
    try {
      for (const local of localFavorites) {
        const existing = await this.getFavoriteStatus(local.itemType, local.itemId);
        if (!existing) {
          await this.addToFavorites(local.itemType, local.itemId);
        }
      }
    } catch (error) {
      console.error('Failed to sync favorites from local:', error);
    }
  }

  /**
   * Bulk favorite operations for performance
   */
  async bulkToggleFavorites(
    items: Array<{
      itemType: UserFavorite['item_type'];
      itemId: string;
      shouldFavorite: boolean;
      collectionId?: string;
    }>
  ): Promise<void> {
    try {
      for (const item of items) {
        if (item.shouldFavorite) {
          await this.addToFavorites(item.itemType, item.itemId, item.collectionId);
        } else {
          await this.removeFromFavorites(item.itemType, item.itemId);
        }
      }
    } catch (error) {
      console.error('Failed to bulk toggle favorites:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userFavoritesService = UserFavoritesService.getInstance();