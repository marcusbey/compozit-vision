-- Compozit Vision - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'business')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    stripe_customer_id TEXT UNIQUE,
    subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    credits_remaining INTEGER DEFAULT 3 CHECK (credits_remaining >= 0),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT,
    room_dimensions JSONB DEFAULT '{}',
    location_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    style_preferences TEXT[] DEFAULT '{}',
    original_images JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- DESIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS designs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    style TEXT NOT NULL,
    ai_prompt TEXT,
    generated_image_url TEXT,
    processing_time_ms INTEGER,
    products JSONB DEFAULT '[]',
    estimated_cost DECIMAL(10,2),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    is_favorite BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for designs
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage designs for own projects" ON designs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = designs.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    sku TEXT UNIQUE,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    currency TEXT DEFAULT 'USD',
    dimensions JSONB DEFAULT '{}',
    materials TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    style_tags TEXT[] DEFAULT '{}',
    images JSONB DEFAULT '[]',
    ar_model_url TEXT,
    retailer_data JSONB DEFAULT '{}',
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'out_of_stock', 'discontinued')),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for products (no RLS needed for public catalog)
-- Products are publicly readable but only admins can modify

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(10,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
    items JSONB NOT NULL DEFAULT '[]',
    shipping_address JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own orders" ON orders
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ANALYTICS EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy for reading analytics (you would need to create admin users)
-- CREATE POLICY "Admins can read all analytics" ON analytics_events
--     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Designs indexes
CREATE INDEX IF NOT EXISTS idx_designs_project_id ON designs(project_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_is_favorite ON designs(is_favorite);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_style_tags ON products USING GIN(style_tags);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample products for testing
INSERT INTO products (name, description, category, brand, base_price, currency, style_tags, images) VALUES 
('Modern Sofa', 'Comfortable 3-seat sofa', 'furniture', 'IKEA', 599.00, 'USD', 
 ARRAY['modern', 'minimalist'], 
 '[{"url": "https://example.com/sofa.jpg", "alt": "Modern sofa", "is_primary": true}]'),
 
('Dining Table', 'Oak wood dining table', 'furniture', 'West Elm', 899.00, 'USD',
 ARRAY['rustic', 'traditional'],
 '[{"url": "https://example.com/table.jpg", "alt": "Oak dining table", "is_primary": true}]'),
 
('Floor Lamp', 'Scandinavian style floor lamp', 'lighting', 'IKEA', 129.00, 'USD',
 ARRAY['scandinavian', 'modern'],
 '[{"url": "https://example.com/lamp.jpg", "alt": "Floor lamp", "is_primary": true}]')
ON CONFLICT (sku) DO NOTHING;

-- =============================================
-- IMPORTANT NOTES
-- =============================================

/*
1. Run this entire SQL script in your Supabase SQL Editor
2. Make sure to enable Row Level Security on all tables
3. The profiles table automatically links to Supabase auth.users
4. Update your environment variables with the correct Supabase credentials
5. Consider setting up Stripe webhooks for subscription management
6. Add proper backup and monitoring for production use

For development:
- The sample products will help test the product matching features
- You can create test users through the Supabase Auth interface
- Use the Supabase dashboard to view and modify data during development

For production:
- Remove or replace sample data
- Set up proper monitoring and alerting
- Configure automated backups
- Implement proper error logging
- Add rate limiting and security measures
*/