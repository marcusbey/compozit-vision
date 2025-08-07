package entities

import (
	"time"

	"github.com/google/uuid"
)

// FurnitureItem represents a piece of furniture in the catalog
type FurnitureItem struct {
	ID                 uuid.UUID            `json:"id" db:"id"`
	SKU                *string              `json:"sku,omitempty" db:"sku"`
	Name               string               `json:"name" db:"name"`
	Slug               string               `json:"slug" db:"slug"`
	Description        *string              `json:"description,omitempty" db:"description"`
	BrandID            *uuid.UUID           `json:"brand_id,omitempty" db:"brand_id"`
	CategoryID         *uuid.UUID           `json:"category_id,omitempty" db:"category_id"`
	StyleTags          []string             `json:"style_tags" db:"style_tags"`
	ColorTags          []string             `json:"color_tags" db:"color_tags"`
	MaterialTags       []string             `json:"material_tags" db:"material_tags"`
	Dimensions         FurnitureDimensions  `json:"dimensions" db:"dimensions"`
	PriceRange         PriceRange           `json:"price_range" db:"price_range"`
	Features           []string             `json:"features" db:"features"`
	CareInstructions   *string              `json:"care_instructions,omitempty" db:"care_instructions"`
	AssemblyRequired   bool                 `json:"assembly_required" db:"assembly_required"`
	AssemblyTimeMinutes *int                `json:"assembly_time_minutes,omitempty" db:"assembly_time_minutes"`
	AvailabilityStatus AvailabilityStatus   `json:"availability_status" db:"availability_status"`
	StockQuantity      int                  `json:"stock_quantity" db:"stock_quantity"`
	LeadTimeDays       int                  `json:"lead_time_days" db:"lead_time_days"`
	Images             []string             `json:"images" db:"images"`
	ThumbnailURL       *string              `json:"thumbnail_url,omitempty" db:"thumbnail_url"`
	Model3DURL         *string              `json:"model_3d_url,omitempty" db:"model_3d_url"`
	VendorInfo         VendorInfo           `json:"vendor_info" db:"vendor_info"`
	AverageRating      float32              `json:"average_rating" db:"average_rating"`
	ReviewCount        int                  `json:"review_count" db:"review_count"`
	ViewCount          int                  `json:"view_count" db:"view_count"`
	PurchaseCount      int                  `json:"purchase_count" db:"purchase_count"`
	IsFeatured         bool                 `json:"is_featured" db:"is_featured"`
	IsActive           bool                 `json:"is_active" db:"is_active"`
	CreatedAt          time.Time            `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time            `json:"updated_at" db:"updated_at"`

	// Relationships (loaded separately)
	Brand      *FurnitureBrand    `json:"brand,omitempty"`
	Category   *FurnitureCategory `json:"category,omitempty"`
	Variations []FurnitureVariation `json:"variations,omitempty"`
	RoomCompatibility []RoomCompatibility `json:"room_compatibility,omitempty"`
}

// FurnitureVariation represents different sizes, colors of the same furniture item
type FurnitureVariation struct {
	ID               uuid.UUID            `json:"id" db:"id"`
	FurnitureItemID  uuid.UUID            `json:"furniture_item_id" db:"furniture_item_id"`
	Name             string               `json:"name" db:"name"`
	SKU              *string              `json:"sku,omitempty" db:"sku"`
	SizeLabel        *string              `json:"size_label,omitempty" db:"size_label"`
	ColorName        *string              `json:"color_name,omitempty" db:"color_name"`
	ColorHex         *string              `json:"color_hex,omitempty" db:"color_hex"`
	MaterialVariant  *string              `json:"material_variant,omitempty" db:"material_variant"`
	Dimensions       FurnitureDimensions  `json:"dimensions" db:"dimensions"`
	Price            *float64             `json:"price,omitempty" db:"price"`
	SalePrice        *float64             `json:"sale_price,omitempty" db:"sale_price"`
	StockQuantity    int                  `json:"stock_quantity" db:"stock_quantity"`
	IsAvailable      bool                 `json:"is_available" db:"is_available"`
	Images           []string             `json:"images" db:"images"`
	CreatedAt        time.Time            `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time            `json:"updated_at" db:"updated_at"`
}

// FurnitureBrand represents furniture manufacturers/brands
type FurnitureBrand struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	Name          string     `json:"name" db:"name"`
	Slug          string     `json:"slug" db:"slug"`
	Description   *string    `json:"description,omitempty" db:"description"`
	LogoURL       *string    `json:"logo_url,omitempty" db:"logo_url"`
	WebsiteURL    *string    `json:"website_url,omitempty" db:"website_url"`
	QualityRating *float32   `json:"quality_rating,omitempty" db:"quality_rating"`
	PriceTier     *PriceTier `json:"price_tier,omitempty" db:"price_tier"`
	IsVerified    bool       `json:"is_verified" db:"is_verified"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
}

// FurnitureCategory represents hierarchical furniture categories
type FurnitureCategory struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	Name           string     `json:"name" db:"name"`
	Slug           string     `json:"slug" db:"slug"`
	ParentID       *uuid.UUID `json:"parent_id,omitempty" db:"parent_id"`
	Description    *string    `json:"description,omitempty" db:"description"`
	IconURL        *string    `json:"icon_url,omitempty" db:"icon_url"`
	SearchKeywords []string   `json:"search_keywords" db:"search_keywords"`
	DisplayOrder   int        `json:"display_order" db:"display_order"`
	IsActive       bool       `json:"is_active" db:"is_active"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`

	// Relationships
	Parent   *FurnitureCategory   `json:"parent,omitempty"`
	Children []FurnitureCategory  `json:"children,omitempty"`
}

// RoomCompatibility represents how well furniture fits in different room types
type RoomCompatibility struct {
	ID                 uuid.UUID           `json:"id" db:"id"`
	FurnitureItemID    uuid.UUID           `json:"furniture_item_id" db:"furniture_item_id"`
	RoomType           RoomType            `json:"room_type" db:"room_type"`
	MinRoomDimensions  RoomDimensions      `json:"min_room_dimensions" db:"min_room_dimensions"`
	PlacementRules     PlacementRules      `json:"placement_rules" db:"placement_rules"`
	CompatibleStyles   []string            `json:"compatible_styles" db:"compatible_styles"`
	PlacementNotes     *string             `json:"placement_notes,omitempty" db:"placement_notes"`
	SuitabilityScore   int                 `json:"suitability_score" db:"suitability_score"`
	CreatedAt          time.Time           `json:"created_at" db:"created_at"`
}

// UserFurnitureInteraction tracks user interactions with furniture
type UserFurnitureInteraction struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	UserID           uuid.UUID       `json:"user_id" db:"user_id"`
	FurnitureItemID  uuid.UUID       `json:"furniture_item_id" db:"furniture_item_id"`
	InteractionType  InteractionType `json:"interaction_type" db:"interaction_type"`
	InteractionData  map[string]interface{} `json:"interaction_data" db:"interaction_data"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
}

// UserFurniturePreferences stores user's style and preference information
type UserFurniturePreferences struct {
	UserID                    uuid.UUID               `json:"user_id" db:"user_id"`
	StylePreferences          []string                `json:"style_preferences" db:"style_preferences"`
	PreferredBrands           []uuid.UUID             `json:"preferred_brands" db:"preferred_brands"`
	ExcludedBrands           []uuid.UUID             `json:"excluded_brands" db:"excluded_brands"`
	PreferredMaterials       []string                `json:"preferred_materials" db:"preferred_materials"`
	ColorPreferences         []string                `json:"color_preferences" db:"color_preferences"`
	BudgetRange              BudgetRange             `json:"budget_range" db:"budget_range"`
	RoomSpecificPreferences  map[string]interface{}  `json:"room_specific_preferences" db:"room_specific_preferences"`
	CreatedAt                time.Time               `json:"created_at" db:"created_at"`
	UpdatedAt                time.Time               `json:"updated_at" db:"updated_at"`
}

// FurnitureCollection represents curated furniture sets
type FurnitureCollection struct {
	ID           uuid.UUID   `json:"id" db:"id"`
	Name         string      `json:"name" db:"name"`
	Slug         string      `json:"slug" db:"slug"`
	Description  *string     `json:"description,omitempty" db:"description"`
	BrandID      *uuid.UUID  `json:"brand_id,omitempty" db:"brand_id"`
	StyleTags    []string    `json:"style_tags" db:"style_tags"`
	ThumbnailURL *string     `json:"thumbnail_url,omitempty" db:"thumbnail_url"`
	IsActive     bool        `json:"is_active" db:"is_active"`
	CreatedAt    time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at" db:"updated_at"`

	// Relationships
	Brand *FurnitureBrand           `json:"brand,omitempty"`
	Items []FurnitureCollectionItem `json:"items,omitempty"`
}

// FurnitureCollectionItem links furniture items to collections
type FurnitureCollectionItem struct {
	CollectionID    uuid.UUID `json:"collection_id" db:"collection_id"`
	FurnitureItemID uuid.UUID `json:"furniture_item_id" db:"furniture_item_id"`
	DisplayOrder    int       `json:"display_order" db:"display_order"`
	IsOptional      bool      `json:"is_optional" db:"is_optional"`

	// Relationships
	FurnitureItem *FurnitureItem `json:"furniture_item,omitempty"`
}

// UserFurnitureWishlist represents user's saved furniture items
type UserFurnitureWishlist struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	UserID           uuid.UUID  `json:"user_id" db:"user_id"`
	FurnitureItemID  uuid.UUID  `json:"furniture_item_id" db:"furniture_item_id"`
	VariationID      *uuid.UUID `json:"variation_id,omitempty" db:"variation_id"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	Priority         int        `json:"priority" db:"priority"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`

	// Relationships
	FurnitureItem *FurnitureItem     `json:"furniture_item,omitempty"`
	Variation     *FurnitureVariation `json:"variation,omitempty"`
}

// Value objects

// FurnitureDimensions represents physical dimensions of furniture
type FurnitureDimensions struct {
	Length float64 `json:"length"` // cm
	Width  float64 `json:"width"`  // cm
	Height float64 `json:"height"` // cm
	Depth  *float64 `json:"depth,omitempty"` // cm (for items where different from width)
	Weight *float64 `json:"weight,omitempty"` // kg
}

// PriceRange represents min/max pricing
type PriceRange struct {
	Min       float64 `json:"min"`
	Max       float64 `json:"max"`
	Currency  string  `json:"currency"`
	SalePrice *float64 `json:"sale_price,omitempty"`
}

// BudgetRange represents user's budget preferences
type BudgetRange struct {
	Min      *float64 `json:"min,omitempty"`
	Max      *float64 `json:"max,omitempty"`
	Currency string   `json:"currency"`
}

// VendorInfo contains vendor/affiliate information
type VendorInfo struct {
	VendorID      *string `json:"vendor_id,omitempty"`
	VendorName    *string `json:"vendor_name,omitempty"`
	VendorURL     *string `json:"vendor_url,omitempty"`
	AffiliateLink *string `json:"affiliate_link,omitempty"`
	LastUpdated   *time.Time `json:"last_updated,omitempty"`
}

// RoomDimensions represents minimum room size requirements
type RoomDimensions struct {
	Length float64 `json:"length"` // cm
	Width  float64 `json:"width"`  // cm
	Height float64 `json:"height"` // cm
}

// PlacementRules defines how furniture should be placed in rooms
type PlacementRules struct {
	WallClearance    *float64 `json:"wall_clearance,omitempty"`    // cm from walls
	TrafficSpace     *float64 `json:"traffic_space,omitempty"`     // cm for walking
	DoorClearance    *float64 `json:"door_clearance,omitempty"`    // cm from doors
	WindowClearance  *float64 `json:"window_clearance,omitempty"`  // cm from windows
	CenterDistance   *float64 `json:"center_distance,omitempty"`   // cm from room center
	CornerSuitable   bool     `json:"corner_suitable"`             // can be placed in corner
	WallMountable    bool     `json:"wall_mountable"`              // can be wall mounted
}

// Enums

// AvailabilityStatus represents product availability
type AvailabilityStatus string

const (
	AvailabilityAvailable     AvailabilityStatus = "available"
	AvailabilityLimited       AvailabilityStatus = "limited"
	AvailabilityOutOfStock    AvailabilityStatus = "out_of_stock"
	AvailabilityDiscontinued  AvailabilityStatus = "discontinued"
)

// PriceTier represents brand positioning
type PriceTier string

const (
	PriceTierBudget    PriceTier = "budget"
	PriceTierMidRange  PriceTier = "mid-range"
	PriceTierPremium   PriceTier = "premium"
	PriceTierLuxury    PriceTier = "luxury"
)

// RoomType represents different room categories
type RoomType string

const (
	RoomTypeLivingRoom RoomType = "living_room"
	RoomTypeBedroom    RoomType = "bedroom"
	RoomTypeDiningRoom RoomType = "dining_room"
	RoomTypeKitchen    RoomType = "kitchen"
	RoomTypeBathroom   RoomType = "bathroom"
	RoomTypeOffice     RoomType = "office"
	RoomTypeOutdoor    RoomType = "outdoor"
	RoomTypeEntryway   RoomType = "entryway"
	RoomTypeKidsRoom   RoomType = "kids_room"
)

// InteractionType represents different user interactions
type InteractionType string

const (
	InteractionTypeView     InteractionType = "view"
	InteractionTypeLike     InteractionType = "like"
	InteractionTypeSave     InteractionType = "save"
	InteractionTypePurchase InteractionType = "purchase"
	InteractionTypeReview   InteractionType = "review"
)

// Business logic methods

// IsInBudget checks if furniture price fits within budget range
func (f *FurnitureItem) IsInBudget(budget BudgetRange) bool {
	if budget.Min != nil && f.PriceRange.Min < *budget.Min {
		return false
	}
	if budget.Max != nil && f.PriceRange.Max > *budget.Max {
		return false
	}
	return true
}

// HasStyle checks if furniture has a specific style tag
func (f *FurnitureItem) HasStyle(style string) bool {
	for _, tag := range f.StyleTags {
		if tag == style {
			return true
		}
	}
	return false
}

// HasMaterial checks if furniture has a specific material tag
func (f *FurnitureItem) HasMaterial(material string) bool {
	for _, tag := range f.MaterialTags {
		if tag == material {
			return true
		}
	}
	return false
}

// IsAvailable checks if furniture is currently available
func (f *FurnitureItem) IsAvailable() bool {
	return f.IsActive && 
		   f.AvailabilityStatus == AvailabilityAvailable && 
		   f.StockQuantity > 0
}

// FitsInRoom checks if furniture fits in a room with given dimensions
func (f *FurnitureItem) FitsInRoom(roomDimensions RoomDimensions) bool {
	// Basic fit check - furniture dimensions must be smaller than room
	return f.Dimensions.Length <= roomDimensions.Length &&
		   f.Dimensions.Width <= roomDimensions.Width &&
		   f.Dimensions.Height <= roomDimensions.Height
}

// GetBestPrice returns the lowest available price
func (f *FurnitureItem) GetBestPrice() float64 {
	// Check if there's a sale price in the range
	if f.PriceRange.SalePrice != nil {
		return *f.PriceRange.SalePrice
	}
	return f.PriceRange.Min
}

// GetCategoryPath returns the full category hierarchy path
func (c *FurnitureCategory) GetCategoryPath() []string {
	path := []string{}
	current := c
	
	for current != nil {
		path = append([]string{current.Name}, path...)
		current = current.Parent
	}
	
	return path
}