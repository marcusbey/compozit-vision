-- =========================================
-- ENHANCED CATEGORIES SYSTEM
-- =========================================
-- Version: 1.0
-- Date: 2024-12-28
-- Description: Create comprehensive categories system with admin extensibility

-- =========================================
-- 1. DROP EXISTING TABLES IF THEY EXIST
-- =========================================

DROP TABLE IF EXISTS public.category_room_mappings CASCADE;
DROP TABLE IF EXISTS public.category_style_mappings CASCADE;
DROP TABLE IF EXISTS public.project_categories CASCADE;

-- =========================================
-- 2. CREATE ENHANCED CATEGORIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.project_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Category Type (Interior, Garden, Surface, Object, Exterior)
  category_type TEXT NOT NULL CHECK (category_type IN ('interior', 'garden', 'surface', 'object', 'exterior')),
  
  -- Visual Assets
  icon_name TEXT, -- Ionicons name
  image_url TEXT, -- Hero image URL
  thumbnail_url TEXT, -- Thumbnail image URL
  color_scheme JSONB DEFAULT '{"primary": "#C9A98C", "secondary": "#B9906F"}', -- Brand colors
  
  -- Display Properties
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata for AI Processing
  ai_keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- Keywords for AI processing
  style_compatibility TEXT[] DEFAULT ARRAY[]::TEXT[], -- Compatible styles
  room_compatibility TEXT[] DEFAULT ARRAY[]::TEXT[], -- Compatible rooms
  complexity_level INTEGER DEFAULT 1 CHECK (complexity_level BETWEEN 1 AND 5), -- 1=simple, 5=expert
  
  -- Usage Statistics
  usage_count INTEGER DEFAULT 0,
  popularity_score DECIMAL(3,2) DEFAULT 0.00 CHECK (popularity_score >= 0 AND popularity_score <= 1),
  
  -- Localization Support
  localized_names JSONB DEFAULT '{}', -- {"en": "Interior Design", "es": "Diseño Interior"}
  localized_descriptions JSONB DEFAULT '{}',
  
  -- Admin Properties
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  internal_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- 3. CREATE CATEGORY-ROOM MAPPINGS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.category_room_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE CASCADE NOT NULL,
  room_slug TEXT NOT NULL, -- e.g., 'living-room', 'kitchen', 'bedroom'
  room_name TEXT NOT NULL, -- e.g., 'Living Room', 'Kitchen', 'Bedroom'
  compatibility_score DECIMAL(3,2) DEFAULT 1.00 CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  is_primary_match BOOLEAN DEFAULT false, -- Is this the main room for this category?
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, room_slug)
);

-- =========================================
-- 4. CREATE CATEGORY-STYLE MAPPINGS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.category_style_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.project_categories(id) ON DELETE CASCADE NOT NULL,
  style_slug TEXT NOT NULL, -- e.g., 'modern', 'traditional', 'minimalist'
  style_name TEXT NOT NULL, -- e.g., 'Modern', 'Traditional', 'Minimalist'
  compatibility_score DECIMAL(3,2) DEFAULT 1.00 CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
  is_recommended BOOLEAN DEFAULT false, -- Is this style recommended for this category?
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, style_slug)
);

-- =========================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =========================================

-- Primary query indexes
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.project_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.project_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.project_categories(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.project_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.project_categories(display_order, created_at);

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_categories_name_search ON public.project_categories USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_categories_description_search ON public.project_categories USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_categories_keywords ON public.project_categories USING gin(ai_keywords);

-- Mapping table indexes
CREATE INDEX IF NOT EXISTS idx_room_mappings_category ON public.category_room_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_room_mappings_room ON public.category_room_mappings(room_slug);
CREATE INDEX IF NOT EXISTS idx_room_mappings_primary ON public.category_room_mappings(is_primary_match) WHERE is_primary_match = true;

CREATE INDEX IF NOT EXISTS idx_style_mappings_category ON public.category_style_mappings(category_id);
CREATE INDEX IF NOT EXISTS idx_style_mappings_style ON public.category_style_mappings(style_slug);
CREATE INDEX IF NOT EXISTS idx_style_mappings_recommended ON public.category_style_mappings(is_recommended) WHERE is_recommended = true;

-- =========================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_room_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_style_mappings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active categories
CREATE POLICY "Anyone can view active categories"
ON public.project_categories FOR SELECT
USING (is_active = true);

-- Allow admins to manage categories
CREATE POLICY "Admins can manage categories"
ON public.project_categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@compozit.com')
  )
);

-- Allow everyone to read room mappings for active categories
CREATE POLICY "Anyone can view room mappings for active categories"
ON public.category_room_mappings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_categories 
    WHERE public.project_categories.id = category_id 
    AND public.project_categories.is_active = true
  )
);

-- Allow everyone to read style mappings for active categories
CREATE POLICY "Anyone can view style mappings for active categories"
ON public.category_style_mappings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_categories 
    WHERE public.project_categories.id = category_id 
    AND public.project_categories.is_active = true
  )
);

-- Allow admins to manage mappings
CREATE POLICY "Admins can manage room mappings"
ON public.category_room_mappings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@compozit.com')
  )
);

CREATE POLICY "Admins can manage style mappings"
ON public.category_style_mappings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@compozit.com')
  )
);

-- =========================================
-- 7. TRIGGER FUNCTIONS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at_trigger ON public.project_categories;
CREATE TRIGGER update_categories_updated_at_trigger
  BEFORE UPDATE ON public.project_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

DROP TRIGGER IF EXISTS update_room_mappings_updated_at_trigger ON public.category_room_mappings;
CREATE TRIGGER update_room_mappings_updated_at_trigger
  BEFORE UPDATE ON public.category_room_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

DROP TRIGGER IF EXISTS update_style_mappings_updated_at_trigger ON public.category_style_mappings;
CREATE TRIGGER update_style_mappings_updated_at_trigger
  BEFORE UPDATE ON public.category_style_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION increment_category_usage(p_category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.project_categories 
  SET 
    usage_count = usage_count + 1,
    popularity_score = LEAST(1.00, popularity_score + 0.01)
  WHERE id = p_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 8. HELPER FUNCTIONS
-- =========================================

-- Get categories by type
CREATE OR REPLACE FUNCTION get_categories_by_type(
  p_category_type TEXT DEFAULT NULL,
  p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  category_type TEXT,
  icon_name TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  color_scheme JSONB,
  display_order INTEGER,
  is_featured BOOLEAN,
  usage_count INTEGER,
  popularity_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.description,
    pc.category_type,
    pc.icon_name,
    pc.image_url,
    pc.thumbnail_url,
    pc.color_scheme,
    pc.display_order,
    pc.is_featured,
    pc.usage_count,
    pc.popularity_score,
    pc.created_at
  FROM public.project_categories pc
  WHERE 
    (p_category_type IS NULL OR pc.category_type = p_category_type)
    AND (p_include_inactive OR pc.is_active = true)
  ORDER BY 
    pc.is_featured DESC,
    pc.display_order ASC,
    pc.popularity_score DESC,
    pc.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get category with room and style compatibility
CREATE OR REPLACE FUNCTION get_category_details(p_category_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_category RECORD;
  v_rooms JSONB;
  v_styles JSONB;
  v_result JSONB;
BEGIN
  -- Get category details
  SELECT * INTO v_category
  FROM public.project_categories
  WHERE id = p_category_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get compatible rooms
  SELECT jsonb_agg(
    jsonb_build_object(
      'slug', room_slug,
      'name', room_name,
      'compatibility_score', compatibility_score,
      'is_primary_match', is_primary_match
    )
  ) INTO v_rooms
  FROM public.category_room_mappings
  WHERE category_id = p_category_id;
  
  -- Get compatible styles
  SELECT jsonb_agg(
    jsonb_build_object(
      'slug', style_slug,
      'name', style_name,
      'compatibility_score', compatibility_score,
      'is_recommended', is_recommended
    )
  ) INTO v_styles
  FROM public.category_style_mappings
  WHERE category_id = p_category_id;
  
  -- Build result
  v_result := jsonb_build_object(
    'id', v_category.id,
    'name', v_category.name,
    'slug', v_category.slug,
    'description', v_category.description,
    'category_type', v_category.category_type,
    'icon_name', v_category.icon_name,
    'image_url', v_category.image_url,
    'thumbnail_url', v_category.thumbnail_url,
    'color_scheme', v_category.color_scheme,
    'ai_keywords', v_category.ai_keywords,
    'complexity_level', v_category.complexity_level,
    'compatible_rooms', COALESCE(v_rooms, '[]'::jsonb),
    'compatible_styles', COALESCE(v_styles, '[]'::jsonb),
    'usage_count', v_category.usage_count,
    'popularity_score', v_category.popularity_score
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search categories
CREATE OR REPLACE FUNCTION search_categories(
  p_query TEXT,
  p_category_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  category_type TEXT,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.description,
    pc.category_type,
    (
      ts_rank(to_tsvector('english', pc.name), plainto_tsquery('english', p_query)) * 2 +
      ts_rank(to_tsvector('english', pc.description), plainto_tsquery('english', p_query)) +
      CASE WHEN p_query = ANY(pc.ai_keywords) THEN 1.5 ELSE 0 END
    )::REAL as relevance_score
  FROM public.project_categories pc
  WHERE 
    pc.is_active = true
    AND (p_category_type IS NULL OR pc.category_type = p_category_type)
    AND (
      to_tsvector('english', pc.name) @@ plainto_tsquery('english', p_query)
      OR to_tsvector('english', pc.description) @@ plainto_tsquery('english', p_query)
      OR p_query = ANY(pc.ai_keywords)
    )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 9. INSERT SAMPLE DATA
-- =========================================

-- Insert main category types
INSERT INTO public.project_categories (
  name, slug, description, category_type, icon_name, display_order, is_featured,
  ai_keywords, style_compatibility, room_compatibility, complexity_level, color_scheme
) VALUES 
  (
    'Interior Design',
    'interior-design',
    'Transform your indoor spaces with style and functionality',
    'interior',
    'home',
    1,
    true,
    ARRAY['interior', 'indoor', 'room', 'space', 'decor', 'furniture'],
    ARRAY['modern', 'traditional', 'minimalist', 'scandinavian', 'industrial'],
    ARRAY['living-room', 'bedroom', 'kitchen', 'dining-room', 'office'],
    3,
    '{"primary": "#C9A98C", "secondary": "#B9906F", "accent": "#8B7355"}'
  ),
  (
    'Garden & Landscape',
    'garden-landscape',
    'Create beautiful outdoor spaces and landscapes',
    'garden',
    'leaf',
    2,
    true,
    ARRAY['garden', 'landscape', 'outdoor', 'plants', 'patio', 'yard'],
    ARRAY['natural', 'zen', 'mediterranean', 'cottage', 'contemporary'],
    ARRAY['patio', 'garden', 'balcony', 'terrace', 'courtyard'],
    4,
    '{"primary": "#7FB069", "secondary": "#588B8B", "accent": "#4A5D23"}'
  ),
  (
    'Surface Design',
    'surface-design',
    'Focus on walls, floors, and surface treatments',
    'surface',
    'square',
    3,
    false,
    ARRAY['walls', 'floors', 'tiles', 'paint', 'wallpaper', 'texture'],
    ARRAY['textured', 'smooth', 'patterned', 'geometric', 'organic'],
    ARRAY['bathroom', 'kitchen', 'hallway', 'accent-wall'],
    2,
    '{"primary": "#D4A574", "secondary": "#C9A98C", "accent": "#B8935F"}'
  ),
  (
    'Object Styling',
    'object-styling',
    'Curate and style individual pieces and collections',
    'object',
    'cube',
    4,
    false,
    ARRAY['objects', 'styling', 'accessories', 'art', 'decor', 'collections'],
    ARRAY['eclectic', 'curated', 'artistic', 'themed', 'seasonal'],
    ARRAY['shelving', 'mantels', 'tables', 'displays'],
    2,
    '{"primary": "#E07A5F", "secondary": "#F4A261", "accent": "#E76F51"}'
  ),
  (
    'Exterior Design',
    'exterior-design',
    'Enhance your home\'s curb appeal and outdoor aesthetics',
    'exterior',
    'business',
    5,
    false,
    ARRAY['exterior', 'facade', 'curb-appeal', 'entrance', 'outdoor'],
    ARRAY['traditional', 'modern', 'craftsman', 'colonial', 'contemporary'],
    ARRAY['front-yard', 'entrance', 'porch', 'driveway'],
    5,
    '{"primary": "#264653", "secondary": "#2A9D8F", "accent": "#1D3557"}'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert room mappings for Interior Design
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  room.slug,
  room.name,
  room.score,
  room.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('living-room', 'Living Room', 1.00, true),
    ('bedroom', 'Bedroom', 1.00, true),
    ('kitchen', 'Kitchen', 1.00, true),
    ('dining-room', 'Dining Room', 1.00, true),
    ('office', 'Home Office', 0.95, false),
    ('bathroom', 'Bathroom', 0.90, false),
    ('hallway', 'Hallway', 0.80, false),
    ('closet', 'Closet', 0.75, false)
) AS room(slug, name, score, primary_match)
WHERE pc.slug = 'interior-design'
ON CONFLICT (category_id, room_slug) DO NOTHING;

-- Insert style mappings for Interior Design
INSERT INTO public.category_style_mappings (category_id, style_slug, style_name, compatibility_score, is_recommended)
SELECT 
  pc.id,
  style.slug,
  style.name,
  style.score,
  style.recommended
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('modern', 'Modern', 1.00, true),
    ('traditional', 'Traditional', 1.00, true),
    ('minimalist', 'Minimalist', 0.95, true),
    ('scandinavian', 'Scandinavian', 0.95, true),
    ('industrial', 'Industrial', 0.90, false),
    ('bohemian', 'Bohemian', 0.85, false),
    ('rustic', 'Rustic', 0.85, false),
    ('contemporary', 'Contemporary', 0.90, false)
) AS style(slug, name, score, recommended)
WHERE pc.slug = 'interior-design'
ON CONFLICT (category_id, style_slug) DO NOTHING;

-- =========================================
-- 10. GRANT PERMISSIONS
-- =========================================

-- Grant necessary permissions
GRANT SELECT ON public.project_categories TO authenticated;
GRANT SELECT ON public.category_room_mappings TO authenticated;
GRANT SELECT ON public.category_style_mappings TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_categories_by_type(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_categories(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_category_usage(UUID) TO authenticated;

-- =========================================
-- SETUP COMPLETE
-- =========================================

SELECT 'Enhanced categories system created successfully!' AS result;

-- Test the functions
SELECT 'Testing categories by type...' AS test_status;
SELECT COUNT(*) as interior_categories 
FROM get_categories_by_type('interior');

SELECT 'Testing category details...' AS test_status;
SELECT get_category_details(id) as category_details
FROM public.project_categories 
WHERE slug = 'interior-design'
LIMIT 1;

-- =========================================
-- NEXT STEPS:
-- =========================================
-- 1. Create CategorySelectionScreen UI component
-- 2. Integrate with contentStore for category management
-- 3. Add category selection to project wizard flow
-- 4. Implement admin interface for category management
-- 5. Add category analytics and usage tracking