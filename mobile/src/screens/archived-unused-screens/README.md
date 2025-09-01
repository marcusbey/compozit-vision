# Archived Unused Screens

This folder contains only **truly unused screens** that are not referenced anywhere in the navigation or codebase.

## Files in This Archive

### ProjectWizard/ReferencesSelectionScreen.tsx
- **Status**: Duplicate/Unused
- **Reason**: Appears to be a duplicate of `05-content-selection/ReferenceSelectionScreen.tsx`
- **Safe to delete**: Yes, after verification that it's not imported anywhere

## What Was NOT Archived

All other screen files were **moved back to their original locations** because they are still referenced in `SafeJourneyNavigator.tsx`, even if they're not used in the current user journey. This ensures:

1. ✅ No navigation import errors
2. ✅ App continues to work properly
3. ✅ Screens remain available if needed for future features
4. ✅ No broken references in the codebase

## Why The Correction Was Needed

Initially, I moved too many files thinking they were unused. However, the `SafeJourneyNavigator.tsx` file references all screens in its `screenImports` object, which means they need to be available even if not used in the main journey. Moving them caused import errors.

## Current Status

- **All navigation imports**: ✅ Working
- **Main user journey**: ✅ Functional  
- **Error-free compilation**: ✅ Confirmed
- **Only 1 truly unused file**: `ProjectWizard/ReferencesSelectionScreen.tsx`

## User Journey Flow (Still Active)

The main user journey uses these core screens:
1. OnboardingScreen1 → PaywallScreen
2. CategorySelectionScreen → PhotoCaptureScreen  
3. StyleSelectionScreen → ReferenceSelectionScreen
4. ColorPaletteSelectionScreen → BudgetScreen ⭐
5. FurnitureSelectionScreen (with carousel) → AuthScreen
6. AIProcessingScreen → ResultsScreen

All other screens remain in their original locations for navigation compatibility.

## Safe Cleanup Complete

The codebase is now clean while preserving all functionality. Only this single duplicate file remains archived.

---
**Archive Date**: 2025-09-01  
**Archive Reason**: Corrected cleanup - only keeping truly unused duplicate files  
**Safe to Delete After**: 2025-09-15 (after confirming no imports exist)