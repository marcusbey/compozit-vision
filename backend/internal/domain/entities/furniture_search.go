package entities

import "github.com/google/uuid"

// FurnitureSearchFilters represents all possible search filters
type FurnitureSearchFilters struct {
	// Text search
	Query *string `json:"query,omitempty"`
	
	// Category and brand filters
	CategoryIDs []uuid.UUID `json:"category_ids,omitempty"`
	BrandIDs    []uuid.UUID `json:"brand_ids,omitempty"`
	
	// Style and aesthetics
	StyleTags    []string `json:"style_tags,omitempty"`
	ColorTags    []string `json:"color_tags,omitempty"`
	MaterialTags []string `json:"material_tags,omitempty"`
	
	// Price filtering
	MinPrice *float64 `json:"min_price,omitempty"`
	MaxPrice *float64 `json:"max_price,omitempty"`
	Currency *string  `json:"currency,omitempty"`
	
	// Dimensions filtering
	MaxLength *float64 `json:"max_length,omitempty"` // cm
	MaxWidth  *float64 `json:"max_width,omitempty"`  // cm
	MaxHeight *float64 `json:"max_height,omitempty"` // cm
	MinLength *float64 `json:"min_length,omitempty"` // cm
	MinWidth  *float64 `json:"min_width,omitempty"`  // cm
	MinHeight *float64 `json:"min_height,omitempty"` // cm
	
	// Room compatibility
	RoomTypes []RoomType `json:"room_types,omitempty"`
	
	// Availability and stock
	AvailabilityStatuses []AvailabilityStatus `json:"availability_statuses,omitempty"`
	InStockOnly          bool                 `json:"in_stock_only"`
	
	// Features
	AssemblyRequired *bool `json:"assembly_required,omitempty"`
	HasImages        bool  `json:"has_images"`
	Has3DModel       bool  `json:"has_3d_model"`
	
	// Ratings and reviews
	MinRating    *float64 `json:"min_rating,omitempty"`
	MinReviews   *int     `json:"min_reviews,omitempty"`
	
	// Special flags
	FeaturedOnly bool `json:"featured_only"`
	OnSaleOnly   bool `json:"on_sale_only"`
	
	// Pagination and sorting
	Limit  int             `json:"limit"`
	Offset int             `json:"offset"`
	SortBy FurnitureSortBy `json:"sort_by"`
}

// FurnitureSearchResult represents search results with metadata
type FurnitureSearchResult struct {
	Items       []FurnitureItemSummary `json:"items"`
	TotalCount  int                    `json:"total_count"`
	Facets      FurnitureSearchFacets  `json:"facets"`
	QueryTime   int64                  `json:"query_time_ms"`
	Suggestions []string               `json:"suggestions,omitempty"`
}

// FurnitureItemSummary is a lightweight version for search results
type FurnitureItemSummary struct {
	ID              uuid.UUID          `json:"id"`
	Name            string             `json:"name"`
	Slug            string             `json:"slug"`
	Description     *string            `json:"description,omitempty"`
	BrandName       *string            `json:"brand_name,omitempty"`
	CategoryName    *string            `json:"category_name,omitempty"`
	PriceMin        float64            `json:"price_min"`
	PriceMax        float64            `json:"price_max"`
	SalePrice       *float64           `json:"sale_price,omitempty"`
	Currency        string             `json:"currency"`
	AverageRating   float32            `json:"average_rating"`
	ReviewCount     int                `json:"review_count"`
	ThumbnailURL    *string            `json:"thumbnail_url,omitempty"`
	StyleTags       []string           `json:"style_tags"`
	ColorTags       []string           `json:"color_tags"`
	MaterialTags    []string           `json:"material_tags"`
	Dimensions      FurnitureDimensions `json:"dimensions"`
	AvailabilityStatus AvailabilityStatus `json:"availability_status"`
	StockQuantity   int                `json:"stock_quantity"`
	RelevanceScore  *float32           `json:"relevance_score,omitempty"`
	IsFeatured      bool               `json:"is_featured"`
	HasImages       bool               `json:"has_images"`
	Has3DModel      bool               `json:"has_3d_model"`
}

// FurnitureSearchFacets provides aggregated filter options
type FurnitureSearchFacets struct {
	Categories []FacetItem      `json:"categories"`
	Brands     []FacetItem      `json:"brands"`
	Styles     []FacetItem      `json:"styles"`
	Colors     []FacetItem      `json:"colors"`
	Materials  []FacetItem      `json:"materials"`
	PriceRange PriceRangeFacet  `json:"price_range"`
	Ratings    []RatingFacet    `json:"ratings"`
	RoomTypes  []FacetItem      `json:"room_types"`
}

// FacetItem represents a facet option with count
type FacetItem struct {
	Value string `json:"value"`
	Label string `json:"label"`
	Count int    `json:"count"`
}

// PriceRangeFacet provides price distribution information
type PriceRangeFacet struct {
	Min    float64            `json:"min"`
	Max    float64            `json:"max"`
	Ranges []PriceRangeOption `json:"ranges"`
}

// PriceRangeOption represents price range buckets
type PriceRangeOption struct {
	Label string  `json:"label"`
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Count int     `json:"count"`
}

// RatingFacet represents rating distribution
type RatingFacet struct {
	Rating float32 `json:"rating"`
	Count  int     `json:"count"`
}

// FurnitureSortBy represents different sorting options
type FurnitureSortBy string

const (
	SortByRelevance    FurnitureSortBy = "relevance"
	SortByPriceLow     FurnitureSortBy = "price_low"
	SortByPriceHigh    FurnitureSortBy = "price_high"
	SortByRating       FurnitureSortBy = "rating"
	SortByPopularity   FurnitureSortBy = "popularity"
	SortByNewest       FurnitureSortBy = "newest"
	SortByBrandName    FurnitureSortBy = "brand_name"
	SortByName         FurnitureSortBy = "name"
)

// FurnitureRecommendationRequest represents parameters for recommendations
type FurnitureRecommendationRequest struct {
	UserID      uuid.UUID `json:"user_id"`
	RoomType    *RoomType `json:"room_type,omitempty"`
	StyleHints  []string  `json:"style_hints,omitempty"`
	BudgetRange *BudgetRange `json:"budget_range,omitempty"`
	RoomDimensions *RoomDimensions `json:"room_dimensions,omitempty"`
	ExcludeViewed bool `json:"exclude_viewed"`
	Limit       int  `json:"limit"`
}

// FurnitureRecommendationResult contains recommended items with scores
type FurnitureRecommendationResult struct {
	Items []RecommendedFurnitureItem `json:"items"`
	RecommendationContext string    `json:"recommendation_context"`
}

// RecommendedFurnitureItem extends the summary with recommendation score
type RecommendedFurnitureItem struct {
	FurnitureItemSummary
	RecommendationScore float32            `json:"recommendation_score"`
	RecommendationReasons []RecommendationReason `json:"recommendation_reasons"`
}

// RecommendationReason explains why an item was recommended
type RecommendationReason struct {
	Type        RecommendationReasonType `json:"type"`
	Description string                   `json:"description"`
	Score       float32                  `json:"score"`
}

// RecommendationReasonType represents different recommendation factors
type RecommendationReasonType string

const (
	ReasonStyleMatch      RecommendationReasonType = "style_match"
	ReasonBrandPreference RecommendationReasonType = "brand_preference"
	ReasonMaterialMatch   RecommendationReasonType = "material_match"
	ReasonColorMatch      RecommendationReasonType = "color_match"
	ReasonRoomFit         RecommendationReasonType = "room_fit"
	ReasonBudgetFit       RecommendationReasonType = "budget_fit"
	ReasonHighRating      RecommendationReasonType = "high_rating"
	ReasonPopular         RecommendationReasonType = "popular"
	ReasonSimilarUsers    RecommendationReasonType = "similar_users"
	ReasonTrending        RecommendationReasonType = "trending"
)

// FurnitureCompatibilityCheck represents room fitting calculation
type FurnitureCompatibilityCheck struct {
	FurnitureID       uuid.UUID               `json:"furniture_id"`
	RoomDimensions    RoomDimensions          `json:"room_dimensions"`
	RoomType          RoomType                `json:"room_type"`
	CompatibilityScore int                    `json:"compatibility_score"`
	Issues            []CompatibilityIssue    `json:"issues,omitempty"`
	Suggestions       []CompatibilitySuggestion `json:"suggestions,omitempty"`
	PlacementOptions  []PlacementOption       `json:"placement_options,omitempty"`
}

// CompatibilityIssue represents potential problems with furniture placement
type CompatibilityIssue struct {
	Type        CompatibilityIssueType `json:"type"`
	Description string                 `json:"description"`
	Severity    IssueSeverity          `json:"severity"`
}

// CompatibilitySuggestion provides recommendations for better fit
type CompatibilitySuggestion struct {
	Type        SuggestionType `json:"type"`
	Description string         `json:"description"`
	Alternative *uuid.UUID     `json:"alternative_id,omitempty"`
}

// PlacementOption shows possible furniture placement in room
type PlacementOption struct {
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Score        int     `json:"score"`
	XPosition    float64 `json:"x_position"`
	YPosition    float64 `json:"y_position"`
	Rotation     float64 `json:"rotation"`
	TrafficFlow  int     `json:"traffic_flow_score"`
}

// Enums for compatibility checking

type CompatibilityIssueType string

const (
	IssueTypeTooBig           CompatibilityIssueType = "too_big"
	IssueTypeTooTall          CompatibilityIssueType = "too_tall"
	IssueTypeDoorBlocked      CompatibilityIssueType = "door_blocked"
	IssueTypeWindowBlocked    CompatibilityIssueType = "window_blocked"
	IssueTypeTrafficBlocked   CompatibilityIssueType = "traffic_blocked"
	IssueTypeStyleMismatch    CompatibilityIssueType = "style_mismatch"
	IssueTypeFunctionalIssue  CompatibilityIssueType = "functional_issue"
)

type IssueSeverity string

const (
	SeverityLow      IssueSeverity = "low"
	SeverityMedium   IssueSeverity = "medium"
	SeverityHigh     IssueSeverity = "high"
	SeverityCritical IssueSeverity = "critical"
)

type SuggestionType string

const (
	SuggestionTypeAlternativeSize SuggestionType = "alternative_size"
	SuggestionTypeAlternativeItem SuggestionType = "alternative_item"
	SuggestionTypeRearrangement   SuggestionType = "rearrangement"
	SuggestionTypeStyleChange     SuggestionType = "style_change"
	SuggestionTypePlacement       SuggestionType = "placement"
)

// Helper methods

// HasAnyStyle checks if filters include any of the given styles
func (f *FurnitureSearchFilters) HasAnyStyle(styles []string) bool {
	for _, filterStyle := range f.StyleTags {
		for _, style := range styles {
			if filterStyle == style {
				return true
			}
		}
	}
	return false
}

// HasAnyMaterial checks if filters include any of the given materials
func (f *FurnitureSearchFilters) HasAnyMaterial(materials []string) bool {
	for _, filterMaterial := range f.MaterialTags {
		for _, material := range materials {
			if filterMaterial == material {
				return true
			}
		}
	}
	return false
}

// IsInPriceRange checks if an item falls within the price filter
func (f *FurnitureSearchFilters) IsInPriceRange(minPrice, maxPrice float64) bool {
	if f.MinPrice != nil && maxPrice < *f.MinPrice {
		return false
	}
	if f.MaxPrice != nil && minPrice > *f.MaxPrice {
		return false
	}
	return true
}

// SetDefaultPagination sets default pagination values
func (f *FurnitureSearchFilters) SetDefaultPagination() {
	if f.Limit <= 0 {
		f.Limit = 20
	}
	if f.Limit > 100 {
		f.Limit = 100
	}
	if f.Offset < 0 {
		f.Offset = 0
	}
}

// SetDefaultSort sets default sorting if not specified
func (f *FurnitureSearchFilters) SetDefaultSort() {
	if f.SortBy == "" {
		if f.Query != nil && *f.Query != "" {
			f.SortBy = SortByRelevance
		} else {
			f.SortBy = SortByPopularity
		}
	}
}