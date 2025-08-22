// AI Processing Types for Enhanced Design Generation

export interface SpaceAnalysis {
  id: string;
  userId: string;
  projectId?: string;
  imageUrl: string;
  processedImageUrl?: string;
  roomType: RoomType;
  roomTypeConfidence: number;
  dimensions?: SpaceDimensions;
  existingFurniture: DetectedFurniture[];
  spatialFeatures: SpatialFeatures;
  styleAnalysis: StyleAnalysis;
  lightingAnalysis: LightingAnalysis;
  colorPalette: ColorInfo[];
  recommendations: StyleRecommendation[];
  analysisMetadata?: Record<string, any>;
  status: AnalysisStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceDimensions {
  estimatedLength: number; // meters
  estimatedWidth: number;  // meters
  estimatedHeight: number; // meters
  confidenceScore: number; // 0-1
  ceilingType: 'flat' | 'vaulted' | 'sloped';
}

export interface DetectedFurniture {
  category: string;
  subCategory?: string;
  boundingBox: BoundingBox;
  confidenceScore: number;
  estimatedSize?: FurnitureSize;
  material?: string;
  color?: ColorInfo;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface BoundingBox {
  x: number;      // normalized 0-1
  y: number;      // normalized 0-1
  width: number;  // normalized 0-1
  height: number; // normalized 0-1
}

export interface FurnitureSize {
  width: number;  // meters
  depth: number;  // meters
  height: number; // meters
}

export interface SpatialFeatures {
  windows: WindowFeature[];
  doors: DoorFeature[];
  wallSegments: WallSegment[];
  floorType: string;
  hasFireplace: boolean;
  hasBuiltIns: boolean;
  architecturalFeatures: string[];
}

export interface WindowFeature {
  location: BoundingBox;
  type: 'standard' | 'bay' | 'floor-to-ceiling';
  estimatedSize?: Size2D;
  hasCoverings: boolean;
  naturalLight: 'low' | 'medium' | 'high';
}

export interface DoorFeature {
  location: BoundingBox;
  type: 'standard' | 'french' | 'sliding';
  estimatedSize?: Size2D;
  isOpen: boolean;
}

export interface WallSegment {
  startPoint: Point2D;
  endPoint: Point2D;
  estimatedLength: number;
  hasFeatures: string[];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;  // meters
  height: number; // meters
}

export interface StyleAnalysis {
  primaryStyle: string;
  secondaryStyles: string[];
  styleConfidence: number;
  designElements: DesignElement[];
  currentAmbiance: string;
}

export interface DesignElement {
  type: 'pattern' | 'texture' | 'shape';
  description: string;
  prominence: number; // 0-1
}

export interface LightingAnalysis {
  naturalLightLevel: 'low' | 'medium' | 'high';
  artificialLights: LightFixture[];
  overallBrightness: number; // 0-1
  lightingQuality: 'warm' | 'cool' | 'neutral';
  shadowAreas: BoundingBox[];
  recommendations: string[];
}

export interface LightFixture {
  type: string;
  location: BoundingBox;
  status: 'on' | 'off' | 'unknown';
}

export interface ColorInfo {
  hex: string;
  rgb: RGBColor;
  name: string;
  prominence: number; // 0-1
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface StyleRecommendation {
  styleId: string;
  styleName: string;
  description: string;
  compatibilityScore: number;
  reasoningNotes: string[];
  previewImageUrl?: string;
}

export interface StyleReference {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'modern' | 'traditional' | 'eclectic' | 'minimalist' | 'industrial' | 'scandinavian' | 'bohemian';
  characteristicTags: string[];
  colorPalettes: StyleColorPalette[];
  furnitureStyles: FurnitureStyleGuide[];
  ambianceOptions: AmbianceOption[];
  roomExamples: RoomExample[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StyleColorPalette {
  name: string;
  primaryColors: ColorInfo[];
  accentColors: ColorInfo[];
  neutralColors: ColorInfo[];
  usage: 'walls' | 'furniture' | 'accents' | 'mixed';
}

export interface FurnitureStyleGuide {
  categoryId: string;
  categoryName: string;
  characteristics: string[];
  materials: string[];
  shapes: string[];
  exampleProducts?: string[];
}

export interface AmbianceOption {
  id: string;
  name: string;
  description: string;
  moodTags: string[];
  lightingPreset: string;
  colorAdjustment: string;
  textureEmphasis: string;
  previewImageUrl?: string;
}

export interface RoomExample {
  roomType: RoomType;
  imageUrl: string;
  description: string;
  keyFeatures: string[];
  furnitureItemIds?: string[];
}

export interface EnhancedGenerationRequest {
  spaceAnalysisId: string;
  styleReferenceId: string;
  ambianceOptionId: string;
  colorPaletteIndex: number;
  furnitureOptions: FurnitureOptions;
  customParameters?: Record<string, any>;
}

export interface FurnitureOptions {
  preserveExisting: boolean;
  budgetRange: BudgetRange;
  preferredBrands?: string[];
  preferredMaterials?: string[];
  excludeCategories?: string[];
}

export interface BudgetRange {
  min?: number;
  max?: number;
  currency: string;
}

export interface EnhancedGenerationResult {
  id: string;
  requestId: string;
  userId: string;
  spaceAnalysisId: string;
  generatedImageUrl: string;
  styleApplied: StyleApplication;
  furnitureProposed: ProposedFurniture[];
  estimatedCost: CostEstimate;
  qualityMetrics: QualityMetrics;
  status: GenerationStatus;
  processingTime: number;
  createdAt: string;
}

export interface StyleApplication {
  styleReferenceId: string;
  ambianceOptionId: string;
  colorPaletteUsed: StyleColorPalette;
  applicationNotes: string[];
  confidenceScore: number;
}

export interface ProposedFurniture {
  furnitureItemId: string;
  variationId?: string;
  placement: FurniturePlacement;
  reasoning: string;
  alternativeIds?: string[];
}

export interface FurniturePlacement {
  x: number;        // normalized 0-1
  y: number;        // normalized 0-1
  rotation: number; // degrees
  scale: number;    // relative to original
  zIndex: number;   // layering order
}

export interface CostEstimate {
  furnitureCost: number;
  deliveryCost: number;
  installationCost: number;
  totalCost: number;
  currency: string;
  savingsAmount?: number;
  savingsPercent?: number;
}

export interface QualityMetrics {
  styleAccuracy: number;   // 0-1
  colorHarmony: number;    // 0-1
  spatialBalance: number;  // 0-1
  lightingQuality: number; // 0-1
  overallScore: number;    // 0-1
}

// Enums
export type RoomType = 
  | 'living_room'
  | 'bedroom'
  | 'dining_room'
  | 'kitchen'
  | 'bathroom'
  | 'office'
  | 'outdoor'
  | 'entryway'
  | 'kids_room';

export type AnalysisStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type GenerationStatus = 
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Helper functions
export const getRoomTypeLabel = (roomType: RoomType): string => {
  const labels: Record<RoomType, string> = {
    living_room: 'Living Room',
    bedroom: 'Bedroom',
    dining_room: 'Dining Room',
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    office: 'Office',
    outdoor: 'Outdoor',
    entryway: 'Entryway',
    kids_room: "Kids' Room"
  };
  return labels[roomType] || roomType;
};

export const getStatusColor = (status: AnalysisStatus | GenerationStatus): string => {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'processing':
    case 'queued':
      return '#2196F3';
    case 'failed':
      return '#F44336';
    case 'cancelled':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

export const calculateConfidenceLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 0.5) return 'low';
  if (score < 0.8) return 'medium';
  return 'high';
};