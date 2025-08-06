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