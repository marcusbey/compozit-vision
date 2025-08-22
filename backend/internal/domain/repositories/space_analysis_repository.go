package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/compozit/compozit-vision-api/internal/domain/entities"
)

// SpaceAnalysisRepository defines the interface for space analysis data operations
type SpaceAnalysisRepository interface {
	// Space Analysis CRUD
	CreateSpaceAnalysis(ctx context.Context, analysis *entities.SpaceAnalysis) error
	GetSpaceAnalysisByID(ctx context.Context, id uuid.UUID) (*entities.SpaceAnalysis, error)
	UpdateSpaceAnalysis(ctx context.Context, analysis *entities.SpaceAnalysis) error
	DeleteSpaceAnalysis(ctx context.Context, id uuid.UUID) error
	GetUserSpaceAnalyses(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.SpaceAnalysis, int, error)
	GetSpaceAnalysesByProject(ctx context.Context, projectID uuid.UUID) ([]*entities.SpaceAnalysis, error)
	GetSpaceAnalysesByStatus(ctx context.Context, status entities.AnalysisStatus, limit, offset int) ([]*entities.SpaceAnalysis, int, error)

	// Style Reference Operations
	CreateStyleReference(ctx context.Context, style *entities.StyleReference) error
	GetStyleReferenceByID(ctx context.Context, id uuid.UUID) (*entities.StyleReference, error)
	GetStyleReferenceBySlug(ctx context.Context, slug string) (*entities.StyleReference, error)
	UpdateStyleReference(ctx context.Context, style *entities.StyleReference) error
	DeleteStyleReference(ctx context.Context, id uuid.UUID) error
	ListStyleReferences(ctx context.Context, category string, isActive *bool, limit, offset int) ([]*entities.StyleReference, int, error)
	SearchStyleReferences(ctx context.Context, query string, limit int) ([]*entities.StyleReference, error)

	// Ambiance Option Operations
	CreateAmbianceOption(ctx context.Context, ambiance *entities.AmbianceOption) error
	GetAmbianceOptionByID(ctx context.Context, id uuid.UUID) (*entities.AmbianceOption, error)
	UpdateAmbianceOption(ctx context.Context, ambiance *entities.AmbianceOption) error
	DeleteAmbianceOption(ctx context.Context, id uuid.UUID) error
	GetAmbianceOptionsByStyle(ctx context.Context, styleID uuid.UUID) ([]*entities.AmbianceOption, error)
	ListAmbianceOptions(ctx context.Context, limit, offset int) ([]*entities.AmbianceOption, int, error)

	// Enhanced Generation Result Operations
	CreateGenerationResult(ctx context.Context, result *entities.EnhancedGenerationResult) error
	GetGenerationResultByID(ctx context.Context, id uuid.UUID) (*entities.EnhancedGenerationResult, error)
	UpdateGenerationResult(ctx context.Context, result *entities.EnhancedGenerationResult) error
	DeleteGenerationResult(ctx context.Context, id uuid.UUID) error
	GetUserGenerationResults(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.EnhancedGenerationResult, int, error)
	GetGenerationResultsBySpaceAnalysis(ctx context.Context, spaceAnalysisID uuid.UUID) ([]*entities.EnhancedGenerationResult, error)
	GetGenerationResultsByStatus(ctx context.Context, status entities.GenerationStatus, limit, offset int) ([]*entities.EnhancedGenerationResult, int, error)

	// Analytics and Statistics
	GetAnalysisStatsByUser(ctx context.Context, userID uuid.UUID) (*SpaceAnalysisStats, error)
	GetPopularStyles(ctx context.Context, roomType *entities.RoomType, limit int) ([]*StylePopularity, error)
	GetStyleTrends(ctx context.Context, timeframe string, limit int) ([]*StyleTrend, error)
	GetRoomTypeDistribution(ctx context.Context, userID *uuid.UUID) ([]*RoomTypeStats, error)
}

// Supporting types for analytics and reporting

// SpaceAnalysisStats contains user analysis statistics
type SpaceAnalysisStats struct {
	UserID              uuid.UUID `json:"user_id"`
	TotalAnalyses       int       `json:"total_analyses"`
	CompletedAnalyses   int       `json:"completed_analyses"`
	FailedAnalyses      int       `json:"failed_analyses"`
	TotalGenerations    int       `json:"total_generations"`
	CompletedGenerations int      `json:"completed_generations"`
	AverageProcessingTime int     `json:"average_processing_time"` // milliseconds
	MostAnalyzedRoomType entities.RoomType `json:"most_analyzed_room_type"`
	FavoriteStyle       *string   `json:"favorite_style,omitempty"`
}

// StylePopularity represents style usage statistics
type StylePopularity struct {
	StyleID        uuid.UUID `json:"style_id"`
	StyleName      string    `json:"style_name"`
	UsageCount     int       `json:"usage_count"`
	SuccessRate    float64   `json:"success_rate"`
	AverageRating  float64   `json:"average_rating"`
	RoomType       *entities.RoomType `json:"room_type,omitempty"`
}

// StyleTrend represents style trend data over time
type StyleTrend struct {
	StyleID     uuid.UUID `json:"style_id"`
	StyleName   string    `json:"style_name"`
	Period      string    `json:"period"`      // e.g., "2024-01"
	UsageCount  int       `json:"usage_count"`
	GrowthRate  float64   `json:"growth_rate"` // percentage change
	Ranking     int       `json:"ranking"`
}

// RoomTypeStats represents room type analysis distribution
type RoomTypeStats struct {
	RoomType      entities.RoomType `json:"room_type"`
	AnalysisCount int               `json:"analysis_count"`
	Percentage    float64           `json:"percentage"`
	AverageConfidence float64       `json:"average_confidence"`
}

// SpaceAnalysisFilter for advanced filtering
type SpaceAnalysisFilter struct {
	UserID             *uuid.UUID              `json:"user_id,omitempty"`
	ProjectID          *uuid.UUID              `json:"project_id,omitempty"`
	RoomType           *entities.RoomType      `json:"room_type,omitempty"`
	Status             *entities.AnalysisStatus `json:"status,omitempty"`
	MinConfidence      *float64                `json:"min_confidence,omitempty"`
	StyleCategories    []string                `json:"style_categories,omitempty"`
	HasGeneration      *bool                   `json:"has_generation,omitempty"`
	CreatedAfter       *string                 `json:"created_after,omitempty"`  // ISO 8601
	CreatedBefore      *string                 `json:"created_before,omitempty"` // ISO 8601
	SortBy             string                  `json:"sort_by,omitempty"`        // created_at, confidence, etc.
	SortOrder          string                  `json:"sort_order,omitempty"`     // asc, desc
	Limit              int                     `json:"limit"`
	Offset             int                     `json:"offset"`
}

// GenerationResultFilter for advanced filtering
type GenerationResultFilter struct {
	UserID           *uuid.UUID                  `json:"user_id,omitempty"`
	SpaceAnalysisID  *uuid.UUID                  `json:"space_analysis_id,omitempty"`
	StyleReferenceID *uuid.UUID                  `json:"style_reference_id,omitempty"`
	Status           *entities.GenerationStatus  `json:"status,omitempty"`
	MinQualityScore  *float64                    `json:"min_quality_score,omitempty"`
	MinCost          *float64                    `json:"min_cost,omitempty"`
	MaxCost          *float64                    `json:"max_cost,omitempty"`
	CreatedAfter     *string                     `json:"created_after,omitempty"`
	CreatedBefore    *string                     `json:"created_before,omitempty"`
	SortBy           string                      `json:"sort_by,omitempty"`
	SortOrder        string                      `json:"sort_order,omitempty"`
	Limit            int                         `json:"limit"`
	Offset           int                         `json:"offset"`
}