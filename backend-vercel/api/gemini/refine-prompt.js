import { GoogleGenerativeAI } from '@google/generative-ai';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { basePrompt, refinements, iterationType } = req.body;

    if (!basePrompt || !refinements || !iterationType) {
      return res.status(400).json({ error: 'Base prompt, refinements, and iteration type are required' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build refinement prompt
    const prompt = `You are refining an existing image generation prompt for iterative improvements.

CURRENT PROMPT: "${basePrompt.optimizedPrompt}"
REFINEMENT TYPE: ${iterationType}
REQUESTED CHANGES:
${Object.entries(refinements).map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n')}

Modify the prompt to incorporate these changes while:
1. Preserving the core design concept
2. Seamlessly integrating new elements
3. Maintaining professional quality
4. Ensuring changes work harmoniously

FORMAT YOUR RESPONSE AS:
REFINED_PROMPT: [Your refined prompt here]
KEY_CHANGES: [Brief list of what changed]
CONFIDENCE: [0.0-1.0]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response
    const lines = response.split('\n');
    let refinedPrompt = '';
    let keyChanges = '';
    let confidence = 0.85;

    lines.forEach(line => {
      if (line.startsWith('REFINED_PROMPT:')) {
        refinedPrompt = line.replace('REFINED_PROMPT:', '').trim();
      } else if (line.startsWith('KEY_CHANGES:')) {
        keyChanges = line.replace('KEY_CHANGES:', '').trim();
      } else if (line.startsWith('CONFIDENCE:')) {
        confidence = parseFloat(line.replace('CONFIDENCE:', '').trim()) || 0.85;
      }
    });

    const refinedData = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: basePrompt.originalInput,
      optimizedPrompt: refinedPrompt || basePrompt.optimizedPrompt,
      context: basePrompt.context,
      features: basePrompt.features,
      promptType: 'refinement',
      technicalParameters: {
        ...basePrompt.technicalParameters,
        refinementType: iterationType
      },
      metadata: {
        confidence,
        processingTime: Date.now(),
        promptLength: refinedPrompt.length,
        createdAt: new Date().toISOString(),
        keyChanges,
        parentPromptId: basePrompt.id
      }
    };

    return res
      .status(200)
      .setHeaders(corsHeaders)
      .json({
        success: true,
        data: refinedData
      });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    return res
      .status(500)
      .setHeaders(corsHeaders)
      .json({
        success: false,
        error: error.message || 'Failed to refine prompt'
      });
  }
}