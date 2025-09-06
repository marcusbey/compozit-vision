// Screen component mapping for lazy loading and navigation
import { Routes, RouteName } from './routes';

// Lazy loading screen imports using the new feature-slice structure
export const ScreenMap: Record<RouteName, () => Promise<any>> = {
  // Auth screens
  [Routes.Auth]: () => import('@screens/auth').then(m => m.AuthScreen),
  [Routes.Welcome]: () => import('@screens/auth').then(m => m.WelcomeScreen),
  
  // Onboarding screens
  [Routes.Onboarding1]: () => import('@screens/onboarding').then(m => m.OnboardingScreen1),
  [Routes.Onboarding2]: () => import('@screens/onboarding').then(m => m.OnboardingScreen2),
  [Routes.Onboarding3]: () => import('@screens/onboarding').then(m => m.OnboardingScreen3),
  [Routes.Onboarding4]: () => import('@screens/onboarding').then(m => m.OnboardingScreen4),
  
  // Payment screens
  [Routes.PlanSelection]: () => import('@screens/payment').then(m => m.PlanSelectionScreen),
  [Routes.Paywall]: () => import('@screens/payment').then(m => m.PaywallScreen),
  [Routes.PaymentPending]: () => import('@screens/payment').then(m => m.PaymentPendingScreen),
  [Routes.PaymentVerified]: () => import('@screens/payment').then(m => m.PaymentVerifiedScreen),

  // Project screens - TODO: Update these paths as we migrate more screens
  [Routes.UnifiedProject]: () => import('@screens').then(m => m.UnifiedProjectScreen),
  
  // Temporary mappings for screens not yet migrated (using old paths)
  [Routes.ProjectWizardStart]: () => import('../screens/04-project-wizard/Wizard-Screen').then(m => m.default),
  [Routes.CategorySelection]: () => import('../screens/04-project-wizard/CategorySelectionScreen').then(m => m.default),
  [Routes.SpaceDefinition]: () => import('../screens/04-project-wizard/SpaceDefinitionScreen').then(m => m.default),
  [Routes.StyleSelection]: () => import('../screens/04-project-wizard/StyleSelectionScreen').then(m => m.default),
  [Routes.PhotoCapture]: () => import('../screens/04-project-wizard/PhotoCaptureScreen').then(m => m.default),
  [Routes.RoomSelection]: () => import('../screens/04-project-wizard/RoomSelectionScreen').then(m => m.default),
  [Routes.AIProcessing]: () => import('../screens/04-project-wizard/AIProcessingScreen').then(m => m.default),
  [Routes.ReferencesColors]: () => import('../screens/04-project-wizard/ReferencesColorsScreen').then(m => m.default),
  [Routes.Results]: () => import('../screens/04-project-wizard/ResultsScreen').then(m => m.default),
  
  // Content selection screens
  [Routes.ColorPaletteSelection]: () => import('../screens/05-content-selection/ColorPaletteSelectionScreen').then(m => m.default),
  [Routes.ReferenceSelection]: () => import('../screens/05-content-selection/ReferenceSelectionScreen').then(m => m.default),
  [Routes.ReferenceImages]: () => import('../screens/05-content-selection/ReferenceImagesScreen').then(m => m.default),
  
  // Results screens
  [Routes.Processing]: () => import('../screens/06-results/ProcessingScreen').then(m => m.default),
  [Routes.Descriptions]: () => import('../screens/06-results/DescriptionsScreen').then(m => m.default),
  
  // Image refinement
  [Routes.ImageRefinement]: () => import('../screens/05-image-refinement/ImageRefinementScreen').then(m => m.default),
  
  // Furniture screens
  [Routes.Furniture]: () => import('../screens/06-results/FurnitureScreen').then(m => m.default),
  [Routes.FurnitureSelection]: () => import('../screens/FurnitureSelection/FurnitureSelectionScreen').then(m => m.default),
  [Routes.Budget]: () => import('../screens/06-results/BudgetScreen').then(m => m.default),
  [Routes.Checkout]: () => import('../screens/06-results/CheckoutScreen').then(m => m.default),
  
  // Dashboard screens  
  [Routes.MyProjects]: () => import('../screens/07-dashboard/MyProjectsScreen').then(m => m.default),
  [Routes.MyPalettes]: () => import('../screens/07-dashboard/MyPalettesScreen').then(m => m.default),
  [Routes.Profile]: () => import('../screens/07-dashboard/ProfileScreen').then(m => m.default),
  [Routes.ProjectSettings]: () => import('../screens/07-dashboard/ProjectSettingsScreen').then(m => m.default),
  [Routes.Plans]: () => import('../screens/07-dashboard/PlansScreen').then(m => m.default),
  [Routes.ReferenceLibrary]: () => import('../screens/07-dashboard/ReferenceLibraryScreen').then(m => m.default),
  [Routes.Tools]: () => import('../screens/07-dashboard/ToolsScreen').then(m => m.default),
  [Routes.Analytics]: () => import('../screens/07-dashboard/AnalyticsScreen').then(m => m.default),
  [Routes.AdminPanel]: () => import('../screens/07-dashboard/AdminPanelScreen').then(m => m.default),
  [Routes.ABTesting]: () => import('../screens/07-dashboard/ABTestingScreen').then(m => m.default),
};

// Helper function to get screen component
export const getScreenComponent = (routeName: RouteName) => {
  return ScreenMap[routeName];
};