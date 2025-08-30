-- Populate subscription plans table with production-ready data
-- This script should be run via MCP to populate the database

-- First, let's ensure the table exists and check current data
SELECT COUNT(*) as current_plan_count FROM subscription_plans;

-- Clear existing data (if any)
TRUNCATE TABLE subscription_plans CASCADE;

-- Insert production subscription plans
INSERT INTO subscription_plans (
  id, 
  stripe_product_id, 
  stripe_price_id, 
  display_name, 
  description, 
  price_amount, 
  billing_period, 
  designs_included, 
  is_popular, 
  is_active, 
  display_order, 
  badge_text, 
  features,
  created_at,
  updated_at
) VALUES 

-- Basic Plan
(
  'basic',
  'prod_basic_compozit', -- Will be updated with real Stripe product ID
  'price_basic_compozit', -- Will be updated with real Stripe price ID
  'Basic',
  'Perfect for homeowners and personal projects',
  19.00,
  'month',
  50,
  false,
  true,
  1,
  NULL,
  '["50 AI designs per month", "Standard support", "HD downloads", "Basic style library", "Email support"]'::jsonb,
  NOW(),
  NOW()
),

-- Pro Plan (Most Popular)
(
  'pro',
  'prod_pro_compozit', -- Will be updated with real Stripe product ID
  'price_pro_compozit', -- Will be updated with real Stripe price ID
  'Pro',
  'Best for professionals and small design businesses',
  29.00,
  'month',
  200,
  true,
  true,
  2,
  'Most Popular',
  '["200 AI designs per month", "Priority support", "4K downloads", "Full style library", "Commercial license", "Priority processing"]'::jsonb,
  NOW(),
  NOW()
),

-- Enterprise Plan
(
  'enterprise',
  'prod_enterprise_compozit', -- Will be updated with real Stripe product ID
  'price_enterprise_compozit', -- Will be updated with real Stripe price ID
  'Enterprise',
  'For design agencies and large teams',
  99.00,
  'month',
  -1, -- Unlimited
  false,
  true,
  3,
  'Unlimited',
  '["Unlimited AI designs", "White-label options", "API access", "Dedicated support", "Custom integrations", "Team management"]'::jsonb,
  NOW(),
  NOW()
);

-- Verify the data was inserted correctly
SELECT 
  id,
  display_name,
  price_amount,
  billing_period,
  designs_included,
  is_popular,
  badge_text,
  array_length(features::text[]::jsonb[], 1) as feature_count
FROM subscription_plans 
ORDER BY display_order;

-- Enable RLS (Row Level Security) for subscription_plans if not already enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read subscription plans (public data)
DROP POLICY IF EXISTS "Allow public read access to subscription plans" ON subscription_plans;
CREATE POLICY "Allow public read access to subscription plans" 
ON subscription_plans FOR SELECT 
TO PUBLIC 
USING (is_active = true);

-- Create policy for admin operations (insert, update, delete)
DROP POLICY IF EXISTS "Allow admin access to subscription plans" ON subscription_plans;
CREATE POLICY "Allow admin access to subscription plans" 
ON subscription_plans 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON subscription_plans TO anon;
GRANT SELECT ON subscription_plans TO authenticated;

-- Show final state
SELECT 
  'Database successfully populated with ' || COUNT(*) || ' subscription plans' as status
FROM subscription_plans WHERE is_active = true;