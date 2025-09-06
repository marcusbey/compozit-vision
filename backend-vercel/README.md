# Compozit Vision Backend (Vercel)

Simple backend API for secure Gemini AI integration with your mobile app.

## Quick Start (5 minutes!)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Install Dependencies
```bash
cd backend-vercel
npm install
```

### 3. Set Up Environment
```bash
# Copy the example env file
cp .env.example .env.local
# Your Gemini API key is already in there!
```

### 4. Test Locally
```bash
npm run dev
# Backend runs at http://localhost:3000
```

### 5. Deploy to Vercel (Free!)
```bash
vercel
# Follow the prompts:
# - Login/Create account
# - Choose project name
# - Deploy!
```

### 6. Add Environment Variable in Vercel
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add: `GEMINI_API_KEY` with your key

### 7. Update Your Mobile App
In your mobile app's `.env`:
```
EXPO_PUBLIC_API_BASE_URL=https://your-project.vercel.app/api
```

## That's It! 🎉

Your backend is now:
- ✅ Deployed globally
- ✅ Auto-scaling
- ✅ Secure (API key hidden)
- ✅ Free for your usage

## API Endpoints

- `POST /api/gemini/analyze-context` - Analyze user input
- `POST /api/gemini/optimize-prompt` - Optimize prompts
- `POST /api/gemini/refine-prompt` - Refine existing prompts

## Local Development

```bash
# Run locally
npm run dev

# Deploy to production
npm run deploy
```

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Free tier includes 100GB bandwidth/month
- Perfect for your mobile app!