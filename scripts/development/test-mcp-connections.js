#!/usr/bin/env node

/**
 * MCP Connection Testing Script
 * Tests all configured MCP servers to ensure they're working properly
 */

const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../mobile/.env') });

// Configuration
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  }
};

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase MCP connection...');
  
  try {
    const supabase = createClient(config.supabase.url, config.supabase.anonKey);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase MCP connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase error:', error.message);
    return false;
  }
}

async function testStripeConnection() {
  console.log('🔄 Testing Stripe MCP connection...');
  
  try {
    if (!config.stripe.secretKey) {
      console.log('⚠️  Stripe secret key not found in environment');
      return false;
    }
    
    const stripeClient = stripe(config.stripe.secretKey);
    
    // Test connection by retrieving account info
    const account = await stripeClient.accounts.retrieve();
    
    console.log('✅ Stripe MCP connection successful!');
    console.log(`📊 Account: ${account.display_name || 'Test Account'}`);
    console.log(`💳 Mode: ${account.livemode ? 'Live' : 'Test'}`);
    return true;
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    return false;
  }
}

async function createStripeProducts() {
  console.log('\n🔄 Creating Stripe products for Compozit Vision...');
  
  try {
    const stripeClient = stripe(config.stripe.secretKey);
    
    // Create products based on PROJECT_DESCRIPTION.md pricing
    const products = [
      {
        name: 'Compozit Vision Pro',
        description: 'Unlimited designs, premium styles, priority processing, advanced customization',
        price: 2900, // $29.00
        interval: 'month'
      },
      {
        name: 'Compozit Vision Business', 
        description: 'Everything in Pro + team collaboration, API access, white-label options',
        price: 4900, // $49.00
        interval: 'month'
      }
    ];
    
    const createdProducts = [];
    
    for (const productData of products) {
      // Create product
      const product = await stripeClient.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          app: 'compozit-vision',
          created_by: 'setup-script'
        }
      });
      
      // Create price
      const price = await stripeClient.prices.create({
        product: product.id,
        unit_amount: productData.price,
        currency: 'usd',
        recurring: {
          interval: productData.interval
        }
      });
      
      createdProducts.push({
        product,
        price,
        amount: productData.price / 100
      });
      
      console.log(`✅ Created: ${product.name} - $${productData.price/100}/month`);
    }
    
    // Create credit packages
    const creditPackages = [
      { name: 'Design Credits - 10 Pack', credits: 10, price: 2500 }, // $25.00
      { name: 'Design Credits - 25 Pack', credits: 25, price: 5900 }, // $59.00  
      { name: 'Design Credits - 50 Pack', credits: 50, price: 9900 }  // $99.00
    ];
    
    for (const packageData of creditPackages) {
      const product = await stripeClient.products.create({
        name: packageData.name,
        description: `${packageData.credits} design generation credits - no expiration`,
        metadata: {
          app: 'compozit-vision',
          credits: packageData.credits.toString(),
          type: 'credit_package'
        }
      });
      
      const price = await stripeClient.prices.create({
        product: product.id,
        unit_amount: packageData.price,
        currency: 'usd'
      });
      
      console.log(`✅ Created: ${product.name} - $${packageData.price/100}`);
    }
    
    console.log('\n🎉 All Stripe products created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    return false;
  }
}

async function testProductCatalogAPIs() {
  console.log('\n🔄 Testing product catalog API connections...');
  
  // Note: These would require actual API keys to test
  console.log('⚠️  Product catalog APIs require actual API keys:');
  console.log('📍 IKEA API (Zyla): Needs RAPIDAPI_KEY');
  console.log('📍 Amazon Product API: Needs AWS credentials');
  console.log('📍 Apify APIs: Needs APIFY_API_TOKEN');
  
  // For now, just validate the configuration exists
  const apiKeys = {
    rapidapi: process.env.RAPIDAPI_KEY,
    amazon_access: process.env.AMAZON_ACCESS_KEY,
    apify: process.env.APIFY_API_TOKEN
  };
  
  for (const [service, key] of Object.entries(apiKeys)) {
    if (key && key !== 'YOUR_API_KEY_HERE') {
      console.log(`✅ ${service.toUpperCase()} key configured`);
    } else {
      console.log(`⚠️  ${service.toUpperCase()} key not configured`);
    }
  }
}

async function validateMCPConfiguration() {
  console.log('\n🔄 Validating MCP configuration file...');
  
  try {
    const mcpConfig = require('../.mcp.json');
    
    console.log(`📊 Total MCP servers configured: ${Object.keys(mcpConfig.mcpServers).length}`);
    
    // Check each server configuration
    for (const [serverName, config] of Object.entries(mcpConfig.mcpServers)) {
      const hasRequiredFields = config.name && config.type && config.priority;
      const hasEnvVars = config.env && Object.keys(config.env).length > 0;
      
      if (hasRequiredFields && hasEnvVars) {
        console.log(`✅ ${serverName}: Configuration valid`);
      } else {
        console.log(`⚠️  ${serverName}: Configuration incomplete`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error reading MCP configuration:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Compozit Vision MCP Connection Testing');
  console.log('========================================\n');
  
  const results = [];
  
  // Test core connections
  results.push(await testSupabaseConnection());
  results.push(await testStripeConnection());
  
  // Validate MCP configuration
  results.push(await validateMCPConfiguration());
  
  // Test product catalog APIs (validation only)
  await testProductCatalogAPIs();
  
  // Ask if user wants to create Stripe products
  console.log('\n❓ Would you like to create Stripe products? (y/n)');
  
  const answer = await new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.toString().trim().toLowerCase());
    });
  });
  
  if (answer === 'y') {
    results.push(await createStripeProducts());
  }
  
  // Summary
  const successCount = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log(`\n📊 Test Results: ${successCount}/${totalTests} passed`);
  
  if (successCount === totalTests) {
    console.log('🎉 All MCP connections are ready!');
    console.log('\n📝 Next steps:');
    console.log('1. Execute database schema in Supabase Dashboard');
    console.log('2. Implement authentication service');
    console.log('3. Create product catalog sync service');
    console.log('4. Build design generation API');
  } else {
    console.log('⚠️  Some connections need attention before proceeding');
  }
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
main();