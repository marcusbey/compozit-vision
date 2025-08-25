/**
 * OnboardingService Tests
 * Tests the improved first-time user detection and onboarding flow
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingService from '../services/onboarding';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('OnboardingService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('First Time User Detection', () => {
    
    test('should detect first time user correctly', async () => {
      // Mock no stored data (first time user)
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const isFirstTime = await OnboardingService.isFirstTimeUser();
      
      expect(isFirstTime).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('onboarding_state');
    });

    test('should detect returning user correctly', async () => {
      // Mock stored onboarding state (returning user)
      const mockState = {
        hasSeenOnboarding: true,
        completedOnboarding: true,
        onboardingVersion: 1,
        firstLaunchDate: '2024-01-01T00:00:00.000Z',
        lastLaunchDate: '2024-01-02T00:00:00.000Z',
        appVersion: '1.0.0',
        skippedOnboarding: false,
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const isFirstTime = await OnboardingService.isFirstTimeUser();
      
      expect(isFirstTime).toBe(false);
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      // Mock AsyncStorage error
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const isFirstTime = await OnboardingService.isFirstTimeUser();
      
      // Should assume first time user on error for safety
      expect(isFirstTime).toBe(true);
      expect(console.error).toHaveBeenCalledWith('Error checking first time user:', expect.any(Error));
    });

  });

  describe('Onboarding State Management', () => {
    
    test('should create initial state for new user', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const state = await OnboardingService.getOnboardingState();
      
      expect(state).toMatchObject({
        hasSeenOnboarding: false,
        completedOnboarding: false,
        skippedOnboarding: false,
        onboardingVersion: 1,
        appVersion: '1.0.0',
      });
      
      expect(state.firstLaunchDate).toBeDefined();
      expect(state.lastLaunchDate).toBeDefined();
      
      // Should save the initial state
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('hasSeenOnboarding')
      );
    });

    test('should update last launch date for returning user', async () => {
      const mockState = {
        hasSeenOnboarding: true,
        completedOnboarding: false,
        skippedOnboarding: false,
        onboardingVersion: 1,
        firstLaunchDate: '2024-01-01T00:00:00.000Z',
        lastLaunchDate: '2024-01-01T00:00:00.000Z',
        appVersion: '1.0.0',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const state = await OnboardingService.getOnboardingState();
      
      // Last launch date should be updated
      expect(new Date(state.lastLaunchDate).getTime()).toBeGreaterThan(
        new Date(mockState.lastLaunchDate).getTime()
      );
      
      // Should save updated state
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should mark onboarding as started', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        hasSeenOnboarding: false,
        completedOnboarding: false,
        skippedOnboarding: false,
      }));
      
      await OnboardingService.startOnboarding();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"hasSeenOnboarding":true')
      );
      
      expect(console.log).toHaveBeenCalledWith('🚀 Onboarding started');
    });

    test('should mark onboarding as completed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        hasSeenOnboarding: true,
        completedOnboarding: false,
        skippedOnboarding: false,
      }));
      
      await OnboardingService.completeOnboarding();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"completedOnboarding":true')
      );
      
      expect(console.log).toHaveBeenCalledWith('✅ Onboarding completed');
    });

    test('should mark onboarding as skipped', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        hasSeenOnboarding: false,
        completedOnboarding: false,
        skippedOnboarding: false,
      }));
      
      await OnboardingService.skipOnboarding();
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_state',
        expect.stringContaining('"skippedOnboarding":true')
      );
      
      expect(console.log).toHaveBeenCalledWith('⏭️ Onboarding skipped');
    });

  });

  describe('Initial Screen Determination', () => {
    
    test('should return onboarding1 for first time user', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // onboarding_state
        .mockResolvedValueOnce(null); // user_journey
      
      const initialScreen = await OnboardingService.getInitialScreen(false);
      
      expect(initialScreen).toBe('onboarding1');
    });

    test('should return saved screen for returning authenticated user', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          hasSeenOnboarding: true,
          completedOnboarding: true,
        }))
        .mockResolvedValueOnce(JSON.stringify({
          currentScreen: 'processing',
          completedSteps: ['onboarding1', 'onboarding2'],
        }));
      
      const initialScreen = await OnboardingService.getInitialScreen(true);
      
      expect(initialScreen).toBe('processing');
    });

    test('should return myProjects for authenticated user without saved journey', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          hasSeenOnboarding: true,
          completedOnboarding: true,
        }))
        .mockResolvedValueOnce(null); // No saved journey
      
      const initialScreen = await OnboardingService.getInitialScreen(true);
      
      expect(initialScreen).toBe('myProjects');
    });

    test('should return auth for unauthenticated user who completed onboarding', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          hasSeenOnboarding: true,
          completedOnboarding: true,
        }))
        .mockResolvedValueOnce(null);
      
      const initialScreen = await OnboardingService.getInitialScreen(false);
      
      expect(initialScreen).toBe('auth');
    });

    test('should return paywall for unauthenticated user who saw but not completed onboarding', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          hasSeenOnboarding: true,
          completedOnboarding: false,
        }))
        .mockResolvedValueOnce(null);
      
      const initialScreen = await OnboardingService.getInitialScreen(false);
      
      expect(initialScreen).toBe('paywall');
    });

  });

  describe('User Journey Persistence', () => {
    
    test('should save user journey data', async () => {
      const journeyData = {
        currentScreen: 'photoCapture',
        completedSteps: ['onboarding1', 'onboarding2'],
        selectedStyles: ['modern', 'scandinavian'],
        selectedPlan: 'pro',
        lastSavedAt: '2024-01-01T00:00:00.000Z',
      };
      
      await OnboardingService.saveUserJourney(journeyData);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_journey',
        expect.stringContaining('"currentScreen":"photoCapture"')
      );
      
      expect(console.log).toHaveBeenCalledWith('💾 User journey saved');
    });

    test('should retrieve user journey data', async () => {
      const mockJourney = {
        currentScreen: 'budget',
        completedSteps: ['onboarding1', 'onboarding2', 'onboarding3'],
        selectedStyles: ['luxury'],
        selectedPlan: 'business',
        lastSavedAt: '2024-01-01T00:00:00.000Z',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockJourney));
      
      const journey = await OnboardingService.getUserJourney();
      
      expect(journey).toEqual(mockJourney);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user_journey');
    });

    test('should return null for missing journey data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const journey = await OnboardingService.getUserJourney();
      
      expect(journey).toBeNull();
    });

  });

  describe('Data Cleanup', () => {
    
    test('should clear all onboarding data', async () => {
      await OnboardingService.clearOnboardingData();
      
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'onboarding_state',
        'user_journey',
        'user_preferences',
        'hasSeenOnboarding', // Legacy key
        'userJourneyData', // Legacy key
      ]);
      
      expect(console.log).toHaveBeenCalledWith('🧹 Onboarding data cleared');
    });

  });

  describe('Analytics', () => {
    
    test('should provide onboarding analytics', async () => {
      const mockState = {
        hasSeenOnboarding: true,
        completedOnboarding: true,
        skippedOnboarding: false,
        onboardingVersion: 1,
        firstLaunchDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        lastLaunchDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };
      
      const mockJourney = {
        currentScreen: 'results',
        completedSteps: ['onboarding1', 'onboarding2', 'onboarding3'],
        selectedStyles: ['modern', 'industrial'],
        selectedPlan: 'pro',
        lastSavedAt: new Date().toISOString(),
      };
      
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(mockState))
        .mockResolvedValueOnce(JSON.stringify(mockJourney));
      
      const analytics = await OnboardingService.getOnboardingAnalytics();
      
      expect(analytics).toMatchObject({
        isFirstTimeUser: false,
        hasCompletedOnboarding: true,
        hasSkippedOnboarding: false,
        daysSinceFirstLaunch: 7,
        onboardingVersion: 1,
        currentJourneyStep: 'results',
        selectedStyles: 2,
        hasSelectedPlan: true,
      });
    });

  });

});

describe('OnboardingService Integration', () => {
  
  test('should handle complete onboarding flow', async () => {
    // Start as first time user
    mockAsyncStorage.getItem.mockResolvedValue(null);
    
    let isFirstTime = await OnboardingService.isFirstTimeUser();
    expect(isFirstTime).toBe(true);
    
    // Start onboarding
    await OnboardingService.startOnboarding();
    
    // Complete onboarding
    await OnboardingService.completeOnboarding();
    
    // Save journey
    await OnboardingService.saveUserJourney({
      currentScreen: 'myProjects',
      completedSteps: ['onboarding1', 'onboarding2', 'onboarding3'],
      selectedStyles: ['modern'],
      selectedPlan: 'pro',
      lastSavedAt: new Date().toISOString(),
    });
    
    // Verify multiple saves to AsyncStorage occurred
    expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(4); // Initial state + start + complete + journey
    
    console.log('✅ Complete onboarding flow test passed');
  });

});