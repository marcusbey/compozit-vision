#!/usr/bin/env ts-node

/**
 * Generate Interior Design Images for Masonry Gallery
 * Creates small showcase images for the mobile app onboarding screen
 */

import * as fs from 'fs';
import * as path from 'path';

// Image specifications for masonry gallery
interface MasonryImageSpec {
  filename: string;
  prompt: string;
  style: string;
  room: string;
  orientation: 'portrait' | 'landscape' | 'square';
  size: { width: number; height: number };
}

const MASONRY_IMAGES: MasonryImageSpec[] = [
  {
    filename: 'modern-living-room.png',
    prompt: 'A modern minimalist living room with clean lines, neutral colors, sleek furniture, and abundant natural light. Professional interior design photography.',
    style: 'Modern Minimalist',
    room: 'Living Room',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'industrial-kitchen.png',
    prompt: 'An industrial style kitchen with exposed brick walls, stainless steel appliances, concrete countertops, and Edison bulb lighting. Professional interior photography.',
    style: 'Industrial',
    room: 'Kitchen',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'bohemian-bedroom.png',
    prompt: 'A bohemian bedroom with warm earth tones, layered textiles, macrame wall hangings, plants, and cozy ambient lighting. Professional interior design photo.',
    style: 'Bohemian',
    room: 'Bedroom',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'vintage-workspace.png',
    prompt: 'A vintage home office with antique wooden desk, leather chair, bookshelves, typewriter, warm lighting, and classic decor. Professional interior photography.',
    style: 'Vintage',
    room: 'Workspace',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'scandinavian-living-room.png',
    prompt: 'A Scandinavian living room with white walls, light wood furniture, cozy textiles, hygge elements, and natural light. Professional interior design photography.',
    style: 'Scandinavian',
    room: 'Living Room',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'minimalist-bedroom.png',
    prompt: 'A minimalist bedroom with clean white linens, simple furniture, organized space, natural materials, and serene atmosphere. Professional interior photography.',
    style: 'Minimalist',
    room: 'Bedroom',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'modern-kitchen-island.png',
    prompt: 'A contemporary kitchen with marble island, pendant lights, white cabinets, stainless appliances, and modern design. Professional interior design photo.',
    style: 'Contemporary',
    room: 'Kitchen',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'industrial-workspace.png',
    prompt: 'An industrial workspace with metal furniture, exposed pipes, concrete floors, vintage equipment, and moody lighting. Professional interior photography.',
    style: 'Industrial',
    room: 'Workspace',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'cozy-reading-nook.png',
    prompt: 'A cozy reading nook with comfortable armchair, soft throw blanket, bookshelf, warm lamp, and peaceful atmosphere. Professional interior design photography.',
    style: 'Cozy Traditional',
    room: 'Living Space',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'modern-dining-room.png',
    prompt: 'A modern dining room with sleek table, contemporary chairs, statement lighting, and sophisticated design. Professional interior design photography.',
    style: 'Modern Contemporary',
    room: 'Dining Room',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  }
];

async function generateMasonryImages() {
  console.log('🎨 Generating Interior Design Images for Masonry Gallery...\n');
  
  const outputDir = '/Users/marcusbey/Desktop/02-CS/05-Startup/compozit/app/compozit-vision/mobile/src/assets/masonry';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
  }
  
  console.log('📝 Image Generation Plan:');
  console.log('========================');
  MASONRY_IMAGES.forEach((spec, index) => {
    console.log(`${index + 1}. ${spec.filename}`);
    console.log(`   Style: ${spec.style} | Room: ${spec.room}`);
    console.log(`   Size: ${spec.size.width}x${spec.size.height} (${spec.orientation})`);
    console.log(`   Prompt: ${spec.prompt.substring(0, 60)}...`);
    console.log('');
  });
  
  // Since the Gemini service isn't fully implemented yet, we'll create placeholder images
  // with the specifications and instructions for manual generation
  console.log('⚠️  Note: Gemini image generation service needs backend implementation.');
  console.log('Creating specification files and placeholder images for now...\n');
  
  const specifications = {
    project: 'Compozit Vision - Masonry Gallery Images',
    purpose: 'Small showcase images for mobile app onboarding screen',
    totalImages: MASONRY_IMAGES.length,
    requirements: {
      style: 'Professional interior design photography',
      quality: 'High resolution, clean aesthetic',
      sizes: 'Multiple orientations for masonry layout',
      formats: 'PNG format preferred'
    },
    images: MASONRY_IMAGES.map(spec => ({
      filename: spec.filename,
      description: spec.prompt,
      style: spec.style,
      room: spec.room,
      dimensions: `${spec.size.width}x${spec.size.height}`,
      orientation: spec.orientation,
      usage: 'Masonry gallery showcase in onboarding flow'
    }))
  };
  
  // Save detailed specifications
  const specPath = path.join(outputDir, 'image-specifications.json');
  fs.writeFileSync(specPath, JSON.stringify(specifications, null, 2));
  console.log('📄 Saved detailed specifications:', specPath);
  
  // Create a generation guide
  const guideContent = `# Masonry Gallery Image Generation Guide

## Overview
Generate ${MASONRY_IMAGES.length} interior design images for the Compozit Vision mobile app's masonry gallery showcase.

## Specifications
- **Purpose**: Onboarding screen showcase
- **Style**: Professional interior design photography
- **Quality**: Clean, appealing aesthetic suitable for mobile app
- **Formats**: PNG preferred for transparency support
- **Total**: ${MASONRY_IMAGES.length} images with varied orientations

## Image Requirements

${MASONRY_IMAGES.map((spec, index) => `
### ${index + 1}. ${spec.filename}
- **Size**: ${spec.size.width}x${spec.size.height} pixels (${spec.orientation})
- **Style**: ${spec.style}
- **Room**: ${spec.room}
- **Prompt**: ${spec.prompt}

`).join('')}

## Generation Tools
1. **Recommended**: Use Midjourney, DALL-E 3, or Stable Diffusion
2. **Alternative**: Use the Gemini service once backend is implemented
3. **Settings**: 
   - High quality mode
   - Photorealistic style
   - Professional lighting
   - Interior design focus

## File Organization
Save all images to: \`mobile/src/assets/masonry/\`

## Usage in App
These images will be displayed in an auto-playing masonry gallery to showcase the variety of design styles that Compozit AI can create.
`;
  
  const guidePath = path.join(outputDir, 'GENERATION-GUIDE.md');
  fs.writeFileSync(guidePath, guideContent);
  console.log('📋 Created generation guide:', guidePath);
  
  // Create placeholder info file for each image
  MASONRY_IMAGES.forEach(spec => {
    const infoPath = path.join(outputDir, `${spec.filename.replace('.png', '.info.json')}`);
    const imageInfo = {
      filename: spec.filename,
      status: 'pending-generation',
      specifications: {
        prompt: spec.prompt,
        style: spec.style,
        room: spec.room,
        dimensions: spec.size,
        orientation: spec.orientation,
        format: 'PNG'
      },
      generationNotes: {
        tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Gemini (when available)'],
        settings: 'High quality, photorealistic, professional interior design photography',
        purpose: 'Masonry gallery showcase in mobile app onboarding'
      },
      usageContext: {
        screen: 'Onboarding',
        component: 'Masonry Gallery',
        purpose: 'Style variety showcase',
        autoplay: true
      }
    };
    
    fs.writeFileSync(infoPath, JSON.stringify(imageInfo, null, 2));
  });
  
  console.log('✅ Generated specifications for all images');
  console.log('📁 Output directory:', outputDir);
  console.log('\n🎯 Next Steps:');
  console.log('1. Review the generation guide and specifications');
  console.log('2. Use your preferred AI image generation tool');
  console.log('3. Generate images according to the specifications');
  console.log('4. Save them in the masonry directory');
  console.log('5. Update the React Native app to use these images');
  
  console.log('\n📱 Integration Notes:');
  console.log('- Images will be imported as static assets');
  console.log('- Varied sizes create natural masonry layout');
  console.log('- Mix of orientations provides visual interest');
  console.log('- Professional photography style builds trust');
  
  return {
    specifications,
    outputDirectory: outputDir,
    totalImages: MASONRY_IMAGES.length,
    success: true
  };
}

// Alternative function to generate using external API (when available)
async function generateWithExternalAPI() {
  console.log('🔄 Alternative: Generate with External Image API...');
  console.log('This would integrate with:');
  console.log('- OpenAI DALL-E 3 API');
  console.log('- Stability AI API');
  console.log('- Midjourney API (when available)');
  console.log('- Google Gemini Image API (when backend is ready)');
  
  // Implementation would go here when external APIs are integrated
}

// Run the generator
if (require.main === module) {
  generateMasonryImages().then(result => {
    if (result.success) {
      console.log('\n🎉 Masonry image generation setup complete!');
      console.log(`📊 Prepared specifications for ${result.totalImages} images`);
      console.log(`📁 Files created in: ${result.outputDirectory}`);
    }
  }).catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

export { generateMasonryImages, MASONRY_IMAGES };