/**
 * NavigationPersistenceService Tests
 * Tests the navigation state persistence functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationPersistenceService from '../services/navigation';

// Import ScreenType for proper typing
type ScreenType = 'onboarding1' | 'onboarding2' | 'onboarding3' | 'paywall' | 'photoCapture' | 'descriptions' | 'furniture' | 'budget' | 'auth' | 'checkout' | 'results' | 'myProjects' | 'profile' | 'demo' | 'welcome';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('NavigationPersistenceService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Navigation State Management', () => {
    
    test('should save navigation state correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('session_123');
      
      await NavigationPersistenceService.saveNavigationState('onboarding2', ['onboarding1', 'onboarding2']);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'navigation_state',
        expect.stringContaining('"currentScreen":"onboarding2"')
      );
      
      expect(console.log).toHaveBeenCalledWith('📍 Navigation state saved: onboarding2');
    });

    test('should get navigation state correctly', async () => {
      const mockState = {
        currentScreen: 'paywall',
        navigationHistory: ['onboarding1', 'onboarding2', 'paywall'],
        lastNavigationTime: '2024-01-01T00:00:00.000Z',
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const state = await NavigationPersistenceService.getNavigationState();
      
      expect(state).toEqual(mockState);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('navigation_state');
    });

    test('should return null for missing navigation state', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const state = await NavigationPersistenceService.getNavigationState();
      
      expect(state).toBeNull();
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const state = await NavigationPersistenceService.getNavigationState();
      
      expect(state).toBeNull();
      expect(console.error).toHaveBeenCalledWith('❌ Failed to get navigation state:', expect.any(Error));
    });

  });

  describe('Screen Resumption Logic', () => {
    
    test('should allow resuming valid screen', () => {
      const canResume = NavigationPersistenceService.canResumeScreen(
        'onboarding2',
        false,
        new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      );
      
      expect(canResume).toBe(true);
    });

    test('should reject resuming transient screen', () => {
      const canResume = NavigationPersistenceService.canResumeScreen(
        'processing',
        true,
        new Date().toISOString()
      );
      
      expect(canResume).toBe(false);
      expect(console.log).toHaveBeenCalledWith('⚠️ Screen processing is not resumable');
    });

    test('should reject resuming screen requiring auth when not authenticated', () => {
      const canResume = NavigationPersistenceService.canResumeScreen(
        'myProjects',
        false,
        new Date().toISOString()
      );
      
      expect(canResume).toBe(false);
      expect(console.log).toHaveBeenCalledWith('🔐 Screen myProjects requires authentication');
    });

    test('should reject resuming old screen state', () => {
      const canResume = NavigationPersistenceService.canResumeScreen(
        'onboarding2',
        false,
        new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      );
      
      expect(canResume).toBe(false);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('⏰ Screen onboarding2 navigation state too old')
      );
    });

  });

  describe('Initial Screen Determination', () => {
    
    test('should return fallback for new user', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const result = await NavigationPersistenceService.getInitialScreenWithNavigation(false, 'onboarding1');
      
      expect(result.screen).toBe('onboarding1');
      expect(result.history).toEqual(['onboarding1']);
      expect(console.log).toHaveBeenCalledWith('📱 No saved navigation state, using fallback');
    });

    test('should resume valid saved screen', async () => {
      const mockState = {
        currentScreen: 'onboarding3',
        navigationHistory: ['onboarding1', 'onboarding2', 'onboarding3'],
        lastNavigationTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const result = await NavigationPersistenceService.getInitialScreenWithNavigation(false, 'onboarding1');
      
      expect(result.screen).toBe('onboarding3');
      expect(result.history).toEqual(['onboarding1', 'onboarding2', 'onboarding3']);
      expect(console.log).toHaveBeenCalledWith('🔄 Resuming navigation at: onboarding3');
    });

    test('should fallback when saved screen cannot be resumed', async () => {
      const mockState = {
        currentScreen: 'processing', // Transient screen
        navigationHistory: ['onboarding1', 'processing'],
        lastNavigationTime: new Date().toISOString(),
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const result = await NavigationPersistenceService.getInitialScreenWithNavigation(true, 'onboarding1');
      
      expect(result.screen).toBe('onboarding1');
      expect(result.history).toEqual(['onboarding1']);
      expect(console.log).toHaveBeenCalledWith('📱 No resumable screens found, using fallback');
    });

  });

  describe('Navigation History Management', () => {
    
    test('should add screen to history', () => {
      const currentHistory: ScreenType[] = ['onboarding1', 'onboarding2'];
      const newHistory = NavigationPersistenceService.updateNavigationHistory(
        currentHistory,
        'onboarding3',
        false
      );
      
      expect(newHistory).toEqual(['onboarding1', 'onboarding2', 'onboarding3']);
    });

    test('should replace current screen in history', () => {
      const currentHistory: ScreenType[] = ['onboarding1', 'onboarding2'];
      const newHistory = NavigationPersistenceService.updateNavigationHistory(
        currentHistory,
        'paywall',
        true
      );
      
      expect(newHistory).toEqual(['onboarding1', 'paywall']);
    });

    test('should handle empty history when replacing', () => {
      const currentHistory: ScreenType[] = [];
      const newHistory = NavigationPersistenceService.updateNavigationHistory(
        currentHistory,
        'onboarding1',
        true
      );
      
      expect(newHistory).toEqual(['onboarding1']);
    });

    test('should limit history size', () => {
      // Create a history with 21 items (over the MAX_HISTORY_SIZE of 20)
      const longHistory = Array.from({ length: 21 }, (_, i) => `screen${i}`) as ScreenType[];
      const newHistory = NavigationPersistenceService.updateNavigationHistory(
        longHistory,
        'onboarding3' as ScreenType,
        false
      );
      
      expect(newHistory.length).toBe(20);
      expect(newHistory[newHistory.length - 1]).toBe('onboarding3');
    });

  });

  describe('Data Management', () => {
    
    test('should clear navigation state', async () => {
      await NavigationPersistenceService.clearNavigationState();
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('navigation_state');
      expect(console.log).toHaveBeenCalledWith('🧹 Navigation state cleared');
    });

    test('should detect stale navigation state', async () => {
      const staleState = {
        currentScreen: 'onboarding1',
        navigationHistory: ['onboarding1'],
        lastNavigationTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(staleState));
      
      const isStale = await NavigationPersistenceService.isNavigationStateStale();
      
      expect(isStale).toBe(true);
    });

    test('should detect fresh navigation state', async () => {
      const freshState = {
        currentScreen: 'onboarding1',
        navigationHistory: ['onboarding1'],
        lastNavigationTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(freshState));
      
      const isStale = await NavigationPersistenceService.isNavigationStateStale();
      
      expect(isStale).toBe(false);
    });

  });

  describe('Session Management', () => {
    
    test('should create new session ID if none exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      await NavigationPersistenceService.saveNavigationState('onboarding1', ['onboarding1']);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'session_id',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      );
    });

    test('should reuse existing session ID', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('existing_session_123');
      
      await NavigationPersistenceService.saveNavigationState('onboarding1', ['onboarding1']);
      
      // Should not create a new session ID
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'navigation_state',
        expect.stringContaining('"sessionId":"existing_session_123"')
      );
    });

  });

  describe('Analytics', () => {
    
    test('should provide navigation analytics', async () => {
      const mockState = {
        currentScreen: 'paywall',
        navigationHistory: ['onboarding1', 'onboarding2', 'paywall'],
        lastNavigationTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        sessionId: 'session_123',
        appVersion: '1.0.0'
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockState));
      
      const analytics = await NavigationPersistenceService.getNavigationAnalytics();
      
      expect(analytics).toMatchObject({
        currentScreen: 'paywall',
        historyLength: 3,
        sessionId: 'session_123',
        sessionDurationMinutes: 30,
        appVersion: '1.0.0',
        canResumeCurrentScreen: true,
      });
    });

    test('should return null analytics for missing state', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const analytics = await NavigationPersistenceService.getNavigationAnalytics();
      
      expect(analytics).toBeNull();
    });

  });

  describe('Legacy Data Migration', () => {
    
    test('should migrate legacy navigation keys', async () => {
      // Mock legacy keys
      mockAsyncStorage.getItem
        .mockResolvedValueOnce('onboarding2') // currentScreen
        .mockResolvedValueOnce('["onboarding1","onboarding2"]') // navigationHistory
        .mockResolvedValueOnce('results'); // lastScreen
      
      await NavigationPersistenceService.migrateLegacyNavigationData();
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('currentScreen');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('navigationHistory');
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('lastScreen');
      
      expect(console.log).toHaveBeenCalledWith('✅ Legacy navigation data migration completed');
    });

    test('should handle migration errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Migration error'));
      
      await NavigationPersistenceService.migrateLegacyNavigationData();
      
      expect(console.error).toHaveBeenCalledWith('❌ Error migrating legacy navigation data:', expect.any(Error));
    });

  });

});

describe('NavigationPersistenceService Integration', () => {
  
  test('should handle complete navigation flow', async () => {
    // Start with no saved state
    mockAsyncStorage.getItem.mockResolvedValue(null);
    
    // Get initial screen
    let result = await NavigationPersistenceService.getInitialScreenWithNavigation(false, 'onboarding1');
    expect(result.screen).toBe('onboarding1');
    
    // Navigate to next screen
    await NavigationPersistenceService.saveNavigationState('onboarding2', ['onboarding1', 'onboarding2']);
    
    // Mock the saved state for next call
    const savedState = {
      currentScreen: 'onboarding2',
      navigationHistory: ['onboarding1', 'onboarding2'],
      lastNavigationTime: new Date().toISOString(),
      sessionId: 'session_123',
      appVersion: '1.0.0'
    };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedState));
    
    // Should resume at saved screen
    result = await NavigationPersistenceService.getInitialScreenWithNavigation(false, 'onboarding1');
    expect(result.screen).toBe('onboarding2');
    expect(result.history).toEqual(['onboarding1', 'onboarding2']);
    
    // Clear state (logout)
    await NavigationPersistenceService.clearNavigationState();
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('navigation_state');
    
    console.log('✅ Complete navigation flow test passed');
  });

});