package ai

import (
	"time"
)

// RenderType represents the type of rendering
type RenderType string

const (
	RenderTypeQuick    RenderType = "quick"
	RenderTypeDetailed RenderType = "detailed"
	RenderTypeStyle    RenderType = "style"
)

// StyleType represents different design styles
type StyleType string

const (
	StyleModern        StyleType = "modern"
	StyleMinimalist    StyleType = "minimalist"
	StyleScandinavian  StyleType = "scandinavian"
	StyleIndustrial    StyleType = "industrial"
	StyleBohemian      StyleType = "bohemian"
	StyleTraditional   StyleType = "traditional"
	StyleContemporary  StyleType = "contemporary"
	StyleRustic        StyleType = "rustic"
)

// RenderRequest represents a request to render an image
type RenderRequest struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	ProjectID   string                 `json:"project_id"`
	Type        RenderType             `json:"type"`
	InputImage  string                 `json:"input_image"`
	Style       StyleType              `json:"style,omitempty"`
	Prompt      string                 `json:"prompt"`
	Parameters  map[string]interface{} `json:"parameters,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
}

// RenderResult represents the result of an AI rendering
type RenderResult struct {
	ID             string                 `json:"id"`
	RequestID      string                 `json:"request_id"`
	Status         string                 `json:"status"`
	ResultImageURL string                 `json:"result_image_url,omitempty"`
	Progress       int                    `json:"progress"`
	Error          string                 `json:"error,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
	ProcessingTime float64                `json:"processing_time_seconds"`
	CreatedAt      time.Time              `json:"created_at"`
	CompletedAt    *time.Time             `json:"completed_at,omitempty"`
}

// InpaintingRequest represents a request for AI inpainting
type InpaintingRequest struct {
	BaseImage      string    `json:"base_image"`
	MaskImage      string    `json:"mask_image"`
	Prompt         string    `json:"prompt"`
	NegativePrompt string    `json:"negative_prompt,omitempty"`
	Strength       float32   `json:"strength"`
	GuidanceScale  float32   `json:"guidance_scale"`
	Steps          int       `json:"steps"`
}

// StyleTransferRequest represents a style transfer request
type StyleTransferRequest struct {
	ContentImage string    `json:"content_image"`
	StyleImage   string    `json:"style_image,omitempty"`
	Style        StyleType `json:"style"`
	Strength     float32   `json:"strength"`
}

// PromptComponents for structured prompt generation
type PromptComponents struct {
	RoomType        string   `json:"room_type"`
	CurrentElements []string `json:"current_elements"`
	DesiredStyle    string   `json:"desired_style"`
	FurnitureItems  []string `json:"furniture_items"`
	ColorScheme     []string `json:"color_scheme"`
	Lighting        string   `json:"lighting"`
	Additional      []string `json:"additional"`
}