-- Furniture Search Optimization Indexes
-- This migration adds advanced indexes for optimal search performance

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_furniture_items_search_composite 
ON furniture_items(availability_status, is_active, category_id, brand_id);

-- Price range queries optimization
CREATE INDEX IF NOT EXISTS idx_furniture_items_price_range 
ON furniture_items(
    (price_range->>'min')::numeric,
    (price_range->>'max')::numeric,
    availability_status
) WHERE is_active = true;

-- Dimension-based queries (for room fitting)
CREATE INDEX IF NOT EXISTS idx_furniture_items_dimensions_width 
ON furniture_items((dimensions->>'width')::numeric) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_furniture_items_dimensions_length 
ON furniture_items((dimensions->>'length')::numeric) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_furniture_items_dimensions_height 
ON furniture_items((dimensions->>'height')::numeric) WHERE is_active = true;

-- Popular items index (for recommendations)
CREATE INDEX IF NOT EXISTS idx_furniture_items_popularity 
ON furniture_items(average_rating DESC, review_count DESC, view_count DESC) 
WHERE is_active = true AND availability_status = 'available';

-- Featured items index
CREATE INDEX IF NOT EXISTS idx_furniture_items_featured 
ON furniture_items(is_featured, category_id, average_rating DESC) 
WHERE is_active = true AND is_featured = true;

-- Text search optimization
CREATE INDEX IF NOT EXISTS idx_furniture_items_name_trgm 
ON furniture_items USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_furniture_brands_name_trgm 
ON furniture_brands USING gin(name gin_trgm_ops);

-- Category path optimization (for hierarchical queries)
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    path TEXT[];
    current_id UUID;
    current_name TEXT;
BEGIN
    current_id := category_id;
    
    WHILE current_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_name, current_id
        FROM furniture_categories
        WHERE id = current_id;
        
        IF current_name IS NOT NULL THEN
            path := array_prepend(current_name, path);
        END IF;
    END LOOP;
    
    RETURN path;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Materialized view for category statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS furniture_category_stats AS
SELECT 
    fc.id,
    fc.name,
    fc.slug,
    fc.parent_id,
    COUNT(DISTINCT fi.id) as item_count,
    COUNT(DISTINCT fi.brand_id) as brand_count,
    AVG(fi.average_rating) as avg_rating,
    MIN((fi.price_range->>'min')::numeric) as min_price,
    MAX((fi.price_range->>'max')::numeric) as max_price,
    array_agg(DISTINCT unnest(fi.style_tags)) as available_styles,
    array_agg(DISTINCT unnest(fi.color_tags)) as available_colors,
    array_agg(DISTINCT unnest(fi.material_tags)) as available_materials
FROM furniture_categories fc
LEFT JOIN furniture_items fi ON fc.id = fi.category_id AND fi.is_active = true
GROUP BY fc.id, fc.name, fc.slug, fc.parent_id;

CREATE UNIQUE INDEX idx_furniture_category_stats_id ON furniture_category_stats(id);

-- Function for smart furniture search
CREATE OR REPLACE FUNCTION search_furniture(
    query_text TEXT DEFAULT NULL,
    category_ids UUID[] DEFAULT NULL,
    brand_ids UUID[] DEFAULT NULL,
    style_tags TEXT[] DEFAULT NULL,
    color_tags TEXT[] DEFAULT NULL,
    material_tags TEXT[] DEFAULT NULL,
    min_price NUMERIC DEFAULT NULL,
    max_price NUMERIC DEFAULT NULL,
    room_types TEXT[] DEFAULT NULL,
    min_rating NUMERIC DEFAULT NULL,
    sort_by TEXT DEFAULT 'relevance',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    brand_name TEXT,
    category_name TEXT,
    price_min NUMERIC,
    price_max NUMERIC,
    average_rating NUMERIC,
    review_count INTEGER,
    thumbnail_url TEXT,
    style_tags TEXT[],
    color_tags TEXT[],
    material_tags TEXT[],
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_items AS (
        SELECT 
            fi.id,
            fi.name,
            fi.description,
            fb.name as brand_name,
            fc.name as category_name,
            (fi.price_range->>'min')::numeric as price_min,
            (fi.price_range->>'max')::numeric as price_max,
            fi.average_rating,
            fi.review_count,
            fi.thumbnail_url,
            fi.style_tags,
            fi.color_tags,
            fi.material_tags,
            CASE 
                WHEN query_text IS NOT NULL THEN
                    ts_rank(fi.search_vector, plainto_tsquery('english', query_text))
                ELSE 0
            END as text_relevance,
            fi.view_count,
            fi.purchase_count,
            fi.created_at
        FROM furniture_items fi
        LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
        LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
        WHERE fi.is_active = true
            AND fi.availability_status != 'discontinued'
            AND (category_ids IS NULL OR fi.category_id = ANY(category_ids))
            AND (brand_ids IS NULL OR fi.brand_id = ANY(brand_ids))
            AND (style_tags IS NULL OR fi.style_tags && style_tags)
            AND (color_tags IS NULL OR fi.color_tags && color_tags)
            AND (material_tags IS NULL OR fi.material_tags && material_tags)
            AND (min_price IS NULL OR (fi.price_range->>'min')::numeric >= min_price)
            AND (max_price IS NULL OR (fi.price_range->>'max')::numeric <= max_price)
            AND (min_rating IS NULL OR fi.average_rating >= min_rating)
            AND (query_text IS NULL OR fi.search_vector @@ plainto_tsquery('english', query_text))
            AND (room_types IS NULL OR EXISTS (
                SELECT 1 FROM furniture_room_compatibility frc
                WHERE frc.furniture_item_id = fi.id
                AND frc.room_type = ANY(room_types)
            ))
    )
    SELECT 
        id,
        name,
        description,
        brand_name,
        category_name,
        price_min,
        price_max,
        average_rating,
        review_count,
        thumbnail_url,
        style_tags,
        color_tags,
        material_tags,
        CASE sort_by
            WHEN 'relevance' THEN text_relevance
            WHEN 'rating' THEN average_rating
            WHEN 'popularity' THEN (view_count + purchase_count * 10)::real
            WHEN 'price_low' THEN -price_min
            WHEN 'price_high' THEN price_max
            WHEN 'newest' THEN EXTRACT(EPOCH FROM created_at)::real
            ELSE text_relevance
        END as relevance_score
    FROM filtered_items
    ORDER BY 
        CASE sort_by
            WHEN 'relevance' THEN text_relevance
            WHEN 'rating' THEN average_rating
            WHEN 'popularity' THEN (view_count + purchase_count * 10)::real
            WHEN 'newest' THEN EXTRACT(EPOCH FROM created_at)::real
            ELSE text_relevance
        END DESC,
        CASE sort_by
            WHEN 'price_low' THEN price_min
            ELSE NULL
        END ASC,
        CASE sort_by
            WHEN 'price_high' THEN price_max
            ELSE NULL
        END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get furniture recommendations based on user preferences
CREATE OR REPLACE FUNCTION get_furniture_recommendations(
    p_user_id UUID,
    p_room_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand_name TEXT,
    category_name TEXT,
    price NUMERIC,
    average_rating NUMERIC,
    thumbnail_url TEXT,
    recommendation_score REAL
) AS $$
DECLARE
    user_styles TEXT[];
    user_materials TEXT[];
    user_colors TEXT[];
    preferred_brands UUID[];
    excluded_brands UUID[];
    budget_min NUMERIC;
    budget_max NUMERIC;
BEGIN
    -- Get user preferences
    SELECT 
        style_preferences,
        preferred_materials,
        color_preferences,
        ARRAY(SELECT unnest(ufp.preferred_brands)) as preferred_brands,
        ARRAY(SELECT unnest(ufp.excluded_brands)) as excluded_brands,
        (budget_range->>'min')::numeric,
        (budget_range->>'max')::numeric
    INTO 
        user_styles,
        user_materials,
        user_colors,
        preferred_brands,
        excluded_brands,
        budget_min,
        budget_max
    FROM user_furniture_preferences ufp
    WHERE ufp.user_id = p_user_id;
    
    -- Get personalized recommendations
    RETURN QUERY
    WITH user_interactions AS (
        SELECT 
            furniture_item_id,
            COUNT(*) FILTER (WHERE interaction_type = 'view') as view_count,
            COUNT(*) FILTER (WHERE interaction_type = 'like') as like_count,
            COUNT(*) FILTER (WHERE interaction_type = 'save') as save_count
        FROM user_furniture_interactions
        WHERE user_id = p_user_id
        GROUP BY furniture_item_id
    ),
    scored_items AS (
        SELECT 
            fi.id,
            fi.name,
            fb.name as brand_name,
            fc.name as category_name,
            (fi.price_range->>'min')::numeric as price,
            fi.average_rating,
            fi.thumbnail_url,
            -- Calculate recommendation score
            (
                -- Style match score
                CASE WHEN user_styles IS NOT NULL AND fi.style_tags && user_styles 
                    THEN array_length(fi.style_tags & user_styles, 1) * 0.3
                    ELSE 0 
                END +
                -- Material match score
                CASE WHEN user_materials IS NOT NULL AND fi.material_tags && user_materials 
                    THEN array_length(fi.material_tags & user_materials, 1) * 0.2
                    ELSE 0 
                END +
                -- Color match score
                CASE WHEN user_colors IS NOT NULL AND fi.color_tags && user_colors 
                    THEN array_length(fi.color_tags & user_colors, 1) * 0.1
                    ELSE 0 
                END +
                -- Brand preference score
                CASE WHEN fi.brand_id = ANY(preferred_brands) THEN 0.2 ELSE 0 END +
                -- Rating score
                (fi.average_rating / 5.0) * 0.1 +
                -- Popularity score
                (LEAST(fi.review_count, 100) / 100.0) * 0.1
            )::real as recommendation_score,
            COALESCE(ui.view_count, 0) as user_views
        FROM furniture_items fi
        LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
        LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
        LEFT JOIN user_interactions ui ON fi.id = ui.furniture_item_id
        WHERE fi.is_active = true
            AND fi.availability_status = 'available'
            AND (excluded_brands IS NULL OR NOT(fi.brand_id = ANY(excluded_brands)))
            AND (budget_min IS NULL OR (fi.price_range->>'min')::numeric >= budget_min)
            AND (budget_max IS NULL OR (fi.price_range->>'max')::numeric <= budget_max)
            AND (p_room_type IS NULL OR EXISTS (
                SELECT 1 FROM furniture_room_compatibility frc
                WHERE frc.furniture_item_id = fi.id
                AND frc.room_type = p_room_type
                AND frc.suitability_score >= 70
            ))
            -- Exclude items user has already viewed many times
            AND COALESCE(ui.view_count, 0) < 5
    )
    SELECT 
        id,
        name,
        brand_name,
        category_name,
        price,
        average_rating,
        thumbnail_url,
        recommendation_score
    FROM scored_items
    ORDER BY recommendation_score DESC, average_rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_furniture_category_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY furniture_category_stats;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to refresh category stats (requires pg_cron extension)
-- This would be set up separately in Supabase dashboard or via SQL if pg_cron is enabled
-- SELECT cron.schedule('refresh-furniture-stats', '0 */6 * * *', 'SELECT refresh_furniture_category_stats();');