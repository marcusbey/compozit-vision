import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService, { type JourneyStep } from '../services/database';
import { 
  ValidationResult,
  WizardStepId,
  WizardValidationState
} from '../types/validation';
import { wizardValidationService } from '../services/wizardValidationService';

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
    selectedPlanTier?: 'basic' | 'pro' | 'enterprise';
    planName?: string;
    planPrice?: string | number;
    paymentFrequency?: 'weekly' | 'monthly' | 'yearly';
    billingCycle: 'monthly' | 'yearly';
    useFreeCredits: boolean;
    selectedAt?: string;
    hasPayment?: boolean;
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
  
  // Project Creation Wizard
  projectWizard: {
    categoryId?: string;
    categoryName?: string;
    categoryType?: string;
    categorySlug?: string;
    roomId?: string;
    roomName?: string;
    selectedRooms?: string[];
    styleId?: string;
    styleName?: string;
    selectedReferences: string[];
    selectedPalettes?: string[];
    selectedPaletteId?: string;
    customColors?: string[];
    selectedSamplePhoto?: string;
    currentWizardStep?: 'category_selection' | 'space_definition' | 'photo_capture' | 'style_selection' | 'references_palettes' | 'ai_processing' | 'results' | 'completed';
    completedWizardSteps: string[];
    wizardStartedAt?: string;
    wizardCompletedAt?: string;
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
    paymentEmail?: string;
    authEmail?: string;
    emailsLinked?: boolean;
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
  
  // Enhanced validation state
  validationState: WizardValidationState;
  
  // State properties for backward compatibility
  currentStep: string;
  
  // Actions
  updateOnboarding: (data: Partial<UserJourneyData['onboarding']>) => void;
  updateSubscription: (data: Partial<UserJourneyData['subscription']>) => void;
  updatePlanSelection: (data: Partial<UserJourneyData['subscription']>) => void;
  updateProject: (data: Partial<UserJourneyData['project']>) => void;
  updateProjectWizard: (data: Partial<UserJourneyData['projectWizard']>) => void;
  updatePreferences: (data: Partial<UserJourneyData['preferences']>) => void;
  updateProgress: (data: Partial<UserJourneyData['progress']>) => void;
  updateAuthentication: (data: Partial<UserJourneyData['authentication']>) => void;
  updatePayment: (data: Partial<UserJourneyData['payment']>) => void;
  
  // Utility actions
  setCurrentStep: (step: number, screen: string) => void;
  completeStep: (stepName: string) => void;
  resetJourney: () => void;
  reset: () => void; // Alias for resetJourney - for backward compatibility
  persistJourney: () => Promise<void>;
  loadJourney: () => Promise<void>;
  loadJourneySteps: () => Promise<void>;
  getJourneySummary: () => object;
  isStepCompleted: (stepName: string) => boolean;
  getProgressPercentage: () => number;
  getStepInfo: (screen: string) => JourneyStep | undefined;
  getNextStep: (currentScreen: string) => JourneyStep | undefined;
  getPreviousStep: (currentScreen: string) => JourneyStep | undefined;
  
  // Enhanced validation methods
  validateWizardStep: (stepId: WizardStepId) => Promise<ValidationResult>;
  canProgressToNextStep: (currentStepId: WizardStepId) => boolean;
  getValidationErrors: (stepId: WizardStepId) => ValidationResult | null;
  getWizardProgress: () => { 
    completed: number; 
    total: number; 
    percentage: number;
    completedSteps: WizardStepId[];
    blockedSteps: WizardStepId[];
    currentStep: WizardStepId;
    canResume: boolean;
  };
  updateValidationState: (stepId: WizardStepId, result: ValidationResult) => void;
  resetValidation: () => void;
  
  // Legacy validation methods (for backward compatibility)
  getWizardValidationErrors: (stepName: string) => string[];
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
  projectWizard: {
    selectedReferences: [],
    selectedPalettes: [],
    completedWizardSteps: [],
    currentWizardStep: 'category_selection',
  },
  preferences: {
    stylePreferences: [],
    colorPreferences: [],
    materialPreferences: [],
    atmospherePreferences: [],
  },
  progress: {
    currentStep: 1,
    totalSteps: 11, // Total journey steps (auth removed - handled via payment)
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
  
  // Initialize validation state
  validationState: {
    currentStep: 'projectWizardStart',
    stepResults: {} as Record<WizardStepId, ValidationResult>,
    overallValid: false,
    completedSteps: [],
    blockedSteps: [],
    lastValidatedAt: {} as Record<WizardStepId, number>,
    retryAttempts: {}
  },

  // Backward compatibility properties
  currentStep: 'onboarding1',

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

  updatePlanSelection: (data) => {
    const current = get().subscription;
    const updated = { ...current, ...data };
    if ((data.selectedPlanTier || data.selectedPlanId) && !current.selectedAt) {
      updated.selectedAt = new Date().toISOString();
    }
    set({ subscription: updated });
    get().persistJourney();
    console.log('🎯 Plan selection updated:', updated);
  },

  updateProject: (data) => {
    const current = get().project;
    const updated = { ...current, ...data };
    set({ project: updated });
    get().persistJourney();
    console.log('🏠 Project updated:', updated);
  },

  updateProjectWizard: (data) => {
    const current = get().projectWizard;
    const updated = { ...current, ...data };
    
    // Auto-track wizard start time
    if (data.currentWizardStep && !current.wizardStartedAt) {
      updated.wizardStartedAt = new Date().toISOString();
    }
    
    // Mark wizard as completed if all steps done
    if (data.currentWizardStep === 'completed' && !current.wizardCompletedAt) {
      updated.wizardCompletedAt = new Date().toISOString();
    }
    
    // Track completed steps
    if (data.currentWizardStep && !updated.completedWizardSteps.includes(data.currentWizardStep)) {
      updated.completedWizardSteps = [...updated.completedWizardSteps, data.currentWizardStep];
    }
    
    set({ projectWizard: updated });
    get().persistJourney();
    console.log('🔮 Project Wizard updated:', updated);
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

  reset: () => {
    get().resetJourney();
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

  // Enhanced Validation Methods
  validateWizardStep: async (stepId: WizardStepId): Promise<ValidationResult> => {
    const state = get();
    
    // Map journey store data to validation data format
    const getValidationData = (stepId: WizardStepId) => {
      switch (stepId) {
        case 'projectWizardStart':
          return {
            projectName: undefined, // Optional for now
            isAuthenticated: state.authentication.hasAccount,
            availableCredits: 10, // Would come from user store
            userPlan: 'free' // Would come from user store
          };
        case 'categorySelection':
          return {
            selectedCategory: state.projectWizard.categoryId,
            categoryFeatures: [],
            planCompatibility: {}
          };
        case 'spaceDefinition':
          return {
            roomType: state.projectWizard.roomId,
            dimensions: undefined,
            spaceCharacteristics: state.projectWizard.selectedRooms || [],
            lighting: undefined,
            existingFeatures: []
          };
        case 'styleSelection':
          return {
            selectedStyles: state.onboarding.selectedStyles,
            styleCompatibility: {},
            spaceTypeCompatibility: {}
          };
        case 'referencesColors':
          return {
            referenceImages: [],
            colorPalettes: state.projectWizard.selectedPalettes?.map(id => ({
              id,
              colors: [],
              source: 'user' as const
            })) || [],
            uploadStatus: {}
          };
        case 'aiProcessing':
          return {
            allRequiredDataPresent: true,
            processingCreditsRequired: 5,
            customPrompt: undefined,
            enhancementOptions: [],
            processingComplexity: 'basic' as const
          };
        default:
          return {};
      }
    };

    try {
      const validationData = getValidationData(stepId);
      const result = await wizardValidationService.validateStep(stepId, validationData);
      
      // Update validation state in store
      get().updateValidationState(stepId, result);
      
      return result;
    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        errors: [{
          ruleId: 'system-error',
          field: 'validation',
          severity: 'error',
          message: 'Validation system error',
          timestamp: Date.now()
        }],
        warnings: [],
        infos: [],
        summary: { errorCount: 1, warningCount: 0, blockers: ['validation'] }
      };
      
      get().updateValidationState(stepId, errorResult);
      return errorResult;
    }
  },

  canProgressToNextStep: (currentStepId: WizardStepId) => {
    const state = get();
    const stepResult = state.validationState.stepResults[currentStepId];
    return stepResult ? stepResult.isValid : false;
  },

  getValidationErrors: (stepId: WizardStepId) => {
    const state = get();
    return state.validationState.stepResults[stepId] || null;
  },

  updateValidationState: (stepId: WizardStepId, result: ValidationResult) => {
    const currentValidationState = get().validationState;
    const updatedState = {
      ...currentValidationState,
      stepResults: {
        ...currentValidationState.stepResults,
        [stepId]: result
      },
      lastValidatedAt: {
        ...currentValidationState.lastValidatedAt,
        [stepId]: Date.now()
      }
    };

    // Update completed steps
    if (result.isValid && !updatedState.completedSteps.includes(stepId)) {
      updatedState.completedSteps = [...updatedState.completedSteps, stepId];
    } else if (!result.isValid && updatedState.completedSteps.includes(stepId)) {
      updatedState.completedSteps = updatedState.completedSteps.filter(s => s !== stepId);
    }

    // Update blocked steps
    const blockedSteps: WizardStepId[] = [];
    const stepOrder: WizardStepId[] = [
      'projectWizardStart', 'categorySelection', 'spaceDefinition',
      'styleSelection', 'referencesColors', 'aiProcessing'
    ];

    for (const step of stepOrder) {
      if (!wizardValidationService.canAccessStep(step)) {
        blockedSteps.push(step);
      }
    }
    updatedState.blockedSteps = blockedSteps;

    // Update overall validity
    updatedState.overallValid = Object.values(updatedState.stepResults)
      .every(stepResult => stepResult.isValid);

    set({ validationState: updatedState });
  },

  resetValidation: () => {
    set({
      validationState: {
        currentStep: 'projectWizardStart',
        stepResults: {} as Record<WizardStepId, ValidationResult>,
        overallValid: false,
        completedSteps: [],
        blockedSteps: [],
        lastValidatedAt: {} as Record<WizardStepId, number>,
        retryAttempts: {}
      }
    });
    wizardValidationService.resetValidation();
  },

  getWizardValidationErrors: (stepName: string) => {
    const state = get();
    const errors: string[] = [];

    switch (stepName) {
      case 'category_selection':
        if (!state.projectWizard.categoryId) {
          errors.push('Please select a project category');
        }
        break;
      case 'room_selection':
        if (!state.projectWizard.selectedRooms || state.projectWizard.selectedRooms.length === 0) {
          errors.push('Please select at least one room');
        }
        break;
      case 'photo_capture':
        if (!state.project.photoUri && !state.projectWizard.selectedSamplePhoto) {
          errors.push('Please capture a photo or select a sample');
        }
        break;
      case 'style_selection':
        if (!state.onboarding.selectedStyles || state.onboarding.selectedStyles.length === 0) {
          errors.push('Please select a design style');
        }
        break;
      case 'references_selection':
        if (!state.projectWizard.selectedReferences || state.projectWizard.selectedReferences.length === 0) {
          errors.push('Please select reference images or color palettes');
        }
        break;
    }

    return errors;
  },

  getWizardProgress: () => {
    const state = get();
    const { validationState } = state;
    const totalWizardSteps = 6; // All 6 wizard steps
    const completedSteps = validationState.completedSteps;
    
    return {
      completed: completedSteps.length,
      total: totalWizardSteps,
      percentage: Math.round((completedSteps.length / totalWizardSteps) * 100),
      completedSteps,
      blockedSteps: validationState.blockedSteps,
      currentStep: validationState.currentStep,
      canResume: completedSteps.length > 0 && !validationState.overallValid,
    };
  },

  resumeWizardFromLastStep: () => {
    const state = get();
    const progress = get().getWizardProgress();
    
    if (!progress.canResume) {
      return null;
    }

    // Determine the next incomplete step
    const stepOrder = ['category_selection', 'room_selection', 'photo_capture', 'style_selection', 'references_selection'];
    const completedSteps = state.projectWizard.completedWizardSteps || [];
    
    for (const step of stepOrder) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    
    return 'references_selection'; // Default to last step
  },

  resetWizardProgress: () => {
    set(state => ({
      projectWizard: {
        ...state.projectWizard,
        completedWizardSteps: [],
        currentWizardStep: 'category_selection',
        wizardStartedAt: undefined,
        wizardCompletedAt: undefined,
      }
    }));
    get().persistJourney();
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