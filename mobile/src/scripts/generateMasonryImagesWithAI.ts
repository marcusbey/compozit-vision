#!/usr/bin/env ts-node

/**
 * Generate Masonry Gallery Images using AI Services
 * Creates actual images for the mobile app onboarding screen
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  testReplicateGeneration, 
  testOpenAIGeneration, 
  testStabilityGeneration,
  checkAPIConfiguration 
} from '../services/imageGenerationTest';

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
    prompt: 'A modern minimalist living room with clean lines, neutral colors, white and gray sofa, glass coffee table, minimal decor, large windows with natural light, professional interior design photography',
    style: 'Modern Minimalist',
    room: 'Living Room',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'industrial-kitchen.png',
    prompt: 'An industrial style kitchen with exposed brick walls, stainless steel appliances, concrete countertops, Edison bulb pendant lights, metal bar stools, professional interior photography',
    style: 'Industrial',
    room: 'Kitchen',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'bohemian-bedroom.png',
    prompt: 'A bohemian bedroom with warm earth tones, layered textiles, macrame wall hanging, wooden bed frame, plants, patterned rugs, cozy ambient lighting, professional interior design photo',
    style: 'Bohemian',
    room: 'Bedroom',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'vintage-workspace.png',
    prompt: 'A vintage home office with antique wooden desk, leather chair, bookshelves filled with books, typewriter, brass lamp, warm lighting, classic decor, professional interior photography',
    style: 'Vintage',
    room: 'Workspace',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'scandinavian-living-room.png',
    prompt: 'A Scandinavian living room with white walls, light wood furniture, gray sofa with wool throws, hygge elements, candles, plants, natural light, cozy minimalist design, professional interior photography',
    style: 'Scandinavian',
    room: 'Living Room',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'minimalist-bedroom.png',
    prompt: 'A minimalist bedroom with clean white linens, simple platform bed, organized nightstand, natural materials, serene atmosphere, soft lighting, uncluttered space, professional interior photography',
    style: 'Minimalist',
    room: 'Bedroom',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'modern-kitchen-island.png',
    prompt: 'A contemporary kitchen with white marble island, pendant lights, white cabinets, stainless steel appliances, modern design, clean lines, professional interior design photography',
    style: 'Contemporary',
    room: 'Kitchen',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  },
  {
    filename: 'industrial-workspace.png',
    prompt: 'An industrial workspace with metal furniture, exposed pipes, concrete floors, vintage industrial equipment, metal desk, moody lighting, urban aesthetic, professional interior photography',
    style: 'Industrial',
    room: 'Workspace',
    orientation: 'portrait',
    size: { width: 240, height: 320 }
  },
  {
    filename: 'cozy-reading-nook.png',
    prompt: 'A cozy reading nook with comfortable armchair, soft throw blanket, bookshelf, warm table lamp, peaceful atmosphere, traditional decor, professional interior design photography',
    style: 'Cozy Traditional',
    room: 'Living Space',
    orientation: 'square',
    size: { width: 256, height: 256 }
  },
  {
    filename: 'modern-dining-room.png',
    prompt: 'A modern dining room with sleek dining table, contemporary chairs, statement pendant lighting, sophisticated design, clean aesthetic, professional interior design photography',
    style: 'Modern Contemporary',
    room: 'Dining Room',
    orientation: 'landscape',
    size: { width: 320, height: 240 }
  }
];

// Service preferences (in order of preference)
const PREFERRED_SERVICES = ['replicate', 'openai', 'stability'] as const;

async function generateMasonryImages() {
  console.log('🎨 Generating Interior Design Images for Masonry Gallery...\n');
  
  const outputDir = '/Users/marcusbey/Desktop/02-CS/05-Startup/compozit/app/compozit-vision/mobile/src/assets/masonry';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
  }
  
  // Check API configuration
  console.log('🔑 Checking API Configuration...');
  const apiConfigs = checkAPIConfiguration();
  
  // Find the first available service
  let selectedService: string | null = null;
  for (const service of PREFERRED_SERVICES) {
    const serviceKey = service === 'replicate' ? 'Replicate' 
                     : service === 'openai' ? 'OpenAI'
                     : 'Stability AI';
    
    if (apiConfigs[serviceKey]) {
      selectedService = service;
      console.log(`✅ Using ${serviceKey} for image generation`);
      break;
    }
  }
  
  if (!selectedService) {
    console.error('❌ No API keys configured for image generation services');
    console.log('\nTo generate images, add one of these to your environment:');
    console.log('- EXPO_PUBLIC_REPLICATE_API_KEY=your_replicate_key');
    console.log('- EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key');
    console.log('- EXPO_PUBLIC_STABILITY_API_KEY=your_stability_key');
    return;
  }
  
  console.log(`\n🚀 Generating ${MASONRY_IMAGES.length} images using ${selectedService}...\n`);
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < MASONRY_IMAGES.length; i++) {
    const spec = MASONRY_IMAGES[i];
    console.log(`🖼️  [${i + 1}/${MASONRY_IMAGES.length}] Generating: ${spec.filename}`);
    console.log(`   Style: ${spec.style} | Room: ${spec.room} | Size: ${spec.size.width}x${spec.size.height}`);
    
    try {
      const startTime = Date.now();
      let imageUrl: string;
      
      // Generate the image using the selected service
      switch (selectedService) {
        case 'replicate':
          imageUrl = await testReplicateGeneration(spec.prompt);
          break;
        case 'openai':
          imageUrl = await testOpenAIGeneration(spec.prompt);
          break;
        case 'stability':
          imageUrl = await testStabilityGeneration(spec.prompt);
          break;
        default:
          throw new Error(`Unknown service: ${selectedService}`);
      }
      
      const generationTime = Date.now() - startTime;
      
      // Download and save the image
      const imagePath = await downloadAndSaveImage(imageUrl, spec.filename, outputDir);
      
      console.log(`✅ Generated in ${Math.round(generationTime / 1000)}s: ${spec.filename}`);
      
      results.push({
        filename: spec.filename,
        success: true,
        generationTime,
        service: selectedService,
        imagePath,
        spec
      });
      
      successCount++;
      
      // Add delay between requests to respect rate limits
      if (i < MASONRY_IMAGES.length - 1) {
        console.log('   ⏳ Waiting 3 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to generate ${spec.filename}:`, errorMessage);
      
      results.push({
        filename: spec.filename,
        success: false,
        error: errorMessage,
        service: selectedService,
        spec
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Generate summary
  console.log('📊 Generation Summary:');
  console.log('====================');
  console.log(`Success Rate: ${successCount}/${MASONRY_IMAGES.length} (${Math.round(successCount / MASONRY_IMAGES.length * 100)}%)`);
  console.log(`Service Used: ${selectedService?.toUpperCase()}`);
  
  if (successCount > 0) {
    console.log('\n✅ Successfully Generated Images:');
    results.filter(r => r.success).forEach(result => {
      console.log(`   • ${result.filename} (${Math.round(result.generationTime! / 1000)}s)`);
    });
  }
  
  if (successCount < MASONRY_IMAGES.length) {
    console.log('\n❌ Failed Generations:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   • ${result.filename}: ${result.error}`);
    });
  }
  
  // Save detailed results
  const resultsPath = path.join(outputDir, 'generation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    service: selectedService,
    totalImages: MASONRY_IMAGES.length,
    successfulImages: successCount,
    failedImages: MASONRY_IMAGES.length - successCount,
    results
  }, null, 2));
  
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);
  
  if (successCount === MASONRY_IMAGES.length) {
    console.log('\n🎉 All images generated successfully!');
    console.log('🖼️  Ready for integration into the mobile app masonry gallery');
  } else {
    console.log(`\n⚠️  ${MASONRY_IMAGES.length - successCount} image(s) failed to generate`);
    console.log('You can retry the failed images or generate them manually');
  }
  
  console.log(`\n📁 Images saved to: ${outputDir}`);
  console.log('🔗 Next step: Import these images into your React Native masonry component');
  
  return {
    success: successCount === MASONRY_IMAGES.length,
    totalImages: MASONRY_IMAGES.length,
    successfulImages: successCount,
    failedImages: MASONRY_IMAGES.length - successCount,
    service: selectedService,
    outputDirectory: outputDir
  };
}

/**
 * Download an image URL and save it to the specified directory
 */
async function downloadAndSaveImage(
  imageUrl: string, 
  filename: string, 
  outputDir: string
): Promise<string> {
  try {
    console.log(`   📥 Downloading image...`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const imagePath = path.join(outputDir, filename);
    
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    
    console.log(`   💾 Saved: ${filename} (${Math.round(buffer.byteLength / 1024)}KB)`);
    
    return imagePath;
  } catch (error) {
    throw new Error(`Failed to download and save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a React Native import helper file
 */
async function createImportHelper(outputDir: string) {
  const importHelperContent = `// Auto-generated masonry gallery imports
// Import this file in your React Native component

${MASONRY_IMAGES.map((spec, index) => {
  const varName = spec.filename.replace('.png', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `import ${varName} from './masonry/${spec.filename}';`;
}).join('\n')}

export const masonryImages = [
${MASONRY_IMAGES.map((spec, index) => {
  const varName = spec.filename.replace('.png', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return `  {
    source: ${varName},
    filename: '${spec.filename}',
    style: '${spec.style}',
    room: '${spec.room}',
    orientation: '${spec.orientation}',
    dimensions: { width: ${spec.size.width}, height: ${spec.size.height} }
  }`;
}).join(',\n')}
];

export type MasonryImage = typeof masonryImages[0];
`;

  const helperPath = path.join(outputDir, '../masonryImages.ts');
  fs.writeFileSync(helperPath, importHelperContent);
  
  console.log(`📝 Created import helper: ${helperPath}`);
  return helperPath;
}

// Run the generator
if (require.main === module) {
  generateMasonryImages()
    .then(async (result) => {
      if (result.success || result.successfulImages > 0) {
        await createImportHelper(result.outputDirectory);
        console.log('\n🎯 Integration ready! Check the generated masonryImages.ts helper file.');
      }
    })
    .catch(error => {
      console.error('❌ Generation script failed:', error);
      process.exit(1);
    });
}

export { generateMasonryImages, MASONRY_IMAGES };