-- Database functions for CategorySelectionScreen
-- This file creates the missing functions that were referenced in the original code
-- These are optional - the screen now works with direct table queries

-- Function to get categories by type
CREATE OR REPLACE FUNCTION public.get_categories_by_type(
    p_category_type TEXT DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
    id TEXT,
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
    complexity_level INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.category_type,
        c.icon_name,
        c.image_url,
        c.thumbnail_url,
        c.color_scheme,
        c.display_order,
        c.is_featured,
        c.usage_count,
        c.popularity_score,
        c.complexity_level,
        c.created_at
    FROM categories c
    WHERE 
        (p_include_inactive = TRUE OR c.is_active = TRUE)
        AND (p_category_type IS NULL OR c.category_type = p_category_type)
    ORDER BY c.display_order ASC, c.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment category usage count
CREATE OR REPLACE FUNCTION public.increment_category_usage(
    p_category_id TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE categories 
    SET 
        usage_count = COALESCE(usage_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_category_id;
    
    -- If no rows were updated, log a warning but don't throw an error
    IF NOT FOUND THEN
        RAISE WARNING 'Category with id % not found for usage increment', p_category_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get category statistics
CREATE OR REPLACE FUNCTION public.get_category_stats()
RETURNS TABLE(
    total_categories BIGINT,
    total_usage BIGINT,
    most_popular_category TEXT,
    least_used_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_categories,
        COALESCE(SUM(usage_count), 0)::BIGINT as total_usage,
        (SELECT name FROM categories WHERE usage_count = (SELECT MAX(usage_count) FROM categories) LIMIT 1) as most_popular_category,
        (SELECT name FROM categories WHERE usage_count = (SELECT MIN(usage_count) FROM categories WHERE usage_count > 0) LIMIT 1) as least_used_category
    FROM categories 
    WHERE is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_categories_by_type(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_category_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_stats() TO authenticated;

-- Grant permissions to anonymous users (for public access)
GRANT EXECUTE ON FUNCTION public.get_categories_by_type(TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION public.get_category_stats() TO anon;