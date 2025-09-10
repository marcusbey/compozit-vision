import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Supabase client configuration for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (generated from schema)
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'business';
  subscription_status: string;
  stripe_customer_id?: string;
  credits_remaining: number;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  base_price: number;
  currency: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  materials: string[];
  colors: string[];
  style_tags: string[];
  images: Array<{
    url: string;
    alt?: string;
    is_primary?: boolean;
  }>;
  ar_model_url?: string;
  retailer_data: Record<string, any>;
  availability_status: string;
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  room_type?: string;
  room_dimensions?: {
    width: number;
    length: number;
    height: number;
    unit: string;
  };
  location_data?: {
    zip_code: string;
    city?: string;
    state?: string;
  };
  status: 'draft' | 'active' | 'completed' | 'archived';
  budget_min?: number;
  budget_max?: number;
  style_preferences: string[];
  original_images: Array<{
    url: string;
    metadata?: Record<string, any>;
  }>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  project_id: string;
  name?: string;
  style: string;
  ai_prompt?: string;
  generated_image_url?: string;
  processing_time_ms?: number;
  products: Array<{
    product_id: string;
    quantity: number;
    placement_data?: Record<string, any>;
  }>;
  estimated_cost?: number;
  user_rating?: number;
  is_favorite: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Order {
  id: string;
  user_id: string;
  project_id?: string;
  design_id?: string;
  stripe_payment_intent_id?: string;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    partner?: string;
  }>;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  },

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data || [];
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    return data;
  },

  // Product operations
  async searchProducts(query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    styles?: string[];
  }): Promise<Product[]> {
    let queryBuilder = supabase
      .from('products')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query);
    }

    if (filters?.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters?.minPrice) {
      queryBuilder = queryBuilder.gte('base_price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      queryBuilder = queryBuilder.lte('base_price', filters.maxPrice);
    }

    if (filters?.styles && filters.styles.length > 0) {
      queryBuilder = queryBuilder.overlaps('style_tags', filters.styles);
    }

    const { data, error } = await queryBuilder
      .order('rating', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data || [];
  },

  // Real-time subscriptions
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`project:${projectId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  subscribeToDesigns(projectId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`designs:${projectId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'designs', filter: `project_id=eq.${projectId}` },
        callback
      )
      .subscribe();
  },

  // Analytics
  async trackEvent(userId: string, eventType: string, eventData: Record<string, any>) {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking event:', error);
    }
  }
};

export default supabase;