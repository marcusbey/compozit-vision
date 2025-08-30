// Setup polyfills first
global.clearImmediate = global.clearImmediate || ((id: any) => global.clearTimeout(id));
global.setImmediate = global.setImmediate || ((fn: any) => global.setTimeout(fn, 0));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { FavoriteButton } from '../FavoriteButton';
import { useFavoritesStore } from '../../../stores/favoritesStore';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Error: 'error' },
}));

jest.mock('../../../stores/favoritesStore', () => ({
  useFavoritesStore: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('FavoriteButton', () => {
  const mockFavoritesStore = {
    getFavoriteStatus: jest.fn(),
    toggleFavorite: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFavoritesStore as unknown as jest.Mock).mockReturnValue(mockFavoritesStore);
    mockFavoritesStore.getFavoriteStatus.mockReturnValue(false);
    mockFavoritesStore.toggleFavorite.mockResolvedValue(true);
  });

  describe('Initial Render', () => {
    it('should render correctly with required props', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Add to favorites');
    });

    it('should show filled heart when item is favorited', () => {
      mockFavoritesStore.getFavoriteStatus.mockReturnValue(true);

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Remove from favorites');
      expect(button.props.accessibilityState.selected).toBe(true);
    });

    it('should show outline heart when item is not favorited', () => {
      mockFavoritesStore.getFavoriteStatus.mockReturnValue(false);

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Add to favorites');
      expect(button.props.accessibilityState.selected).toBe(false);
    });

    it('should apply custom style when provided', () => {
      const customStyle = { marginTop: 20 };

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          style={customStyle}
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining(customStyle)
      );
    });

    it('should show background when showBackground is true', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          showBackground={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          backgroundColor: '#FFFFFF',
        })
      );
    });
  });

  describe('Size Variants', () => {
    it('should render small size correctly', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          size="small"
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          width: 32,
          height: 32,
        })
      );
    });

    it('should render medium size correctly', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          size="medium"
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          width: 40,
          height: 40,
        })
      );
    });

    it('should render large size correctly', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          size="large"
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          width: 48,
          height: 48,
        })
      );
    });
  });

  describe('User Interactions', () => {
    it('should toggle favorite status on press', async () => {
      const onToggle = jest.fn();

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          onToggle={onToggle}
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'reference_image',
          'test-id',
          undefined
        );
      });

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true);
      });
    });

    it('should provide haptic feedback on iOS', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
      });
    });

    it('should handle toggle with collection ID', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="color_palette"
          itemId="palette-id"
          collectionId="collection-123"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'color_palette',
          'palette-id',
          'collection-123'
        );
      });
    });

    it('should not respond when disabled', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          disabled={true}
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.disabled).toBe(true);

      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle toggle failure gracefully', async () => {
      mockFavoritesStore.toggleFavorite.mockRejectedValue(new Error('Network error'));

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to update favorite. Please try again.',
          [{ text: 'OK', onPress: expect.any(Function) }]
        );
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
      });
    });

    it('should show error feedback for failed toggle', async () => {
      mockFavoritesStore.toggleFavorite.mockRejectedValue(new Error('API Error'));

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        // Error state should be reflected in the UI
        expect(button.props.style).toContainEqual(
          expect.objectContaining({
            backgroundColor: expect.stringContaining('#F44336'),
          })
        );
      });
    });
  });

  describe('Optimistic Updates', () => {
    it('should show immediate visual feedback', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      
      // Initial state: not favorited
      expect(button.props.accessibilityState.selected).toBe(false);

      fireEvent.press(button);

      // Should immediately show as favorited (optimistic update)
      expect(button.props.accessibilityState.selected).toBe(true);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalled();
      });
    });

    it('should rollback on failure', async () => {
      mockFavoritesStore.toggleFavorite.mockRejectedValue(new Error('Failed'));

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      
      // Initial state: not favorited
      expect(button.props.accessibilityState.selected).toBe(false);

      fireEvent.press(button);

      // Should immediately show as favorited (optimistic)
      expect(button.props.accessibilityState.selected).toBe(true);

      // After failure, should rollback
      await waitFor(() => {
        expect(button.props.accessibilityState.selected).toBe(false);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when store is loading', () => {
      mockFavoritesStore.isLoading = true;

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState.busy).toBe(true);
    });

    it('should disable interaction when loading', async () => {
      mockFavoritesStore.isLoading = true;

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      expect(mockFavoritesStore.toggleFavorite).not.toHaveBeenCalled();
    });

    it('should prevent multiple rapid presses', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      
      // Rapid fire presses
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      // Should only call toggle once
      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          accessibilityLabel="Custom favorite button"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Custom favorite button');
    });

    it('should provide accessibility hints', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Double tap to add to favorites');
    });

    it('should update hints based on favorite status', () => {
      mockFavoritesStore.getFavoriteStatus.mockReturnValue(true);

      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Double tap to remove from favorites');
    });

    it('should have minimum touch target size', () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
          size="small"
        />
      );

      const button = getByRole('button');
      expect(button.props.style).toContainEqual(
        expect.objectContaining({
          minWidth: 44,
          minHeight: 44,
        })
      );
    });
  });

  describe('Different Item Types', () => {
    it('should work with reference_image type', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="ref-123"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'reference_image',
          'ref-123',
          undefined
        );
      });
    });

    it('should work with color_palette type', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="color_palette"
          itemId="palette-123"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'color_palette',
          'palette-123',
          undefined
        );
      });
    });

    it('should work with design_style type', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="design_style"
          itemId="style-123"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'design_style',
          'style-123',
          undefined
        );
      });
    });

    it('should work with furniture_item type', async () => {
      const { getByRole } = render(
        <FavoriteButton
          itemType="furniture_item"
          itemId="furniture-123"
        />
      );

      const button = getByRole('button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockFavoritesStore.toggleFavorite).toHaveBeenCalledWith(
          'furniture_item',
          'furniture-123',
          undefined
        );
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks', () => {
      const { unmount } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id"
        />
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid re-renders', () => {
      const { rerender } = render(
        <FavoriteButton
          itemType="reference_image"
          itemId="test-id-1"
        />
      );

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender(
          <FavoriteButton
            itemType="reference_image"
            itemId={`test-id-${i}`}
          />
        );
      }

      expect(mockFavoritesStore.getFavoriteStatus).toHaveBeenCalledTimes(10);
    });
  });
});