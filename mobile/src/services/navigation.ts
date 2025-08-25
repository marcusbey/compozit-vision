/**
 * Navigation Persistence Service
 * Manages navigation state persistence across app sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

type ScreenType = 
  | 'onboarding1'
  | 'onboarding2'
  | 'onboarding3'
  | 'paywall'
  | 'photoCapture'
  | 'descriptions'
  | 'furniture'
  | 'budget'
  | 'auth'
  | 'checkout'
  | 'processing'
  | 'results'
  | 'myProjects'
  | 'profile'
  | 'demo'
  | 'welcome';

interface NavigationState {
  currentScreen: ScreenType;
  navigationHistory: ScreenType[];
  lastNavigationTime: string;
  sessionId: string;
  appVersion: string;
}

interface ScreenMetadata {
  canResume: boolean;
  requiresAuth: boolean;
  isTransient: boolean; // Screens that shouldn't be resumed (like processing)
  maxResumeAge: number; // Max minutes to allow resuming this screen
}

const NAVIGATION_KEY = 'navigation_state';

// Screen metadata to determine resumption behavior
const SCREEN_METADATA: Record<ScreenType, ScreenMetadata> = {
  // Onboarding screens - always resumable
  onboarding1: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 1440 }, // 24 hours
  onboarding2: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 1440 },
  onboarding3: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 1440 },
  
  // Plan selection - resumable for a while
  paywall: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 720 }, // 12 hours
  
  // Project screens - resumable for authenticated users
  photoCapture: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 360 }, // 6 hours
  descriptions: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 360 },
  furniture: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 360 },
  budget: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 360 },
  
  // Auth screens - short resume window
  auth: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 60 }, // 1 hour
  checkout: { canResume: true, requiresAuth: true, isTransient: false, maxResumeAge: 30 }, // 30 minutes
  
  // Processing screens - not resumable (transient)
  processing: { canResume: false, requiresAuth: true, isTransient: true, maxResumeAge: 5 },
  
  // Result screens - resumable for authenticated users
  results: { canResume: true, requiresAuth: true, isTransient: false, maxResumeAge: 1440 },
  
  // Main app screens - always resumable for authenticated users
  myProjects: { canResume: true, requiresAuth: true, isTransient: false, maxResumeAge: 10080 }, // 7 days
  profile: { canResume: true, requiresAuth: true, isTransient: false, maxResumeAge: 10080 },
  
  // Other screens
  demo: { canResume: false, requiresAuth: false, isTransient: true, maxResumeAge: 0 },
  welcome: { canResume: true, requiresAuth: false, isTransient: false, maxResumeAge: 1440 },
};

export class NavigationPersistenceService {
  
  /**
   * Save current navigation state
   */
  static async saveNavigationState(
    currentScreen: ScreenType, 
    navigationHistory: ScreenType[]
  ): Promise<void> {
    try {
      const state: NavigationState = {
        currentScreen,
        navigationHistory,
        lastNavigationTime: new Date().toISOString(),
        sessionId: await this.getSessionId(),
        appVersion: '1.0.0', // Could be dynamic
      };
      
      await AsyncStorage.setItem(NAVIGATION_KEY, JSON.stringify(state));
      console.log(`📍 Navigation state saved: ${currentScreen}`);
      
    } catch (error) {
      console.error('❌ Failed to save navigation state:', error);
    }
  }

  /**
   * Get saved navigation state
   */
  static async getNavigationState(): Promise<NavigationState | null> {
    try {
      const stored = await AsyncStorage.getItem(NAVIGATION_KEY);
      
      if (stored) {
        return JSON.parse(stored) as NavigationState;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Failed to get navigation state:', error);
      return null;
    }
  }

  /**
   * Determine if a screen can be resumed based on current conditions
   */
  static canResumeScreen(
    screen: ScreenType, 
    isAuthenticated: boolean,
    lastNavigationTime: string
  ): boolean {
    const metadata = SCREEN_METADATA[screen];
    
    // Check if screen is resumable at all
    if (!metadata.canResume) {
      console.log(`⚠️ Screen ${screen} is not resumable`);
      return false;
    }
    
    // Check authentication requirement
    if (metadata.requiresAuth && !isAuthenticated) {
      console.log(`🔐 Screen ${screen} requires authentication`);
      return false;
    }
    
    // Check age of navigation state
    const navigationAge = (Date.now() - new Date(lastNavigationTime).getTime()) / (1000 * 60); // minutes
    if (navigationAge > metadata.maxResumeAge) {
      console.log(`⏰ Screen ${screen} navigation state too old: ${Math.round(navigationAge)}min > ${metadata.maxResumeAge}min`);
      return false;
    }
    
    // Check if screen is transient
    if (metadata.isTransient) {
      console.log(`⚡ Screen ${screen} is transient, not resuming`);
      return false;
    }
    
    return true;
  }

  /**
   * Get the appropriate initial screen considering saved navigation state
   */
  static async getInitialScreenWithNavigation(
    isAuthenticated: boolean,
    fallbackScreen: ScreenType = 'onboarding1'
  ): Promise<{ screen: ScreenType; history: ScreenType[] }> {
    try {
      const savedState = await this.getNavigationState();
      
      if (!savedState) {
        console.log('📱 No saved navigation state, using fallback');
        return { screen: fallbackScreen, history: [fallbackScreen] };
      }
      
      const { currentScreen, navigationHistory, lastNavigationTime } = savedState;
      
      // Check if we can resume the saved screen
      if (this.canResumeScreen(currentScreen, isAuthenticated, lastNavigationTime)) {
        console.log(`🔄 Resuming navigation at: ${currentScreen}`);
        return { 
          screen: currentScreen, 
          history: navigationHistory.length > 0 ? navigationHistory : [currentScreen]
        };
      }
      
      // If we can't resume the current screen, try to find a suitable screen from history
      const resumableScreen = this.findResumableScreenFromHistory(
        navigationHistory, 
        isAuthenticated, 
        lastNavigationTime
      );
      
      if (resumableScreen) {
        console.log(`🔄 Resuming navigation at fallback screen: ${resumableScreen}`);
        return { screen: resumableScreen, history: [resumableScreen] };
      }
      
      // No resumable screens found, use fallback
      console.log('📱 No resumable screens found, using fallback');
      return { screen: fallbackScreen, history: [fallbackScreen] };
      
    } catch (error) {
      console.error('❌ Error getting initial screen with navigation:', error);
      return { screen: fallbackScreen, history: [fallbackScreen] };
    }
  }

  /**
   * Find a resumable screen from navigation history
   */
  private static findResumableScreenFromHistory(
    history: ScreenType[],
    isAuthenticated: boolean,
    lastNavigationTime: string
  ): ScreenType | null {
    // Go through history in reverse order (most recent first)
    for (let i = history.length - 1; i >= 0; i--) {
      const screen = history[i];
      if (this.canResumeScreen(screen, isAuthenticated, lastNavigationTime)) {
        return screen;
      }
    }
    
    return null;
  }

  /**
   * Clear navigation state (useful for logout or reset)
   */
  static async clearNavigationState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NAVIGATION_KEY);
      console.log('🧹 Navigation state cleared');
    } catch (error) {
      console.error('❌ Failed to clear navigation state:', error);
    }
  }

  /**
   * Update navigation history with new screen
   */
  static updateNavigationHistory(
    currentHistory: ScreenType[], 
    newScreen: ScreenType,
    replaceMode: boolean = false
  ): ScreenType[] {
    if (replaceMode) {
      // Replace current screen
      return currentHistory.length > 0 
        ? [...currentHistory.slice(0, -1), newScreen]
        : [newScreen];
    } else {
      // Add to history
      const newHistory = [...currentHistory, newScreen];
      
      // Limit history size to prevent memory issues
      const MAX_HISTORY_SIZE = 20;
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(-MAX_HISTORY_SIZE);
      }
      
      return newHistory;
    }
  }

  /**
   * Get navigation analytics
   */
  static async getNavigationAnalytics() {
    try {
      const state = await this.getNavigationState();
      
      if (!state) {
        return null;
      }
      
      const sessionDuration = Date.now() - new Date(state.lastNavigationTime).getTime();
      
      return {
        currentScreen: state.currentScreen,
        historyLength: state.navigationHistory.length,
        sessionId: state.sessionId,
        sessionDurationMinutes: Math.round(sessionDuration / (1000 * 60)),
        appVersion: state.appVersion,
        canResumeCurrentScreen: this.canResumeScreen(
          state.currentScreen, 
          true, // Assume authenticated for analytics
          state.lastNavigationTime
        ),
      };
    } catch (error) {
      console.error('❌ Error getting navigation analytics:', error);
      return null;
    }
  }

  /**
   * Generate or retrieve session ID
   */
  private static async getSessionId(): Promise<string> {
    try {
      const existingId = await AsyncStorage.getItem('session_id');
      
      if (existingId) {
        return existingId;
      }
      
      const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('session_id', newId);
      
      return newId;
    } catch (error) {
      console.error('❌ Error managing session ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Check if navigation state is stale and needs refresh
   */
  static async isNavigationStateStale(): Promise<boolean> {
    try {
      const state = await this.getNavigationState();
      
      if (!state) {
        return false; // No state to be stale
      }
      
      const ageMinutes = (Date.now() - new Date(state.lastNavigationTime).getTime()) / (1000 * 60);
      const MAX_STATE_AGE = 24 * 60; // 24 hours
      
      return ageMinutes > MAX_STATE_AGE;
    } catch (error) {
      console.error('❌ Error checking navigation state staleness:', error);
      return false;
    }
  }

  /**
   * Migrate from old navigation storage (if exists)
   */
  static async migrateLegacyNavigationData(): Promise<void> {
    try {
      // Check for old keys and migrate if they exist
      const legacyKeys = ['currentScreen', 'navigationHistory', 'lastScreen'];
      
      for (const key of legacyKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          console.log(`🔄 Migrating legacy navigation key: ${key}`);
          await AsyncStorage.removeItem(key);
        }
      }
      
      console.log('✅ Legacy navigation data migration completed');
    } catch (error) {
      console.error('❌ Error migrating legacy navigation data:', error);
    }
  }

}

export default NavigationPersistenceService;