/**
 * Database Service Layer
 * Connects React Native app to Supabase database
 * Replaces all hardcoded data with database fetches
 */

import { supabase } from './supabase';

// Type definitions for database entities
export interface StyleCategory {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  description?: string;
  emoji?: string;
  characteristic_tags: string[];
  color_schemes: string[];
  room_compatibility: string[];
  furniture_styles: string[];
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  selection_limit: number;
  created_at: string;
  updated_at: string;
}

export interface StyleReferenceImage {
  id: string;
  style_category_id: string;
  name: string;
  description?: string;
  thumbnail_url: string;
  medium_url: string;
  large_url: string;
  width: number;
  height: number;
  file_size_kb?: number;
  dominant_colors: string[];
  room_type?: string;
  style_elements: string[];
  mood_tags: string[];
  display_order: number;
  is_hero_image: boolean;
  is_active: boolean;
  source_attribution?: string;
  alt_text?: string;
  metadata: Record<string, any>;
}

export interface FurnitureCategory {
  id: string;
  name: string;
  display_name: string;
  emoji?: string;
  description?: string;
  category_type: string;
  visual_impact_score: number;
  room_compatibility: string[];
  style_compatibility: string[];
  display_order: number;
  is_active: boolean;
}

export interface FurnitureStyleVariation {
  id: string;
  category_id: string;
  style_name: string;
  style_slug: string;
  description?: string;
  primary_color?: string;
  secondary_colors: string[];
  finish_type?: string;
  material_tags: string[];
  gallery_images: Array<{
    url: string;
    thumbnail_url: string;
    width: number;
    height: number;
    alt_text?: string;
  }>;
  primary_image_url: string;
  thumbnail_url: string;
  price_range_min?: number;
  price_range_max?: number;
  currency: string;
  room_types: string[];
  design_styles: string[];
  color_palettes: string[];
  view_count: number;
  like_count: number;
  selection_count: number;
  popularity_score: number;
  display_order: number;
  is_featured: boolean;
  is_available: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_amount: number;
  price_currency: string;
  billing_period: string;
  designs_included?: number;
  credits_included: number;
  is_popular: boolean;
  is_featured: boolean;
  badge_text?: string;
  highlight_color?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  display_order: number;
  is_active: boolean;
}

export interface BudgetRange {
  id: string;
  label: string;
  description: string;
  min_amount: number;
  max_amount: number;
  currency: string;
  display_order: number;
  is_default: boolean;
  is_active: boolean;
}

export interface JourneyStep {
  id: string;
  step_number: number;
  screen_name: string;
  step_name: string;
  title: string;
  description?: string;
  is_required: boolean;
  estimated_duration_seconds?: number;
  allows_skip: boolean;
  display_order: number;
  is_active: boolean;
}

/**
 * Database Service Class
 * Handles all database operations for the app
 */
export class DatabaseService {
  
  // ===== STYLE SYSTEM =====
  
  /**
   * Fetch all active style categories for onboarding
   */
  static async getStyleCategories(): Promise<StyleCategory[]> {
    try {
      const { data, error } = await supabase
        .from('style_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching style categories:', error);
        throw new Error(`Failed to fetch style categories: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getStyleCategories failed:', err);
      throw err;
    }
  }

  /**
   * Fetch style reference images for a specific style (grid display)
   */
  static async getStyleReferenceImages(styleId: string): Promise<StyleReferenceImage[]> {
    try {
      const { data, error } = await supabase
        .from('style_reference_images')
        .select('*')
        .eq('style_category_id', styleId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('is_hero_image', { ascending: false }); // Hero images first

      if (error) {
        console.error('Error fetching style reference images:', error);
        throw new Error(`Failed to fetch style images: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getStyleReferenceImages failed:', err);
      throw err;
    }
  }

  // ===== FURNITURE SYSTEM =====
  
  /**
   * Fetch all active furniture categories for selection
   */
  static async getFurnitureCategories(): Promise<FurnitureCategory[]> {
    try {
      const { data, error } = await supabase
        .from('furniture_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching furniture categories:', error);
        throw new Error(`Failed to fetch furniture categories: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getFurnitureCategories failed:', err);
      throw err;
    }
  }

  /**
   * Fetch furniture style variations for swipe carousel (3-4 options per furniture type)
   */
  static async getFurnitureStyleVariations(categoryId: string): Promise<FurnitureStyleVariation[]> {
    try {
      const { data, error } = await supabase
        .from('furniture_style_variations')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('popularity_score', { ascending: false })
        .order('display_order', { ascending: true })
        .limit(4); // Limit to 4 variations for swipe experience

      if (error) {
        console.error('Error fetching furniture style variations:', error);
        throw new Error(`Failed to fetch furniture variations: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getFurnitureStyleVariations failed:', err);
      throw err;
    }
  }

  /**
   * Update furniture selection count (analytics)
   */
  static async incrementFurnitureSelection(variationId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_selection_count', {
        variation_id: variationId
      });

      if (error) {
        console.warn('Failed to increment furniture selection count:', error);
        // Don't throw - this is analytics, not critical
      }
    } catch (err) {
      console.warn('DatabaseService.incrementFurnitureSelection failed:', err);
      // Don't throw - this is analytics, not critical
    }
  }

  // ===== SUBSCRIPTION SYSTEM =====
  
  /**
   * Fetch all active subscription plans for paywall
   */
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw new Error(`Failed to fetch subscription plans: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getSubscriptionPlans failed:', err);
      throw err;
    }
  }

  // ===== BUDGET SYSTEM =====
  
  /**
   * Fetch all active budget ranges for budget selection
   */
  static async getBudgetRanges(): Promise<BudgetRange[]> {
    try {
      const { data, error } = await supabase
        .from('budget_ranges')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching budget ranges:', error);
        throw new Error(`Failed to fetch budget ranges: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getBudgetRanges failed:', err);
      throw err;
    }
  }

  // ===== JOURNEY SYSTEM =====
  
  /**
   * Fetch all active journey steps for progress tracking
   */
  static async getJourneySteps(): Promise<JourneyStep[]> {
    try {
      const { data, error } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('is_active', true)
        .order('step_number', { ascending: true });

      if (error) {
        console.error('Error fetching journey steps:', error);
        throw new Error(`Failed to fetch journey steps: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error('DatabaseService.getJourneySteps failed:', err);
      throw err;
    }
  }

  /**
   * Get journey step by screen name
   */
  static async getJourneyStepByScreen(screenName: string): Promise<JourneyStep | null> {
    try {
      const { data, error } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('screen_name', screenName)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching journey step:', error);
        throw new Error(`Failed to fetch journey step: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.error('DatabaseService.getJourneyStepByScreen failed:', err);
      throw err;
    }
  }

  // ===== ANALYTICS & TRACKING =====
  
  /**
   * Track user style selection for analytics
   */
  static async trackStyleSelection(styleId: string, userId?: string): Promise<void> {
    try {
      // This could be expanded to track in a separate analytics table
      console.log('Style selected:', styleId, 'by user:', userId);
      // Placeholder for future analytics implementation
    } catch (err) {
      console.warn('Style selection tracking failed:', err);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Get app configuration values
   */
  static async getAppConfiguration(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('app_configuration')
        .select('config_value')
        .eq('config_key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Config key not found
        }
        console.error('Error fetching app configuration:', error);
        return null;
      }

      return data?.config_value || null;
    } catch (err) {
      console.error('DatabaseService.getAppConfiguration failed:', err);
      return null;
    }
  }

  // ===== CACHE MANAGEMENT =====
  
  /**
   * Check if data should be refreshed based on cache time
   */
  static shouldRefreshCache(lastFetch: Date | null, maxAgeMinutes: number = 30): boolean {
    if (!lastFetch) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastFetch.getTime();
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    
    return timeDiff > maxAge;
  }

  // ===== BATCH OPERATIONS =====
  
  /**
   * Fetch all essential data for app initialization
   */
  static async fetchEssentialData(): Promise<{
    styles: StyleCategory[];
    furniture: FurnitureCategory[];
    plans: SubscriptionPlan[];
    budgetRanges: BudgetRange[];
    journeySteps: JourneyStep[];
  }> {
    try {
      console.log('🔄 Fetching essential app data from database...');
      
      const [styles, furniture, plans, budgetRanges, journeySteps] = await Promise.all([
        this.getStyleCategories(),
        this.getFurnitureCategories(),
        this.getSubscriptionPlans(),
        this.getBudgetRanges(),
        this.getJourneySteps()
      ]);

      console.log('✅ Essential data loaded:', {
        styles: styles.length,
        furniture: furniture.length,
        plans: plans.length,
        budgetRanges: budgetRanges.length,
        journeySteps: journeySteps.length
      });

      return {
        styles,
        furniture,
        plans,
        budgetRanges,
        journeySteps
      };
    } catch (err) {
      console.error('DatabaseService.fetchEssentialData failed:', err);
      throw new Error('Failed to load essential app data from database');
    }
  }
}

export default DatabaseService;