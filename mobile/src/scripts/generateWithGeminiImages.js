#!/usr/bin/env node

/**
 * Generate Real Images using Gemini 2.5 Flash Image Preview
 * Uses the official Gemini Image Generation API
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

// Image specifications with enhanced prompts for Gemini
const imageSpecs = [
  {
    filename: 'interior-modern.png',
    prompt: 'Create a stunning modern minimalist living room interior photograph. Clean white walls, floor-to-ceiling windows, sleek minimalist furniture in neutral tones, polished concrete floors, abundant natural daylight. Professional architectural photography, photorealistic, high resolution, no text, no borders.',
    category: 'Interior',
    style: 'Modern'
  },
  {
    filename: 'interior-scandinavian.png',
    prompt: 'Create a cozy Scandinavian living room interior photograph. White walls, light wood floors, comfortable grey sofa, soft knit throws, potted plants, warm natural lighting, hygge atmosphere. Professional interior design photography, photorealistic, no text, no borders.',
    category: 'Interior',
    style: 'Scandinavian'
  },
  {
    filename: 'interior-industrial.png',
    prompt: 'Create an industrial loft interior photograph. Exposed red brick walls, metal beam ceiling, concrete floors, vintage brown leather furniture, Edison bulb pendant lighting. Urban warehouse conversion style, professional photography, photorealistic, no text, no borders.',
    category: 'Interior',
    style: 'Industrial'
  },
  {
    filename: 'interior-bohemian.png',
    prompt: 'Create a bohemian bedroom interior photograph. Layered colorful textiles, macrame wall hangings, vintage Persian rugs, abundant green plants, warm earth tones, eclectic furniture mix. Cozy artistic atmosphere, professional interior photography, photorealistic, no text, no borders.',
    category: 'Interior',
    style: 'Bohemian'
  },
  {
    filename: 'interior-minimalist.png',
    prompt: 'Create an ultra-minimalist bedroom interior photograph. Platform bed, pure white walls, hidden storage, single piece of abstract art, maximum negative space, clean lines. Zen-like serenity, professional architectural photography, photorealistic, no text, no borders.',
    category: 'Interior',
    style: 'Minimalist'
  },
  {
    filename: 'exterior-modern.png',
    prompt: 'Create a modern house exterior architectural photograph. Flat roof, floor-to-ceiling glass walls, minimalist landscaping, concrete and wood materials, geometric design. Dusk lighting with subtle architectural illumination, professional photography, photorealistic, no text, no borders.',
    category: 'Exterior',
    style: 'Modern'
  },
  {
    filename: 'exterior-mediterranean.png',
    prompt: 'Create a Mediterranean villa exterior photograph. White stucco walls, terracotta roof tiles, arched windows and doorways, bougainvillea climbing walls, stone pathways. Golden hour lighting, professional architectural photography, photorealistic, no text, no borders.',
    category: 'Exterior',
    style: 'Mediterranean'
  },
  {
    filename: 'garden-japanese.png',
    prompt: 'Create a serene Japanese zen garden photograph. Carefully raked white gravel patterns, strategically placed stones, small wooden bridge over koi pond, pruned maple trees, bamboo elements. Morning mist atmosphere, professional landscape photography, photorealistic, no text, no borders.',
    category: 'Garden',
    style: 'Japanese Zen'
  },
  {
    filename: 'garden-modern.png',
    prompt: 'Create a modern minimalist garden photograph. Geometric concrete planters, structured boxwood hedges, linear water feature, contemporary outdoor sculpture, clean architectural lines. Professional landscape photography, photorealistic, no text, no borders.',
    category: 'Garden',
    style: 'Modern'
  },
  {
    filename: 'hotels-luxury.png',
    prompt: 'Create a luxury hotel lobby interior photograph. Double-height ceiling, polished marble floors, crystal chandelier, velvet seating areas, grand marble staircase. Evening ambiance with warm golden lighting, professional hospitality photography, photorealistic, no text, no borders.',
    category: 'Hotels',
    style: 'Luxury'
  },
  {
    filename: 'hotels-boutique.png',
    prompt: 'Create a boutique hotel room interior photograph. Designer furniture, statement pendant lighting, luxury white bedding, curated modern art, floor-to-ceiling windows with city views. Sophisticated contemporary style, professional photography, photorealistic, no text, no borders.',
    category: 'Hotels',
    style: 'Boutique'
  },
  {
    filename: 'commercial-modern.png',
    prompt: 'Create a modern retail store interior photograph. Minimalist display systems, polished concrete floors, track lighting, open airy layout, white walls, clean aesthetic. Apple store inspiration, professional commercial photography, photorealistic, no text, no borders.',
    category: 'Commercial',
    style: 'Modern Retail'
  },
  {
    filename: 'commercial-restaurant.png',
    prompt: 'Create a trendy restaurant interior photograph. Exposed industrial ceiling, mixed seating areas, warm ambient lighting, open kitchen concept, industrial-chic design, wooden tables. Evening dining atmosphere, professional photography, photorealistic, no text, no borders.',
    category: 'Commercial',
    style: 'Restaurant'
  }
];

/**
 * Generate image using Gemini 2.5 Flash Image Preview
 */
async function generateImageWithGemini(spec) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      contents: [{
        parts: [{
          text: spec.prompt
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Length': Buffer.byteLength(requestData)
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
            reject(new Error(`Gemini API Error: ${response.error.message}`));
            return;
          }

          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const parts = response.candidates[0].content.parts;
            
            // Look for inline image data
            for (const part of parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, 'base64');
                
                resolve({
                  success: true,
                  buffer,
                  mimeType: part.inlineData.mimeType || 'image/png'
                });
                return;
              }
            }
            
            // If no image data found
            reject(new Error('No image data found in response'));
          } else {
            reject(new Error('Invalid response structure'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(requestData);
    req.end();
  });
}

/**
 * Save image buffer to file
 */
async function saveImageFile(filename, buffer) {
  const filepath = path.join(OUTPUT_DIR, filename);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filepath);
      }
    });
  });
}

/**
 * Main generation function
 */
async function generateAllImages() {
  console.log('🎨 Gemini Image Generation - Masonry Gallery');
  console.log('===========================================\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in environment variables');
    console.log('Please add GEMINI_API_KEY to your .env file');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`);
  console.log(`🤖 Using model: gemini-2.5-flash-image-preview`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📸 Images to generate: ${imageSpecs.length}\n`);

  // Clean up old files
  console.log('🧹 Cleaning up old files...');
  const existingFiles = fs.readdirSync(OUTPUT_DIR);
  let removedCount = 0;
  
  existingFiles.forEach(file => {
    if (file.endsWith('.svg')) {
      const filePath = path.join(OUTPUT_DIR, file);
      fs.unlinkSync(filePath);
      console.log(`   Removed: ${file}`);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`   Removed ${removedCount} old SVG files\n`);
  } else {
    console.log('   No old files to remove\n');
  }

  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < imageSpecs.length; i++) {
    const spec = imageSpecs[i];
    console.log(`[${i + 1}/${imageSpecs.length}] Generating ${spec.filename}...`);
    console.log(`   Style: ${spec.category} - ${spec.style}`);
    console.log(`   Prompt: ${spec.prompt.substring(0, 80)}...`);
    
    try {
      // Check if file already exists
      const filepath = path.join(OUTPUT_DIR, spec.filename);
      if (fs.existsSync(filepath)) {
        console.log(`   ✅ Already exists, skipping...`);
        results.push({ filename: spec.filename, success: true, skipped: true });
        continue;
      }
      
      // Generate with Gemini
      console.log(`   🤖 Calling Gemini API...`);
      const result = await generateImageWithGemini(spec);
      
      if (result.success) {
        // Save the image
        await saveImageFile(spec.filename, result.buffer);
        
        const fileSize = Math.round(result.buffer.length / 1024);
        console.log(`   ✅ Generated successfully! (${fileSize}KB)`);
        results.push({ 
          filename: spec.filename, 
          success: true, 
          generated: true, 
          size: result.buffer.length 
        });
      } else {
        throw new Error('Generation failed');
      }
      
      // Rate limiting - wait between requests
      if (i < imageSpecs.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next request...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({ 
        filename: spec.filename, 
        success: false, 
        error: error.message 
      });
    }
    
    console.log('');
  }

  // Summary
  const endTime = Date.now();
  const totalTime = Math.round((endTime - startTime) / 1000);
  
  console.log('📊 Generation Summary');
  console.log('====================');
  const successful = results.filter(r => r.success).length;
  const generated = results.filter(r => r.generated).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`🤖 Generated with AI: ${generated}`);
  console.log(`⏭️  Skipped (existing): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total time: ${totalTime} seconds`);
  
  if (generated > 0) {
    const totalSize = results.filter(r => r.size).reduce((sum, r) => sum + r.size, 0);
    console.log(`📁 Total size: ${Math.round(totalSize / 1024)}KB`);
  }
  
  console.log(`📁 Images saved to: ${OUTPUT_DIR}\n`);

  // Create comprehensive index
  const indexData = {
    generated: new Date().toISOString(),
    model: 'gemini-2.5-flash-image-preview',
    format: 'PNG',
    totalImages: imageSpecs.length,
    successful,
    generated,
    failed,
    totalGenerationTime: totalTime,
    images: results.map((result, index) => ({
      filename: result.filename,
      category: imageSpecs[index].category,
      style: imageSpecs[index].style,
      prompt: imageSpecs[index].prompt,
      success: result.success,
      generated: result.generated || false,
      skipped: result.skipped || false,
      size: result.size || null,
      error: result.error || null
    }))
  };

  const indexPath = path.join(OUTPUT_DIR, 'gemini-images-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`📋 Created comprehensive index: gemini-images-index.json`);
  
  console.log('\n✨ Gemini image generation complete!');
  console.log('All images are high-quality PNG files ready for React Native!');
  
  if (failed > 0) {
    console.log(`\n⚠️  ${failed} images failed to generate. Check the index file for details.`);
  }
  
  return results;
}

// Run the generator
if (require.main === module) {
  generateAllImages()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateAllImages };