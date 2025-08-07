//go:build opencv
// +build opencv

package vision

import (
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"math"
	"net/http"
	"time"

	"github.com/google/uuid"
	"gocv.io/x/gocv"
)

// Analyzer is the main room analysis service
type Analyzer struct {
	calibrationService *CalibrationService
	measurementExtractor *MeasurementExtractor
	httpClient *http.Client
}

// NewAnalyzer creates a new room analyzer
func NewAnalyzer() *Analyzer {
	calibrationService := NewCalibrationService()
	return &Analyzer{
		calibrationService: calibrationService,
		measurementExtractor: NewMeasurementExtractor(calibrationService),
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// AnalyzeRoom performs complete room analysis from an image
func (a *Analyzer) AnalyzeRoom(ctx context.Context, request AnalysisRequest) (*RoomMeasurement, error) {
	// Load image
	img, err := a.loadImage(ctx, request)
	if err != nil {
		return nil, fmt.Errorf("failed to load image: %w", err)
	}
	defer img.Close()

	// Create measurement ID
	measurementID := uuid.New().String()

	// Initialize measurement
	measurement := &RoomMeasurement{
		ID:        measurementID,
		ImageURL:  request.ImageURL,
		Status:    "processing",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Metadata:  make(map[string]interface{}),
	}

	// Get calibration data
	calibration := a.calibrationService.GetDefaultCalibration()

	// Process image through pipeline
	edges := a.detectEdges(img)
	corners := a.detectCorners(img)
	depthMap := a.estimateDepth(img)
	vanishingPoints := a.findVanishingPoints(edges)

	// Extract measurements
	roomDimensions, err := a.measurementExtractor.ExtractRoomDimensions(
		corners, edges, depthMap, calibration, img.Cols(), img.Rows(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to extract room dimensions: %w", err)
	}

	// Estimate ceiling height
	verticalEdges := a.filterVerticalEdges(edges)
	avgDepth := a.calibrationService.EstimateDepthFromVanishingPoints(vanishingPoints, calibration)
	ceilingHeight := a.measurementExtractor.ExtractCeilingHeight(
		verticalEdges, vanishingPoints, avgDepth, calibration, img.Rows(),
	)

	// Detect openings
	openings := a.measurementExtractor.DetectOpenings(
		edges, depthMap, calibration, img.Cols(),
	)

	// Separate doors and windows
	var doors, windows []Opening
	for _, opening := range openings {
		if opening.Type == "door" {
			doors = append(doors, opening)
		} else {
			windows = append(windows, opening)
		}
	}

	// Build measurement data
	measurementData := MeasurementData{
		RoomDimensions: *roomDimensions,
		CeilingHeight:  ceilingHeight,
		Doors:          doors,
		Windows:        windows,
	}

	// Optional: Detect furniture if requested
	if request.Options.DetectFurniture {
		furniture := a.detectFurniture(img)
		measurementData.Furniture = furniture
	}

	// Optional: Detect lighting if requested
	if request.Options.DetectLighting {
		lighting := a.detectLighting(img)
		measurementData.LightingSources = lighting
	}

	// Optional: Detect floor material
	floorMaterial := a.detectFloorMaterial(img)
	measurementData.FloorMaterial = floorMaterial

	// Calculate confidence score
	confidence := a.calculateConfidence(corners, edges, depthMap)

	// Update measurement
	measurement.Measurements = measurementData
	measurement.Confidence = confidence
	measurement.Status = "completed"
	measurement.UpdatedAt = time.Now()

	// Add processing metadata
	measurement.Metadata["processing_time_ms"] = time.Since(measurement.CreatedAt).Milliseconds()
	measurement.Metadata["image_dimensions"] = map[string]int{
		"width":  img.Cols(),
		"height": img.Rows(),
	}
	measurement.Metadata["detected_features"] = map[string]int{
		"corners": len(corners),
		"edges":   len(edges),
		"doors":   len(doors),
		"windows": len(windows),
	}

	return measurement, nil
}

// loadImage loads an image from URL or base64 data
func (a *Analyzer) loadImage(ctx context.Context, request AnalysisRequest) (gocv.Mat, error) {
	var imageData []byte
	var err error

	if len(request.ImageData) > 0 {
		imageData = request.ImageData
	} else if request.ImageURL != "" {
		imageData, err = a.downloadImage(ctx, request.ImageURL)
		if err != nil {
			return gocv.Mat{}, err
		}
	} else {
		return gocv.Mat{}, errors.New("no image data provided")
	}

	// Decode image
	img, _, err := image.Decode(bytes.NewReader(imageData))
	if err != nil {
		return gocv.Mat{}, fmt.Errorf("failed to decode image: %w", err)
	}

	// Convert to OpenCV Mat
	return a.imageToMat(img)
}

// downloadImage downloads an image from URL
func (a *Analyzer) downloadImage(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

// imageToMat converts a Go image to OpenCV Mat
func (a *Analyzer) imageToMat(img image.Image) (gocv.Mat, error) {
	bounds := img.Bounds()
	mat := gocv.NewMatWithSize(bounds.Dy(), bounds.Dx(), gocv.MatTypeCV8UC3)

	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			r, g, b, _ := img.At(x, y).RGBA()
			mat.SetUCharAt(y-bounds.Min.Y, (x-bounds.Min.X)*3, uint8(b>>8))
			mat.SetUCharAt(y-bounds.Min.Y, (x-bounds.Min.X)*3+1, uint8(g>>8))
			mat.SetUCharAt(y-bounds.Min.Y, (x-bounds.Min.X)*3+2, uint8(r>>8))
		}
	}

	return mat, nil
}

// detectEdges performs edge detection using Canny algorithm
func (a *Analyzer) detectEdges(img gocv.Mat) []Edge {
	gray := gocv.NewMat()
	defer gray.Close()
	gocv.CvtColor(img, &gray, gocv.ColorBGRToGray)

	// Apply Gaussian blur to reduce noise
	blurred := gocv.NewMat()
	defer blurred.Close()
	gocv.GaussianBlur(gray, &blurred, image.Pt(5, 5), 1.0, 1.0, gocv.BorderDefault)

	// Canny edge detection
	edges := gocv.NewMat()
	defer edges.Close()
	gocv.Canny(blurred, &edges, 50, 150)

	// Hough line detection
	lines := gocv.NewMat()
	defer lines.Close()
	gocv.HoughLinesP(edges, &lines, 1, math.Pi/180, 50, 50, 10)

	// Convert to Edge structures
	edgeList := []Edge{}
	for i := 0; i < lines.Rows(); i++ {
		x1 := float64(lines.GetIntAt(i, 0))
		y1 := float64(lines.GetIntAt(i, 1))
		x2 := float64(lines.GetIntAt(i, 2))
		y2 := float64(lines.GetIntAt(i, 3))

		edge := Edge{
			Start:      Point2D{X: x1, Y: y1},
			End:        Point2D{X: x2, Y: y2},
			Confidence: 0.8, // Default confidence
			Type:       a.classifyEdgeType(x1, y1, x2, y2),
		}
		edgeList = append(edgeList, edge)
	}

	return edgeList
}

// detectCorners performs corner detection using Harris corner detector
func (a *Analyzer) detectCorners(img gocv.Mat) []Point2D {
	gray := gocv.NewMat()
	defer gray.Close()
	gocv.CvtColor(img, &gray, gocv.ColorBGRToGray)

	// Harris corner detection
	corners := gocv.NewMat()
	defer corners.Close()
	gocv.CornerHarris(gray, &corners, 2, 3, 0.04)

	// Normalize
	normalized := gocv.NewMat()
	defer normalized.Close()
	gocv.Normalize(corners, &normalized, 0, 255, gocv.NormMinMax)

	// Find corners above threshold
	cornerPoints := []Point2D{}
	threshold := 100.0

	for y := 0; y < normalized.Rows(); y++ {
		for x := 0; x < normalized.Cols(); x++ {
			val := normalized.GetFloatAt(y, x)
			if val > threshold {
				cornerPoints = append(cornerPoints, Point2D{
					X: float64(x),
					Y: float64(y),
				})
			}
		}
	}

	// Non-maximum suppression to reduce nearby corners
	return a.nonMaximumSuppression(cornerPoints, 20)
}

// estimateDepth creates a simple depth map estimation
func (a *Analyzer) estimateDepth(img gocv.Mat) [][]float64 {
	// Simplified depth estimation using image gradients and perspective cues
	// In a real implementation, this would use ML models or stereo vision

	rows := img.Rows()
	cols := img.Cols()
	depthMap := make([][]float64, rows)

	for i := range depthMap {
		depthMap[i] = make([]float64, cols)
		for j := range depthMap[i] {
			// Simple depth based on vertical position (higher = farther)
			depthMap[i][j] = 2.0 + (float64(i)/float64(rows))*3.0
		}
	}

	return depthMap
}

// Helper methods

func (a *Analyzer) classifyEdgeType(x1, y1, x2, y2 float64) string {
	angle := math.Abs(math.Atan2(y2-y1, x2-x1) * 180 / math.Pi)
	
	if angle < 15 || angle > 165 {
		return "horizontal"
	} else if angle > 75 && angle < 105 {
		return "vertical"
	}
	return "diagonal"
}

func (a *Analyzer) findVanishingPoints(edges []Edge) []Point2D {
	// Simplified vanishing point detection
	// In a real implementation, this would use RANSAC or similar algorithms
	
	vanishingPoints := []Point2D{}
	
	// Group parallel lines and find intersections
	// This is a placeholder implementation
	
	// Default vanishing points for a typical room
	vanishingPoints = append(vanishingPoints, Point2D{X: 0.5, Y: 0.3})
	vanishingPoints = append(vanishingPoints, Point2D{X: 0.2, Y: 0.5})
	
	return vanishingPoints
}

func (a *Analyzer) filterVerticalEdges(edges []Edge) []Edge {
	vertical := []Edge{}
	for _, edge := range edges {
		if edge.Type == "vertical" {
			vertical = append(vertical, edge)
		}
	}
	return vertical
}

func (a *Analyzer) detectFurniture(img gocv.Mat) []FurnitureItem {
	// Placeholder for furniture detection
	// In a real implementation, this would use object detection models
	return []FurnitureItem{}
}

func (a *Analyzer) detectLighting(img gocv.Mat) []LightSource {
	// Placeholder for lighting detection
	// Would analyze bright regions and shadows
	return []LightSource{}
}

func (a *Analyzer) detectFloorMaterial(img gocv.Mat) string {
	// Placeholder for floor material detection
	// Would use texture analysis and ML classification
	return "unknown"
}

func (a *Analyzer) calculateConfidence(corners []Point2D, edges []Edge, depthMap [][]float64) float64 {
	// Calculate confidence based on detected features
	confidence := 0.5 // Base confidence
	
	// More corners increase confidence
	if len(corners) >= 4 {
		confidence += 0.2
	}
	
	// More edges increase confidence
	if len(edges) >= 10 {
		confidence += 0.2
	}
	
	// Valid depth map increases confidence
	if len(depthMap) > 0 && len(depthMap[0]) > 0 {
		confidence += 0.1
	}
	
	return math.Min(confidence, 1.0)
}

func (a *Analyzer) nonMaximumSuppression(points []Point2D, radius float64) []Point2D {
	if len(points) == 0 {
		return points
	}
	
	suppressed := []Point2D{points[0]}
	
	for i := 1; i < len(points); i++ {
		tooClose := false
		for _, kept := range suppressed {
			dist := math.Sqrt(math.Pow(points[i].X-kept.X, 2) + math.Pow(points[i].Y-kept.Y, 2))
			if dist < radius {
				tooClose = true
				break
			}
		}
		if !tooClose {
			suppressed = append(suppressed, points[i])
		}
	}
	
	return suppressed
}