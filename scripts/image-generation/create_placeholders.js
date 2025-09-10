const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG data
const simplePng = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
  0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
  0x42, 0x60, 0x82
]);

const MASONRY_IMAGES = [
  'modern-living-room.png',
  'industrial-kitchen.png',
  'bohemian-bedroom.png',
  'vintage-workspace.png',
  'scandinavian-living-room.png',
  'minimalist-bedroom.png',
  'modern-kitchen-island.png',
  'industrial-workspace.png',
  'cozy-reading-nook.png',
  'modern-dining-room.png'
];

const outputDir = './mobile/src/assets/masonry';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

MASONRY_IMAGES.forEach(filename => {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, simplePng);
  console.log('Created:', filename);
});

console.log('✅ All placeholder images created!');
console.log('📁 Location:', path.resolve(outputDir));