/**
 * Asset Generation Test Script
 * Tests the asset generation system with a few sample assets
 */

const { AssetGenerator } = require('./generateAssets');

interface TestAssetSpec {
  name: string;
  type: 'svg' | 'jpg' | 'png' | 'webp' | 'mp4' | 'json';
  category: string;
  subcategory?: string;
  description: string;
  prompt: string;
  specs: {
    width?: number;
    height?: number;
    format?: string;
    style?: string;
    colors?: string[];
  };
  priority: 1 | 2 | 3;
}

class AssetGenerationTester extends AssetGenerator {
  /**
   * Test with a small set of sample assets
   */
  async runTests(): Promise<void> {
    console.log('🧪 Starting Asset Generation Tests...');
    console.log('═'.repeat(50));
    
    const testSpecs: TestAssetSpec[] = [
      // Test SVG icon generation
      {
        name: 'test-camera-icon',
        type: 'svg',
        category: 'icon',
        subcategory: 'navigation',
        description: 'Test camera icon for photo capture',
        prompt: 'Modern camera icon with clean lines, professional look',
        specs: { width: 24, height: 24, style: 'modern', colors: ['#C9A98C'] },
        priority: 1
      },
      // Test image specification generation
      {
        name: 'test-modern-room',
        type: 'webp',
        category: 'photography',
        subcategory: 'rooms',
        description: 'Test modern living room showcase',
        prompt: 'Professional photograph of a modern living room with clean lines and natural lighting',
        specs: { width: 300, height: 200, style: 'modern', format: 'webp' },
        priority: 2
      },
      // Test Lottie animation placeholder
      {
        name: 'test-loading-animation',
        type: 'json',
        category: 'animation',
        subcategory: 'transitions',
        description: 'Test loading animation',
        prompt: 'Smooth loading animation with brand colors',
        specs: { width: 100, height: 100, style: 'smooth' },
        priority: 3
      }
    ];
    
    console.log(`📊 Running ${testSpecs.length} test cases...\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const [index, spec] of testSpecs.entries()) {
      console.log(`🔬 Test ${index + 1}/${testSpecs.length}: ${spec.name}`);
      console.log(`   Type: ${spec.type} | Category: ${spec.category}`);
      
      try {
        const success = await this.generateAsset(spec);
        
        if (success) {
          console.log(`   ✅ PASSED`);
          passed++;
        } else {
          console.log(`   ❌ FAILED`);
          failed++;
        }
      } catch (error) {
        console.log(`   💥 ERROR: ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
      
      console.log(''); // Empty line for readability
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Print test summary
    console.log('🎯 TEST RESULTS:');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${passed}/${testSpecs.length}`);
    console.log(`❌ Failed: ${failed}/${testSpecs.length}`);
    console.log(`🎯 Success Rate: ${Math.round(passed/testSpecs.length*100)}%`);
    
    if (passed === testSpecs.length) {
      console.log('\n🎉 All tests passed! Asset generation system is working correctly.');
      console.log('🚀 Ready to generate the full asset library.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
    }
    
    console.log('\n📁 Check the assets directory for generated test files.');
  }
  
  /**
   * Test just the directory structure creation
   */
  async testDirectoryStructure(): Promise<void> {
    console.log('📁 Testing Directory Structure...');
    
    const testPaths = [
      'icons/categories',
      'icons/navigation',
      'icons/features',
      'images/photography/rooms',
      'images/photography/styles',
      'animations/lottie/ai-processing',
      'brand/logos'
    ];
    
    for (const testPath of testPaths) {
      const fullPath = this['getAssetPath']({ 
        name: 'test', 
        type: 'svg', 
        category: testPath.split('/')[0],
        subcategory: testPath.split('/')[1],
        description: 'Test asset',
        prompt: 'Test prompt',
        specs: {},
        priority: 1
      } as any);
      
      console.log(`  📂 ${testPath}: ${fullPath}`);
    }
    
    console.log('✅ Directory structure test complete');
  }
  
  /**
   * Test environment setup
   */
  testEnvironment(): void {
    console.log('🔧 Testing Environment Setup...');
    
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (apiKey) {
      console.log('✅ Gemini API key found');
      console.log(`   Key length: ${apiKey.length} characters`);
      console.log(`   Key prefix: ${apiKey.substring(0, 8)}...`);
    } else {
      console.log('❌ No Gemini API key found!');
      console.log('   Please set GOOGLE_GEMINI_API_KEY environment variable');
      return;
    }
    
    const assetsPath = this['assetsBasePath'];
    console.log(`📁 Assets directory: ${assetsPath}`);
    
    console.log('✅ Environment test complete');
  }
}

// Main test execution
async function main() {
  const tester = new AssetGenerationTester();
  const testType = process.argv[2] || 'full';
  
  try {
    switch (testType) {
      case 'env':
        tester.testEnvironment();
        break;
      case 'dirs':
        await tester.testDirectoryStructure();
        break;
      case 'quick':
        console.log('🏃‍♂️ Running quick tests (environment + directories)...');
        tester.testEnvironment();
        await tester.testDirectoryStructure();
        break;
      case 'full':
      default:
        console.log('🔬 Running full asset generation tests...');
        tester.testEnvironment();
        await tester.testDirectoryStructure();
        await tester.runTests();
        break;
    }
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AssetGenerationTester };