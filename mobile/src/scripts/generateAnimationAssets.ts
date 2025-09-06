/**
 * Animation Asset Generation Sub-Agent
 * Specialized for generating Lottie animations and video placeholders
 */

const { AssetGenerator } = require('./generateAssets');

class AnimationAssetGenerator extends AssetGenerator {
  /**
   * Generate all animation assets
   */
  async generateAnimationsOnly(): Promise<void> {
    console.log('🎬 Starting Animation Asset Generation...');
    
    const animationSpecs = this.getAssetSpecs().filter(spec => 
      spec.category === 'animation' || ['json', 'mp4'].includes(spec.type)
    );
    
    console.log(`📊 Animation assets to generate: ${animationSpecs.length}`);
    
    let completed = 0;
    for (const spec of animationSpecs) {
      console.log(`\n🎬 Generating animation: ${spec.name} (${completed + 1}/${animationSpecs.length})`);
      
      const success = await this.generateAsset(spec);
      if (success) {
        completed++;
      }
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Animation generation complete! ${completed}/${animationSpecs.length} animations generated`);
  }
}

// Run animation generation if called directly
if (require.main === module) {
  async function main() {
    try {
      const generator = new AnimationAssetGenerator();
      await generator.generateAnimationsOnly();
    } catch (error) {
      console.error('💥 Animation generation failed:', error);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = { AnimationAssetGenerator };