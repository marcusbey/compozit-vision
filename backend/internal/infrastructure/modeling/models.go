package modeling

import (
	"time"
)

// ModelType represents different types of 3D models
type ModelType string

const (
	ModelTypeRoom      ModelType = "room"
	ModelTypeFurniture ModelType = "furniture"
	ModelTypeComplete  ModelType = "complete"
)

// ExportFormat represents different export formats
type ExportFormat string

const (
	ExportFormatGLTF      ExportFormat = "gltf"
	ExportFormatGLB       ExportFormat = "glb"
	ExportFormatOBJ       ExportFormat = "obj"
	ExportFormatFBX       ExportFormat = "fbx"
	ExportFormatPDF       ExportFormat = "pdf"      // For floor plans
	ExportFormatDWG       ExportFormat = "dwg"      // AutoCAD format
	ExportFormatPNG       ExportFormat = "png"      // For 2D renders
)

// ViewType represents different architectural views
type ViewType string

const (
	ViewTypeFloorPlan     ViewType = "floor_plan"
	ViewTypeElevation     ViewType = "elevation"
	ViewTypeSection       ViewType = "section"
	ViewTypePerspective   ViewType = "perspective"
	ViewTypeIsometric     ViewType = "isometric"
)

// Material represents a 3D material
type Material struct {
	ID             string                 `json:"id"`
	Name           string                 `json:"name"`
	Type           string                 `json:"type"`
	Color          string                 `json:"color"`
	Texture        string                 `json:"texture,omitempty"`
	Metalness      float32                `json:"metalness"`
	Roughness      float32                `json:"roughness"`
	NormalMap      string                 `json:"normal_map,omitempty"`
	Properties     map[string]interface{} `json:"properties,omitempty"`
}

// Light represents a light source in the scene
type Light struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"` // point, directional, spot, area
	Position  []float32              `json:"position"`
	Color     string                 `json:"color"`
	Intensity float32                `json:"intensity"`
	Properties map[string]interface{} `json:"properties,omitempty"`
}

// Furniture represents a furniture item in 3D space
type Furniture struct {
	ID           string    `json:"id"`
	ProductID    string    `json:"product_id"`
	Name         string    `json:"name"`
	ModelURL     string    `json:"model_url"`
	Position     []float32 `json:"position"`    // x, y, z
	Rotation     []float32 `json:"rotation"`    // x, y, z in radians
	Scale        []float32 `json:"scale"`       // x, y, z scale factors
	BoundingBox  []float32 `json:"bounding_box"` // min x,y,z, max x,y,z
}

// Room represents room geometry
type Room struct {
	ID          string                 `json:"id"`
	Dimensions  RoomDimensions         `json:"dimensions"`
	Walls       []Wall                 `json:"walls"`
	Floor       Floor                  `json:"floor"`
	Ceiling     Ceiling                `json:"ceiling"`
	Features    []ArchitecturalFeature `json:"features"`
}

// RoomDimensions contains room measurements
type RoomDimensions struct {
	Length float32 `json:"length"` // in meters
	Width  float32 `json:"width"`  // in meters
	Height float32 `json:"height"` // in meters
}

// Wall represents a wall in the room
type Wall struct {
	ID        string    `json:"id"`
	StartPoint []float32 `json:"start_point"` // x, y
	EndPoint   []float32 `json:"end_point"`   // x, y
	Height     float32   `json:"height"`
	Thickness  float32   `json:"thickness"`
	Material   *Material `json:"material,omitempty"`
}

// Floor represents the floor of a room
type Floor struct {
	Vertices [][]float32 `json:"vertices"` // Array of [x, y] points
	Material *Material   `json:"material,omitempty"`
}

// Ceiling represents the ceiling of a room
type Ceiling struct {
	Height   float32   `json:"height"`
	Material *Material `json:"material,omitempty"`
}

// ArchitecturalFeature represents doors, windows, etc.
type ArchitecturalFeature struct {
	ID       string    `json:"id"`
	Type     string    `json:"type"` // door, window, column, etc.
	Position []float32 `json:"position"`
	Dimensions map[string]float32 `json:"dimensions"`
	Properties map[string]interface{} `json:"properties,omitempty"`
}

// ModelingRequest represents a request to generate a 3D model
type ModelingRequest struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	ProjectID   string                 `json:"project_id"`
	Type        ModelType              `json:"type"`
	Room        *Room                  `json:"room,omitempty"`
	Furniture   []Furniture            `json:"furniture,omitempty"`
	Lights      []Light                `json:"lights,omitempty"`
	Materials   []Material             `json:"materials,omitempty"`
	Parameters  map[string]interface{} `json:"parameters,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
}

// ModelingResult represents the result of 3D modeling
type ModelingResult struct {
	ID             string                 `json:"id"`
	RequestID      string                 `json:"request_id"`
	Status         string                 `json:"status"`
	ModelURL       string                 `json:"model_url,omitempty"`
	ThumbnailURL   string                 `json:"thumbnail_url,omitempty"`
	Format         ExportFormat           `json:"format"`
	FileSize       int64                  `json:"file_size"`
	VertexCount    int                    `json:"vertex_count"`
	PolygonCount   int                    `json:"polygon_count"`
	Progress       int                    `json:"progress"`
	Error          string                 `json:"error,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
	ProcessingTime float64                `json:"processing_time_seconds"`
	CreatedAt      time.Time              `json:"created_at"`
	CompletedAt    *time.Time             `json:"completed_at,omitempty"`
}

// ExportRequest represents a request to export models/drawings
type ExportRequest struct {
	ID         string                 `json:"id"`
	ProjectID  string                 `json:"project_id"`
	Format     ExportFormat           `json:"format"`
	ViewType   ViewType               `json:"view_type,omitempty"`
	Options    map[string]interface{} `json:"options,omitempty"`
	CreatedAt  time.Time              `json:"created_at"`
}

// ExportResult represents the result of an export operation
type ExportResult struct {
	ID          string       `json:"id"`
	RequestID   string       `json:"request_id"`
	FileURL     string       `json:"file_url"`
	Format      ExportFormat `json:"format"`
	FileSize    int64        `json:"file_size"`
	CreatedAt   time.Time    `json:"created_at"`
}

// Scene represents a complete 3D scene
type Scene struct {
	ID          string                 `json:"id"`
	ProjectID   string                 `json:"project_id"`
	Room        Room                   `json:"room"`
	Furniture   []Furniture            `json:"furniture"`
	Lights      []Light                `json:"lights"`
	Camera      Camera                 `json:"camera"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// Camera represents camera settings for viewing the scene
type Camera struct {
	Position []float32 `json:"position"` // x, y, z
	Target   []float32 `json:"target"`   // x, y, z look-at point
	FOV      float32   `json:"fov"`      // Field of view in degrees
	Type     string    `json:"type"`     // perspective, orthographic
}