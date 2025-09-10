#!/usr/bin/env node

/**
 * Generate Style Images using Gemini 2.5 Flash
 * This script generates interior design images for various styles and categories
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Priority images to generate first
const PRIORITY_IMAGES = [
  // Interior styles
  {
    filename: 'interior-modern.png',
    prompt: 'Ultra-modern interior living room with floor-to-ceiling windows, minimalist white furniture, polished concrete floors, and dramatic natural lighting. Professional architectural photography, photorealistic, high resolution, magazine quality',
  },
  {
    filename: 'interior-scandinavian.png',
    prompt: 'Cozy Scandinavian living room with white walls, light wood floors, comfortable grey sofa, soft knit throws, potted plants, and warm natural light. Hygge atmosphere, professional interior photography',
  },
  {
    filename: 'interior-industrial.png',
    prompt: 'Industrial loft living space with exposed brick walls, metal beam ceiling, concrete floors, vintage leather furniture, Edison bulb lighting. Urban warehouse conversion, professional photography',
  },
  {
    filename: 'interior-bohemian.png',
    prompt: 'Bohemian bedroom with layered textiles, macrame wall hangings, vintage rugs, plants everywhere, warm earth tones, eclectic furniture mix. Cozy artistic atmosphere, professional interior photography',
  },
  {
    filename: 'interior-minimalist.png',
    prompt: 'Ultra-minimalist bedroom with platform bed, white walls, hidden storage, single piece of art, maximum negative space. Zen-like serenity, professional architectural photography',
  },
  
  // Exterior styles
  {
    filename: 'exterior-modern.png',
    prompt: 'Modern house exterior with flat roof, glass walls, minimalist landscaping, concrete and wood materials. Dusk with architectural lighting, professional photography',
  },
  {
    filename: 'exterior-mediterranean.png',
    prompt: 'Mediterranean villa exterior with white stucco walls, terracotta roof tiles, arched windows, bougainvillea climbing walls. Golden hour light, professional architectural photography',
  },
  
  // Garden styles
  {
    filename: 'garden-japanese.png',
    prompt: 'Serene Japanese zen garden with raked gravel patterns, carefully placed stones, small bridge over koi pond, pruned trees. Morning mist, professional landscape photography',
  },
  {
    filename: 'garden-modern.png',
    prompt: 'Modern minimalist garden with geometric planters, structured hedges, water feature, outdoor sculpture, clean lines throughout. Professional landscape photography',
  },
  
  // Hotel styles
  {
    filename: 'hotels-luxury.png',
    prompt: 'Luxury hotel lobby with double-height ceiling, marble floors, crystal chandelier, velvet seating, grand staircase. Evening ambiance with warm lighting, professional hospitality photography',
  },
  {
    filename: 'hotels-boutique.png',
    prompt: 'Boutique hotel room with designer furniture, statement lighting, luxury bedding, curated art, city views through large windows. Sophisticated modern style, professional photography',
  },
  
  // Commercial styles
  {
    filename: 'commercial-modern.png',
    prompt: 'Modern retail store interior with minimalist display systems, polished concrete floors, track lighting, open layout. Apple store aesthetic, professional commercial photography',
  },
  {
    filename: 'commercial-restaurant.png',
    prompt: 'Trendy restaurant interior with exposed ceiling, mixed seating areas, warm lighting, open kitchen concept, industrial-chic design. Evening atmosphere, professional photography',
  },
];

/**
 * Call Gemini API to generate image
 */
async function callGeminiAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a photorealistic image: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generate placeholder image for now
 * This creates a simple colored rectangle with text
 */
function generatePlaceholderImage(imageSpec) {
  const { filename, prompt } = imageSpec;
  
  // Extract style info from filename
  const [category, style] = filename.replace('.png', '').split('-');
  
  // Simple SVG placeholder
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <text x="256" y="240" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#333">
    ${category.toUpperCase()}
  </text>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#666">
    ${style} style
  </text>
  <rect x="40" y="40" width="432" height="432" fill="none" stroke="#ccc" stroke-width="2" rx="8"/>
</svg>`;

  return Buffer.from(svg);
}

/**
 * Save image to file
 */
async function saveImage(filename, imageData) {
  const filepath = path.join(OUTPUT_DIR, filename);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, imageData, (err) => {
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
async function generateImages() {
  console.log('🎨 Compozit Vision - Masonry Image Generator');
  console.log('==========================================\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in environment variables');
    console.log('Please add GEMINI_API_KEY to your .env file');
    process.exit(1);
  }

  console.log(`✅ API Key found: ${GEMINI_API_KEY.substring(0, 10)}...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📸 Images to generate: ${PRIORITY_IMAGES.length}\n`);

  const results = [];
  
  for (let i = 0; i < PRIORITY_IMAGES.length; i++) {
    const imageSpec = PRIORITY_IMAGES[i];
    console.log(`[${i + 1}/${PRIORITY_IMAGES.length}] Generating ${imageSpec.filename}...`);
    
    try {
      // Check if file already exists
      const filepath = path.join(OUTPUT_DIR, imageSpec.filename);
      if (fs.existsSync(filepath)) {
        console.log(`   ✅ Already exists, skipping...`);
        results.push({ filename: imageSpec.filename, success: true, skipped: true });
        continue;
      }
      
      // For now, generate placeholder images
      // TODO: When Gemini image generation endpoint is available, use callGeminiAPI
      const imageData = generatePlaceholderImage(imageSpec);
      
      // Save the image
      await saveImage(imageSpec.filename, imageData);
      
      console.log(`   ✅ Saved successfully!`);
      results.push({ filename: imageSpec.filename, success: true });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({ filename: imageSpec.filename, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n📊 Generation Summary');
  console.log('====================');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  
  console.log(`✅ Successful: ${successful} (${skipped} already existed)`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Images saved to: ${OUTPUT_DIR}\n`);

  // Create an index file
  const indexData = {
    generated: new Date().toISOString(),
    totalImages: PRIORITY_IMAGES.length,
    successful,
    failed,
    images: PRIORITY_IMAGES.map(img => ({
      filename: img.filename,
      category: img.filename.split('-')[0],
      style: img.filename.split('-')[1].replace('.png', ''),
      prompt: img.prompt
    }))
  };

  const indexPath = path.join(OUTPUT_DIR, 'masonry-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`📋 Created index file: masonry-index.json`);
}

// Run the generator
if (require.main === module) {
  generateImages()
    .then(() => {
      console.log('\n✨ Image generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateImages };