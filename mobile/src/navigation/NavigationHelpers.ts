/**
 * NavigationHelpers - Enhanced navigation system for professional app
 * 
 * Extends the existing SafeJourneyNavigator with professional features
 * while maintaining backward compatibility.
 */

import { NavigationHelpers as BaseNavigationHelpers } from './SafeJourneyNavigator';
export type { JourneyScreens } from './SafeJourneyNavigator';

// Extended navigation types for professional features
export type MainTabParamList = {
  Projects: undefined;
  Library: undefined;
  Create: {
    projectId?: string;
    projectContext?: any;
  };
  Explore: {
    category?: string;
    searchQuery?: string;
  };
  Profile: undefined;
};

// Professional feature navigation helpers
export const ProfessionalNavigationHelpers = {
  ...BaseNavigationHelpers,

  // Main tab navigation
  navigateToProjects: (params?: any) => {
    BaseNavigationHelpers.navigateToScreen('mainApp', params);
  },

  navigateToLibrary: (sectionId?: string) => {
    BaseNavigationHelpers.navigateToScreen('mainApp', { 
      screen: 'Library',
      params: { sectionId }
    });
  },

  navigateToCreate: (projectId?: string, projectContext?: any) => {
    BaseNavigationHelpers.navigateToScreen('unifiedProject', { 
      projectId, 
      projectContext 
    });
  },

  navigateToExplore: (category?: string, searchQuery?: string) => {
    BaseNavigationHelpers.navigateToScreen('mainApp', {
      screen: 'Explore',
      params: { category, searchQuery }
    });
  },

  navigateToProfile: () => {
    BaseNavigationHelpers.navigateToScreen('profile');
  },

  // Project-specific navigation
  navigateToProjectDetails: (projectId: string) => {
    BaseNavigationHelpers.navigateToScreen('results', { projectId });
  },

  navigateToProjectSettings: (projectId: string) => {
    BaseNavigationHelpers.navigateToScreen('projectSettings', { projectId });
  },

  // Professional workflow navigation
  navigateToClientManagement: () => {
    BaseNavigationHelpers.navigateToScreen('profile', { section: 'clients' });
  },

  navigateToBudgetTracker: (projectId: string) => {
    BaseNavigationHelpers.navigateToScreen('budget', { projectId });
  },

  // Quick access helpers
  navigateToColorPalettes: () => {
    BaseNavigationHelpers.navigateToScreen('myPalettes');
  },

  navigateToReferenceLibrary: () => {
    BaseNavigationHelpers.navigateToScreen('referenceLibrary');
  },

  // Professional export
  navigateToProjectExport: (projectId: string) => {
    BaseNavigationHelpers.navigateToScreen('results', { 
      projectId, 
      action: 'export' 
    });
  },

  // Utility functions
  getCurrentMainTab: (): keyof MainTabParamList | null => {
    const currentRoute = BaseNavigationHelpers.getCurrentRoute();
    if (!currentRoute) return null;
    
    // Map current route to main tab
    const routeToTabMap: Record<string, keyof MainTabParamList> = {
      'mainApp': 'Projects',
      'myProjects': 'Projects',
      'referenceLibrary': 'Library',
      'myPalettes': 'Library',
      'unifiedProject': 'Create',
      'profile': 'Profile',
    };
    
    return routeToTabMap[currentRoute.name] || null;
  },

  isProjectRelatedScreen: (): boolean => {
    const currentRoute = BaseNavigationHelpers.getCurrentRoute();
    if (!currentRoute) return false;
    
    const projectScreens = [
      'unifiedProject',
      'results',
      'descriptions',
      'furniture',
      'budget',
      'projectSettings',
      'processing'
    ];
    
    return projectScreens.includes(currentRoute.name);
  },

  isProfessionalFeatureScreen: (): boolean => {
    const currentRoute = BaseNavigationHelpers.getCurrentRoute();
    if (!currentRoute) return false;
    
    const professionalScreens = [
      'budget',
      'projectSettings',
      'analytics',
      'adminPanel'
    ];
    
    return professionalScreens.includes(currentRoute.name);
  }
};

// Tab bar configuration for professional app
export const TabBarConfig = {
  Projects: {
    icon: 'albums-outline',
    iconFocused: 'albums',
    label: 'Projects',
    badge: null,
  },
  Library: {
    icon: 'library-outline',
    iconFocused: 'library',
    label: 'Library',
    badge: null,
  },
  Create: {
    icon: 'add-circle-outline',
    iconFocused: 'add-circle',
    label: 'Create',
    badge: null,
  },
  Explore: {
    icon: 'compass-outline',
    iconFocused: 'compass',
    label: 'Explore',
    badge: null,
  },
  Profile: {
    icon: 'person-circle-outline',
    iconFocused: 'person-circle',
    label: 'Profile',
    badge: null,
  },
};

// Export both for compatibility
export const NavigationHelpers = ProfessionalNavigationHelpers;
export default NavigationHelpers;