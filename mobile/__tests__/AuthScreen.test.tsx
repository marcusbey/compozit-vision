import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { jest } from '@jest/globals';

// Mock the user store
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockUseUserStore = jest.fn(() => ({
  user: null,
  isAuthenticated: false,
  login: mockLogin,
  register: mockRegister,
  logout: jest.fn(),
  isLoading: false,
  error: null,
  initializeAuth: jest.fn(),
}));

// Mock modules
jest.mock('../src/stores/userStore', () => ({
  useUserStore: mockUseUserStore,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import the app component after mocks
import FullAppWithoutNavigation from '../FullAppWithoutNavigation';

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set the store to return auth screen
    mockUseUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      isLoading: false,
      error: null,
      initializeAuth: jest.fn(),
    });
  });

  it('should render sign-in form by default', async () => {
    const { getByText, getByTestId } = render(<FullAppWithoutNavigation />);
    
    // Wait for the app to load and navigate to auth screen
    await waitFor(() => {
      // Check if we're on the auth screen by looking for the submit button
      expect(getByTestId('auth-submit-button')).toBeTruthy();
    });
    
    expect(getByText('Welcome Back!')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('should switch to sign-up mode when switch button is pressed', async () => {
    const { getByText, getByTestId } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByTestId('switch-mode-button')).toBeTruthy();
    });
    
    fireEvent.press(getByTestId('switch-mode-button'));
    
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Join thousands of users transforming their spaces with AI')).toBeTruthy();
  });

  it('should call login function when sign-in form is submitted', async () => {
    const { getByTestId } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByTestId('email-input')).toBeTruthy();
    });
    
    // Fill in the form
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    
    // Submit the form
    fireEvent.press(getByTestId('auth-submit-button'));
    
    // Check that login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should call register function when sign-up form is submitted', async () => {
    const { getByTestId } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByTestId('switch-mode-button')).toBeTruthy();
    });
    
    // Switch to register mode
    fireEvent.press(getByTestId('switch-mode-button'));
    
    // Fill in the form
    fireEvent.changeText(getByTestId('email-input'), 'newuser@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'newpassword123');
    
    // Submit the form
    fireEvent.press(getByTestId('auth-submit-button'));
    
    // Check that register was called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'newpassword123');
    });
  });

  it('should show error alert when form is submitted with empty fields', async () => {
    const { getByTestId } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByTestId('auth-submit-button')).toBeTruthy();
    });
    
    // Submit the form without filling fields
    fireEvent.press(getByTestId('auth-submit-button'));
    
    // Check that error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
    });
  });

  it('should display error message when authentication fails', async () => {
    // Mock error state
    mockUseUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      isLoading: false,
      error: 'Invalid credentials',
      initializeAuth: jest.fn(),
    });

    const { getByText } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('should show loading state when authentication is in progress', async () => {
    // Mock loading state
    mockUseUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      isLoading: true,
      error: null,
      initializeAuth: jest.fn(),
    });

    const { getByText } = render(<FullAppWithoutNavigation />);
    
    await waitFor(() => {
      expect(getByText('Processing...')).toBeTruthy();
    });
  });
});