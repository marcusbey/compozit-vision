# Reference Library & Color Extraction Systems - PRD

## 📋 Product Requirements Document
**Version:** 1.0  
**Date:** December 28, 2024  
**Phase:** 4 Implementation - Advanced Features  

---

## 🎯 **Overview**

### **Purpose**
Implement advanced reference library and color extraction systems that allow users to personalize their design preferences through image uploads, color palette creation, and AI-powered visual analysis.

### **Business Context**
- **User Journey Step:** S11 - References & Colors Selection
- **Target Users:** Premium subscribers seeking personalized design experiences
- **Business Impact:** Increase user engagement, retention, and satisfaction through personalization

### **Success Criteria**
- Users can upload and manage reference images
- AI extracts dominant colors from uploaded images
- Users can create and save custom color palettes
- Reference images influence AI design generation
- 90%+ user satisfaction with personalization features

---

## 🏗️ **System Architecture**

### **Technical Stack**
- **Frontend:** React Native with Expo
- **Image Processing:** Expo ImagePicker + Canvas API
- **Color Extraction:** ColorThief.js or similar library
- **Storage:** Supabase Storage for images
- **Database:** PostgreSQL for metadata
- **AI Integration:** Google Gemini Vision API

### **Data Flow**
```
User Upload → Image Processing → Color Extraction → Database Storage → AI Context → Design Generation
```

---

## 🗄️ **Database Schema**

### **New Tables Required**

#### **1. user_reference_images**
```sql
CREATE TABLE public.user_reference_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Image metadata
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Image properties
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/jpeg',
  
  -- User metadata
  user_title TEXT,
  user_description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Color analysis
  dominant_colors JSONB, -- Array of hex colors
  color_palette_id UUID REFERENCES user_color_palettes(id),
  
  -- AI analysis
  ai_description TEXT,
  style_tags TEXT[] DEFAULT '{}',
  mood_tags TEXT[] DEFAULT '{}',
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_reference_images_user_id ON user_reference_images(user_id);
CREATE INDEX idx_user_reference_images_project_id ON user_reference_images(project_id);
CREATE INDEX idx_user_reference_images_tags ON user_reference_images USING GIN(tags);
CREATE INDEX idx_user_reference_images_favorite ON user_reference_images(user_id, is_favorite);
```

#### **2. user_color_palettes**
```sql
CREATE TABLE public.user_color_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Palette metadata
  name TEXT NOT NULL,
  description TEXT,
  
  -- Colors (hex values)
  colors JSONB NOT NULL, -- {"primary": "#hex", "secondary": "#hex", "accent": "#hex", "colors": ["#hex1", "#hex2"...]}
  
  -- Source information
  source_type TEXT CHECK (source_type IN ('user_created', 'extracted', 'preset')),
  source_reference_id UUID REFERENCES user_reference_images(id),
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',
  mood_tags TEXT[] DEFAULT '{}',
  style_compatibility TEXT[] DEFAULT '{}', -- Compatible design styles
  
  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_color_palettes_user_id ON user_color_palettes(user_id);
CREATE INDEX idx_user_color_palettes_favorite ON user_color_palettes(user_id, is_favorite);
CREATE INDEX idx_user_color_palettes_public ON user_color_palettes(is_public);
```

#### **3. reference_usage_history**
```sql
CREATE TABLE public.reference_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Reference details
  reference_type TEXT CHECK (reference_type IN ('image', 'palette')),
  reference_id UUID, -- References either user_reference_images.id or user_color_palettes.id
  
  -- Usage context
  used_in_step TEXT, -- Which wizard step it was used in
  influence_weight DECIMAL DEFAULT 0.5, -- How much it influenced the design (0-1)
  
  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reference_usage_history_user_id ON reference_usage_history(user_id);
CREATE INDEX idx_reference_usage_history_project_id ON reference_usage_history(project_id);
```

---

## 📱 **User Interface Specifications**

### **1. References Selection Screen (S11)**

#### **Layout Structure**
```
┌─────────────────────────────────────────┐
│ [<] References & Colors        [?]      │
├─────────────────────────────────────────┤
│ Upload your inspiration images          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │   📷    │ │  Image  │ │  Image  │     │
│ │ Upload  │ │    1    │ │    2    │     │
│ └─────────┘ └─────────┘ └─────────┘     │
│                                         │
│ Choose color palettes                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │ ████████│ │ ████████│ │ ████████│     │
│ │ Palette │ │ Palette │ │ Custom  │     │
│ └─────────┘ └─────────┘ └─────────┘     │
│                                         │
│ [Continue]                              │
└─────────────────────────────────────────┘
```

#### **Interactive Elements**
- **Upload Button:** Camera/gallery selection
- **Reference Image Cards:** Preview, edit, delete options
- **Color Palette Cards:** Preview, select, customize
- **Color Extraction:** Automatic from uploaded images
- **Progress Indicator:** Show step 5/5

### **2. Image Upload Modal**

#### **Features**
- **Source Selection:** Camera vs Gallery
- **Image Cropping:** Square crop for consistency
- **Title/Description Input:** User metadata
- **Tag Selection:** Pre-defined tags + custom
- **AI Analysis:** Automatic style/mood detection

### **3. Color Palette Creator**

#### **Features**
- **Color Picker:** Advanced color selection
- **Extracted Colors:** From uploaded images
- **Palette Templates:** Popular combinations
- **Preview Mode:** See colors in room context
- **Save/Name:** Custom palette naming

---

## 🔧 **Technical Implementation**

### **1. Image Upload & Processing Service**

```typescript
export class ReferenceImageService {
  private supabase = createClient();
  private colorExtractor = new ColorExtractor();

  async uploadReferenceImage(
    userId: string,
    projectId: string,
    imageUri: string,
    metadata: ReferenceImageMetadata
  ): Promise<ReferenceImage> {
    try {
      // 1. Process image (resize, optimize)
      const processedImage = await this.processImage(imageUri);
      
      // 2. Upload to storage
      const storagePath = `references/${userId}/${Date.now()}.jpg`;
      const { data: uploadData } = await this.supabase.storage
        .from('reference-images')
        .upload(storagePath, processedImage);

      // 3. Extract dominant colors
      const dominantColors = await this.colorExtractor.extract(processedImage);
      
      // 4. AI analysis for style/mood
      const aiAnalysis = await this.analyzeImageWithAI(processedImage);
      
      // 5. Create thumbnail
      const thumbnailPath = await this.createThumbnail(processedImage, storagePath);
      
      // 6. Save to database
      const { data } = await this.supabase
        .from('user_reference_images')
        .insert({
          user_id: userId,
          project_id: projectId,
          storage_path: storagePath,
          image_url: uploadData.path,
          thumbnail_url: thumbnailPath,
          user_title: metadata.title,
          user_description: metadata.description,
          tags: metadata.tags,
          dominant_colors: dominantColors,
          ai_description: aiAnalysis.description,
          style_tags: aiAnalysis.styleTags,
          mood_tags: aiAnalysis.moodTags,
          width: processedImage.width,
          height: processedImage.height,
        })
        .select()
        .single();
        
      return data;
    } catch (error) {
      throw new Error(`Failed to upload reference image: ${error.message}`);
    }
  }

  private async analyzeImageWithAI(image: ProcessedImage): Promise<AIAnalysis> {
    // Use Gemini Vision API to analyze image for design elements
    const response = await geminiVisionClient.analyzeImage(image, {
      prompt: `Analyze this interior design reference image. Identify:
        1. Design style (modern, traditional, minimalist, etc.)
        2. Mood/atmosphere (cozy, elegant, bold, etc.)
        3. Key design elements
        4. Color story
        Respond in JSON format.`
    });
    
    return JSON.parse(response);
  }
}
```

### **2. Color Extraction Service**

```typescript
export class ColorExtractor {
  async extract(imageUri: string): Promise<DominantColors> {
    try {
      // Load image for color analysis
      const image = await this.loadImage(imageUri);
      
      // Use ColorThief or similar library
      const colorThief = new ColorThief();
      const dominantColor = colorThief.getColor(image);
      const palette = colorThief.getPalette(image, 8);
      
      // Convert to hex and organize
      const colors = {
        primary: this.rgbToHex(dominantColor),
        palette: palette.map(color => this.rgbToHex(color)),
        complementary: this.generateComplementary(dominantColor),
        analogous: this.generateAnalogous(dominantColor)
      };
      
      return colors;
    } catch (error) {
      throw new Error(`Color extraction failed: ${error.message}`);
    }
  }

  private rgbToHex(rgb: number[]): string {
    return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }
}
```

### **3. Color Palette Management**

```typescript
export class ColorPaletteService {
  async createPalette(
    userId: string,
    paletteData: CreatePaletteRequest
  ): Promise<ColorPalette> {
    const { data } = await this.supabase
      .from('user_color_palettes')
      .insert({
        user_id: userId,
        name: paletteData.name,
        description: paletteData.description,
        colors: paletteData.colors,
        source_type: paletteData.sourceType,
        source_reference_id: paletteData.sourceReferenceId,
        tags: paletteData.tags,
        mood_tags: paletteData.moodTags,
      })
      .select()
      .single();
      
    return data;
  }

  async getPalettesByUser(userId: string): Promise<ColorPalette[]> {
    const { data } = await this.supabase
      .from('user_color_palettes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    return data || [];
  }
}
```

---

## 📊 **State Management Integration**

### **Enhanced ContentStore**

```typescript
interface ReferenceState {
  // User uploaded references
  userReferenceImages: ReferenceImage[];
  userColorPalettes: ColorPalette[];
  
  // Current selections
  selectedReferenceIds: string[];
  selectedPaletteIds: string[];
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  uploadReferenceImage: (imageUri: string, metadata: ReferenceMetadata) => Promise<void>;
  deleteReferenceImage: (imageId: string) => Promise<void>;
  createColorPalette: (paletteData: CreatePaletteRequest) => Promise<void>;
  selectReference: (referenceId: string) => void;
  selectPalette: (paletteId: string) => void;
  loadUserReferences: () => Promise<void>;
  extractColorsFromImage: (imageId: string) => Promise<ColorPalette>;
}
```

---

## 🎨 **UI Components**

### **1. ReferenceImageCard Component**

```typescript
interface ReferenceImageCardProps {
  image: ReferenceImage;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ReferenceImageCard: React.FC<ReferenceImageCardProps> = ({
  image,
  isSelected,
  onSelect,
  onDelete,
  onEdit
}) => {
  return (
    <TouchableOpacity
      style={[styles.imageCard, isSelected && styles.selectedCard]}
      onPress={() => onSelect(image.id)}
    >
      <Image source={{ uri: image.thumbnail_url }} style={styles.cardImage} />
      
      {/* Selection overlay */}
      {isSelected && (
        <View style={styles.selectionOverlay}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
      
      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onEdit(image.id)}>
          <Ionicons name="pencil" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(image.id)}>
          <Ionicons name="trash" size={16} color="#FF5252" />
        </TouchableOpacity>
      </View>
      
      {/* Metadata */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{image.user_title}</Text>
        <View style={styles.colorPreview}>
          {image.dominant_colors.palette.slice(0, 4).map((color, index) => (
            <View
              key={index}
              style={[styles.colorDot, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};
```

### **2. ColorPaletteCard Component**

```typescript
const ColorPaletteCard: React.FC<ColorPaletteCardProps> = ({
  palette,
  isSelected,
  onSelect
}) => {
  return (
    <TouchableOpacity
      style={[styles.paletteCard, isSelected && styles.selectedPalette]}
      onPress={() => onSelect(palette.id)}
    >
      {/* Color swatches */}
      <View style={styles.colorSwatches}>
        {Object.values(palette.colors.colors).slice(0, 5).map((color, index) => (
          <View
            key={index}
            style={[
              styles.colorSwatch,
              { backgroundColor: color as string }
            ]}
          />
        ))}
      </View>
      
      <Text style={styles.paletteName}>{palette.name}</Text>
      
      {palette.is_favorite && (
        <Ionicons name="heart" size={14} color="#FF5252" />
      )}
    </TouchableOpacity>
  );
};
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Color extraction accuracy
- Image upload/processing
- Database operations
- State management

### **Integration Tests**
- End-to-end upload flow
- AI analysis integration
- Palette creation workflow

### **User Experience Tests**
- Upload performance
- Color extraction speed
- Reference selection flow
- Mobile responsiveness

---

## 📈 **Analytics & Tracking**

### **Key Metrics**
- Upload success rate
- Color extraction accuracy
- User engagement with references
- Palette creation frequency
- Reference influence on final designs

### **Events to Track**
- `reference_image_uploaded`
- `color_palette_created`
- `reference_selected_for_design`
- `palette_applied_to_design`
- `reference_deleted`
- `palette_shared`

---

## 🚀 **Implementation Tasks Breakdown**

### **Phase 1: Core Infrastructure (Week 1)**
- [ ] Create database tables and indexes
- [ ] Set up Supabase storage bucket for reference images
- [ ] Implement basic image upload service
- [ ] Create color extraction utility
- [ ] Set up image processing pipeline

### **Phase 2: Reference Management (Week 2)**
- [ ] Build reference image upload flow
- [ ] Implement image metadata management
- [ ] Create reference image grid UI
- [ ] Add image editing capabilities (crop, rotate)
- [ ] Implement reference deletion/management

### **Phase 3: Color System (Week 3)**
- [ ] Build color extraction from uploaded images
- [ ] Create color palette management system
- [ ] Design color palette UI components
- [ ] Implement custom palette creation
- [ ] Add palette favorites/organization

### **Phase 4: AI Integration (Week 4)**
- [ ] Integrate Gemini Vision API for image analysis
- [ ] Implement style/mood detection
- [ ] Create AI-suggested palettes
- [ ] Add smart reference recommendations
- [ ] Optimize AI processing performance

### **Phase 5: Integration & Testing (Week 5)**
- [ ] Integrate with existing wizard flow
- [ ] Connect references to AI design generation
- [ ] Implement usage tracking and analytics
- [ ] Performance optimization
- [ ] Comprehensive testing and bug fixes

---

## 📋 **Detailed Task Checklist**

### **Database & Backend**
- [ ] Execute database migration for new tables
- [ ] Set up Supabase RLS policies for user data
- [ ] Configure storage bucket with proper permissions
- [ ] Create database functions for color operations
- [ ] Set up background job for image processing

### **Image Processing**
- [ ] Implement image resizing and optimization
- [ ] Create thumbnail generation system
- [ ] Add image format conversion (HEIC → JPEG)
- [ ] Implement color extraction with ColorThief.js
- [ ] Create image metadata extraction

### **User Interface**
- [ ] Design references selection screen layout
- [ ] Create image upload modal with camera/gallery options
- [ ] Build reference image grid with selection states
- [ ] Design color palette selector UI
- [ ] Implement color palette creator modal
- [ ] Add image editing interface (crop, title, tags)

### **State Management**
- [ ] Extend contentStore with reference management
- [ ] Add upload progress tracking
- [ ] Implement reference selection state
- [ ] Create palette management actions
- [ ] Add offline storage for user references

### **AI Integration**
- [ ] Set up Gemini Vision API client
- [ ] Implement style analysis prompts
- [ ] Create mood detection system
- [ ] Build color harmony analysis
- [ ] Add reference influence scoring

### **Testing**
- [ ] Unit tests for color extraction
- [ ] Integration tests for upload flow
- [ ] UI tests for reference selection
- [ ] Performance tests for image processing
- [ ] E2E tests for complete reference workflow

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- Image upload success rate > 98%
- Color extraction time < 2 seconds
- Reference selection flow completion > 95%
- Zero data loss in reference management

### **User Experience Metrics**
- User satisfaction score > 4.5/5
- Reference feature adoption > 80%
- Average references per project > 2
- Palette creation rate > 40%

### **Business Metrics**
- Increased project completion rate
- Higher user retention with personalization
- Premium feature engagement
- Reduced support tickets for customization

---

This comprehensive PRD provides the complete specification for implementing the Reference Library and Color Extraction Systems, ensuring all technical, UI, and business requirements are covered for successful implementation.