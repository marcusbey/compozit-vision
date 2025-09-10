#!/bin/bash

# Security Cleanup Script
# This script helps clean up security issues before committing

echo "🔒 Security Cleanup Script"
echo "========================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "📋 Checking for tracked .env files..."

# Find all tracked .env files
tracked_env_files=$(git ls-files | grep -E "\.env$" | grep -v ".env.example")

if [ -n "$tracked_env_files" ]; then
    echo "⚠️  WARNING: Found tracked .env files:"
    echo "$tracked_env_files"
    echo ""
    echo "To remove these from git tracking (but keep local files):"
    echo "$tracked_env_files" | while read file; do
        echo "git rm --cached $file"
    done
    echo ""
else
    echo "✅ No tracked .env files found"
fi

# Check for sensitive patterns in staged files
echo ""
echo "🔍 Checking for sensitive patterns in staged files..."

# Patterns to check
patterns=(
    "AIzaSy[a-zA-Z0-9_-]{33}"  # Google API keys
    "sk_test_[a-zA-Z0-9]{24}"   # Stripe test keys
    "sk_live_[a-zA-Z0-9]{24}"   # Stripe live keys
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"  # JWT tokens
    "sbp_[a-zA-Z0-9]{40}"       # Supabase tokens
    "postgresql://[^\"' ]+"     # Database URLs
    "password.*=.*[\"'][^\"']+[\"']"  # Password assignments
)

issues_found=0

for pattern in "${patterns[@]}"; do
    # Check staged files
    matches=$(git diff --cached --name-only | xargs -I {} sh -c "grep -l -E '$pattern' {} 2>/dev/null || true")
    if [ -n "$matches" ]; then
        echo "❌ Found sensitive pattern in staged files:"
        echo "   Pattern: $pattern"
        echo "   Files: $matches"
        ((issues_found++))
    fi
done

if [ $issues_found -eq 0 ]; then
    echo "✅ No sensitive patterns found in staged files"
fi

# Check for large files
echo ""
echo "📦 Checking for large files..."

large_files=$(find . -type f -size +5M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null)

if [ -n "$large_files" ]; then
    echo "⚠️  Found large files (>5MB):"
    echo "$large_files"
else
    echo "✅ No large files found"
fi

# Summary
echo ""
echo "📊 Security Check Summary"
echo "========================"

if [ $issues_found -eq 0 ] && [ -z "$tracked_env_files" ] && [ -z "$large_files" ]; then
    echo "✅ All security checks passed! Safe to commit."
else
    echo "❌ Security issues found. Please fix before committing."
    exit 1
fi

echo ""
echo "💡 Additional recommendations:"
echo "   - Use .env.local for local development (gitignored)"
echo "   - Store production secrets in Vercel/hosting platform"
echo "   - Rotate any exposed API keys immediately"
echo "   - Run 'git log --oneline -- .env' to check if .env was ever committed"