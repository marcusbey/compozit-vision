#!/usr/bin/env node

const analyzer = require('./analyzeAssetParsing.js');
const fs = require('fs');
const path = require('path');

async function detailedAnalysis() {
  const anal = new analyzer();
  const requirementsPath = path.join(__dirname, '../../@DOCS/development/COMPREHENSIVE-ASSET-REQUIREMENTS.md');
  const content = fs.readFileSync(requirementsPath, 'utf-8');

  // Get specific examples of missed vs found assets
  const allAssets = anal.parseAllVisualAssets(content);
  const found = allAssets.filter(a => a.currentlyParsed);
  const missed = allAssets.filter(a => a.isIconLike && a.isGeneratable && !a.currentlyParsed);

  console.log('\n📋 DETAILED COMPARISON:\n');

  console.log('✅ CURRENTLY FOUND (first 10):');
  found.slice(0, 10).forEach((asset, i) => {
    console.log(`   ${i+1}. ${asset.filename} - ${asset.description}`);
  });

  console.log('\n❌ BEING MISSED (all missed assets):');
  missed.forEach((asset, i) => {
    console.log(`   ${i+1}. ${asset.filename} - ${asset.description}`);
    console.log(`      Type: ${asset.assetType}, Screen: ${asset.screen}`);
  });

  console.log('\n🎨 VISUAL ASSET CATEGORIES:');
  const categories = {};
  allAssets.forEach(asset => {
    if (asset.isGeneratable) {
      const category = asset.filename.includes('icon') ? 'Icons' :
                      asset.filename.includes('badge') ? 'Badges' :
                      asset.filename.includes('logo') ? 'Logos' :
                      asset.filename.includes('illustration') ? 'Illustrations' :
                      asset.filename.includes('pattern') ? 'Patterns' :
                      asset.filename.includes('overlay') ? 'Overlays' :
                      asset.assetType === 'photo' ? 'Photography' : 'Other';
      categories[category] = (categories[category] || 0) + 1;
    }
  });
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  // Show what percentage each category represents of missed assets
  console.log('\n📊 MISSED ASSET BREAKDOWN:');
  const missedCategories = {};
  missed.forEach(asset => {
    const category = asset.filename.includes('badge') ? 'Badges' :
                    asset.filename.includes('logo') ? 'Logos' :
                    asset.filename.includes('illustration') ? 'Illustrations' :
                    asset.filename.includes('pattern') ? 'Patterns' :
                    asset.filename.includes('overlay') ? 'Overlays' : 'Other SVGs';
    missedCategories[category] = (missedCategories[category] || 0) + 1;
  });
  Object.entries(missedCategories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} assets`);
  });
}

detailedAnalysis().catch(console.error);