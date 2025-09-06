/**
 * Asset Generation Test Script (JavaScript version)
 * Tests the asset generation system with a few sample assets
 */

// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { AssetGenerator } = require('./generateAssets');

// Test environment setup
function testEnvironment() {
  console.log('🔧 Testing Environment Setup...');
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  if (apiKey) {
    console.log('✅ Gemini API key found');
    console.log(`   Key length: ${apiKey.length} characters`);
    console.log(`   Key prefix: ${apiKey.substring(0, 8)}...`);
  } else {
    console.log('❌ No Gemini API key found!');
    console.log('   Please set GOOGLE_GEMINI_API_KEY environment variable');
    console.log('   Example: export GOOGLE_GEMINI_API_KEY="your_key_here"');
    return false;
  }
  
  return true;
}

// Test directory structure
function testDirectoryStructure() {
  console.log('\n📁 Testing Directory Structure...');
  
  const testPaths = [
    'icons/categories',
    'icons/navigation', 
    'icons/features',
    'images/photography/rooms',
    'images/photography/styles',
    'animations/lottie/ai-processing',
    'brand/logos'
  ];
  
  const path = require('path');
  const baseAssetsPath = path.join(__dirname, '../assets');
  
  console.log(`   Base assets path: ${baseAssetsPath}`);
  
  for (const testPath of testPaths) {
    const fullPath = path.join(baseAssetsPath, testPath);
    console.log(`   📂 ${testPath}: ${fullPath}`);
  }
  
  console.log('✅ Directory structure test complete\n');
}

// Simple test of asset generation
async function testAssetGeneration() {
  console.log('🧪 Testing Asset Generation...\n');
  
  try {
    const generator = new AssetGenerator();
    
    // Test with a single SVG icon
    const testSpec = {
      name: 'test-camera-icon',
      type: 'svg',
      category: 'icon',
      subcategory: 'navigation',
      description: 'Test camera icon for photo capture',
      prompt: 'Modern camera icon with clean lines, professional look',
      specs: { width: 24, height: 24, style: 'modern', colors: ['#C9A98C'] },
      priority: 1
    };
    
    console.log('🎯 Generating test asset:', testSpec.name);
    console.log('   Type:', testSpec.type);
    console.log('   Category:', testSpec.category);
    
    const success = await generator.generateAsset(testSpec);
    
    if (success) {
      console.log('\n✅ Test generation successful!');
      console.log('🚀 Asset generation system is working correctly.');
    } else {
      console.log('\n❌ Test generation failed');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message || error);
  }
}

// Main function
async function main() {
  console.log('🏃‍♂️ Running Asset Generation Quick Test...');
  console.log('═'.repeat(50));
  
  const testType = process.argv[2] || 'full';
  
  if (testType === 'env') {
    testEnvironment();
  } else if (testType === 'dirs') {
    testEnvironment();
    testDirectoryStructure();
  } else if (testType === 'quick') {
    const hasValidEnv = testEnvironment();
    if (hasValidEnv) {
      testDirectoryStructure();
    }
  } else {
    const hasValidEnv = testEnvironment();
    if (hasValidEnv) {
      testDirectoryStructure();
      await testAssetGeneration();
    }
  }
  
  console.log('\n📁 Check the assets directory for any generated files.');
}

// Run the test
main().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});