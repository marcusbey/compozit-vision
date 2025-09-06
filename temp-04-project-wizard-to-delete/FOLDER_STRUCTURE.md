# Project Wizard Folder Structure

## 🎯 Clean, Non-Redundant Structure

```
/04-project-wizard/
├── shared/                              # ✅ SINGLE SOURCE OF TRUTH
│   ├── components/                      # All shared UI components
│   │   ├── WizardHeader.tsx            # Header with progress indicator
│   │   ├── WizardScreenLayout.tsx      # Base layout for all screens  
│   │   ├── CategoryCard.tsx            # Category selection card
│   │   ├── FilterTabs.tsx              # Filter tabs component
│   │   └── ActionButton.tsx            # Consistent action button
│   ├── hooks/                          
│   │   └── useCategoryData.ts          # Category data management
│   ├── constants/
│   │   └── tokens.ts                   # ALL design tokens (no duplicates)
│   └── index.ts                        # Export all shared components
├── PhotoCapture/                       # Photo capture specific
│   ├── components/
│   │   ├── CameraInterface.tsx         # Camera controls & permissions
│   │   └── PhotoGuidelines.tsx         # Photo tips modal
│   └── hooks/
│       └── usePhotoCapture.ts          # Photo capture logic
├── Wizard-Screen/                      # Unified project screen specific
│   ├── components/                     # Unified screen components
│   │   ├── CameraSection.tsx          # Camera wrapper
│   │   ├── ImageDisplayArea.tsx       # Image display with header
│   │   ├── SlidingBottomPanel.tsx     # Animated panel
│   │   └── PanelRouter.tsx            # Panel routing logic
│   ├── panels/                        # Individual panels
│   │   ├── InitialPanel.tsx           # Welcome/start panel
│   │   ├── ProcessingPanel.tsx        # Loading panel
│   │   └── PromptPanel.tsx            # Text input panel
│   ├── hooks/
│   │   └── useWizardLogic.ts          # Unified screen state logic
│   ├── constants/
│   │   └── wizardData.ts              # Panel types (unique to this screen)
│   └── index.ts                       # Exports + re-exports shared
├── CategorySelectionScreen.tsx         # ✅ CLEAN (296 lines)
├── PhotoCaptureScreen.tsx             # ✅ CLEAN (358 lines) 
├── UnifiedProjectScreen.tsx           # ✅ CLEAN (117 lines)
├── USER_JOURNEY.md                    # Complete user journey docs
└── FOLDER_STRUCTURE.md               # This file
```

## 🔧 Import Pattern

### ✅ CORRECT - Use shared components everywhere
```typescript
import { WizardHeader, tokens, ActionButton } from '../shared';
import { CategoryCard, FilterTabs } from '../shared';
```

### ✅ CORRECT - Screen-specific components from their folders  
```typescript
import { CameraInterface } from '../PhotoCapture/components/CameraInterface';
import { usePhotoCapture } from '../PhotoCapture/hooks/usePhotoCapture';
```

### ✅ CORRECT - Unified screen components
```typescript
import { useWizardLogic, PanelRouter, tokens } from '../Wizard-Screen';
```

## 🚫 No More Redundancy

### ❌ REMOVED - Duplicate files eliminated:
- ~~`/Wizard-Screen/components/WizardHeader.tsx`~~ (moved to shared)
- ~~`/Wizard-Screen/constants/designTokens.ts`~~ (moved to shared)

### ✅ CONSOLIDATED - Single source of truth:
- **Design Tokens**: `/shared/constants/tokens.ts` only
- **Shared Components**: `/shared/components/` only  
- **Screen Layouts**: `/shared/components/WizardScreenLayout.tsx`

## 📊 Benefits Achieved

1. **No Duplicates**: Each component exists in exactly one place
2. **Clear Separation**: Shared vs screen-specific components  
3. **Easy Imports**: Consistent import patterns across all screens
4. **Maintainable**: Updates only need to happen in one location
5. **Scalable**: Adding new screens follows the same pattern

## 🎯 File Size Results (All Under 400 Lines)

- **CategorySelectionScreen**: 969 → 296 lines (70% reduction)
- **PhotoCaptureScreen**: 1601 → 358 lines (78% reduction)
- **UnifiedProjectScreen**: Already modular at 117 lines

## 🔄 Migration Status

- ✅ Shared components created and consolidated
- ✅ Duplicate files removed  
- ✅ All imports updated to use shared structure
- ✅ Re-exports configured for backward compatibility
- ✅ File sizes reduced significantly

The structure is now clean, non-redundant, and fully modular!