# Compozit Vision Mobile App

React Native mobile application for AI-powered interior design.

## Prerequisites

- Node.js (v18+)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio & Android Emulator (for Android development)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── domain/              # Core business logic
│   ├── entities/        # Business entities
│   ├── services/        # Domain services
│   └── interfaces/      # Domain interfaces
├── application/         # Use cases & application logic
│   ├── use-cases/       # Business use cases
│   └── dto/            # Data transfer objects
├── infrastructure/      # External integrations
│   ├── api/            # API clients
│   └── storage/        # Local storage
├── presentation/        # UI components & screens
│   ├── screens/        # App screens
│   ├── components/     # Reusable components
│   └── hooks/          # Custom hooks
├── navigation/          # App navigation
├── constants/          # App constants & theme
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Features

- 📸 Camera integration for room photos
- 🎨 AI design generation (coming soon)
- 📱 Native iOS & Android support
- 🧭 Tab-based navigation
- 🎯 TypeScript for type safety
- 📐 Clean architecture principles

## Development

### Running the App

```bash
# Start Expo development server
npm run dev

# Open iOS simulator
npm run ios

# Open Android emulator
npm run android

# Open in web browser
npm run web
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Building

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Permissions

The app requires the following permissions:

- **Camera**: To capture room photos for AI processing
- **Photo Library**: To use existing photos from gallery
- **Storage**: To save and cache images locally

## Configuration

Key configuration files:

- `app.json` - Expo app configuration
- `tsconfig.json` - TypeScript configuration
- `babel.config.js` - Babel configuration with absolute imports
- `metro.config.js` - Metro bundler configuration

## Navigation Structure

```
Main Stack
├── Main Tabs
│   ├── Home
│   ├── Projects
│   ├── Gallery
│   └── Profile
├── Camera (Modal)
├── Project Detail
└── Settings
```

## Architecture

This app follows Clean Architecture principles:

1. **Presentation Layer**: UI components and screens
2. **Application Layer**: Use cases and business logic
3. **Domain Layer**: Core business entities and rules
4. **Infrastructure Layer**: External services and APIs

## Next Steps

- [ ] Implement state management (Redux/Zustand)
- [ ] Add testing setup (Jest + React Native Testing Library)
- [ ] Configure ESLint and Prettier
- [ ] Add error boundary components
- [ ] Implement offline support
- [ ] Add analytics integration

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Try clearing cache with `npx expo start -c`
2. **iOS simulator not opening**: Make sure Xcode and iOS Simulator are installed
3. **Android build issues**: Ensure Android SDK and emulator are properly configured
4. **Type errors**: Run `npm run type-check` to identify TypeScript issues

### Dependencies

Core dependencies:

- React Navigation 7.x for navigation
- Expo SDK 53.x for native functionality
- TypeScript for type safety
- React Native Reanimated for animations
- Expo Camera for camera functionality

For the complete list, see `package.json`.
