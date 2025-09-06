// Navigation route constants - centralized route management
export const Routes = {
  // Auth flow
  Welcome: 'Welcome',
  Auth: 'Auth',
  
  // Onboarding flow
  Onboarding1: 'Onboarding1',
  Onboarding2: 'Onboarding2', 
  Onboarding3: 'Onboarding3',
  Onboarding4: 'Onboarding4',
  
  // Payment flow
  PlanSelection: 'PlanSelection',
  Paywall: 'Paywall',
  PaymentPending: 'PaymentPending',
  PaymentVerified: 'PaymentVerified',
  
  // Project wizard flow
  UnifiedProject: 'UnifiedProject',
  ProjectWizardStart: 'ProjectWizardStart',
  CategorySelection: 'CategorySelection',
  SpaceDefinition: 'SpaceDefinition',
  StyleSelection: 'StyleSelection',
  PhotoCapture: 'PhotoCapture',
  RoomSelection: 'RoomSelection',
  AIProcessing: 'AIProcessing',
  ReferencesColors: 'ReferencesColors',
  Results: 'Results',
  
  // Content selection flow
  ColorPaletteSelection: 'ColorPaletteSelection',
  ReferenceSelection: 'ReferenceSelection',
  ReferenceImages: 'ReferenceImages',
  
  // Results flow
  Processing: 'Processing',
  Descriptions: 'Descriptions',
  
  // Refinement flow
  ImageRefinement: 'ImageRefinement',
  
  // Furniture flow
  Furniture: 'Furniture',
  FurnitureSelection: 'FurnitureSelection',
  Budget: 'Budget',
  Checkout: 'Checkout',
  
  // Dashboard flow
  MyProjects: 'MyProjects',
  MyPalettes: 'MyPalettes',
  Profile: 'Profile',
  ProjectSettings: 'ProjectSettings',
  Plans: 'Plans',
  ReferenceLibrary: 'ReferenceLibrary',
  Tools: 'Tools',
  Analytics: 'Analytics',
  AdminPanel: 'AdminPanel',
  ABTesting: 'ABTesting',
} as const;

export type RouteName = typeof Routes[keyof typeof Routes];

// Route param types
export type RootStackParamList = {
  [Routes.Welcome]: undefined;
  [Routes.Auth]: undefined;
  [Routes.Onboarding1]: undefined;
  [Routes.Onboarding2]: undefined;
  [Routes.Onboarding3]: undefined;
  [Routes.Onboarding4]: undefined;
  [Routes.PlanSelection]: undefined;
  [Routes.Paywall]: undefined;
  [Routes.PaymentPending]: undefined;
  [Routes.PaymentVerified]: undefined;
  [Routes.UnifiedProject]: undefined;
  [Routes.ProjectWizardStart]: undefined;
  [Routes.CategorySelection]: undefined;
  [Routes.SpaceDefinition]: undefined;
  [Routes.StyleSelection]: undefined;
  [Routes.PhotoCapture]: undefined;
  [Routes.RoomSelection]: undefined;
  [Routes.AIProcessing]: undefined;
  [Routes.ReferencesColors]: undefined;
  [Routes.Results]: undefined;
  [Routes.ColorPaletteSelection]: undefined;
  [Routes.ReferenceSelection]: undefined;
  [Routes.ReferenceImages]: undefined;
  [Routes.Processing]: undefined;
  [Routes.Descriptions]: undefined;
  [Routes.ImageRefinement]: undefined;
  [Routes.Furniture]: undefined;
  [Routes.FurnitureSelection]: undefined;
  [Routes.Budget]: undefined;
  [Routes.Checkout]: undefined;
  [Routes.MyProjects]: undefined;
  [Routes.MyPalettes]: undefined;
  [Routes.Profile]: undefined;
  [Routes.ProjectSettings]: undefined;
  [Routes.Plans]: undefined;
  [Routes.ReferenceLibrary]: undefined;
  [Routes.Tools]: undefined;
  [Routes.Analytics]: undefined;
  [Routes.AdminPanel]: undefined;
  [Routes.ABTesting]: undefined;
};