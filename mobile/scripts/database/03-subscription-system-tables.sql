-- =====================================================
-- PHASE 1.3: SUBSCRIPTION & PRICING SYSTEM TABLES
-- Execute this third in Supabase SQL Editor
-- =====================================================

-- Room types (replaces hardcoded room arrays)
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- 'living-room', 'bedroom', 'kitchen'
    display_name TEXT NOT NULL, -- 'Living Room', 'Bedroom', 'Kitchen'
    description TEXT,
    icon_name TEXT, -- ionicon name or emoji
    
    -- Room properties
    typical_furniture TEXT[] DEFAULT '{}', -- common furniture for this room
    default_styles TEXT[] DEFAULT '{}', -- recommended styles
    space_requirements TEXT, -- 'small', 'medium', 'large', 'variable'
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans (replaces hardcoded plan data)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY, -- 'basic', 'pro', 'business'
    name TEXT NOT NULL, -- 'Basic', 'Pro', 'Business'
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    price_amount DECIMAL(10,2) NOT NULL, -- 19.00, 29.00, 49.00
    price_currency TEXT DEFAULT 'USD',
    billing_period TEXT DEFAULT 'month', -- 'month', 'year'
    
    -- Plan limits
    designs_included INTEGER, -- 50, 200, -1 for unlimited
    credits_included INTEGER DEFAULT 0,
    
    -- Visual presentation
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    badge_text TEXT, -- 'Most Popular', 'Best Value'
    highlight_color TEXT, -- hex color for UI
    
    -- Stripe integration
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan features (replaces hardcoded feature lists)
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    
    -- Feature details
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    feature_category TEXT, -- 'generations', 'support', 'processing'
    
    -- Display properties
    is_highlight BOOLEAN DEFAULT false,
    icon_name TEXT, -- ionicon name
    display_order INTEGER DEFAULT 0,
    is_included BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit packages (replaces hardcoded credit offerings)
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Credit details
    credits INTEGER NOT NULL,
    price_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Value proposition
    savings_percentage DECIMAL(5,2), -- 15.00 for 15% savings
    bonus_credits INTEGER DEFAULT 0,
    
    -- Stripe integration
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget ranges (replaces hardcoded budget options)
CREATE TABLE IF NOT EXISTS budget_ranges (
    id TEXT PRIMARY KEY, -- 'under-1k', '1k-5k', '5k-15k', '15k-plus'
    label TEXT NOT NULL, -- 'Under $1,000', '$1,000 - $5,000'
    description TEXT NOT NULL, -- 'Budget-friendly refresh', 'Moderate makeover'
    
    -- Range values
    min_amount DECIMAL(10,2) NOT NULL, -- 0.00, 1000.00, 5000.00
    max_amount DECIMAL(10,2) NOT NULL, -- 1000.00, 5000.00, 50000.00
    currency TEXT DEFAULT 'USD',
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all subscription tables
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ranges ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to active rooms" ON room_types 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active plans" ON subscription_plans 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to plan features" ON plan_features 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active credit packages" ON credit_packages 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active budget ranges" ON budget_ranges 
FOR SELECT USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON plan_features(plan_id, display_order);
CREATE INDEX IF NOT EXISTS idx_budget_ranges_active ON budget_ranges(is_active, display_order);

-- Insert sample room types
INSERT INTO room_types (id, name, display_name, description, display_order, is_active) VALUES
('71111111-7111-4111-8111-111111111111', 'living-room', 'Living Room', 'Main social and entertainment space', 1, true),
('72222222-7222-4222-8222-222222222222', 'bedroom', 'Bedroom', 'Private rest and relaxation space', 2, true),
('73333333-7333-4333-8333-333333333333', 'kitchen', 'Kitchen', 'Cooking and dining preparation area', 3, true),
('74444444-7444-4444-8444-444444444444', 'bathroom', 'Bathroom', 'Personal care and hygiene space', 4, true),
('75555555-7555-4555-8555-555555555555', 'office', 'Office', 'Work and productivity space', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscription plans
INSERT INTO subscription_plans (id, name, display_name, price_amount, designs_included, is_popular, display_order, is_active) VALUES
('basic', 'Basic', 'Basic', 19.00, 50, false, 1, true),
('pro', 'Pro', 'Pro', 29.00, 200, true, 2, true),
('business', 'Business', 'Business', 49.00, -1, false, 3, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample plan features
INSERT INTO plan_features (plan_id, feature_name, feature_category, display_order, is_included) VALUES
-- Basic plan features
('basic', '50 AI design generations', 'generations', 1, true),
('basic', 'Standard processing time', 'processing', 2, true),
('basic', 'Email support', 'support', 3, true),

-- Pro plan features  
('pro', '200 AI design generations', 'generations', 1, true),
('pro', 'Priority processing', 'processing', 2, true),
('pro', 'Advanced style options', 'features', 3, true),
('pro', 'Priority email support', 'support', 4, true),

-- Business plan features
('business', 'Unlimited AI design generations', 'generations', 1, true),
('business', 'Fastest processing', 'processing', 2, true),
('business', 'All premium features', 'features', 3, true),
('business', 'Dedicated support', 'support', 4, true),
('business', 'API access', 'developer', 5, true)
ON CONFLICT DO NOTHING;

-- Insert sample budget ranges
INSERT INTO budget_ranges (id, label, description, min_amount, max_amount, display_order, is_active) VALUES
('under-1k', 'Under $1,000', 'Budget-friendly refresh', 0.00, 1000.00, 1, true),
('1k-5k', '$1,000 - $5,000', 'Moderate makeover', 1000.00, 5000.00, 2, true),
('5k-15k', '$5,000 - $15,000', 'Full transformation', 5000.00, 15000.00, 3, true),
('15k-plus', '$15,000+', 'Luxury redesign', 15000.00, 50000.00, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Subscription and pricing tables created successfully! ✅' as status;