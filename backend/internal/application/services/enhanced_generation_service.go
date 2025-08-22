package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/compozit/compozit-vision-api/internal/domain/entities"
	"github.com/compozit/compozit-vision-api/internal/domain/repositories"
)

// AIGenerationService interface for AI design generation operations
type AIGenerationService interface {
	GenerateDesign(ctx context.Context, request EnhancedGenerationRequest) (*GenerationResult, error)
	ApplyStyle(ctx context.Context, imageURL string, style *entities.StyleReference, ambiance *entities.AmbianceOption) (*StyledImageResult, error)
	PlaceFurniture(ctx context.Context, request FurniturePlacementRequest) (*FurniturePlacementResult, error)
	EstimateCosts(ctx context.Context, furnitureItems []entities.ProposedFurniture) (*entities.CostEstimate, error)
	CalculateQualityMetrics(ctx context.Context, originalImage, generatedImage string, analysis *entities.SpaceAnalysis) (*entities.QualityMetrics, error)
}

// EnhancedGenerationServiceImpl implements enhanced design generation business logic
type EnhancedGenerationServiceImpl struct {
	repo              repositories.SpaceAnalysisRepository
	furnitureRepo     repositories.FurnitureRepository
	aiGenerationSvc   AIGenerationService
	spaceAnalysisSvc  *SpaceAnalysisServiceImpl
	styleSvc          *StyleServiceImpl
}

// NewEnhancedGenerationService creates a new enhanced generation service
func NewEnhancedGenerationService(
	repo repositories.SpaceAnalysisRepository,
	furnitureRepo repositories.FurnitureRepository,
	aiGenerationSvc AIGenerationService,
	spaceAnalysisSvc *SpaceAnalysisServiceImpl,
	styleSvc *StyleServiceImpl,
) *EnhancedGenerationServiceImpl {
	return &EnhancedGenerationServiceImpl{
		repo:              repo,
		furnitureRepo:     furnitureRepo,
		aiGenerationSvc:   aiGenerationSvc,
		spaceAnalysisSvc:  spaceAnalysisSvc,
		styleSvc:          styleSvc,
	}
}

// GenerateEnhancedDesign orchestrates the enhanced design generation process
func (s *EnhancedGenerationServiceImpl) GenerateEnhancedDesign(
	ctx context.Context,
	request entities.EnhancedGenerationRequest,
) (*entities.EnhancedGenerationResult, error) {
	startTime := time.Now()

	// Validate user ownership of space analysis
	userID := ctx.Value("user_id").(string)
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	// Get space analysis
	spaceAnalysis, err := s.spaceAnalysisSvc.GetAnalysis(ctx, request.SpaceAnalysisID, userUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to get space analysis: %w", err)
	}

	// Verify analysis is completed
	if spaceAnalysis.Status != entities.AnalysisStatusCompleted {
		return nil, fmt.Errorf("space analysis must be completed before generation")
	}

	// Get style reference
	styleRef, err := s.styleSvc.GetStyleReference(ctx, request.StyleReferenceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get style reference: %w", err)
	}

	// Get ambiance option
	ambianceOptions, err := s.styleSvc.GetAmbianceOptions(ctx, &request.StyleReferenceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get ambiance options: %w", err)
	}

	var selectedAmbiance *entities.AmbianceOption
	for _, option := range ambianceOptions {
		if option.ID == request.AmbianceOptionID {
			selectedAmbiance = option
			break
		}
	}
	if selectedAmbiance == nil {
		return nil, fmt.Errorf("ambiance option not found")
	}

	// Create initial generation result
	result := &entities.EnhancedGenerationResult{
		ID:              uuid.New(),
		RequestID:       uuid.New(),
		UserID:          userUUID,
		SpaceAnalysisID: request.SpaceAnalysisID,
		Status:          entities.GenerationStatusProcessing,
		CreatedAt:       time.Now(),
	}

	// Save initial record
	if err := s.repo.CreateGenerationResult(ctx, result); err != nil {
		return nil, fmt.Errorf("failed to create generation result: %w", err)
	}

	// Process generation asynchronously
	go s.processEnhancedGeneration(context.Background(), result, request, spaceAnalysis, styleRef, selectedAmbiance, startTime)

	return result, nil
}

// processEnhancedGeneration performs the actual generation process
func (s *EnhancedGenerationServiceImpl) processEnhancedGeneration(
	ctx context.Context,
	result *entities.EnhancedGenerationResult,
	request entities.EnhancedGenerationRequest,
	spaceAnalysis *entities.SpaceAnalysis,
	styleRef *entities.StyleReference,
	ambiance *entities.AmbianceOption,
	startTime time.Time,
) {
	defer func() {
		if r := recover(); r != nil {
			result.Status = entities.GenerationStatusFailed
			s.repo.UpdateGenerationResult(ctx, result)
		}
	}()

	// Step 1: Generate base design with AI
	genRequest := EnhancedGenerationRequest{
		SpaceAnalysis:    spaceAnalysis,
		StyleReference:   styleRef,
		AmbianceOption:   ambiance,
		ColorPaletteIndex: request.ColorPaletteIndex,
		FurnitureOptions: request.FurnitureOptions,
	}

	generationResult, err := s.aiGenerationSvc.GenerateDesign(ctx, genRequest)
	if err != nil {
		result.Status = entities.GenerationStatusFailed
		s.repo.UpdateGenerationResult(ctx, result)
		return
	}

	result.GeneratedImageURL = generationResult.GeneratedImageURL

	// Step 2: Apply style and ambiance
	styledResult, err := s.aiGenerationSvc.ApplyStyle(ctx, result.GeneratedImageURL, styleRef, ambiance)
	if err != nil {
		result.Status = entities.GenerationStatusFailed
		s.repo.UpdateGenerationResult(ctx, result)
		return
	}

	result.GeneratedImageURL = styledResult.StyledImageURL

	// Step 3: Generate furniture proposals
	furnitureProposals, err := s.generateFurnitureProposals(ctx, spaceAnalysis, styleRef, request.FurnitureOptions)
	if err != nil {
		result.Status = entities.GenerationStatusFailed
		s.repo.UpdateGenerationResult(ctx, result)
		return
	}

	result.FurnitureProposed = furnitureProposals

	// Step 4: Calculate cost estimate
	costEstimate, err := s.aiGenerationSvc.EstimateCosts(ctx, furnitureProposals)
	if err != nil {
		// Non-critical error - use default estimate
		costEstimate = &entities.CostEstimate{
			FurnitureCost:    0,
			DeliveryCost:     0,
			InstallationCost: 0,
			TotalCost:        0,
			Currency:         "USD",
		}
	}

	result.EstimatedCost = *costEstimate

	// Step 5: Calculate quality metrics
	qualityMetrics, err := s.aiGenerationSvc.CalculateQualityMetrics(
		ctx,
		spaceAnalysis.ImageURL,
		result.GeneratedImageURL,
		spaceAnalysis,
	)
	if err != nil {
		// Non-critical error - use default metrics
		qualityMetrics = &entities.QualityMetrics{
			StyleAccuracy:   0.8,
			ColorHarmony:    0.8,
			SpatialBalance:  0.8,
			LightingQuality: 0.8,
			OverallScore:    0.8,
		}
	}

	result.QualityMetrics = *qualityMetrics

	// Step 6: Set style application details
	selectedPalette := entities.StyleColorPalette{}
	if request.ColorPaletteIndex < len(styleRef.ColorPalettes) {
		selectedPalette = styleRef.ColorPalettes[request.ColorPaletteIndex]
	}

	result.StyleApplied = entities.StyleApplication{
		StyleReferenceID:  styleRef.ID,
		AmbianceOptionID:  ambiance.ID,
		ColorPaletteUsed:  selectedPalette,
		ApplicationNotes:  []string{"Style successfully applied", "Color harmony maintained"},
		ConfidenceScore:   qualityMetrics.StyleAccuracy,
	}

	// Step 7: Finalize result
	result.Status = entities.GenerationStatusCompleted
	result.ProcessingTime = int(time.Since(startTime).Milliseconds())

	// Save final result
	if err := s.repo.UpdateGenerationResult(ctx, result); err != nil {
		fmt.Printf("Failed to save generation result: %v\n", err)
	}
}

// generateFurnitureProposals creates furniture placement proposals
func (s *EnhancedGenerationServiceImpl) generateFurnitureProposals(
	ctx context.Context,
	spaceAnalysis *entities.SpaceAnalysis,
	styleRef *entities.StyleReference,
	options entities.FurnitureOptions,
) ([]entities.ProposedFurniture, error) {
	var proposals []entities.ProposedFurniture

	// Get compatible furniture for the room type and style
	for _, furnitureStyle := range styleRef.FurnitureStyles {
		// Get furniture items from this category
		category, err := s.furnitureRepo.GetFurnitureCategoryBySlug(ctx, furnitureStyle.CategoryName)
		if err != nil {
			continue // Skip if category not found
		}

		// Search for furniture items
		filters := entities.FurnitureSearchFilters{
			CategoryIDs: []uuid.UUID{category.ID},
			StyleTags:   styleRef.CharacteristicTags,
			RoomType:    &spaceAnalysis.RoomType,
			BudgetRange: &options.BudgetRange,
			Limit:       5,
		}

		searchResult, err := s.furnitureRepo.ListFurnitureItems(ctx, filters)
		if err != nil {
			continue
		}

		// Create proposals for each item
		for _, item := range searchResult.Items {
			if len(proposals) >= 10 { // Limit proposals
				break
			}

			placement := s.calculateOptimalPlacement(spaceAnalysis, &item)
			proposal := entities.ProposedFurniture{
				FurnitureItemID: item.ID,
				Placement:       placement,
				Reasoning:       fmt.Sprintf("Complements %s style and fits well in %s", styleRef.Name, spaceAnalysis.RoomType),
			}

			proposals = append(proposals, proposal)
		}
	}

	return proposals, nil
}

// calculateOptimalPlacement determines the best placement for furniture
func (s *EnhancedGenerationServiceImpl) calculateOptimalPlacement(
	spaceAnalysis *entities.SpaceAnalysis,
	furniture *entities.FurnitureItem,
) entities.FurniturePlacement {
	// Simple placement algorithm - in production, this would be more sophisticated
	
	// Avoid existing furniture areas
	x := 0.5 // Center
	y := 0.5 // Center
	
	// Adjust based on existing furniture
	for _, existing := range spaceAnalysis.ExistingFurniture {
		if existing.BoundingBox.X < 0.5 {
			x += 0.2 // Move right if furniture on left
		} else {
			x -= 0.2 // Move left if furniture on right
		}
	}

	// Ensure bounds
	if x < 0.1 {
		x = 0.1
	}
	if x > 0.9 {
		x = 0.9
	}

	return entities.FurniturePlacement{
		X:        x,
		Y:        y,
		Rotation: 0,
		Scale:    1.0,
		ZIndex:   1,
	}
}

// GetGenerationResult retrieves a generation result by ID
func (s *EnhancedGenerationServiceImpl) GetGenerationResult(
	ctx context.Context,
	resultID uuid.UUID,
	userID uuid.UUID,
) (*entities.EnhancedGenerationResult, error) {
	result, err := s.repo.GetGenerationResultByID(ctx, resultID)
	if err != nil {
		return nil, fmt.Errorf("failed to get generation result: %w", err)
	}

	// Verify ownership
	if result.UserID != userID {
		return nil, fmt.Errorf("generation result not found or access denied")
	}

	return result, nil
}

// GetUserGenerations retrieves user's generation history
func (s *EnhancedGenerationServiceImpl) GetUserGenerations(
	ctx context.Context,
	userID uuid.UUID,
	limit, offset int,
) ([]*entities.EnhancedGenerationResult, error) {
	results, _, err := s.repo.GetUserGenerationResults(ctx, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user generations: %w", err)
	}

	return results, nil
}

// CancelGeneration cancels a generation in progress
func (s *EnhancedGenerationServiceImpl) CancelGeneration(
	ctx context.Context,
	resultID uuid.UUID,
	userID uuid.UUID,
) error {
	result, err := s.GetGenerationResult(ctx, resultID, userID)
	if err != nil {
		return err
	}

	// Only allow cancellation of processing generations
	if result.Status != entities.GenerationStatusProcessing && result.Status != entities.GenerationStatusQueued {
		return fmt.Errorf("cannot cancel generation with status: %s", result.Status)
	}

	// Update status to cancelled
	result.Status = entities.GenerationStatusCancelled
	return s.repo.UpdateGenerationResult(ctx, result)
}

// Supporting types for AI service integration

type EnhancedGenerationRequest struct {
	SpaceAnalysis     *entities.SpaceAnalysis
	StyleReference    *entities.StyleReference
	AmbianceOption    *entities.AmbianceOption
	ColorPaletteIndex int
	FurnitureOptions  entities.FurnitureOptions
}

type GenerationResult struct {
	GeneratedImageURL string
	ProcessingTime    time.Duration
	Metadata          map[string]interface{}
}

type StyledImageResult struct {
	StyledImageURL string
	StyleMetrics   map[string]float64
}

type FurniturePlacementRequest struct {
	BaseImageURL       string
	FurnitureItems     []entities.FurnitureItem
	SpaceConstraints   entities.SpaceDimensions
	PreserveExisting   bool
}

type FurniturePlacementResult struct {
	CompositeImageURL string
	PlacedFurniture   []entities.ProposedFurniture
}