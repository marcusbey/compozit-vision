import '@testing-library/jest-native/extend-expect';

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  AntDesign: 'AntDesign',
  Feather: 'Feather',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  },
  CameraType: { back: 'back', front: 'front' },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
}));

// Mock Stripe
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  useStripe: () => ({
    confirmPayment: jest.fn(() => Promise.resolve({ error: null })),
  }),
}));

// Mock React Native URL Polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  memory: {
    usedJSHeapSize: 10000000,
    totalJSHeapSize: 50000000,
    jsHeapSizeLimit: 100000000,
  },
};

jest.setTimeout(10000);