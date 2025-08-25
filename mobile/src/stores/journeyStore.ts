import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService, { type JourneyStep } from '../services/database';

// Define the complete user journey data structure
export interface UserJourneyData {
  // Onboarding Phase
  onboarding: {
    selectedStyles: string[];
    completedScreens: number;
    startedAt?: string;
    completedAt?: string;
  };
  
  // Plan Selection
  subscription: {
    selectedPlanId?: string;
    planName?: string;
    planPrice?: string;
    billingCycle: 'monthly' | 'yearly';
    useFreeCredits: boolean;
    selectedAt?: string;
  };
  
  // Project Details
  project: {
    roomType?: string;
    photoUri?: string;
    photoMetadata?: {
      width?: number;
      height?: number;
      size?: number;
      timestamp?: string;
    };
    descriptions?: string;
    furniturePreferences: string[];
    budgetRange?: {
      min: number;
      max: number;
      currency: string;
    };
    location?: {
      zipCode?: string;
      city?: string;
      state?: string;
    };
  };
  
  // User Preferences
  preferences: {
    stylePreferences: string[];
    colorPreferences: string[];
    materialPreferences: string[];
    atmospherePreferences: string[];
  };
  
  // Journey Progress
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
    currentScreen: string;
    lastUpdated: string;
  };
  
  // Authentication
  authentication: {
    hasAccount: boolean;
    email?: string;
    registeredAt?: string;
    method?: 'email' | 'google' | 'apple';
  };
  
  // Payment
  payment: {
    requiresPayment: boolean;
    paymentMethod?: 'stripe' | 'apple';
    paymentIntentId?: string;
    completedAt?: string;
    amount?: number;
    currency?: string;
  };
}

export interface JourneyState extends UserJourneyData {
  // Database-driven journey steps
  journeySteps: JourneyStep[];
  loadingSteps: boolean;
  
  // Actions
  updateOnboarding: (data: Partial<UserJourneyData['onboarding']>) => void;
  updateSubscription: (data: Partial<UserJourneyData['subscription']>) => void;
  updateProject: (data: Partial<UserJourneyData['project']>) => void;
  updatePreferences: (data: Partial<UserJourneyData['preferences']>) => void;
  updateProgress: (data: Partial<UserJourneyData['progress']>) => void;
  updateAuthentication: (data: Partial<UserJourneyData['authentication']>) => void;
  updatePayment: (data: Partial<UserJourneyData['payment']>) => void;
  
  // Utility actions
  setCurrentStep: (step: number, screen: string) => void;
  completeStep: (stepName: string) => void;
  resetJourney: () => void;
  persistJourney: () => Promise<void>;
  loadJourney: () => Promise<void>;
  loadJourneySteps: () => Promise<void>;
  getJourneySummary: () => object;
  isStepCompleted: (stepName: string) => boolean;
  getProgressPercentage: () => number;
  getStepInfo: (screen: string) => JourneyStep | undefined;
  getNextStep: (currentScreen: string) => JourneyStep | undefined;
  getPreviousStep: (currentScreen: string) => JourneyStep | undefined;
}

// Default state
const defaultJourneyData: UserJourneyData = {
  onboarding: {
    selectedStyles: [],
    completedScreens: 0,
  },
  subscription: {
    billingCycle: 'monthly',
    useFreeCredits: false,
  },
  project: {
    furniturePreferences: [],
  },
  preferences: {
    stylePreferences: [],
    colorPreferences: [],
    materialPreferences: [],
    atmospherePreferences: [],
  },
  progress: {
    currentStep: 1,
    totalSteps: 12, // Total journey steps
    completedSteps: [],
    currentScreen: 'onboarding1',
    lastUpdated: new Date().toISOString(),
  },
  authentication: {
    hasAccount: false,
  },
  payment: {
    requiresPayment: false,
    currency: 'USD',
  },
};

export const useJourneyStore = create<JourneyState>((set, get) => ({
  ...defaultJourneyData,
  
  // Database-driven state
  journeySteps: [],
  loadingSteps: false,

  updateOnboarding: (data) => {
    const current = get().onboarding;
    const updated = { ...current, ...data };
    set({ onboarding: updated });
    get().persistJourney();
    console.log('🎨 Onboarding updated:', updated);
  },

  updateSubscription: (data) => {
    const current = get().subscription;
    const updated = { ...current, ...data };
    if (data.selectedPlanId) {
      updated.selectedAt = new Date().toISOString();
    }
    set({ subscription: updated });
    get().persistJourney();
    console.log('💳 Subscription updated:', updated);
  },

  updateProject: (data) => {
    const current = get().project;
    const updated = { ...current, ...data };
    set({ project: updated });
    get().persistJourney();
    console.log('🏠 Project updated:', updated);
  },

  updatePreferences: (data) => {
    const current = get().preferences;
    const updated = { ...current, ...data };
    set({ preferences: updated });
    get().persistJourney();
    console.log('⚙️ Preferences updated:', updated);
  },

  updateProgress: (data) => {
    const current = get().progress;
    const updated = { 
      ...current, 
      ...data, 
      lastUpdated: new Date().toISOString() 
    };
    set({ progress: updated });
    get().persistJourney();
    console.log('📊 Progress updated:', updated);
  },

  updateAuthentication: (data) => {
    const current = get().authentication;
    const updated = { ...current, ...data };
    if (data.hasAccount && !current.hasAccount) {
      updated.registeredAt = new Date().toISOString();
    }
    set({ authentication: updated });
    get().persistJourney();
    console.log('🔐 Authentication updated:', updated);
  },

  updatePayment: (data) => {
    const current = get().payment;
    const updated = { ...current, ...data };
    if (data.paymentIntentId && !current.paymentIntentId) {
      updated.completedAt = new Date().toISOString();
    }
    set({ payment: updated });
    get().persistJourney();
    console.log('💰 Payment updated:', updated);
  },

  setCurrentStep: (step, screen) => {
    get().updateProgress({
      currentStep: step,
      currentScreen: screen,
    });
  },

  completeStep: (stepName) => {
    const current = get().progress;
    if (!current.completedSteps.includes(stepName)) {
      const completedSteps = [...current.completedSteps, stepName];
      get().updateProgress({ completedSteps });
    }
  },

  resetJourney: () => {
    set(defaultJourneyData);
    AsyncStorage.removeItem('userJourneyData');
    console.log('🔄 Journey reset to defaults');
  },

  persistJourney: async () => {
    try {
      const state = get();
      const journeyData = {
        onboarding: state.onboarding,
        subscription: state.subscription,
        project: state.project,
        preferences: state.preferences,
        progress: state.progress,
        authentication: state.authentication,
        payment: state.payment,
      };
      
      await AsyncStorage.setItem('userJourneyData', JSON.stringify(journeyData));
      console.log('💾 Journey data persisted to storage');
    } catch (error) {
      console.error('❌ Failed to persist journey data:', error);
    }
  },

  loadJourney: async () => {
    try {
      const stored = await AsyncStorage.getItem('userJourneyData');
      if (stored) {
        const journeyData = JSON.parse(stored);
        set({ ...defaultJourneyData, ...journeyData });
        console.log('📂 Journey data loaded from storage');
      }
      // Load journey steps from database
      await get().loadJourneySteps();
    } catch (error) {
      console.error('❌ Failed to load journey data:', error);
    }
  },

  loadJourneySteps: async () => {
    try {
      set({ loadingSteps: true });
      console.log('🔄 Loading journey steps from database...');
      
      const steps = await DatabaseService.getJourneySteps();
      
      // Update total steps based on database data
      const totalSteps = steps.length;
      set({ 
        journeySteps: steps,
        loadingSteps: false,
        progress: {
          ...get().progress,
          totalSteps
        }
      });
      
      console.log(`✅ Loaded ${steps.length} journey steps from database`);
      
    } catch (error) {
      console.error('❌ Failed to load journey steps:', error);
      set({ 
        loadingSteps: false,
        journeySteps: [] // Fallback to empty array
      });
    }
  },

  getJourneySummary: () => {
    const state = get();
    return {
      progress: `${state.progress.currentStep}/${state.progress.totalSteps}`,
      selectedPlan: state.subscription.selectedPlanId || 'free',
      hasPhoto: !!state.project.photoUri,
      stylesSelected: state.onboarding.selectedStyles.length,
      preferencesSet: state.preferences.stylePreferences.length > 0,
      authenticated: state.authentication.hasAccount,
      paymentRequired: state.payment.requiresPayment,
      completionPercentage: get().getProgressPercentage(),
    };
  },

  isStepCompleted: (stepName) => {
    return get().progress.completedSteps.includes(stepName);
  },

  getProgressPercentage: () => {
    const { currentStep, totalSteps } = get().progress;
    return Math.round((currentStep / totalSteps) * 100);
  },

  getStepInfo: (screen) => {
    const { journeySteps } = get();
    return journeySteps.find(s => s.screen_name === screen);
  },

  getNextStep: (currentScreen) => {
    const { journeySteps } = get();
    const currentIndex = journeySteps.findIndex(s => s.screen_name === currentScreen);
    return journeySteps[currentIndex + 1];
  },

  getPreviousStep: (currentScreen) => {
    const { journeySteps } = get();
    const currentIndex = journeySteps.findIndex(s => s.screen_name === currentScreen);
    return journeySteps[currentIndex - 1];
  },
}));

/**
 * Database-driven journey step helpers
 * These functions now use the store's database-loaded steps
 */

// Helper functions that use the journey store
export const getStepInfo = (screen: string) => {
  return useJourneyStore.getState().getStepInfo(screen);
};

export const getNextStep = (currentScreen: string) => {
  return useJourneyStore.getState().getNextStep(currentScreen);
};

export const getPreviousStep = (currentScreen: string) => {
  return useJourneyStore.getState().getPreviousStep(currentScreen);
};

/**
 * Initialize journey data and load from database
 * Call this on app startup
 */
export const initializeJourney = async () => {
  const store = useJourneyStore.getState();
  console.log('🚀 Initializing journey system...');
  
  // Load persisted journey data and database steps
  await store.loadJourney();
  
  console.log('✅ Journey system initialized');
};