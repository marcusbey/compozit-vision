/**
 * Asset Generation Script (JavaScript version)
 * Uses Gemini 2.5 Flash Image Preview for AI-powered asset creation
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class AssetGenerator {
  constructor() {
    // Initialize Gemini AI - check both possible env var names
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY or EXPO_PUBLIC_GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.assetsBasePath = path.join(__dirname, '../assets');
    this.generated = [];
    this.failed = [];
    
    console.log('🎨 Asset Generator initialized with Gemini 2.5 Flash Image Preview');
    console.log(`📁 Assets will be saved to: ${this.assetsBasePath}`);
  }

  /**
   * Generate a single asset
   */
  async generateAsset(spec) {
    try {
      console.log(`\n🎯 Generating: ${spec.name}`);
      console.log(`📋 Description: ${spec.description}`);
      
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      // For SVG assets, create them using AI
      if (spec.type === 'svg') {
        const svgContent = await this.generateSVG(spec);
        const filePath = this.getAssetPath(spec);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, svgContent);
        console.log(`✅ AI-generated SVG saved: ${filePath}`);
        
        this.generated.push(spec.name);
        return true;
      }

      // For other types, create specification files
      const specContent = {
        assetName: spec.name,
        type: spec.type,
        category: spec.category,
        subcategory: spec.subcategory,
        description: spec.description,
        generationPrompt: this.createImagePrompt(spec),
        specifications: spec.specs,
        priority: spec.priority,
        status: 'specification_generated',
        generatedAt: new Date().toISOString(),
        model: 'gemini-2.5-flash-image-preview'
      };

      const specPath = this.getAssetPath(spec).replace(`.${spec.type}`, '.spec.json');
      const dir = path.dirname(specPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(specPath, JSON.stringify(specContent, null, 2));
      console.log(`✅ Specification saved: ${specPath}`);
      
      this.generated.push(spec.name);
      return true;

    } catch (error) {
      console.error(`❌ Failed to generate ${spec.name}:`, error.message || error);
      this.failed.push(spec.name);
      return false;
    }
  }

  /**
   * Generate AI-powered SVG content using Gemini
   */
  async generateSVG(spec) {
    const { width = 24, height = 24 } = spec.specs || {};
    const brandColor = '#C9A98C';
    
    try {
      console.log(`🤖 Using AI to generate SVG for: ${spec.name}`);
      
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
        }
      });

      // Create a detailed prompt for SVG generation
      const svgPrompt = `Create an SVG icon for "${spec.description}". 
      
REQUIREMENTS:
- Generate only the SVG path elements (no <svg> wrapper)
- Use viewBox="0 0 24 24" coordinate system
- Primary color: ${brandColor}
- Style: ${spec.specs.style || 'modern'}, clean, minimalist
- Size optimized for ${width}x${height}
- Professional app icon quality
- ${spec.prompt}

SPECIFIC ICON CONTEXT:
${this.getIconContext(spec.name)}

OUTPUT FORMAT: Only return the SVG path elements and shapes, no explanatory text.
Example format: <path d="..." fill="${brandColor}"/><circle cx="..." cy="..." r="..." stroke="${brandColor}"/>

Generate the SVG elements now:`;

      const result = await model.generateContent([svgPrompt]);
      const response = await result.response;
      const aiSvgContent = response.text();
      
      // Clean up the AI response to extract only SVG elements
      let svgElements = aiSvgContent
        .replace(/```svg/g, '')
        .replace(/```/g, '')
        .replace(/<svg[^>]*>/g, '')
        .replace(/<\/svg>/g, '')
        .trim();

      // If AI didn't generate proper SVG, fall back to curated paths
      if (!svgElements.includes('<') || svgElements.length < 20) {
        console.log(`⚠️ AI response was incomplete for ${spec.name}, using curated SVG`);
        svgElements = this.getCuratedSVGPath(spec.name, brandColor);
      }

      const metadataComment = `<!-- AI-Generated Asset: ${spec.name}
Generated: ${new Date().toISOString()}
Category: ${spec.category}
AI Model: gemini-2.5-flash-image-preview
Description: ${spec.description}
-->`;

      return `${metadataComment}
<svg width="${width}" height="${height}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  ${svgElements}
</svg>`;

    } catch (error) {
      console.error(`❌ AI SVG generation failed for ${spec.name}:`, error.message);
      console.log(`🔄 Falling back to curated SVG for ${spec.name}`);
      
      // Fallback to curated SVG paths
      const curatedPath = this.getCuratedSVGPath(spec.name, brandColor);
      const metadataComment = `<!-- Curated Asset: ${spec.name}
Generated: ${new Date().toISOString()}
Category: ${spec.category}
Fallback: AI generation failed, using curated design
-->`;

      return `${metadataComment}
<svg width="${width}" height="${height}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  ${curatedPath}
</svg>`;
    }
  }

  /**
   * Get specific context for different icon types to help AI generation
   */
  getIconContext(iconName) {
    const name = iconName.toLowerCase();
    
    if (name.includes('interior-design')) {
      return 'Show furniture silhouettes like a sofa and table, representing interior spaces';
    } else if (name.includes('garden') || name.includes('landscape')) {
      return 'Show plants, trees, or landscaping elements representing outdoor design';
    } else if (name.includes('surface') || name.includes('materials')) {
      return 'Show abstract patterns or textures representing different materials and surfaces';
    } else if (name.includes('furniture') || name.includes('objects')) {
      return 'Show elegant furniture pieces like chairs, tables, or decorative objects';
    } else if (name.includes('exterior') || name.includes('architecture')) {
      return 'Show building silhouette or architectural elements like columns or rooflines';
    } else if (name.includes('camera')) {
      return 'Show a modern camera with lens, professional photography equipment';
    } else if (name.includes('project') || name.includes('plus')) {
      return 'Show a plus sign with creative elements, suggesting new project creation';
    } else if (name.includes('living-room')) {
      return 'Show sofa and coffee table arrangement, cozy living space elements';
    } else if (name.includes('bedroom')) {
      return 'Show bed with headboard and nightstand, peaceful sleeping space';
    } else if (name.includes('kitchen')) {
      return 'Show cabinets, appliances, or cooking elements representing kitchen space';
    } else if (name.includes('bathroom')) {
      return 'Show bathtub, shower, or sink elements representing bathroom space';
    } else if (name.includes('dining')) {
      return 'Show dining table with chairs, representing eating and social space';
    } else if (name.includes('office')) {
      return 'Show desk with chair and computer, representing workspace';
    } else {
      return 'Create a professional, clean icon that clearly represents the concept';
    }
  }

  /**
   * Get curated SVG paths as fallback when AI fails
   */
  getCuratedSVGPath(iconName, brandColor) {
    const name = iconName.toLowerCase();
    
    if (name.includes('interior-design')) {
      return `<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v2H8V8zm0 4h6v2H8v-2zm0 4h4v2H8v-2z" fill="${brandColor}"/>
              <path d="M16 12h2v2h-2v-2zm0 4h2v2h-2v-2z" fill="${brandColor}" opacity="0.7"/>`;
    } else if (name.includes('garden') || name.includes('landscape')) {
      return `<path d="M12 2l-2 4h4l-2-4z" fill="${brandColor}"/>
              <path d="M6 8c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z" fill="${brandColor}" opacity="0.8"/>
              <path d="M14 10c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z" fill="${brandColor}" opacity="0.6"/>
              <rect x="2" y="18" width="20" height="4" fill="${brandColor}" opacity="0.3"/>`;
    } else if (name.includes('surface') || name.includes('materials')) {
      return `<rect x="2" y="2" width="6" height="6" fill="${brandColor}" rx="1"/>
              <rect x="10" y="2" width="6" height="6" fill="${brandColor}" opacity="0.7" rx="1"/>
              <rect x="18" y="2" width="4" height="6" fill="${brandColor}" opacity="0.5" rx="1"/>
              <rect x="2" y="10" width="4" height="6" fill="${brandColor}" opacity="0.8" rx="1"/>
              <rect x="8" y="10" width="8" height="6" fill="${brandColor}" opacity="0.6" rx="1"/>
              <rect x="2" y="18" width="20" height="4" fill="${brandColor}" opacity="0.4" rx="1"/>`;
    } else if (name.includes('furniture') || name.includes('objects')) {
      return `<path d="M4 10h16v2H4v-2z" fill="${brandColor}"/>
              <path d="M6 8v4l-2 6h2l1.5-4.5h9L18 18h2l-2-6V8H6z" fill="${brandColor}" opacity="0.8"/>
              <circle cx="8" cy="18" r="1" fill="${brandColor}"/>
              <circle cx="16" cy="18" r="1" fill="${brandColor}"/>`;
    } else if (name.includes('exterior') || name.includes('architecture')) {
      return `<path d="M12 2L2 9v13h20V9L12 2zm0 2.8L19 11v9H5v-9l7-6.2z" fill="none" stroke="${brandColor}" stroke-width="2"/>
              <rect x="9" y="14" width="6" height="6" fill="${brandColor}" opacity="0.3"/>
              <path d="M8 11h8v1H8v-1zm0 2h8v1H8v-1z" fill="${brandColor}" opacity="0.5"/>`;
    } else if (name.includes('camera')) {
      return `<path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM17.5 9h-1.79l-.32-.95-.57-1.69A1 1 0 0 0 14.22 6H9.78a1 1 0 0 0-.95.64l-.54 1.64L7.5 9H5.5A1.5 1.5 0 0 0 4 10.5v7A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 9z" fill="${brandColor}"/>
              <circle cx="12" cy="12" r="2" fill="white"/>`;
    } else if (name.includes('project') || name.includes('plus')) {
      return `<circle cx="12" cy="12" r="9" fill="none" stroke="${brandColor}" stroke-width="2"/>
              <path d="M12 7v10M7 12h10" stroke="${brandColor}" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="${brandColor}" stroke-width="1" opacity="0.3"/>`;
    } else if (name.includes('living-room')) {
      return `<path d="M4 12h16v6H4v-6z" fill="${brandColor}" opacity="0.7"/>
              <path d="M3 11h18v2H3v-2z" fill="${brandColor}"/>
              <path d="M6 9v2M10 9v2M14 9v2M18 9v2" stroke="${brandColor}" stroke-width="2"/>
              <rect x="8" y="15" width="8" height="1" fill="${brandColor}" opacity="0.5"/>`;
    } else if (name.includes('bedroom')) {
      return `<rect x="4" y="12" width="16" height="6" rx="1" fill="${brandColor}" opacity="0.7"/>
              <rect x="5" y="10" width="14" height="3" rx="1" fill="${brandColor}"/>
              <rect x="18" y="8" width="2" height="8" rx="1" fill="${brandColor}" opacity="0.6"/>
              <rect x="4" y="8" width="2" height="8" rx="1" fill="${brandColor}" opacity="0.6"/>`;
    } else if (name.includes('kitchen')) {
      return `<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="${brandColor}" stroke-width="2"/>
              <path d="M7 6v4M11 6v4M15 6v4" stroke="${brandColor}" stroke-width="2"/>
              <rect x="6" y="12" width="3" height="2" fill="${brandColor}" opacity="0.5"/>
              <rect x="15" y="12" width="3" height="2" fill="${brandColor}" opacity="0.5"/>`;
    } else if (name.includes('bathroom')) {
      return `<path d="M6 18h12v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2z" fill="${brandColor}"/>
              <path d="M5 10v8c0 1 1 2 2 2h10c1 0 2-1 2-2v-8c0-2-2-4-4-4H9c-2 0-4 2-4 4z" fill="${brandColor}" opacity="0.6"/>
              <circle cx="9" cy="8" r="1" fill="${brandColor}"/>
              <circle cx="15" cy="8" r="1" fill="${brandColor}"/>`;
    } else if (name.includes('dining')) {
      return `<ellipse cx="12" cy="12" rx="8" ry="2" fill="${brandColor}" opacity="0.7"/>
              <path d="M4 12l2-6h2l-1.5 6M20 12l-2-6h-2l1.5 6M8 12l1-6h2l-1 6M16 12l-1-6h-2l1 6" fill="${brandColor}"/>`;
    } else if (name.includes('office')) {
      return `<rect x="4" y="10" width="16" height="8" rx="1" fill="${brandColor}" opacity="0.3"/>
              <rect x="3" y="9" width="18" height="2" rx="1" fill="${brandColor}"/>
              <rect x="8" y="6" width="8" height="4" rx="1" fill="${brandColor}" opacity="0.6"/>
              <path d="M7 18v2M17 18v2" stroke="${brandColor}" stroke-width="2"/>`;
    } else {
      // Default: creative geometric icon
      return `<circle cx="12" cy="12" r="8" fill="none" stroke="${brandColor}" stroke-width="2"/>
              <path d="M12 8v4l3 3" stroke="${brandColor}" stroke-width="2"/>`;
    }
  }

  /**
   * Create image generation prompt
   */
  createImagePrompt(spec) {
    const { colors = ['#C9A98C', '#B9906F', '#1C1C1C'] } = spec.specs || {};
    
    let prompt = `Create a ${spec.description} for a premium interior design mobile application called "Compozit Vision". `;
    prompt += `${spec.prompt} `;
    prompt += `The image should be: Professional, high-quality design, ${spec.specs?.style || 'Modern and clean'} aesthetic, `;
    prompt += `Using brand colors: ${colors.join(', ')}, Optimized for mobile app interface, `;
    prompt += `${spec.specs?.width || 300}x${spec.specs?.height || 200} dimensions, Premium, sophisticated look, Clear, crisp details`;

    return prompt;
  }

  /**
   * Get the full file path for an asset
   */
  getAssetPath(spec) {
    let categoryPath = '';
    
    if (spec.category === 'icon') {
      categoryPath = `icons/${spec.subcategory || 'misc'}`;
    } else if (spec.category === 'photography') {
      categoryPath = `images/photography/${spec.subcategory || 'misc'}`;
    } else if (spec.category === 'illustration') {
      categoryPath = `images/illustrations/${spec.subcategory || 'misc'}`;
    } else if (spec.category === 'animation') {
      categoryPath = `animations/${spec.type === 'mp4' ? 'videos' : 'lottie'}/${spec.subcategory || 'misc'}`;
    } else if (spec.category === 'brand') {
      categoryPath = `brand/${spec.subcategory || 'misc'}`;
    } else {
      categoryPath = 'misc';
    }

    return path.join(this.assetsBasePath, categoryPath, `${spec.name}.${spec.type}`);
  }

  /**
   * Get all asset specifications from the comprehensive requirements
   */
  getAssetSpecs() {
    return [
      // Priority 1: Essential Icons - Categories
      {
        name: 'interior-design-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'categories',
        description: 'Interior spaces icon for category selection',
        prompt: 'Modern, clean icon representing interior design with furniture silhouettes, warm brand colors',
        specs: { width: 32, height: 32, style: 'minimalist', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'garden-landscape-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'categories',
        description: 'Garden/landscape icon for outdoor design category',
        prompt: 'Stylized garden elements with plants and landscaping, nature-inspired design',
        specs: { width: 32, height: 32, style: 'organic', colors: ['#C9A98C', '#7FB069'] },
        priority: 1
      },
      {
        name: 'surface-materials-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'categories',
        description: 'Surfaces/materials icon for textures and finishes',
        prompt: 'Abstract representation of different textures and materials, sophisticated design',
        specs: { width: 32, height: 32, style: 'geometric', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'furniture-objects-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'categories',
        description: 'Furniture/objects icon for product category',
        prompt: 'Elegant furniture silhouettes arranged artistically, premium feel',
        specs: { width: 32, height: 32, style: 'elegant', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'exterior-architecture-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'categories',
        description: 'Exterior/architecture icon for building design',
        prompt: 'Architectural elements and building silhouette, professional and structured',
        specs: { width: 32, height: 32, style: 'architectural', colors: ['#C9A98C', '#1C1C1C'] },
        priority: 1
      },

      // Priority 1: Essential Icons - Navigation
      {
        name: 'camera-capture-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'navigation',
        description: 'Custom camera icon for photo capture action',
        prompt: 'Modern camera icon with AI elements, exciting and action-oriented design',
        specs: { width: 24, height: 24, style: 'modern', colors: ['#C9A98C'] },
        priority: 1
      },
      {
        name: 'project-plus-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'navigation',
        description: 'Custom project creation icon',
        prompt: 'Plus icon with creative design elements, inspiring possibility and creativity',
        specs: { width: 24, height: 24, style: 'creative', colors: ['#C9A98C'] },
        priority: 1
      },

      // Priority 1: Essential Icons - Room Types
      {
        name: 'living-room-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Stylized living room icon for space selection',
        prompt: 'Elegant living room silhouette with sofa and table, sophisticated and welcoming',
        specs: { width: 48, height: 48, style: 'sophisticated', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'bedroom-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Elegant bedroom icon for room type selection',
        prompt: 'Minimalist bedroom silhouette with bed and nightstand, peaceful and elegant',
        specs: { width: 48, height: 48, style: 'peaceful', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'kitchen-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Modern kitchen icon for space type',
        prompt: 'Clean kitchen silhouette with cabinets and appliances, modern and functional',
        specs: { width: 48, height: 48, style: 'modern', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'bathroom-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Spa-like bathroom icon',
        prompt: 'Elegant bathroom elements with bathtub or shower, spa-like and luxurious',
        specs: { width: 48, height: 48, style: 'luxurious', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'dining-room-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Sophisticated dining room icon',
        prompt: 'Elegant dining table and chairs silhouette, sophisticated and social',
        specs: { width: 48, height: 48, style: 'elegant', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },
      {
        name: 'home-office-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'features',
        description: 'Professional home office icon',
        prompt: 'Clean desk and chair setup, professional and productive atmosphere',
        specs: { width: 48, height: 48, style: 'professional', colors: ['#C9A98C', '#B9906F'] },
        priority: 1
      },

      // Priority 2: Photography Assets - Style Showcases
      {
        name: 'modern-style-showcase',
        type: 'webp',
        category: 'photography',
        subcategory: 'styles',
        description: 'Clean modern interior showcase',
        prompt: 'Professional photograph of a modern interior with clean lines, minimal furniture, neutral colors, excellent lighting',
        specs: { width: 300, height: 200, style: 'modern', format: 'webp' },
        priority: 2
      },
      {
        name: 'minimalist-style-showcase',
        type: 'webp',
        category: 'photography',
        subcategory: 'styles',
        description: 'Pure minimalist space showcase',
        prompt: 'Ultra-minimal interior with few elements, maximum white space, perfect lighting, zen-like atmosphere',
        specs: { width: 300, height: 200, style: 'minimalist', format: 'webp' },
        priority: 2
      },
      {
        name: 'scandinavian-style-showcase',
        type: 'webp',
        category: 'photography',
        subcategory: 'styles',
        description: 'Nordic hygge design showcase',
        prompt: 'Cozy Scandinavian interior with light wood, white walls, hygge elements, natural lighting',
        specs: { width: 300, height: 200, style: 'scandinavian', format: 'webp' },
        priority: 2
      },

      // Priority 2: Animations - AI Processing
      {
        name: 'ai-brain-processing',
        type: 'json',
        category: 'animation',
        subcategory: 'ai-processing',
        description: 'Neural network processing animation',
        prompt: 'Sophisticated animation showing AI neural network thinking, nodes connecting, data flowing',
        specs: { width: 200, height: 200, style: 'technical' },
        priority: 2
      },
      {
        name: 'room-analysis-animation',
        type: 'json',
        category: 'animation',
        subcategory: 'ai-processing',
        description: 'Room being analyzed by AI',
        prompt: 'Animation of AI scanning and understanding a room, highlighting different elements',
        specs: { width: 200, height: 200, style: 'analytical' },
        priority: 2
      },

      // Priority 3: Brand Assets
      {
        name: 'compozit-logo-primary',
        type: 'svg',
        category: 'brand',
        subcategory: 'logos',
        description: 'Primary Compozit Vision logo',
        prompt: 'Professional logo for interior design AI app, combining home and AI elements, premium typography',
        specs: { width: 200, height: 60, style: 'premium', colors: ['#C9A98C', '#1C1C1C'] },
        priority: 3
      },
      {
        name: 'home-hero-gradient',
        type: 'svg',
        category: 'brand',
        subcategory: 'patterns',
        description: 'Subtle geometric background pattern for home screen',
        prompt: 'Subtle geometric pattern with brand colors, very low opacity, welcoming and professional',
        specs: { width: 400, height: 600, style: 'geometric', colors: ['#C9A98C'] },
        priority: 3
      }
    ];
  }
}

module.exports = { AssetGenerator };