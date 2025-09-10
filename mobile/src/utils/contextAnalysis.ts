// Context Analysis Engine for Smart Feature Filtering
// This module analyzes user input to determine project context and suggest relevant features

export type ProjectContext = 'interior' | 'garden' | 'exterior' | 'mixed' | 'unknown';
export type FeatureId = 
  | 'category' 
  | 'style' 
  | 'reference' 
  | 'colorPalette' 
  | 'budget' 
  | 'furniture' 
  | 'location' 
  | 'materials' 
  | 'texture'
  | 'cultural'
  | 'lighting'
  | 'kitchen'
  | 'bathroom'
  | 'landscape'
  | 'outdoorFurniture'
  | 'fantasy';

export interface ContextAnalysis {
  primaryContext: ProjectContext;
  confidence: number;
  secondaryContexts: Array<{ context: ProjectContext; confidence: number }>;
  detectedKeywords: string[];
  suggestedFeatures: FeatureId[];
}

// Comprehensive keyword dictionaries for each context
const CONTEXT_KEYWORDS: Record<ProjectContext, { keywords: string[]; weight: number }> = {
  interior: {
    keywords: [
      // Room types
      'room', 'kitchen', 'bedroom', 'bathroom', 'living room', 'dining room', 
      'office', 'study', 'library', 'nursery', 'playroom', 'guest room',
      'master bedroom', 'powder room', 'laundry room', 'mudroom', 'pantry',
      'basement', 'attic', 'loft', 'studio', 'apartment', 'condo', 'house',
      // Interior elements
      'interior', 'indoor', 'inside', 'ceiling', 'wall', 'floor', 'door',
      'window', 'stairs', 'hallway', 'corridor', 'closet', 'cabinet',
      'countertop', 'backsplash', 'fireplace', 'mantel', 'built-in',
      // Interior actions
      'remodel', 'renovate', 'redecorate', 'paint', 'wallpaper', 'tile',
      'refinish', 'organize', 'storage', 'lighting', 'furniture arrangement'
    ],
    weight: 1.0
  },
  garden: {
    keywords: [
      // Garden types
      'garden', 'yard', 'lawn', 'backyard', 'front yard', 'side yard',
      'landscape', 'landscaping', 'outdoor', 'outside', 'exterior space',
      'courtyard', 'patio', 'deck', 'terrace', 'balcony', 'veranda',
      'pergola', 'gazebo', 'greenhouse', 'conservatory',
      // Garden elements
      'plants', 'flowers', 'trees', 'shrubs', 'bushes', 'hedge', 'grass',
      'turf', 'flower bed', 'garden bed', 'vegetable garden', 'herb garden',
      'rock garden', 'zen garden', 'water garden', 'pond', 'fountain',
      'pool', 'spa', 'hot tub', 'fire pit', 'outdoor kitchen', 'bbq',
      // Garden actions
      'plant', 'grow', 'cultivate', 'prune', 'mulch', 'irrigate', 'water',
      'landscape design', 'hardscape', 'softscape', 'outdoor living'
    ],
    weight: 1.0
  },
  exterior: {
    keywords: [
      // Building exterior
      'facade', 'exterior', 'outside', 'curb appeal', 'front', 'back',
      'side', 'elevation', 'building', 'house exterior', 'home exterior',
      // Exterior elements
      'siding', 'brick', 'stone', 'stucco', 'cladding', 'trim', 'shutters',
      'roof', 'roofing', 'shingles', 'gutters', 'downspouts', 'chimney',
      'windows', 'doors', 'entry', 'entrance', 'porch', 'steps', 'walkway',
      'driveway', 'garage', 'carport', 'fence', 'gate', 'retaining wall',
      // Exterior actions
      'paint exterior', 'power wash', 'seal', 'stain', 'repair', 'replace',
      'upgrade', 'modernize', 'restore', 'weatherproof'
    ],
    weight: 1.0
  },
  mixed: {
    keywords: [
      // Hybrid spaces
      'outdoor kitchen', 'outdoor room', 'outdoor living room', 'outdoor dining',
      'sunroom', 'screened porch', 'enclosed patio', 'three season room',
      'four season room', 'Florida room', 'solarium', 'breezeway',
      'pool house', 'cabana', 'outdoor bathroom', 'outdoor shower',
      // Transitional elements
      'indoor outdoor', 'indoor-outdoor', 'seamless transition', 'flow',
      'extension', 'addition', 'expansion'
    ],
    weight: 1.2 // Higher weight for specific mixed-context keywords
  },
  unknown: {
    keywords: [],
    weight: 0
  }
};

// Feature configuration based on context
const FEATURE_CONFIG: Record<FeatureId, { 
  universal: boolean;
  contexts: Partial<Record<ProjectContext, { 
    title: string; 
    description: string;
    priority: number;
  }>> 
}> = {
  category: {
    universal: true,
    contexts: {
      interior: { title: 'Room Type', description: 'Select the room to design', priority: 1 },
      garden: { title: 'Space Type', description: 'Select outdoor space type', priority: 1 },
      exterior: { title: 'Exterior Area', description: 'Select building area', priority: 1 }
    }
  },
  style: {
    universal: true,
    contexts: {
      interior: { title: 'Interior Style', description: 'Choose design aesthetic', priority: 2 },
      garden: { title: 'Garden Style', description: 'Select landscape style', priority: 2 },
      exterior: { title: 'Architectural Style', description: 'Choose building style', priority: 2 }
    }
  },
  reference: {
    universal: true,
    contexts: {
      interior: { title: 'Inspiration', description: 'Add reference images', priority: 3 },
      garden: { title: 'Garden Ideas', description: 'Add landscape references', priority: 3 },
      exterior: { title: 'Style Examples', description: 'Add exterior references', priority: 3 }
    }
  },
  colorPalette: {
    universal: false,
    contexts: {
      interior: { title: 'Color Palette', description: 'Choose paint & accent colors', priority: 4 },
      exterior: { title: 'Exterior Colors', description: 'Select exterior color scheme', priority: 4 },
      garden: { title: 'Plant Colors', description: 'Choose bloom & foliage colors', priority: 6 }
    }
  },
  budget: {
    universal: true,
    contexts: {
      interior: { title: 'Budget', description: 'Set project budget', priority: 5 },
      garden: { title: 'Budget', description: 'Set landscaping budget', priority: 5 },
      exterior: { title: 'Budget', description: 'Set renovation budget', priority: 5 }
    }
  },
  furniture: {
    universal: false,
    contexts: {
      interior: { title: 'Furniture', description: 'Select furniture & fixtures', priority: 6 },
      garden: { title: 'Outdoor Furniture', description: 'Choose patio furniture', priority: 7 },
      mixed: { title: 'Indoor/Outdoor', description: 'Weather-resistant furniture', priority: 6 }
    }
  },
  location: {
    universal: false,
    contexts: {
      garden: { title: 'Location', description: 'Climate zone & conditions', priority: 4 },
      exterior: { title: 'Location', description: 'Regional requirements', priority: 6 },
      mixed: { title: 'Location', description: 'Indoor/outdoor considerations', priority: 7 }
    }
  },
  materials: {
    universal: false,
    contexts: {
      interior: { title: 'Materials', description: 'Flooring, counters, finishes', priority: 7 },
      exterior: { title: 'Materials', description: 'Siding, roofing, stone', priority: 3 },
      garden: { title: 'Hardscape', description: 'Pavers, gravel, mulch', priority: 8 }
    }
  },
  texture: {
    universal: false,
    contexts: {
      interior: { title: 'Textures', description: 'Fabric, wood, metal finishes', priority: 8 },
      exterior: { title: 'Finishes', description: 'Surface textures & patterns', priority: 7 },
      mixed: { title: 'Textures', description: 'Indoor/outdoor materials', priority: 8 }
    }
  }
};

// Main context analysis function
export function analyzeContext(userInput: string): ContextAnalysis {
  if (!userInput || userInput.trim().length === 0) {
    return {
      primaryContext: 'unknown',
      confidence: 0,
      secondaryContexts: [],
      detectedKeywords: [],
      suggestedFeatures: getUniversalFeatures()
    };
  }

  // Normalize input for analysis
  const normalizedInput = userInput.toLowerCase();
  const words = normalizedInput.split(/\s+/);
  
  // Score each context
  const contextScores: Record<ProjectContext, { score: number; keywords: string[] }> = {
    interior: { score: 0, keywords: [] },
    garden: { score: 0, keywords: [] },
    exterior: { score: 0, keywords: [] },
    mixed: { score: 0, keywords: [] },
    unknown: { score: 0, keywords: [] }
  };

  // Check for exact phrase matches first (for mixed contexts)
  for (const [context, config] of Object.entries(CONTEXT_KEYWORDS)) {
    for (const keyword of config.keywords) {
      if (normalizedInput.includes(keyword)) {
        const keywordScore = keyword.split(' ').length * config.weight; // Multi-word phrases score higher
        contextScores[context as ProjectContext].score += keywordScore;
        contextScores[context as ProjectContext].keywords.push(keyword);
      }
    }
  }

  // Single word matching
  for (const word of words) {
    for (const [context, config] of Object.entries(CONTEXT_KEYWORDS)) {
      if (config.keywords.some(kw => kw.split(' ').includes(word))) {
        contextScores[context as ProjectContext].score += config.weight;
      }
    }
  }

  // Sort contexts by score
  const sortedContexts = Object.entries(contextScores)
    .filter(([ctx]) => ctx !== 'unknown')
    .sort(([, a], [, b]) => b.score - a.score);

  // Determine primary context
  const [primaryContext, primaryScore] = sortedContexts[0] || ['unknown', { score: 0, keywords: [] }];
  const totalScore = sortedContexts.reduce((sum, [, data]) => sum + data.score, 0);
  const confidence = totalScore > 0 ? primaryScore.score / totalScore : 0;

  // Get secondary contexts with significant scores
  const secondaryContexts = sortedContexts
    .slice(1)
    .filter(([, data]) => data.score > 0 && data.score / primaryScore.score > 0.3)
    .map(([ctx, data]) => ({
      context: ctx as ProjectContext,
      confidence: totalScore > 0 ? data.score / totalScore : 0
    }));

  // Collect all detected keywords
  const detectedKeywords = sortedContexts
    .flatMap(([, data]) => data.keywords)
    .filter((keyword, index, self) => self.indexOf(keyword) === index);

  // Get suggested features based on context
  const suggestedFeatures = getSuggestedFeatures(
    primaryContext as ProjectContext,
    confidence,
    secondaryContexts
  );

  return {
    primaryContext: primaryContext as ProjectContext,
    confidence,
    secondaryContexts,
    detectedKeywords,
    suggestedFeatures
  };
}

// Get universal features that are always shown
function getUniversalFeatures(): FeatureId[] {
  return Object.entries(FEATURE_CONFIG)
    .filter(([, config]) => config.universal)
    .map(([id]) => id as FeatureId);
}

// Get suggested features based on context analysis
function getSuggestedFeatures(
  primaryContext: ProjectContext,
  confidence: number,
  secondaryContexts: Array<{ context: ProjectContext; confidence: number }>
): FeatureId[] {
  const features: Array<{ id: FeatureId; priority: number }> = [];

  // Add universal features
  for (const [featureId, config] of Object.entries(FEATURE_CONFIG)) {
    if (config.universal) {
      const contextConfig = config.contexts[primaryContext];
      features.push({
        id: featureId as FeatureId,
        priority: contextConfig?.priority || 99
      });
    }
  }

  // Add primary context features
  if (primaryContext !== 'unknown' && confidence > 0.3) {
    for (const [featureId, config] of Object.entries(FEATURE_CONFIG)) {
      if (!config.universal && config.contexts[primaryContext]) {
        features.push({
          id: featureId as FeatureId,
          priority: config.contexts[primaryContext]!.priority
        });
      }
    }
  }

  // Add secondary context features if confidence is high enough
  for (const secondary of secondaryContexts) {
    if (secondary.confidence > 0.2) {
      for (const [featureId, config] of Object.entries(FEATURE_CONFIG)) {
        if (!config.universal && config.contexts[secondary.context]) {
          // Check if feature not already added
          if (!features.some(f => f.id === featureId)) {
            features.push({
              id: featureId as FeatureId,
              priority: config.contexts[secondary.context]!.priority + 10 // Lower priority
            });
          }
        }
      }
    }
  }

  // Sort by priority and return feature IDs
  return features
    .sort((a, b) => a.priority - b.priority)
    .map(f => f.id);
}

// Get feature configuration for a specific context
export function getFeatureConfig(
  featureId: FeatureId,
  context: ProjectContext
): { title: string; description: string } | null {
  const feature = FEATURE_CONFIG[featureId];
  if (!feature) return null;

  if (feature.universal || feature.contexts[context]) {
    return feature.contexts[context] || {
      title: featureId.charAt(0).toUpperCase() + featureId.slice(1),
      description: 'Select options'
    };
  }

  return null;
}

// Gemini 2.5 Flash-Lite API Integration
export const GEMINI_CONTEXT_PROMPT = `
You are an AI assistant analyzing user input for an interior design app.
Determine if the user is describing:
- Interior design (inside rooms, furniture, indoor spaces)
- Garden/landscape design (outdoor plants, gardens, yards)
- Exterior architecture (building facades, roofs, exteriors)
- Mixed contexts (outdoor kitchens, sunrooms, etc)

Return only one word: interior, garden, exterior, mixed, or unknown.
`;

// Enhanced Gemini context analysis (using secure backend)
export async function analyzeContextWithGemini(userInput: string): Promise<ContextAnalysis> {
  const startTime = Date.now();
  
  try {
    // Import backend API service dynamically to avoid circular dependencies
    const { default: backendApiService } = await import('../services/backendApiService');
    
    console.log('🔐 Using secure backend for Gemini analysis');
    
    // Call backend API for secure Gemini analysis
    const response = await backendApiService.analyzeContext(userInput);
    
    if (!response.success || !response.data) {
      console.log('🟡 Backend API failed, falling back to keyword analysis');
      // Track the fallback usage
      if (typeof contextAnalyticsService !== 'undefined') {
        const { default: contextAnalyticsService } = await import('../services/contextAnalyticsService');
        contextAnalyticsService.trackGeminiUsage({
          success: false,
          errorType: response.error || 'backend_api_error',
          fallbackUsed: true
        });
      }
      return analyzeContext(userInput);
    }

    const data = response.data;
    // Backend returns the context directly or in a specific format
    const geminiResult = data.context || data.primaryContext || data;
    const responseTime = Date.now() - startTime;
    
    // Normalize the result
    const normalizedResult = typeof geminiResult === 'string' ? geminiResult.trim().toLowerCase() : null;
    
    if (!normalizedResult || !['interior', 'garden', 'exterior', 'mixed', 'unknown'].includes(normalizedResult)) {
      console.log('🟡 Gemini returned invalid result, falling back to keyword analysis');
      
      // Track the failed usage
      if (typeof contextAnalyticsService !== 'undefined') {
        const { default: contextAnalyticsService } = await import('../services/contextAnalyticsService');
        contextAnalyticsService.trackGeminiUsage({
          success: false,
          responseTime,
          errorType: 'invalid_response',
          fallbackUsed: true
        });
      }
      
      return analyzeContext(userInput);
    }

    // Track successful Gemini usage
    if (typeof contextAnalyticsService !== 'undefined') {
      const { default: contextAnalyticsService } = await import('../services/contextAnalyticsService');
      contextAnalyticsService.trackGeminiUsage({
        success: true,
        responseTime,
        fallbackUsed: false
      });
    }

    // Get feature suggestions using the Gemini-detected context
    const keywordAnalysis = analyzeContext(userInput);
    const geminiContext = normalizedResult as ProjectContext;
    
    // Combine Gemini's context detection with our feature suggestion logic
    const enhancedAnalysis: ContextAnalysis = {
      primaryContext: geminiContext,
      confidence: 0.95, // High confidence for AI analysis
      secondaryContexts: keywordAnalysis.secondaryContexts,
      detectedKeywords: keywordAnalysis.detectedKeywords,
      suggestedFeatures: getSuggestedFeaturesForContext(geminiContext, 0.95, [])
    };

    console.log('✅ Enhanced analysis with Gemini:', geminiContext);
    return enhancedAnalysis;

  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.log('🔄 Falling back to keyword-based analysis');
    
    // Track the error
    if (typeof contextAnalyticsService !== 'undefined') {
      const { default: contextAnalyticsService } = await import('../services/contextAnalyticsService');
      contextAnalyticsService.trackGeminiUsage({
        success: false,
        responseTime: Date.now() - startTime,
        errorType: error instanceof Error ? error.message : 'unknown_error',
        fallbackUsed: true
      });
    }
    
    return analyzeContext(userInput);
  }
}

// Helper function to get suggested features (extracted from internal logic)
function getSuggestedFeaturesForContext(
  primaryContext: ProjectContext,
  confidence: number,
  secondaryContexts: Array<{ context: ProjectContext; confidence: number }>
): FeatureId[] {
  const features: Array<{ id: FeatureId; priority: number }> = [];

  // Add universal features
  const universalFeatures: FeatureId[] = ['category', 'style', 'reference', 'budget'];
  universalFeatures.forEach((featureId, index) => {
    features.push({
      id: featureId,
      priority: index + 1
    });
  });

  // Add primary context features
  if (primaryContext !== 'unknown' && confidence > 0.3) {
    const contextFeatures = getContextSpecificFeatures(primaryContext);
    contextFeatures.forEach((featureId, index) => {
      features.push({
        id: featureId,
        priority: universalFeatures.length + index + 1
      });
    });
  }

  // Add secondary context features if confidence is high enough
  for (const secondary of secondaryContexts) {
    if (secondary.confidence > 0.2) {
      const contextFeatures = getContextSpecificFeatures(secondary.context);
      contextFeatures.forEach(featureId => {
        // Check if feature not already added
        if (!features.some(f => f.id === featureId)) {
          features.push({
            id: featureId,
            priority: features.length + 10 // Lower priority
          });
        }
      });
    }
  }

  // Sort by priority and return feature IDs
  return features
    .sort((a, b) => a.priority - b.priority)
    .map(f => f.id);
}

function getContextSpecificFeatures(context: ProjectContext): FeatureId[] {
  switch (context) {
    case 'interior':
      return ['colorPalette', 'furniture', 'materials', 'texture'];
    case 'garden':
      return ['location', 'colorPalette', 'furniture', 'materials'];
    case 'exterior':
      return ['materials', 'colorPalette', 'location'];
    case 'mixed':
      return ['colorPalette', 'furniture', 'materials', 'texture', 'location'];
    default:
      return [];
  }
}