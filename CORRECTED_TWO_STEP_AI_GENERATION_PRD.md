# Corrected Two-Step AI Image Generation PRD

## Executive Summary

This PRD outlines the corrected implementation of Compozit Vision's 2-step AI prompting system. The system transforms user interaction data (text, location clicks, reference images, features) into enhanced prompts, then generates professional interior design images.

## Corrected System Architecture

### **Two-Step Process Overview**

```
Step 1: User Input Collection → Enhanced Prompt Generation
User Interactions → JSON Object → AI Model 1 (Gemini 2.5 Flash) → Enhanced Prompt

Step 2: Professional Image Generation
Original Image + Enhanced Prompt + Reference Images + App Prompt → AI Model 2 (Nano Banana/Gemini 2.5 Flash Vision) → Generated Image

Refinements: Single-Step Process
Generated Image + New Prompt → Nano Banana → Refined Image
```

## Technical Implementation

### **User Input Collection**

#### **Complete User Interaction Object**
```typescript
interface UserInteractionData {
  userPrompt: string;                    // Text from user input
  originalImage: string;                 // Base64 or URL
  locationClicks?: {
    x: number;
    y: number;
    description?: string;                // "click on sofa", "focus on wall"
  }[];
  referenceImages?: {
    url: string;
    description: string;                 // "style like this", "color inspiration"
    type: 'style' | 'color' | 'material' | 'furniture';
  }[];
  selectedFeatures: {
    colorPalette?: string[];             // ["#0A0A0A", "#D4A574", "#FFFFFF"]
    priceRange?: {
      min: number;
      max: number;
      currency: string;
    };
    materials?: string[];                // ["wood", "marble", "fabric"]
    lighting?: string;                   // "natural", "dramatic", "ambient"
    roomType?: string;                   // "living_room", "bedroom", etc.
    style?: string[];                    // ["Scandinavian", "Modern"]
  };
  projectContext?: {
    clientName?: string;
    timeline?: string;
    constraints?: string[];
  };
  sessionId: string;
  userId: string;
}
```

### **Step 1: Enhanced Prompt Generation**

#### **Input**: JSON Object Only (NO Image)
#### **AI Model**: Gemini 2.5 Flash (Text-only)
#### **Purpose**: Convert structured user data into detailed transformation prompt

**System Prompt Template**:
```
You are an expert interior design prompt engineer. Convert this structured user input into a detailed, professional interior design transformation prompt.

USER INTERACTION DATA:
{userInteractionData}

Create a comprehensive transformation prompt that includes:
1. **Primary Transformation**: Based on user text prompt
2. **Location-Specific Changes**: If user clicked specific areas
3. **Style References**: Incorporate reference images described
4. **Feature Integration**: Color palette, materials, lighting preferences
5. **Budget Considerations**: Appropriate solutions for price range
6. **Professional Details**: Specific materials, textures, lighting setups

OUTPUT FORMAT:
Return only the enhanced prompt text (no JSON, no formatting).
Focus on actionable design changes that can be visually implemented.
Make it detailed but concise (150-250 words).

EXAMPLE OUTPUT:
"Transform this living room into a modern Scandinavian space focusing on the seating area (clicked location). Replace the current sofa with a light oak frame sectional with cream linen upholstery. Apply the specified color palette with charcoal accent wall (#0A0A0A) and warm gold lighting fixtures (#D4A574). Incorporate natural materials like light wood flooring and wool textiles. Add ambient lighting with pendant lights and table lamps for cozy atmosphere. Update window treatments with white linen curtains. Budget-conscious approach using IKEA-style furniture mixed with statement pieces. Professional interior photography with natural lighting, realistic textures, and architectural accuracy."
```

### **Step 2: Professional Image Generation**

#### **Input**: Original Image + Enhanced Prompt + Reference Images + Application Prompt
#### **AI Model**: Nano Banana (Gemini 2.5 Flash with Vision)
#### **Purpose**: Generate transformed interior design image

**Application Prompt** (Professional Rendering Standards):
```
PROFESSIONAL RENDERING REQUIREMENTS:
- High-quality interior design photography with proper lighting
- Realistic material textures and accurate color representation
- Correct architectural perspective and spatial proportions
- Sharp focus with professional depth of field
- Natural lighting that enhances the space authentically
- Materials should look realistic (wood grain, fabric texture, metal finishes)
- Maintain architectural integrity and structural logic
- Professional color grading and contrast
- Magazine-quality composition and framing
- 4K resolution detail level
```

**Combined Prompt Structure**:
```
[ENHANCED_PROMPT_FROM_STEP_1]

[APPLICATION_PROMPT_PROFESSIONAL_STANDARDS]

Additional references: [REFERENCE_IMAGE_DESCRIPTIONS]
```

### **Refinements: Single-Step Process**

#### **Input**: Generated Image + New User Prompt
#### **AI Model**: Nano Banana (Gemini 2.5 Flash with Vision)
#### **Purpose**: Direct modifications to generated image

**No JSON processing needed** - direct prompt like:
- "Make the lighting warmer"
- "Change the sofa color to blue"
- "Add more plants"

## Implementation

### **Backend API Endpoints**

#### **1. Step 1: Generate Enhanced Prompt**
**File**: `/backend-vercel/api/gemini/enhance-prompt.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userInteractionData } = req.body;

    // Step 1: Convert JSON to enhanced prompt (NO IMAGE SENT)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const systemPrompt = `You are an expert interior design prompt engineer. Convert this structured user input into a detailed, professional interior design transformation prompt.

USER INTERACTION DATA:
${JSON.stringify(userInteractionData, null, 2)}

Create a comprehensive transformation prompt that includes:
1. Primary transformation based on user text: "${userInteractionData.userPrompt}"
2. Location-specific changes: ${userInteractionData.locationClicks?.map(click => `focus on area at (${click.x}, ${click.y})`).join(', ') || 'general room transformation'}
3. Style references: ${userInteractionData.referenceImages?.map(ref => ref.description).join(', ') || 'no references'}
4. Color palette: ${userInteractionData.selectedFeatures.colorPalette?.join(', ') || 'existing colors'}
5. Budget range: $${userInteractionData.selectedFeatures.priceRange?.min}-${userInteractionData.selectedFeatures.priceRange?.max} ${userInteractionData.selectedFeatures.priceRange?.currency || 'USD'}
6. Materials: ${userInteractionData.selectedFeatures.materials?.join(', ') || 'current materials'}

Return only the enhanced prompt text. Make it detailed but concise (150-250 words).
Focus on actionable design changes that can be visually implemented.`;

    const result = await model.generateContent(systemPrompt);
    const enhancedPrompt = result.response.text().trim();

    return res.status(200).json({
      success: true,
      data: {
        enhancedPrompt,
        originalData: userInteractionData,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Enhanced prompt generation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Enhanced prompt generation failed',
      details: error.message
    });
  }
}
```

#### **2. Step 2: Generate Transformed Image**
**File**: `/backend-vercel/api/gemini/generate-design.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      originalImage, 
      enhancedPrompt, 
      referenceImages = [],
      sessionId 
    } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Application prompt for professional rendering
    const applicationPrompt = `PROFESSIONAL RENDERING REQUIREMENTS:
- High-quality interior design photography with proper lighting
- Realistic material textures and accurate color representation
- Correct architectural perspective and spatial proportions
- Sharp focus with professional depth of field
- Natural lighting that enhances the space authentically
- Materials should look realistic (wood grain, fabric texture, metal finishes)
- Maintain architectural integrity and structural logic
- Professional color grading and contrast
- Magazine-quality composition and framing
- 4K resolution detail level`;

    // Combine prompts
    const combinedPrompt = `${enhancedPrompt}

${applicationPrompt}

${referenceImages.length > 0 ? `Reference inspirations: ${referenceImages.map(ref => ref.description).join(', ')}` : ''}`;

    // Prepare content for generation
    const contentParts = [
      {
        inlineData: {
          data: originalImage.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/jpeg'
        }
      }
    ];

    // Add reference images if provided
    for (const refImage of referenceImages) {
      if (refImage.url) {
        contentParts.push({
          inlineData: {
            data: refImage.url.replace(/^data:image\/[a-z]+;base64,/, ''),
            mimeType: 'image/jpeg'
          }
        });
      }
    }

    // Add the combined prompt
    contentParts.push({ text: combinedPrompt });

    // Generate the transformed image
    const result = await model.generateContent(contentParts);
    
    // TODO: Extract generated image from result
    // For now, return original image as placeholder
    
    return res.status(200).json({
      success: true,
      data: {
        generatedImage: {
          url: originalImage, // TODO: Replace with actual generated image
          metadata: {
            model: 'nano-banana',
            processingTime: Date.now() - startTime,
            promptUsed: combinedPrompt.substring(0, 200) + '...'
          }
        },
        sessionId
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

#### **3. Refinements: Direct Image Modification**
**File**: `/backend-vercel/api/gemini/refine-design.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      generatedImage, 
      refinementPrompt,
      sessionId 
    } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Direct refinement - no JSON processing
    const contentParts = [
      {
        inlineData: {
          data: generatedImage.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/jpeg'
        }
      },
      { 
        text: `${refinementPrompt}

Maintain professional interior design quality with realistic materials and proper lighting.` 
      }
    ];

    const result = await model.generateContent(contentParts);
    
    return res.status(200).json({
      success: true,
      data: {
        refinedImage: {
          url: generatedImage, // TODO: Replace with actual refined image
          metadata: {
            model: 'nano-banana',
            refinementApplied: refinementPrompt,
            processingTime: Date.now() - startTime
          }
        },
        sessionId
      }
    });

  } catch (error) {
    console.error('Design refinement failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Design refinement failed',
      details: error.message
    });
  }
}
```

### **Frontend Service Implementation**

#### **Updated Two-Step Generation Service**
**File**: `/mobile/src/services/correctedTwoStepGenerationService.ts`

```typescript
interface UserInteractionData {
  userPrompt: string;
  originalImage: string;
  locationClicks?: { x: number; y: number; description?: string }[];
  referenceImages?: { url: string; description: string; type: string }[];
  selectedFeatures: {
    colorPalette?: string[];
    priceRange?: { min: number; max: number; currency: string };
    materials?: string[];
    lighting?: string;
    roomType?: string;
    style?: string[];
  };
  projectContext?: any;
  sessionId: string;
  userId: string;
}

class CorrectedTwoStepGenerationService {
  // Step 1: Generate Enhanced Prompt (NO IMAGE)
  async generateEnhancedPrompt(userInteractionData: UserInteractionData): Promise<string> {
    console.log('🧠 Step 1: Generating enhanced prompt from user data...');
    
    const response = await fetch('/api/gemini/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInteractionData })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data.enhancedPrompt;
  }

  // Step 2: Generate Design Image
  async generateDesignImage(
    originalImage: string,
    enhancedPrompt: string,
    referenceImages: any[] = [],
    sessionId: string
  ): Promise<any> {
    console.log('🎨 Step 2: Generating design with enhanced prompt + references...');
    
    const response = await fetch('/api/gemini/generate-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalImage,
        enhancedPrompt,
        referenceImages,
        sessionId
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  }

  // Complete 2-Step Process
  async processDesignGeneration(userInteractionData: UserInteractionData): Promise<any> {
    try {
      // Step 1: JSON → Enhanced Prompt (no image)
      const enhancedPrompt = await this.generateEnhancedPrompt(userInteractionData);
      
      // Step 2: Original Image + Enhanced Prompt → Generated Image
      const result = await this.generateDesignImage(
        userInteractionData.originalImage,
        enhancedPrompt,
        userInteractionData.referenceImages,
        userInteractionData.sessionId
      );

      return {
        success: true,
        data: {
          ...result,
          enhancedPrompt,
          originalData: userInteractionData
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Single-Step Refinement
  async refineDesign(generatedImage: string, refinementPrompt: string, sessionId: string): Promise<any> {
    console.log('🔄 Refining design with direct prompt...');
    
    const response = await fetch('/api/gemini/refine-design', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generatedImage,
        refinementPrompt,
        sessionId
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  }
}

export const correctedTwoStepGenerationService = new CorrectedTwoStepGenerationService();
```

## Key Differences from Previous Implementation

### ✅ **Corrected Flow**:
1. **Step 1**: JSON object → Enhanced Prompt (NO image sent to AI)
2. **Step 2**: Original Image + Enhanced Prompt + Reference Images → Generated Image
3. **Refinements**: Generated Image + Direct Prompt → Refined Image (single step)

### ❌ **Previous Incorrect Flow**:
1. ~~Image + Context → Enhanced Prompt~~
2. ~~Enhanced Prompt + Image → Generated Image~~

### 🎯 **Key Implementation Points**:
- **Step 1 AI**: Only processes structured user data (text, features, preferences)
- **Step 2 AI**: Processes visual content (original + reference images) with enhanced prompt
- **Reference Images**: Included in Step 2 generation process
- **Refinements**: Direct to Nano Banana with generated image
- **No Brand Consistency Prompts**: Focus on professional rendering standards

This corrected implementation properly separates the text processing (Step 1) from the visual processing (Step 2), making the system more efficient and aligned with the intended architecture.