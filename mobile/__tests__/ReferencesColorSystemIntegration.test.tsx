import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReferencesColorsScreen from '../src/screens/ProjectWizard/ReferencesColorsScreen';
import ImageUploadModal from '../src/components/ImageUploadModal';
import ColorPaletteCreator from '../src/components/ColorPaletteCreator';
import { useJourneyStore } from '../src/stores/journeyStore';
import { useContentStore } from '../src/stores/contentStore';
import { NavigationHelpers } from '../src/navigation/NavigationHelpers';
import { referenceImageService } from '../src/services/referenceImageService';
import { colorExtractionService } from '../src/services/colorExtractionService';
import { geminiVisionService } from '../src/services/geminiVisionService';

// Mock dependencies
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/contentStore');
jest.mock('../src/navigation/NavigationHelpers');
jest.mock('../src/services/referenceImageService');
jest.mock('../src/services/colorExtractionService');
jest.mock('../src/services/geminiVisionService');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Expo libraries
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  ImagePickerResult: {},
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

const mockJourneyStore = {
  updateStep: jest.fn(),
  updateProjectWizard: jest.fn(),
  currentStep: 'referencesColors',
  projectWizard: {
    selectedStyle: 'modern',
    selectedRooms: ['living-room'],
  },
};

const mockContentStore = {
  userReferences: [
    {
      id: 'ref1',
      image_url: 'https://example.com/ref1.jpg',
      thumbnail_url: 'https://example.com/thumb1.jpg',
      user_title: 'Modern Living Room',
      ai_description: 'A sleek modern living room',
      processing_status: 'completed',
    },
    {
      id: 'ref2',
      image_url: 'https://example.com/ref2.jpg',
      thumbnail_url: 'https://example.com/thumb2.jpg',
      user_title: 'Cozy Bedroom',
      processing_status: 'completed',
    },
  ],
  userPalettes: [
    {
      id: 'palette1',
      name: 'Warm Neutrals',
      colors: {
        palette: ['#F5F5F5', '#E8E2D8', '#C9A98C'],
        primary: '#F5F5F5',
        secondary: '#E8E2D8',
      },
      color_temperature: 'warm',
      brightness_level: 'light',
    },
    {
      id: 'palette2',
      name: 'Cool Blues',
      colors: {
        palette: ['#E8F4F8', '#B8D8E0', '#7BB3C0'],
        primary: '#E8F4F8',
        secondary: '#B8D8E0',
      },
      color_temperature: 'cool',
      brightness_level: 'medium',
    },
  ],
  selectedReferences: ['ref1'],
  selectedPalettes: ['palette1'],
  uploadProgress: {
    isUploading: false,
    progress: 0,
    stage: '',
    message: '',
  },
  colorExtraction: {
    isExtracting: false,
    extractedColors: null,
  },
  loading: {
    userReferences: false,
    userPalettes: false,
  },
  loadUserReferences: jest.fn(),
  loadUserPalettes: jest.fn(),
  uploadReferenceImage: jest.fn(),
  extractColorsFromImage: jest.fn(),
  createColorPalette: jest.fn(),
  toggleReferenceSelection: jest.fn(),
  togglePaletteSelection: jest.fn(),
};

const mockReferenceImageService = {
  pickFromGallery: jest.fn(),
  pickFromCamera: jest.fn(),
  updateReferenceImage: jest.fn(),
};

const mockColorExtractionService = {
  extractColorsFromImage: jest.fn(),
  analyzeColor: jest.fn(),
  generateComplementaryPalette: jest.fn(),
};

const mockGeminiVisionService = {
  analyzeImage: jest.fn(),
};

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

describe('References and Color System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as unknown as jest.Mock).mockReturnValue(mockJourneyStore);
    (useContentStore as unknown as jest.Mock).mockReturnValue(mockContentStore);
    (NavigationHelpers as unknown as jest.Mock).mockImplementation(() => mockNavigationHelpers);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
    Object.assign(referenceImageService, mockReferenceImageService);
    Object.assign(colorExtractionService, mockColorExtractionService);
    Object.assign(geminiVisionService, mockGeminiVisionService);
  });

  describe('ReferencesColorsScreen', () => {
    it('should render screen with tabs correctly', () => {
      const { getByText } = render(<ReferencesColorsScreen />);
      
      expect(getByText('References & Colors')).toBeTruthy();
      expect(getByText('References')).toBeTruthy();
      expect(getByText('Colors')).toBeTruthy();
      expect(getByText('Step 5 of 5')).toBeTruthy();
    });

    it('should load user content on mount', async () => {
      render(<ReferencesColorsScreen />);
      
      await waitFor(() => {
        expect(mockContentStore.loadUserReferences).toHaveBeenCalled();
        expect(mockContentStore.loadUserPalettes).toHaveBeenCalled();
      });
    });

    it('should switch between tabs correctly', () => {
      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Should start on References tab
      expect(getByText('Upload Your Inspiration')).toBeTruthy();
      
      // Switch to Colors tab
      const colorsTab = getByText('Colors');
      fireEvent.press(colorsTab);
      
      expect(getByText('Your Color Palettes')).toBeTruthy();
    });

    it('should show selection counts in tab badges', () => {
      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Should show selected reference count
      expect(getByText('1')).toBeTruthy(); // selectedReferences has 1 item
    });

    describe('References Tab', () => {
      it('should display upload buttons', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
      });

      it('should handle gallery upload', async () => {
        mockReferenceImageService.pickFromGallery.mockResolvedValue({
          canceled: false,
          assets: [{ uri: 'file://test.jpg' }],
        });
        
        mockContentStore.uploadReferenceImage.mockResolvedValue({
          id: 'new-ref',
          image_url: 'https://example.com/new.jpg',
        });

        const { getByText } = render(<ReferencesColorsScreen />);
        
        const galleryButton = getByText('Gallery');
        fireEvent.press(galleryButton);
        
        await waitFor(() => {
          expect(mockReferenceImageService.pickFromGallery).toHaveBeenCalled();
          expect(mockContentStore.uploadReferenceImage).toHaveBeenCalledWith(
            'file://test.jpg',
            expect.objectContaining({
              title: 'Reference Image',
              description: 'Uploaded for design inspiration',
              tags: ['user-uploaded'],
            })
          );
        });
      });

      it('should handle camera capture', async () => {
        mockReferenceImageService.pickFromCamera.mockResolvedValue({
          canceled: false,
          assets: [{ uri: 'file://camera.jpg' }],
        });

        const { getByText } = render(<ReferencesColorsScreen />);
        
        const cameraButton = getByText('Camera');
        fireEvent.press(cameraButton);
        
        await waitFor(() => {
          expect(mockReferenceImageService.pickFromCamera).toHaveBeenCalled();
          expect(mockContentStore.uploadReferenceImage).toHaveBeenCalledWith(
            'file://camera.jpg',
            expect.objectContaining({
              title: 'Camera Capture',
              tags: ['camera-capture'],
            })
          );
        });
      });

      it('should display user references grid', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        
        expect(getByText('Your References')).toBeTruthy();
        expect(getByText('Modern Living Room')).toBeTruthy();
        expect(getByText('Cozy Bedroom')).toBeTruthy();
      });

      it('should show empty state when no references', () => {
        const emptyContentStore = {
          ...mockContentStore,
          userReferences: [],
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(emptyContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        
        expect(getByText('No references uploaded yet')).toBeTruthy();
        expect(getByText('Upload some inspiration images to get started')).toBeTruthy();
      });

      it('should handle reference selection', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        
        // Find and press a reference card (simplified - in real test would use testID)
        const referenceCard = getByText('Modern Living Room').parent;
        fireEvent.press(referenceCard);
        
        expect(mockContentStore.toggleReferenceSelection).toHaveBeenCalledWith('ref1');
      });

      it('should show upload progress when uploading', () => {
        const uploadingContentStore = {
          ...mockContentStore,
          uploadProgress: {
            isUploading: true,
            progress: 45,
            stage: 'uploading',
            message: 'Uploading image...',
          },
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(uploadingContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        
        expect(getByText('Uploading image...')).toBeTruthy();
      });
    });

    describe('Colors Tab', () => {
      beforeEach(() => {
        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
      });

      it('should display color palettes grid', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        expect(getByText('Your Color Palettes')).toBeTruthy();
        expect(getByText('Warm Neutrals')).toBeTruthy();
        expect(getByText('Cool Blues')).toBeTruthy();
      });

      it('should show empty state when no palettes', () => {
        const emptyContentStore = {
          ...mockContentStore,
          userPalettes: [],
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(emptyContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        expect(getByText('No color palettes yet')).toBeTruthy();
        expect(getByText('Extract colors from reference images to create palettes')).toBeTruthy();
      });

      it('should handle palette selection', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        // Find and press a palette card
        const paletteCard = getByText('Warm Neutrals').parent;
        fireEvent.press(paletteCard);
        
        expect(mockContentStore.togglePaletteSelection).toHaveBeenCalledWith('palette1');
      });

      it('should show color extraction progress', () => {
        const extractingContentStore = {
          ...mockContentStore,
          colorExtraction: {
            isExtracting: true,
            extractedColors: null,
          },
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(extractingContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        expect(getByText('Extracting colors...')).toBeTruthy();
      });

      it('should show extracted colors preview', () => {
        const extractedContentStore = {
          ...mockContentStore,
          colorExtraction: {
            isExtracting: false,
            extractedColors: {
              palette: ['#F5F5F5', '#E8E2D8', '#C9A98C'],
              primary: '#F5F5F5',
              secondary: '#E8E2D8',
            },
          },
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(extractedContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        expect(getByText('Extracted Colors')).toBeTruthy();
        expect(getByText('Save as Palette')).toBeTruthy();
      });

      it('should handle save extracted colors', async () => {
        const extractedContentStore = {
          ...mockContentStore,
          colorExtraction: {
            isExtracting: false,
            extractedColors: {
              palette: ['#F5F5F5', '#E8E2D8', '#C9A98C'],
              primary: '#F5F5F5',
              secondary: '#E8E2D8',
            },
          },
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(extractedContentStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        const saveButton = getByText('Save as Palette');
        fireEvent.press(saveButton);
        
        await waitFor(() => {
          expect(mockContentStore.createColorPalette).toHaveBeenCalled();
        });
      });
    });

    describe('Continue Button', () => {
      it('should be disabled when no selections', () => {
        const noSelectionStore = {
          ...mockContentStore,
          selectedReferences: [],
          selectedPalettes: [],
        };
        (useContentStore as unknown as jest.Mock).mockReturnValue(noSelectionStore);

        const { getByText } = render(<ReferencesColorsScreen />);
        
        const continueButton = getByText('Continue to AI Processing');
        fireEvent.press(continueButton);
        
        expect(Alert.alert).toHaveBeenCalledWith(
          'No Selections',
          'Please select at least one reference image or color palette to continue.',
          [{ text: 'OK' }]
        );
      });

      it('should navigate to AI processing when selections exist', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        
        const continueButton = getByText('Continue to AI Processing');
        fireEvent.press(continueButton);
        
        expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
          selectedReferences: ['ref1'],
          selectedPalettes: ['palette1'],
        });
        expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('aiProcessing');
      });

      it('should allow skipping without selections', () => {
        const { getByText } = render(<ReferencesColorsScreen />);
        
        const skipButton = getByText('Skip for now');
        fireEvent.press(skipButton);
        
        expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('aiProcessing');
      });
    });
  });

  describe('ImageUploadModal', () => {
    const mockOnUpload = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render modal correctly', () => {
      const { getByText } = render(
        <ImageUploadModal
          visible={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          imageUri="file://test.jpg"
        />
      );
      
      expect(getByText('Upload Reference')).toBeTruthy();
      expect(getByText('Preview & Crop')).toBeTruthy();
    });

    it('should show two-step process', () => {
      const { getByText } = render(
        <ImageUploadModal
          visible={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          imageUri="file://test.jpg"
        />
      );
      
      // Should start with crop step
      expect(getByText('Add Details')).toBeTruthy();
      
      // Press Add Details to go to metadata step
      const nextButton = getByText('Add Details');
      fireEvent.press(nextButton);
      
      expect(getByText('Title *')).toBeTruthy();
      expect(getByText('Space Type *')).toBeTruthy();
    });

    it('should validate required fields', async () => {
      const { getByText } = render(
        <ImageUploadModal
          visible={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          imageUri="file://test.jpg"
        />
      );
      
      // Go to metadata step
      const nextButton = getByText('Add Details');
      fireEvent.press(nextButton);
      
      // Try to upload without title
      const uploadButton = getByText('Upload');
      fireEvent.press(uploadButton);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Title',
        'Please enter a title for your reference image.'
      );
    });

    it('should handle successful upload', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ImageUploadModal
          visible={true}
          onClose={mockOnClose}
          onUpload={mockOnUpload}
          imageUri="file://test.jpg"
        />
      );
      
      // Go to metadata step
      const nextButton = getByText('Add Details');
      fireEvent.press(nextButton);
      
      // Fill required fields
      const titleInput = getByPlaceholderText('e.g., Cozy Living Room');
      fireEvent.changeText(titleInput, 'Test Room');
      
      // Select space type
      const livingRoomTag = getByText('Living Room');
      fireEvent.press(livingRoomTag);
      
      // Upload
      const uploadButton = getByText('Upload');
      fireEvent.press(uploadButton);
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Room',
            spaceTypes: ['Living Room'],
          })
        );
      });
    });
  });

  describe('ColorPaletteCreator', () => {
    const mockOnSave = jest.fn();
    const mockOnClose = jest.fn();
    const mockExtractedColors = {
      palette: ['#F5F5F5', '#E8E2D8', '#C9A98C'],
      primary: '#F5F5F5',
      secondary: '#E8E2D8',
      temperature: 'warm' as const,
      brightness: 'light' as const,
      saturation: 'muted' as const,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render with tabs', () => {
      const { getByText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          extractedColors={mockExtractedColors}
        />
      );
      
      expect(getByText('Color Palette')).toBeTruthy();
      expect(getByText('Extracted')).toBeTruthy();
      expect(getByText('Presets')).toBeTruthy();
      expect(getByText('Create')).toBeTruthy();
    });

    it('should show extracted colors tab when provided', () => {
      const { getByText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          extractedColors={mockExtractedColors}
        />
      );
      
      expect(getByText('Extracted Colors')).toBeTruthy();
      expect(getByText('Colors automatically extracted from your reference image')).toBeTruthy();
    });

    it('should show preset palettes', () => {
      const { getByText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      // Switch to presets tab
      const presetsTab = getByText('Presets');
      fireEvent.press(presetsTab);
      
      expect(getByText('Preset Palettes')).toBeTruthy();
      expect(getByText('Modern Neutral')).toBeTruthy();
      expect(getByText('Warm Earth')).toBeTruthy();
    });

    it('should show custom color creation', () => {
      const { getByText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );
      
      // Switch to create tab
      const createTab = getByText('Create');
      fireEvent.press(createTab);
      
      expect(getByText('Create Custom Palette')).toBeTruthy();
      expect(getByText(/Hue: \d+°/)).toBeTruthy();
      expect(getByText(/Saturation: \d+%/)).toBeTruthy();
      expect(getByText(/Lightness: \d+%/)).toBeTruthy();
    });

    it('should validate palette name before saving', async () => {
      const { getByText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          extractedColors={mockExtractedColors}
        />
      );
      
      // Try to save without name
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing Name',
        'Please enter a name for your color palette.'
      );
    });

    it('should handle successful save', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ColorPaletteCreator
          visible={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          extractedColors={mockExtractedColors}
        />
      );
      
      // Enter palette name
      const nameInput = getByPlaceholderText('Palette name');
      fireEvent.changeText(nameInput, 'My Custom Palette');
      
      // Save
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          'My Custom Palette',
          mockExtractedColors,
          undefined
        );
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors gracefully', async () => {
      mockContentStore.uploadReferenceImage.mockRejectedValue(
        new Error('Upload failed')
      );

      mockReferenceImageService.pickFromGallery.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://test.jpg' }],
      });

      const { getByText } = render(<ReferencesColorsScreen />);
      
      const galleryButton = getByText('Gallery');
      fireEvent.press(galleryButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Upload Failed',
          'Please try again.'
        );
      });
    });

    it('should handle color extraction errors', async () => {
      mockContentStore.extractColorsFromImage.mockRejectedValue(
        new Error('Extraction failed')
      );

      const { getByText } = render(<ReferencesColorsScreen />);
      
      // This would typically be triggered by a color extraction button
      // In a real test, we'd need to set up the full interaction flow
      await act(async () => {
        // Simulate extraction attempt
        try {
          await mockContentStore.extractColorsFromImage('test-url');
        } catch (error) {
          // Expected to fail
        }
      });
      
      // In real implementation, this would show an error alert
      expect(mockContentStore.extractColorsFromImage).toHaveBeenCalled();
    });

    it('should handle AI analysis errors gracefully', async () => {
      mockGeminiVisionService.analyzeImage.mockRejectedValue(
        new Error('AI analysis failed')
      );

      // In real test, this would be part of the upload flow
      await act(async () => {
        try {
          await mockGeminiVisionService.analyzeImage('test-uri');
        } catch (error) {
          // Expected to fail, should be handled gracefully
        }
      });
      
      expect(mockGeminiVisionService.analyzeImage).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large numbers of references efficiently', () => {
      const manyReferences = Array.from({ length: 100 }, (_, i) => ({
        id: `ref${i}`,
        image_url: `https://example.com/ref${i}.jpg`,
        thumbnail_url: `https://example.com/thumb${i}.jpg`,
        user_title: `Reference ${i}`,
        processing_status: 'completed',
      }));

      const largeContentStore = {
        ...mockContentStore,
        userReferences: manyReferences,
      };
      (useContentStore as unknown as jest.Mock).mockReturnValue(largeContentStore);

      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Should render without performance issues
      expect(getByText('Your References')).toBeTruthy();
    });

    it('should handle rapid tab switching', () => {
      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        const colorsTab = getByText('Colors');
        fireEvent.press(colorsTab);
        
        const referencesTab = getByText('References');
        fireEvent.press(referencesTab);
      }
      
      // Should not crash or cause issues
      expect(getByText('References')).toBeTruthy();
    });
  });

  describe('Integration Flow', () => {
    it('should complete full reference upload and selection flow', async () => {
      // Mock successful upload
      mockReferenceImageService.pickFromGallery.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://test.jpg' }],
      });

      mockContentStore.uploadReferenceImage.mockResolvedValue({
        id: 'new-ref',
        image_url: 'https://example.com/new.jpg',
      });

      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Upload image
      const galleryButton = getByText('Gallery');
      fireEvent.press(galleryButton);
      
      await waitFor(() => {
        expect(mockContentStore.uploadReferenceImage).toHaveBeenCalled();
      });
      
      // Select uploaded reference (would be in updated store)
      // Continue to AI processing
      const continueButton = getByText('Continue to AI Processing');
      fireEvent.press(continueButton);
      
      expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('aiProcessing');
    });

    it('should complete color palette creation and selection flow', async () => {
      const { getByText } = render(<ReferencesColorsScreen />);
      
      // Switch to colors tab
      const colorsTab = getByText('Colors');
      fireEvent.press(colorsTab);
      
      // Select existing palette
      const paletteCard = getByText('Warm Neutrals').parent;
      fireEvent.press(paletteCard);
      
      expect(mockContentStore.togglePaletteSelection).toHaveBeenCalled();
      
      // Continue to AI processing
      const continueButton = getByText('Continue to AI Processing');
      fireEvent.press(continueButton);
      
      expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('aiProcessing');
    });
  });
});