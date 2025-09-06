/**
 * Test AI-powered SVG generation
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { AssetGenerator } = require('./generateAssets');

async function testAISVG() {
  console.log('🧪 Testing AI-powered SVG generation...');
  
  try {
    const generator = new AssetGenerator();
    
    // Test with one icon
    const testSpec = {
      name: 'ai-test-kitchen-icon',
      type: 'svg',
      category: 'icon',
      subcategory: 'features',
      description: 'Modern kitchen icon for space type',
      prompt: 'Clean kitchen silhouette with cabinets and appliances, modern and functional',
      specs: { width: 48, height: 48, style: 'modern', colors: ['#C9A98C', '#B9906F'] },
      priority: 1
    };
    
    console.log(`🎯 Testing AI generation for: ${testSpec.name}`);
    const success = await generator.generateAsset(testSpec);
    
    if (success) {
      console.log('✅ AI SVG generation test successful!');
    } else {
      console.log('❌ AI SVG generation test failed');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAISVG();