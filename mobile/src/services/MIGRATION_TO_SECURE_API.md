# Migration Guide: Secure Gemini API

## Overview
We're migrating from client-side Gemini API calls (INSECURE) to backend-proxied API calls (SECURE).

## Why This Change?
- **Security**: API keys in `EXPO_PUBLIC_*` variables are exposed in the app bundle
- **Cost Control**: Backend can implement rate limiting and usage tracking
- **Flexibility**: Easy to switch AI providers or add caching

## Quick Migration Steps

### 1. Replace Service Imports

```typescript
// OLD (INSECURE)
import { GeminiVisionService } from './geminiVisionService';
const gemini = GeminiVisionService.getInstance();

// NEW (SECURE)
import { SecureGeminiService } from './secureGeminiService';
const gemini = SecureGeminiService.getInstance();
```

### 2. Update Method Calls

Most methods have the same signature, but some are simplified:

```typescript
// Context Analysis (Same signature)
const result = await gemini.analyzeContext(userInput);

// Prompt Optimization (Same signature)
const optimized = await gemini.optimizePrompt({
  userInput,
  context,
  selectedFeatures,
  additionalPreferences
});

// Image Analysis (TODO: Needs backend endpoint)
const analysis = await gemini.analyzeImage(imageUri);
```

### 3. Remove Direct Gemini Imports

Remove these imports from your files:
```typescript
// REMOVE THESE:
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
```

### 4. Update Environment Variables

In `.env`:
```bash
# REMOVE THIS LINE:
EXPO_PUBLIC_GEMINI_API_KEY=... ❌

# KEEP THIS:
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api ✅
```

## Files That Need Updates

### High Priority (Core Services):
- [ ] `geminiVisionService.ts` - Main vision service
- [ ] `enhancedGeminiVisionService.ts` - Enhanced version
- [ ] `geminiImageGenerationService.ts` - Image generation
- [ ] `aiTestingService.ts` - AI testing utilities

### Scripts (Can wait):
- [ ] Scripts in `/scripts/` folder
- [ ] Test files using Gemini directly

## Backend Endpoints Available

Currently implemented:
- `POST /api/gemini/analyze-context` - Context analysis ✅
- `POST /api/gemini/optimize-prompt` - Prompt optimization ✅
- `POST /api/gemini/refine-prompt` - Prompt refinement ✅

Need to implement:
- `POST /api/gemini/analyze-image` - Image vision analysis 🚧
- `POST /api/gemini/generate-image` - Image generation 🚧

## Fallback Behavior

The secure service includes fallbacks:
1. If backend is down → Uses keyword-based analysis
2. If API fails → Returns sensible defaults
3. User experience remains smooth

## Testing

1. Start backend server:
   ```bash
   cd backend-vercel
   npm run dev
   ```

2. Update your app to use `SecureGeminiService`

3. Test that features still work

## Need Help?

- Backend issues: Check `backend-vercel/README.md`
- Migration questions: Update this guide with answers!