# Dynamic Context-Aware Icons: Detailed Implementation Strategy

## Overview
This document provides a comprehensive, step-by-step implementation strategy for the AI-powered dynamic icon system, with special focus on context analysis and dynamic filtering.

## Phase 1: AI-Powered Context Analysis Engine

### Step 1.1: Image Analysis Service Setup

#### A. Core Analysis Features
```typescript
interface ImageAnalysisResult {
  // Primary Classifications
  spaceType: 'interior' | 'exterior' | 'mixed';
  
  // Detailed Room/Area Classification
  roomType?: {
    category: string; // 'living_room', 'kitchen', 'garden', etc.
    confidence: number; // 0-1 confidence score
    subType?: string; // 'master_bedroom', 'powder_room', etc.
  };
  
  // Style Detection
  currentStyle: {
    primary: string; // 'modern', 'traditional', etc.
    secondary?: string[]; // Additional style elements
    confidence: number;
  };
  
  // Environmental Context
  environment: {
    lighting: 'natural' | 'artificial' | 'mixed' | 'dark';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    weather?: 'sunny' | 'cloudy' | 'rainy'; // for exteriors
  };
  
  // Existing Elements Detection
  detectedElements: {
    furniture: string[]; // ['sofa', 'dining_table', 'bed']
    fixtures: string[]; // ['chandelier', 'fireplace', 'built_in_shelves']
    materials: string[]; // ['wood', 'marble', 'carpet']
    colors: ColorPalette; // Dominant colors in the image
  };
  
  // Spatial Analysis
  spatial: {
    perspective: 'wide_angle' | 'close_up' | 'detail';
    isEmpty: boolean; // Empty room detection
    scale: 'small' | 'medium' | 'large';
  };
  
  // Quality Metrics
  quality: {
    resolution: 'low' | 'medium' | 'high';
    clarity: number; // 0-1
    processable: boolean;
  };
}
```

#### B. Implementation Steps

1. **Create AI Service Module**
```typescript
// services/aiContextAnalysis.ts
import * as tf from '@tensorflow/tfjs';
import { ImageAnalysisResult } from '../types/analysis';

export class AIContextAnalysisService {
  private model: tf.LayersModel | null = null;
  private initialized = false;
  
  async initialize() {
    // Load pre-trained models
    this.model = await tf.loadLayersModel('/models/room-classification/model.json');
    this.initialized = true;
  }
  
  async analyzeImage(imageUri: string): Promise<ImageAnalysisResult> {
    if (!this.initialized) await this.initialize();
    
    // Step 1: Preprocess image
    const imageData = await this.preprocessImage(imageUri);
    
    // Step 2: Run primary classification (interior/exterior)
    const spaceType = await this.classifySpaceType(imageData);
    
    // Step 3: Room/area detection
    const roomType = await this.detectRoomType(imageData, spaceType);
    
    // Step 4: Style analysis
    const currentStyle = await this.analyzeStyle(imageData);
    
    // Step 5: Element detection
    const detectedElements = await this.detectElements(imageData);
    
    // Step 6: Environmental analysis
    const environment = await this.analyzeEnvironment(imageData);
    
    // Step 7: Spatial analysis
    const spatial = await this.analyzeSpatial(imageData);
    
    return {
      spaceType,
      roomType,
      currentStyle,
      environment,
      detectedElements,
      spatial,
      quality: await this.assessQuality(imageData)
    };
  }
}
```

2. **Integration with Gemini Vision API**
```typescript
// services/enhancedGeminiVisionService.ts
export async function analyzeImageWithGemini(imageUri: string): Promise<ImageAnalysisResult> {
  const base64Image = await convertToBase64(imageUri);
  
  const prompt = `
    Analyze this image and provide detailed information in JSON format:
    1. Is this an interior or exterior space?
    2. What type of room or area is this? (be specific)
    3. What design style is currently present?
    4. What furniture and fixtures are visible?
    5. What materials and colors dominate?
    6. Describe the lighting and atmosphere.
    7. What is the perspective and scale of the space?
    
    Respond with a structured JSON matching the ImageAnalysisResult interface.
  `;
  
  const response = await geminiVisionAPI.analyzeImage(base64Image, prompt);
  return parseGeminiResponse(response);
}
```

### Step 1.2: Context Processing Pipeline

```typescript
// services/contextProcessingPipeline.ts
export class ContextProcessingPipeline {
  private analysisCache = new Map<string, ImageAnalysisResult>();
  
  async processImage(imageUri: string, userPrompt?: string): Promise<ProcessedContext> {
    // Step 1: Check cache
    const cachedResult = this.analysisCache.get(imageUri);
    if (cachedResult && !userPrompt) return this.createContext(cachedResult);
    
    // Step 2: Run AI analysis
    const analysisResult = await aiContextAnalysis.analyzeImage(imageUri);
    this.analysisCache.set(imageUri, analysisResult);
    
    // Step 3: Enhance with user prompt
    if (userPrompt) {
      const nlpEnhancement = await this.processUserPrompt(userPrompt, analysisResult);
      return this.mergeContexts(analysisResult, nlpEnhancement);
    }
    
    return this.createContext(analysisResult);
  }
  
  private async processUserPrompt(
    prompt: string, 
    imageAnalysis: ImageAnalysisResult
  ): Promise<NLPEnhancement> {
    // Extract intent and modifiers from user prompt
    const intent = await this.extractIntent(prompt);
    const stylePreferences = await this.extractStylePreferences(prompt);
    const functionalRequirements = await this.extractRequirements(prompt);
    
    return {
      intent,
      stylePreferences,
      functionalRequirements,
      conflicts: this.detectConflicts(intent, imageAnalysis)
    };
  }
}
```

## Phase 2: Dynamic Icon System

### Step 2.1: Icon Configuration Structure

```typescript
// config/iconConfiguration.ts
export interface IconConfig {
  id: string;
  label: string;
  icon: string; // Icon name or emoji
  category: 'style' | 'function' | 'budget' | 'location' | 'material' | 'furniture';
  
  // Visibility rules
  visibilityRules: {
    requiredSpaceTypes?: ('interior' | 'exterior')[];
    requiredRoomTypes?: string[];
    excludedRoomTypes?: string[];
    requiredStyles?: string[];
    excludedStyles?: string[];
    minConfidence?: number; // 0-1
  };
  
  // Panel configuration
  panelConfig: {
    type: 'compact' | 'expanded' | 'fullscreen';
    component: string; // Component name to render
    defaultExpanded?: boolean;
  };
  
  // Contextual data
  contextualOptions: {
    filterBy: string[]; // Fields to filter options by
    dataSource: string; // Where to get options from
    maxOptions?: number;
  };
}

// Icon definitions based on COMPREHENSIVE-DESIGN-CATEGORIES.md
export const ICON_CONFIGURATIONS: IconConfig[] = [
  // Style Icons
  {
    id: 'style',
    label: 'Style',
    icon: '🎨',
    category: 'style',
    visibilityRules: {
      minConfidence: 0.3
    },
    panelConfig: {
      type: 'expanded',
      component: 'StyleSelectionPanel'
    },
    contextualOptions: {
      filterBy: ['spaceType', 'roomType', 'currentStyle'],
      dataSource: 'designStyles',
      maxOptions: 12
    }
  },
  
  // Budget Icon
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    category: 'budget',
    visibilityRules: {
      minConfidence: 0.2
    },
    panelConfig: {
      type: 'compact',
      component: 'BudgetSliderPanel'
    },
    contextualOptions: {
      filterBy: ['projectType', 'roomType'],
      dataSource: 'budgetRanges'
    }
  },
  
  // Location Icon
  {
    id: 'location',
    label: 'Location',
    icon: '📍',
    category: 'location',
    visibilityRules: {
      requiredSpaceTypes: ['interior', 'exterior']
    },
    panelConfig: {
      type: 'fullscreen',
      component: 'LocationMapPanel'
    },
    contextualOptions: {
      filterBy: ['climate', 'culture'],
      dataSource: 'locations'
    }
  },
  
  // Furniture Icon
  {
    id: 'furniture',
    label: 'Furniture',
    icon: '🪑',
    category: 'furniture',
    visibilityRules: {
      requiredSpaceTypes: ['interior'],
      excludedRoomTypes: ['bathroom', 'utility_room']
    },
    panelConfig: {
      type: 'expanded',
      component: 'FurnitureStylePanel'
    },
    contextualOptions: {
      filterBy: ['roomType', 'currentStyle', 'budget'],
      dataSource: 'furnitureStyles'
    }
  },
  
  // Color Palette Icon
  {
    id: 'colorPalette',
    label: 'Colors',
    icon: '🎨',
    category: 'style',
    visibilityRules: {
      minConfidence: 0.2
    },
    panelConfig: {
      type: 'compact',
      component: 'ColorPalettePanel'
    },
    contextualOptions: {
      filterBy: ['currentStyle', 'lighting', 'mood'],
      dataSource: 'colorPalettes'
    }
  },
  
  // Materials Icon
  {
    id: 'materials',
    label: 'Materials',
    icon: '🏗️',
    category: 'material',
    visibilityRules: {
      minConfidence: 0.4
    },
    panelConfig: {
      type: 'expanded',
      component: 'MaterialSelectionPanel'
    },
    contextualOptions: {
      filterBy: ['spaceType', 'climate', 'budget'],
      dataSource: 'materials'
    }
  }
];
```

### Step 2.2: Dynamic Icon Filtering System

```typescript
// services/dynamicIconFilter.ts
export class DynamicIconFilter {
  private iconConfigs: IconConfig[];
  private contextCache = new Map<string, ProcessedContext>();
  
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
    
    // Step 3: Sort by relevance
    const sortedIcons = scoredIcons.sort((a, b) => b.score - a.score);
    
    // Step 4: Apply grouping logic
    const groupedIcons = this.applyGroupingLogic(sortedIcons);
    
    // Step 5: Return top icons with contextual data
    return this.prepareIconsWithContext(groupedIcons.slice(0, 8), context);
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
      if (rules.requiredRoomTypes && context.roomType &&
          !rules.requiredRoomTypes.includes(context.roomType.category)) {
        return false;
      }
      
      // Check excluded room types
      if (rules.excludedRoomTypes && context.roomType &&
          rules.excludedRoomTypes.includes(context.roomType.category)) {
        return false;
      }
      
      // Check confidence threshold
      if (rules.minConfidence && 
          context.confidence < rules.minConfidence) {
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
        score += await this.calculatePromptRelevance(icon, context.userPrompt) * 0.3;
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
    const categoriesOrder = ['style', 'function', 'budget', 'location', 'material', 'furniture'];
    
    categoriesOrder.forEach(category => {
      const categoryIcons = grouped.get(category) || [];
      if (categoryIcons.length > 0) {
        result.push(...categoryIcons.slice(0, 2)); // Max 2 per category
      }
    });
    
    return result;
  }
}
```

### Step 2.3: Contextual Panel System

```typescript
// components/panels/ContextualPanelSystem.tsx
export interface ContextualPanelProps {
  icon: RelevantIcon;
  context: ProcessedContext;
  onSelect: (selection: any) => void;
  onClose: () => void;
}

export const ContextualPanelSystem: React.FC<ContextualPanelProps> = ({
  icon,
  context,
  onSelect,
  onClose
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadContextualOptions();
  }, [icon, context]);
  
  const loadContextualOptions = async () => {
    setLoading(true);
    
    // Get filtered options based on context
    const filteredOptions = await getFilteredOptions(
      icon.contextualOptions.dataSource,
      icon.contextualOptions.filterBy,
      context
    );
    
    setOptions(filteredOptions);
    setLoading(false);
  };
  
  const renderPanel = () => {
    switch (icon.panelConfig.component) {
      case 'StyleSelectionPanel':
        return <StyleSelectionPanel options={options} context={context} />;
      case 'BudgetSliderPanel':
        return <BudgetSliderPanel options={options} context={context} />;
      case 'LocationMapPanel':
        return <LocationMapPanel options={options} context={context} />;
      case 'FurnitureStylePanel':
        return <FurnitureStylePanel options={options} context={context} />;
      case 'ColorPalettePanel':
        return <ColorPalettePanel options={options} context={context} />;
      case 'MaterialSelectionPanel':
        return <MaterialSelectionPanel options={options} context={context} />;
      default:
        return null;
    }
  };
  
  return (
    <AnimatedPanel type={icon.panelConfig.type} onClose={onClose}>
      {loading ? <LoadingState /> : renderPanel()}
    </AnimatedPanel>
  );
};
```

## Phase 3: Smart Filtering Implementation

### Step 3.1: Context-Aware Data Filtering

```typescript
// services/contextAwareDataFilter.ts
export class ContextAwareDataFilter {
  private dataCache = new Map<string, any[]>();
  
  async getFilteredOptions(
    dataSource: string,
    filterBy: string[],
    context: ProcessedContext
  ): Promise<FilteredOption[]> {
    // Get base data
    const baseData = await this.getDataSource(dataSource);
    
    // Apply contextual filters
    let filteredData = baseData;
    
    for (const filter of filterBy) {
      filteredData = await this.applyFilter(filteredData, filter, context);
    }
    
    // Score and sort by relevance
    const scoredData = this.scoreOptions(filteredData, context);
    
    // Add contextual metadata
    return this.enrichWithMetadata(scoredData, context);
  }
  
  private async applyFilter(
    data: any[],
    filterType: string,
    context: ProcessedContext
  ): Promise<any[]> {
    switch (filterType) {
      case 'spaceType':
        return data.filter(item => 
          !item.spaceTypes || item.spaceTypes.includes(context.spaceType)
        );
        
      case 'roomType':
        if (!context.roomType) return data;
        return data.filter(item => 
          !item.roomTypes || item.roomTypes.includes(context.roomType.category)
        );
        
      case 'currentStyle':
        return this.filterByStyleCompatibility(data, context.currentStyle);
        
      case 'budget':
        return this.filterByBudgetRange(data, context.budgetEstimate);
        
      case 'climate':
        return this.filterByClimate(data, context.location?.climate);
        
      default:
        return data;
    }
  }
  
  private filterByStyleCompatibility(
    data: any[],
    currentStyle: StyleAnalysis
  ): any[] {
    return data.filter(item => {
      if (!item.compatibleStyles) return true;
      
      // Check primary style compatibility
      if (item.compatibleStyles.includes(currentStyle.primary)) return true;
      
      // Check secondary styles
      if (currentStyle.secondary) {
        return currentStyle.secondary.some(style => 
          item.compatibleStyles.includes(style)
        );
      }
      
      return false;
    });
  }
}
```

### Step 3.2: Dynamic Option Generation

```typescript
// services/dynamicOptionGenerator.ts
export class DynamicOptionGenerator {
  async generateStyleOptions(context: ProcessedContext): Promise<StyleOption[]> {
    const baseStyles = await this.getBaseStyles();
    
    // Filter based on space type
    let relevantStyles = baseStyles;
    if (context.spaceType === 'interior') {
      relevantStyles = baseStyles.filter(style => 
        !style.tags?.includes('exterior_only')
      );
    } else if (context.spaceType === 'exterior') {
      relevantStyles = baseStyles.filter(style => 
        !style.tags?.includes('interior_only')
      );
    }
    
    // Enhance with AI suggestions
    const aiSuggestions = await this.getAISuggestedStyles(context);
    
    // Merge and deduplicate
    const mergedStyles = this.mergeStyles(relevantStyles, aiSuggestions);
    
    // Add contextual previews
    return this.addContextualPreviews(mergedStyles, context);
  }
  
  private async getAISuggestedStyles(
    context: ProcessedContext
  ): Promise<StyleSuggestion[]> {
    const prompt = `
      Based on this ${context.spaceType} space 
      ${context.roomType ? `(${context.roomType.category})` : ''}
      with current style: ${context.currentStyle.primary},
      suggest 5 complementary design styles that would work well.
      Consider: ${context.userPrompt || 'general transformation'}
    `;
    
    const suggestions = await aiService.getSuggestions(prompt);
    return this.parseSuggestions(suggestions);
  }
}
```

## Phase 4: Integration with UI Components

### Step 4.1: Update UnifiedPanel Component

```typescript
// components/panels/UnifiedPanel.tsx
export const UnifiedPanel: React.FC<UnifiedPanelProps> = (props) => {
  const [context, setContext] = useState<ProcessedContext | null>(null);
  const [relevantIcons, setRelevantIcons] = useState<RelevantIcon[]>([]);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  // Initialize services
  const contextProcessor = useRef(new ContextProcessingPipeline());
  const iconFilter = useRef(new DynamicIconFilter());
  
  // Process image when selected
  useEffect(() => {
    if (props.selectedImage) {
      processImageContext();
    }
  }, [props.selectedImage]);
  
  // Update icons when context or prompt changes
  useEffect(() => {
    if (context) {
      updateRelevantIcons();
    }
  }, [context, props.userPrompt]);
  
  const processImageContext = async () => {
    const processedContext = await contextProcessor.current.processImage(
      props.selectedImage!,
      props.userPrompt
    );
    setContext(processedContext);
  };
  
  const updateRelevantIcons = async () => {
    const icons = await iconFilter.current.getRelevantIcons(
      context!,
      userPreferences
    );
    setRelevantIcons(icons);
  };
  
  return (
    <View style={styles.container}>
      {/* Existing prompt input */}
      
      {/* Dynamic Icon Row */}
      <DynamicIconRow
        icons={relevantIcons}
        onIconPress={(icon) => setActivePanel(icon.id)}
        loading={!context}
      />
      
      {/* Contextual Panel */}
      {activePanel && context && (
        <ContextualPanelSystem
          icon={relevantIcons.find(i => i.id === activePanel)!}
          context={context}
          onSelect={handlePanelSelection}
          onClose={() => setActivePanel(null)}
        />
      )}
    </View>
  );
};
```

### Step 4.2: Icon Row Component

```typescript
// components/DynamicIconRow.tsx
export const DynamicIconRow: React.FC<DynamicIconRowProps> = ({
  icons,
  onIconPress,
  loading
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (!loading && icons.length > 0) {
      Animated.stagger(50, 
        icons.map((_, index) => 
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true
          })
        )
      ).start();
    }
  }, [loading, icons]);
  
  if (loading) {
    return <IconRowSkeleton />;
  }
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.iconRow}>
        {icons.slice(0, 5).map((icon, index) => (
          <Animated.View
            key={icon.id}
            style={[
              styles.iconWrapper,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onIconPress(icon)}
            >
              <Text style={styles.iconEmoji}>{icon.icon}</Text>
              <Text style={styles.iconLabel}>{icon.label}</Text>
              {icon.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{icon.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        {icons.length > 5 && (
          <MoreIconsIndicator count={icons.length - 5} />
        )}
      </View>
    </ScrollView>
  );
};
```

## Phase 5: Testing and Optimization

### Step 5.1: Performance Monitoring

```typescript
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  
  async measureImageAnalysis(imageUri: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await aiContextAnalysis.analyzeImage(imageUri);
      const duration = Date.now() - startTime;
      
      this.recordMetric('imageAnalysis', {
        duration,
        success: true,
        timestamp: new Date()
      });
      
      // Log if exceeds threshold
      if (duration > 2000) {
        console.warn(`Image analysis took ${duration}ms, exceeding 2s threshold`);
      }
    } catch (error) {
      this.recordMetric('imageAnalysis', {
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    }
  }
}
```

### Step 5.2: A/B Testing Framework

```typescript
// services/abTesting.ts
export class ABTestingService {
  async getIconVariant(userId: string, context: ProcessedContext): Promise<IconVariant> {
    const testGroup = this.getUserTestGroup(userId);
    
    switch (testGroup) {
      case 'A': // Control - static icons
        return { type: 'static', icons: DEFAULT_ICONS };
        
      case 'B': // Dynamic with basic filtering
        return { type: 'dynamic_basic', maxIcons: 5 };
        
      case 'C': // Full dynamic with AI
        return { type: 'dynamic_ai', maxIcons: 8 };
        
      default:
        return { type: 'dynamic_ai', maxIcons: 5 };
    }
  }
}
```

## Implementation Timeline

### Week 1-2: Core AI Analysis
- Set up Gemini Vision integration
- Implement basic image classification
- Create context processing pipeline

### Week 3-4: Dynamic Icon System
- Build icon configuration system
- Implement visibility rules engine
- Create relevance scoring algorithm

### Week 5-6: Contextual Panels
- Develop panel components for each icon type
- Implement dynamic data filtering
- Add smooth animations and transitions

### Week 7-8: Integration and Testing
- Integrate with existing UI
- Performance optimization
- A/B testing setup
- User feedback collection

### Week 9-10: Refinement
- Fine-tune AI models based on feedback
- Optimize performance bottlenecks
- Polish UI/UX details
- Launch preparation

## Success Metrics

1. **Performance**
   - Image analysis < 2 seconds (95th percentile)
   - Icon update < 300ms after user input
   - Smooth 60fps animations

2. **Accuracy**
   - 90%+ interior/exterior classification accuracy
   - 85%+ room type detection accuracy
   - 80%+ style identification accuracy

3. **User Engagement**
   - 70%+ users interact with dynamic icons
   - 50%+ reduction in time to complete customization
   - 85%+ user satisfaction with suggested options

## Conclusion

This implementation strategy provides a comprehensive approach to building an AI-powered, context-aware icon system that dynamically adapts to user needs. The system leverages advanced image analysis, intelligent filtering, and smooth UI transitions to create an intuitive and efficient user experience.