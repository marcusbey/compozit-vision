# Subscription & Stripe Integration PRD

## Executive Summary

Implement a complete database-driven subscription system with Stripe payment processing for Compozit Vision. This will replace any hardcoded subscription data and enable real payment processing for user subscriptions.

## Current State Analysis

### ✅ What's Already Implemented
- Database schema for `subscription_plans` table
- DatabaseService with `getSubscriptionPlans()` method
- ContentStore with subscription plan loading logic
- PaywallScreen with subscription plan display
- CheckoutScreen UI (mock implementation)
- ProcessingScreen navigation flow

### ❌ What's Missing
1. **Database populated with subscription plans**
2. **Stripe products and prices creation**
3. **Real Stripe payment processing**
4. **Webhook handlers for subscription events**
5. **Error handling and retry logic**

## Detailed Requirements

### Task 1: Database-Driven Subscription Plans
**Priority**: High | **Effort**: 2 hours

#### Acceptance Criteria
- [ ] Subscription plans table populated with real data
- [ ] Plans load from database on PaywallScreen mount
- [ ] Error states handled gracefully
- [ ] Loading states display correctly

#### Implementation Details
```sql
-- Sample subscription plans data
INSERT INTO subscription_plans (id, stripe_product_id, stripe_price_id, display_name, description, price_amount, billing_period, designs_included, is_popular, is_active, display_order, badge_text, features) VALUES
('basic', 'prod_basic123', 'price_basic123', 'Basic', 'Perfect for homeowners', 19.00, 'month', 50, false, true, 1, NULL, '["50 AI designs per month", "Standard support", "HD downloads"]'),
('pro', 'prod_pro123', 'price_pro123', 'Pro', 'Best for professionals', 29.00, 'month', 200, true, true, 2, 'Most Popular', '["200 AI designs per month", "Priority support", "4K downloads", "Commercial license"]'),
('enterprise', 'prod_ent123', 'price_ent123', 'Enterprise', 'For design agencies', 99.00, 'month', -1, false, true, 3, 'Unlimited', '["Unlimited AI designs", "White-label options", "API access", "Dedicated support"]');
```

#### Testing
- Verify plans load on app start
- Test error handling with database disconnection
- Confirm UI displays all plan features correctly

### Task 2: Stripe Product & Price Setup via MCP
**Priority**: High | **Effort**: 3 hours

#### Acceptance Criteria
- [ ] Stripe products created via MCP
- [ ] Stripe prices linked to products
- [ ] Database updated with Stripe IDs
- [ ] Stripe dashboard shows correct products

#### Implementation Steps
1. **Use MCP to create Stripe products**
   ```bash
   # Connect to Stripe via MCP
   stripe products create \
     --name="Compozit Vision Basic" \
     --description="Perfect for homeowners - 50 AI designs per month"
   
   stripe products create \
     --name="Compozit Vision Pro" \
     --description="Best for professionals - 200 AI designs per month"
   
   stripe products create \
     --name="Compozit Vision Enterprise" \
     --description="For design agencies - Unlimited AI designs"
   ```

2. **Create recurring prices**
   ```bash
   stripe prices create \
     --product=prod_xxx \
     --unit-amount=1900 \
     --currency=usd \
     --recurring[interval]=month
   ```

3. **Update database with Stripe IDs**

#### Testing
- Verify products appear in Stripe dashboard
- Confirm prices are set correctly
- Test database queries return Stripe IDs

### Task 3: Stripe Payment Processing Implementation
**Priority**: High | **Effort**: 4 hours

#### Acceptance Criteria
- [ ] CheckoutScreen initiates real Stripe payments
- [ ] Payment success/failure handling
- [ ] User subscription status updates
- [ ] Payment methods (card, Apple Pay) working
- [ ] Error handling with user-friendly messages

#### Implementation Details

**3.1 Update CheckoutScreen with real Stripe integration**
```typescript
// Install Stripe React Native SDK
npm install @stripe/stripe-react-native

// In CheckoutScreen.tsx
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';

const handleStripePayment = async () => {
  setIsProcessing(true);
  try {
    // Create payment intent on backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedPlan.id,
        customerEmail: userEmail,
      }),
    });
    
    const { clientSecret } = await response.json();
    
    // Present payment sheet
    const { error } = await presentPaymentSheet();
    
    if (!error) {
      handlePaymentSuccess({ method: 'stripe', planId: selectedPlan.id });
    } else {
      handlePaymentError(error.message);
    }
  } catch (error: any) {
    handlePaymentError(error.message || 'Payment failed');
  } finally {
    setIsProcessing(false);
  }
};
```

**3.2 Create backend API endpoints**
```typescript
// /api/create-payment-intent.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, customerEmail } = req.body;
    
    // Get plan from database
    const plan = await DatabaseService.getSubscriptionPlan(planId);
    
    // Create or retrieve customer
    let customer = await stripe.customers.list({ email: customerEmail });
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({ email: customerEmail });
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
}
```

#### Testing
- Test successful payment flow
- Test payment failure scenarios
- Test Apple Pay integration
- Verify subscription creation in Stripe

### Task 4: Webhook Implementation for Subscription Events
**Priority**: High | **Effort**: 2 hours

#### Acceptance Criteria
- [ ] Webhook endpoint handles subscription events
- [ ] User subscription status updates in database
- [ ] Failed payment handling
- [ ] Subscription cancellation handling

#### Implementation Details

**4.1 Create webhook endpoint**
```typescript
// /api/stripe-webhook.ts
import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook error: ${error.message}`);
  }
}
```

**4.2 Database subscription tracking**
```sql
-- Add subscription tracking table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  designs_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Testing
- Test webhook with Stripe CLI
- Verify database updates on subscription changes
- Test failed payment scenarios

### Task 5: End-to-End Payment Flow Testing
**Priority**: High | **Effort**: 2 hours

#### Acceptance Criteria
- [ ] Complete user journey from plan selection to active subscription
- [ ] Error scenarios handled gracefully
- [ ] Mobile and web compatibility
- [ ] Performance testing under load

#### Test Cases

**5.1 Happy Path Testing**
1. User selects subscription plan
2. Checkout screen loads with correct plan details
3. Payment succeeds via Stripe
4. User subscription activates
5. User can access premium features

**5.2 Error Scenario Testing**
1. Payment declined by bank
2. Network connectivity issues
3. Stripe service unavailable
4. Invalid payment method

**5.3 Edge Cases**
1. User cancels during payment
2. Duplicate subscription attempts
3. Plan changes mid-payment
4. Webhook delivery failures

## Implementation Timeline

### Phase 1 (Day 1): Database & Stripe Setup
- [ ] Populate subscription plans in database
- [ ] Create Stripe products and prices via MCP
- [ ] Update database with Stripe IDs
- [ ] Test plan loading in app

### Phase 2 (Day 2): Payment Processing
- [ ] Implement Stripe SDK in CheckoutScreen
- [ ] Create backend API endpoints
- [ ] Test payment flow end-to-end
- [ ] Handle error scenarios

### Phase 3 (Day 3): Webhooks & Polish
- [ ] Implement Stripe webhooks
- [ ] Add subscription status tracking
- [ ] Comprehensive testing
- [ ] UI/UX improvements

## Success Metrics

### Technical Metrics
- [ ] 100% payment success rate in test environment
- [ ] < 3 second checkout completion time
- [ ] Zero critical errors in payment flow
- [ ] 100% webhook delivery success

### Business Metrics
- [ ] Subscription conversion tracking enabled
- [ ] Payment failure reasons logged
- [ ] User subscription lifecycle tracked
- [ ] Revenue reporting functional

## Risk Mitigation

### High Risks
1. **Stripe Integration Complexity**
   - Mitigation: Use official Stripe SDKs and follow documentation
   - Fallback: Implement basic card processing first

2. **Webhook Reliability**
   - Mitigation: Implement retry logic and idempotency
   - Monitoring: Track webhook delivery rates

3. **Mobile Payment Issues**
   - Mitigation: Extensive device testing
   - Support: Clear error messages and fallbacks

### Medium Risks
1. **Database Performance**
   - Mitigation: Add proper indexes
   - Monitoring: Query performance tracking

2. **Security Concerns**
   - Mitigation: Follow Stripe security best practices
   - Validation: All user inputs sanitized

## Post-Implementation Monitoring

### Key Metrics to Track
- Payment success/failure rates
- Subscription activation rates
- Webhook delivery success
- Database query performance
- User experience metrics

### Alerting Setup
- Payment failure rate > 5%
- Webhook delivery failure > 1%
- Database query timeout > 2s
- Critical error in payment flow

## Rollback Plan

### Immediate Rollback Triggers
- Payment success rate < 90%
- Critical security vulnerability
- Database corruption
- Stripe API unavailable

### Rollback Procedure
1. Disable new subscription signups
2. Revert to previous app version
3. Notify users of temporary service interruption
4. Fix issues in staging environment
5. Gradual re-deployment with monitoring

## Conclusion

This PRD provides a comprehensive roadmap for implementing a production-ready subscription system with Stripe integration. The phased approach ensures systematic implementation with proper testing at each stage.

Success depends on:
1. **Thorough testing** at each phase
2. **Proper error handling** for all edge cases
3. **Security best practices** throughout
4. **Performance monitoring** from day one
5. **User experience** as the top priority

The implementation will transform Compozit Vision from a demo app to a production-ready SaaS platform capable of processing real payments and managing user subscriptions at scale.