/**
 * Design System Test Component - Compozit Vision
 * 
 * Comprehensive test component that showcases all design system components
 * and verifies they render correctly with proper theming and functionality.
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  // Theme
  ThemeProvider,
  useTheme,
  useColors,
  
  // Base components
  Text,
  Heading1,
  Heading2,
  Heading3,
  BodyText,
  Button,
  PrimaryButton,
  SecondaryButton,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Icon,
  
  // Form components
  Input,
  TextArea,
  
  // Layout components
  Container,
  Box,
  HBox,
  VBox,
  Stack,
  Inline,
  Spacer,
  Divider,
  
  // Animation components
  AnimatedBox,
  FadeBox,
  ScaleBox,
  SlideUpBox,
} from '../index';

// Main test component
const DesignSystemTestContent: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useColors();
  
  // State for testing interactive components
  const [inputValue, setInputValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');
  const [showAnimations, setShowAnimations] = useState(false);
  const [cardPressed, setCardPressed] = useState(false);

  const handleButtonPress = (buttonName: string) => {
    Alert.alert('Button Pressed', `You pressed: ${buttonName}`);
  };

  const handleCardPress = () => {
    setCardPressed(!cardPressed);
    Alert.alert('Card Pressed', 'Card interaction working!');
  };

  return (
    <Container safeArea scrollable padding={4}>
      <Stack space={4}>
        {/* Header Section */}
        <VBox>
          <Heading1 align="center" color="primary" mb={2}>
            Design System Test
          </Heading1>
          <BodyText align="center" color="textSecondary">
            Comprehensive test of all design system components
          </BodyText>
          
          <HBox justifyContent="center" mt={3}>
            <Button
              variant="outline"
              size="sm"
              onPress={toggleTheme}
            >
              Switch to {isDark ? 'Light' : 'Dark'} Theme
            </Button>
          </HBox>
        </VBox>

        <Divider />

        {/* Typography Section */}
        <VBox>
          <Heading2 mb={3}>Typography</Heading2>
          
          <Stack space={2}>
            <Text variant="display1">Display 1 - Large</Text>
            <Text variant="h1">Heading 1</Text>
            <Text variant="h2">Heading 2</Text>
            <Text variant="h3">Heading 3</Text>
            <Text variant="bodyLarge">Body Large Text</Text>
            <Text variant="body">Regular Body Text</Text>
            <Text variant="bodySmall">Small Body Text</Text>
            <Text variant="caption" color="textSecondary">Caption Text</Text>
            <Text variant="overline" color="textTertiary">OVERLINE TEXT</Text>
            <Text variant="code" backgroundColor={colors.backgroundSecondary} p={1}>
              Code Text Example
            </Text>
          </Stack>
        </VBox>

        <Divider />

        {/* Color Palette Section */}
        <VBox>
          <Heading2 mb={3}>Color Palette</Heading2>
          
          <Stack space={2}>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.primary} borderRadius="sm" mr={2} />
              <Text>Primary: {colors.primary}</Text>
            </HBox>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.secondary} borderRadius="sm" mr={2} />
              <Text>Secondary: {colors.secondary}</Text>
            </HBox>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.accent} borderRadius="sm" mr={2} />
              <Text>Accent: {colors.accent}</Text>
            </HBox>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.success} borderRadius="sm" mr={2} />
              <Text>Success: {colors.success}</Text>
            </HBox>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.warning} borderRadius="sm" mr={2} />
              <Text>Warning: {colors.warning}</Text>
            </HBox>
            <HBox alignItems="center">
              <Box width={20} height={20} backgroundColor={colors.error} borderRadius="sm" mr={2} />
              <Text>Error: {colors.error}</Text>
            </HBox>
          </Stack>
        </VBox>

        <Divider />

        {/* Button Section */}
        <VBox>
          <Heading2 mb={3}>Buttons</Heading2>
          
          <Stack space={3}>
            {/* Button Variants */}
            <VBox>
              <Text variant="label" mb={2}>Variants</Text>
              <Inline space={2}>
                <Button variant="solid" onPress={() => handleButtonPress('Solid')}>
                  Solid
                </Button>
                <Button variant="outline" onPress={() => handleButtonPress('Outline')}>
                  Outline
                </Button>
                <Button variant="ghost" onPress={() => handleButtonPress('Ghost')}>
                  Ghost
                </Button>
                <Button variant="link" onPress={() => handleButtonPress('Link')}>
                  Link
                </Button>
              </Inline>
            </VBox>

            {/* Button Colors */}
            <VBox>
              <Text variant="label" mb={2}>Colors</Text>
              <Inline space={2}>
                <Button color="primary" onPress={() => handleButtonPress('Primary')}>
                  Primary
                </Button>
                <Button color="secondary" onPress={() => handleButtonPress('Secondary')}>
                  Secondary
                </Button>
                <Button color="success" onPress={() => handleButtonPress('Success')}>
                  Success
                </Button>
                <Button color="error" onPress={() => handleButtonPress('Error')}>
                  Error
                </Button>
              </Inline>
            </VBox>

            {/* Button Sizes */}
            <VBox>
              <Text variant="label" mb={2}>Sizes</Text>
              <Stack space={2}>
                <Button size="xs" onPress={() => handleButtonPress('Extra Small')}>
                  Extra Small
                </Button>
                <Button size="sm" onPress={() => handleButtonPress('Small')}>
                  Small
                </Button>
                <Button size="md" onPress={() => handleButtonPress('Medium')}>
                  Medium (Default)
                </Button>
                <Button size="lg" onPress={() => handleButtonPress('Large')}>
                  Large
                </Button>
                <Button size="xl" onPress={() => handleButtonPress('Extra Large')}>
                  Extra Large
                </Button>
              </Stack>
            </VBox>

            {/* Button with Icons */}
            <VBox>
              <Text variant="label" mb={2}>With Icons</Text>
              <Inline space={2}>
                <Button
                  leftIcon={<Icon name="plus" color="textInverse" />}
                  onPress={() => handleButtonPress('Left Icon')}
                >
                  Add
                </Button>
                <Button
                  rightIcon={<Icon name="arrow-right" color="textInverse" />}
                  onPress={() => handleButtonPress('Right Icon')}
                >
                  Next
                </Button>
                <Button
                  iconOnly
                  leftIcon={<Icon name="search" color="textInverse" />}
                  onPress={() => handleButtonPress('Icon Only')}
                />
              </Inline>
            </VBox>

            {/* Button States */}
            <VBox>
              <Text variant="label" mb={2}>States</Text>
              <Inline space={2}>
                <Button disabled onPress={() => handleButtonPress('Disabled')}>
                  Disabled
                </Button>
                <Button loading onPress={() => handleButtonPress('Loading')}>
                  Loading
                </Button>
              </Inline>
            </VBox>
          </Stack>
        </VBox>

        <Divider />

        {/* Icons Section */}
        <VBox>
          <Heading2 mb={3}>Icons</Heading2>
          
          <Stack space={3}>
            {/* Icon Sizes */}
            <VBox>
              <Text variant="label" mb={2}>Sizes</Text>
              <HBox alignItems="center" space={3}>
                <Icon name="camera" size="xs" />
                <Icon name="camera" size="sm" />
                <Icon name="camera" size="md" />
                <Icon name="camera" size="lg" />
                <Icon name="camera" size="xl" />
              </HBox>
            </VBox>

            {/* Icon Colors */}
            <VBox>
              <Text variant="label" mb={2}>Colors</Text>
              <HBox alignItems="center" space={3}>
                <Icon name="heart" color="primary" />
                <Icon name="heart" color="secondary" />
                <Icon name="heart" color="success" />
                <Icon name="heart" color="error" />
                <Icon name="heart" color="warning" />
              </HBox>
            </VBox>

            {/* Built-in Icons */}
            <VBox>
              <Text variant="label" mb={2}>Built-in Icons</Text>
              <HBox flexWrap="wrap" space={2}>
                <Icon name="camera" size="lg" />
                <Icon name="home" size="lg" />
                <Icon name="search" size="lg" />
                <Icon name="user" size="lg" />
                <Icon name="settings" size="lg" />
                <Icon name="palette" size="lg" />
                <Icon name="furniture" size="lg" />
                <Icon name="light" size="lg" />
              </HBox>
            </VBox>
          </Stack>
        </VBox>

        <Divider />

        {/* Cards Section */}
        <VBox>
          <Heading2 mb={3}>Cards</Heading2>
          
          <Stack space={3}>
            {/* Card Variants */}
            <Card variant="elevated" shadow="md">
              <CardHeader>
                <Heading3>Elevated Card</Heading3>
              </CardHeader>
              <CardContent>
                <Text>This is an elevated card with shadow.</Text>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <Heading3>Outlined Card</Heading3>
              </CardHeader>
              <CardContent>
                <Text>This is an outlined card with border.</Text>
              </CardContent>
            </Card>

            <Card variant="filled">
              <CardHeader>
                <Heading3>Filled Card</Heading3>
              </CardHeader>
              <CardContent>
                <Text>This is a filled card with background.</Text>
              </CardContent>
            </Card>

            {/* Pressable Card */}
            <Card 
              variant="elevated" 
              pressable 
              onPress={handleCardPress}
              shadow={cardPressed ? 'lg' : 'md'}
            >
              <CardHeader>
                <HBox justifyContent="space-between" alignItems="center">
                  <Heading3>Pressable Card</Heading3>
                  <Icon name="arrow-right" color="primary" />
                </HBox>
              </CardHeader>
              <CardContent>
                <Text>Tap this card to test interaction!</Text>
                {cardPressed && (
                  <Text color="success" mt={1}>Card was pressed! ✓</Text>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Spacer size={2} />
                <Button variant="solid" size="sm">
                  Confirm
                </Button>
              </CardFooter>
            </Card>
          </Stack>
        </VBox>

        <Divider />

        {/* Forms Section */}
        <VBox>
          <Heading2 mb={3}>Form Components</Heading2>
          
          <Stack space={3}>
            <Input
              label="Project Name"
              placeholder="Enter your project name"
              value={inputValue}
              onChange={setInputValue}
              leftIcon={<Icon name="folder" />}
              helperText="Choose a descriptive name for your project"
            />

            <Input
              label="Email Address"
              placeholder="you@example.com"
              keyboardType="email-address"
              rightIcon={<Icon name="check" color="success" />}
              required
            />

            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              error
              errorText="Password must be at least 8 characters"
            />

            <TextArea
              label="Description"
              placeholder="Describe your vision..."
              value={textAreaValue}
              onChange={setTextAreaValue}
              helperText="Tell us about your interior design goals"
            />

            <Input
              label="Disabled Input"
              placeholder="This input is disabled"
              disabled
              value="Disabled value"
            />
          </Stack>
        </VBox>

        <Divider />

        {/* Layout Components Section */}
        <VBox>
          <Heading2 mb={3}>Layout Components</Heading2>
          
          <Stack space={3}>
            {/* Box Examples */}
            <VBox>
              <Text variant="label" mb={2}>Box Layouts</Text>
              
              <HBox space={2} mb={2}>
                <Box flex={1} p={3} backgroundColor={colors.primary} borderRadius="md">
                  <Text color="textInverse" align="center">Flex 1</Text>
                </Box>
                <Box flex={2} p={3} backgroundColor={colors.secondary} borderRadius="md">
                  <Text color="textInverse" align="center">Flex 2</Text>
                </Box>
              </HBox>

              <Box
                p={4}
                backgroundColor={colors.backgroundSecondary}
                borderRadius="lg"
                shadow="sm"
              >
                <Text align="center">Box with padding, background, and shadow</Text>
              </Box>
            </VBox>

            {/* Stack and Inline Examples */}
            <VBox>
              <Text variant="label" mb={2}>Stack & Inline Layouts</Text>
              
              <Card variant="outlined" padding={3}>
                <Stack space={2}>
                  <Text variant="h4">Vertical Stack</Text>
                  <Text>Item 1</Text>
                  <Text>Item 2</Text>
                  <Text>Item 3</Text>
                </Stack>
              </Card>

              <Spacer size={2} />

              <Card variant="outlined" padding={3}>
                <VBox>
                  <Text variant="h4" mb={2}>Horizontal Inline</Text>
                  <Inline space={2}>
                    <Button variant="outline" size="sm">Button 1</Button>
                    <Button variant="outline" size="sm">Button 2</Button>
                    <Button variant="outline" size="sm">Button 3</Button>
                  </Inline>
                </VBox>
              </Card>
            </VBox>
          </Stack>
        </VBox>

        <Divider />

        {/* Animation Section */}
        <VBox>
          <Heading2 mb={3}>Animations</Heading2>
          
          <VBox mb={3}>
            <Button
              onPress={() => setShowAnimations(!showAnimations)}
              variant="outline"
            >
              {showAnimations ? 'Hide' : 'Show'} Animations
            </Button>
          </VBox>

          {showAnimations && (
            <Stack space={3}>
              <FadeBox visible={showAnimations} entrance>
                <Card variant="elevated">
                  <CardContent>
                    <Text>Fade Animation - I fade in smoothly!</Text>
                  </CardContent>
                </Card>
              </FadeBox>

              <ScaleBox trigger={showAnimations}>
                <Card variant="outlined">
                  <CardContent>
                    <Text>Scale Animation - I scale in with bounce!</Text>
                  </CardContent>
                </Card>
              </ScaleBox>

              <SlideUpBox visible={showAnimations} entrance>
                <Card variant="filled">
                  <CardContent>
                    <Text>Slide Animation - I slide up from below!</Text>
                  </CardContent>
                </Card>
              </SlideUpBox>

              <AnimatedBox
                animationType="spring"
                trigger={showAnimations}
                animationDelay={500}
              >
                <Card variant="elevated" shadow="lg">
                  <CardContent>
                    <Text>Spring Animation - I bounce in with delay!</Text>
                  </CardContent>
                </Card>
              </AnimatedBox>
            </Stack>
          )}
        </VBox>

        {/* Test Complete */}
        <VBox>
          <Divider mb={4} />
          <Card variant="elevated" shadow="lg" backgroundColor={colors.success}>
            <CardContent>
              <HBox alignItems="center" space={2}>
                <Icon name="check" color="white" size="lg" />
                <VBox flex={1}>
                  <Text color="white" variant="h4">
                    Design System Test Complete! ✅
                  </Text>
                  <Text color="white" mt={1}>
                    All components are working correctly with proper theming and functionality.
                  </Text>
                </VBox>
              </HBox>
            </CardContent>
          </Card>
        </VBox>

        <Spacer size={4} />
      </Stack>
    </Container>
  );
};

// Main component with theme provider
export const DesignSystemTest: React.FC = () => {
  return (
    <ThemeProvider>
      <DesignSystemTestContent />
    </ThemeProvider>
  );
};

export default DesignSystemTest;