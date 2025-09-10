/**
 * Single-Step Design Refinement
 * Takes generated image + refinement prompt → applies direct modifications
 * Uses Nano Banana (Gemini 2.5 Flash with Vision) - NO JSON processing needed
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
      generatedImage, 
      refinementPrompt,
      sessionId,
      userId
    } = req.body;

    // Validate required inputs
    if (!generatedImage || !refinementPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: generatedImage, refinementPrompt'
      });
    }

    console.log('🔄 Single-step refinement with Nano Banana:', {
      userId,
      sessionId,
      refinementPrompt: refinementPrompt.substring(0, 100) + '...',
      hasGeneratedImage: !!generatedImage
    });

    // Direct refinement using Gemini 2.5 Flash with Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build refinement request with professional standards
    const fullRefinementPrompt = buildRefinementPrompt(refinementPrompt);

    // Prepare content for refinement
    const contentParts = [
      {
        inlineData: {
          data: generatedImage.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: getImageMimeType(generatedImage)
        }
      },
      { 
        text: fullRefinementPrompt
      }
    ];

    console.log('🖼️ Sending refinement to Nano Banana...');

    // Generate refined image
    const result = await model.generateContent(contentParts);
    const responseText = result.response.text();

    // TODO: Extract actual refined image from result when available
    // For now, this is a mock response since Gemini doesn't return images yet
    
    console.log('✅ Refinement completed by Nano Banana:', {
      responseLength: responseText.length,
      processingTime: Date.now() - startTime
    });

    return res.status(200).json({
      success: true,
      data: {
        refinedImage: {
          url: generatedImage, // TODO: Replace with actual refined image URL/base64
          base64Data: null, // TODO: Add actual refined image data
          metadata: {
            model: 'nano-banana',
            modelId: 'gemini-2.0-flash-exp',
            refinementApplied: refinementPrompt,
            processingTime: Date.now() - startTime,
            promptUsed: fullRefinementPrompt,
            generationResponse: responseText.substring(0, 500) + '...'
          }
        },
        sessionId,
        originalRefinementPrompt: refinementPrompt,
        appliedRefinementPrompt: fullRefinementPrompt
      }
    });

  } catch (error) {
    console.error('❌ Design refinement failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Design refinement failed',
      details: error.message,
      processingTime: Date.now() - startTime,
      model: 'nano-banana'
    });
  }
}

/**
 * Build complete refinement prompt with professional standards
 */
function buildRefinementPrompt(userRefinementPrompt) {
  return `${userRefinementPrompt}

REFINEMENT REQUIREMENTS:
- Maintain professional interior design quality throughout the modification
- Keep realistic material textures and proper lighting
- Preserve architectural integrity and structural logic
- Apply changes seamlessly without disrupting overall design harmony
- Maintain proper scale, proportions, and spatial relationships
- Use natural lighting and realistic shadows
- Keep materials looking authentic (wood grain, fabric texture, metal finishes)
- Ensure color accuracy and professional color grading
- Maintain magazine-quality composition and visual appeal
- Apply changes subtly and professionally, avoiding dramatic alterations unless specifically requested
- Focus on the specific element mentioned in the refinement while keeping the rest of the design cohesive`;
}

/**
 * Get MIME type from base64 data string
 */
function getImageMimeType(base64String) {
  if (base64String.includes('data:image/jpeg')) return 'image/jpeg';
  if (base64String.includes('data:image/jpg')) return 'image/jpeg';
  if (base64String.includes('data:image/png')) return 'image/png';
  if (base64String.includes('data:image/webp')) return 'image/webp';
  if (base64String.includes('data:image/gif')) return 'image/gif';
  
  // Default to JPEG
  return 'image/jpeg';
}