#!/usr/bin/env node

/**
 * Database Setup Verification Script
 * 
 * This script verifies that the Supabase database is properly configured
 * with all required tables, columns, and policies for Compozit Vision.
 * 
 * Usage: node scripts/verify-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://xmkkhdxhzopgfophlyjd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here';

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

// Required database schema
const REQUIRED_TABLES = {
  profiles: [
    'id',
    'email',
    'full_name',
    'avatar_url',
    'subscription_tier',
    'subscription_status',
    'stripe_customer_id',
    'subscription_id',
    'current_period_end',
    'credits_remaining',
    'preferences',
    'created_at',
    'updated_at'
  ],
  projects: [
    'id',
    'user_id',
    'name',
    'description',
    'room_type',
    'room_dimensions',
    'location_data',
    'status',
    'budget_min',
    'budget_max',
    'style_preferences',
    'original_images',
    'is_public',
    'created_at',
    'updated_at'
  ],
  designs: [
    'id',
    'project_id',
    'name',
    'style',
    'ai_prompt',
    'generated_image_url',
    'processing_time_ms',
    'products',
    'estimated_cost',
    'user_rating',
    'is_favorite',
    'metadata',
    'created_at'
  ],
  products: [
    'id',
    'name',
    'description',
    'category',
    'subcategory',
    'brand',
    'sku',
    'base_price',
    'currency',
    'dimensions',
    'materials',
    'colors',
    'style_tags',
    'images',
    'ar_model_url',
    'retailer_data',
    'availability_status',
    'rating',
    'review_count',
    'created_at',
    'updated_at'
  ],
  orders: [
    'id',
    'user_id',
    'project_id',
    'design_id',
    'stripe_payment_intent_id',
    'subtotal',
    'tax_amount',
    'shipping_amount',
    'total_amount',
    'currency',
    'status',
    'payment_status',
    'items',
    'shipping_address',
    'billing_address',
    'created_at',
    'updated_at'
  ],
  analytics_events: [
    'id',
    'user_id',
    'session_id',
    'event_type',
    'event_data',
    'user_agent',
    'ip_address',
    'created_at'
  ]
};

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error;
  } catch (err) {
    return false;
  }
}

async function checkTableColumns(tableName, requiredColumns) {
  try {
    // This is a simplified check - in production you might want to query information_schema
    const { data, error } = await supabase
      .from(tableName)
      .select(requiredColumns.join(','))
      .limit(0);
    
    return !error;
  } catch (err) {
    return false;
  }
}

async function checkRLSEnabled(tableName) {
  try {
    // Check if RLS is enabled by trying to access the table without authentication
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If we get a permissions error, RLS is likely enabled
    return error && error.message.includes('permission');
  } catch (err) {
    return false;
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase database setup...\n');
  
  let allChecksPass = true;
  
  // Check each required table
  for (const [tableName, requiredColumns] of Object.entries(REQUIRED_TABLES)) {
    console.log(`📋 Checking table: ${tableName}`);
    
    // Check if table exists
    const tableExists = await checkTableExists(tableName);
    if (!tableExists) {
      console.log(`   ❌ Table '${tableName}' does not exist`);
      allChecksPass = false;
      continue;
    }
    console.log(`   ✅ Table exists`);
    
    // Check if all required columns exist
    const columnsExist = await checkTableColumns(tableName, requiredColumns);
    if (!columnsExist) {
      console.log(`   ❌ Some required columns missing in '${tableName}'`);
      allChecksPass = false;
    } else {
      console.log(`   ✅ All required columns present (${requiredColumns.length} columns)`);
    }
    
    // Check RLS for user-specific tables
    if (['profiles', 'projects', 'designs', 'orders', 'analytics_events'].includes(tableName)) {
      const rlsEnabled = await checkRLSEnabled(tableName);
      if (rlsEnabled) {
        console.log(`   ✅ Row Level Security (RLS) appears to be enabled`);
      } else {
        console.log(`   ⚠️  Row Level Security (RLS) may not be properly configured`);
      }
    }
    
    console.log('');
  }
  
  // Test basic operations
  console.log('🧪 Testing basic operations...');
  
  // Test products table (should be publicly readable)
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (!error) {
      console.log('   ✅ Products table is accessible');
      if (data && data.length > 0) {
        console.log('   ✅ Sample products exist');
      } else {
        console.log('   ⚠️  No products in database (consider adding sample data)');
      }
    } else {
      console.log('   ❌ Cannot access products table:', error.message);
      allChecksPass = false;
    }
  } catch (err) {
    console.log('   ❌ Error testing products table:', err.message);
    allChecksPass = false;
  }
  
  // Summary
  console.log('\n📊 Database Verification Summary:');
  if (allChecksPass) {
    console.log('   ✅ All critical checks passed!');
    console.log('   ✅ Database appears to be properly configured');
    console.log('\n🚀 You can now run the mobile app safely.');
  } else {
    console.log('   ❌ Some checks failed');
    console.log('   📋 Action required:');
    console.log('      1. Run the SQL schema in supabase-schema.sql');
    console.log('      2. Ensure Row Level Security policies are enabled');
    console.log('      3. Add sample product data if needed');
    console.log('      4. Verify service key permissions');
  }
  
  return allChecksPass;
}

// Run verification
if (require.main === module) {
  verifyDatabase()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyDatabase };