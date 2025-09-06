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
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze this user input and determine what type of design project they're describing.

User input: "${userInput}"

Categories:
- Interior: indoor spaces, rooms, furniture, decor
- Garden: outdoor plants, landscaping, gardens
- Exterior: building facades, outdoor structures
- Mixed: combination of above
- Unknown: unclear or unrelated

Return only one word: interior, garden, exterior, mixed, or unknown.`;

    const result = await model.generateContent(prompt);
    const context = result.response.text().trim().toLowerCase();

    // Set CORS headers and return response
    return res
      .status(200)
      .setHeaders(corsHeaders)
      .json({
        success: true,
        data: {
          context,
          primaryContext: context,
          confidence: 0.95
        }
      });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    return res
      .status(500)
      .setHeaders(corsHeaders)
      .json({
        success: false,
        error: error.message || 'Failed to analyze context'
      });
  }
}