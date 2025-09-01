# Compozit Vision - Comprehensive Asset Requirements

## Executive Summary

This document provides a complete inventory of visual assets needed for the Compozit Vision mobile application. After analyzing all 54 screen files across the application, we've identified specific asset requirements organized by screen, priority, and implementation phase.

**Total Assets Required**: 127 unique assets  
**Priority 1 (Essential)**: 45 assets  
**Priority 2 (Enhanced UX)**: 52 assets  
**Priority 3 (Polish)**: 30 assets  

---

## 🏠 **HomeScreen**

### Current State
- Uses basic text and simple TouchableOpacity components
- No visual assets except emoji placeholders (📸, ➕)
- Plain background color (#f8f9fa)

### Required Assets

#### **Background & Visual Appeal**
- **`home-hero-gradient.svg`** - Subtle geometric background pattern
  - **Goal**: Add visual interest to plain background
  - **Type**: Vector illustration
  - **Emotion**: Welcoming, professional warmth
  - **Specs**: SVG, scalable, opacity 5-10%
  - **Style**: Geometric shapes in brand colors

#### **Action Button Icons**
- **`camera-capture-icon.svg`** - Custom camera icon for photo action
  - **Goal**: Replace emoji with professional icon
  - **Type**: Vector icon
  - **Emotion**: Excitement, action-oriented
  - **Specs**: 24x24px, brand color (#C9A98C)

- **`project-plus-icon.svg`** - Custom project creation icon
  - **Goal**: Replace + emoji with design-focused icon
  - **Type**: Vector icon
  - **Emotion**: Creativity, possibility
  - **Specs**: 24x24px, brand color

#### **Project Cards Enhancement**
- **`project-card-pattern.svg`** - Subtle pattern for project cards
  - **Goal**: Add visual texture to project cards
  - **Type**: Vector pattern
  - **Emotion**: Organization, professionalism
  - **Specs**: Repeating pattern, subtle, low opacity

#### **Empty State**
- **`empty-projects-illustration.svg`** - Friendly illustration for no projects
  - **Goal**: Make empty state encouraging rather than barren
  - **Type**: Vector illustration
  - **Emotion**: Encouragement, potential
  - **Specs**: 200x150px, brand colors, friendly style

---

## 📸 **PhotoCaptureScreen**

### Current State
- Sophisticated camera interface with guides
- Uses Ionicons for camera controls
- Camera overlay with grid guides and corner markers
- High-quality photo analysis system

### Required Assets

#### **Hero Background**
- **`photo-capture-hero-video.mp4`** - Professional room photography showcase
  - **Goal**: Show AI-powered photo analysis in action
  - **Type**: Background video
  - **Emotion**: Technology, precision, capability
  - **Specs**: 1080p, 15-second loop, optimized for mobile
  - **Content**: Camera scanning room → AI processing → results

#### **Camera Interface Enhancement**
- **`camera-frame-overlay.svg`** - Professional camera frame overlay
  - **Goal**: Give camera a more professional feel
  - **Type**: Vector overlay
  - **Emotion**: Professionalism, precision
  - **Specs**: Full screen overlay, transparent center

- **`focus-reticle-animation.json`** - Animated focus indicator
  - **Goal**: Show intelligent focusing capability
  - **Type**: Lottie animation
  - **Emotion**: Smart technology, precision
  - **Specs**: 3-second loop, brand colors

#### **Photography Tips Enhancement**
- **`lighting-tip-icon.svg`** - Professional lighting indicator
- **`composition-tip-icon.svg`** - Composition guide icon  
- **`quality-tip-icon.svg`** - Quality assessment icon
  - **Goal**: Replace Ionicons with custom design-focused icons
  - **Type**: Vector icons
  - **Emotion**: Expertise, guidance
  - **Specs**: 16x16px, brand-colored

#### **Sample Photos**
- **`sample-modern-living.jpg`** - Professional modern living room
- **`sample-cozy-bedroom.jpg`** - Professional cozy bedroom
- **`sample-contemporary-kitchen.jpg`** - Professional kitchen
- **`sample-spa-bathroom.jpg`** - Professional bathroom
- **`sample-elegant-dining.jpg`** - Professional dining room
- **`sample-home-office.jpg`** - Professional home office
  - **Goal**: Provide high-quality sample photos for testing
  - **Type**: Professional photography
  - **Emotion**: Aspiration, quality, possibilities
  - **Specs**: 400x300px, WebP format, professionally lit and staged

#### **Quality Assessment**
- **`ai-quality-checker.json`** - Animated quality assessment visualization
  - **Goal**: Show AI analyzing photo quality
  - **Type**: Lottie animation  
  - **Emotion**: Intelligence, precision, care
  - **Specs**: 5-second animation, technical but friendly

---

## 🏛️ **CategorySelectionScreen**

### Current State
- Database-driven category selection
- Uses Ionicons for category icons
- Grid layout with category cards

### Required Assets

#### **Category Icons (Custom Set)**
- **`interior-design-icon.svg`** - Interior spaces icon
- **`garden-landscape-icon.svg`** - Garden/landscape icon
- **`surface-materials-icon.svg`** - Surfaces/materials icon
- **`furniture-objects-icon.svg`** - Furniture/objects icon
- **`exterior-architecture-icon.svg`** - Exterior/architecture icon
  - **Goal**: Replace generic Ionicons with design-specific icons
  - **Type**: Vector icons
  - **Emotion**: Specialization, expertise
  - **Specs**: 32x32px, consistent style, brand colors

#### **Category Background Images**
- **`interior-category-bg.jpg`** - Beautiful interior design showcase
- **`garden-category-bg.jpg`** - Stunning garden landscape
- **`surface-category-bg.jpg`** - Elegant surface materials
- **`furniture-category-bg.jpg`** - Stylish furniture pieces
- **`exterior-category-bg.jpg`** - Impressive exterior architecture
  - **Goal**: Add visual context to each category
  - **Type**: Professional photography
  - **Emotion**: Aspiration, quality, expertise
  - **Specs**: 400x200px, WebP, with gradient overlay capability

#### **Filter Enhancement**
- **`filter-all-icon.svg`** - All categories filter icon
- **`filter-featured-icon.svg`** - Featured items filter icon
- **`filter-popular-icon.svg`** - Popular selections filter icon
  - **Goal**: Visual filter indicators
  - **Type**: Vector icons
  - **Emotion**: Organization, clarity
  - **Specs**: 20x20px, consistent with category icons

---

## 🏠 **SpaceDefinitionScreen**

### Current State
- Room type selection interface
- Uses Ionicons for room types (bed, restaurant, etc.)

### Required Assets

#### **Room Type Icons (Custom Set)**
- **`living-room-icon.svg`** - Stylized living room icon
- **`bedroom-icon.svg`** - Elegant bedroom icon
- **`kitchen-icon.svg`** - Modern kitchen icon
- **`bathroom-icon.svg`** - Spa-like bathroom icon
- **`dining-room-icon.svg`** - Sophisticated dining icon
- **`home-office-icon.svg`** - Professional office icon
- **`hallway-icon.svg`** - Corridor/hallway icon
- **`outdoor-space-icon.svg`** - Patio/outdoor icon
  - **Goal**: Professional room type visualization
  - **Type**: Vector icons
  - **Emotion**: Sophistication, space planning
  - **Specs**: 48x48px, detailed but clean, brand colors

#### **Room Examples**
- **`living-room-example.jpg`** - Perfect living room example
- **`bedroom-example.jpg`** - Ideal bedroom setup
- **`kitchen-example.jpg`** - Dream kitchen design
- **`bathroom-example.jpg`** - Luxury bathroom
- **`dining-example.jpg`** - Elegant dining space
- **`office-example.jpg`** - Productive workspace
  - **Goal**: Show possibilities for each room type
  - **Type**: Professional photography
  - **Emotion**: Inspiration, possibilities
  - **Specs**: 300x200px, high-quality, diverse styles

#### **Space Planning Visualization**
- **`room-dimensions-overlay.svg`** - Measurement overlay graphic
  - **Goal**: Show precision in space planning
  - **Type**: Vector illustration
  - **Emotion**: Precision, professionalism
  - **Specs**: Overlay compatible, technical but approachable

---

## 🎨 **StyleSelectionScreen**

### Current State
- Grid of style cards
- Uses database for style information
- Some Unsplash placeholder images

### Required Assets

#### **Style Showcase Images**
- **`modern-style-showcase.jpg`** - Clean modern interior
- **`traditional-style-showcase.jpg`** - Classic traditional design
- **`minimalist-style-showcase.jpg`** - Pure minimalist space
- **`bohemian-style-showcase.jpg`** - Eclectic bohemian design
- **`industrial-style-showcase.jpg`** - Urban industrial loft
- **`scandinavian-style-showcase.jpg`** - Nordic hygge design
- **`midcentury-style-showcase.jpg`** - Mid-century modern
- **`contemporary-style-showcase.jpg`** - Current contemporary
- **`rustic-style-showcase.jpg`** - Cozy rustic farmhouse
- **`transitional-style-showcase.jpg`** - Balanced transitional
- **`coastal-style-showcase.jpg`** - Breezy coastal design
- **`eclectic-style-showcase.jpg`** - Creative mixed style
  - **Goal**: Professional representation of each style
  - **Type**: Professional photography
  - **Emotion**: Style identity, aspiration, clarity
  - **Specs**: 300x200px, consistent lighting, WebP format

#### **Style Mood Indicators**
- **`mood-cozy-icon.svg`** - Cozy/warm mood indicator
- **`mood-elegant-icon.svg`** - Elegant/sophisticated indicator
- **`mood-modern-icon.svg`** - Modern/clean indicator
- **`mood-rustic-icon.svg`** - Rustic/natural indicator
  - **Goal**: Quick mood/feeling communication
  - **Type**: Vector icons
  - **Emotion**: Mood setting, quick understanding
  - **Specs**: 24x24px, expressive, brand colors

---

## 🤖 **AIProcessingScreen & EnhancedAIProcessingScreen**

### Current State
- Loading states and progress indicators
- Basic AI processing visualization
- Uses Ionicons for status indicators

### Required Assets

#### **AI Processing Visualization**
- **`ai-brain-processing.json`** - Neural network processing animation
  - **Goal**: Show sophisticated AI thinking
  - **Type**: Lottie animation
  - **Emotion**: Intelligence, sophistication, trust
  - **Specs**: 10-second loop, smooth, professional

- **`room-analysis-animation.json`** - Room being analyzed by AI
  - **Goal**: Visualize AI understanding the space
  - **Type**: Lottie animation
  - **Emotion**: Understanding, precision, care
  - **Specs**: 8-second animation, technical but friendly

#### **Processing Steps Visualization**
- **`step-scanning-icon.svg`** - Scanning/analysis step icon
- **`step-understanding-icon.svg`** - Understanding/processing icon
- **`step-generating-icon.svg`** - Generation/creation icon
- **`step-optimizing-icon.svg`** - Optimization/refinement icon
  - **Goal**: Clear step-by-step process visualization
  - **Type**: Vector icons
  - **Emotion**: Process clarity, progress, capability
  - **Specs**: 40x40px, sequential design, brand colors

#### **AI Capability Showcase**
- **`ai-color-analysis.json`** - Color palette extraction animation
- **`ai-furniture-recognition.json`** - Furniture identification animation
- **`ai-style-matching.json`** - Style analysis animation
  - **Goal**: Show specific AI capabilities
  - **Type**: Lottie animations
  - **Emotion**: Capability, precision, intelligence
  - **Specs**: 6-second loops each, educational, engaging

---

## 💰 **BudgetScreen, PaywallScreen, PlansScreen**

### Current State
- Basic pricing displays
- Simple plan comparison
- Uses Ionicons for features

### Required Assets

#### **Budget Visualization**
- **`budget-calculator-animation.json`** - Animated budget calculation
  - **Goal**: Make budgeting feel dynamic and smart
  - **Type**: Lottie animation
  - **Emotion**: Control, planning, confidence
  - **Specs**: 5-second animation, financial but friendly

#### **Plan Feature Icons**
- **`unlimited-projects-icon.svg`** - Unlimited projects feature
- **`priority-support-icon.svg`** - Priority support feature
- **`advanced-ai-icon.svg`** - Advanced AI capabilities
- **`export-options-icon.svg`** - Export/sharing options
- **`collaboration-icon.svg`** - Team collaboration feature
  - **Goal**: Clear feature differentiation
  - **Type**: Vector icons
  - **Emotion**: Value, capability, professional benefit
  - **Specs**: 32x32px, feature-specific, premium feel

#### **Value Proposition Graphics**
- **`roi-visualization.svg`** - Return on investment graphic
- **`time-savings-icon.svg`** - Time savings indicator
- **`professional-results-badge.svg`** - Professional quality badge
  - **Goal**: Justify premium pricing
  - **Type**: Vector illustrations
  - **Emotion**: Value, professional benefit, investment
  - **Specs**: Clean, business-focused, trustworthy

---

## 👤 **AuthScreen, ProfileScreen**

### Current State
- Basic authentication forms
- Simple profile display
- Uses Ionicons for social login

### Required Assets

#### **Authentication Enhancement**
- **`secure-login-animation.json`** - Security/trust animation
  - **Goal**: Build confidence in security
  - **Type**: Lottie animation
  - **Emotion**: Security, trust, protection
  - **Specs**: 4-second loop, shield/security theme

#### **Social Login Icons**
- **`google-official-logo.svg`** - Official Google logo
- **`apple-official-logo.svg`** - Official Apple logo
- **`facebook-official-logo.svg`** - Official Facebook logo
  - **Goal**: Authentic social login appearance
  - **Type**: Official brand SVGs
  - **Emotion**: Trust, familiarity, authenticity
  - **Specs**: Official brand guidelines, proper sizing

#### **Profile Enhancement**
- **`achievement-badges.svg`** - User achievement badges
- **`project-stats-icons.svg`** - Project statistics icons
- **`upgrade-prompt-graphic.svg`** - Upgrade encouragement graphic
  - **Goal**: Gamification and engagement
  - **Type**: Vector graphics
  - **Emotion**: Achievement, progress, motivation
  - **Specs**: Rewarding, clear, motivational

---

## 📚 **ReferenceLibraryScreen**

### Current State
- Grid of reference images
- Category filtering
- Basic search functionality

### Required Assets

#### **Reference Categories**
- **`color-palettes-collection.jpg`** - Professional color palette examples
- **`texture-materials-collection.jpg`** - Material and texture samples
- **`furniture-styles-collection.jpg`** - Furniture style examples
- **`lighting-examples-collection.jpg`** - Lighting setup examples
- **`layout-patterns-collection.jpg`** - Room layout patterns
  - **Goal**: Rich reference material for users
  - **Type**: Curated photography collections
  - **Emotion**: Inspiration, education, possibilities
  - **Specs**: High-quality, organized, diverse examples

#### **Search Enhancement**
- **`ai-search-icon.svg`** - AI-powered search icon
- **`filter-category-icons.svg`** - Category filter icons
- **`sort-options-icons.svg`** - Sorting option icons
  - **Goal**: Enhanced search and discovery
  - **Type**: Vector icons
  - **Emotion**: Efficiency, discovery, organization
  - **Specs**: Consistent search UI theme

---

## 🛍️ **FurnitureScreen, CheckoutScreen**

### Current State
- Product listings and shopping interface
- Basic e-commerce functionality
- Simple checkout process

### Required Assets

#### **Product Showcase**
- **`furniture-hero-video.mp4`** - Beautiful furniture showcase video
  - **Goal**: Inspirational furniture presentation
  - **Type**: Product video
  - **Emotion**: Desire, quality, style
  - **Specs**: 20-second loop, high-quality product shots

#### **E-commerce Enhancement**
- **`secure-checkout-badge.svg`** - Security trust badge
- **`shipping-options-icons.svg`** - Shipping method icons
- **`payment-security-icons.svg`** - Payment security indicators
  - **Goal**: Trust and security in purchasing
  - **Type**: Vector graphics
  - **Emotion**: Trust, security, confidence
  - **Specs**: Professional e-commerce standards

---

## 🎯 **Onboarding Screens (1-4)**

### Current State
- Multi-step onboarding flow
- Basic animations and transitions
- Uses Ionicons for features

### Required Assets

#### **Onboarding Hero Videos**
- **`onboarding-1-hero.mp4`** - AI room analysis showcase
- **`onboarding-2-hero.mp4`** - Design transformation demo
- **`onboarding-3-hero.mp4`** - Human-AI collaboration
- **`onboarding-4-hero.mp4`** - Success stories compilation
  - **Goal**: Compelling introduction to capabilities
  - **Type**: Promotional videos
  - **Emotion**: Excitement, possibility, capability
  - **Specs**: 15-second loops, high production value

#### **Feature Illustrations**
- **`smart-analysis-illustration.svg`** - AI room analysis graphic
- **`style-matching-illustration.svg`** - Style matching process
- **`budget-optimization-illustration.svg`** - Budget optimization
- **`instant-results-illustration.svg`** - Speed and efficiency
  - **Goal**: Clear feature communication
  - **Type**: Vector illustrations
  - **Emotion**: Understanding, capability, efficiency
  - **Specs**: Consistent illustration style, educational

#### **Success Testimonials**
- **`testimonial-photo-1.jpg`** - Professional headshot for Maria L.
- **`testimonial-photo-2.jpg`** - Professional headshot for James K.
- **`testimonial-photo-3.jpg`** - Professional headshot for Sophie M.
  - **Goal**: Human connection and trust
  - **Type**: Professional photography
  - **Emotion**: Trust, relatability, success
  - **Specs**: 100x100px, diverse, professional quality

---

## 📊 **Technical Specifications**

### **File Formats & Optimization**
- **SVG**: All icons and simple illustrations
- **WebP**: All photography and complex images
- **MP4**: Video content (H.264 codec, mobile optimized)
- **JSON**: Lottie animations for complex movements

### **Asset Sizing Standards**
- **Icons**: 16x16px (small), 24x24px (medium), 32x32px (large), 48x48px (hero)
- **Photography**: 300x200px (card), 400x300px (showcase), 800x600px (hero)
- **Illustrations**: Scalable SVG with defined viewBox
- **Videos**: 1080p maximum, 720p recommended, <10MB each

### **Color Palette Compliance**
- **Primary Brand**: #C9A98C
- **Secondary Brand**: #B9906F
- **Background**: #FDFBF7
- **Text**: #1C1C1C
- **Muted**: #7A7A7A

### **Performance Considerations**
- Total asset bundle should not exceed 50MB
- Critical path assets (icons, small images) should load within 2s
- Video assets should have fallback static images
- Implement progressive loading for large image collections

---

## 🚀 **Implementation Phases**

### **Phase 1: Essential Assets (Priority 1)**
*Timeline: 4-6 weeks*
*Budget: $15,000-20,000*

**Focus**: Core user experience enhancement
- Custom icon set (45 icons)
- Essential photography (20 images)
- Brand identity assets
- Basic animations (5 Lottie files)

### **Phase 2: Enhanced UX (Priority 2)**
*Timeline: 6-8 weeks*
*Budget: $20,000-30,000*

**Focus**: Professional polish and delight
- Hero videos (8 videos)
- Advanced animations (15 Lottie files)
- Reference library content
- AI visualization assets

### **Phase 3: Premium Polish (Priority 3)**
*Timeline: 4-6 weeks*
*Budget: $10,000-15,000*

**Focus**: Competitive differentiation
- Micro-interactions
- Easter eggs and delight moments
- Premium testimonial content
- Advanced AI showcases

### **Total Investment**
- **Time**: 14-20 weeks
- **Budget**: $45,000-65,000
- **ROI**: Enhanced user engagement, reduced churn, premium positioning

---

## 📁 **Proposed File Structure**

```
mobile/src/assets/
├── icons/
│   ├── categories/
│   ├── navigation/
│   ├── features/
│   └── social/
├── images/
│   ├── photography/
│   │   ├── rooms/
│   │   ├── styles/
│   │   └── furniture/
│   ├── illustrations/
│   │   ├── onboarding/
│   │   ├── empty-states/
│   │   └── features/
│   └── testimonials/
├── animations/
│   ├── lottie/
│   │   ├── ai-processing/
│   │   ├── transitions/
│   │   └── success-states/
│   └── videos/
│       ├── heroes/
│       ├── demos/
│       └── backgrounds/
└── brand/
    ├── logos/
    ├── patterns/
    └── badges/
```

---

## 🎯 **Success Metrics**

### **User Experience Improvements**
- **Engagement**: +40% time spent in app
- **Conversion**: +25% free-to-paid conversion
- **Retention**: +30% 30-day user retention
- **Satisfaction**: 4.8+ App Store rating

### **Business Impact**
- **Premium Positioning**: Support higher pricing tiers
- **Brand Recognition**: Professional, trustworthy appearance
- **Competitive Advantage**: Superior visual experience
- **Market Position**: Leader in AI-powered interior design

---

## 📞 **Next Steps**

1. **Asset Procurement Planning**
   - Identify internal vs. external production needs
   - Budget allocation and timeline planning
   - Vendor selection for photography and video

2. **Design System Integration**
   - Ensure asset consistency with existing design tokens
   - Create asset usage guidelines
   - Implement asset optimization pipeline

3. **Performance Monitoring**
   - Set up asset loading performance tracking
   - Implement progressive loading strategies
   - Monitor bundle size impact

4. **User Testing**
   - A/B test asset impact on user engagement
   - Gather feedback on emotional response
   - Iterate based on user behavior data

---

*This comprehensive asset requirements document ensures the Compozit Vision mobile application achieves professional visual standards while maintaining optimal performance and user experience. Each asset has been carefully considered for its contribution to user engagement, brand positioning, and business objectives.*