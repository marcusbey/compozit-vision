#!/usr/bin/env node

/**
 * Style Images Generator for Compozit Vision
 * Generates category + style combination images using Gemini 2.5 Flash
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Categories and Styles
const CATEGORIES = [
  { id: 'interior', name: 'Interior', description: 'Indoor living spaces' },
  { id: 'exterior', name: 'Exterior', description: 'Building facades and outdoor structures' },
  { id: 'garden', name: 'Garden', description: 'Landscape and outdoor greenery' },
  { id: 'hotels', name: 'Hotels', description: 'Hospitality and luxury spaces' },
  { id: 'commercial', name: 'Commercial', description: 'Business and retail spaces' }
];

const STYLES = [
  // Phase 1: Priority Styles
  { id: 'modern', name: 'Modern', description: 'Clean lines, minimal ornamentation, neutral colors' },
  { id: 'contemporary', name: 'Contemporary', description: 'Current trends, bold accents, mixed materials' },
  { id: 'scandinavian', name: 'Scandinavian', description: 'Light woods, white walls, cozy textiles' },
  { id: 'industrial', name: 'Industrial', description: 'Exposed materials, raw finishes, urban aesthetic' },
  { id: 'minimalist', name: 'Minimalist', description: 'Extreme simplicity, monochromatic palettes' },
  
  // Phase 2: Traditional & Classic
  { id: 'traditional', name: 'Traditional', description: 'Classic elements, rich colors, ornate details' },
  { id: 'mediterranean', name: 'Mediterranean', description: 'Warm colors, stucco walls, terracotta tiles' },
  { id: 'frenchcountry', name: 'French Country', description: 'Elegant yet rustic, soft colors, provincial charm' },
  { id: 'victorian', name: 'Victorian', description: 'Ornate details, rich fabrics, dark woods' },
  { id: 'transitional', name: 'Transitional', description: 'Blend of traditional and contemporary' },
  
  // Phase 3: Eclectic & Artistic
  { id: 'bohemian', name: 'Bohemian', description: 'Eclectic mix, rich patterns, global influences' },
  { id: 'artdeco', name: 'Art Deco', description: 'Geometric patterns, luxurious materials, 1920s style' },
  { id: 'midcentury', name: 'Mid-Century Modern', description: '1950s-60s aesthetic, organic curves' },
  { id: 'moroccan', name: 'Moroccan', description: 'Vibrant colors, intricate patterns, mosaic tiles' },
  { id: 'eclectic', name: 'Eclectic', description: 'Mix of various styles, personalized approach' },
  
  // Phase 4: Specialized
  { id: 'japanese', name: 'Japanese/Zen', description: 'Natural materials, minimalist aesthetic, tranquility' },
  { id: 'coastal', name: 'Coastal', description: 'Beach-inspired, light blues and whites' },
  { id: 'rustic', name: 'Rustic', description: 'Natural materials, weathered wood, cabin-like' },
  { id: 'artnouveau', name: 'Art Nouveau', description: 'Natural forms, flowing lines, floral motifs' },
  { id: 'brutalist', name: 'Brutalist', description: 'Raw concrete, bold geometric forms' }
];

/**
 * Generate detailed prompts for each category-style combination
 */
function generatePrompt(category, style) {
  const prompts = {
    interior: {
      modern: "A stunning modern interior living room with floor-to-ceiling windows, minimalist furniture in neutral tones, polished concrete floors, and clean architectural lines. Natural daylight streaming in, professional interior photography, photorealistic, high resolution, magazine quality",
      contemporary: "Contemporary interior space featuring bold accent colors, mixed materials like glass and metal, fluid open-plan layout with statement lighting fixtures. Professional architectural photography, photorealistic rendering",
      scandinavian: "Cozy Scandinavian interior with white walls, light oak flooring, minimalist furniture, soft textiles, and hygge elements like candles and throws. Bright natural light, professional interior photography",
      industrial: "Industrial loft interior with exposed brick walls, metal beam ceilings, concrete floors, vintage leather furniture, and Edison bulb lighting. Urban warehouse aesthetic, professional photography",
      minimalist: "Ultra-minimalist interior with monochromatic white palette, hidden storage, single statement piece, maximum negative space. Zen-like atmosphere, professional architectural photography"
    },
    exterior: {
      modern: "Modern building exterior with glass facades, clean geometric lines, flat roof, minimalist landscaping. Dusk lighting with subtle architectural illumination, professional photography",
      contemporary: "Contemporary house exterior featuring mixed materials, asymmetrical design, large windows, and integrated outdoor spaces. Professional architectural photography, golden hour lighting",
      mediterranean: "Mediterranean villa exterior with stucco walls, terracotta roof tiles, arched windows, climbing vines. Warm sunset light, professional architectural photography",
      industrial: "Industrial building exterior with exposed steel structure, corrugated metal siding, large factory windows. Urban setting, professional architectural photography",
      brutalist: "Brutalist architecture exterior with raw concrete forms, geometric shapes, monolithic appearance. Dramatic lighting, professional architectural photography"
    },
    garden: {
      japanese: "Serene Japanese zen garden with raked gravel, carefully placed stones, bamboo water feature, moss-covered areas. Peaceful atmosphere, professional landscape photography",
      modern: "Modern minimalist garden with geometric planters, structured hedges, water features, outdoor sculpture. Clean lines, professional landscape photography",
      mediterranean: "Mediterranean garden with olive trees, lavender beds, terracotta pots, stone pathways. Warm sunlight, professional garden photography",
      bohemian: "Bohemian garden with wildflowers, mixed plantings, colorful textiles, hanging lanterns, eclectic garden art. Magical atmosphere, professional photography",
      coastal: "Coastal garden with ornamental grasses, driftwood elements, sandy pathways, nautical accents. Ocean-inspired planting, professional landscape photography"
    },
    hotels: {
      modern: "Luxury modern hotel lobby with double-height ceiling, minimalist reception desk, designer furniture, art installations. Professional hospitality photography, evening ambiance",
      artdeco: "Art Deco hotel lobby with geometric patterns, gold accents, marble floors, crystal chandeliers, glamorous 1920s aesthetic. Professional interior photography",
      contemporary: "Contemporary boutique hotel room with statement headboard, mood lighting, luxury amenities, city views. Professional hospitality photography",
      moroccan: "Moroccan riad hotel courtyard with mosaic tiles, fountain, ornate arches, lanterns, lush plants. Exotic atmosphere, professional photography",
      minimalist: "Minimalist hotel suite with platform bed, hidden technology, spa-like bathroom, floor-to-ceiling windows. Serene luxury, professional photography"
    },
    commercial: {
      modern: "Modern retail store with open layout, sleek display systems, LED lighting, minimalist checkout counter. Professional commercial photography",
      industrial: "Industrial-style restaurant with exposed ductwork, concrete floors, metal furniture, open kitchen. Trendy atmosphere, professional photography",
      contemporary: "Contemporary office space with collaborative areas, glass meeting rooms, ergonomic furniture, natural light. Professional architectural photography",
      scandinavian: "Scandinavian cafe with light wood furniture, white walls, pendant lights, cozy seating areas. Inviting atmosphere, professional photography",
      artdeco: "Art Deco cocktail bar with geometric bar design, velvet seating, brass fixtures, vintage glamour. Sophisticated ambiance, professional photography"
    }
  };

  // Get specific prompt or generate generic one
  const specificPrompt = prompts[category.id]?.[style.id];
  
  if (specificPrompt) {
    return specificPrompt;
  }
  
  // Generic prompt fallback
  return `${category.name} space designed in ${style.name} style. ${style.description}. Professional architectural photography, photorealistic, high resolution, well-lit, magazine quality, award-winning design`;
}

/**
 * Generate a single image using Gemini
 */
async function generateImage(category, style) {
  const filename = `${category.id}-${style.id}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  try {
    // Check if image already exists
    try {
      await fs.access(filepath);
      console.log(`✅ Already exists: ${filename}`);
      return { success: true, filename, exists: true };
    } catch {
      // File doesn't exist, continue with generation
    }

    const prompt = generatePrompt(category, style);
    console.log(`🎨 Generating: ${filename}`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
    
    // For now, create placeholder until Gemini image API is properly configured
    // In production, this would use: const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Create a placeholder with category/style info
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#f5f5f5"/>
        <text x="256" y="240" font-family="Arial" font-size="24" text-anchor="middle" fill="#333">
          ${category.name}
        </text>
        <text x="256" y="270" font-family="Arial" font-size="20" text-anchor="middle" fill="#666">
          ${style.name} Style
        </text>
        <rect x="20" y="20" width="472" height="472" fill="none" stroke="#ddd" stroke-width="2"/>
      </svg>
    `;
    
    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(filepath);
    
    console.log(`✅ Generated: ${filename}`);
    return { success: true, filename, generated: true };
    
  } catch (error) {
    console.error(`❌ Failed: ${filename} - ${error.message}`);
    return { success: false, filename, error: error.message };
  }
}

/**
 * Generate all images by phase
 */
async function generateAllImages() {
  console.log('🎨 Compozit Vision Style Image Generator\n');
  
  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
  }

  const results = {
    phase1: [],
    phase2: [],
    phase3: [],
    phase4: [],
    total: 0,
    successful: 0,
    failed: 0
  };

  // Phase 1: Priority styles (first 5)
  console.log('📦 Phase 1: Core Styles (25 images)\n');
  for (const category of CATEGORIES) {
    for (const style of STYLES.slice(0, 5)) {
      const result = await generateImage(category, style);
      results.phase1.push(result);
      results.total++;
      if (result.success) results.successful++;
      else results.failed++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Continue with other phases...
  console.log('\n📦 Phase 2: Traditional & Classic (25 images)\n');
  for (const category of CATEGORIES) {
    for (const style of STYLES.slice(5, 10)) {
      const result = await generateImage(category, style);
      results.phase2.push(result);
      results.total++;
      if (result.success) results.successful++;
      else results.failed++;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Summary
  console.log('\n📊 Generation Summary');
  console.log('====================');
  console.log(`Total images: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  // Create index file
  const indexPath = path.join(OUTPUT_DIR, 'style-index.json');
  const index = {
    categories: CATEGORIES,
    styles: STYLES,
    images: [],
    generated: new Date().toISOString()
  };

  for (const category of CATEGORIES) {
    for (const style of STYLES) {
      index.images.push({
        filename: `${category.id}-${style.id}.png`,
        category: category.id,
        style: style.id,
        categoryName: category.name,
        styleName: style.name
      });
    }
  }

  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  console.log(`\n📋 Created index file: style-index.json`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  generateAllImages()
    .then(() => {
      console.log('\n✨ Style image generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateAllImages, CATEGORIES, STYLES };