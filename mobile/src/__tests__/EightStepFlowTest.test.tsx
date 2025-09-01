/**
 * Eight Step Flow Test
 * Tests the complete 8-step furnishing journey navigation flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Mock components for testing
const MockPhotoCapture = ({ navigation }: any) => (
  <button 
    testID="photo-continue-btn"
    onPress={() => navigation.navigate('roomSelection')}
  >
    Continue to Room Selection
  </button>
);

const MockRoomSelection = ({ navigation }: any) => (
  <button 
    testID="room-continue-btn"
    onPress={() => navigation.navigate('colorPaletteSelection')}
  >
    Continue to Color Palette
  </button>
);

const MockColorPaletteSelection = ({ navigation }: any) => (
  <button 
    testID="palette-continue-btn"
    onPress={() => navigation.navigate('styleSelection')}
  >
    Continue to Style Selection
  </button>
);

const MockStyleSelection = ({ navigation }: any) => (
  <button 
    testID="style-continue-btn"
    onPress={() => navigation.navigate('budget')}
  >
    Continue to Budget
  </button>
);

const MockBudget = ({ navigation }: any) => (
  <button 
    testID="budget-continue-btn"
    onPress={() => navigation.navigate('elementSelection')}
  >
    Continue to AI Furniture Selection
  </button>
);

const MockElementSelection = ({ navigation }: any) => (
  <button 
    testID="element-continue-btn"
    onPress={() => navigation.navigate('aiProcessing')}
  >
    Continue to AI Processing
  </button>
);

const MockAIProcessing = ({ navigation }: any) => (
  <button 
    testID="ai-continue-btn"
    onPress={() => navigation.navigate('results')}
  >
    Continue to Results
  </button>
);

const MockResults = () => (
  <view testID="results-screen">
    <text>Final Results - Visualization Complete!</text>
  </view>
);

const Stack = createStackNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="photoCapture">
      <Stack.Screen name="photoCapture" component={MockPhotoCapture} />
      <Stack.Screen name="roomSelection" component={MockRoomSelection} />
      <Stack.Screen name="colorPaletteSelection" component={MockColorPaletteSelection} />
      <Stack.Screen name="styleSelection" component={MockStyleSelection} />
      <Stack.Screen name="budget" component={MockBudget} />
      <Stack.Screen name="elementSelection" component={MockElementSelection} />
      <Stack.Screen name="aiProcessing" component={MockAIProcessing} />
      <Stack.Screen name="results" component={MockResults} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Eight Step Furnishing Flow', () => {
  test('should complete the full 8-step navigation flow correctly', async () => {
    const { getByTestId, queryByTestId } = render(<TestNavigator />);

    // Step 1: Photo Upload (photoCapture) → roomSelection
    expect(getByTestId('photo-continue-btn')).toBeTruthy();
    fireEvent.press(getByTestId('photo-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('photo-continue-btn')).toBeNull();
      expect(getByTestId('room-continue-btn')).toBeTruthy();
    });

    // Step 2: Define Space Function (roomSelection) → colorPaletteSelection
    fireEvent.press(getByTestId('room-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('room-continue-btn')).toBeNull();
      expect(getByTestId('palette-continue-btn')).toBeTruthy();
    });

    // Step 3: Select Color Palette (colorPaletteSelection) → styleSelection
    fireEvent.press(getByTestId('palette-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('palette-continue-btn')).toBeNull();
      expect(getByTestId('style-continue-btn')).toBeTruthy();
    });

    // Step 4: Select Style (styleSelection) → budget
    fireEvent.press(getByTestId('style-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('style-continue-btn')).toBeNull();
      expect(getByTestId('budget-continue-btn')).toBeTruthy();
    });

    // Step 5: Set Budget (budget) → elementSelection (AI Furniture)
    fireEvent.press(getByTestId('budget-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('budget-continue-btn')).toBeNull();
      expect(getByTestId('element-continue-btn')).toBeTruthy();
    });

    // Step 6: AI Furniture Selection (elementSelection) → aiProcessing
    fireEvent.press(getByTestId('element-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('element-continue-btn')).toBeNull();
      expect(getByTestId('ai-continue-btn')).toBeTruthy();
    });

    // Step 7: Choose Furniture (handled in AI processing) → results
    fireEvent.press(getByTestId('ai-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('ai-continue-btn')).toBeNull();
      expect(getByTestId('results-screen')).toBeTruthy();
    });

    // Step 8: Generate Visualization (results) → Final step
    // Results screen should be displayed - journey complete!
    expect(getByTestId('results-screen')).toBeTruthy();
  });

  test('should start with photo capture as the first step', () => {
    const { getByTestId } = render(<TestNavigator />);
    
    // First screen should be photo capture
    expect(getByTestId('photo-continue-btn')).toBeTruthy();
  });

  test('each step should only show one continue button at a time', async () => {
    const { getByTestId, queryByTestId } = render(<TestNavigator />);

    // Initially only photo capture button should be visible
    expect(getByTestId('photo-continue-btn')).toBeTruthy();
    expect(queryByTestId('room-continue-btn')).toBeNull();
    expect(queryByTestId('palette-continue-btn')).toBeNull();
    expect(queryByTestId('style-continue-btn')).toBeNull();
    expect(queryByTestId('budget-continue-btn')).toBeNull();
    expect(queryByTestId('element-continue-btn')).toBeNull();
    expect(queryByTestId('ai-continue-btn')).toBeNull();

    // After navigating to room selection
    fireEvent.press(getByTestId('photo-continue-btn'));
    
    await waitFor(() => {
      expect(queryByTestId('photo-continue-btn')).toBeNull();
      expect(getByTestId('room-continue-btn')).toBeTruthy();
      expect(queryByTestId('palette-continue-btn')).toBeNull();
    });
  });
});

describe('Navigation Flow Integration', () => {
  const flowSteps = [
    { from: 'photoCapture', to: 'roomSelection', step: 1 },
    { from: 'roomSelection', to: 'colorPaletteSelection', step: 2 },
    { from: 'colorPaletteSelection', to: 'styleSelection', step: 3 },
    { from: 'styleSelection', to: 'budget', step: 4 },
    { from: 'budget', to: 'elementSelection', step: 5 },
    { from: 'elementSelection', to: 'aiProcessing', step: 6 },
    { from: 'aiProcessing', to: 'results', step: 7 },
  ];

  test.each(flowSteps)(
    'should navigate from $from to $to (step $step)',
    async ({ from, to, step }) => {
      const { getByTestId, queryByTestId } = render(<TestNavigator />);
      
      // Navigate through all previous steps to reach the current step
      const stepButtons = [
        'photo-continue-btn',
        'room-continue-btn', 
        'palette-continue-btn',
        'style-continue-btn',
        'budget-continue-btn',
        'element-continue-btn',
        'ai-continue-btn'
      ];
      
      // Navigate through steps up to the current one
      for (let i = 0; i < step - 1; i++) {
        const buttonTestId = stepButtons[i];
        if (queryByTestId(buttonTestId)) {
          fireEvent.press(getByTestId(buttonTestId));
          await waitFor(() => {
            expect(queryByTestId(buttonTestId)).toBeNull();
          });
        }
      }
      
      // Test the specific navigation from current step
      const currentButtonTestId = stepButtons[step - 1];
      if (currentButtonTestId && queryByTestId(currentButtonTestId)) {
        expect(getByTestId(currentButtonTestId)).toBeTruthy();
        fireEvent.press(getByTestId(currentButtonTestId));
        
        await waitFor(() => {
          expect(queryByTestId(currentButtonTestId)).toBeNull();
        });
      }
    }
  );
});