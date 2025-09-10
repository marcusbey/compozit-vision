# Unified Project Screen - Product Requirements Document

## Overview
The unified project screen combines photo selection, preview, and transformation prompt into a single, seamless interface. Users maintain a persistent gallery of images and can immediately start working with their content.

## Core Principles
1. **No empty states** - Always show content (first gallery image by default)
2. **Single screen flow** - All interactions happen on one screen
3. **Persistent gallery** - Each user has their own saved gallery
4. **Progressive disclosure** - Features reveal based on user actions

## Screen Layout

### 1. Top Section - Image Preview (50-60% height)
- **Default State**: Shows the first image from user's gallery
- **No placeholder** - Always displays an image
- **Image behaviors**:
  - Full width, aspect-fit or aspect-cover
  - Smooth transitions when switching images
  - Optional overlay controls (back, reset) when image is displayed

### 2. Middle Section - Transformation Input
- **Text Input Field**:
  - Always visible
  - Multiline, expandable (2-4 lines)
  - Placeholder: "Describe your transformation (e.g., modern minimalist style)"
  - Character counter (0/500)
  - Voice input button on the right
  
- **Progressive Features**:
  - Hidden initially
  - Appear ONLY after user starts typing (min 3 characters)
  - Collapsible feature cards:
    - 🎨 Color Palette
    - 💰 Budget Range
    - 🪑 Furniture Style
    - 📍 Room Details
    - 🏗️ Materials
    - 🖼️ Textures

### 3. Bottom Section - Image Gallery
- **Fixed Add Button (+)**:
  - Always visible at the left edge
  - Stays in place during scroll
  - Opens photo options panel
  
- **Horizontal Scrolling Gallery**:
  - User's saved images
  - Sample/preset images
  - Selected state indicator
  - Smooth horizontal scroll
  - Image dimensions: ~80-100px height

## User Flow

### Initial Load
1. Screen loads with first gallery image in preview
2. Text input is empty but visible
3. Gallery shows user's images + samples
4. (+) button fixed at left

### Adding New Photo
1. User taps (+) button
2. **Secondary panel slides up** with options:
   - 📷 Take Photo (primary button)
   - 📁 Upload from Device (secondary button)
   - ✕ Cancel (closes panel)
3. After photo capture/selection:
   - Photo adds to gallery (first position after +)
   - Photo displays in preview area
   - Panel closes automatically
   - Gallery scrolls to show new image

### Image Selection
1. User taps any gallery image
2. Preview updates immediately
3. Previous selection indicator moves
4. Smooth transition animation

### Text Input & Features
1. User types in transformation field
2. After 3+ characters:
   - Additional features fade in below
   - Transform button becomes active
3. Features are collapsible accordions
4. Each feature opens to relevant options

## Technical Implementation

### State Management
```typescript
interface UnifiedProjectState {
  // Gallery
  userGallery: string[]  // User's saved images
  sampleGallery: string[]  // Preset samples
  selectedImageIndex: number
  
  // Input
  transformPrompt: string
  selectedFeatures: Record<FeatureId, any>
  
  // UI State
  showAddPhotoPanel: boolean
  expandedFeatures: Set<FeatureId>
  isProcessing: boolean
}
```

### Component Structure
```
UnifiedProjectScreen
├── ImagePreviewArea
│   ├── Image Display
│   └── Header Controls
├── TransformSection
│   ├── TextInput
│   ├── VoiceButton
│   └── FeatureCards (conditional)
└── GallerySection
    ├── AddPhotoButton (fixed)
    ├── ScrollView
    │   ├── UserImages
    │   └── SampleImages
    └── AddPhotoPanel (modal)
```

### Key Behaviors

1. **Gallery Persistence**:
   - Save to AsyncStorage/Database
   - Load on app start
   - Sync with backend

2. **Image Selection**:
   - Update preview immediately
   - Maintain selection state
   - Preload adjacent images

3. **Progressive Features**:
   - Monitor text length
   - Smooth fade-in animation
   - Maintain expansion state

4. **Add Photo Panel**:
   - Bottom sheet modal
   - Backdrop to dismiss
   - Auto-close on action

## Visual Design

### Gallery Item
```
┌─────────┐
│ [Image] │ <- 80x80px, rounded corners
│         │    2px border when selected
└─────────┘
```

### Add Button
```
┌───┐
│ + │ <- 80x80px, dashed border
└───┘    Fixed position, subtle shadow
```

### Selected State
- 2px solid border (#D4A574)
- Slight scale (1.05)
- Shadow elevation

## Animation & Transitions

1. **Image Switch**: 300ms fade transition
2. **Panel Slide**: 400ms ease-out
3. **Feature Reveal**: 200ms fade-in, staggered
4. **Gallery Scroll**: Native smooth scroll

## Edge Cases

1. **Empty Gallery**: Pre-populate with 3-4 high-quality samples
2. **Failed Upload**: Show inline error, keep panel open
3. **Long Prompts**: Limit to 500 chars, show counter
4. **Many Features**: Limit to 6, prioritize by context

## Success Metrics

1. Time to first transformation < 30s
2. Gallery engagement > 60%
3. Feature usage > 40%
4. Add photo completion > 80%

## Future Enhancements

1. Gallery organization (folders/tags)
2. Favorite images
3. Share gallery items
4. AI-suggested prompts based on image
5. Batch transformations