# 🔒 WORKING SCREENS - DO NOT MODIFY

**⚠️ CRITICAL: These screens are working correctly and should NOT be modified unless explicitly requested by the user.**

## ✅ PROTECTED SCREENS

### Color Palette Selection Screen
- **File**: `/src/screens/ColorPalette/ColorPaletteSelectionScreen.tsx`
- **Status**: ✅ WORKING 
- **Last Tested**: January 31, 2025
- **Issues**: ✅ FIXED - Added farmhouse color palettes
- **Solution**: Added 6 farmhouse palettes (Classic, Barn Door, Lavender, Sunflower, Bluebell, Harvest)

### AI Processing Screen (Enhanced)
- **File**: `/src/screens/ProjectWizard/AIProcessingScreen.tsx`
- **Status**: ✅ WORKING - Room layout animation + 5-stage progress system merged
- **Last Tested**: January 31, 2025
- **Recent Fix**: Updated navigation to use ProjectWizard version with room animation added
- **DO NOT TOUCH**: Animation logic, 5-stage progress system, room layout visual

### Element Selection Screen
- **File**: `/src/screens/ElementSelection/ElementSelectionScreen.tsx`
- **Status**: ✅ WORKING - Hook violations fixed
- **Last Tested**: January 31, 2025
- **DO NOT TOUCH**: Render functions, animation logic

### Navigation Flow (10-step process)
- **Files**: Multiple navigation and screen files
- **Status**: ✅ WORKING - All step numbers updated
- **Last Tested**: January 31, 2025
- **DO NOT TOUCH**: Step numbering, navigation flow order

### Onboarding Screens (4-screen flow)
- **Files**: OnboardingScreen1.tsx, OnboardingScreen2.tsx, OnboardingScreen3.tsx, OnboardingScreen4.tsx
- **Status**: ✅ WORKING - Separated back to 4 screens (professional features & testimonials)
- **Last Tested**: January 31, 2025
- **Screen 3**: Professional features (precision, accuracy, expert matching)
- **Screen 4**: Testimonials and user engagement
- **DO NOT TOUCH**: Step numbers, separated content, progress percentages

## 🚨 MODIFICATION RULES

### Before Making ANY Changes:
1. **Check this file first** - Is the screen listed as WORKING?
2. **If WORKING**: Only add data (like missing color palettes), never modify logic
3. **Ask user first**: "This screen is marked as working. Do you want me to modify it anyway?"
4. **Document changes**: Update this file if modifications are made

### Safe Modifications (Data Only):
- ✅ Adding missing color palettes to database
- ✅ Adding missing styles or content
- ✅ Adding new data entries
- ✅ Fixing missing imports/references

### Dangerous Modifications (Logic Changes):
- ❌ Changing component structure
- ❌ Modifying animation logic
- ❌ Changing navigation flow
- ❌ Updating step numbers
- ❌ Refactoring working code

## 📋 WHEN SCREENS BREAK:

### If a "Working" Screen Stops Working:
1. **First**: Check what data is missing (like color palettes)
2. **Add missing data** instead of modifying screen logic  
3. **Only modify logic** if explicitly requested by user
4. **Update status** in this file after fixing

### Common Issues & Solutions:
- **"No Palettes Found"**: Add missing color palettes for the style
- **Navigation errors**: Check if referenced screens exist
- **Step number mismatches**: Verify 10-step flow is maintained
- **TypeScript errors**: Fix imports/types, don't change logic

---

**🔐 This protection system ensures stable, working screens remain functional while allowing safe data additions.**