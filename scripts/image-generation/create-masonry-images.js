const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'src/assets/masonry');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Priority images to generate
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

// Generate placeholder image
function generatePlaceholderSVG(imageSpec) {
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

  // Save as SVG instead of PNG for placeholder
  const svgFilename = filename.replace('.png', '.svg');
  const filepath = path.join(OUTPUT_DIR, svgFilename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`Created: ${svgFilename}`);
  
  return svgFilename;
}

// Main function
console.log('🎨 Creating Masonry Placeholder Images');
console.log('=====================================\\n');
console.log(`📁 Output directory: ${OUTPUT_DIR}`);
console.log(`📸 Images to generate: ${PRIORITY_IMAGES.length}\\n`);

const generatedFiles = [];

PRIORITY_IMAGES.forEach((imageSpec, index) => {
  console.log(`[${index + 1}/${PRIORITY_IMAGES.length}] Creating ${imageSpec.filename}...`);
  const svgFilename = generatePlaceholderSVG(imageSpec);
  generatedFiles.push(svgFilename);
});

// Create index file
const indexData = {
  generated: new Date().toISOString(),
  totalImages: PRIORITY_IMAGES.length,
  images: PRIORITY_IMAGES.map((img, idx) => ({
    filename: generatedFiles[idx],
    originalFilename: img.filename,
    category: img.filename.split('-')[0],
    style: img.filename.split('-')[1].replace('.png', ''),
    prompt: img.prompt
  }))
};

const indexPath = path.join(OUTPUT_DIR, 'masonry-index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

console.log('\\n✅ Created index file: masonry-index.json');
console.log('\\n✨ Placeholder generation complete!');
console.log('\\n📝 Note: These are SVG placeholders. Replace with actual AI-generated images later.');