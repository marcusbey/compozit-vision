/**
 * Asset Generation Orchestrator
 * Coordinates multiple sub-agents to generate all assets efficiently
 */

const { AssetGenerator } = require('./generateAssets');
const { IconAssetGenerator } = require('./generateIconAssets');
const { PhotographyAssetGenerator } = require('./generatePhotographyAssets');
const { AnimationAssetGenerator } = require('./generateAnimationAssets');

class AssetGenerationOrchestrator {
  private mainGenerator: AssetGenerator;
  private iconGenerator: IconAssetGenerator;
  private photographyGenerator: PhotographyAssetGenerator;
  private animationGenerator: AnimationAssetGenerator;

  constructor() {
    this.mainGenerator = new AssetGenerator();
    this.iconGenerator = new IconAssetGenerator();
    this.photographyGenerator = new PhotographyAssetGenerator();
    this.animationGenerator = new AnimationAssetGenerator();
  }

  /**
   * Run all asset generation in parallel using sub-agents
   */
  async runParallelGeneration(): Promise<void> {
    console.log('🚀 Starting Parallel Asset Generation with Sub-Agents...');
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    // Run different asset types in parallel to maximize efficiency
    const promises = [
      this.runWithErrorHandling('Icons', () => this.iconGenerator.generateIconsOnly()),
      this.runWithErrorHandling('Photography', () => this.photographyGenerator.generatePhotographyOnly()),
      this.runWithErrorHandling('Animations', () => this.animationGenerator.generateAnimationsOnly()),
    ];
    
    const results = await Promise.allSettled(promises);
    
    const totalTime = Date.now() - startTime;
    this.printOrchestrationSummary(results, totalTime);
  }

  /**
   * Run sequential generation (safer for rate limiting)
   */
  async runSequentialGeneration(): Promise<void> {
    console.log('📋 Starting Sequential Asset Generation...');
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      console.log('\n🎯 Phase 1: Generating Icons...');
      await this.iconGenerator.generateIconsOnly();
      
      console.log('\n📸 Phase 2: Generating Photography...');
      await this.photographyGenerator.generatePhotographyOnly();
      
      console.log('\n🎬 Phase 3: Generating Animations...');
      await this.animationGenerator.generateAnimationsOnly();
      
      const totalTime = Date.now() - startTime;
      console.log(`\n🎉 Sequential Generation Complete! Total time: ${Math.round(totalTime/1000)}s`);
      
    } catch (error) {
      console.error('💥 Sequential generation failed:', error);
      throw error;
    }
  }

  /**
   * Run complete asset generation using main generator
   */
  async runCompleteGeneration(): Promise<void> {
    console.log('🌟 Starting Complete Asset Generation...');
    console.log('═'.repeat(60));
    
    await this.mainGenerator.generateAllAssets();
  }

  /**
   * Generate only priority 1 (essential) assets
   */
  async runPriority1Only(): Promise<void> {
    console.log('🎯 Starting Priority 1 (Essential) Assets Only...');
    console.log('═'.repeat(60));
    
    const priority1Specs = this.mainGenerator['getAssetSpecs']().filter(spec => spec.priority === 1);
    
    console.log(`📊 Priority 1 assets to generate: ${priority1Specs.length}`);
    
    let completed = 0;
    for (const spec of priority1Specs) {
      console.log(`\n🎯 Generating P1 asset: ${spec.name} (${completed + 1}/${priority1Specs.length})`);
      
      const success = await this.mainGenerator.generateAsset(spec);
      if (success) {
        completed++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Priority 1 generation complete! ${completed}/${priority1Specs.length} assets generated`);
  }

  /**
   * Wrapper for error handling of async operations
   */
  private async runWithErrorHandling(taskName: string, task: () => Promise<void>): Promise<string> {
    try {
      await task();
      return `✅ ${taskName}: Success`;
    } catch (error) {
      console.error(`❌ ${taskName} failed:`, error);
      return `❌ ${taskName}: Failed - ${error.message}`;
    }
  }

  /**
   * Print summary of orchestration results
   */
  private printOrchestrationSummary(results: PromiseSettledResult<string>[], totalTime: number): void {
    console.log('\n🎉 ORCHESTRATION COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`⏱️  Total time: ${Math.round(totalTime/1000)} seconds`);
    console.log('\n📊 Sub-agent Results:');
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        console.log(`  ${result.value}`);
      } else {
        console.log(`  ❌ Task failed: ${result.reason}`);
      }
    });
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const totalTasks = results.length;
    
    console.log(`\n🎯 Success Rate: ${successCount}/${totalTasks} (${Math.round(successCount/totalTasks*100)}%)`);
    
    if (successCount === totalTasks) {
      console.log('\n🚀 All asset generation sub-agents completed successfully!');
    } else {
      console.log('\n⚠️  Some tasks failed. Check the logs above for details.');
    }
    
    console.log('\n📁 Check the assets directory for generated files');
    console.log('📋 Review .spec.json files for detailed asset specifications');
  }
}

// CLI interface
async function main() {
  const orchestrator = new AssetGenerationOrchestrator();
  const mode = process.argv[2] || 'sequential';
  
  try {
    switch (mode) {
      case 'parallel':
        console.log('🚀 Running in PARALLEL mode (faster but may hit rate limits)');
        await orchestrator.runParallelGeneration();
        break;
      case 'sequential':
        console.log('📋 Running in SEQUENTIAL mode (safer for rate limits)');
        await orchestrator.runSequentialGeneration();
        break;
      case 'complete':
        console.log('🌟 Running COMPLETE generation (single agent)');
        await orchestrator.runCompleteGeneration();
        break;
      case 'priority1':
        console.log('🎯 Running PRIORITY 1 only (essential assets)');
        await orchestrator.runPriority1Only();
        break;
      default:
        console.log('Usage: npm run generate-assets [parallel|sequential|complete|priority1]');
        console.log('Default: sequential');
        await orchestrator.runSequentialGeneration();
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