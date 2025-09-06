# Setting Up Gemini API Key

The error you're seeing is because the Gemini API key is not configured in your environment. Here's how to fix it:

## Quick Setup

1. **Get your free API key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key

2. **Add to your .env file**
   ```bash
   # In your mobile/.env file (create if it doesn't exist)
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Restart Expo**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run ios
   ```

## Important Notes

- The app will still work without the API key - it will use fallback prompt optimization
- Gemini 2.0 Flash is very affordable at $0.10 per 1 million tokens
- The API key should start with "AIza..."
- Never commit your .env file to git (it should be in .gitignore)

## Troubleshooting

If you still see the error after adding the key:
1. Make sure there are no quotes around the API key in .env
2. Clear Expo cache: `npx expo start -c`
3. Check that .env is in the mobile directory, not the root

The app is designed to gracefully handle missing API keys by using fallback prompts, so you can continue testing even without the Gemini integration.