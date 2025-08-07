package vision

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/compozit/compozit-vision-api/internal/infrastructure/vision"
)

// CalibrationHandler handles camera calibration requests
type CalibrationHandler struct {
	calibrationService *vision.CalibrationService
}

// NewCalibrationHandler creates a new calibration handler
func NewCalibrationHandler() *CalibrationHandler {
	return &CalibrationHandler{
		calibrationService: vision.NewCalibrationService(),
	}
}

// CalibrateCamera handles POST /api/vision/calibrate
func (h *CalibrationHandler) CalibrateCamera(c *gin.Context) {
	var request struct {
		ReferenceObject vision.ReferenceObject `json:"reference_object"`
		ImageData      vision.ImageData       `json:"image_data"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate reference object
	if request.ReferenceObject.ActualSize <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reference object actual size must be greater than 0",
		})
		return
	}

	if request.ReferenceObject.PixelSize <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reference object pixel size must be greater than 0",
		})
		return
	}

	// Perform calibration
	calibration, err := h.calibrationService.Calibrate(
		request.ReferenceObject,
		request.ImageData,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Calibration failed",
			"details": err.Error(),
		})
		return
	}

	// Save calibration data
	calibrationData, err := h.calibrationService.SaveCalibration(calibration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save calibration",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"calibration": calibration,
		"data":        string(calibrationData),
		"message":     "Camera calibrated successfully",
	})
}

// GetDefaultCalibration handles GET /api/vision/calibrate/default
func (h *CalibrationHandler) GetDefaultCalibration(c *gin.Context) {
	calibration := h.calibrationService.GetDefaultCalibration()
	
	c.JSON(http.StatusOK, gin.H{
		"calibration": calibration,
		"message":     "Default calibration settings",
	})
}

// LoadCalibration handles POST /api/vision/calibrate/load
func (h *CalibrationHandler) LoadCalibration(c *gin.Context) {
	var request struct {
		CalibrationData string `json:"calibration_data"`
	}
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	calibration, err := h.calibrationService.LoadCalibration([]byte(request.CalibrationData))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid calibration data",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"calibration": calibration,
		"message":     "Calibration loaded successfully",
	})
}

// ValidateCalibration handles POST /api/vision/calibrate/validate
func (h *CalibrationHandler) ValidateCalibration(c *gin.Context) {
	var calibration vision.CalibrationData
	
	if err := c.ShouldBindJSON(&calibration); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid calibration format",
			"details": err.Error(),
		})
		return
	}

	// Validate calibration parameters
	issues := []string{}
	valid := true

	if calibration.FocalLength <= 0 || calibration.FocalLength > 1000 {
		valid = false
		issues = append(issues, "Focal length must be between 0 and 1000mm")
	}

	if calibration.SensorWidth <= 0 || calibration.SensorHeight <= 0 {
		valid = false
		issues = append(issues, "Sensor dimensions must be positive")
	}

	if calibration.PrincipalPoint.X < 0 || calibration.PrincipalPoint.X > 1 ||
	   calibration.PrincipalPoint.Y < 0 || calibration.PrincipalPoint.Y > 1 {
		valid = false
		issues = append(issues, "Principal point must be normalized (0-1)")
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":  valid,
		"issues": issues,
	})
}

// GetReferenceObjects handles GET /api/vision/calibrate/references
func (h *CalibrationHandler) GetReferenceObjects(c *gin.Context) {
	references := []map[string]interface{}{
		{
			"type":        "door",
			"name":        "Standard Door",
			"actual_size": 2040.0, // mm (height)
			"description": "Standard interior door height",
		},
		{
			"type":        "a4_paper",
			"name":        "A4 Paper",
			"actual_size": 297.0, // mm (height)
			"description": "Standard A4 paper height",
		},
		{
			"type":        "credit_card",
			"name":        "Credit Card",
			"actual_size": 85.6, // mm (width)
			"description": "Standard credit card width",
		},
		{
			"type":        "us_quarter",
			"name":        "US Quarter",
			"actual_size": 24.26, // mm (diameter)
			"description": "US quarter coin diameter",
		},
		{
			"type":        "smartphone",
			"name":        "iPhone (6-8 series)",
			"actual_size": 138.3, // mm (height)
			"description": "iPhone 6/7/8 height",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"reference_objects": references,
		"usage_tips": []string{
			"Place the reference object clearly visible in the image",
			"Ensure the object is not distorted by perspective",
			"Use objects with known, standardized dimensions",
			"Measure the object in pixels accurately",
		},
	})
}