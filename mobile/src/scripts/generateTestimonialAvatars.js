#!/usr/bin/env node

/**
 * Testimonial Avatar Generation Script
 * Generates realistic professional headshots for testimonials using Gemini AI
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../assets/testimonials');

// Ensure testimonials directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Professional testimonial avatars matching your current testimonials
const TESTIMONIAL_AVATARS = [
  {
    filename: 'maria-l-real-estate-agent.png',
    name: 'Maria L',
    profession: 'Real Estate Agent',
    prompt: 'Create a photorealistic professional headshot of Maria, a successful Hispanic real estate agent in her 30s. Features: confident smile, professional blazer, styled hair, trustworthy appearance, real estate professional look, warm and approachable demeanor, business portrait lighting, high-end real estate agent style. Professional headshot photography with excellent lighting and sharp focus.'
  },
  {
    filename: 'james-k-homeowner.png',
    name: 'James K',
    profession: 'Homeowner',
    prompt: 'Create a photorealistic professional headshot of James, a middle-aged Caucasian homeowner in his 40s. Features: genuine smile, casual business attire, approachable family man appearance, confident but relaxed demeanor, suburban homeowner style, trustworthy face, natural lighting, authentic homeowner look. Professional portrait photography with warm and friendly lighting.'
  },
  {
    filename: 'sophie-m-interior-designer.png',
    name: 'Sophie M',
    profession: 'Interior Designer',
    prompt: 'Create a photorealistic professional headshot of Sophie, a creative French interior designer in her 30s. Features: artistic and sophisticated appearance, designer glasses, stylish outfit, creative professional look, confident artistic expression, European design aesthetic, chic styling, design industry professional. Professional creative portrait with stylish lighting and modern composition.'
  },
  {
    filename: 'andre-p-contractor.png',
    name: 'Andre P',
    profession: 'Contractor',
    prompt: 'Create a photorealistic professional headshot of Andre, a skilled Black contractor in his 40s. Features: strong confident smile, construction industry professional, trustworthy craftsman appearance, experienced contractor look, work shirt or polo, reliable and competent demeanor, construction professional style. Professional trade industry portrait with excellent lighting and authentic appearance.'
  },
  {
    filename: 'rina-s-architect.png',
    name: 'Rina S',
    profession: 'Architect',
    prompt: 'Create a photorealistic professional headshot of Rina, an accomplished Asian architect in her 30s. Features: intelligent and sophisticated appearance, modern professional attire, architectural precision in styling, confident architect demeanor, contemporary professional look, design industry sophistication, architectural professional style. Professional architectural portrait with clean lighting and modern composition.'
  },
  {
    filename: 'carla-v-homeowner.png',
    name: 'Carla V',
    profession: 'Homeowner',
    prompt: 'Create a photorealistic professional headshot of Carla, a warm Latina homeowner and mother in her 30s. Features: genuine maternal warmth, family-oriented appearance, approachable homeowner style, caring mother look, comfortable and relatable demeanor, family woman aesthetic, natural beauty, suburban mother style. Professional family portrait with warm and inviting lighting.'
  }
];

/**
 * Generate a single avatar using Gemini API
 */
async function generateAvatar(avatarSpec) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "contents": [
        {
          "parts": [
            {
              "text": avatarSpec.prompt
            }
          ]
        }
      ],
      "generationConfig": {
        "temperature": 0.3,
        "topP": 0.8,
        "topK": 30
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

    console.log(`👤 Generating ${avatarSpec.name} - ${avatarSpec.profession}...`);

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
                  const filepath = path.join(OUTPUT_DIR, avatarSpec.filename);
                  
                  // Save the avatar
                  fs.writeFileSync(filepath, buffer);
                  
                  const sizeKB = Math.round(buffer.length / 1024);
                  console.log(`✅ Avatar generated: ${avatarSpec.filename} (${sizeKB}KB)`);
                  
                  resolve({
                    success: true,
                    filename: avatarSpec.filename,
                    size: buffer.length,
                    filepath,
                    name: avatarSpec.name,
                    profession: avatarSpec.profession
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
 * Generate all testimonial avatars
 */
async function generateTestimonialAvatars() {
  console.log('👥 Testimonial Avatar Generator');
  console.log('==============================');
  console.log(`🔑 API Key: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`👤 Generating ${TESTIMONIAL_AVATARS.length} professional avatars\n`);

  if (!API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;
  const results = [];

  for (let i = 0; i < TESTIMONIAL_AVATARS.length; i++) {
    const avatarSpec = TESTIMONIAL_AVATARS[i];
    
    console.log(`\n[${i + 1}/${TESTIMONIAL_AVATARS.length}] ${avatarSpec.name} - ${avatarSpec.profession}`);
    
    // Check if avatar already exists
    const filepath = path.join(OUTPUT_DIR, avatarSpec.filename);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 50 * 1024) { // 50KB threshold
        console.log(`⏭️  Skipping ${avatarSpec.filename} - already exists (${Math.round(stats.size / 1024)}KB)`);
        results.push({
          name: avatarSpec.name,
          profession: avatarSpec.profession,
          filename: avatarSpec.filename,
          status: 'skipped',
          size: stats.size
        });
        continue;
      }
    }
    
    try {
      const result = await generateAvatar(avatarSpec);
      
      if (result.success) {
        console.log(`✅ Generated: ${result.filename} (${Math.round(result.size / 1024)}KB)`);
        successCount++;
        results.push({
          name: result.name,
          profession: result.profession,
          filename: result.filename,
          status: 'success',
          size: result.size
        });
      }
      
      // Rate limiting - 5 seconds between requests
      if (i < TESTIMONIAL_AVATARS.length - 1) {
        console.log('⏳ Waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      console.error(`❌ Failed ${avatarSpec.filename}: ${error.message}`);
      failureCount++;
      results.push({
        name: avatarSpec.name,
        profession: avatarSpec.profession,
        filename: avatarSpec.filename,
        status: 'failed',
        error: error.message
      });
      
      // Continue with next avatar even if one fails
      if (i < TESTIMONIAL_AVATARS.length - 1) {
        console.log('⏳ Waiting 3 seconds before next...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(`\n🎉 Testimonial Avatar Generation Complete!`);
  console.log(`✅ Successfully generated: ${successCount} avatars`);
  console.log(`❌ Failed: ${failureCount} avatars`);
  console.log(`📊 Success rate: ${Math.round((successCount / TESTIMONIAL_AVATARS.length) * 100)}%`);
  
  // Generate avatar report
  const avatarReport = {
    timestamp: new Date().toISOString(),
    total_avatars: TESTIMONIAL_AVATARS.length,
    successful: successCount,
    failed: failureCount,
    success_rate: Math.round((successCount / TESTIMONIAL_AVATARS.length) * 100),
    avatars: results,
    usage_instructions: {
      import_path: '../assets/testimonials/',
      react_native_usage: 'Use with Image component: source={require(\'../assets/testimonials/maria-l-real-estate-agent.png\')}',
      avatar_specs: 'All avatars are professional headshots optimized for testimonial use'
    }
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'avatars-report.json'), 
    JSON.stringify(avatarReport, null, 2)
  );
  
  console.log(`\n📋 Avatar report saved: ${OUTPUT_DIR}/avatars-report.json`);
  console.log(`\n💡 Usage in React Native:`);
  console.log(`   import AvatarMaria from '../assets/testimonials/maria-l-real-estate-agent.png';`);
  console.log(`   <Image source={AvatarMaria} style={styles.avatar} />`);
  console.log(`\n🎯 Ready to update OnboardingScreen4.tsx with real faces!`);
}

if (require.main === module) {
  generateTestimonialAvatars();
}