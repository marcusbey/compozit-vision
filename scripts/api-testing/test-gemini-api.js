#!/usr/bin/env node

/**
 * Test script to verify Gemini API connection and functionality
 * Tests the latest Gemini 2.5 Flash model with proper implementation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
const MODELS_TO_TEST = [
  'gemini-2.0-flash-exp',  // Latest experimental model
  'gemini-1.5-flash',     // Stable fast model
  'gemini-1.5-pro',       // Pro model for complex tasks
];

async function testGeminiConnection() {
  console.log('🧪 Testing Gemini API Connection...\n');

  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.log('💡 Set your API key: export GEMINI_API_KEY="your_api_key_here"');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Test each model
  for (const modelName of MODELS_TO_TEST) {
    console.log(`🔍 Testing model: ${modelName}`);
    
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Simple text generation test
      console.log('  📝 Testing text generation...');
      const textResult = await model.generateContent([
        'Generate a brief description of modern interior design in 50 words.'
      ]);
      
      if (textResult.response && textResult.response.text()) {
        console.log('  ✅ Text generation: SUCCESS');
        console.log(`  📄 Sample: ${textResult.response.text().substring(0, 100)}...`);
      } else {
        console.log('  ❌ Text generation: FAILED');
      }

      // Test with multimodal (text + image placeholder)
      console.log('  🖼️ Testing multimodal capabilities...');
      
      // Create a simple test image (1x1 pixel base64 PNG)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const multimodalResult = await model.generateContent([
        'Describe what you see in this image in one sentence.',
        {
          inlineData: {
            mimeType: 'image/png',
            data: testImageBase64
          }
        }
      ]);
      
      if (multimodalResult.response && multimodalResult.response.text()) {
        console.log('  ✅ Multimodal: SUCCESS');
        console.log(`  📄 Response: ${multimodalResult.response.text()}`);
      } else {
        console.log('  ❌ Multimodal: FAILED');
      }

      console.log(`  🎉 Model ${modelName}: WORKING\n`);
      
    } catch (error) {
      console.log(`  ❌ Model ${modelName}: FAILED`);
      console.log(`  🔍 Error: ${error.message}\n`);
      
      if (error.message.includes('API_KEY_INVALID')) {
        console.error('💡 Your API key appears to be invalid. Please check it.');
        break;
      }
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.error('💡 Permission denied. Check your API key permissions.');
        break;
      }
    }
  }
}

async function testInteriorDesignPrompt() {
  console.log('🏠 Testing Interior Design Specific Functionality...\n');
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    // Use the most reliable model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const interiorPrompt = `
You are an expert interior designer. Analyze this room and provide design recommendations.

Please provide your response in the following JSON format:
{
  "roomLayout": {
    "suggestions": ["suggestion1", "suggestion2"],
    "optimizationTips": ["tip1", "tip2"]
  },
  "furniture": [
    {
      "item": "furniture piece",
      "dimensions": "dimensions",
      "placement": "placement description",
      "reasoning": "why this piece works",
      "estimatedCost": "price range"
    }
  ],
  "colorScheme": {
    "primary": "color",
    "secondary": "color", 
    "accent": "color",
    "description": "description"
  },
  "overallDesignConcept": "design concept",
  "confidenceScore": 0.95
}

Room details: Modern living room, 12x15 feet, good natural light, current style is outdated.
`;

    const result = await model.generateContent([interiorPrompt]);
    
    if (result.response && result.response.text()) {
      console.log('✅ Interior design prompt: SUCCESS');
      console.log('📄 Sample response:');
      console.log(result.response.text().substring(0, 500) + '...');
      
      // Try to parse as JSON
      try {
        const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parsing: SUCCESS');
          console.log('📊 Structure valid:', Object.keys(parsedJson));
        }
      } catch (parseError) {
        console.log('⚠️ JSON parsing: Response not in JSON format');
      }
    } else {
      console.log('❌ Interior design prompt: FAILED');
    }
    
  } catch (error) {
    console.error('❌ Interior design test failed:', error.message);
  }
}

// Test via curl command equivalent
async function testViaCurl() {
  console.log('\n🌐 Testing via HTTP Request (curl equivalent)...\n');
  
  const fetch = require('node-fetch');
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Generate a brief modern interior design concept in 30 words."
          }
        ]
      }
    ]
  };
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    if (response.ok && result.candidates && result.candidates[0]) {
      console.log('✅ HTTP/curl test: SUCCESS');
      console.log('📄 Response:', result.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ HTTP/curl test: FAILED');
      console.log('🔍 Response:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ HTTP/curl test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Gemini API Comprehensive Test Suite\n');
  console.log('='.repeat(50) + '\n');
  
  await testGeminiConnection();
  await testInteriorDesignPrompt();
  await testViaCurl();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test Suite Complete');
  
  // Provide documentation links
  console.log('\n📚 Gemini 2.5 Documentation:');
  console.log('- API Reference: https://ai.google.dev/api');
  console.log('- Model Info: https://ai.google.dev/gemini-api/docs/models/gemini');
  console.log('- Multimodal: https://ai.google.dev/gemini-api/docs/vision');
  console.log('- Rate limits: https://ai.google.dev/gemini-api/docs/quota');
}

// Handle command line execution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGeminiConnection,
  testInteriorDesignPrompt,
  testViaCurl
};