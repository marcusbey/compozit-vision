#!/usr/bin/env node

/**
 * Database Setup Script for Compozit Vision
 * This script helps set up the initial database schema and test connections
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../mobile/.env') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test basic connection by querying the auth schema
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Current users in database: ${data.users.length}`);
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

async function executeSchema() {
  console.log('🔄 Reading schema file...');
  
  const schemaPath = path.join(__dirname, '../supabase/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at:', schemaPath);
    return false;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📝 Schema file loaded successfully');
  console.log('⚠️  IMPORTANT: The schema needs to be executed in the Supabase Dashboard SQL Editor');
  console.log('📍 Go to: https://app.supabase.com/project/xmkkhdxhzopgfophlyjd/sql/new');
  console.log('\n🔧 Steps to execute:');
  console.log('1. Copy the contents of supabase/schema.sql');
  console.log('2. Paste into the SQL Editor');
  console.log('3. Click "Run" to execute');
  console.log('4. Check for any errors in the output');
  
  return true;
}

async function verifyTables() {
  console.log('\n🔄 Verifying database tables...');
  
  try {
    // Check if key tables exist
    const tables = [
      'profiles',
      'products', 
      'projects',
      'designs',
      'orders'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}' not found or accessible`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
  }
}

async function createTestData() {
  console.log('\n🔄 Creating test data...');
  
  try {
    // Insert a test product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: 'Modern Sofa',
        description: 'A comfortable modern sofa perfect for any living room',
        category: 'furniture',
        subcategory: 'sofas',
        base_price: 899.99,
        brand: 'IKEA',
        dimensions: { width: 200, height: 85, depth: 90, unit: 'cm' },
        materials: ['fabric', 'wood', 'foam'],
        colors: ['gray', 'blue', 'beige'],
        style_tags: ['modern', 'minimalist', 'scandinavian']
      })
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Error creating test product:', productError);
    } else {
      console.log('✅ Test product created:', product.name);
    }
    
    // Insert test partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert({
        name: 'IKEA',
        type: 'retailer',
        commission_rate: 0.05,
        website_url: 'https://www.ikea.com',
        is_active: true
      })
      .select()
      .single();
    
    if (partnerError) {
      console.error('❌ Error creating test partner:', partnerError);
    } else {
      console.log('✅ Test partner created:', partner.name);
    }
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

async function main() {
  console.log('🚀 Compozit Vision Database Setup Script');
  console.log('=====================================\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot proceed without a valid connection');
    process.exit(1);
  }
  
  // Show schema execution instructions
  await executeSchema();
  
  // Wait for user to execute schema
  console.log('\n⏸️  After executing the schema in Supabase Dashboard, press Enter to continue...');
  
  // Create a promise that resolves when Enter is pressed
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Verify tables exist
  await verifyTables();
  
  // Ask if user wants to create test data
  console.log('\n❓ Would you like to create test data? (y/n)');
  
  const answer = await new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.toString().trim().toLowerCase());
    });
  });
  
  if (answer === 'y') {
    await createTestData();
  }
  
  console.log('\n✅ Database setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Set up Stripe products in your Stripe dashboard');
  console.log('2. Update webhook endpoints in Stripe settings');
  console.log('3. Start implementing the API endpoints');
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
main();