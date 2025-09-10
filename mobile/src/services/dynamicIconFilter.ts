import { 
  IconConfig, 
  ProcessedContext, 
  RelevantIcon, 
  ScoredIcon, 
  UserPreferences 
} from '../types/contextAnalysis';
import { ICON_CONFIGURATIONS, ICON_PRIORITY_ORDER } from '../config/iconConfigurations';

export class DynamicIconFilter {
  private iconConfigs: IconConfig[];

  constructor() {
    this.iconConfigs = ICON_CONFIGURATIONS;
  }

  async getRelevantIcons(
    context: ProcessedContext,
    userPreferences?: UserPreferences
  ): Promise<RelevantIcon[]> {
    // Step 1: Filter icons based on visibility rules
    const eligibleIcons = this.filterByVisibilityRules(context);

    // Step 2: Calculate relevance scores
    const scoredIcons = await this.calculateRelevanceScores(
      eligibleIcons,
      context,
      userPreferences
    );

    // Step 3: Sort by relevance and priority
    const sortedIcons = this.sortIcons(scoredIcons);

    // Step 4: Apply grouping logic
    const groupedIcons = this.applyGroupingLogic(sortedIcons);

    // Step 5: Add contextual badges
    const iconsWithBadges = this.addContextualBadges(groupedIcons, context);

    // Step 6: Return top icons with contextual data
    return this.prepareIconsWithContext(iconsWithBadges.slice(0, 8), context);
  }

  private filterByVisibilityRules(context: ProcessedContext): IconConfig[] {
    return this.iconConfigs.filter(icon => {
      const rules = icon.visibilityRules;

      // Check space type requirements
      if (rules.requiredSpaceTypes && 
          !rules.requiredSpaceTypes.includes(context.spaceType)) {
        return false;
      }

      // Check room type requirements
      if (rules.requiredRoomTypes && context.roomType) {
        const roomCategory = context.roomType.category;
        if (!rules.requiredRoomTypes.some(required => 
          roomCategory.includes(required) || required.includes(roomCategory)
        )) {
          return false;
        }
      }

      // Check excluded room types
      if (rules.excludedRoomTypes && context.roomType) {
        const roomCategory = context.roomType.category;
        if (rules.excludedRoomTypes.some(excluded => 
          roomCategory.includes(excluded) || excluded.includes(roomCategory)
        )) {
          return false;
        }
      }

      // Check style requirements
      if (rules.requiredStyles && context.currentStyle) {
        const hasRequiredStyle = rules.requiredStyles.some(style => 
          context.currentStyle.primary === style ||
          context.currentStyle.secondary?.includes(style)
        );
        if (!hasRequiredStyle) return false;
      }

      // Check excluded styles
      if (rules.excludedStyles && context.currentStyle) {
        const hasExcludedStyle = rules.excludedStyles.some(style => 
          context.currentStyle.primary === style ||
          context.currentStyle.secondary?.includes(style)
        );
        if (hasExcludedStyle) return false;
      }

      // Check confidence threshold
      if (rules.minConfidence && context.confidence < rules.minConfidence) {
        return false;
      }

      return true;
    });
  }

  private async calculateRelevanceScores(
    icons: IconConfig[],
    context: ProcessedContext,
    preferences?: UserPreferences
  ): Promise<ScoredIcon[]> {
    return Promise.all(icons.map(async icon => {
      let score = 0;

      // Base relevance from context matching (40%)
      score += this.calculateContextMatch(icon, context) * 0.4;

      // User prompt relevance (30%)
      if (context.userPrompt) {
        score += this.calculatePromptRelevance(icon, context.userPrompt) * 0.3;
      }

      // Common combinations bonus (20%)
      score += this.calculateCombinationBonus(icon, context) * 0.2;

      // User preference bonus (10%)
      if (preferences) {
        score += this.calculatePreferenceBonus(icon, preferences) * 0.1;
      }

      return { icon, score };
    }));
  }

  private calculateContextMatch(icon: IconConfig, context: ProcessedContext): number {
    let matchScore = 0;
    let factors = 0;

    // Space type match
    if (icon.visibilityRules.requiredSpaceTypes) {
      if (icon.visibilityRules.requiredSpaceTypes.includes(context.spaceType)) {
        matchScore += 1;
      }
      factors++;
    }

    // Room type match
    if (context.roomType && icon.id === context.roomType.category) {
      matchScore += 1;
      factors++;
    }

    // Style relevance
    if (icon.category === 'style' || icon.category === 'cultural') {
      matchScore += 0.8; // Style icons are generally relevant
      factors++;
    }

    // Functional relevance based on room type
    if (context.roomType) {
      const functionalMatches: { [key: string]: string[] } = {
        'kitchen': ['kitchen', 'materials', 'lighting'],
        'bathroom': ['bathroom', 'materials', 'lighting'],
        'living_room': ['furniture', 'style', 'colorPalette', 'lighting'],
        'bedroom': ['furniture', 'style', 'colorPalette', 'lighting'],
        'garden': ['landscape', 'outdoorFurniture', 'materials'],
        'patio': ['outdoorFurniture', 'style', 'lighting']
      };

      const relevantIcons = functionalMatches[context.roomType.category] || [];
      if (relevantIcons.includes(icon.id)) {
        matchScore += 0.9;
        factors++;
      }
    }

    // Budget is always somewhat relevant
    if (icon.id === 'budget') {
      matchScore += 0.7;
      factors++;
    }

    return factors > 0 ? matchScore / factors : 0.5;
  }

  private calculatePromptRelevance(icon: IconConfig, prompt: string): number {
    const promptLower = prompt.toLowerCase();
    let relevance = 0;

    // Direct keyword matches
    const keywordMap: { [key: string]: string[] } = {
      'style': ['style', 'design', 'aesthetic', 'look', 'theme'],
      'furniture': ['furniture', 'sofa', 'chair', 'table', 'bed', 'desk'],
      'colorPalette': ['color', 'colour', 'palette', 'tone', 'shade', 'hue'],
      'budget': ['budget', 'cost', 'price', 'affordable', 'expensive', 'cheap'],
      'materials': ['material', 'wood', 'stone', 'metal', 'fabric', 'texture'],
      'lighting': ['light', 'lamp', 'bright', 'dark', 'illumination'],
      'cultural': ['cultural', 'traditional', 'ethnic', 'heritage'],
      'location': ['location', 'place', 'area', 'region', 'climate'],
      'landscape': ['garden', 'landscape', 'plants', 'outdoor', 'yard'],
      'kitchen': ['kitchen', 'cooking', 'culinary', 'appliance'],
      'bathroom': ['bathroom', 'bath', 'shower', 'vanity']
    };

    const iconKeywords = keywordMap[icon.id] || [icon.id];
    const matchCount = iconKeywords.filter(keyword => 
      promptLower.includes(keyword)
    ).length;

    relevance = Math.min(matchCount / iconKeywords.length, 1);

    // Category-based relevance
    if (promptLower.includes('transform') || promptLower.includes('change')) {
      if (['style', 'colorPalette', 'furniture'].includes(icon.id)) {
        relevance += 0.3;
      }
    }

    return Math.min(relevance, 1);
  }

  private calculateCombinationBonus(icon: IconConfig, context: ProcessedContext): number {
    // Common icon combinations that work well together
    const commonCombinations: { [key: string]: string[] } = {
      'style': ['colorPalette', 'furniture', 'materials'],
      'furniture': ['style', 'budget', 'colorPalette'],
      'kitchen': ['materials', 'budget', 'lighting'],
      'bathroom': ['materials', 'budget', 'lighting'],
      'landscape': ['outdoorFurniture', 'materials', 'budget'],
      'budget': ['style', 'furniture', 'materials']
    };

    // Check if other relevant icons would complement this one
    const complementaryIcons = commonCombinations[icon.id] || [];
    const bonus = complementaryIcons.length > 0 ? 0.2 : 0;

    // Additional bonus for essential icons
    if (['style', 'budget', 'colorPalette'].includes(icon.id)) {
      return bonus + 0.3;
    }

    return bonus;
  }

  private calculatePreferenceBonus(
    icon: IconConfig, 
    preferences: UserPreferences
  ): number {
    let bonus = 0;

    // Check if icon matches favorite styles
    if (icon.category === 'style' && preferences.favoriteStyles.length > 0) {
      bonus += 0.5;
    }

    // Check previous selections
    if (preferences.previousSelections.includes(icon.id)) {
      bonus += 0.3;
    }

    // Budget preference alignment
    if (icon.id === 'budget' && preferences.budgetRange) {
      bonus += 0.4;
    }

    return Math.min(bonus, 1);
  }

  private sortIcons(scoredIcons: ScoredIcon[]): ScoredIcon[] {
    return scoredIcons.sort((a, b) => {
      // First sort by score
      if (Math.abs(a.score - b.score) > 0.1) {
        return b.score - a.score;
      }

      // Then by priority order
      const aPriority = ICON_PRIORITY_ORDER.indexOf(a.icon.id);
      const bPriority = ICON_PRIORITY_ORDER.indexOf(b.icon.id);
      
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      
      return aPriority - bPriority;
    });
  }

  private applyGroupingLogic(icons: ScoredIcon[]): ScoredIcon[] {
    // Group icons by category to ensure diversity
    const grouped = new Map<string, ScoredIcon[]>();

    icons.forEach(item => {
      const category = item.icon.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });

    // Take top icons from each category
    const result: ScoredIcon[] = [];
    const maxPerCategory = 2;

    // Priority categories
    const priorityCategories = ['style', 'function', 'budget'];
    
    // Add priority categories first
    priorityCategories.forEach(category => {
      const categoryIcons = grouped.get(category) || [];
      result.push(...categoryIcons.slice(0, maxPerCategory));
      grouped.delete(category);
    });

    // Add remaining categories
    grouped.forEach((categoryIcons) => {
      result.push(...categoryIcons.slice(0, 1)); // Only 1 from other categories
    });

    return result;
  }

  private addContextualBadges(
    icons: ScoredIcon[],
    context: ProcessedContext
  ): ScoredIcon[] {
    return icons.map(item => {
      const badges: string[] = [];

      // High relevance badge
      if (item.score > 0.8) {
        badges.push('Recommended');
      }

      // Room-specific badge
      if (context.roomType && item.icon.id === context.roomType.category) {
        badges.push('Room Match');
      }

      // Style match badge
      if (context.currentStyle && item.icon.category === 'style' && item.score > 0.7) {
        badges.push('Style Match');
      }

      // New/trending badge (could be based on analytics)
      if (['fantasy', 'cultural'].includes(item.icon.id)) {
        badges.push('Trending');
      }

      return {
        ...item,
        badge: badges[0] // Only show the most relevant badge
      };
    });
  }

  private prepareIconsWithContext(
    icons: ScoredIcon[],
    context: ProcessedContext
  ): RelevantIcon[] {
    return icons.map(item => ({
      ...item.icon,
      score: item.score,
      badge: item.badge,
      contextualData: {
        roomType: context.roomType?.category,
        currentStyle: context.currentStyle.primary,
        spaceType: context.spaceType
      }
    }));
  }
}

// Export singleton instance
export const dynamicIconFilter = new DynamicIconFilter();