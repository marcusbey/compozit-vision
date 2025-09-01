#!/usr/bin/env ts-node

/**
 * Test Gemini 2.5 Flash Image Generation
 * Quick test script to verify the new Gemini image generation works
 */

import { geminiImageGenerationService } from '../services/geminiImageGenerationService';
import * as FileSystem from 'expo-file-system';

async function testGeminiImageGeneration() {
  console.log('🧪 Testing Gemini 2.5 Flash Image Generation...\n');
  
  try {
    // Check if Gemini API key is available
    const hasGeminiKey = !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    console.log(`Gemini API Key: ${hasGeminiKey ? '✅ Found' : '❌ Missing'}`);
    
    if (!hasGeminiKey) {
      console.log('\n⚠️ Gemini API key not found!');
      console.log('Add to your .env file:');
      console.log('EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here');
      return;
    }
    
    console.log('\n🎨 Generating test interior designs...\n');
    
    // Test different interior design scenarios
    const testCases = [
      {
        name: 'modern-living-room',
        prompt: 'A modern Scandinavian living room with white walls, light wood furniture, cozy gray sofa, coffee table, plants, and large windows with natural light',
        style: 'Scandinavian Modern',
        qualityLevel: 'standard' as const
      },
      {
        name: 'cozy-bedroom',
        prompt: 'A warm bohemian bedroom with earth tones, textured fabrics, macrame wall hanging, wooden bed frame, layered rugs, and ambient lighting',
        style: 'Bohemian',
        qualityLevel: 'standard' as const
      },
      {
        name: 'modern-kitchen',
        prompt: 'A contemporary kitchen with white cabinets, marble countertops, stainless steel appliances, pendant lights, and a kitchen island',
        style: 'Contemporary',
        qualityLevel: 'premium' as const
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        console.log(`🖼️ Generating: ${testCase.name}...`);
        
        const startTime = Date.now();
        const result = await geminiImageGenerationService.generateInteriorDesign({
          prompt: testCase.prompt,
          style: testCase.style,
          qualityLevel: testCase.qualityLevel,
          aspectRatio: '16:9'
        });
        
        const totalTime = Date.now() - startTime;
        
        if (result.success) {
          console.log(`✅ ${testCase.name} generated in ${totalTime}ms`);
          console.log(`   Model: ${result.model}`);
          console.log(`   Watermarked: ${result.watermarked}`);
          console.log(`   Image URL: ${result.imageUrl.substring(0, 50)}...`);
          
          // Try to save if it's a data URL
          if (result.base64Data) {
            await saveTestImage(result.base64Data, `${testCase.name}-gemini.jpg`);
          }
          
          results.push({
            testCase: testCase.name,
            success: true,
            generationTime: totalTime,
            model: result.model,
            promptLength: result.metadata.promptLength,
            hasOriginalImage: result.metadata.hasOriginalImage
          });
          
        } else {
          console.log(`❌ ${testCase.name} failed`);
          results.push({
            testCase: testCase.name,
            success: false,
            error: 'Generation failed'
          });
        }
        
        // Delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ ${testCase.name} error:`, errorMessage);
        results.push({
          testCase: testCase.name,
          success: false,
          error: errorMessage
        });
      }
    }
    
    // Print summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = result.generationTime ? ` (${result.generationTime}ms)` : '';
      console.log(`${status} ${result.testCase}${time}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Save detailed results
    await saveTestResults(results);
    
    if (successful === total) {
      console.log('\n🎉 All tests passed! Gemini 2.5 image generation is working.');
      console.log('🖼️ Check the generated test images in: mobile/gemini-test-images/');
    } else {
      console.log(`\n⚠️ ${total - successful} test(s) failed. Check the error messages above.`);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error instanceof Error ? error.message : error);
  }
}

async function saveTestImage(base64Data: string, filename: string): Promise<void> {
  try {
    const testImagesDir = `${FileSystem.documentDirectory}gemini-test-images/`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(testImagesDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(testImagesDir, { intermediates: true });
    }
    
    // Save the image
    const filePath = `${testImagesDir}${filename}`;
    await FileSystem.writeAsStringAsync(filePath, base64Data, { encoding: FileSystem.EncodingType.Base64 });
    
    console.log(`💾 Saved: ${filename}`);
    
  } catch (error) {
    console.warn(`Failed to save image ${filename}:`, error instanceof Error ? error.message : error);
  }
}

async function saveTestResults(results: any[]): Promise<void> {
  try {
    const resultsDir = `${FileSystem.documentDirectory}gemini-test-results/`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(resultsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(resultsDir, { intermediates: true });
    }
    
    // Save results JSON
    const resultsPath = `${resultsDir}gemini-generation-test-results.json`;
    await FileSystem.writeAsStringAsync(resultsPath, JSON.stringify({
      testDate: new Date().toISOString(),
      model: 'gemini-2.5-flash-image-preview',
      totalTests: results.length,
      successfulTests: results.filter(r => r.success).length,
      results
    }, null, 2));
    
    console.log(`📄 Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.warn('Failed to save test results:', error instanceof Error ? error.message : error);
  }
}

// Run the test
if (require.main === module) {
  testGeminiImageGeneration().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { testGeminiImageGeneration };