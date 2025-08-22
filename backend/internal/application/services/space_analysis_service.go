package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/compozit/compozit-vision-api/internal/domain/entities"
	"github.com/compozit/compozit-vision-api/internal/domain/repositories"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/ai"
)

// AIVisionService interface for AI computer vision operations
type AIVisionService interface {
	AnalyzeSpace(ctx context.Context, imageURL string) (*SpaceAnalysisResult, error)
	DetectRoomType(ctx context.Context, imageURL string) (*RoomTypeDetection, error)
	ExtractSpatialFeatures(ctx context.Context, imageURL string) (*SpatialFeaturesResult, error)
	AnalyzeStyle(ctx context.Context, imageURL string) (*StyleAnalysisResult, error)
	AnalyzeLighting(ctx context.Context, imageURL string) (*LightingAnalysisResult, error)
	ExtractColorPalette(ctx context.Context, imageURL string) ([]entities.ColorInfo, error)
}

// SpaceAnalysisServiceImpl implements space analysis business logic
type SpaceAnalysisServiceImpl struct {
	repo           repositories.SpaceAnalysisRepository
	furnitureRepo  repositories.FurnitureRepository
	aiVisionSvc    AIVisionService
}

// NewSpaceAnalysisService creates a new space analysis service
func NewSpaceAnalysisService(
	repo repositories.SpaceAnalysisRepository,
	furnitureRepo repositories.FurnitureRepository,
	aiVisionSvc AIVisionService,
) *SpaceAnalysisServiceImpl {
	return &SpaceAnalysisServiceImpl{
		repo:          repo,
		furnitureRepo: furnitureRepo,
		aiVisionSvc:   aiVisionSvc,
	}
}

// AnalyzeSpace performs comprehensive space analysis
func (s *SpaceAnalysisServiceImpl) AnalyzeSpace(ctx context.Context, request AnalyzeSpaceRequest) (*entities.SpaceAnalysis, error) {
	// Create initial analysis record
	analysis := &entities.SpaceAnalysis{
		ID:       uuid.New(),
		UserID:   request.UserID,
		ProjectID: request.ProjectID,
		ImageURL: request.ImageURL,
		Status:   entities.AnalysisStatusProcessing,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save initial record
	if err := s.repo.CreateSpaceAnalysis(ctx, analysis); err != nil {
		return nil, fmt.Errorf("failed to create analysis record: %w", err)
	}

	// Perform AI analysis asynchronously
	go s.processSpaceAnalysis(context.Background(), analysis)

	return analysis, nil
}

// processSpaceAnalysis performs the actual AI analysis
func (s *SpaceAnalysisServiceImpl) processSpaceAnalysis(ctx context.Context, analysis *entities.SpaceAnalysis) {
	defer func() {
		if r := recover(); r != nil {
			analysis.Status = entities.AnalysisStatusFailed
			analysis.UpdatedAt = time.Now()
			s.repo.UpdateSpaceAnalysis(ctx, analysis)
		}
	}()

	// Step 1: Detect room type
	roomDetection, err := s.aiVisionSvc.DetectRoomType(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	analysis.RoomType = roomDetection.RoomType
	analysis.RoomTypeConfidence = roomDetection.Confidence

	// Step 2: Perform comprehensive space analysis
	spaceResult, err := s.aiVisionSvc.AnalyzeSpace(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	// Step 3: Extract spatial features
	spatialResult, err := s.aiVisionSvc.ExtractSpatialFeatures(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	// Step 4: Analyze style
	styleResult, err := s.aiVisionSvc.AnalyzeStyle(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	// Step 5: Analyze lighting
	lightingResult, err := s.aiVisionSvc.AnalyzeLighting(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	// Step 6: Extract color palette
	colorPalette, err := s.aiVisionSvc.ExtractColorPalette(ctx, analysis.ImageURL)
	if err != nil {
		analysis.Status = entities.AnalysisStatusFailed
		analysis.UpdatedAt = time.Now()
		s.repo.UpdateSpaceAnalysis(ctx, analysis)
		return
	}

	// Step 7: Generate style recommendations
	recommendations, err := s.generateStyleRecommendations(ctx, analysis.RoomType, styleResult, colorPalette)
	if err != nil {
		// This is not critical - continue without recommendations
		recommendations = []entities.StyleRecommendation{}
	}

	// Update analysis with all results
	analysis.Dimensions = spaceResult.Dimensions
	analysis.ExistingFurniture = spaceResult.ExistingFurniture
	analysis.SpatialFeatures = *spatialResult.SpatialFeatures
	analysis.StyleAnalysis = *styleResult.StyleAnalysis
	analysis.LightingAnalysis = *lightingResult.LightingAnalysis
	analysis.ColorPalette = colorPalette
	analysis.Recommendations = recommendations
	analysis.AnalysisMetadata = map[string]interface{}{
		"processing_version": "1.0.0",
		"ai_models_used": []string{
			"room_detection_v2",
			"furniture_detection_v3",
			"style_analysis_v1",
			"lighting_analysis_v1",
		},
		"processing_time_ms": time.Since(analysis.CreatedAt).Milliseconds(),
	}
	analysis.Status = entities.AnalysisStatusCompleted
	analysis.UpdatedAt = time.Now()

	// Save final results
	if err := s.repo.UpdateSpaceAnalysis(ctx, analysis); err != nil {
		// Log error but don't change status back to failed
		fmt.Printf("Failed to save analysis results: %v\n", err)
	}
}

// generateStyleRecommendations creates style recommendations based on analysis
func (s *SpaceAnalysisServiceImpl) generateStyleRecommendations(
	ctx context.Context,
	roomType entities.RoomType,
	styleResult *StyleAnalysisResult,
	colorPalette []entities.ColorInfo,
) ([]entities.StyleRecommendation, error) {
	// Get available style references
	styles, _, err := s.repo.ListStyleReferences(ctx, "", nil, 50, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get style references: %w", err)
	}

	var recommendations []entities.StyleRecommendation

	for _, style := range styles {
		compatibility := s.calculateStyleCompatibility(style, styleResult, colorPalette)
		if compatibility > 0.3 { // Only include reasonably compatible styles
			recommendations = append(recommendations, entities.StyleRecommendation{
				StyleID:            style.ID,
				StyleName:          style.Name,
				Description:        style.Description,
				CompatibilityScore: compatibility,
				ReasoningNotes:     s.generateReasoningNotes(style, styleResult, colorPalette),
			})
		}
	}

	// Sort by compatibility score (highest first)
	for i := 0; i < len(recommendations)-1; i++ {
		for j := i + 1; j < len(recommendations); j++ {
			if recommendations[i].CompatibilityScore < recommendations[j].CompatibilityScore {
				recommendations[i], recommendations[j] = recommendations[j], recommendations[i]
			}
		}
	}

	// Return top 5 recommendations
	if len(recommendations) > 5 {
		recommendations = recommendations[:5]
	}

	return recommendations, nil
}

// calculateStyleCompatibility calculates how well a style matches the analyzed space
func (s *SpaceAnalysisServiceImpl) calculateStyleCompatibility(
	style *entities.StyleReference,
	styleResult *StyleAnalysisResult,
	colorPalette []entities.ColorInfo,
) float64 {
	score := 0.0
	factors := 0

	// Check style tag compatibility
	for _, tag := range style.CharacteristicTags {
		if tag == styleResult.PrimaryStyle {
			score += 0.8
			factors++
		}
		for _, secondary := range styleResult.SecondaryStyles {
			if tag == secondary {
				score += 0.4
				factors++
			}
		}
	}

	// Check color compatibility
	colorCompatibility := s.calculateColorCompatibility(style.ColorPalettes, colorPalette)
	score += colorCompatibility * 0.6
	factors++

	if factors == 0 {
		return 0.0
	}

	return score / float64(factors)
}

// calculateColorCompatibility checks how well style colors match the space
func (s *SpaceAnalysisServiceImpl) calculateColorCompatibility(
	stylePalettes []entities.StyleColorPalette,
	spaceColors []entities.ColorInfo,
) float64 {
	if len(stylePalettes) == 0 || len(spaceColors) == 0 {
		return 0.5 // neutral score
	}

	maxCompatibility := 0.0

	for _, palette := range stylePalettes {
		compatibility := 0.0
		totalColors := len(palette.PrimaryColors) + len(palette.AccentColors) + len(palette.NeutralColors)
		
		if totalColors == 0 {
			continue
		}

		matchingColors := 0
		allStyleColors := append(append(palette.PrimaryColors, palette.AccentColors...), palette.NeutralColors...)

		for _, spaceColor := range spaceColors {
			for _, styleColor := range allStyleColors {
				if s.colorsAreSimilar(spaceColor, styleColor) {
					matchingColors++
					break
				}
			}
		}

		compatibility = float64(matchingColors) / float64(len(spaceColors))
		if compatibility > maxCompatibility {
			maxCompatibility = compatibility
		}
	}

	return maxCompatibility
}

// colorsAreSimilar checks if two colors are similar
func (s *SpaceAnalysisServiceImpl) colorsAreSimilar(color1, color2 entities.ColorInfo) bool {
	// Simple RGB distance calculation
	r1, g1, b1 := color1.RGB.R, color1.RGB.G, color1.RGB.B
	r2, g2, b2 := color2.RGB.R, color2.RGB.G, color2.RGB.B

	distance := float64((r1-r2)*(r1-r2) + (g1-g2)*(g1-g2) + (b1-b2)*(b1-b2))
	maxDistance := float64(255 * 255 * 3) // Maximum possible distance

	return (distance / maxDistance) < 0.3 // Colors are similar if distance is less than 30%
}

// generateReasoningNotes creates explanatory notes for style recommendations
func (s *SpaceAnalysisServiceImpl) generateReasoningNotes(
	style *entities.StyleReference,
	styleResult *StyleAnalysisResult,
	colorPalette []entities.ColorInfo,
) []string {
	var notes []string

	// Style compatibility notes
	for _, tag := range style.CharacteristicTags {
		if tag == styleResult.PrimaryStyle {
			notes = append(notes, fmt.Sprintf("Matches your space's primary %s style", tag))
		}
	}

	// Color compatibility notes
	if len(style.ColorPalettes) > 0 {
		notes = append(notes, "Color palette complements your existing space")
	}

	// General suitability notes
	if len(notes) == 0 {
		notes = append(notes, "Good overall compatibility with your space")
	}

	return notes
}

// GetAnalysis retrieves an analysis by ID
func (s *SpaceAnalysisServiceImpl) GetAnalysis(ctx context.Context, analysisID uuid.UUID, userID uuid.UUID) (*entities.SpaceAnalysis, error) {
	analysis, err := s.repo.GetSpaceAnalysisByID(ctx, analysisID)
	if err != nil {
		return nil, fmt.Errorf("failed to get analysis: %w", err)
	}

	// Verify ownership
	if analysis.UserID != userID {
		return nil, fmt.Errorf("analysis not found or access denied")
	}

	return analysis, nil
}

// GetUserAnalyses retrieves user's analysis history
func (s *SpaceAnalysisServiceImpl) GetUserAnalyses(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.SpaceAnalysis, error) {
	analyses, _, err := s.repo.GetUserSpaceAnalyses(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user analyses: %w", err)
	}

	return analyses, nil
}

// SuggestRoomType provides room type suggestions for an image
func (s *SpaceAnalysisServiceImpl) SuggestRoomType(ctx context.Context, imageURL string) ([]RoomTypeSuggestion, error) {
	detection, err := s.aiVisionSvc.DetectRoomType(ctx, imageURL)
	if err != nil {
		return nil, fmt.Errorf("failed to detect room type: %w", err)
	}

	// For now, return the primary detection
	// In a real implementation, this might return multiple possibilities
	suggestions := []RoomTypeSuggestion{
		{
			RoomType:   detection.RoomType,
			Confidence: detection.Confidence,
		},
	}

	return suggestions, nil
}

// Supporting types

type AnalyzeSpaceRequest struct {
	ImageURL  string
	UserID    uuid.UUID
	ProjectID *uuid.UUID
}

type RoomTypeSuggestion struct {
	RoomType   entities.RoomType
	Confidence float64
}

type SpaceAnalysisResult struct {
	Dimensions        *entities.SpaceDimensions
	ExistingFurniture []entities.DetectedFurniture
}

type RoomTypeDetection struct {
	RoomType   entities.RoomType
	Confidence float64
}

type SpatialFeaturesResult struct {
	SpatialFeatures *entities.SpatialFeatures
}

type StyleAnalysisResult struct {
	StyleAnalysis   *entities.StyleAnalysis
	PrimaryStyle    string
	SecondaryStyles []string
}

type LightingAnalysisResult struct {
	LightingAnalysis *entities.LightingAnalysis
}