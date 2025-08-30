/**
 * Gemini API Integration Test
 * Simple test to verify API key and basic functionality
 */

import { getGeminiService, analyzeRoomWithGemini } from './geminiService';

// Test image data (1x1 pixel JPEG)
const TEST_IMAGE_DATA = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHw8f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckriSNyDf7BLUiTJe7ZlY9qWk0K0Y3VXLGnj/9k=';

export async function testGeminiIntegration(): Promise<void> {
  try {
    console.log('🧪 Testing Gemini API Integration...');

    // Test 1: Service Initialization
    console.log('🔧 Testing service initialization...');
    const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
    
    if (!apiKey) {
      throw new Error('❌ GEMINI_API_KEY not found in environment variables');
    }

    const service = getGeminiService(apiKey);
    console.log('✅ Service initialized successfully');

    // Test 2: Basic Room Analysis
    console.log('🏠 Testing room analysis...');
    
    const analysisInput = {
      imageData: TEST_IMAGE_DATA,
      roomDimensions: {
        width: 4,
        height: 3,
        length: 5,
        roomType: 'living-room',
        lightingSources: ['window', 'ceiling-light']
      },
      stylePreferences: {
        primaryStyle: 'modern',
        colors: ['white', 'gray'],
        budget: '5000-10000',
        preferredMaterials: ['wood', 'metal']
      },
      customPrompt: 'Focus on creating a cozy, functional living space'
    };

    console.log('📤 Sending request to Gemini API...');
    const startTime = Date.now();
    
    const result = await analyzeRoomWithGemini(analysisInput.imageData, analysisInput);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Test 3: Response Validation
    console.log('🔍 Validating response...');
    
    if (!result.success) {
      throw new Error(`❌ API request failed: ${result.error}`);
    }

    if (!result.data) {
      throw new Error('❌ No data in successful response');
    }

    const data = result.data;
    
    // Validate required fields
    const requiredFields = ['roomLayout', 'furniture', 'colorScheme', 'lighting'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`❌ Missing required field: ${field}`);
      }
    }

    // Test 4: Usage Statistics
    console.log('📊 Testing usage statistics...');
    const stats = service.getUsageStats();
    
    if (stats.requestCount === 0) {
      console.log('⚠️  Request count not tracked properly');
    } else {
      console.log(`✅ Request count: ${stats.requestCount}`);
    }

    // Test Results Summary
    console.log('\n🎉 Gemini API Integration Test Results:');
    console.log('=====================================');
    console.log(`✅ API Key: Valid`);
    console.log(`✅ Service Initialization: Success`);
    console.log(`✅ Room Analysis: Success`);
    console.log(`✅ Processing Time: ${processingTime}ms`);
    console.log(`✅ Confidence Score: ${data.confidenceScore || 'N/A'}`);
    console.log(`✅ Furniture Recommendations: ${data.furniture?.length || 0}`);
    console.log(`✅ Room Layout Suggestions: ${data.roomLayout?.suggestions?.length || 0}`);
    console.log(`✅ Color Scheme: ${data.colorScheme?.primary || 'N/A'}`);
    
    if (data.overallDesignConcept) {
      console.log(`✅ Design Concept: ${data.overallDesignConcept.substring(0, 100)}...`);
    }

    console.log('\n🚀 Integration test completed successfully!');
    
    return Promise.resolve();

  } catch (error) {
    console.error('\n❌ Gemini API Integration Test Failed:');
    console.error('========================================');
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    
    if (error instanceof Error && error.message.includes('API key')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('- Verify GEMINI_API_KEY in .env file');
      console.error('- Check API key permissions in Google Cloud Console');
      console.error('- Ensure Gemini API is enabled for your project');
    }
    
    if (error instanceof Error && error.message.includes('quota')) {
      console.error('\n💡 Rate Limiting Tips:');
      console.error('- Wait a few minutes before retrying');
      console.error('- Check API quota in Google Cloud Console');
      console.error('- Consider upgrading your API plan');
    }
    
    throw error;
  }
}

// Export for use in other files
export default testGeminiIntegration;

// Run test if called directly
if (require.main === module) {
  testGeminiIntegration()
    .then(() => {
      console.log('🎯 Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('🔥 Test failed:', error);
      process.exit(1);
    });
}