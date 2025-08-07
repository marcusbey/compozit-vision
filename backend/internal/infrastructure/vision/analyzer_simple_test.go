package vision

import (
	"context"
	"testing"
	"time"
)

func TestNewSimpleAnalyzer(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	if analyzer == nil {
		t.Fatal("Expected simple analyzer to be created, got nil")
	}
	
	if analyzer.calibrationService == nil {
		t.Fatal("Expected calibration service to be set, got nil")
	}
	
	if analyzer.measurementExtractor == nil {
		t.Fatal("Expected measurement extractor to be set, got nil")
	}
}

func TestSimpleAnalyzerAnalyzeRoom(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
		Options: AnalysisOptions{
			DetectFurniture: true,
			DetectLighting:  true,
			MinConfidence:   0.7,
			MeasurementUnit: "metric",
		},
	}
	
	ctx := context.Background()
	
	measurement, err := analyzer.AnalyzeRoom(ctx, request)
	if err != nil {
		t.Fatalf("Expected successful analysis, got error: %v", err)
	}
	
	// Validate measurement
	if measurement.ID == "" {
		t.Error("Expected measurement ID to be set")
	}
	
	if measurement.ImageURL != request.ImageURL {
		t.Errorf("Expected image URL %s, got %s", request.ImageURL, measurement.ImageURL)
	}
	
	if measurement.Status != "completed" {
		t.Errorf("Expected status 'completed', got %s", measurement.Status)
	}
	
	if measurement.Confidence <= 0 || measurement.Confidence > 1 {
		t.Errorf("Expected confidence between 0 and 1, got %f", measurement.Confidence)
	}
	
	// Validate room dimensions
	dims := measurement.Measurements.RoomDimensions
	if dims.Length <= 0 {
		t.Error("Expected positive room length")
	}
	
	if dims.Width <= 0 {
		t.Error("Expected positive room width")
	}
	
	if dims.Area <= 0 {
		t.Error("Expected positive room area")
	}
	
	expectedArea := dims.Length * dims.Width
	if dims.Area != expectedArea {
		t.Errorf("Expected area %f to equal length * width %f", 
			dims.Area, expectedArea)
	}
	
	// Validate ceiling height
	if measurement.Measurements.CeilingHeight <= 0 {
		t.Error("Expected positive ceiling height")
	}
	
	// Validate doors and windows
	if len(measurement.Measurements.Doors) == 0 {
		t.Error("Expected at least one door")
	}
	
	if len(measurement.Measurements.Windows) == 0 {
		t.Error("Expected at least one window")
	}
	
	// Check that furniture was detected (since we requested it)
	if len(measurement.Measurements.Furniture) == 0 {
		t.Error("Expected furniture to be detected when requested")
	}
	
	// Check that lighting was detected (since we requested it)
	if len(measurement.Measurements.LightingSources) == 0 {
		t.Error("Expected lighting sources to be detected when requested")
	}
	
	// Validate metadata
	if measurement.Metadata["processing_time_ms"] == nil {
		t.Error("Expected processing time metadata")
	}
	
	if measurement.Metadata["image_dimensions"] == nil {
		t.Error("Expected image dimensions metadata")
	}
	
	if measurement.Metadata["detected_features"] == nil {
		t.Error("Expected detected features metadata")
	}
}

func TestSimpleAnalyzerAnalyzeRoomWithImageData(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		ImageData: []byte("mock image data"),
		Options: AnalysisOptions{
			DetectFurniture: false,
			DetectLighting:  false,
			MinConfidence:   0.8,
			MeasurementUnit: "metric",
		},
	}
	
	ctx := context.Background()
	
	measurement, err := analyzer.AnalyzeRoom(ctx, request)
	if err != nil {
		t.Fatalf("Expected successful analysis, got error: %v", err)
	}
	
	// Should succeed with image data
	if measurement.Status != "completed" {
		t.Errorf("Expected status 'completed', got %s", measurement.Status)
	}
	
	// Should not detect furniture or lighting when not requested
	if len(measurement.Measurements.Furniture) > 0 {
		t.Error("Expected no furniture when not requested")
	}
	
	if len(measurement.Measurements.LightingSources) > 0 {
		t.Error("Expected no lighting sources when not requested")
	}
}

func TestSimpleAnalyzerAnalyzeRoomNoImage(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		// No ImageURL or ImageData
		Options: AnalysisOptions{
			MinConfidence:   0.7,
			MeasurementUnit: "metric",
		},
	}
	
	ctx := context.Background()
	
	_, err := analyzer.AnalyzeRoom(ctx, request)
	if err == nil {
		t.Error("Expected error for request without image, got nil")
	}
	
	expectedError := "either image_url or image_data must be provided"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestSimpleAnalyzerWithContext(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
		Options: AnalysisOptions{
			MinConfidence: 0.7,
		},
	}
	
	// Test with timeout context
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	
	measurement, err := analyzer.AnalyzeRoom(ctx, request)
	if err != nil {
		t.Fatalf("Expected successful analysis within timeout, got error: %v", err)
	}
	
	if measurement.Status != "completed" {
		t.Errorf("Expected status 'completed', got %s", measurement.Status)
	}
}

func TestSimpleAnalyzerTimestamp(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
	}
	
	ctx := context.Background()
	
	beforeAnalysis := time.Now()
	measurement, err := analyzer.AnalyzeRoom(ctx, request)
	afterAnalysis := time.Now()
	
	if err != nil {
		t.Fatalf("Expected successful analysis, got error: %v", err)
	}
	
	// Check timestamps are reasonable
	if measurement.CreatedAt.Before(beforeAnalysis) || measurement.CreatedAt.After(afterAnalysis) {
		t.Error("Created timestamp should be within analysis timeframe")
	}
	
	if measurement.UpdatedAt.Before(measurement.CreatedAt) {
		t.Error("Updated timestamp should be after or equal to created timestamp")
	}
	
	// Processing time should be positive
	processingTime, ok := measurement.Metadata["processing_time_ms"].(int64)
	if !ok || processingTime <= 0 {
		t.Error("Expected positive processing time in metadata")
	}
}

func TestSimpleAnalyzerOpeningValidation(t *testing.T) {
	analyzer := NewSimpleAnalyzer()
	
	request := AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
	}
	
	ctx := context.Background()
	measurement, err := analyzer.AnalyzeRoom(ctx, request)
	if err != nil {
		t.Fatalf("Expected successful analysis, got error: %v", err)
	}
	
	// Validate door properties
	for _, door := range measurement.Measurements.Doors {
		if door.Type != "door" {
			t.Errorf("Expected door type 'door', got %s", door.Type)
		}
		
		if door.Width <= 0 || door.Height <= 0 {
			t.Error("Expected positive door dimensions")
		}
		
		if door.Wall == "" {
			t.Error("Expected door wall to be specified")
		}
	}
	
	// Validate window properties
	for _, window := range measurement.Measurements.Windows {
		if window.Type != "window" {
			t.Errorf("Expected window type 'window', got %s", window.Type)
		}
		
		if window.Width <= 0 || window.Height <= 0 {
			t.Error("Expected positive window dimensions")
		}
		
		if window.Wall == "" {
			t.Error("Expected window wall to be specified")
		}
	}
}