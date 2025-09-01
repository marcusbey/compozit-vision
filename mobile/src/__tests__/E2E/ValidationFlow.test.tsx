import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeJourneyNavigator } from '../../src/navigation/SafeJourneyNavigator';
import { useJourneyStore } from '../../src/stores/journeyStore';
import { wizardValidationService } from '../../src/services/wizardValidationService';

// Mock validation service with controlled responses
jest.mock('../../src/services/wizardValidationService');

describe('Wizard Validation Flow E2E Tests', () => {
  const TestApp = () => (
    <NavigationContainer>
      <SafeJourneyNavigator />
    </NavigationContainer>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useJourneyStore.getState().reset();
  });

  describe('Step-by-Step Validation Flow', () => {
    it('should validate each step before allowing progression', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Navigate to category selection
      await navigateToStep('category_selection');

      // === Test Category Selection Validation ===
      
      // Mock validation failure
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'MISSING_CATEGORY',
          message: 'Please select a design category',
          severity: 'error' as const,
          field: 'categoryId'
        }],
        warnings: [],
        suggestions: ['Try selecting "Interior Design" for room makeovers']
      });

      // Try to continue without selection
      const continueButton = queryByText('Continue to Space Selection');
      if (continueButton) {
        fireEvent.press(continueButton);
      }

      // Should show validation error
      await waitFor(() => {
        expect(queryByText('Please select a design category')).toBeTruthy();
      });

      // Should show suggestion
      expect(queryByText('Try selecting "Interior Design" for room makeovers')).toBeTruthy();

      // Now mock validation success
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      });

      // Select category
      fireEvent.press(getByText('Interior Design'));

      // Continue should work now
      await waitFor(() => {
        const continueBtn = queryByText('Continue to Space Selection');
        if (continueBtn) {
          fireEvent.press(continueBtn);
        }
      });

      // Should proceed to next step
      await waitFor(() => {
        expect(getByText('Select Your Spaces')).toBeTruthy();
      });
    });

    it('should handle complex validation scenarios with warnings', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('style_selection');

      // Mock validation with warnings
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [{
          code: 'STYLE_MISMATCH',
          message: 'Industrial style may not be ideal for bedrooms',
          severity: 'warning' as const,
          field: 'selectedStyles'
        }],
        suggestions: ['Consider Scandinavian or Modern styles for bedrooms']
      });

      // Select industrial style
      fireEvent.press(getByText('Industrial'));
      
      const continueButton = getByText('Continue to References & Colors');
      fireEvent.press(continueButton);

      // Should show warning but allow continuation
      await waitFor(() => {
        expect(queryByText('Industrial style may not be ideal for bedrooms')).toBeTruthy();
      });

      // Should show suggestion
      expect(queryByText('Consider Scandinavian or Modern styles for bedrooms')).toBeTruthy();

      // Should still allow continuation
      const proceedButton = queryByText('Proceed Anyway') || queryByText('Continue');
      if (proceedButton) {
        fireEvent.press(proceedButton);
      }

      await waitFor(() => {
        expect(getByText('References & Colors')).toBeTruthy();
      });
    });

    it('should validate photo quality and requirements', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('photo_capture');

      // Mock poor photo validation
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'PHOTO_QUALITY_LOW',
          message: 'Photo quality is too low for accurate analysis',
          severity: 'error' as const,
          field: 'capturedPhotos'
        }],
        warnings: [],
        suggestions: [
          'Take photo in good lighting',
          'Ensure the space is clearly visible',
          'Avoid blurry or dark images'
        ]
      });

      // Mock taking a photo
      const takePhotoButton = getByText('Take Photo');
      fireEvent.press(takePhotoButton);

      await waitFor(() => {
        expect(queryByText('Photo quality is too low for accurate analysis')).toBeTruthy();
      });

      // Should show suggestions
      expect(queryByText('Take photo in good lighting')).toBeTruthy();
      expect(queryByText('Ensure the space is clearly visible')).toBeTruthy();

      // Should offer retake option
      const retakeButton = queryByText('Retake Photo');
      expect(retakeButton).toBeTruthy();
    });

    it('should validate space definition compatibility', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('space_definition');

      // Mock incompatible space selection
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'INCOMPATIBLE_SPACES',
          message: 'Selected spaces have conflicting design requirements',
          severity: 'error' as const,
          field: 'selectedRooms'
        }],
        warnings: [{
          code: 'SPACE_COMPLEXITY',
          message: 'Designing multiple spaces increases project complexity',
          severity: 'warning' as const,
          field: 'selectedRooms'
        }],
        suggestions: ['Consider focusing on one primary space first']
      });

      // Select multiple conflicting spaces
      fireEvent.press(getByText('Living Room'));
      fireEvent.press(getByText('Bathroom'));
      fireEvent.press(getByText('Kitchen'));

      const continueButton = getByText('Continue to Photo Capture');
      fireEvent.press(continueButton);

      // Should show validation errors
      await waitFor(() => {
        expect(queryByText('Selected spaces have conflicting design requirements')).toBeTruthy();
      });

      // Should show warnings
      expect(queryByText('Designing multiple spaces increases project complexity')).toBeTruthy();

      // Should show suggestions
      expect(queryByText('Consider focusing on one primary space first')).toBeTruthy();
    });

    it('should validate references and colors selection', async () => {
      const { getByText, queryByText, getByTestId } = render(<TestApp />);

      await navigateToStep('references_colors');

      // Mock validation for empty references
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'INSUFFICIENT_REFERENCES',
          message: 'At least one reference image or color palette is recommended',
          severity: 'error' as const,
          field: 'referenceImages'
        }],
        warnings: [],
        suggestions: [
          'Upload inspiration images from your photo gallery',
          'Create color palettes from your favorite images'
        ]
      });

      // Try to continue without any references
      const continueButton = getByText('Continue to AI Processing');
      fireEvent.press(continueButton);

      // Should show validation error
      await waitFor(() => {
        expect(queryByText('At least one reference image or color palette is recommended')).toBeTruthy();
      });

      // Should show upload suggestions
      expect(queryByText('Upload inspiration images from your photo gallery')).toBeTruthy();

      // Should show recovery action
      const uploadButton = queryByText('Upload Image');
      expect(uploadButton).toBeTruthy();
    });

    it('should handle AI processing validation and retry scenarios', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('ai_processing');

      // Mock processing validation failure
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'AI_PROCESSING_FAILED',
          message: 'Unable to generate design with current inputs',
          severity: 'error' as const,
          field: 'aiProcessing'
        }],
        warnings: [],
        suggestions: [
          'Try uploading a clearer photo',
          'Select different style preferences',
          'Add more reference images'
        ]
      });

      // Wait for processing to complete
      await waitFor(() => {
        expect(queryByText('Unable to generate design with current inputs')).toBeTruthy();
      }, { timeout: 10000 });

      // Should show retry options
      expect(queryByText('Try uploading a clearer photo')).toBeTruthy();
      expect(queryByText('Select different style preferences')).toBeTruthy();

      // Should offer recovery actions
      const retryButton = queryByText('Try Again');
      const backToPhotoButton = queryByText('Change Photo');
      const backToStyleButton = queryByText('Change Style');

      expect(retryButton || backToPhotoButton || backToStyleButton).toBeTruthy();
    });
  });

  describe('Validation Recovery Actions', () => {
    it('should provide contextual recovery actions for each validation error', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('category_selection');

      // Mock validation with recovery actions
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'MISSING_CATEGORY',
          message: 'Please select a design category',
          severity: 'error' as const,
          field: 'categoryId',
          recoveryActions: [{
            type: 'select_category',
            label: 'Browse Categories',
            action: 'show_category_grid'
          }]
        }],
        warnings: [],
        suggestions: []
      });

      // Try to continue without selection
      const continueButton = queryByText('Continue to Space Selection');
      if (continueButton) {
        fireEvent.press(continueButton);
      }

      // Should show recovery action
      await waitFor(() => {
        const browseButton = queryByText('Browse Categories');
        expect(browseButton).toBeTruthy();
        
        if (browseButton) {
          fireEvent.press(browseButton);
        }
      });

      // Should highlight category options
      await waitFor(() => {
        expect(queryByText('Interior Design')).toBeTruthy();
        expect(queryByText('Garden Design')).toBeTruthy();
      });
    });

    it('should allow users to go back and fix validation issues', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Navigate through multiple steps
      await navigateToCompleteFlow();

      // Mock validation failure at final step
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'INCOMPLETE_DATA',
          message: 'Some required information is missing',
          severity: 'error' as const,
          field: 'overall',
          recoveryActions: [{
            type: 'go_back',
            label: 'Review Previous Steps',
            action: 'navigate_back',
            targetStep: 'photo_capture'
          }]
        }],
        warnings: [],
        suggestions: []
      });

      // Try to process
      const processButton = queryByText('Generate Design');
      if (processButton) {
        fireEvent.press(processButton);
      }

      // Should show recovery action
      await waitFor(() => {
        const reviewButton = queryByText('Review Previous Steps');
        expect(reviewButton).toBeTruthy();
        
        if (reviewButton) {
          fireEvent.press(reviewButton);
        }
      });

      // Should navigate back to photo capture
      await waitFor(() => {
        expect(getByText('Capture Your Space')).toBeTruthy();
      });
    });
  });

  describe('Cross-Step Validation Dependencies', () => {
    it('should validate data consistency across multiple steps', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Mock cross-step validation
      (wizardValidationService.validateStep as unknown as jest.Mock).mockResolvedValue({
        isValid: false,
        errors: [{
          code: 'STYLE_SPACE_MISMATCH',
          message: 'Selected style is not suitable for the chosen spaces',
          severity: 'error' as const,
          field: 'cross_validation',
          relatedSteps: ['space_definition', 'style_selection']
        }],
        warnings: [],
        suggestions: [
          'Choose a different style that works better with bathrooms',
          'Select different spaces that work well with Industrial style'
        ]
      });

      await navigateToStep('references_colors');

      // Try to continue with mismatched data
      const continueButton = getByText('Continue to AI Processing');
      fireEvent.press(continueButton);

      // Should show cross-validation error
      await waitFor(() => {
        expect(queryByText('Selected style is not suitable for the chosen spaces')).toBeTruthy();
      });

      // Should show contextual suggestions
      expect(queryByText('Choose a different style that works better with bathrooms')).toBeTruthy();
      expect(queryByText('Select different spaces that work well with Industrial style')).toBeTruthy();
    });
  });

  describe('Validation Performance and UX', () => {
    it('should show validation loading states', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      await navigateToStep('category_selection');

      // Mock slow validation
      let resolveValidation: (value: any) => void;
      const validationPromise = new Promise(resolve => {
        resolveValidation = resolve;
      });

      (wizardValidationService.validateStep as unknown as jest.Mock).mockReturnValue(validationPromise);

      // Select category and continue
      fireEvent.press(getByText('Interior Design'));
      const continueButton = getByText('Continue to Space Selection');
      fireEvent.press(continueButton);

      // Should show loading state
      await waitFor(() => {
        expect(queryByText('Validating...')).toBeTruthy();
      });

      // Resolve validation
      resolveValidation!({
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      });

      // Should proceed
      await waitFor(() => {
        expect(getByText('Select Your Spaces')).toBeTruthy();
      });
    });

    it('should debounce validation for real-time inputs', async () => {
      const { getByPlaceholderText } = render(<TestApp />);

      await navigateToStep('project_name');

      const projectNameInput = getByPlaceholderText('Enter project name');

      // Type rapidly
      fireEvent.changeText(projectNameInput, 'M');
      fireEvent.changeText(projectNameInput, 'My');
      fireEvent.changeText(projectNameInput, 'My P');
      fireEvent.changeText(projectNameInput, 'My Pr');
      fireEvent.changeText(projectNameInput, 'My Project');

      // Should only validate once after debounce
      await waitFor(() => {
        expect(wizardValidationService.validateStep).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Helper functions
  async function navigateToStep(stepName: string) {
    const { getByText } = render(<TestApp />);

    switch (stepName) {
      case 'category_selection':
        fireEvent.press(getByText('Get Started'));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Next')));
        await waitFor(() => fireEvent.press(getByText('Get Started')));
        await waitFor(() => fireEvent.press(getByText('Start New Project')));
        break;
      
      case 'space_definition':
        await navigateToStep('category_selection');
        fireEvent.press(getByText('Interior Design'));
        await waitFor(() => fireEvent.press(getByText('Continue to Space Selection')));
        break;
      
      case 'photo_capture':
        await navigateToStep('space_definition');
        fireEvent.press(getByText('Living Room'));
        await waitFor(() => fireEvent.press(getByText('Continue to Photo Capture')));
        break;
      
      case 'style_selection':
        await navigateToStep('photo_capture');
        fireEvent.press(getByText('Take Photo'));
        await waitFor(() => {
          const continueBtn = getByText('Continue to Style Selection');
          fireEvent.press(continueBtn);
        });
        break;
      
      case 'references_colors':
        await navigateToStep('style_selection');
        fireEvent.press(getByText('Modern'));
        await waitFor(() => fireEvent.press(getByText('Continue to References & Colors')));
        break;
      
      case 'ai_processing':
        await navigateToStep('references_colors');
        fireEvent.press(getByText('Skip for now'));
        break;
    }
  }

  async function navigateToCompleteFlow() {
    await navigateToStep('ai_processing');
  }
});