import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// Mock Navigation first - before any imports
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({ params: {} }),
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
  createNavigationContainerRef: () => ({
    isReady: () => true,
    navigate: jest.fn(),
    goBack: jest.fn(),
    getCurrentRoute: () => null,
  }),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StatusBar: 'StatusBar',
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
      })),
    },
  };
});

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

// Mock gesture handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  TouchableOpacity: 'TouchableOpacity',
}));

// Mock stores
jest.mock('../src/stores/journeyStore');
jest.mock('../src/stores/contentStore', () => ({
  useContentStore: () => ({
    styles: [],
    loadStyles: jest.fn(),
  }),
}));

// Mock services
jest.mock('../src/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock navigation helpers
jest.mock('../src/navigation/SafeJourneyNavigator', () => ({
  NavigationHelpers: {
    navigateToScreen: jest.fn(),
    goBack: jest.fn(),
  },
}));

// Now import components
import StyleSelectionScreen from '../src/screens/ProjectWizard/StyleSelectionScreen';
import { useJourneyStore } from '../src/stores/journeyStore';
import { NavigationHelpers } from '../src/navigation/SafeJourneyNavigator';
import { supabase } from '../src/services/supabase';

const mockJourneyStore = {
  updateProjectWizard: jest.fn(),
  projectWizard: {
    categoryId: 'cat-1',
    categoryName: 'Interior Design',
    categoryType: 'interior',
    selectedRooms: ['living-room', 'bedroom'],
  },
};

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

const mockDatabaseStyles = [
  {
    id: 'modern',
    name: 'Modern',
    slug: 'modern',
    subtitle: 'Clean & Minimal',
    description: 'Clean lines, open spaces, and functional design',
    mood_tags: ['clean', 'minimal', 'sophisticated'],
    color_palette: { primary: '#2D2B28', secondary: '#F8F8F8', accent: '#4A4A4A' },
    is_popular: true,
    is_active: true,
    suitable_spaces: ['living-room', 'kitchen', 'home-office'],
    space_popularity: {
      'living-room': 95,
      'kitchen': 90,
      'bedroom': 70,
    }
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    slug: 'scandinavian',
    subtitle: 'Light & Cozy',
    description: 'Light colors, natural materials, and hygge',
    mood_tags: ['cozy', 'natural', 'bright'],
    color_palette: { primary: '#F5F1E8', secondary: '#FFFFFF', accent: '#8B7355' },
    is_popular: true,
    is_active: true,
    suitable_spaces: ['bedroom', 'living-room'],
    space_popularity: {
      'bedroom': 95,
      'living-room': 85,
    }
  },
];

describe('StyleSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as jest.Mock).mockReturnValue(mockJourneyStore);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
  });

  describe('Screen Initialization', () => {
    it('should render screen correctly', async () => {
      // Mock database response
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockDatabaseStyles,
        error: null
      });

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }));

      const { getByText } = render(<StyleSelectionScreen />);
      
      expect(getByText('Choose Your Style')).toBeTruthy();
      expect(getByText('Step 3 of 6')).toBeTruthy();
      
      await waitFor(() => {
        expect(getByText('Modern')).toBeTruthy();
        expect(getByText('Scandinavian')).toBeTruthy();
      });
    });

    it('should load styles from database', async () => {
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockDatabaseStyles,
        error: null
      });

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }));

      render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('is_active', true);
        expect(mockOrder).toHaveBeenCalledTimes(2);
      });
    });

    it('should fall back to predefined styles when database fails', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        // Should show fallback styles
        expect(getByText('Modern')).toBeTruthy();
        expect(getByText('Scandinavian')).toBeTruthy();
        expect(getByText('Industrial')).toBeTruthy();
      });
    });
  });

  describe('Space Context Display', () => {
    it('should show selected spaces context when rooms are selected', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Designing for:')).toBeTruthy();
        expect(getByText('2 spaces')).toBeTruthy();
      });
    });

    it('should show single space name when only one room selected', async () => {
      mockJourneyStore.projectWizard.selectedRooms = ['living-room'];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });
    });

    it('should show filter tabs', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('For Your Spaces')).toBeTruthy(); // Recommended with spaces
        expect(getByText('Popular')).toBeTruthy();
        expect(getByText('All Styles')).toBeTruthy();
      });
    });

    it('should filter styles by popular when popular tab selected', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Popular')).toBeTruthy();
      });

      // Tap popular filter
      fireEvent.press(getByText('Popular'));
      
      await waitFor(() => {
        // Should show popular styles
        expect(getByText('Modern')).toBeTruthy();
        expect(getByText('Scandinavian')).toBeTruthy();
      });
    });

    it('should show empty state with fallback option when no styles match', async () => {
      // Mock empty result
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('No styles found')).toBeTruthy();
        expect(getByText('Show All Styles')).toBeTruthy();
      });
    });
  });

  describe('Style Selection', () => {
    beforeEach(async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });
    });

    it('should allow selecting a style', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Modern')).toBeTruthy();
      });

      const modernCard = getByText('Modern').parent?.parent;
      fireEvent.press(modernCard!);
      
      // Continue button should be enabled
      const continueButton = getByText('Continue to References & Colors');
      expect(continueButton).toBeTruthy();
    });

    it('should show compatibility scores for styles', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        // Modern should show high compatibility for living-room (95%)
        expect(getByText('95% space compatibility')).toBeTruthy();
      });
    });

    it('should show badges for highly compatible styles', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        // Modern should show great match badge (95% > 85%)
        expect(getByText('Great Match')).toBeTruthy();
        expect(getByText('Popular')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });
    });

    it('should continue to references and colors when style selected', async () => {
      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Modern')).toBeTruthy();
      });

      // Select style
      const modernCard = getByText('Modern').parent?.parent;
      fireEvent.press(modernCard!);
      
      // Continue
      const continueButton = getByText('Continue to References & Colors');
      fireEvent.press(continueButton);
      
      expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
        selectedStyleId: 'modern',
        selectedStyleName: 'Modern',
        selectedStyleSlug: 'modern',
        currentWizardStep: 'references_colors'
      });
      
      expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('referencesColors');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator while fetching styles', () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      expect(getByText('Loading styles...')).toBeTruthy();
    });

    it('should hide loading state when styles load', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });

      const { queryByText, getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(queryByText('Loading styles...')).toBeFalsy();
        expect(getByText('Modern')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        // Should still show fallback styles
        expect(getByText('Modern')).toBeTruthy();
      });
      
      consoleWarn.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should efficiently handle large style lists', async () => {
      // Create large dataset
      const largeStylesList = Array.from({ length: 100 }, (_, i) => ({
        ...mockDatabaseStyles[0],
        id: `style-${i}`,
        name: `Style ${i}`,
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: largeStylesList, error: null }),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText('Style 0')).toBeTruthy();
      });
    });
  });
});

describe('Style Filtering Logic', () => {
  const testFilters = [
    {
      filter: 'recommended',
      selectedRooms: ['living-room'],
      expectedStyles: ['Modern'], // High compatibility
      description: 'should show recommended styles for selected spaces',
    },
    {
      filter: 'popular',
      selectedRooms: ['bedroom'],
      expectedStyles: ['Modern', 'Scandinavian'], // Both are popular
      description: 'should show only popular styles',
    },
    {
      filter: 'all',
      selectedRooms: ['living-room'],
      expectedStyles: ['Modern', 'Scandinavian'], // All styles
      description: 'should show all available styles',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as jest.Mock).mockReturnValue(mockJourneyStore);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
  });

  testFilters.forEach(({ filter, selectedRooms, expectedStyles, description }) => {
    it(description, async () => {
      mockJourneyStore.projectWizard.selectedRooms = selectedRooms;
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockDatabaseStyles, error: null }),
      });

      const { getByText } = render(<StyleSelectionScreen />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(getByText('Modern')).toBeTruthy();
      });

      // Select filter if not default
      if (filter !== 'recommended') {
        const filterTab = filter === 'popular' ? 'Popular' : 'All Styles';
        fireEvent.press(getByText(filterTab));
      }
      
      await waitFor(() => {
        expectedStyles.forEach(styleName => {
          expect(getByText(styleName)).toBeTruthy();
        });
      });
    });
  });
});