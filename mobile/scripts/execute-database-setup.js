#!/usr/bin/env node

/**
 * Database Setup Script - Execute Complete Schema
 * Uses Supabase client to create all tables programmatically
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase configuration from parent MCP config
const supabaseUrl = 'https://xmkkhdxhzopgfophlyjd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2toZHhoem9wZ2ZvcGhseWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk3MjUyOCwiZXhwIjoyMDU5NTQ4NTI4fQ.ot5D87Hkpumzj3BTWY8RvW5CfFEEl56p8M6h1hkuqNQ';

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Execute SQL script via RPC call
 */
async function executeSQL(sqlContent, scriptName) {
  console.log(`🔄 Executing ${scriptName}...`);
  
  try {
    // Use the built-in SQL execution via RPC
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error(`❌ Error in ${scriptName}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully executed ${scriptName}`);
    if (data) console.log('Result:', data);
    return true;
    
  } catch (err) {
    console.error(`❌ Exception in ${scriptName}:`, err.message);
    return false;
  }
}

/**
 * Alternative: Execute SQL via direct PostgreSQL connection
 */
async function executeDirectSQL(sqlContent, scriptName) {
  console.log(`🔄 Executing ${scriptName} via direct SQL...`);
  
  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('select ') && statement.includes('status')) {
        // Skip status messages
        continue;
      }
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ SQL Error:`, error);
        console.error(`Statement:`, statement.substring(0, 100) + '...');
        return false;
      }
    }
    
    console.log(`✅ Successfully executed ${scriptName}`);
    return true;
    
  } catch (err) {
    console.error(`❌ Exception in ${scriptName}:`, err.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function setupDatabase() {
  console.log('🚀 Starting Compozit Vision Database Setup');
  console.log('📡 Connecting to Supabase:', supabaseUrl);
  
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
      const sqlContent = await fs.readFile(scriptPath, 'utf8');
      
      const success = await executeDirectSQL(sqlContent, scriptFile);
      if (success) {
        successCount++;
      }
      
      // Small delay between scripts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.error(`❌ Failed to read ${scriptFile}:`, err.message);
    }
  }
  
  console.log(`\n🏁 Database Setup Complete!`);
  console.log(`✅ Successfully executed ${successCount}/${scripts.length} scripts`);
  
  if (successCount === scripts.length) {
    console.log('🎉 All database tables created successfully!');
    await verifySetup();
  } else {
    console.log('⚠️  Some scripts failed. Check the logs above.');
  }
}

/**
 * Verify database setup
 */
async function verifySetup() {
  console.log('\n🔍 Verifying database setup...');
  
  const tables = [
    'style_categories',
    'style_reference_images',
    'furniture_categories', 
    'furniture_style_variations',
    'room_types',
    'subscription_plans',
    'plan_features',
    'budget_ranges',
    'journey_steps',
    'app_configuration'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: Ready`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`);
    }
  }
  
  // Check sample data counts
  console.log('\n📊 Sample data verification:');
  const sampleChecks = [
    { table: 'style_categories', expected: 6 },
    { table: 'furniture_categories', expected: 6 },
    { table: 'subscription_plans', expected: 3 },
    { table: 'budget_ranges', expected: 4 }
  ];
  
  for (const check of sampleChecks) {
    try {
      const { data, count, error } = await supabase
        .from(check.table)
        .select('*', { count: 'exact' });
        
      if (error) {
        console.log(`❌ ${check.table} count: ${error.message}`);
      } else {
        const actualCount = count || data?.length || 0;
        const status = actualCount === check.expected ? '✅' : '⚠️';
        console.log(`${status} ${check.table}: ${actualCount}/${check.expected} rows`);
      }
    } catch (err) {
      console.log(`❌ ${check.table} count: ${err.message}`);
    }
  }
}

// Execute setup
if (require.main === module) {
  setupDatabase().catch(err => {
    console.error('💥 Setup failed:', err);
    process.exit(1);
  });
}

module.exports = { setupDatabase, executeSQL, verifySetup };