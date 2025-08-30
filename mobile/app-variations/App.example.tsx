/**
 * Example App - Compozit Vision Design System Integration
 * 
 * Example implementation showing how to use the design system
 * in your React Native app with proper theme integration.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ThemeProvider,
  Container,
  Heading1,
  BodyText,
  Button,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Stack,
  HBox,
  useTheme,
} from './src';

// Example screen using the design system
const ExampleScreen: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();

  const handleCreateProject = () => {
    console.log('Create project pressed');
  };

  return (
    <Container safeArea scrollable>
      <Stack space={4}>
        {/* Header */}
        <HBox justifyContent="space-between" alignItems="center">
          <Heading1 color="primary">Compozit Vision</Heading1>
          <Button
            variant="outline"
            size="sm"
            onPress={toggleTheme}
            leftIcon={<Icon name="settings" />}
          >
            {isDark ? 'Light' : 'Dark'}
          </Button>
        </HBox>

        {/* Welcome Message */}
        <Card variant="elevated" shadow="md">
          <CardHeader>
            <HBox alignItems="center" space={2}>
              <Icon name="palette" color="primary" size="lg" />
              <BodyText variant="h3">Welcome to Design System</BodyText>
            </HBox>
          </CardHeader>
          <CardContent>
            <BodyText color="textSecondary" mb={3}>
              This is an example of the Compozit Vision design system in action.
              All components are themed, responsive, and accessible.
            </BodyText>
            <Button
              variant="solid"
              color="primary"
              leftIcon={<Icon name="plus" />}
              onPress={handleCreateProject}
              fullWidth
            >
              Create Your First Project
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Stack space={2}>
          <Card variant="outlined">
            <CardContent>
              <HBox alignItems="center" space={2}>
                <Icon name="camera" color="secondary" />
                <BodyText flex={1}>Take photos of your space</BodyText>
                <Icon name="arrow-right" color="textTertiary" />
              </HBox>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <HBox alignItems="center" space={2}>
                <Icon name="furniture" color="accent" />
                <BodyText flex={1}>Get AI-powered design suggestions</BodyText>
                <Icon name="arrow-right" color="textTertiary" />
              </HBox>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <HBox alignItems="center" space={2}>
                <Icon name="paint" color="success" />
                <BodyText flex={1}>Browse curated products</BodyText>
                <Icon name="arrow-right" color="textTertiary" />
              </HBox>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
};

// Main App component
export default function App() {
  return (
    <ThemeProvider followSystemTheme={true}>
      <ExampleScreen />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}