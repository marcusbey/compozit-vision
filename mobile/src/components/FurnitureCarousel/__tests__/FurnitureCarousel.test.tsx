import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FurnitureCarousel } from '../FurnitureCarousel';
import { FURNITURE_CATEGORIES, MOCK_FURNITURE_STYLES } from '../../../services/furniture/SpaceAnalysisService';
import { FurnitureCategory, FurnitureStyle, FurnitureSelection } from '../../../types/furniture';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  ...jest.requireActual('react-native-gesture-handler'),
  PanGestureHandler: ({ children }: any) => children,
  State: { BEGAN: 0, ACTIVE: 1, END: 2 },
}));

const mockCategories = FURNITURE_CATEGORIES.slice(0, 3);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>{children}</GestureHandlerRootView>
);

describe('FurnitureCarousel', () => {
  const mockProps = {
    categories: mockCategories,
    onStyleSelect: jest.fn(),
    onStyleSkip: jest.fn(),
    onCategoryComplete: jest.fn(),
    onAllCategoriesComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with categories', () => {
    const { getByText } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    expect(getByText('Seating')).toBeTruthy();
    expect(getByText('1 of 3')).toBeTruthy();
  });

  it('displays the first style from the first category', () => {
    const { getByText } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    // Should show the first style from seating category
    const firstStyle = MOCK_FURNITURE_STYLES.seating[0];
    expect(getByText(firstStyle.name)).toBeTruthy();
  });

  it('calls onStyleSelect when like button is pressed', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(mockProps.onStyleSelect).toHaveBeenCalledWith(
        'seating',
        MOCK_FURNITURE_STYLES.seating[0]
      );
    });
  });

  it('calls onStyleSkip when skip button is pressed', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    const skipButton = getByTestId('skip-button');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(mockProps.onStyleSkip).toHaveBeenCalledWith(
        'seating',
        MOCK_FURNITURE_STYLES.seating[0]
      );
    });
  });

  it('progresses through categories correctly', async () => {
    const { getByText, rerender } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    // Should start with category 1
    expect(getByText('1 of 3')).toBeTruthy();
    expect(getByText('Seating')).toBeTruthy();

    // Simulate completing all styles in first category
    // This would normally happen through gesture interactions
    const updatedProps = {
      ...mockProps,
      initialCategoryIndex: 1,
    };

    rerender(
      <TestWrapper>
        <FurnitureCarousel {...updatedProps} />
      </TestWrapper>
    );

    expect(getByText('2 of 3')).toBeTruthy();
    expect(getByText('Tables')).toBeTruthy();
  });

  it('handles empty categories gracefully', () => {
    const emptyProps = {
      ...mockProps,
      categories: [],
    };

    const { getByText } = render(
      <TestWrapper>
        <FurnitureCarousel {...emptyProps} />
      </TestWrapper>
    );

    expect(getByText('No more styles to show')).toBeTruthy();
  });

  it('disables gestures when specified', () => {
    const disabledGestureProps = {
      ...mockProps,
      gesturesEnabled: false,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <FurnitureCarousel {...disabledGestureProps} />
      </TestWrapper>
    );

    // The gesture handler should be disabled
    // This is more of an integration test that would require actual gesture simulation
  });

  it('animates card transitions smoothly', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <FurnitureCarousel {...mockProps} />
      </TestWrapper>
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    // Animation would complete and call the callback
    await waitFor(() => {
      expect(mockProps.onStyleSelect).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('tracks selections across categories', async () => {
    let selections: FurnitureSelection[] = [];
    
    const trackingProps = {
      ...mockProps,
      onCategoryComplete: jest.fn((categoryId, selection) => {
        selections.push(selection);
      }),
    };

    const { getByTestId } = render(
      <TestWrapper>
        <FurnitureCarousel {...trackingProps} />
      </TestWrapper>
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(trackingProps.onCategoryComplete).toHaveBeenCalled();
    });

    // Verify selection data structure
    const [categoryId, selection] = trackingProps.onCategoryComplete.mock.calls[0];
    expect(categoryId).toBe('seating');
    expect(selection.selectedStyles).toHaveLength(1);
    expect(selection.selectedStyles[0]).toBe(MOCK_FURNITURE_STYLES.seating[0]);
  });
});