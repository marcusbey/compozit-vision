/**
 * Database Integration Tests
 * Verifies React Native app connects to Supabase database successfully
 * Tests all database-driven content loading
 */

import DatabaseService from '../services/database';
import { useContentStore } from '../stores/contentStore';
import { useJourneyStore } from '../stores/journeyStore';

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Database Integration Tests', () => {
  
  describe('DatabaseService Connection', () => {
    
    test('should connect to Supabase successfully', async () => {
      // Test basic connection by fetching style categories
      const styles = await DatabaseService.getStyleCategories();
      
      expect(styles).toBeDefined();
      expect(Array.isArray(styles)).toBe(true);
      console.log(`✅ Connected to database - found ${styles.length} style categories`);
    }, 10000);

    test('should fetch style categories with proper structure', async () => {
      const styles = await DatabaseService.getStyleCategories();
      
      expect(styles.length).toBeGreaterThan(0);
      
      // Verify structure of first style
      const firstStyle = styles[0];
      expect(firstStyle).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
        display_name: expect.any(String),
        display_order: expect.any(Number),
        is_active: true
      });
      
      console.log('✅ Style categories structure verified');
    }, 10000);

    test('should fetch furniture categories successfully', async () => {
      const furniture = await DatabaseService.getFurnitureCategories();
      
      expect(furniture).toBeDefined();
      expect(Array.isArray(furniture)).toBe(true);
      expect(furniture.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstFurniture = furniture[0];
      expect(firstFurniture).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        display_name: expect.any(String),
        emoji: expect.any(String),
        category_type: expect.any(String)
      });
      
      console.log(`✅ Furniture categories loaded - ${furniture.length} categories`);
    }, 10000);

    test('should fetch subscription plans successfully', async () => {
      const plans = await DatabaseService.getSubscriptionPlans();
      
      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstPlan = plans[0];
      expect(firstPlan).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price_amount: expect.any(Number),
        price_currency: 'USD',
        is_active: true
      });
      
      console.log(`✅ Subscription plans loaded - ${plans.length} plans`);
    }, 10000);

    test('should fetch budget ranges successfully', async () => {
      const budgets = await DatabaseService.getBudgetRanges();
      
      expect(budgets).toBeDefined();
      expect(Array.isArray(budgets)).toBe(true);
      expect(budgets.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstBudget = budgets[0];
      expect(firstBudget).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        min_amount: expect.any(Number),
        max_amount: expect.any(Number),
        currency: 'USD'
      });
      
      console.log(`✅ Budget ranges loaded - ${budgets.length} ranges`);
    }, 10000);

    test('should fetch journey steps successfully', async () => {
      const steps = await DatabaseService.getJourneySteps();
      
      expect(steps).toBeDefined();
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstStep = steps[0];
      expect(firstStep).toMatchObject({
        id: expect.any(String),
        step_number: expect.any(Number),
        screen_name: expect.any(String),
        title: expect.any(String),
        is_active: true
      });
      
      console.log(`✅ Journey steps loaded - ${steps.length} steps`);
    }, 10000);

  });

  describe('Content Store Integration', () => {
    
    test('should initialize all content successfully', async () => {
      const store = useContentStore.getState();
      
      // Initialize all content
      await store.initializeAllContent();
      
      const { styles, furniture, subscriptionPlans, budgetRanges, isInitialized } = store;
      
      expect(isInitialized).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      expect(furniture.length).toBeGreaterThan(0);
      expect(subscriptionPlans.length).toBeGreaterThan(0);
      expect(budgetRanges.length).toBeGreaterThan(0);
      
      console.log('✅ Content store initialized with all data');
    }, 15000);

    test('should load style reference images', async () => {
      const store = useContentStore.getState();
      await store.loadStyles();
      
      const { styles } = store;
      expect(styles.length).toBeGreaterThan(0);
      
      // Test loading images for first style
      const firstStyle = styles[0];
      const images = await store.loadStyleImages(firstStyle.id);
      
      expect(Array.isArray(images)).toBe(true);
      console.log(`✅ Style images loaded for ${firstStyle.name} - ${images.length} images`);
    }, 10000);

    test('should load furniture variations', async () => {
      const store = useContentStore.getState();
      await store.loadFurniture();
      
      const { furniture } = store;
      expect(furniture.length).toBeGreaterThan(0);
      
      // Test loading variations for first furniture
      const firstFurniture = furniture[0];
      const variations = await store.loadFurnitureVariations(firstFurniture.id);
      
      expect(Array.isArray(variations)).toBe(true);
      console.log(`✅ Furniture variations loaded for ${firstFurniture.display_name} - ${variations.length} variations`);
    }, 10000);

  });

  describe('Journey Store Integration', () => {
    
    test('should load journey steps from database', async () => {
      const store = useJourneyStore.getState();
      
      // Load journey steps
      await store.loadJourneySteps();
      
      const { journeySteps, loadingSteps, progress } = store;
      
      expect(loadingSteps).toBe(false);
      expect(journeySteps.length).toBeGreaterThan(0);
      expect(progress.totalSteps).toBe(journeySteps.length);
      
      console.log(`✅ Journey steps loaded - ${journeySteps.length} steps configured`);
    }, 10000);

    test('should provide step navigation helpers', async () => {
      const store = useJourneyStore.getState();
      await store.loadJourneySteps();
      
      // Test step info retrieval
      const stepInfo = store.getStepInfo('onboarding1');
      expect(stepInfo).toBeDefined();
      expect(stepInfo?.screen_name).toBe('onboarding1');
      
      // Test next step navigation
      const nextStep = store.getNextStep('onboarding1');
      expect(nextStep).toBeDefined();
      expect(nextStep?.step_number).toBeGreaterThan(1);
      
      console.log('✅ Journey navigation helpers working');
    }, 10000);

  });

  describe('Error Handling', () => {
    
    test('should handle invalid style ID gracefully', async () => {
      await expect(async () => {
        await DatabaseService.getStyleReferenceImages('invalid-id');
      }).not.toThrow();
      
      const images = await DatabaseService.getStyleReferenceImages('invalid-id');
      expect(Array.isArray(images)).toBe(true);
      expect(images.length).toBe(0);
      
      console.log('✅ Invalid style ID handled gracefully');
    }, 10000);

    test('should handle invalid furniture ID gracefully', async () => {
      await expect(async () => {
        await DatabaseService.getFurnitureStyleVariations('invalid-id');
      }).not.toThrow();
      
      const variations = await DatabaseService.getFurnitureStyleVariations('invalid-id');
      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBe(0);
      
      console.log('✅ Invalid furniture ID handled gracefully');
    }, 10000);

  });

  describe('Cache Management', () => {
    
    test('should respect cache refresh logic', () => {
      const now = new Date();
      const oldTimestamp = new Date(now.getTime() - 35 * 60 * 1000); // 35 minutes ago
      const recentTimestamp = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      
      // Should refresh cache if older than 30 minutes
      expect(DatabaseService.shouldRefreshCache(oldTimestamp, 30)).toBe(true);
      
      // Should not refresh cache if within 30 minutes
      expect(DatabaseService.shouldRefreshCache(recentTimestamp, 30)).toBe(false);
      
      console.log('✅ Cache refresh logic working correctly');
    });

  });

});

describe('Integration with Hardcoded Data Replacement', () => {
  
  test('should provide same data structure as hardcoded arrays', async () => {
    // Test that database data matches expected hardcoded structure
    const styles = await DatabaseService.getStyleCategories();
    
    // Verify we have the expected styles
    const styleNames = styles.map(s => s.name);
    expect(styleNames).toContain('Modern');
    expect(styleNames).toContain('Scandinavian');
    expect(styleNames).toContain('Industrial');
    
    console.log('✅ Database styles match expected hardcoded data structure');
  }, 10000);

  test('should provide furniture data in expected format', async () => {
    const furniture = await DatabaseService.getFurnitureCategories();
    
    // Verify we have expected furniture types
    const furnitureNames = furniture.map(f => f.name);
    expect(furnitureNames).toContain('modern-sofa');
    expect(furnitureNames).toContain('classic-chairs');
    
    console.log('✅ Database furniture matches expected hardcoded data structure');
  }, 10000);

  test('should provide subscription plans in expected format', async () => {
    const plans = await DatabaseService.getSubscriptionPlans();
    
    // Verify we have expected plans
    const planIds = plans.map(p => p.id);
    expect(planIds).toContain('basic');
    expect(planIds).toContain('pro');
    expect(planIds).toContain('business');
    
    console.log('✅ Database plans match expected hardcoded data structure');
  }, 10000);

});

// Summary test that validates the entire database integration
describe('Complete Database Integration Summary', () => {
  
  test('should successfully replace all hardcoded data with database', async () => {
    console.log('\n🚀 COMPLETE DATABASE INTEGRATION TEST');
    console.log('=====================================');
    
    try {
      // Test all essential data loading
      const essentialData = await DatabaseService.fetchEssentialData();
      
      console.log(`✅ Styles: ${essentialData.styles.length} loaded`);
      console.log(`✅ Furniture: ${essentialData.furniture.length} loaded`);
      console.log(`✅ Plans: ${essentialData.plans.length} loaded`);
      console.log(`✅ Budget Ranges: ${essentialData.budgetRanges.length} loaded`);
      console.log(`✅ Journey Steps: ${essentialData.journeySteps.length} loaded`);
      
      expect(essentialData.styles.length).toBeGreaterThan(0);
      expect(essentialData.furniture.length).toBeGreaterThan(0);
      expect(essentialData.plans.length).toBeGreaterThan(0);
      expect(essentialData.budgetRanges.length).toBeGreaterThan(0);
      expect(essentialData.journeySteps.length).toBeGreaterThan(0);
      
      console.log('\n🎉 DATABASE INTEGRATION: COMPLETE SUCCESS!');
      console.log('✅ All hardcoded data successfully replaced with database');
      console.log('✅ React Native app ready for database-driven architecture');
      
    } catch (error) {
      console.error('❌ Database integration failed:', error);
      throw error;
    }
  }, 20000);

});