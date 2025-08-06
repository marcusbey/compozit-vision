# Compozit Vision Mobile Design System

A comprehensive, mobile-first design system built for React Native with TypeScript support, complete theming capabilities, responsive design utilities, and accessibility features.

## 🚀 Quick Start

```bash
# The design system is built into the mobile app
# Import components directly from the src directory

import { 
  ThemeProvider, 
  Button, 
  Text, 
  Card, 
  Container 
} from './src';
```

## 📁 Project Structure

```
src/
├── components/          # UI Component library
│   ├── base/           # Base components (Text, Button, Icon, etc.)
│   ├── forms/          # Form components (Input, TextArea, etc.)
│   ├── layout/         # Layout components (Container, Box, etc.)
│   └── __tests__/      # Component tests
├── theme/              # Theme system
│   ├── colors.ts       # Color palette
│   ├── typography.ts   # Typography scale
│   ├── spacing.ts      # Spacing, shadows, borders
│   ├── theme.ts        # Main theme configuration
│   └── ThemeProvider.tsx # Theme context provider
├── styles/             # Style utilities
│   ├── responsive.ts   # Responsive design utilities
│   └── animations.ts   # Animation system
├── types/              # TypeScript type definitions
├── docs/               # Documentation
└── index.ts            # Main entry point
```

## 🎨 Design System Features

### ✅ Complete Component Library
- **Base Components**: Text, Button, Card, Icon, AnimatedBox
- **Form Components**: Input, TextArea with validation
- **Layout Components**: Container, Box, Stack, Inline
- **Responsive Utilities**: Screen detection, breakpoints, scaling

### ✅ Comprehensive Theme System
- **Colors**: Primary, secondary, accent, semantic colors
- **Typography**: 14 typography variants with proper scaling
- **Spacing**: 8px grid system with utility props
- **Dark Mode**: Full light/dark theme support

### ✅ Mobile-First Design
- **Touch Targets**: Minimum 44px touch targets
- **Safe Areas**: Built-in safe area support
- **Responsive**: Adaptive layouts for phones and tablets
- **Performance**: Optimized animations with native driver

### ✅ Developer Experience
- **TypeScript**: Fully typed with IntelliSense support
- **Accessibility**: WCAG compliant with screen reader support
- **Animation**: Built-in animation system with presets
- **Documentation**: Comprehensive docs and examples

## 🛠 Installation & Setup

1. **Wrap your app with ThemeProvider**:
```tsx
import { ThemeProvider } from './src';

export default function App() {
  return (
    <ThemeProvider followSystemTheme={true}>
      <YourApp />
    </ThemeProvider>
  );
}
```

2. **Use components in your screens**:
```tsx
import { 
  Container, 
  Heading1, 
  Button, 
  Card, 
  Stack 
} from './src';

function MyScreen() {
  return (
    <Container safeArea>
      <Stack space={4}>
        <Heading1 color="primary">Hello World</Heading1>
        <Card variant="elevated">
          <Text>Welcome to Compozit Vision!</Text>
        </Card>
        <Button variant="solid" color="primary">
          Get Started
        </Button>
      </Stack>
    </Container>
  );
}
```

## 🎯 Core Components

### Theme System
```tsx
import { useTheme, useColors } from './src';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useColors();
  
  return (
    <View style={{ backgroundColor: colors.primary }}>
      <Text style={theme.typography.h1}>Hello</Text>
    </View>
  );
}
```

### Typography
```tsx
<Text variant="h1">Large Heading</Text>
<Text variant="body" color="textSecondary">Body text</Text>
<Text variant="caption" align="center">Small caption</Text>
```

### Buttons
```tsx
<Button variant="solid" color="primary" size="lg">Primary</Button>
<Button variant="outline" leftIcon={<Icon name="plus" />}>Add Item</Button>
<Button loading disabled>Loading...</Button>
```

### Layout
```tsx
<Container safeArea scrollable>
  <Stack space={4}>
    <HBox justifyContent="space-between">
      <Text>Left</Text>
      <Text>Right</Text>
    </HBox>
    <Box p={4} backgroundColor="surface" borderRadius="lg">
      <Text>Padded content</Text>
    </Box>
  </Stack>
</Container>
```

### Forms
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  leftIcon={<Icon name="user" />}
  error={hasError}
  errorText="Email is required"
  required
/>
```

### Animations
```tsx
<AnimatedBox
  animationType="fade"
  visible={isVisible}
  entrance
  animationDuration="normal"
>
  <Card>
    <Text>Animated content</Text>
  </Card>
</AnimatedBox>
```

## 📱 Responsive Design

The design system includes comprehensive responsive utilities:

```tsx
import { responsive } from './src/styles';

// Device detection
if (responsive.deviceTypes.isTablet) {
  // Tablet layout
}

// Responsive values
const fontSize = responsive.getResponsiveValue({
  xs: 14,
  md: 16,
  lg: 18
});

// Screen utilities
const width = responsive.wp(80); // 80% width
const scaledSize = responsive.scale(16); // Scaled size
```

## 🎬 Animation System

Built-in animations with performance optimization:

```tsx
import { animations } from './src/styles';

// Predefined animations
<FadeBox visible={show} entrance>Content</FadeBox>
<ScaleBox trigger={animate}>Button</ScaleBox>
<SlideUpBox entrance>Modal</SlideUpBox>

// Custom animations
const fadeAnim = animations.createFadeAnimation(
  animatedValue, 
  1, 
  animations.durations.normal
);
```

## ♿ Accessibility

All components include accessibility support:

```tsx
<Button
  accessible={true}
  accessibilityLabel="Save project"
  accessibilityHint="Saves your current project"
  accessibilityRole="button"
  testID="save-button"
>
  Save
</Button>
```

## 🧪 Testing

Run the comprehensive design system test:

```tsx
import { DesignSystemTest } from './src';

// Use this component to test all design system features
<DesignSystemTest />
```

## 📚 Documentation

- [Design System Guide](./src/docs/DESIGN_SYSTEM.md) - Complete usage guide
- [Component API Reference](./src/docs/COMPONENT_API.md) - Detailed API docs
- [Theme Configuration](./src/theme/README.md) - Theme customization
- [Animation System](./src/styles/animations.ts) - Animation utilities

## 🎨 Theme Customization

Customize the theme by modifying theme files:

```tsx
// src/theme/colors.ts - Modify color palette
export const colors = {
  primary: {
    500: '#your-color', // Change primary color
    // ...
  },
  // ...
};

// src/theme/typography.ts - Modify typography
export const typography = {
  h1: {
    fontSize: yourFontSize,
    fontWeight: yourFontWeight,
    // ...
  },
  // ...
};
```

## 📋 Component Checklist

### ✅ Completed Components
- [x] Text with 14 typography variants
- [x] Button with 4 variants, 5 sizes, loading states
- [x] Card with 3 variants, interactive support
- [x] Icon system with built-in icons
- [x] Input with validation, error states
- [x] Container with safe area support
- [x] Box with utility props
- [x] Layout helpers (Stack, Inline, HBox, VBox)
- [x] AnimatedBox with 5 animation types
- [x] Theme system with light/dark modes
- [x] Responsive utilities
- [x] Animation system
- [x] TypeScript definitions
- [x] Accessibility support
- [x] Comprehensive documentation

### 🔄 Ready for Extension
- [ ] Additional form components (Checkbox, Radio, Select)
- [ ] Navigation components (TabBar, Header)
- [ ] Feedback components (Toast, Alert, Modal)
- [ ] Data display components (List, Table, Badge)
- [ ] Advanced animations and gestures

## 🚀 Performance

- **Native Driver**: All animations use native driver when possible
- **Memoization**: Components are optimized with React.memo
- **Bundle Size**: Tree-shakeable imports
- **Accessibility**: Screen reader optimized

## 📄 License

This design system is part of the Compozit Vision project.

---

## 💡 Example Usage

See `App.example.tsx` for a complete example of integrating the design system into your React Native app.

The design system provides everything you need to build consistent, accessible, and beautiful mobile interfaces for the Compozit Vision interior design app!