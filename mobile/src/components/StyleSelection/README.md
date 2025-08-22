# Style Selection Components

Professional-grade React Native components for style reference selection with enhanced UX and accessibility.

## Components

### StyleGrid

A responsive, accessible grid component for displaying and selecting style references with infinite scroll and multi-selection support.

#### Features

- **2x4 Visual Grid**: Dynamic grid layout with 2/8 maximum selections
- **Professional Images**: High-quality style references from Unsplash
- **Infinite Scroll**: Paginated loading with smooth animations
- **Multi-Selection**: Support for selecting up to 2 styles simultaneously
- **Responsive Design**: Adaptive layout for all device sizes
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Haptic Feedback**: iOS haptic feedback for selection actions
- **Offline Support**: Caches loaded styles for better performance

#### Props

```typescript
interface StyleGridProps {
  roomType?: RoomType;                    // Filter styles by room type
  onSelectionChange: (selectedStyles: StyleReference[]) => void;
  maxSelections?: number;                 // Default: 2
  initialSelectedIds?: string[];          // Pre-selected style IDs
  refreshTrigger?: number;               // Trigger refresh
}
```

#### Usage

```tsx
import { StyleGrid } from '../../components/StyleSelection';

<StyleGrid
  roomType="living_room"
  onSelectionChange={handleStyleSelection}
  maxSelections={2}
  initialSelectedIds={['modern-1', 'minimalist-2']}
/>
```

### StyleSelectionHeader

A responsive header component with progress tracking and selection status.

#### Features

- **Progress Bar**: Visual progress indicator with step tracking
- **Selection Counter**: Real-time selection count display
- **Room Type Display**: Shows selected room type and project name
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: WCAG compliant with proper ARIA labels

#### Props

```typescript
interface StyleSelectionHeaderProps {
  onBack: () => void;
  roomType?: RoomType;
  projectName?: string;
  selectedCount?: number;
  maxSelections?: number;
  showProgressBar?: boolean;
  currentStep?: number;
  totalSteps?: number;
}
```

### AmbianceGrid

A component for selecting ambiance/mood options with visual references.

#### Features

- **6 Mood Options**: Predefined ambiance choices with descriptions
- **Visual References**: High-quality mood imagery
- **Single Selection**: One ambiance selection allowed
- **Animated Feedback**: Smooth selection animations
- **Accessibility**: Full screen reader support
- **Responsive Layout**: 2-column grid adapting to screen size

#### Props

```typescript
interface AmbianceGridProps {
  styleId?: string;                       // Filter ambiance by style
  onSelectionChange: (selectedAmbiance: AmbianceOption | null) => void;
  initialSelectedId?: string;             // Pre-selected ambiance ID
}
```

## Architecture

### Clean Architecture Compliance

The components follow clean architecture principles:

1. **Presentation Layer**: Pure UI components with no business logic
2. **Dependency Injection**: Services injected via props/context
3. **Single Responsibility**: Each component has one clear purpose
4. **Interface Segregation**: Minimal, focused prop interfaces

### State Management

- **Local State**: Component-level state for UI interactions
- **Parent Coordination**: Selection state managed by parent screen
- **Service Integration**: Uses SpaceAnalysisService for data loading

### Performance Optimizations

- **Memoization**: React.memo and useMemo for expensive calculations
- **Lazy Loading**: Images loaded on-demand with placeholders
- **Virtualization**: Efficient scrolling for large datasets
- **60 FPS Animations**: Hardware-accelerated transitions

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Screen Reader Support**: Full VoiceOver/TalkBack compatibility
- **Keyboard Navigation**: Focus management and tab order
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Touch Targets**: 44x44pt minimum touch target size
- **Semantic Markup**: Proper ARIA roles and labels

### Implementation

```tsx
// Accessibility utility usage
import { createStyleItemAccessibility } from '../../utils/accessibility';

const accessibilityProps = createStyleItemAccessibility(
  style.name,
  isSelected,
  index,
  totalItems
);

<TouchableOpacity {...accessibilityProps}>
  {/* Component content */}
</TouchableOpacity>
```

## Responsive Design

### Breakpoints

- **Small devices**: < 375px width (2 columns, 16px padding)
- **Medium devices**: 375-768px width (2 columns, 20px padding)
- **Large devices**: ≥ 768px width (3-4 columns, 25-30px padding)

### Usage

```tsx
import { useResponsiveDesign } from '../../hooks/useResponsiveDesign';

const { gridColumns, itemSpacing, containerPadding } = useResponsiveDesign();
```

## Animation System

### Spring Animations

- **Selection feedback**: Scale animation on touch
- **State transitions**: Smooth property changes
- **Enter/exit**: Staggered item animations

### Implementation

```tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// Trigger animation
scale.value = withSpring(0.95, { duration: 100 }, () => {
  scale.value = withSpring(1, { duration: 150 });
});
```

## API Integration

### SpaceAnalysisService

The components integrate with the existing SpaceAnalysisService:

```tsx
// Style references
const styles = await spaceAnalysisService.getStyleReferences();

// Ambiance options
const ambiances = await spaceAnalysisService.getAmbianceOptions(styleId);
```

### Error Handling

- **Network errors**: Fallback to cached data or default options
- **Loading states**: Skeleton screens with shimmer effects
- **User feedback**: Toast notifications for errors

## Testing

### Component Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import StyleGrid from '../StyleGrid';

describe('StyleGrid', () => {
  it('should handle style selection', () => {
    const onSelectionChange = jest.fn();
    const { getByTestId } = render(
      <StyleGrid onSelectionChange={onSelectionChange} />
    );
    
    const styleItem = getByTestId('style-item-0');
    fireEvent.press(styleItem);
    
    expect(onSelectionChange).toHaveBeenCalled();
  });
});
```

### Accessibility Testing

- **Screen reader navigation**: Test with VoiceOver/TalkBack
- **Focus management**: Verify focus order and indicators
- **Keyboard navigation**: Test tab navigation flow
- **Color contrast**: Validate contrast ratios meet WCAG standards

## Performance Monitoring

### Metrics

- **Render time**: < 16ms for 60 FPS
- **Memory usage**: Monitor for memory leaks
- **Image loading**: Track load times and failures
- **Animation performance**: Measure frame drops

### Tools

- **Flipper**: React Native debugging
- **Xcode Instruments**: iOS performance profiling
- **Android Studio Profiler**: Android performance analysis

## Browser Support

Optimized for React Native applications running on:

- **iOS**: 12.0+
- **Android**: API 21+ (Android 5.0)
- **React Native**: 0.68+

## Dependencies

- **react-native-reanimated**: 3.0+ for animations
- **expo-linear-gradient**: Gradient backgrounds
- **expo-blur**: Blur effects for overlays
- **expo-haptics**: iOS haptic feedback
- **react-native-tab-view**: Tab navigation

## Future Enhancements

### Planned Features

- **AR Preview**: Augmented reality style preview
- **Voice Selection**: Voice commands for accessibility
- **Gesture Navigation**: Swipe gestures for selection
- **Advanced Filtering**: Filter by color, price, brand
- **Social Features**: Share and rate styles

### Performance Improvements

- **Virtual scrolling**: For very large datasets
- **Image optimization**: WebP format support
- **Caching strategy**: Enhanced offline capabilities
- **Code splitting**: Lazy load components