# 🚨 URGENT: Database Tables Missing - Fix Required

## The Problem
Your app is crashing because the following database tables don't exist:
- ❌ `public.user_reference_images` 
- ❌ `public.user_color_palettes`

## Quick Fix Instructions

### Option 1: Use Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Copy ALL content from: `scripts/create-reference-system-tables-no-samples.sql`
5. Paste it into the SQL Editor
6. Click **Run**
7. You should see: "Reference Library & Color Extraction System - Database Schema Created Successfully!"

**Note**: Use the `-no-samples.sql` version which doesn't require a specific user UUID to exist.

### Option 2: Use Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db execute -f scripts/create-reference-system-tables-fixed.sql
```

## What This Fixes

1. **Missing Tables Error**: Creates all required tables for the reference system
2. **Sort Order Error**: The `-fixed.sql` version includes the missing `sort_order` column
3. **Foreign Key Dependencies**: Properly orders table creation to avoid FK errors

## Tables Created

- ✅ `project_categories` - Design categories (Interior, Garden, etc.)
- ✅ `user_reference_images` - User's uploaded reference images
- ✅ `user_color_palettes` - Color palettes (user-created and presets)
- ✅ `reference_usage_history` - Tracks how references are used
- ✅ `ai_processing_jobs` - AI job queue and status
- ✅ `user_favorites` - User's favorite items

## Verify Success

After running the SQL, test by:
1. Refreshing your app
2. Going to the References & Colors screen
3. The errors should be gone!

## Why This Happened

The app code expects these tables to exist but they were never created in your database. This is a one-time setup that needs to be done for the new features to work.

## Important Notes

- Use `create-reference-system-tables-fixed.sql` NOT the original one
- The script will DROP and recreate tables if they exist (safe for new setup)
- Sample color palettes are included for testing
- Row Level Security (RLS) is configured for user data protection

## Still Having Issues?

1. Check Supabase logs for any SQL errors
2. Make sure you're using the `-fixed.sql` version
3. Try running the script in smaller chunks if needed
4. Contact support with the specific error message

---

**File to run**: `scripts/create-reference-system-tables-fixed.sql`  
**Expected result**: All 6 tables created with success message