package routes

import (
	"net/http"

	"github.com/compozit/vision/backend/internal/api/handlers"
	"github.com/compozit/vision/backend/internal/application/jobs"
	"github.com/compozit/vision/backend/internal/infrastructure/ai"
	"github.com/compozit/vision/backend/internal/infrastructure/modeling"
	"github.com/compozit/vision/backend/pkg/logger"
	"github.com/gorilla/mux"
)

// SetupVisualizationRoutes sets up all visualization-related API routes
func SetupVisualizationRoutes(r *mux.Router, jobQueue *jobs.Queue, aiRenderer *ai.Renderer, modelGen *modeling.Generator, logger logger.Logger) {
	// Create WebSocket notifier for real-time updates
	notifier := jobs.NewWebSocketNotifier(logger)
	
	// Initialize the visualization handler
	vizHandler := handlers.NewVisualizationHandler(jobQueue, aiRenderer, modelGen, logger, notifier)

	// Create visualization subrouter
	vizRouter := r.PathPrefix("/api/v1/visualization").Subrouter()

	// AI Rendering endpoints
	aiRouter := vizRouter.PathPrefix("/ai").Subrouter()
	
	// Quick AI rendering (2-5 seconds)
	aiRouter.HandleFunc("/render/quick", vizHandler.RenderQuick).Methods("POST")
	
	// Detailed AI rendering (10-30 seconds)
	aiRouter.HandleFunc("/render/detailed", vizHandler.RenderDetailed).Methods("POST")
	
	// AI inpainting for furniture placement
	aiRouter.HandleFunc("/render/inpainting", vizHandler.RenderInpainting).Methods("POST")
	
	// AI style transfer
	aiRouter.HandleFunc("/render/style-transfer", vizHandler.RenderStyleTransfer).Methods("POST")

	// 3D Modeling endpoints
	modelRouter := vizRouter.PathPrefix("/3d").Subrouter()
	
	// Generate 3D model
	modelRouter.HandleFunc("/model/generate", vizHandler.Generate3DModel).Methods("POST")
	
	// Export 3D model in various formats
	modelRouter.HandleFunc("/model/export", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for exporting 3D models
		// This would handle GLTF, GLB, OBJ, FBX exports
	}).Methods("POST")
	
	// Get 3D model optimization preview
	modelRouter.HandleFunc("/model/optimization-preview", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for optimization preview
	}).Methods("POST")

	// Export endpoints for architectural drawings
	exportRouter := vizRouter.PathPrefix("/export").Subrouter()
	
	// Export floor plan
	exportRouter.HandleFunc("/floor-plan", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for floor plan export
	}).Methods("POST")
	
	// Export elevation
	exportRouter.HandleFunc("/elevation", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for elevation export
	}).Methods("POST")
	
	// Export section
	exportRouter.HandleFunc("/section", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for section export
	}).Methods("POST")
	
	// Export complete drawing set
	exportRouter.HandleFunc("/drawing-set", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for complete architectural drawing set export
	}).Methods("POST")

	// Job management endpoints
	jobsRouter := vizRouter.PathPrefix("/jobs").Subrouter()
	
	// Get specific job status
	jobsRouter.HandleFunc("/{id}", vizHandler.GetJobStatus).Methods("GET")
	
	// Cancel a job
	jobsRouter.HandleFunc("/{id}/cancel", vizHandler.CancelJob).Methods("POST")
	
	// Get all user jobs
	jobsRouter.HandleFunc("", vizHandler.GetUserJobs).Methods("GET")

	// WebSocket endpoint for real-time updates
	vizRouter.HandleFunc("/ws", vizHandler.HandleWebSocket)
	
	// System status endpoint
	vizRouter.HandleFunc("/status", vizHandler.GetSystemStatus).Methods("GET")

	// Scene management endpoints (for 3D scenes)
	sceneRouter := vizRouter.PathPrefix("/scenes").Subrouter()
	
	// Get user's 3D scenes
	sceneRouter.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for listing user scenes
	}).Methods("GET")
	
	// Create new 3D scene
	sceneRouter.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for creating new scene
	}).Methods("POST")
	
	// Get specific scene
	sceneRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for getting specific scene
	}).Methods("GET")
	
	// Update scene
	sceneRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for updating scene
	}).Methods("PUT")
	
	// Delete scene
	sceneRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for deleting scene
	}).Methods("DELETE")

	// Visualization results endpoints
	resultsRouter := vizRouter.PathPrefix("/results").Subrouter()
	
	// Get user's visualization results
	resultsRouter.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for listing visualization results
	}).Methods("GET")
	
	// Get specific result
	resultsRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for getting specific result
	}).Methods("GET")
	
	// Delete result
	resultsRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		// Implementation for deleting result
	}).Methods("DELETE")

	logger.Info("Visualization routes initialized successfully")
}