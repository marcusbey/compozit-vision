package vision

import (
	"time"
)

// RoomMeasurement represents the measured dimensions of a room
type RoomMeasurement struct {
	ID           string                 `json:"id"`
	UserID       string                 `json:"user_id"`
	ProjectID    string                 `json:"project_id,omitempty"`
	ImageURL     string                 `json:"image_url"`
	Measurements MeasurementData        `json:"measurements"`
	Confidence   float64                `json:"confidence"`
	Status       string                 `json:"status"`
	Metadata     map[string]interface{} `json:"metadata"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
}

// MeasurementData contains the extracted room measurements
type MeasurementData struct {
	RoomDimensions  RoomDimensions  `json:"room_dimensions"`
	CeilingHeight   float64         `json:"ceiling_height"`
	Doors           []Opening       `json:"doors"`
	Windows         []Opening       `json:"windows"`
	FloorMaterial   string          `json:"floor_material,omitempty"`
	LightingSources []LightSource   `json:"lighting_sources,omitempty"`
	Furniture       []FurnitureItem `json:"furniture,omitempty"`
}

// RoomDimensions represents the basic room dimensions
type RoomDimensions struct {
	Length float64 `json:"length"` // in meters
	Width  float64 `json:"width"`  // in meters
	Area   float64 `json:"area"`   // in square meters
}

// Opening represents a door or window
type Opening struct {
	Type     string    `json:"type"` // "door" or "window"
	Position Point2D   `json:"position"`
	Width    float64   `json:"width"`
	Height   float64   `json:"height"`
	Wall     string    `json:"wall"` // "north", "south", "east", "west"
}

// LightSource represents detected lighting in the room
type LightSource struct {
	Type     string  `json:"type"` // "ceiling", "floor_lamp", "window_light"
	Position Point3D `json:"position"`
	Intensity float64 `json:"intensity,omitempty"`
}

// FurnitureItem represents detected furniture for masking
type FurnitureItem struct {
	Type        string    `json:"type"`
	BoundingBox Rectangle `json:"bounding_box"`
	Confidence  float64   `json:"confidence"`
}

// Point2D represents a 2D coordinate
type Point2D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// Point3D represents a 3D coordinate
type Point3D struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

// Rectangle represents a bounding box
type Rectangle struct {
	TopLeft     Point2D `json:"top_left"`
	BottomRight Point2D `json:"bottom_right"`
}

// AnalysisRequest represents a request to analyze a room image
type AnalysisRequest struct {
	ImageURL     string                 `json:"image_url"`
	ImageData    []byte                 `json:"image_data,omitempty"`
	ProjectID    string                 `json:"project_id,omitempty"`
	Options      AnalysisOptions        `json:"options,omitempty"`
}

// AnalysisOptions provides configuration for the analysis
type AnalysisOptions struct {
	DetectFurniture   bool    `json:"detect_furniture"`
	DetectLighting    bool    `json:"detect_lighting"`
	EstimateDepth     bool    `json:"estimate_depth"`
	MinConfidence     float64 `json:"min_confidence"`
	MeasurementUnit   string  `json:"measurement_unit"` // "metric" or "imperial"
}

// CalibrationData represents camera calibration information
type CalibrationData struct {
	FocalLength     float64   `json:"focal_length"`
	SensorWidth     float64   `json:"sensor_width"`
	SensorHeight    float64   `json:"sensor_height"`
	PrincipalPoint  Point2D   `json:"principal_point"`
	DistortionCoeff []float64 `json:"distortion_coeff"`
}

// AnalysisResult represents the result of room analysis
type AnalysisResult struct {
	MeasurementID string          `json:"measurement_id"`
	Status        string          `json:"status"` // "pending", "processing", "completed", "failed"
	Progress      float64         `json:"progress"`
	Result        *RoomMeasurement `json:"result,omitempty"`
	Error         string          `json:"error,omitempty"`
}