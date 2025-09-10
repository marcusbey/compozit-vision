# Asset Consolidation Plan

## Current Asset Structure Issues

The current asset directory has significant duplication and organizational problems:

### 🚨 **Major Duplication Problems:**
- `illustration/` vs `illustrations/` - Same content type, different locations
- `images/illustrations/` vs `illustrations/` - Triple duplication of illustrations
- Multiple photography directories with similar content
- Icon directories scattered across different locations

### 📊 **Current Asset Directories:**
```
assets/
├── animations/
├── brand/
├── color-palette/
├── illustration/          ❌ DUPLICATE
├── illustrations/         ❌ DUPLICATE  
├── images/
│   ├── color-palettes/
│   ├── illustrations/     ❌ TRIPLE DUPLICATE
│   └── photography/       ❌ CONTENT OVERLAP
├── icons/
├── photography/           ❌ DUPLICATE
├── reference/
├── test-images/
└── texture/
```

## 🎯 **Proposed Consolidated Structure:**

```
assets/
├── 📂 images/              # All visual content
│   ├── 📂 branding/        # Logos, brand elements
│   ├── 📂 categories/      # Room/style category images
│   ├── 📂 color-palettes/  # Color palette samples
│   ├── 📂 illustrations/   # All SVG/PNG illustrations
│   ├── 📂 photography/     # All photo references
│   ├── 📂 samples/         # Room/style examples
│   └── 📂 textures/        # Material texture samples
├── 📂 icons/               # All icon assets
│   ├── 📂 categories/      # Category icons
│   ├── 📂 features/        # Feature icons
│   ├── 📂 navigation/      # UI navigation icons
│   └── 📂 ui/             # General UI icons
├── 📂 animations/          # Lottie/animation files
├── 📂 test-images/         # Development test images
└── README.md               # Asset usage guide
```

## 📋 **Consolidation Strategy:**

### **Phase 1: Merge Duplicate Illustration Directories**
```bash
# Merge all illustrations into single directory
mkdir -p assets/images/illustrations/consolidated
cp assets/illustration/* assets/images/illustrations/consolidated/
cp assets/illustrations/**/* assets/images/illustrations/consolidated/
cp assets/images/illustrations/**/* assets/images/illustrations/consolidated/
```

### **Phase 2: Consolidate Photography**
```bash
# Merge photography directories
mkdir -p assets/images/photography/consolidated
cp assets/photography/* assets/images/photography/consolidated/
cp assets/images/photography/**/* assets/images/photography/consolidated/
```

### **Phase 3: Organize Icons**
```bash
# Reorganize icons by purpose
mkdir -p assets/icons/{categories,features,navigation,ui}
# Move icons based on their usage context
```

### **Phase 4: Clean Structure**
```bash
# Remove duplicate directories after consolidation
rm -rf assets/illustration/
rm -rf assets/illustrations/
rm -rf assets/photography/
rm -rf assets/images/illustrations/
rm -rf assets/images/photography/
```

## 🔍 **File Deduplication Process:**

1. **Identify Duplicates**: Compare file hashes to find identical files
2. **Merge Unique Files**: Keep only unique assets in consolidated locations  
3. **Update References**: Update all import statements to use new paths
4. **Validate Usage**: Ensure all assets are still accessible post-move

## 📈 **Expected Benefits:**

- **Reduced Storage**: Eliminate duplicate files (~30-40% reduction)
- **Cleaner Structure**: Logical organization by asset type and usage
- **Easier Maintenance**: Single source for each type of asset
- **Better Performance**: Fewer directories to scan, faster asset loading
- **Clearer Imports**: Consistent import paths throughout the app

## 🎯 **Asset Usage Guidelines:**

### **Import Path Standards:**
```typescript
// Images
import heroImage from '@assets/images/branding/hero-image.png';
import roomPhoto from '@assets/images/photography/living-room-example.jpg';

// Icons  
import categoryIcon from '@assets/icons/categories/interior-design.svg';
import navigationIcon from '@assets/icons/navigation/home.svg';

// Textures
import woodTexture from '@assets/images/textures/wood-oak-sample.png';
```

### **Naming Conventions:**
- **Images**: `category-description.extension` (e.g., `living-room-modern.jpg`)
- **Icons**: `purpose-name.svg` (e.g., `category-interior.svg`) 
- **Textures**: `material-variant.extension` (e.g., `wood-oak.png`)

## 🚀 **Implementation Priority:**

1. **High Priority**: Remove duplicate illustration directories (immediate impact)
2. **Medium Priority**: Consolidate photography and reference images  
3. **Low Priority**: Reorganize icons and textures (can be done gradually)

This consolidation will significantly improve the project's maintainability and align the asset structure with the new feature-based screen organization.