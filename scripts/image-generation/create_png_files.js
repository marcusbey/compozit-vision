// Simple PNG file creation without dependencies
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'mobile/src/assets/masonry');

// Simple 1x1 PNG base64 data for different colors (very basic PNG)
const createSimplePNG = (r, g, b) => {
  // This is a minimal 1x1 PNG file structure
  const pngHeader = Buffer.from('89504E470D0A1A0A', 'hex'); // PNG signature
  const ihdr = Buffer.from('0000000D49484452000000010000000108020000009095D68E', 'hex'); // IHDR chunk for 1x1 RGB
  const idat = Buffer.from('0000000C49444154789C62', 'hex'); // Start of IDAT
  const pixelData = Buffer.from([r, g, b]); // RGB pixel
  const idatEnd = Buffer.from('000021A095D68E49454E44AE426082', 'hex'); // End IDAT + IEND
  
  return Buffer.concat([pngHeader, ihdr, idat, pixelData, idatEnd]);
};

// Image specifications with colors
const imageSpecs = [
  { filename: 'interior-modern.png', color: [240, 240, 240] },
  { filename: 'interior-scandinavian.png', color: [248, 246, 240] },
  { filename: 'interior-industrial.png', color: [120, 120, 120] },
  { filename: 'interior-bohemian.png', color: [180, 140, 100] },
  { filename: 'interior-minimalist.png', color: [255, 255, 255] },
  { filename: 'exterior-modern.png', color: [240, 240, 240] },
  { filename: 'exterior-mediterranean.png', color: [230, 200, 160] },
  { filename: 'garden-japanese.png', color: [200, 220, 200] },
  { filename: 'garden-modern.png', color: [220, 220, 220] },
  { filename: 'hotels-luxury.png', color: [150, 130, 100] },
  { filename: 'hotels-boutique.png', color: [200, 180, 160] },
  { filename: 'commercial-modern.png', color: [220, 220, 220] },
  { filename: 'commercial-restaurant.png', color: [160, 140, 120] }
];

console.log('Starting PNG file creation...');

// Remove SVG files
const files = fs.readdirSync(OUTPUT_DIR);
files.forEach(file => {
  if (file.endsWith('.svg')) {
    const filePath = path.join(OUTPUT_DIR, file);
    fs.unlinkSync(filePath);
    console.log(`Removed SVG: ${file}`);
  }
});

// Create PNG files
imageSpecs.forEach(spec => {
  const filePath = path.join(OUTPUT_DIR, spec.filename);
  const [r, g, b] = spec.color;
  const pngData = createSimplePNG(r, g, b);
  
  fs.writeFileSync(filePath, pngData);
  console.log(`Created: ${spec.filename}`);
});

// Create index file
const indexData = {
  generated: new Date().toISOString(),
  format: 'PNG',
  dimensions: { width: 1, height: 1 },
  totalImages: imageSpecs.length,
  successful: imageSpecs.length,
  failed: 0,
  images: imageSpecs.map(spec => ({
    filename: spec.filename,
    category: spec.filename.split('-')[0],
    style: spec.filename.split('-')[1].replace('.png', '')
  }))
};

fs.writeFileSync(path.join(OUTPUT_DIR, 'real-images-index.json'), JSON.stringify(indexData, null, 2));

console.log('PNG file creation complete!');