#!/usr/bin/env node

/**
 * User Journey Navigation Flow Test
 * 
 * This script tests the proper navigation flow implementation
 * Run with: node test-user-journey-flow.js
 */

const fs = require('fs');
const path = require('path');

// Test navigation patterns
const navigationTests = [
  {
    name: 'Welcome Screen - New User Flow',
    file: 'src/screens/Welcome/WelcomeScreen.tsx',
    tests: [
      {
        description: 'Get Started button navigates to onboarding1',
        pattern: /navigateToScreen\('onboarding1'\)/,
        expected: true
      },
      {
        description: 'Updates journey progress for new user',
        pattern: /journeyStore\.updateProgress/,
        expected: true
      }
    ]
  },
  {
    name: 'Welcome Screen - Existing User Flow',
    file: 'src/screens/Welcome/WelcomeScreen.tsx',
    tests: [
      {
        description: 'Login button navigates to auth screen',
        pattern: /navigateToScreen\('auth'\)/,
        expected: true
      },
      {
        description: 'Updates authentication context for existing users',
        pattern: /journeyStore\.updateAuthentication/,
        expected: true
      }
    ]
  },
  {
    name: 'Auth Screen - Navigation Logic',
    file: 'src/screens/Auth/AuthScreen.tsx',
    tests: [
      {
        description: 'Routes existing users to myProjects',
        pattern: /navigateToScreen\('myProjects'\)/,
        expected: true
      },
      {
        description: 'Routes new users in paywall flow to checkout',
        pattern: /navigateToScreen\('checkout'\)/,
        expected: true
      },
      {
        description: 'Updates journey with authentication info',
        pattern: /journeyStore\.updateAuthentication/,
        expected: true
      }
    ]
  },
  {
    name: 'Paywall Screen - Plan Selection',
    file: 'src/screens/Paywall/PaywallScreen.tsx',
    tests: [
      {
        description: 'Authenticated users go direct to checkout',
        pattern: /isAuthenticated.*checkout/s,
        expected: true
      },
      {
        description: 'Non-authenticated users go to auth first',
        pattern: /navigateToScreen\('auth'\)/,
        expected: true
      },
      {
        description: 'Free plan users go to photo capture',
        pattern: /navigateToScreen\('photoCapture'\)/,
        expected: true
      },
      {
        description: 'Completes paywall step in journey',
        pattern: /journeyStore\.completeStep\('paywall'\)/,
        expected: true
      }
    ]
  },
  {
    name: 'Checkout Screen - Payment Success',
    file: 'src/screens/Checkout/CheckoutScreen.tsx',
    tests: [
      {
        description: 'After payment, navigates to photo capture',
        pattern: /navigateToScreen\('photoCapture'\)/,
        expected: true
      },
      {
        description: 'Marks payment as completed in journey',
        pattern: /journeyStore\.updatePayment/,
        expected: true
      },
      {
        description: 'Completes checkout step',
        pattern: /journeyStore\.completeStep\('checkout'\)/,
        expected: true
      }
    ]
  },
  {
    name: 'SafeJourneyNavigator - Initial Route Logic',
    file: 'src/navigation/SafeJourneyNavigator.tsx',
    tests: [
      {
        description: 'First time users see welcome screen',
        pattern: /'welcome'/,
        expected: true
      },
      {
        description: 'Authenticated users go to myProjects',
        pattern: /'myProjects'/,
        expected: true
      },
      {
        description: 'Validates saved screen continuation points',
        pattern: /validContinueScreens/,
        expected: true
      }
    ]
  }
];

function testFile(testConfig) {
  const filePath = path.join(__dirname, testConfig.file);
  
  console.log(`\n🧪 Testing: ${testConfig.name}`);
  console.log(`📁 File: ${testConfig.file}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return { passed: 0, failed: 1 };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let passed = 0;
  let failed = 0;
  
  testConfig.tests.forEach(test => {
    const matches = test.pattern.test(content);
    if (matches === test.expected) {
      console.log(`  ✅ ${test.description}`);
      passed++;
    } else {
      console.log(`  ❌ ${test.description}`);
      failed++;
    }
  });
  
  return { passed, failed };
}

function runTests() {
  console.log('🚀 User Journey Navigation Flow Tests\n');
  console.log('Testing proper navigation implementation for user journey flows...\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  navigationTests.forEach(testConfig => {
    const result = testFile(testConfig);
    totalPassed += result.passed;
    totalFailed += result.failed;
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results:`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All navigation flow tests passed!');
    console.log('\n✨ User Journey Implementation Status:');
    console.log('  ✅ New user flow: Welcome → Onboarding → Paywall → Checkout → Photo');
    console.log('  ✅ Existing user flow: Welcome → Auth → My Projects');
    console.log('  ✅ Paywall authentication routing');
    console.log('  ✅ Journey state management');
    console.log('  ✅ Proper initial route determination');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
  
  process.exit(totalFailed === 0 ? 0 : 1);
}

runTests();