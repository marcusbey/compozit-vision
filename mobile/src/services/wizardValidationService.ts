import { 
  ValidationRule,
  ValidationError,
  ValidationResult,
  StepValidationResult,
  StepValidationConfig,
  WizardStepId,
  WizardValidationState,
  ValidationContext,
  ValidationRecoveryAction,
  CommonValidationRules,
  StepValidationData,
  ProjectStartValidationData,
  CategorySelectionValidationData,
  SpaceDefinitionValidationData,
  StyleSelectionValidationData,
  ReferencesColorsValidationData,
  AIProcessingValidationData
} from '../types/validation';

class WizardValidationService {
  private stepConfigs: Map<WizardStepId, StepValidationConfig> = new Map();
  private validationState: WizardValidationState;
  private context: ValidationContext | null = null;

  constructor() {
    this.initializeStepConfigs();
    this.validationState = {
      currentStep: 'projectWizardStart',
      stepResults: {} as Record<WizardStepId, StepValidationResult>,
      overallValid: false,
      completedSteps: [],
      blockedSteps: [],
      lastValidatedAt: {} as Record<WizardStepId, number>,
      retryAttempts: {}
    };
  }

  // Initialize validation configurations for each wizard step
  private initializeStepConfigs() {
    // Step 1: Project Wizard Start
    this.stepConfigs.set('projectWizardStart', {
      stepId: 'projectWizardStart',
      stepName: 'Project Setup',
      rules: [
        {
          id: 'auth-required',
          field: 'isAuthenticated',
          severity: 'error' as const,
          trigger: ['onChange', 'onSubmit'],
          message: 'Please sign in to continue',
          validate: (isAuth: boolean, context: any) => {
            // Check if we're in development/test mode
            const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
            
            // If in development mode and user entered an email, allow proceeding
            if (isDevelopment && !isAuth) {
              console.log('🟡 Auth check bypassed in development mode');
              return true; // Bypass auth requirement in dev
            }
            
            return isAuth;
          }
        },
        this.commonRules.credits(1, 'Insufficient credits for processing'),
        {
          id: 'project-name',
          field: 'projectName',
          severity: 'warning',
          trigger: ['onChange', 'onBlur'],
          message: 'Project name helps organize your designs',
          validate: (value: string) => !value || (value.length > 0 && value.length <= 100)
        }
      ],
      dependencies: [],
      isOptional: false,
      autoValidate: true,
      validateOnEntry: true
    });

    // Step 2: Category Selection
    this.stepConfigs.set('categorySelection', {
      stepId: 'categorySelection',
      stepName: 'Category Selection',
      rules: [
        this.commonRules.required('selectedCategory', 'Please select a project category'),
        {
          id: 'plan-compatibility',
          field: 'selectedCategory',
          severity: 'error',
          trigger: ['onChange'],
          message: 'This category requires a premium plan',
          helpText: 'Upgrade your plan to access premium categories',
          validate: async (value: string, context: any) => {
            return this.checkPlanCompatibility(value, context?.userPlan);
          }
        }
      ],
      dependencies: ['projectWizardStart'],
      isOptional: false,
      autoValidate: true,
      validateOnEntry: true
    });

    // Step 3: Space Definition
    this.stepConfigs.set('spaceDefinition', {
      stepId: 'spaceDefinition',
      stepName: 'Space Definition',
      rules: [
        this.commonRules.required('roomType', 'Please select your room type'),
        {
          id: 'dimensions-quality',
          field: 'dimensions',
          severity: 'warning',
          trigger: ['onBlur', 'onSubmit'],
          message: 'Adding dimensions improves design accuracy',
          helpText: 'Room dimensions help AI generate more precise layouts',
          validate: (dimensions: any) => {
            return !dimensions || (dimensions.length > 0 && dimensions.width > 0);
          }
        },
        {
          id: 'space-characteristics',
          field: 'spaceCharacteristics',
          severity: 'warning',
          trigger: ['onChange'],
          message: 'Describing your space helps create better designs',
          validate: (characteristics: string[]) => !characteristics || characteristics.length > 0
        }
      ],
      dependencies: ['categorySelection'],
      isOptional: false,
      autoValidate: true,
      validateOnEntry: false
    });

    // Step 4: Style Selection
    this.stepConfigs.set('styleSelection', {
      stepId: 'styleSelection',
      stepName: 'Style Selection',
      rules: [
        {
          id: 'style-required',
          field: 'selectedStyles',
          severity: 'error',
          trigger: ['onChange', 'onSubmit'],
          message: 'Please select at least one design style',
          validate: (styles: string[]) => styles && styles.length > 0
        },
        {
          id: 'style-compatibility',
          field: 'selectedStyles',
          severity: 'warning',
          trigger: ['onChange'],
          message: 'Some selected styles may not work well together',
          helpText: 'Consider choosing styles with similar aesthetics for better results',
          validate: async (styles: string[], context: any) => {
            return this.checkStyleCompatibility(styles, context?.spaceType);
          }
        },
        {
          id: 'premium-styles',
          field: 'selectedStyles',
          severity: 'error',
          trigger: ['onChange'],
          message: 'Premium styles require an upgraded plan',
          validate: async (styles: string[], context: any) => {
            return this.checkStylePlanRequirements(styles, context?.userPlan);
          }
        }
      ],
      dependencies: ['spaceDefinition'],
      isOptional: false,
      autoValidate: true,
      validateOnEntry: false
    });

    // Step 5: References & Colors
    this.stepConfigs.set('referencesColors', {
      stepId: 'referencesColors',
      stepName: 'References & Colors',
      rules: [
        {
          id: 'image-quality',
          field: 'referenceImages',
          severity: 'warning',
          trigger: ['onChange'],
          message: 'Some images may be too small for optimal results',
          helpText: 'Higher resolution images (1024x768 or larger) produce better designs',
          validate: (images: any[]) => {
            if (!images || images.length === 0) return true;
            return images.every(img => img.quality !== 'low');
          }
        },
        this.commonRules.fileFormat('referenceImages', ['jpg', 'jpeg', 'png', 'webp'], 'Unsupported image format'),
        this.commonRules.fileSize('referenceImages', 10 * 1024 * 1024, 'Image file too large (max 10MB)'),
        {
          id: 'upload-status',
          field: 'uploadStatus',
          severity: 'error',
          trigger: ['onChange'],
          message: 'Some images failed to upload',
          validate: (uploadStatus: Record<string, string>) => {
            if (!uploadStatus) return true;
            return !Object.values(uploadStatus).includes('failed');
          }
        },
        {
          id: 'color-palette-selection',
          field: 'colorPalettes',
          severity: 'info',
          trigger: ['onChange'],
          message: 'Adding color palettes enhances design personalization',
          validate: () => true // Always valid, just informational
        }
      ],
      dependencies: ['styleSelection'],
      isOptional: true,
      autoValidate: true,
      validateOnEntry: false
    });

    // Step 6: AI Processing
    this.stepConfigs.set('aiProcessing', {
      stepId: 'aiProcessing',
      stepName: 'AI Processing',
      rules: [
        {
          id: 'all-data-present',
          field: 'allRequiredDataPresent',
          severity: 'error',
          trigger: ['onSubmit'],
          message: 'Please complete all required steps before processing',
          validate: (allPresent: boolean) => allPresent === true
        },
        {
          id: 'processing-credits',
          field: 'processingCreditsRequired',
          severity: 'error',
          trigger: ['onSubmit'],
          message: 'Insufficient credits for AI processing',
          helpText: 'Purchase more credits or upgrade your plan',
          validate: async (required: number, context: any) => {
            return context?.availableCredits >= required;
          }
        },
        {
          id: 'custom-prompt',
          field: 'customPrompt',
          severity: 'warning',
          trigger: ['onChange', 'onBlur'],
          message: 'Custom prompt is too long',
          validate: (prompt: string) => !prompt || prompt.length <= 500
        },
        {
          id: 'processing-complexity',
          field: 'processingComplexity',
          severity: 'warning',
          trigger: ['onChange'],
          message: 'Premium processing may take longer but produces better results',
          validate: () => true // Always valid, just informational
        }
      ],
      dependencies: ['referencesColors'],
      isOptional: false,
      autoValidate: true,
      validateOnEntry: true
    });
  }

  // Common validation rules factory
  private get commonRules(): CommonValidationRules {
    return {
      required: (field: string, message?: string) => ({
        id: `${field}-required`,
        field,
        severity: 'error' as const,
        trigger: ['onChange', 'onSubmit'],
        message: message || `${field} is required`,
        validate: (value: any) => value !== null && value !== undefined && value !== ''
      }),

      minLength: (field: string, length: number, message?: string) => ({
        id: `${field}-min-length`,
        field,
        severity: 'error' as const,
        trigger: ['onBlur', 'onSubmit'],
        message: message || `${field} must be at least ${length} characters`,
        validate: (value: string) => !value || value.length >= length
      }),

      maxLength: (field: string, length: number, message?: string) => ({
        id: `${field}-max-length`,
        field,
        severity: 'error' as const,
        trigger: ['onBlur', 'onSubmit'],
        message: message || `${field} must be less than ${length} characters`,
        validate: (value: string) => !value || value.length <= length
      }),

      pattern: (field: string, regex: RegExp, message?: string) => ({
        id: `${field}-pattern`,
        field,
        severity: 'error' as const,
        trigger: ['onBlur', 'onSubmit'],
        message: message || `${field} format is invalid`,
        validate: (value: string) => !value || regex.test(value)
      }),

      custom: (field: string, validate: (value: any) => boolean, message: string) => ({
        id: `${field}-custom`,
        field,
        severity: 'error' as const,
        trigger: ['onChange', 'onSubmit'],
        message,
        validate
      }),

      async: (field: string, validate: (value: any) => Promise<boolean>, message: string) => ({
        id: `${field}-async`,
        field,
        severity: 'error' as const,
        trigger: ['onBlur', 'onSubmit'],
        message,
        validate
      }),

      credits: (minCredits: number, message?: string) => ({
        id: 'credits-check',
        field: 'availableCredits',
        severity: 'error' as const,
        trigger: ['onSubmit'],
        message: message || `At least ${minCredits} credits required`,
        validate: async (credits: number, context: any) => {
          // Check if we're in development/test mode
          const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'development';
          
          // If in development mode, always return true (bypass credit check)
          if (isDevelopment) {
            console.log('🟡 Credits check bypassed in development mode');
            return true;
          }
          
          // In production, check actual credits
          return (context?.availableCredits || 0) >= minCredits;
        }
      }),

      planFeature: (feature: string, message?: string) => ({
        id: `plan-${feature}`,
        field: 'userPlan',
        severity: 'error' as const,
        trigger: ['onChange', 'onSubmit'],
        message: message || `This feature requires a premium plan`,
        validate: async (plan: string, context: any) => {
          return this.checkPlanFeatureAccess(feature, plan);
        }
      }),

      fileFormat: (field: string, formats: string[], message?: string) => ({
        id: `${field}-format`,
        field,
        severity: 'error' as const,
        trigger: ['onChange'],
        message: message || `Supported formats: ${formats.join(', ')}`,
        validate: (files: any[]) => {
          if (!files || files.length === 0) return true;
          return files.every(file => 
            formats.some(format => 
              file.name?.toLowerCase().endsWith(`.${format}`) ||
              file.type?.includes(format)
            )
          );
        }
      }),

      fileSize: (field: string, maxSize: number, message?: string) => ({
        id: `${field}-size`,
        field,
        severity: 'error' as const,
        trigger: ['onChange'],
        message: message || `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
        validate: (files: any[]) => {
          if (!files || files.length === 0) return true;
          return files.every(file => file.size <= maxSize);
        }
      }),

      imageQuality: (field: string, minQuality: number, message?: string) => ({
        id: `${field}-quality`,
        field,
        severity: 'warning' as const,
        trigger: ['onChange'],
        message: message || `Higher quality images produce better results`,
        validate: (images: any[]) => {
          if (!images || images.length === 0) return true;
          return images.every(img => (img.width * img.height) >= minQuality);
        }
      })
    };
  }

  // Set validation context
  setContext(context: ValidationContext) {
    this.context = context;
  }

  // Validate a specific step
  async validateStep(stepId: WizardStepId, data: StepValidationData, trigger: string = 'onSubmit'): Promise<ValidationResult> {
    const config = this.stepConfigs.get(stepId);
    if (!config) {
      throw new Error(`No validation configuration found for step: ${stepId}`);
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    // Check dependencies first - but be flexible for optional steps
    for (const depStepId of config.dependencies) {
      const depConfig = this.stepConfigs.get(depStepId);
      const depResult = this.validationState.stepResults[depStepId];
      
      // If the dependent step is optional and user hasn't interacted with it,
      // we'll skip dependency validation but mark it as "skipped but valid"
      if (depConfig?.isOptional && (!depResult || !depResult.hasBeenValidated)) {
        console.log(`⚠️ Optional step ${depStepId} hasn't been validated, allowing to proceed`);
        // Mark the optional step as valid so we don't keep checking it
        this.validationState.stepResults[depStepId] = {
          stepId: depStepId,
          isValid: true,
          errors: [],
          warnings: [],
          infos: [],
          hasBeenValidated: true,
          validatedAt: new Date(),
          skippedButValid: true
        };
        continue;
      }
      
      if (!depResult || !depResult.isValid) {
        errors.push({
          ruleId: 'dependency',
          field: 'step',
          severity: 'error',
          message: `Please complete the ${depConfig?.stepName || depStepId} step first`,
          timestamp: Date.now()
        });
      }
    }

    // Run validation rules
    for (const rule of config.rules) {
      if (!rule.trigger.includes(trigger as any)) continue;

      try {
        const fieldValue = this.getFieldValue(data, rule.field);
        const isValid = await rule.validate(fieldValue, this.context);

        if (!isValid) {
          const error: ValidationError = {
            ruleId: rule.id,
            field: rule.field,
            severity: rule.severity,
            message: rule.message,
            helpText: rule.helpText,
            helpLink: rule.helpLink,
            timestamp: Date.now(),
            context: { stepId, trigger }
          };

          switch (rule.severity) {
            case 'error':
              errors.push(error);
              break;
            case 'warning':
              warnings.push(error);
              break;
            case 'info':
              infos.push(error);
              break;
          }
        }
      } catch (error) {
        errors.push({
          ruleId: rule.id,
          field: rule.field,
          severity: 'error',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        });
      }
    }

    const result: StepValidationResult = {
      stepId,
      isValid: errors.length === 0,
      errors,
      warnings,
      infos,
      hasBeenValidated: true,
      validatedAt: new Date(),
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
        blockers: errors.filter(e => e.severity === 'error').map(e => e.field)
      }
    };

    // Update validation state
    this.validationState.stepResults[stepId] = result;
    this.validationState.lastValidatedAt[stepId] = Date.now();

    if (result.isValid && !this.validationState.completedSteps.includes(stepId)) {
      this.validationState.completedSteps.push(stepId);
    }

    this.updateOverallValidation();
    
    return result;
  }

  // Validate all completed steps
  async validateAllSteps(): Promise<ValidationResult> {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    const allInfos: ValidationError[] = [];

    for (const stepId of this.validationState.completedSteps) {
      const stepResult = this.validationState.stepResults[stepId];
      if (stepResult) {
        allErrors.push(...stepResult.errors);
        allWarnings.push(...stepResult.warnings);
        allInfos.push(...stepResult.infos);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      infos: allInfos,
      summary: {
        errorCount: allErrors.length,
        warningCount: allWarnings.length,
        blockers: allErrors.map(e => e.field)
      }
    };
  }

  // Get validation state
  getValidationState(): WizardValidationState {
    return { ...this.validationState };
  }

  // Get step validation result
  getStepResult(stepId: WizardStepId): ValidationResult | null {
    return this.validationState.stepResults[stepId] || null;
  }

  // Get recovery actions for errors
  getRecoveryActions(stepId: WizardStepId): ValidationRecoveryAction[] {
    const result = this.validationState.stepResults[stepId];
    if (!result) return [];

    const actions: ValidationRecoveryAction[] = [];

    for (const error of result.errors) {
      switch (error.field) {
        case 'isAuthenticated':
          actions.push({
            id: 'auth-required',
            label: 'Sign In',
            description: 'Sign in to continue with your project',
            action: 'navigate',
            target: 'auth',
            icon: 'log-in-outline',
            priority: 'primary'
          });
          break;
          
        case 'availableCredits':
          actions.push({
            id: 'buy-credits',
            label: 'Get Credits',
            description: 'Purchase credits to continue processing',
            action: 'navigate',
            target: 'buyCredits',
            icon: 'diamond-outline',
            priority: 'primary'
          });
          break;

        case 'userPlan':
          actions.push({
            id: 'upgrade-plan',
            label: 'Upgrade Plan',
            description: 'Upgrade to access premium features',
            action: 'navigate',
            target: 'plans',
            icon: 'arrow-up-outline',
            priority: 'primary'
          });
          break;

        default:
          actions.push({
            id: 'fix-field',
            label: 'Fix Issue',
            description: `Please correct the ${error.field} field`,
            action: 'fix',
            target: error.field,
            icon: 'create-outline',
            priority: 'secondary'
          });
      }
    }

    // Add retry option for technical errors
    if (result.errors.some(e => e.message.includes('network') || e.message.includes('failed'))) {
      actions.push({
        id: 'retry-validation',
        label: 'Retry',
        description: 'Try validating again',
        action: 'retry',
        icon: 'refresh-outline',
        priority: 'secondary'
      });
    }

    return actions;
  }

  // Check if step can be accessed
  canAccessStep(stepId: WizardStepId): boolean {
    const config = this.stepConfigs.get(stepId);
    if (!config) return false;

    return config.dependencies.every(depId => 
      this.validationState.completedSteps.includes(depId)
    );
  }

  // Reset validation state
  resetValidation() {
    this.validationState = {
      currentStep: 'projectWizardStart',
      stepResults: {} as Record<WizardStepId, StepValidationResult>,
      overallValid: false,
      completedSteps: [],
      blockedSteps: [],
      lastValidatedAt: {} as Record<WizardStepId, number>,
      retryAttempts: {}
    };
  }

  // Private helper methods
  private getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private updateOverallValidation() {
    this.validationState.overallValid = Object.values(this.validationState.stepResults)
      .every(result => result.isValid);
  }

  private async checkPlanCompatibility(category: string, userPlan: string): Promise<boolean> {
    // Mock implementation - replace with actual plan checking logic
    const premiumCategories = ['luxury', 'commercial', 'premium'];
    const freePlan = userPlan === 'free';
    return !(freePlan && premiumCategories.includes(category));
  }

  private async checkStyleCompatibility(styles: string[], spaceType: string): Promise<boolean> {
    // Mock implementation - replace with actual compatibility checking
    if (styles.length <= 1) return true;
    
    const incompatibleCombinations = [
      ['modern', 'traditional'],
      ['minimalist', 'maximalist']
    ];
    
    return !incompatibleCombinations.some(combo => 
      combo.every(style => styles.includes(style))
    );
  }

  private async checkStylePlanRequirements(styles: string[], userPlan: string): Promise<boolean> {
    // Mock implementation
    const premiumStyles = ['luxury-modern', 'designer-collection'];
    const freePlan = userPlan === 'free';
    
    if (freePlan) {
      return !styles.some(style => premiumStyles.includes(style));
    }
    
    return true;
  }

  private async checkPlanFeatureAccess(feature: string, userPlan: string): Promise<boolean> {
    // Mock implementation
    const freeFeatures = ['basic-styles', 'standard-processing'];
    const premiumFeatures = ['premium-styles', 'advanced-processing', 'custom-prompts'];
    
    if (userPlan === 'free') {
      return freeFeatures.includes(feature);
    }
    
    return true;
  }
}

export const wizardValidationService = new WizardValidationService();
export default wizardValidationService;