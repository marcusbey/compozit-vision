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
├── screens/           # App screens organized by feature
│   ├── 01-auth/       # Authentication screens
│   ├── 02-onboarding/ # Onboarding flow
│   ├── 03-payment/    # Payment and subscription
│   ├── 04-project-wizard/ # Project creation wizard
│   ├── 05-content-selection/ # Style and content selection
│   ├── 06-results/    # AI processing results
│   └── 07-dashboard/  # User dashboard screens
├── components/        # Reusable UI components
├── navigation/        # App navigation logic
├── services/          # Business services (AI, database, etc.)
├── stores/           # State management (Zustand)
├── infrastructure/    # External integrations (Auth, Supabase)
├── assets/           # Images, icons, and static files
│   ├── illustrations/ # SVG illustrations
│   └── test-images/  # Test and development images
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── hooks/            # Custom React hooks
└── theme/            # Design tokens and styling
```

## Documentation

All documentation has been organized in the `@DOCS/` folder:

- **Guides**: Setup and implementation guides
- **Development**: PRDs, workflows, and development specs  
- **Analysis**: Issue resolution summaries and analysis
- **API**: Component and API documentation
- **Testing**: Testing procedures and documentation

See `@DOCS/README.md` for complete documentation structure.

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
