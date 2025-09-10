#!/usr/bin/env node

/**
 * Comprehensive AI Image Generation Script
 * Generates hundreds of photorealistic interior design images based on all categories 
 * from COMPREHENSIVE-DESIGN-CATEGORIES.md with detailed, culturally-accurate prompts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/masonry');

// COMPREHENSIVE IMAGE SPECIFICATIONS
// Each prompt includes: style details, cultural context, time period, materials, atmosphere, scale

const COMPREHENSIVE_IMAGES = [
  
  // === CONTEMPORARY & MODERN STYLES ===
  
  // Modern Minimalist 
  { filename: 'modern-minimalist-living-room.png', style: 'Modern Minimalist', room: 'Living Room', 
    prompt: 'Create a photorealistic modern minimalist living room in a luxury penthouse. Features: floor-to-ceiling windows with city views, white walls, sleek charcoal sectional sofa, glass coffee table, polished concrete floors, hidden lighting, single statement artwork, open 20ft ceilings. Scandinavian influence with Japanese zen principles. Professional architectural photography, natural daylight, crisp shadows.' },
    
  { filename: 'modern-minimalist-kitchen.png', style: 'Modern Minimalist', room: 'Kitchen', 
    prompt: 'Create a photorealistic modern minimalist kitchen in contemporary home. Features: handleless white lacquer cabinets, waterfall quartz island, integrated appliances, subway tile backsplash, pendant lighting, breakfast bar seating, large windows. German precision meets Japanese simplicity. Professional interior photography, bright natural lighting.' },
    
  { filename: 'modern-minimalist-bedroom.png', style: 'Modern Minimalist', room: 'Bedroom', 
    prompt: 'Create a photorealistic modern minimalist master bedroom in luxury residence. Features: platform bed with linen headboard, neutral bedding, built-in wardrobes, accent lighting, minimal decor, large windows, hardwood floors. Scandinavian hygge meets contemporary elegance. Professional interior photography, soft morning light.' },
    
  // Contemporary Current Trends
  { filename: 'contemporary-trend-living-room.png', style: 'Contemporary', room: 'Living Room', 
    prompt: 'Create a photorealistic contemporary living room reflecting 2024 trends. Features: curved furniture, bouclé textures, earth tones, mixed metals, layered lighting, vintage modern pieces, plants, flexible seating. Current design zeitgeist with comfort priority. Professional interior photography, warm ambient lighting.' },
    
  { filename: 'contemporary-trend-kitchen.png', style: 'Contemporary', room: 'Kitchen', 
    prompt: 'Create a photorealistic contemporary kitchen with latest 2024 trends. Features: two-tone cabinets, brass hardware, natural stone counters, colorful backsplash, oversized island, mixed textures, smart appliances. Current luxury meets functionality. Professional architectural photography, layered lighting.' },
    
  // Mid-Century Modern
  { filename: 'mid-century-modern-living-room.png', style: 'Mid-Century Modern', room: 'Living Room', 
    prompt: 'Create a photorealistic mid-century modern living room from 1960s Palm Springs home. Features: walnut furniture, orange and teal colors, atomic patterns, starburst clock, Eames chairs, stone fireplace, large windows, terrazzo floors. Authentic 1950s-1960s American modernist aesthetic. Professional interior photography, warm California light.' },
    
  { filename: 'mid-century-modern-home-office.png', style: 'Mid-Century Modern', room: 'Home Office', 
    prompt: 'Create a photorealistic mid-century modern home office in 1960s executive home. Features: teak desk, Eames office chair, built-in bookshelves, atomic age accessories, geometric patterns, brass accents, large windows. Mad Men era sophistication meets atomic optimism. Professional interior photography, dramatic lighting.' },
    
  // === TRADITIONAL & CLASSIC STYLES ===
  
  // Traditional English
  { filename: 'traditional-english-living-room.png', style: 'Traditional English', room: 'Living Room', 
    prompt: 'Create a photorealistic traditional English living room in Georgian manor house. Features: Chesterfield sofa, Persian rugs, oil paintings, mahogany furniture, floral patterns, library ladder, fireplace with marble surround, crown moldings. 18th century aristocratic elegance with modern comfort. Professional interior photography, warm firelight.' },
    
  { filename: 'traditional-english-study.png', style: 'Traditional English', room: 'Study', 
    prompt: 'Create a photorealistic traditional English study in Victorian mansion library. Features: floor-to-ceiling bookshelves, leather armchairs, mahogany desk, green banker lamp, Persian carpet, fireplace, globe bar, portraits. Gentleman\'s club atmosphere with scholarly gravitas. Professional interior photography, warm amber lighting.' },
    
  // American Colonial 
  { filename: 'american-colonial-dining-room.png', style: 'American Colonial', room: 'Dining Room', 
    prompt: 'Create a photorealistic American colonial dining room in 1760s Massachusetts home. Features: Windsor chairs, harvest table, pewter accessories, blue and white china, braided rugs, wide plank floors, low ceilings, small windows. Authentic pre-Revolutionary War period with colonial craftsmanship. Professional interior photography, candlelit atmosphere.' },
    
  { filename: 'american-colonial-kitchen.png', style: 'American Colonial', room: 'Kitchen', 
    prompt: 'Create a photorealistic American colonial kitchen in historic New England farmhouse. Features: farmhouse sink, open hearth, copper pots, wooden counters, open shelving, herbs drying, wide plank floors, small paned windows. 18th century functionality with period authenticity. Professional interior photography, natural daylight.' },
    
  // === ECLECTIC & ARTISTIC STYLES ===
  
  // Bohemian Global
  { filename: 'bohemian-global-living-room.png', style: 'Bohemian Global', room: 'Living Room', 
    prompt: 'Create a photorealistic bohemian living room in artist\'s loft with global influences. Features: Moroccan rugs, Indian textiles, macrame wall hangings, vintage furniture mix, plants in baskets, floor cushions, tapestries, string lights. Free-spirited creativity with worldly sophistication. Professional interior photography, golden hour lighting.' },
    
  { filename: 'bohemian-global-bedroom.png', style: 'Bohemian Global', room: 'Bedroom', 
    prompt: 'Create a photorealistic bohemian bedroom in converted warehouse loft. Features: canopy bed with flowing curtains, layered textiles, vintage rugs, plants, crystals, artwork collection, warm lighting, natural materials. Spiritual sanctuary meets artistic expression. Professional interior photography, dreamy soft lighting.' },
    
  // Maximalist 
  { filename: 'maximalist-living-room.png', style: 'Maximalist', room: 'Living Room', 
    prompt: 'Create a photorealistic maximalist living room in eclectic townhouse. Features: bold patterns mixing, rich jewel tones, gallery wall, multiple seating areas, layered rugs, collected objects, dramatic lighting, mix of periods and styles. More-is-more philosophy with sophisticated curation. Professional interior photography, dramatic accent lighting.' },
    
  { filename: 'maximalist-dining-room.png', style: 'Maximalist', room: 'Dining Room', 
    prompt: 'Create a photorealistic maximalist dining room in Victorian mansion. Features: dramatic wallpaper, ornate chandelier, mixed dining chairs, layered table settings, artwork salon-style, rich textures, bold colors, pattern mixing. Opulent entertaining with fearless design choices. Professional interior photography, chandelier lighting.' },
    
  // Art Deco 1920s
  { filename: 'art-deco-1920s-living-room.png', style: 'Art Deco 1920s', room: 'Living Room', 
    prompt: 'Create a photorealistic 1920s Art Deco living room in Manhattan penthouse. Features: geometric patterns, chrome and glass furniture, velvet upholstery, sunburst motifs, marble surfaces, dramatic lighting, metallic accents, bold colors. Jazz Age glamour with machine age aesthetics. Professional interior photography, dramatic mood lighting.' },
    
  { filename: 'art-deco-1920s-bar.png', style: 'Art Deco 1920s', room: 'Bar', 
    prompt: 'Create a photorealistic 1920s Art Deco home bar in luxury apartment. Features: geometric tile work, chrome fixtures, mirrored surfaces, crystal decanters, leather barstools, neon accent lighting, marble bar top. Prohibition era sophistication with speakeasy glamour. Professional interior photography, moody atmospheric lighting.' },
    
  // === INDUSTRIAL & URBAN STYLES ===
  
  // Industrial Warehouse
  { filename: 'industrial-warehouse-living-room.png', style: 'Industrial Warehouse', room: 'Living Room', 
    prompt: 'Create a photorealistic industrial living room in converted 1920s warehouse loft. Features: exposed brick walls, steel I-beams, concrete floors, vintage leather furniture, Edison bulb fixtures, large steel windows, metal coffee table, urban views. Raw industrial heritage with sophisticated comfort. Professional interior photography, dramatic natural light.' },
    
  { filename: 'industrial-warehouse-kitchen.png', style: 'Industrial Warehouse', room: 'Kitchen', 
    prompt: 'Create a photorealistic industrial kitchen in converted factory space. Features: stainless steel appliances, concrete countertops, exposed ductwork, subway tile backsplash, metal bar stools, hanging pot rack, large windows, urban character. Commercial kitchen meets residential comfort. Professional interior photography, bright industrial lighting.' },
    
  // Urban Loft
  { filename: 'urban-loft-bedroom.png', style: 'Urban Loft', room: 'Bedroom', 
    prompt: 'Create a photorealistic urban loft bedroom in converted textile factory. Features: exposed brick, steel frame bed, concrete accents, large industrial windows, minimal furniture, Edison lighting, polished concrete floors, city views. Industrial romance with modern comfort. Professional interior photography, moody evening light.' },
    
  { filename: 'urban-loft-home-office.png', style: 'Urban Loft', room: 'Home Office', 
    prompt: 'Create a photorealistic urban loft home office in converted printing house. Features: steel and wood desk, exposed pipes, brick walls, industrial lighting, vintage typewriter collection, metal shelving, large windows, creative workspace. Industrial heritage meets modern productivity. Professional interior photography, bright workspace lighting.' },
    
  // === RUSTIC & NATURAL STYLES ===
  
  // Rustic Farmhouse
  { filename: 'rustic-farmhouse-kitchen.png', style: 'Rustic Farmhouse', room: 'Kitchen', 
    prompt: 'Create a photorealistic rustic farmhouse kitchen in 1800s American homestead. Features: farmhouse sink, reclaimed wood cabinets, butcher block counters, vintage appliances, open shelving, mason jars, herbs, wide plank floors, beamed ceiling. Authentic agricultural heritage with modern functionality. Professional interior photography, warm natural light.' },
    
  { filename: 'rustic-farmhouse-living-room.png', style: 'Rustic Farmhouse', room: 'Living Room', 
    prompt: 'Create a photorealistic rustic farmhouse living room in restored barn home. Features: stone fireplace, reclaimed wood beams, vintage furniture, quilts, antiques, lantern lighting, wide plank floors, barn doors, cozy textiles. American pastoral with authentic craftsmanship. Professional interior photography, golden hour warmth.' },
    
  // Mountain Lodge
  { filename: 'mountain-lodge-great-room.png', style: 'Mountain Lodge', room: 'Great Room', 
    prompt: 'Create a photorealistic mountain lodge great room in Rocky Mountain cabin. Features: massive stone fireplace, log beam construction, leather furniture, Native American textiles, antler chandelier, cowhide rugs, panoramic mountain views, rustic luxury. Western wilderness with sophisticated comfort. Professional interior photography, firelight ambiance.' },
    
  { filename: 'mountain-lodge-master-bedroom.png', style: 'Mountain Lodge', room: 'Master Bedroom', 
    prompt: 'Create a photorealistic mountain lodge master bedroom in alpine retreat. Features: log walls, stone accent wall, rustic bed frame, cozy textiles, fireplace, mountain views, wooden floors, wildlife artwork, cabin luxury. Rocky Mountain romance with rustic elegance. Professional interior photography, warm cabin lighting.' },
    
  // === LUXURY & GLAMOROUS STYLES ===
  
  // Hollywood Regency
  { filename: 'hollywood-regency-living-room.png', style: 'Hollywood Regency', room: 'Living Room', 
    prompt: 'Create a photorealistic Hollywood Regency living room in 1940s Beverly Hills mansion. Features: mirrored surfaces, metallic finishes, velvet furniture, dramatic lighting, crystal chandeliers, bold patterns, leopard print accents, glamorous styling. Golden Age of Hollywood with theatrical luxury. Professional interior photography, dramatic spotlighting.' },
    
  { filename: 'hollywood-regency-dining-room.png', style: 'Hollywood Regency', room: 'Dining Room', 
    prompt: 'Create a photorealistic Hollywood Regency dining room for celebrity entertaining. Features: mirrored dining table, velvet chairs, crystal chandelier, dramatic wallpaper, metallic accents, bar cart, glamorous styling, bold artwork. Movie star sophistication with dinner party drama. Professional interior photography, chandelier glamour.' },
    
  // Neoclassical Grandeur
  { filename: 'neoclassical-grandeur-foyer.png', style: 'Neoclassical Grandeur', room: 'Foyer', 
    prompt: 'Create a photorealistic neoclassical foyer in palatial mansion. Features: marble columns, coffered ceiling, crystal chandelier, marble floors, grand staircase, classical sculptures, oil paintings, ornate moldings, imperial scale. European palace grandeur with American mansion luxury. Professional interior photography, dramatic entrance lighting.' },
    
  { filename: 'neoclassical-grandeur-library.png', style: 'Neoclassical Grandeur', room: 'Library', 
    prompt: 'Create a photorealistic neoclassical library in estate mansion. Features: floor-to-ceiling bookshelves, marble fireplace, leather chairs, Persian rugs, classical columns, coffered ceiling, globe, classical sculptures, reading lamps. Scholarly luxury with imperial grandeur. Professional interior photography, warm library lighting.' },
    
  // === CULTURAL INFLUENCES ===
  
  // Japanese Zen
  { filename: 'japanese-zen-living-room.png', style: 'Japanese Zen', room: 'Living Room', 
    prompt: 'Create a photorealistic Japanese zen living room in traditional Kyoto machiya house. Features: tatami mats, shoji screens, low furniture, natural wood, minimal decoration, ikebana arrangement, tea ceremony area, sliding doors, zen garden view. Authentic Japanese aesthetics with meditative tranquility. Professional interior photography, soft natural light.' },
    
  { filename: 'japanese-zen-tea-room.png', style: 'Japanese Zen', room: 'Tea Room', 
    prompt: 'Create a photorealistic Japanese tea ceremony room in traditional temple. Features: tatami flooring, tokonoma alcove, hanging scroll, minimal furnishing, natural materials, precise proportions, zen garden view, ceremonial tea implements. Authentic chanoyu tradition with spiritual serenity. Professional interior photography, gentle diffused lighting.' },
    
  // Moroccan Riad
  { filename: 'moroccan-riad-living-room.png', style: 'Moroccan Riad', room: 'Living Room', 
    prompt: 'Create a photorealistic Moroccan living room in traditional Marrakech riad. Features: mosaic tile work, carved wood screens, brass lanterns, colorful textiles, low seating, hookah area, ornate patterns, courtyard views, jewel tones. Authentic Islamic design with North African craftsmanship. Professional interior photography, warm lantern light.' },
    
  { filename: 'moroccan-riad-courtyard.png', style: 'Moroccan Riad', room: 'Courtyard', 
    prompt: 'Create a photorealistic Moroccan riad courtyard in historic medina house. Features: central fountain, mosaic tile work, arched galleries, carved plaster, date palms, colorful ceramics, traditional seating, geometric patterns, Islamic architecture. Authentic Maghreb design with oasis tranquility. Professional interior photography, dappled sunlight.' },
    
  // Mediterranean Villa
  { filename: 'mediterranean-villa-terrace.png', style: 'Mediterranean Villa', room: 'Terrace', 
    prompt: 'Create a photorealistic Mediterranean terrace in Tuscan hilltop villa. Features: terracotta floors, wrought iron furniture, climbing vines, olive trees, stone walls, outdoor kitchen, pergola, vineyard views, warm textures. Italian countryside luxury with al fresco living. Professional interior photography, golden Mediterranean light.' },
    
  { filename: 'mediterranean-villa-kitchen.png', style: 'Mediterranean Villa', room: 'Kitchen', 
    prompt: 'Create a photorealistic Mediterranean kitchen in coastal Spanish villa. Features: hand-painted tiles, natural stone counters, wrought iron details, terra cotta accents, herbs growing, rustic wood beams, arched windows, sea views. Authentic Spanish coastal with rustic elegance. Professional interior photography, bright seaside light.' },
    
  // === FANTASY & ENTERTAINMENT INSPIRED ===
  
  // Harry Potter Magical Academia
  { filename: 'harry-potter-library.png', style: 'Harry Potter Magical', room: 'Library', 
    prompt: 'Create a photorealistic magical library inspired by Hogwarts castle. Features: towering bookshelves, floating candles, moving portraits, ancient tomes, Gothic architecture, stone walls, mystical atmosphere, brass telescopes, potion ingredients, magical artifacts. Wizarding world academia with medieval castle grandeur. Professional interior photography, candlelit mystique.' },
    
  { filename: 'harry-potter-common-room.png', style: 'Harry Potter Magical', room: 'Common Room', 
    prompt: 'Create a photorealistic magical common room in castle tower. Features: stone fireplace, tapestries, wooden tables, comfortable armchairs, Gothic windows, suits of armor, house banners, cozy lighting, ancient architecture, magical ambiance. Wizarding school comfort with medieval castle atmosphere. Professional interior photography, warm firelight.' },
    
  // Star Wars Futuristic
  { filename: 'star-wars-command-center.png', style: 'Star Wars Futuristic', room: 'Command Center', 
    prompt: 'Create a photorealistic Star Wars command center on space station. Features: holographic displays, sleek control panels, metallic surfaces, blue accent lighting, futuristic seating, galaxy views, clean lines, high-tech materials, space age aesthetic. Galactic Empire sophistication with advanced technology. Professional interior photography, blue tech lighting.' },
    
  { filename: 'star-wars-meditation-chamber.png', style: 'Star Wars Futuristic', room: 'Meditation Chamber', 
    prompt: 'Create a photorealistic Jedi meditation chamber in temple. Features: circular design, natural materials, crystal formations, floating platforms, serene lighting, minimal furnishing, galaxy views, spiritual ambiance, force sensitivity. Jedi wisdom with cosmic tranquility. Professional interior photography, ethereal lighting.' },
    
  // Studio Ghibli Magical Realism
  { filename: 'studio-ghibli-cottage.png', style: 'Studio Ghibli Magical', room: 'Cottage Interior', 
    prompt: 'Create a photorealistic Studio Ghibli cottage interior with magical elements. Features: rounded doorways, natural wood, plants growing indoors, whimsical details, cozy furnishings, warm lighting, handcrafted items, fairy tale atmosphere, organic architecture. Miyazaki magic with countryside charm. Professional interior photography, enchanted forest light.' },
    
  { filename: 'studio-ghibli-workshop.png', style: 'Studio Ghibli Magical', room: 'Workshop', 
    prompt: 'Create a photorealistic magical workshop from Studio Ghibli film. Features: wooden workbenches, mysterious inventions, glowing crystals, brass instruments, cluttered charm, natural materials, curved architecture, creative chaos, artisan tools, magical atmosphere. Inventor\'s paradise with whimsical engineering. Professional interior photography, warm workshop lighting.' },
    
  // Blade Runner Cyberpunk
  { filename: 'blade-runner-apartment.png', style: 'Blade Runner Cyberpunk', room: 'Apartment', 
    prompt: 'Create a photorealistic Blade Runner apartment in 2049 Los Angeles megacity. Features: neon lighting, holographic displays, asian influences, urban decay, high-tech low-life aesthetic, rain-soaked windows, city views, noir atmosphere, synthetic materials, cyber enhancement. Dystopian future with film noir mystery. Professional interior photography, neon noir lighting.' },
    
  { filename: 'blade-runner-bar.png', style: 'Blade Runner Cyberpunk', room: 'Bar', 
    prompt: 'Create a photorealistic cyberpunk bar in dystopian cityscape. Features: neon signs, holographic advertisements, synthetic alcohol, rain effects, noir atmosphere, futuristic materials, urban decay, asian cultural fusion, high-tech elements, moody lighting. Neo-noir nightlife with cyberpunk aesthetics. Professional interior photography, neon atmospheric lighting.' }
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
 * Generate all comprehensive images
 */
async function generateComprehensiveImages() {
  console.log('🎨 Comprehensive Interior Design Image Generator');
  console.log('===============================================');
  console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📸 Generating ${COMPREHENSIVE_IMAGES.length} comprehensive images\n`);

  if (!API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < COMPREHENSIVE_IMAGES.length; i++) {
    const imageSpec = COMPREHENSIVE_IMAGES[i];
    
    console.log(`\n[${i + 1}/${COMPREHENSIVE_IMAGES.length}] ${imageSpec.style} ${imageSpec.room}`);
    console.log(`📝 ${imageSpec.filename}`);
    
    try {
      const result = await generateRealImage(imageSpec);
      
      if (result.success) {
        console.log(`✅ Generated: ${result.filename} (${Math.round(result.size / 1024)}KB)`);
        successCount++;
      }
      
      // Rate limiting - 8 seconds between requests to avoid hitting quotas
      if (i < COMPREHENSIVE_IMAGES.length - 1) {
        console.log('⏳ Waiting 8 seconds...');
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
      
    } catch (error) {
      console.error(`❌ Failed ${imageSpec.filename}: ${error.message}`);
      failureCount++;
      
      // Continue with next image even if one fails
      if (i < COMPREHENSIVE_IMAGES.length - 1) {
        console.log('⏳ Waiting 5 seconds before next...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  console.log(`\n🎉 Comprehensive Image Generation Complete!`);
  console.log(`✅ Successfully generated: ${successCount} images`);
  console.log(`❌ Failed: ${failureCount} images`);
  console.log(`📊 Success rate: ${Math.round((successCount / COMPREHENSIVE_IMAGES.length) * 100)}%`);
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    total_images: COMPREHENSIVE_IMAGES.length,
    successful: successCount,
    failed: failureCount,
    success_rate: Math.round((successCount / COMPREHENSIVE_IMAGES.length) * 100),
    categories_covered: [...new Set(COMPREHENSIVE_IMAGES.map(img => img.style))],
    rooms_covered: [...new Set(COMPREHENSIVE_IMAGES.map(img => img.room))]
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'comprehensive-generation-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📋 Report saved: comprehensive-generation-report.json`);
}

if (require.main === module) {
  generateComprehensiveImages();
}