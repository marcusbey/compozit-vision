package vision

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/vision"
)

// AnalyzeHandler handles room analysis requests
type AnalyzeHandler struct {
	analyzer vision.RoomAnalyzer
}

// NewAnalyzeHandler creates a new analyze handler
func NewAnalyzeHandler(analyzer vision.RoomAnalyzer) *AnalyzeHandler {
	return &AnalyzeHandler{
		analyzer: analyzer,
	}
}

// AnalyzeRoom handles POST /api/vision/analyze
func (h *AnalyzeHandler) AnalyzeRoom(c *gin.Context) {
	var request vision.AnalysisRequest
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate request
	if request.ImageURL == "" && len(request.ImageData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Either image_url or image_data must be provided",
		})
		return
	}

	// Set default options if not provided
	if request.Options.MinConfidence == 0 {
		request.Options.MinConfidence = 0.7
	}
	if request.Options.MeasurementUnit == "" {
		request.Options.MeasurementUnit = "metric"
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(c.Request.Context(), 60*time.Second)
	defer cancel()

	// Perform analysis
	measurement, err := h.analyzer.AnalyzeRoom(ctx, request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Analysis failed",
			"details": err.Error(),
		})
		return
	}

	// Return result
	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"measurement": measurement,
	})
}

// AnalyzeRoomAsync handles POST /api/vision/analyze/async
func (h *AnalyzeHandler) AnalyzeRoomAsync(c *gin.Context) {
	var request vision.AnalysisRequest
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate request
	if request.ImageURL == "" && len(request.ImageData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Either image_url or image_data must be provided",
		})
		return
	}

	// Generate analysis ID
	analysisID := "analysis_" + time.Now().Format("20060102150405") + "_" + c.GetString("user_id")

	// Start background processing
	go func() {
		ctx := context.Background()
		_, err := h.analyzer.AnalyzeRoom(ctx, request)
		if err != nil {
			// Log error - in a real implementation, update the analysis status
			// and notify the client via websocket or polling endpoint
		}
	}()

	// Return analysis ID immediately
	c.JSON(http.StatusAccepted, gin.H{
		"status":      "accepted",
		"analysis_id": analysisID,
		"message":     "Analysis started. Use GET /api/vision/analyze/{id} to check progress",
	})
}

// GetAnalysisStatus handles GET /api/vision/analyze/:id
func (h *AnalyzeHandler) GetAnalysisStatus(c *gin.Context) {
	analysisID := c.Param("id")
	
	if analysisID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Analysis ID is required",
		})
		return
	}

	// In a real implementation, this would check the status from database/cache
	// For now, return a mock response
	c.JSON(http.StatusOK, gin.H{
		"analysis_id": analysisID,
		"status":      "completed",
		"progress":    100.0,
		"result": vision.RoomMeasurement{
			ID:     analysisID,
			Status: "completed",
			// Mock data - in real implementation, fetch from storage
		},
	})
}

// ValidateImage validates image format and size
func (h *AnalyzeHandler) ValidateImage(c *gin.Context) {
	var request struct {
		ImageURL  string `json:"image_url,omitempty"`
		ImageData []byte `json:"image_data,omitempty"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate image
	valid := true
	issues := []string{}

	if request.ImageURL == "" && len(request.ImageData) == 0 {
		valid = false
		issues = append(issues, "No image provided")
	}

	// Check image size if data is provided
	if len(request.ImageData) > 10*1024*1024 { // 10MB limit
		valid = false
		issues = append(issues, "Image too large (max 10MB)")
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":  valid,
		"issues": issues,
	})
}

// GetSupportedFormats returns supported image formats
func (h *AnalyzeHandler) GetSupportedFormats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"supported_formats": []string{"JPEG", "PNG", "WebP"},
		"max_size_mb":      10,
		"min_resolution":   "640x480",
		"max_resolution":   "4096x4096",
		"recommended_resolution": "1920x1080",
	})
}