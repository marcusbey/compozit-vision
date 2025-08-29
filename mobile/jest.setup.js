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

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'mock://image.jpg', width: 1024, height: 768 }]
  })),
  launchCameraAsync: jest.fn(() => Promise.resolve({
    canceled: false,
    assets: [{ uri: 'mock://camera.jpg', width: 1024, height: 768 }]
  })),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {
      UNDETERMINED: 0,
      FAILED: 1,
      BEGAN: 2,
      CANCELLED: 3,
      ACTIVE: 4,
      END: 5,
    },
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    WebView: View,
    DrawerLayoutAndroid: View,
    TouchableHighlight: View,
    TouchableOpacity: View,
    TouchableNativeFeedback: View,
    TouchableWithoutFeedback: View,
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((Comp) => (props) => <Comp {...props} />),
    Directions: {},
  };
});

// Mock React Navigation Stack
jest.mock('@react-navigation/stack', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
    CardStyleInterpolators: {},
    HeaderStyleInterpolators: {},
    TransitionPresets: {},
  };
});

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
}));

// Mock Stripe React Native
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  CardField: 'CardField',
  useStripe: () => ({
    initPaymentSheet: jest.fn(() => Promise.resolve()),
    presentPaymentSheet: jest.fn(() => Promise.resolve()),
    confirmPayment: jest.fn(() => Promise.resolve({ error: null })),
    createPaymentMethod: jest.fn(() => Promise.resolve({ error: null })),
  }),
  usePaymentSheet: () => ({
    initPaymentSheet: jest.fn(() => Promise.resolve()),
    presentPaymentSheet: jest.fn(() => Promise.resolve()),
    loading: false,
  }),
}));

// Mock Supabase
jest.mock('../src/services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

// Mock React Native URL Polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

// Mock AI Processing Service
jest.mock('../src/services/aiProcessing', () => ({
  AIProcessingService: {
    generateDesign: jest.fn(() => Promise.resolve({
      designId: 'test-design-123',
      generatedImage: 'mock://generated-image.jpg',
      style: 'modern',
      confidence: 0.95,
    })),
    processImage: jest.fn(() => Promise.resolve({
      processedUrl: 'mock://processed-image.jpg',
      metadata: { width: 1024, height: 768 },
    })),
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: jest.fn(() => true),
      isFocused: jest.fn(() => true),
    }),
    useRoute: () => ({
      params: {},
      key: 'test-key',
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: jest.fn(() => true),
    NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Performance API
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

// Mock Image constructor
global.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock console methods for tests
global.console = {
  ...console,
  // Uncomment to suppress console messages in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup fake timers
beforeEach(() => {
  jest.clearAllTimers();
});

// Increase timeout for async tests
jest.setTimeout(10000);