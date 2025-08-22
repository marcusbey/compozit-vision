-- Migration for Enhanced AI Processing Core Infrastructure
-- Creates tables for space analysis, style references, and enhanced generation

-- Space Analysis Table
CREATE TABLE IF NOT EXISTS space_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    processed_image_url TEXT,
    room_type TEXT NOT NULL CHECK (room_type IN (
        'living_room', 'bedroom', 'dining_room', 'kitchen', 
        'bathroom', 'office', 'outdoor', 'entryway', 'kids_room'
    )),
    room_type_confidence DECIMAL(3,2) NOT NULL CHECK (room_type_confidence >= 0 AND room_type_confidence <= 1),
    dimensions JSONB,
    existing_furniture JSONB NOT NULL DEFAULT '[]',
    spatial_features JSONB NOT NULL DEFAULT '{}',
    style_analysis JSONB NOT NULL DEFAULT '{}',
    lighting_analysis JSONB NOT NULL DEFAULT '{}',
    color_palette JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    analysis_metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for space_analyses
CREATE INDEX idx_space_analyses_user_id ON space_analyses(user_id);
CREATE INDEX idx_space_analyses_project_id ON space_analyses(project_id);
CREATE INDEX idx_space_analyses_room_type ON space_analyses(room_type);
CREATE INDEX idx_space_analyses_status ON space_analyses(status);
CREATE INDEX idx_space_analyses_created_at ON space_analyses(created_at DESC);

-- Style References Table
CREATE TABLE IF NOT EXISTS style_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'modern', 'traditional', 'eclectic', 'minimalist', 
        'industrial', 'scandinavian', 'bohemian'
    )),
    characteristic_tags TEXT[] NOT NULL DEFAULT '{}',
    color_palettes JSONB NOT NULL DEFAULT '[]',
    furniture_styles JSONB NOT NULL DEFAULT '[]',
    ambiance_options JSONB NOT NULL DEFAULT '[]',
    room_examples JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for style_references
CREATE INDEX idx_style_references_category ON style_references(category);
CREATE INDEX idx_style_references_is_active ON style_references(is_active);
CREATE INDEX idx_style_references_slug ON style_references(slug);

-- Ambiance Options Table
CREATE TABLE IF NOT EXISTS ambiance_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    mood_tags TEXT[] NOT NULL DEFAULT '{}',
    lighting_preset TEXT NOT NULL,
    color_adjustment TEXT NOT NULL,
    texture_emphasis TEXT NOT NULL,
    preview_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for ambiance_options
CREATE INDEX idx_ambiance_options_name ON ambiance_options(name);

-- Enhanced Generation Results Table
CREATE TABLE IF NOT EXISTS enhanced_generation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    space_analysis_id UUID NOT NULL REFERENCES space_analyses(id) ON DELETE CASCADE,
    generated_image_url TEXT NOT NULL,
    style_applied JSONB NOT NULL DEFAULT '{}',
    furniture_proposed JSONB NOT NULL DEFAULT '[]',
    estimated_cost JSONB NOT NULL DEFAULT '{}',
    quality_metrics JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )),
    processing_time INTEGER DEFAULT 0, -- milliseconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for enhanced_generation_results
CREATE INDEX idx_generation_results_user_id ON enhanced_generation_results(user_id);
CREATE INDEX idx_generation_results_space_analysis_id ON enhanced_generation_results(space_analysis_id);
CREATE INDEX idx_generation_results_status ON enhanced_generation_results(status);
CREATE INDEX idx_generation_results_created_at ON enhanced_generation_results(created_at DESC);

-- Furniture Categories Extension (add room compatibility)
ALTER TABLE furniture_categories ADD COLUMN IF NOT EXISTS room_compatibility JSONB DEFAULT '[]';

-- Style Reference - Furniture Category Mapping (many-to-many)
CREATE TABLE IF NOT EXISTS style_furniture_categories (
    style_reference_id UUID NOT NULL REFERENCES style_references(id) ON DELETE CASCADE,
    furniture_category_id UUID NOT NULL REFERENCES furniture_categories(id) ON DELETE CASCADE,
    characteristics TEXT[] NOT NULL DEFAULT '{}',
    materials TEXT[] NOT NULL DEFAULT '{}',
    shapes TEXT[] NOT NULL DEFAULT '{}',
    importance_score DECIMAL(3,2) DEFAULT 1.0,
    PRIMARY KEY (style_reference_id, furniture_category_id)
);

-- User Style Preferences (track user interactions)
CREATE TABLE IF NOT EXISTS user_style_preferences (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    style_reference_id UUID NOT NULL REFERENCES style_references(id) ON DELETE CASCADE,
    preference_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (preference_score >= 0 AND preference_score <= 1),
    interaction_count INTEGER NOT NULL DEFAULT 1,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, style_reference_id)
);

-- Space Analysis Statistics View
CREATE OR REPLACE VIEW space_analysis_stats AS
SELECT 
    user_id,
    COUNT(*) as total_analyses,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_analyses,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_analyses,
    mode() WITHIN GROUP (ORDER BY room_type) as most_analyzed_room_type,
    AVG(room_type_confidence) as avg_confidence,
    MIN(created_at) as first_analysis,
    MAX(created_at) as last_analysis
FROM space_analyses
GROUP BY user_id;

-- Style Popularity View
CREATE OR REPLACE VIEW style_popularity AS
SELECT 
    sr.id as style_id,
    sr.name as style_name,
    sr.category,
    COUNT(egr.id) as usage_count,
    COUNT(egr.id) FILTER (WHERE egr.status = 'completed') as successful_generations,
    CASE 
        WHEN COUNT(egr.id) > 0 
        THEN ROUND(COUNT(egr.id) FILTER (WHERE egr.status = 'completed')::decimal / COUNT(egr.id), 3)
        ELSE 0 
    END as success_rate,
    AVG((egr.quality_metrics->>'overall_score')::decimal) as avg_quality_score
FROM style_references sr
LEFT JOIN enhanced_generation_results egr ON sr.id = (egr.style_applied->>'style_reference_id')::uuid
WHERE sr.is_active = true
GROUP BY sr.id, sr.name, sr.category
ORDER BY usage_count DESC;

-- Room Type Distribution View
CREATE OR REPLACE VIEW room_type_distribution AS
SELECT 
    room_type,
    COUNT(*) as analysis_count,
    ROUND(COUNT(*)::decimal / SUM(COUNT(*)) OVER () * 100, 2) as percentage,
    AVG(room_type_confidence) as avg_confidence,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count
FROM space_analyses
GROUP BY room_type
ORDER BY analysis_count DESC;

-- Insert default style references
INSERT INTO style_references (name, slug, description, category, characteristic_tags, color_palettes, furniture_styles) VALUES
('Modern Minimalist', 'modern-minimalist', 'Clean lines, neutral colors, and functional furniture define this contemporary style.', 'modern', 
 ARRAY['clean', 'minimal', 'functional', 'geometric'], 
 '[{"name": "Neutral Base", "primary_colors": [{"hex": "#FFFFFF", "rgb": {"r": 255, "g": 255, "b": 255}, "name": "White", "prominence": 0.4}], "accent_colors": [{"hex": "#000000", "rgb": {"r": 0, "g": 0, "b": 0}, "name": "Black", "prominence": 0.1}], "neutral_colors": [{"hex": "#F5F5F5", "rgb": {"r": 245, "g": 245, "b": 245}, "name": "Light Gray", "prominence": 0.3}], "usage": "walls"}]',
 '[{"category_name": "seating", "characteristics": ["low-profile", "straight-lines"], "materials": ["leather", "fabric"], "shapes": ["rectangular", "linear"]}]'),

('Traditional Classic', 'traditional-classic', 'Timeless elegance with rich fabrics, warm woods, and classic patterns.', 'traditional',
 ARRAY['elegant', 'timeless', 'ornate', 'warm'],
 '[{"name": "Warm Earth", "primary_colors": [{"hex": "#8B4513", "rgb": {"r": 139, "g": 69, "b": 19}, "name": "Saddle Brown", "prominence": 0.3}], "accent_colors": [{"hex": "#DAA520", "rgb": {"r": 218, "g": 165, "b": 32}, "name": "Goldenrod", "prominence": 0.2}], "neutral_colors": [{"hex": "#F5E6D3", "rgb": {"r": 245, "g": 230, "b": 211}, "name": "Cream", "prominence": 0.4}], "usage": "mixed"}]',
 '[{"category_name": "seating", "characteristics": ["tufted", "curved-arms"], "materials": ["velvet", "mahogany"], "shapes": ["curved", "ornamental"]}]'),

('Scandinavian Hygge', 'scandinavian-hygge', 'Light woods, cozy textiles, and functional design create a warm, inviting atmosphere.', 'scandinavian',
 ARRAY['cozy', 'light', 'functional', 'natural'],
 '[{"name": "Nordic Light", "primary_colors": [{"hex": "#F8F8FF", "rgb": {"r": 248, "g": 248, "b": 255}, "name": "Ghost White", "prominence": 0.4}], "accent_colors": [{"hex": "#B0C4DE", "rgb": {"r": 176, "g": 196, "b": 222}, "name": "Light Steel Blue", "prominence": 0.2}], "neutral_colors": [{"hex": "#D2691E", "rgb": {"r": 210, "g": 105, "b": 30}, "name": "Light Wood", "prominence": 0.3}], "usage": "walls"}]',
 '[{"category_name": "seating", "characteristics": ["simple", "comfortable"], "materials": ["light-wood", "wool"], "shapes": ["organic", "rounded"]}]')

ON CONFLICT (slug) DO NOTHING;

-- Insert default ambiance options
INSERT INTO ambiance_options (name, description, mood_tags, lighting_preset, color_adjustment, texture_emphasis) VALUES
('Bright & Energetic', 'Vibrant lighting and colors to create an uplifting atmosphere.', ARRAY['energetic', 'vibrant', 'uplifting'], 'bright_white', 'saturated', 'smooth'),
('Warm & Cozy', 'Soft, warm lighting for relaxation and comfort.', ARRAY['cozy', 'relaxing', 'intimate'], 'warm_yellow', 'warm_tones', 'textured'),
('Cool & Calm', 'Cool tones and gentle lighting for a serene environment.', ARRAY['calm', 'serene', 'peaceful'], 'cool_blue', 'cool_tones', 'minimal'),
('Dramatic & Bold', 'Strong contrasts and dramatic lighting for visual impact.', ARRAY['dramatic', 'bold', 'striking'], 'contrasted', 'high_contrast', 'varied')
ON CONFLICT DO NOTHING;

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_space_analyses_updated_at BEFORE UPDATE ON space_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_style_references_updated_at BEFORE UPDATE ON style_references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ambiance_options_updated_at BEFORE UPDATE ON ambiance_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE space_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_generation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_style_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own space analyses
CREATE POLICY "Users can view own space analyses" ON space_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own space analyses" ON space_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own space analyses" ON space_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own generation results
CREATE POLICY "Users can view own generation results" ON enhanced_generation_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation results" ON enhanced_generation_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generation results" ON enhanced_generation_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own style preferences
CREATE POLICY "Users can manage own style preferences" ON user_style_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Style references and ambiance options are publicly readable
CREATE POLICY "Style references are publicly readable" ON style_references
    FOR SELECT USING (is_active = true);

CREATE POLICY "Ambiance options are publicly readable" ON ambiance_options
    FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE space_analyses IS 'AI-powered analysis of room spaces from uploaded images';
COMMENT ON TABLE style_references IS 'Reference styles that can be applied to room designs';
COMMENT ON TABLE ambiance_options IS 'Mood and atmosphere options for style application';
COMMENT ON TABLE enhanced_generation_results IS 'Results from enhanced AI design generation process';
COMMENT ON TABLE user_style_preferences IS 'User preferences and interaction history with styles';