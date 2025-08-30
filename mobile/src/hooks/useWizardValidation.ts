import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import { 
  ValidationResult,
  ValidationError,
  ValidationRecoveryAction,
  WizardStepId,
  StepValidationData,
  ValidationContext
} from '../types/validation';
import { wizardValidationService } from '../services/wizardValidationService';
import { useUserStore } from '../stores/userStore';
import { useJourneyStore } from '../stores/journeyStore';

interface UseWizardValidationProps {
  stepId: WizardStepId;
  autoValidate?: boolean;
  validateOnMount?: boolean;
  debounceMs?: number;
}

interface UseWizardValidationReturn {
  // Validation state
  validationResult: ValidationResult | null;
  isValidating: boolean;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  canProgress: boolean;

  // Validation methods
  validateStep: (data: StepValidationData, trigger?: string) => Promise<ValidationResult>;
  validateField: (field: string, value: any) => Promise<ValidationError[]>;
  clearValidation: () => void;
  retryValidation: () => Promise<void>;

  // Recovery actions
  recoveryActions: ValidationRecoveryAction[];
  handleRecoveryAction: (action: ValidationRecoveryAction) => void;

  // Field-specific validation
  getFieldErrors: (field: string) => ValidationError[];
  getFieldStatus: (field: string) => 'valid' | 'invalid' | 'warning' | 'unknown';
  
  // Step navigation
  canAccessStep: (stepId: WizardStepId) => boolean;
  getNextBlockedStep: () => WizardStepId | null;
}

export const useWizardValidation = ({
  stepId,
  autoValidate = true,
  validateOnMount = false,
  debounceMs = 500
}: UseWizardValidationProps): UseWizardValidationReturn => {
  
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationData, setLastValidationData] = useState<StepValidationData | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const { user, availableCredits, currentPlan } = useUserStore();
  const { projectWizard, updateProjectWizard } = useJourneyStore();

  // Setup validation context
  const validationContext: ValidationContext = useMemo(() => {
    const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
    
    return {
      userId: user?.id || '',
      userPlan: currentPlan || 'free',
      availableCredits: isDevelopment && !availableCredits ? 999 : (availableCredits || 0), // Provide test credits in dev
      sessionData: { authenticated: !!user },
      journeyData: projectWizard,
      previousStepData: projectWizard || {}
    };
  }, [user, currentPlan, availableCredits, projectWizard]);

  // Initialize validation service context
  useEffect(() => {
    wizardValidationService.setContext(validationContext);
  }, [validationContext]);

  // Load existing validation result on mount
  useEffect(() => {
    if (validateOnMount) {
      const existingResult = wizardValidationService.getStepResult(stepId);
      if (existingResult) {
        setValidationResult(existingResult);
      }
    }
  }, [stepId, validateOnMount]);

  // Debounced validation function
  const validateStepDebounced = useCallback(async (
    data: StepValidationData, 
    trigger: string = 'onChange'
  ): Promise<ValidationResult> => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        setIsValidating(true);
        try {
          const result = await wizardValidationService.validateStep(stepId, data, trigger);
          setValidationResult(result);
          setLastValidationData(data);
          resolve(result);
        } catch (error) {
          const errorResult: ValidationResult = {
            isValid: false,
            errors: [{
              ruleId: 'validation-error',
              field: 'system',
              severity: 'error',
              message: error instanceof Error ? error.message : 'Validation failed',
              timestamp: Date.now()
            }],
            warnings: [],
            infos: [],
            summary: {
              errorCount: 1,
              warningCount: 0,
              blockers: ['system']
            }
          };
          setValidationResult(errorResult);
          resolve(errorResult);
        } finally {
          setIsValidating(false);
        }
      }, trigger === 'onChange' ? debounceMs : 0);

      setDebounceTimer(timer);
    });
  }, [stepId, debounceMs, debounceTimer]);

  // Main validation method
  const validateStep = useCallback(async (
    data: StepValidationData, 
    trigger: string = 'onSubmit'
  ): Promise<ValidationResult> => {
    return validateStepDebounced(data, trigger);
  }, [validateStepDebounced]);

  // Validate specific field
  const validateField = useCallback(async (
    field: string, 
    value: any
  ): Promise<ValidationError[]> => {
    if (!lastValidationData) return [];

    const fieldData = { ...lastValidationData, [field]: value };
    const result = await validateStepDebounced(fieldData as StepValidationData, 'onChange');
    
    return result.errors.filter(error => error.field === field);
  }, [lastValidationData, validateStepDebounced]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setLastValidationData(null);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  // Retry last validation
  const retryValidation = useCallback(async () => {
    if (!lastValidationData) return;
    await validateStepDebounced(lastValidationData, 'retry');
  }, [lastValidationData, validateStepDebounced]);

  // Get recovery actions for current validation result
  const recoveryActions = useMemo(() => {
    return wizardValidationService.getRecoveryActions(stepId);
  }, [stepId, validationResult]);

  // Handle recovery action
  const handleRecoveryAction = useCallback((action: ValidationRecoveryAction) => {
    switch (action.action) {
      case 'navigate':
        // Navigation will be handled by the screen
        break;
        
      case 'retry':
        retryValidation();
        break;
        
      case 'fix':
        // Highlight field for fixing
        break;
        
      case 'skip':
        // Allow skipping with confirmation
        Alert.alert(
          'Skip Validation',
          'Are you sure you want to skip this validation? This may affect the quality of your results.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', style: 'destructive', onPress: () => {
              // Mark as skipped and continue
            }}
          ]
        );
        break;
        
      case 'upgrade':
        // Navigate to upgrade screen
        break;
    }
  }, [retryValidation]);

  // Get errors for specific field
  const getFieldErrors = useCallback((field: string): ValidationError[] => {
    if (!validationResult) return [];
    return validationResult.errors.filter(error => error.field === field);
  }, [validationResult]);

  // Get field validation status
  const getFieldStatus = useCallback((field: string): 'valid' | 'invalid' | 'warning' | 'unknown' => {
    if (!validationResult) return 'unknown';
    
    const hasError = validationResult.errors.some(error => error.field === field);
    if (hasError) return 'invalid';
    
    const hasWarning = validationResult.warnings.some(warning => warning.field === field);
    if (hasWarning) return 'warning';
    
    // If the field has been validated and has no errors/warnings, it's valid
    const hasBeenValidated = validationResult.errors.length > 0 || 
                            validationResult.warnings.length > 0 || 
                            validationResult.infos.some(info => info.field === field);
    
    return hasBeenValidated ? 'valid' : 'unknown';
  }, [validationResult]);

  // Check if step can be accessed
  const canAccessStep = useCallback((targetStepId: WizardStepId): boolean => {
    return wizardValidationService.canAccessStep(targetStepId);
  }, []);

  // Get next blocked step
  const getNextBlockedStep = useCallback((): WizardStepId | null => {
    const stepOrder: WizardStepId[] = [
      'projectWizardStart',
      'categorySelection',
      'spaceDefinition', 
      'styleSelection',
      'referencesColors',
      'aiProcessing'
    ];

    const currentIndex = stepOrder.indexOf(stepId);
    for (let i = currentIndex + 1; i < stepOrder.length; i++) {
      const nextStepId = stepOrder[i];
      if (!canAccessStep(nextStepId)) {
        return nextStepId;
      }
    }
    
    return null;
  }, [stepId, canAccessStep]);

  // Computed validation state
  const isValid = validationResult?.isValid ?? false;
  const hasErrors = (validationResult?.errors.length ?? 0) > 0;
  const hasWarnings = (validationResult?.warnings.length ?? 0) > 0;
  const canProgress = isValid && !hasErrors;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // Validation state
    validationResult,
    isValidating,
    isValid,
    hasErrors,
    hasWarnings,
    canProgress,

    // Validation methods
    validateStep,
    validateField,
    clearValidation,
    retryValidation,

    // Recovery actions
    recoveryActions,
    handleRecoveryAction,

    // Field-specific validation
    getFieldErrors,
    getFieldStatus,

    // Step navigation
    canAccessStep,
    getNextBlockedStep,
  };
};