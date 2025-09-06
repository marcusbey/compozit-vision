// Consolidated Asset Exports - Single Source of Truth for Images

// Re-export consolidated illustrations
export * from './illustrations-consolidated';

// Re-export consolidated photography
export * from './photography-consolidated';

// Direct image exports (non-consolidated directories)
export * from './color-palettes';

// Helper function to get asset by category
export const getAssetsByCategory = (category: string) => {
  // Implementation for dynamic asset loading by category
  // This can be expanded as needed for asset management
};