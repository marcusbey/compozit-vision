// Setup polyfills first
global.clearImmediate = global.clearImmediate || ((id: any) => global.clearTimeout(id));
global.setImmediate = global.setImmediate || ((fn: any) => global.setTimeout(fn, 0));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import MyPalettesScreen from '../src/screens/Palettes/MyPalettesScreen';
import { useJourneyStore } from '../src/stores/journeyStore';
import { useFavoritesStore } from '../src/stores/favoritesStore';
import { colorExtractionService } from '../src/services/colorExtractionService';
import { referenceImageService } from '../src/services/referenceImageService';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

// Mock stores
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/favoritesStore');

// Mock services
jest.mock('../src/services/colorExtractionService', () => ({
  colorExtractionService: {
    getUserColorPalettes: jest.fn(),
    createColorPalette: jest.fn(),
    updateColorPalette: jest.fn(),
    deleteColorPalette: jest.fn(),
    extractColorsFromImage: jest.fn(),
  },
}));

jest.mock('../src/services/referenceImageService', () => ({
  referenceImageService: {
    uploadImage: jest.fn(),
  },
}));


// Mock Alert
jest.spyOn(Alert, 'alert');
jest.spyOn(Alert, 'prompt');

// Mock data
const mockPalettes = [
  {
    id: 'palette-1',
    user_id: 'user-id',
    name: 'Warm Earth Tones',
    description: 'Cozy and inviting earth colors',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460',
      colors: ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#FFE4B5'],
      harmony: 'analogous',
    },
    source_type: 'user_created' as const,
    tags: ['warm', 'earth', 'cozy'],
    mood_tags: ['comfortable', 'grounded'],
    style_compatibility: ['rustic', 'traditional'],
    space_compatibility: ['living-room', 'bedroom'],
    color_temperature: 'warm' as const,
    brightness_level: 'medium' as const,
    saturation_level: 'moderate' as const,
    times_used: 5,
    popularity_score: 90,
    is_favorite: true,
    is_public: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'palette-2',
    user_id: 'user-id',
    name: 'Ocean Breeze',
    description: 'Cool blues and greens from the sea',
    colors: {
      primary: '#006994',
      secondary: '#40E0D0',
      accent: '#48D1CC',
      colors: ['#006994', '#40E0D0', '#48D1CC', '#00CED1', '#B0E0E6'],
      harmony: 'monochromatic',
    },
    source_type: 'extracted' as const,
    source_image_id: 'ref-123',
    tags: ['cool', 'ocean', 'fresh'],
    mood_tags: ['calm', 'refreshing'],
    style_compatibility: ['modern', 'coastal'],
    space_compatibility: ['bathroom', 'bedroom'],
    color_temperature: 'cool' as const,
    brightness_level: 'light' as const,
    saturation_level: 'vibrant' as const,
    times_used: 3,
    popularity_score: 85,
    is_favorite: false,
    is_public: false,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
];

describe('MyPalettesScreen', () => {
  const mockJourneyStore = {
    updateProjectWizard: jest.fn(),
  };

  const mockFavoritesStore = {
    refreshAll: jest.fn(),
    toggleFavorite: jest.fn(),
    getFavoriteStatus: jest.fn(),
    stats: {
      totalFavorites: 5,
      colorPalettes: 2,
    },
    loadStats: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useJourneyStore as unknown as jest.Mock).mockReturnValue(mockJourneyStore);
    (useFavoritesStore as unknown as jest.Mock).mockReturnValue(mockFavoritesStore);
    
    // Mock services
    (colorExtractionService.getUserColorPalettes as unknown as jest.Mock).mockResolvedValue(mockPalettes);
    (colorExtractionService.createColorPalette as unknown as jest.Mock).mockResolvedValue({
      ...mockPalettes[0],
      id: 'new-palette',
    });
    (colorExtractionService.deleteColorPalette as unknown as jest.Mock).mockResolvedValue(undefined);
    
    // Mock focus effect
    (useFocusEffect as unknown as jest.Mock).mockImplementation((callback) => {
      callback();
    });
  });

  describe('Initial Render and Data Loading', () => {
    it('should render correctly with header and controls', async () => {
      const { getByText, getByLabelText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      expect(getByText('My Color Palettes')).toBeTruthy();
      expect(getByLabelText('Back button')).toBeTruthy();
      expect(getByLabelText('Search button')).toBeTruthy();
      expect(getByLabelText('Create palette button')).toBeTruthy();
    });

    it('should load user palettes on screen focus', async () => {
      render(<MyPalettesScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(colorExtractionService.getUserColorPalettes).toHaveBeenCalledWith('user-id');
      });
    });

    it('should display palettes after loading', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
        expect(getByText('Ocean Breeze')).toBeTruthy();
        expect(getByText('2 palettes')).toBeTruthy();
      });
    });

    it('should initialize favorites store on focus', () => {
      render(<MyPalettesScreen navigation={mockNavigation} />);

      expect(mockFavoritesStore.refreshAll).toHaveBeenCalled();
    });
  });

  describe('Search and Filtering', () => {
    it('should show search bar when search button is pressed', async () => {
      const { getByLabelText, getByPlaceholderText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const searchButton = getByLabelText('Search button');
      fireEvent.press(searchButton);

      expect(getByPlaceholderText('Search palettes by name or tag...')).toBeTruthy();
    });

    it('should filter palettes based on search query', async () => {
      const { getByLabelText, getByPlaceholderText, getByText, queryByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      const searchButton = getByLabelText('Search button');
      fireEvent.press(searchButton);

      const searchInput = getByPlaceholderText('Search palettes by name or tag...');
      fireEvent.changeText(searchInput, 'ocean');

      await waitFor(() => {
        expect(getByText('Ocean Breeze')).toBeTruthy();
        expect(queryByText('Warm Earth Tones')).toBeFalsy();
      });
    });

    it('should filter by temperature when filter buttons are pressed', async () => {
      const { getByLabelText, getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const filterButton = getByLabelText('Filter button');
      fireEvent.press(filterButton);

      await waitFor(() => {
        const warmButton = getByText('Warm');
        fireEvent.press(warmButton);
      });

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
        expect(getByText('1 palette')).toBeTruthy();
      });
    });
  });

  describe('Sorting', () => {
    it('should show sort options when sort button is pressed', async () => {
      const { getByLabelText, getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const sortButton = getByLabelText('Sort button');
      fireEvent.press(sortButton);

      await waitFor(() => {
        expect(getByText('Newest first')).toBeTruthy();
        expect(getByText('Oldest first')).toBeTruthy();
        expect(getByText('Most used')).toBeTruthy();
        expect(getByText('Alphabetical')).toBeTruthy();
        expect(getByText('By temperature')).toBeTruthy();
        expect(getByText('By brightness')).toBeTruthy();
      });
    });

    it('should sort palettes by selected option', async () => {
      const { getByLabelText, getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      const sortButton = getByLabelText('Sort button');
      fireEvent.press(sortButton);

      const alphabeticalOption = getByText('Alphabetical');
      fireEvent.press(alphabeticalOption);

      // After sorting alphabetically, Ocean Breeze should come first
      const palettes = await waitFor(() => {
        const allTexts = getByText('2 palettes').parent?.parent?.children || [];
        return allTexts.filter((child: any) => child.type === 'Text').map((child: any) => child.props.children);
      });

      expect(palettes.indexOf('Ocean Breeze')).toBeLessThan(palettes.indexOf('Warm Earth Tones'));
    });
  });

  describe('Selection Mode', () => {
    it('should enter selection mode on long press', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent(getByText('Warm Earth Tones'), 'longPress');

      await waitFor(() => {
        expect(getByText('1 selected')).toBeTruthy();
        expect(getByText('Apply to Project')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();
      });
    });

    it('should allow multiple selection', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent(getByText('Warm Earth Tones'), 'longPress');

      await waitFor(() => {
        fireEvent.press(getByText('Ocean Breeze'));
      });

      await waitFor(() => {
        expect(getByText('2 selected')).toBeTruthy();
      });
    });

    it('should apply selected palettes to project', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent(getByText('Warm Earth Tones'), 'longPress');

      await waitFor(() => {
        fireEvent.press(getByText('Apply to Project'));
      });

      await waitFor(() => {
        expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
          selectedPalettes: ['palette-1'],
        });
        expect(Alert.alert).toHaveBeenCalledWith('Success', '1 palette(s) applied to your project.');
      });
    });

    it('should delete selected palettes with confirmation', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent(getByText('Warm Earth Tones'), 'longPress');

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Palettes',
          'Are you sure you want to delete 1 palette(s)? This action cannot be undone.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
            expect.objectContaining({ text: 'Delete', style: 'destructive' }),
          ])
        );
      });
    });
  });

  describe('Palette Creation', () => {
    it('should show create palette modal when FAB is pressed', async () => {
      const { getByLabelText, getByText, getByPlaceholderText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const createButton = getByLabelText('Create palette button');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText('Create New Palette')).toBeTruthy();
        expect(getByPlaceholderText('Palette name')).toBeTruthy();
        expect(getByText('Extract from Image')).toBeTruthy();
      });
    });

    it('should extract colors from image', async () => {
      // Mock the service response
      (colorExtractionService.extractColorsFromImage as unknown as jest.Mock).mockResolvedValue({
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF',
        colors: ['#FF0000', '#00FF00', '#0000FF'],
        harmony: 'triadic',
      });

      const { getByLabelText, getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const createButton = getByLabelText('Create palette button');
      fireEvent.press(createButton);

      await waitFor(() => {
        const extractButton = getByText('Extract from Image');
        fireEvent.press(extractButton);
      });

      await waitFor(() => {
        expect(colorExtractionService.extractColorsFromImage).toHaveBeenCalled();
      });
    });

    it('should create manual palette with color picker', async () => {
      const { getByLabelText, getByText, getByPlaceholderText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const createButton = getByLabelText('Create palette button');
      fireEvent.press(createButton);

      await waitFor(() => {
        const nameInput = getByPlaceholderText('Palette name');
        fireEvent.changeText(nameInput, 'My Custom Palette');

        const descInput = getByPlaceholderText('Description (optional)');
        fireEvent.changeText(descInput, 'Beautiful custom colors');
      });

      // Would test color picker interaction here
      // For now, test the create button
      const createPaletteButton = getByText('Create Palette');
      fireEvent.press(createPaletteButton);

      await waitFor(() => {
        expect(colorExtractionService.createColorPalette).toHaveBeenCalled();
      });
    });
  });

  describe('Palette Details Modal', () => {
    it('should show palette details when palette is pressed', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent.press(getByText('Warm Earth Tones'));

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
        expect(getByText('Cozy and inviting earth colors')).toBeTruthy();
        expect(getByText('Temperature: Warm')).toBeTruthy();
        expect(getByText('Brightness: Medium')).toBeTruthy();
        expect(getByText('Saturation: Moderate')).toBeTruthy();
      });
    });

    it('should copy color to clipboard when color is pressed', async () => {
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent.press(getByText('Warm Earth Tones'));

      await waitFor(() => {
        // Find a color swatch and press it
        const primaryColorLabel = getByText('#8B4513');
        fireEvent.press(primaryColorLabel);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Copied!', 'Color #8B4513 copied to clipboard');
      });
    });

    it('should edit palette from details modal', async () => {
      const { getByText, getByLabelText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent.press(getByText('Warm Earth Tones'));

      await waitFor(() => {
        const editButton = getByLabelText('Edit palette');
        fireEvent.press(editButton);
      });

      await waitFor(() => {
        expect(getByText('Edit Palette')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle data loading errors gracefully', async () => {
      (colorExtractionService.getUserColorPalettes as unknown as jest.Mock).mockRejectedValue(
        new Error('Failed to load palettes')
      );

      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to load your palettes. Please try again.'
        );
      });
    });

    it('should handle palette creation errors', async () => {
      (colorExtractionService.createColorPalette as unknown as jest.Mock).mockRejectedValue(
        new Error('Failed to create palette')
      );

      const { getByLabelText, getByText, getByPlaceholderText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const createButton = getByLabelText('Create palette button');
      fireEvent.press(createButton);

      await waitFor(() => {
        const nameInput = getByPlaceholderText('Palette name');
        fireEvent.changeText(nameInput, 'Test Palette');

        const createPaletteButton = getByText('Create Palette');
        fireEvent.press(createPaletteButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create palette. Please try again.'
        );
      });
    });

    it('should handle delete errors', async () => {
      (colorExtractionService.deleteColorPalette as unknown as jest.Mock).mockRejectedValue(
        new Error('Failed to delete')
      );

      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Warm Earth Tones')).toBeTruthy();
      });

      fireEvent(getByText('Warm Earth Tones'), 'longPress');

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      const alertCall = (Alert.alert as unknown as jest.Mock).mock.calls.find(
        call => call[0] === 'Delete Palettes'
      );
      if (alertCall) {
        const deleteAction = alertCall[2].find((action: any) => action.text === 'Delete');
        if (deleteAction?.onPress) {
          await act(async () => {
            await deleteAction.onPress();
          });
        }
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to delete some palettes. Please try again.'
        );
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no palettes exist', async () => {
      (colorExtractionService.getUserColorPalettes as unknown as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('No palettes yet')).toBeTruthy();
        expect(getByText('Create your first color palette to get started')).toBeTruthy();
        expect(getByText('Create Palette')).toBeTruthy();
      });
    });

    it('should navigate to create palette from empty state', async () => {
      (colorExtractionService.getUserColorPalettes as unknown as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const createButton = getByText('Create Palette');
        fireEvent.press(createButton);
      });

      await waitFor(() => {
        expect(getByText('Create New Palette')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', () => {
      const { getByLabelText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      const backButton = getByLabelText('Back button');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when pull-to-refresh is triggered', async () => {
      const { getByTestId } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const flatList = getByTestId('palettes-list');
        fireEvent(flatList, 'refresh');
      });

      await waitFor(() => {
        expect(colorExtractionService.getUserColorPalettes).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of palettes efficiently', async () => {
      const largePaletteSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockPalettes[0],
        id: `palette-${i}`,
        name: `Palette ${i}`,
      }));

      (colorExtractionService.getUserColorPalettes as unknown as jest.Mock).mockResolvedValue(largePaletteSet);

      const startTime = Date.now();
      const { getByText } = render(
        <MyPalettesScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('100 palettes')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000);
    });
  });
});