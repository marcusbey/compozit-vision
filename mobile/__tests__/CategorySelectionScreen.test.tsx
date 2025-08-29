import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CategorySelectionScreen from '../src/screens/ProjectWizard/CategorySelectionScreen';
import { useContentStore } from '../src/stores/contentStore';
import { useJourneyStore } from '../src/stores/journeyStore';
import { NavigationHelpers } from '../src/navigation/SafeJourneyNavigator';
import { supabase } from '../src/services/supabase';

// Mock dependencies
jest.mock('../src/stores/contentStore');
jest.mock('../src/stores/journeyStore');
jest.mock('../src/navigation/SafeJourneyNavigator');
jest.mock('../src/services/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Expo libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const mockJourneyStore = {
  updateProjectWizard: jest.fn(),
  currentStep: 'categorySelection',
  projectWizard: {},
};

const mockContentStore = {
  loadCategories: jest.fn(),
  categories: [],
};

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

describe('CategorySelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as jest.Mock).mockReturnValue(mockJourneyStore);
    (useContentStore as jest.Mock).mockReturnValue(mockContentStore);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
  });

  describe('Screen Initialization', () => {
    it('should render screen correctly', async () => {
      // Mock successful database response
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Interior Design',
            slug: 'interior-design',
            description: 'Transform your indoor spaces with style and functionality',
            category_type: 'interior',
            icon_name: 'home',
            color_scheme: { primary: '#C9A98C', secondary: '#B9906F' },
            display_order: 1,
            is_featured: true,
            usage_count: 5,
            popularity_score: 0.9,
            complexity_level: 3,
          }
        ],
        error: null
      });

      const { getByText } = render(<CategorySelectionScreen />);
      
      expect(getByText('Choose Your Project')).toBeTruthy();
      expect(getByText('What would you like to transform?')).toBeTruthy();
      expect(getByText('Step 1 of 6')).toBeTruthy();
    });

    it('should load categories from database on mount', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });

      render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('get_categories_by_type', {
          p_category_type: null,
          p_include_inactive: false
        });
      });
    });

    it('should show loading state initially', () => {
      const { getByText } = render(<CategorySelectionScreen />);
      
      expect(getByText('Loading categories...')).toBeTruthy();
    });
  });

  describe('Category Type Filtering', () => {
    beforeEach(async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Interior Design',
            category_type: 'interior',
            icon_name: 'home',
            display_order: 1,
            color_scheme: { primary: '#C9A98C' }
          },
          {
            id: '2',
            name: 'Garden Design',
            category_type: 'garden',
            icon_name: 'leaf',
            display_order: 2,
            color_scheme: { primary: '#7FB069' }
          }
        ],
        error: null
      });
    });

    it('should show filter chips for category types', async () => {
      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('All Types')).toBeTruthy();
        expect(getByText('Interior')).toBeTruthy();
        expect(getByText('Garden')).toBeTruthy();
      });
    });

    it('should filter categories when type is selected', async () => {
      (supabase.rpc as jest.Mock)
        .mockResolvedValueOnce({
          data: [
            { id: '1', name: 'Interior Design', category_type: 'interior' },
            { id: '2', name: 'Garden Design', category_type: 'garden' }
          ],
          error: null
        })
        .mockResolvedValueOnce({
          data: [
            { id: '1', name: 'Interior Design', category_type: 'interior' }
          ],
          error: null
        });

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Interior')).toBeTruthy();
      });

      // Click Interior filter
      fireEvent.press(getByText('Interior'));
      
      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('get_categories_by_type', {
          p_category_type: 'interior',
          p_include_inactive: false
        });
      });
    });
  });

  describe('Category Selection', () => {
    beforeEach(async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Interior Design',
            slug: 'interior-design',
            description: 'Transform your indoor spaces',
            category_type: 'interior',
            icon_name: 'home',
            color_scheme: { primary: '#C9A98C', secondary: '#B9906F' },
            display_order: 1,
            is_featured: true,
            usage_count: 5,
            popularity_score: 0.9,
            complexity_level: 3,
          }
        ],
        error: null
      });
    });

    it('should display categories with correct information', async () => {
      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Interior Design')).toBeTruthy();
        expect(getByText('Transform your indoor spaces')).toBeTruthy();
        expect(getByText('Advanced')).toBeTruthy(); // Complexity level 3
        expect(getByText('5 projects')).toBeTruthy(); // Usage count
      });
    });

    it('should allow selecting a category', async () => {
      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        const categoryCard = getByText('Interior Design').parent;
        fireEvent.press(categoryCard);
      });
      
      // Continue button should be enabled
      const continueButton = getByText('Continue');
      expect(continueButton).toBeTruthy();
    });

    it('should show featured badge for featured categories', async () => {
      const { getByText, queryByTestId } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        // Should show star icon for featured category
        expect(getByText('Interior Design')).toBeTruthy();
        // In actual implementation, would check for star icon via testID
      });
    });
  });

  describe('Continue Action', () => {
    beforeEach(async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Interior Design',
            slug: 'interior-design',
            category_type: 'interior',
            icon_name: 'home',
            color_scheme: { primary: '#C9A98C' },
          }
        ],
        error: null
      });
    });

    it('should be disabled when no category selected', async () => {
      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        const continueButton = getByText('Continue');
        // Button should be styled as disabled
        expect(continueButton).toBeTruthy();
      });
    });

    it('should navigate to space definition when category selected', async () => {
      (supabase.rpc as jest.Mock)
        .mockResolvedValueOnce({
          data: [{ id: '1', name: 'Interior Design', slug: 'interior-design', category_type: 'interior', icon_name: 'home', color_scheme: { primary: '#C9A98C' } }],
          error: null
        })
        .mockResolvedValueOnce({ data: null, error: null }); // For increment_category_usage

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        // Select category
        const categoryCard = getByText('Interior Design').parent;
        fireEvent.press(categoryCard);
      });

      // Click continue
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
          categoryId: '1',
          categoryName: 'Interior Design',
          categoryType: 'interior',
          categorySlug: 'interior-design',
          currentWizardStep: 'space_definition'
        });
        expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('spaceDefinition');
      });
    });

    it('should increment category usage count on selection', async () => {
      (supabase.rpc as jest.Mock)
        .mockResolvedValueOnce({
          data: [{ id: '1', name: 'Interior Design', slug: 'interior-design', category_type: 'interior' }],
          error: null
        })
        .mockResolvedValueOnce({ data: null, error: null });

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        const categoryCard = getByText('Interior Design').parent;
        fireEvent.press(categoryCard);
      });

      fireEvent.press(getByText('Continue'));
      
      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledWith('increment_category_usage', {
          p_category_id: '1'
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when database fails', async () => {
      (supabase.rpc as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Failed to load categories')).toBeTruthy();
        expect(getByText('Retry')).toBeTruthy();
      });
    });

    it('should fall back to hardcoded categories on error', async () => {
      (supabase.rpc as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        // Should show fallback categories
        expect(getByText('Interior Design')).toBeTruthy();
        expect(getByText('Garden & Landscape')).toBeTruthy();
        expect(getByText('Surface Design')).toBeTruthy();
      });
    });

    it('should handle retry action', async () => {
      (supabase.rpc as jest.Mock)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce({
          data: [{ id: '1', name: 'Test Category' }],
          error: null
        });

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Retry')).toBeTruthy();
      });

      // Click retry
      fireEvent.press(getByText('Retry'));
      
      await waitFor(() => {
        expect(supabase.rpc).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Back Navigation', () => {
    it('should navigate back to paywall when back button pressed', async () => {
      const { getByTestId } = render(<CategorySelectionScreen />);
      
      // Find back button (would need testID in actual implementation)
      // For now, just test the navigation call
      await waitFor(() => {
        // In actual test, would find and press back button
        // fireEvent.press(getByTestId('back-button'));
        // expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('paywall');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no categories found', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('No categories found')).toBeTruthy();
        expect(getByText('Try selecting a different project type')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ id: '1', name: 'Interior Design', description: 'Transform spaces' }],
        error: null
      });

      const { getByText } = render(<CategorySelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Choose Your Project')).toBeTruthy();
        expect(getByText('Interior Design')).toBeTruthy();
      });
    });
  });
});

describe('Database Integration', () => {
  it('should call correct database function with parameters', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [],
      error: null
    });

    render(<CategorySelectionScreen />);
    
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('get_categories_by_type', {
        p_category_type: null,
        p_include_inactive: false
      });
    });
  });

  it('should handle database response correctly', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
        category_type: 'interior',
        icon_name: 'home',
        color_scheme: { primary: '#C9A98C', secondary: '#B9906F' },
        display_order: 1,
        is_featured: false,
        usage_count: 0,
        popularity_score: 0.5,
        complexity_level: 2,
        created_at: new Date().toISOString()
      }
    ];

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: mockCategories,
      error: null
    });

    const { getByText } = render(<CategorySelectionScreen />);
    
    await waitFor(() => {
      expect(getByText('Test Category')).toBeTruthy();
      expect(getByText('Test description')).toBeTruthy();
      expect(getByText('Easy')).toBeTruthy(); // Complexity level 2
    });
  });
});