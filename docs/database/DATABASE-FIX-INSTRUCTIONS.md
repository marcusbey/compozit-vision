# 🔧 Database Schema Fix Instructions

## Problem
The error shows that the `public.user_reference_images` table doesn't exist in your Supabase database, which is causing the reference images feature to fail.

## Solution
You need to create the missing database tables by running the provided SQL schema.

## Step-by-Step Fix

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 2. Run Database Schema
1. Copy the entire contents of this file: `scripts/create-reference-system-tables-fixed.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute all the SQL commands

**Note**: Use the `-fixed.sql` version which includes the missing `sort_order` column in the `user_color_palettes` table.

### 3. Verify Tables Created
The following tables should now exist in your database:
- ✅ `project_categories`
- ✅ `user_reference_images`
- ✅ `user_color_palettes` 
- ✅ `reference_usage_history`
- ✅ `ai_processing_jobs`
- ✅ `user_favorites`

### 4. Test the Fix
1. Restart your React Native app
2. Navigate to the reference images section
3. The error should be resolved

## What This Schema Adds

### Pinterest-Style Reference System
- **User Reference Images**: Users can upload and manage their own reference images
- **Curated Reference Library**: Pre-populated with design inspiration
- **Advanced Filtering**: Filter by style, room type, mood, and more
- **Favorite System**: Users can save their favorite references

### Color Palette Management
- **Extracted Palettes**: Automatically extract colors from reference images
- **User-Created Palettes**: Users can create custom color combinations
- **Preset Palettes**: Professional color schemes for different styles
- **Smart Recommendations**: AI-powered palette suggestions

### AI Processing Integration
- **Job Tracking**: Monitor AI processing progress in real-time
- **Usage History**: Track how references influence final designs
- **Analytics**: Understand user preferences and popular combinations

## New Navigation Flow

After the fix, the app will support this enhanced flow:

```
Style Selection → Reference Images → Color Palettes → AI Processing → Results
                     ↓                    ↓
               Pinterest-style         Separate color
               image filtering         palette screen
```

## Files Modified
- ✅ `ReferenceImagesScreen.tsx` - Pinterest-style reference selection
- ✅ `ColorPalettesScreen.tsx` - Dedicated color palette management
- ✅ `SafeJourneyNavigator.tsx` - Added new screen routes
- ✅ Database schema with full reference and color system

## Need Help?
If you encounter any issues:
1. Check the Supabase logs for SQL execution errors
2. Verify all tables were created successfully 
3. Ensure Row Level Security (RLS) policies are active
4. Test with a fresh user account to verify permissions

The new system provides a much richer user experience with Pinterest-style inspiration browsing and comprehensive color palette management!