package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	visionHandlers "github.com/compozit/compozit-vision-api/internal/api/handlers/vision"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/vision"
)

// Handler is the main entry point for Vercel serverless deployment
func Handler(w http.ResponseWriter, r *http.Request) {
	// Create a new Gin router
	router := gin.New()
	
	// Add basic middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	
	// Initialize vision services
	// Note: Using SimpleAnalyzer for now until OpenCV is set up in deployment
	simpleAnalyzer := vision.NewSimpleAnalyzer()
	analyzeHandler := visionHandlers.NewAnalyzeHandler(simpleAnalyzer)
	calibrationHandler := visionHandlers.NewCalibrationHandler()
	measurementHandler := visionHandlers.NewMeasurementHandler()
	
	// Basic health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"message": "Compozit Vision API v1.0.0",
			"service": "backend",
		})
	})
	
	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		v1.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Compozit Vision Backend API",
				"version": "1.0.0",
				"status": "operational",
			})
		})
		
		// Placeholder endpoints
		v1.POST("/auth/register", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "User registration endpoint - ready for implementation",
			})
		})
		
		v1.POST("/auth/login", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "User login endpoint - ready for implementation",
			})
		})
		
		v1.GET("/projects", func(c *gin.Context) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
				"message": "Protected endpoint - authentication middleware needed",
			})
		})
		
		// Vision/Computer Vision Routes
		vision := v1.Group("/vision")
		{
			// Room Analysis Endpoints
			vision.POST("/analyze", analyzeHandler.AnalyzeRoom)
			vision.POST("/analyze/async", analyzeHandler.AnalyzeRoomAsync)
			vision.GET("/analyze/:id", analyzeHandler.GetAnalysisStatus)
			vision.POST("/analyze/validate", analyzeHandler.ValidateImage)
			vision.GET("/analyze/formats", analyzeHandler.GetSupportedFormats)
			
			// Camera Calibration Endpoints
			vision.POST("/calibrate", calibrationHandler.CalibrateCamera)
			vision.GET("/calibrate/default", calibrationHandler.GetDefaultCalibration)
			vision.POST("/calibrate/load", calibrationHandler.LoadCalibration)
			vision.POST("/calibrate/validate", calibrationHandler.ValidateCalibration)
			vision.GET("/calibrate/references", calibrationHandler.GetReferenceObjects)
			
			// Measurement Management Endpoints
			vision.GET("/measurements", measurementHandler.ListMeasurements)
			vision.GET("/measurements/:id", measurementHandler.GetMeasurement)
			vision.PATCH("/measurements/:id", measurementHandler.UpdateMeasurement)
			vision.DELETE("/measurements/:id", measurementHandler.DeleteMeasurement)
			vision.GET("/measurements/:id/export", measurementHandler.ExportMeasurement)
			vision.GET("/measurements/stats", measurementHandler.GetMeasurementStats)
		}
	}
	
	// Serve the request
	router.ServeHTTP(w, r)
}