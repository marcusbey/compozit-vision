# Authentication Flow PRD

## Overview
This PRD outlines a login flow where the user's email is first retrieved from their Apple or Google account at the paywall step. When the user is ready to generate their final results and they are not yet logged in, we prompt them to create an account at that moment.

## User Journey

### 1. Initial App Usage
- Users can browse, explore, and set up their design preferences without logging in
- Users can take photos, select options, and configure their project freely
- No authentication barriers during the exploration phase

### 2. Paywall Interaction (Optional)
- If users encounter the paywall before generation, we collect their email from Apple/Google account
- Email is stored temporarily as `paymentEmail` in journey store
- Users can proceed with subscription without full account creation

### 3. Generation Trigger Point
- **Primary Authentication Gate**: When user presses "Generate" button on Create screen
- Check if user is authenticated (`user` exists in userStore)
- If not authenticated, immediately show authentication modal/screen

### 4. Authentication Options
Users will have three login options:
1. **Sign in with Apple** (iOS only)
2. **Sign in with Google** (Cross-platform)  
3. **Sign in with Email/Password** (Custom credentials)

### 5. Email Linking Logic
- **Scenario A**: Apple/Google email matches paywall email
  - Seamlessly link accounts
  - User proceeds to generation
  - All preferences and images tied to unified profile

- **Scenario B**: Apple/Google email differs from paywall email
  - Store both emails in user profile
  - Link accounts in backend
  - Preserve subscription and preferences
  - User proceeds to generation

- **Scenario C**: No paywall email exists
  - Create new account with Apple/Google email
  - User proceeds to generation

### 6. Post-Authentication Flow
- User returns to Create screen with active session
- Generation process continues seamlessly
- Results are tied to authenticated user account
- All preferences, images, and projects are permanently saved

## Technical Implementation

### Current State Analysis
- ✅ `AuthScreen.tsx` exists with Apple/Google/Email authentication
- ✅ Account linking logic implemented in `nativeAuthService`
- ✅ Journey store tracks `paymentEmail` and authentication state
- ✅ `UnifiedProjectScreenV2.tsx` has generate button
- ❌ No authentication check before generation

### Required Changes

#### 1. Modify Generate Button Handler
**File**: `/mobile/src/screens/project/UnifiedProjectScreenV2.tsx`

```typescript
const handleProcess = async () => {
  if (!selectedImage || !userPrompt.trim()) return;

  // 🔐 AUTHENTICATION CHECK BEFORE GENERATION
  const { user } = useUserStore.getState();
  if (!user) {
    // Show authentication modal/navigate to auth screen
    navigation.navigate('auth', {
      from: 'generation',
      nextScreen: 'Create',
      message: 'Sign in to generate your design and save your results',
      preserveGeneration: {
        image: selectedImage,
        prompt: userPrompt,
        context: projectContext
      }
    });
    return;
  }

  setIsProcessing(true);
  // ... rest of generation logic
};
```

#### 2. Update AuthScreen for Generation Flow
**File**: `/mobile/src/screens/auth/AuthScreen.tsx`

Add handling for generation-specific routing:

```typescript
const routeAfterAuth = async (user: any, hasLinkedPayment: boolean) => {
  const routeParams = route?.params;
  
  // Handle generation flow specifically
  if (routeParams?.from === 'generation') {
    const preservedData = routeParams?.preserveGeneration;
    if (preservedData) {
      // Pass generation data back to Create screen
      navigation.navigate('Create', {
        resumeGeneration: preservedData
      });
    } else {
      navigation.goBack();
    }
    return;
  }
  
  // ... existing routing logic
};
```

#### 3. Add Generation Resume Logic
**File**: `/mobile/src/screens/project/UnifiedProjectScreenV2.tsx`

```typescript
useEffect(() => {
  // Check for resumed generation after authentication
  const resumeData = route?.params?.resumeGeneration;
  if (resumeData) {
    setSelectedImage(resumeData.image);
    setUserPrompt(resumeData.prompt);
    setProjectContext(resumeData.context);
    
    // Auto-trigger generation after resume
    setTimeout(() => {
      handleProcess();
    }, 500);
    
    // Clear params to prevent re-trigger
    navigation.setParams({ resumeGeneration: null });
  }
}, [route?.params?.resumeGeneration]);
```

#### 4. User Store Integration
Ensure `useUserStore` is imported and properly integrated:

```typescript
import { useUserStore } from '../../stores/userStore';

const UnifiedProjectScreenV2: React.FC<UnifiedProjectScreenV2Props> = ({ 
  navigation, 
  route 
}) => {
  const { user } = useUserStore();
  // ... component logic
};
```

### 5. Email Linking Enhancement
**File**: `/mobile/src/services/nativeAuth.ts`

Ensure the existing email linking logic properly handles generation flow:

```typescript
export const linkGenerationAccount = async (
  authEmail: string, 
  paymentEmail?: string,
  userId?: string
): Promise<{ success: boolean; linkedAccountId?: string }> => {
  // Implementation for linking accounts during generation flow
  // This should integrate with existing linkAccounts function
};
```

## User Experience Flow

### Happy Path (No Paywall)
1. User takes photo → configures options → presses Generate
2. Authentication prompt appears
3. User signs in with Apple/Google/Email
4. Account created, user returned to generation
5. Generation completes, results saved to account

### Happy Path (With Paywall)
1. User encounters paywall → subscribes with Apple/Google
2. Email stored as `paymentEmail`
3. User continues → configures options → presses Generate
4. Authentication prompt appears
5. User signs in with same/different email
6. Accounts linked automatically
7. Generation completes, results saved to unified account

### Error Scenarios
- **Authentication fails**: Show error, allow retry
- **Account linking fails**: Show warning, proceed with generation
- **Network issues**: Show retry option
- **Generation fails**: Return to Create screen with preserved inputs

## Success Metrics
- **Conversion Rate**: % of users who complete authentication when prompted
- **Account Linking Success**: % of successful email link operations
- **User Retention**: % of users who return after authentication
- **Generation Completion**: % of authentications that lead to successful generation

## Security Considerations
- Never store passwords in client-side state
- Clear sensitive authentication data after use
- Validate all email addresses before linking
- Implement proper session management
- Use secure token storage for authentication state

## Testing Requirements
1. **Unit Tests**: Authentication check logic
2. **Integration Tests**: Auth → Generation flow
3. **E2E Tests**: Complete user journey flows
4. **Manual Testing**: All authentication methods
5. **Edge Case Testing**: Network failures, partial flows

## Implementation Priority
1. **High**: Add authentication check to generate button
2. **High**: Update AuthScreen routing for generation flow
3. **Medium**: Add generation resume logic
4. **Medium**: Enhanced email linking for generation context
5. **Low**: Additional error handling and edge cases