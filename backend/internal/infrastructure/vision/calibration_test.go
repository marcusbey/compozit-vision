package vision

import (
	"testing"
)

func TestNewCalibrationService(t *testing.T) {
	service := NewCalibrationService()
	
	if service == nil {
		t.Fatal("Expected calibration service to be created, got nil")
	}
	
	defaultCal := service.GetDefaultCalibration()
	if defaultCal == nil {
		t.Fatal("Expected default calibration to be available, got nil")
	}
	
	if defaultCal.FocalLength <= 0 {
		t.Error("Expected positive focal length in default calibration")
	}
	
	if defaultCal.SensorWidth <= 0 || defaultCal.SensorHeight <= 0 {
		t.Error("Expected positive sensor dimensions in default calibration")
	}
}

func TestCalibrateCamera(t *testing.T) {
	service := NewCalibrationService()
	
	// Test with valid reference object
	refObject := ReferenceObject{
		Type:       "door",
		ActualSize: 2040.0, // mm
		PixelSize:  400.0,  // pixels
		Distance:   3.0,    // meters
	}
	
	imageData := ImageData{
		Width:  1920,
		Height: 1080,
	}
	
	calibration, err := service.Calibrate(refObject, imageData)
	if err != nil {
		t.Fatalf("Expected successful calibration, got error: %v", err)
	}
	
	if calibration.FocalLength <= 0 {
		t.Error("Expected positive focal length from calibration")
	}
	
	if calibration.SensorWidth <= 0 || calibration.SensorHeight <= 0 {
		t.Error("Expected positive sensor dimensions from calibration")
	}
}

func TestCalibrateWithInvalidObject(t *testing.T) {
	service := NewCalibrationService()
	
	// Test with invalid reference object (zero size)
	refObject := ReferenceObject{
		Type:       "invalid",
		ActualSize: 0, // Invalid size
		PixelSize:  100.0,
		Distance:   2.0,
	}
	
	imageData := ImageData{
		Width:  1920,
		Height: 1080,
	}
	
	_, err := service.Calibrate(refObject, imageData)
	if err == nil {
		t.Error("Expected error for invalid reference object, got nil")
	}
}

func TestCalculateRealWorldDistance(t *testing.T) {
	service := NewCalibrationService()
	
	calibration := &CalibrationData{
		FocalLength:  35.0,
		SensorWidth:  36.0,
		SensorHeight: 24.0,
		PrincipalPoint: Point2D{X: 0.5, Y: 0.5},
	}
	
	pixelDistance := 100.0
	depthEstimate := 3.0
	imageWidth := 1920
	
	realDistance := service.CalculateRealWorldDistance(
		pixelDistance, depthEstimate, calibration, imageWidth,
	)
	
	if realDistance <= 0 {
		t.Error("Expected positive real world distance")
	}
	
	// Test with nil calibration (should use default)
	realDistanceDefault := service.CalculateRealWorldDistance(
		pixelDistance, depthEstimate, nil, imageWidth,
	)
	
	if realDistanceDefault <= 0 {
		t.Error("Expected positive real world distance with default calibration")
	}
}

func TestEstimateDepthFromVanishingPoints(t *testing.T) {
	service := NewCalibrationService()
	
	calibration := service.GetDefaultCalibration()
	
	// Test with no vanishing points
	vanishingPoints := []Point2D{}
	depth := service.EstimateDepthFromVanishingPoints(vanishingPoints, calibration)
	
	if depth != 3.5 {
		t.Errorf("Expected default depth of 3.5m for no vanishing points, got %f", depth)
	}
	
	// Test with vanishing points
	vanishingPoints = []Point2D{
		{X: 0.5, Y: 0.3},
		{X: 0.2, Y: 0.4},
	}
	
	depth = service.EstimateDepthFromVanishingPoints(vanishingPoints, calibration)
	
	if depth < 2.5 || depth > 5.5 {
		t.Errorf("Expected depth between 2.5 and 5.5m, got %f", depth)
	}
}

func TestSaveAndLoadCalibration(t *testing.T) {
	service := NewCalibrationService()
	
	originalCalibration := &CalibrationData{
		FocalLength:     50.0,
		SensorWidth:     35.0,
		SensorHeight:    23.3,
		PrincipalPoint:  Point2D{X: 0.5, Y: 0.5},
		DistortionCoeff: []float64{0.1, -0.2, 0.0, 0.0, 0.0},
	}
	
	// Save calibration
	data, err := service.SaveCalibration(originalCalibration)
	if err != nil {
		t.Fatalf("Expected successful save, got error: %v", err)
	}
	
	if len(data) == 0 {
		t.Error("Expected non-empty calibration data")
	}
	
	// Load calibration
	loadedCalibration, err := service.LoadCalibration(data)
	if err != nil {
		t.Fatalf("Expected successful load, got error: %v", err)
	}
	
	// Compare values
	if loadedCalibration.FocalLength != originalCalibration.FocalLength {
		t.Errorf("Expected focal length %f, got %f", 
			originalCalibration.FocalLength, loadedCalibration.FocalLength)
	}
	
	if loadedCalibration.SensorWidth != originalCalibration.SensorWidth {
		t.Errorf("Expected sensor width %f, got %f", 
			originalCalibration.SensorWidth, loadedCalibration.SensorWidth)
	}
}

func TestLoadInvalidCalibration(t *testing.T) {
	service := NewCalibrationService()
	
	// Test with invalid JSON
	invalidData := []byte("invalid json")
	_, err := service.LoadCalibration(invalidData)
	if err == nil {
		t.Error("Expected error for invalid calibration data, got nil")
	}
}

func TestEstimateSensorDimensions(t *testing.T) {
	service := NewCalibrationService()
	
	// Test landscape image
	imgLandscape := ImageData{
		Width:  1920,
		Height: 1080,
	}
	
	width, height := service.estimateSensorDimensions(imgLandscape)
	if width <= 0 || height <= 0 {
		t.Error("Expected positive sensor dimensions")
	}
	
	// For landscape, width should be larger than height
	if width <= height {
		t.Error("Expected landscape sensor to have width > height")
	}
	
	// Test portrait image
	imgPortrait := ImageData{
		Width:  1080,
		Height: 1920,
	}
	
	width, height = service.estimateSensorDimensions(imgPortrait)
	if width <= 0 || height <= 0 {
		t.Error("Expected positive sensor dimensions")
	}
}