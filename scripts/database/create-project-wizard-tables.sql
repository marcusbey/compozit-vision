-- Project Creation Wizard Database Tables
-- This script creates all the taxonomy tables needed for the project wizard flow

-- Categories table (Interior, Garden, Surface Change, etc.)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50), -- Icon reference for UI
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms/Spaces table (Living Room, Bedroom, Kitchen, etc.)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    icon_name VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design Styles table (Modern, Traditional, Minimalist, etc.)
CREATE TABLE IF NOT EXISTS public.design_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    mood_tags TEXT[], -- Array of mood descriptors
    color_palette JSONB, -- Primary colors associated with this style
    illustration_url VARCHAR(500), -- URL to style illustration
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference Images table (inspiration gallery)
CREATE TABLE IF NOT EXISTS public.reference_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    style_id UUID REFERENCES public.design_styles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    tags TEXT[], -- Array of descriptive tags
    color_palette JSONB, -- Extracted color palette
    is_featured BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Color Palettes table (predefined color schemes)
CREATE TABLE IF NOT EXISTS public.color_palettes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    colors JSONB NOT NULL, -- Array of hex color codes
    style_id UUID REFERENCES public.design_styles(id) ON DELETE CASCADE,
    preview_image_url VARCHAR(500), -- Preview image showing the palette
    is_trending BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (enhanced to track wizard selections)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Project wizard selections
    category_id UUID REFERENCES public.categories(id),
    room_id UUID REFERENCES public.rooms(id),
    style_id UUID REFERENCES public.design_styles(id),
    selected_references UUID[], -- Array of reference_images IDs
    selected_palette_id UUID REFERENCES public.color_palettes(id),
    custom_colors JSONB, -- User-uploaded color palette
    
    -- Project images
    original_image_url VARCHAR(500),
    processed_image_url VARCHAR(500),
    result_images JSONB, -- Array of generated design URLs
    
    -- Project metadata
    budget_range VARCHAR(50),
    custom_prompt TEXT,
    ai_processing_status VARCHAR(50) DEFAULT 'pending',
    ai_processing_result JSONB,
    
    -- Timestamps and status
    status VARCHAR(50) DEFAULT 'draft', -- draft, processing, completed, archived
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Insert default categories
INSERT INTO public.categories (name, display_name, description, icon_name, sort_order) VALUES
('interior', 'Interior Design', 'Transform interior spaces with furniture and decor', 'home', 1),
('garden', 'Garden & Outdoor', 'Design outdoor spaces, patios, and gardens', 'leaf', 2),
('surface', 'Surface Changes', 'Update walls, floors, and architectural elements', 'color-palette', 3),
('renovation', 'Full Renovation', 'Complete space transformation and renovation', 'hammer', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default rooms for interior category
INSERT INTO public.rooms (name, display_name, description, category_id, icon_name, sort_order) VALUES
('living_room', 'Living Room', 'Main gathering space for relaxation and entertainment', (SELECT id FROM public.categories WHERE name = 'interior'), 'tv', 1),
('bedroom', 'Bedroom', 'Personal sleeping and relaxation space', (SELECT id FROM public.categories WHERE name = 'interior'), 'bed', 2),
('kitchen', 'Kitchen', 'Cooking and dining preparation area', (SELECT id FROM public.categories WHERE name = 'interior'), 'restaurant', 3),
('dining_room', 'Dining Room', 'Formal dining and entertainment space', (SELECT id FROM public.categories WHERE name = 'interior'), 'wine', 4),
('bathroom', 'Bathroom', 'Personal care and hygiene space', (SELECT id FROM public.categories WHERE name = 'interior'), 'water', 5),
('office', 'Home Office', 'Work and productivity space', (SELECT id FROM public.categories WHERE name = 'interior'), 'briefcase', 6),
('guest_room', 'Guest Room', 'Accommodation space for visitors', (SELECT id FROM public.categories WHERE name = 'interior'), 'person-add', 7),
('kids_room', 'Kids Room', 'Playful space for children', (SELECT id FROM public.categories WHERE name = 'interior'), 'happy', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default design styles
INSERT INTO public.design_styles (name, display_name, description, mood_tags, color_palette, is_popular, sort_order) VALUES
('modern', 'Modern', 'Clean lines, minimalist approach, and contemporary elements', ARRAY['sleek', 'contemporary', 'minimalist'], '{"primary": "#2D2D2D", "secondary": "#FFFFFF", "accent": "#C9A98C"}', true, 1),
('traditional', 'Traditional', 'Classic elegance with timeless furniture and warm colors', ARRAY['classic', 'elegant', 'timeless'], '{"primary": "#8B4513", "secondary": "#F5F5DC", "accent": "#DAA520"}', true, 2),
('minimalist', 'Minimalist', 'Less is more philosophy with clean, uncluttered spaces', ARRAY['clean', 'simple', 'serene'], '{"primary": "#FFFFFF", "secondary": "#F8F8F8", "accent": "#000000"}', true, 3),
('industrial', 'Industrial', 'Raw materials, exposed elements, and urban aesthetics', ARRAY['urban', 'raw', 'edgy'], '{"primary": "#4A4A4A", "secondary": "#D2691E", "accent": "#CD853F"}', false, 4),
('scandinavian', 'Scandinavian', 'Light woods, neutral colors, and functional design', ARRAY['cozy', 'light', 'functional'], '{"primary": "#F5F5F5", "secondary": "#D2B48C", "accent": "#2F4F4F"}', true, 5),
('bohemian', 'Bohemian', 'Eclectic mix of patterns, textures, and global influences', ARRAY['eclectic', 'artistic', 'colorful'], '{"primary": "#8B4513", "secondary": "#DEB887", "accent": "#DC143C"}', false, 6),
('contemporary', 'Contemporary', 'Current trends with sleek finishes and bold accents', ARRAY['current', 'sleek', 'bold'], '{"primary": "#708090", "secondary": "#F0F8FF", "accent": "#4169E1"}', false, 7),
('rustic', 'Rustic', 'Natural materials with cozy, countryside charm', ARRAY['natural', 'cozy', 'countryside'], '{"primary": "#8B4513", "secondary": "#F5DEB3", "accent": "#A0522D"}', false, 8)
ON CONFLICT (name) DO NOTHING;

-- Insert sample color palettes
INSERT INTO public.color_palettes (name, display_name, description, colors, style_id, is_trending, sort_order) VALUES
('neutral_warm', 'Warm Neutrals', 'Cozy beige and cream tones', '{"colors": ["#F5F5DC", "#DEB887", "#D2B48C", "#BC9A6A"]}', (SELECT id FROM public.design_styles WHERE name = 'traditional'), true, 1),
('monochrome', 'Modern Monochrome', 'Classic black, white, and gray', '{"colors": ["#000000", "#808080", "#C0C0C0", "#FFFFFF"]}', (SELECT id FROM public.design_styles WHERE name = 'modern'), true, 2),
('earth_tones', 'Earth Tones', 'Natural browns and greens', '{"colors": ["#8B4513", "#A0522D", "#228B22", "#6B8E23"]}', (SELECT id FROM public.design_styles WHERE name = 'rustic'), false, 3),
('coastal_blues', 'Coastal Blues', 'Ocean-inspired blue and white palette', '{"colors": ["#4682B4", "#87CEEB", "#F0F8FF", "#FFFFFF"]}', (SELECT id FROM public.design_styles WHERE name = 'contemporary'), false, 4)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_styles_popular ON public.design_styles(is_popular, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_references_style_room ON public.reference_images(style_id, room_id, is_active);
CREATE INDEX IF NOT EXISTS idx_palettes_style ON public.color_palettes(style_id, is_trending, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status, created_at DESC);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop existing ones first to avoid conflicts)
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_design_styles_updated_at ON public.design_styles;
CREATE TRIGGER update_design_styles_updated_at BEFORE UPDATE ON public.design_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reference_images_updated_at ON public.reference_images;
CREATE TRIGGER update_reference_images_updated_at BEFORE UPDATE ON public.reference_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_color_palettes_updated_at ON public.color_palettes;
CREATE TRIGGER update_color_palettes_updated_at BEFORE UPDATE ON public.color_palettes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access on taxonomies
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Rooms are publicly readable" ON public.rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Design styles are publicly readable" ON public.design_styles FOR SELECT USING (is_active = true);
CREATE POLICY "Reference images are publicly readable" ON public.reference_images FOR SELECT USING (is_active = true);
CREATE POLICY "Color palettes are publicly readable" ON public.color_palettes FOR SELECT USING (is_active = true);

-- Create RLS policies for projects (user-specific)
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);