-- Compozit Vision Database Schema
-- PostgreSQL database for AI-powered interior design and renovation planning

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geographic data
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE design_style AS ENUM ('modern', 'classic', 'minimalist', 'industrial', 'scandinavian', 'bohemian', 'traditional', 'contemporary');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive',
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    credits_remaining INTEGER DEFAULT 3,
    total_credits_purchased INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    sku TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    dimensions JSONB, -- {width: 100, height: 50, depth: 40, unit: "cm"}
    weight DECIMAL(10,2), -- in kg
    materials TEXT[],
    colors TEXT[],
    style_tags TEXT[],
    images JSONB, -- [{url: "...", alt: "...", is_primary: true}]
    ar_model_url TEXT,
    retailer_data JSONB, -- {ikea: {id: "...", url: "..."}, amazon: {...}}
    availability_status TEXT DEFAULT 'in_stock',
    stock_quantity INTEGER,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    features TEXT[],
    assembly_required BOOLEAN DEFAULT false,
    eco_friendly BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector TSVECTOR,
    embedding vector(1536) -- For AI similarity search
);

-- Create indexes for products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_search_vector ON products USING gin(search_vector);
CREATE INDEX idx_products_style_tags ON products USING gin(style_tags);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops);

-- Product price history
CREATE TABLE public.product_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    retailer TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON product_price_history(product_id);
CREATE INDEX idx_price_history_date ON product_price_history(recorded_at);

-- Partners/Retailers table
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- 'retailer', 'contractor', 'designer'
    commission_rate DECIMAL(5,4), -- 0.0300 = 3%
    api_endpoint TEXT,
    api_credentials JSONB, -- Encrypted
    logo_url TEXT,
    website_url TEXT,
    support_email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT,
    room_dimensions JSONB, -- {width: 4.5, length: 3.2, height: 2.7, unit: "m"}
    location_data JSONB, -- {zip_code: "90210", city: "Beverly Hills", state: "CA"}
    status project_status DEFAULT 'draft',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    style_preferences design_style[],
    original_images JSONB, -- [{url: "...", metadata: {...}}]
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created ON projects(created_at DESC);

-- Design variations table
CREATE TABLE public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT,
    style design_style,
    ai_prompt TEXT,
    generated_image_url TEXT,
    processing_time_ms INTEGER,
    products JSONB, -- Array of product IDs with placement data
    estimated_cost DECIMAL(10,2),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- AI model details, parameters, etc.
);

CREATE INDEX idx_designs_project ON designs(project_id);
CREATE INDEX idx_designs_favorite ON designs(is_favorite) WHERE is_favorite = true;

-- Design products junction table
CREATE TABLE public.design_products (
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    placement_data JSONB, -- {x: 100, y: 200, rotation: 45}
    custom_color TEXT,
    custom_size JSONB,
    price_override DECIMAL(10,2),
    PRIMARY KEY (design_id, product_id)
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    design_id UUID REFERENCES designs(id),
    stripe_payment_intent_id TEXT UNIQUE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2),
    shipping_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    items JSONB NOT NULL, -- [{product_id, quantity, price, partner}]
    shipping_address JSONB,
    billing_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe ON orders(stripe_payment_intent_id);

-- Affiliate sales tracking
CREATE TABLE public.affiliate_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    user_id UUID REFERENCES profiles(id),
    product_id UUID REFERENCES products(id),
    partner_id UUID REFERENCES partners(id),
    sale_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    commission_earned DECIMAL(10,2) NOT NULL,
    click_timestamp TIMESTAMPTZ,
    purchase_timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ
);

CREATE INDEX idx_affiliate_sales_partner ON affiliate_sales(partner_id);
CREATE INDEX idx_affiliate_sales_user ON affiliate_sales(user_id);
CREATE INDEX idx_affiliate_sales_paid ON affiliate_sales(is_paid, partner_id);

-- User credits and usage
CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    credit_amount INTEGER NOT NULL,
    credit_type TEXT NOT NULL, -- 'purchased', 'bonus', 'refund'
    stripe_payment_intent_id TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.design_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    design_id UUID REFERENCES designs(id),
    credits_consumed INTEGER DEFAULT 1,
    processing_time_ms INTEGER,
    ai_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_user ON design_generations(user_id);
CREATE INDEX idx_generations_date ON design_generations(created_at DESC);

-- Analytics events
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_date ON analytics_events(created_at DESC);

-- Regional pricing data
CREATE TABLE public.regional_pricing (
    zip_code TEXT PRIMARY KEY,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    labor_rate_per_hour DECIMAL(8,2),
    material_markup DECIMAL(4,3) DEFAULT 1.0,
    average_project_cost DECIMAL(10,2),
    cost_index DECIMAL(5,3) DEFAULT 1.0, -- 1.0 = national average
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product recommendations
CREATE TABLE public.product_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2), -- 0.00 to 1.00
    recommendation_type TEXT, -- 'similar_style', 'complementary', 'alternative'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_product_id, recommended_product_id)
);

CREATE INDEX idx_recommendations_source ON product_recommendations(source_product_id);
CREATE INDEX idx_recommendations_score ON product_recommendations(similarity_score DESC);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'price_alert', 'project_shared', 'order_update'
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);

-- Functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.brand, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.materials, ' '), '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.style_tags, ' '), '')), 'B');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_search_vector_trigger 
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Function to calculate total project cost
CREATE OR REPLACE FUNCTION calculate_project_cost(p_project_id UUID)
RETURNS TABLE (
    subtotal DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_cost DECIMAL(10,2)
) AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_labor_cost DECIMAL(10,2);
    v_tax_rate DECIMAL(4,3) DEFAULT 0.0875; -- 8.75% default
    v_tax_amount DECIMAL(10,2);
    v_total DECIMAL(10,2);
    v_zip_code TEXT;
    v_labor_rate DECIMAL(8,2);
BEGIN
    -- Get project location
    SELECT (location_data->>'zip_code')::TEXT INTO v_zip_code
    FROM projects WHERE id = p_project_id;
    
    -- Get regional labor rate
    SELECT labor_rate_per_hour INTO v_labor_rate
    FROM regional_pricing WHERE zip_code = v_zip_code;
    
    IF v_labor_rate IS NULL THEN
        v_labor_rate := 75.00; -- Default rate
    END IF;
    
    -- Calculate product subtotal
    SELECT COALESCE(SUM(p.base_price * dp.quantity), 0) INTO v_subtotal
    FROM designs d
    JOIN design_products dp ON d.id = dp.design_id
    JOIN products p ON dp.product_id = p.id
    WHERE d.project_id = p_project_id AND d.is_favorite = true;
    
    -- Estimate labor (20% of product cost or 8 hours minimum)
    v_labor_cost := GREATEST(v_subtotal * 0.2, v_labor_rate * 8);
    
    -- Calculate tax
    v_tax_amount := (v_subtotal + v_labor_cost) * v_tax_rate;
    
    -- Total
    v_total := v_subtotal + v_labor_cost + v_tax_amount;
    
    RETURN QUERY SELECT v_subtotal, v_labor_cost, v_tax_amount, v_total;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable by all" ON projects
    FOR SELECT USING (is_public = true);

-- Similar policies for other tables...

-- Create views for common queries

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    p.subscription_tier,
    p.credits_remaining,
    COUNT(DISTINCT proj.id) as total_projects,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as lifetime_value
FROM profiles p
LEFT JOIN projects proj ON p.id = proj.user_id
LEFT JOIN orders o ON p.id = o.user_id AND o.status = 'completed'
GROUP BY p.id;

-- Product performance view
CREATE VIEW product_performance AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.base_price,
    COUNT(DISTINCT dp.design_id) as times_used,
    COUNT(DISTINCT o.id) as times_ordered,
    AVG(d.user_rating) as avg_rating,
    SUM(afs.commission_earned) as total_commissions
FROM products p
LEFT JOIN design_products dp ON p.id = dp.product_id
LEFT JOIN designs d ON dp.design_id = d.id
LEFT JOIN orders o ON o.items @> jsonb_build_array(jsonb_build_object('product_id', p.id::text))
LEFT JOIN affiliate_sales afs ON p.id = afs.product_id
GROUP BY p.id;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Initial seed data (optional)
-- INSERT INTO partners (name, type, commission_rate) VALUES
-- ('IKEA', 'retailer', 0.05),
-- ('Amazon', 'retailer', 0.04),
-- ('Wayfair', 'retailer', 0.06);

COMMENT ON SCHEMA public IS 'Compozit Vision - AI-powered interior design and renovation planning database';