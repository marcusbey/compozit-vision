// Comprehensive validation types for wizard step validation system

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationTrigger = 'onChange' | 'onBlur' | 'onSubmit' | 'realTime';

export interface ValidationRule {
  id: string;
  field: string;
  severity: ValidationSeverity;
  trigger: ValidationTrigger[];
  message: string;
  helpText?: string;
  helpLink?: string;
  validate: (value: any, context?: any) => boolean | Promise<boolean>;
  dependencies?: string[]; // Other fields this rule depends on
}

export interface ValidationError {
  ruleId: string;
  field: string;
  severity: ValidationSeverity;
  message: string;
  helpText?: string;
  helpLink?: string;
  timestamp: number;
  context?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  summary: {
    errorCount: number;
    warningCount: number;
    blockers: string[]; // Fields that block progression
  };
}

export interface StepValidationConfig {
  stepId: WizardStepId;
  stepName: string;
  rules: ValidationRule[];
  dependencies: WizardStepId[]; // Previous steps that must be completed
  isOptional: boolean;
  autoValidate: boolean; // Enable real-time validation
  validateOnEntry: boolean; // Validate when user enters step
}

export type WizardStepId = 
  | 'projectWizardStart'
  | 'categorySelection' 
  | 'spaceDefinition'
  | 'styleSelection'
  | 'referencesColors'
  | 'aiProcessing';

export interface WizardValidationState {
  currentStep: WizardStepId;
  stepResults: Record<WizardStepId, ValidationResult>;
  overallValid: boolean;
  completedSteps: WizardStepId[];
  blockedSteps: WizardStepId[];
  lastValidatedAt: Record<WizardStepId, number>;
  retryAttempts: Record<string, number>;
}

export interface ValidationContext {
  userId: string;
  userPlan: string;
  availableCredits: number;
  sessionData: any;
  journeyData: any;
  previousStepData: Record<WizardStepId, any>;
}

export interface ValidationRecoveryAction {
  id: string;
  label: string;
  description: string;
  action: 'navigate' | 'retry' | 'fix' | 'skip' | 'upgrade';
  target?: string; // Navigation target or action parameter
  icon?: string;
  priority: 'primary' | 'secondary';
}

export interface ValidationUIState {
  showErrorSummary: boolean;
  expandedErrors: string[];
  autoScroll: boolean;
  highlightFields: string[];
  showHelpTexts: boolean;
}

// Predefined validation rule templates
export interface CommonValidationRules {
  required: (field: string, message?: string) => ValidationRule;
  minLength: (field: string, length: number, message?: string) => ValidationRule;
  maxLength: (field: string, length: number, message?: string) => ValidationRule;
  pattern: (field: string, regex: RegExp, message?: string) => ValidationRule;
  custom: (field: string, validate: (value: any) => boolean, message: string) => ValidationRule;
  async: (field: string, validate: (value: any) => Promise<boolean>, message: string) => ValidationRule;
  credits: (minCredits: number, message?: string) => ValidationRule;
  planFeature: (feature: string, message?: string) => ValidationRule;
  fileFormat: (field: string, formats: string[], message?: string) => ValidationRule;
  fileSize: (field: string, maxSize: number, message?: string) => ValidationRule;
  imageQuality: (field: string, minQuality: number, message?: string) => ValidationRule;
}

// Step-specific validation data interfaces
export interface ProjectStartValidationData {
  projectName?: string;
  isAuthenticated: boolean;
  availableCredits: number;
  userPlan: string;
}

export interface CategorySelectionValidationData {
  selectedCategory?: string;
  categoryFeatures: string[];
  planCompatibility: Record<string, boolean>;
}

export interface SpaceDefinitionValidationData {
  roomType?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  spaceCharacteristics: string[];
  lighting?: string;
  existingFeatures: string[];
}

export interface StyleSelectionValidationData {
  selectedStyles: string[];
  styleCompatibility: Record<string, number>;
  spaceTypeCompatibility: Record<string, boolean>;
}

export interface ReferencesColorsValidationData {
  referenceImages: Array<{
    id: string;
    url: string;
    quality: 'low' | 'medium' | 'high';
    format: string;
    size: number;
  }>;
  colorPalettes: Array<{
    id: string;
    colors: string[];
    source: 'user' | 'extracted' | 'preset';
  }>;
  uploadStatus: Record<string, 'pending' | 'success' | 'failed'>;
}

export interface AIProcessingValidationData {
  allRequiredDataPresent: boolean;
  processingCreditsRequired: number;
  customPrompt?: string;
  enhancementOptions: string[];
  processingComplexity: 'basic' | 'advanced' | 'premium';
}

export type StepValidationData = 
  | ProjectStartValidationData
  | CategorySelectionValidationData
  | SpaceDefinitionValidationData  
  | StyleSelectionValidationData
  | ReferencesColorsValidationData
  | AIProcessingValidationData;

// Events for validation system
export interface ValidationEvent {
  type: 'validate' | 'error' | 'warning' | 'recovery' | 'retry';
  stepId: WizardStepId;
  field?: string;
  data?: any;
  timestamp: number;
}

export interface ValidationMetrics {
  validationDuration: number;
  errorCount: number;
  retryCount: number;
  recoveryActionsUsed: string[];
  userDropoffPoints: WizardStepId[];
}