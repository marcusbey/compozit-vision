/**
 * Design System Entry Point - Compozit Vision
 * 
 * Main entry point for the entire design system, providing
 * easy access to all components, themes, and utilities.
 */

// Re-export everything from components
export * from './components';

// Re-export styles and utilities
export * from './styles';

// Re-export types
export * from './types';

// Default export for the entire design system
export { default as DesignSystem } from './components';

// Test component for development
export { DesignSystemTest } from './components/__tests__/DesignSystemTest';