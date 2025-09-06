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
    const { userInput, context, selectedFeatures, additionalPreferences } = req.body;

    if (!userInput || !context) {
      return res.status(400).json({ error: 'User input and context are required' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build optimization prompt
    const prompt = `You are an expert prompt engineer for AI image generation. Transform the user's design request into a detailed, optimized prompt.

USER INPUT: "${userInput}"
PROJECT TYPE: ${context}
SELECTED FEATURES: ${selectedFeatures?.join(', ') || 'none'}
${additionalPreferences ? `PREFERENCES: ${JSON.stringify(additionalPreferences)}` : ''}

Create a detailed image generation prompt that includes:
1. Specific architectural/design features
2. Visual style and aesthetics
3. Materials and textures
4. Color palette
5. Lighting and atmosphere
6. Technical quality details

FORMAT YOUR RESPONSE AS:
OPTIMIZED_PROMPT: [Your detailed prompt here - 150-300 words]
ASPECT_RATIO: [16:9, 4:3, 1:1, or 3:4]
STYLE: [Contemporary, Traditional, Modern, etc.]
LIGHTING: [Natural, Dramatic, Soft, etc.]
CONFIDENCE: [0.0-1.0]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the response
    const lines = response.split('\n');
    let optimizedPrompt = '';
    let aspectRatio = '16:9';
    let style = 'Contemporary';
    let lighting = 'Natural';
    let confidence = 0.85;

    lines.forEach(line => {
      if (line.startsWith('OPTIMIZED_PROMPT:')) {
        optimizedPrompt = line.replace('OPTIMIZED_PROMPT:', '').trim();
      } else if (line.startsWith('ASPECT_RATIO:')) {
        aspectRatio = line.replace('ASPECT_RATIO:', '').trim();
      } else if (line.startsWith('STYLE:')) {
        style = line.replace('STYLE:', '').trim();
      } else if (line.startsWith('LIGHTING:')) {
        lighting = line.replace('LIGHTING:', '').trim();
      } else if (line.startsWith('CONFIDENCE:')) {
        confidence = parseFloat(line.replace('CONFIDENCE:', '').trim()) || 0.85;
      }
    });

    const optimizedData = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalInput: userInput,
      optimizedPrompt: optimizedPrompt || userInput,
      context,
      features: selectedFeatures || [],
      promptType: 'initial',
      technicalParameters: {
        aspectRatio,
        style,
        quality: 'high',
        lighting
      },
      metadata: {
        confidence,
        processingTime: Date.now(),
        promptLength: optimizedPrompt.length,
        createdAt: new Date().toISOString()
      }
    };

    return res
      .status(200)
      .setHeaders(corsHeaders)
      .json({
        success: true,
        data: optimizedData
      });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    return res
      .status(500)
      .setHeaders(corsHeaders)
      .json({
        success: false,
        error: error.message || 'Failed to optimize prompt'
      });
  }
}