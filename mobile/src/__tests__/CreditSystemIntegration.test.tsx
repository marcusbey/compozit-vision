/**
 * Credit System Integration Tests
 * Tests the complete credit system integration with AI processing
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../stores/userStore';
import { spaceAnalysisService } from '../services/spaceAnalysis';
import ProcessingScreen from '../screens/Processing/ProcessingScreen';
import BuyCreditsScreen from '../screens/BuyCredits/BuyCreditsScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

jest.mock('../services/spaceAnalysis');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSpaceAnalysisService = spaceAnalysisService as jest.Mocked<typeof spaceAnalysisService>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
};

describe('Credit System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ProcessingScreen Credit Integration', () => {
    
    const mockRouteParams = {
      projectName: 'Test Project',
      roomType: 'livingRoom',
      selectedStyle: 'modern',
      budgetRange: [1000, 5000],
      selectedItems: ['sofa', 'coffee-table'],
      capturedImage: 'data:image/jpeg;base64,test',
    };

    test('should redirect to BuyCredits when user has no credits', async () => {
      // Mock user with no credits
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 0,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(
        <ProcessingScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('BuyCredits', {
          returnScreen: 'Processing',
          returnParams: mockRouteParams,
        });
      });
    });

    test('should process normally when user has credits', async () => {
      // Mock user with credits
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 3,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Mock successful token consumption
      const mockConsumeToken = jest.fn().mockResolvedValue(true);
      userState.consumeToken = mockConsumeToken;

      const { getByText } = render(
        <ProcessingScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      // Wait for processing to complete
      await waitFor(() => {
        expect(mockConsumeToken).toHaveBeenCalled();
      }, { timeout: 15000 });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('results', expect.any(Object));
    });

    test('should redirect to BuyCredits when token consumption fails', async () => {
      // Mock user with credits but failed consumption
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 1,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Mock failed token consumption
      const mockConsumeToken = jest.fn().mockResolvedValue(false);
      userState.consumeToken = mockConsumeToken;

      render(
        <ProcessingScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('BuyCredits', {
          returnScreen: 'Processing',
          returnParams: mockRouteParams,
        });
      });
    });

  });

  describe('BuyCreditsScreen Integration', () => {
    
    const mockRouteParams = {
      returnScreen: 'Processing',
      returnParams: {
        projectName: 'Test Project',
        roomType: 'livingRoom',
      },
    };

    test('should display credit packs and handle purchase', async () => {
      // Mock user
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 0,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockUpdateUserTokens = jest.fn().mockResolvedValue(undefined);
      userState.updateUserTokens = mockUpdateUserTokens;

      const { getByText } = render(
        <BuyCreditsScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      // Check if credit packs are displayed
      expect(getByText('25 credits')).toBeTruthy();
      expect(getByText('50 credits')).toBeTruthy();
      expect(getByText('100 credits')).toBeTruthy();

      // Select a pack
      fireEvent.press(getByText('25 credits'));

      // Simulate successful payment confirmation
      fireEvent.press(getByText('I paid (credit my account)'));

      await waitFor(() => {
        expect(mockUpdateUserTokens).toHaveBeenCalledWith(25);
        expect(mockNavigation.replace).toHaveBeenCalledWith('Processing', mockRouteParams.returnParams);
      });
    });

    test('should handle payment errors gracefully', async () => {
      // Mock user
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 0,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockUpdateUserTokens = jest.fn().mockRejectedValue(new Error('Payment failed'));
      userState.updateUserTokens = mockUpdateUserTokens;

      const { getByText } = render(
        <BuyCreditsScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      // Select a pack and attempt payment
      fireEvent.press(getByText('25 credits'));
      fireEvent.press(getByText('I paid (credit my account)'));

      await waitFor(() => {
        expect(mockUpdateUserTokens).toHaveBeenCalled();
      });

      // Should not navigate away on error
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });

  });

  describe('SpaceAnalysisService Credit Integration', () => {
    
    test('should check credits before processing', async () => {
      const mockCheckCreditsAvailable = jest.fn().mockResolvedValue(true);
      const mockConsumeCredit = jest.fn().mockResolvedValue(true);
      
      mockSpaceAnalysisService.checkCreditsAvailable = mockCheckCreditsAvailable;
      mockSpaceAnalysisService.consumeCredit = mockConsumeCredit;
      mockSpaceAnalysisService.generateEnhancedDesign = jest.fn().mockResolvedValue({
        designId: 'test-design-123',
        enhancedImageUrl: 'https://example.com/enhanced.jpg',
        processingTime: 45,
        status: 'completed',
      });

      const mockRequest = {
        imageUri: 'https://example.com/image.jpg',
        spaceAnalysis: {
          roomType: 'livingRoom',
          confidence: 0.95,
          spaceCharacteristics: {},
          detectedObjects: [],
          suggestions: { styles: ['modern'] },
        },
        selectedStyles: ['modern'],
        selectedAmbiance: 'cozy',
        selectedFurniture: [],
        enhancementLevel: 'high' as const,
        outputFormat: 'high_resolution' as const,
      };

      const result = await spaceAnalysisService.generateEnhancedDesign(mockRequest, true);

      expect(mockCheckCreditsAvailable).toHaveBeenCalled();
      expect(mockConsumeCredit).toHaveBeenCalled();
      expect(result).toMatchObject({
        designId: 'test-design-123',
        status: 'completed',
      });
    });

    test('should throw error when insufficient credits', async () => {
      const mockCheckCreditsAvailable = jest.fn().mockResolvedValue(false);
      mockSpaceAnalysisService.checkCreditsAvailable = mockCheckCreditsAvailable;

      const mockRequest = {
        imageUri: 'https://example.com/image.jpg',
        spaceAnalysis: {
          roomType: 'livingRoom',
          confidence: 0.95,
          spaceCharacteristics: {},
          detectedObjects: [],
          suggestions: { styles: ['modern'] },
        },
        selectedStyles: ['modern'],
        selectedAmbiance: 'cozy',
        selectedFurniture: [],
        enhancementLevel: 'high' as const,
        outputFormat: 'high_resolution' as const,
      };

      await expect(
        spaceAnalysisService.generateEnhancedDesign(mockRequest, true)
      ).rejects.toThrow('Insufficient credits');

      expect(mockCheckCreditsAvailable).toHaveBeenCalled();
    });

    test('should skip credit checking when disabled', async () => {
      const mockCheckCreditsAvailable = jest.fn();
      const mockConsumeCredit = jest.fn();
      
      mockSpaceAnalysisService.checkCreditsAvailable = mockCheckCreditsAvailable;
      mockSpaceAnalysisService.consumeCredit = mockConsumeCredit;
      mockSpaceAnalysisService.generateEnhancedDesign = jest.fn().mockResolvedValue({
        designId: 'test-design-123',
        status: 'completed',
      });

      const mockRequest = {
        imageUri: 'https://example.com/image.jpg',
        spaceAnalysis: {
          roomType: 'livingRoom',
          confidence: 0.95,
          spaceCharacteristics: {},
          detectedObjects: [],
          suggestions: { styles: ['modern'] },
        },
        selectedStyles: ['modern'],
        selectedAmbiance: 'cozy',
        selectedFurniture: [],
        enhancementLevel: 'high' as const,
        outputFormat: 'high_resolution' as const,
      };

      await spaceAnalysisService.generateEnhancedDesign(mockRequest, false);

      expect(mockCheckCreditsAvailable).not.toHaveBeenCalled();
      expect(mockConsumeCredit).not.toHaveBeenCalled();
    });

  });

  describe('User Store Credit Management', () => {
    
    test('should update user credits correctly', async () => {
      const userState = useUserStore.getState();
      
      // Set initial user
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 10,
        currentPlan: 'pro',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(userState.user?.nbToken).toBe(10);

      // Consume credits
      userState.consumeTokens(3);

      expect(userState.user?.nbToken).toBe(7);

      // Add credits
      await act(async () => {
        await userState.updateUserTokens(15);
      });

      expect(userState.user?.nbToken).toBe(15);
    });

    test('should handle insufficient credits', () => {
      const userState = useUserStore.getState();
      
      // Set user with limited credits
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 2,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Try to consume more credits than available
      userState.consumeTokens(5);

      // Should show error and not change credits
      expect(userState.error).toBe('Tokens insuffisants');
      expect(userState.user?.nbToken).toBe(2);
    });

  });

  describe('End-to-End Credit Flow', () => {
    
    test('should complete full credit flow from processing to purchase', async () => {
      // Start with no credits
      const userState = useUserStore.getState();
      userState.setUser({
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        nbToken: 0,
        currentPlan: 'free',
        avatarUrl: null,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockRouteParams = {
        projectName: 'Test Project',
        roomType: 'livingRoom',
        selectedStyle: 'modern',
        budgetRange: [1000, 5000],
        selectedItems: ['sofa'],
        capturedImage: 'data:image/jpeg;base64,test',
      };

      // 1. Processing screen should redirect to BuyCredits
      render(
        <ProcessingScreen 
          navigation={mockNavigation} 
          route={{ params: mockRouteParams }} 
        />
      );

      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('BuyCredits', {
          returnScreen: 'Processing',
          returnParams: mockRouteParams,
        });
      });

      // 2. Purchase credits
      const mockUpdateUserTokens = jest.fn().mockResolvedValue(undefined);
      userState.updateUserTokens = mockUpdateUserTokens;

      const { getByText } = render(
        <BuyCreditsScreen 
          navigation={mockNavigation} 
          route={{ 
            params: {
              returnScreen: 'Processing',
              returnParams: mockRouteParams,
            }
          }} 
        />
      );

      fireEvent.press(getByText('25 credits'));
      fireEvent.press(getByText('I paid (credit my account)'));

      await waitFor(() => {
        expect(mockUpdateUserTokens).toHaveBeenCalledWith(25);
      });

      console.log('✅ Full credit flow test completed');
    });

  });

});

describe('Credit System Error Handling', () => {
  
  test('should handle database errors gracefully', async () => {
    // Mock database error
    const mockCheckCreditsAvailable = jest.fn().mockRejectedValue(new Error('Database connection failed'));
    mockSpaceAnalysisService.checkCreditsAvailable = mockCheckCreditsAvailable;

    const mockRequest = {
      imageUri: 'https://example.com/image.jpg',
      spaceAnalysis: {
        roomType: 'livingRoom',
        confidence: 0.95,
        spaceCharacteristics: {},
        detectedObjects: [],
        suggestions: { styles: ['modern'] },
      },
      selectedStyles: ['modern'],
      selectedAmbiance: 'cozy',
      selectedFurniture: [],
      enhancementLevel: 'high' as const,
      outputFormat: 'high_resolution' as const,
    };

    await expect(
      spaceAnalysisService.generateEnhancedDesign(mockRequest, true)
    ).rejects.toThrow('Database connection failed');
  });

  test('should handle network errors during credit consumption', async () => {
    const mockConsumeCredit = jest.fn().mockResolvedValue(false);
    mockSpaceAnalysisService.checkCreditsAvailable = jest.fn().mockResolvedValue(true);
    mockSpaceAnalysisService.consumeCredit = mockConsumeCredit;
    
    // Mock successful API call but failed credit consumption
    mockSpaceAnalysisService.generateEnhancedDesign = jest.fn().mockImplementation(async (request, consumeCredits) => {
      if (consumeCredits) {
        const creditsAvailable = await mockSpaceAnalysisService.checkCreditsAvailable();
        if (!creditsAvailable) {
          throw new Error('Insufficient credits');
        }
      }

      // Simulate successful API response
      const result = {
        designId: 'test-design-123',
        status: 'completed',
      };

      // Try to consume credit but fail
      if (consumeCredits) {
        const creditConsumed = await mockSpaceAnalysisService.consumeCredit();
        if (!creditConsumed) {
          // This would be a race condition or network error
          console.warn('Generation succeeded but credit consumption failed');
        }
      }

      return result;
    });

    const mockRequest = {
      imageUri: 'https://example.com/image.jpg',
      spaceAnalysis: {
        roomType: 'livingRoom',
        confidence: 0.95,
        spaceCharacteristics: {},
        detectedObjects: [],
        suggestions: { styles: ['modern'] },
      },
      selectedStyles: ['modern'],
      selectedAmbiance: 'cozy',
      selectedFurniture: [],
      enhancementLevel: 'high' as const,
      outputFormat: 'high_resolution' as const,
    };

    const result = await spaceAnalysisService.generateEnhancedDesign(mockRequest, true);
    
    expect(result).toMatchObject({
      designId: 'test-design-123',
      status: 'completed',
    });
    expect(mockConsumeCredit).toHaveBeenCalled();
  });

});