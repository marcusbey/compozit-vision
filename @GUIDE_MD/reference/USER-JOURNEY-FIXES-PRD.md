# User Journey Fixes & Navigation System PRD

## Overview

This PRD addresses critical user journey issues, navigation errors, and design inconsistencies identified in the Compozit Vision app. The goal is to create a seamless, tested user experience across all user types and states.

## Current Issues

### Critical Bugs
1. **UUID Generation Error**: Dev user ID "dev-user-123" causes database errors
2. **Navigation Case Mismatches**: Calls to 'Profile' vs 'profile' cause navigation failures
3. **Design Inconsistency**: MyProjectsScreen still uses old dark theme
4. **Broken User Journey**: Users skip from auth directly to processing, missing key steps

### Navigation Issues
- Multiple "Profile" navigation errors (should be "profile")
- Inconsistent navigation between screens
- Missing proper flow control based on user authentication state

### User Experience Issues
- New users don't follow proper onboarding → paywall → checkout flow
- Authenticated users don't get proper dashboard experience
- Missing comprehensive end-to-end testing

## Success Criteria

### Phase 1: Critical Bug Fixes ✅
- [x] Fix UUID generation for development users
- [x] Fix all navigation case mismatches
- [x] Update MyProjectsScreen to unified warm color theme
- [x] Ensure database operations work without errors

### Phase 2: User Journey Implementation ✅
- [x] Implement proper navigation flow for new users
- [x] Implement proper navigation flow for existing users
- [x] Implement proper navigation flow for authenticated users
- [x] Fix authentication state management and flow control

### Phase 3: End-to-End Testing ✅
- [x] Create comprehensive E2E test suite
- [x] Test new user journey: Welcome → Onboarding → Paywall → Auth → Checkout
- [x] Test existing user journey: Welcome → Auth → Dashboard
- [x] Test authenticated user journey: Paywall → Checkout (direct)
- [x] Test edge cases and error scenarios

### Phase 4: Validation & Polish ✅
- [x] Run complete user journey validation
- [x] Verify design system consistency across all screens
- [x] Performance testing for navigation flows
- [x] Final QA and bug fixes

## User Journey Specifications

### 1. New User Journey
```
Welcome Screen
  ↓ (Get Started)
Onboarding Screen 1
  ↓ (Continue)
Onboarding Screen 2
  ↓ (Continue)
Onboarding Screen 3
  ↓ (Continue)
Paywall Screen
  ↓ (Select Plan - if not authenticated)
Authentication Modal/Screen
  ↓ (Sign Up Success)
Checkout Screen
  ↓ (Payment Success)
Photo Capture Screen
```

### 2. Existing User Journey
```
Welcome Screen
  ↓ (Already have account? Log in)
Auth Screen
  ↓ (Login Success)
My Projects Screen (Dashboard)
  ↓ (New Project)
Photo Capture Screen
```

### 3. Authenticated User Journey
```
Paywall Screen (if accessing premium features)
  ↓ (Select Plan - already authenticated)
Checkout Screen (direct, no auth modal)
  ↓ (Payment Success)
Photo Capture Screen
```

### 4. Returning User Journey
```
Welcome Screen (if first time)
  ↓ OR (if returning user)
My Projects Screen
  ↓ (Continue Project)
Processing/Results Screen
```

## Technical Requirements

### Authentication Flow
- Proper UUID generation for all users (including dev users)
- Authentication state persistence across app restarts
- Proper token management and refresh
- Multi-provider authentication support (email, Google, Apple)

### Navigation System
- **Case Sensitivity**: All navigation calls must use lowercase screen names
- **Flow Control**: Navigation based on user authentication and onboarding state
- **Deep Linking**: Support for returning to specific screens
- **Back Navigation**: Proper back stack management

### Design System Consistency
- **Color Palette**: Unified warm beige/brown theme across all screens
- **Typography**: Consistent font weights and sizes
- **Spacing**: Consistent padding and margins
- **Interactive States**: Consistent button states and feedback

## Implementation Tasks

### Phase 1: Critical Fixes (Priority: HIGH)

#### Task 1.1: Fix UUID Generation
- **File**: `src/stores/userStore.ts` or authentication service
- **Issue**: "dev-user-123" is not a valid UUID
- **Solution**: Generate proper UUIDs for development users
- **Acceptance**: Database operations succeed without UUID errors

#### Task 1.2: Fix Navigation Case Mismatches
- **Files**: All files with navigation calls
- **Issue**: 'Profile' vs 'profile' case mismatches
- **Solution**: Update all navigation calls to use correct lowercase names
- **Acceptance**: No navigation errors in console

#### Task 1.3: Update MyProjectsScreen Theme
- **File**: `src/screens/Projects/MyProjectsScreen.tsx`
- **Issue**: Still using old dark blue theme
- **Solution**: Apply warm color palette from design system
- **Acceptance**: Screen matches design system colors

### Phase 2: User Journey Implementation (Priority: HIGH)

#### Task 2.1: Implement Welcome Screen Navigation Logic
- **File**: `src/screens/Welcome/WelcomeScreen.tsx`
- **Goal**: Proper routing based on user state
- **Logic**:
  - New users → Onboarding1
  - Returning users → Resume last screen or My Projects
  - First-time users → Welcome → Onboarding

#### Task 2.2: Implement Authentication Flow Control
- **Files**: `src/screens/Auth/AuthScreen.tsx`, `src/stores/userStore.ts`
- **Goal**: Proper navigation after authentication
- **Logic**:
  - New users after signup → Continue to checkout
  - Existing users after login → My Projects
  - Users in paywall flow → Continue to checkout

#### Task 2.3: Implement Paywall Flow Logic
- **File**: `src/screens/Paywall/PaywallScreen.tsx`
- **Goal**: Conditional authentication based on user state
- **Logic**:
  - Authenticated users → Direct to checkout
  - Non-authenticated users → Show authentication modal/screen

### Phase 3: End-to-End Testing (Priority: MEDIUM)

#### Task 3.1: Create E2E Test Suite
- **File**: `__tests__/UserJourneyE2E.test.tsx`
- **Coverage**:
  - New user complete journey
  - Existing user login flow
  - Authenticated user paywall flow
  - Error scenarios and edge cases

#### Task 3.2: Navigation Integration Tests
- **File**: `__tests__/NavigationIntegration.test.tsx`
- **Coverage**:
  - All navigation calls work correctly
  - Proper back navigation
  - Deep linking functionality
  - Authentication state navigation

### Phase 4: Validation & Polish (Priority: MEDIUM)

#### Task 4.1: Design System Validation
- **Goal**: Ensure all screens use unified design tokens
- **Method**: Visual regression testing and manual review
- **Files**: All screen components

#### Task 4.2: Performance Testing
- **Goal**: Ensure smooth navigation and transitions
- **Metrics**: Screen transition times, memory usage, FPS
- **Tools**: Performance profiler and metrics collection

## Testing Strategy

### Unit Tests
- Individual screen component testing
- Store action testing
- Navigation helper testing

### Integration Tests
- Authentication flow testing
- Database operation testing
- API integration testing

### End-to-End Tests
```typescript
// Example E2E test structure
describe('User Journey E2E Tests', () => {
  describe('New User Journey', () => {
    test('should complete full onboarding to checkout flow', async () => {
      // Welcome → Get Started
      // Onboarding 1, 2, 3 → Continue
      // Paywall → Select Plan
      // Auth → Sign Up
      // Checkout → Payment
      // Photo Capture
    });
  });

  describe('Existing User Journey', () => {
    test('should login and access dashboard', async () => {
      // Welcome → Login
      // Auth → Enter credentials
      // My Projects → Dashboard
    });
  });

  describe('Authenticated User Journey', () => {
    test('should access paywall and go direct to checkout', async () => {
      // Setup: User already authenticated
      // Paywall → Select Plan
      // Checkout (no auth modal)
      // Payment Success
    });
  });
});
```

### Error Scenario Testing
- Network failure handling
- Authentication timeout
- Database connection issues
- Invalid navigation attempts

## Success Metrics

### Technical Metrics
- **Navigation Success Rate**: 100% (no navigation errors)
- **Authentication Success Rate**: >95%
- **Database Operation Success Rate**: >98%
- **Screen Transition Time**: <500ms average

### User Experience Metrics
- **Onboarding Completion Rate**: >80%
- **Authentication Conversion Rate**: >70%
- **Checkout Completion Rate**: >60%
- **User Retention (Day 1)**: >50%

### Code Quality Metrics
- **Test Coverage**: >80% for critical paths
- **TypeScript Errors**: 0
- **ESLint Errors**: 0
- **Console Errors**: 0 in production flows

## Risk Mitigation

### High Risk Items
1. **Authentication State**: Ensure proper state management across app lifecycle
2. **Database Migrations**: UUID changes require careful data migration
3. **Navigation Stack**: Improper navigation can cause app crashes

### Mitigation Strategies
- **Comprehensive Testing**: Test all user flows before deployment
- **Feature Flags**: Gradual rollout of navigation changes
- **Rollback Plan**: Keep previous working version deployable
- **Monitoring**: Real-time error tracking and user flow analytics

## Timeline

### Week 1: Critical Fixes
- Day 1-2: Fix UUID and navigation errors
- Day 3-4: Update MyProjectsScreen theme
- Day 5: Testing and validation

### Week 2: User Journey Implementation
- Day 1-2: Implement Welcome and Auth flow logic
- Day 3-4: Implement Paywall flow logic
- Day 5: Integration testing

### Week 3: Testing & Validation
- Day 1-3: Create and run E2E test suite
- Day 4-5: Performance testing and optimization

### Week 4: Polish & Deploy
- Day 1-2: Design system validation
- Day 3-4: Final QA and bug fixes
- Day 5: Production deployment

## Conclusion

This PRD provides a comprehensive approach to fixing the critical user journey and navigation issues in the Compozit Vision app. By following the phased approach and thorough testing strategy, we can ensure a smooth, consistent user experience across all user types and states.

The success of this implementation will be measured by the elimination of navigation errors, improved user conversion rates, and a consistent design system across all screens.