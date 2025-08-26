#!/usr/bin/env node
/**
 * Verify Supabase database schema against supabase-schema.sql
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xmkkhdxhzopgfophlyjd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhta2toZHhoem9wZ2ZvcGhseWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk3MjUyOCwiZXhwIjoyMDU5NTQ4NTI4fQ.ot5D87Hkpumzj3BTWY8RvW5CfFEEl56p8M6h1hkuqNQ';

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifySchema() {
  console.log('🔍 Verifying Supabase database schema...');
  console.log('=' .repeat(50));

  try {
    // Required tables from supabase-schema.sql
    const requiredTables = ['profiles', 'projects', 'designs', 'products', 'orders', 'analytics_events'];
    
    console.log('\n📋 Checking required tables:');
    const tableStatus = {};
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          if (error.code === '42P01') {
            console.log(`❌ Table '${table}' does NOT exist`);
            tableStatus[table] = 'missing';
          } else {
            console.log(`⚠️  Table '${table}' exists but has issues: ${error.message}`);
            tableStatus[table] = 'issues';
          }
        } else {
          console.log(`✅ Table '${table}' exists`);
          tableStatus[table] = 'exists';
        }
      } catch (err) {
        console.log(`❌ Error checking '${table}': ${err.message}`);
        tableStatus[table] = 'error';
      }
    }

    // Check auth.users (should exist in Supabase by default)
    console.log('\n🔐 Checking auth system:');
    try {
      const { data: users, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log(`❌ Auth system error: ${authError.message}`);
      } else {
        console.log(`✅ Auth system working - ${users.users.length} users found`);
      }
    } catch (err) {
      console.log(`❌ Auth system error: ${err.message}`);
    }

    // Summary
    console.log('\n📊 SCHEMA VERIFICATION SUMMARY:');
    console.log('=' .repeat(30));
    
    const missingTables = Object.entries(tableStatus)
      .filter(([table, status]) => status === 'missing')
      .map(([table]) => table);
    
    const existingTables = Object.entries(tableStatus)
      .filter(([table, status]) => status === 'exists')
      .map(([table]) => table);
      
    const problemTables = Object.entries(tableStatus)
      .filter(([table, status]) => status === 'issues' || status === 'error')
      .map(([table]) => table);

    console.log(`✅ Tables that exist: ${existingTables.join(', ') || 'None'}`);
    console.log(`❌ Tables missing: ${missingTables.join(', ') || 'None'}`);
    console.log(`⚠️  Tables with issues: ${problemTables.join(', ') || 'None'}`);

    if (missingTables.length > 0) {
      console.log('\n🔧 RECOMMENDED ACTION:');
      console.log('📋 You need to run the complete supabase-schema.sql in your Supabase dashboard');
      console.log('🌐 Go to: https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd/sql/new');
      console.log('📄 Copy and paste the contents of supabase-schema.sql');
      console.log('▶️  Click "Run" to execute the schema');
      console.log('\n💡 This will create all missing tables with proper RLS policies and indexes');
    } else if (problemTables.length > 0) {
      console.log('\n⚠️  Some tables exist but have configuration issues');
      console.log('💡 Consider running supabase-schema.sql to ensure proper setup');
    } else {
      console.log('\n🎉 All required tables exist! Your database schema looks good.');
    }

  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    throw error;
  }
}

// Run verification
verifySchema().catch(console.error);