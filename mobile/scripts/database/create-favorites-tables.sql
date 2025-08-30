-- Create user favorites system tables
-- This SQL script creates the database schema for the comprehensive favorites system

-- Create enum types for item types
CREATE TYPE favorite_item_type AS ENUM (
  'reference_image',
  'color_palette', 
  'design_style',
  'furniture_item'
);

CREATE TYPE collection_item_type AS ENUM (
  'reference_image',
  'color_palette',
  'design_style', 
  'furniture_item',
  'mixed'
);

-- Create favorite collections table
CREATE TABLE favorite_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  item_type collection_item_type NOT NULL DEFAULT 'mixed',
  item_count INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT collection_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT collection_description_length CHECK (char_length(description) <= 500)
);

-- Create user favorites table
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type favorite_item_type NOT NULL,
  item_id UUID NOT NULL,
  collection_id UUID REFERENCES favorite_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint: user can only favorite an item once
  CONSTRAINT unique_user_item_favorite UNIQUE (user_id, item_type, item_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item_type ON user_favorites(item_type);
CREATE INDEX idx_user_favorites_collection_id ON user_favorites(collection_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

CREATE INDEX idx_favorite_collections_user_id ON favorite_collections(user_id);
CREATE INDEX idx_favorite_collections_item_type ON favorite_collections(item_type);

-- Create function to update collection item count
CREATE OR REPLACE FUNCTION update_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update count for collection when items are added/removed
  IF TG_OP = 'INSERT' AND NEW.collection_id IS NOT NULL THEN
    UPDATE favorite_collections 
    SET item_count = item_count + 1,
        updated_at = now()
    WHERE id = NEW.collection_id;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.collection_id IS NOT NULL THEN
    UPDATE favorite_collections 
    SET item_count = GREATEST(item_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.collection_id;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Handle collection change
    IF OLD.collection_id IS DISTINCT FROM NEW.collection_id THEN
      -- Decrease old collection count
      IF OLD.collection_id IS NOT NULL THEN
        UPDATE favorite_collections 
        SET item_count = GREATEST(item_count - 1, 0),
            updated_at = now()
        WHERE id = OLD.collection_id;
      END IF;
      
      -- Increase new collection count
      IF NEW.collection_id IS NOT NULL THEN
        UPDATE favorite_collections 
        SET item_count = item_count + 1,
            updated_at = now()
        WHERE id = NEW.collection_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to maintain collection counts
CREATE TRIGGER trigger_update_collection_count
  AFTER INSERT OR UPDATE OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_collection_item_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
CREATE TRIGGER trigger_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_favorite_collections_updated_at
  BEFORE UPDATE ON favorite_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON user_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for favorite_collections
CREATE POLICY "Users can view their own collections" ON favorite_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON favorite_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON favorite_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON favorite_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Create views for analytics and statistics
CREATE VIEW user_favorite_stats AS
SELECT 
  user_id,
  COUNT(*) as total_favorites,
  COUNT(*) FILTER (WHERE item_type = 'reference_image') as reference_images,
  COUNT(*) FILTER (WHERE item_type = 'color_palette') as color_palettes,
  COUNT(*) FILTER (WHERE item_type = 'design_style') as design_styles,
  COUNT(*) FILTER (WHERE item_type = 'furniture_item') as furniture_items,
  COUNT(DISTINCT collection_id) FILTER (WHERE collection_id IS NOT NULL) as collections_used,
  MAX(created_at) as last_favorite_date
FROM user_favorites
GROUP BY user_id;

-- Insert sample data (optional, for testing)
-- This would be removed in production
/*
INSERT INTO favorite_collections (user_id, name, description, item_type) VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'Living Room Ideas', 'Modern living room inspiration', 'mixed'),
  ((SELECT id FROM auth.users LIMIT 1), 'Color Palettes', 'My favorite color schemes', 'color_palette'),
  ((SELECT id FROM auth.users LIMIT 1), 'Bedroom Styles', 'Cozy bedroom inspirations', 'reference_image');
*/