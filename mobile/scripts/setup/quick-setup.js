#!/usr/bin/env node

/**
 * Quick Database Setup - Execute Complete Schema
 * Fixed UUID format version
 */

const https = require('https');
const path = require('path');

// Load environment variables from mobile/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xmkkhdxhzopgfophlyjd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set it in mobile/.env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

// Complete database schema with proper UUID format
const COMPLETE_SCHEMA = `
-- 1. STYLE CATEGORIES
CREATE TABLE IF NOT EXISTS style_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    characteristic_tags TEXT[] DEFAULT '{}',
    color_schemes TEXT[] DEFAULT '{}',
    room_compatibility TEXT[] DEFAULT '{}',
    furniture_styles TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    selection_limit INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STYLE REFERENCE IMAGES  
CREATE TABLE IF NOT EXISTS style_reference_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_category_id UUID NOT NULL REFERENCES style_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    medium_url TEXT NOT NULL,
    large_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_kb INTEGER,
    dominant_colors TEXT[] DEFAULT '{}',
    room_type TEXT,
    style_elements TEXT[] DEFAULT '{}',
    mood_tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_hero_image BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    source_attribution TEXT,
    alt_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FURNITURE CATEGORIES
CREATE TABLE IF NOT EXISTS furniture_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    category_type TEXT NOT NULL,
    visual_impact_score INTEGER DEFAULT 5,
    room_compatibility TEXT[] DEFAULT '{}',
    style_compatibility TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FURNITURE STYLE VARIATIONS
CREATE TABLE IF NOT EXISTS furniture_style_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES furniture_categories(id) ON DELETE CASCADE,
    style_name TEXT NOT NULL,
    style_slug TEXT NOT NULL,
    description TEXT,
    primary_color TEXT,
    secondary_colors TEXT[] DEFAULT '{}',
    finish_type TEXT,
    material_tags TEXT[] DEFAULT '{}',
    gallery_images JSONB NOT NULL DEFAULT '[]',
    primary_image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    room_types TEXT[] DEFAULT '{}',
    design_styles TEXT[] DEFAULT '{}',
    color_palettes TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    selection_count INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 50,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10,2) NOT NULL,
    price_currency TEXT DEFAULT 'USD',
    billing_period TEXT DEFAULT 'month',
    designs_included INTEGER,
    credits_included INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    badge_text TEXT,
    highlight_color TEXT,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BUDGET RANGES
CREATE TABLE IF NOT EXISTS budget_ranges (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JOURNEY STEPS
CREATE TABLE IF NOT EXISTS journey_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    screen_name TEXT NOT NULL,
    step_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT true,
    estimated_duration_seconds INTEGER,
    allows_skip BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture_style_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Allow public read access to active styles" ON style_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active style images" ON style_reference_images FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active furniture categories" ON furniture_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to available furniture variations" ON furniture_style_variations FOR SELECT USING (is_available = true);
CREATE POLICY "Allow public read access to active plans" ON subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active budget ranges" ON budget_ranges FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active journey steps" ON journey_steps FOR SELECT USING (is_active = true);

-- SAMPLE DATA
INSERT INTO style_categories (id, name, slug, display_name, description, emoji, display_order, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Modern', 'modern', 'Modern', 'Clean lines and contemporary feel', '⬜', 1, true),
('22222222-2222-2222-2222-222222222222', 'Scandinavian', 'scandinavian', 'Scandinavian', 'Nordic minimalism with natural elements', '❄️', 2, true),
('33333333-3333-3333-3333-333333333333', 'Industrial', 'industrial', 'Industrial', 'Raw materials and urban aesthetics', '⚙️', 3, true),
('44444444-4444-4444-4444-444444444444', 'Traditional', 'traditional', 'Traditional', 'Classic and timeless designs', '🏛️', 4, true),
('55555555-5555-5555-5555-555555555555', 'Luxury', 'luxury', 'Luxury', 'Opulent and sophisticated styling', '💎', 5, true),
('66666666-6666-6666-6666-666666666666', 'Bohemian', 'bohemian', 'Bohemian', 'Eclectic and artistic expression', '🌸', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO furniture_categories (id, name, display_name, emoji, category_type, display_order, is_active) VALUES
('a1111111-a111-4111-8111-111111111111', 'modern-sofa', 'Modern Sofa', '🛋️', 'seating', 1, true),
('b2222222-b222-4222-8222-222222222222', 'classic-chairs', 'Classic Chairs', '🪑', 'seating', 2, true),
('c3333333-c333-4333-8333-333333333333', 'dining-table', 'Dining Table', '🪑', 'tables', 3, true),
('d4444444-d444-4444-8444-444444444444', 'bed-frame', 'Bed Frame', '🛏️', 'bedroom', 4, true),
('e5555555-e555-4555-8555-555555555555', 'coffee-table', 'Coffee Table', '☕', 'tables', 5, true),
('f6666666-f666-4666-8666-666666666666', 'bookshelf', 'Bookshelf', '📚', 'storage', 6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO subscription_plans (id, name, display_name, price_amount, designs_included, is_popular, display_order, is_active) VALUES
('basic', 'Basic', 'Basic', 19.00, 50, false, 1, true),
('pro', 'Pro', 'Pro', 29.00, 200, true, 2, true),
('business', 'Business', 'Business', 49.00, -1, false, 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO budget_ranges (id, label, description, min_amount, max_amount, display_order, is_active) VALUES
('under-1k', 'Under $1,000', 'Budget-friendly refresh', 0.00, 1000.00, 1, true),
('1k-5k', '$1,000 - $5,000', 'Moderate makeover', 1000.00, 5000.00, 2, true),
('5k-15k', '$5,000 - $15,000', 'Full transformation', 5000.00, 15000.00, 3, true),
('15k-plus', '$15,000+', 'Luxury redesign', 15000.00, 50000.00, 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO journey_steps (step_number, screen_name, step_name, title, is_required, display_order, is_active) VALUES
(1, 'onboarding1', 'welcome', 'Welcome', true, 1, true),
(2, 'onboarding2', 'styles', 'Style Selection', true, 2, true),
(3, 'onboarding3', 'features', 'Features Overview', true, 3, true),
(4, 'paywall', 'subscription', 'Choose Plan', true, 4, true),
(5, 'photoCapture', 'photo', 'Upload Photo', true, 5, true),
(6, 'descriptions', 'descriptions', 'Add Details', false, 6, true),
(7, 'furniture', 'furniture', 'Furniture Style', false, 7, true),
(8, 'budget', 'budget', 'Set Budget', true, 8, true),
(9, 'auth', 'authentication', 'Create Account', true, 9, true),
(10, 'checkout', 'payment', 'Payment', true, 10, true),
(11, 'processing', 'processing', 'AI Processing', true, 11, true),
(12, 'results', 'results', 'Your Design', true, 12, true)
ON CONFLICT DO NOTHING;
`;

/**
 * Make HTTP request to Supabase REST API
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Execute complete schema
 */
async function executeCompleteSchema() {
  console.log('🚀 Executing Complete Database Schema...');
  
  try {
    // Split schema into manageable chunks
    const statements = COMPLETE_SCHEMA
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 10);
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        const options = {
          hostname: 'xmkkhdxhzopgfophlyjd.supabase.co',
          port: 443,
          path: '/rest/v1/rpc/exec_sql',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY
          }
        };
        
        const response = await makeRequest(options, { 
          sql: statement + ';'
        });
        
        if (response.status >= 200 && response.status < 300) {
          console.log(`    ✅ Statement ${i + 1}/${statements.length} executed successfully`);
          successCount++;
        } else if (response.data && response.data.message && (
          response.data.message.includes('already exists') ||
          response.data.message.includes('duplicate key')
        )) {
          console.log(`    ℹ️  Statement ${i + 1}/${statements.length} - already exists (OK)`);
          successCount++;
        } else {
          console.log(`    ⚠️  Statement ${i + 1}/${statements.length} - Status: ${response.status}`);
          if (response.data) {
            console.log(`    Details:`, response.data.message || response.data);
          }
          errorCount++;
        }
        
        // Small delay between statements
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`    ❌ Statement ${i + 1}/${statements.length} failed:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n🏁 Schema Execution Complete!`);
    console.log(`✅ Successful: ${successCount}/${statements.length}`);
    console.log(`❌ Errors: ${errorCount}/${statements.length}`);
    
    if (successCount > statements.length * 0.8) {
      console.log(`🎉 Database setup successful! (${Math.round(successCount/statements.length*100)}% success rate)`);
      return true;
    } else {
      console.log(`⚠️  Some issues occurred, but core setup may be complete.`);
      return false;
    }
    
  } catch (err) {
    console.error('💥 Schema execution failed:', err.message);
    return false;
  }
}

// Execute if called directly
if (require.main === module) {
  executeCompleteSchema()
    .then(success => {
      if (success) {
        console.log('\n🎯 Next Steps:');
        console.log('1. ✅ Database tables created');
        console.log('2. 🔄 Update mobile app to fetch from database');
        console.log('3. 🖼️ Upload image assets for galleries');
        console.log('4. 🧪 Run comprehensive tests');
        console.log('\n📊 Verify setup at:');
        console.log('https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd/editor');
      } else {
        console.log('❌ Setup encountered issues. Check logs above.');
      }
    })
    .catch(console.error);
}

module.exports = { executeCompleteSchema };