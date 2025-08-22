package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/compozit/compozit-vision-api/internal/api/handlers/space"
	"github.com/compozit/compozit-vision-api/internal/api/middleware"
)

// SetupEnhancedAIRoutes sets up all enhanced AI processing routes
func SetupEnhancedAIRoutes(
	r *gin.Engine,
	analysisHandler *space.AnalysisHandler,
	authMiddleware middleware.AuthMiddleware,
) {
	// API v1 group
	v1 := r.Group("/api/v1")

	// Apply authentication middleware
	v1.Use(authMiddleware.RequireAuth())

	// Space analysis routes
	spaceGroup := v1.Group("/space")
	{
		// Analyze a space from image
		spaceGroup.POST("/analyze", analysisHandler.AnalyzeSpace)
		
		// Get specific analysis
		spaceGroup.GET("/analysis/:id", analysisHandler.GetAnalysis)
		
		// Get user's analysis history
		spaceGroup.GET("/analyses", analysisHandler.GetUserAnalyses)
		
		// Suggest room type from image
		spaceGroup.POST("/suggest-room-type", analysisHandler.SuggestRoomType)
	}

	// Style management routes
	stylesGroup := v1.Group("/styles")
	{
		// Get style references
		stylesGroup.GET("/references", analysisHandler.GetStyleReferences)
		
		// Get specific style reference
		stylesGroup.GET("/references/:id", analysisHandler.GetStyleReference)
		
		// Get ambiance options
		stylesGroup.GET("/ambiance", analysisHandler.GetAmbianceOptions)
	}

	// Enhanced design generation routes
	generateGroup := v1.Group("/generate")
	{
		// Generate enhanced design
		generateGroup.POST("/enhanced", analysisHandler.GenerateEnhancedDesign)
		
		// Get generation result
		generateGroup.GET("/result/:id", analysisHandler.GetGenerationResult)
		
		// Get user's generation history
		generateGroup.GET("/results", analysisHandler.GetUserGenerations)
		
		// Cancel generation
		generateGroup.POST("/result/:id/cancel", analysisHandler.CancelGeneration)
	}
}