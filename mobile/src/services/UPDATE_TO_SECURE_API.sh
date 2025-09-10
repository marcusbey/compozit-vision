#!/bin/bash
# Script to help identify files that need updating for secure API migration

echo "🔍 Files using EXPO_PUBLIC_GEMINI_API_KEY that need updating:"
echo "================================================"

# Find all files using the insecure API key
grep -r "EXPO_PUBLIC_GEMINI_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".sh" | cut -d: -f1 | sort | uniq

echo ""
echo "📝 Files importing GoogleGenerativeAI directly:"
echo "=============================================="

# Find all files importing GoogleGenerativeAI
grep -r "import.*GoogleGenerativeAI" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".md" | cut -d: -f1 | sort | uniq

echo ""
echo "✅ Next Steps:"
echo "============="
echo "1. Start the backend server: cd backend-vercel && npm run dev"
echo "2. Update services to use SecureGeminiService"
echo "3. Remove EXPO_PUBLIC_GEMINI_API_KEY from all files"
echo "4. Test that features still work with backend API"
echo ""
echo "📚 See MIGRATION_TO_SECURE_API.md for detailed instructions"