# User Photo Process Flow - Source of Truth

**Version:** 1.0  
**Last Updated:** January 31, 2025  
**Status:** In Development

## Overview

This document defines the complete 10-step user journey for the photo-based interior design process in Compozit Vision. This flow enables users to furnish empty spaces by uploading photos and receiving AI-generated visualizations with furniture recommendations.

## Complete 10-Step Flow

### Step 1: Project Type Selection
- **Screen:** `categorySelection`
- **Purpose:** User selects project category (Interior, Outdoor, Commercial)
- **Navigation:** → `photoCapture`
- **Required Data:** Project category/type
- **User Action:** Select from predefined categories
- **Notes:** Determines available space types and styles for later steps

### Step 2: Photo Upload
- **Screen:** `photoCapture`
- **Purpose:** User uploads/takes photo of empty room or construction site
- **Navigation:** → `spaceDefinition`
- **Required Data:** Photo/image of space
- **User Action:** Take photo with camera or select from gallery
- **Notes:** Photo should show empty or partially furnished space for AI processing
- **Image Requirements:**
  - Empty rooms preferred
  - Construction sites acceptable
  - Good lighting recommended
  - Clear view of space

### Step 3: Function Selection
- **Screen:** `spaceDefinition` 
- **Purpose:** Define space function/room type
- **Navigation:** → `styleSelection`
- **Required Data:** Room type (living room, bedroom, kitchen, etc.)
- **User Action:** Select room type from available options
- **Notes:** Determines furniture categories and layout options

### Step 4: Style Selection
- **Screen:** `styleSelection`
- **Purpose:** Pick design aesthetic/style
- **Navigation:** → `referencesColors` (which redirects to `referenceSelection`)
- **Required Data:** Design style (modern, traditional, scandinavian, etc.)
- **User Action:** Select preferred design style
- **Notes:** Influences furniture choices, color recommendations, and AI processing

### Step 5: References Selection
- **Screen:** `referenceSelection`
- **Purpose:** Choose reference images for inspiration
- **Navigation:** → `colorPaletteSelection`
- **Required Data:** Selected reference image IDs
- **User Action:** Select inspiration images from curated collection
- **Features:**
  - Pinterest-style masonry grid layout
  - Favorites/bookmark functionality
  - Multi-selection capability
  - Image upload capability
  - Skip option available if no references found
- **Notes:** References help guide AI generation style and preferences

### Step 6: Color Palette Selection
- **Screen:** `colorPaletteSelection`
- **Purpose:** Choose preferred colors for the space
- **Navigation:** → `budget`
- **Required Data:** Selected color palette IDs (up to 3)
- **User Action:** Select from predefined color palettes
- **Features:**
  - Beautiful predefined palettes (Neon Sunset, Forest Hues, Peach Orchard, etc.)
  - Mood-based filtering (calming, energizing, cozy, etc.)
  - Color extraction from user-uploaded images
  - Favorites functionality
  - Preview modal for detailed palette view
- **Notes:** Colors influence furniture selection and final visualization

### Step 7: Budget Setting
- **Screen:** `budget`
- **Purpose:** Input total furnishing budget
- **Navigation:** → `elementSelection`
- **Required Data:** Budget amount and range
- **User Action:** Set maximum budget for furniture recommendations
- **Notes:** Critical for filtering affordable furniture options

### Step 8: AI Furniture Selection
- **Screen:** `elementSelection`
- **Purpose:** System filters catalog based on room + style + colors + budget
- **Navigation:** → `aiProcessing` (with auth check)
- **Required Data:** AI-filtered furniture recommendations
- **User Action:** Review and select from filtered furniture options
- **Features:**
  - Shows only relevant, affordable items
  - Prevents overspending
  - Category-based filtering
  - Style-matched recommendations
- **Notes:** Core value proposition - smart furniture filtering

### Step 9: Authentication Check
- **Screen:** `auth` (conditional)
- **Purpose:** Authenticate user before image generation if not logged in
- **Navigation:** → `aiProcessing` (after successful auth)
- **Required Data:** User account/authentication
- **User Action:** Login or create account
- **Conditions:** Only shown if user is not authenticated
- **Notes:** Required before expensive AI processing operations
- **Data Persistence:** All previous selections must be saved to user account

### Step 10: Generate Visualization
- **Screen:** `results`
- **Purpose:** AI creates furnished space image
- **Navigation:** Final step
- **Required Data:** Generated visualization image
- **User Action:** View final result, save, share, or request modifications
- **Process:** AI combines original photo with selected furniture and styling
- **Notes:** Final deliverable of the entire flow

## Navigation Flow Map

```
Payment/Onboarding
         ↓
   categorySelection (Step 1)
         ↓
     photoCapture (Step 2)
         ↓
   spaceDefinition (Step 3)
         ↓
   styleSelection (Step 4)
         ↓
   referencesColors → referenceSelection (Step 5)
         ↓
   colorPaletteSelection (Step 6)
         ↓
        budget (Step 7)
         ↓
   elementSelection (Step 8)
         ↓
   [auth check if not logged in] (Step 9)
         ↓
      aiProcessing → results (Step 10)
```

## Key Features & Requirements

### Authentication Handling
- **Timing:** Before Step 10 (image generation)
- **Data Persistence:** All user selections must be saved before auth
- **Fallback:** Guest users can complete flow but must authenticate before final processing

### Error Handling
- **Network Issues:** Graceful degradation with retry options
- **Upload Failures:** Alternative upload methods
- **Processing Errors:** Clear error messages with recovery options
- **Validation:** Each step validates required data before proceeding

### User Experience
- **Progress Indicators:** Each screen shows "Step X of 10"
- **Back Navigation:** Users can return to previous steps
- **Data Persistence:** Selections saved throughout flow
- **Skip Options:** Optional steps clearly marked
- **Loading States:** Clear feedback during processing

## Technical Implementation

### Screen Files
- `categorySelection`: `/src/screens/ProjectWizard/CategorySelectionScreen.tsx`
- `photoCapture`: `/src/screens/PhotoCapture/PhotoCaptureScreen.tsx`
- `spaceDefinition`: `/src/screens/ProjectWizard/SpaceDefinitionScreen.tsx`
- `styleSelection`: `/src/screens/ProjectWizard/StyleSelectionScreen.tsx`
- `referenceSelection`: `/src/screens/ReferenceSelection/ReferenceSelectionScreen.tsx`
- `colorPaletteSelection`: `/src/screens/ColorPalette/ColorPaletteSelectionScreen.tsx`
- `budget`: `/src/screens/Budget/BudgetScreen.tsx`
- `elementSelection`: `/src/screens/ElementSelection/ElementSelectionScreen.tsx`
- `auth`: `/src/screens/Auth/AuthScreen.tsx`
- `results`: `/src/screens/ProjectWizard/ResultsScreen.tsx`

### Data Storage
- **Journey Store:** `/src/stores/journeyStore.ts`
- **User Selections:** Persisted throughout flow
- **Image Storage:** Temporary and permanent storage handling
- **Authentication State:** User login status tracking

## Success Criteria

### Primary Goals
1. **Seamless Flow:** Users complete all 10 steps without confusion
2. **No Unwanted Screens:** Removed problematic intermediate screens
3. **Proper Data Flow:** Each step receives necessary data from previous steps
4. **Authentication Integration:** Smooth login experience when required
5. **Budget Compliance:** Only show affordable furniture options

### Key Metrics
- **Completion Rate:** Percentage of users finishing all 10 steps
- **Drop-off Points:** Identify where users abandon the flow
- **Authentication Success:** Login/signup completion rate
- **Generation Success:** Percentage of successful image generations
- **User Satisfaction:** Quality of final visualizations

## Change Log

### Version 1.0 (January 31, 2025)
- Initial documentation created
- Defined complete 10-step flow
- Established navigation patterns
- Added authentication requirements
- Documented technical implementation details

---

**Note:** This document should be updated whenever changes are made to the user flow, navigation, or step requirements. It serves as the single source of truth for the photo processing workflow.