#!/bin/bash

echo "🧪 Compozit Vision Mobile - Quick Test Check"
echo "=============================================="

# Change to mobile directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo "📦 Checking Node.js and npm..."

# Check if Node.js is available
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check if npm is available
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check if Jest is installed
if [ -f "node_modules/.bin/jest" ]; then
    echo "✅ Jest is installed"
    echo "📋 Jest version: $(./node_modules/.bin/jest --version)"
else
    echo "❌ Jest not found in node_modules"
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔍 Test File Analysis:"
echo "----------------------"

# Count test files
test_count=$(find src -name "*.test.tsx" -o -name "*.test.ts" | wc -l)
echo "📁 Found $test_count test files"

# List test files
echo "📋 Test files:"
find src -name "*.test.tsx" -o -name "*.test.ts" | sed 's/^/  - /'

echo ""
echo "🏃 Attempting to run tests..."
echo "=============================="

# Try to run Jest with minimal configuration
if npm test 2>&1; then
    echo "✅ Tests completed successfully!"
else
    echo "❌ Tests failed. Check the output above for details."
    echo ""
    echo "💡 Common issues to check:"
    echo "  - Missing dependencies in package.json"
    echo "  - Import errors in test files"
    echo "  - Missing mock implementations"
    echo "  - TypeScript compilation errors"
fi

echo ""
echo "🏁 Test check completed"