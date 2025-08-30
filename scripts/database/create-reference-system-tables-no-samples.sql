-- =========================================
-- REFERENCE LIBRARY & COLOR EXTRACTION SYSTEM
-- Database Schema Migration (WITHOUT SAMPLE DATA)
-- =========================================
-- Version: 1.2
-- Date: 2024-12-28
-- Fix: Removed sample data that requires non-existent user

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================
-- 1. ENHANCED CATEGORIES TABLE
-- =========================================
-- Drop existing table if it exists (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS public.project_categories CASCADE;

CREATE TABLE public.project_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Category identification
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9_-]+$'), -- URL-safe slug
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  
  -- Category metadata
  description TEXT,
  icon_name TEXT, -- Ionicon name for mobile UI
  color_hex TEXT DEFAULT '#C9A98C',
  
  -- Category properties
  tags TEXT[] DEFAULT '{}',
  supported_spaces TEXT[] DEFAULT '{}', -- Which rooms/spaces this category applies to
  
  -- AI/ML properties
  ai_keywords TEXT[] DEFAULT '{}', -- Keywords for auto-detection
  detection_confidence DECIMAL DEFAULT 0.0, -- How well AI can detect this category
  
  -- Admin/Content Management
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Extensibility
  metadata JSONB DEFAULT '{}', -- For future extensions
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.project_categories (slug, name, display_name, description, icon_name, supported_spaces, ai_keywords, sort_order, is_featured) VALUES
('interior', 'Interior', 'Interior Design', 'Transform indoor living spaces with furniture and decor', 'home', ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom', 'dining_room', 'office'], ARRAY['interior', 'indoor', 'room', 'furniture', 'decor'], 1, true),
('garden', 'Garden', 'Garden & Outdoor', 'Design and beautify outdoor spaces and gardens', 'leaf', ARRAY['garden', 'patio', 'balcony', 'backyard', 'outdoor'], ARRAY['garden', 'outdoor', 'landscape', 'plants', 'patio'], 2, true),
('surface_change', 'Surface Change', 'Wall & Floor Updates', 'Update walls, floors, and surface materials', 'layers', ARRAY['any'], ARRAY['wall', 'floor', 'paint', 'tile', 'surface', 'flooring'], 3, false),
('object_replace', 'Object Replace', 'Object Replacement', 'Replace or modify specific objects in a space', 'swap-horizontal', ARRAY['any'], ARRAY['replace', 'object', 'furniture', 'swap', 'change'], 4, false),
('exterior', 'Exterior', 'Exterior Design', 'Enhance building exteriors and facades', 'business', ARRAY['exterior', 'facade', 'entrance'], ARRAY['exterior', 'facade', 'building', 'outside', 'front'], 5, false);

-- =========================================
-- 2. USER REFERENCE IMAGES TABLE
-- =========================================
-- Drop if exists to start fresh
DROP TABLE IF EXISTS public.user_reference_images CASCADE;

CREATE TABLE public.user_reference_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID, -- Can be NULL for global user references
  
  -- Image metadata
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Image properties
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- in bytes
  mime_type TEXT DEFAULT 'image/jpeg',
  
  -- User metadata
  user_title TEXT,
  user_description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Color analysis (automatically extracted)
  dominant_colors JSONB, -- {"primary": "#hex", "secondary": "#hex", "palette": ["#hex1", "#hex2", ...]}
  color_palette_id UUID, -- Reference to generated palette (if user saves it)
  
  -- AI analysis results
  ai_description TEXT,
  style_tags TEXT[] DEFAULT '{}', -- AI-detected styles
  mood_tags TEXT[] DEFAULT '{}', -- AI-detected moods
  detected_objects TEXT[] DEFAULT '{}', -- AI-detected objects
  
  -- Categorization
  category_id UUID REFERENCES public.project_categories(id),
  space_types TEXT[] DEFAULT '{}', -- Which spaces this reference applies to
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Processing status
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_reference_images_user_id ON public.user_reference_images(user_id);
CREATE INDEX idx_user_reference_images_project_id ON public.user_reference_images(project_id);
CREATE INDEX idx_user_reference_images_category ON public.user_reference_images(category_id);
CREATE INDEX idx_user_reference_images_tags ON public.user_reference_images USING GIN(tags);
CREATE INDEX idx_user_reference_images_style_tags ON public.user_reference_images USING GIN(style_tags);
CREATE INDEX idx_user_reference_images_favorite ON public.user_reference_images(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_user_reference_images_space_types ON public.user_reference_images USING GIN(space_types);

-- =========================================
-- 3. USER COLOR PALETTES TABLE (FIXED)
-- =========================================
-- Drop if exists to start fresh
DROP TABLE IF EXISTS public.user_color_palettes CASCADE;

CREATE TABLE public.user_color_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Palette metadata
  name TEXT NOT NULL,
  description TEXT,
  
  -- Colors (structured JSONB)
  colors JSONB NOT NULL, -- {"primary": "#hex", "secondary": "#hex", "accent": "#hex", "colors": ["#hex1", "#hex2", ...], "harmony": "complementary|analogous|triadic"}
  
  -- Source information
  source_type TEXT DEFAULT 'user_created' CHECK (source_type IN ('user_created', 'extracted', 'preset', 'ai_generated')),
  source_reference_id UUID, -- Will be FK after user_reference_images is created
  
  -- Categorization and compatibility
  tags TEXT[] DEFAULT '{}',
  mood_tags TEXT[] DEFAULT '{}', -- warm, cool, energetic, calm, etc.
  style_compatibility TEXT[] DEFAULT '{}', -- Compatible design styles
  space_compatibility TEXT[] DEFAULT '{}', -- Which spaces this palette works well in
  
  -- Color theory properties
  color_temperature TEXT CHECK (color_temperature IN ('warm', 'cool', 'neutral')),
  brightness_level TEXT CHECK (brightness_level IN ('dark', 'medium', 'light')),
  saturation_level TEXT CHECK (saturation_level IN ('muted', 'moderate', 'vibrant')),
  
  -- Usage and popularity
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  popularity_score DECIMAL DEFAULT 0.0, -- Calculated based on usage and ratings
  
  -- User preferences
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Can other users see this palette?
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  
  -- FIXED: Added missing sort_order column
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK constraint after user_reference_images exists
ALTER TABLE public.user_color_palettes 
  ADD CONSTRAINT fk_source_reference 
  FOREIGN KEY (source_reference_id) 
  REFERENCES public.user_reference_images(id) 
  ON DELETE SET NULL;

-- Indexes for color palettes
CREATE INDEX idx_user_color_palettes_user_id ON public.user_color_palettes(user_id);
CREATE INDEX idx_user_color_palettes_source_ref ON public.user_color_palettes(source_reference_id);
CREATE INDEX idx_user_color_palettes_favorite ON public.user_color_palettes(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_user_color_palettes_public ON public.user_color_palettes(is_public) WHERE is_public = true;
CREATE INDEX idx_user_color_palettes_tags ON public.user_color_palettes USING GIN(tags);
CREATE INDEX idx_user_color_palettes_style_compat ON public.user_color_palettes USING GIN(style_compatibility);
CREATE INDEX idx_user_color_palettes_space_compat ON public.user_color_palettes USING GIN(space_compatibility);

-- =========================================
-- 4. REFERENCE USAGE HISTORY TABLE
-- =========================================
-- Drop if exists to start fresh
DROP TABLE IF EXISTS public.reference_usage_history CASCADE;

CREATE TABLE public.reference_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID, -- Can be NULL for non-project usage
  
  -- Reference details
  reference_type TEXT NOT NULL CHECK (reference_type IN ('image', 'palette', 'style')),
  reference_id UUID NOT NULL, -- References either user_reference_images.id, user_color_palettes.id, or design_styles.id
  
  -- Usage context
  used_in_step TEXT, -- Which wizard step it was used in
  influence_weight DECIMAL DEFAULT 0.5 CHECK (influence_weight >= 0.0 AND influence_weight <= 1.0), -- How much it influenced the design
  usage_context JSONB DEFAULT '{}', -- Additional context about how it was used
  
  -- Results
  resulted_in_design BOOLEAN DEFAULT false,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5), -- User rating of the result
  
  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for usage history
CREATE INDEX idx_reference_usage_history_user_id ON public.reference_usage_history(user_id);
CREATE INDEX idx_reference_usage_history_project_id ON public.reference_usage_history(project_id);
CREATE INDEX idx_reference_usage_history_reference ON public.reference_usage_history(reference_type, reference_id);
CREATE INDEX idx_reference_usage_history_used_at ON public.reference_usage_history(used_at DESC);

-- =========================================
-- 5. AI PROCESSING JOBS TABLE
-- =========================================
-- Drop if exists to start fresh
DROP TABLE IF EXISTS public.ai_processing_jobs CASCADE;

CREATE TABLE public.ai_processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID,
  
  -- Job identification
  job_type TEXT NOT NULL CHECK (job_type IN ('design_generation', 'image_analysis', 'color_extraction', 'style_detection')),
  job_name TEXT,
  
  -- Job input data
  input_data JSONB NOT NULL, -- All the input parameters for the job
  
  -- Processing details
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step TEXT, -- Human-readable current processing step
  
  -- Results
  output_data JSONB, -- Results when completed
  result_urls TEXT[], -- URLs to generated images or other outputs
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Performance tracking
  estimated_duration_ms INTEGER, -- Estimated processing time in milliseconds
  actual_duration_ms INTEGER, -- Actual processing time
  
  -- Priority and scheduling
  priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for AI jobs
CREATE INDEX idx_ai_processing_jobs_user_id ON public.ai_processing_jobs(user_id);
CREATE INDEX idx_ai_processing_jobs_project_id ON public.ai_processing_jobs(project_id);
CREATE INDEX idx_ai_processing_jobs_status ON public.ai_processing_jobs(status);
CREATE INDEX idx_ai_processing_jobs_priority ON public.ai_processing_jobs(priority DESC, created_at ASC);
CREATE INDEX idx_ai_processing_jobs_scheduled ON public.ai_processing_jobs(scheduled_at) WHERE status = 'queued';

-- =========================================
-- 6. USER FAVORITES TABLE (UNIFIED FAVORITES SYSTEM)
-- =========================================
-- Drop if exists to start fresh
DROP TABLE IF EXISTS public.user_favorites CASCADE;

CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Favorited item details
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('reference_image', 'color_palette', 'design_style', 'category', 'preset_palette')),
  favorite_id UUID NOT NULL, -- References the favorited item
  
  -- Metadata
  notes TEXT, -- User's personal notes about this favorite
  tags TEXT[] DEFAULT '{}', -- User's custom tags
  
  -- Organization
  folder_name TEXT DEFAULT 'Default', -- User can organize favorites into folders
  sort_order INTEGER DEFAULT 0, -- Custom ordering within folders
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX idx_user_favorites_unique ON public.user_favorites(user_id, favorite_type, favorite_id);

-- Indexes for favorites
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_type ON public.user_favorites(user_id, favorite_type);
CREATE INDEX idx_user_favorites_folder ON public.user_favorites(user_id, folder_name);

-- =========================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =========================================

-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all relevant tables
DROP TRIGGER IF EXISTS update_project_categories_updated_at ON public.project_categories;
CREATE TRIGGER update_project_categories_updated_at
    BEFORE UPDATE ON public.project_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_reference_images_updated_at ON public.user_reference_images;
CREATE TRIGGER update_user_reference_images_updated_at
    BEFORE UPDATE ON public.user_reference_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_color_palettes_updated_at ON public.user_color_palettes;
CREATE TRIGGER update_user_color_palettes_updated_at
    BEFORE UPDATE ON public.user_color_palettes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_processing_jobs_updated_at ON public.ai_processing_jobs;
CREATE TRIGGER update_ai_processing_jobs_updated_at
    BEFORE UPDATE ON public.ai_processing_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_favorites_updated_at ON public.user_favorites;
CREATE TRIGGER update_user_favorites_updated_at
    BEFORE UPDATE ON public.user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.project_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Categories are insertable by service role" ON public.project_categories
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Categories are updatable by service role" ON public.project_categories
    FOR UPDATE USING (auth.role() = 'service_role');

-- Reference Images (user owns their data)
CREATE POLICY "Users can view own reference images" ON public.user_reference_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reference images" ON public.user_reference_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reference images" ON public.user_reference_images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reference images" ON public.user_reference_images
    FOR DELETE USING (auth.uid() = user_id);

-- Color Palettes (user owns their data + public palettes viewable)
CREATE POLICY "Users can view own and public color palettes" ON public.user_color_palettes
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own color palettes" ON public.user_color_palettes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own color palettes" ON public.user_color_palettes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own color palettes" ON public.user_color_palettes
    FOR DELETE USING (auth.uid() = user_id);

-- Usage History (user owns their data)
CREATE POLICY "Users can view own usage history" ON public.reference_usage_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage history" ON public.reference_usage_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Processing Jobs (user owns their jobs)
CREATE POLICY "Users can view own AI jobs" ON public.ai_processing_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI jobs" ON public.ai_processing_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI jobs" ON public.ai_processing_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- User Favorites (user owns their favorites)
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- 9. HELPFUL DATABASE FUNCTIONS
-- =========================================

-- Function to get user's favorite references
CREATE OR REPLACE FUNCTION get_user_favorite_references(p_user_id UUID)
RETURNS TABLE (
    reference_id UUID,
    reference_type TEXT,
    title TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.favorite_id,
        f.favorite_type,
        COALESCE(ri.user_title, ri.original_filename, cp.name) as title,
        ri.thumbnail_url,
        f.created_at
    FROM public.user_favorites f
    LEFT JOIN public.user_reference_images ri ON f.favorite_id = ri.id AND f.favorite_type = 'reference_image'
    LEFT JOIN public.user_color_palettes cp ON f.favorite_id = cp.id AND f.favorite_type = 'color_palette'
    WHERE f.user_id = p_user_id
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update usage statistics
CREATE OR REPLACE FUNCTION update_reference_usage_stats(
    p_reference_type TEXT,
    p_reference_id UUID
) RETURNS VOID AS $$
BEGIN
    IF p_reference_type = 'image' THEN
        UPDATE public.user_reference_images 
        SET times_used = times_used + 1, last_used_at = NOW()
        WHERE id = p_reference_id;
    ELSIF p_reference_type = 'palette' THEN
        UPDATE public.user_color_palettes 
        SET times_used = times_used + 1, last_used_at = NOW()
        WHERE id = p_reference_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 10. PRESET COLOR PALETTES TABLE (System-managed)
-- =========================================
-- Create a separate table for preset palettes that don't require user_id
DROP TABLE IF EXISTS public.preset_color_palettes CASCADE;

CREATE TABLE public.preset_color_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Palette metadata
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Colors
  colors JSONB NOT NULL,
  
  -- Properties
  style_compatibility TEXT[] DEFAULT '{}',
  space_compatibility TEXT[] DEFAULT '{}',
  color_temperature TEXT CHECK (color_temperature IN ('warm', 'cool', 'neutral')),
  brightness_level TEXT CHECK (brightness_level IN ('dark', 'medium', 'light')),
  saturation_level TEXT CHECK (saturation_level IN ('muted', 'moderate', 'vibrant')),
  
  -- Display properties
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert preset palettes (system-managed, no user_id required)
INSERT INTO public.preset_color_palettes (
    name, 
    display_name,
    description, 
    colors, 
    style_compatibility, 
    space_compatibility,
    color_temperature,
    brightness_level,
    saturation_level,
    is_featured,
    sort_order
) VALUES 
-- Modern Neutral Palette
('modern_neutral',
 'Modern Neutral', 
 'Clean and sophisticated neutral tones perfect for modern interiors',
 '{"primary": "#F5F5F5", "secondary": "#E8E8E8", "accent": "#C9A98C", "colors": ["#FFFFFF", "#F5F5F5", "#E8E8E8", "#D3D3D3", "#C9A98C"]}',
 ARRAY['modern', 'minimalist', 'scandinavian'],
 ARRAY['living_room', 'bedroom', 'office'],
 'neutral',
 'light',
 'muted',
 true,
 1),

-- Warm Cozy Palette
('warm_cozy',
 'Warm Cozy',
 'Inviting warm tones that create a cozy atmosphere',
 '{"primary": "#D4A574", "secondary": "#B8935F", "accent": "#8B4513", "colors": ["#F4E4BC", "#D4A574", "#B8935F", "#A0522D", "#8B4513"]}',
 ARRAY['traditional', 'rustic', 'bohemian'],
 ARRAY['living_room', 'bedroom', 'dining_room'],
 'warm',
 'medium',
 'moderate',
 true,
 2),

-- Cool Calm Palette  
('cool_calm',
 'Cool Calm',
 'Peaceful blues and greens for a serene environment',
 '{"primary": "#E8F4F8", "secondary": "#B8D8E0", "accent": "#5A9FB8", "colors": ["#F0F8FF", "#E8F4F8", "#B8D8E0", "#7BB3C0", "#5A9FB8"]}',
 ARRAY['coastal', 'contemporary', 'minimalist'],
 ARRAY['bedroom', 'bathroom', 'office'],
 'cool',
 'light',
 'muted',
 true,
 3);

-- Enable RLS on preset palettes table
ALTER TABLE public.preset_color_palettes ENABLE ROW LEVEL SECURITY;

-- Everyone can view active preset palettes
CREATE POLICY "Preset palettes are viewable by everyone" ON public.preset_color_palettes
    FOR SELECT USING (is_active = true);

-- Only service role can manage preset palettes
CREATE POLICY "Preset palettes are managed by service role" ON public.preset_color_palettes
    FOR ALL USING (auth.role() = 'service_role');

-- Update trigger for preset palettes
DROP TRIGGER IF EXISTS update_preset_color_palettes_updated_at ON public.preset_color_palettes;
CREATE TRIGGER update_preset_color_palettes_updated_at
    BEFORE UPDATE ON public.preset_color_palettes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.preset_color_palettes TO anon, authenticated;

-- =========================================
-- GRANT PERMISSIONS
-- =========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.project_categories TO anon, authenticated;
GRANT ALL ON public.user_reference_images TO authenticated;
GRANT ALL ON public.user_color_palettes TO authenticated;
GRANT ALL ON public.reference_usage_history TO authenticated;
GRANT ALL ON public.ai_processing_jobs TO authenticated;
GRANT ALL ON public.user_favorites TO authenticated;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

SELECT 'Reference Library & Color Extraction System - Database Schema Created Successfully!' AS result;