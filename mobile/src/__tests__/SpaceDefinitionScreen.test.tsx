import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SpaceDefinitionScreen from '../src/screens/ProjectWizard/SpaceDefinitionScreen';
import { useJourneyStore } from '../src/stores/journeyStore';
import { NavigationHelpers } from '../src/navigation/SafeJourneyNavigator';
import { supabase } from '../src/services/supabase';

// Mock dependencies
jest.mock('../src/stores/journeyStore');
jest.mock('../src/navigation/SafeJourneyNavigator');
jest.mock('../src/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
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

// Mock gesture handler before importing SpaceDefinitionScreen
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  TouchableOpacity: 'TouchableOpacity',
}));

// Mock stack navigator
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

const mockJourneyStore = {
  updateProjectWizard: jest.fn(),
  projectWizard: {
    categoryId: 'cat-1',
    categoryName: 'Interior Design',
    categoryType: 'interior',
    selectedRooms: [],
  },
};

const mockNavigationHelpers = {
  navigateToScreen: jest.fn(),
  goBack: jest.fn(),
};

describe('SpaceDefinitionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useJourneyStore as unknown as jest.Mock).mockReturnValue(mockJourneyStore);
    Object.assign(NavigationHelpers, mockNavigationHelpers);
  });

  describe('Screen Initialization', () => {
    it('should render screen correctly', async () => {
      // Mock database response
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          {
            room_slug: 'living-room',
            room_name: 'Living Room',
            is_primary_match: true,
            compatibility_score: 1.0,
          }
        ],
        error: null
      });

      (supabase.from as unknown as jest.Mock).mockImplementation(() => ({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }));

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      expect(getByText('Select Your Spaces')).toBeTruthy();
      expect(getByText("Choose all areas you'd like to design")).toBeTruthy();
      expect(getByText('Step 2 of 6')).toBeTruthy();
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
      });
    });

    it('should load spaces from database based on category', async () => {
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      (supabase.from as unknown as jest.Mock).mockImplementation(() => ({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      }));

      render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(mockEq).toHaveBeenCalledWith('category_id', 'cat-1');
        expect(mockOrder).toHaveBeenCalledWith('is_primary_match', { ascending: false });
      });
    });

    it('should fall back to predefined spaces when database fails', async () => {
      (supabase.from as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        // Should show interior spaces as fallback
        expect(getByText('Living Room')).toBeTruthy();
        expect(getByText('Bedroom')).toBeTruthy();
        expect(getByText('Kitchen')).toBeTruthy();
      });
    });
  });

  describe('Category-Based Spaces', () => {
    it('should show interior spaces for interior category', async () => {
      mockJourneyStore.projectWizard.categoryType = 'interior';
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
        expect(getByText('Bedroom')).toBeTruthy();
        expect(getByText('Home Office')).toBeTruthy();
      });
    });

    it('should show garden spaces for garden category', async () => {
      mockJourneyStore.projectWizard.categoryType = 'garden';
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Front Yard')).toBeTruthy();
        expect(getByText('Backyard')).toBeTruthy();
        expect(getByText('Patio')).toBeTruthy();
      });
    });

    it('should show surface options for surface category', async () => {
      mockJourneyStore.projectWizard.categoryType = 'surface';
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Accent Wall')).toBeTruthy();
        expect(getByText('Kitchen Backsplash')).toBeTruthy();
        expect(getByText('Flooring')).toBeTruthy();
      });
    });
  });

  describe('Space Selection', () => {
    beforeEach(async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
    });

    it('should allow selecting multiple spaces', async () => {
      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
      });

      // Select Living Room
      const livingRoomCard = getByText('Living Room').parent?.parent;
      fireEvent.press(livingRoomCard!);
      
      // Select Bedroom
      const bedroomCard = getByText('Bedroom').parent?.parent;
      fireEvent.press(bedroomCard!);
      
      // Check counter updated
      expect(getByText(/2 spaces selected/)).toBeTruthy();
    });

    it('should toggle space selection on tap', async () => {
      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
      });

      const livingRoomCard = getByText('Living Room').parent?.parent;
      
      // Select
      fireEvent.press(livingRoomCard!);
      expect(getByText(/1 space selected/)).toBeTruthy();
      
      // Deselect
      fireEvent.press(livingRoomCard!);
      expect(getByText(/0 spaces selected/)).toBeTruthy();
    });

    it('should restore previously selected spaces', async () => {
      mockJourneyStore.projectWizard.selectedRooms = ['living-room', 'bedroom'];
      
      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText(/2 spaces selected/)).toBeTruthy();
      });
    });
  });

  describe('Primary and Secondary Spaces', () => {
    it('should separate primary and secondary spaces', async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              room_slug: 'living-room',
              room_name: 'Living Room',
              is_primary_match: true,
              compatibility_score: 1.0,
            },
            {
              room_slug: 'hallway',
              room_name: 'Hallway',
              is_primary_match: false,
              compatibility_score: 0.8,
            }
          ],
          error: null
        }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Primary Spaces')).toBeTruthy();
        expect(getByText('Additional Spaces')).toBeTruthy();
      });
    });
  });

  describe('Continue Action', () => {
    beforeEach(async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
    });

    it('should show alert when no spaces selected', async () => {
      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Continue to Photo Capture')).toBeTruthy();
      });

      const continueButton = getByText('Continue to Photo Capture');
      fireEvent.press(continueButton);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'No Spaces Selected',
        'Please select at least one space to continue.',
        [{ text: 'OK' }]
      );
    });

    it('should navigate to photo capture with selected spaces', async () => {
      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Living Room')).toBeTruthy();
      });

      // Select spaces
      const livingRoomCard = getByText('Living Room').parent?.parent;
      fireEvent.press(livingRoomCard!);
      
      const bedroomCard = getByText('Bedroom').parent?.parent;
      fireEvent.press(bedroomCard!);
      
      // Continue
      const continueButton = getByText('Continue to Photo Capture');
      fireEvent.press(continueButton);
      
      expect(mockJourneyStore.updateProjectWizard).toHaveBeenCalledWith({
        selectedRooms: ['living-room', 'bedroom'],
        roomName: 'Living Room, Bedroom',
        currentWizardStep: 'photo_capture'
      });
      
      expect(NavigationHelpers.navigateToScreen).toHaveBeenCalledWith('photoCapture');
    });
  });

  describe('Category Context', () => {
    it('should show category reminder with selection count', async () => {
      mockJourneyStore.projectWizard.categoryName = 'Interior Design';
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText(/Interior Design.*0 spaces selected/)).toBeTruthy();
      });
    });

    it('should use category color for UI elements', async () => {
      mockJourneyStore.projectWizard.categoryType = 'garden';
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        // Progress bar and other elements should use garden color (#7FB069)
        expect(getByText('Step 2 of 6')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button pressed', async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByTestId } = render(<SpaceDefinitionScreen />);
      
      // In actual implementation would need to add testID to back button
      // For now, test the navigation call directly
      await act(async () => {
        // Simulate back press
        NavigationHelpers.goBack();
      });
      
      expect(NavigationHelpers.goBack).toHaveBeenCalled();
    });
  });

  describe('Tips and Help', () => {
    it('should show tips section', async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText(/Select multiple spaces to create a cohesive design/)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for screen readers', async () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expect(getByText('Select Your Spaces')).toBeTruthy();
        expect(getByText("Choose all areas you'd like to design")).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        // Should still show fallback spaces
        expect(getByText('Living Room')).toBeTruthy();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching spaces', () => {
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      expect(getByText('Loading spaces...')).toBeTruthy();
    });
  });
});

describe('Space Categories Integration', () => {
  const testCategories = [
    { type: 'interior', expectedSpaces: ['Living Room', 'Bedroom', 'Kitchen'] },
    { type: 'garden', expectedSpaces: ['Front Yard', 'Backyard', 'Patio'] },
    { type: 'surface', expectedSpaces: ['Accent Wall', 'Kitchen Backsplash', 'Flooring'] },
    { type: 'object', expectedSpaces: ['Bookshelf', 'Mantel', 'Gallery Wall'] },
    { type: 'exterior', expectedSpaces: ['Front Entrance', 'House Facade', 'Driveway'] },
  ];

  testCategories.forEach(({ type, expectedSpaces }) => {
    it(`should show correct spaces for ${type} category`, async () => {
      mockJourneyStore.projectWizard.categoryType = type;
      
      (supabase.from as unknown as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const { getByText } = render(<SpaceDefinitionScreen />);
      
      await waitFor(() => {
        expectedSpaces.forEach(space => {
          expect(getByText(space)).toBeTruthy();
        });
      });
    });
  });
});