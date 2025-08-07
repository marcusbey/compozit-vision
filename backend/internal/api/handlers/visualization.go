package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/compozit/vision/backend/internal/application/jobs"
	"github.com/compozit/vision/backend/internal/infrastructure/ai"
	"github.com/compozit/vision/backend/internal/infrastructure/modeling"
	"github.com/compozit/vision/backend/pkg/logger"
	"github.com/gorilla/mux"
)

// VisualizationHandler handles visualization-related HTTP requests
type VisualizationHandler struct {
	jobQueue   *jobs.Queue
	aiRenderer *ai.Renderer
	modelGen   *modeling.Generator
	logger     logger.Logger
	notifier   *jobs.WebSocketNotifier
}

// NewVisualizationHandler creates a new visualization handler
func NewVisualizationHandler(jobQueue *jobs.Queue, aiRenderer *ai.Renderer, modelGen *modeling.Generator, logger logger.Logger, notifier *jobs.WebSocketNotifier) *VisualizationHandler {
	return &VisualizationHandler{
		jobQueue:   jobQueue,
		aiRenderer: aiRenderer,
		modelGen:   modelGen,
		logger:     logger,
		notifier:   notifier,
	}
}

// AIRenderQuickRequest represents a quick AI rendering request
type AIRenderQuickRequest struct {
	ProjectID    string                 `json:"project_id"`
	InputImage   string                 `json:"input_image"`
	Style        string                 `json:"style"`
	RoomType     string                 `json:"room_type"`
	Prompt       string                 `json:"prompt,omitempty"`
	Parameters   map[string]interface{} `json:"parameters,omitempty"`
}

// AIRenderDetailedRequest represents a detailed AI rendering request
type AIRenderDetailedRequest struct {
	ProjectID       string                 `json:"project_id"`
	InputImage      string                 `json:"input_image"`
	Style           string                 `json:"style"`
	RoomType        string                 `json:"room_type"`
	FurnitureItems  []string               `json:"furniture_items,omitempty"`
	ColorScheme     []string               `json:"color_scheme,omitempty"`
	Lighting        string                 `json:"lighting,omitempty"`
	Additional      []string               `json:"additional,omitempty"`
	Parameters      map[string]interface{} `json:"parameters,omitempty"`
}

// ModelingRequest represents a 3D modeling request
type ModelingRequest struct {
	ProjectID  string                    `json:"project_id"`
	Room       *modeling.Room            `json:"room"`
	Furniture  []modeling.Furniture      `json:"furniture,omitempty"`
	Lights     []modeling.Light          `json:"lights,omitempty"`
	Materials  []modeling.Material       `json:"materials,omitempty"`
	Parameters map[string]interface{}    `json:"parameters,omitempty"`
}

// InpaintingRequest represents an inpainting request
type InpaintingRequest struct {
	ProjectID      string  `json:"project_id"`
	BaseImage      string  `json:"base_image"`
	MaskImage      string  `json:"mask_image"`
	Prompt         string  `json:"prompt"`
	NegativePrompt string  `json:"negative_prompt,omitempty"`
	Strength       float32 `json:"strength"`
	GuidanceScale  float32 `json:"guidance_scale"`
	Steps          int     `json:"steps"`
}

// StyleTransferRequest represents a style transfer request
type StyleTransferRequest struct {
	ProjectID    string  `json:"project_id"`
	ContentImage string  `json:"content_image"`
	Style        string  `json:"style"`
	Strength     float32 `json:"strength"`
}

// RenderQuick handles quick AI rendering requests (2-5 seconds)
func (vh *VisualizationHandler) RenderQuick(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID") // Get from JWT middleware
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	var req AIRenderQuickRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create job
	job := &jobs.Job{
		UserID:    userID,
		ProjectID: req.ProjectID,
		Type:      jobs.JobTypeAIQuick,
		Data: map[string]interface{}{
			"input_image": req.InputImage,
			"style":       req.Style,
			"room_type":   req.RoomType,
			"prompt":      req.Prompt,
			"parameters":  req.Parameters,
		},
	}

	if err := vh.jobQueue.AddJob(job); err != nil {
		vh.logger.Error("Failed to add quick render job", "error", err)
		http.Error(w, "Failed to queue job", http.StatusInternalServerError)
		return
	}

	vh.logger.Info("Quick AI render job queued", "job_id", job.ID, "user_id", userID)

	response := map[string]interface{}{
		"job_id":     job.ID,
		"status":     "queued",
		"message":    "Quick AI rendering started",
		"estimated_time": "2-5 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RenderDetailed handles detailed AI rendering requests
func (vh *VisualizationHandler) RenderDetailed(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	var req AIRenderDetailedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job := &jobs.Job{
		UserID:    userID,
		ProjectID: req.ProjectID,
		Type:      jobs.JobTypeAIDetailed,
		Data: map[string]interface{}{
			"input_image":     req.InputImage,
			"style":          req.Style,
			"room_type":      req.RoomType,
			"furniture_items": req.FurnitureItems,
			"color_scheme":   req.ColorScheme,
			"lighting":       req.Lighting,
			"additional":     req.Additional,
			"parameters":     req.Parameters,
		},
	}

	if err := vh.jobQueue.AddJob(job); err != nil {
		vh.logger.Error("Failed to add detailed render job", "error", err)
		http.Error(w, "Failed to queue job", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"job_id":     job.ID,
		"status":     "queued",
		"message":    "Detailed AI rendering started",
		"estimated_time": "10-30 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Generate3DModel handles 3D model generation requests
func (vh *VisualizationHandler) Generate3DModel(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	var req ModelingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job := &jobs.Job{
		UserID:    userID,
		ProjectID: req.ProjectID,
		Type:      jobs.JobType3DModel,
		Data: map[string]interface{}{
			"room":       req.Room,
			"furniture":  req.Furniture,
			"lights":     req.Lights,
			"materials":  req.Materials,
			"parameters": req.Parameters,
		},
	}

	if err := vh.jobQueue.AddJob(job); err != nil {
		vh.logger.Error("Failed to add 3D modeling job", "error", err)
		http.Error(w, "Failed to queue job", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"job_id":     job.ID,
		"status":     "queued",
		"message":    "3D model generation started",
		"estimated_time": "30-60 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RenderInpainting handles AI inpainting requests
func (vh *VisualizationHandler) RenderInpainting(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	var req InpaintingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job := &jobs.Job{
		UserID:    userID,
		ProjectID: req.ProjectID,
		Type:      jobs.JobTypeInpainting,
		Data: map[string]interface{}{
			"base_image":      req.BaseImage,
			"mask_image":      req.MaskImage,
			"prompt":          req.Prompt,
			"negative_prompt": req.NegativePrompt,
			"strength":        req.Strength,
			"guidance_scale":  req.GuidanceScale,
			"steps":           req.Steps,
		},
	}

	if err := vh.jobQueue.AddJob(job); err != nil {
		vh.logger.Error("Failed to add inpainting job", "error", err)
		http.Error(w, "Failed to queue job", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"job_id":     job.ID,
		"status":     "queued",
		"message":    "Inpainting started",
		"estimated_time": "15-30 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RenderStyleTransfer handles style transfer requests
func (vh *VisualizationHandler) RenderStyleTransfer(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	var req StyleTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	job := &jobs.Job{
		UserID:    userID,
		ProjectID: req.ProjectID,
		Type:      jobs.JobTypeStyleTransfer,
		Data: map[string]interface{}{
			"content_image": req.ContentImage,
			"style":         req.Style,
			"strength":      req.Strength,
		},
	}

	if err := vh.jobQueue.AddJob(job); err != nil {
		vh.logger.Error("Failed to add style transfer job", "error", err)
		http.Error(w, "Failed to queue job", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"job_id":     job.ID,
		"status":     "queued",
		"message":    "Style transfer started",
		"estimated_time": "15-25 seconds",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetJobStatus returns the status of a specific job
func (vh *VisualizationHandler) GetJobStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	job, exists := vh.jobQueue.GetJob(jobID)
	if !exists {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	// Check if user owns this job
	userID := r.Header.Get("X-User-ID")
	if job.UserID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(job)
}

// GetUserJobs returns all jobs for the authenticated user
func (vh *VisualizationHandler) GetUserJobs(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	status := r.URL.Query().Get("status")
	limitStr := r.URL.Query().Get("limit")
	
	limit := 50 // Default limit
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	jobs := vh.jobQueue.GetUserJobs(userID)

	// Filter by status if specified
	if status != "" {
		filteredJobs := make([]*jobs.Job, 0)
		for _, job := range jobs {
			if string(job.Status) == status {
				filteredJobs = append(filteredJobs, job)
			}
		}
		jobs = filteredJobs
	}

	// Apply limit
	if len(jobs) > limit {
		jobs = jobs[:limit]
	}

	response := map[string]interface{}{
		"jobs":  jobs,
		"count": len(jobs),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CancelJob cancels a queued or processing job
func (vh *VisualizationHandler) CancelJob(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	jobID := vars["id"]

	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	// Check if job exists and user owns it
	job, exists := vh.jobQueue.GetJob(jobID)
	if !exists {
		http.Error(w, "Job not found", http.StatusNotFound)
		return
	}

	if job.UserID != userID {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return
	}

	if err := vh.jobQueue.CancelJob(jobID); err != nil {
		vh.logger.Error("Failed to cancel job", "job_id", jobID, "error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"job_id":  jobID,
		"status":  "cancelled",
		"message": "Job cancelled successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleWebSocket handles WebSocket connections for real-time updates
func (vh *VisualizationHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID required", http.StatusUnauthorized)
		return
	}

	err := vh.notifier.HandleWebSocket(w, r, userID)
	if err != nil {
		vh.logger.Error("WebSocket connection failed", "user_id", userID, "error", err)
		http.Error(w, "WebSocket connection failed", http.StatusInternalServerError)
		return
	}
}

// GetSystemStatus returns system status and statistics
func (vh *VisualizationHandler) GetSystemStatus(w http.ResponseWriter, r *http.Request) {
	// This could include queue length, processing times, etc.
	status := map[string]interface{}{
		"timestamp": time.Now(),
		"websocket": map[string]int{
			"active_connections": vh.notifier.GetActiveConnections(),
			"connected_users":    vh.notifier.GetConnectedUsers(),
		},
		"services": map[string]string{
			"ai_renderer":  "operational",
			"3d_modeling":  "operational",
			"job_queue":    "operational",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}