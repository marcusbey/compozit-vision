/**
 * Regenerate selected icons with AI to test quality
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { AssetGenerator } = require('./generateAssets');

async function regenerateSelectedIcons() {
  console.log('🔄 Regenerating selected icons with AI...');
  
  try {
    const generator = new AssetGenerator();
    
    // Regenerate a few key icons to test AI quality
    const iconsToRegenerate = [
      'interior-design-icon',
      'living-room-icon', 
      'camera-capture-icon'
    ];
    
    const allSpecs = generator.getAssetSpecs();
    
    for (const iconName of iconsToRegenerate) {
      const spec = allSpecs.find(s => s.name === iconName);
      if (spec) {
        console.log(`\n🎯 Regenerating: ${spec.name}`);
        console.log(`   📋 ${spec.description}`);
        
        const success = await generator.generateAsset(spec);
        if (success) {
          console.log(`   ✅ Successfully regenerated with AI`);
        } else {
          console.log(`   ❌ Failed to regenerate`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Icon regeneration complete!');
    console.log('Check the icons to see the AI-generated improvements');
    
  } catch (error) {
    console.error('💥 Regeneration failed:', error.message);
  }
}

regenerateSelectedIcons();