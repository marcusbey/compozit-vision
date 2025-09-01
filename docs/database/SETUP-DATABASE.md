# Database Setup Instructions

## Step 1: Populate Subscription Plans

To populate your database with subscription plans, you need to run the database population script.

### Prerequisites
- Supabase project set up
- Service role key from your Supabase dashboard

### Get Your Supabase Credentials

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Service Role Key** (secret key - keep this secure!)

### Run the Database Population Script

```bash
# 1. Set your environment variables
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key-here"

# 2. Navigate to the mobile directory
cd mobile

# 3. Run the population script
node populate-database.js
```

### Expected Output

If successful, you should see:
```
🚀 Starting database population...
📊 Checking current subscription plans...
📋 Found 0 existing plans
📝 Inserting new subscription plans...
✅ Successfully inserted 3 subscription plans:
  - Basic: $19/month (50 designs)
  - Pro: $29/month (200 designs)
  - Enterprise: $99/month (Unlimited designs)
🔍 Verifying inserted data...
✅ Database verification successful! 3 active plans found.
🧪 Testing app database connection...
✅ App database test successful! Plans available:
  - Basic: $19/month 
    Features: 5 features listed
  - Pro: $29/month (Popular)
    Features: 6 features listed
  - Enterprise: $99/month 
    Features: 6 features listed

🎉 Database population completed successfully!
📱 Your app should now load subscription plans from the database.
🔄 Restart your app to see the changes.
```

### Troubleshooting

**Error: "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY"**
- Make sure you've exported the environment variables in your current terminal session
- Check that the URLs don't contain the placeholder text

**Error: "connection refused" or "unauthorized"**
- Verify your SUPABASE_URL is correct
- Make sure you're using the SERVICE_ROLE key, not the ANON key
- Check that your Supabase project is active

**Error: "table doesn't exist"**
- Run your database migration scripts first
- Ensure the `subscription_plans` table exists in your database

## Step 2: Test the App

1. **Restart your React Native app**
   ```bash
   npm start
   ```

2. **Navigate to the PaywallScreen**
   - You should now see the subscription plans loaded from the database
   - Plans should show: Basic ($19), Pro ($29), Enterprise ($99)

3. **Verify the data**
   - Each plan should show the correct price and features
   - The "Pro" plan should have a "Most Popular" badge
   - All plans should be clickable

## Step 3: Next Steps

Once the database is populated:

1. ✅ **Database populated with plans**
2. 🔄 **Test plan loading in app**
3. 🎯 **Set up Stripe products and prices**
4. 💳 **Implement payment processing**

---

## Verification Checklist

- [ ] Database script runs without errors
- [ ] 3 subscription plans inserted into database
- [ ] App displays plans from database (not hardcoded)
- [ ] Plan features and prices display correctly
- [ ] "Most Popular" badge shows on Pro plan
- [ ] Plans are clickable and navigate to checkout

If all items are checked, your database is ready for the next phase: Stripe integration!