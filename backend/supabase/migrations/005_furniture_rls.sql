-- Row Level Security Policies for Furniture Tables
-- This migration sets up RLS policies for secure data access

-- Enable RLS on all furniture tables
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_room_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_furniture_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_furniture_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_furniture_wishlists ENABLE ROW LEVEL SECURITY;

-- Furniture Categories Policies
-- Everyone can view active categories
CREATE POLICY "Categories are viewable by everyone" 
ON furniture_categories FOR SELECT 
USING (is_active = true);

-- Only admins can insert/update/delete categories
CREATE POLICY "Only admins can modify categories" 
ON furniture_categories FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Furniture Brands Policies
-- Everyone can view brands
CREATE POLICY "Brands are viewable by everyone" 
ON furniture_brands FOR SELECT 
USING (true);

-- Only admins can modify brands
CREATE POLICY "Only admins can modify brands" 
ON furniture_brands FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Furniture Items Policies
-- Everyone can view active furniture items
CREATE POLICY "Active furniture items are viewable by everyone" 
ON furniture_items FOR SELECT 
USING (is_active = true);

-- Only admins can insert/update/delete furniture items
CREATE POLICY "Only admins can modify furniture items" 
ON furniture_items FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Furniture Variations Policies
-- View variations of active furniture items
CREATE POLICY "Variations viewable for active items" 
ON furniture_variations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM furniture_items fi 
        WHERE fi.id = furniture_variations.furniture_item_id 
        AND fi.is_active = true
    )
);

-- Only admins can modify variations
CREATE POLICY "Only admins can modify variations" 
ON furniture_variations FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Room Compatibility Policies
-- Everyone can view room compatibility
CREATE POLICY "Room compatibility viewable by everyone" 
ON furniture_room_compatibility FOR SELECT 
USING (true);

-- Only admins can modify room compatibility
CREATE POLICY "Only admins can modify room compatibility" 
ON furniture_room_compatibility FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- User Furniture Interactions Policies
-- Users can view their own interactions
CREATE POLICY "Users can view own interactions" 
ON user_furniture_interactions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own interactions
CREATE POLICY "Users can create own interactions" 
ON user_furniture_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own interactions
CREATE POLICY "Users can update own interactions" 
ON user_furniture_interactions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own interactions
CREATE POLICY "Users can delete own interactions" 
ON user_furniture_interactions FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all interactions
CREATE POLICY "Admins can view all interactions" 
ON user_furniture_interactions FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

-- User Furniture Preferences Policies
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" 
ON user_furniture_preferences FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can create own preferences" 
ON user_furniture_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" 
ON user_furniture_preferences FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" 
ON user_furniture_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Furniture Collections Policies
-- Everyone can view active collections
CREATE POLICY "Active collections viewable by everyone" 
ON furniture_collections FOR SELECT 
USING (is_active = true);

-- Only admins can modify collections
CREATE POLICY "Only admins can modify collections" 
ON furniture_collections FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Furniture Collection Items Policies
-- View items in active collections
CREATE POLICY "Collection items viewable for active collections" 
ON furniture_collection_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM furniture_collections fc 
        WHERE fc.id = furniture_collection_items.collection_id 
        AND fc.is_active = true
    )
);

-- Only admins can modify collection items
CREATE POLICY "Only admins can modify collection items" 
ON furniture_collection_items FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- User Wishlists Policies
-- Users can view their own wishlists
CREATE POLICY "Users can view own wishlists" 
ON user_furniture_wishlists FOR SELECT 
USING (auth.uid() = user_id);

-- Users can add to their own wishlists
CREATE POLICY "Users can add to own wishlists" 
ON user_furniture_wishlists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlists
CREATE POLICY "Users can update own wishlists" 
ON user_furniture_wishlists FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own wishlists
CREATE POLICY "Users can delete from own wishlists" 
ON user_furniture_wishlists FOR DELETE 
USING (auth.uid() = user_id);

-- Create helper functions for common operations

-- Function to track furniture view
CREATE OR REPLACE FUNCTION track_furniture_view(
    p_furniture_id UUID
)
RETURNS void AS $$
BEGIN
    -- Insert view interaction
    INSERT INTO user_furniture_interactions (
        user_id,
        furniture_item_id,
        interaction_type,
        interaction_data
    ) VALUES (
        auth.uid(),
        p_furniture_id,
        'view',
        jsonb_build_object('timestamp', NOW())
    );
    
    -- Update view count on furniture item
    UPDATE furniture_items 
    SET view_count = view_count + 1
    WHERE id = p_furniture_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle wishlist item
CREATE OR REPLACE FUNCTION toggle_wishlist_item(
    p_furniture_id UUID,
    p_variation_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if item exists in wishlist
    SELECT EXISTS (
        SELECT 1 FROM user_furniture_wishlists
        WHERE user_id = auth.uid()
        AND furniture_item_id = p_furniture_id
        AND (variation_id = p_variation_id OR (variation_id IS NULL AND p_variation_id IS NULL))
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove from wishlist
        DELETE FROM user_furniture_wishlists
        WHERE user_id = auth.uid()
        AND furniture_item_id = p_furniture_id
        AND (variation_id = p_variation_id OR (variation_id IS NULL AND p_variation_id IS NULL));
        
        RETURN FALSE; -- Removed
    ELSE
        -- Add to wishlist
        INSERT INTO user_furniture_wishlists (
            user_id,
            furniture_item_id,
            variation_id,
            notes
        ) VALUES (
            auth.uid(),
            p_furniture_id,
            p_variation_id,
            p_notes
        );
        
        RETURN TRUE; -- Added
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's wishlist with furniture details
CREATE OR REPLACE FUNCTION get_user_wishlist()
RETURNS TABLE (
    wishlist_id UUID,
    furniture_id UUID,
    variation_id UUID,
    furniture_name TEXT,
    brand_name TEXT,
    category_name TEXT,
    price NUMERIC,
    thumbnail_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id as wishlist_id,
        w.furniture_item_id as furniture_id,
        w.variation_id,
        fi.name as furniture_name,
        fb.name as brand_name,
        fc.name as category_name,
        COALESCE(
            fv.price,
            (fi.price_range->>'min')::numeric
        ) as price,
        fi.thumbnail_url,
        w.notes,
        w.created_at
    FROM user_furniture_wishlists w
    JOIN furniture_items fi ON w.furniture_item_id = fi.id
    LEFT JOIN furniture_variations fv ON w.variation_id = fv.id
    LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
    LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
    WHERE w.user_id = auth.uid()
    ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION track_furniture_view TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_wishlist_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_wishlist TO authenticated;
GRANT EXECUTE ON FUNCTION search_furniture TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_furniture_recommendations TO authenticated;