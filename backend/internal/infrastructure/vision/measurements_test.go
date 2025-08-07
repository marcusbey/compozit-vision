package vision

import (
	"testing"
)

func TestNewMeasurementExtractor(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	if extractor == nil {
		t.Fatal("Expected measurement extractor to be created, got nil")
	}
	
	if extractor.calibrationService == nil {
		t.Fatal("Expected calibration service to be set, got nil")
	}
}

func TestExtractRoomDimensions(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	// Test with valid corners
	corners := []Point2D{
		{X: 100, Y: 100}, // Top-left
		{X: 500, Y: 100}, // Top-right
		{X: 100, Y: 300}, // Bottom-left
		{X: 500, Y: 300}, // Bottom-right
	}
	
	edges := []Edge{
		{Start: Point2D{X: 100, Y: 100}, End: Point2D{X: 500, Y: 100}, Type: "horizontal"},
		{Start: Point2D{X: 100, Y: 100}, End: Point2D{X: 100, Y: 300}, Type: "vertical"},
	}
	
	// Create a simple depth map
	depthMap := make([][]float64, 400)
	for i := range depthMap {
		depthMap[i] = make([]float64, 600)
		for j := range depthMap[i] {
			depthMap[i][j] = 3.0 // 3 meters depth
		}
	}
	
	calibration := calibrationService.GetDefaultCalibration()
	
	dimensions, err := extractor.ExtractRoomDimensions(
		corners, edges, depthMap, calibration, 1920, 1080,
	)
	
	if err != nil {
		t.Fatalf("Expected successful dimension extraction, got error: %v", err)
	}
	
	if dimensions.Length <= 0 {
		t.Error("Expected positive room length")
	}
	
	if dimensions.Width <= 0 {
		t.Error("Expected positive room width")
	}
	
	if dimensions.Area <= 0 {
		t.Error("Expected positive room area")
	}
	
	expectedArea := dimensions.Length * dimensions.Width
	if dimensions.Area != expectedArea {
		t.Errorf("Expected area %f to equal length * width %f", 
			dimensions.Area, expectedArea)
	}
}

func TestExtractRoomDimensionsInsufficientCorners(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	// Test with insufficient corners
	corners := []Point2D{
		{X: 100, Y: 100},
		{X: 500, Y: 100},
	}
	
	edges := []Edge{}
	depthMap := [][]float64{}
	calibration := calibrationService.GetDefaultCalibration()
	
	_, err := extractor.ExtractRoomDimensions(
		corners, edges, depthMap, calibration, 1920, 1080,
	)
	
	if err == nil {
		t.Error("Expected error for insufficient corners, got nil")
	}
}

func TestExtractCeilingHeight(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	// Test with vertical edges
	verticalEdges := []Edge{
		{
			Start: Point2D{X: 100, Y: 100},
			End:   Point2D{X: 100, Y: 400},
			Type:  "vertical",
		},
		{
			Start: Point2D{X: 200, Y: 150},
			End:   Point2D{X: 200, Y: 350},
			Type:  "vertical",
		},
	}
	
	vanishingPoints := []Point2D{
		{X: 0.5, Y: 0.3},
	}
	
	calibration := calibrationService.GetDefaultCalibration()
	depthEstimate := 3.5
	imageHeight := 1080
	
	height := extractor.ExtractCeilingHeight(
		verticalEdges, vanishingPoints, depthEstimate, calibration, imageHeight,
	)
	
	if height <= 0 {
		t.Error("Expected positive ceiling height")
	}
	
	if height < 2.0 || height > 4.0 {
		t.Errorf("Expected reasonable ceiling height (2-4m), got %f", height)
	}
}

func TestExtractCeilingHeightNoEdges(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	// Test with no vertical edges
	verticalEdges := []Edge{}
	vanishingPoints := []Point2D{}
	calibration := calibrationService.GetDefaultCalibration()
	
	height := extractor.ExtractCeilingHeight(
		verticalEdges, vanishingPoints, 3.0, calibration, 1080,
	)
	
	if height != 2.4 {
		t.Errorf("Expected default ceiling height of 2.4m, got %f", height)
	}
}

func TestDetectOpenings(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	edges := []Edge{
		{Start: Point2D{X: 100, Y: 200}, End: Point2D{X: 200, Y: 200}, Type: "horizontal"},
		{Start: Point2D{X: 100, Y: 400}, End: Point2D{X: 200, Y: 400}, Type: "horizontal"},
		{Start: Point2D{X: 100, Y: 200}, End: Point2D{X: 100, Y: 400}, Type: "vertical"},
		{Start: Point2D{X: 200, Y: 200}, End: Point2D{X: 200, Y: 400}, Type: "vertical"},
	}
	
	// Create depth map
	depthMap := make([][]float64, 500)
	for i := range depthMap {
		depthMap[i] = make([]float64, 300)
		for j := range depthMap[i] {
			depthMap[i][j] = 3.0
		}
	}
	
	calibration := calibrationService.GetDefaultCalibration()
	
	openings := extractor.DetectOpenings(edges, depthMap, calibration, 1920)
	
	// Note: This is currently a simplified implementation that returns empty
	// In a full implementation, this would detect actual rectangular regions
	if openings == nil {
		t.Error("Expected openings slice to be non-nil")
	}
}

func TestCalculateDistance(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	p1 := Point2D{X: 0, Y: 0}
	p2 := Point2D{X: 3, Y: 4}
	
	distance := extractor.calculateDistance(p1, p2)
	
	// Distance should be sqrt(3² + 4²) = 5
	expectedDistance := 5.0
	if distance != expectedDistance {
		t.Errorf("Expected distance %f, got %f", expectedDistance, distance)
	}
}

func TestRectangleMethods(t *testing.T) {
	rect := Rectangle{
		TopLeft:     Point2D{X: 100, Y: 200},
		BottomRight: Point2D{X: 300, Y: 400},
	}
	
	width := rect.Width()
	expectedWidth := 200.0
	if width != expectedWidth {
		t.Errorf("Expected width %f, got %f", expectedWidth, width)
	}
	
	height := rect.Height()
	expectedHeight := 200.0
	if height != expectedHeight {
		t.Errorf("Expected height %f, got %f", expectedHeight, height)
	}
	
	center := rect.Center()
	expectedCenter := Point2D{X: 200, Y: 300}
	if center.X != expectedCenter.X || center.Y != expectedCenter.Y {
		t.Errorf("Expected center %+v, got %+v", expectedCenter, center)
	}
	
	imgRect := rect.ToImageRect()
	if imgRect.Min.X != 100 || imgRect.Min.Y != 200 ||
		imgRect.Max.X != 300 || imgRect.Max.Y != 400 {
		t.Errorf("Expected image rect with bounds (100,200,300,400), got %+v", imgRect)
	}
}

func TestFindRoomBoundaries(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	corners := []Point2D{
		{X: 150, Y: 100},
		{X: 50, Y: 200},
		{X: 250, Y: 300},
		{X: 100, Y: 50},
	}
	
	bounds := extractor.findRoomBoundaries(corners)
	
	expectedTopLeft := Point2D{X: 50, Y: 50}
	expectedBottomRight := Point2D{X: 250, Y: 300}
	
	if bounds.TopLeft.X != expectedTopLeft.X || bounds.TopLeft.Y != expectedTopLeft.Y {
		t.Errorf("Expected top-left %+v, got %+v", expectedTopLeft, bounds.TopLeft)
	}
	
	if bounds.BottomRight.X != expectedBottomRight.X || bounds.BottomRight.Y != expectedBottomRight.Y {
		t.Errorf("Expected bottom-right %+v, got %+v", expectedBottomRight, bounds.BottomRight)
	}
}

func TestCalculateAverageDepth(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	// Create a 5x5 depth map
	depthMap := [][]float64{
		{2.0, 2.5, 3.0, 3.5, 4.0},
		{2.1, 2.6, 3.1, 3.6, 4.1},
		{2.2, 2.7, 3.2, 3.7, 4.2},
		{2.3, 2.8, 3.3, 3.8, 4.3},
		{2.4, 2.9, 3.4, 3.9, 4.4},
	}
	
	bounds := Rectangle{
		TopLeft:     Point2D{X: 1, Y: 1},
		BottomRight: Point2D{X: 3, Y: 3},
	}
	
	avgDepth := extractor.calculateAverageDepth(depthMap, bounds)
	
	// Should average values in the 2x2 region from (1,1) to (3,3)
	// Values: 2.6, 2.7, 3.1, 3.2
	expectedAvg := (2.6 + 2.7 + 3.1 + 3.2) / 4.0
	
	// Use small epsilon for floating point comparison
	epsilon := 0.0001
	if avgDepth < expectedAvg-epsilon || avgDepth > expectedAvg+epsilon {
		t.Errorf("Expected average depth %f, got %f", expectedAvg, avgDepth)
	}
}

func TestCalculateAverageDepthEmptyMap(t *testing.T) {
	calibrationService := NewCalibrationService()
	extractor := NewMeasurementExtractor(calibrationService)
	
	depthMap := [][]float64{}
	bounds := Rectangle{
		TopLeft:     Point2D{X: 0, Y: 0},
		BottomRight: Point2D{X: 100, Y: 100},
	}
	
	avgDepth := extractor.calculateAverageDepth(depthMap, bounds)
	
	if avgDepth != 0 {
		t.Errorf("Expected average depth 0 for empty map, got %f", avgDepth)
	}
}