#!/usr/bin/env node

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
require('dotenv').config();

// Professional 3D Style Guide
const PROFESSIONAL_3D_STYLE = {
  style: {
    name: "Professional 3D",
    aesthetic: [
      "sophisticated",
      "minimalist", 
      "modern",
      "premium",
      "app-ready"
    ],
    color_palette: {
      primary: "muted professional tones",
      accents: ["#C9A98C", "#B9906F", "#A8B5C1", "#E8D5C4", "#F5E6D8"],
      neutrals: ["#FDFBF7", "#F5F5F5", "#E0E0E0"],
      shadows: ["#9B8B7A", "#7A6B5A", "#5A4B3A"],
      brand: {
        primary: "#C9A98C", // Warm beige
        secondary: "#B9906F", // Darker brown
        background: "#FDFBF7" // Cream
      }
    },
    shapes: {
      body: "smooth, rounded forms with subtle geometric influences",
      style: "refined 3D objects with professional polish",
      edges: "soft rounded corners, no sharp angles"
    },
    materials: {
      look: "premium matte plastic or smooth ceramic",
      finish: "sophisticated with realistic shadows and highlights",
      depth: "strong 3D presence with dimensional lighting"
    },
    lighting: {
      primary: "soft directional light from top-left",
      shadows: "realistic drop shadows with blur",
      highlights: "subtle specular highlights on surfaces",
      ambient: "gentle ambient occlusion for depth"
    }
  }
};

class Professional3DIconGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.totalGenerated = 0;
    this.totalFailed = 0;
    this.totalSkipped = 0;
  }

  createProfessional3DPrompt(spec) {
    // Select a professional color for this icon
    const colors = PROFESSIONAL_3D_STYLE.style.color_palette.accents;
    const primaryColor = colors[Math.floor(Math.random() * colors.length)];
    
    return `Create a professional 3D rendered icon following these exact specifications:

STYLE: Professional 3D - sophisticated, minimalist, modern, premium app icon

SUBJECT: ${spec.description}

FORM:
- Clean, refined 3D object with smooth surfaces
- Professional ${spec.description} representation
- Premium matte plastic or ceramic material appearance
- Sophisticated finish with realistic depth and dimension
- Modern interpretation with subtle geometric influences

COLORS:
- Primary: ${primaryColor}
- Brand colors: #C9A98C (warm beige), #B9906F (rich brown)
- Accent colors: #A8B5C1 (cool gray), #E8D5C4 (light cream)
- Shadow colors: #9B8B7A, #7A6B5A for realistic depth
- Background: TRANSPARENT with subtle drop shadow

PROFESSIONAL LIGHTING SYSTEM:
- Primary light: Soft directional lighting from top-left (45° angle)
- Key highlight: Subtle specular reflection on curved surfaces
- Shadow system: Realistic drop shadow with gaussian blur
- Ambient occlusion: Gentle contact shadows for surface depth
- Secondary bounce light: Subtle fill light from opposite side
- Overall mood: Clean, professional, premium quality

CRITICAL COMPOSITION REQUIREMENTS:
- TIGHT CROPPING: Object fills 85-95% of the canvas
- NO EXCESSIVE WHITE SPACE around the subject
- Professional padding: 5-8% margin maximum
- Strong 3D presence with dimensional depth
- Subject positioned for maximum visual impact
- Drop shadow extends slightly beyond object bounds

3D RENDERING DETAILS:
- Surface quality: Smooth matte finish with subtle texture variation
- Edge treatment: Soft rounded corners, no sharp angles
- Depth perception: Strong 3D form with clear volume
- Professional polish: App-store ready quality
- Material consistency: Uniform surface properties
- Lighting consistency: Realistic light behavior

TECHNICAL SPECIFICATIONS:
- Resolution: ${spec.width}x${spec.height} pixels
- View angle: Slightly angled 3/4 view for maximum depth
- Perspective: Subtle isometric influence for clarity
- Anti-aliasing: Smooth edges throughout
- Color depth: Professional grade color accuracy

CONCEPT INTERPRETATION:
- Transform "${spec.description}" into its most essential 3D form
- Maintain clear recognizability and functionality
- Balance simplicity with professional sophistication
- Ensure icon reads clearly at multiple sizes

PROFESSIONAL RESTRICTIONS:
- NO text, labels, or typography
- NO overly complex details or decorations
- NO flat or 2D elements
- NO amateur lighting or unrealistic shadows
- NO childish or overly playful elements
- NO excessive ornamental details
- Maintain clean, professional aesthetic throughout`;
  }

  async generateImage(prompt, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash-image-preview",
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
          }
        });

        console.log(`  Attempt ${attempt}/${retries}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const candidates = response.candidates || [];
        
        // Get the first candidate (image)
        const candidate = candidates[0];
        let base64Data = '';
        
        // Handle different response formats
        if (candidate && candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              base64Data = part.inlineData.data;
              break;
            }
          }
        }
        
        if (base64Data) {
          return Buffer.from(base64Data, 'base64');
        }
        
        console.log(`  No image data found in response`);
        
      } catch (error) {
        console.log(`  Attempt ${attempt} failed:`, error.message);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    throw new Error('Failed to generate image after all retries');
  }

  async downloadImage(url, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const imageData = await new Promise((resolve, reject) => {
          https.get(url, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`HTTP ${response.statusCode}`));
              return;
            }
            
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
          }).on('error', reject);
        });
        
        return imageData;
      } catch (error) {
        console.log(`  Download attempt ${attempt} failed:`, error.message);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  parseAssetsFromMarkdown(content) {
    const assets = [];
    const lines = content.split('\n');
    
    // Patterns to match different asset definitions
    const patterns = [
      /^[-•]\s*\*\*`([^`]+)`\*\*\s*[-–]\s*(.+)$/,
      /^[-•]\s*\*\*([^*]+)\*\*:\s*(.+)$/,
      /^[-•]\s*`([^`]+)`\s*[-–:]\s*(.+)$/
    ];
    
    let currentCategory = '';
    let currentScreen = '';
    
    for (const line of lines) {
      // Track current screen/section
      if (line.startsWith('## ')) {
        currentScreen = line.replace('##', '').trim();
        continue;
      }
      
      // Track current category
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        currentCategory = line.replace(/#{3,4}/, '').trim();
        continue;
      }
      
      // Match asset definitions
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const filename = match[1].trim();
          const description = match[2].trim();
          
          // Filter for ALL visual assets (including photos, videos, animations)
          const visualExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.mp4', '.json'];
          const isVisualAsset = visualExtensions.some(ext => filename.toLowerCase().endsWith(ext));
          
          // For now, focus on generatable static images (we can't generate MP4/JSON with image AI)
          const generateableExtensions = ['.svg', '.png', '.jpg', '.jpeg'];
          const isGenerateable = generateableExtensions.some(ext => filename.toLowerCase().endsWith(ext));
          
          if (isVisualAsset && isGenerateable) {
            
            // Determine dimensions based on asset type and description
            let width = 48, height = 48;
            
            // Check for explicit dimensions in description
            const dimensionMatch = description.match(/(\d+)x(\d+)/);
            if (dimensionMatch) {
              width = parseInt(dimensionMatch[1]);
              height = parseInt(dimensionMatch[2]);
            } else if (filename.includes('.jpg') || filename.includes('photo') || 
                      filename.includes('showcase') || filename.includes('example')) {
              // Photography assets need larger dimensions
              width = 400;
              height = 300;
            } else if (filename.includes('hero') || filename.includes('background')) {
              // Hero/background images need even larger dimensions
              width = 800;
              height = 600;
            } else if (filename.includes('testimonial') || filename.includes('avatar')) {
              // Profile photos are square
              width = height = 100;
            } else if (description.toLowerCase().includes('hero') || 
                      description.toLowerCase().includes('large')) {
              width = height = 96;
            }
            
            // Determine category path
            let categoryPath = 'misc';
            if (filename.includes('navigation') || currentCategory.includes('Navigation')) {
              categoryPath = 'navigation';
            } else if (filename.includes('category') || filename.includes('categories') || 
                      currentCategory.includes('Category')) {
              categoryPath = 'categories';
            } else if (filename.includes('room') || currentCategory.includes('Room')) {
              categoryPath = 'rooms';
            } else if (filename.includes('feature') || currentCategory.includes('Feature')) {
              categoryPath = 'features';
            } else if (filename.includes('social') || filename.includes('logo')) {
              categoryPath = 'social';
            } else if (filename.includes('style')) {
              categoryPath = 'styles';
            } else if (filename.includes('process') || filename.includes('step')) {
              categoryPath = 'process';
            } else if (filename.includes('filter') || filename.includes('sort')) {
              categoryPath = 'ui';
            } else if (filename.includes('illustration')) {
              categoryPath = 'illustrations';
            } else if (filename.includes('badge')) {
              categoryPath = 'badges';
            } else if (filename.includes('pattern') || filename.includes('gradient')) {
              categoryPath = 'patterns';
            } else if (filename.includes('overlay')) {
              categoryPath = 'overlays';
            } else if (filename.includes('graphic')) {
              categoryPath = 'graphics';
            } else if (filename.includes('sample') || filename.includes('example')) {
              categoryPath = 'samples';
            } else if (filename.includes('showcase')) {
              categoryPath = 'showcases';
            } else if (filename.includes('testimonial')) {
              categoryPath = 'testimonials';
            } else if (filename.includes('photo') || filename.includes('collection')) {
              categoryPath = 'photography';
            } else if (filename.includes('hero') || filename.includes('background')) {
              categoryPath = 'backgrounds';
            }
            
            // Keep original extension for JPG files, convert SVG to PNG
            let outputFilename = filename;
            if (filename.endsWith('.svg')) {
              outputFilename = filename.replace('.svg', '.png');
            }
            
            assets.push({
              filename: outputFilename,
              description: description.split('-')[0].trim(),
              width,
              height,
              category: categoryPath,
              screen: currentScreen,
              originalType: filename.split('.').pop().toLowerCase()
            });
          }
        }
      }
    }
    
    return assets;
  }

  async generateKawaii3DAssets(mode = 'test') {
    try {
      console.log('\n🎨 Professional 3D Icon Generator');
      console.log('================================\n');
      
      // Read comprehensive requirements
      const requirementsPath = path.join(
        __dirname, 
        '../../@DOCS/development/COMPREHENSIVE-ASSET-REQUIREMENTS.md'
      );
      const requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
      
      // Parse all icon assets
      let allAssets = this.parseAssetsFromMarkdown(requirementsContent);
      
      // Filter based on mode
      if (mode === 'test') {
        // Test with 5 diverse icons
        allAssets = [
          allAssets.find(a => a.filename.includes('camera')),
          allAssets.find(a => a.filename.includes('interior')),
          allAssets.find(a => a.filename.includes('living-room')),
          allAssets.find(a => a.filename.includes('ai')),
          allAssets.find(a => a.filename.includes('project'))
        ].filter(Boolean).slice(0, 5);
      } else if (mode === 'categories') {
        allAssets = allAssets.filter(a => a.category === 'categories');
      } else if (mode === 'navigation') {
        allAssets = allAssets.filter(a => a.category === 'navigation');
      } else if (mode === 'priority1') {
        // Focus on essential icons
        allAssets = allAssets.filter(a => 
          a.category === 'navigation' || 
          a.category === 'categories' ||
          a.filename.includes('camera') ||
          a.filename.includes('project')
        );
      }
      
      console.log(`📋 Found ${allAssets.length} icons to generate\n`);
      
      if (allAssets.length === 0) {
        console.log('❌ No icons found matching criteria');
        return;
      }
      
      // Generate each icon
      for (const [index, asset] of allAssets.entries()) {
        console.log(`\n[${index + 1}/${allAssets.length}] Generating: ${asset.filename}`);
        console.log(`  Category: ${asset.category}`);
        console.log(`  Size: ${asset.width}x${asset.height}`);
        console.log(`  Style: Professional 3D with shadows and depth`);
        
        try {
          // Check if file already exists
          const outputDir = path.join(__dirname, '../../src/assets/icons', asset.category);
          const outputPath = path.join(outputDir, asset.filename);
          
          try {
            await fs.access(outputPath);
            console.log(`  ⏭️  Skipping - file already exists: ${path.relative(process.cwd(), outputPath)}`);
            this.totalSkipped++;
            continue; // Skip to next asset
          } catch {
            // File doesn't exist, proceed with generation
          }
          
          // Create professional 3D prompt
          const prompt = this.createProfessional3DPrompt(asset);
          
          // Generate image
          const imageData = await this.generateImage(prompt);
          
          // Save to appropriate directory
          await this.ensureDirectoryExists(outputDir);
          await fs.writeFile(outputPath, imageData);
          
          console.log(`  ✅ Saved to: ${path.relative(process.cwd(), outputPath)}`);
          this.totalGenerated++;
          
          // Rate limiting - 10 seconds between requests to respect quota
          if (index < allAssets.length - 1) {
            console.log('  ⏳ Waiting 10 seconds before next request...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
          
        } catch (error) {
          console.error(`  ❌ Failed: ${error.message}`);
          this.totalFailed++;
        }
      }
      
      // Summary
      console.log('\n================================');
      console.log('🎨 Professional 3D Generation Complete!\n');
      console.log(`✅ Successfully generated: ${this.totalGenerated} icons`);
      console.log(`⏭️  Skipped (already exist): ${this.totalSkipped} icons`);
      console.log(`❌ Failed: ${this.totalFailed} icons`);
      console.log(`📊 Total processed: ${this.totalGenerated + this.totalSkipped + this.totalFailed}/${allAssets.length}`);
      
      const newlyGenerated = this.totalGenerated;
      const successRate = allAssets.length > 0 ? Math.round(((this.totalGenerated + this.totalSkipped) / allAssets.length) * 100) : 0;
      console.log(`📈 Success rate: ${successRate}%`);
      
      // Create style reference
      if (this.totalGenerated > 0) {
        const styleRefPath = path.join(__dirname, '../../src/assets/professional-3d-style.json');
        await fs.writeFile(styleRefPath, JSON.stringify(PROFESSIONAL_3D_STYLE, null, 2));
        console.log(`\n📝 Style guide saved to: ${path.relative(process.cwd(), styleRefPath)}`);
      }
      
    } catch (error) {
      console.error('\n❌ Generator Error:', error.message);
      console.error(error.stack);
    }
  }
}

// Main execution
async function main() {
  const mode = process.argv[2] || 'test';
  const validModes = ['test', 'all', 'categories', 'navigation', 'priority1'];
  
  if (!validModes.includes(mode)) {
    console.log('Usage: node generateKawaii3DIcons.js [mode]');
    console.log('Modes: test, all, categories, navigation, priority1');
    process.exit(1);
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const generator = new Professional3DIconGenerator();
  await generator.generateKawaii3DAssets(mode);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = Professional3DIconGenerator;