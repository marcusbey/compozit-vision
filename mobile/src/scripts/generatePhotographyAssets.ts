/**
 * Photography Asset Generation Sub-Agent
 * Specialized for generating photographic assets using Gemini 2.5 Flash Image Preview
 */

const { AssetGenerator } = require('./generateAssets');

class PhotographyAssetGenerator extends AssetGenerator {
  /**
   * Generate all photography assets
   */
  async generatePhotographyOnly(): Promise<void> {
    console.log('📸 Starting Photography Asset Generation...');
    
    const photoSpecs = this.getAssetSpecs().filter(spec => 
      spec.category === 'photography' || ['jpg', 'webp', 'png'].includes(spec.type)
    );
    
    console.log(`📊 Photography assets to generate: ${photoSpecs.length}`);
    
    let completed = 0;
    for (const spec of photoSpecs) {
      console.log(`\n📸 Generating photo: ${spec.name} (${completed + 1}/${photoSpecs.length})`);
      
      const success = await this.generateAsset(spec);
      if (success) {
        completed++;
      }
      
      // Longer delay for image generation to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n✅ Photography generation complete! ${completed}/${photoSpecs.length} photos generated`);
  }
}

// Run photography generation if called directly
if (require.main === module) {
  async function main() {
    try {
      const generator = new PhotographyAssetGenerator();
      await generator.generatePhotographyOnly();
    } catch (error) {
      console.error('💥 Photography generation failed:', error);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = { PhotographyAssetGenerator };