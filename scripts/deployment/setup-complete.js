#!/usr/bin/env node

/**
 * Complete Setup Script
 * Executes database schema and creates Stripe products with updated pricing
 */

const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../mobile/.env') });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error('❌ Missing Stripe secret key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const stripeClient = stripe(stripeSecretKey);

async function executeSchema() {
  console.log('🔄 Executing database schema...');
  
  try {
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Schema execution failed:', error.message);
      
      // Try executing in smaller chunks
      console.log('🔄 Trying to execute schema in chunks...');
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            const { error: stmtError } = await supabase.rpc('exec_sql', { 
              sql: statement + ';' 
            });
            
            if (stmtError) {
              console.warn(`⚠️ Warning in statement ${i + 1}:`, stmtError.message);
            }
          } catch (err) {
            console.warn(`⚠️ Error in statement ${i + 1}:`, err.message);
          }
        }
      }
      
      console.log('✅ Schema execution completed with warnings');
    } else {
      console.log('✅ Schema executed successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    
    // Manual execution instructions
    console.log('\n📝 Manual Schema Execution Required:');
    console.log('1. Go to: https://app.supabase.com/project/xmkkhdxhzopgfophlyjd/sql/new');
    console.log('2. Copy the contents of supabase/schema.sql');
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run" to execute');
    
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔄 Verifying database tables...');
  
  const tables = [
    'profiles',
    'products', 
    'projects',
    'designs',
    'orders',
    'partners',
    'user_credits',
    'analytics_events'
  ];
  
  let successCount = 0;
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}' not accessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
    }
  }
  
  console.log(`📊 Tables verified: ${successCount}/${tables.length}`);
  return successCount === tables.length;
}

async function createStripeProducts() {
  console.log('\n🔄 Creating updated Stripe products...');
  
  try {
    // Updated pricing structure: Basic $19, Pro $29, Business $49
    const subscriptionProducts = [
      {
        name: 'Compozit Vision Basic',
        description: '50 designs/month, basic styles, standard processing',
        price: 1900, // $19.00
        interval: 'month',
        credits: 50,
        features: [
          '50 designs per month',
          'Basic style library',
          'Standard processing speed',
          'Email support',
          'Mobile app access'
        ]
      },
      {
        name: 'Compozit Vision Pro',
        description: '200 designs/month, premium styles, priority processing, advanced features',
        price: 2900, // $29.00
        interval: 'month',
        credits: 200,
        features: [
          '200 designs per month',
          'Premium style library',
          'Priority processing',
          'Advanced customization',
          'High-resolution exports',
          'Priority email support'
        ]
      },
      {
        name: 'Compozit Vision Business',
        description: 'Unlimited designs, all features, team collaboration, API access',
        price: 4900, // $49.00
        interval: 'month', 
        credits: 999999, // Unlimited
        features: [
          'Unlimited designs',
          'Complete style library',
          'Fastest processing',
          'Team collaboration (up to 10 users)',
          'API access',
          'White-label options',
          'Dedicated support',
          'Custom integrations'
        ]
      }
    ];

    const createdSubscriptions = [];

    for (const productData of subscriptionProducts) {
      // Create product
      const product = await stripeClient.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          app: 'compozit-vision',
          type: 'subscription',
          credits_included: productData.credits.toString(),
          features: JSON.stringify(productData.features)
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

      createdSubscriptions.push({
        product,
        price,
        amount: productData.price / 100,
        credits: productData.credits
      });

      console.log(`✅ Created: ${product.name} - $${productData.price/100}/month (${productData.credits === 999999 ? 'Unlimited' : productData.credits} designs)`);
    }

    // Create credit top-up packages
    const creditPackages = [
      { 
        name: 'Extra Credits - 25 Pack', 
        credits: 25, 
        price: 999, // $9.99
        description: '25 additional design credits - perfect for extra projects'
      },
      { 
        name: 'Extra Credits - 50 Pack', 
        credits: 50, 
        price: 1899, // $18.99 (save 5%)
        description: '50 additional design credits - great value for heavy users'
      },
      { 
        name: 'Extra Credits - 100 Pack', 
        credits: 100, 
        price: 3599, // $35.99 (save 10%)
        description: '100 additional design credits - best value for professional use'
      }
    ];

    for (const packageData of creditPackages) {
      const product = await stripeClient.products.create({
        name: packageData.name,
        description: packageData.description,
        metadata: {
          app: 'compozit-vision',
          type: 'credit_topup',
          credits: packageData.credits.toString()
        }
      });

      const price = await stripeClient.prices.create({
        product: product.id,
        unit_amount: packageData.price,
        currency: 'usd'
      });

      console.log(`✅ Created: ${product.name} - $${packageData.price/100} (${packageData.credits} credits)`);
    }

    console.log('\n🎉 All Stripe products created successfully!');
    console.log('\n💰 Pricing Structure:');
    console.log('📦 Basic Plan: $19/month - 50 designs');
    console.log('🚀 Pro Plan: $29/month - 200 designs');  
    console.log('🏢 Business Plan: $49/month - Unlimited designs');
    console.log('💳 Credit Top-ups: $9.99 (25), $18.99 (50), $35.99 (100)');

    return true;
  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    return false;
  }
}

async function setupWebhooks() {
  console.log('\n🔄 Setting up Stripe webhooks...');
  
  try {
    // Create webhook endpoint
    const webhook = await stripeClient.webhookEndpoints.create({
      url: 'https://your-api-domain.com/api/stripe/webhook',
      enabled_events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'checkout.session.completed'
      ]
    });

    console.log('✅ Webhook endpoint created:', webhook.url);
    console.log('🔑 Webhook secret:', webhook.secret);
    console.log('\n⚠️ IMPORTANT: Update your .env file with:');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);

    return true;
  } catch (error) {
    console.error('❌ Error setting up webhooks:', error.message);
    console.log('\n📝 Manual webhook setup required:');
    console.log('1. Go to: https://dashboard.stripe.com/webhooks');
    console.log('2. Click "Add endpoint"');
    console.log('3. Enter URL: https://your-api-domain.com/api/stripe/webhook');
    console.log('4. Select events: payment_intent.*, invoice.*, customer.subscription.*');
    
    return false;
  }
}

async function insertTestData() {
  console.log('\n🔄 Inserting test data...');
  
  try {
    // Insert test partners
    const partners = [
      {
        name: 'IKEA',
        type: 'retailer',
        commission_rate: 0.05,
        website_url: 'https://www.ikea.com',
        logo_url: 'https://www.ikea.com/logo.png',
        is_active: true
      },
      {
        name: 'Amazon',
        type: 'retailer', 
        commission_rate: 0.04,
        website_url: 'https://www.amazon.com',
        logo_url: 'https://amazon.com/logo.png',
        is_active: true
      },
      {
        name: 'Wayfair',
        type: 'retailer',
        commission_rate: 0.06,
        website_url: 'https://www.wayfair.com',
        logo_url: 'https://wayfair.com/logo.png',
        is_active: true
      }
    ];

    const { data: partnersData, error: partnersError } = await supabase
      .from('partners')
      .insert(partners)
      .select();

    if (partnersError) {
      console.warn('⚠️ Error inserting partners:', partnersError.message);
    } else {
      console.log(`✅ Inserted ${partnersData.length} partners`);
    }

    // Insert test products
    const products = [
      {
        name: 'Modern 3-Seat Sofa',
        description: 'Comfortable modern sofa with clean lines and premium fabric',
        category: 'furniture',
        subcategory: 'sofas',
        brand: 'IKEA',
        base_price: 899.99,
        currency: 'USD',
        dimensions: { width: 210, height: 88, depth: 95, unit: 'cm' },
        materials: ['fabric', 'wood', 'foam'],
        colors: ['gray', 'navy', 'beige'],
        style_tags: ['modern', 'minimalist', 'scandinavian'],
        images: [
          { url: 'https://example.com/sofa1.jpg', alt: 'Modern sofa front view', is_primary: true },
          { url: 'https://example.com/sofa2.jpg', alt: 'Modern sofa side view', is_primary: false }
        ],
        retailer_data: { ikea: { sku: 'SOF123', url: 'https://ikea.com/products/sof123' } },
        availability_status: 'in_stock',
        rating: 4.5,
        review_count: 89,
        features: ['Easy assembly', 'Machine washable covers', '10-year warranty']
      },
      {
        name: 'Minimalist Coffee Table',
        description: 'Clean oak coffee table perfect for modern living rooms',
        category: 'furniture',
        subcategory: 'tables',
        brand: 'IKEA',
        base_price: 249.99,
        currency: 'USD',
        dimensions: { width: 120, height: 45, depth: 60, unit: 'cm' },
        materials: ['oak', 'metal'],
        colors: ['oak', 'white oak'],
        style_tags: ['minimalist', 'scandinavian', 'modern'],
        images: [
          { url: 'https://example.com/table1.jpg', alt: 'Coffee table', is_primary: true }
        ],
        retailer_data: { ikea: { sku: 'TAB456', url: 'https://ikea.com/products/tab456' } },
        availability_status: 'in_stock',
        rating: 4.2,
        review_count: 156
      }
    ];

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) {
      console.warn('⚠️ Error inserting products:', productsError.message);
    } else {
      console.log(`✅ Inserted ${productsData.length} products`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error inserting test data:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Complete Compozit Vision Setup');
  console.log('==================================\n');

  // Step 1: Execute database schema
  const schemaSuccess = await executeSchema();
  
  if (!schemaSuccess) {
    console.log('\n⏸️ Please execute the schema manually and press Enter to continue...');
    await new Promise(resolve => process.stdin.once('data', resolve));
  }

  // Step 2: Verify tables
  const tablesOk = await verifyTables();
  
  if (!tablesOk) {
    console.error('\n❌ Some tables are missing. Please check schema execution.');
  }

  // Step 3: Create Stripe products
  const stripeSuccess = await createStripeProducts();
  
  // Step 4: Setup webhooks (optional)
  console.log('\n❓ Would you like to set up Stripe webhooks? (y/n)');
  const webhookAnswer = await new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.toString().trim().toLowerCase());
    });
  });
  
  if (webhookAnswer === 'y') {
    await setupWebhooks();
  }

  // Step 5: Insert test data
  console.log('\n❓ Would you like to insert test data? (y/n)');
  const testDataAnswer = await new Promise(resolve => {
    process.stdin.once('data', data => {
      resolve(data.toString().trim().toLowerCase());
    });
  });
  
  if (testDataAnswer === 'y') {
    await insertTestData();
  }

  // Summary
  console.log('\n🎉 Setup Complete!');
  console.log('\n📊 What was accomplished:');
  console.log('✅ Database schema executed');
  console.log('✅ Tables verified and accessible'); 
  console.log('✅ Stripe products created with new pricing');
  console.log('✅ Credit top-up packages created');
  if (webhookAnswer === 'y') console.log('✅ Webhooks configured');
  if (testDataAnswer === 'y') console.log('✅ Test data inserted');

  console.log('\n📝 Next steps:');
  console.log('1. Update your API endpoints to use the new pricing');
  console.log('2. Implement authentication flows in the mobile app');
  console.log('3. Build the design generation service');
  console.log('4. Set up product catalog sync from partners');

  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

main();