#!/usr/bin/env node

/**
 * Simple Gemini API Test Script
 * Use this to verify your API key works before generating images
 */

const https = require('https');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;

console.log('🧪 Testing Gemini API Connection');
console.log('===============================\n');

if (!API_KEY) {
  console.error('❌ No GEMINI_API_KEY found in .env file');
  console.log('Please add your API key to the .env file');
  process.exit(1);
}

console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);

// Test text generation first
function testTextGeneration() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": "Say hello and confirm you can generate interior design descriptions"
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.4,
        "topP": 0.95,
        "topK": 40
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📝 Testing text generation...');

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`Text API Error: ${response.error.message}`));
            return;
          }

          if (response.candidates && response.candidates[0]) {
            const text = response.candidates[0].content.parts[0].text;
            console.log('✅ Text generation works!');
            console.log(`Response: ${text.substring(0, 100)}...`);
            resolve(true);
          } else {
            reject(new Error('No text response received'));
          }
          
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test image generation
function testImageGeneration() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": "Create a simple modern living room interior design image with clean lines and minimal furniture"
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.4,
        "topP": 0.95,
        "topK": 40
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n🖼️  Testing image generation...');

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`Image API Error: ${response.error.message}`));
            return;
          }

          // Check for image data
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;
            
            if (content.parts && content.parts[0]) {
              const part = content.parts[0];
              
              if (part.inlineData && part.inlineData.data) {
                console.log('✅ Image generation works!');
                console.log(`Image size: ${Math.round(part.inlineData.data.length * 0.75 / 1024)}KB (estimated)`);
                resolve(true);
              } else {
                reject(new Error('No image data in response'));
              }
            } else {
              reject(new Error('Unexpected response format'));
            }
          } else {
            reject(new Error('No image response received'));
          }
          
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    // Test text generation first
    await testTextGeneration();
    
    // Test image generation
    await testImageGeneration();
    
    console.log('\n🎉 Success! Your API key is working');
    console.log('✅ Text generation: Working');
    console.log('✅ Image generation: Working');
    console.log('\n🚀 Ready to generate masonry gallery images!');
    console.log('Run: node src/scripts/generateComprehensiveMasonryImages.js phase1');
    
  } catch (error) {
    console.error(`\n❌ API Test Failed: ${error.message}`);
    
    if (error.message.includes('expired')) {
      console.log('\n🔑 Your API key has expired. Get a new one:');
      console.log('1. Visit: https://aistudio.google.com/app/apikey');
      console.log('2. Create new API key');
      console.log('3. Update GEMINI_API_KEY in .env file');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n🔒 Permission denied. Check your API key:');
      console.log('1. Make sure the key is correct');
      console.log('2. Enable Generative AI API in Google Cloud Console');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify API key is correct');
      console.log('3. Check Google Cloud Console for API limits');
    }
    
    console.log('\n📸 Current status: Using high-quality placeholders (176 images)');
  }
}

runTests();