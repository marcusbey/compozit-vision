-- =========================================
-- POPULATE SPACE MAPPINGS
-- =========================================
-- Populate category_room_mappings with comprehensive space definitions
-- for all category types (interior, garden, surface, object, exterior)

-- Delete existing mappings to start fresh
DELETE FROM public.category_room_mappings;

-- Insert Interior Design spaces
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  space.slug,
  space.name,
  space.score,
  space.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('living-room', 'Living Room', 1.00, true),
    ('bedroom', 'Bedroom', 1.00, true),
    ('kitchen', 'Kitchen', 1.00, true),
    ('dining-room', 'Dining Room', 0.95, false),
    ('bathroom', 'Bathroom', 0.90, false),
    ('home-office', 'Home Office', 0.90, false),
    ('kids-room', 'Kids'' Room', 0.85, false),
    ('guest-room', 'Guest Room', 0.80, false),
    ('hallway', 'Hallway', 0.75, false),
    ('closet', 'Walk-in Closet', 0.70, false),
    ('basement', 'Basement', 0.65, false),
    ('attic', 'Attic', 0.60, false)
) AS space(slug, name, score, primary_match)
WHERE pc.category_type = 'interior'
ON CONFLICT (category_id, room_slug) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  compatibility_score = EXCLUDED.compatibility_score,
  is_primary_match = EXCLUDED.is_primary_match;

-- Insert Garden & Landscape spaces
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  space.slug,
  space.name,
  space.score,
  space.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('front-yard', 'Front Yard', 1.00, true),
    ('backyard', 'Backyard', 1.00, true),
    ('patio', 'Patio', 0.95, false),
    ('deck', 'Deck', 0.95, false),
    ('garden-beds', 'Garden Beds', 0.90, false),
    ('lawn', 'Lawn', 0.90, false),
    ('pool-area', 'Pool Area', 0.85, false),
    ('balcony', 'Balcony', 0.80, false),
    ('terrace', 'Terrace', 0.80, false),
    ('greenhouse', 'Greenhouse', 0.75, false)
) AS space(slug, name, score, primary_match)
WHERE pc.category_type = 'garden'
ON CONFLICT (category_id, room_slug) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  compatibility_score = EXCLUDED.compatibility_score,
  is_primary_match = EXCLUDED.is_primary_match;

-- Insert Surface Design spaces
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  space.slug,
  space.name,
  space.score,
  space.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('accent-wall', 'Accent Wall', 1.00, true),
    ('kitchen-backsplash', 'Kitchen Backsplash', 0.95, false),
    ('bathroom-tiles', 'Bathroom Tiles', 0.95, false),
    ('flooring', 'Flooring', 0.90, false),
    ('ceiling', 'Ceiling', 0.80, false),
    ('fireplace', 'Fireplace Surround', 0.85, false)
) AS space(slug, name, score, primary_match)
WHERE pc.category_type = 'surface'
ON CONFLICT (category_id, room_slug) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  compatibility_score = EXCLUDED.compatibility_score,
  is_primary_match = EXCLUDED.is_primary_match;

-- Insert Object Styling spaces
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  space.slug,
  space.name,
  space.score,
  space.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('bookshelf', 'Bookshelf', 1.00, true),
    ('mantel', 'Mantel', 0.90, false),
    ('console', 'Console Table', 0.85, false),
    ('gallery-wall', 'Gallery Wall', 0.95, false),
    ('shelving', 'Open Shelving', 0.90, false)
) AS space(slug, name, score, primary_match)
WHERE pc.category_type = 'object'
ON CONFLICT (category_id, room_slug) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  compatibility_score = EXCLUDED.compatibility_score,
  is_primary_match = EXCLUDED.is_primary_match;

-- Insert Exterior Design spaces
INSERT INTO public.category_room_mappings (category_id, room_slug, room_name, compatibility_score, is_primary_match)
SELECT 
  pc.id,
  space.slug,
  space.name,
  space.score,
  space.primary_match
FROM public.project_categories pc
CROSS JOIN (
  VALUES 
    ('front-entrance', 'Front Entrance', 1.00, true),
    ('facade', 'House Facade', 0.95, false),
    ('garage', 'Garage', 0.80, false),
    ('driveway', 'Driveway', 0.75, false),
    ('porch', 'Porch', 0.90, false)
) AS space(slug, name, score, primary_match)
WHERE pc.category_type = 'exterior'
ON CONFLICT (category_id, room_slug) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  compatibility_score = EXCLUDED.compatibility_score,
  is_primary_match = EXCLUDED.is_primary_match;

-- =========================================
-- VERIFY RESULTS
-- =========================================

SELECT 
  pc.name as category_name,
  pc.category_type,
  COUNT(crm.*) as space_count,
  COUNT(CASE WHEN crm.is_primary_match THEN 1 END) as primary_spaces,
  COUNT(CASE WHEN NOT crm.is_primary_match THEN 1 END) as secondary_spaces
FROM public.project_categories pc
LEFT JOIN public.category_room_mappings crm ON pc.id = crm.category_id
WHERE pc.is_active = true
GROUP BY pc.id, pc.name, pc.category_type
ORDER BY pc.display_order;

-- Show sample of mappings for each category
SELECT 
  pc.name as category_name,
  pc.category_type,
  crm.room_slug,
  crm.room_name,
  crm.compatibility_score,
  crm.is_primary_match
FROM public.project_categories pc
JOIN public.category_room_mappings crm ON pc.id = crm.category_id
WHERE pc.is_active = true
ORDER BY pc.display_order, crm.is_primary_match DESC, crm.compatibility_score DESC;

-- =========================================
-- SUCCESS MESSAGE
-- =========================================

SELECT 'Space mappings populated successfully!' as result,
       COUNT(*) as total_mappings
FROM public.category_room_mappings;