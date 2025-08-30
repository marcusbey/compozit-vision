# 🚀 Manual Database Setup Guide

## Quick Setup Options

### Option 1: Manual Execution (Recommended)
**Execute each script in your Supabase SQL Editor:**

1. **Go to**: https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd/sql
2. **Execute in this exact order:**
   - Copy and paste `01-style-system-tables.sql` → Run
   - Copy and paste `02-furniture-system-tables.sql` → Run (FIXED UUID format)
   - Copy and paste `03-subscription-system-tables.sql` → Run  
   - Copy and paste `04-journey-content-tables.sql` → Run

### Option 2: Node.js Script
```bash
cd mobile/scripts
node setup-database-direct.js
```

### Option 3: All-in-One SQL (if scripts fail)
Execute this single SQL block in Supabase SQL Editor:

```sql
-- COMPOZIT VISION COMPLETE DATABASE SCHEMA

-- 1. STYLE CATEGORIES
CREATE TABLE IF NOT EXISTS style_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    characteristic_tags TEXT[] DEFAULT '{}',
    color_schemes TEXT[] DEFAULT '{}',
    room_compatibility TEXT[] DEFAULT '{}',
    furniture_styles TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    selection_limit INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STYLE REFERENCE IMAGES  
CREATE TABLE IF NOT EXISTS style_reference_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_category_id UUID NOT NULL REFERENCES style_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    medium_url TEXT NOT NULL,
    large_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_kb INTEGER,
    dominant_colors TEXT[] DEFAULT '{}',
    room_type TEXT,
    style_elements TEXT[] DEFAULT '{}',
    mood_tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_hero_image BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    source_attribution TEXT,
    alt_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FURNITURE CATEGORIES
CREATE TABLE IF NOT EXISTS furniture_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    category_type TEXT NOT NULL,
    visual_impact_score INTEGER DEFAULT 5,
    room_compatibility TEXT[] DEFAULT '{}',
    style_compatibility TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FURNITURE STYLE VARIATIONS
CREATE TABLE IF NOT EXISTS furniture_style_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES furniture_categories(id) ON DELETE CASCADE,
    style_name TEXT NOT NULL,
    style_slug TEXT NOT NULL,
    description TEXT,
    primary_color TEXT,
    secondary_colors TEXT[] DEFAULT '{}',
    finish_type TEXT,
    material_tags TEXT[] DEFAULT '{}',
    gallery_images JSONB NOT NULL DEFAULT '[]',
    primary_image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    room_types TEXT[] DEFAULT '{}',
    design_styles TEXT[] DEFAULT '{}',
    color_palettes TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    selection_count INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 50,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROOM TYPES
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    typical_furniture TEXT[] DEFAULT '{}',
    default_styles TEXT[] DEFAULT '{}',
    space_requirements TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10,2) NOT NULL,
    price_currency TEXT DEFAULT 'USD',
    billing_period TEXT DEFAULT 'month',
    designs_included INTEGER,
    credits_included INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    badge_text TEXT,
    highlight_color TEXT,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLAN FEATURES
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    feature_description TEXT,
    feature_category TEXT,
    is_highlight BOOLEAN DEFAULT false,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_included BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BUDGET RANGES
CREATE TABLE IF NOT EXISTS budget_ranges (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. JOURNEY STEPS
CREATE TABLE IF NOT EXISTS journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    screen_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT true,
    estimated_duration_seconds INTEGER,
    allows_skip BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APP CONFIGURATION
CREATE TABLE IF NOT EXISTS app_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    data_type TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_editable BOOLEAN DEFAULT true,
    requires_app_restart BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_style_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Allow public read access to active styles" ON style_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active style images" ON style_reference_images FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active furniture categories" ON furniture_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to available furniture variations" ON furniture_style_variations FOR SELECT USING (is_available = true);
CREATE POLICY "Allow public read access to active rooms" ON room_types FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active plans" ON subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to plan features" ON plan_features FOR SELECT USING (true);
CREATE POLICY "Allow public read access to active budget ranges" ON budget_ranges FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active journey steps" ON journey_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to app configuration" ON app_configuration FOR SELECT USING (true);

-- SAMPLE DATA
INSERT INTO style_categories (id, name, slug, display_name, description, emoji, display_order, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Modern', 'modern', 'Modern', 'Clean lines and contemporary feel', '⬜', 1, true),
('22222222-2222-2222-2222-222222222222', 'Scandinavian', 'scandinavian', 'Scandinavian', 'Nordic minimalism with natural elements', '❄️', 2, true),
('33333333-3333-3333-3333-333333333333', 'Industrial', 'industrial', 'Industrial', 'Raw materials and urban aesthetics', '⚙️', 3, true),
('44444444-4444-4444-4444-444444444444', 'Traditional', 'traditional', 'Traditional', 'Classic and timeless designs', '🏛️', 4, true),
('55555555-5555-5555-5555-555555555555', 'Luxury', 'luxury', 'Luxury', 'Opulent and sophisticated styling', '💎', 5, true),
('66666666-6666-6666-6666-666666666666', 'Bohemian', 'bohemian', 'Bohemian', 'Eclectic and artistic expression', '🌸', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO furniture_categories (id, name, display_name, emoji, category_type, display_order, is_active) VALUES
('a1111111-a111-4111-8111-111111111111', 'modern-sofa', 'Modern Sofa', '🛋️', 'seating', 1, true),
('b2222222-b222-4222-8222-222222222222', 'classic-chairs', 'Classic Chairs', '🪑', 'seating', 2, true),
('c3333333-c333-4333-8333-333333333333', 'dining-table', 'Dining Table', '🪑', 'tables', 3, true),
('d4444444-d444-4444-8444-444444444444', 'bed-frame', 'Bed Frame', '🛏️', 'bedroom', 4, true),
('e5555555-e555-4555-8555-555555555555', 'coffee-table', 'Coffee Table', '☕', 'tables', 5, true),
('f6666666-f666-4666-8666-666666666666', 'bookshelf', 'Bookshelf', '📚', 'storage', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscription_plans (id, name, display_name, price_amount, designs_included, is_popular, display_order, is_active) VALUES
('basic', 'Basic', 'Basic', 19.00, 50, false, 1, true),
('pro', 'Pro', 'Pro', 29.00, 200, true, 2, true),
('business', 'Business', 'Business', 49.00, -1, false, 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_ranges (id, label, description, min_amount, max_amount, display_order, is_active) VALUES
('under-1k', 'Under $1,000', 'Budget-friendly refresh', 0.00, 1000.00, 1, true),
('1k-5k', '$1,000 - $5,000', 'Moderate makeover', 1000.00, 5000.00, 2, true),
('5k-15k', '$5,000 - $15,000', 'Full transformation', 5000.00, 15000.00, 3, true),
('15k-plus', '$15,000+', 'Luxury redesign', 15000.00, 50000.00, 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO journey_steps (step_number, screen_name, step_name, title, is_required, display_order, is_active) VALUES
(1, 'onboarding1', 'welcome', 'Welcome', true, 1, true),
(2, 'onboarding2', 'styles', 'Style Selection', true, 2, true),
(3, 'onboarding3', 'features', 'Features Overview', true, 3, true),
(4, 'paywall', 'subscription', 'Choose Plan', true, 4, true),
(5, 'photoCapture', 'photo', 'Upload Photo', true, 5, true),
(6, 'descriptions', 'descriptions', 'Add Details', false, 6, true),
(7, 'furniture', 'furniture', 'Furniture Style', false, 7, true),
(8, 'budget', 'budget', 'Set Budget', true, 8, true),
(9, 'auth', 'authentication', 'Create Account', true, 9, true),
(10, 'checkout', 'payment', 'Payment', true, 10, true),
(11, 'processing', 'processing', 'AI Processing', true, 11, true),
(12, 'results', 'results', 'Your Design', true, 12, true)
ON CONFLICT DO NOTHING;

INSERT INTO app_configuration (config_key, config_value, data_type, category, description) VALUES
('free_credits_count', '3', 'integer', 'credits', 'Number of free credits for new users'),
('max_style_selections', '2', 'integer', 'limits', 'Maximum style selections in onboarding'),
('total_journey_steps', '12', 'integer', 'journey', 'Total number of journey steps'),
('default_currency', 'USD', 'string', 'pricing', 'Default currency for pricing'),
('enable_social_auth', 'true', 'boolean', 'features', 'Enable social authentication')
ON CONFLICT (config_key) DO NOTHING;

-- SUCCESS MESSAGE
SELECT 'All database tables created successfully! 🎉' as status;
```

## ✅ Expected Results

After execution, you should see:
- **10 database tables created**
- **Sample data populated**
- **Success message displayed**

## 🔍 Verification

Run this query to verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'style_categories', 'furniture_categories', 'subscription_plans', 
    'budget_ranges', 'journey_steps'
) 
ORDER BY table_name;
```

**Expected**: 5+ tables listed

## 🎯 Next Steps After Database Setup

1. ✅ Database tables created  
2. 🚀 Update mobile app to fetch from database
3. 🖼️ Upload image assets for galleries
4. 🧪 Run comprehensive tests

**Status**: Ready for Phase 2! 🚀