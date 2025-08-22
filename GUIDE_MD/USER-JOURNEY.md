# Compozit Vision - Complete User Journey

## Overview
This document outlines the complete user experience based on our implemented backend infrastructure, database schema, and service layer.

---

## 🎯 Phase 1: Onboarding & Authentication

### 1. App Download & Launch
- User downloads from App Store/Google Play
- Opens app → sees welcome screen with brand introduction
- Authentication options:
  - **Sign Up** with email/password
  - **Sign In** for returning users
  - **Continue with Google** (OAuth)
  - **Continue with Apple** (OAuth)

### 2. Account Creation Process
```typescript
// Backend Implementation:
AuthService.signUp({
  email: "user@example.com",
  password: "secure_password",
  fullName: "John Doe"
})

// What happens:
// 1. Supabase Auth creates user account
// 2. Profile created in profiles table with:
//    - subscription_tier: 'free'
//    - credits_remaining: 3
// 3. Stripe customer created
// 4. Analytics event tracked: 'user_signed_up'
```

**New User Benefits:**
- ✅ 3 free design credits
- ✅ Access to basic styles
- ✅ Mobile app access
- ✅ Email support

---

## 🏠 Phase 2: Project Creation

### 3. First Project Setup
**User Input Required:**
- **Project Name**: "Living Room Redesign"
- **Room Type**: Living Room, Bedroom, Kitchen, etc.
- **Room Dimensions**: Length x Width x Height
- **Budget Range**: $500-$1000, $1000-$3000, $3000-$5000, $5000+
- **Style Preferences**: Modern, Traditional, Scandinavian, Industrial
- **Location**: ZIP code for shipping/pricing

```typescript
// Database Storage (projects table):
{
  user_id: "uuid",
  name: "Living Room Redesign",
  room_type: "living_room",
  room_dimensions: { width: 12, length: 16, height: 9, unit: "ft" },
  budget_min: 1000,
  budget_max: 3000,
  style_preferences: ["modern", "scandinavian"],
  location_data: { zip_code: "10001", city: "New York", state: "NY" },
  status: "draft"
}
```

### 4. Image Upload Process
**Options:**
- **Take Photo**: Camera integration for real-time capture
- **Upload from Gallery**: Select existing room photos
- **Multiple Angles**: Support for 3-5 images per room

**Processing:**
- Images uploaded to Supabase Storage
- Metadata extracted and stored
- Stored in `projects.original_images` array
- Image optimization for AI processing

---

## ✨ Phase 3: AI Design Generation

### 5. Design Generation Flow
**User Actions:**
1. Reviews uploaded images
2. Refines style preferences
3. Taps "Generate Design"

**Credit Check & Consumption:**
```typescript
// Backend Process:
if (!AuthService.hasCredits()) {
  return showUpgradePrompt();
}

// Consume 1 credit
const success = await AuthService.consumeCredits(1);
if (!success) {
  return showInsufficientCreditsError();
}

// Proceed with AI generation
```

**AI Processing Steps:**
1. **Image Analysis**: Room layout, existing furniture detection
2. **Style Application**: Apply selected design style
3. **Product Matching**: Query products table for compatible items
4. **3D Visualization**: Generate design preview
5. **Cost Calculation**: Calculate total estimated cost

### 6. Design Results Presentation
**User Sees:**
- **3D Visualization**: Interactive room design
- **Product List**: Furniture and decor items with details
- **Pricing Breakdown**: Individual prices + total cost
- **Style Information**: Applied design principles
- **Purchase Options**: Direct links to partner retailers

```typescript
// Database Storage (designs table):
{
  project_id: "uuid",
  style: "modern_scandinavian",
  generated_image_url: "supabase_storage_url",
  products: [
    { product_id: "sofa_123", quantity: 1, placement_data: {...} },
    { product_id: "table_456", quantity: 1, placement_data: {...} }
  ],
  estimated_cost: 2450.00,
  processing_time_ms: 15000
}
```

---

## 💳 Phase 4: Monetization & Credit Management

### 7. Credit Exhaustion Flow
**Trigger**: User attempts 4th design generation
**Prompt**: "You've used all your free credits!"

**Options Presented:**
#### Credit Top-ups (One-time purchase)
- **25 Credits**: $9.99 ($0.40/design) - Save 20%
- **50 Credits**: $18.99 ($0.38/design) - Save 24%  
- **100 Credits**: $35.99 ($0.36/design) - Save 28%

#### Monthly Subscriptions
- **Basic Plan**: $19/month
  - 50 designs/month
  - Basic style library
  - Standard processing
  - Email support

- **Pro Plan**: $29/month  
  - 200 designs/month
  - Premium styles
  - Priority processing
  - Advanced customization
  - High-res exports

- **Business Plan**: $49/month
  - Unlimited designs
  - Complete style library
  - Fastest processing
  - Team collaboration (10 users)
  - API access
  - Dedicated support

### 8. Payment Processing
```typescript
// Stripe Integration:
// For Credit Purchase:
const paymentIntent = await StripeService.purchaseCredits(
  customerId,
  "credits_25_pack"
);

// For Subscription:
const subscription = await StripeService.createSubscription(
  customerId,
  "pro_monthly_price_id"
);

// Database Updates:
// user_credits table updated
// profiles.subscription_tier updated
// Analytics event tracked
```

---

## 🛍️ Phase 5: Shopping & Purchase Journey

### 9. Product Purchase Flow
**User Actions:**
1. **Review Design**: Examines generated room design
2. **Product Details**: Taps individual items for specs/reviews
3. **Customize**: Adjusts quantities or removes items
4. **Shop This Look**: Initiates purchase process

**Order Creation:**
```typescript
// Database (orders table):
{
  user_id: "uuid",
  project_id: "uuid",
  design_id: "uuid",
  items: [
    { product_id: "sofa_123", quantity: 1, price: 899.99, partner: "ikea" },
    { product_id: "table_456", quantity: 1, price: 249.99, partner: "amazon" }
  ],
  subtotal: 1149.98,
  tax_amount: 91.99,
  total_amount: 1241.97,
  status: "pending"
}
```

**Partner Integration:**
- **IKEA**: Direct API integration for real-time pricing
- **Amazon**: Affiliate links with commission tracking
- **Wayfair**: Product matching and referral system

### 10. Order Management
**Features:**
- Order tracking and status updates
- Shipping notifications
- Commission tracking for revenue
- Return/exchange support through partners

---

## 📊 Phase 6: Advanced Features & Management

### 11. Project Management
**User Capabilities:**
- **Multiple Projects**: Create unlimited room projects
- **Design History**: View all generated designs
- **Favorites**: Save preferred designs
- **Sharing**: Send designs to family/friends
- **Collaboration**: Team features (Business plan)

### 12. Account & Subscription Management
**Profile Management:**
- View current subscription tier
- Usage analytics (designs generated, credits used)
- Payment method management
- Billing history

**Subscription Controls:**
- Upgrade/downgrade plans
- Cancel subscription (continues until period end)
- Reactivate cancelled subscriptions
- View plan benefits and limits

### 13. Analytics & Insights
**User Dashboard:**
- **Design Activity**: Monthly usage patterns
- **Cost Savings**: Estimated vs. actual spending
- **Style Evolution**: Preference tracking over time
- **Project Progress**: Room completion status

**Backend Tracking:**
```typescript
// Analytics events captured:
supabaseHelpers.trackEvent(userId, 'design_generated', {
  style: 'modern',
  processing_time: 15000,
  estimated_cost: 2450,
  credit_source: 'subscription'
});
```

---

## 🔄 User Retention & Engagement

### 14. Notification System
**Push Notifications:**
- Credit balance warnings
- New style releases
- Seasonal design trends
- Subscription renewal reminders

### 15. Referral Program
**Incentives:**
- Give 5 credits, get 5 credits
- Successful referrals unlock premium styles
- Business plan users get team discounts

---

## 📈 Success Metrics & KPIs

### Key Performance Indicators
- **User Acquisition**: Sign-ups per month
- **Activation Rate**: Users who generate first design
- **Conversion Rate**: Free → Paid subscriber conversion
- **Retention**: Monthly active users (MAU)
- **Revenue Metrics**: ARPU, LTV, Churn rate
- **Engagement**: Designs per user, session duration

### Revenue Streams
1. **Subscriptions**: $19-$49/month recurring revenue
2. **Credit Sales**: $9.99-$35.99 one-time purchases  
3. **Partner Commissions**: 4-6% on furniture sales
4. **Premium Features**: AR visualization, custom styles

---

## Technical Implementation Status

### ✅ Completed Infrastructure
- **Authentication**: Complete signup/signin flow
- **Database**: All tables created and accessible
- **Payments**: Stripe products and subscriptions configured
- **Services**: TypeScript services for all core functions
- **Security**: Row Level Security policies implemented

### 🔄 Next Phase: UI Implementation
- Mobile app screens for each journey step
- Real-time design generation interface
- Payment and subscription management UI
- AI model integration for image processing

---

*This user journey leverages our complete backend infrastructure with Supabase, Stripe, and MCP integrations to deliver a seamless, monetizable experience.*