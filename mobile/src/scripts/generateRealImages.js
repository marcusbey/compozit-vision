#!/usr/bin/env node

/**
 * Generate REAL Interior Design Images (not gradients!)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// Comprehensive image specifications for masonry gallery
const ALL_IMAGES = [
  // Modern Style
  { filename: 'interior-modern.png', style: 'Modern', room: 'Living Room', prompt: 'Create a photorealistic modern minimalist living room. Features: large windows with natural light, white walls, sleek gray sectional sofa, glass coffee table, polished concrete floors, minimal decor, clean lines, open space layout. Professional architectural photography.' },
  { filename: 'contemporary-modern-living-room.png', style: 'Modern', room: 'Living Room', prompt: 'Create a photorealistic modern living room. Features: neutral colors, contemporary furniture, floor-to-ceiling windows, marble accents, artistic lighting, sophisticated layout. Professional interior photography.' },
  { filename: 'contemporary-modern-kitchen.png', style: 'Modern', room: 'Kitchen', prompt: 'Create a photorealistic modern kitchen. Features: white cabinetry, quartz countertops, stainless appliances, pendant lighting, subway tile backsplash, island seating. Professional architectural photography.' },
  { filename: 'contemporary-modern-bedroom.png', style: 'Modern', room: 'Bedroom', prompt: 'Create a photorealistic modern bedroom. Features: platform bed, neutral bedding, built-in wardrobes, accent lighting, minimal decor, wood floors. Professional interior photography.' },
  { filename: 'contemporary-modern-bathroom.png', style: 'Modern', room: 'Bathroom', prompt: 'Create a photorealistic modern bathroom. Features: floating vanity, frameless shower, large format tiles, chrome fixtures, natural light, spa-like atmosphere. Professional architectural photography.' },
  
  // Bohemian Style
  { filename: 'interior-bohemian.png', style: 'Bohemian', room: 'Living Room', prompt: 'Create a photorealistic bohemian living room. Features: rich textiles, vintage furniture, plants, macrame, warm colors, eclectic mix of patterns and textures. Professional interior photography.' },
  { filename: 'artistic-bohemian-living-room.png', style: 'Bohemian', room: 'Living Room', prompt: 'Create a photorealistic bohemian living room. Features: low seating, floor cushions, hanging plants, tapestries, warm lighting, artistic elements, cozy atmosphere. Professional interior photography.' },
  { filename: 'artistic-bohemian-bedroom.png', style: 'Bohemian', room: 'Bedroom', prompt: 'Create a photorealistic bohemian bedroom. Features: canopy bed, layered textiles, hanging plants, vintage rugs, warm earth tones, eclectic decor. Professional interior photography.' },
  { filename: 'artistic-bohemian-kitchen.png', style: 'Bohemian', room: 'Kitchen', prompt: 'Create a photorealistic bohemian kitchen. Features: open shelving, ceramic dishes, plants, warm wood, colorful tiles, vintage appliances, natural materials. Professional interior photography.' },
  { filename: 'artistic-bohemian-bathroom.png', style: 'Bohemian', room: 'Bathroom', prompt: 'Create a photorealistic bohemian bathroom. Features: vintage fixtures, patterned tiles, plants, natural materials, warm lighting, artistic elements. Professional interior photography.' },
  { filename: 'artistic-bohemian-home-office.png', style: 'Bohemian', room: 'Office', prompt: 'Create a photorealistic bohemian home office. Features: vintage desk, plants, artistic elements, warm lighting, textiles, creative workspace. Professional interior photography.' },
  { filename: 'artistic-bohemian-office.png', style: 'Bohemian', room: 'Office', prompt: 'Create a photorealistic bohemian office space. Features: creative workspace, plants, artistic elements, vintage furniture, warm colors, inspiring atmosphere. Professional interior photography.' },
  { filename: 'artistic-bohemian-studio.png', style: 'Bohemian', room: 'Studio', prompt: 'Create a photorealistic bohemian art studio. Features: easel, art supplies, natural light, plants, creative chaos, inspiring workspace, artistic atmosphere. Professional interior photography.' },
  
  // Industrial Style
  { filename: 'interior-industrial.png', style: 'Industrial', room: 'Kitchen', prompt: 'Create a photorealistic industrial kitchen. Features: exposed brick, steel fixtures, concrete counters, Edison bulbs, black metal accents, urban loft feel. Professional architectural photography.' },
  { filename: 'urban-industrial-living-room.png', style: 'Industrial', room: 'Living Room', prompt: 'Create a photorealistic industrial living room. Features: exposed brick walls, steel beams, leather furniture, concrete floors, industrial lighting. Professional interior photography.' },
  { filename: 'urban-industrial-bedroom.png', style: 'Industrial', room: 'Bedroom', prompt: 'Create a photorealistic industrial bedroom. Features: exposed brick, steel frame bed, concrete accents, Edison bulb lighting, urban loft aesthetic. Professional interior photography.' },
  { filename: 'urban-industrial-home-office.png', style: 'Industrial', room: 'Office', prompt: 'Create a photorealistic industrial home office. Features: steel desk, exposed brick, industrial lighting, concrete floors, urban workspace. Professional interior photography.' },
  { filename: 'urban-industrial-loft.png', style: 'Industrial', room: 'Loft', prompt: 'Create a photorealistic industrial loft space. Features: open floor plan, exposed elements, steel and concrete, urban character, modern industrial design. Professional architectural photography.' },
  { filename: 'urban-industrial-kitchen.png', style: 'Industrial', room: 'Kitchen', prompt: 'Create a photorealistic industrial kitchen. Features: stainless steel appliances, concrete island, exposed brick, industrial pendant lights, urban character. Professional interior photography.' },
  { filename: 'urban-industrial-office.png', style: 'Industrial', room: 'Office', prompt: 'Create a photorealistic industrial office. Features: steel furniture, exposed elements, concrete floors, industrial lighting, urban workspace design. Professional interior photography.' },
  { filename: 'urban-industrial-bathroom.png', style: 'Industrial', room: 'Bathroom', prompt: 'Create a photorealistic industrial bathroom. Features: concrete vanity, steel fixtures, subway tiles, exposed pipes, industrial character. Professional interior photography.' },
  
  // Minimalist Style
  { filename: 'interior-minimalist.png', style: 'Minimalist', room: 'Living Room', prompt: 'Create a photorealistic minimalist living room. Features: clean lines, neutral colors, minimal furniture, natural light, uncluttered space, serene atmosphere. Professional interior photography.' },
  { filename: 'contemporary-minimalistic-living-room.png', style: 'Minimalist', room: 'Living Room', prompt: 'Create a photorealistic minimalist living room. Features: white walls, simple furniture, natural materials, clean lines, abundant light. Professional interior photography.' },
  { filename: 'contemporary-minimalistic-kitchen.png', style: 'Minimalist', room: 'Kitchen', prompt: 'Create a photorealistic minimalist kitchen. Features: handleless cabinets, clean countertops, hidden appliances, simple design, neutral palette. Professional architectural photography.' },
  { filename: 'contemporary-minimalistic-bedroom.png', style: 'Minimalist', room: 'Bedroom', prompt: 'Create a photorealistic minimalist bedroom. Features: simple platform bed, neutral bedding, minimal decor, clean lines, serene atmosphere. Professional interior photography.' },
  { filename: 'contemporary-minimalistic-office.png', style: 'Minimalist', room: 'Office', prompt: 'Create a photorealistic minimalist home office. Features: clean desk, simple chair, minimal decor, natural light, organized workspace. Professional interior photography.' },
  
  // Scandinavian Style
  { filename: 'interior-scandinavian.png', style: 'Scandinavian', room: 'Living Room', prompt: 'Create a photorealistic Scandinavian living room. Features: light wood, white walls, cozy textiles, simple furniture, hygge atmosphere, natural light. Professional interior photography.' },
  { filename: 'cultural-scandinavian-living-room.png', style: 'Scandinavian', room: 'Living Room', prompt: 'Create a photorealistic Scandinavian living room. Features: blonde wood, neutral textiles, simple lines, cozy atmosphere, natural materials. Professional interior photography.' },
  { filename: 'cultural-scandinavian-bedroom.png', style: 'Scandinavian', room: 'Bedroom', prompt: 'Create a photorealistic Scandinavian bedroom. Features: white linens, light wood, minimal decor, cozy textiles, serene atmosphere. Professional interior photography.' },
  { filename: 'cultural-scandinavian-kitchen.png', style: 'Scandinavian', room: 'Kitchen', prompt: 'Create a photorealistic Scandinavian kitchen. Features: light wood cabinets, white counters, simple design, functional beauty, natural materials. Professional interior photography.' },
  { filename: 'cultural-scandinavian-office.png', style: 'Scandinavian', room: 'Office', prompt: 'Create a photorealistic Scandinavian home office. Features: light wood desk, simple design, natural light, minimal decor, functional workspace. Professional interior photography.' },
  { filename: 'cultural-scandinavian-bathroom.png', style: 'Scandinavian', room: 'Bathroom', prompt: 'Create a photorealistic Scandinavian bathroom. Features: white tiles, light wood, simple fixtures, natural materials, clean design. Professional interior photography.' },
  { filename: 'cultural-scandinavian-home-office.png', style: 'Scandinavian', room: 'Office', prompt: 'Create a photorealistic Scandinavian home office. Features: functional design, light wood, white walls, natural light, simple furniture. Professional interior photography.' },
  
  // Mediterranean Style
  { filename: 'exterior-mediterranean.png', style: 'Mediterranean', room: 'Exterior', prompt: 'Create a photorealistic Mediterranean exterior. Features: terracotta roof, stucco walls, arched windows, wrought iron details, lush landscaping. Professional architectural photography.' },
  { filename: 'cultural-mediterranean-living-room.png', style: 'Mediterranean', room: 'Living Room', prompt: 'Create a photorealistic Mediterranean living room. Features: warm colors, textured walls, wrought iron, natural materials, rustic elegance. Professional interior photography.' },
  { filename: 'cultural-mediterranean-kitchen.png', style: 'Mediterranean', room: 'Kitchen', prompt: 'Create a photorealistic Mediterranean kitchen. Features: terra cotta tiles, warm wood, wrought iron, natural stone, rustic charm. Professional interior photography.' },
  { filename: 'cultural-mediterranean-patio.png', style: 'Mediterranean', room: 'Patio', prompt: 'Create a photorealistic Mediterranean patio. Features: stone flooring, wrought iron furniture, climbing vines, warm lighting, outdoor dining. Professional architectural photography.' },
  { filename: 'cultural-mediterranean-bedroom.png', style: 'Mediterranean', room: 'Bedroom', prompt: 'Create a photorealistic Mediterranean bedroom. Features: warm colors, textured walls, wrought iron bed, natural materials, romantic atmosphere. Professional interior photography.' },
  { filename: 'cultural-mediterranean-bathroom.png', style: 'Mediterranean', room: 'Bathroom', prompt: 'Create a photorealistic Mediterranean bathroom. Features: natural stone, wrought iron details, warm colors, rustic elegance, spa-like atmosphere. Professional interior photography.' },
  { filename: 'cultural-mediterranean-home-office.png', style: 'Mediterranean', room: 'Office', prompt: 'Create a photorealistic Mediterranean home office. Features: warm wood desk, textured walls, natural materials, inspiring workspace, rustic charm. Professional interior photography.' },

  // Additional comprehensive combinations for app reference and social media
  
  // Rustic & Farmhouse Style
  { filename: 'natural-rustic-kitchen.png', style: 'Rustic', room: 'Kitchen', prompt: 'Create a photorealistic rustic farmhouse kitchen. Features: reclaimed wood cabinets, farmhouse sink, exposed beams, vintage appliances, natural stone backsplash, warm copper accents. Professional interior photography.' },
  { filename: 'natural-rustic-living-room.png', style: 'Rustic', room: 'Living Room', prompt: 'Create a photorealistic rustic living room. Features: stone fireplace, reclaimed wood accents, leather furniture, cozy textiles, antler chandelier, cabin atmosphere. Professional interior photography.' },
  { filename: 'natural-rustic-bedroom.png', style: 'Rustic', room: 'Bedroom', prompt: 'Create a photorealistic rustic bedroom. Features: log bed frame, plaid textiles, vintage quilts, natural wood furniture, cozy cabin atmosphere, warm lighting. Professional interior photography.' },
  { filename: 'natural-rustic-dining.png', style: 'Rustic', room: 'Dining Room', prompt: 'Create a photorealistic rustic dining room. Features: live-edge wood table, mismatched vintage chairs, mason jar lighting, barn wood walls, farmhouse charm. Professional interior photography.' },

  // Vintage & Classic Style  
  { filename: 'classic-vintage-living-room.png', style: 'Vintage', room: 'Living Room', prompt: 'Create a photorealistic vintage living room. Features: mid-century furniture, vintage patterns, retro colors, antique accessories, classic mid-century modern aesthetic. Professional interior photography.' },
  { filename: 'classic-vintage-bedroom.png', style: 'Vintage', room: 'Bedroom', prompt: 'Create a photorealistic vintage bedroom. Features: antique brass bed, vintage linens, retro wallpaper, classic furniture pieces, nostalgic atmosphere. Professional interior photography.' },
  { filename: 'classic-vintage-office.png', style: 'Vintage', room: 'Office', prompt: 'Create a photorealistic vintage home office. Features: antique wooden desk, vintage typewriter, leather chair, classic books, retro decor elements. Professional interior photography.' },
  { filename: 'classic-vintage-library.png', style: 'Vintage', room: 'Library', prompt: 'Create a photorealistic vintage library. Features: floor-to-ceiling bookshelves, antique reading chairs, vintage globes, classic literary atmosphere, warm wood tones. Professional interior photography.' },

  // Baroque & Luxury Style
  { filename: 'luxury-baroque-living-room.png', style: 'Baroque', room: 'Living Room', prompt: 'Create a photorealistic baroque living room. Features: ornate gold furniture, velvet upholstery, crystal chandeliers, elaborate mirrors, rich fabrics, royal elegance. Professional interior photography.' },
  { filename: 'luxury-baroque-dining.png', style: 'Baroque', room: 'Dining Room', prompt: 'Create a photorealistic baroque dining room. Features: ornate dining table, gilded chairs, crystal chandelier, marble accents, luxurious tapestries, grand atmosphere. Professional interior photography.' },
  { filename: 'luxury-baroque-bedroom.png', style: 'Baroque', room: 'Bedroom', prompt: 'Create a photorealistic baroque bedroom. Features: canopy bed with rich drapes, ornate headboard, gilded furniture, luxurious textiles, royal bedroom atmosphere. Professional interior photography.' },
  { filename: 'luxury-baroque-study.png', style: 'Baroque', room: 'Study', prompt: 'Create a photorealistic baroque study. Features: ornate wooden desk, leather-bound books, gilded picture frames, elaborate furniture, scholarly luxury atmosphere. Professional interior photography.' },

  // Tropical Style
  { filename: 'themed-tropical-living-room.png', style: 'Tropical', room: 'Living Room', prompt: 'Create a photorealistic tropical living room. Features: bamboo furniture, palm leaf patterns, natural textures, bright tropical colors, indoor plants, island paradise atmosphere. Professional interior photography.' },
  { filename: 'themed-tropical-bathroom.png', style: 'Tropical', room: 'Bathroom', prompt: 'Create a photorealistic tropical bathroom. Features: natural stone, bamboo accents, tropical plants, rainfall shower, spa-like atmosphere, island resort feeling. Professional interior photography.' },
  { filename: 'themed-tropical-bedroom.png', style: 'Tropical', room: 'Bedroom', prompt: 'Create a photorealistic tropical bedroom. Features: canopy bed, bamboo furniture, tropical prints, natural textures, breezy island atmosphere, vacation home feeling. Professional interior photography.' },
  { filename: 'themed-tropical-patio.png', style: 'Tropical', room: 'Patio', prompt: 'Create a photorealistic tropical patio. Features: bamboo furniture, tropical plants, thatched roof elements, natural materials, outdoor paradise atmosphere. Professional interior photography.' },

  // Art Deco Style
  { filename: 'luxury-art-deco-lobby.png', style: 'Art Deco', room: 'Lobby', prompt: 'Create a photorealistic Art Deco lobby. Features: geometric patterns, metallic accents, marble surfaces, dramatic lighting, 1920s glamour, luxury hotel atmosphere. Professional interior photography.' },
  { filename: 'luxury-art-deco-living-room.png', style: 'Art Deco', room: 'Living Room', prompt: 'Create a photorealistic Art Deco living room. Features: geometric furniture, metallic finishes, rich velvet, dramatic lighting, 1920s sophistication, glamorous atmosphere. Professional interior photography.' },
  { filename: 'luxury-art-deco-bedroom.png', style: 'Art Deco', room: 'Bedroom', prompt: 'Create a photorealistic Art Deco bedroom. Features: geometric headboard, metallic accents, rich fabrics, mirrored surfaces, 1920s elegance, glamorous bedroom design. Professional interior photography.' },
  { filename: 'luxury-art-deco-kitchen.png', style: 'Art Deco', room: 'Kitchen', prompt: 'Create a photorealistic Art Deco kitchen. Features: geometric tile patterns, chrome appliances, marble countertops, metallic backsplash, 1920s modern luxury. Professional interior photography.' },
  { filename: 'luxury-art-deco-bathroom.png', style: 'Art Deco', room: 'Bathroom', prompt: 'Create a photorealistic Art Deco bathroom. Features: geometric tile work, chrome fixtures, marble surfaces, dramatic lighting, 1920s luxury spa atmosphere. Professional interior photography.' },
  { filename: 'luxury-art-deco-home-office.png', style: 'Art Deco', room: 'Office', prompt: 'Create a photorealistic Art Deco home office. Features: geometric desk design, metallic accents, rich wood, dramatic lighting, 1920s executive sophistication. Professional interior photography.' },

  // Japanese & Zen Style
  { filename: 'cultural-japanese-zen-kitchen.png', style: 'Japanese Zen', room: 'Kitchen', prompt: 'Create a photorealistic Japanese Zen kitchen. Features: clean lines, natural wood, minimal design, tatami elements, serene atmosphere, traditional Japanese aesthetics. Professional interior photography.' },
  { filename: 'cultural-japanese-zen-home-office.png', style: 'Japanese Zen', room: 'Office', prompt: 'Create a photorealistic Japanese Zen home office. Features: low furniture, natural materials, minimal design, meditation corner, serene workspace, traditional Japanese elements. Professional interior photography.' },

  // Moroccan Style
  { filename: 'cultural-moroccan-kitchen.png', style: 'Moroccan', room: 'Kitchen', prompt: 'Create a photorealistic Moroccan kitchen. Features: colorful mosaic tiles, brass fixtures, carved wood cabinets, spice storage, warm earth tones, exotic atmosphere. Professional interior photography.' },
  { filename: 'cultural-moroccan-home-office.png', style: 'Moroccan', room: 'Office', prompt: 'Create a photorealistic Moroccan home office. Features: ornate patterns, rich textiles, brass accents, carved furniture, jewel tones, exotic workspace design. Professional interior photography.' },

  // Traditional & Contemporary Combinations
  { filename: 'classic-traditional-living-room.png', style: 'Traditional', room: 'Living Room', prompt: 'Create a photorealistic traditional living room. Features: classic furniture, rich fabrics, warm colors, elegant proportions, timeless design, sophisticated atmosphere. Professional interior photography.' },
  { filename: 'classic-traditional-kitchen.png', style: 'Traditional', room: 'Kitchen', prompt: 'Create a photorealistic traditional kitchen. Features: wood cabinetry, classic details, warm colors, traditional hardware, timeless design, family-friendly atmosphere. Professional interior photography.' },
  { filename: 'classic-traditional-bedroom.png', style: 'Traditional', room: 'Bedroom', prompt: 'Create a photorealistic traditional bedroom. Features: classic furniture, elegant fabrics, warm colors, refined details, timeless bedroom design, comfortable atmosphere. Professional interior photography.' },
  { filename: 'classic-traditional-bathroom.png', style: 'Traditional', room: 'Bathroom', prompt: 'Create a photorealistic traditional bathroom. Features: classic fixtures, marble surfaces, warm colors, elegant details, timeless bathroom design, spa-like atmosphere. Professional interior photography.' },
  { filename: 'classic-traditional-home-office.png', style: 'Traditional', room: 'Office', prompt: 'Create a photorealistic traditional home office. Features: wooden desk, classic furniture, warm colors, elegant details, timeless study design, professional atmosphere. Professional interior photography.' },

  { filename: 'contemporary-contemporary-living-room.png', style: 'Contemporary', room: 'Living Room', prompt: 'Create a photorealistic contemporary living room. Features: current trends, mixed styles, comfortable furniture, balanced design, modern living atmosphere, stylish decor. Professional interior photography.' },
  { filename: 'contemporary-contemporary-kitchen.png', style: 'Contemporary', room: 'Kitchen', prompt: 'Create a photorealistic contemporary kitchen. Features: modern appliances, stylish cabinets, current trends, functional design, contemporary cooking space. Professional interior photography.' },
  { filename: 'contemporary-contemporary-bedroom.png', style: 'Contemporary', room: 'Bedroom', prompt: 'Create a photorealistic contemporary bedroom. Features: modern furniture, current trends, comfortable design, stylish atmosphere, contemporary sleeping space. Professional interior photography.' },
  { filename: 'contemporary-contemporary-bathroom.png', style: 'Contemporary', room: 'Bathroom', prompt: 'Create a photorealistic contemporary bathroom. Features: modern fixtures, stylish tiles, current trends, spa-like atmosphere, contemporary design elements. Professional interior photography.' },
  { filename: 'contemporary-contemporary-home-office.png', style: 'Contemporary', room: 'Office', prompt: 'Create a photorealistic contemporary home office. Features: modern desk, stylish storage, current trends, productive workspace, contemporary design elements. Professional interior photography.' },

  // Garden & Outdoor Spaces
  { filename: 'exterior-modern.png', style: 'Modern', room: 'Exterior', prompt: 'Create a photorealistic modern exterior architecture. Features: clean lines, large windows, minimalist landscaping, contemporary materials, sleek design, architectural photography.' },
  { filename: 'garden-japanese.png', style: 'Japanese', room: 'Garden', prompt: 'Create a photorealistic Japanese garden. Features: zen elements, carefully placed stones, minimal plants, water features, meditative atmosphere, traditional Japanese landscape design.' },
  { filename: 'garden-modern.png', style: 'Modern', room: 'Garden', prompt: 'Create a photorealistic modern garden. Features: geometric plantings, contemporary materials, clean lines, outdoor living spaces, minimalist landscape design.' },

  // Commercial Spaces
  { filename: 'hotels-luxury.png', style: 'Luxury', room: 'Hotel', prompt: 'Create a photorealistic luxury hotel interior. Features: high-end materials, sophisticated design, elegant furniture, premium finishes, five-star hospitality atmosphere. Professional interior photography.' },
  { filename: 'hotels-boutique.png', style: 'Boutique', room: 'Hotel', prompt: 'Create a photorealistic boutique hotel interior. Features: unique design, personalized details, intimate atmosphere, stylish decor, bespoke hospitality design. Professional interior photography.' },
  { filename: 'commercial-modern.png', style: 'Modern', room: 'Commercial', prompt: 'Create a photorealistic modern commercial space. Features: professional atmosphere, clean design, contemporary furniture, business-appropriate environment, corporate aesthetics. Professional interior photography.' },
  { filename: 'commercial-restaurant.png', style: 'Modern', room: 'Restaurant', prompt: 'Create a photorealistic modern restaurant interior. Features: stylish dining furniture, atmospheric lighting, contemporary design, dining experience atmosphere, professional restaurant design. Professional interior photography.' }
];

/**
 * Generate a single real image using Gemini API
 */
async function generateRealImage(imageSpec) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": imageSpec.prompt
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.4,
        "topP": 0.95,
        "topK": 40
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🤖 Generating ${imageSpec.style} ${imageSpec.room}...`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }

          // Extract image data
          if (response.candidates && response.candidates[0] && response.candidates[0].content) {
            const content = response.candidates[0].content;
            
            if (content.parts) {
              for (const part of content.parts) {
                // Look for image data
                if (part.inlineData && part.inlineData.data && part.inlineData.mimeType && part.inlineData.mimeType.includes('image')) {
                  const buffer = Buffer.from(part.inlineData.data, 'base64');
                  const filepath = path.join(OUTPUT_DIR, imageSpec.filename);
                  
                  // Save the real image
                  fs.writeFileSync(filepath, buffer);
                  
                  const sizeKB = Math.round(buffer.length / 1024);
                  console.log(`✅ Real image generated: ${imageSpec.filename} (${sizeKB}KB)`);
                  
                  resolve({
                    success: true,
                    filename: imageSpec.filename,
                    size: buffer.length,
                    filepath
                  });
                  return;
                }
              }
            }
          }
          
          reject(new Error('No image data found in response'));
          
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generate all real images
 */
async function generateAllRealImages() {
  console.log('🎨 Complete Masonry Gallery Generator');
  console.log('====================================');
  console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 Generating ${ALL_IMAGES.length} real images\n`);

  if (!API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < ALL_IMAGES.length; i++) {
    const imageSpec = ALL_IMAGES[i];
    
    console.log(`\n[${i + 1}/${ALL_IMAGES.length}] ${imageSpec.style} ${imageSpec.room} - ${imageSpec.filename}`);
    
    try {
      const result = await generateRealImage(imageSpec);
      
      if (result.success) {
        console.log(`✅ Generated: ${result.filename} (${Math.round(result.size / 1024)}KB)`);
        successCount++;
      }
      
      // Rate limiting - 5 seconds between requests to avoid hitting quotas
      if (i < ALL_IMAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`❌ Failed ${imageSpec.filename}: ${error.message}`);
      failureCount++;
      
      // Continue with next image even if one fails
      if (i < ALL_IMAGES.length - 1) {
        console.log('⏳ Waiting 3 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(`\n🎉 Masonry Gallery Generation Complete!`);
  console.log(`✅ Successfully generated: ${successCount} images`);
  console.log(`❌ Failed: ${failureCount} images`);
  console.log(`📊 Success rate: ${Math.round((successCount / ALL_IMAGES.length) * 100)}%`);
}

if (require.main === module) {
  generateAllRealImages();
}