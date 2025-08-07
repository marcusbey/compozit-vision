-- Compozit Vision Database Schema
-- This file contains the complete database schema for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    budget DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    design_id UUID, -- Will reference designs table
    type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Designs table
CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    style VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    original_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    generated_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    processing_details JSONB DEFAULT '{}',
    estimated_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Add foreign key for images.design_id after designs table creation
ALTER TABLE images 
ADD CONSTRAINT fk_images_design_id 
FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE SET NULL;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    image_url TEXT,
    product_url TEXT,
    affiliate_url TEXT,
    dimensions JSONB DEFAULT '{}',
    materials TEXT[],
    colors TEXT[],
    availability BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2),
    review_count INTEGER,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    match_confidence DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_project_id ON designs(project_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_products_design_id ON products(design_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Row Level Security Policies (for Supabase)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can read their own projects
CREATE POLICY "Users can read own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own designs
CREATE POLICY "Users can read own designs" ON designs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own images
CREATE POLICY "Users can read own images" ON images
    FOR SELECT USING (auth.uid() = user_id);

-- Products are publicly readable
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (true);

-- Room Measurements table
CREATE TABLE IF NOT EXISTS room_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'processing',
    confidence DECIMAL(3,2),
    measurements JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    processing_started_at TIMESTAMP DEFAULT NOW(),
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Analysis Results table for background job tracking
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measurement_id UUID NOT NULL REFERENCES room_measurements(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    progress DECIMAL(3,2) DEFAULT 0.0,
    result JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Camera Calibrations table
CREATE TABLE IF NOT EXISTS camera_calibrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    calibration_data JSONB NOT NULL,
    reference_object JSONB,
    accuracy_score DECIMAL(3,2),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Additional indexes for vision tables
CREATE INDEX IF NOT EXISTS idx_room_measurements_user_id ON room_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_room_measurements_project_id ON room_measurements(project_id);
CREATE INDEX IF NOT EXISTS idx_room_measurements_status ON room_measurements(status);
CREATE INDEX IF NOT EXISTS idx_analysis_results_measurement_id ON analysis_results(measurement_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_status ON analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_camera_calibrations_user_id ON camera_calibrations(user_id);

-- Enable RLS for new tables
ALTER TABLE room_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_calibrations ENABLE ROW LEVEL SECURITY;

-- Users can read their own measurements
CREATE POLICY "Users can read own measurements" ON room_measurements
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own measurements
CREATE POLICY "Users can create own measurements" ON room_measurements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own measurements
CREATE POLICY "Users can update own measurements" ON room_measurements
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own measurements
CREATE POLICY "Users can delete own measurements" ON room_measurements
    FOR DELETE USING (auth.uid() = user_id);

-- Analysis results can be read by measurement owner
CREATE POLICY "Users can read measurement analysis results" ON analysis_results
    FOR SELECT USING (
        auth.uid() = (
            SELECT user_id FROM room_measurements 
            WHERE id = analysis_results.measurement_id
        )
    );

-- Users can read their own calibrations
CREATE POLICY "Users can read own calibrations" ON camera_calibrations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own calibrations
CREATE POLICY "Users can create own calibrations" ON camera_calibrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI/3D Visualization System Tables

-- Rendering jobs table for background job tracking
CREATE TABLE IF NOT EXISTS rendering_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ai_quick', 'ai_detailed', '3d_model', 'inpainting', 'style_transfer', 'export')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
    input_data JSONB NOT NULL DEFAULT '{}',
    result_data JSONB DEFAULT '{}',
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Visualization results table  
CREATE TABLE IF NOT EXISTS visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ai_render', '3d_model', 'floor_plan', 'elevation', 'section')),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    model_url TEXT,
    thumbnail_url TEXT,
    file_size BIGINT,
    format VARCHAR(10),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- 3D Scenes table for storing complete 3D scenes
CREATE TABLE IF NOT EXISTS scenes_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    room_data JSONB NOT NULL DEFAULT '{}',
    furniture_data JSONB DEFAULT '[]',
    lights_data JSONB DEFAULT '[]',
    materials_data JSONB DEFAULT '[]',
    camera_data JSONB DEFAULT '{}',
    model_url TEXT,
    thumbnail_url TEXT,
    file_size BIGINT,
    vertex_count INTEGER,
    polygon_count INTEGER,
    optimization_level VARCHAR(20) DEFAULT 'medium',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Export results table for tracking exported files
CREATE TABLE IF NOT EXISTS export_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    scene_id UUID REFERENCES scenes_3d(id) ON DELETE SET NULL,
    export_type VARCHAR(20) NOT NULL CHECK (export_type IN ('floor_plan', 'elevation', 'section', '3d_model', 'drawing_set')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'png', 'dwg', 'gltf', 'glb', 'obj', 'fbx')),
    file_url TEXT NOT NULL,
    file_size BIGINT,
    view_type VARCHAR(20),
    options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- AI Cache table for caching AI rendering results
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    result_data JSONB NOT NULL,
    file_urls TEXT[],
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for visualization tables
CREATE INDEX IF NOT EXISTS idx_rendering_jobs_user_id ON rendering_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_rendering_jobs_project_id ON rendering_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_rendering_jobs_status ON rendering_jobs(status);
CREATE INDEX IF NOT EXISTS idx_rendering_jobs_type ON rendering_jobs(type);
CREATE INDEX IF NOT EXISTS idx_rendering_jobs_created_at ON rendering_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_project_id ON visualizations(project_id);
CREATE INDEX IF NOT EXISTS idx_visualizations_type ON visualizations(type);
CREATE INDEX IF NOT EXISTS idx_visualizations_created_at ON visualizations(created_at);

CREATE INDEX IF NOT EXISTS idx_scenes_3d_user_id ON scenes_3d(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_3d_project_id ON scenes_3d(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_3d_created_at ON scenes_3d(created_at);

CREATE INDEX IF NOT EXISTS idx_export_results_user_id ON export_results(user_id);
CREATE INDEX IF NOT EXISTS idx_export_results_project_id ON export_results(project_id);
CREATE INDEX IF NOT EXISTS idx_export_results_scene_id ON export_results(scene_id);
CREATE INDEX IF NOT EXISTS idx_export_results_export_type ON export_results(export_type);
CREATE INDEX IF NOT EXISTS idx_export_results_created_at ON export_results(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_cache_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_user_id ON ai_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_request_hash ON ai_cache(request_hash);

-- Enable RLS for visualization tables
ALTER TABLE rendering_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visualization tables

-- Users can read their own rendering jobs
CREATE POLICY "Users can read own rendering jobs" ON rendering_jobs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own rendering jobs
CREATE POLICY "Users can create own rendering jobs" ON rendering_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rendering jobs (for status updates)
CREATE POLICY "Users can update own rendering jobs" ON rendering_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can read their own visualizations
CREATE POLICY "Users can read own visualizations" ON visualizations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own visualizations
CREATE POLICY "Users can create own visualizations" ON visualizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own visualizations
CREATE POLICY "Users can update own visualizations" ON visualizations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own visualizations
CREATE POLICY "Users can delete own visualizations" ON visualizations
    FOR DELETE USING (auth.uid() = user_id);

-- Users can read their own 3D scenes
CREATE POLICY "Users can read own 3d scenes" ON scenes_3d
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own 3D scenes
CREATE POLICY "Users can create own 3d scenes" ON scenes_3d
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own 3D scenes
CREATE POLICY "Users can update own 3d scenes" ON scenes_3d
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own 3D scenes
CREATE POLICY "Users can delete own 3d scenes" ON scenes_3d
    FOR DELETE USING (auth.uid() = user_id);

-- Users can read their own export results
CREATE POLICY "Users can read own export results" ON export_results
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own export results
CREATE POLICY "Users can create own export results" ON export_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own AI cache entries
CREATE POLICY "Users can read own ai cache" ON ai_cache
    FOR SELECT USING (auth.uid() = user_id);

-- System can manage AI cache (for cleanup)
CREATE POLICY "System can manage ai cache" ON ai_cache
    FOR ALL USING (true);

-- Cleanup function for expired AI cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup expired cache (requires pg_cron extension)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-ai-cache', '0 2 * * *', 'SELECT cleanup_expired_ai_cache();');