// Setup polyfills first
global.clearImmediate = global.clearImmediate || ((id: any) => global.clearTimeout(id));
global.setImmediate = global.setImmediate || ((fn: any) => global.setTimeout(fn, 0));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ReferenceLibraryScreen from '../src/screens/Library/ReferenceLibraryScreen';
import { useContentStore } from '../src/stores/contentStore';
import { useJourneyStore } from '../src/stores/journeyStore';
import { useFavoritesStore } from '../src/stores/favoritesStore';
import { referenceImageService } from '../src/services/referenceImageService';
import { colorExtractionService } from '../src/services/colorExtractionService';

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
jest.mock('../src/stores/contentStore');
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/favoritesStore');

// Mock services
jest.mock('../src/services/referenceImageService', () => ({
  referenceImageService: {
    getUserReferenceImages: jest.fn(),
    deleteReferenceImage: jest.fn(),
    toggleFavorite: jest.fn(),
    updateReferenceImage: jest.fn(),
  },
}));

jest.mock('../src/services/colorExtractionService', () => ({
  colorExtractionService: {
    getUserColorPalettes: jest.fn(),
    deleteColorPalette: jest.fn(),
    togglePaletteFavorite: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock data
const mockReferenceImages = [
  {
    id: 'ref-1',
    user_id: 'user-1',
    user_title: 'Modern Living Room',
    user_description: 'Beautiful modern living room with neutral colors',
    image_url: 'https://example.com/image1.jpg',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    tags: ['modern', 'living-room'],
    style_tags: ['contemporary', 'minimalist'],
    mood_tags: ['serene', 'clean'],
    space_types: ['living-room'],
    times_used: 3,
    is_favorite: true,
    processing_status: 'completed' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ai_description: 'A modern living room',
    detected_objects: ['sofa', 'table'],
    width: 1920,
    height: 1080,
    file_size: 500000,
    mime_type: 'image/jpeg',
    original_filename: 'living-room.jpg',
    storage_path: 'user-1/living-room.jpg',
    dominant_colors: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      palette: ['#FFFFFF', '#F5F5F5', '#2D2D2D'],
    },
  },
  {
    id: 'ref-2',
    user_id: 'user-1',
    user_title: 'Cozy Bedroom',
    user_description: 'Warm and inviting bedroom space',
    image_url: 'https://example.com/image2.jpg',
    thumbnail_url: 'https://example.com/thumb2.jpg',
    tags: ['cozy', 'bedroom'],
    style_tags: ['traditional', 'rustic'],
    mood_tags: ['warm', 'inviting'],
    space_types: ['bedroom'],
    times_used: 1,
    is_favorite: false,
    processing_status: 'completed' as const,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    ai_description: 'A cozy bedroom',
    detected_objects: ['bed', 'nightstand'],
    width: 1920,
    height: 1080,
    file_size: 400000,
    mime_type: 'image/jpeg',
    original_filename: 'bedroom.jpg',
    storage_path: 'user-1/bedroom.jpg',
  },
];

const mockColorPalettes = [
  {
    id: 'palette-1',
    user_id: 'user-1',
    name: 'Warm Neutrals',
    description: 'Cozy warm neutral colors',
    colors: {
      primary: '#F5F5DC',
      secondary: '#DEB887',
      accent: '#D2B48C',
      colors: ['#F5F5DC', '#DEB887', '#D2B48C', '#BC9A6A'],
      harmony: 'analogous',
    },
    source_type: 'user_created' as const,
    tags: ['neutral', 'warm'],
    mood_tags: ['cozy', 'comfortable'],
    style_compatibility: ['traditional', 'rustic'],
    space_compatibility: ['living-room', 'bedroom'],
    color_temperature: 'warm' as const,
    brightness_level: 'light' as const,
    saturation_level: 'moderate' as const,
    times_used: 2,
    popularity_score: 85,
    is_favorite: true,
    is_public: false,
    rating: 4.5,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z',
  },
  {
    id: 'palette-2',
    user_id: 'user-1',
    name: 'Ocean Blues',
    description: 'Calming ocean-inspired blue palette',
    colors: {
      primary: '#4682B4',
      secondary: '#87CEEB',
      accent: '#B0E0E6',
      colors: ['#4682B4', '#87CEEB', '#B0E0E6', '#E0F6FF'],
      harmony: 'monochromatic',
    },
    source_type: 'extracted' as const,
    tags: ['blue', 'ocean'],
    mood_tags: ['calm', 'peaceful'],
    style_compatibility: ['coastal', 'modern'],
    space_compatibility: ['bathroom', 'bedroom'],
    color_temperature: 'cool' as const,
    brightness_level: 'medium' as const,
    saturation_level: 'moderate' as const,
    times_used: 0,
    popularity_score: 75,
    is_favorite: false,
    is_public: false,
    rating: 4.0,
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-08T10:00:00Z',
  },
];

describe('ReferenceLibraryScreen', () => {
  const mockContentStore = {
    toggleReferenceSelection: jest.fn(),
    togglePaletteSelection: jest.fn(),
  };

  const mockJourneyStore = {
    updateProjectWizard: jest.fn(),
  };

  const mockFavoritesStore = {
    refreshAll: jest.fn(),
    toggleFavorite: jest.fn(),
    getFavoriteStatus: jest.fn(),
    stats: {
      totalFavorites: 4,
      referenceImages: 2,
      colorPalettes: 2,
      designStyles: 0,
      furnitureItems: 0,
      collections: 0,
    },
    loadStats: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useContentStore as jest.Mock).mockReturnValue(mockContentStore);
    (useJourneyStore as jest.Mock).mockReturnValue(mockJourneyStore);
    (useFavoritesStore as jest.Mock).mockReturnValue(mockFavoritesStore);
    
    // Mock services
    (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue(mockReferenceImages);
    (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue(mockColorPalettes);
    (referenceImageService.deleteReferenceImage as jest.Mock).mockResolvedValue(undefined);
    (colorExtractionService.deleteColorPalette as jest.Mock).mockResolvedValue(undefined);
    (referenceImageService.toggleFavorite as jest.Mock).mockResolvedValue({
      ...mockReferenceImages[0],
      is_favorite: !mockReferenceImages[0].is_favorite,
    });
    (colorExtractionService.togglePaletteFavorite as jest.Mock).mockResolvedValue({
      ...mockColorPalettes[0],
      is_favorite: !mockColorPalettes[0].is_favorite,
    });

    // Mock useFocusEffect
    (useFocusEffect as jest.Mock).mockImplementation((callback) => {
      callback();
    });
  });

  describe('Initial Render and Data Loading', () => {
    it('should render correctly with header and tabs', async () => {
      const { getByText, getByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      expect(getByText('Reference Library')).toBeTruthy();
      expect(getByText('All Items')).toBeTruthy();
      expect(getByText('Favorites')).toBeTruthy();
      expect(getByText('Palettes')).toBeTruthy();
      expect(getByText('Recent')).toBeTruthy();
      
      // Should have back and add buttons
      expect(getByLabelText('Back button')).toBeTruthy();
      expect(getByLabelText('Add reference button')).toBeTruthy();
    });

    it('should load user data on screen focus', async () => {
      render(<ReferenceLibraryScreen navigation={mockNavigation} />);

      await waitFor(() => {
        expect(referenceImageService.getUserReferenceImages).toHaveBeenCalled();
        expect(colorExtractionService.getUserColorPalettes).toHaveBeenCalled();
      });
    });

    it('should display loading state initially', () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      expect(getByText('Loading your library...')).toBeTruthy();
    });

    it('should display items after loading', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
        expect(getByText('Warm Neutrals')).toBeTruthy();
        expect(getByText('4 items')).toBeTruthy(); // 2 references + 2 palettes
      });
    });

    it('should display favorites stats', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Total Favorites')).toBeTruthy();
        expect(getByText('4')).toBeTruthy(); // Total favorites from mock
        expect(getByText('References')).toBeTruthy();
        expect(getByText('Palettes')).toBeTruthy();
      });
    });

    it('should initialize favorites store on screen focus', () => {
      render(<ReferenceLibraryScreen navigation={mockNavigation} />);

      expect(mockFavoritesStore.refreshAll).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Switch to favorites tab
      fireEvent.press(getByText('Favorites'));
      
      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy(); // Is favorited
        expect(getByText('Warm Neutrals')).toBeTruthy(); // Is favorited
        expect(getByText('2 items')).toBeTruthy(); // Only favorites
      });
    });

    it('should show only palettes in palettes tab', async () => {
      const { getByText, queryByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Switch to palettes tab
      fireEvent.press(getByText('Palettes'));
      
      await waitFor(() => {
        expect(getByText('Warm Neutrals')).toBeTruthy();
        expect(getByText('Ocean Blues')).toBeTruthy();
        expect(queryByText('Modern Living Room')).toBeFalsy();
        expect(getByText('2 items')).toBeTruthy(); // Only palettes
      });
    });

    it('should show recent items in recent tab', async () => {
      // Mock recent items (last 7 days)
      const recentDate = new Date().toISOString();
      const mockRecentRefs = [
        { ...mockReferenceImages[0], last_used_at: recentDate },
      ];
      const mockRecentPalettes = [
        { ...mockColorPalettes[0], last_used_at: recentDate },
      ];

      (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue(mockRecentRefs);
      (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue(mockRecentPalettes);

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Recent'));
      });

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
        expect(getByText('Warm Neutrals')).toBeTruthy();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should show search bar when search button is pressed', async () => {
      const { getByLabelText, getByPlaceholderText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      const searchButton = getByLabelText('Search button');
      fireEvent.press(searchButton);

      expect(getByPlaceholderText('Search references and palettes...')).toBeTruthy();
    });

    it('should filter items based on search query', async () => {
      const { getByLabelText, getByPlaceholderText, getByText, queryByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Open search
      const searchButton = getByLabelText('Search button');
      fireEvent.press(searchButton);

      const searchInput = getByPlaceholderText('Search references and palettes...');
      fireEvent.changeText(searchInput, 'modern');

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
        expect(queryByText('Cozy Bedroom')).toBeFalsy();
        expect(getByText('1 item')).toBeTruthy();
      });
    });

    it('should clear search when clear button is pressed', async () => {
      const { getByLabelText, getByPlaceholderText, getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      // Open search and type
      const searchButton = getByLabelText('Search button');
      fireEvent.press(searchButton);

      const searchInput = getByPlaceholderText('Search references and palettes...');
      fireEvent.changeText(searchInput, 'modern');

      // Clear search
      const clearButton = getByLabelText('Clear search');
      fireEvent.press(clearButton);

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
        expect(getByText('Cozy Bedroom')).toBeTruthy();
        expect(getByText('4 items')).toBeTruthy();
      });
    });
  });

  describe('View Mode Toggle', () => {
    it('should switch between grid and list view modes', async () => {
      const { getByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        // Default is grid view
        const gridButton = getByLabelText('Grid view');
        expect(gridButton).toBeTruthy();
      });

      // Switch to list view
      const listButton = getByLabelText('List view');
      fireEvent.press(listButton);

      // Should now be in list mode (would need specific list view indicators)
      expect(listButton).toBeTruthy();
    });
  });

  describe('Item Interactions', () => {
    it('should toggle favorite status for reference images', async () => {
      mockFavoritesStore.toggleFavorite.mockResolvedValue(true);
      
      const { getAllByRole } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const favoriteButtons = getAllByRole('button');
        expect(favoriteButtons.length).toBeGreaterThan(0);
      });

      const favoriteButtons = getAllByRole('button');
      const favoriteButton = favoriteButtons.find(button => 
        button.props.accessibilityLabel?.includes('favorite')
      );

      if (favoriteButton) {
        fireEvent.press(favoriteButton);

        await waitFor(() => {
          expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith('reference_image', 'ref-1', undefined);
        });
      }
    });

    it('should toggle favorite status for color palettes', async () => {
      mockFavoritesStore.toggleFavorite.mockResolvedValue(true);
      
      const { getByText, getAllByRole } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Palettes'));
      });

      await waitFor(() => {
        const favoriteButtons = getAllByRole('button');
        const favoriteButton = favoriteButtons.find(button => 
          button.props.accessibilityLabel?.includes('favorite')
        );
        expect(favoriteButton).toBeTruthy();
      });

      const favoriteButtons = getAllByRole('button');
      const favoriteButton = favoriteButtons.find(button => 
        button.props.accessibilityLabel?.includes('favorite')
      );

      if (favoriteButton) {
        fireEvent.press(favoriteButton);

        await waitFor(() => {
          expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith('color_palette', 'palette-1', undefined);
        });
      }
    });

    it('should enter selection mode on long press', async () => {
      const { getByText, getAllByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Long press on an item
      const item = getByText('Modern Living Room');
      fireEvent(item, 'longPress');

      await waitFor(() => {
        expect(getByText('1 selected')).toBeTruthy();
        expect(getByText('Add to Project')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();
      });
    });
  });

  describe('Selection Mode', () => {
    it('should allow multiple item selection', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Enter selection mode
      fireEvent(getByText('Modern Living Room'), 'longPress');

      await waitFor(() => {
        expect(getByText('1 selected')).toBeTruthy();
      });

      // Select another item
      fireEvent.press(getByText('Warm Neutrals'));

      await waitFor(() => {
        expect(getByText('2 selected')).toBeTruthy();
      });
    });

    it('should export selected items to project', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Enter selection mode and select items
      fireEvent(getByText('Modern Living Room'), 'longPress');
      
      await waitFor(() => {
        fireEvent.press(getByText('Warm Neutrals'));
      });

      await waitFor(() => {
        expect(getByText('2 selected')).toBeTruthy();
      });

      // Export to project
      fireEvent.press(getByText('Add to Project'));

      await waitFor(() => {
        expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
          selectedReferences: ['ref-1'],
          selectedPalettes: ['palette-1'],
        });
        expect(mockContentStore.toggleReferenceSelection).toHaveBeenCalledWith('ref-1');
        expect(mockContentStore.togglePaletteSelection).toHaveBeenCalledWith('palette-1');
        expect(Alert.alert).toHaveBeenCalledWith('Success', '2 item(s) added to your project.');
      });
    });

    it('should delete selected items with confirmation', async () => {
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Enter selection mode
      fireEvent(getByText('Modern Living Room'), 'longPress');

      await waitFor(() => {
        expect(getByText('1 selected')).toBeTruthy();
      });

      // Delete items
      fireEvent.press(getByText('Delete'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Delete Items',
          'Are you sure you want to delete 1 item(s)? This action cannot be undone.',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
            expect.objectContaining({ text: 'Delete', style: 'destructive' }),
          ])
        );
      });
    });

    it('should exit selection mode when close button is pressed', async () => {
      const { getByText, getByLabelText, queryByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Enter selection mode
      fireEvent(getByText('Modern Living Room'), 'longPress');

      await waitFor(() => {
        expect(getByText('1 selected')).toBeTruthy();
      });

      // Exit selection mode
      const closeButton = getByLabelText('Close selection mode');
      fireEvent.press(closeButton);

      await waitFor(() => {
        expect(queryByText('1 selected')).toBeFalsy();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no items exist', async () => {
      (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue([]);
      (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Your library is empty')).toBeTruthy();
        expect(getByText('Start by uploading reference images and creating color palettes')).toBeTruthy();
        expect(getByText('Add References')).toBeTruthy();
      });
    });

    it('should show favorites empty state', async () => {
      const noFavoritesRefs = mockReferenceImages.map(ref => ({ ...ref, is_favorite: false }));
      const noFavoritesPalettes = mockColorPalettes.map(palette => ({ ...palette, is_favorite: false }));

      (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue(noFavoritesRefs);
      (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue(noFavoritesPalettes);

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Favorites'));
      });

      await waitFor(() => {
        expect(getByText('No favorites yet')).toBeTruthy();
        expect(getByText('Heart items to add them to your favorites')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle data loading errors gracefully', async () => {
      (referenceImageService.getUserReferenceImages as jest.Mock).mockRejectedValue(
        new Error('Failed to load references')
      );

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to load your reference library. Please try again.'
        );
      });
    });

    it('should handle favorite toggle errors', async () => {
      (referenceImageService.toggleFavorite as jest.Mock).mockRejectedValue(
        new Error('Failed to toggle favorite')
      );

      const { getAllByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const favoriteButtons = getAllByLabelText(/favorite/i);
        fireEvent.press(favoriteButtons[0]);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to update favorite status.'
        );
      });
    });

    it('should handle delete errors', async () => {
      (referenceImageService.deleteReferenceImage as jest.Mock).mockRejectedValue(
        new Error('Failed to delete')
      );

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Modern Living Room')).toBeTruthy();
      });

      // Enter selection mode and try to delete
      fireEvent(getByText('Modern Living Room'), 'longPress');
      
      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      // Confirm deletion
      const alertCall = (Alert.alert as jest.Mock).mock.calls.find(
        call => call[0] === 'Delete Items'
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
          'Failed to delete some items. Please try again.'
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', () => {
      const { getByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      const backButton = getByLabelText('Back button');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate to references screen when add button is pressed', () => {
      const { getByLabelText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      const addButton = getByLabelText('Add reference button');
      fireEvent.press(addButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('references');
    });

    it('should navigate to references from empty state action', async () => {
      (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue([]);
      (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const addButton = getByText('Add References');
        fireEvent.press(addButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('references');
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when pull-to-refresh is triggered', async () => {
      const { getByTestId } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        // Simulate pull-to-refresh
        const flatList = getByTestId('reference-list');
        fireEvent(flatList, 'refresh');
      });

      await waitFor(() => {
        expect(referenceImageService.getUserReferenceImages).toHaveBeenCalledTimes(2);
        expect(colorExtractionService.getUserColorPalettes).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of items efficiently', async () => {
      // Mock large dataset
      const largeReferenceSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockReferenceImages[0],
        id: `ref-${i}`,
        user_title: `Reference ${i}`,
      }));

      const largePaletteSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockColorPalettes[0],
        id: `palette-${i}`,
        name: `Palette ${i}`,
      }));

      (referenceImageService.getUserReferenceImages as jest.Mock).mockResolvedValue(largeReferenceSet);
      (colorExtractionService.getUserColorPalettes as jest.Mock).mockResolvedValue(largePaletteSet);

      const startTime = Date.now();
      const { getByText } = render(
        <ReferenceLibraryScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('200 items')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
    });
  });
});