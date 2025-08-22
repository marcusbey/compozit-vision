package space

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/compozit/compozit-vision-api/internal/domain/entities"
)

// SpaceAnalysisService interface for space analysis operations
type SpaceAnalysisService interface {
	AnalyzeSpace(ctx context.Context, request AnalyzeSpaceRequest) (*entities.SpaceAnalysis, error)
	GetAnalysis(ctx context.Context, analysisID uuid.UUID, userID uuid.UUID) (*entities.SpaceAnalysis, error)
	GetUserAnalyses(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.SpaceAnalysis, error)
	SuggestRoomType(ctx context.Context, imageURL string) ([]RoomTypeSuggestion, error)
}

// StyleService interface for style operations
type StyleService interface {
	GetStyleReferences(ctx context.Context, category string) ([]*entities.StyleReference, error)
	GetStyleReference(ctx context.Context, styleID uuid.UUID) (*entities.StyleReference, error)
	GetAmbianceOptions(ctx context.Context, styleID *uuid.UUID) ([]*entities.AmbianceOption, error)
}

// GenerationService interface for enhanced design generation
type GenerationService interface {
	GenerateEnhancedDesign(ctx context.Context, request entities.EnhancedGenerationRequest) (*entities.EnhancedGenerationResult, error)
	GetGenerationResult(ctx context.Context, resultID uuid.UUID, userID uuid.UUID) (*entities.EnhancedGenerationResult, error)
	GetUserGenerations(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.EnhancedGenerationResult, error)
	CancelGeneration(ctx context.Context, resultID uuid.UUID, userID uuid.UUID) error
}

// AnalysisHandler handles space analysis requests
type AnalysisHandler struct {
	spaceService      SpaceAnalysisService
	styleService      StyleService
	generationService GenerationService
}

// NewAnalysisHandler creates a new analysis handler
func NewAnalysisHandler(
	spaceService SpaceAnalysisService,
	styleService StyleService,
	generationService GenerationService,
) *AnalysisHandler {
	return &AnalysisHandler{
		spaceService:      spaceService,
		styleService:      styleService,
		generationService: generationService,
	}
}

// AnalyzeSpaceRequest represents space analysis request
type AnalyzeSpaceRequest struct {
	ImageURL  string     `json:"image_url" binding:"required"`
	UserID    uuid.UUID  `json:"user_id" binding:"required"`
	ProjectID *uuid.UUID `json:"project_id,omitempty"`
}

// RoomTypeSuggestion represents room type prediction
type RoomTypeSuggestion struct {
	RoomType   entities.RoomType `json:"room_type"`
	Confidence float64           `json:"confidence"`
}

// AnalyzeSpace handles POST /api/v1/space/analyze
func (h *AnalysisHandler) AnalyzeSpace(c *gin.Context) {
	var request AnalyzeSpaceRequest

	// Extract user ID from authentication context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid user ID format",
			"details": err.Error(),
		})
		return
	}

	request.UserID = userUUID

	// Handle multipart form data (for file uploads) or JSON
	contentType := c.GetHeader("Content-Type")
	if contentType == "application/json" {
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request format",
				"details": err.Error(),
			})
			return
		}
	} else {
		// Handle form data
		request.ImageURL = c.PostForm("image_url")
		if projectIDStr := c.PostForm("project_id"); projectIDStr != "" {
			projectUUID, err := uuid.Parse(projectIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error":   "Invalid project ID format",
					"details": err.Error(),
				})
				return
			}
			request.ProjectID = &projectUUID
		}
	}

	// Validate request
	if request.ImageURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "image_url is required",
		})
		return
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(c.Request.Context(), 120*time.Second)
	defer cancel()

	// Perform analysis
	analysis, err := h.spaceService.AnalyzeSpace(ctx, request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Space analysis failed",
			"details": err.Error(),
		})
		return
	}

	// Return result
	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   analysis,
	})
}

// GetAnalysis handles GET /api/v1/space/analysis/:id
func (h *AnalysisHandler) GetAnalysis(c *gin.Context) {
	analysisIDStr := c.Param("id")
	if analysisIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Analysis ID is required",
		})
		return
	}

	analysisID, err := uuid.Parse(analysisIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid analysis ID format",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	analysis, err := h.spaceService.GetAnalysis(ctx, analysisID, userUUID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Analysis not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   analysis,
	})
}

// GetUserAnalyses handles GET /api/v1/space/analyses
func (h *AnalysisHandler) GetUserAnalyses(c *gin.Context) {
	// Extract user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	analyses, err := h.spaceService.GetUserAnalyses(ctx, userUUID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve analyses",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   analyses,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(analyses),
		},
	})
}

// SuggestRoomType handles POST /api/v1/space/suggest-room-type
func (h *AnalysisHandler) SuggestRoomType(c *gin.Context) {
	var request struct {
		ImageURL string `json:"image_url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	suggestions, err := h.spaceService.SuggestRoomType(ctx, request.ImageURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Room type suggestion failed",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   suggestions,
	})
}

// GetStyleReferences handles GET /api/v1/styles/references
func (h *AnalysisHandler) GetStyleReferences(c *gin.Context) {
	category := c.Query("category")

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	styles, err := h.styleService.GetStyleReferences(ctx, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve style references",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   styles,
	})
}

// GetStyleReference handles GET /api/v1/styles/references/:id
func (h *AnalysisHandler) GetStyleReference(c *gin.Context) {
	styleIDStr := c.Param("id")
	if styleIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Style ID is required",
		})
		return
	}

	styleID, err := uuid.Parse(styleIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid style ID format",
			"details": err.Error(),
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	style, err := h.styleService.GetStyleReference(ctx, styleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Style reference not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   style,
	})
}

// GetAmbianceOptions handles GET /api/v1/styles/ambiance
func (h *AnalysisHandler) GetAmbianceOptions(c *gin.Context) {
	var styleID *uuid.UUID
	if styleIDStr := c.Query("style_id"); styleIDStr != "" {
		parsed, err := uuid.Parse(styleIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid style ID format",
				"details": err.Error(),
			})
			return
		}
		styleID = &parsed
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	options, err := h.styleService.GetAmbianceOptions(ctx, styleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve ambiance options",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   options,
	})
}

// GenerateEnhancedDesign handles POST /api/v1/generate/enhanced
func (h *AnalysisHandler) GenerateEnhancedDesign(c *gin.Context) {
	var request entities.EnhancedGenerationRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID and add to context for validation
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	// Create context with timeout for generation
	ctx, cancel := context.WithTimeout(c.Request.Context(), 180*time.Second)
	defer cancel()

	// Add user ID to context for service validation
	ctx = context.WithValue(ctx, "user_id", userID)

	result, err := h.generationService.GenerateEnhancedDesign(ctx, request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Design generation failed",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   result,
	})
}

// GetGenerationResult handles GET /api/v1/generate/result/:id
func (h *AnalysisHandler) GetGenerationResult(c *gin.Context) {
	resultIDStr := c.Param("id")
	if resultIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Result ID is required",
		})
		return
	}

	resultID, err := uuid.Parse(resultIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid result ID format",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	result, err := h.generationService.GetGenerationResult(ctx, resultID, userUUID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Generation result not found",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   result,
	})
}

// GetUserGenerations handles GET /api/v1/generate/results
func (h *AnalysisHandler) GetUserGenerations(c *gin.Context) {
	// Extract user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	results, err := h.generationService.GetUserGenerations(ctx, userUUID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to retrieve generation results",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(results),
		},
	})
}

// CancelGeneration handles POST /api/v1/generate/result/:id/cancel
func (h *AnalysisHandler) CancelGeneration(c *gin.Context) {
	resultIDStr := c.Param("id")
	if resultIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Result ID is required",
		})
		return
	}

	resultID, err := uuid.Parse(resultIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid result ID format",
			"details": err.Error(),
		})
		return
	}

	// Extract user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User authentication required",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	err = h.generationService.CancelGeneration(ctx, resultID, userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to cancel generation",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Generation cancelled successfully",
	})
}