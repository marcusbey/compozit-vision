-- Furniture Catalog Schema for Compozit Vision
-- This migration creates the comprehensive furniture database structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Furniture Categories Hierarchy
CREATE TABLE IF NOT EXISTS furniture_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES furniture_categories(id) ON DELETE CASCADE,
    description TEXT,
    icon_url TEXT,
    search_keywords TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for category hierarchy queries
CREATE INDEX idx_furniture_categories_parent ON furniture_categories(parent_id);
CREATE INDEX idx_furniture_categories_slug ON furniture_categories(slug);

-- Furniture Brands/Manufacturers
CREATE TABLE IF NOT EXISTS furniture_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    quality_rating DECIMAL(3,2) CHECK (quality_rating >= 0 AND quality_rating <= 5),
    price_tier TEXT CHECK (price_tier IN ('budget', 'mid-range', 'premium', 'luxury')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main Furniture Catalog
CREATE TABLE IF NOT EXISTS furniture_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    brand_id UUID REFERENCES furniture_brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES furniture_categories(id) ON DELETE SET NULL,
    
    -- Style and aesthetics
    style_tags TEXT[] DEFAULT '{}', -- modern, traditional, rustic, etc.
    color_tags TEXT[] DEFAULT '{}', -- primary colors available
    material_tags TEXT[] DEFAULT '{}', -- wood, metal, fabric, etc.
    
    -- Dimensions (stored in centimeters)
    dimensions JSONB NOT NULL DEFAULT '{}', -- {length, width, height, depth, weight}
    
    -- Pricing
    price_range JSONB NOT NULL DEFAULT '{}', -- {min, max, currency, sale_price}
    
    -- Product details
    features TEXT[] DEFAULT '{}',
    care_instructions TEXT,
    assembly_required BOOLEAN DEFAULT false,
    assembly_time_minutes INTEGER,
    
    -- Availability
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'out_of_stock', 'discontinued')),
    stock_quantity INTEGER DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    model_3d_url TEXT, -- For AR preview
    
    -- Vendor/Source Information
    vendor_info JSONB DEFAULT '{}', -- {vendor_id, vendor_url, affiliate_link}
    
    -- SEO and Search
    search_vector tsvector,
    
    -- Ratings and popularity
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    
    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for furniture items
CREATE INDEX idx_furniture_items_brand ON furniture_items(brand_id);
CREATE INDEX idx_furniture_items_category ON furniture_items(category_id);
CREATE INDEX idx_furniture_items_availability ON furniture_items(availability_status);
CREATE INDEX idx_furniture_items_price ON furniture_items((price_range->>'min')::numeric);
CREATE INDEX idx_furniture_items_style ON furniture_items USING GIN(style_tags);
CREATE INDEX idx_furniture_items_color ON furniture_items USING GIN(color_tags);
CREATE INDEX idx_furniture_items_material ON furniture_items USING GIN(material_tags);
CREATE INDEX idx_furniture_items_search ON furniture_items USING GIN(search_vector);

-- Furniture Variations (different sizes, colors of same model)
CREATE TABLE IF NOT EXISTS furniture_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    furniture_item_id UUID NOT NULL REFERENCES furniture_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Large - Navy Blue"
    sku TEXT UNIQUE,
    
    -- Variation specifics
    size_label TEXT, -- S, M, L, XL or specific dimensions
    color_name TEXT,
    color_hex TEXT,
    material_variant TEXT,
    
    -- Dimensions for this variation
    dimensions JSONB DEFAULT '{}',
    
    -- Pricing for this variation
    price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    
    -- Availability
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_furniture_variations_item ON furniture_variations(furniture_item_id);

-- Room Compatibility Rules
CREATE TABLE IF NOT EXISTS furniture_room_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    furniture_item_id UUID REFERENCES furniture_items(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL CHECK (room_type IN ('living_room', 'bedroom', 'dining_room', 'kitchen', 'bathroom', 'office', 'outdoor', 'entryway', 'kids_room')),
    
    -- Minimum room dimensions required (in centimeters)
    min_room_dimensions JSONB DEFAULT '{}', -- {length, width, height}
    
    -- Placement guidelines
    placement_rules JSONB DEFAULT '{}', -- {wall_clearance, traffic_space, etc.}
    
    -- Style compatibility
    compatible_styles TEXT[] DEFAULT '{}',
    
    -- Usage notes
    placement_notes TEXT,
    
    -- Suitability score (0-100)
    suitability_score INTEGER DEFAULT 50 CHECK (suitability_score >= 0 AND suitability_score <= 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_furniture_room_compatibility_item ON furniture_room_compatibility(furniture_item_id);
CREATE INDEX idx_furniture_room_compatibility_room ON furniture_room_compatibility(room_type);

-- User Furniture Interactions
CREATE TABLE IF NOT EXISTS user_furniture_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users
    furniture_item_id UUID NOT NULL REFERENCES furniture_items(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'purchase', 'review')),
    interaction_data JSONB DEFAULT '{}', -- Additional data like review text, rating
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_furniture_interactions_user ON user_furniture_interactions(user_id);
CREATE INDEX idx_user_furniture_interactions_item ON user_furniture_interactions(furniture_item_id);
CREATE INDEX idx_user_furniture_interactions_type ON user_furniture_interactions(interaction_type);

-- User Furniture Preferences
CREATE TABLE IF NOT EXISTS user_furniture_preferences (
    user_id UUID PRIMARY KEY, -- References auth.users
    style_preferences TEXT[] DEFAULT '{}',
    preferred_brands UUID[] DEFAULT '{}', -- Array of brand IDs
    excluded_brands UUID[] DEFAULT '{}',
    preferred_materials TEXT[] DEFAULT '{}',
    color_preferences TEXT[] DEFAULT '{}',
    budget_range JSONB DEFAULT '{}', -- {min, max, currency}
    room_specific_preferences JSONB DEFAULT '{}', -- {room_type: {preferences}}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Furniture Collections/Sets
CREATE TABLE IF NOT EXISTS furniture_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    brand_id UUID REFERENCES furniture_brands(id) ON DELETE SET NULL,
    style_tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship for collections
CREATE TABLE IF NOT EXISTS furniture_collection_items (
    collection_id UUID REFERENCES furniture_collections(id) ON DELETE CASCADE,
    furniture_item_id UUID REFERENCES furniture_items(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_optional BOOLEAN DEFAULT false, -- Some items in a set might be optional
    PRIMARY KEY (collection_id, furniture_item_id)
);

-- User Wishlists
CREATE TABLE IF NOT EXISTS user_furniture_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users
    furniture_item_id UUID REFERENCES furniture_items(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES furniture_variations(id) ON DELETE CASCADE,
    notes TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, furniture_item_id, variation_id)
);

CREATE INDEX idx_user_furniture_wishlists_user ON user_furniture_wishlists(user_id);

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_furniture_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.style_tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.material_tags, ' '), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.features, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vectors
CREATE TRIGGER update_furniture_search_vector_trigger
BEFORE INSERT OR UPDATE OF name, description, style_tags, material_tags, features
ON furniture_items
FOR EACH ROW
EXECUTE FUNCTION update_furniture_search_vector();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables with updated_at
CREATE TRIGGER update_furniture_categories_updated_at BEFORE UPDATE ON furniture_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_furniture_brands_updated_at BEFORE UPDATE ON furniture_brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_furniture_items_updated_at BEFORE UPDATE ON furniture_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_furniture_variations_updated_at BEFORE UPDATE ON furniture_variations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_furniture_collections_updated_at BEFORE UPDATE ON furniture_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_furniture_preferences_updated_at BEFORE UPDATE ON user_furniture_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();