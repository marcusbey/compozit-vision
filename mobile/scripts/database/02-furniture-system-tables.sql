-- =====================================================
-- PHASE 1.2: FURNITURE MANAGEMENT SYSTEM TABLES
-- Execute this second in Supabase SQL Editor
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

-- Enable RLS on furniture tables
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_style_variations ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to active furniture categories" ON furniture_categories 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to available furniture variations" ON furniture_style_variations 
FOR SELECT USING (is_available = true);

-- Indexes for performance  
CREATE INDEX IF NOT EXISTS idx_furniture_categories_type ON furniture_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_furniture_variations_category ON furniture_style_variations(category_id);
CREATE INDEX IF NOT EXISTS idx_furniture_variations_popularity ON furniture_style_variations(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_furniture_variations_room ON furniture_style_variations USING GIN(room_types);

-- Insert sample furniture categories
INSERT INTO furniture_categories (id, name, display_name, emoji, category_type, display_order, is_active) VALUES
('a1111111-a111-4111-8111-111111111111', 'modern-sofa', 'Modern Sofa', '🛋️', 'seating', 1, true),
('b2222222-b222-4222-8222-222222222222', 'classic-chairs', 'Classic Chairs', '🪑', 'seating', 2, true),
('c3333333-c333-4333-8333-333333333333', 'dining-table', 'Dining Table', '🪑', 'tables', 3, true),
('d4444444-d444-4444-8444-444444444444', 'bed-frame', 'Bed Frame', '🛏️', 'bedroom', 4, true),
('e5555555-e555-4555-8555-555555555555', 'coffee-table', 'Coffee Table', '☕', 'tables', 5, true),
('f6666666-f666-4666-8666-666666666666', 'bookshelf', 'Bookshelf', '📚', 'storage', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample furniture style variations with mock gallery images
INSERT INTO furniture_style_variations (
    id, category_id, style_name, style_slug, description, 
    gallery_images, primary_image_url, thumbnail_url,
    price_range_min, price_range_max, popularity_score, display_order, is_available
) VALUES
-- Modern Sofa variations
('11111111-1111-4111-8111-111111111111', 'a1111111-a111-4111-8111-111111111111', 'Minimalist Modern Sofa', 'minimalist-modern-sofa', 'Clean lines with neutral tones',
 '[{"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80", "alt": "Minimalist modern sofa front view", "order": 1}, {"url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80", "alt": "Modern sofa side angle", "order": 2}]',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
 800.00, 1200.00, 85, 1, true),

('22222222-2222-4222-8222-222222222222', 'a1111111-a111-4111-8111-111111111111', 'Contemporary Sectional', 'contemporary-sectional', 'Spacious L-shaped design',
 '[{"url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80", "alt": "Contemporary sectional sofa", "order": 1}, {"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80", "alt": "Sectional from different angle", "order": 2}]',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
 1200.00, 2000.00, 75, 2, true),

-- Classic Chairs variations  
('33333333-3333-4333-8333-333333333333', 'b2222222-b222-4222-8222-222222222222', 'Vintage Leather Armchair', 'vintage-leather-armchair', 'Timeless leather with brass details',
 '[{"url": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&q=80", "alt": "Vintage leather armchair", "order": 1}]',
 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&q=80',
 400.00, 800.00, 90, 1, true),

('44444444-4444-4444-8444-444444444444', 'b2222222-b222-4222-8222-222222222222', 'Mid-Century Dining Chair', 'mid-century-dining-chair', 'Walnut wood with upholstered seat',
 '[{"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", "thumbnail": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80", "alt": "Mid-century dining chair", "order": 1}]',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
 200.00, 400.00, 80, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Furniture system tables created successfully! ✅' as status;