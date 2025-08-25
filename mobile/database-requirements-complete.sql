-- =====================================================
-- COMPOZIT VISION - COMPLETE DATABASE SCHEMA
-- Database Requirements Analysis Report
-- Generated from comprehensive codebase analysis
-- =====================================================

-- This file contains all database tables needed to replace
-- hardcoded data throughout the Compozit Vision mobile app

-- =====================================================
-- 1. STYLE MANAGEMENT SYSTEM
-- =====================================================

-- Style categories (replaces hardcoded style arrays)
CREATE TABLE IF NOT EXISTS style_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Modern', 'Classic', 'Minimalist', etc.
    slug TEXT UNIQUE NOT NULL, -- 'modern', 'classic', 'minimalist'
    display_name TEXT NOT NULL,
    description TEXT,
    emoji TEXT, -- '⬜', '❄️', '⚙️' for onboarding
    
    -- Visual properties
    characteristic_tags TEXT[] DEFAULT '{}', -- ['clean-lines', 'minimalist', 'contemporary']
    color_schemes TEXT[] DEFAULT '{}', -- ['neutral', 'monochrome', 'warm']
    
    -- Compatibility
    room_compatibility TEXT[] DEFAULT '{}', -- ['living-room', 'bedroom', 'office']
    furniture_styles TEXT[] DEFAULT '{}', -- compatible furniture styles
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    selection_limit INTEGER DEFAULT 1, -- max selections allowed (2 for onboarding)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Style reference images (for grid display)
CREATE TABLE IF NOT EXISTS style_reference_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_category_id UUID NOT NULL REFERENCES style_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Image URLs (multiple sizes for performance)
    thumbnail_url TEXT NOT NULL, -- 250x300px
    medium_url TEXT NOT NULL,    -- 500x600px
    large_url TEXT NOT NULL,     -- 1000x1200px
    
    -- Image properties
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_kb INTEGER,
    dominant_colors TEXT[] DEFAULT '{}',
    
    -- Content classification
    room_type TEXT, -- 'living_room', 'bedroom', etc.
    style_elements TEXT[] DEFAULT '{}', -- ['furniture', 'lighting', 'textiles']
    mood_tags TEXT[] DEFAULT '{}', -- ['cozy', 'elegant', 'vibrant']
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_hero_image BOOLEAN DEFAULT false, -- main representative image
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    source_attribution TEXT,
    alt_text TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. FURNITURE MANAGEMENT SYSTEM
-- =====================================================

-- Furniture categories (replaces hardcoded furniture arrays)
CREATE TABLE IF NOT EXISTS furniture_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'modern-sofa', 'classic-chairs', etc.
    display_name TEXT NOT NULL, -- 'Modern Sofa', 'Classic Chairs'
    emoji TEXT, -- '🛋️', '🪑', '🛏️'
    description TEXT,
    
    -- Category properties
    category_type TEXT NOT NULL, -- 'seating', 'tables', 'storage', 'lighting'
    visual_impact_score INTEGER DEFAULT 5, -- 1-10 scale
    
    -- Compatibility
    room_compatibility TEXT[] DEFAULT '{}', -- ['living-room', 'bedroom']
    style_compatibility TEXT[] DEFAULT '{}', -- ['modern', 'classic']
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Furniture style variations (for swipe galleries)
CREATE TABLE IF NOT EXISTS furniture_style_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES furniture_categories(id) ON DELETE CASCADE,
    
    -- Style variation info
    style_name TEXT NOT NULL, -- 'Modern Minimalist Sofa', 'Industrial Chic Chair'
    style_slug TEXT NOT NULL,
    description TEXT,
    
    -- Visual properties
    primary_color TEXT,
    secondary_colors TEXT[] DEFAULT '{}',
    finish_type TEXT, -- 'matte', 'glossy', 'textured'
    material_tags TEXT[] DEFAULT '{}', -- ['leather', 'fabric', 'wood']
    
    -- Gallery images (3-4 per style for swiping)
    gallery_images JSONB NOT NULL DEFAULT '[]',
    -- Structure: [{"url": "...", "thumbnail": "...", "alt": "...", "order": 1}]
    
    primary_image_url TEXT NOT NULL, -- Main display image
    thumbnail_url TEXT NOT NULL,     -- Grid thumbnail
    
    -- Pricing (if available)
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    
    -- Compatibility
    room_types TEXT[] DEFAULT '{}',
    design_styles TEXT[] DEFAULT '{}',
    color_palettes TEXT[] DEFAULT '{}',
    
    -- Popularity metrics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    selection_count INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 50, -- 0-100
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. ROOM & SPACE MANAGEMENT
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

-- =====================================================
-- 4. SUBSCRIPTION & PRICING SYSTEM
-- =====================================================

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

-- =====================================================
-- 5. BUDGET MANAGEMENT
-- =====================================================

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

-- =====================================================
-- 6. USER JOURNEY & ONBOARDING
-- =====================================================

-- Journey steps (replaces hardcoded journey flow)
CREATE TABLE IF NOT EXISTS journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    screen_name TEXT NOT NULL, -- 'onboarding1', 'paywall', 'photoCapture'
    step_name TEXT NOT NULL, -- 'welcome', 'subscription', 'photo'
    title TEXT NOT NULL, -- 'Welcome', 'Choose Plan', 'Upload Photo'
    description TEXT,
    
    -- Step properties
    is_required BOOLEAN DEFAULT true,
    estimated_duration_seconds INTEGER,
    allows_skip BOOLEAN DEFAULT false,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding content (replaces hardcoded onboarding text)
CREATE TABLE IF NOT EXISTS onboarding_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_name TEXT NOT NULL, -- 'onboarding1', 'onboarding2'
    content_type TEXT NOT NULL, -- 'feature', 'title', 'subtitle', 'button_text'
    
    -- Content details
    title TEXT,
    description TEXT,
    icon_name TEXT, -- ionicon name
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App highlights (replaces hardcoded feature highlights)
CREATE TABLE IF NOT EXISTS app_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- ionicon name
    
    -- Context
    screen_context TEXT, -- 'paywall', 'onboarding', 'global'
    highlight_type TEXT, -- 'feature', 'benefit', 'social_proof'
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. AMBIANCE & MOOD SYSTEM
-- =====================================================

-- Ambiance options (replaces hardcoded ambiance data)
CREATE TABLE IF NOT EXISTS ambiance_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Cozy', 'Elegant', 'Vibrant'
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Visual properties
    mood_tags TEXT[] DEFAULT '{}', -- ['warm', 'inviting', 'comfortable']
    color_adjustments JSONB DEFAULT '{}', -- lighting and color settings
    lighting_preset TEXT,
    texture_emphasis TEXT,
    
    -- Reference images
    preview_image_url TEXT,
    reference_images JSONB DEFAULT '[]', -- array of reference image objects
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. CONFIGURATION & CONTENT MANAGEMENT
-- =====================================================

-- App configuration (replaces scattered hardcoded values)
CREATE TABLE IF NOT EXISTS app_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL, -- 'free_credits', 'max_style_selections'
    config_value TEXT NOT NULL, -- '3', '2', 'true'
    data_type TEXT NOT NULL, -- 'integer', 'string', 'boolean', 'json'
    
    -- Configuration metadata
    category TEXT, -- 'credits', 'limits', 'features', 'ui'
    description TEXT,
    is_editable BOOLEAN DEFAULT true, -- can be modified via admin
    requires_app_restart BOOLEAN DEFAULT false,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    updated_by TEXT, -- admin user ID
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UI content (replaces hardcoded text throughout app)
CREATE TABLE IF NOT EXISTS ui_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_name TEXT NOT NULL, -- 'onboarding1', 'paywall', 'camera'
    content_key TEXT NOT NULL, -- 'title', 'subtitle', 'button_text', 'feature_description'
    content_value TEXT NOT NULL, -- actual display text
    
    -- Content properties
    content_type TEXT DEFAULT 'text', -- 'text', 'html', 'markdown'
    locale TEXT DEFAULT 'en-US', -- for internationalization
    
    -- Context
    element_type TEXT, -- 'heading', 'body', 'button', 'label'
    platform TEXT, -- 'mobile', 'web', 'all'
    
    -- Versioning
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation flow (replaces hardcoded navigation logic)
CREATE TABLE IF NOT EXISTS navigation_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_screen TEXT NOT NULL,
    to_screen TEXT NOT NULL,
    
    -- Flow conditions
    condition_type TEXT DEFAULT 'always', -- 'always', 'conditional', 'user_choice'
    condition_value JSONB DEFAULT '{}', -- JSON conditions for navigation
    
    -- Flow properties
    is_back_navigation BOOLEAN DEFAULT false,
    requires_authentication BOOLEAN DEFAULT false,
    requires_subscription BOOLEAN DEFAULT false,
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust metrics (replaces hardcoded trust indicators)
CREATE TABLE IF NOT EXISTS trust_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL, -- 'total_designs', 'user_rating', 'satisfaction_rate'
    display_text TEXT NOT NULL, -- '50K+ Designs', '4.9★ Rating', '98% Satisfaction'
    metric_value TEXT NOT NULL, -- '50000', '4.9', '98'
    
    -- Visual properties
    icon_name TEXT, -- ionicon name
    metric_type TEXT, -- 'number', 'percentage', 'rating'
    
    -- Context
    display_context TEXT[] DEFAULT '{}', -- ['onboarding', 'paywall']
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Auto-update properties
    is_dynamic BOOLEAN DEFAULT false, -- updates from real data
    update_frequency TEXT, -- 'daily', 'weekly', 'monthly'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Style system indexes
CREATE INDEX idx_style_categories_active ON style_categories(is_active, display_order);
CREATE INDEX idx_style_reference_images_category ON style_reference_images(style_category_id);
CREATE INDEX idx_style_reference_images_room ON style_reference_images(room_type) WHERE room_type IS NOT NULL;

-- Furniture system indexes  
CREATE INDEX idx_furniture_categories_type ON furniture_categories(category_type);
CREATE INDEX idx_furniture_variations_category ON furniture_style_variations(category_id);
CREATE INDEX idx_furniture_variations_popularity ON furniture_style_variations(popularity_score DESC);
CREATE INDEX idx_furniture_variations_room ON furniture_style_variations USING GIN(room_types);

-- Journey and content indexes
CREATE INDEX idx_journey_steps_order ON journey_steps(display_order);
CREATE INDEX idx_onboarding_content_screen ON onboarding_content(screen_name, display_order);
CREATE INDEX idx_ui_content_screen ON ui_content(screen_name, content_key);
CREATE INDEX idx_app_configuration_key ON app_configuration(config_key);

-- Plan and pricing indexes
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, display_order);
CREATE INDEX idx_plan_features_plan ON plan_features(plan_id, display_order);
CREATE INDEX idx_budget_ranges_active ON budget_ranges(is_active, display_order);

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_style_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambiance_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for all content tables (no user-specific data)
CREATE POLICY "Allow public read access" ON style_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON style_reference_images FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON furniture_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON furniture_style_variations FOR SELECT USING (is_available = true);
CREATE POLICY "Allow public read access" ON room_types FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON plan_features FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON credit_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON budget_ranges FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON journey_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON onboarding_content FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON app_highlights FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON ambiance_options FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON app_configuration FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON ui_content FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON navigation_flow FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON trust_metrics FOR SELECT USING (is_active = true);

-- =====================================================
-- 11. SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample style categories
INSERT INTO style_categories (id, name, slug, display_name, description, emoji, display_order, is_active) VALUES
('modern-style', 'Modern', 'modern', 'Modern', 'Clean lines and contemporary feel', '⬜', 1, true),
('scandinavian-style', 'Scandinavian', 'scandinavian', 'Scandinavian', 'Nordic minimalism with natural elements', '❄️', 2, true),
('industrial-style', 'Industrial', 'industrial', 'Industrial', 'Raw materials and urban aesthetics', '⚙️', 3, true),
('traditional-style', 'Traditional', 'traditional', 'Traditional', 'Classic and timeless designs', '🏛️', 4, true),
('luxury-style', 'Luxury', 'luxury', 'Luxury', 'Opulent and sophisticated styling', '💎', 5, true),
('bohemian-style', 'Bohemian', 'bohemian', 'Bohemian', 'Eclectic and artistic expression', '🌸', 6, true);

-- Insert sample room types
INSERT INTO room_types (id, name, display_name, description, display_order, is_active) VALUES
('living-room', 'living-room', 'Living Room', 'Main social and entertainment space', 1, true),
('bedroom', 'bedroom', 'Bedroom', 'Private rest and relaxation space', 2, true),
('kitchen', 'kitchen', 'Kitchen', 'Cooking and dining preparation area', 3, true),
('bathroom', 'bathroom', 'Bathroom', 'Personal care and hygiene space', 4, true),
('office', 'office', 'Office', 'Work and productivity space', 5, true);

-- Insert sample furniture categories
INSERT INTO furniture_categories (id, name, display_name, emoji, category_type, display_order, is_active) VALUES
('modern-sofa', 'modern-sofa', 'Modern Sofa', '🛋️', 'seating', 1, true),
('classic-chairs', 'classic-chairs', 'Classic Chairs', '🪑', 'seating', 2, true),
('dining-table', 'dining-table', 'Dining Table', '🪑', 'tables', 3, true),
('bed-frame', 'bed-frame', 'Bed Frame', '🛏️', 'bedroom', 4, true),
('coffee-table', 'coffee-table', 'Coffee Table', '☕', 'tables', 5, true),
('bookshelf', 'bookshelf', 'Bookshelf', '📚', 'storage', 6, true);

-- Insert sample subscription plans
INSERT INTO subscription_plans (id, name, display_name, price_amount, designs_included, is_popular, display_order, is_active) VALUES
('basic', 'Basic', 'Basic', 19.00, 50, false, 1, true),
('pro', 'Pro', 'Pro', 29.00, 200, true, 2, true),
('business', 'Business', 'Business', 49.00, -1, false, 3, true);

-- Insert sample budget ranges
INSERT INTO budget_ranges (id, label, description, min_amount, max_amount, display_order, is_active) VALUES
('under-1k', 'Under $1,000', 'Budget-friendly refresh', 0.00, 1000.00, 1, true),
('1k-5k', '$1,000 - $5,000', 'Moderate makeover', 1000.00, 5000.00, 2, true),
('5k-15k', '$5,000 - $15,000', 'Full transformation', 5000.00, 15000.00, 3, true),
('15k-plus', '$15,000+', 'Luxury redesign', 15000.00, 50000.00, 4, true);

-- Insert sample journey steps
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
(12, 'results', 'results', 'Your Design', true, 12, true);

-- Insert sample app configuration
INSERT INTO app_configuration (config_key, config_value, data_type, category, description) VALUES
('free_credits_count', '3', 'integer', 'credits', 'Number of free credits for new users'),
('max_style_selections', '2', 'integer', 'limits', 'Maximum style selections in onboarding'),
('total_journey_steps', '12', 'integer', 'journey', 'Total number of journey steps'),
('default_currency', 'USD', 'string', 'pricing', 'Default currency for pricing'),
('enable_social_auth', 'true', 'boolean', 'features', 'Enable social authentication');

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- This schema eliminates all hardcoded data from:
-- ✅ Styles and design preferences
-- ✅ Furniture categories and options  
-- ✅ Room types and classifications
-- ✅ Subscription plans and pricing
-- ✅ Budget ranges and options
-- ✅ Journey flow and steps
-- ✅ Onboarding content and features
-- ✅ App configuration and settings
-- ✅ UI content and text
-- ✅ Navigation flow logic
-- ✅ Trust metrics and social proof

-- Next steps:
-- 1. Run this schema in Supabase
-- 2. Upload sample images for styles and furniture
-- 3. Update mobile app to fetch data from database
-- 4. Create admin interface for content management
-- 5. Run comprehensive testing