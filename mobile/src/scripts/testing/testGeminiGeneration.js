#!/usr/bin/env node

/**
 * Simple Gemini 2.5 Image Generation Test
 * JavaScript version to avoid TypeScript compilation issues
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testGeminiImageGeneration() {
  console.log('🧪 Testing Gemini 2.5 Flash Image Generation...\n');
  
  try {
    // Check if Gemini API key is available
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    console.log(`Gemini API Key: ${apiKey ? '✅ Found' : '❌ Missing'}`);
    
    if (!apiKey) {
      console.log('\n⚠️ Gemini API key not found!');
      console.log('Add to your .env file:');
      console.log('EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here');
      
      // Try to load from .env file in current directory
      try {
        require('dotenv').config();
        const apiKeyFromEnv = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (apiKeyFromEnv) {
          console.log('✅ Found API key in .env file');
        } else {
          return;
        }
      } catch (e) {
        console.log('💡 Install dotenv to load .env file: npm install dotenv');
        return;
      }
    }
    
    // Initialize Gemini with image generation model
    const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview' 
    });
    
    console.log('✅ Gemini 2.5 Flash Image Preview model initialized\n');
    
    // Test prompt for interior design
    const testPrompt = `Generate a photorealistic interior design image of a modern Scandinavian living room with:
- White walls and light wood furniture
- Cozy gray sectional sofa with throw pillows
- Coffee table with design books and small plants
- Large windows with soft natural lighting
- Minimalist Nordic decor and clean lines
- Warm, inviting atmosphere
- Professional architectural photography quality
- Sharp focus with detailed textures and materials
- Cohesive color palette of whites, grays, and natural wood tones`;
    
    console.log('🎨 Generating test interior design...');
    console.log(`📝 Prompt preview: ${testPrompt.substring(0, 150)}...`);
    
    const startTime = Date.now();
    
    // Generate the image
    console.log('⏳ Calling Gemini API...');
    const result = await model.generateContent([testPrompt]);
    const response = await result.response;
    
    const generationTime = Date.now() - startTime;
    
    console.log(`⏱️ API call completed in ${generationTime}ms`);
    
    // Check the response structure
    console.log('\n📊 Response Analysis:');
    console.log(`Response object keys: ${Object.keys(response)}`);
    
    const candidates = response.candidates;
    console.log(`Candidates found: ${candidates?.length || 0}`);
    
    if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      console.log('✅ Found response candidate!');
      
      // Log candidate structure  
      console.log('📋 Candidate keys:', Object.keys(candidate));
      
      if (candidate.content) {
        console.log('📄 Content keys:', Object.keys(candidate.content));
        
        if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
          console.log(`🔍 Content parts: ${candidate.content.parts.length}`);
          
          let imageFound = false;
          
          for (let i = 0; i < candidate.content.parts.length; i++) {
            const part = candidate.content.parts[i];
            console.log(`   Part ${i + 1}:`, Object.keys(part));
            
            if (part.inlineData) {
              console.log('🖼️ Found inline data!');
              console.log(`   MIME type: ${part.inlineData.mimeType}`);
              console.log(`   Data length: ${part.inlineData.data?.length || 0} characters`);
              
              if (part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
                imageFound = true;
                
                try {
                  const imageData = part.inlineData.data;
                  const extension = part.inlineData.mimeType.includes('png') ? 'png' : 'jpg';
                  const fileName = `gemini-test-${Date.now()}.${extension}`;
                  const filePath = path.join(process.cwd(), fileName);
                  
                  fs.writeFileSync(filePath, imageData, 'base64');
                  console.log(`💾 ✅ Image saved successfully!`);
                  console.log(`📁 File: ${fileName}`);
                  console.log(`📂 Path: ${filePath}`);
                  
                  // Check file size
                  const stats = fs.statSync(filePath);
                  console.log(`📊 File size: ${Math.round(stats.size / 1024)}KB`);
                  
                } catch (saveError) {
                  console.error('❌ Failed to save image:', saveError.message);
                }
              }
            } else if (part.text) {
              console.log(`📝 Text part: ${part.text.substring(0, 100)}...`);
            }
          }
          
          if (!imageFound) {
            console.log('❌ No image data found in response parts');
          }
          
        } else {
          console.log('❌ No parts found in content');
        }
      } else {
        console.log('❌ No content found in candidate');
      }
      
      // Log full response for debugging (truncated)
      const responseStr = JSON.stringify(response, null, 2);
      if (responseStr.length > 1000) {
        console.log('\n🔍 Response preview (first 1000 chars):');
        console.log(responseStr.substring(0, 1000) + '...');
      } else {
        console.log('\n🔍 Full response:');
        console.log(responseStr);
      }
      
    } else {
      console.log('❌ No candidates in response');
      console.log('🔍 Full response:', JSON.stringify(response, null, 2));
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('=================');
    console.log(`Model: gemini-2.5-flash-image-preview`);
    console.log(`Generation time: ${generationTime}ms`);
    console.log(`API call: ✅ Successful`);
    console.log(`Response received: ${candidates && candidates.length > 0 ? '✅ Yes' : '❌ No'}`);
    console.log(`Image generated: ${fs.existsSync(`gemini-test-${Date.now()}.jpg`) || fs.existsSync(`gemini-test-${Date.now()}.png`) ? '✅ Yes' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    // Check for specific API errors
    if (error.status) {
      console.error(`🌐 HTTP Status: ${error.status}`);
    }
    
    if (error.message.includes('API_KEY')) {
      console.error('🔑 This appears to be an API key issue');
      console.log('💡 Make sure your Gemini API key is valid and has access to image generation');
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🚫 Permission denied - check if your API key has image generation permissions');
    }
    
    if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('📊 Quota exceeded - check your Gemini API usage limits');
    }
    
    // Show more error details
    console.error('\n🔍 Full error details:');
    console.error(error);
  }
}

// Try to load .env file
try {
  require('dotenv').config();
} catch (e) {
  console.log('ℹ️ dotenv not installed (optional)');
}

// Run the test
testGeminiImageGeneration().catch(error => {
  console.error('💥 Script execution failed:', error);
  process.exit(1);
});