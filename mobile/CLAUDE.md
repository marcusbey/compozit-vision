# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands:**
```bash
# Start development
npm start                    # Start Expo development server
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator
npm run web                  # Run on web browser

# Testing (run before any commit)
npm test                     # Run all tests
npm run test:watch           # Watch mode during development
npm run test:coverage        # Generate coverage report
npm run test:e2e             # End-to-end integration tests

# Code Quality (mandatory before commits)
npm run lint                 # ESLint check
npm run lint:fix             # Auto-fix ESLint issues
npm run type-check           # TypeScript type checking
```

**Development Workflow:**
```bash
# Before any commit - ALL must pass
npm run type-check && npm run lint && npm test

# Single test file
npm test -- ComponentName.test.tsx

# Test specific pattern
npm test -- --testNamePattern="should handle"
```

## Design System Guidelines

**MANDATORY: All screens must use the unified design system from `@STYLE-GUIDE.json`**

### Design Tokens Import Pattern
```typescript
// Import design tokens at the top of every screen
const tokens = {
  color: {
    bgApp: "#FDFBF7",
    surface: "#FFFFFF", 
    textPrimary: "#1C1C1C",
    textInverse: "#FDFBF7",
    textMuted: "#7A7A7A",
    borderSoft: "#E8E2D8",
    brand: "#C9A98C",
    brandHover: "#B9906F",
    accent: "#1C1C1C",
    scrim: "rgba(28,28,28,0.45)",
    scrimHeavy: "rgba(28,28,28,0.65)",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  shadow: {
    e1: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
    e2: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    e3: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  },
  type: {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const },
    h1: { fontSize: 28, lineHeight: 36, fontWeight: "600" as const },
    h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" as const },
    h3: { fontSize: 18, lineHeight: 24, fontWeight: "500" as const },
    body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
};
```

### Component Standards

**Buttons (MANDATORY CONSISTENCY):**
```typescript
// Primary Button (CTA actions)
<TouchableOpacity
  activeOpacity={0.9}
  style={[styles.primaryButton, tokens.shadow.e2]}
  onPress={handleAction}
>
  <Text style={styles.primaryButtonText}>Get Started</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  primaryButton: {
    height: 52,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.color.accent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.color.borderSoft,
  },
  primaryButtonText: {
    ...tokens.type.h2,
    color: tokens.color.textInverse,
  },
});
```

**Cards (CONSISTENT ELEVATION):**
```typescript
const cardStyle = {
  backgroundColor: tokens.color.surface,
  borderRadius: tokens.radius.lg,
  padding: tokens.spacing.xl,
  ...tokens.shadow.e2,
  borderWidth: 1,
  borderColor: tokens.color.borderSoft,
};
```

**Input Fields:**
```typescript
const inputStyle = {
  backgroundColor: tokens.color.surface,
  borderWidth: 1,
  borderColor: tokens.color.borderSoft,
  borderRadius: tokens.radius.md,
  height: 48,
  paddingHorizontal: tokens.spacing.lg,
  ...tokens.type.body,
  color: tokens.color.textPrimary,
};
```

### Interactive States (MANDATORY)
- **Pressed State**: `activeOpacity={0.9}` for all buttons
- **Hover Effect**: Use `brandHover` color for brand elements
- **Focus State**: Use `brand` color for focus indicators
- **Disabled State**: 50% opacity + `textMuted` color

### Color Usage Rules
- **Background**: Always use `bgApp` (#FDFBF7) as app background
- **Cards/Surfaces**: Use `surface` (#FFFFFF) with `borderSoft`
- **Text**: `textPrimary` for main text, `textMuted` for secondary
- **Brand**: `brand` (#C9A98C) for highlights, `brandHover` for interactions
- **CTA Buttons**: `accent` (#1C1C1C) background with `textInverse` text

### Typography Hierarchy (MANDATORY)
- **Screen Titles**: Use `tokens.type.display`
- **Section Headers**: Use `tokens.type.h2`
- **Body Text**: Use `tokens.type.body`
- **Captions/Meta**: Use `tokens.type.small`
- **Button Text**: Use `tokens.type.h2` for primary buttons

### Spacing System (CONSISTENT)
- **Screen Padding**: `tokens.spacing.xl` (24px) horizontal padding
- **Component Spacing**: Use `tokens.spacing.lg` (16px) between components
- **Section Spacing**: Use `tokens.spacing.xxl` (32px) between sections
- **Text Spacing**: Use `tokens.spacing.sm` (8px) between text elements

## Architecture Overview

This is a React Native application for AI-powered interior design, built with clean architecture principles and comprehensive testing.

### Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand stores
- **Backend**: Supabase (auth, database, real-time subscriptions)
- **Navigation**: React Navigation (stack + tab)
- **Animations**: React Native Reanimated 2 + Gesture Handler
- **Testing**: Jest with React Native Testing Library
- **Auth**: Multi-provider (email, Google, Apple, biometric)

### Core Domain
**AI-Powered Interior Design Pipeline:**
1. **Photo Capture** → Space analysis with computer vision
2. **Style Selection** → AI-enhanced recommendations
3. **Furniture Selection** → Gesture-based carousel (Tinder-like)
4. **Budget Selection** → Price-aware filtering
5. **Enhanced Processing** → Custom prompts + AI generation
6. **Results** → 3D visualizations and purchase integration

### Architecture Layers

**State Management (Zustand Stores):**
- `userStore.ts` - Authentication, profile, credits
- `projectStore.ts` - Project CRUD with real-time sync
- `designStore.ts` - AI-generated designs lifecycle

**Services Layer:**
- `supabase.ts` - Main backend integration
- `spaceAnalysis.ts` - AI processing pipeline
- `auth.ts` - Multi-provider authentication
- `infrastructure/auth/` - Modular auth components

**Key Components:**
- `FurnitureCarousel/` - Advanced gesture-based selection
- `CustomPrompt/` - Expandable prompt system
- `StyleSelection/` - AI-powered style recommendations

## Enhanced Style Illustrations System

**Delightful User Experience:**
- Custom SVG illustrations for every design style
- Integrated color palette previews
- Mood-based style categorization
- Cross-platform optimized assets (iOS & Android)

**Asset Management:**
```typescript
// Import enhanced asset system
import { AssetManager, StyleType, StyleMetadata } from '../assets';

// Get style with illustration
const metadata = AssetManager.getStyleMetadata('modern');
const allStyles = AssetManager.getAllStyles();

// Use enhanced style card
<EnhancedStyleCard
  style={styleReference}
  isSelected={isSelected}
  onSelect={handleSelect}
  size="medium"
  showMetadata={true}
/>
```

**Available Style Illustrations:**
- Modern, Traditional, Minimalist, Eclectic
- Industrial, Scandinavian, Bohemian, Contemporary  
- Rustic, Mid-Century Modern
- Each includes color palette, mood tags, and key features

**Asset Locations:**
- Style illustrations: `src/assets/illustrations/styles/`
- Ambiance illustrations: `src/assets/illustrations/ambiance/`
- Asset manager: `src/assets/index.ts`

## Important Implementation Patterns

### Real-time Data Flow
```typescript
// Supabase real-time + Zustand pattern
const useProjectStore = create<ProjectState>((set, get) => ({
  // Actions sync with Supabase and update local state
  // Real-time subscriptions update store automatically
  // AsyncStorage provides offline fallback
}))
```

### AI Processing Integration
```typescript
// Located in services/spaceAnalysis.ts
// Complex pipeline: Image → Analysis → Enhancement → Results
// Polling for long-running operations
// Comprehensive error handling with fallbacks
```

### Gesture-First UI Pattern
```typescript
// FurnitureCarousel uses react-native-reanimated
// Swipe gestures with physics-based animations
// Platform-specific haptic feedback
// 60 FPS performance requirements
```

### Type Safety Approach
All AI processing types in `src/types/aiProcessing.ts`:
- Comprehensive domain modeling
- Enum-based state management
- Helper functions for type conversions

## Testing Requirements

**Mandatory Testing Strategy:**
```bash
# Before ANY commit - no exceptions
npm run type-check  # Must pass
npm run lint        # Must pass  
npm test           # Must pass
```

**Test Coverage Standards:**
- Unit Tests: 80% minimum coverage
- Integration Tests: All API endpoints
- E2E Tests: Complete user journeys
- Performance Tests: Animation FPS + memory

**Key Test Files:**
- `__tests__/EnhancedAIProcessingE2E.test.tsx` - Complete user journey
- `__tests__/UserJourneyIntegration.test.tsx` - Full app flow
- `__tests__/PerformanceValidation.test.tsx` - Performance benchmarks

## Critical Development Notes

### AI Processing Pipeline
The core business logic flows through:
1. **Space Analysis** (`spaceAnalysis.ts`) - Computer vision processing
2. **State Management** (Zustand stores) - Real-time data sync
3. **UI Components** - Gesture-based interactions
4. **Error Recovery** - Comprehensive fallback strategies

### Performance Requirements
- **Animations**: 60 FPS using native driver
- **Gestures**: UI thread processing with Reanimated
- **Images**: Efficient caching and optimization
- **Memory**: Cleanup subscriptions and large objects

### Authentication Flow
Multi-provider system with:
- Email/password + social (Google, Apple)
- Biometric authentication (Face ID, Touch ID)
- Token management with auto-refresh
- Real-time session sync across app

### Data Synchronization
- **Real-time**: Supabase subscriptions → Zustand stores
- **Offline**: AsyncStorage fallback for critical data
- **Conflict Resolution**: Last-write-wins with timestamps

## File Organization

```
src/
├── types/           # Domain models and TypeScript interfaces
├── stores/          # Zustand state management (3 main stores)
├── services/        # Backend integration and business logic
├── components/      # Reusable UI components with gestures
├── screens/         # Full-screen components with navigation
├── infrastructure/  # Auth, external services, utilities
└── __tests__/       # Comprehensive testing suite
```

## Common Development Tasks

**Adding New Screens:**
1. Create in `src/screens/NewScreen/`
2. Add to navigation in `src/navigation/AppNavigator.tsx`
3. Create test file `NewScreen.test.tsx`
4. Update types if needed

**AI Processing Integration:**
1. Extend types in `src/types/aiProcessing.ts`
2. Update `services/spaceAnalysis.ts` for processing logic
3. Add store actions in relevant Zustand store
4. Create comprehensive E2E tests

**Gesture Components:**
1. Use `react-native-reanimated` and `react-native-gesture-handler`
2. Follow patterns in `FurnitureCarousel/`
3. Implement haptic feedback for mobile platforms
4. Test performance on lower-end devices

## Production Considerations

**Error Handling:**
- All API calls wrapped with try/catch
- Graceful degradation for AI processing failures
- User-friendly error messages with retry options
- Comprehensive logging for debugging

**Performance Monitoring:**
- FPS tracking for animations
- Memory usage monitoring
- Network request optimization
- Bundle size analysis

**Security:**
- No secrets in client code
- Secure token storage with Keychain/Keystore
- Input validation for all user data
- Supabase RLS (Row Level Security) policies