-- =====================================================
-- PHASE 1.1: STYLE MANAGEMENT SYSTEM TABLES
-- Execute this first in Supabase SQL Editor
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

-- Enable RLS on style tables
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_reference_images ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to active styles" ON style_categories 
FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active style images" ON style_reference_images 
FOR SELECT USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_style_categories_active ON style_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_style_reference_images_category ON style_reference_images(style_category_id);
CREATE INDEX IF NOT EXISTS idx_style_reference_images_room ON style_reference_images(room_type) WHERE room_type IS NOT NULL;

-- Insert sample style categories
INSERT INTO style_categories (id, name, slug, display_name, description, emoji, display_order, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Modern', 'modern', 'Modern', 'Clean lines and contemporary feel', '⬜', 1, true),
('22222222-2222-2222-2222-222222222222', 'Scandinavian', 'scandinavian', 'Scandinavian', 'Nordic minimalism with natural elements', '❄️', 2, true),
('33333333-3333-3333-3333-333333333333', 'Industrial', 'industrial', 'Industrial', 'Raw materials and urban aesthetics', '⚙️', 3, true),
('44444444-4444-4444-4444-444444444444', 'Traditional', 'traditional', 'Traditional', 'Classic and timeless designs', '🏛️', 4, true),
('55555555-5555-5555-5555-555555555555', 'Luxury', 'luxury', 'Luxury', 'Opulent and sophisticated styling', '💎', 5, true),
('66666666-6666-6666-6666-666666666666', 'Bohemian', 'bohemian', 'Bohemian', 'Eclectic and artistic expression', '🌸', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Style system tables created successfully! ✅' as status;