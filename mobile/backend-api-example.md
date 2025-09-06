# Backend API Implementation Guide

This guide shows how to implement the secure backend API endpoints for Gemini integration.

## Overview

Instead of exposing your Gemini API key in the client code, the app now uses a secure backend API. The API key should be stored on your server only.

## Required Endpoints

### 1. Context Analysis
```javascript
// POST /api/gemini/analyze-context
app.post('/api/gemini/analyze-context', async (req, res) => {
  const { userInput } = req.body;
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Analyze this user input and return ONLY the context type...
    User input: "${userInput}"`;
    
    const result = await model.generateContent(prompt);
    const context = result.response.text().trim().toLowerCase();
    
    res.json({ 
      success: true, 
      data: { context } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### 2. Prompt Optimization
```javascript
// POST /api/gemini/optimize-prompt
app.post('/api/gemini/optimize-prompt', async (req, res) => {
  const { userInput, context, selectedFeatures, additionalPreferences } = req.body;
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = buildOptimizationPrompt({
      userInput,
      context,
      selectedFeatures,
      additionalPreferences
    });
    
    const result = await model.generateContent(prompt);
    const optimizedPrompt = parseOptimizedResponse(result.response.text());
    
    res.json({ 
      success: true, 
      data: optimizedPrompt 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### 3. Prompt Refinement
```javascript
// POST /api/gemini/refine-prompt
app.post('/api/gemini/refine-prompt', async (req, res) => {
  const { basePrompt, refinements, iterationType } = req.body;
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = buildRefinementPrompt({
      basePrompt,
      refinements,
      iterationType
    });
    
    const result = await model.generateContent(prompt);
    const refinedPrompt = parseRefinedResponse(result.response.text());
    
    res.json({ 
      success: true, 
      data: refinedPrompt 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

## Environment Variables

On your backend server, set:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Security Benefits

1. **API Key Protection**: Your Gemini API key is never exposed to the client
2. **Usage Control**: You can implement rate limiting, authentication, and usage tracking
3. **Cost Management**: Monitor and control API usage from your backend
4. **Flexibility**: Switch providers or add caching without updating the app

## Local Development

For local development, you can run a simple Express server:

```javascript
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Your endpoints here...

app.listen(3000, () => {
  console.log('Backend API running on http://localhost:3000');
});
```

## Next Steps

1. Deploy your backend API (Vercel, Railway, Heroku, etc.)
2. Update `EXPO_PUBLIC_API_BASE_URL` in your .env file
3. The app will automatically use your secure backend for all Gemini operations

## Fallback Behavior

The app is designed to gracefully handle API failures:
- If the backend is unavailable, it falls back to keyword-based analysis
- If Gemini fails, it uses pre-built prompt templates
- The user experience remains smooth even without AI features