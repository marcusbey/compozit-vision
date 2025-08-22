package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/compozit/compozit-vision-api/internal/domain/entities"
	"github.com/compozit/compozit-vision-api/internal/domain/repositories"
)

// StyleServiceImpl implements style management business logic
type StyleServiceImpl struct {
	repo repositories.SpaceAnalysisRepository
}

// NewStyleService creates a new style service
func NewStyleService(repo repositories.SpaceAnalysisRepository) *StyleServiceImpl {
	return &StyleServiceImpl{
		repo: repo,
	}
}

// GetStyleReferences retrieves available style references
func (s *StyleServiceImpl) GetStyleReferences(ctx context.Context, category string) ([]*entities.StyleReference, error) {
	isActive := true
	styles, _, err := s.repo.ListStyleReferences(ctx, category, &isActive, 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get style references: %w", err)
	}

	return styles, nil
}

// GetStyleReference retrieves a specific style reference
func (s *StyleServiceImpl) GetStyleReference(ctx context.Context, styleID uuid.UUID) (*entities.StyleReference, error) {
	style, err := s.repo.GetStyleReferenceByID(ctx, styleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get style reference: %w", err)
	}

	return style, nil
}

// GetAmbianceOptions retrieves ambiance options, optionally filtered by style
func (s *StyleServiceImpl) GetAmbianceOptions(ctx context.Context, styleID *uuid.UUID) ([]*entities.AmbianceOption, error) {
	if styleID != nil {
		// Get options for specific style
		options, err := s.repo.GetAmbianceOptionsByStyle(ctx, *styleID)
		if err != nil {
			return nil, fmt.Errorf("failed to get ambiance options for style: %w", err)
		}
		return options, nil
	}

	// Get all options
	options, _, err := s.repo.ListAmbianceOptions(ctx, 100, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to get ambiance options: %w", err)
	}

	return options, nil
}

// CreateStyleReference creates a new style reference
func (s *StyleServiceImpl) CreateStyleReference(ctx context.Context, style *entities.StyleReference) error {
	// Validate required fields
	if style.Name == "" {
		return fmt.Errorf("style name is required")
	}
	if style.Description == "" {
		return fmt.Errorf("style description is required")
	}
	if style.Category == "" {
		return fmt.Errorf("style category is required")
	}

	// Set defaults
	if style.ID == uuid.Nil {
		style.ID = uuid.New()
	}
	if style.Slug == "" {
		style.Slug = generateSlug(style.Name)
	}

	return s.repo.CreateStyleReference(ctx, style)
}

// UpdateStyleReference updates an existing style reference
func (s *StyleServiceImpl) UpdateStyleReference(ctx context.Context, style *entities.StyleReference) error {
	// Validate the style exists
	existing, err := s.repo.GetStyleReferenceByID(ctx, style.ID)
	if err != nil {
		return fmt.Errorf("style reference not found: %w", err)
	}

	// Preserve created date
	style.CreatedAt = existing.CreatedAt

	return s.repo.UpdateStyleReference(ctx, style)
}

// DeleteStyleReference soft deletes a style reference
func (s *StyleServiceImpl) DeleteStyleReference(ctx context.Context, styleID uuid.UUID) error {
	// Get the style to verify it exists
	style, err := s.repo.GetStyleReferenceByID(ctx, styleID)
	if err != nil {
		return fmt.Errorf("style reference not found: %w", err)
	}

	// Soft delete by setting isActive to false
	style.IsActive = false
	return s.repo.UpdateStyleReference(ctx, style)
}

// CreateAmbianceOption creates a new ambiance option
func (s *StyleServiceImpl) CreateAmbianceOption(ctx context.Context, ambiance *entities.AmbianceOption) error {
	if ambiance.Name == "" {
		return fmt.Errorf("ambiance name is required")
	}
	if ambiance.Description == "" {
		return fmt.Errorf("ambiance description is required")
	}

	if ambiance.ID == uuid.Nil {
		ambiance.ID = uuid.New()
	}

	return s.repo.CreateAmbianceOption(ctx, ambiance)
}

// UpdateAmbianceOption updates an existing ambiance option
func (s *StyleServiceImpl) UpdateAmbianceOption(ctx context.Context, ambiance *entities.AmbianceOption) error {
	// Verify the ambiance exists
	_, err := s.repo.GetAmbianceOptionByID(ctx, ambiance.ID)
	if err != nil {
		return fmt.Errorf("ambiance option not found: %w", err)
	}

	return s.repo.UpdateAmbianceOption(ctx, ambiance)
}

// DeleteAmbianceOption deletes an ambiance option
func (s *StyleServiceImpl) DeleteAmbianceOption(ctx context.Context, ambianceID uuid.UUID) error {
	return s.repo.DeleteAmbianceOption(ctx, ambianceID)
}

// SearchStyleReferences searches for styles by query
func (s *StyleServiceImpl) SearchStyleReferences(ctx context.Context, query string, limit int) ([]*entities.StyleReference, error) {
	if query == "" {
		return s.GetStyleReferences(ctx, "")
	}

	styles, err := s.repo.SearchStyleReferences(ctx, query, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to search style references: %w", err)
	}

	return styles, nil
}

// GetStylesByCategory retrieves styles grouped by category
func (s *StyleServiceImpl) GetStylesByCategory(ctx context.Context) (map[string][]*entities.StyleReference, error) {
	allStyles, err := s.GetStyleReferences(ctx, "")
	if err != nil {
		return nil, err
	}

	stylesByCategory := make(map[string][]*entities.StyleReference)
	for _, style := range allStyles {
		stylesByCategory[style.Category] = append(stylesByCategory[style.Category], style)
	}

	return stylesByCategory, nil
}

// GetPopularStyles retrieves popular styles based on usage statistics
func (s *StyleServiceImpl) GetPopularStyles(ctx context.Context, roomType *entities.RoomType, limit int) ([]*entities.StyleReference, error) {
	// Get popularity statistics
	popularityStats, err := s.repo.GetPopularStyles(ctx, roomType, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get popular styles: %w", err)
	}

	// Get the actual style references
	var styles []*entities.StyleReference
	for _, stat := range popularityStats {
		style, err := s.repo.GetStyleReferenceByID(ctx, stat.StyleID)
		if err != nil {
			continue // Skip if style not found
		}
		styles = append(styles, style)
	}

	return styles, nil
}

// ValidateStyleReference validates a style reference for creation/update
func (s *StyleServiceImpl) ValidateStyleReference(style *entities.StyleReference) []string {
	var errors []string

	if style.Name == "" {
		errors = append(errors, "name is required")
	}
	if style.Description == "" {
		errors = append(errors, "description is required")
	}
	if style.Category == "" {
		errors = append(errors, "category is required")
	}

	// Validate category is one of the allowed values
	validCategories := []string{"modern", "traditional", "eclectic", "minimalist", "industrial", "scandinavian", "bohemian"}
	categoryValid := false
	for _, validCat := range validCategories {
		if style.Category == validCat {
			categoryValid = true
			break
		}
	}
	if !categoryValid {
		errors = append(errors, "category must be one of: "+fmt.Sprintf("%v", validCategories))
	}

	// Validate color palettes
	if len(style.ColorPalettes) == 0 {
		errors = append(errors, "at least one color palette is required")
	}

	for i, palette := range style.ColorPalettes {
		if palette.Name == "" {
			errors = append(errors, fmt.Sprintf("color palette %d name is required", i+1))
		}
		if len(palette.PrimaryColors) == 0 {
			errors = append(errors, fmt.Sprintf("color palette %d must have at least one primary color", i+1))
		}
	}

	// Validate furniture styles
	if len(style.FurnitureStyles) == 0 {
		errors = append(errors, "at least one furniture style guide is required")
	}

	return errors
}

// Helper function to generate slug from name
func generateSlug(name string) string {
	// Simple slug generation - in production, use a proper library
	slug := ""
	for _, char := range name {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') {
			if char >= 'A' && char <= 'Z' {
				char = char + 32 // Convert to lowercase
			}
			slug += string(char)
		} else if char == ' ' || char == '-' || char == '_' {
			if len(slug) > 0 && slug[len(slug)-1] != '-' {
				slug += "-"
			}
		}
	}
	
	// Remove trailing dash
	if len(slug) > 0 && slug[len(slug)-1] == '-' {
		slug = slug[:len(slug)-1]
	}

	return slug
}