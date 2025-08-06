# Component API Reference

Complete API documentation for all Compozit Vision design system components.

## Base Components

### Text

Typography component with theme integration.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TypographyVariant` | `'body'` | Typography variant from theme |
| `color` | `ColorVariant \| string` | `undefined` | Text color |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `undefined` | Text alignment |
| `underline` | `boolean` | `false` | Add underline decoration |
| `strikethrough` | `boolean` | `false` | Add strikethrough decoration |
| `transform` | `'uppercase' \| 'lowercase' \| 'capitalize' \| 'none'` | `'none'` | Text transformation |
| `style` | `TextStyle` | `undefined` | Custom styles |

#### Typography Variants

- `display1`, `display2` - Large display text
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` - Headings
- `bodyLarge`, `body`, `bodySmall` - Body text
- `button`, `buttonSmall` - Button text
- `label`, `caption`, `overline` - UI labels
- `code` - Monospace code text

#### Example

```typescript
<Text variant="h1" color="primary" align="center">
  Welcome to Compozit Vision
</Text>
```

---

### Button

Flexible button component with multiple variants and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `ButtonVariant` | `'solid'` | Visual variant |
| `color` | `ColorVariant` | `'primary'` | Color theme |
| `size` | `SizeVariant` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `leftIcon` | `ReactNode` | `undefined` | Icon on the left |
| `rightIcon` | `ReactNode` | `undefined` | Icon on the right |
| `iconOnly` | `boolean` | `false` | Icon-only button |
| `fullWidth` | `boolean` | `false` | Full container width |
| `onPress` | `() => void` | `undefined` | Press handler |

#### Button Variants

- `solid` - Filled button (default)
- `outline` - Outlined button
- `ghost` - Transparent button
- `link` - Link-style button

#### Size Options

- `xs` - 32px height
- `sm` - 40px height
- `md` - 48px height (default)
- `lg` - 56px height
- `xl` - 64px height

#### Example

```typescript
<Button
  variant="solid"
  color="primary"
  size="lg"
  leftIcon={<Icon name="plus" />}
  loading={isLoading}
  onPress={handleCreate}
>
  Create Project
</Button>
```

---

### Card

Container component for grouping related content.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Visual variant |
| `shadow` | `ShadowKey` | `'sm'` | Shadow intensity |
| `pressable` | `boolean` | `false` | Enable touch interaction |
| `onPress` | `() => void` | `undefined` | Press handler |
| `padding` | `SpacingKey` | `4` | Internal padding |

#### Card Sub-components

- `CardHeader` - Header section
- `CardContent` - Main content area
- `CardFooter` - Footer with actions

#### Example

```typescript
<Card variant="elevated" pressable onPress={handlePress}>
  <CardHeader>
    <Text variant="h3">Project Title</Text>
  </CardHeader>
  <CardContent>
    <Text>Project description...</Text>
  </CardContent>
  <CardFooter>
    <Button variant="outline">Edit</Button>
    <Button variant="solid">Open</Button>
  </CardFooter>
</Card>
```

---

### Icon

Flexible icon component with built-in and external icon support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Icon name |
| `library` | `'feather' \| 'ionicons' \| 'material' \| 'custom'` | `'custom'` | Icon library |
| `size` | `SizeVariant \| number` | `'md'` | Icon size |
| `color` | `ColorVariant \| string` | `'textPrimary'` | Icon color |
| `IconComponent` | `ComponentType<any>` | `undefined` | External icon component |

#### Built-in Icons

Navigation: `arrow-left`, `arrow-right`, `chevron-left`, `chevron-right`
UI: `plus`, `minus`, `x`, `check`, `star`, `heart`
Actions: `search`, `camera`, `gallery`, `home`, `settings`, `user`
Interior Design: `palette`, `ruler`, `furniture`, `light`, `paint`

#### Example

```typescript
// Built-in icon
<Icon name="camera" size="lg" color="primary" />

// External icon library
<Icon
  name="home"
  IconComponent={MaterialIcons}
  size={24}
  color="secondary"
/>
```

---

## Form Components

### Input

Text input component with validation and theming.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `InputVariant` | `'outline'` | Visual variant |
| `size` | `SizeVariant` | `'md'` | Input size |
| `label` | `string` | `undefined` | Input label |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `helperText` | `string` | `undefined` | Help text below input |
| `errorText` | `string` | `undefined` | Error message |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `boolean` | `false` | Error state |
| `required` | `boolean` | `false` | Required field |
| `leftIcon` | `ReactNode` | `undefined` | Left side icon |
| `rightIcon` | `ReactNode` | `undefined` | Right side icon |
| `multiline` | `boolean` | `false` | Multi-line input |
| `value` | `string` | `undefined` | Input value |
| `onChange` | `(value: string) => void` | `undefined` | Change handler |

#### Input Variants

- `default` - Standard input
- `filled` - Filled background
- `outline` - Outlined (default)

#### Example

```typescript
<Input
  label="Project Name"
  placeholder="Enter project name"
  value={projectName}
  onChange={setProjectName}
  error={hasError}
  errorText="Project name is required"
  leftIcon={<Icon name="folder" />}
  required
/>
```

---

## Layout Components

### Container

Responsive container with safe area support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fluid` | `boolean` | `false` | Remove max-width constraints |
| `centered` | `boolean` | `false` | Center content horizontally |
| `padding` | `SpacingKey \| 'none'` | `4` | Container padding |
| `safeArea` | `boolean` | `false` | Apply safe area to all sides |
| `safeAreaTop` | `boolean` | `false` | Apply safe area to top |
| `safeAreaBottom` | `boolean` | `false` | Apply safe area to bottom |
| `scrollable` | `boolean` | `false` | Enable scrolling |

#### Example

```typescript
<Container safeArea padding={4} scrollable>
  <Text>Content goes here</Text>
</Container>
```

---

### Box

Flexible layout primitive with utility props.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `undefined` | Background color |
| `borderRadius` | `BorderRadiusKey` | `undefined` | Border radius |
| `shadow` | `ShadowKey` | `undefined` | Shadow/elevation |
| `opacity` | `number` | `undefined` | Opacity value |

#### Layout Props

| Prop | Type | Description |
|------|------|-------------|
| `flex` | `number` | Flex grow value |
| `flexDirection` | `'row' \| 'column'` | Flex direction |
| `justifyContent` | `JustifyContent` | Main axis alignment |
| `alignItems` | `AlignItems` | Cross axis alignment |
| `width`, `height` | `number \| string` | Dimensions |

#### Spacing Props

All components support spacing props for consistent layout:

| Prop | Description |
|------|-------------|
| `m`, `mt`, `mr`, `mb`, `ml` | Margin (all, top, right, bottom, left) |
| `mx`, `my` | Margin horizontal/vertical |
| `p`, `pt`, `pr`, `pb`, `pl` | Padding (all, top, right, bottom, left) |
| `px`, `py` | Padding horizontal/vertical |

#### Example

```typescript
<Box
  flex={1}
  flexDirection="row"
  justifyContent="space-between"
  alignItems="center"
  p={4}
  backgroundColor={colors.surface}
  borderRadius="lg"
>
  <Text>Content</Text>
</Box>
```

---

### Layout Helpers

#### HBox / VBox

```typescript
// Horizontal layout
<HBox alignItems="center" space={2}>
  <Icon name="user" />
  <Text>Profile</Text>
</HBox>

// Vertical layout
<VBox space={3}>
  <Text variant="h2">Title</Text>
  <Text>Description</Text>
</VBox>
```

#### Stack / Inline

```typescript
// Vertical stack with consistent spacing
<Stack space={3}>
  <Heading2>Title</Heading2>
  <Text>Description</Text>
  <Button>Action</Button>
</Stack>

// Horizontal inline layout
<Inline space={2}>
  <Button variant="outline">Cancel</Button>
  <Button variant="solid">Save</Button>
</Inline>
```

#### Spacer / Divider

```typescript
// Add space between elements
<Spacer size={4} />

// Visual separator
<Divider orientation="horizontal" thickness={1} />
```

---

## Animation Components

### AnimatedBox

Enhanced Box with built-in animation capabilities.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `AnimationType` | `'fade'` | Animation type |
| `animationDuration` | `AnimationDuration \| number` | `'normal'` | Animation duration |
| `animationEasing` | `AnimationEasing` | `'ease'` | Animation easing |
| `visible` | `boolean` | `true` | Animation trigger |
| `entrance` | `boolean` | `false` | Enable entrance animation |
| `exit` | `boolean` | `false` | Enable exit animation |

#### Animation Types

- `fade` - Opacity animation
- `scale` - Scale animation
- `slideX` - Horizontal slide
- `slideY` - Vertical slide
- `spring` - Spring animation

#### Predefined Animated Components

```typescript
<FadeBox visible={isVisible} entrance>
  <Content />
</FadeBox>

<ScaleBox trigger={shouldAnimate}>
  <Button>Animated Button</Button>
</ScaleBox>

<SlideUpBox entrance visible={show}>
  <Modal />
</SlideUpBox>
```

---

## Utility Props

All layout components support utility props for consistent styling:

### Spacing Props
- `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` - Margin variants
- `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` - Padding variants

### Layout Props
- `flex`, `flexDirection`, `justifyContent`, `alignItems`
- `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`

### Position Props
- `position`, `top`, `right`, `bottom`, `left`, `zIndex`

### Border Props
- `borderRadius`, `borderWidth`, `borderColor`

### Shadow Props
- `shadow` - Apply elevation/shadow

---

## Accessibility Props

All components support accessibility props:

| Prop | Type | Description |
|------|------|-------------|
| `accessible` | `boolean` | Enable accessibility |
| `accessibilityLabel` | `string` | Accessibility label |
| `accessibilityHint` | `string` | Accessibility hint |
| `accessibilityRole` | `string` | Element role |
| `testID` | `string` | Test identifier |

---

## TypeScript Support

The design system is fully typed with TypeScript:

```typescript
import type { 
  ButtonProps, 
  TextProps, 
  Theme,
  ColorVariant,
  SizeVariant 
} from '../src/components';

// Type-safe component props
const buttonProps: ButtonProps = {
  variant: 'solid',
  color: 'primary',
  size: 'lg',
};

// Theme type access
const MyComponent: React.FC<{ theme: Theme }> = ({ theme }) => {
  // Fully typed theme access
  return (
    <View style={{ backgroundColor: theme.colors.primary }}>
      <Text style={theme.typography.h1}>Hello</Text>
    </View>
  );
};
```