import { IconConfig } from '../types/contextAnalysis';

// Icon definitions based on COMPREHENSIVE-DESIGN-CATEGORIES.md
export const ICON_CONFIGURATIONS: IconConfig[] = [
  // Style & Aesthetic Icons
  {
    id: 'style',
    label: 'Style',
    icon: '🎨',
    category: 'style',
    visibilityRules: {
      minConfidence: 0.3
    },
    panelConfig: {
      type: 'expanded',
      component: 'StyleSelectionPanel',
      defaultExpanded: true
    },
    contextualOptions: {
      filterBy: ['spaceType', 'roomType', 'currentStyle'],
      dataSource: 'designStyles',
      maxOptions: 12
    }
  },
  
  {
    id: 'cultural',
    label: 'Cultural',
    icon: '🌍',
    category: 'cultural',
    visibilityRules: {
      minConfidence: 0.4
    },
    panelConfig: {
      type: 'expanded',
      component: 'CulturalStylePanel'
    },
    contextualOptions: {
      filterBy: ['spaceType', 'currentStyle', 'location'],
      dataSource: 'culturalInfluences',
      maxOptions: 10
    }
  },
  
  {
    id: 'colorPalette',
    label: 'Colors',
    icon: '🎨',
    category: 'color',
    visibilityRules: {
      minConfidence: 0.2
    },
    panelConfig: {
      type: 'compact',
      component: 'ColorPalettePanel'
    },
    contextualOptions: {
      filterBy: ['currentStyle', 'lighting', 'mood'],
      dataSource: 'colorPalettes',
      maxOptions: 8
    }
  },
  
  // Functional Icons
  {
    id: 'furniture',
    label: 'Furniture',
    icon: '🪑',
    category: 'furniture',
    visibilityRules: {
      requiredSpaceTypes: ['interior'],
      excludedRoomTypes: ['bathroom', 'utility_room', 'garage']
    },
    panelConfig: {
      type: 'expanded',
      component: 'FurnitureStylePanel'
    },
    contextualOptions: {
      filterBy: ['roomType', 'currentStyle', 'budget'],
      dataSource: 'furnitureStyles',
      maxOptions: 15
    }
  },
  
  {
    id: 'materials',
    label: 'Materials',
    icon: '🏗️',
    category: 'material',
    visibilityRules: {
      minConfidence: 0.4
    },
    panelConfig: {
      type: 'expanded',
      component: 'MaterialSelectionPanel'
    },
    contextualOptions: {
      filterBy: ['spaceType', 'climate', 'budget', 'roomType'],
      dataSource: 'materials',
      maxOptions: 12
    }
  },
  
  // Planning Icons
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    category: 'budget',
    visibilityRules: {
      minConfidence: 0.2
    },
    panelConfig: {
      type: 'compact',
      component: 'BudgetSliderPanel'
    },
    contextualOptions: {
      filterBy: ['projectType', 'roomType', 'scale'],
      dataSource: 'budgetRanges'
    }
  },
  
  {
    id: 'location',
    label: 'Location',
    icon: '📍',
    category: 'location',
    visibilityRules: {
      minConfidence: 0.3
    },
    panelConfig: {
      type: 'fullscreen',
      component: 'LocationMapPanel'
    },
    contextualOptions: {
      filterBy: ['climate', 'culture', 'regulations'],
      dataSource: 'locations'
    }
  },
  
  // Exterior Specific Icons
  {
    id: 'landscape',
    label: 'Landscape',
    icon: '🌿',
    category: 'function',
    visibilityRules: {
      requiredSpaceTypes: ['exterior'],
      minConfidence: 0.5
    },
    panelConfig: {
      type: 'expanded',
      component: 'LandscapeDesignPanel'
    },
    contextualOptions: {
      filterBy: ['climate', 'scale', 'budget'],
      dataSource: 'landscapeOptions',
      maxOptions: 10
    }
  },
  
  {
    id: 'outdoorFurniture',
    label: 'Outdoor',
    icon: '🪴',
    category: 'furniture',
    visibilityRules: {
      requiredSpaceTypes: ['exterior'],
      excludedRoomTypes: ['facade', 'driveway']
    },
    panelConfig: {
      type: 'expanded',
      component: 'OutdoorFurniturePanel'
    },
    contextualOptions: {
      filterBy: ['weather', 'space', 'style'],
      dataSource: 'outdoorFurniture',
      maxOptions: 10
    }
  },
  
  // Room-Specific Icons
  {
    id: 'kitchen',
    label: 'Kitchen',
    icon: '🍳',
    category: 'function',
    visibilityRules: {
      requiredRoomTypes: ['kitchen'],
      requiredSpaceTypes: ['interior']
    },
    panelConfig: {
      type: 'expanded',
      component: 'KitchenDesignPanel'
    },
    contextualOptions: {
      filterBy: ['style', 'budget', 'size'],
      dataSource: 'kitchenOptions',
      maxOptions: 12
    }
  },
  
  {
    id: 'bathroom',
    label: 'Bathroom',
    icon: '🚿',
    category: 'function',
    visibilityRules: {
      requiredRoomTypes: ['bathroom', 'powder_room'],
      requiredSpaceTypes: ['interior']
    },
    panelConfig: {
      type: 'expanded',
      component: 'BathroomDesignPanel'
    },
    contextualOptions: {
      filterBy: ['style', 'budget', 'size'],
      dataSource: 'bathroomOptions',
      maxOptions: 10
    }
  },
  
  // Lighting Icon
  {
    id: 'lighting',
    label: 'Lighting',
    icon: '💡',
    category: 'function',
    visibilityRules: {
      minConfidence: 0.3
    },
    panelConfig: {
      type: 'expanded',
      component: 'LightingDesignPanel'
    },
    contextualOptions: {
      filterBy: ['roomType', 'currentLighting', 'mood'],
      dataSource: 'lightingOptions',
      maxOptions: 8
    }
  },
  
  // Special Theme Icons
  {
    id: 'fantasy',
    label: 'Fantasy',
    icon: '🦄',
    category: 'style',
    visibilityRules: {
      minConfidence: 0.6,
      excludedRoomTypes: ['bathroom', 'kitchen', 'utility_room']
    },
    panelConfig: {
      type: 'expanded',
      component: 'FantasyThemePanel'
    },
    contextualOptions: {
      filterBy: ['roomType', 'ageGroup'],
      dataSource: 'fantasyThemes',
      maxOptions: 10
    }
  }
];

// Helper function to get icons by category
export function getIconsByCategory(category: string): IconConfig[] {
  return ICON_CONFIGURATIONS.filter(icon => icon.category === category);
}

// Helper function to get all unique categories
export function getAllCategories(): string[] {
  return Array.from(new Set(ICON_CONFIGURATIONS.map(icon => icon.category)));
}

// Priority order for icon display
export const ICON_PRIORITY_ORDER = [
  'style',
  'colorPalette',
  'furniture',
  'budget',
  'location',
  'materials',
  'cultural',
  'lighting',
  'kitchen',
  'bathroom',
  'landscape',
  'outdoorFurniture',
  'fantasy'
];