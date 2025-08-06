package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Handler is the main entry point for Vercel serverless deployment
func Handler(w http.ResponseWriter, r *http.Request) {
	// Create a new Gin router
	router := gin.New()
	
	// Add basic middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	
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
	}
	
	// Serve the request
	router.ServeHTTP(w, r)
}