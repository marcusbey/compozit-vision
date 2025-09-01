#!/usr/bin/env ts-node

/**
 * AI Testing Script
 * Run this script to test AI functionality and generate test images
 */

import { testRunner } from '../services/testRunner';
import { imageGenerationService } from '../services/imageGenerationService';
import { aiTestingService } from '../services/aiTestingService';

async function main() {
  console.log('🚀 Starting AI Functionality Tests...\n');
  
  try {
    // Check if environment variables are set
    console.log('🔍 Checking environment configuration...');
    const hasOpenAI = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const hasStability = !!process.env.EXPO_PUBLIC_STABILITY_API_KEY;
    const hasReplicate = !!process.env.EXPO_PUBLIC_REPLICATE_API_KEY;
    const hasGemini = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    console.log(`OpenAI (DALL-E): ${hasOpenAI ? '✅' : '❌'}`);
    console.log(`Stability AI: ${hasStability ? '✅' : '❌'}`);
    console.log(`Replicate: ${hasReplicate ? '✅' : '❌'}`);
    console.log(`Gemini Vision: ${hasGemini ? '✅' : '❌'}`);
    
    if (!hasOpenAI && !hasStability && !hasReplicate) {
      console.warn('⚠️ No image generation API keys found!');
      console.log('Add at least one of these to your .env file:');
      console.log('EXPO_PUBLIC_OPENAI_API_KEY=your_key_here');
      console.log('EXPO_PUBLIC_STABILITY_API_KEY=your_key_here');
      console.log('EXPO_PUBLIC_REPLICATE_API_KEY=your_key_here');
      console.log('\nRunning limited tests...\n');
    }
    
    // Option 1: Quick test (single image generation)
    if (process.argv.includes('--quick')) {
      console.log('⚡ Running quick test...');
      await testRunner.quickTest();
      return;
    }
    
    // Option 2: Provider test (test all available providers)
    if (process.argv.includes('--providers')) {
      console.log('🔧 Testing all providers...');
      await imageGenerationService.testAllProviders();
      return;
    }
    
    // Option 3: Full test suite (default)
    console.log('🎯 Running comprehensive test suite...');
    await testRunner.runAllTests();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Check the following locations for results:');
    console.log('📁 Test Results: mobile/ai-test-results/');
    console.log('🖼️ Test Images: mobile/ai-test-images/');
    console.log('📈 Final Report: mobile/ai-test-results/FINAL-AI-TEST-REPORT.md');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
function printUsage() {
  console.log(`
🧪 AI Testing Script Usage:

npm run test:ai              # Run full test suite
npm run test:ai -- --quick   # Quick test (single generation)
npm run test:ai -- --providers # Test all available providers

Environment Variables Required:
- EXPO_PUBLIC_OPENAI_API_KEY     (for DALL-E 3)
- EXPO_PUBLIC_STABILITY_API_KEY  (for Stable Diffusion)
- EXPO_PUBLIC_REPLICATE_API_KEY  (for Replicate models)
- EXPO_PUBLIC_GEMINI_API_KEY     (for Vision analysis)
`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { main as runAITests };