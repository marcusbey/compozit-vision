#!/usr/bin/env ts-node

/**
 * Simple Gemini 2.5 Image Generation Test
 * Quick test without Expo dependencies
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

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
      return;
    }
    
    // Initialize Gemini with image generation model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview' 
    });
    
    console.log('✅ Gemini 2.5 Flash Image Preview model initialized\n');
    
    // Test prompt for interior design
    const testPrompt = `Generate a photorealistic interior design image of a modern Scandinavian living room with:
- White walls and light wood furniture
- Cozy gray sectional sofa
- Coffee table with books and plants
- Large windows with natural light
- Minimalist decor and clean lines
- Warm, inviting atmosphere
- Professional interior design photography quality
- Sharp focus and detailed textures`;
    
    console.log('🎨 Generating test interior design...');
    console.log(`Prompt: ${testPrompt.substring(0, 100)}...`);
    
    const startTime = Date.now();
    
    // Generate the image
    const result = await model.generateContent([testPrompt]);
    const response = await result.response;
    
    const generationTime = Date.now() - startTime;
    
    console.log(`⏱️ Generation completed in ${generationTime}ms`);
    
    // Check the response
    const candidates = response.candidates;
    console.log(`📊 Response candidates: ${candidates?.length || 0}`);
    
    if (candidates && candidates.length > 0) {
      const candidate = candidates[0];
      console.log('✅ Image generation successful!');
      console.log('📋 Response structure:', JSON.stringify(candidate, null, 2));
      
      // Look for image data in the response
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            console.log('🖼️ Found image data!');
            console.log(`   MIME type: ${part.inlineData.mimeType}`);
            console.log(`   Data length: ${part.inlineData.data.length} characters`);
            
            // Save the image
            try {
              const imageData = part.inlineData.data;
              const fileName = `gemini-test-${Date.now()}.jpg`;
              const filePath = path.join(process.cwd(), fileName);
              
              fs.writeFileSync(filePath, imageData, 'base64');
              console.log(`💾 Image saved as: ${fileName}`);
              console.log(`📁 Full path: ${filePath}`);
              
            } catch (saveError) {
              console.warn('⚠️ Could not save image:', saveError);
            }
            
            break;
          }
        }
      } else {
        console.log('ℹ️ No image data found in response parts');
        console.log('🔍 Full response:', JSON.stringify(response, null, 2));
      }
      
    } else {
      console.log('❌ No candidates in response');
      console.log('🔍 Full response:', JSON.stringify(response, null, 2));
    }
    
    console.log('\n🎯 Test Summary:');
    console.log(`Model: gemini-2.5-flash-image-preview`);
    console.log(`Generation time: ${generationTime}ms`);
    console.log(`API call: Successful`);
    console.log(`Response received: ${(candidates?.length || 0) > 0 ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific API errors
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('API Status:', (error as any).status);
    }
  }
}

// Load .env file if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, that's ok
}

// Run the test
if (require.main === module) {
  testGeminiImageGeneration().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { testGeminiImageGeneration };