# E2E Test Suite Documentation

This directory contains comprehensive End-to-End (E2E) tests for the Compozit Vision mobile application, covering the complete user journey from S0 (Welcome) to S13 (My Projects).

## Test Structure

### 1. CompleteUserJourney.test.tsx
**Purpose**: Tests the complete happy path user journey through all wizard steps.

**Coverage**:
- S0: Welcome Screen
- S1-S3: Onboarding Flow
- S4: Project Wizard Start
- S5: Category Selection
- S6: Space Definition
- S7: Photo Capture
- S8: Style Selection
- S9: References & Colors
- S10: AI Processing
- S11: Results
- S12: Project Saved
- S13: My Projects

**Key Test Scenarios**:
- Complete flow from welcome to results
- Navigation validation (back/forward)
- Data persistence across app restarts
- State management throughout journey
- Memory management during navigation
- Rapid interaction handling

### 2. ValidationFlow.test.tsx
**Purpose**: Tests the wizard validation system across all steps.

**Coverage**:
- Step-by-step validation
- Error display and recovery
- Warning handling
- Cross-step validation dependencies
- Real-time validation feedback
- Recovery actions and suggestions

**Key Test Scenarios**:
- Validation errors prevent progression
- Warning messages allow continuation with confirmation
- Photo quality validation
- Space compatibility validation
- Style-space mismatch detection
- References requirement validation
- AI processing validation
- Recovery action execution

### 3. ErrorHandling.test.tsx
**Purpose**: Tests comprehensive error handling and recovery scenarios.

**Coverage**:
- Network errors (timeouts, 500s, 401s, rate limiting)
- Service-specific errors (Supabase, AI services, Stripe)
- File and media errors (permissions, uploads, corruption)
- Memory and performance errors
- User input validation errors
- State management corruption

**Key Test Scenarios**:
- Network timeout with retry options
- Server error with fallback behavior
- Authentication error handling
- Rate limiting with countdown
- Camera permission denied
- Image upload failures
- Corrupted file handling
- Low memory warnings
- Processing timeouts
- Invalid form input handling
- Store corruption recovery
- Graceful degradation

### 4. PerformanceAndAccessibility.test.tsx
**Purpose**: Tests performance metrics and accessibility compliance.

**Coverage**:
- Performance benchmarks
- Memory efficiency
- Accessibility standards
- Responsive design
- Network performance

**Key Test Scenarios**:
- Screen load time < 2s
- 60fps navigation animations
- Memory usage < 100MB increase
- Image loading optimization
- Touch target sizing (44x44dp)
- Screen reader support
- High contrast mode
- Keyboard navigation
- Form accessibility
- Status announcements
- Multi-device adaptation
- Network optimization

## Test Configuration

### Prerequisites
```json
{
  "@testing-library/react-native": "^12.0.0",
  "@testing-library/jest-native": "^5.4.0",
  "jest": "^29.0.0"
}
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm test CompleteUserJourney.test.tsx
npm test ValidationFlow.test.tsx
npm test ErrorHandling.test.tsx
npm test PerformanceAndAccessibility.test.tsx

# Run with coverage
npm run test:coverage -- __tests__/E2E/

# Run in watch mode
npm run test:watch -- __tests__/E2E/
```

### Test Environment Setup

The tests use the existing Jest configuration with comprehensive mocking:

- **React Navigation**: Full navigation stack mocking
- **Expo Modules**: Camera, image picker, clipboard, haptics
- **External Services**: Supabase, Stripe, AI services
- **Device APIs**: AsyncStorage, permissions, file system
- **Performance APIs**: Memory monitoring, timing

## Test Data and Mocks

### Mock Data Structure
```typescript
// Journey progression
const mockJourneyFlow = {
  welcome: { nextStep: 'onboarding1', duration: '<2s' },
  onboarding: { steps: 3, skipOption: true },
  wizard: { steps: 6, validation: 'required' },
  results: { saveOption: true, shareOption: true }
};

// Validation scenarios
const mockValidationCases = {
  success: { isValid: true, errors: [], warnings: [] },
  error: { isValid: false, errors: [...], suggestions: [...] },
  warning: { isValid: true, warnings: [...], suggestions: [...] }
};

// Error scenarios
const mockErrorCases = {
  network: { timeout: 5000, retry: 3, fallback: true },
  service: { supabase: 'fallback', ai: 'skip', stripe: 'retry' },
  media: { permissions: 'request', upload: 'retry', corrupt: 'replace' }
};
```

### Performance Benchmarks
```typescript
const performanceBudgets = {
  screenLoad: 2000,    // 2s max
  navigation: 500,     // 500ms max
  imageLoad: 3000,     // 3s max for all images
  memoryIncrease: 100, // 100MB max
  bundleSize: 10       // 10MB max
};
```

### Accessibility Standards
```typescript
const a11yRequirements = {
  touchTargets: 44,      // 44dp minimum
  contrastRatio: 4.5,    // WCAG AA standard
  screenReader: true,    // Full support
  keyboard: true,        // Navigation support
  announcements: true    // Status updates
};
```

## Test Patterns and Best Practices

### 1. User-Centric Testing
```typescript
// ✅ Good: Test from user perspective
it('should allow user to complete design journey', async () => {
  await userStartsJourney();
  await userSelectsCategory();
  await userDefinesSpaces();
  await userCapturesPhoto();
  await userReceivesResults();
});

// ❌ Bad: Test implementation details
it('should call navigationService.navigate', async () => {
  // Testing internal APIs instead of user behavior
});
```

### 2. Realistic Error Simulation
```typescript
// ✅ Good: Realistic error scenarios
const networkError = new Error('Network request failed');
networkError.name = 'AbortError';
jest.spyOn(global, 'fetch').mockRejectedValue(networkError);

// ❌ Bad: Generic error testing
throw new Error('Something went wrong');
```

### 3. Performance Testing
```typescript
// ✅ Good: Measure real performance metrics
const startTime = performance.now();
await renderAndWaitForComponent();
const loadTime = performance.now() - startTime;
expect(loadTime).toBeLessThan(2000);

// ❌ Bad: Mock performance without measurement
jest.fn().mockReturnValue({ duration: 100 });
```

### 4. Accessibility Testing
```typescript
// ✅ Good: Test real accessibility features
const button = getByLabelText('Submit form');
expect(button).toBeAccessible();

// ❌ Bad: Test only presence of labels
expect(getByTestId('button')).toBeTruthy();
```

## Debugging and Troubleshooting

### Common Issues

1. **Async timing issues**
   - Use `waitFor()` with appropriate timeouts
   - Use `act()` for state updates
   - Mock timers when needed

2. **Mock cleanup**
   - Clear mocks in `beforeEach()`
   - Reset store state between tests
   - Clear AsyncStorage

3. **Navigation testing**
   - Wait for screen transitions
   - Check for proper navigation state
   - Test back button behavior

4. **Memory leaks in tests**
   - Unmount components after tests
   - Clear intervals/timeouts
   - Reset global state

### Debug Tools
```bash
# Enable debug logging
DEBUG=1 npm test

# Profile memory usage
node --inspect-brk node_modules/.bin/jest

# Analyze bundle size
npm run analyze

# Check accessibility
npm run a11y-check
```

## Continuous Integration

### GitHub Actions Configuration
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
      - run: npm run test:coverage
```

### Test Reports
- **Coverage**: Minimum 90% across all E2E scenarios
- **Performance**: All benchmarks must pass
- **Accessibility**: WCAG AA compliance required
- **Error Handling**: 100% error scenario coverage

## Contributing

### Adding New E2E Tests
1. Identify the user journey or scenario
2. Choose the appropriate test file
3. Follow existing patterns and naming conventions
4. Add comprehensive error cases
5. Include performance and accessibility checks
6. Update documentation

### Test Naming Convention
```typescript
describe('Feature/Flow Name E2E Tests', () => {
  describe('Specific Scenario Category', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Test implementation
    });
  });
});
```

### Performance Test Guidelines
- Always include timing measurements
- Test both best-case and worst-case scenarios
- Include memory usage monitoring
- Test on multiple device profiles

### Accessibility Test Requirements
- Test with screen reader simulation
- Verify keyboard navigation
- Check color contrast ratios
- Validate touch target sizes
- Test high contrast mode support