# Masonry Gallery Image Generation Guide

## Overview
Generate 10 interior design images for the Compozit Vision mobile app's masonry gallery showcase in the onboarding screen.

## Specifications
- **Purpose**: Onboarding screen showcase to demonstrate AI capabilities
- **Style**: Professional interior design photography
- **Quality**: Clean, appealing aesthetic suitable for mobile app
- **Formats**: PNG preferred for transparency support
- **Total**: 10 images with varied orientations for natural masonry layout

## Image Requirements

### 1. modern-living-room.png
- **Size**: 320x240 pixels (landscape)
- **Style**: Modern Minimalist
- **Room**: Living Room
- **Prompt**: A modern minimalist living room with clean lines, neutral colors, sleek furniture, and abundant natural light. Professional interior design photography.

### 2. industrial-kitchen.png
- **Size**: 256x256 pixels (square)
- **Style**: Industrial
- **Room**: Kitchen
- **Prompt**: An industrial style kitchen with exposed brick walls, stainless steel appliances, concrete countertops, and Edison bulb lighting. Professional interior photography.

### 3. bohemian-bedroom.png
- **Size**: 240x320 pixels (portrait)
- **Style**: Bohemian
- **Room**: Bedroom
- **Prompt**: A bohemian bedroom with warm earth tones, layered textiles, macrame wall hangings, plants, and cozy ambient lighting. Professional interior design photo.

### 4. vintage-workspace.png
- **Size**: 320x240 pixels (landscape)
- **Style**: Vintage
- **Room**: Workspace
- **Prompt**: A vintage home office with antique wooden desk, leather chair, bookshelves, typewriter, warm lighting, and classic decor. Professional interior photography.

### 5. scandinavian-living-room.png
- **Size**: 256x256 pixels (square)
- **Style**: Scandinavian
- **Room**: Living Room
- **Prompt**: A Scandinavian living room with white walls, light wood furniture, cozy textiles, hygge elements, and natural light. Professional interior design photography.

### 6. minimalist-bedroom.png
- **Size**: 240x320 pixels (portrait)
- **Style**: Minimalist
- **Room**: Bedroom
- **Prompt**: A minimalist bedroom with clean white linens, simple furniture, organized space, natural materials, and serene atmosphere. Professional interior photography.

### 7. modern-kitchen-island.png
- **Size**: 320x240 pixels (landscape)
- **Style**: Contemporary
- **Room**: Kitchen
- **Prompt**: A contemporary kitchen with marble island, pendant lights, white cabinets, stainless appliances, and modern design. Professional interior design photo.

### 8. industrial-workspace.png
- **Size**: 240x320 pixels (portrait)
- **Style**: Industrial
- **Room**: Workspace
- **Prompt**: An industrial workspace with metal furniture, exposed pipes, concrete floors, vintage equipment, and moody lighting. Professional interior photography.

### 9. cozy-reading-nook.png
- **Size**: 256x256 pixels (square)
- **Style**: Cozy Traditional
- **Room**: Living Space
- **Prompt**: A cozy reading nook with comfortable armchair, soft throw blanket, bookshelf, warm lamp, and peaceful atmosphere. Professional interior design photography.

### 10. modern-dining-room.png
- **Size**: 320x240 pixels (landscape)
- **Style**: Modern Contemporary
- **Room**: Dining Room
- **Prompt**: A modern dining room with sleek table, contemporary chairs, statement lighting, and sophisticated design. Professional interior design photography.

## Generation Tools (Recommended)

### Option 1: DALL-E 3 (Recommended)
```
Tool: OpenAI DALL-E 3
Quality: HD
Style: Natural, photographic
Aspect Ratio: Custom (as specified)
Additional Settings: "High quality interior design photography"
```

### Option 2: Midjourney
```
Settings: --ar [custom] --v 6 --style raw --q 2
Additional Parameters: 
- Interior design photography
- Professional lighting
- Architectural photography
- High resolution
```

### Option 3: Stable Diffusion
```
Model: SDXL or SD 1.5
Sampler: DPM++ 2M Karras
Steps: 50+
CFG Scale: 7-12
Negative Prompt: "blurry, low quality, amateur, cluttered, poor lighting"
```

### Option 4: Gemini (When Available)
```
Model: gemini-2.5-flash-image-preview
Quality: High
Style: Photorealistic interior design
Note: Backend implementation needed for app integration
```

## Generation Best Practices

### Prompt Engineering
- Start with the base prompt from specifications
- Add: "Professional interior design photography"
- Include: "High resolution, clean aesthetic"
- Specify: "Natural lighting, realistic materials"
- Avoid: "Cluttered, blurry, amateur, unrealistic"

### Quality Standards
- **Resolution**: Exact dimensions as specified
- **Lighting**: Natural, well-balanced lighting
- **Composition**: Professional framing, complete room views
- **Colors**: Cohesive color schemes that represent the style
- **Details**: Sharp focus, realistic textures and materials

### Style Consistency
- **Modern/Minimalist**: Clean lines, neutral colors, minimal decor
- **Industrial**: Exposed materials, metal fixtures, urban feel
- **Bohemian**: Warm colors, layered textiles, eclectic decor
- **Scandinavian**: Light woods, white walls, cozy textiles
- **Vintage**: Antique furniture, warm lighting, classic elements

## File Organization
```
mobile/src/assets/masonry/
├── modern-living-room.png
├── industrial-kitchen.png
├── bohemian-bedroom.png
├── vintage-workspace.png
├── scandinavian-living-room.png
├── minimalist-bedroom.png
├── modern-kitchen-island.png
├── industrial-workspace.png
├── cozy-reading-nook.png
├── modern-dining-room.png
├── image-specifications.json
└── GENERATION-GUIDE.md
```

## Integration Notes

### React Native Usage
```tsx
// Example import structure
import ModernLivingRoom from '../assets/masonry/modern-living-room.png';
import IndustrialKitchen from '../assets/masonry/industrial-kitchen.png';
// ... other imports

const masonryImages = [
  { source: ModernLivingRoom, style: 'Modern Minimalist', room: 'Living Room' },
  { source: IndustrialKitchen, style: 'Industrial', room: 'Kitchen' },
  // ... other images
];
```

### Masonry Layout Considerations
- **Varied Heights**: Portrait (320px), Square (256px), Landscape (240px)
- **Natural Flow**: Mixed orientations create organic layout
- **Performance**: Optimized file sizes for mobile
- **Loading**: Progressive loading with placeholders

### App Integration
- **Screen**: Onboarding flow
- **Purpose**: Showcase AI design capabilities
- **Animation**: Auto-playing carousel or masonry grid
- **Interaction**: Tap to see style details

## Quality Checklist

Before finalizing each image, verify:
- [ ] Exact dimensions match specifications
- [ ] Professional photography quality
- [ ] Style accurately represents the specified design aesthetic
- [ ] Room type is clearly identifiable
- [ ] Lighting is natural and well-balanced
- [ ] No watermarks or text overlays
- [ ] PNG format with optimization
- [ ] File size reasonable for mobile (~50-200KB per image)

## Next Steps

1. **Generate Images**: Use your preferred AI tool with the specifications
2. **Quality Review**: Check each image against the quality checklist
3. **Optimize Files**: Compress for mobile without quality loss
4. **Save Files**: Place in the masonry directory with exact filenames
5. **Test Integration**: Import into React Native and test display
6. **Update App**: Integrate into onboarding masonry component

## Support

For questions about integration or technical implementation:
- Check existing masonry gallery components in the app
- Review React Native image optimization practices
- Consider lazy loading for performance
- Implement progressive image loading for better UX

---

**Generated for**: Compozit Vision Mobile App  
**Purpose**: Onboarding screen masonry gallery  
**Total Images**: 10 professional interior design photographs  
**Formats**: PNG, optimized for mobile display