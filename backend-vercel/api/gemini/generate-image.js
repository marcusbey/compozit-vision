/**
 * Two-Step AI Image Generation Endpoint
 * 
 * Step 1: Context Analysis & Prompt Enhancement (Gemini 2.5 Flash)
 * Step 2: Professional Image Generation (Imagen 3)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with secure API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  const startTime = Date.now();

  try {
    const {
      originalImage,
      userPrompt,
      selectedFeatures = [],
      projectContext,
      culturalPreferences,
      userId,
      sessionId
    } = req.body;

    // Validate required inputs
    if (!originalImage || !userPrompt || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: originalImage, userPrompt, userId'
      });
    }

    console.log('🎨 Starting 2-step generation process:', {
      userId,
      sessionId,
      promptLength: userPrompt.length,
      features: selectedFeatures.length,
      style: culturalPreferences?.primaryStyle
    });

    // Step 1: Context Analysis & Prompt Enhancement
    const step1Start = Date.now();
    const contextAnalysis = await performContextAnalysis(originalImage, userPrompt);
    const enhancedPrompt = await generateEnhancedPrompt({
      userPrompt,
      contextAnalysis,
      selectedFeatures,
      projectContext,
      culturalPreferences
    });
    const step1Duration = Date.now() - step1Start;

    console.log('✅ Step 1 completed - Context analysis & prompt enhancement:', {
      confidence: enhancedPrompt.styleConfidence,
      promptLength: enhancedPrompt.transformationPrompt.length
    });

    // Step 2: Professional Image Generation
    const step2Start = Date.now();
    const generatedImage = await performImageGeneration(originalImage, enhancedPrompt);
    const step2Duration = Date.now() - step2Start;

    console.log('✅ Step 2 completed - Image generation:', {
      qualityScore: generatedImage.metadata.qualityScore,
      culturalScore: generatedImage.metadata.culturalAuthenticityScore
    });

    const totalDuration = Date.now() - startTime;

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        generatedImage,
        contextAnalysis,
        enhancedPrompt,
        originalPrompt: userPrompt,
        processingSteps: {
          step1Duration,
          step2Duration,
          totalDuration
        },
        sessionId,
        confidence: Math.min(enhancedPrompt.styleConfidence, generatedImage.metadata.qualityScore)
      }
    });

  } catch (error) {
    console.error('❌ Two-step generation failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Image generation failed',
      details: error.message,
      processingTime: Date.now() - startTime
    });
  }
}

/**
 * Step 1: Context Analysis using Gemini Vision
 */
async function performContextAnalysis(imageBase64, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const analysisPrompt = `Analyze this interior design image and provide detailed context information.

USER REQUEST: "${userPrompt}"

Please analyze:
1. Room type and spatial characteristics
2. Current design style and aesthetic
3. Existing materials and textures
4. Lighting conditions and quality
5. Spatial layout and flow
6. Potential improvements and opportunities

Return your analysis in this JSON format:
{
  "roomType": "living_room|bedroom|kitchen|bathroom|dining_room|office|other",
  "currentStyle": ["modern", "traditional", "scandinavian", etc.],
  "materials": ["wood", "fabric", "metal", "stone", etc.],
  "lighting": "natural|artificial|mixed|poor",
  "spatialLayout": "open|closed|transitional",
  "potentialImprovements": ["better lighting", "color coordination", etc.],
  "confidence": 0.0-1.0
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: 'image/jpeg'
        }
      },
      { text: analysisPrompt }
    ]);

    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      roomType: 'living_room',
      currentStyle: ['contemporary'],
      materials: ['wood', 'fabric'],
      lighting: 'natural',
      spatialLayout: 'open',
      potentialImprovements: ['improved lighting', 'better color coordination'],
      confidence: 0.6
    };

  } catch (error) {
    console.warn('⚠️ Context analysis fallback used:', error.message);
    
    // Return fallback analysis
    return {
      roomType: 'living_room',
      currentStyle: ['contemporary'],
      materials: ['wood', 'fabric'],
      lighting: 'natural',
      spatialLayout: 'open',
      potentialImprovements: ['enhanced design elements'],
      confidence: 0.5
    };
  }
}

/**
 * Step 1: Generate Enhanced Prompt using cultural guidelines
 */
async function generateEnhancedPrompt({
  userPrompt,
  contextAnalysis,
  selectedFeatures,
  projectContext,
  culturalPreferences
}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Cultural guidelines from COMPREHENSIVE-DESIGN-CATEGORIES.md
    const culturalGuidelines = getCulturalGuidelines(culturalPreferences?.primaryStyle);

    const promptEnhancementRequest = `You are an expert prompt engineer for AI image generation tools. Transform this interior design request into a detailed, professional prompt.

ORIGINAL REQUEST: "${userPrompt}"
ROOM CONTEXT: ${contextAnalysis.roomType} with ${contextAnalysis.currentStyle.join(', ')} style
SELECTED FEATURES: ${selectedFeatures.join(', ')}
CULTURAL STYLE: ${culturalPreferences?.primaryStyle || 'Universal'}

${culturalGuidelines ? `CULTURAL GUIDELINES for ${culturalPreferences.primaryStyle}:
- Elements: ${culturalGuidelines.elements.join(', ')}
- Materials: ${culturalGuidelines.materials.join(', ')}
- Colors: ${culturalGuidelines.colors.join(', ')}
- Principles: ${culturalGuidelines.principles.join(', ')}` : ''}

PROJECT CONTEXT: ${projectContext ? JSON.stringify(projectContext, null, 2) : 'None'}

Create a detailed transformation prompt that includes:
1. Specific design changes based on user request
2. Cultural authenticity elements
3. Professional photography requirements
4. Material and texture specifications
5. Lighting and composition details

Return your response in this JSON format:
{
  "transformationPrompt": "detailed prompt for image generation (150-300 words)",
  "technicalRequirements": {
    "aspectRatio": "16:9|4:3|1:1",
    "lighting": "natural|dramatic|soft|professional",
    "composition": "full_room|close_up|architectural",
    "quality": "premium|standard"
  },
  "culturalNotes": ["specific cultural elements to include"],
  "styleConfidence": 0.0-1.0,
  "professionalEnhancements": ["magazine quality", "professional photography", etc.]
}`;

    const result = await model.generateContent(promptEnhancementRequest);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback prompt enhancement
    return createFallbackEnhancedPrompt(userPrompt, culturalPreferences);

  } catch (error) {
    console.warn('⚠️ Prompt enhancement fallback used:', error.message);
    return createFallbackEnhancedPrompt(userPrompt, culturalPreferences);
  }
}

/**
 * Step 2: Professional Image Generation (Mock implementation for now)
 * TODO: Replace with actual Imagen 3 API when available
 */
async function performImageGeneration(originalImage, enhancedPrompt) {
  try {
    console.log('🖼️ Generating image with enhanced prompt:', enhancedPrompt.transformationPrompt.substring(0, 100) + '...');

    // TODO: Replace with actual Imagen 3 API call
    // For now, simulate processing and return metadata
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response - in production, this would be the actual generated image
    return {
      url: originalImage, // For now, return original image
      base64Data: null,
      metadata: {
        modelUsed: 'imagen-3-mock',
        generationTime: 2000,
        qualityScore: 0.85,
        culturalAuthenticityScore: enhancedPrompt.styleConfidence || 0.8,
        watermarked: true
      }
    };

  } catch (error) {
    console.warn('⚠️ Image generation fallback used:', error.message);
    
    // Fallback - return original image with lower quality scores
    return {
      url: originalImage,
      base64Data: null,
      metadata: {
        modelUsed: 'fallback',
        generationTime: 1000,
        qualityScore: 0.6,
        culturalAuthenticityScore: 0.6,
        watermarked: false
      }
    };
  }
}

/**
 * Get cultural design guidelines
 */
function getCulturalGuidelines(style) {
  const guidelines = {
    'Scandinavian': {
      elements: ['light woods', 'white walls', 'cozy textiles', 'hygge concept', 'natural light'],
      materials: ['birch', 'pine', 'wool', 'linen', 'natural stone'],
      colors: ['whites', 'light grays', 'natural wood tones', 'soft blues'],
      principles: ['simplicity', 'functionality', 'connection to nature']
    },
    'Mediterranean': {
      elements: ['terracotta', 'wrought iron', 'natural stone', 'coastal charm'],
      materials: ['ceramic tiles', 'stone', 'wood shutters', 'wrought iron'],
      colors: ['warm earth tones', 'sea blues', 'sunset oranges', 'olive greens'],
      principles: ['outdoor-indoor living', 'natural materials', 'relaxed elegance']
    },
    'Japanese': {
      elements: ['tatami mats', 'shoji screens', 'natural wood', 'zen elements'],
      materials: ['bamboo', 'natural wood', 'rice paper', 'natural fibers'],
      colors: ['natural wood tones', 'whites', 'earth tones', 'muted greens'],
      principles: ['minimalism', 'harmony', 'natural beauty']
    },
    'Modern': {
      elements: ['clean lines', 'geometric shapes', 'minimal decoration'],
      materials: ['steel', 'glass', 'concrete', 'leather'],
      colors: ['neutrals', 'bold accents', 'monochromatic schemes'],
      principles: ['form follows function', 'less is more']
    }
  };

  return guidelines[style] || null;
}

/**
 * Create fallback enhanced prompt
 */
function createFallbackEnhancedPrompt(userPrompt, culturalPreferences) {
  const style = culturalPreferences?.primaryStyle || 'contemporary';
  
  return {
    transformationPrompt: `Transform this interior space: ${userPrompt}. Apply ${style} design principles with professional interior photography, high-quality materials, realistic lighting, magazine-quality composition, detailed textures, and sophisticated color coordination.`,
    technicalRequirements: {
      aspectRatio: '16:9',
      lighting: 'natural',
      composition: 'full_room',
      quality: 'premium'
    },
    culturalNotes: style !== 'contemporary' ? [`${style} design elements`] : [],
    styleConfidence: 0.7,
    professionalEnhancements: ['professional photography', 'magazine quality', 'high resolution']
  };
}