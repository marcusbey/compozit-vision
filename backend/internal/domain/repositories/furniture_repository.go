package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"compozit-vision/internal/domain/entities"
)

// FurnitureRepository defines the interface for furniture data operations
type FurnitureRepository interface {
	// Furniture Items CRUD
	CreateFurnitureItem(ctx context.Context, item *entities.FurnitureItem) error
	GetFurnitureItemByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureItem, error)
	GetFurnitureItemBySlug(ctx context.Context, slug string) (*entities.FurnitureItem, error)
	UpdateFurnitureItem(ctx context.Context, item *entities.FurnitureItem) error
	DeleteFurnitureItem(ctx context.Context, id uuid.UUID) error
	ListFurnitureItems(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchResult, error)
	
	// Furniture Brands
	CreateFurnitureBrand(ctx context.Context, brand *entities.FurnitureBrand) error
	GetFurnitureBrandByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureBrand, error)
	GetFurnitureBrandBySlug(ctx context.Context, slug string) (*entities.FurnitureBrand, error)
	UpdateFurnitureBrand(ctx context.Context, brand *entities.FurnitureBrand) error
	DeleteFurnitureBrand(ctx context.Context, id uuid.UUID) error
	ListFurnitureBrands(ctx context.Context, limit, offset int) ([]entities.FurnitureBrand, int, error)
	
	// Furniture Categories
	CreateFurnitureCategory(ctx context.Context, category *entities.FurnitureCategory) error
	GetFurnitureCategoryByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureCategory, error)
	GetFurnitureCategoryBySlug(ctx context.Context, slug string) (*entities.FurnitureCategory, error)
	UpdateFurnitureCategory(ctx context.Context, category *entities.FurnitureCategory) error
	DeleteFurnitureCategory(ctx context.Context, id uuid.UUID) error
	ListFurnitureCategories(ctx context.Context, parentID *uuid.UUID) ([]entities.FurnitureCategory, error)
	GetCategoryHierarchy(ctx context.Context) ([]entities.FurnitureCategory, error)
	
	// Furniture Variations
	CreateFurnitureVariation(ctx context.Context, variation *entities.FurnitureVariation) error
	GetFurnitureVariationByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureVariation, error)
	UpdateFurnitureVariation(ctx context.Context, variation *entities.FurnitureVariation) error
	DeleteFurnitureVariation(ctx context.Context, id uuid.UUID) error
	GetVariationsByFurnitureID(ctx context.Context, furnitureID uuid.UUID) ([]entities.FurnitureVariation, error)
	
	// Room Compatibility
	CreateRoomCompatibility(ctx context.Context, compatibility *entities.RoomCompatibility) error
	GetRoomCompatibilityByID(ctx context.Context, id uuid.UUID) (*entities.RoomCompatibility, error)
	UpdateRoomCompatibility(ctx context.Context, compatibility *entities.RoomCompatibility) error
	DeleteRoomCompatibility(ctx context.Context, id uuid.UUID) error
	GetCompatibilityByFurnitureID(ctx context.Context, furnitureID uuid.UUID) ([]entities.RoomCompatibility, error)
	GetCompatibilityByRoomType(ctx context.Context, roomType entities.RoomType, filters entities.FurnitureSearchFilters) ([]entities.FurnitureItemSummary, error)
	
	// Collections
	CreateFurnitureCollection(ctx context.Context, collection *entities.FurnitureCollection) error
	GetFurnitureCollectionByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureCollection, error)
	GetFurnitureCollectionBySlug(ctx context.Context, slug string) (*entities.FurnitureCollection, error)
	UpdateFurnitureCollection(ctx context.Context, collection *entities.FurnitureCollection) error
	DeleteFurnitureCollection(ctx context.Context, id uuid.UUID) error
	ListFurnitureCollections(ctx context.Context, brandID *uuid.UUID, limit, offset int) ([]entities.FurnitureCollection, int, error)
	AddItemToCollection(ctx context.Context, collectionID, furnitureItemID uuid.UUID, displayOrder int, isOptional bool) error
	RemoveItemFromCollection(ctx context.Context, collectionID, furnitureItemID uuid.UUID) error
	GetCollectionItems(ctx context.Context, collectionID uuid.UUID) ([]entities.FurnitureCollectionItem, error)
}

// UserFurnitureRepository defines user-specific furniture operations
type UserFurnitureRepository interface {
	// User Interactions
	CreateUserInteraction(ctx context.Context, interaction *entities.UserFurnitureInteraction) error
	GetUserInteractions(ctx context.Context, userID uuid.UUID, interactionType *entities.InteractionType, limit, offset int) ([]entities.UserFurnitureInteraction, int, error)
	GetItemInteractionCount(ctx context.Context, furnitureItemID uuid.UUID, interactionType entities.InteractionType) (int, error)
	DeleteUserInteraction(ctx context.Context, id uuid.UUID) error
	
	// User Preferences
	CreateUserPreferences(ctx context.Context, preferences *entities.UserFurniturePreferences) error
	GetUserPreferences(ctx context.Context, userID uuid.UUID) (*entities.UserFurniturePreferences, error)
	UpdateUserPreferences(ctx context.Context, preferences *entities.UserFurniturePreferences) error
	DeleteUserPreferences(ctx context.Context, userID uuid.UUID) error
	
	// Wishlist
	AddToWishlist(ctx context.Context, wishlistItem *entities.UserFurnitureWishlist) error
	RemoveFromWishlist(ctx context.Context, userID, furnitureItemID uuid.UUID, variationID *uuid.UUID) error
	GetUserWishlist(ctx context.Context, userID uuid.UUID, limit, offset int) ([]entities.UserFurnitureWishlist, int, error)
	IsInWishlist(ctx context.Context, userID, furnitureItemID uuid.UUID, variationID *uuid.UUID) (bool, error)
	UpdateWishlistItem(ctx context.Context, wishlistItem *entities.UserFurnitureWishlist) error
	GetWishlistItem(ctx context.Context, id uuid.UUID) (*entities.UserFurnitureWishlist, error)
}

// FurnitureSearchRepository defines advanced search operations
type FurnitureSearchRepository interface {
	// Advanced Search
	SearchFurniture(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchResult, error)
	SearchSuggestions(ctx context.Context, query string, limit int) ([]string, error)
	GetSearchFacets(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchFacets, error)
	
	// Recommendations
	GetPersonalizedRecommendations(ctx context.Context, req entities.FurnitureRecommendationRequest) (*entities.FurnitureRecommendationResult, error)
	GetSimilarFurniture(ctx context.Context, furnitureID uuid.UUID, limit int) ([]entities.FurnitureItemSummary, error)
	GetTrendingFurniture(ctx context.Context, roomType *entities.RoomType, limit int) ([]entities.FurnitureItemSummary, error)
	GetFeaturedFurniture(ctx context.Context, categoryID *uuid.UUID, limit int) ([]entities.FurnitureItemSummary, error)
	
	// Analytics
	UpdateViewCount(ctx context.Context, furnitureID uuid.UUID) error
	UpdatePurchaseCount(ctx context.Context, furnitureID uuid.UUID) error
	GetPopularFurniture(ctx context.Context, timeframe string, limit int) ([]entities.FurnitureItemSummary, error)
	
	// Room Compatibility Checking
	CheckRoomCompatibility(ctx context.Context, furnitureID uuid.UUID, roomDimensions entities.RoomDimensions, roomType entities.RoomType) (*entities.FurnitureCompatibilityCheck, error)
	GetRoomSuitableFurniture(ctx context.Context, roomDimensions entities.RoomDimensions, roomType entities.RoomType, filters entities.FurnitureSearchFilters) ([]entities.FurnitureItemSummary, error)
}

// FurnitureImportRepository defines bulk import/export operations
type FurnitureImportRepository interface {
	// Bulk Operations
	BulkCreateFurnitureItems(ctx context.Context, items []entities.FurnitureItem) error
	BulkUpdatePrices(ctx context.Context, updates []PriceUpdate) error
	BulkUpdateStock(ctx context.Context, updates []StockUpdate) error
	BulkUpdateAvailability(ctx context.Context, updates []AvailabilityUpdate) error
	
	// Import/Export
	ExportFurnitureData(ctx context.Context, filters entities.FurnitureSearchFilters) ([]entities.FurnitureItem, error)
	ImportFurnitureData(ctx context.Context, data []ImportFurnitureItem) (*ImportResult, error)
	ValidateImportData(ctx context.Context, data []ImportFurnitureItem) (*ValidationResult, error)
	
	// Vendor Sync
	GetItemsForVendorUpdate(ctx context.Context, vendorID string, lastSync *time.Time) ([]entities.FurnitureItem, error)
	UpdateVendorInfo(ctx context.Context, furnitureID uuid.UUID, vendorInfo entities.VendorInfo) error
}

// Supporting types for import operations

type PriceUpdate struct {
	FurnitureItemID uuid.UUID `json:"furniture_item_id"`
	VariationID     *uuid.UUID `json:"variation_id,omitempty"`
	NewPrice        float64    `json:"new_price"`
	SalePrice       *float64   `json:"sale_price,omitempty"`
}

type StockUpdate struct {
	FurnitureItemID uuid.UUID `json:"furniture_item_id"`
	VariationID     *uuid.UUID `json:"variation_id,omitempty"`
	StockQuantity   int        `json:"stock_quantity"`
}

type AvailabilityUpdate struct {
	FurnitureItemID    uuid.UUID                  `json:"furniture_item_id"`
	VariationID        *uuid.UUID                 `json:"variation_id,omitempty"`
	AvailabilityStatus entities.AvailabilityStatus `json:"availability_status"`
}

type ImportFurnitureItem struct {
	// Basic Information
	SKU          *string  `json:"sku,omitempty"`
	Name         string   `json:"name"`
	Description  *string  `json:"description,omitempty"`
	BrandName    string   `json:"brand_name"`
	CategoryPath []string `json:"category_path"` // e.g., ["Living Room", "Sofas", "Sectional"]
	
	// Attributes
	StyleTags    []string `json:"style_tags"`
	ColorTags    []string `json:"color_tags"`
	MaterialTags []string `json:"material_tags"`
	Features     []string `json:"features"`
	
	// Dimensions
	Length float64  `json:"length"` // cm
	Width  float64  `json:"width"`  // cm
	Height float64  `json:"height"` // cm
	Weight *float64 `json:"weight,omitempty"` // kg
	
	// Pricing
	Price     float64  `json:"price"`
	SalePrice *float64 `json:"sale_price,omitempty"`
	Currency  string   `json:"currency"`
	
	// Availability
	StockQuantity      int    `json:"stock_quantity"`
	AvailabilityStatus string `json:"availability_status"`
	LeadTimeDays       int    `json:"lead_time_days"`
	
	// Media
	Images    []string `json:"images"`
	Model3DURL *string `json:"model_3d_url,omitempty"`
	
	// Vendor Information
	VendorID      *string `json:"vendor_id,omitempty"`
	VendorURL     *string `json:"vendor_url,omitempty"`
	AffiliateLink *string `json:"affiliate_link,omitempty"`
	
	// Assembly
	AssemblyRequired    bool `json:"assembly_required"`
	AssemblyTimeMinutes *int `json:"assembly_time_minutes,omitempty"`
	
	// Care
	CareInstructions *string `json:"care_instructions,omitempty"`
	
	// Variations (if any)
	Variations []ImportFurnitureVariation `json:"variations,omitempty"`
	
	// Room Compatibility
	CompatibleRooms []ImportRoomCompatibility `json:"compatible_rooms,omitempty"`
}

type ImportFurnitureVariation struct {
	Name            string   `json:"name"`
	SKU             *string  `json:"sku,omitempty"`
	SizeLabel       *string  `json:"size_label,omitempty"`
	ColorName       *string  `json:"color_name,omitempty"`
	ColorHex        *string  `json:"color_hex,omitempty"`
	MaterialVariant *string  `json:"material_variant,omitempty"`
	Price           *float64 `json:"price,omitempty"`
	SalePrice       *float64 `json:"sale_price,omitempty"`
	StockQuantity   int      `json:"stock_quantity"`
	Images          []string `json:"images"`
	
	// Dimension overrides
	Length *float64 `json:"length,omitempty"`
	Width  *float64 `json:"width,omitempty"`
	Height *float64 `json:"height,omitempty"`
	Weight *float64 `json:"weight,omitempty"`
}

type ImportRoomCompatibility struct {
	RoomType         string  `json:"room_type"`
	SuitabilityScore int     `json:"suitability_score"`
	PlacementNotes   *string `json:"placement_notes,omitempty"`
	
	// Minimum room requirements
	MinLength *float64 `json:"min_length,omitempty"`
	MinWidth  *float64 `json:"min_width,omitempty"`
	MinHeight *float64 `json:"min_height,omitempty"`
	
	// Placement rules
	WallClearance   *float64 `json:"wall_clearance,omitempty"`
	TrafficSpace    *float64 `json:"traffic_space,omitempty"`
	DoorClearance   *float64 `json:"door_clearance,omitempty"`
	WindowClearance *float64 `json:"window_clearance,omitempty"`
	CornerSuitable  bool     `json:"corner_suitable"`
	WallMountable   bool     `json:"wall_mountable"`
}

type ImportResult struct {
	TotalProcessed int                `json:"total_processed"`
	SuccessCount   int                `json:"success_count"`
	ErrorCount     int                `json:"error_count"`
	Errors         []ImportError      `json:"errors,omitempty"`
	Warnings       []ImportWarning    `json:"warnings,omitempty"`
	CreatedItems   []uuid.UUID        `json:"created_items"`
	UpdatedItems   []uuid.UUID        `json:"updated_items"`
	SkippedItems   []uuid.UUID        `json:"skipped_items"`
}

type ValidationResult struct {
	IsValid    bool              `json:"is_valid"`
	ErrorCount int               `json:"error_count"`
	Errors     []ValidationError `json:"errors,omitempty"`
	Warnings   []ImportWarning   `json:"warnings,omitempty"`
}

type ImportError struct {
	Row     int    `json:"row"`
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}

type ValidationError struct {
	Row     int    `json:"row"`
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}

type ImportWarning struct {
	Row     int    `json:"row"`
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}