# PRD-01: Navigation Flow Fix

## 🎯 **Purpose**
Fix the broken navigation flow in the project wizard to ensure users follow the correct S0→S13 journey path without bypassing critical wizard steps.

## 🚨 **Critical Issues Identified**
1. **PhotoCaptureScreen** routes to `descriptions` instead of `styleSelection`
2. **PaywallScreen** jumps directly to `categorySelection` skipping wizard start
3. **StyleSelectionScreen** is unreachable in normal user flow
4. **Missing wizard progression validation**

## 👤 **User Stories**
- **As a user**, I want to follow a logical wizard progression after payment
- **As a user**, I want to be able to resume my wizard if interrupted
- **As a user**, I want each wizard step to lead to the next appropriate step
- **As a developer**, I want navigation to be predictable and testable

## 🔧 **Technical Requirements**

### **Immediate Fixes Required**
```typescript
// 1. PhotoCaptureScreen.tsx - Line 97
// WRONG:
NavigationHelpers.navigateToScreen('descriptions');
// CORRECT:  
NavigationHelpers.navigateToScreen('styleSelection');

// 2. PaywallScreen.tsx - Line 150
// WRONG:
NavigationHelpers.navigateToScreen('categorySelection');
// CORRECT:
NavigationHelpers.navigateToScreen('projectWizardStart');

// 3. Add ProjectWizardStart screen to navigation
// MISSING: 'projectWizardStart' in JourneyScreens type
```

### **Navigation Flow Definition**
```typescript
interface WizardFlow {
  S0: 'welcome' → 'onboarding1',
  S1: 'onboarding1' → 'onboarding2' → 'onboarding3' → 'paywall',
  S2: 'paywall' → 'paymentPending',
  S3: 'paymentPending' → 'paymentVerified', 
  S4: 'paymentVerified' → 'auth' | 'projectWizardStart',
  S5: 'auth' → 'projectWizardStart',
  S6: 'projectWizardStart' → 'categorySelection',
  S7: 'categorySelection' → 'roomSelection',
  S8: 'roomSelection' → 'photoCapture',
  S9: 'photoCapture' → 'styleSelection', // ← CRITICAL FIX
  S10: 'styleSelection' → 'referencesSelection',
  S11: 'referencesSelection' → 'processing',
  S12: 'processing' → 'results',
  S13: 'results' → 'myProjects'
}
```

### **State Management Requirements**
```typescript
// JourneyStore enhancement
interface ProjectWizardState {
  currentWizardStep: WizardStep;
  completedSteps: WizardStep[];
  canResume: boolean;
  lastActiveAt: string;
  wizardProgress: number; // 0-100%
}

type WizardStep = 
  | 'start' | 'category' | 'room' | 'photo' | 'style' 
  | 'references' | 'processing' | 'completed';
```

## ✅ **Acceptance Criteria**

### **Navigation Flow**
- [ ] All 13 screens (S0-S13) are accessible in correct order
- [ ] No wizard steps can be bypassed
- [ ] PhotoCapture correctly routes to StyleSelection
- [ ] Paywall correctly routes to ProjectWizardStart (not directly to category)
- [ ] All navigation paths are deterministic and testable

### **State Management**
- [ ] Wizard progress is tracked and persisted
- [ ] Users can resume from interruption
- [ ] Navigation validates completed prerequisite steps
- [ ] Invalid navigation attempts are handled gracefully

### **Testing Requirements**
- [ ] E2E test for complete S0→S13 journey
- [ ] Integration tests for each navigation transition
- [ ] Resume capability tests
- [ ] Error handling tests for invalid navigation

## 🔗 **Dependencies**
- **PREREQUISITE**: None (this is the foundation fix)
- **BLOCKS**: All other PRDs depend on correct navigation flow
- **IMPACTS**: PhotoCapture, Paywall, StyleSelection, ProjectWizardStart screens

## 📝 **Implementation Notes**
```typescript
// Files requiring changes:
- src/screens/PhotoCapture/PhotoCaptureScreen.tsx (Line 97)
- src/screens/Paywall/PaywallScreen.tsx (Lines 150, 167)
- src/navigation/SafeJourneyNavigator.tsx (Add missing screens)
- src/stores/journeyStore.ts (Add wizard progression validation)
```

## 🧪 **Testing Strategy**
1. **Unit Tests**: Each navigation transition
2. **Integration Tests**: Multi-step wizard flows  
3. **E2E Tests**: Complete user journey S0→S13
4. **Regression Tests**: Ensure existing functionality unbroken

## 🎯 **Success Metrics**
- ✅ All navigation paths follow S0→S13 specification
- ✅ No users can bypass wizard steps
- ✅ StyleSelection screen becomes reachable
- ✅ Navigation tests pass 100%
- ✅ No regression in existing screens

## 🚀 **Agent Assignment**
- **PRIMARY**: Navigation Flow Agent
- **SUPPORTING**: State Management Agent, Testing Agent
- **REVIEWER**: Integration Agent

---
**Priority**: 🔥 CRITICAL  
**Effort**: 2-3 days  
**Risk**: LOW (isolated changes)  
**Impact**: HIGH (unblocks entire implementation)