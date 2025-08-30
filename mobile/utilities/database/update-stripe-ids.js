#!/usr/bin/env node

/**
 * Script to update database with real Stripe product and price IDs
 * Run after creating products in Stripe Dashboard
 * 
 * Usage: node update-stripe-ids.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateStripeIds() {
  console.log('🔄 Updating Stripe Product and Price IDs in database...');
  console.log('');
  console.log('📋 Please have your Stripe Product and Price IDs ready.');
  console.log('   You can find these in your Stripe Dashboard → Products');
  console.log('');

  try {
    // Get current plans
    const { data: plans, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('id, display_name, stripe_product_id, stripe_price_id')
      .order('display_order');

    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError);
      throw fetchError;
    }

    if (!plans || plans.length === 0) {
      console.error('❌ No subscription plans found in database.');
      console.log('💡 Please run the database population script first:');
      console.log('   node populate-database.js');
      rl.close();
      return;
    }

    console.log('📋 Current subscription plans:');
    plans.forEach(plan => {
      console.log(`  - ${plan.display_name} (${plan.id})`);
      console.log(`    Product ID: ${plan.stripe_product_id}`);
      console.log(`    Price ID: ${plan.stripe_price_id}`);
    });
    console.log('');

    // Ask user if they want to update
    const shouldUpdate = await askQuestion('Do you want to update these with real Stripe IDs? (y/n): ');
    
    if (shouldUpdate.toLowerCase() !== 'y' && shouldUpdate.toLowerCase() !== 'yes') {
      console.log('❌ Update cancelled.');
      rl.close();
      return;
    }

    console.log('');
    console.log('🔧 Please enter your Stripe IDs:');
    console.log('');

    // Update each plan
    for (const plan of plans) {
      console.log(`📝 Updating ${plan.display_name} plan:`);
      
      const productId = await askQuestion(`  Stripe Product ID (starts with prod_): `);
      const priceId = await askQuestion(`  Stripe Price ID (starts with price_): `);

      // Validate IDs
      if (!productId.startsWith('prod_') || !priceId.startsWith('price_')) {
        console.log('⚠️  Warning: IDs don\'t follow expected format. Continuing anyway...');
      }

      // Update database
      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({
          stripe_product_id: productId,
          stripe_price_id: priceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (updateError) {
        console.error(`❌ Error updating ${plan.display_name}:`, updateError);
        throw updateError;
      }

      console.log(`✅ Updated ${plan.display_name} successfully`);
      console.log('');
    }

    // Verify updates
    console.log('🔍 Verifying updates...');
    const { data: updatedPlans, error: verifyError } = await supabase
      .from('subscription_plans')
      .select('id, display_name, stripe_product_id, stripe_price_id')
      .order('display_order');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
      throw verifyError;
    }

    console.log('');
    console.log('✅ All plans updated successfully:');
    updatedPlans.forEach(plan => {
      console.log(`  - ${plan.display_name}:`);
      console.log(`    Product: ${plan.stripe_product_id}`);
      console.log(`    Price: ${plan.stripe_price_id}`);
    });

    console.log('');
    console.log('🎉 Stripe ID update completed successfully!');
    console.log('');
    console.log('📱 Next steps:');
    console.log('  1. Install Stripe SDK: npm install @stripe/stripe-react-native');
    console.log('  2. Configure your .env file with Stripe publishable key');
    console.log('  3. Test the payment flow in your app');
    console.log('');

  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
if (require.main === module) {
  updateStripeIds();
}

module.exports = { updateStripeIds };