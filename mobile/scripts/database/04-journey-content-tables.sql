-- =====================================================
-- PHASE 1.4: JOURNEY & CONTENT MANAGEMENT TABLES
-- Execute this fourth in Supabase SQL Editor
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

-- Enable RLS on all content tables
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambiance_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to active journey steps" ON journey_steps 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active onboarding content" ON onboarding_content 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active app highlights" ON app_highlights 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active ambiance options" ON ambiance_options 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to app configuration" ON app_configuration 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active ui content" ON ui_content 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active navigation flow" ON navigation_flow 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active trust metrics" ON trust_metrics 
FOR SELECT USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_steps_order ON journey_steps(display_order);
CREATE INDEX IF NOT EXISTS idx_onboarding_content_screen ON onboarding_content(screen_name, display_order);
CREATE INDEX IF NOT EXISTS idx_ui_content_screen ON ui_content(screen_name, content_key);
CREATE INDEX IF NOT EXISTS idx_app_configuration_key ON app_configuration(config_key);

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
(12, 'results', 'results', 'Your Design', true, 12, true)
ON CONFLICT DO NOTHING;

-- Insert sample app configuration
INSERT INTO app_configuration (config_key, config_value, data_type, category, description) VALUES
('free_credits_count', '3', 'integer', 'credits', 'Number of free credits for new users'),
('max_style_selections', '2', 'integer', 'limits', 'Maximum style selections in onboarding'),
('total_journey_steps', '12', 'integer', 'journey', 'Total number of journey steps'),
('default_currency', 'USD', 'string', 'pricing', 'Default currency for pricing'),
('enable_social_auth', 'true', 'boolean', 'features', 'Enable social authentication')
ON CONFLICT (config_key) DO NOTHING;

-- Insert sample trust metrics
INSERT INTO trust_metrics (metric_name, display_text, metric_value, icon_name, metric_type, display_context, display_order, is_active) VALUES
('total_designs', '50K+ Designs', '50000', 'image', 'number', ARRAY['onboarding', 'paywall'], 1, true),
('user_rating', '4.9★ Rating', '4.9', 'star', 'rating', ARRAY['onboarding', 'paywall'], 2, true),
('satisfaction_rate', '98% Satisfaction', '98', 'happy', 'percentage', ARRAY['onboarding', 'paywall'], 3, true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Journey and content management tables created successfully! ✅' as status;