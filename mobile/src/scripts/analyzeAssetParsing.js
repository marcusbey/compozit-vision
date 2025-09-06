#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AssetParsingAnalyzer {
  constructor() {
    this.allAssets = [];
    this.iconAssets = [];
    this.missedAssets = [];
  }

  // Original parsing function from generateKawaii3DIcons.js
  parseAssetsFromMarkdown(content) {
    const assets = [];
    const lines = content.split('\n');
    
    // Patterns to match different asset definitions
    const patterns = [
      /^[-•]\s*\*\*`([^`]+)`\*\*\s*[-–]\s*(.+)$/,
      /^[-•]\s*\*\*([^*]+)\*\*:\s*(.+)$/,
      /^[-•]\s*`([^`]+)`\s*[-–:]\s*(.+)$/
    ];
    
    let currentCategory = '';
    let currentScreen = '';
    
    for (const line of lines) {
      // Track current screen/section
      if (line.startsWith('## ')) {
        currentScreen = line.replace('##', '').trim();
        continue;
      }
      
      // Track current category
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        currentCategory = line.replace(/#{3,4}/, '').trim();
        continue;
      }
      
      // Match asset definitions
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const filename = match[1].trim();
          const description = match[2].trim();
          
          // Filter for icon files (ORIGINAL RESTRICTIVE FILTER)
          if (filename.includes('icon') && 
              (filename.endsWith('.svg') || filename.endsWith('.png'))) {
            
            assets.push({
              filename: filename.replace('.svg', '.png'),
              description: description.split('-')[0].trim(),
              screen: currentScreen,
              category: currentCategory,
              matchedBy: 'original'
            });
          }
        }
      }
    }
    
    return assets;
  }

  // Enhanced parsing to find ALL visual assets
  parseAllVisualAssets(content) {
    const assets = [];
    const lines = content.split('\n');
    
    // Enhanced patterns to match different asset definitions
    const patterns = [
      // Original patterns
      /^[-•]\s*\*\*`([^`]+)`\*\*\s*[-–]\s*(.+)$/,
      /^[-•]\s*\*\*([^*]+)\*\*:\s*(.+)$/,
      /^[-•]\s*`([^`]+)`\s*[-–:]\s*(.+)$/,
      // Additional patterns
      /^[-•]\s*`([^`]+)`\s*[-–]\s*(.+)$/,
      /^[-•]\s*`([^`]+)`:\s*(.+)$/,
      /^[-•]\s*\*\*`([^`]+)`\*\*:\s*(.+)$/,
    ];
    
    let currentCategory = '';
    let currentScreen = '';
    
    for (const line of lines) {
      // Track current screen/section
      if (line.startsWith('## ')) {
        currentScreen = line.replace('##', '').trim();
        continue;
      }
      
      // Track current category
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        currentCategory = line.replace(/#{3,4}/, '').trim();
        continue;
      }
      
      // Match asset definitions
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          const filename = match[1].trim();
          const description = match[2].trim();
          
          // Look for ALL visual assets (.svg, .png, .jpg, .json, .mp4)
          if (filename.match(/\.(svg|png|jpg|jpeg|json|mp4)$/i)) {
            
            // Categorize asset type
            let assetType = 'other';
            let isGeneratable = false;
            
            if (filename.endsWith('.svg')) {
              assetType = 'vector';
              isGeneratable = true; // SVGs can be generated as images
            } else if (filename.endsWith('.png')) {
              assetType = 'raster';
              isGeneratable = true;
            } else if (filename.match(/\.(jpg|jpeg)$/)) {
              assetType = 'photo';
              isGeneratable = true; // Photos can be generated with AI
            } else if (filename.endsWith('.json')) {
              assetType = 'animation';
              isGeneratable = false; // Lottie animations need special handling
            } else if (filename.endsWith('.mp4')) {
              assetType = 'video';
              isGeneratable = false; // Videos need special handling
            }
            
            // Determine if it's icon-like
            const isIconLike = filename.includes('icon') || 
                              filename.includes('badge') ||
                              filename.includes('logo') ||
                              assetType === 'vector' ||
                              description.toLowerCase().includes('icon') ||
                              description.toLowerCase().includes('graphic') ||
                              description.toLowerCase().includes('badge');
            
            assets.push({
              filename,
              description: description.split('-')[0].trim(),
              fullDescription: description,
              screen: currentScreen,
              category: currentCategory,
              assetType,
              isGeneratable,
              isIconLike,
              currentlyParsed: filename.includes('icon') && (filename.endsWith('.svg') || filename.endsWith('.png'))
            });
          }
        }
      }
    }
    
    return assets;
  }

  async analyze() {
    console.log('\n📊 Comprehensive Asset Parsing Analysis');
    console.log('=====================================\n');

    // Read the requirements document
    const requirementsPath = path.join(
      __dirname, 
      '../../@DOCS/development/COMPREHENSIVE-ASSET-REQUIREMENTS.md'
    );
    
    const requirementsContent = fs.readFileSync(requirementsPath, 'utf-8');
    
    // Get current parsing results
    const originalAssets = this.parseAssetsFromMarkdown(requirementsContent);
    
    // Get all visual assets
    const allAssets = this.parseAllVisualAssets(requirementsContent);
    
    console.log('🔍 CURRENT PARSING RESULTS:');
    console.log(`   Icons found by current script: ${originalAssets.length}`);
    
    console.log('\n🎯 COMPREHENSIVE ANALYSIS:');
    console.log(`   Total visual assets found: ${allAssets.length}`);
    
    // Break down by asset type
    const assetTypes = {};
    const generatableAssets = allAssets.filter(a => a.isGeneratable);
    const iconLikeAssets = allAssets.filter(a => a.isIconLike && a.isGeneratable);
    const currentlyParsed = allAssets.filter(a => a.currentlyParsed);
    const missed = allAssets.filter(a => a.isIconLike && a.isGeneratable && !a.currentlyParsed);
    
    allAssets.forEach(asset => {
      assetTypes[asset.assetType] = (assetTypes[asset.assetType] || 0) + 1;
    });
    
    console.log('\n📋 ASSET BREAKDOWN BY TYPE:');
    Object.entries(assetTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n🎨 GENERATABLE ASSETS:');
    console.log(`   Total generatable assets: ${generatableAssets.length}`);
    console.log(`   Icon-like generatable assets: ${iconLikeAssets.length}`);
    console.log(`   Currently parsed by script: ${currentlyParsed.length}`);
    console.log(`   MISSED by current script: ${missed.length}`);
    
    console.log('\n❌ ASSETS BEING MISSED (First 20):');
    missed.slice(0, 20).forEach((asset, i) => {
      console.log(`   ${i+1}. ${asset.filename} (${asset.assetType}) - ${asset.description}`);
    });
    
    if (missed.length > 20) {
      console.log(`   ... and ${missed.length - 20} more`);
    }
    
    console.log('\n🔧 PARSING ISSUES IDENTIFIED:');
    console.log('   1. PRIMARY ISSUE: Filter too restrictive');
    console.log(`      - Current: filename.includes('icon') && (filename.endsWith('.svg') || filename.endsWith('.png'))`);
    console.log(`      - Should be: (filename.endsWith('.svg') || filename.endsWith('.png')) && isIconLike`);
    
    // Find assets missed by pattern matching
    const allLines = requirementsContent.split('\n');
    const assetLines = allLines.filter(line => 
      line.includes('.svg') || 
      line.includes('.png') || 
      line.includes('.jpg') || 
      line.includes('.json') ||
      line.includes('.mp4')
    );
    
    console.log('\n📝 PATTERN ANALYSIS:');
    console.log(`   Total lines mentioning assets: ${assetLines.length}`);
    console.log(`   Assets successfully parsed: ${allAssets.length}`);
    console.log(`   Potential parsing gaps: ${assetLines.length - allAssets.length}`);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('   1. Remove the filename.includes("icon") restriction');
    console.log('   2. Include all .svg and .png files as generatable');
    console.log('   3. Add logic to identify icon-like assets by:');
    console.log('      - File extension (.svg especially)');
    console.log('      - Keywords in description (icon, badge, graphic, logo)');
    console.log('      - Filename patterns (badge, logo, graphic)');
    console.log('   4. Consider generating .jpg files for photography-like assets');
    
    console.log('\n💡 IMPROVED FILTER SUGGESTION:');
    console.log(`   if ((filename.endsWith('.svg') || filename.endsWith('.png') || filename.endsWith('.jpg')) && `);
    console.log(`       (filename.includes('icon') || filename.includes('badge') || filename.includes('logo') || `);
    console.log(`        filename.endsWith('.svg') || description.toLowerCase().includes('graphic'))) {`);
    
    // Generate summary stats
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log(`   Current script finds: ${originalAssets.length} assets`);
    console.log(`   Total generatable visual assets: ${iconLikeAssets.length} assets`);
    console.log(`   Improvement potential: +${missed.length} additional assets (${Math.round((missed.length / iconLikeAssets.length) * 100)}% increase)`);
    
    return {
      original: originalAssets.length,
      total: allAssets.length,
      generatable: iconLikeAssets.length,
      missed: missed.length,
      missedAssets: missed
    };
  }
}

// Run analysis
async function main() {
  const analyzer = new AssetParsingAnalyzer();
  await analyzer.analyze();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AssetParsingAnalyzer;