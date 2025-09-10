/**
 * Create placeholder images for masonry gallery
 * Creates simple colored rectangles until AI-generated images are ready
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const MASONRY_IMAGES = [
  {
    filename: 'modern-living-room.png',
    style: 'Modern Minimalist',
    room: 'Living Room',
    size: { width: 320, height: 240 },
    color: '#E8F4FD'
  },
  {
    filename: 'industrial-kitchen.png',
    style: 'Industrial',
    room: 'Kitchen',
    size: { width: 256, height: 256 },
    color: '#F1F3F4'
  },
  {
    filename: 'bohemian-bedroom.png',
    style: 'Bohemian',
    room: 'Bedroom',
    size: { width: 240, height: 320 },
    color: '#FFF4E6'
  },
  {
    filename: 'vintage-workspace.png',
    style: 'Vintage',
    room: 'Workspace',
    size: { width: 320, height: 240 },
    color: '#F9F1E6'
  },
  {
    filename: 'scandinavian-living-room.png',
    style: 'Scandinavian',
    room: 'Living Room',
    size: { width: 256, height: 256 },
    color: '#F8F9FA'
  },
  {
    filename: 'minimalist-bedroom.png',
    style: 'Minimalist',
    room: 'Bedroom',
    size: { width: 240, height: 320 },
    color: '#FFFFFF'
  },
  {
    filename: 'modern-kitchen-island.png',
    style: 'Contemporary',
    room: 'Kitchen',
    size: { width: 320, height: 240 },
    color: '#F5F7FA'
  },
  {
    filename: 'industrial-workspace.png',
    style: 'Industrial',
    room: 'Workspace',
    size: { width: 240, height: 320 },
    color: '#F2F2F2'
  },
  {
    filename: 'cozy-reading-nook.png',
    style: 'Cozy Traditional',
    room: 'Living Space',
    size: { width: 256, height: 256 },
    color: '#FFF8F0'
  },
  {
    filename: 'modern-dining-room.png',
    style: 'Modern Contemporary',
    room: 'Dining Room',
    size: { width: 320, height: 240 },
    color: '#FAFBFC'
  }
];

function createPlaceholderImages() {
  console.log('🎨 Creating placeholder images for masonry gallery...');
  
  const outputDir = path.join(__dirname, '../assets/masonry');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
  }

  MASONRY_IMAGES.forEach((spec, index) => {
    try {
      // Create canvas
      const canvas = createCanvas(spec.size.width, spec.size.height);
      const ctx = canvas.getContext('2d');

      // Fill background
      ctx.fillStyle = spec.color;
      ctx.fillRect(0, 0, spec.size.width, spec.size.height);

      // Add subtle pattern/texture
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * spec.size.width;
        const y = Math.random() * spec.size.height;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Add text overlay
      const fontSize = Math.min(spec.size.width, spec.size.height) * 0.08;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Style text
      ctx.fillText(
        spec.style,
        spec.size.width / 2,
        spec.size.height / 2 - fontSize / 2
      );

      // Room text
      ctx.font = `${fontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillText(
        spec.room,
        spec.size.width / 2,
        spec.size.height / 2 + fontSize / 2
      );

      // Add border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, spec.size.width, spec.size.height);

      // Save image
      const filePath = path.join(outputDir, spec.filename);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);

      console.log(`✅ Created ${spec.filename} (${spec.size.width}x${spec.size.height})`);

    } catch (error) {
      console.error(`❌ Failed to create ${spec.filename}:`, error.message);
    }
  });

  console.log('\n📋 Placeholder images created successfully!');
  console.log('These will be replaced with AI-generated images once ready.');
  console.log(`📁 Location: ${outputDir}`);
}

// Alternative simple version without canvas dependency
function createSimplePlaceholders() {
  console.log('🎨 Creating simple placeholder files...');
  
  const outputDir = path.join(__dirname, '../assets/masonry');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create a simple 1x1 pixel PNG for each placeholder
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

  MASONRY_IMAGES.forEach(spec => {
    const filePath = path.join(outputDir, spec.filename);
    fs.writeFileSync(filePath, simplePng);
    console.log(`✅ Created placeholder: ${spec.filename}`);
  });

  console.log('📋 Simple placeholder files created!');
}

// Try to use canvas, fallback to simple placeholders
try {
  require('canvas');
  createPlaceholderImages();
} catch (error) {
  console.log('⚠️ Canvas not available, creating simple placeholders...');
  createSimplePlaceholders();
}

module.exports = { createPlaceholderImages, createSimplePlaceholders, MASONRY_IMAGES };