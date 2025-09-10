#!/usr/bin/env node

/**
 * Direct Database Setup - No Dependencies
 * Uses native Node.js HTTP to execute SQL via Supabase REST API
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from mobile/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmkkhdxhzopgfophlyjd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it in mobile/.env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

/**
 * Make HTTP request to Supabase REST API
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Execute SQL statements via Supabase
 */
async function executeSQL(sqlStatements, scriptName) {
  console.log(`🔄 Executing ${scriptName}...`);
  
  const statements = sqlStatements
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && !s.toLowerCase().includes('select \''))
    .filter(s => s.length > 10); // Filter out very short statements
  
  console.log(`  📊 Found ${statements.length} SQL statements to execute`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    try {
      // Make HTTP request to Supabase SQL endpoint  
      const options = {
        hostname: 'xmkkhdxhzopgfophlyjd.supabase.co',
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      };
      
      const response = await makeRequest(options, { 
        sql: statement + ';'
      });
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`    ✅ Statement ${i + 1}/${statements.length} executed`);
      } else if (response.data && response.data.message && response.data.message.includes('already exists')) {
        console.log(`    ℹ️  Statement ${i + 1}/${statements.length} - already exists (OK)`);
      } else {
        console.log(`    ⚠️  Statement ${i + 1}/${statements.length} - Status: ${response.status}`);
        if (response.data) {
          console.log(`    Details:`, response.data.message || response.data);
        }
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.log(`    ❌ Statement ${i + 1}/${statements.length} failed:`, err.message);
    }
  }
  
  console.log(`✅ Completed ${scriptName}`);
  return true;
}

/**
 * Test table existence
 */
async function testTable(tableName) {
  try {
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
    
    const response = await makeRequest(options);
    return response.status === 200;
    
  } catch (err) {
    return false;
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('🚀 Compozit Vision Database Setup - Direct HTTP Method');
  console.log('📡 Target:', SUPABASE_URL);
  
  const scripts = [
    '01-style-system-tables.sql',
    '02-furniture-system-tables.sql',
    '03-subscription-system-tables.sql', 
    '04-journey-content-tables.sql'
  ];
  
  let successCount = 0;
  
  for (const scriptFile of scripts) {
    const scriptPath = path.join(__dirname, scriptFile);
    
    try {
      console.log(`\n📄 Reading ${scriptFile}...`);
      const sqlContent = fs.readFileSync(scriptPath, 'utf8');
      
      await executeSQL(sqlContent, scriptFile);
      successCount++;
      
      // Delay between scripts
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (err) {
      console.error(`❌ Failed to process ${scriptFile}:`, err.message);
    }
  }
  
  console.log(`\n🏁 Setup Complete! ${successCount}/${scripts.length} scripts processed`);
  
  // Quick verification
  console.log('\n🔍 Quick verification...');
  const coreTables = ['style_categories', 'furniture_categories', 'subscription_plans'];
  
  for (const table of coreTables) {
    const exists = await testTable(table);
    console.log(`${exists ? '✅' : '❌'} Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
  
  console.log('\n🎉 Database setup process completed!');
  console.log('💡 You can verify the setup in your Supabase dashboard:');
  console.log('   https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd/editor');
}

// Run if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };