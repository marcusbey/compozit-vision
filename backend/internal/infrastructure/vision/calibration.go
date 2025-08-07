package vision

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
)

// CalibrationService handles camera calibration for accurate measurements
type CalibrationService struct {
	defaultCalibration CalibrationData
}

// NewCalibrationService creates a new calibration service
func NewCalibrationService() *CalibrationService {
	return &CalibrationService{
		defaultCalibration: CalibrationData{
			FocalLength:    28.0, // Default 28mm equivalent
			SensorWidth:    36.0, // Full frame sensor width in mm
			SensorHeight:   24.0, // Full frame sensor height in mm
			PrincipalPoint: Point2D{X: 0.5, Y: 0.5}, // Center of image
			DistortionCoeff: []float64{0, 0, 0, 0, 0}, // No distortion by default
		},
	}
}

// Calibrate performs camera calibration from known reference object
func (cs *CalibrationService) Calibrate(referenceObject ReferenceObject, imageData ImageData) (*CalibrationData, error) {
	if referenceObject.ActualSize <= 0 {
		return nil, errors.New("invalid reference object size")
	}

	// Calculate focal length from reference object
	focalLength := cs.calculateFocalLength(referenceObject, imageData)
	
	// Estimate sensor dimensions based on image aspect ratio
	sensorWidth, sensorHeight := cs.estimateSensorDimensions(imageData)
	
	calibration := &CalibrationData{
		FocalLength:     focalLength,
		SensorWidth:     sensorWidth,
		SensorHeight:    sensorHeight,
		PrincipalPoint:  Point2D{X: 0.5, Y: 0.5},
		DistortionCoeff: []float64{0, 0, 0, 0, 0},
	}
	
	return calibration, nil
}

// CalculateRealWorldDistance converts pixel distance to real-world distance
func (cs *CalibrationService) CalculateRealWorldDistance(
	pixelDistance float64,
	depthEstimate float64,
	calibration *CalibrationData,
	imageWidth int,
) float64 {
	if calibration == nil {
		calibration = &cs.defaultCalibration
	}
	
	// Calculate the field of view
	fov := 2 * math.Atan(calibration.SensorWidth/(2*calibration.FocalLength))
	
	// Calculate the real-world width at the given depth
	realWorldWidth := 2 * depthEstimate * math.Tan(fov/2)
	
	// Calculate the scaling factor
	pixelsPerMeter := float64(imageWidth) / realWorldWidth
	
	// Convert pixel distance to real-world distance
	return pixelDistance / pixelsPerMeter
}

// EstimateDepthFromVanishingPoints estimates depth using vanishing point analysis
func (cs *CalibrationService) EstimateDepthFromVanishingPoints(
	vanishingPoints []Point2D,
	calibration *CalibrationData,
) float64 {
	if len(vanishingPoints) < 2 {
		// Default room depth estimate
		return 3.5 // meters
	}
	
	// Simplified depth estimation based on vanishing point positions
	// In a real implementation, this would use more sophisticated algorithms
	avgY := 0.0
	for _, vp := range vanishingPoints {
		avgY += vp.Y
	}
	avgY /= float64(len(vanishingPoints))
	
	// Estimate depth based on vanishing point height
	// Higher vanishing points typically indicate greater depth
	depthEstimate := 2.5 + (avgY * 3.0) // Range: 2.5m to 5.5m
	
	return depthEstimate
}

// calculateFocalLength estimates focal length from reference object
func (cs *CalibrationService) calculateFocalLength(ref ReferenceObject, img ImageData) float64 {
	// f = (P × D) / W
	// where f = focal length, P = object size in pixels, 
	// D = distance to object, W = actual object width
	
	pixelSize := ref.PixelSize
	actualSize := ref.ActualSize
	distance := ref.Distance
	
	if distance <= 0 {
		// Estimate distance based on typical room scenarios
		distance = 2.0 // meters
	}
	
	// Convert to mm
	focalLength := (pixelSize * distance * 1000) / actualSize
	
	// Clamp to reasonable range (10mm to 200mm)
	if focalLength < 10 {
		focalLength = 10
	} else if focalLength > 200 {
		focalLength = 200
	}
	
	return focalLength
}

// estimateSensorDimensions estimates sensor dimensions from image
func (cs *CalibrationService) estimateSensorDimensions(img ImageData) (float64, float64) {
	aspectRatio := float64(img.Width) / float64(img.Height)
	
	// Assume full-frame sensor as baseline
	var sensorWidth, sensorHeight float64
	
	if aspectRatio > 1.4 { // Landscape orientation
		sensorWidth = 36.0
		sensorHeight = sensorWidth / aspectRatio
	} else { // Portrait or square
		sensorHeight = 24.0
		sensorWidth = sensorHeight * aspectRatio
	}
	
	return sensorWidth, sensorHeight
}

// ReferenceObject represents a known object used for calibration
type ReferenceObject struct {
	Type       string  `json:"type"`        // e.g., "door", "a4_paper", "credit_card"
	ActualSize float64 `json:"actual_size"` // Actual size in mm
	PixelSize  float64 `json:"pixel_size"`  // Size in pixels in the image
	Distance   float64 `json:"distance"`    // Distance from camera in meters
}

// ImageData represents basic image information
type ImageData struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// SaveCalibration saves calibration data to JSON
func (cs *CalibrationService) SaveCalibration(calibration *CalibrationData) ([]byte, error) {
	return json.Marshal(calibration)
}

// LoadCalibration loads calibration data from JSON
func (cs *CalibrationService) LoadCalibration(data []byte) (*CalibrationData, error) {
	var calibration CalibrationData
	err := json.Unmarshal(data, &calibration)
	if err != nil {
		return nil, fmt.Errorf("failed to load calibration: %w", err)
	}
	return &calibration, nil
}

// GetDefaultCalibration returns the default calibration settings
func (cs *CalibrationService) GetDefaultCalibration() *CalibrationData {
	return &cs.defaultCalibration
}