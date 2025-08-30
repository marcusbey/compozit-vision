# Gemini API Setup and Testing Guide

## Overview
This guide helps you set up and test Google Gemini API integration for AI-powered interior design processing.

## API Key Setup

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (format: `AIzaSy...`)

### 2. Set Environment Variables

**For Development (.env files):**
```bash
# In .env (root)
GEMINI_API_KEY=AIzaSy_your_actual_api_key_here

# In mobile/.env 
GEMINI_API_KEY=AIzaSy_your_actual_api_key_here
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy_your_actual_api_key_here
```

**For Testing (command line):**
```bash
export GEMINI_API_KEY="AIzaSy_your_actual_api_key_here"
```

## Supported Models

### Current Implementation
- **Analysis**: `gemini-1.5-flash` (Stable, fast, multimodal for room analysis)
- **Image Generation**: `gemini-2.5-flash-image-preview` (Latest image generation model)
- **Experimental**: `gemini-2.0-flash-exp` (Latest features)
- **Pro**: `gemini-1.5-pro` (Complex tasks, better reasoning)

### Model Capabilities
- **Text Generation**: Design recommendations, style analysis
- **Multimodal**: Image analysis + text prompts
- **JSON Output**: Structured design responses
- **Rate Limits**: 60 requests/minute (free tier)

## Testing the API

### Quick Test with Curl
```bash
# Set your API key
export GEMINI_API_KEY="AIzaSy_your_actual_api_key_here"

# Run the test script
bash test-gemini-curl.sh
```

### Expected Output
```
✅ SUCCESS - Text generation working
✅ SUCCESS - Multimodal working  
✅ SUCCESS - Interior design response received
✅ Valid JSON structure found
```

## API Response Format

### Interior Design JSON Structure
```json
{
  "roomLayout": {
    "suggestions": ["Open floor plan", "Define zones"],
    "optimizationTips": ["Add natural light", "Use mirrors"]
  },
  "furniture": [
    {
      "item": "Modern sofa",
      "dimensions": "84\" W x 36\" D x 32\" H",
      "placement": "Center of room facing TV",
      "reasoning": "Provides comfortable seating for 3-4 people",
      "estimatedCost": "$800-1200"
    }
  ],
  "colorScheme": {
    "primary": "#2c3e50",
    "secondary": "#ecf0f1", 
    "accent": "#3498db",
    "description": "Modern blue-gray palette"
  },
  "overallDesignConcept": "Contemporary minimalist approach",
  "confidenceScore": 0.92
}
```

## Integration in Mobile App

### Service Usage
```typescript
import { GeminiService } from '../services/geminiService';

const geminiService = new GeminiService(process.env.GEMINI_API_KEY!);

const result = await geminiService.analyzeRoom({
  imageData: base64Image,
  roomDimensions: { width: 12, height: 10, length: 15, roomType: 'living-room' },
  stylePreferences: { primaryStyle: 'modern', colors: ['blue', 'white'] }
});
```

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Error: `API_KEY_INVALID`
   - Solution: Verify API key format and regenerate if needed

2. **Permission Denied**
   - Error: `PERMISSION_DENIED`
   - Solution: Enable Generative AI API in Google Cloud Console

3. **Rate Limits**
   - Error: `RATE_LIMIT_EXCEEDED` 
   - Solution: Implement retry logic with exponential backoff

4. **Model Not Found**
   - Error: `models/gemini-2.5-flash not found`
   - Solution: Use stable model `gemini-1.5-flash`

### Debugging Steps

1. **Test API Key Directly:**
   ```bash
   curl -H 'Content-Type: application/json' \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
        -X POST \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"
   ```

2. **Check Rate Limits:**
   - Free tier: 15 requests/minute, 1,500 requests/day
   - Monitor usage in [Google AI Studio](https://makersuite.google.com/)

3. **Validate JSON Response:**
   - Use online JSON validators
   - Check for proper escaping of quotes
   - Ensure response matches expected schema

## Current Status

### What's Working ✅
- Text generation for design concepts
- Multimodal image analysis 
- JSON structured responses
- Rate limiting and error handling
- Fallback data for offline development

### Known Issues ❌
- Database dependency validation too strict
- References & Colors step not marked as completed
- Validation blocking AI processing unnecessarily

### Next Steps 🔄
1. Fix dependency validation for optional steps
2. Improve data validation for AI processing
3. Add better error messages for missing data
4. Implement retry logic for failed requests

## Documentation Links
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Model Information](https://ai.google.dev/gemini-api/docs/models/gemini) 
- [Multimodal Guide](https://ai.google.dev/gemini-api/docs/vision)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/quota)