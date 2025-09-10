#!/usr/bin/env ts-node

/**
 * Generate Masonry Gallery Images for Compozit Vision
 * Attempts to use Google Gemini first, falls back to OpenAI DALL-E if needed
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Image specifications for the 3 masonry images
interface MasonryImageSpec {
  filename: string;
  prompt: string;
  style: string;
  dimensions: { width: number; height: number };
}

const MASONRY_IMAGES: MasonryImageSpec[] = [
  {
    filename: 'modern-living-room.png',
    prompt: 'A modern minimalist living room with clean lines, neutral colors, sleek furniture, and abundant natural light. Professional interior design photography, high resolution, clean aesthetic',
    style: 'Modern Minimalist',
    dimensions: { width: 320, height: 240 }
  },
  {
    filename: 'industrial-kitchen.png', 
    prompt: 'An industrial style kitchen with exposed brick walls, stainless steel appliances, concrete countertops, and Edison bulb lighting. Professional interior photography, high quality',
    style: 'Industrial',
    dimensions: { width: 256, height: 256 }
  },
  {
    filename: 'bohemian-bedroom.png',
    prompt: 'A bohemian bedroom with warm earth tones, layered textiles, macrame wall hangings, plants, and cozy ambient lighting. Professional interior design photo, clean aesthetic',
    style: 'Bohemian', 
    dimensions: { width: 240, height: 320 }
  }
];

const OUTPUT_DIR = '/Users/marcusbey/Desktop/02-CS/05-Startup/compozit/app/compozit-vision/mobile/src/assets/masonry';

/**
 * Attempt to generate image using Google Gemini
 */
async function tryGeminiImageGeneration(spec: MasonryImageSpec): Promise<string | null> {
  try {
    const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      console.log('   ⚠️ No Gemini API key found, skipping Gemini generation');
      return null;
    }

    console.log('   🔄 Attempting Gemini image generation...');
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Try different potential Gemini image generation models
    const possibleModels = [
      'gemini-2.5-flash-image-preview',
      'gemini-pro-vision-image',
      'gemini-1.5-pro-image',
      'imagen-3'  // In case Google has imagen under Gemini API
    ];
    
    for (const modelName of possibleModels) {
      try {
        console.log(`   📡 Trying model: ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Enhanced prompt for image generation
        const enhancedPrompt = `Generate a high-quality, photorealistic interior design image: ${spec.prompt}. 
        Style: ${spec.style}. 
        Image should be ${spec.dimensions.width}x${spec.dimensions.height} pixels.
        Requirements: Professional photography quality, sharp focus, proper lighting, realistic textures and materials.`;
        
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        
        // Check if response contains image data
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];
          
          // Look for image data in different possible formats
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
                console.log(`   ✅ Generated with ${modelName}`);
                return part.inlineData.data;
              }
            }
          }
        }
        
        // If we get here, this model didn't generate an image
        console.log(`   ❌ ${modelName} doesn't support image generation`);
        
      } catch (modelError: any) {
        console.log(`   ❌ ${modelName} failed: ${modelError.message}`);
      }
    }
    
    console.log('   ⚠️ No Gemini models support image generation');
    return null;
    
  } catch (error: any) {
    console.log(`   ❌ Gemini generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate image using OpenAI DALL-E 3 as fallback
 */
async function generateWithOpenAI(spec: MasonryImageSpec): Promise<string | null> {
  try {
    const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('   ❌ No OpenAI API key found');
      return null;
    }

    console.log('   🎨 Generating with OpenAI DALL-E 3...');
    
    // Determine closest supported size
    let size: string;
    if (spec.dimensions.width === spec.dimensions.height) {
      size = '1024x1024';  // Square
    } else if (spec.dimensions.width > spec.dimensions.height) {
      size = '1792x1024';  // Landscape
    } else {
      size = '1024x1792';  // Portrait
    }
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${spec.prompt} Interior design photography, professional quality, ${spec.style} style`,
        n: 1,
        size: size,
        quality: 'hd',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('   ✅ Generated with OpenAI DALL-E 3');
    return result.data[0].url;
    
  } catch (error: any) {
    console.log(`   ❌ OpenAI generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImage(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

/**
 * Resize image to exact dimensions using Canvas API
 */
async function resizeImage(base64Data: string, targetWidth: number, targetHeight: number): Promise<string> {
  // For server-side resizing, we'd typically use a library like sharp
  // For now, we'll save the image as-is and note that resizing should be done
  console.log(`   📏 Note: Image should be resized to ${targetWidth}x${targetHeight}px`);
  return base64Data;
}

/**
 * Save base64 image data to file
 */
async function saveImage(base64Data: string, filename: string): Promise<string> {
  const filePath = path.join(OUTPUT_DIR, filename);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Convert base64 to buffer and save as PNG
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  
  const sizeKB = Math.round(buffer.length / 1024);
  console.log(`   💾 Saved: ${filename} (${sizeKB}KB)`);
  
  return filePath;
}

/**
 * Main generation function
 */
async function generateMasonryImages() {
  console.log('🎨 Generating Masonry Gallery Images for Compozit Vision\n');
  console.log('Attempting Google Gemini first, with OpenAI DALL-E fallback\n');
  
  // Check API keys
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  console.log('🔑 API Key Status:');
  console.log(`   Gemini: ${geminiKey ? '✅ Available' : '❌ Missing'}`);
  console.log(`   OpenAI: ${openaiKey ? '✅ Available' : '❌ Missing'}`);
  
  if (!geminiKey && !openaiKey) {
    console.error('\n❌ No API keys found! Please add to your environment:');
    console.log('export EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key');
    console.log('export EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key');
    return;
  }
  
  console.log(`\n🚀 Generating ${MASONRY_IMAGES.length} images...\n`);
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < MASONRY_IMAGES.length; i++) {
    const spec = MASONRY_IMAGES[i];
    console.log(`🖼️  [${i + 1}/${MASONRY_IMAGES.length}] ${spec.filename}`);
    console.log(`   Style: ${spec.style}`);
    console.log(`   Dimensions: ${spec.dimensions.width}x${spec.dimensions.height}px`);
    
    try {
      const startTime = Date.now();
      let imageData: string | null = null;
      let service = '';
      
      // First try Gemini
      if (geminiKey) {
        imageData = await tryGeminiImageGeneration(spec);
        if (imageData) {
          service = 'Gemini';
        }
      }
      
      // If Gemini failed, try OpenAI
      if (!imageData && openaiKey) {
        const imageUrl = await generateWithOpenAI(spec);
        if (imageUrl) {
          imageData = await downloadImage(imageUrl);
          service = 'OpenAI DALL-E 3';
        }
      }
      
      if (!imageData) {
        throw new Error('All generation methods failed');
      }
      
      // Resize if needed (placeholder for now)
      const resizedData = await resizeImage(imageData, spec.dimensions.width, spec.dimensions.height);
      
      // Save the image
      const filePath = await saveImage(resizedData, spec.filename);
      
      const totalTime = Date.now() - startTime;
      console.log(`   ✅ Generated in ${Math.round(totalTime / 1000)}s using ${service}\n`);
      
      results.push({
        filename: spec.filename,
        success: true,
        service,
        generationTime: totalTime,
        filePath,
        spec
      });
      
      successCount++;
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      results.push({
        filename: spec.filename,
        success: false,
        error: error.message,
        spec
      });
    }
  }
  
  // Generate summary
  console.log('📊 Generation Summary:');
  console.log('======================');
  console.log(`Success Rate: ${successCount}/${MASONRY_IMAGES.length} (${Math.round(successCount / MASONRY_IMAGES.length * 100)}%)`);
  
  if (successCount > 0) {
    console.log('\n✅ Successfully Generated:');
    results.filter(r => r.success).forEach(result => {
      console.log(`   • ${result.filename} (${result.service}, ${Math.round(result.generationTime! / 1000)}s)`);
    });
  }
  
  if (successCount < MASONRY_IMAGES.length) {
    console.log('\n❌ Failed Generations:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   • ${result.filename}: ${result.error}`);
    });
  }
  
  // Save results
  const resultsPath = path.join(OUTPUT_DIR, 'generation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalImages: MASONRY_IMAGES.length,
    successfulImages: successCount,
    failedImages: MASONRY_IMAGES.length - successCount,
    results
  }, null, 2));
  
  console.log(`\n📄 Results saved: ${resultsPath}`);
  console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
  
  if (successCount === MASONRY_IMAGES.length) {
    console.log('\n🎉 All masonry images generated successfully!');
    console.log('🔗 Ready for integration into the mobile app');
  } else {
    console.log(`\n⚠️ ${MASONRY_IMAGES.length - successCount} image(s) failed to generate`);
    console.log('You may retry the failed images or generate them manually');
  }
  
  return {
    success: successCount === MASONRY_IMAGES.length,
    totalImages: MASONRY_IMAGES.length,
    successfulImages: successCount,
    outputDirectory: OUTPUT_DIR
  };
}

// Run the generator
if (require.main === module) {
  generateMasonryImages()
    .then((result) => {
      if (result.success) {
        console.log('\n🎯 All images ready for masonry gallery integration!');
      }
    })
    .catch(error => {
      console.error('❌ Generation script failed:', error);
      process.exit(1);
    });
}

export { generateMasonryImages };