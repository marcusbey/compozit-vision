/**
 * Content Store - Database-driven content management
 * Manages all app content from Supabase database
 * Replaces hardcoded data throughout the application
 */

import { create } from 'zustand';
import DatabaseService, { 
  type StyleCategory, 
  type StyleReferenceImage,
  type FurnitureCategory,
  type FurnitureStyleVariation,
  type SubscriptionPlan,
  type BudgetRange,
} from '../services/database';

export interface ContentState {
  // Styles
  styles: StyleCategory[];
  styleImages: Record<string, StyleReferenceImage[]>; // keyed by style_id
  loadingStyles: boolean;
  stylesLastLoaded: Date | null;

  // Furniture
  furniture: FurnitureCategory[];
  furnitureVariations: Record<string, FurnitureStyleVariation[]>; // keyed by category_id
  loadingFurniture: boolean;
  furnitureLastLoaded: Date | null;

  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[];
  loadingPlans: boolean;
  plansLastLoaded: Date | null;

  // Budget Ranges
  budgetRanges: BudgetRange[];
  loadingBudgets: boolean;
  budgetsLastLoaded: Date | null;

  // General loading state
  isInitialized: boolean;
  initializing: boolean;
  lastRefresh: Date | null;

  // Actions
  loadStyles: (forceRefresh?: boolean) => Promise<void>;
  loadStyleImages: (styleId: string, forceRefresh?: boolean) => Promise<StyleReferenceImage[]>;
  loadFurniture: (forceRefresh?: boolean) => Promise<void>;
  loadFurnitureVariations: (categoryId: string, forceRefresh?: boolean) => Promise<FurnitureStyleVariation[]>;
  loadSubscriptionPlans: (forceRefresh?: boolean) => Promise<void>;
  loadBudgetRanges: (forceRefresh?: boolean) => Promise<void>;
  initializeAllContent: () => Promise<void>;
  refreshAllContent: () => Promise<void>;

  // Getters
  getStyleById: (styleId: string) => StyleCategory | undefined;
  getFurnitureById: (furnitureId: string) => FurnitureCategory | undefined;
  getPlanById: (planId: string) => SubscriptionPlan | undefined;
  getBudgetById: (budgetId: string) => BudgetRange | undefined;
  
  // Popular/Featured content
  getFeaturedStyles: () => StyleCategory[];
  getPopularPlans: () => SubscriptionPlan[];
  getFeaturedFurniture: () => FurnitureCategory[];
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  styles: [],
  styleImages: {},
  loadingStyles: false,
  stylesLastLoaded: null,

  furniture: [],
  furnitureVariations: {},
  loadingFurniture: false,
  furnitureLastLoaded: null,

  subscriptionPlans: [],
  loadingPlans: false,
  plansLastLoaded: null,

  budgetRanges: [],
  loadingBudgets: false,
  budgetsLastLoaded: null,

  isInitialized: false,
  initializing: false,
  lastRefresh: null,

  // ===== STYLE ACTIONS =====

  loadStyles: async (forceRefresh = false) => {
    const { stylesLastLoaded, loadingStyles } = get();
    
    // Avoid duplicate loads
    if (loadingStyles) return;
    
    // Check if refresh needed
    if (!forceRefresh && stylesLastLoaded && !DatabaseService.shouldRefreshCache(stylesLastLoaded)) {
      console.log('🎨 Using cached styles');
      return;
    }

    try {
      set({ loadingStyles: true });
      console.log('🔄 Loading style categories from database...');

      const styles = await DatabaseService.getStyleCategories();
      
      set({ 
        styles,
        stylesLastLoaded: new Date(),
        loadingStyles: false
      });

      console.log(`✅ Loaded ${styles.length} style categories`);
      
    } catch (error) {
      console.error('❌ Failed to load styles:', error);
      set({ loadingStyles: false });
      throw error;
    }
  },

  loadStyleImages: async (styleId, forceRefresh = false) => {
    const { styleImages } = get();
    
    // Check cache first
    if (!forceRefresh && styleImages[styleId]) {
      console.log('🖼️ Using cached style images for:', styleId);
      return styleImages[styleId];
    }

    try {
      console.log('🔄 Loading style reference images for:', styleId);
      
      const images = await DatabaseService.getStyleReferenceImages(styleId);
      
      set({ 
        styleImages: {
          ...get().styleImages,
          [styleId]: images
        }
      });

      console.log(`✅ Loaded ${images.length} reference images for style ${styleId}`);
      return images;
      
    } catch (error) {
      console.error('❌ Failed to load style images:', error);
      throw error;
    }
  },

  // ===== FURNITURE ACTIONS =====

  loadFurniture: async (forceRefresh = false) => {
    const { furnitureLastLoaded, loadingFurniture } = get();
    
    if (loadingFurniture) return;
    
    if (!forceRefresh && furnitureLastLoaded && !DatabaseService.shouldRefreshCache(furnitureLastLoaded)) {
      console.log('🪑 Using cached furniture');
      return;
    }

    try {
      set({ loadingFurniture: true });
      console.log('🔄 Loading furniture categories from database...');

      const furniture = await DatabaseService.getFurnitureCategories();
      
      set({ 
        furniture,
        furnitureLastLoaded: new Date(),
        loadingFurniture: false
      });

      console.log(`✅ Loaded ${furniture.length} furniture categories`);
      
    } catch (error) {
      console.error('❌ Failed to load furniture:', error);
      set({ loadingFurniture: false });
      throw error;
    }
  },

  loadFurnitureVariations: async (categoryId, forceRefresh = false) => {
    const { furnitureVariations } = get();
    
    // Check cache first
    if (!forceRefresh && furnitureVariations[categoryId]) {
      console.log('🔄 Using cached furniture variations for:', categoryId);
      return furnitureVariations[categoryId];
    }

    try {
      console.log('🔄 Loading furniture variations for:', categoryId);
      
      const variations = await DatabaseService.getFurnitureStyleVariations(categoryId);
      
      set({ 
        furnitureVariations: {
          ...get().furnitureVariations,
          [categoryId]: variations
        }
      });

      console.log(`✅ Loaded ${variations.length} variations for furniture ${categoryId}`);
      return variations;
      
    } catch (error) {
      console.error('❌ Failed to load furniture variations:', error);
      throw error;
    }
  },

  // ===== SUBSCRIPTION ACTIONS =====

  loadSubscriptionPlans: async (forceRefresh = false) => {
    const { plansLastLoaded, loadingPlans } = get();
    
    if (loadingPlans) return;
    
    if (!forceRefresh && plansLastLoaded && !DatabaseService.shouldRefreshCache(plansLastLoaded)) {
      console.log('💳 Using cached subscription plans');
      return;
    }

    try {
      set({ loadingPlans: true });
      console.log('🔄 Loading subscription plans from database...');

      const plans = await DatabaseService.getSubscriptionPlans();
      
      set({ 
        subscriptionPlans: plans,
        plansLastLoaded: new Date(),
        loadingPlans: false
      });

      console.log(`✅ Loaded ${plans.length} subscription plans`);
      
    } catch (error) {
      console.error('❌ Failed to load subscription plans:', error);
      set({ loadingPlans: false });
      throw error;
    }
  },

  // ===== BUDGET ACTIONS =====

  loadBudgetRanges: async (forceRefresh = false) => {
    const { budgetsLastLoaded, loadingBudgets } = get();
    
    if (loadingBudgets) return;
    
    if (!forceRefresh && budgetsLastLoaded && !DatabaseService.shouldRefreshCache(budgetsLastLoaded)) {
      console.log('💰 Using cached budget ranges');
      return;
    }

    try {
      set({ loadingBudgets: true });
      console.log('🔄 Loading budget ranges from database...');

      const budgets = await DatabaseService.getBudgetRanges();
      
      set({ 
        budgetRanges: budgets,
        budgetsLastLoaded: new Date(),
        loadingBudgets: false
      });

      console.log(`✅ Loaded ${budgets.length} budget ranges`);
      
    } catch (error) {
      console.error('❌ Failed to load budget ranges:', error);
      set({ loadingBudgets: false });
      throw error;
    }
  },

  // ===== INITIALIZATION =====

  initializeAllContent: async () => {
    const { initializing, isInitialized } = get();
    
    if (initializing || isInitialized) {
      console.log('🔄 Content already initializing or initialized');
      return;
    }

    try {
      set({ initializing: true });
      console.log('🚀 Initializing all app content...');

      // Load all essential content in parallel
      await Promise.all([
        get().loadStyles(),
        get().loadFurniture(),
        get().loadSubscriptionPlans(),
        get().loadBudgetRanges(),
      ]);

      set({ 
        isInitialized: true,
        initializing: false,
        lastRefresh: new Date()
      });

      console.log('✅ All app content initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize app content:', error);
      set({ 
        initializing: false,
        isInitialized: false // Allow retry
      });
      throw error;
    }
  },

  refreshAllContent: async () => {
    console.log('🔄 Refreshing all app content...');
    
    try {
      // Force refresh all content
      await Promise.all([
        get().loadStyles(true),
        get().loadFurniture(true),
        get().loadSubscriptionPlans(true),
        get().loadBudgetRanges(true),
      ]);

      set({ lastRefresh: new Date() });
      console.log('✅ All content refreshed');
      
    } catch (error) {
      console.error('❌ Failed to refresh content:', error);
      throw error;
    }
  },

  // ===== GETTERS =====

  getStyleById: (styleId) => {
    return get().styles.find(s => s.id === styleId);
  },

  getFurnitureById: (furnitureId) => {
    return get().furniture.find(f => f.id === furnitureId);
  },

  getPlanById: (planId) => {
    return get().subscriptionPlans.find(p => p.id === planId);
  },

  getBudgetById: (budgetId) => {
    return get().budgetRanges.find(b => b.id === budgetId);
  },

  getFeaturedStyles: () => {
    return get().styles.filter(s => s.is_featured).sort((a, b) => a.display_order - b.display_order);
  },

  getPopularPlans: () => {
    return get().subscriptionPlans.filter(p => p.is_popular).sort((a, b) => a.display_order - b.display_order);
  },

  getFeaturedFurniture: () => {
    return get().furniture.filter(f => f.display_order <= 6).sort((a, b) => a.display_order - b.display_order);
  },
}));

/**
 * Initialize all app content on startup
 * Call this in App.tsx or root component
 */
export const initializeAppContent = async () => {
  const store = useContentStore.getState();
  await store.initializeAllContent();
};

export default useContentStore;