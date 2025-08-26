# 🗄️ Database Setup Execution Guide

## Phase 1: Complete Database Schema Setup

Execute these SQL scripts **in order** in your Supabase SQL Editor:

### 📍 Supabase Dashboard Access
1. Go to: https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd
2. Navigate to SQL Editor (left sidebar)
3. Execute each script below in sequence

---

## ✅ Script Execution Order

### Step 1: Style System Tables
**File**: `scripts/01-style-system-tables.sql`
```sql
-- Creates:
-- ✅ style_categories (6 sample styles with emojis)
-- ✅ style_reference_images (image gallery structure)
-- ✅ RLS policies and indexes
-- ✅ Sample data populated
```
**Expected Result**: `Style system tables created successfully! ✅`

---

### Step 2: Furniture System Tables  
**File**: `scripts/02-furniture-system-tables.sql`
```sql
-- Creates:
-- ✅ furniture_categories (6 furniture types with emojis)
-- ✅ furniture_style_variations (swipe gallery structure)
-- ✅ Sample variations with mock gallery images
-- ✅ RLS policies and indexes
```
**Expected Result**: `Furniture system tables created successfully! ✅`

---

### Step 3: Subscription System Tables
**File**: `scripts/03-subscription-system-tables.sql`
```sql
-- Creates:
-- ✅ room_types (5 room categories)
-- ✅ subscription_plans (Basic, Pro, Business)
-- ✅ plan_features (detailed feature lists)
-- ✅ credit_packages (credit purchasing)
-- ✅ budget_ranges (4 budget options)
```
**Expected Result**: `Subscription and pricing tables created successfully! ✅`

---

### Step 4: Journey & Content Tables
**File**: `scripts/04-journey-content-tables.sql`
```sql
-- Creates:
-- ✅ journey_steps (12-step user journey)
-- ✅ onboarding_content (dynamic onboarding text)
-- ✅ app_configuration (app settings)
-- ✅ ui_content (all text content)
-- ✅ trust_metrics (social proof)
```
**Expected Result**: `Journey and content management tables created successfully! ✅`

---

## 🔍 Verification Steps

After executing all scripts, run this verification query:

```sql
-- Verify all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'style_categories',
        'style_reference_images', 
        'furniture_categories',
        'furniture_style_variations',
        'room_types',
        'subscription_plans',
        'plan_features',
        'budget_ranges',
        'journey_steps',
        'app_configuration'
    )
ORDER BY tablename;
```

**Expected**: 10+ tables listed

---

## 📊 Sample Data Verification

Verify sample data was populated:

```sql
-- Check style categories
SELECT COUNT(*) as style_count FROM style_categories;
-- Expected: 6 rows

-- Check furniture categories  
SELECT COUNT(*) as furniture_count FROM furniture_categories;
-- Expected: 6 rows

-- Check subscription plans
SELECT COUNT(*) as plan_count FROM subscription_plans;
-- Expected: 3 rows

-- Check budget ranges
SELECT COUNT(*) as budget_count FROM budget_ranges;  
-- Expected: 4 rows

-- Check journey steps
SELECT COUNT(*) as journey_count FROM journey_steps;
-- Expected: 12 rows
```

---

## 🎯 Success Criteria

✅ **All scripts executed without errors**  
✅ **10+ database tables created**  
✅ **Sample data populated (25+ rows)**  
✅ **RLS policies active**  
✅ **Indexes created for performance**

---

## 🚨 Troubleshooting

### If you get permission errors:
1. Ensure you're logged into the correct Supabase project
2. Check that you have admin access to the project
3. Verify the project ID matches: `xmkkhdxhzopgfophlyjd`

### If tables already exist:
- Scripts use `CREATE TABLE IF NOT EXISTS` - safe to re-run
- Sample data uses `ON CONFLICT DO NOTHING` - safe to re-run

### If foreign key errors occur:
- Execute scripts in the exact order specified
- Each script depends on tables from previous scripts

---

## 📱 Next Steps After Database Setup

1. **Update Mobile App Services** to fetch from database
2. **Upload Image Assets** for style and furniture galleries  
3. **Test Database Integration** with mobile app
4. **Run Comprehensive Tests** to verify everything works

---

**Total Execution Time**: ~5 minutes  
**Tables Created**: 10+ core tables  
**Sample Records**: 50+ populated records  
**Status**: Ready for mobile app integration ✅