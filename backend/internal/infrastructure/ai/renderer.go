package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/compozit/vision/backend/pkg/logger"
)

// Renderer handles AI image rendering operations
type Renderer struct {
	replicateToken string
	httpClient     *http.Client
	promptBuilder  *PromptBuilder
	cache          *Cache
	logger         logger.Logger
}

// NewRenderer creates a new AI renderer
func NewRenderer(replicateToken string, cache *Cache, logger logger.Logger) *Renderer {
	return &Renderer{
		replicateToken: replicateToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		promptBuilder: NewPromptBuilder(),
		cache:         cache,
		logger:        logger,
	}
}

// RenderQuick performs fast AI rendering (2-5 seconds)
func (r *Renderer) RenderQuick(ctx context.Context, req *RenderRequest) (*RenderResult, error) {
	startTime := time.Now()
	
	// Check cache first
	if cached, found := r.cache.GetRender(req); found {
		r.logger.Info("Returning cached render result", "request_id", req.ID)
		return cached, nil
	}

	// Build optimized prompt
	prompt := r.promptBuilder.BuildRoomPrompt(PromptComponents{
		RoomType:     req.Parameters["room_type"].(string),
		DesiredStyle: string(req.Style),
		// Add other components from parameters
	})

	// Use SDXL Turbo for quick results
	modelVersion := "stability-ai/sdxl-turbo:latest"
	
	prediction, err := r.createPrediction(ctx, modelVersion, map[string]interface{}{
		"prompt":         prompt,
		"negative_prompt": r.promptBuilder.BuildNegativePrompt(),
		"width":          1024,
		"height":         1024,
		"num_inference_steps": 4, // Turbo mode
		"guidance_scale": 0.0,    // Required for turbo
	})
	
	if err != nil {
		return nil, fmt.Errorf("failed to create prediction: %w", err)
	}

	// Poll for results
	result, err := r.waitForPrediction(ctx, prediction.ID, 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to get prediction result: %w", err)
	}

	renderResult := &RenderResult{
		ID:             result.ID,
		RequestID:      req.ID,
		Status:         "completed",
		ResultImageURL: result.Output.(string),
		Progress:       100,
		ProcessingTime: time.Since(startTime).Seconds(),
		CreatedAt:      startTime,
		CompletedAt:    timePtr(time.Now()),
	}

	// Cache the result
	r.cache.SetRender(req, renderResult)

	return renderResult, nil
}

// RenderDetailed performs high-quality detailed rendering
func (r *Renderer) RenderDetailed(ctx context.Context, req *RenderRequest) (*RenderResult, error) {
	startTime := time.Now()

	// Build detailed prompt with all parameters
	components := r.extractPromptComponents(req.Parameters)
	prompt := r.promptBuilder.BuildRoomPrompt(components)
	prompt = r.promptBuilder.OptimizePromptForModel(prompt, "stable-diffusion-xl")

	// Use full SDXL for quality
	modelVersion := "stability-ai/stable-diffusion-xl:latest"
	
	prediction, err := r.createPrediction(ctx, modelVersion, map[string]interface{}{
		"prompt":         prompt,
		"negative_prompt": r.promptBuilder.BuildNegativePrompt(),
		"width":          1024,
		"height":         1024,
		"num_inference_steps": 50,
		"guidance_scale": 7.5,
		"scheduler":      "K_EULER",
		"refine":         "expert_ensemble_refiner",
		"high_noise_frac": 0.8,
	})
	
	if err != nil {
		return nil, fmt.Errorf("failed to create detailed prediction: %w", err)
	}

	// Longer timeout for detailed rendering
	result, err := r.waitForPrediction(ctx, prediction.ID, 60*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to get detailed prediction result: %w", err)
	}

	return &RenderResult{
		ID:             result.ID,
		RequestID:      req.ID,
		Status:         "completed",
		ResultImageURL: result.Output.(string),
		Progress:       100,
		ProcessingTime: time.Since(startTime).Seconds(),
		CreatedAt:      startTime,
		CompletedAt:    timePtr(time.Now()),
		Metadata: map[string]interface{}{
			"model":         modelVersion,
			"quality":       "high",
			"resolution":    "1024x1024",
		},
	}, nil
}

// RenderInpainting performs AI inpainting for furniture placement
func (r *Renderer) RenderInpainting(ctx context.Context, req *InpaintingRequest) (*RenderResult, error) {
	startTime := time.Now()

	modelVersion := "stability-ai/stable-diffusion-inpainting:latest"
	
	prediction, err := r.createPrediction(ctx, modelVersion, map[string]interface{}{
		"image":          req.BaseImage,
		"mask":           req.MaskImage,
		"prompt":         req.Prompt,
		"negative_prompt": req.NegativePrompt,
		"strength":       req.Strength,
		"guidance_scale": req.GuidanceScale,
		"num_inference_steps": req.Steps,
	})
	
	if err != nil {
		return nil, fmt.Errorf("failed to create inpainting prediction: %w", err)
	}

	result, err := r.waitForPrediction(ctx, prediction.ID, 30*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to get inpainting result: %w", err)
	}

	return &RenderResult{
		ID:             result.ID,
		RequestID:      "", // Set by caller
		Status:         "completed",
		ResultImageURL: result.Output.(string),
		Progress:       100,
		ProcessingTime: time.Since(startTime).Seconds(),
		CreatedAt:      startTime,
		CompletedAt:    timePtr(time.Now()),
	}, nil
}

// RenderStyleTransfer performs style transfer on existing room
func (r *Renderer) RenderStyleTransfer(ctx context.Context, req *StyleTransferRequest) (*RenderResult, error) {
	startTime := time.Now()

	// Build style transfer prompt
	prompt := r.promptBuilder.BuildStyleTransferPrompt("room", req.Style)

	modelVersion := "stability-ai/stable-diffusion-img2img:latest"
	
	prediction, err := r.createPrediction(ctx, modelVersion, map[string]interface{}{
		"image":          req.ContentImage,
		"prompt":         prompt,
		"negative_prompt": r.promptBuilder.BuildNegativePrompt(),
		"strength":       req.Strength,
		"guidance_scale": 7.5,
		"num_inference_steps": 30,
	})
	
	if err != nil {
		return nil, fmt.Errorf("failed to create style transfer prediction: %w", err)
	}

	result, err := r.waitForPrediction(ctx, prediction.ID, 30*time.Second)
	if err != nil {
		return nil, fmt.Errorf("failed to get style transfer result: %w", err)
	}

	return &RenderResult{
		ID:             result.ID,
		RequestID:      "", // Set by caller
		Status:         "completed",
		ResultImageURL: result.Output.(string),
		Progress:       100,
		ProcessingTime: time.Since(startTime).Seconds(),
		CreatedAt:      startTime,
		CompletedAt:    timePtr(time.Now()),
		Metadata: map[string]interface{}{
			"style": req.Style,
			"strength": req.Strength,
		},
	}, nil
}

// Replicate API structures
type replicatePrediction struct {
	ID      string                 `json:"id"`
	Status  string                 `json:"status"`
	Output  interface{}            `json:"output"`
	Error   interface{}            `json:"error"`
}

// createPrediction creates a new prediction on Replicate
func (r *Renderer) createPrediction(ctx context.Context, modelVersion string, input map[string]interface{}) (*replicatePrediction, error) {
	url := fmt.Sprintf("https://api.replicate.com/v1/models/%s/predictions", modelVersion)
	
	body, err := json.Marshal(map[string]interface{}{
		"input": input,
	})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", r.replicateToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to create prediction: %s", body)
	}

	var prediction replicatePrediction
	if err := json.NewDecoder(resp.Body).Decode(&prediction); err != nil {
		return nil, err
	}

	return &prediction, nil
}

// waitForPrediction polls for prediction completion
func (r *Renderer) waitForPrediction(ctx context.Context, predictionID string, timeout time.Duration) (*replicatePrediction, error) {
	deadline := time.Now().Add(timeout)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-ticker.C:
			if time.Now().After(deadline) {
				return nil, fmt.Errorf("prediction timeout")
			}

			prediction, err := r.getPrediction(ctx, predictionID)
			if err != nil {
				return nil, err
			}

			switch prediction.Status {
			case "succeeded":
				return prediction, nil
			case "failed", "canceled":
				return nil, fmt.Errorf("prediction failed: %v", prediction.Error)
			}
		}
	}
}

// getPrediction fetches prediction status
func (r *Renderer) getPrediction(ctx context.Context, predictionID string) (*replicatePrediction, error) {
	url := fmt.Sprintf("https://api.replicate.com/v1/predictions/%s", predictionID)
	
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", r.replicateToken))

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var prediction replicatePrediction
	if err := json.NewDecoder(resp.Body).Decode(&prediction); err != nil {
		return nil, err
	}

	return &prediction, nil
}

// extractPromptComponents extracts structured components from parameters
func (r *Renderer) extractPromptComponents(params map[string]interface{}) PromptComponents {
	components := PromptComponents{}
	
	if v, ok := params["room_type"].(string); ok {
		components.RoomType = v
	}
	if v, ok := params["current_elements"].([]string); ok {
		components.CurrentElements = v
	}
	if v, ok := params["desired_style"].(string); ok {
		components.DesiredStyle = v
	}
	if v, ok := params["furniture_items"].([]string); ok {
		components.FurnitureItems = v
	}
	if v, ok := params["color_scheme"].([]string); ok {
		components.ColorScheme = v
	}
	if v, ok := params["lighting"].(string); ok {
		components.Lighting = v
	}
	if v, ok := params["additional"].([]string); ok {
		components.Additional = v
	}
	
	return components
}

// timePtr is a helper to get a pointer to time
func timePtr(t time.Time) *time.Time {
	return &t
}