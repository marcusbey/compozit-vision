/**
 * Icon Asset Generation Sub-Agent
 * Specialized for generating SVG icons using the asset specification
 */

const { AssetGenerator } = require('./generateAssets');

class IconAssetGenerator extends AssetGenerator {
  /**
   * Generate all icon assets
   */
  async generateIconsOnly(): Promise<void> {
    console.log('🎯 Starting Icon Asset Generation...');
    
    const iconSpecs = this.getAssetSpecs().filter(spec => 
      spec.category === 'icon' || spec.type === 'svg'
    );
    
    console.log(`📊 Icon assets to generate: ${iconSpecs.length}`);
    
    let completed = 0;
    for (const spec of iconSpecs) {
      console.log(`\n🎨 Generating icon: ${spec.name} (${completed + 1}/${iconSpecs.length})`);
      
      const success = await this.generateAsset(spec);
      if (success) {
        completed++;
      }
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Icon generation complete! ${completed}/${iconSpecs.length} icons generated`);
  }
}

// Run icon generation if called directly
if (require.main === module) {
  async function main() {
    try {
      const generator = new IconAssetGenerator();
      await generator.generateIconsOnly();
    } catch (error) {
      console.error('💥 Icon generation failed:', error);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = { IconAssetGenerator };