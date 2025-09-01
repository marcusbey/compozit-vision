/**
 * Test file to demonstrate proper AI image generation implementation
 * This shows how to integrate with various image generation APIs
 */

import Constants from 'expo-constants';

// Configuration for different AI services
const AI_SERVICES = {
  REPLICATE: {
    apiKey: Constants.expoConfig?.extra?.REPLICATE_API_KEY || '',
    modelVersion: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  },
  OPENAI: {
    apiKey: Constants.expoConfig?.extra?.OPENAI_API_KEY || '',
    model: 'dall-e-3',
  },
  STABILITY: {
    apiKey: Constants.expoConfig?.extra?.STABILITY_API_KEY || '',
    engineId: 'stable-diffusion-xl-1024-v1-0',
  }
};

/**
 * Test image generation with Replicate (Stable Diffusion XL)
 */
export async function testReplicateGeneration(
  prompt: string,
  imageUrl?: string
): Promise<string> {
  console.log('🎨 Testing Replicate generation with prompt:', prompt);
  
  if (!AI_SERVICES.REPLICATE.apiKey) {
    throw new Error('Replicate API key not configured');
  }

  try {
    // Start the prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${AI_SERVICES.REPLICATE.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: AI_SERVICES.REPLICATE.modelVersion,
        input: {
          prompt: prompt,
          ...(imageUrl && { image: imageUrl }), // For img2img if original image provided
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          scheduler: "DPMSolverMultistep",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    return await pollReplicateResult(prediction.id);
  } catch (error) {
    console.error('❌ Replicate generation failed:', error);
    throw error;
  }
}

/**
 * Poll Replicate for generation result
 */
async function pollReplicateResult(predictionId: string): Promise<string> {
  const maxAttempts = 60; // 60 seconds max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          'Authorization': `Token ${AI_SERVICES.REPLICATE.apiKey}`,
        },
      }
    );

    const prediction = await response.json();
    
    if (prediction.status === 'succeeded') {
      return prediction.output[0]; // Return the generated image URL
    } else if (prediction.status === 'failed') {
      throw new Error('Generation failed: ' + prediction.error);
    }

    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Generation timed out');
}

/**
 * Test image generation with OpenAI DALL-E 3
 */
export async function testOpenAIGeneration(prompt: string): Promise<string> {
  console.log('🎨 Testing OpenAI DALL-E 3 generation with prompt:', prompt);
  
  if (!AI_SERVICES.OPENAI.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICES.OPENAI.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_SERVICES.OPENAI.model,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data[0].url;
  } catch (error) {
    console.error('❌ OpenAI generation failed:', error);
    throw error;
  }
}

/**
 * Test image generation with Stability AI
 */
export async function testStabilityGeneration(
  prompt: string,
  imageUrl?: string
): Promise<string> {
  console.log('🎨 Testing Stability AI generation with prompt:', prompt);
  
  if (!AI_SERVICES.STABILITY.apiKey) {
    throw new Error('Stability API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('text_prompts[0][text]', prompt);
    formData.append('text_prompts[0][weight]', '1');
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('steps', '50');

    // If we have an init image, do img2img
    if (imageUrl) {
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      formData.append('init_image', imageBlob);
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', '0.35');
    }

    const response = await fetch(
      `https://api.stability.ai/v1/generation/${AI_SERVICES.STABILITY.engineId}/text-to-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_SERVICES.STABILITY.apiKey}`,
          'Accept': 'application/json',
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.status}`);
    }

    const result = await response.json();
    const image = result.artifacts[0];
    
    // Convert base64 to data URL
    return `data:image/png;base64,${image.base64}`;
  } catch (error) {
    console.error('❌ Stability generation failed:', error);
    throw error;
  }
}

/**
 * Test the complete generation flow
 */
export async function testCompleteGenerationFlow(
  originalImageUrl: string,
  userPrompt: string,
  service: 'replicate' | 'openai' | 'stability' = 'replicate'
): Promise<{
  success: boolean;
  generatedImageUrl?: string;
  error?: string;
  service: string;
  executionTime: number;
}> {
  const startTime = Date.now();
  
  try {
    let generatedUrl: string;
    
    switch (service) {
      case 'replicate':
        generatedUrl = await testReplicateGeneration(userPrompt, originalImageUrl);
        break;
      case 'openai':
        generatedUrl = await testOpenAIGeneration(userPrompt);
        break;
      case 'stability':
        generatedUrl = await testStabilityGeneration(userPrompt, originalImageUrl);
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
    }
    
    return {
      success: true,
      generatedImageUrl: generatedUrl,
      service,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      service,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Example usage for the specific prompt mentioned
 */
export async function testUserScenario() {
  const userPrompt = `Transform this entryway, hallway space in Scandinavian style. 
This space will be used as: living-room. Original space characteristics: 
A bright and serene entryway featuring a modern staircase with light wood steps 
and a sleek black metal railing. A muted olive-green wall provides a calming backdrop 
to a built-in bench with storage and coat rack, enhancing the space's functionality. 
The paper lantern lights add a touch of warmth and soft illumination. 
The overall design is minimalistic and functional, emphasizing clean lines and natural materials. 
Balance preservation of original elements with fresh design updates. 
Focus on solutions within a 0-6203.13698425889 budget range. 
Create a cohesive, well-designed space that reflects the user's personal style preferences 
while maintaining functionality and visual harmony`;

  // Test with different services
  console.log('🧪 Starting image generation tests...\n');
  
  const services = ['replicate', 'openai', 'stability'] as const;
  
  for (const service of services) {
    console.log(`\n📸 Testing ${service.toUpperCase()}...`);
    const result = await testCompleteGenerationFlow(
      'https://example.com/original-image.jpg', // Replace with actual image URL
      userPrompt,
      service
    );
    
    console.log(`Result:`, result);
  }
}

/**
 * Verify API keys are configured
 */
export function checkAPIConfiguration() {
  const configs = {
    'Replicate': AI_SERVICES.REPLICATE.apiKey,
    'OpenAI': AI_SERVICES.OPENAI.apiKey,
    'Stability AI': AI_SERVICES.STABILITY.apiKey,
  };
  
  console.log('🔑 API Configuration Status:');
  Object.entries(configs).forEach(([service, key]) => {
    console.log(`${service}: ${key ? '✅ Configured' : '❌ Missing'}`);
  });
  
  return configs;
}