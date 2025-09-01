# 🔒 Secure AI Implementation Guide

## ⚠️ Security Issue Fixed

**CRITICAL**: Never use `EXPO_PUBLIC_*` for API keys - they're exposed to clients!

## Why Not Use Gemini for Image Generation?

**Gemini Vision can only ANALYZE images, not GENERATE them.**

Your current setup:
- ✅ **Gemini Vision**: Analyzes photos (perfect - keep using this)
- ❌ **Missing**: Image generation service (this was the mock problem)

## Recommended Architecture: Server-Side Generation

### Option A: Your Backend + Any AI Service (RECOMMENDED)

```
Mobile App → Your Backend API → AI Service (DALL-E/Midjourney/etc.)
```

**Benefits**:
- 🔒 API keys stay secure on your server
- 💰 Better cost control and rate limiting  
- 🎯 Custom image processing and storage
- 📊 Usage analytics and user management

### Your Backend API Endpoints:

```typescript
// POST /api/generate-design
{
  "prompt": "Transform this living room...",
  "originalImageUrl": "https://...",
  "style": "Scandinavian Modern", 
  "qualityLevel": "premium",
  "userId": "user123"
}

// Response
{
  "success": true,
  "imageUrl": "https://your-cdn.com/generated/design123.jpg",
  "jobId": "job_abc123",
  "generationTime": 3500,
  "provider": "dall-e-3"
}
```

## Backend Implementation Options

### Option 1: Node.js + Express
```javascript
const express = require('express');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY // Server-side only!
});

app.post('/api/generate-design', async (req, res) => {
  try {
    const { prompt, qualityLevel } = req.body;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: qualityLevel === 'premium' ? "1792x1024" : "1024x1024",
      quality: qualityLevel === 'premium' ? 'hd' : 'standard'
    });
    
    res.json({
      success: true,
      imageUrl: response.data[0].url,
      provider: 'dall-e-3'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Option 2: Python + FastAPI
```python
from fastapi import FastAPI
from openai import OpenAI
import os

app = FastAPI()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@app.post("/api/generate-design")
async def generate_design(request: DesignRequest):
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        return {
            "success": True,
            "imageUrl": response.data[0].url,
            "provider": "dall-e-3"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### Option 3: Serverless Functions

**Vercel Function** (`api/generate-design.js`):
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, qualityLevel } = req.body;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: qualityLevel === 'premium' ? "1792x1024" : "1024x1024"
    });

    res.json({
      success: true,
      imageUrl: response.data[0].url,
      provider: 'dall-e-3'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

## Environment Variables (Server-Side Only)

```env
# Your backend .env file (NEVER in mobile app)
OPENAI_API_KEY=sk-your-actual-key-here
STABILITY_API_KEY=sk-your-stability-key  
REPLICATE_API_TOKEN=r8_your-replicate-token

# Mobile app .env (safe to expose)
EXPO_PUBLIC_API_BASE_URL=https://your-backend.com/api
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key-for-vision
```

## Mobile App Configuration

Update your mobile app to use the server:

```typescript
// .env file in mobile
EXPO_PUBLIC_API_BASE_URL=https://your-backend.com/api
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key # Only for vision analysis
```

## Alternative: Managed AI Services

If you don't want to build a backend:

### Option 1: Replicate with Webhooks
- Generate images via Replicate API
- Use webhooks to get results
- Still requires a small backend/serverless function

### Option 2: RunPod Serverless
- Deploy AI models serverlessly
- Pay per inference
- Good for custom models

### Option 3: Modal or Banana
- Serverless ML platforms
- Handle scaling automatically

## Current Status

✅ **Fixed Security Issue**: Removed client-side API keys  
✅ **Created Server Service**: `serverImageGenerationService.ts`  
✅ **Updated Main Service**: Now calls backend instead of direct APIs  
❌ **Need Backend**: You need to create the backend API endpoint  

## Next Steps

1. **Choose your backend approach** (Node.js/Python/Serverless)
2. **Create the `/api/generate-design` endpoint** 
3. **Add your chosen AI service** (DALL-E, Stability, etc.)
4. **Deploy your backend**
5. **Update mobile app config** with your backend URL
6. **Test the flow**

## Why This Approach?

✅ **Secure**: API keys never exposed to clients  
✅ **Scalable**: Control rate limits and costs  
✅ **Flexible**: Switch AI providers without app updates  
✅ **Analytics**: Track usage and optimize  
✅ **Storage**: Save and manage generated images  
✅ **Auth**: Control who can generate images  

---
**Bottom Line**: Keep Gemini for image analysis, add a secure backend for image generation.