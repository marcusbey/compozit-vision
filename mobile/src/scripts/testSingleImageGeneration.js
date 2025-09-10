#!/usr/bin/env node

/**
 * Test single image generation with detailed debugging
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

console.log('🧪 Testing Single Image Generation');
console.log('================================');
console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);

function generateSingleImage() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": "Create a photorealistic modern minimalist living room interior design. Features: clean lines, white walls, sleek grey furniture, polished concrete floors, natural daylight streaming through floor-to-ceiling windows. Professional architectural photography style, high resolution, no text, no watermarks, no people."
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

    console.log('📝 Sending request to:', options.path);
    console.log('📦 Payload size:', postData.length, 'bytes');

    const req = https.request(options, (res) => {
      let data = '';
      
      console.log('📡 Response status:', res.statusCode);
      console.log('📋 Response headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response size:', data.length, 'bytes');
        
        try {
          const response = JSON.parse(data);
          console.log('🔍 Response structure:', JSON.stringify(response, null, 2));
          
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          // Check for generated content
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;
            console.log('✅ Found content with parts:', content.parts?.length);
            
            if (content.parts && content.parts[0]) {
              const part = content.parts[0];
              console.log('📋 Part keys:', Object.keys(part));
              
              // Check for inline data (base64 image)
              if (part.inlineData && part.inlineData.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                console.log('🖼️  Found image data:', buffer.length, 'bytes');
                console.log('📋 MIME type:', part.inlineData.mimeType);
                
                // Save the image
                const filepath = path.join(OUTPUT_DIR, 'test-modern-living-room.png');
                fs.writeFileSync(filepath, buffer);
                
                resolve({ success: true, buffer, filepath });
                return;
              } else {
                console.log('❌ No inlineData found in part');
              }
              
              // Check for file data
              if (part.fileData && part.fileData.fileUri) {
                console.log('📁 Found fileData with URI:', part.fileData.fileUri);
                resolve({ success: true, uri: part.fileData.fileUri });
                return;
              }
              
              // Check for text response
              if (part.text) {
                console.log('📝 Text response:', part.text.substring(0, 200) + '...');
                reject(new Error('Received text instead of image'));
                return;
              }
            }
          }
          
          reject(new Error('No image data in response'));
          
        } catch (error) {
          console.error('❌ JSON parse error:', error.message);
          console.log('📄 Raw response:', data.substring(0, 500) + '...');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('🌐 Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
async function runTest() {
  try {
    console.log('\n🚀 Starting image generation test...\n');
    const result = await generateSingleImage();
    
    if (result.success && result.buffer) {
      const sizeKB = Math.round(result.buffer.length / 1024);
      console.log(`\n✅ SUCCESS! Image generated: ${sizeKB}KB`);
      console.log(`📁 Saved to: ${result.filepath}`);
    } else if (result.success && result.uri) {
      console.log(`\n✅ SUCCESS! Image URI: ${result.uri}`);
    }
    
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}`);
  }
}

runTest();