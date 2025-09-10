# Two-Step AI Image Generation PRD

## Executive Summary

This PRD outlines the implementation of a sophisticated 2-step AI prompting system for Compozit Vision's core image generation feature. The system transforms user input and context data through two AI models: first creating an enhanced prompt, then generating the final design with Gemini's Imagen model.

## Current State Analysis

### ✅ **Existing Infrastructure**
- **Authentication Gate**: Implemented in `UnifiedProjectScreenV2.tsx`
- **Prompt Optimization Service**: Sophisticated 2-level prompting in `promptOptimizationService.ts`
- **Context Analysis Pipeline**: Rich image analysis in `contextProcessingPipeline.ts`
- **Cultural Guidelines**: Comprehensive design principles in `COMPREHENSIVE-DESIGN-CATEGORIES.md`
- **Secure Backend Architecture**: API proxy system to protect keys
- **Professional Standards**: Magazine-quality output requirements

### ❌ **Missing Components**
- **Real AI Generation**: Currently uses mock 2-second timeout
- **Backend Endpoints**: `/api/gemini/generate-image` not implemented
- **Context Integration**: Rich analysis not connected to generation flow
- **Image Processing**: Input image not sent to AI models
- **Feature Selection Integration**: UI features not connected to prompt enhancement

## System Architecture

### **Two-Step Process Overview**

```
Step 1: Context Analysis & Prompt Enhancement
User Input + Image + Features → AI Model 1 (Gemini 2.5 Flash) → Enhanced Prompt

Step 2: Image Generation
Enhanced Prompt + Professional Guidelines + Original Image → AI Model 2 (Imagen 3) → Final Design
```

## Technical Implementation

### **Phase 1: Context Analysis & Prompt Enhancement**

#### **Input Data Collection**
```typescript
interface GenerationInput {
  originalImage: string;           // Base64 or URL
  userPrompt: string;             // User's description
  selectedFeatures: FeatureId[];  // UI-selected features
  projectContext: ProjectContext; // Professional project details
  culturalPreferences?: {
    primaryStyle: string;         // e.g., "Scandinavian"
    culturalInfluences: string[]; // e.g., ["Nordic", "Danish"]
    regionCode?: string;          // e.g., "US", "EU"
  };
}
```

#### **Step 1 AI Model: Context Analyzer**
**Model**: Gemini 2.5 Flash
**Purpose**: Analyze image + context → Create detailed design prompt

**System Prompt Template**:
```
You are an expert interior design AI that analyzes spaces and creates detailed transformation prompts. Your task is to:

1. **Analyze the uploaded image** for:
   - Room type, dimensions, and architectural features
   - Current style, furniture, and materials
   - Lighting conditions and spatial flow
   - Potential and limitations

2. **Interpret user requirements**:
   - User prompt: "{userPrompt}"
   - Selected features: {selectedFeatures}
   - Style preferences: {culturalPreferences}
   - Project context: {projectContext}

3. **Generate a detailed transformation prompt** that includes:
   - Specific design changes to implement
   - Cultural style guidelines to follow
   - Material and color specifications
   - Professional photography requirements

OUTPUT FORMAT:
TRANSFORMATION_PROMPT: [Detailed prompt for image generation AI]
STYLE_CONFIDENCE: [0.0-1.0 confidence in style interpretation]
TECHNICAL_REQUIREMENTS: [Camera angle, lighting, composition notes]
CULTURAL_NOTES: [Specific cultural design elements to include]
```

#### **Cultural Guidelines Integration**
Based on `COMPREHENSIVE-DESIGN-CATEGORIES.md`:

```typescript
const culturalGuidelines = {
  'Scandinavian': {
    elements: ['light woods', 'white walls', 'cozy textiles', 'hygge concept'],
    materials: ['birch', 'pine', 'wool', 'linen'],
    colors: ['whites', 'light grays', 'natural wood tones'],
    lighting: ['natural light', 'warm ambient', 'minimal fixtures']
  },
  'Mediterranean': {
    elements: ['terracotta', 'wrought iron', 'natural stone', 'coastal charm'],
    materials: ['ceramic tiles', 'stone', 'wood shutters'],
    colors: ['warm earth tones', 'sea blues', 'sunset oranges'],
    lighting: ['natural sunlight', 'lantern-style fixtures']
  }
  // ... complete cultural mapping
};
```

### **Phase 2: Professional Image Generation**

#### **Step 2 AI Model: Image Generator**
**Model**: Gemini Imagen 3 (via `/api/gemini/generate-image`)
**Purpose**: Transform image based on enhanced prompt

**Professional Guidelines Injection**:
```typescript
const professionalPromptEnhancement = `
PROFESSIONAL PHOTOGRAPHY STANDARDS:
- Magazine-quality interior design photography
- Natural lighting with professional color grading
- Sharp focus on textures and materials
- Proper architectural perspective and framing
- High-resolution detail capture (4K quality)

BRAND CONSISTENCY (Authority Black #0A0A0A, Platinum Gold #D4A574):
- Prestigious, sophisticated aesthetic
- Chic simplicity with bold contrast
- Gallery-like precision and attention to detail
- Luxury materials with matte finishes

CULTURAL AUTHENTICITY:
${culturalGuidelines[selectedStyle] || 'Universal design principles'}

TECHNICAL SPECIFICATIONS:
- Aspect ratio: ${aspectRatio}
- Lighting: Natural with professional enhancement
- Composition: Full room view with architectural context
- Quality: Ultra-high resolution, photorealistic
`;
```

## Implementation Plan

### **Backend Implementation**

#### **1. Create Generation Endpoint**
**File**: `/backend-vercel/api/gemini/generate-image.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      originalImage,
      userPrompt,
      selectedFeatures,
      projectContext,
      culturalPreferences
    } = req.body;

    // Step 1: Context Analysis & Prompt Enhancement
    const contextAnalysis = await analyzeImageContext(originalImage);
    const enhancedPrompt = await generateEnhancedPrompt({
      userPrompt,
      contextAnalysis,
      selectedFeatures,
      projectContext,
      culturalPreferences
    });

    // Step 2: Image Generation
    const generatedImage = await generateImageWithGemini({
      originalImage,
      enhancedPrompt: enhancedPrompt.transformationPrompt,
      technicalRequirements: enhancedPrompt.technicalRequirements,
      professionalGuidelines: getProfessionalGuidelines(culturalPreferences)
    });

    return res.status(200).json({
      success: true,
      data: {
        generatedImage,
        enhancedPrompt: enhancedPrompt.transformationPrompt,
        contextAnalysis,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: enhancedPrompt.styleConfidence,
          culturalElements: enhancedPrompt.culturalNotes
        }
      }
    });

  } catch (error) {
    console.error('Image generation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Image generation failed',
      details: error.message
    });
  }
}
```

### **Frontend Implementation**

#### **2. Update handleProcess Function**
**File**: `/mobile/src/screens/project/UnifiedProjectScreenV2.tsx`

```typescript
const handleProcess = async () => {
  if (!selectedImage || !userPrompt.trim() || !user) return;

  setIsProcessing(true);

  try {
    // Prepare generation request
    const generationRequest: TwoStepGenerationRequest = {
      originalImage: selectedImage,
      userPrompt,
      selectedFeatures: getSelectedFeatures(), // From UI state
      projectContext,
      culturalPreferences: extractCulturalPreferences(projectContext),
      userId: user.id,
      sessionId: generateSessionId()
    };

    // Call 2-step generation service
    const result = await twoStepGenerationService.generateDesign(generationRequest);

    if (result.success) {
      setResultImage(result.data.generatedImage.url);
      setGenerationMetadata(result.data.metadata);
      
      // Show professional success message
      Alert.alert(
        'Design Generated Successfully!',
        `Your ${projectContext?.style?.join(' & ') || 'custom'} design is ready.`,
        [{ text: 'View Result', onPress: () => handleViewResult() }]
      );

      // Track successful generation
      trackEvent('design_generation_success', {
        style: projectContext?.style,
        features: selectedFeatures.length,
        confidence: result.data.metadata.confidence
      });
    } else {
      throw new Error(result.error || 'Generation failed');
    }

  } catch (error) {
    console.error('Generation failed:', error);
    Alert.alert(
      'Generation Failed',
      'Unable to generate your design. Please try again.',
      [
        { text: 'Retry', onPress: () => handleProcess() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  } finally {
    setIsProcessing(false);
  }
};
```

#### **3. Create Two-Step Generation Service**
**File**: `/mobile/src/services/twoStepGenerationService.ts`

```typescript
import { backendApiService } from './backendApiService';
import { contextProcessingPipeline } from './contextProcessingPipeline';

interface TwoStepGenerationRequest {
  originalImage: string;
  userPrompt: string;
  selectedFeatures: FeatureId[];
  projectContext: ProjectContext;
  culturalPreferences?: CulturalPreferences;
  userId: string;
  sessionId: string;
}

class TwoStepGenerationService {
  async generateDesign(request: TwoStepGenerationRequest): Promise<GenerationResult> {
    console.log('🎨 Starting 2-step generation process...');
    
    // Pre-process image for context analysis
    const imageAnalysis = await contextProcessingPipeline.analyzeImage(request.originalImage);
    
    // Add image context to request
    const enhancedRequest = {
      ...request,
      imageAnalysis
    };

    // Call backend for 2-step generation
    const response = await backendApiService.post('/gemini/generate-image', enhancedRequest);
    
    if (!response.success) {
      throw new Error(response.error || 'Generation service failed');
    }

    return response;
  }

  async refineDesign(
    originalResult: GenerationResult,
    refinements: DesignRefinements
  ): Promise<GenerationResult> {
    console.log('🔧 Refining design...');
    
    const refinementRequest = {
      originalImage: originalResult.data.generatedImage.url,
      basePrompt: originalResult.data.enhancedPrompt,
      refinements,
      sessionId: originalResult.data.sessionId
    };

    return await backendApiService.post('/gemini/refine-image', refinementRequest);
  }
}

export const twoStepGenerationService = new TwoStepGenerationService();
```

## Testing Strategy

### **Unit Tests**

#### **1. Context Analysis Testing**
```typescript
describe('Context Analysis (Step 1)', () => {
  test('should analyze room type correctly', async () => {
    const image = loadTestImage('modern_living_room.jpg');
    const result = await contextAnalyzer.analyze(image);
    
    expect(result.roomType).toBe('living_room');
    expect(result.currentStyle).toContain('modern');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test('should generate enhanced prompt', async () => {
    const input = {
      userPrompt: 'make it more cozy',
      selectedFeatures: ['lighting', 'furniture'],
      culturalStyle: 'Scandinavian'
    };
    
    const result = await promptEnhancer.enhance(input);
    
    expect(result.transformationPrompt).toContain('cozy');
    expect(result.transformationPrompt).toContain('Scandinavian');
    expect(result.culturalNotes).toContain('hygge');
  });
});
```

#### **2. Image Generation Testing**
```typescript
describe('Image Generation (Step 2)', () => {
  test('should generate high-quality design image', async () => {
    const request = createTestGenerationRequest();
    const result = await imageGenerator.generate(request);
    
    expect(result.success).toBe(true);
    expect(result.data.generatedImage.url).toBeDefined();
    expect(result.data.metadata.confidence).toBeGreaterThan(0.7);
  });

  test('should maintain cultural authenticity', async () => {
    const japaneseStyleRequest = {
      culturalPreferences: { primaryStyle: 'Japanese' }
    };
    
    const result = await imageGenerator.generate(japaneseStyleRequest);
    const analysis = await culturalValidator.validate(result.data.generatedImage);
    
    expect(analysis.culturalElements).toContain('tatami');
    expect(analysis.authenticity).toBeGreaterThan(0.8);
  });
});
```

### **Integration Tests**

#### **1. End-to-End Generation Flow**
```typescript
describe('Full Generation Pipeline', () => {
  test('should complete 2-step generation successfully', async () => {
    const user = await createTestUser();
    const image = loadTestImage('bedroom.jpg');
    
    // Step 1: User uploads image and adds prompt
    const generationRequest = {
      originalImage: image,
      userPrompt: 'transform to minimalist style',
      selectedFeatures: ['materials', 'lighting'],
      projectContext: createMinimalistProject()
    };

    // Step 2: Process through 2-step system
    const result = await twoStepGenerationService.generateDesign(generationRequest);

    // Validate results
    expect(result.success).toBe(true);
    expect(result.data.generatedImage).toBeDefined();
    expect(result.data.metadata.confidence).toBeGreaterThan(0.7);
    
    // Validate cultural adherence
    const styleAnalysis = await analyzeGeneratedStyle(result.data.generatedImage);
    expect(styleAnalysis.style).toBe('minimalist');
  });
});
```

### **Performance Tests**

#### **1. Generation Time Benchmarks**
```typescript
describe('Performance Benchmarks', () => {
  test('should complete generation within 30 seconds', async () => {
    const startTime = Date.now();
    const result = await twoStepGenerationService.generateDesign(testRequest);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // 30 seconds
    expect(result.success).toBe(true);
  });

  test('should handle concurrent generations', async () => {
    const requests = Array(5).fill(null).map(() => createTestRequest());
    const results = await Promise.all(
      requests.map(req => twoStepGenerationService.generateDesign(req))
    );
    
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});
```

### **Quality Assurance Tests**

#### **1. Cultural Sensitivity Testing**
```typescript
describe('Cultural Design Quality', () => {
  const culturalStyles = [
    'Scandinavian', 'Mediterranean', 'Japanese', 'Moroccan', 'French'
  ];

  culturalStyles.forEach(style => {
    test(`should generate authentic ${style} designs`, async () => {
      const request = createCulturalRequest(style);
      const result = await generateAndValidateStyle(request);
      
      expect(result.culturalAuthenticity).toBeGreaterThan(0.8);
      expect(result.styleElements).toContainCulturalMarkers(style);
    });
  });
});
```

#### **2. Professional Quality Testing**
```typescript
describe('Professional Output Quality', () => {
  test('should meet magazine-quality standards', async () => {
    const result = await generateProfessionalDesign();
    const qualityMetrics = await assessImageQuality(result.generatedImage);
    
    expect(qualityMetrics.resolution).toBeGreaterThan(2048);
    expect(qualityMetrics.lighting).toBe('professional');
    expect(qualityMetrics.composition).toBe('magazine_quality');
  });
});
```

## Error Handling & Fallbacks

### **Step 1 Failures**
- **Context Analysis Fails**: Use basic prompt enhancement with fallback templates
- **Cultural Guidelines Missing**: Default to universal design principles
- **Feature Analysis Fails**: Use user-selected features only

### **Step 2 Failures**
- **Image Generation Fails**: Retry with simplified prompt
- **Quality Below Threshold**: Regenerate with enhanced parameters
- **Cultural Guidelines Violated**: Apply post-processing corrections

## Success Metrics

### **Technical KPIs**
- **Generation Success Rate**: >95%
- **Average Processing Time**: <25 seconds
- **Cultural Authenticity Score**: >0.85
- **User Satisfaction (Quality)**: >4.2/5.0
- **Retry Rate**: <10%

### **Business KPIs**
- **Generation-to-Save Rate**: >70%
- **Premium Feature Adoption**: +25%
- **User Retention (Post-Generation)**: >85%
- **Professional User Growth**: +40%

## Security & Privacy

### **API Key Protection**
- All AI model calls routed through secure backend
- No API keys exposed in client bundle
- Rate limiting and abuse prevention

### **User Data Protection**
- Images processed temporarily and deleted post-generation
- No permanent storage of user images
- GDPR/CCPA compliant data handling

### **Cultural Sensitivity**
- Regular audits of cultural representation
- Diverse training data validation
- Community feedback integration

## Rollout Plan

### **Phase 1: Core Implementation** (Week 1-2)
- Backend API endpoints
- Basic 2-step generation flow
- Essential cultural guidelines

### **Phase 2: Feature Integration** (Week 3)
- UI feature selection integration
- Advanced context analysis
- Professional quality validation

### **Phase 3: Quality Enhancement** (Week 4)
- Cultural authenticity validation
- Professional photography standards
- Performance optimization

### **Phase 4: Production Deployment** (Week 5)
- A/B testing with subset of users
- Performance monitoring
- Quality assurance validation
- Full rollout to all users

This implementation will establish Compozit Vision as the premier AI-powered interior design platform with culturally authentic, professionally-quality image generation capabilities.