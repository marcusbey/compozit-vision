#!/usr/bin/env node

/**
 * Script to populate the database with subscription plans
 * Run with: node scripts/populate-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase credentials here
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_URL.includes('your-')) {
  console.error('❌ Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
  console.log('Example:');
  console.log('export SUPABASE_URL="https://your-project.supabase.co"');
  console.log('export SUPABASE_SERVICE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const subscriptionPlans = [
  {
    id: 'basic',
    stripe_product_id: 'prod_basic_compozit', // Will be updated with real Stripe product ID
    stripe_price_id: 'price_basic_compozit', // Will be updated with real Stripe price ID
    display_name: 'Basic',
    description: 'Perfect for homeowners and personal projects',
    price_amount: 19.00,
    billing_period: 'month',
    designs_included: 50,
    is_popular: false,
    is_active: true,
    display_order: 1,
    badge_text: null,
    features: [
      "50 AI designs per month",
      "Standard support", 
      "HD downloads",
      "Basic style library",
      "Email support"
    ]
  },
  {
    id: 'pro',
    stripe_product_id: 'prod_pro_compozit', // Will be updated with real Stripe product ID
    stripe_price_id: 'price_pro_compozit', // Will be updated with real Stripe price ID
    display_name: 'Pro',
    description: 'Best for professionals and small design businesses',
    price_amount: 29.00,
    billing_period: 'month',
    designs_included: 200,
    is_popular: true,
    is_active: true,
    display_order: 2,
    badge_text: 'Most Popular',
    features: [
      "200 AI designs per month",
      "Priority support",
      "4K downloads", 
      "Full style library",
      "Commercial license",
      "Priority processing"
    ]
  },
  {
    id: 'enterprise',
    stripe_product_id: 'prod_enterprise_compozit', // Will be updated with real Stripe product ID
    stripe_price_id: 'price_enterprise_compozit', // Will be updated with real Stripe price ID
    display_name: 'Enterprise',
    description: 'For design agencies and large teams',
    price_amount: 99.00,
    billing_period: 'month',
    designs_included: -1, // Unlimited
    is_popular: false,
    is_active: true,
    display_order: 3,
    badge_text: 'Unlimited',
    features: [
      "Unlimited AI designs",
      "White-label options",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Team management"
    ]
  }
];

async function populateDatabase() {
  console.log('🚀 Starting database population...');
  
  try {
    // Check if table exists and has data
    console.log('📊 Checking current subscription plans...');
    const { data: existingPlans, error: checkError } = await supabase
      .from('subscription_plans')
      .select('id, display_name');
    
    if (checkError) {
      console.error('❌ Error checking existing plans:', checkError);
      throw checkError;
    }
    
    console.log(`📋 Found ${existingPlans?.length || 0} existing plans`);
    
    // Delete existing plans if any
    if (existingPlans && existingPlans.length > 0) {
      console.log('🗑️  Clearing existing plans...');
      const { error: deleteError } = await supabase
        .from('subscription_plans')
        .delete()
        .neq('id', 'impossible-id'); // Delete all
      
      if (deleteError) {
        console.error('❌ Error clearing existing plans:', deleteError);
        throw deleteError;
      }
      console.log('✅ Existing plans cleared');
    }
    
    // Insert new plans
    console.log('📝 Inserting new subscription plans...');
    const { data: insertedPlans, error: insertError } = await supabase
      .from('subscription_plans')
      .insert(subscriptionPlans)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting subscription plans:', insertError);
      throw insertError;
    }
    
    console.log(`✅ Successfully inserted ${insertedPlans.length} subscription plans:`);
    insertedPlans.forEach(plan => {
      console.log(`  - ${plan.display_name}: $${plan.price_amount}/${plan.billing_period} (${plan.designs_included === -1 ? 'Unlimited' : plan.designs_included} designs)`);
    });
    
    // Verify the data
    console.log('🔍 Verifying inserted data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
      throw verifyError;
    }
    
    console.log(`✅ Database verification successful! ${verifyData.length} active plans found.`);
    
    // Test the app's database service
    console.log('🧪 Testing app database connection...');
    const { data: appTestData, error: appTestError } = await supabase
      .from('subscription_plans')
      .select('id, display_name, price_amount, billing_period, designs_included, is_popular, badge_text, features')
      .eq('is_active', true)
      .order('display_order');
    
    if (appTestError) {
      console.error('❌ App database test failed:', appTestError);
      throw appTestError;
    }
    
    console.log('✅ App database test successful! Plans available:');
    appTestData.forEach(plan => {
      console.log(`  - ${plan.display_name}: $${plan.price_amount}/${plan.billing_period} ${plan.is_popular ? '(Popular)' : ''}`);
      console.log(`    Features: ${plan.features.length} features listed`);
    });
    
    console.log('\n🎉 Database population completed successfully!');
    console.log('📱 Your app should now load subscription plans from the database.');
    console.log('🔄 Restart your app to see the changes.');
    
  } catch (error) {
    console.error('❌ Database population failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase, subscriptionPlans };