package vision

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/vision"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	
	// Initialize handlers
	analyzer := vision.NewSimpleAnalyzer()
	analyzeHandler := NewAnalyzeHandler(analyzer)
	
	// Setup routes
	v1 := router.Group("/api/v1")
	visionGroup := v1.Group("/vision")
	{
		visionGroup.POST("/analyze", analyzeHandler.AnalyzeRoom)
		visionGroup.POST("/analyze/async", analyzeHandler.AnalyzeRoomAsync)
		visionGroup.GET("/analyze/:id", analyzeHandler.GetAnalysisStatus)
		visionGroup.POST("/analyze/validate", analyzeHandler.ValidateImage)
		visionGroup.GET("/analyze/formats", analyzeHandler.GetSupportedFormats)
	}
	
	return router
}

func TestAnalyzeRoomHandler(t *testing.T) {
	router := setupTestRouter()
	
	// Test valid request
	requestBody := vision.AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
		Options: vision.AnalysisOptions{
			DetectFurniture:   true,
			DetectLighting:    true,
			MinConfidence:     0.7,
			MeasurementUnit:   "metric",
		},
	}
	
	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d. Response: %s", 
			http.StatusOK, w.Code, w.Body.String())
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["status"] != "success" {
		t.Errorf("Expected status 'success', got %v", response["status"])
	}
	
	if response["measurement"] == nil {
		t.Error("Expected measurement in response")
	}
	
	// Validate measurement structure
	measurement, ok := response["measurement"].(map[string]interface{})
	if !ok {
		t.Fatal("Measurement should be an object")
	}
	
	if measurement["id"] == nil || measurement["id"] == "" {
		t.Error("Expected measurement ID")
	}
	
	if measurement["status"] != "completed" {
		t.Errorf("Expected measurement status 'completed', got %v", measurement["status"])
	}
	
	if measurement["confidence"] == nil {
		t.Error("Expected confidence score")
	}
}

func TestAnalyzeRoomHandlerInvalidRequest(t *testing.T) {
	router := setupTestRouter()
	
	// Test request without image
	requestBody := vision.AnalysisRequest{
		// No ImageURL or ImageData
		Options: vision.AnalysisOptions{
			MinConfidence:   0.7,
			MeasurementUnit: "metric",
		},
	}
	
	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["error"] == nil {
		t.Error("Expected error message in response")
	}
}

func TestAnalyzeRoomHandlerMalformedJSON(t *testing.T) {
	router := setupTestRouter()
	
	// Test malformed JSON
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze", 
		bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
	}
}

func TestAnalyzeRoomAsyncHandler(t *testing.T) {
	router := setupTestRouter()
	
	requestBody := vision.AnalysisRequest{
		ImageURL: "https://example.com/room.jpg",
		Options: vision.AnalysisOptions{
			MinConfidence:   0.7,
			MeasurementUnit: "metric",
		},
	}
	
	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze/async", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusAccepted {
		t.Fatalf("Expected status %d, got %d", http.StatusAccepted, w.Code)
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["status"] != "accepted" {
		t.Errorf("Expected status 'accepted', got %v", response["status"])
	}
	
	if response["analysis_id"] == nil {
		t.Error("Expected analysis_id in response")
	}
}

func TestGetAnalysisStatusHandler(t *testing.T) {
	router := setupTestRouter()
	
	req := httptest.NewRequest("GET", "/api/v1/vision/analyze/test-id", nil)
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["analysis_id"] != "test-id" {
		t.Errorf("Expected analysis_id 'test-id', got %v", response["analysis_id"])
	}
}

func TestValidateImageHandler(t *testing.T) {
	router := setupTestRouter()
	
	// Test valid image request
	requestBody := map[string]interface{}{
		"image_url": "https://example.com/valid-image.jpg",
	}
	
	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze/validate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["valid"] != true {
		t.Errorf("Expected valid=true, got %v", response["valid"])
	}
	
	// Test invalid image request (no image)
	requestBody = map[string]interface{}{}
	jsonData, _ = json.Marshal(requestBody)
	req = httptest.NewRequest("POST", "/api/v1/vision/analyze/validate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w = httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
	
	err = json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["valid"] != false {
		t.Errorf("Expected valid=false, got %v", response["valid"])
	}
	
	if response["issues"] == nil {
		t.Error("Expected issues array in response")
	}
}

func TestGetSupportedFormatsHandler(t *testing.T) {
	router := setupTestRouter()
	
	req := httptest.NewRequest("GET", "/api/v1/vision/analyze/formats", nil)
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["supported_formats"] == nil {
		t.Error("Expected supported_formats in response")
	}
	
	if response["max_size_mb"] == nil {
		t.Error("Expected max_size_mb in response")
	}
	
	formats, ok := response["supported_formats"].([]interface{})
	if !ok || len(formats) == 0 {
		t.Error("Expected non-empty supported formats array")
	}
}

func TestAnalyzeRoomWithImageData(t *testing.T) {
	router := setupTestRouter()
	
	// Test with image data instead of URL
	requestBody := vision.AnalysisRequest{
		ImageData: []byte("mock image data"),
		Options: vision.AnalysisOptions{
			DetectFurniture:   false,
			DetectLighting:    false,
			MinConfidence:     0.8,
			MeasurementUnit:   "metric",
		},
	}
	
	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest("POST", "/api/v1/vision/analyze", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d. Response: %s", 
			http.StatusOK, w.Code, w.Body.String())
	}
	
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}
	
	if response["status"] != "success" {
		t.Errorf("Expected status 'success', got %v", response["status"])
	}
	
	// Verify measurement details
	measurement, ok := response["measurement"].(map[string]interface{})
	if !ok {
		t.Fatal("Measurement should be an object")
	}
	
	measurements, ok := measurement["measurements"].(map[string]interface{})
	if !ok {
		t.Fatal("Measurements should be an object")
	}
	
	// Should not have furniture or lighting since we set them to false
	if furniture, exists := measurements["furniture"]; exists {
		if furnitureArray, ok := furniture.([]interface{}); ok && len(furnitureArray) > 0 {
			t.Error("Expected no furniture when detect_furniture is false")
		}
	}
	
	if lighting, exists := measurements["lighting_sources"]; exists {
		if lightingArray, ok := lighting.([]interface{}); ok && len(lightingArray) > 0 {
			t.Error("Expected no lighting when detect_lighting is false")
		}
	}
}