# Stripe Integration Setup Guide

## Overview

This guide will help you set up Stripe payment processing for your subscription plans. We'll create products, configure pricing, and implement the payment flow.

## Phase 1: Stripe Account & Products Setup

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or sign in
3. Complete account verification
4. Switch to **Test Mode** for development

### Step 2: Get API Keys

1. In Stripe Dashboard → Developers → API keys
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Create Products and Prices

You can create products either via Stripe Dashboard or CLI. Here are both methods:

#### Method A: Stripe Dashboard (Recommended for beginners)

1. **Go to Products in Stripe Dashboard**

2. **Create Basic Plan:**
   - Click "Add Product"
   - Name: "Compozit Vision Basic"
   - Description: "Perfect for homeowners and personal projects"
   - Pricing Model: "Recurring"
   - Price: $19.00 USD
   - Billing Period: Monthly
   - Click "Save Product"
   - Copy the **Product ID** (starts with `prod_`) and **Price ID** (starts with `price_`)

3. **Create Pro Plan:**
   - Name: "Compozit Vision Pro"
   - Description: "Best for professionals and small design businesses"
   - Price: $29.00 USD
   - Billing Period: Monthly
   - Copy Product ID and Price ID

4. **Create Enterprise Plan:**
   - Name: "Compozit Vision Enterprise"
   - Description: "For design agencies and large teams"
   - Price: $99.00 USD
   - Billing Period: Monthly
   - Copy Product ID and Price ID

#### Method B: Stripe CLI (Advanced users)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Create products and prices
stripe products create \
  --name="Compozit Vision Basic" \
  --description="Perfect for homeowners and personal projects"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=1900 \
  --currency=usd \
  --recurring[interval]=month

stripe products create \
  --name="Compozit Vision Pro" \
  --description="Best for professionals and small design businesses"

stripe prices create \
  --product=prod_yyy \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month

stripe products create \
  --name="Compozit Vision Enterprise" \
  --description="For design agencies and large teams"

stripe prices create \
  --product=prod_zzz \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month
```

### Step 4: Update Database with Stripe IDs

Once you have the Stripe Product and Price IDs, update your database:

```bash
# Set your Supabase credentials
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-key"

# Run the update script
cd mobile && node update-stripe-ids.js
```

## Phase 2: Mobile App Integration

### Step 1: Install Stripe SDK

```bash
cd mobile
npm install @stripe/stripe-react-native
npx pod-install  # iOS only
```

### Step 2: Configure Environment Variables

Create or update your `.env` file:

```bash
# In mobile/.env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: App Configuration

The implementation files are already created. You just need to:

1. **Add Stripe Provider to App.tsx**
2. **Configure payment processing in CheckoutScreen**
3. **Set up webhook handling**

## Phase 3: Backend API Setup

### Step 1: Create API Endpoints

You'll need these endpoints:

1. **POST /api/create-payment-intent** - Create payment intent
2. **POST /api/stripe-webhook** - Handle Stripe events
3. **GET /api/subscription-status** - Check user subscription

### Step 2: Environment Variables for Backend

```bash
# Backend .env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Testing Checklist

### Database Tests
- [ ] Run `node populate-database.js` successfully
- [ ] Verify 3 plans in Supabase dashboard
- [ ] App loads plans from database

### Stripe Tests
- [ ] Products visible in Stripe dashboard
- [ ] Prices configured correctly ($19, $29, $99)
- [ ] Test mode enabled

### Payment Tests
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Payment succeeds and creates subscription
- [ ] Webhook receives events
- [ ] User subscription status updates

## Test Cards

Use these test cards for different scenarios:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Invalid Expiry: 4000 0000 0000 0069
```

## Next Steps

1. **Run the database population script** (see SETUP-DATABASE.md)
2. **Set up your Stripe account** and create products
3. **Update database with Stripe IDs**
4. **Install and configure Stripe SDK**
5. **Test the complete payment flow**

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native SDK](https://github.com/stripe/stripe-react-native)
- [Stripe Test Cards](https://stripe.com/docs/testing)

## Security Notes

🔒 **Important Security Reminders:**

1. **Never expose secret keys** in client-side code
2. **Use test keys** during development
3. **Validate webhooks** with signatures
4. **Use HTTPS** in production
5. **Store keys securely** in environment variables