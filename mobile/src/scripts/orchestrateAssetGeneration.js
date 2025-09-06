/**
 * Asset Generation Orchestrator (JavaScript version)
 * Coordinates asset generation efficiently and handles Priority 1 assets
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { AssetGenerator } = require('./generateAssets');

class AssetGenerationOrchestrator {
  constructor() {
    this.mainGenerator = new AssetGenerator();
  }

  /**
   * Generate only priority 1 (essential) assets
   */
  async runPriority1Only() {
    console.log('🎯 Starting Priority 1 (Essential) Assets Only...');
    console.log('═'.repeat(60));
    
    const allSpecs = this.mainGenerator.getAssetSpecs();
    const priority1Specs = allSpecs.filter(spec => spec.priority === 1);
    
    console.log(`📊 Total assets available: ${allSpecs.length}`);
    console.log(`🎯 Priority 1 assets to generate: ${priority1Specs.length}`);
    
    if (priority1Specs.length === 0) {
      console.log('⚠️  No Priority 1 assets found!');
      return;
    }

    console.log('\n🎯 Priority 1 Assets:');
    priority1Specs.forEach((spec, index) => {
      console.log(`  ${index + 1}. ${spec.name} (${spec.type}) - ${spec.category}/${spec.subcategory || 'misc'}`);
    });
    
    let completed = 0;
    let failed = 0;

    console.log('\n🚀 Starting generation...\n');

    for (const spec of priority1Specs) {
      const progress = `(${completed + failed + 1}/${priority1Specs.length})`;
      console.log(`🎯 Generating P1 asset: ${spec.name} ${progress}`);
      console.log(`   📋 ${spec.description}`);
      
      try {
        const success = await this.mainGenerator.generateAsset(spec);
        if (success) {
          completed++;
          console.log(`   ✅ Success!`);
        } else {
          failed++;
          console.log(`   ❌ Failed`);
        }
      } catch (error) {
        failed++;
        console.error(`   💥 Error: ${error.message}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 PRIORITY 1 GENERATION COMPLETE!');
    console.log(`✅ Successfully generated: ${completed} assets`);
    console.log(`❌ Failed to generate: ${failed} assets`);
    console.log(`📊 Success rate: ${Math.round(completed / priority1Specs.length * 100)}%`);
    
    if (completed > 0) {
      console.log('\n📁 Generated assets saved to:');
      console.log('   - src/assets/icons/ (SVG icons)');
      console.log('   - Specification files (.spec.json) for complex assets');
    }
    
    if (failed > 0) {
      console.log('\n⚠️  Some assets failed to generate. Check the logs above for details.');
      console.log('   You can re-run this script to retry failed assets.');
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Review generated SVG icons in src/assets/icons/');
    console.log('2. Check .spec.json files for asset specifications');  
    console.log('3. Run Priority 2 assets when ready');
    console.log('4. Integrate generated assets into the app');
  }

  /**
   * Generate assets by priority level
   */
  async runByPriority(targetPriority = 1) {
    console.log(`🎯 Starting Priority ${targetPriority} Assets Generation...`);
    console.log('═'.repeat(60));
    
    const allSpecs = this.mainGenerator.getAssetSpecs();
    const prioritySpecs = allSpecs.filter(spec => spec.priority === targetPriority);
    
    console.log(`📊 Priority ${targetPriority} assets to generate: ${prioritySpecs.length}`);
    
    if (prioritySpecs.length === 0) {
      console.log(`⚠️  No Priority ${targetPriority} assets found!`);
      return;
    }
    
    let completed = 0;
    let failed = 0;

    for (const spec of prioritySpecs) {
      const progress = `(${completed + failed + 1}/${prioritySpecs.length})`;
      console.log(`\n🎯 Generating P${targetPriority}: ${spec.name} ${progress}`);
      
      try {
        const success = await this.mainGenerator.generateAsset(spec);
        if (success) {
          completed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        console.error(`💥 Error generating ${spec.name}:`, error.message);
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    console.log(`\n✅ Priority ${targetPriority} complete! ${completed}/${prioritySpecs.length} assets generated`);
    return { completed, failed, total: prioritySpecs.length };
  }

  /**
   * Run complete sequential generation
   */
  async runSequentialGeneration() {
    console.log('📋 Starting Sequential Asset Generation by Priority...');
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      console.log('\n🎯 Phase 1: Priority 1 (Essential) Assets...');
      const p1Results = await this.runByPriority(1);
      
      console.log('\n📊 Phase 2: Priority 2 (Important) Assets...');
      const p2Results = await this.runByPriority(2);
      
      console.log('\n🎨 Phase 3: Priority 3 (Nice-to-have) Assets...');
      const p3Results = await this.runByPriority(3);
      
      const totalTime = Date.now() - startTime;
      const totalCompleted = (p1Results?.completed || 0) + (p2Results?.completed || 0) + (p3Results?.completed || 0);
      const totalFailed = (p1Results?.failed || 0) + (p2Results?.failed || 0) + (p3Results?.failed || 0);
      
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 SEQUENTIAL GENERATION COMPLETE!');
      console.log(`⏱️  Total time: ${Math.round(totalTime/1000)} seconds`);
      console.log(`✅ Total completed: ${totalCompleted} assets`);
      console.log(`❌ Total failed: ${totalFailed} assets`);
      
    } catch (error) {
      console.error('💥 Sequential generation failed:', error);
      throw error;
    }
  }

  /**
   * Run complete asset generation
   */
  async runCompleteGeneration() {
    console.log('🌟 Starting Complete Asset Generation...');
    console.log('═'.repeat(60));
    
    await this.mainGenerator.generateAllAssets();
  }
}

// CLI interface
async function main() {
  const orchestrator = new AssetGenerationOrchestrator();
  const mode = process.argv[2] || 'priority1';
  
  try {
    switch (mode) {
      case 'priority1':
        console.log('🎯 Running PRIORITY 1 only (essential assets)');
        await orchestrator.runPriority1Only();
        break;
      case 'priority2':
        console.log('📊 Running PRIORITY 2 (important assets)');
        await orchestrator.runByPriority(2);
        break;
      case 'priority3':
        console.log('🎨 Running PRIORITY 3 (nice-to-have assets)');
        await orchestrator.runByPriority(3);
        break;
      case 'sequential':
        console.log('📋 Running in SEQUENTIAL mode (all priorities)');
        await orchestrator.runSequentialGeneration();
        break;
      case 'complete':
        console.log('🌟 Running COMPLETE generation (single agent)');
        await orchestrator.runCompleteGeneration();
        break;
      default:
        console.log('Usage: node orchestrateAssetGeneration.js [priority1|priority2|priority3|sequential|complete]');
        console.log('Default: priority1');
        await orchestrator.runPriority1Only();
    }
  } catch (error) {
    console.error('💥 Asset generation orchestration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AssetGenerationOrchestrator };