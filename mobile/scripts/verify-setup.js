#!/usr/bin/env node

/**
 * Verify Database Setup - Check Table Status
 */

const https = require('https');

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2toZHhoem9wZ2ZvcGhseWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk3MjUyOCwiZXhwIjoyMDU5NTQ4NTI4fQ.ot5D87Hkpumzj3BTWY8RvW5CfFEEl56p8M6h1hkuqNQ';

/**
 * Test table existence via REST API
 */
async function testTable(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'xmkkhdxhzopgfophlyjd.supabase.co',
      port: 443,
      path: `/rest/v1/${tableName}?select=count&limit=1`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          table: tableName,
          exists: res.statusCode === 200,
          status: res.statusCode,
          response: data.substring(0, 100)
        });
      });
    });
    
    req.on('error', () => {
      resolve({ table: tableName, exists: false, status: 'error' });
    });
    
    req.end();
  });
}

/**
 * Verify complete database setup
 */
async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Compozit Vision Database Setup...\n');
  
  const tables = [
    'style_categories',
    'style_reference_images',
    'furniture_categories', 
    'furniture_style_variations',
    'subscription_plans',
    'budget_ranges',
    'journey_steps'
  ];
  
  const results = [];
  
  // Test all tables
  for (const table of tables) {
    const result = await testTable(table);
    results.push(result);
    
    const status = result.exists ? '✅' : '❌';
    const statusText = result.exists ? 'EXISTS' : 'MISSING';
    console.log(`${status} ${table}: ${statusText} (${result.status})`);
  }
  
  // Summary
  const existingTables = results.filter(r => r.exists).length;
  const totalTables = results.length;
  
  console.log(`\n📊 Database Status: ${existingTables}/${totalTables} tables exist`);
  
  if (existingTables === totalTables) {
    console.log('🎉 Database setup is COMPLETE!');
    console.log('\n🎯 Ready for Phase 2:');
    console.log('✅ All core tables created');
    console.log('🔄 Update mobile app to fetch from database');
    console.log('🖼️ Upload image assets for galleries');
    return true;
  } else if (existingTables > 0) {
    console.log('⚠️  Partial setup detected. Some tables missing.');
    console.log('\n📋 Missing tables:');
    results.filter(r => !r.exists).forEach(r => {
      console.log(`   - ${r.table}`);
    });
    return false;
  } else {
    console.log('❌ No tables found. Database setup required.');
    console.log('\n💡 Run the setup script:');
    console.log('   node scripts/quick-setup.js');
    return false;
  }
}

// Execute verification
if (require.main === module) {
  verifyDatabaseSetup()
    .then(isComplete => {
      process.exit(isComplete ? 0 : 1);
    })
    .catch(err => {
      console.error('💥 Verification failed:', err.message);
      process.exit(1);
    });
}

module.exports = { verifyDatabaseSetup, testTable };