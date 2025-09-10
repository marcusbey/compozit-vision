# How to Get a New Gemini API Key

## Step 1: Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

## Step 2: Sign in with Google Account
- Use your Google account to sign in
- Accept terms and conditions if prompted

## Step 3: Create API Key
1. Click "Create API key" button
2. Select a Google Cloud project (or create new one)
3. Copy the generated API key (starts with `AIzaSy...`)

## Step 4: Update Environment File
Replace the current key in `.env` file:
```bash
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

## Step 5: Test the Key
Run this command to test:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Hello, test message"
          }
        ]
      }
    ]
  }' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_NEW_API_KEY"
```

## Step 6: Generate Images
Once you have a working API key, run:
```bash
node src/scripts/generateComprehensiveMasonryImages.js phase1
```

## Current Status
❌ Previous API key has been removed for security
✅ High-quality placeholders (176 images) are working as fallback
✅ All styles from your selection screen are covered
⚠️ Set your new API key in `.env` file: `GEMINI_API_KEY=your_new_key_here`

## Alternative: Continue with Placeholders
The current placeholders are high-quality and style-appropriate. You can:
1. Use them for now to test the gallery functionality
2. Replace with real AI images later when you get a new API key

The placeholders include all the styles from your selection screen:
- Modern, Tropical, Minimalistic, Bohemian, Rustic, Vintage, Baroque, Mediterranean
- Plus 36 additional regional and cultural styles
- Total: 176 categorized interior design images