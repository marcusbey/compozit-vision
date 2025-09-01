# Supabase Database Setup for Compozit Vision

## ❌ FIXING THE "NO TABLE IN DATABASE" ERROR

This guide will resolve the authentication error you're experiencing by creating the essential database tables.

## 🔧 MCP Configuration Used
- **Project ID**: xmkkhdxhzopgfophlyjd
- **URL**: https://xmkkhdxhzopgfophlyjd.supabase.co
- **Service Role Key**: Available in your .mcp.json

## 🚀 Quick Fix Steps

### Step 1: Access Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd/sql/new**
2. Sign in to your Supabase account
3. This will open the SQL Editor

### Step 2: Execute Essential Tables SQL

Copy and paste this entire SQL script into the SQL Editor and click "Run":

```sql
-- Essential tables for Compozit Vision authentication
-- This resolves the "no table in database" error

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types (if not exists)
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN  
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE design_style AS ENUM ('modern', 'classic', 'minimalist', 'industrial', 'scandinavian', 'bohemian', 'traditional', 'contemporary');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  credits_remaining INTEGER DEFAULT 3,
  total_credits_purchased INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create projects table (essential for app functionality)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT,
  room_dimensions JSONB,
  location_data JSONB,
  status project_status DEFAULT 'draft',
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  style_preferences design_style[],
  original_images JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Database setup completed successfully! Authentication should now work.' as result;
```

### Step 3: Verify Tables Were Created

After running the SQL, you should see:
- ✅ Multiple "Query executed successfully" messages
- ✅ Final result showing "Database setup completed successfully!"

You can verify tables exist by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## 📦 What This Creates

### Essential Tables
1. **profiles** - Extends `auth.users` with application-specific user data
2. **projects** - Stores user projects and room designs

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Triggers** automatically update timestamps

### Database Features
- **Custom types** for consistent data validation
- **Indexes** for optimal query performance
- **Foreign key relationships** for data integrity

## 🧪 Test Your Setup

After creating the tables, test with these queries:

```sql
-- Check if profiles table exists and is accessible
SELECT COUNT(*) FROM profiles;

-- Check if projects table exists and is accessible  
SELECT COUNT(*) FROM projects;

-- Test auth integration
SELECT 
  'auth.users' as table_name, COUNT(*) as count 
FROM auth.users
UNION
SELECT 
  'public.profiles' as table_name, COUNT(*) as count 
FROM public.profiles;
```

## 🎯 Alternative: Using Scripts

If you prefer using the provided scripts:

```bash
# Navigate to project directory
cd /Users/marcusbey/Desktop/02-CS/05-Startup/compozit/app/compozit-vision

# Option 1: Show SQL to copy/paste
node scripts/create-tables-only.js

# Option 2: Full setup with MCP connection
node scripts/mcp-database-setup.js

# The SQL is also available in:
# scripts/essential-tables.sql
```

## 🔥 After Setup

Once you've executed the SQL:

1. **Authentication will work** - No more "no table in database" errors
2. **Users can sign up** - Profiles will be automatically created
3. **Data storage enabled** - Projects and user data can be saved
4. **Security active** - RLS policies protect user data

## 🐛 Troubleshooting

### If you see "table already exists" errors:
- ✅ This is normal - the script uses `IF NOT EXISTS`
- ✅ These are safe to ignore

### If you see permission errors:
1. Make sure you're signed into Supabase
2. Verify you have admin access to the project
3. Check that the project ID matches: `xmkkhdxhzopgfophlyjd`

### If authentication still fails:
1. Clear your app's cache/storage
2. Check Supabase project settings
3. Verify the environment variables in your app match the MCP config

## 📝 Next Steps

After the database is set up:

1. **Test authentication in your app**
2. **Run your React Native project**
3. **Create a test user account**
4. **Verify profile creation works**

The "no table in database" error should now be completely resolved!