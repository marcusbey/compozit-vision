/**
 * Onboarding Service
 * Manages first-time user detection and onboarding flow
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  onboardingVersion: number;
  completedOnboarding: boolean;
  skippedOnboarding: boolean;
  firstLaunchDate: string;
  lastLaunchDate: string;
  appVersion: string;
}

interface UserJourneyData {
  currentScreen: string;
  completedSteps: string[];
  selectedStyles: string[];
  selectedPlan?: string;
  lastSavedAt: string;
}

const ONBOARDING_KEYS = {
  STATE: 'onboarding_state',
  JOURNEY: 'user_journey',
  USER_PREFERENCES: 'user_preferences',
} as const;

const CURRENT_ONBOARDING_VERSION = 1;

export class OnboardingService {
  
  /**
   * Check if this is the first time user is opening the app
   */
  static async isFirstTimeUser(): Promise<boolean> {
    try {
      const onboardingState = await this.getOnboardingState();
      return !onboardingState.hasSeenOnboarding;
    } catch (error) {
      console.error('Error checking first time user:', error);
      // If there's any error, assume first time user for safety
      return true;
    }
  }

  /**
   * Get complete onboarding state
   */
  static async getOnboardingState(): Promise<OnboardingState> {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEYS.STATE);
      
      if (stored) {
        const state = JSON.parse(stored) as OnboardingState;
        
        // Update last launch date
        state.lastLaunchDate = new Date().toISOString();
        await this.saveOnboardingState(state);
        
        return state;
      }
      
      // Create initial state for new user
      const newState: OnboardingState = {
        hasSeenOnboarding: false,
        onboardingVersion: CURRENT_ONBOARDING_VERSION,
        completedOnboarding: false,
        skippedOnboarding: false,
        firstLaunchDate: new Date().toISOString(),
        lastLaunchDate: new Date().toISOString(),
        appVersion: '1.0.0', // Could be dynamic
      };
      
      await this.saveOnboardingState(newState);
      return newState;
      
    } catch (error) {
      console.error('Error getting onboarding state:', error);
      
      // Fallback state
      return {
        hasSeenOnboarding: false,
        onboardingVersion: CURRENT_ONBOARDING_VERSION,
        completedOnboarding: false,
        skippedOnboarding: false,
        firstLaunchDate: new Date().toISOString(),
        lastLaunchDate: new Date().toISOString(),
        appVersion: '1.0.0',
      };
    }
  }

  /**
   * Save onboarding state
   */
  static async saveOnboardingState(state: OnboardingState): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEYS.STATE, JSON.stringify(state));
      console.log('✅ Onboarding state saved');
    } catch (error) {
      console.error('❌ Error saving onboarding state:', error);
    }
  }

  /**
   * Mark onboarding as started
   */
  static async startOnboarding(): Promise<void> {
    try {
      const state = await this.getOnboardingState();
      state.hasSeenOnboarding = true;
      await this.saveOnboardingState(state);
      
      console.log('🚀 Onboarding started');
    } catch (error) {
      console.error('❌ Error starting onboarding:', error);
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(): Promise<void> {
    try {
      const state = await this.getOnboardingState();
      state.hasSeenOnboarding = true;
      state.completedOnboarding = true;
      await this.saveOnboardingState(state);
      
      console.log('✅ Onboarding completed');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }
  }

  /**
   * Mark onboarding as skipped
   */
  static async skipOnboarding(): Promise<void> {
    try {
      const state = await this.getOnboardingState();
      state.hasSeenOnboarding = true;
      state.skippedOnboarding = true;
      await this.saveOnboardingState(state);
      
      console.log('⏭️ Onboarding skipped');
    } catch (error) {
      console.error('❌ Error skipping onboarding:', error);
    }
  }

  /**
   * Get user journey data
   */
  static async getUserJourney(): Promise<UserJourneyData | null> {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEYS.JOURNEY);
      
      if (stored) {
        return JSON.parse(stored) as UserJourneyData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user journey:', error);
      return null;
    }
  }

  /**
   * Save user journey data
   */
  static async saveUserJourney(journey: UserJourneyData): Promise<void> {
    try {
      journey.lastSavedAt = new Date().toISOString();
      await AsyncStorage.setItem(ONBOARDING_KEYS.JOURNEY, JSON.stringify(journey));
      console.log('💾 User journey saved');
    } catch (error) {
      console.error('❌ Error saving user journey:', error);
    }
  }

  /**
   * Clear all onboarding data (for testing/development)
   */
  static async clearOnboardingData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_KEYS.STATE,
        ONBOARDING_KEYS.JOURNEY,
        ONBOARDING_KEYS.USER_PREFERENCES,
        'hasSeenOnboarding', // Legacy key
        'userJourneyData', // Legacy key
      ]);
      
      console.log('🧹 Onboarding data cleared');
    } catch (error) {
      console.error('❌ Error clearing onboarding data:', error);
    }
  }

  /**
   * Determine the correct initial screen based on user state
   */
  static async getInitialScreen(isAuthenticated: boolean): Promise<string> {
    try {
      const onboardingState = await this.getOnboardingState();
      const journey = await this.getUserJourney();
      
      // First time users always start with onboarding
      if (!onboardingState.hasSeenOnboarding) {
        console.log('🆕 First time user - starting onboarding');
        return 'onboarding1';
      }
      
      // If user is authenticated, check their journey
      if (isAuthenticated) {
        if (journey?.currentScreen) {
          console.log(`🔄 Returning user - resuming at ${journey.currentScreen}`);
          return journey.currentScreen;
        }
        
        // Authenticated user without saved journey goes to projects
        console.log('👤 Authenticated user - going to projects');
        return 'myProjects';
      }
      
      // User has seen onboarding but not authenticated
      if (onboardingState.completedOnboarding) {
        console.log('📱 Returning user - needs authentication');
        return 'auth';
      } else {
        console.log('💰 User saw onboarding - showing paywall');
        return 'paywall';
      }
      
    } catch (error) {
      console.error('❌ Error determining initial screen:', error);
      // Fallback to onboarding for safety
      return 'onboarding1';
    }
  }

  /**
   * Check if onboarding needs to be updated (version change, etc.)
   */
  static async needsOnboardingUpdate(): Promise<boolean> {
    try {
      const state = await this.getOnboardingState();
      
      // Check if onboarding version is outdated
      if (state.onboardingVersion < CURRENT_ONBOARDING_VERSION) {
        return true;
      }
      
      // Could add more conditions here (app version change, feature updates, etc.)
      
      return false;
    } catch (error) {
      console.error('Error checking onboarding update:', error);
      return false;
    }
  }

  /**
   * Get onboarding analytics data
   */
  static async getOnboardingAnalytics() {
    try {
      const state = await this.getOnboardingState();
      const journey = await this.getUserJourney();
      
      const daysSinceFirstLaunch = state.firstLaunchDate 
        ? Math.floor((Date.now() - new Date(state.firstLaunchDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        isFirstTimeUser: !state.hasSeenOnboarding,
        hasCompletedOnboarding: state.completedOnboarding,
        hasSkippedOnboarding: state.skippedOnboarding,
        daysSinceFirstLaunch,
        onboardingVersion: state.onboardingVersion,
        currentJourneyStep: journey?.currentScreen || 'unknown',
        selectedStyles: journey?.selectedStyles?.length || 0,
        hasSelectedPlan: !!journey?.selectedPlan,
      };
    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      return null;
    }
  }

}

export default OnboardingService;