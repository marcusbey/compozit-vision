package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/compozit/vision/backend/internal/infrastructure/ai"
	"github.com/compozit/vision/backend/internal/infrastructure/modeling"
	"github.com/compozit/vision/backend/pkg/logger"
)

// JobType represents different types of background jobs
type JobType string

const (
	JobTypeAIQuick     JobType = "ai_quick"
	JobTypeAIDetailed  JobType = "ai_detailed"
	JobType3DModel     JobType = "3d_model"
	JobTypeInpainting  JobType = "inpainting"
	JobTypeStyleTransfer JobType = "style_transfer"
	JobTypeExport      JobType = "export"
)

// JobStatus represents job execution status
type JobStatus string

const (
	JobStatusQueued     JobStatus = "queued"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
	JobStatusCancelled  JobStatus = "cancelled"
)

// Job represents a background job
type Job struct {
	ID          string                 `json:"id"`
	UserID      string                 `json:"user_id"`
	ProjectID   string                 `json:"project_id"`
	Type        JobType                `json:"type"`
	Status      JobStatus              `json:"status"`
	Progress    int                    `json:"progress"`
	Data        map[string]interface{} `json:"data"`
	Result      interface{}            `json:"result,omitempty"`
	Error       string                 `json:"error,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`
	StartedAt   *time.Time             `json:"started_at,omitempty"`
	CompletedAt *time.Time             `json:"completed_at,omitempty"`
	RetryCount  int                    `json:"retry_count"`
	MaxRetries  int                    `json:"max_retries"`
}

// JobResult represents the result of a completed job
type JobResult struct {
	JobID  string      `json:"job_id"`
	Result interface{} `json:"result"`
	Error  string      `json:"error,omitempty"`
}

// Queue manages background job processing
type Queue struct {
	jobs        map[string]*Job
	jobChannel  chan *Job
	workers     []*Worker
	mu          sync.RWMutex
	logger      logger.Logger
	aiRenderer  *ai.Renderer
	modelGen    *modeling.Generator
	notifier    *WebSocketNotifier
	maxWorkers  int
	maxRetries  int
}

// NewQueue creates a new job queue
func NewQueue(logger logger.Logger, aiRenderer *ai.Renderer, modelGen *modeling.Generator, maxWorkers int) *Queue {
	return &Queue{
		jobs:       make(map[string]*Job),
		jobChannel: make(chan *Job, 100), // Buffered channel
		workers:    make([]*Worker, 0, maxWorkers),
		logger:     logger,
		aiRenderer: aiRenderer,
		modelGen:   modelGen,
		notifier:   NewWebSocketNotifier(logger),
		maxWorkers: maxWorkers,
		maxRetries: 3,
	}
}

// Start initializes the job queue and starts workers
func (q *Queue) Start(ctx context.Context) error {
	q.logger.Info("Starting job queue", "max_workers", q.maxWorkers)

	// Start workers
	for i := 0; i < q.maxWorkers; i++ {
		worker := NewWorker(i, q.jobChannel, q, q.logger)
		q.workers = append(q.workers, worker)
		go worker.Start(ctx)
	}

	q.logger.Info("Job queue started successfully", "workers", len(q.workers))
	return nil
}

// Stop gracefully stops the job queue
func (q *Queue) Stop(ctx context.Context) error {
	q.logger.Info("Stopping job queue")

	close(q.jobChannel)

	// Wait for workers to finish current jobs
	for _, worker := range q.workers {
		worker.Stop()
	}

	q.logger.Info("Job queue stopped")
	return nil
}

// AddJob adds a new job to the queue
func (q *Queue) AddJob(job *Job) error {
	if job.ID == "" {
		job.ID = generateJobID()
	}

	job.Status = JobStatusQueued
	job.CreatedAt = time.Now()
	job.MaxRetries = q.maxRetries

	q.mu.Lock()
	q.jobs[job.ID] = job
	q.mu.Unlock()

	// Send job to workers
	select {
	case q.jobChannel <- job:
		q.logger.Info("Job added to queue", "job_id", job.ID, "type", job.Type)
	default:
		q.logger.Error("Job queue is full", "job_id", job.ID)
		return fmt.Errorf("job queue is full")
	}

	// Notify via WebSocket
	q.notifier.NotifyJobQueued(job)

	return nil
}

// GetJob retrieves a job by ID
func (q *Queue) GetJob(jobID string) (*Job, bool) {
	q.mu.RLock()
	defer q.mu.RUnlock()

	job, exists := q.jobs[jobID]
	return job, exists
}

// UpdateJob updates job status and progress
func (q *Queue) UpdateJob(jobID string, status JobStatus, progress int, result interface{}, err error) {
	q.mu.Lock()
	defer q.mu.Unlock()

	job, exists := q.jobs[jobID]
	if !exists {
		q.logger.Error("Job not found for update", "job_id", jobID)
		return
	}

	job.Status = status
	job.Progress = progress

	if result != nil {
		job.Result = result
	}

	if err != nil {
		job.Error = err.Error()
	}

	now := time.Now()
	switch status {
	case JobStatusProcessing:
		job.StartedAt = &now
	case JobStatusCompleted, JobStatusFailed, JobStatusCancelled:
		job.CompletedAt = &now
	}

	q.logger.Info("Job updated", 
		"job_id", jobID, 
		"status", status, 
		"progress", progress)

	// Notify via WebSocket
	q.notifier.NotifyJobUpdated(job)
}

// GetUserJobs returns all jobs for a specific user
func (q *Queue) GetUserJobs(userID string) []*Job {
	q.mu.RLock()
	defer q.mu.RUnlock()

	var userJobs []*Job
	for _, job := range q.jobs {
		if job.UserID == userID {
			userJobs = append(userJobs, job)
		}
	}

	return userJobs
}

// CancelJob cancels a queued or processing job
func (q *Queue) CancelJob(jobID string) error {
	q.mu.Lock()
	defer q.mu.Unlock()

	job, exists := q.jobs[jobID]
	if !exists {
		return fmt.Errorf("job not found: %s", jobID)
	}

	if job.Status == JobStatusCompleted || job.Status == JobStatusFailed {
		return fmt.Errorf("cannot cancel completed job")
	}

	job.Status = JobStatusCancelled
	now := time.Now()
	job.CompletedAt = &now

	q.logger.Info("Job cancelled", "job_id", jobID)

	// Notify via WebSocket
	q.notifier.NotifyJobUpdated(job)

	return nil
}

// ProcessJob processes a single job based on its type
func (q *Queue) ProcessJob(ctx context.Context, job *Job) error {
	q.logger.Info("Processing job", "job_id", job.ID, "type", job.Type)

	q.UpdateJob(job.ID, JobStatusProcessing, 0, nil, nil)

	switch job.Type {
	case JobTypeAIQuick:
		return q.processAIQuickJob(ctx, job)
	case JobTypeAIDetailed:
		return q.processAIDetailedJob(ctx, job)
	case JobType3DModel:
		return q.process3DModelJob(ctx, job)
	case JobTypeInpainting:
		return q.processInpaintingJob(ctx, job)
	case JobTypeStyleTransfer:
		return q.processStyleTransferJob(ctx, job)
	case JobTypeExport:
		return q.processExportJob(ctx, job)
	default:
		return fmt.Errorf("unknown job type: %s", job.Type)
	}
}

// processAIQuickJob processes quick AI rendering
func (q *Queue) processAIQuickJob(ctx context.Context, job *Job) error {
	// Convert job data to render request
	req, err := q.jobToRenderRequest(job)
	if err != nil {
		return fmt.Errorf("failed to convert job to render request: %w", err)
	}

	q.UpdateJob(job.ID, JobStatusProcessing, 25, nil, nil)

	// Render with AI
	result, err := q.aiRenderer.RenderQuick(ctx, req)
	if err != nil {
		return fmt.Errorf("AI rendering failed: %w", err)
	}

	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// processAIDetailedJob processes detailed AI rendering
func (q *Queue) processAIDetailedJob(ctx context.Context, job *Job) error {
	req, err := q.jobToRenderRequest(job)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusProcessing, 25, nil, nil)

	result, err := q.aiRenderer.RenderDetailed(ctx, req)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// process3DModelJob processes 3D model generation
func (q *Queue) process3DModelJob(ctx context.Context, job *Job) error {
	req, err := q.jobToModelingRequest(job)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusProcessing, 10, nil, nil)

	// Progress updates during 3D modeling
	go func() {
		for progress := 20; progress < 90; progress += 10 {
			time.Sleep(5 * time.Second)
			q.UpdateJob(job.ID, JobStatusProcessing, progress, nil, nil)
		}
	}()

	result, err := q.modelGen.GenerateRoomModel(ctx, req)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// processInpaintingJob processes AI inpainting
func (q *Queue) processInpaintingJob(ctx context.Context, job *Job) error {
	req, err := q.jobToInpaintingRequest(job)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusProcessing, 30, nil, nil)

	result, err := q.aiRenderer.RenderInpainting(ctx, req)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// processStyleTransferJob processes style transfer
func (q *Queue) processStyleTransferJob(ctx context.Context, job *Job) error {
	req, err := q.jobToStyleTransferRequest(job)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusProcessing, 40, nil, nil)

	result, err := q.aiRenderer.RenderStyleTransfer(ctx, req)
	if err != nil {
		return err
	}

	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// processExportJob processes model/drawing export
func (q *Queue) processExportJob(ctx context.Context, job *Job) error {
	// Implementation for export jobs
	q.UpdateJob(job.ID, JobStatusProcessing, 50, nil, nil)
	
	// Simulate export processing
	time.Sleep(2 * time.Second)
	
	result := map[string]interface{}{
		"export_url": "/api/exports/example.pdf",
		"format":     "pdf",
	}
	
	q.UpdateJob(job.ID, JobStatusCompleted, 100, result, nil)
	return nil
}

// Helper methods to convert job data to request structs
func (q *Queue) jobToRenderRequest(job *Job) (*ai.RenderRequest, error) {
	req := &ai.RenderRequest{
		ID:         job.ID,
		UserID:     job.UserID,
		ProjectID:  job.ProjectID,
		Type:       ai.RenderType(job.Data["type"].(string)),
		Parameters: job.Data,
		CreatedAt:  job.CreatedAt,
	}

	if style, ok := job.Data["style"].(string); ok {
		req.Style = ai.StyleType(style)
	}

	if prompt, ok := job.Data["prompt"].(string); ok {
		req.Prompt = prompt
	}

	if inputImage, ok := job.Data["input_image"].(string); ok {
		req.InputImage = inputImage
	}

	return req, nil
}

func (q *Queue) jobToModelingRequest(job *Job) (*modeling.ModelingRequest, error) {
	req := &modeling.ModelingRequest{
		ID:        job.ID,
		UserID:    job.UserID,
		ProjectID: job.ProjectID,
		Type:      modeling.ModelType(job.Data["type"].(string)),
		CreatedAt: job.CreatedAt,
	}

	// Convert room data if present
	if roomData, ok := job.Data["room"]; ok {
		roomJSON, _ := json.Marshal(roomData)
		var room modeling.Room
		json.Unmarshal(roomJSON, &room)
		req.Room = &room
	}

	return req, nil
}

func (q *Queue) jobToInpaintingRequest(job *Job) (*ai.InpaintingRequest, error) {
	req := &ai.InpaintingRequest{}
	
	if baseImage, ok := job.Data["base_image"].(string); ok {
		req.BaseImage = baseImage
	}
	if maskImage, ok := job.Data["mask_image"].(string); ok {
		req.MaskImage = maskImage
	}
	if prompt, ok := job.Data["prompt"].(string); ok {
		req.Prompt = prompt
	}
	if strength, ok := job.Data["strength"].(float64); ok {
		req.Strength = float32(strength)
	}
	
	return req, nil
}

func (q *Queue) jobToStyleTransferRequest(job *Job) (*ai.StyleTransferRequest, error) {
	req := &ai.StyleTransferRequest{}
	
	if contentImage, ok := job.Data["content_image"].(string); ok {
		req.ContentImage = contentImage
	}
	if style, ok := job.Data["style"].(string); ok {
		req.Style = ai.StyleType(style)
	}
	if strength, ok := job.Data["strength"].(float64); ok {
		req.Strength = float32(strength)
	}
	
	return req, nil
}

// generateJobID creates a unique job ID
func generateJobID() string {
	return fmt.Sprintf("job_%d", time.Now().UnixNano())
}