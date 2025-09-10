# Masonry Gallery Setup - Interior Design Images

## Overview
This document outlines the complete setup for generating and integrating interior design images for the mobile app's masonry gallery onboarding showcase.

## Files Created

### 1. Image Generation Scripts
- **`/mobile/src/scripts/generateMasonryImages.ts`** - TypeScript specification generator
- **`/mobile/src/scripts/generateMasonryImagesWithAI.ts`** - AI-powered image generation script  
- **`/mobile/src/scripts/createPlaceholderImages.js`** - Simple placeholder creation

### 2. React Native Components
- **`/mobile/src/components/MasonryGallery.tsx`** - Complete masonry gallery component
- **`/mobile/src/assets/masonryImages.ts`** - Image imports and configuration

### 3. Configuration and Specifications
- **`/mobile/src/assets/masonry/image-specifications.json`** - Detailed image requirements
- **`/mobile/src/assets/masonry/GENERATION-GUIDE.md`** - Comprehensive generation guide
- **`/mobile/src/assets/masonry/placeholder-mapping.json`** - Image mapping configuration

## Image Specifications

### Total Images: 10
All images are optimized for mobile display with varied orientations for natural masonry layout.

| Image | Style | Room | Size | Orientation |
|-------|-------|------|------|-------------|
| modern-living-room.png | Modern Minimalist | Living Room | 320x240 | landscape |
| industrial-kitchen.png | Industrial | Kitchen | 256x256 | square |
| bohemian-bedroom.png | Bohemian | Bedroom | 240x320 | portrait |
| vintage-workspace.png | Vintage | Workspace | 320x240 | landscape |
| scandinavian-living-room.png | Scandinavian | Living Room | 256x256 | square |
| minimalist-bedroom.png | Minimalist | Bedroom | 240x320 | portrait |
| modern-kitchen-island.png | Contemporary | Kitchen | 320x240 | landscape |
| industrial-workspace.png | Industrial | Workspace | 240x320 | portrait |
| cozy-reading-nook.png | Cozy Traditional | Living Space | 256x256 | square |
| modern-dining-room.png | Modern Contemporary | Dining Room | 320x240 | landscape |

## Current Status: ✅ READY FOR IMMEDIATE USE

### Implemented Features
- **Placeholder Images**: Currently using existing high-quality room sample images
- **React Component**: Fully functional MasonryGallery component with:
  - Auto-play animation
  - Responsive masonry layout  
  - Loading states and shimmer effects
  - Style and room labels
  - Smooth scrolling and parallax effects
  - TypeScript support

### Component Usage
```tsx
import MasonryGallery from '../components/MasonryGallery';

// Basic usage
<MasonryGallery />

// With customization
<MasonryGallery 
  autoPlay={true}
  showLabels={true}
  animationDuration={3000}
  height={400}
  onImagePress={(image) => console.log('Tapped:', image.style)}
/>
```

## Next Steps for AI Image Generation

### Option 1: Use Existing AI Generation Script (Recommended)
```bash
# Navigate to the scripts directory
cd mobile/src/scripts

# Run the AI generation script (requires API keys)
npx ts-node generateMasonryImagesWithAI.ts
```

**Requirements:**
- Add one of these API keys to your environment:
  - `EXPO_PUBLIC_REPLICATE_API_KEY` (Stable Diffusion XL)
  - `EXPO_PUBLIC_OPENAI_API_KEY` (DALL-E 3) 
  - `EXPO_PUBLIC_STABILITY_API_KEY` (Stability AI)

### Option 2: Manual Generation
1. Use the prompts from `/mobile/src/assets/masonry/image-specifications.json`
2. Generate images using your preferred AI tool:
   - **DALL-E 3**: Best quality, easiest to use
   - **Midjourney**: Excellent results, requires Discord
   - **Stable Diffusion**: Free, requires setup
3. Save images to `/mobile/src/assets/masonry/` with exact filenames
4. Update import paths in `masonryImages.ts` if needed

### Option 3: Use Gemini Service (When Backend Ready)
The project has Gemini image generation prepared but requires backend implementation:
- Backend endpoint: `/api/gemini/generate-image`  
- Service file: `geminiImageGenerationService.ts`
- Test script: `testGeminiImageGeneration.ts`

## Integration Guide

### 1. Import the Component
```tsx
import MasonryGallery from '../components/MasonryGallery';
```

### 2. Add to Onboarding Screen
```tsx
export const OnboardingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI-Powered Interior Design</Text>
      <Text style={styles.subtitle}>See what's possible with Compozit Vision</Text>
      
      <MasonryGallery 
        autoPlay={true}
        height={400}
        showLabels={true}
      />
      
      <Button title="Get Started" onPress={handleGetStarted} />
    </View>
  );
};
```

### 3. Customize Appearance
Modify styles in `MasonryGallery.tsx` or use the configuration options:
- `MASONRY_CONFIG` in `masonryImages.ts`
- Component props for behavior
- StyleSheet for visual appearance

## Performance Considerations

### Optimizations Included
- **Lazy Loading**: Images load progressively
- **Shimmer Effects**: Smooth loading states
- **Memory Management**: Efficient image handling
- **Animation Performance**: Hardware-accelerated animations
- **Bundle Size**: Optimized imports and file sizes

### Monitoring
- Track image load times
- Monitor memory usage during gallery scroll
- Test on various device sizes
- Validate masonry layout balance

## Testing

### Manual Testing Checklist
- [ ] Gallery displays correctly on various screen sizes
- [ ] Auto-play animation works smoothly  
- [ ] Images load with proper loading states
- [ ] Labels display correctly
- [ ] Scroll performance is smooth
- [ ] Memory usage stays reasonable

### Automated Testing
Consider adding tests for:
- Component rendering
- Image loading states  
- Animation timing
- Responsive layout behavior

## File Structure
```
mobile/src/
├── components/
│   └── MasonryGallery.tsx          # Main gallery component
├── assets/
│   ├── masonryImages.ts           # Image imports & config
│   └── masonry/                   # Generated images directory
│       ├── image-specifications.json
│       ├── GENERATION-GUIDE.md
│       └── [generated-images.png]
└── scripts/
    ├── generateMasonryImages.ts
    ├── generateMasonryImagesWithAI.ts
    └── createPlaceholderImages.js
```

## Troubleshooting

### Common Issues

**Images not loading:**
- Check import paths in `masonryImages.ts`
- Verify image files exist in the masonry directory
- Ensure image formats are supported (PNG preferred)

**Layout issues:**
- Verify image dimensions in specifications
- Check responsive calculations in component
- Test on different screen sizes

**Performance problems:**
- Reduce image file sizes
- Limit animation complexity  
- Consider lazy loading implementation

**Generation script fails:**
- Verify API keys are correctly set
- Check network connectivity
- Review error messages for specific issues

## Support

For additional help:
1. Check the generation guide: `/mobile/src/assets/masonry/GENERATION-GUIDE.md`
2. Review component documentation in `MasonryGallery.tsx`
3. Test with existing placeholder images first
4. Validate API configurations for generation

---

**Status**: ✅ Production-ready with placeholder images  
**Next Priority**: Generate AI images using preferred service  
**Timeline**: Can be deployed immediately with placeholders, AI generation when API keys are available