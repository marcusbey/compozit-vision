package vision

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// SimpleAnalyzer is a simplified version without OpenCV dependencies for testing
type SimpleAnalyzer struct {
	calibrationService   *CalibrationService
	measurementExtractor *MeasurementExtractor
}

// NewSimpleAnalyzer creates a simplified analyzer for testing
func NewSimpleAnalyzer() *SimpleAnalyzer {
	calibrationService := NewCalibrationService()
	return &SimpleAnalyzer{
		calibrationService:   calibrationService,
		measurementExtractor: NewMeasurementExtractor(calibrationService),
	}
}

// AnalyzeRoom performs simplified room analysis without actual image processing
func (a *SimpleAnalyzer) AnalyzeRoom(ctx context.Context, request AnalysisRequest) (*RoomMeasurement, error) {
	// Validate request
	if request.ImageURL == "" && len(request.ImageData) == 0 {
		return nil, errors.New("either image_url or image_data must be provided")
	}

	// Create measurement ID
	measurementID := uuid.New().String()

	// Initialize measurement
	measurement := &RoomMeasurement{
		ID:        measurementID,
		ImageURL:  request.ImageURL,
		Status:    "processing",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Metadata:  make(map[string]interface{}),
	}

	// Simulate processing time
	time.Sleep(100 * time.Millisecond)

	// Mock analysis results
	mockCorners := []Point2D{
		{X: 100, Y: 100},
		{X: 800, Y: 100},
		{X: 100, Y: 600},
		{X: 800, Y: 600},
	}

	mockEdges := []Edge{
		{Start: Point2D{X: 100, Y: 100}, End: Point2D{X: 800, Y: 100}, Type: "horizontal"},
		{Start: Point2D{X: 100, Y: 100}, End: Point2D{X: 100, Y: 600}, Type: "vertical"},
		{Start: Point2D{X: 800, Y: 100}, End: Point2D{X: 800, Y: 600}, Type: "vertical"},
		{Start: Point2D{X: 100, Y: 600}, End: Point2D{X: 800, Y: 600}, Type: "horizontal"},
	}

	// Create mock depth map
	mockDepthMap := make([][]float64, 600)
	for i := range mockDepthMap {
		mockDepthMap[i] = make([]float64, 800)
		for j := range mockDepthMap[i] {
			mockDepthMap[i][j] = 3.5 // 3.5 meters depth
		}
	}

	// Get calibration
	calibration := a.calibrationService.GetDefaultCalibration()

	// Extract room dimensions
	roomDimensions, err := a.measurementExtractor.ExtractRoomDimensions(
		mockCorners, mockEdges, mockDepthMap, calibration, 1920, 1080,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to extract room dimensions: %w", err)
	}

	// Mock ceiling height calculation
	verticalEdges := []Edge{
		{Start: Point2D{X: 100, Y: 100}, End: Point2D{X: 100, Y: 600}, Type: "vertical"},
		{Start: Point2D{X: 800, Y: 100}, End: Point2D{X: 800, Y: 600}, Type: "vertical"},
	}

	vanishingPoints := []Point2D{
		{X: 0.5, Y: 0.3},
	}

	ceilingHeight := a.measurementExtractor.ExtractCeilingHeight(
		verticalEdges, vanishingPoints, 3.5, calibration, 1080,
	)

	// Mock openings
	doors := []Opening{
		{
			Type:     "door",
			Position: Point2D{X: 0.2, Y: 0.8},
			Width:    0.9,
			Height:   2.0,
			Wall:     "south",
		},
	}

	windows := []Opening{
		{
			Type:     "window",
			Position: Point2D{X: 0.8, Y: 0.3},
			Width:    1.2,
			Height:   1.0,
			Wall:     "east",
		},
	}

	// Build measurement data
	measurementData := MeasurementData{
		RoomDimensions: *roomDimensions,
		CeilingHeight:  ceilingHeight,
		Doors:          doors,
		Windows:        windows,
		FloorMaterial:  "hardwood",
	}

	// Add furniture if requested
	if request.Options.DetectFurniture {
		furniture := []FurnitureItem{
			{
				Type: "sofa",
				BoundingBox: Rectangle{
					TopLeft:     Point2D{X: 300, Y: 400},
					BottomRight: Point2D{X: 500, Y: 550},
				},
				Confidence: 0.85,
			},
		}
		measurementData.Furniture = furniture
	}

	// Add lighting if requested
	if request.Options.DetectLighting {
		lighting := []LightSource{
			{
				Type:     "ceiling",
				Position: Point3D{X: 400, Y: 300, Z: 2.4},
				Intensity: 0.8,
			},
		}
		measurementData.LightingSources = lighting
	}

	// Calculate confidence based on mock data quality
	confidence := 0.85

	// Update measurement
	measurement.Measurements = measurementData
	measurement.Confidence = confidence
	measurement.Status = "completed"
	measurement.UpdatedAt = time.Now()

	// Add processing metadata
	measurement.Metadata["processing_time_ms"] = time.Since(measurement.CreatedAt).Milliseconds()
	measurement.Metadata["image_dimensions"] = map[string]int{
		"width":  1920,
		"height": 1080,
	}
	measurement.Metadata["detected_features"] = map[string]int{
		"corners": len(mockCorners),
		"edges":   len(mockEdges),
		"doors":   len(doors),
		"windows": len(windows),
	}

	return measurement, nil
}