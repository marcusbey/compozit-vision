#!/usr/bin/env node

/**
 * Generate Real Interior Design Images using Gemini 2.0 Flash Experimental
 * This script generates actual images using Google's latest Gemini model
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Image specifications for generation
const imageSpecs = [
  {
    filename: 'interior-modern.png',
    prompt: 'Create a photorealistic interior design image of a modern minimalist living room. Features: floor-to-ceiling windows, white walls, sleek grey furniture, polished concrete floors, natural daylight streaming in. Professional architectural photography style, high resolution, no text, no watermarks.',
    category: 'Interior',
    style: 'Modern'
  },
  {
    filename: 'interior-scandinavian.png', 
    prompt: 'Create a photorealistic Scandinavian living room interior. Features: white walls, light oak wood floors, comfortable beige sofa, soft wool throws, green plants, cozy warm lighting. Hygge atmosphere, professional interior photography, high resolution, no text.',
    category: 'Interior',
    style: 'Scandinavian'
  },
  {
    filename: 'interior-industrial.png',
    prompt: 'Create a photorealistic industrial loft interior. Features: exposed red brick walls, black metal ceiling beams, concrete floors, brown leather sofa, Edison bulb pendant lights. Urban warehouse style, professional photography, high resolution, no text.',
    category: 'Interior', 
    style: 'Industrial'
  },
  {
    filename: 'interior-bohemian.png',
    prompt: 'Create a photorealistic bohemian bedroom interior. Features: colorful layered textiles, macrame wall art, Persian rugs, many green plants, warm terracotta colors, eclectic furniture. Artistic cozy atmosphere, professional photography, high resolution, no text.',
    category: 'Interior',
    style: 'Bohemian'
  },
  {
    filename: 'interior-minimalist.png',
    prompt: 'Create a photorealistic ultra-minimalist bedroom. Features: all white walls, low platform bed with white bedding, one abstract art piece, hidden storage, maximum empty space. Zen serenity, professional architectural photography, high resolution, no text.',
    category: 'Interior',
    style: 'Minimalist'
  },
  {
    filename: 'exterior-modern.png',
    prompt: 'Create a photorealistic modern house exterior. Features: flat roof, floor-to-ceiling glass walls, minimalist landscaping, concrete and dark wood materials, geometric architecture. Evening with architectural lighting, professional photography, high resolution, no text.',
    category: 'Exterior',
    style: 'Modern'
  },
  {
    filename: 'exterior-mediterranean.png',
    prompt: 'Create a photorealistic Mediterranean villa exterior. Features: white stucco walls, terracotta clay roof tiles, arched windows and doorways, pink bougainvillea flowers, stone pathways. Golden sunset lighting, professional architectural photography, high resolution, no text.',
    category: 'Exterior',
    style: 'Mediterranean'
  },
  {
    filename: 'garden-japanese.png',
    prompt: 'Create a photorealistic Japanese zen garden. Features: carefully raked white gravel patterns, moss-covered stones, small wooden bridge, koi pond, pruned pine trees, bamboo fence. Serene morning light, professional landscape photography, high resolution, no text.',
    category: 'Garden',
    style: 'Japanese Zen'
  },
  {
    filename: 'garden-modern.png',
    prompt: 'Create a photorealistic modern minimalist garden. Features: geometric concrete planters, trimmed boxwood hedges, linear water feature, contemporary sculpture, clean architectural lines. Professional landscape photography, high resolution, no text.',
    category: 'Garden',
    style: 'Modern'
  },
  {
    filename: 'hotels-luxury.png',
    prompt: 'Create a photorealistic luxury hotel lobby interior. Features: double-height ceiling, polished marble floors, crystal chandelier, gold and velvet furniture, grand staircase. Elegant evening lighting, professional hospitality photography, high resolution, no text.',
    category: 'Hotels',
    style: 'Luxury'
  },
  {
    filename: 'hotels-boutique.png',
    prompt: 'Create a photorealistic boutique hotel room. Features: designer furniture, statement pendant lighting, luxury bedding in neutral tones, curated art pieces, floor-to-ceiling windows. Contemporary sophisticated style, professional photography, high resolution, no text.',
    category: 'Hotels',
    style: 'Boutique'
  },
  {
    filename: 'commercial-modern.png',
    prompt: 'Create a photorealistic modern retail store interior. Features: minimalist white display systems, polished concrete floors, track lighting, open spacious layout, clean aesthetic. Professional commercial photography, high resolution, no text.',
    category: 'Commercial',
    style: 'Modern Retail'
  },
  {
    filename: 'commercial-restaurant.png',
    prompt: 'Create a photorealistic trendy restaurant interior. Features: exposed black ceiling, mixed wood and metal furniture, warm pendant lighting, open kitchen view, industrial-chic design. Evening dining atmosphere, professional photography, high resolution, no text.',
    category: 'Commercial',
    style: 'Restaurant'
  }
];

/**
 * Generate image using Gemini 2.0 Flash Experimental
 */
async function generateImageWithGemini(spec) {
  return new Promise((resolve, reject) => {
    // Using the imagen endpoint for actual image generation
    const postData = JSON.stringify({
      "model": "gemini-2.0-flash-exp",
      "contents": [
        {
          "parts": [
            {
              "text": spec.prompt
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.4,
        "topP": 0.95,
        "topK": 40,
        "maxOutputTokens": 8192,
        "responseMimeType": "image/png"
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          // Check for generated content
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;
            
            // Look for image data in the response
            if (content.parts && content.parts[0]) {
              const part = content.parts[0];
              
              // Check for inline data (base64 image)
              if (part.inlineData && part.inlineData.data) {
                const buffer = Buffer.from(part.inlineData.data, 'base64');
                resolve({ success: true, buffer });
                return;
              }
              
              // Check for file data
              if (part.fileData && part.fileData.fileUri) {
                // Download image from URI
                resolve({ success: true, uri: part.fileData.fileUri });
                return;
              }
              
              // Check for text response (might contain image URL)
              if (part.text) {
                console.log('Text response:', part.text);
                // For now, create a placeholder
                resolve({ success: false, reason: 'Text response only' });
                return;
              }
            }
          }
          
          reject(new Error('No image data in response'));
          
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

/**
 * Create a better placeholder image
 */
function createBetterPlaceholder(spec) {
  // Create a simple but valid PNG with the style name
  const width = 512;
  const height = 512;
  
  // Color schemes for each style
  const colorSchemes = {
    'Modern': { r: 245, g: 245, b: 247 },
    'Scandinavian': { r: 248, g: 246, b: 240 },
    'Industrial': { r: 120, g: 120, b: 130 },
    'Bohemian': { r: 180, g: 140, b: 100 },
    'Minimalist': { r: 255, g: 255, b: 255 },
    'Mediterranean': { r: 230, g: 200, b: 160 },
    'Japanese Zen': { r: 200, g: 220, b: 200 },
    'Modern Retail': { r: 240, g: 240, b: 245 },
    'Luxury': { r: 150, g: 130, b: 100 },
    'Boutique': { r: 200, g: 180, b: 160 },
    'Restaurant': { r: 160, g: 140, b: 120 }
  };

  const colors = colorSchemes[spec.style] || { r: 200, g: 200, b: 200 };
  
  // Create PNG buffer
  const PNG = require('pngjs').PNG;
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      
      // Create a gradient effect
      const distanceFromCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
      const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));
      const factor = 1 - (distanceFromCenter / maxDistance) * 0.3;
      
      // Add some texture
      const noise = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 20;
      
      png.data[idx] = Math.max(0, Math.min(255, colors.r * factor + noise));
      png.data[idx + 1] = Math.max(0, Math.min(255, colors.g * factor + noise));
      png.data[idx + 2] = Math.max(0, Math.min(255, colors.b * factor + noise));
      png.data[idx + 3] = 255; // Alpha
    }
  }

  return PNG.sync.write(png);
}

/**
 * Main generation function
 */
async function generateAllImages() {
  console.log('🎨 Gemini Real Image Generation - Interior Design Gallery');
  console.log('======================================================\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found');
    console.log('Please ensure GEMINI_API_KEY is set in your .env file');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`);
  console.log(`🤖 Model: gemini-2.0-flash-exp`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 Images: ${imageSpecs.length}\n`);

  // First, try to install pngjs if not available
  try {
    require('pngjs');
  } catch (e) {
    console.log('📦 Installing pngjs for better placeholder generation...');
    require('child_process').execSync('npm install pngjs', { cwd: path.join(__dirname, '../../') });
  }

  // Remove old files
  console.log('🧹 Cleaning old files...');
  const files = fs.readdirSync(OUTPUT_DIR);
  files.forEach(file => {
    if (file.endsWith('.png') && file !== 'modern-living-room.png') {
      fs.unlinkSync(path.join(OUTPUT_DIR, file));
      console.log(`   Removed: ${file}`);
    }
  });
  console.log('');

  const results = [];
  let successCount = 0;
  let placeholderCount = 0;

  for (let i = 0; i < imageSpecs.length; i++) {
    const spec = imageSpecs[i];
    console.log(`[${i + 1}/${imageSpecs.length}] Generating ${spec.filename}...`);
    console.log(`   Category: ${spec.category} | Style: ${spec.style}`);
    
    try {
      // Try to generate with Gemini first
      console.log(`   🤖 Calling Gemini API...`);
      const result = await generateImageWithGemini(spec);
      
      if (result.success && result.buffer) {
        // Save the real image
        const filepath = path.join(OUTPUT_DIR, spec.filename);
        fs.writeFileSync(filepath, result.buffer);
        console.log(`   ✅ Generated real image! (${Math.round(result.buffer.length / 1024)}KB)`);
        successCount++;
      } else {
        throw new Error('No image data received');
      }
      
      results.push({ filename: spec.filename, success: true, type: 'ai-generated' });
      
    } catch (error) {
      console.log(`   ⚠️  Gemini failed: ${error.message}`);
      console.log(`   📸 Creating high-quality placeholder...`);
      
      // Create a better placeholder
      try {
        const placeholderBuffer = createBetterPlaceholder(spec);
        const filepath = path.join(OUTPUT_DIR, spec.filename);
        fs.writeFileSync(filepath, placeholderBuffer);
        console.log(`   ✅ Created placeholder image (${Math.round(placeholderBuffer.length / 1024)}KB)`);
        placeholderCount++;
        results.push({ filename: spec.filename, success: true, type: 'placeholder' });
      } catch (placeholderError) {
        console.error(`   ❌ Failed completely: ${placeholderError.message}`);
        results.push({ filename: spec.filename, success: false, error: placeholderError.message });
      }
    }
    
    console.log('');
    
    // Rate limiting
    if (i < imageSpecs.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n📊 Generation Summary');
  console.log('====================');
  console.log(`✅ Total successful: ${results.filter(r => r.success).length}`);
  console.log(`🤖 AI-generated images: ${successCount}`);
  console.log(`📸 Placeholder images: ${placeholderCount}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  
  // Create index
  const indexData = {
    generated: new Date().toISOString(),
    model: 'gemini-2.0-flash-exp',
    results: results,
    specs: imageSpecs
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'generation-results.json'),
    JSON.stringify(indexData, null, 2)
  );
  
  console.log(`\n📋 Index saved: generation-results.json`);
  console.log(`📁 All images saved to: ${OUTPUT_DIR}`);
  console.log('\n✨ Generation complete!');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  generateAllImages()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateAllImages };