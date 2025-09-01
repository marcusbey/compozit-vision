# PRD: Style Selection & Reference System Improvements

## Overview
Fix critical issues in the style selection screen and completely rebuild the reference system to provide users with curated, relevant design references that match their project type and style preferences.

## Current Issues Identified

### 1. Style Selection Screen Issues
- ❌ Garden project showing "Scandinavian" style (inappropriate for outdoor spaces)
- ❌ Missing many design styles from the database
- ❌ Cards are too large, limiting visible options
- ❌ No project-type filtering of available styles

### 2. Reference Screen Issues  
- ❌ Shows "References & Colors" instead of just "References"
- ❌ Redirects to Pinterest-style screen (not implemented properly)
- ❌ No curated reference collection
- ❌ No filtering based on user's style/project selections
- ❌ No ability to upload custom references
- ❌ No favorites/bookmark functionality

## Product Requirements

## EPIC 1: Style Selection System Redesign

### Task 1.1: Create Dynamic Style Database
**Priority:** High | **Estimated Time:** 4 hours

**Requirements:**
- Create comprehensive style database with project-type compatibility
- Each style must define:
  - `name`: Style name (e.g., "Modern Farmhouse", "Industrial", "Bohemian")
  - `description`: Brief style description
  - `compatibleSpaces`: Array of space types it works with
  - `incompatibleSpaces`: Array of spaces it doesn't work with  
  - `colorPalette`: Typical colors for this style
  - `keyCharacteristics`: Array of style traits
  - `popularity`: Number for sorting popular styles first

**Garden-Appropriate Styles:**
- Mediterranean Garden
- Modern Landscape
- Cottage Garden
- Japanese Garden
- Desert/Xeriscaping
- Tropical Garden
- French Garden
- English Garden

**Indoor Styles:**
- Scandinavian
- Modern
- Minimalist
- Industrial
- Bohemian
- Mid-Century Modern
- Traditional
- Transitional
- Farmhouse
- Art Deco
- Eclectic

**Deliverables:**
- `src/data/stylesDatabase.ts` - Complete style definitions
- Type definitions for style objects
- Utility functions for filtering styles by space type

---

### Task 1.2: Implement Smart Style Filtering
**Priority:** High | **Estimated Time:** 3 hours
**Dependencies:** Task 1.1

**Requirements:**
- Filter styles based on current project's space type
- Show only appropriate styles for the selected space
- Maintain popularity-based ordering within filtered results
- Handle edge cases where no styles match (fallback to "Universal" styles)

**Deliverables:**
- Update `StyleSelectionScreen.tsx` with filtering logic
- Add "Universal" styles that work with any space type
- Error handling for empty results

---

### Task 1.3: Redesign Style Selection UI
**Priority:** High | **Estimated Time:** 5 hours
**Dependencies:** Task 1.2

**Requirements:**
- **Smaller Cards:** Reduce card height to show 3-4 styles per screen
- **Grid Layout:** 2 columns on mobile, 3 on tablets
- **Quick Preview:** Show style characteristics on card
- **Visual Icons:** Add style-specific icons or mini previews
- **Better Typography:** Improve readability and hierarchy

**Design Specifications:**
```
Card Dimensions: 
- Height: 140px (down from current ~200px)
- Width: (screenWidth - 60px) / 2
- Border radius: 12px
- Padding: 12px

Layout:
- 2-column grid with 12px gap
- Horizontal scroll for additional styles if needed
```

**Deliverables:**
- Updated `StyleSelectionScreen.tsx` with new layout
- New style card component with improved design
- Responsive layout that adapts to screen size

---

## EPIC 2: Curated Reference System

### Task 2.1: Reference Data Architecture
**Priority:** High | **Estimated Time:** 6 hours

**Requirements:**
- Design reference image database schema
- Each reference must include:
  - `id`: Unique identifier
  - `imageUrl`: High-quality image URL
  - `tags`: Array of searchable tags
  - `style`: Compatible style(s)
  - `spaceType`: Room/space type
  - `colors`: Dominant colors extracted
  - `category`: "furniture", "decor", "layout", "color-scheme"
  - `source`: "internal", "pinterest", "unsplash", "user-upload"
  - `popularity`: Engagement metrics
  - `dateAdded`: For freshness sorting

**Pinterest API Integration:**
- Research Pinterest API for fetching curated boards
- Implement rate limiting and caching
- Create fallback system for API failures

**Alternative Sources:**
- Unsplash API for high-quality interior design photos
- Internal curated collection as primary source
- User uploads as secondary source

**Deliverables:**
- Database schema for references
- Pinterest/Unsplash API integration services
- Reference data seeding script with initial 500+ images
- Image tagging and categorization system

---

### Task 2.2: Intelligent Reference Filtering
**Priority:** High | **Estimated Time:** 4 hours
**Dependencies:** Task 2.1

**Requirements:**
- **Pre-filtering Logic:** Start filtering as soon as user selects style (2 screens before)
- **Background Loading:** Fetch and cache references while user progresses through flow
- **Multi-criteria Filtering:**
  - Primary: Match selected style
  - Secondary: Match space type
  - Tertiary: Match color preferences (if available)
  - Quaternary: Popular/trending references

**Filtering Algorithm:**
```typescript
interface FilterCriteria {
  style: string;           // From style selection screen
  spaceType: string;       // From space definition screen  
  colorPreferences?: string[]; // From previous user sessions
  excludeUserUploads?: boolean; // Option to hide user content
}
```

**Performance Requirements:**
- Filter and cache results in <500ms
- Preload images for smooth scrolling
- Implement image lazy loading
- Maximum 50 references per filter result

**Deliverables:**
- `ReferenceFilteringService.ts` - Smart filtering logic
- Background caching service
- Performance optimizations for image loading

---

### Task 2.3: Reference Selection Screen Redesign  
**Priority:** High | **Estimated Time:** 6 hours
**Dependencies:** Task 2.2

**Requirements:**
- **Screen Title:** Change from "References & Colors" to just "References"
- **Pinterest-Style Grid:** Masonry layout with varying image heights
- **Touch Interactions:**
  - Tap to select/deselect (with visual feedback)
  - Long press for full-screen preview
  - Swipe gestures for quick navigation
- **Selection Management:**
  - Multiple selection with checkmarks
  - Selection counter in header
  - Clear all / select recommended options

**UI Components Needed:**
```typescript
<ReferenceGrid 
  references={filteredReferences}
  selectedIds={selectedReferenceIds}
  onSelectionChange={handleSelectionChange}
  onImagePress={handleImagePress}
  columns={2} // responsive
/>

<ReferenceMasonryItem
  reference={reference}
  isSelected={isSelected}
  onToggle={onToggle}
  onFavorite={onFavorite}
/>

<ReferencePreviewModal
  reference={reference}  
  isVisible={isModalVisible}
  onClose={closeModal}
  onFavorite={onFavorite}
/>
```

**Deliverables:**
- New `ReferenceSelectionScreen.tsx` 
- `ReferenceGrid` component with masonry layout
- `ReferencePreviewModal` for full-screen viewing
- Selection state management

---

### Task 2.4: User Reference Management
**Priority:** Medium | **Estimated Time:** 5 hours
**Dependencies:** Task 2.3

**Requirements:**
- **Upload Functionality:**
  - Camera capture option
  - Photo library selection
  - Multiple image upload
  - Image compression and optimization
  - Upload progress indicators

- **Favorites System:**
  - Bookmark icon on each reference
  - Personal favorites collection
  - Sync favorites across devices (if user is logged in)
  - Export favorites functionality

- **Personal Collection:**
  - "My References" tab/section
  - Delete uploaded references
  - Edit reference tags/categories
  - Share references with others

**Storage Strategy:**
- User uploads → Cloud storage (Supabase/Firebase)
- Favorites → Local storage + cloud sync
- Cache management for offline viewing

**Deliverables:**
- Image upload service with compression
- Favorites management system  
- User collection screen/tab
- Cloud storage integration

---

### Task 2.5: Advanced Reference Features
**Priority:** Low | **Estimated Time:** 4 hours
**Dependencies:** Task 2.4

**Requirements:**
- **Smart Recommendations:**
  - "Similar to this" suggestions
  - ML-based style matching
  - Color palette extraction and matching

- **Collection Organization:**
  - Create custom collections/boards
  - Tag-based organization
  - Search within personal references

- **Social Features:**
  - Share reference collections
  - Follow other users' public collections
  - Community voting on references

**Deliverables:**
- Recommendation engine
- Collection management features
- Social sharing functionality

---

## EPIC 3: Integration & Flow Improvements

### Task 3.1: Screen Navigation Flow Update
**Priority:** High | **Estimated Time:** 2 hours
**Dependencies:** Task 1.3, Task 2.3

**Requirements:**
- Update navigation to use new reference screen
- Remove redirect to Pinterest screen
- Add proper state passing between screens
- Update progress indicators

**Flow Updates:**
```
Style Selection → [Background Reference Filtering] → Photo Capture → Reference Selection → Budget → Element Selection → AI Processing
```

**Deliverables:**
- Updated navigation configuration
- Screen transition animations
- State management between screens

---

### Task 3.2: Performance Optimization
**Priority:** Medium | **Estimated Time:** 3 hours
**Dependencies:** All previous tasks

**Requirements:**
- Image caching and optimization
- Lazy loading implementation
- Memory management for large image collections
- Network error handling and retry logic

**Performance Targets:**
- Screen load time: <1 second
- Image grid scroll: 60fps
- Memory usage: <100MB for image cache
- Network requests: Batch and optimize

**Deliverables:**
- Caching service
- Performance monitoring
- Memory optimization
- Network retry logic

---

## Technical Architecture

### Data Flow
```
User selects Style → Background API calls start → 
User progresses through flow → References pre-filtered and cached → 
User arrives at Reference screen → Images already loaded → 
Smooth selection experience
```

### API Endpoints Needed
```typescript
// Reference Management
GET /api/references?style={style}&space={space}&limit={limit}
POST /api/references/upload
GET /api/references/favorites
POST /api/references/{id}/favorite

// Pinterest Integration  
GET /api/pinterest/boards/{boardId}/pins
GET /api/pinterest/search?query={query}&style={style}

// User Collections
GET /api/users/{userId}/references
POST /api/users/{userId}/collections
```

### Database Schema
```sql
-- References table
references (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  tags TEXT[],
  style VARCHAR(50),
  space_type VARCHAR(50), 
  dominant_colors JSON,
  category VARCHAR(30),
  source VARCHAR(20),
  popularity_score INTEGER,
  created_at TIMESTAMP
);

-- User favorites
user_favorites (
  user_id UUID,
  reference_id UUID,
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, reference_id)
);
```

## Acceptance Criteria

### Style Selection Screen
- ✅ Only shows styles appropriate for selected space type
- ✅ Garden projects show garden-specific styles
- ✅ Interior projects show interior-specific styles  
- ✅ Smaller card design shows 3-4 styles per screen
- ✅ Grid layout is responsive and performs smoothly

### Reference Selection Screen
- ✅ Screen title shows "References" only
- ✅ Displays 20+ curated references matching user's style
- ✅ Pinterest-style masonry grid layout
- ✅ Multi-selection with visual feedback
- ✅ Favorite/bookmark functionality works
- ✅ Upload custom references works
- ✅ Loading time <1 second with cached data

### Integration
- ✅ Reference filtering starts 2 screens before user arrives
- ✅ Smooth navigation between all screens
- ✅ No crashes or performance issues
- ✅ Works offline with cached references

## Timeline & Resource Allocation

**Total Estimated Time:** 37 hours
**Recommended Team Size:** 2-3 developers working in parallel

**Phase 1 (Week 1):** Core Foundation
- Task 1.1, 1.2, 2.1 (Parallel development possible)

**Phase 2 (Week 2):** UI Implementation  
- Task 1.3, 2.2, 2.3 (UI and backend can be parallel)

**Phase 3 (Week 3):** Advanced Features
- Task 2.4, 3.1, 3.2 (Final integration and optimization)

**Phase 4 (Optional):** Enhancement Features
- Task 2.5 (Can be developed post-launch)

## Risk Mitigation

1. **Pinterest API Limitations:** Have Unsplash and internal collection as fallbacks
2. **Image Loading Performance:** Implement aggressive caching and lazy loading
3. **User Upload Abuse:** Add content moderation and file size limits
4. **Network Connectivity:** Robust offline support with cached content

This PRD provides enough detail for multiple developers to work in parallel while avoiding conflicts through clear task separation and dependency management.