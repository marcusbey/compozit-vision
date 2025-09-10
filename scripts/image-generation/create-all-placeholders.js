const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'src/assets/masonry');

// Priority images to generate
const PRIORITY_IMAGES = [
  // Interior styles
  { filename: 'interior-modern.svg', category: 'INTERIOR', style: 'modern' },
  { filename: 'interior-scandinavian.svg', category: 'INTERIOR', style: 'scandinavian' },
  { filename: 'interior-industrial.svg', category: 'INTERIOR', style: 'industrial' },
  { filename: 'interior-bohemian.svg', category: 'INTERIOR', style: 'bohemian' },
  { filename: 'interior-minimalist.svg', category: 'INTERIOR', style: 'minimalist' },
  
  // Exterior styles
  { filename: 'exterior-modern.svg', category: 'EXTERIOR', style: 'modern' },
  { filename: 'exterior-mediterranean.svg', category: 'EXTERIOR', style: 'mediterranean' },
  
  // Garden styles
  { filename: 'garden-japanese.svg', category: 'GARDEN', style: 'japanese' },
  { filename: 'garden-modern.svg', category: 'GARDEN', style: 'modern' },
  
  // Hotel styles
  { filename: 'hotels-luxury.svg', category: 'HOTELS', style: 'luxury' },
  { filename: 'hotels-boutique.svg', category: 'HOTELS', style: 'boutique' },
  
  // Commercial styles
  { filename: 'commercial-modern.svg', category: 'COMMERCIAL', style: 'modern' },
  { filename: 'commercial-restaurant.svg', category: 'COMMERCIAL', style: 'restaurant' },
];

// Generate SVG content
function generateSVG(category, style) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f5f5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <text x="256" y="240" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#333">
    ${category}
  </text>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="22" text-anchor="middle" fill="#666">
    ${style} style
  </text>
  <rect x="40" y="40" width="432" height="432" fill="none" stroke="#ccc" stroke-width="2" rx="8"/>
</svg>`;
}

// Create all files
PRIORITY_IMAGES.forEach((image) => {
  const filepath = path.join(OUTPUT_DIR, image.filename);
  const svgContent = generateSVG(image.category, image.style);
  
  try {
    fs.writeFileSync(filepath, svgContent);
    console.log(`✓ Created ${image.filename}`);
  } catch (error) {
    console.error(`✗ Failed to create ${image.filename}: ${error.message}`);
  }
});

// Create index file
const indexData = {
  generated: new Date().toISOString(),
  totalImages: PRIORITY_IMAGES.length,
  images: PRIORITY_IMAGES.map(img => ({
    filename: img.filename,
    category: img.category.toLowerCase(),
    style: img.style,
    isPlaceholder: true
  }))
};

const indexPath = path.join(OUTPUT_DIR, 'masonry-index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

console.log('\n✅ All placeholder images created!');
console.log(`✅ Index file created at: masonry-index.json`);