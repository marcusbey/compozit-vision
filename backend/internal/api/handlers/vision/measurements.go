package vision

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/vision"
)

// MeasurementHandler handles measurement retrieval and management
type MeasurementHandler struct {
	// In a real implementation, this would include database/storage services
}

// NewMeasurementHandler creates a new measurement handler
func NewMeasurementHandler() *MeasurementHandler {
	return &MeasurementHandler{}
}

// GetMeasurement handles GET /api/vision/measurements/:id
func (h *MeasurementHandler) GetMeasurement(c *gin.Context) {
	measurementID := c.Param("id")
	
	if measurementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Measurement ID is required",
		})
		return
	}

	// In a real implementation, fetch from database
	// For now, return mock data
	measurement := &vision.RoomMeasurement{
		ID:       measurementID,
		UserID:   c.GetString("user_id"),
		ImageURL: "https://example.com/room.jpg",
		Measurements: vision.MeasurementData{
			RoomDimensions: vision.RoomDimensions{
				Length: 4.5,
				Width:  3.2,
				Area:   14.4,
			},
			CeilingHeight: 2.4,
			Doors: []vision.Opening{
				{
					Type:     "door",
					Position: vision.Point2D{X: 0.2, Y: 0.5},
					Width:    0.9,
					Height:   2.0,
					Wall:     "north",
				},
			},
			Windows: []vision.Opening{
				{
					Type:     "window",
					Position: vision.Point2D{X: 0.8, Y: 0.3},
					Width:    1.2,
					Height:   1.0,
					Wall:     "east",
				},
			},
			FloorMaterial: "hardwood",
		},
		Confidence: 0.85,
		Status:     "completed",
		CreatedAt:  time.Now().Add(-time.Hour),
		UpdatedAt:  time.Now().Add(-time.Minute * 30),
		Metadata: map[string]interface{}{
			"processing_time_ms": 8500,
			"image_dimensions": map[string]int{
				"width":  1920,
				"height": 1080,
			},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"measurement": measurement,
	})
}

// ListMeasurements handles GET /api/vision/measurements
func (h *MeasurementHandler) ListMeasurements(c *gin.Context) {
	userID := c.GetString("user_id")
	
	// Parse query parameters
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	status := c.Query("status") // "pending", "processing", "completed", "failed"
	projectID := c.Query("project_id")

	// In a real implementation, query from database with filters
	// For now, return mock data
	measurements := []vision.RoomMeasurement{
		{
			ID:       "measurement_1",
			UserID:   userID,
			ImageURL: "https://example.com/room1.jpg",
			Status:   "completed",
			Confidence: 0.85,
			CreatedAt: time.Now().Add(-time.Hour * 2),
		},
		{
			ID:       "measurement_2",
			UserID:   userID,
			ImageURL: "https://example.com/room2.jpg",
			Status:   "processing",
			Confidence: 0.0,
			CreatedAt: time.Now().Add(-time.Minute * 30),
		},
	}

	// Apply filters (mock implementation)
	if status != "" {
		filtered := []vision.RoomMeasurement{}
		for _, m := range measurements {
			if m.Status == status {
				filtered = append(filtered, m)
			}
		}
		measurements = filtered
	}

	// Apply pagination (mock implementation)
	if offset >= len(measurements) {
		measurements = []vision.RoomMeasurement{}
	} else {
		end := offset + limit
		if end > len(measurements) {
			end = len(measurements)
		}
		measurements = measurements[offset:end]
	}

	c.JSON(http.StatusOK, gin.H{
		"measurements": measurements,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"total":  2, // Mock total
		},
		"filters": gin.H{
			"status":     status,
			"project_id": projectID,
		},
	})
}

// DeleteMeasurement handles DELETE /api/vision/measurements/:id
func (h *MeasurementHandler) DeleteMeasurement(c *gin.Context) {
	measurementID := c.Param("id")
	userID := c.GetString("user_id")
	
	if measurementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Measurement ID is required",
		})
		return
	}

	// In a real implementation, verify ownership and delete from database
	// For now, just return success
	_ = userID // Acknowledge variable for future use
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Measurement deleted successfully",
		"id":      measurementID,
	})
}

// UpdateMeasurement handles PATCH /api/vision/measurements/:id
func (h *MeasurementHandler) UpdateMeasurement(c *gin.Context) {
	measurementID := c.Param("id")
	userID := c.GetString("user_id")
	
	if measurementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Measurement ID is required",
		})
		return
	}

	var updates struct {
		ProjectID *string                `json:"project_id,omitempty"`
		Metadata  map[string]interface{} `json:"metadata,omitempty"`
		Notes     *string                `json:"notes,omitempty"`
	}
	
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// In a real implementation, update the measurement in database
	_ = userID // Acknowledge variable for future use
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Measurement updated successfully",
		"id":      measurementID,
		"updates": updates,
	})
}

// ExportMeasurement handles GET /api/vision/measurements/:id/export
func (h *MeasurementHandler) ExportMeasurement(c *gin.Context) {
	measurementID := c.Param("id")
	format := c.Query("format") // "json", "csv", "pdf"
	
	if measurementID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Measurement ID is required",
		})
		return
	}

	if format == "" {
		format = "json"
	}

	// In a real implementation, fetch measurement and export in requested format
	switch format {
	case "json":
		c.Header("Content-Disposition", "attachment; filename=measurement_"+measurementID+".json")
		c.Header("Content-Type", "application/json")
		// Return the measurement JSON
		h.GetMeasurement(c)
		
	case "csv":
		c.Header("Content-Disposition", "attachment; filename=measurement_"+measurementID+".csv")
		c.Header("Content-Type", "text/csv")
		
		csvData := `Field,Value
Room Length,4.5m
Room Width,3.2m
Room Area,14.4m²
Ceiling Height,2.4m
Number of Doors,1
Number of Windows,1
Confidence Score,85%
`
		c.String(http.StatusOK, csvData)
		
	case "pdf":
		c.JSON(http.StatusNotImplemented, gin.H{
			"error": "PDF export not yet implemented",
		})
		
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Unsupported format. Use json, csv, or pdf",
		})
	}
}

// GetMeasurementStats handles GET /api/vision/measurements/stats
func (h *MeasurementHandler) GetMeasurementStats(c *gin.Context) {
	userID := c.GetString("user_id")
	
	// In a real implementation, query statistics from database
	stats := gin.H{
		"total_measurements": 15,
		"completed":         12,
		"processing":        2,
		"failed":            1,
		"avg_confidence":    0.82,
		"total_rooms_analyzed": 15,
		"avg_room_size": gin.H{
			"area":   18.5, // m²
			"length": 4.8,  // m
			"width":  3.9,  // m
		},
		"processing_stats": gin.H{
			"avg_processing_time_ms": 7200,
			"fastest_analysis_ms":    3500,
			"slowest_analysis_ms":    12800,
		},
		"user_id": userID,
	}

	c.JSON(http.StatusOK, stats)
}