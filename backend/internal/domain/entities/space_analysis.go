package entities

import (
	"time"

	"github.com/google/uuid"
)

// SpaceAnalysis represents the AI-powered analysis of a room/space
type SpaceAnalysis struct {
	ID                 uuid.UUID               `json:"id" db:"id"`
	UserID             uuid.UUID               `json:"user_id" db:"user_id"`
	ProjectID          *uuid.UUID              `json:"project_id,omitempty" db:"project_id"`
	ImageURL           string                  `json:"image_url" db:"image_url"`
	ProcessedImageURL  *string                 `json:"processed_image_url,omitempty" db:"processed_image_url"`
	RoomType           RoomType                `json:"room_type" db:"room_type"`
	RoomTypeConfidence float64                 `json:"room_type_confidence" db:"room_type_confidence"`
	Dimensions         *SpaceDimensions        `json:"dimensions,omitempty" db:"dimensions"`
	ExistingFurniture  []DetectedFurniture     `json:"existing_furniture" db:"existing_furniture"`
	SpatialFeatures    SpatialFeatures         `json:"spatial_features" db:"spatial_features"`
	StyleAnalysis      StyleAnalysis           `json:"style_analysis" db:"style_analysis"`
	LightingAnalysis   LightingAnalysis        `json:"lighting_analysis" db:"lighting_analysis"`
	ColorPalette       []ColorInfo             `json:"color_palette" db:"color_palette"`
	Recommendations    []StyleRecommendation   `json:"recommendations" db:"recommendations"`
	AnalysisMetadata   map[string]interface{}  `json:"analysis_metadata" db:"analysis_metadata"`
	Status             AnalysisStatus          `json:"status" db:"status"`
	CreatedAt          time.Time               `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time               `json:"updated_at" db:"updated_at"`
}

// SpaceDimensions represents estimated room dimensions from image analysis
type SpaceDimensions struct {
	EstimatedLength float64 `json:"estimated_length"` // meters
	EstimatedWidth  float64 `json:"estimated_width"`  // meters
	EstimatedHeight float64 `json:"estimated_height"` // meters
	ConfidenceScore float64 `json:"confidence_score"` // 0-1
	CeilingType     string  `json:"ceiling_type"`     // flat, vaulted, sloped
}

// DetectedFurniture represents furniture items detected in the space
type DetectedFurniture struct {
	Category        string           `json:"category"`         // chair, sofa, table, etc.
	SubCategory     *string          `json:"sub_category"`     // dining chair, office chair, etc.
	BoundingBox     BoundingBox      `json:"bounding_box"`
	ConfidenceScore float64          `json:"confidence_score"` // 0-1
	EstimatedSize   *FurnitureSize   `json:"estimated_size,omitempty"`
	Material        *string          `json:"material,omitempty"`
	Color           *ColorInfo       `json:"color,omitempty"`
	Condition       *string          `json:"condition,omitempty"` // excellent, good, fair, poor
}

// BoundingBox represents object location in image
type BoundingBox struct {
	X      float64 `json:"x"`      // normalized 0-1
	Y      float64 `json:"y"`      // normalized 0-1
	Width  float64 `json:"width"`  // normalized 0-1
	Height float64 `json:"height"` // normalized 0-1
}

// FurnitureSize represents estimated furniture dimensions
type FurnitureSize struct {
	Width  float64 `json:"width"`  // meters
	Depth  float64 `json:"depth"`  // meters
	Height float64 `json:"height"` // meters
}

// SpatialFeatures represents detected room features
type SpatialFeatures struct {
	Windows         []WindowFeature   `json:"windows"`
	Doors           []DoorFeature     `json:"doors"`
	WallSegments    []WallSegment     `json:"wall_segments"`
	FloorType       string            `json:"floor_type"`       // hardwood, carpet, tile, etc.
	HasFireplace    bool              `json:"has_fireplace"`
	HasBuiltIns     bool              `json:"has_built_ins"`     // built-in shelves, cabinets
	ArchitecturalFeatures []string     `json:"architectural_features"` // crown molding, columns, etc.
}

// WindowFeature represents a detected window
type WindowFeature struct {
	Location        BoundingBox `json:"location"`
	Type            string      `json:"type"`            // standard, bay, floor-to-ceiling
	EstimatedSize   *Size2D     `json:"estimated_size"`
	HasCoverings    bool        `json:"has_coverings"`   // curtains, blinds
	NaturalLight    string      `json:"natural_light"`   // low, medium, high
}

// DoorFeature represents a detected door
type DoorFeature struct {
	Location      BoundingBox `json:"location"`
	Type          string      `json:"type"`          // standard, french, sliding
	EstimatedSize *Size2D     `json:"estimated_size"`
	IsOpen        bool        `json:"is_open"`
}

// WallSegment represents a wall section
type WallSegment struct {
	StartPoint      Point2D  `json:"start_point"`
	EndPoint        Point2D  `json:"end_point"`
	EstimatedLength float64  `json:"estimated_length"` // meters
	HasFeatures     []string `json:"has_features"`     // outlets, switches, artwork
}

// Point2D represents a 2D point
type Point2D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Size2D represents 2D dimensions
type Size2D struct {
	Width  float64 `json:"width"`  // meters
	Height float64 `json:"height"` // meters
}

// StyleAnalysis represents the detected style characteristics
type StyleAnalysis struct {
	PrimaryStyle      string          `json:"primary_style"`       // modern, traditional, minimalist, etc.
	SecondaryStyles   []string        `json:"secondary_styles"`
	StyleConfidence   float64         `json:"style_confidence"`    // 0-1
	DesignElements    []DesignElement `json:"design_elements"`
	CurrentAmbiance   string          `json:"current_ambiance"`    // cozy, spacious, cluttered, etc.
}

// DesignElement represents specific design features
type DesignElement struct {
	Type        string  `json:"type"`        // pattern, texture, shape
	Description string  `json:"description"`
	Prominence  float64 `json:"prominence"`  // 0-1 how prominent in the space
}

// LightingAnalysis represents lighting conditions
type LightingAnalysis struct {
	NaturalLightLevel  string           `json:"natural_light_level"`  // low, medium, high
	ArtificialLights   []LightFixture   `json:"artificial_lights"`
	OverallBrightness  float64          `json:"overall_brightness"`   // 0-1
	LightingQuality    string           `json:"lighting_quality"`     // warm, cool, neutral
	ShadowAreas        []BoundingBox    `json:"shadow_areas"`
	Recommendations    []string         `json:"recommendations"`
}

// LightFixture represents a detected light source
type LightFixture struct {
	Type     string      `json:"type"`     // ceiling, floor lamp, table lamp, etc.
	Location BoundingBox `json:"location"`
	Status   string      `json:"status"`   // on, off, unknown
}

// ColorInfo represents color analysis
type ColorInfo struct {
	Hex        string  `json:"hex"`
	RGB        RGBColor `json:"rgb"`
	Name       string  `json:"name"`        // beige, navy, forest green, etc.
	Prominence float64 `json:"prominence"`  // 0-1 how much of the space
}

// RGBColor represents RGB color values
type RGBColor struct {
	R uint8 `json:"r"`
	G uint8 `json:"g"`
	B uint8 `json:"b"`
}

// StyleRecommendation represents AI-generated style suggestions
type StyleRecommendation struct {
	StyleID          uuid.UUID `json:"style_id"`
	StyleName        string    `json:"style_name"`
	Description      string    `json:"description"`
	CompatibilityScore float64 `json:"compatibility_score"` // 0-1
	ReasoningNotes   []string  `json:"reasoning_notes"`
	PreviewImageURL  *string   `json:"preview_image_url,omitempty"`
}

// StyleReference represents a design style template
type StyleReference struct {
	ID               uuid.UUID              `json:"id" db:"id"`
	Name             string                 `json:"name" db:"name"`
	Slug             string                 `json:"slug" db:"slug"`
	Description      string                 `json:"description" db:"description"`
	Category         string                 `json:"category" db:"category"` // modern, traditional, eclectic, etc.
	CharacteristicTags []string            `json:"characteristic_tags" db:"characteristic_tags"`
	ColorPalettes    []StyleColorPalette    `json:"color_palettes" db:"color_palettes"`
	FurnitureStyles  []FurnitureStyleGuide  `json:"furniture_styles" db:"furniture_styles"`
	AmbianceOptions  []AmbianceOption       `json:"ambiance_options" db:"ambiance_options"`
	RoomExamples     []RoomExample          `json:"room_examples" db:"room_examples"`
	IsActive         bool                   `json:"is_active" db:"is_active"`
	CreatedAt        time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at" db:"updated_at"`
}

// StyleColorPalette represents color schemes for a style
type StyleColorPalette struct {
	Name          string      `json:"name"`
	PrimaryColors []ColorInfo `json:"primary_colors"`
	AccentColors  []ColorInfo `json:"accent_colors"`
	NeutralColors []ColorInfo `json:"neutral_colors"`
	Usage         string      `json:"usage"` // walls, furniture, accents
}

// FurnitureStyleGuide represents furniture characteristics for a style
type FurnitureStyleGuide struct {
	CategoryID      uuid.UUID `json:"category_id"`
	CategoryName    string    `json:"category_name"`
	Characteristics []string  `json:"characteristics"` // clean lines, ornate details, etc.
	Materials       []string  `json:"materials"`       // wood, metal, glass, etc.
	Shapes          []string  `json:"shapes"`          // rectangular, curved, angular
	ExampleProducts []uuid.UUID `json:"example_products,omitempty"`
}

// AmbianceOption represents mood/atmosphere settings
type AmbianceOption struct {
	ID              uuid.UUID `json:"id" db:"id"`
	Name            string    `json:"name" db:"name"`
	Description     string    `json:"description" db:"description"`
	MoodTags        []string  `json:"mood_tags" db:"mood_tags"` // cozy, energetic, calm, etc.
	LightingPreset  string    `json:"lighting_preset" db:"lighting_preset"`
	ColorAdjustment string    `json:"color_adjustment" db:"color_adjustment"`
	TextureEmphasis string    `json:"texture_emphasis" db:"texture_emphasis"`
	PreviewImageURL *string   `json:"preview_image_url,omitempty" db:"preview_image_url"`
}

// RoomExample represents example implementations of a style
type RoomExample struct {
	RoomType        RoomType `json:"room_type"`
	ImageURL        string   `json:"image_url"`
	Description     string   `json:"description"`
	KeyFeatures     []string `json:"key_features"`
	FurnitureItemIDs []uuid.UUID `json:"furniture_item_ids,omitempty"`
}

// EnhancedGenerationRequest represents the full request for enhanced design generation
type EnhancedGenerationRequest struct {
	SpaceAnalysisID  uuid.UUID        `json:"space_analysis_id"`
	StyleReferenceID uuid.UUID        `json:"style_reference_id"`
	AmbianceOptionID uuid.UUID        `json:"ambiance_option_id"`
	ColorPaletteIndex int             `json:"color_palette_index"`
	FurnitureOptions FurnitureOptions `json:"furniture_options"`
	CustomParameters map[string]interface{} `json:"custom_parameters,omitempty"`
}

// FurnitureOptions represents furniture selection preferences
type FurnitureOptions struct {
	PreserveExisting   bool        `json:"preserve_existing"`
	BudgetRange        BudgetRange `json:"budget_range"`
	PreferredBrands    []uuid.UUID `json:"preferred_brands,omitempty"`
	PreferredMaterials []string    `json:"preferred_materials,omitempty"`
	ExcludeCategories  []string    `json:"exclude_categories,omitempty"`
}

// EnhancedGenerationResult represents the output of enhanced generation
type EnhancedGenerationResult struct {
	ID                 uuid.UUID              `json:"id" db:"id"`
	RequestID          uuid.UUID              `json:"request_id" db:"request_id"`
	UserID             uuid.UUID              `json:"user_id" db:"user_id"`
	SpaceAnalysisID    uuid.UUID              `json:"space_analysis_id" db:"space_analysis_id"`
	GeneratedImageURL  string                 `json:"generated_image_url" db:"generated_image_url"`
	StyleApplied       StyleApplication       `json:"style_applied" db:"style_applied"`
	FurnitureProposed  []ProposedFurniture    `json:"furniture_proposed" db:"furniture_proposed"`
	EstimatedCost      CostEstimate           `json:"estimated_cost" db:"estimated_cost"`
	QualityMetrics     QualityMetrics         `json:"quality_metrics" db:"quality_metrics"`
	Status             GenerationStatus       `json:"status" db:"status"`
	ProcessingTime     int                    `json:"processing_time" db:"processing_time"` // milliseconds
	CreatedAt          time.Time              `json:"created_at" db:"created_at"`
}

// StyleApplication represents how style was applied
type StyleApplication struct {
	StyleReferenceID  uuid.UUID `json:"style_reference_id"`
	AmbianceOptionID  uuid.UUID `json:"ambiance_option_id"`
	ColorPaletteUsed  StyleColorPalette `json:"color_palette_used"`
	ApplicationNotes  []string  `json:"application_notes"`
	ConfidenceScore   float64   `json:"confidence_score"`
}

// ProposedFurniture represents furniture suggestions
type ProposedFurniture struct {
	FurnitureItemID uuid.UUID      `json:"furniture_item_id"`
	VariationID     *uuid.UUID     `json:"variation_id,omitempty"`
	Placement       FurniturePlacement `json:"placement"`
	Reasoning       string         `json:"reasoning"`
	AlternativeIDs  []uuid.UUID    `json:"alternative_ids,omitempty"`
}

// FurniturePlacement represents where furniture should be placed
type FurniturePlacement struct {
	X           float64 `json:"x"`           // normalized 0-1
	Y           float64 `json:"y"`           // normalized 0-1
	Rotation    float64 `json:"rotation"`    // degrees
	Scale       float64 `json:"scale"`       // relative to original
	ZIndex      int     `json:"z_index"`     // layering order
}

// CostEstimate represents pricing breakdown
type CostEstimate struct {
	FurnitureCost   float64  `json:"furniture_cost"`
	DeliveryCost    float64  `json:"delivery_cost"`
	InstallationCost float64 `json:"installation_cost"`
	TotalCost       float64  `json:"total_cost"`
	Currency        string   `json:"currency"`
	SavingsAmount   *float64 `json:"savings_amount,omitempty"`
	SavingsPercent  *float64 `json:"savings_percent,omitempty"`
}

// QualityMetrics represents generation quality indicators
type QualityMetrics struct {
	StyleAccuracy      float64 `json:"style_accuracy"`      // 0-1
	ColorHarmony       float64 `json:"color_harmony"`       // 0-1
	SpatialBalance     float64 `json:"spatial_balance"`     // 0-1
	LightingQuality    float64 `json:"lighting_quality"`    // 0-1
	OverallScore       float64 `json:"overall_score"`       // 0-1
}

// Enums

// AnalysisStatus represents the status of space analysis
type AnalysisStatus string

const (
	AnalysisStatusPending    AnalysisStatus = "pending"
	AnalysisStatusProcessing AnalysisStatus = "processing"
	AnalysisStatusCompleted  AnalysisStatus = "completed"
	AnalysisStatusFailed     AnalysisStatus = "failed"
)

// GenerationStatus represents the status of design generation
type GenerationStatus string

const (
	GenerationStatusQueued     GenerationStatus = "queued"
	GenerationStatusProcessing GenerationStatus = "processing"
	GenerationStatusCompleted  GenerationStatus = "completed"
	GenerationStatusFailed     GenerationStatus = "failed"
	GenerationStatusCancelled  GenerationStatus = "cancelled"
)

// Business Logic Methods

// GetPrimaryColors returns the most prominent colors in the space
func (sa *SpaceAnalysis) GetPrimaryColors(limit int) []ColorInfo {
	if len(sa.ColorPalette) <= limit {
		return sa.ColorPalette
	}
	return sa.ColorPalette[:limit]
}

// HasSufficientLighting checks if the space has adequate lighting
func (sa *SpaceAnalysis) HasSufficientLighting() bool {
	return sa.LightingAnalysis.OverallBrightness >= 0.6
}

// GetFurnitureCategories returns unique furniture categories detected
func (sa *SpaceAnalysis) GetFurnitureCategories() []string {
	categoryMap := make(map[string]bool)
	for _, furniture := range sa.ExistingFurniture {
		categoryMap[furniture.Category] = true
	}
	
	categories := make([]string, 0, len(categoryMap))
	for category := range categoryMap {
		categories = append(categories, category)
	}
	return categories
}

// IsStyleCompatible checks if a style reference is compatible with the space
func (sa *SpaceAnalysis) IsStyleCompatible(style *StyleReference) bool {
	// Check if the detected style matches
	for _, tag := range style.CharacteristicTags {
		if tag == sa.StyleAnalysis.PrimaryStyle {
			return true
		}
		for _, secondary := range sa.StyleAnalysis.SecondaryStyles {
			if tag == secondary {
				return true
			}
		}
	}
	return false
}

// GetSpaceUtilization calculates how much of the space is occupied
func (sa *SpaceAnalysis) GetSpaceUtilization() float64 {
	if len(sa.ExistingFurniture) == 0 {
		return 0.0
	}
	
	totalArea := 0.0
	for _, furniture := range sa.ExistingFurniture {
		area := furniture.BoundingBox.Width * furniture.BoundingBox.Height
		totalArea += area
	}
	
	// Assuming normalized coordinates, max area is 1.0
	return totalArea
}

// NeedsMoreFurniture suggests if the space could use more furniture
func (sa *SpaceAnalysis) NeedsMoreFurniture() bool {
	utilization := sa.GetSpaceUtilization()
	// If less than 30% of space is utilized, suggest more furniture
	return utilization < 0.3
}

// GetRecommendedStyles returns top style recommendations
func (sa *SpaceAnalysis) GetRecommendedStyles(limit int) []StyleRecommendation {
	if len(sa.Recommendations) <= limit {
		return sa.Recommendations
	}
	return sa.Recommendations[:limit]
}