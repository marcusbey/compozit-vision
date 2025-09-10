/**
 * Step 1: Enhanced Prompt Generation
 * Converts structured user interaction data (JSON) into detailed design prompt
 * NO IMAGE PROCESSING - Text only
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
    const { userInteractionData } = req.body;

    // Validate required input
    if (!userInteractionData || !userInteractionData.userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userInteractionData with userPrompt'
      });
    }

    console.log('🧠 Step 1: Converting user interaction data to enhanced prompt:', {
      userId: userInteractionData.userId,
      sessionId: userInteractionData.sessionId,
      promptLength: userInteractionData.userPrompt.length,
      hasLocationClicks: !!userInteractionData.locationClicks?.length,
      hasReferenceImages: !!userInteractionData.referenceImages?.length,
      features: Object.keys(userInteractionData.selectedFeatures || {})
    });

    // Step 1: Convert JSON to enhanced prompt using Gemini 2.5 Flash (TEXT ONLY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const systemPrompt = buildPromptEnhancementRequest(userInteractionData);
    
    console.log('📝 Sending user data to AI for prompt enhancement...');
    const result = await model.generateContent(systemPrompt);
    const enhancedPrompt = result.response.text().trim();

    // Clean up the response to ensure it's just the prompt text
    const cleanedPrompt = cleanPromptResponse(enhancedPrompt);

    console.log('✅ Step 1 completed - Enhanced prompt generated:', {
      originalLength: userInteractionData.userPrompt.length,
      enhancedLength: cleanedPrompt.length,
      processingTime: Date.now() - startTime
    });

    return res.status(200).json({
      success: true,
      data: {
        enhancedPrompt: cleanedPrompt,
        originalData: userInteractionData,
        processingTime: Date.now() - startTime,
        metadata: {
          step: 1,
          model: 'gemini-2.0-flash-exp',
          promptEnhancementApplied: true
        }
      }
    });

  } catch (error) {
    console.error('❌ Step 1 enhanced prompt generation failed:', error);
    
    // Fallback: Create basic enhanced prompt
    const fallbackPrompt = createFallbackEnhancedPrompt(req.body.userInteractionData);
    
    return res.status(200).json({
      success: true,
      data: {
        enhancedPrompt: fallbackPrompt,
        originalData: req.body.userInteractionData,
        processingTime: Date.now() - startTime,
        fallbackUsed: true,
        metadata: {
          step: 1,
          model: 'fallback',
          error: error.message
        }
      }
    });
  }
}

/**
 * Build comprehensive prompt enhancement request
 */
function buildPromptEnhancementRequest(userInteractionData) {
  const {
    userPrompt,
    locationClicks,
    referenceImages,
    selectedFeatures,
    projectContext
  } = userInteractionData;

  return `You are an expert interior design prompt engineer. Convert this structured user input into a detailed, professional interior design transformation prompt.

USER TEXT REQUEST: "${userPrompt}"

INTERACTION DATA:
${locationClicks && locationClicks.length > 0 ? `
LOCATION CLICKS: User clicked on specific areas:
${locationClicks.map(click => `- Position (${click.x}, ${click.y}): ${click.description || 'focus area'}`).join('\n')}
` : 'LOCATION CLICKS: None - general room transformation'}

${referenceImages && referenceImages.length > 0 ? `
REFERENCE IMAGES: User provided style references:
${referenceImages.map(ref => `- ${ref.type}: ${ref.description}`).join('\n')}
` : 'REFERENCE IMAGES: None provided'}

SELECTED FEATURES:
${selectedFeatures.colorPalette ? `- Color Palette: ${selectedFeatures.colorPalette.join(', ')}` : ''}
${selectedFeatures.priceRange ? `- Budget: $${selectedFeatures.priceRange.min}-${selectedFeatures.priceRange.max} ${selectedFeatures.priceRange.currency}` : ''}
${selectedFeatures.materials ? `- Preferred Materials: ${selectedFeatures.materials.join(', ')}` : ''}
${selectedFeatures.lighting ? `- Lighting Style: ${selectedFeatures.lighting}` : ''}
${selectedFeatures.roomType ? `- Room Type: ${selectedFeatures.roomType}` : ''}
${selectedFeatures.style ? `- Design Style: ${selectedFeatures.style.join(', ')}` : ''}

${projectContext ? `
PROJECT CONTEXT:
${projectContext.clientName ? `- Client: ${projectContext.clientName}` : ''}
${projectContext.timeline ? `- Timeline: ${projectContext.timeline}` : ''}
${projectContext.constraints ? `- Constraints: ${projectContext.constraints.join(', ')}` : ''}
` : 'PROJECT CONTEXT: Personal project'}

TASK: Create a comprehensive interior design transformation prompt that includes:

1. **Primary Transformation**: Based on user text "${userPrompt}"
2. **Location-Specific Changes**: ${locationClicks?.length > 0 ? 'Address the clicked areas specifically' : 'Apply changes to the overall space'}
3. **Style Integration**: ${referenceImages?.length > 0 ? 'Incorporate elements from reference images' : 'Use specified style preferences'}
4. **Feature Implementation**: 
   - Colors: ${selectedFeatures.colorPalette?.join(', ') || 'harmonious palette'}
   - Materials: ${selectedFeatures.materials?.join(', ') || 'quality materials'}
   - Lighting: ${selectedFeatures.lighting || 'appropriate lighting'}
5. **Budget Considerations**: ${selectedFeatures.priceRange ? `Solutions within $${selectedFeatures.priceRange.min}-${selectedFeatures.priceRange.max} range` : 'Cost-effective solutions'}

OUTPUT REQUIREMENTS:
- Return ONLY the enhanced prompt text (no JSON, no headers, no explanations)
- Make it detailed and actionable (150-250 words)
- Focus on specific, visual changes that can be implemented
- Use professional interior design terminology
- Include specific materials, colors, and lighting details
- Mention furniture placement and spatial arrangements

EXAMPLE OUTPUT FORMAT:
"Transform this living room into a modern Scandinavian space focusing on the seating area. Replace the current sofa with a light oak frame sectional with cream linen upholstery. Apply charcoal accent wall and warm gold lighting fixtures. Incorporate natural materials like light wood flooring and wool textiles. Add ambient lighting with pendant lights and table lamps. Update window treatments with white linen curtains. Use budget-conscious IKEA-style furniture mixed with statement pieces. Include specific material textures: oak wood grain, linen fabric weave, brushed brass fixtures."`;
}

/**
 * Clean AI response to extract only the prompt text
 */
function cleanPromptResponse(response) {
  // Remove any JSON formatting, headers, or explanations
  let cleaned = response
    .replace(/^```[\s\S]*?\n/, '') // Remove opening code blocks
    .replace(/\n```$/, '') // Remove closing code blocks
    .replace(/^OUTPUT:\s*/i, '') // Remove "OUTPUT:" prefix
    .replace(/^ENHANCED PROMPT:\s*/i, '') // Remove "ENHANCED PROMPT:" prefix
    .replace(/^"(.*)"$/s, '$1') // Remove wrapping quotes
    .trim();

  // If it's still formatted strangely, extract the main content
  if (cleaned.includes('EXAMPLE OUTPUT FORMAT:')) {
    const parts = cleaned.split('EXAMPLE OUTPUT FORMAT:');
    if (parts[0].trim()) {
      cleaned = parts[0].trim();
    }
  }

  return cleaned;
}

/**
 * Create fallback enhanced prompt when AI fails
 */
function createFallbackEnhancedPrompt(userInteractionData) {
  if (!userInteractionData) {
    return 'Transform this interior space with modern design elements, improved lighting, and professional finishes.';
  }

  const {
    userPrompt = 'improve the space',
    selectedFeatures = {},
    locationClicks = [],
    referenceImages = []
  } = userInteractionData;

  const parts = [
    `Transform this space: ${userPrompt}.`,
    
    locationClicks.length > 0 ? 
      `Focus on the areas where user clicked (${locationClicks.length} specific locations).` : '',
    
    selectedFeatures.colorPalette ? 
      `Use color palette: ${selectedFeatures.colorPalette.join(', ')}.` : '',
    
    selectedFeatures.materials ? 
      `Incorporate materials: ${selectedFeatures.materials.join(', ')}.` : '',
    
    selectedFeatures.lighting ? 
      `Apply ${selectedFeatures.lighting} lighting design.` : 'Improve lighting design.',
    
    selectedFeatures.style ? 
      `Design in ${selectedFeatures.style.join(' and ')} style.` : '',
    
    referenceImages.length > 0 ? 
      `Draw inspiration from provided reference images.` : '',
    
    selectedFeatures.priceRange ? 
      `Keep within budget of $${selectedFeatures.priceRange.min}-${selectedFeatures.priceRange.max}.` : '',
    
    'Use professional interior design principles with realistic materials, proper proportions, and magazine-quality finishes.'
  ];

  return parts.filter(Boolean).join(' ');
}