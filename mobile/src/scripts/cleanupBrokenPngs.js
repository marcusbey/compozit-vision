#!/usr/bin/env node

/**
 * Cleanup Script: Remove broken/gradient placeholder PNG files
 * Removes files under 200KB that are likely gradient placeholders, not real images
 */

const fs = require('fs');
const path = require('path');

const MASONRY_DIR = path.join(__dirname, '../assets/masonry');
const SIZE_THRESHOLD = 200 * 1024; // 200KB threshold

console.log('🧹 PNG Cleanup Script');
console.log('====================');
console.log(`📁 Directory: ${MASONRY_DIR}`);
console.log(`📏 Size threshold: ${SIZE_THRESHOLD / 1024}KB\n`);

// Get all PNG files
const pngFiles = fs.readdirSync(MASONRY_DIR).filter(file => file.endsWith('.png'));

console.log(`📋 Found ${pngFiles.length} PNG files total\n`);

let brokenFiles = [];
let validFiles = [];

// Check each file
pngFiles.forEach(filename => {
  const filepath = path.join(MASONRY_DIR, filename);
  const stats = fs.statSync(filepath);
  
  if (stats.size < SIZE_THRESHOLD) {
    brokenFiles.push({
      name: filename,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024)
    });
  } else {
    validFiles.push({
      name: filename,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024)
    });
  }
});

console.log(`✅ Valid images (>200KB): ${validFiles.length}`);
console.log(`❌ Broken/placeholder images (<200KB): ${brokenFiles.length}\n`);

// Show broken files by size
console.log('🗑️  Files to be removed:');
console.log('========================');

const sizeBuckets = {};
brokenFiles.forEach(file => {
  const bucket = file.size;
  if (!sizeBuckets[bucket]) {
    sizeBuckets[bucket] = [];
  }
  sizeBuckets[bucket].push(file.name);
});

Object.keys(sizeBuckets).sort((a, b) => parseInt(a) - parseInt(b)).forEach(size => {
  const files = sizeBuckets[size];
  const sizeKB = Math.round(size / 1024);
  console.log(`\n📦 ${sizeKB}KB (${files.length} files):`);
  files.forEach(filename => {
    console.log(`   - ${filename}`);
  });
});

// Ask for confirmation
console.log(`\n⚠️  About to delete ${brokenFiles.length} placeholder files`);
console.log(`✅ Keeping ${validFiles.length} real images\n`);

// Delete broken files
let deletedCount = 0;
brokenFiles.forEach(file => {
  const filepath = path.join(MASONRY_DIR, file.name);
  try {
    fs.unlinkSync(filepath);
    console.log(`🗑️  Deleted: ${file.name} (${file.sizeKB}KB)`);
    deletedCount++;
  } catch (error) {
    console.error(`❌ Failed to delete ${file.name}: ${error.message}`);
  }
});

console.log(`\n🎉 Cleanup Complete!`);
console.log(`🗑️  Deleted: ${deletedCount} placeholder files`);
console.log(`✅ Remaining: ${validFiles.length} real images`);
console.log(`💾 Total space freed: ${Math.round(brokenFiles.reduce((sum, f) => sum + f.size, 0) / 1024)}KB`);

// Show remaining real images summary
console.log(`\n📊 Remaining Real Images by Size:`);
const validSizes = validFiles.map(f => f.sizeKB).sort((a, b) => a - b);
const minSize = validSizes[0];
const maxSize = validSizes[validSizes.length - 1];
const avgSize = Math.round(validSizes.reduce((sum, size) => sum + size, 0) / validSizes.length);

console.log(`   Min: ${minSize}KB`);
console.log(`   Max: ${maxSize}KB`);
console.log(`   Avg: ${avgSize}KB`);