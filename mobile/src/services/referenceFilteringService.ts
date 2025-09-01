/**
 * Intelligent Reference Filtering Service
 * Pre-filters and caches references while user progresses through the flow
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReferenceService, ReferenceImage, ReferenceCategory } from '../data/referencesDatabase';
import { StyleService, SpaceType } from '../data/stylesDatabase';
import { ExternalReferenceService } from '../data/referencesDatabase';

interface FilterCriteria {
  style: string;
  spaceType: SpaceType;
  colorPreferences?: string[];
  excludeUserUploads?: boolean;
  maxResults?: number;
}

interface FilteredReferencesCache {
  criteria: FilterCriteria;
  references: ReferenceImage[];
  timestamp: number;
  expiresAt: number;
}

export class ReferenceFilteringService {
  private static readonly CACHE_KEY = '@reference_cache';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static filteringPromises: Map<string, Promise<ReferenceImage[]>> = new Map();

  /**
   * Start background filtering when user selects style
   * This runs 2 screens before the user reaches the reference screen
   */
  static async startBackgroundFiltering(
    style: string,
    spaceType: SpaceType,
    colorPreferences?: string[]
  ): Promise<void> {
    const criteria: FilterCriteria = {
      style,
      spaceType,
      colorPreferences,
      excludeUserUploads: false,
      maxResults: 50
    };

    console.log('🔄 Starting background reference filtering:', criteria);

    // Start the filtering process (don't await - runs in background)
    this.performIntelligentFiltering(criteria)
      .then(references => {
        console.log(`✅ Background filtering completed: ${references.length} references found`);
        this.cacheFilteredReferences(criteria, references);
      })
      .catch(error => {
        console.error('❌ Background filtering failed:', error);
      });

    // Also start refreshing external sources
    ExternalReferenceService.refreshReferenceCache(style, spaceType)
      .catch(error => console.warn('⚠️ External reference refresh failed:', error));
  }

  /**
   * Get filtered references (from cache if available, otherwise filter now)
   */
  static async getFilteredReferences(
    style: string,
    spaceType: SpaceType,
    colorPreferences?: string[]
  ): Promise<ReferenceImage[]> {
    const criteria: FilterCriteria = {
      style,
      spaceType,
      colorPreferences,
      maxResults: 50
    };

    // Check cache first
    const cached = await this.getCachedReferences(criteria);
    if (cached) {
      console.log('⚡ Using cached references:', cached.length);
      return cached;
    }

    // If not cached, filter now
    console.log('🔄 Filtering references on-demand...');
    const references = await this.performIntelligentFiltering(criteria);
    
    // Cache the results
    await this.cacheFilteredReferences(criteria, references);
    
    return references;
  }

  /**
   * Perform intelligent multi-criteria filtering
   */
  private static async performIntelligentFiltering(
    criteria: FilterCriteria
  ): Promise<ReferenceImage[]> {
    const cacheKey = this.generateCacheKey(criteria);
    
    // Check if we're already filtering with the same criteria
    if (this.filteringPromises.has(cacheKey)) {
      return this.filteringPromises.get(cacheKey)!;
    }

    // Create filtering promise
    const filteringPromise = this.doFiltering(criteria);
    this.filteringPromises.set(cacheKey, filteringPromise);

    try {
      const result = await filteringPromise;
      this.filteringPromises.delete(cacheKey);
      return result;
    } catch (error) {
      this.filteringPromises.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Core filtering logic with multiple criteria
   */
  private static async doFiltering(criteria: FilterCriteria): Promise<ReferenceImage[]> {
    // Step 1: Get base references filtered by style and space
    let references = ReferenceService.getFilteredReferences({
      style: criteria.style,
      spaceType: criteria.spaceType,
      limit: 100 // Get more than needed for better filtering
    });

    console.log(`📊 Base filtering: ${references.length} references for ${criteria.style} + ${criteria.spaceType}`);

    // Step 2: Apply color preference filtering if available
    if (criteria.colorPreferences && criteria.colorPreferences.length > 0) {
      references = this.filterByColorPreferences(references, criteria.colorPreferences);
      console.log(`🎨 Color filtering: ${references.length} references match color preferences`);
    }

    // Step 3: Diversify by category to ensure variety
    references = this.diversifyByCategory(references);
    console.log(`🎭 Category diversification: ${references.length} diverse references selected`);

    // Step 4: Exclude user uploads if requested
    if (criteria.excludeUserUploads) {
      references = references.filter(ref => ref.source !== 'user-upload');
    }

    // Step 5: Apply popularity-based scoring and limit results
    references = this.applyPopularityScoring(references, criteria);

    // Step 6: Final limit and shuffle for variety
    const maxResults = criteria.maxResults || 50;
    if (references.length > maxResults) {
      // Keep top results but add some randomness
      const topResults = references.slice(0, Math.floor(maxResults * 0.7));
      const randomResults = references.slice(Math.floor(maxResults * 0.7))
        .sort(() => 0.5 - Math.random())
        .slice(0, maxResults - topResults.length);
      
      references = [...topResults, ...randomResults];
    }

    console.log(`✨ Final filtering result: ${references.length} references`);
    return references;
  }

  /**
   * Filter references by color preferences
   */
  private static filterByColorPreferences(
    references: ReferenceImage[],
    colorPreferences: string[]
  ): ReferenceImage[] {
    return references.filter(reference => {
      // Check if any of the reference's dominant colors match user preferences
      return reference.dominantColors.some(color => {
        return colorPreferences.some(prefColor => {
          // Simple color matching - could be enhanced with color distance calculation
          return this.colorsAreSimilar(color, prefColor);
        });
      });
    });
  }

  /**
   * Simple color similarity check
   */
  private static colorsAreSimilar(color1: string, color2: string): boolean {
    // Convert to lowercase for comparison
    const c1 = color1.toLowerCase();
    const c2 = color2.toLowerCase();
    
    // Exact match
    if (c1 === c2) return true;
    
    // Color family matching (simplified)
    const colorFamilies = {
      whites: ['#ffffff', '#f5f5f5', '#fefefe', '#f8f8f8'],
      grays: ['#808080', '#a0a0a0', '#4a5568', '#2d2d2d'],
      browns: ['#8b4513', '#cd853f', '#d2b48c', '#a0522d'],
      blues: ['#4169e1', '#4a90e2', '#1e40af', '#3b82f6'],
      greens: ['#228b22', '#68d391', '#10b981', '#059669']
    };
    
    for (const [family, colors] of Object.entries(colorFamilies)) {
      if (colors.includes(c1) && colors.includes(c2)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Ensure variety by including different categories
   */
  private static diversifyByCategory(references: ReferenceImage[]): ReferenceImage[] {
    const categoryMap = new Map<ReferenceCategory, ReferenceImage[]>();
    
    // Group by category
    references.forEach(ref => {
      if (!categoryMap.has(ref.category)) {
        categoryMap.set(ref.category, []);
      }
      categoryMap.get(ref.category)!.push(ref);
    });
    
    // Take top references from each category
    const diversified: ReferenceImage[] = [];
    const maxPerCategory = Math.ceil(references.length / categoryMap.size);
    
    for (const [category, refs] of categoryMap) {
      const sortedRefs = refs.sort((a, b) => b.popularity - a.popularity);
      diversified.push(...sortedRefs.slice(0, maxPerCategory));
    }
    
    return diversified.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * Apply smart popularity scoring based on criteria match
   */
  private static applyPopularityScoring(
    references: ReferenceImage[],
    criteria: FilterCriteria
  ): ReferenceImage[] {
    return references.map(ref => {
      let score = ref.popularity;
      
      // Boost score for exact style match
      if (ref.style.includes(criteria.style)) {
        score += 10;
      }
      
      // Boost score for exact space match
      if (ref.spaceType.includes(criteria.spaceType)) {
        score += 5;
      }
      
      // Boost score for recent additions
      const daysSinceAdded = (Date.now() - new Date(ref.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAdded < 30) { // Recent within 30 days
        score += 5;
      }
      
      return { ...ref, adjustedScore: score };
    }).sort((a, b) => (b as any).adjustedScore - (a as any).adjustedScore);
  }

  /**
   * Cache filtered references
   */
  private static async cacheFilteredReferences(
    criteria: FilterCriteria,
    references: ReferenceImage[]
  ): Promise<void> {
    try {
      const cache: FilteredReferencesCache = {
        criteria,
        references,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      
      const cacheKey = this.generateCacheKey(criteria);
      await AsyncStorage.setItem(`${this.CACHE_KEY}_${cacheKey}`, JSON.stringify(cache));
      
      console.log(`💾 Cached ${references.length} references for ${cacheKey}`);
    } catch (error) {
      console.error('❌ Failed to cache references:', error);
    }
  }

  /**
   * Get cached references if valid
   */
  private static async getCachedReferences(
    criteria: FilterCriteria
  ): Promise<ReferenceImage[] | null> {
    try {
      const cacheKey = this.generateCacheKey(criteria);
      const cachedData = await AsyncStorage.getItem(`${this.CACHE_KEY}_${cacheKey}`);
      
      if (!cachedData) return null;
      
      const cache: FilteredReferencesCache = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (Date.now() > cache.expiresAt) {
        // Clean up expired cache
        AsyncStorage.removeItem(`${this.CACHE_KEY}_${cacheKey}`);
        return null;
      }
      
      // Verify criteria match (simplified check)
      if (cache.criteria.style !== criteria.style || 
          cache.criteria.spaceType !== criteria.spaceType) {
        return null;
      }
      
      return cache.references;
    } catch (error) {
      console.error('❌ Failed to get cached references:', error);
      return null;
    }
  }

  /**
   * Generate cache key from criteria
   */
  private static generateCacheKey(criteria: FilterCriteria): string {
    const parts = [
      criteria.style,
      criteria.spaceType,
      criteria.colorPreferences?.join(',') || 'no-colors',
      criteria.excludeUserUploads ? 'no-user' : 'with-user'
    ];
    return parts.join('_');
  }

  /**
   * Clear all reference caches
   */
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ Cleared ${cacheKeys.length} reference caches`);
    } catch (error) {
      console.error('❌ Failed to clear reference cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalCaches: number;
    totalReferences: number;
    oldestCache: number;
    newestCache: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));
      
      let totalReferences = 0;
      let oldestCache = Date.now();
      let newestCache = 0;
      
      for (const key of cacheKeys) {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          const cache: FilteredReferencesCache = JSON.parse(cachedData);
          totalReferences += cache.references.length;
          oldestCache = Math.min(oldestCache, cache.timestamp);
          newestCache = Math.max(newestCache, cache.timestamp);
        }
      }
      
      return {
        totalCaches: cacheKeys.length,
        totalReferences,
        oldestCache: oldestCache === Date.now() ? 0 : oldestCache,
        newestCache
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return { totalCaches: 0, totalReferences: 0, oldestCache: 0, newestCache: 0 };
    }
  }

  /**
   * Pre-warm cache for popular style/space combinations
   */
  static async preWarmCache(): Promise<void> {
    console.log('🔥 Pre-warming reference cache...');
    
    const popularCombinations = [
      { style: 'scandinavian', spaceType: 'living_room' as SpaceType },
      { style: 'modern', spaceType: 'living_room' as SpaceType },
      { style: 'minimalist', spaceType: 'bedroom' as SpaceType },
      { style: 'scandinavian', spaceType: 'kitchen' as SpaceType },
      { style: 'modern', spaceType: 'kitchen' as SpaceType },
      { style: 'mediterranean_garden', spaceType: 'garden' as SpaceType },
      { style: 'modern_landscape', spaceType: 'patio' as SpaceType }
    ];
    
    // Start all pre-warming in parallel
    const promises = popularCombinations.map(({ style, spaceType }) =>
      this.startBackgroundFiltering(style, spaceType)
    );
    
    try {
      await Promise.all(promises);
      console.log('✅ Cache pre-warming completed');
    } catch (error) {
      console.error('❌ Cache pre-warming failed:', error);
    }
  }
}