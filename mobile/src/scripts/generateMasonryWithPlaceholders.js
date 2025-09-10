#!/usr/bin/env node

/**
 * Generate High-Quality Style-Specific Placeholders for Masonry Gallery
 * Since the Gemini API key is expired, this creates sophisticated placeholders
 * based on the comprehensive style categories
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Extended style combinations based on your style selection screen
const STYLE_COMBINATIONS = [
  // From your style selection screen examples
  { style: 'Modern', category: 'contemporary', color: { r: 200, g: 210, b: 220 }, rooms: ['living-room', 'kitchen', 'bedroom', 'bathroom'] },
  { style: 'Tropical', category: 'themed', color: { r: 180, g: 220, b: 180 }, rooms: ['living-room', 'bathroom', 'bedroom', 'patio'] },
  { style: 'Minimalistic', category: 'contemporary', color: { r: 250, g: 250, b: 252 }, rooms: ['living-room', 'kitchen', 'bedroom', 'office'] },
  { style: 'Bohemian', category: 'artistic', color: { r: 180, g: 140, b: 120 }, rooms: ['living-room', 'bedroom', 'office', 'studio'] },
  { style: 'Rustic', category: 'natural', color: { r: 160, g: 140, b: 120 }, rooms: ['kitchen', 'living-room', 'bedroom', 'dining'] },
  { style: 'Vintage', category: 'classic', color: { r: 190, g: 170, b: 150 }, rooms: ['living-room', 'bedroom', 'office', 'library'] },
  { style: 'Baroque', category: 'luxury', color: { r: 150, g: 130, b: 100 }, rooms: ['living-room', 'dining', 'bedroom', 'study'] },
  { style: 'Mediterranean', category: 'cultural', color: { r: 230, g: 200, b: 160 }, rooms: ['living-room', 'kitchen', 'patio', 'bedroom'] },
  
  // Additional regional/cultural influences you mentioned
  { style: 'Italian', category: 'cultural', color: { r: 220, g: 190, b: 150 }, rooms: ['kitchen', 'dining', 'living-room', 'terrace'] },
  { style: 'Spanish', category: 'cultural', color: { r: 210, g: 170, b: 130 }, rooms: ['courtyard', 'kitchen', 'living-room', 'bedroom'] },
  { style: 'Provence', category: 'cultural', color: { r: 240, g: 220, b: 190 }, rooms: ['kitchen', 'dining', 'bedroom', 'garden'] },
  { style: 'Scandinavian', category: 'cultural', color: { r: 248, g: 246, b: 240 }, rooms: ['living-room', 'bedroom', 'kitchen', 'office'] },
  { style: 'Industrial', category: 'urban', color: { r: 120, g: 120, b: 130 }, rooms: ['loft', 'kitchen', 'office', 'bathroom'] },
  { style: 'Art Deco', category: 'luxury', color: { r: 150, g: 130, b: 100 }, rooms: ['lobby', 'living-room', 'bedroom', 'bar'] },
  { style: 'Japanese Zen', category: 'cultural', color: { r: 200, g: 220, b: 200 }, rooms: ['living-room', 'bathroom', 'meditation', 'bedroom'] },
  { style: 'Moroccan', category: 'cultural', color: { r: 180, g: 140, b: 100 }, rooms: ['living-room', 'bathroom', 'bedroom', 'courtyard'] },
  { style: 'French Country', category: 'cultural', color: { r: 220, g: 200, b: 180 }, rooms: ['kitchen', 'living-room', 'bedroom', 'dining'] },
  { style: 'English Country', category: 'cultural', color: { r: 210, g: 190, b: 170 }, rooms: ['living-room', 'library', 'bedroom', 'conservatory'] },
  { style: 'Contemporary', category: 'modern', color: { r: 240, g: 240, b: 245 }, rooms: ['living-room', 'kitchen', 'office', 'bedroom'] },
  { style: 'Transitional', category: 'classic', color: { r: 220, g: 210, b: 200 }, rooms: ['living-room', 'dining', 'bedroom', 'office'] },
  { style: 'Coastal', category: 'themed', color: { r: 200, g: 220, b: 240 }, rooms: ['living-room', 'bedroom', 'bathroom', 'deck'] },
  { style: 'Luxury Modern', category: 'luxury', color: { r: 180, g: 170, b: 160 }, rooms: ['penthouse', 'master-suite', 'wine-cellar', 'spa'] },
  { style: 'Mid-Century Modern', category: 'vintage', color: { r: 200, g: 160, b: 120 }, rooms: ['living-room', 'den', 'kitchen', 'office'] },
  { style: 'Shabby Chic', category: 'vintage', color: { r: 240, g: 220, b: 220 }, rooms: ['bedroom', 'craft-room', 'kitchen', 'nursery'] },
  { style: 'Lodge', category: 'rustic', color: { r: 160, g: 140, b: 120 }, rooms: ['great-room', 'cabin-bedroom', 'kitchen', 'deck'] },
  
  // Additional global influences
  { style: 'Greek Island', category: 'cultural', color: { r: 240, g: 250, b: 255 }, rooms: ['terrace', 'bedroom', 'kitchen', 'courtyard'] },
  { style: 'Portuguese', category: 'cultural', color: { r: 200, g: 180, b: 160 }, rooms: ['kitchen', 'bathroom', 'living-room', 'patio'] },
  { style: 'Swiss Chalet', category: 'cultural', color: { r: 180, g: 160, b: 140 }, rooms: ['living-room', 'bedroom', 'kitchen', 'balcony'] },
  { style: 'Dutch Modern', category: 'cultural', color: { r: 230, g: 230, b: 235 }, rooms: ['living-room', 'kitchen', 'office', 'loft'] },
  { style: 'Austrian Imperial', category: 'luxury', color: { r: 170, g: 150, b: 130 }, rooms: ['salon', 'dining', 'bedroom', 'library'] },
  { style: 'Irish Cottage', category: 'rustic', color: { r: 180, g: 200, b: 160 }, rooms: ['living-room', 'kitchen', 'bedroom', 'garden'] },
  { style: 'Scottish Highland', category: 'rustic', color: { r: 140, g: 160, b: 120 }, rooms: ['great-hall', 'bedroom', 'library', 'whisky-room'] },
  
  // American regional styles
  { style: 'California Casual', category: 'regional', color: { r: 230, g: 220, b: 200 }, rooms: ['living-room', 'kitchen', 'patio', 'pool-house'] },
  { style: 'Southern Charm', category: 'regional', color: { r: 220, g: 210, b: 190 }, rooms: ['porch', 'living-room', 'dining', 'bedroom'] },
  { style: 'New England Colonial', category: 'regional', color: { r: 210, g: 200, b: 180 }, rooms: ['living-room', 'kitchen', 'study', 'bedroom'] },
  { style: 'Southwestern Adobe', category: 'regional', color: { r: 200, g: 160, b: 120 }, rooms: ['courtyard', 'living-room', 'kitchen', 'bedroom'] },
  { style: 'Pacific Northwest', category: 'regional', color: { r: 160, g: 180, b: 140 }, rooms: ['living-room', 'kitchen', 'office', 'deck'] },
  { style: 'Texas Ranch', category: 'regional', color: { r: 180, g: 150, b: 120 }, rooms: ['great-room', 'kitchen', 'master-suite', 'porch'] },
  { style: 'Colorado Mountain', category: 'regional', color: { r: 160, g: 140, b: 120 }, rooms: ['great-room', 'kitchen', 'bedroom', 'ski-room'] },
  
  // Additional thematic styles
  { style: 'Art Nouveau', category: 'artistic', color: { r: 160, g: 180, b: 140 }, rooms: ['living-room', 'bedroom', 'study', 'conservatory'] },
  { style: 'Maximalist', category: 'artistic', color: { r: 160, g: 140, b: 180 }, rooms: ['living-room', 'bedroom', 'office', 'library'] },
  { style: 'Eclectic', category: 'artistic', color: { r: 200, g: 180, b: 160 }, rooms: ['living-room', 'studio', 'bedroom', 'library'] },
  { style: 'Glam', category: 'luxury', color: { r: 180, g: 160, b: 180 }, rooms: ['living-room', 'bedroom', 'dressing-room', 'bar'] },
  { style: 'Farmhouse', category: 'rustic', color: { r: 210, g: 200, b: 180 }, rooms: ['kitchen', 'living-room', 'bedroom', 'porch'] }
];

/**
 * Create sophisticated gradient placeholder
 */
function createStylizedPlaceholder(style, room, color) {
  try {
    const PNG = require('pngjs').PNG;
    const width = 512;
    const height = 512;
    
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        
        // Create sophisticated multi-layer gradient
        const centerX = width * 0.5;
        const centerY = height * 0.4; // Slightly off-center for visual interest
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
        
        // Primary radial gradient
        const radialFactor = 1 - (distance / maxDistance) * 0.3;
        
        // Horizontal gradient overlay
        const horizontalFactor = 1 - Math.abs(x - centerX) / centerX * 0.15;
        
        // Vertical gradient overlay  
        const verticalFactor = 1 - Math.abs(y - centerY) / centerY * 0.1;
        
        // Style-specific texture patterns
        let texture = 0;
        switch (style.toLowerCase()) {
          case 'industrial':
            texture = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 15;
            break;
          case 'bohemian':
          case 'moroccan':
            texture = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 12;
            break;
          case 'minimalistic':
          case 'scandinavian':
            texture = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 5;
            break;
          case 'baroque':
          case 'luxury modern':
            texture = Math.sin(x * 0.08) * Math.cos(y * 0.12) * 20;
            break;
          default:
            texture = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 8;
        }
        
        // Combine all factors
        const combinedFactor = radialFactor * horizontalFactor * verticalFactor;
        
        // Apply colors with texture
        png.data[idx] = Math.max(0, Math.min(255, color.r * combinedFactor + texture));
        png.data[idx + 1] = Math.max(0, Math.min(255, color.g * combinedFactor + texture));
        png.data[idx + 2] = Math.max(0, Math.min(255, color.b * combinedFactor + texture));
        png.data[idx + 3] = 255; // Alpha
      }
    }

    return PNG.sync.write(png);
  } catch (e) {
    // Fallback if pngjs not available
    return Buffer.alloc(100); // Minimal buffer
  }
}

/**
 * Generate all style combinations
 */
async function generateAllPlaceholders() {
  console.log('🎨 High-Quality Masonry Placeholder Generator');
  console.log('===========================================');
  console.log(`📋 Generating ${STYLE_COMBINATIONS.reduce((sum, style) => sum + style.rooms.length, 0)} style-specific images\n`);

  // Install pngjs if needed
  try {
    require('pngjs');
    console.log('✅ pngjs found');
  } catch (e) {
    console.log('📦 Installing pngjs...');
    try {
      require('child_process').execSync('npm install pngjs', { cwd: path.join(__dirname, '../../'), stdio: 'inherit' });
      console.log('✅ pngjs installed');
    } catch (installError) {
      console.log('⚠️  Could not install pngjs, using basic placeholders');
    }
  }

  let totalGenerated = 0;
  const metadata = {
    generated: new Date().toISOString(),
    totalImages: 0,
    styles: []
  };

  for (const styleConfig of STYLE_COMBINATIONS) {
    console.log(`\n🎨 ${styleConfig.style} (${styleConfig.category})`);
    
    const styleData = {
      style: styleConfig.style,
      category: styleConfig.category,
      rooms: []
    };

    for (const room of styleConfig.rooms) {
      const filename = `${styleConfig.category}-${styleConfig.style.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${room}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      console.log(`   📸 ${room} → ${filename}`);
      
      try {
        const buffer = createStylizedPlaceholder(styleConfig.style, room, styleConfig.color);
        fs.writeFileSync(filepath, buffer);
        
        const sizeKB = Math.round(buffer.length / 1024);
        console.log(`      ✅ Generated (${sizeKB}KB)`);
        
        totalGenerated++;
        styleData.rooms.push({
          room,
          filename,
          fileSize: buffer.length
        });
        
      } catch (error) {
        console.error(`      ❌ Failed: ${error.message}`);
      }
    }
    
    metadata.styles.push(styleData);
  }

  metadata.totalImages = totalGenerated;

  // Save metadata
  const metadataFile = path.join(OUTPUT_DIR, 'style-placeholder-index.json');
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  console.log('\n📊 Generation Summary');
  console.log('====================');
  console.log(`✅ Total images generated: ${totalGenerated}`);
  console.log(`🎨 Total styles covered: ${STYLE_COMBINATIONS.length}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`📋 Metadata saved: style-placeholder-index.json`);

  console.log('\n🔑 To generate real AI images:');
  console.log('1. Get a new Gemini API key from https://aistudio.google.com/app/apikey');
  console.log('2. Update the GEMINI_API_KEY in your .env file');
  console.log('3. Run the comprehensive generation script again');
  
  return metadata;
}

// Export for use as module
module.exports = { generateAllPlaceholders, STYLE_COMBINATIONS };

// Run if called directly
if (require.main === module) {
  generateAllPlaceholders()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}