# 🚀 Compozit Vision - Setup Guide

## ⚠️ CRITICAL: Database Setup Required First

The Supabase registration error you're seeing is because the database tables haven't been created yet. **You must complete the database setup before testing the app.**

## 📋 Step-by-Step Setup

### 1. Database Setup (REQUIRED - Do This First!)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/xmkkhdxhzopgfophlyjd

2. **Open the SQL Editor** (left sidebar)

3. **Run the Schema**: Copy and paste the entire contents of `supabase-schema.sql` into the SQL editor and execute it.

   ```sql
   -- This will create:
   -- ✅ profiles table (for user accounts)
   -- ✅ projects table (for user projects) 
   -- ✅ designs table (for AI-generated designs)
   -- ✅ products table (for furniture catalog)
   -- ✅ orders table (for purchases)
   -- ✅ analytics_events table (for tracking)
   -- ✅ Row Level Security policies
   -- ✅ Sample product data
   ```

4. **Verify Setup**: After running the SQL, you should see these tables in your Supabase Table Editor:
   - `profiles`
   - `projects`
   - `designs` 
   - `products`
   - `orders`
   - `analytics_events`

### 2. Environment Variables (Already Configured)

Your `.env` file is properly configured with:
- ✅ Supabase URL and keys
- ✅ Stripe test keys
- ✅ Database connection

### 3. Test the Setup

**Option A: Automated Verification**
```bash
cd mobile
node scripts/verify-database.js
```

**Option B: Manual Test**
1. Start the app: `npm start`
2. Try creating an account
3. If you see "Database setup incomplete" error, return to Step 1

## 🐛 Common Issues & Solutions

### "Supabase registration error: Error: Failed to create user profile"
**Solution**: Run the database schema (Step 1 above)

### "relation 'profiles' does not exist"
**Solution**: The SQL schema wasn't executed properly. Re-run Step 1.

### App crashes on authentication
**Solution**: Ensure all database tables exist and RLS policies are enabled.

## 🧪 Testing Checklist

After database setup, test each journey segment:

### 1. **Onboarding Flow** ✅
- [ ] Screen 1: AI features introduction
- [ ] Screen 2: Style selection (up to 2 styles)
- [ ] Screen 3: Professional features

### 2. **Plan Selection** ✅
- [ ] Paywall shows 3 plans: Basic ($19), Pro ($29), Business ($49)
- [ ] Can select paid plan or continue with free credits
- [ ] Plan selection is saved and tracked

### 3. **Project Setup** ✅
- [ ] Photo capture screen
- [ ] Optional descriptions
- [ ] Furniture preferences
- [ ] Budget selection

### 4. **Modern Authentication** ✅
- [ ] Single form for login/signup
- [ ] No mode switching buttons
- [ ] Shows "Continue" button
- [ ] Attempts login first, then registration
- [ ] Creates user profile in database

### 5. **Payment Flow** ✅
- [ ] Paid plans → Checkout screen
- [ ] Free tier → Direct to processing
- [ ] Stripe integration ready
- [ ] Apple Pay ready (iOS)

## 🔧 Development Commands

```bash
# Start the app
npm start

# Run tests
npm test

# Verify database setup
node scripts/verify-database.js

# Test user journey manually
node scripts/test-user-journey.js

# Build for iOS
npm run ios

# Build for Android  
npm run android
```

## 📊 Database Schema Overview

```
profiles (user accounts)
├── id (links to auth.users)
├── email
├── subscription_tier (free/basic/pro/business)
├── credits_remaining (starts at 3 for free users)
└── stripe_customer_id (for payments)

projects (user projects)
├── user_id → profiles.id
├── room_type, style_preferences
└── original_images

designs (AI-generated results)  
├── project_id → projects.id
├── generated_image_url
└── products (furniture suggestions)

products (furniture catalog)
├── name, brand, base_price
├── style_tags (for AI matching)
└── images, ar_model_url

orders (purchases)
├── user_id → profiles.id  
├── stripe_payment_intent_id
└── items (purchased products)
```

## 🚨 Current Status

- ✅ **App Code**: Modern auth, payment flow, UI complete
- ✅ **Environment**: Supabase keys configured
- ❌ **Database**: **NEEDS SETUP** (run `supabase-schema.sql`)
- ❌ **Testing**: **BLOCKED** until database is ready

## 🎯 Next Steps

1. **URGENT**: Run database schema in Supabase
2. Test authentication flow
3. Test payment integration  
4. Deploy to staging
5. Add real product data

---

**⚡ Quick Start**: Run the database schema first, then `npm start` to test the app!