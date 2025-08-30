#!/bin/bash

# Test Gemini API using curl commands
# This tests the latest Gemini 2.5 models

echo "🧪 Testing Gemini API with curl commands..."
echo "==========================================="

# Check if API key is set
if [[ -z "${GEMINI_API_KEY}" ]]; then
    echo "❌ Error: GEMINI_API_KEY environment variable not set"
    echo "💡 Set your API key: export GEMINI_API_KEY='your_api_key_here'"
    exit 1
fi

echo "✅ API Key found (${GEMINI_API_KEY:0:20}...)"
echo ""

# Test 1: Simple text generation with Gemini 2.0 Flash
echo "🔍 Test 1: Gemini 2.0 Flash (Latest Experimental)"
curl -s -H 'Content-Type: application/json' \
     -d '{
       "contents": [{
         "parts": [{"text": "Generate a brief modern interior design concept in exactly 30 words."}]
       }]
     }' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}" | \
     python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
    if 'candidates' in data and len(data['candidates']) > 0:
        print('✅ SUCCESS')
        print('📄 Response:', data['candidates'][0]['content']['parts'][0]['text'][:100] + '...')
    elif 'error' in data:
        print('❌ FAILED')
        print('🔍 Error:', data['error']['message'])
    else:
        print('❌ FAILED - Unexpected response format')
except Exception as e:
    print('❌ FAILED - JSON parsing error:', str(e))
"

echo ""

# Test 2: Gemini 1.5 Flash (Stable)
echo "🔍 Test 2: Gemini 1.5 Flash (Stable)"
curl -s -H 'Content-Type: application/json' \
     -d '{
       "contents": [{
         "parts": [{"text": "List 3 key principles of modern interior design."}]
       }]
     }' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}" | \
     python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
    if 'candidates' in data and len(data['candidates']) > 0:
        print('✅ SUCCESS')
        print('📄 Response:', data['candidates'][0]['content']['parts'][0]['text'])
    elif 'error' in data:
        print('❌ FAILED')
        print('🔍 Error:', data['error']['message'])
    else:
        print('❌ FAILED - Unexpected response format')
except Exception as e:
    print('❌ FAILED - JSON parsing error:', str(e))
"

echo ""

# Test 3: Multimodal with image (using a small test image)
echo "🔍 Test 3: Multimodal (Text + Image) with Gemini 1.5 Flash"

# Create a small test image in base64 (1x1 red pixel PNG)
TEST_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

curl -s -H 'Content-Type: application/json' \
     -d "{
       \"contents\": [{
         \"parts\": [
           {\"text\": \"Describe this image briefly:\"},
           {
             \"inline_data\": {
               \"mime_type\": \"image/png\",
               \"data\": \"${TEST_IMAGE}\"
             }
           }
         ]
       }]
     }" \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}" | \
     python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
    if 'candidates' in data and len(data['candidates']) > 0:
        print('✅ SUCCESS - Multimodal working')
        print('📄 Response:', data['candidates'][0]['content']['parts'][0]['text'])
    elif 'error' in data:
        print('❌ FAILED')
        print('🔍 Error:', data['error']['message'])
    else:
        print('❌ FAILED - Unexpected response format')
except Exception as e:
    print('❌ FAILED - JSON parsing error:', str(e))
"

echo ""

# Test 4: Interior Design Specific JSON Response
echo "🔍 Test 4: Interior Design JSON Response Format"
curl -s -H 'Content-Type: application/json' \
     -d '{
       "contents": [{
         "parts": [{
           "text": "You are an expert interior designer. Provide design recommendations for a modern living room in valid JSON format with these fields: roomLayout (with suggestions array), colorScheme (with primary, secondary, accent colors), furniture (array with item, placement, reasoning), and overallConcept. Keep response under 200 words total."
         }]
       }]
     }' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}" | \
     python3 -c "
import json, sys, re
try:
    data = json.loads(sys.stdin.read())
    if 'candidates' in data and len(data['candidates']) > 0:
        response_text = data['candidates'][0]['content']['parts'][0]['text']
        print('✅ SUCCESS - Interior design response received')
        print('📄 Sample:', response_text[:200] + '...')
        
        # Try to extract and validate JSON from response
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
                print('✅ Valid JSON structure found')
                print('📊 Keys:', list(parsed.keys()))
            except:
                print('⚠️  JSON-like structure found but not valid JSON')
        else:
            print('⚠️  No JSON structure found in response')
    elif 'error' in data:
        print('❌ FAILED')
        print('🔍 Error:', data['error']['message'])
    else:
        print('❌ FAILED - Unexpected response format')
except Exception as e:
    print('❌ FAILED - JSON parsing error:', str(e))
"

echo ""
echo "==========================================="
echo "🏁 Test Complete!"
echo ""
echo "📚 Gemini API Documentation:"
echo "- General API: https://ai.google.dev/gemini-api/docs"
echo "- Model Versions: https://ai.google.dev/gemini-api/docs/models/gemini"
echo "- Multimodal (Vision): https://ai.google.dev/gemini-api/docs/vision"
echo "- Rate Limits: https://ai.google.dev/gemini-api/docs/quota"
echo ""
echo "🔑 To run this test:"
echo "export GEMINI_API_KEY='your_api_key_here'"
echo "bash test-gemini-curl.sh"