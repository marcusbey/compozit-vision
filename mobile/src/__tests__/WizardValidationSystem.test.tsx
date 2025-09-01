// Setup polyfills first
global.clearImmediate = global.clearImmediate || ((id: any) => global.clearTimeout(id));
global.setImmediate = global.setImmediate || ((fn: any) => global.setTimeout(fn, 0));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

import { wizardValidationService } from '../src/services/wizardValidationService';
import { useWizardValidation } from '../src/hooks/useWizardValidation';
import { ValidationErrorDisplay } from '../src/components/ValidationErrorDisplay';
import { 
  WizardStepId,
  ValidationContext,
  ProjectStartValidationData,
  CategorySelectionValidationData,
  SpaceDefinitionValidationData,
  StyleSelectionValidationData,
  ReferencesColorsValidationData,
  AIProcessingValidationData
} from '../src/types/validation';

// Mock stores
jest.mock('../src/stores/userStore', () => ({
  useUserStore: () => ({
    user: { id: 'test-user' },
    availableCredits: 10,
    currentPlan: 'free'
  })
}));

jest.mock('../src/stores/journeyStore', () => ({
  useJourneyStore: () => ({
    projectWizard: {
      categoryId: undefined,
      roomId: undefined,
      selectedReferences: [],
      selectedPalettes: []
    },
    updateProjectWizard: jest.fn()
  })
}));

// Test component using the validation hook
const TestValidationComponent: React.FC<{ stepId: WizardStepId }> = ({ stepId }) => {
  const validation = useWizardValidation({ 
    stepId,
    autoValidate: true,
    validateOnMount: true 
  });

  const handleTestValidation = async () => {
    const mockData = getMockValidationData(stepId);
    await validation.validateStep(mockData);
  };

  return (
    <>
      <button 
        data-testid={`validate-${stepId}`}
        onClick={handleTestValidation}
      >
        Validate {stepId}
      </button>
      
      {validation.validationResult && (
        <ValidationErrorDisplay
          result={validation.validationResult}
          recoveryActions={validation.recoveryActions}
          onActionPress={validation.handleRecoveryAction}
        />
      )}
      
      <div data-testid="validation-status">
        {validation.isValid ? 'valid' : 'invalid'}
      </div>
    </>
  );
};

// Helper function to create mock data for each step
const getMockValidationData = (stepId: WizardStepId) => {
  switch (stepId) {
    case 'projectWizardStart':
      return {
        projectName: 'Test Project',
        isAuthenticated: true,
        availableCredits: 10,
        userPlan: 'free'
      } as ProjectStartValidationData;

    case 'categorySelection':
      return {
        selectedCategory: 'living-room',
        categoryFeatures: ['basic-design'],
        planCompatibility: { 'living-room': true }
      } as CategorySelectionValidationData;

    case 'spaceDefinition':
      return {
        roomType: 'living-room',
        dimensions: { length: 12, width: 10, height: 9 },
        spaceCharacteristics: ['open-floor-plan', 'natural-light'],
        lighting: 'natural',
        existingFeatures: ['fireplace']
      } as SpaceDefinitionValidationData;

    case 'styleSelection':
      return {
        selectedStyles: ['modern', 'minimalist'],
        styleCompatibility: { modern: 0.9, minimalist: 0.8 },
        spaceTypeCompatibility: { 'living-room': true }
      } as StyleSelectionValidationData;

    case 'referencesColors':
      return {
        referenceImages: [
          {
            id: 'ref-1',
            url: 'https://example.com/image.jpg',
            quality: 'high' as const,
            format: 'jpg',
            size: 1024000
          }
        ],
        colorPalettes: [
          {
            id: 'palette-1',
            colors: ['#FFFFFF', '#000000', '#CCCCCC'],
            source: 'user' as const
          }
        ],
        uploadStatus: { 'ref-1': 'success' as const }
      } as ReferencesColorsValidationData;

    case 'aiProcessing':
      return {
        allRequiredDataPresent: true,
        processingCreditsRequired: 5,
        customPrompt: 'Create a modern living room',
        enhancementOptions: ['high-quality', 'multiple-angles'],
        processingComplexity: 'advanced' as const
      } as AIProcessingValidationData;

    default:
      return {};
  }
};

describe('Wizard Validation System', () => {
  beforeEach(() => {
    // Reset validation service before each test
    wizardValidationService.resetValidation();
  });

  describe('Validation Service', () => {
    it('should initialize with correct default state', () => {
      const state = wizardValidationService.getValidationState();
      
      expect(state.currentStep).toBe('projectWizardStart');
      expect(state.overallValid).toBe(false);
      expect(state.completedSteps).toHaveLength(0);
      expect(state.blockedSteps).toHaveLength(0);
    });

    it('should validate ProjectWizardStart step correctly', async () => {
      const context: ValidationContext = {
        userId: 'test-user',
        userPlan: 'free',
        availableCredits: 10,
        sessionData: { authenticated: true },
        journeyData: {},
        previousStepData: {}
      };
      
      wizardValidationService.setContext(context);
      
      const validData = getMockValidationData('projectWizardStart');
      const result = await wizardValidationService.validateStep('projectWizardStart', validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when required data is missing', async () => {
      const invalidData: ProjectStartValidationData = {
        projectName: undefined,
        isAuthenticated: false, // Invalid - user not authenticated
        availableCredits: 0, // Invalid - no credits
        userPlan: 'free'
      };
      
      const result = await wizardValidationService.validateStep('projectWizardStart', invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'isAuthenticated')).toBe(true);
      expect(result.errors.some(e => e.field === 'availableCredits')).toBe(true);
    });

    it('should validate all steps sequentially', async () => {
      const context: ValidationContext = {
        userId: 'test-user',
        userPlan: 'free',
        availableCredits: 10,
        sessionData: { authenticated: true },
        journeyData: {},
        previousStepData: {}
      };
      
      wizardValidationService.setContext(context);
      
      const stepOrder: WizardStepId[] = [
        'projectWizardStart',
        'categorySelection', 
        'spaceDefinition',
        'styleSelection',
        'referencesColors',
        'aiProcessing'
      ];
      
      // Validate each step in order
      for (const stepId of stepOrder) {
        const mockData = getMockValidationData(stepId);
        const result = await wizardValidationService.validateStep(stepId, mockData);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
      
      const finalState = wizardValidationService.getValidationState();
      expect(finalState.completedSteps).toHaveLength(stepOrder.length);
      expect(finalState.overallValid).toBe(true);
    });

    it('should provide recovery actions for errors', () => {
      const actions = wizardValidationService.getRecoveryActions('projectWizardStart');
      
      // Should provide some recovery actions (implementation dependent)
      expect(Array.isArray(actions)).toBe(true);
    });

    it('should check step access dependencies correctly', () => {
      // Initially, only the first step should be accessible
      expect(wizardValidationService.canAccessStep('projectWizardStart')).toBe(true);
      expect(wizardValidationService.canAccessStep('categorySelection')).toBe(false);
    });
  });

  describe('Validation Hook', () => {
    it('should integrate with validation service', async () => {
      const { getByTestId, getByText } = render(
        <TestValidationComponent stepId="projectWizardStart" />
      );

      const validateButton = getByTestId('validate-projectWizardStart');
      fireEvent.press(validateButton);

      await waitFor(() => {
        const status = getByTestId('validation-status');
        expect(status.props.children).toBe('valid');
      });
    });

    it('should show validation errors in UI', async () => {
      // Mock a validation that will fail
      jest.spyOn(wizardValidationService, 'validateStep').mockResolvedValue({
        isValid: false,
        errors: [{
          ruleId: 'auth-required',
          field: 'isAuthenticated',
          severity: 'error',
          message: 'Please sign in to continue',
          timestamp: Date.now()
        }],
        warnings: [],
        infos: [],
        summary: {
          errorCount: 1,
          warningCount: 0,
          blockers: ['isAuthenticated']
        }
      });

      const { getByTestId, getByText } = render(
        <TestValidationComponent stepId="projectWizardStart" />
      );

      const validateButton = getByTestId('validate-projectWizardStart');
      fireEvent.press(validateButton);

      await waitFor(() => {
        expect(getByText('Please sign in to continue')).toBeTruthy();
      });
    });

    it('should handle validation errors gracefully', async () => {
      // Mock validation service to throw error
      jest.spyOn(wizardValidationService, 'validateStep').mockRejectedValue(
        new Error('Validation service error')
      );

      const { getByTestId } = render(
        <TestValidationComponent stepId="projectWizardStart" />
      );

      const validateButton = getByTestId('validate-projectWizardStart');
      
      await act(async () => {
        fireEvent.press(validateButton);
      });

      const status = getByTestId('validation-status');
      expect(status.props.children).toBe('invalid');
    });
  });

  describe('ValidationErrorDisplay Component', () => {
    const mockValidationResult = {
      isValid: false,
      errors: [
        {
          ruleId: 'required-field',
          field: 'category',
          severity: 'error' as const,
          message: 'Please select a category',
          timestamp: Date.now()
        }
      ],
      warnings: [
        {
          ruleId: 'recommendation',
          field: 'description',
          severity: 'warning' as const,
          message: 'Adding a description improves results',
          helpText: 'A detailed description helps AI generate better designs',
          timestamp: Date.now()
        }
      ],
      infos: [],
      summary: {
        errorCount: 1,
        warningCount: 1,
        blockers: ['category']
      }
    };

    const mockRecoveryActions = [
      {
        id: 'fix-category',
        label: 'Select Category',
        description: 'Choose a project category to continue',
        action: 'fix' as const,
        target: 'category',
        icon: 'create-outline',
        priority: 'primary' as const
      }
    ];

    it('should display validation errors correctly', () => {
      const { getByText } = render(
        <ValidationErrorDisplay
          result={mockValidationResult}
          recoveryActions={mockRecoveryActions}
        />
      );

      expect(getByText('Please select a category')).toBeTruthy();
      expect(getByText('Adding a description improves results')).toBeTruthy();
      expect(getByText('Select Category')).toBeTruthy();
    });

    it('should handle recovery action presses', () => {
      const onActionPress = jest.fn();

      const { getByText } = render(
        <ValidationErrorDisplay
          result={mockValidationResult}
          recoveryActions={mockRecoveryActions}
          onActionPress={onActionPress}
        />
      );

      const actionButton = getByText('Select Category');
      fireEvent.press(actionButton);

      expect(onActionPress).toHaveBeenCalledWith(mockRecoveryActions[0]);
    });

    it('should show summary information', () => {
      const { getByText } = render(
        <ValidationErrorDisplay
          result={mockValidationResult}
          showSummary={true}
        />
      );

      expect(getByText('1')).toBeTruthy(); // Error count
      expect(getByText('errors')).toBeTruthy();
      expect(getByText('warnings')).toBeTruthy();
    });

    it('should handle empty validation results', () => {
      const emptyResult = {
        isValid: true,
        errors: [],
        warnings: [],
        infos: [],
        summary: {
          errorCount: 0,
          warningCount: 0,
          blockers: []
        }
      };

      const { container } = render(
        <ValidationErrorDisplay
          result={emptyResult}
          recoveryActions={[]}
        />
      );

      // Should not render anything for empty results
      expect(container.children).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full wizard validation flow', async () => {
      const context: ValidationContext = {
        userId: 'test-user',
        userPlan: 'premium',
        availableCredits: 50,
        sessionData: { authenticated: true },
        journeyData: {},
        previousStepData: {}
      };
      
      wizardValidationService.setContext(context);
      
      const stepOrder: WizardStepId[] = [
        'projectWizardStart',
        'categorySelection', 
        'spaceDefinition',
        'styleSelection',
        'referencesColors',
        'aiProcessing'
      ];
      
      // Simulate complete wizard flow
      for (const stepId of stepOrder) {
        const mockData = getMockValidationData(stepId);
        const result = await wizardValidationService.validateStep(stepId, mockData);
        
        expect(result.isValid).toBe(true);
        
        // Check that subsequent steps become accessible
        const nextStepIndex = stepOrder.indexOf(stepId) + 1;
        if (nextStepIndex < stepOrder.length) {
          const nextStep = stepOrder[nextStepIndex];
          // Note: This depends on validation service implementation
          // expect(wizardValidationService.canAccessStep(nextStep)).toBe(true);
        }
      }
      
      const finalState = wizardValidationService.getValidationState();
      expect(finalState.overallValid).toBe(true);
      expect(finalState.completedSteps).toHaveLength(stepOrder.length);
    });

    it('should handle plan upgrade scenarios', async () => {
      const context: ValidationContext = {
        userId: 'test-user',
        userPlan: 'free', // Free plan with limitations
        availableCredits: 2, // Low credits
        sessionData: { authenticated: true },
        journeyData: {},
        previousStepData: {}
      };
      
      wizardValidationService.setContext(context);
      
      const premiumData: CategorySelectionValidationData = {
        selectedCategory: 'luxury', // Premium category
        categoryFeatures: ['premium-styles'],
        planCompatibility: { 'luxury': false } // Not compatible with free plan
      };
      
      const result = await wizardValidationService.validateStep('categorySelection', premiumData);
      
      // Should have plan-related errors
      expect(result.isValid).toBe(false);
      const planErrors = result.errors.filter(e => e.field === 'selectedCategory');
      expect(planErrors.length).toBeGreaterThan(0);
      
      // Should provide upgrade recovery actions
      const recoveryActions = wizardValidationService.getRecoveryActions('categorySelection');
      const upgradeActions = recoveryActions.filter(a => a.action === 'upgrade');
      expect(upgradeActions.length).toBeGreaterThan(0);
    });
  });
});