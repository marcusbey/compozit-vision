package vision

import (
	"errors"
	"image"
	"math"
)

// MeasurementExtractor handles dimension extraction from analyzed images
type MeasurementExtractor struct {
	calibrationService *CalibrationService
}

// NewMeasurementExtractor creates a new measurement extractor
func NewMeasurementExtractor(calibrationService *CalibrationService) *MeasurementExtractor {
	return &MeasurementExtractor{
		calibrationService: calibrationService,
	}
}

// ExtractRoomDimensions extracts room dimensions from detected corners and edges
func (me *MeasurementExtractor) ExtractRoomDimensions(
	corners []Point2D,
	edges []Edge,
	depthMap [][]float64,
	calibration *CalibrationData,
	imageWidth, imageHeight int,
) (*RoomDimensions, error) {
	if len(corners) < 4 {
		return nil, errors.New("insufficient corners detected")
	}
	
	// Find the room boundaries
	bounds := me.findRoomBoundaries(corners)
	
	// Calculate average depth for the room
	avgDepth := me.calculateAverageDepth(depthMap, bounds)
	if avgDepth <= 0 {
		avgDepth = 3.5 // Default room depth
	}
	
	// Convert pixel measurements to real-world dimensions
	pixelLength := me.calculateDistance(bounds.TopLeft, Point2D{X: bounds.BottomRight.X, Y: bounds.TopLeft.Y})
	pixelWidth := me.calculateDistance(bounds.TopLeft, Point2D{X: bounds.TopLeft.X, Y: bounds.BottomRight.Y})
	
	length := me.calibrationService.CalculateRealWorldDistance(
		pixelLength, avgDepth, calibration, imageWidth,
	)
	width := me.calibrationService.CalculateRealWorldDistance(
		pixelWidth, avgDepth, calibration, imageWidth,
	)
	
	// Apply perspective correction
	length, width = me.applyPerspectiveCorrection(length, width, corners)
	
	return &RoomDimensions{
		Length: length,
		Width:  width,
		Area:   length * width,
	}, nil
}

// ExtractCeilingHeight estimates ceiling height from vertical edges and vanishing points
func (me *MeasurementExtractor) ExtractCeilingHeight(
	verticalEdges []Edge,
	vanishingPoints []Point2D,
	depthEstimate float64,
	calibration *CalibrationData,
	imageHeight int,
) float64 {
	if len(verticalEdges) == 0 {
		// Default ceiling height
		return 2.4
	}
	
	// Find the longest vertical edge (likely a wall edge)
	maxLength := 0.0
	for _, edge := range verticalEdges {
		length := me.calculateDistance(edge.Start, edge.End)
		if length > maxLength {
			maxLength = length
		}
	}
	
	// Convert to real-world height
	height := me.calibrationService.CalculateRealWorldDistance(
		maxLength, depthEstimate, calibration, imageHeight,
	)
	
	// Apply standard ceiling height constraints
	if height < 2.0 {
		height = 2.4 // Minimum reasonable ceiling height
	} else if height > 4.0 {
		height = 3.0 // Typical ceiling height
	}
	
	return height
}

// DetectOpenings detects doors and windows from edges and image features
func (me *MeasurementExtractor) DetectOpenings(
	edges []Edge,
	depthMap [][]float64,
	calibration *CalibrationData,
	imageWidth int,
) []Opening {
	openings := []Opening{}
	
	// Group edges by proximity and orientation
	rectangles := me.findRectangularRegions(edges)
	
	for _, rect := range rectangles {
		// Classify as door or window based on position and proportions
		openingType := me.classifyOpening(rect)
		
		// Calculate real-world dimensions
		avgDepth := me.getDepthAtRegion(depthMap, rect)
		width := me.calibrationService.CalculateRealWorldDistance(
			rect.Width(), avgDepth, calibration, imageWidth,
		)
		height := me.calibrationService.CalculateRealWorldDistance(
			rect.Height(), avgDepth, calibration, imageWidth,
		)
		
		// Determine which wall the opening is on
		wall := me.determineWall(rect, imageWidth, imageWidth)
		
		opening := Opening{
			Type:     openingType,
			Position: rect.Center(),
			Width:    width,
			Height:   height,
			Wall:     wall,
		}
		
		openings = append(openings, opening)
	}
	
	return openings
}

// Helper methods

func (me *MeasurementExtractor) findRoomBoundaries(corners []Point2D) Rectangle {
	if len(corners) == 0 {
		return Rectangle{}
	}
	
	minX, minY := corners[0].X, corners[0].Y
	maxX, maxY := corners[0].X, corners[0].Y
	
	for _, corner := range corners {
		minX = math.Min(minX, corner.X)
		minY = math.Min(minY, corner.Y)
		maxX = math.Max(maxX, corner.X)
		maxY = math.Max(maxY, corner.Y)
	}
	
	return Rectangle{
		TopLeft:     Point2D{X: minX, Y: minY},
		BottomRight: Point2D{X: maxX, Y: maxY},
	}
}

func (me *MeasurementExtractor) calculateDistance(p1, p2 Point2D) float64 {
	dx := p2.X - p1.X
	dy := p2.Y - p1.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func (me *MeasurementExtractor) calculateAverageDepth(depthMap [][]float64, bounds Rectangle) float64 {
	if len(depthMap) == 0 {
		return 0
	}
	
	sum := 0.0
	count := 0
	
	startY := int(bounds.TopLeft.Y)
	endY := int(bounds.BottomRight.Y)
	startX := int(bounds.TopLeft.X)
	endX := int(bounds.BottomRight.X)
	
	for y := startY; y < endY && y < len(depthMap); y++ {
		for x := startX; x < endX && x < len(depthMap[y]); x++ {
			if depthMap[y][x] > 0 {
				sum += depthMap[y][x]
				count++
			}
		}
	}
	
	if count == 0 {
		return 0
	}
	
	return sum / float64(count)
}

func (me *MeasurementExtractor) applyPerspectiveCorrection(length, width float64, corners []Point2D) (float64, float64) {
	// Simple perspective correction based on corner positions
	// In a real implementation, this would use homography transformation
	
	if len(corners) < 4 {
		return length, width
	}
	
	// Calculate the perspective distortion factor
	topWidth := me.calculateDistance(corners[0], corners[1])
	bottomWidth := me.calculateDistance(corners[2], corners[3])
	
	perspectiveFactor := topWidth / bottomWidth
	if perspectiveFactor > 0.8 && perspectiveFactor < 1.2 {
		// Minor perspective distortion, apply small correction
		correctionFactor := 1.0 / perspectiveFactor
		length *= correctionFactor
		width *= correctionFactor
	}
	
	return length, width
}

func (me *MeasurementExtractor) findRectangularRegions(edges []Edge) []Rectangle {
	// Simplified rectangle detection
	// In a real implementation, this would use more sophisticated algorithms
	rectangles := []Rectangle{}
	
	// Group edges by proximity and check for rectangular patterns
	// This is a placeholder implementation
	
	return rectangles
}

func (me *MeasurementExtractor) classifyOpening(rect Rectangle) string {
	aspectRatio := rect.Width() / rect.Height()
	
	// Simple classification based on aspect ratio and position
	if aspectRatio < 0.8 && rect.Height() > rect.Width()*1.5 {
		return "door"
	}
	return "window"
}

func (me *MeasurementExtractor) getDepthAtRegion(depthMap [][]float64, rect Rectangle) float64 {
	return me.calculateAverageDepth(depthMap, rect)
}

func (me *MeasurementExtractor) determineWall(rect Rectangle, imageWidth, imageHeight int) string {
	centerX := rect.Center().X
	centerY := rect.Center().Y
	
	// Determine wall based on position in image
	if centerX < float64(imageWidth)*0.2 {
		return "west"
	} else if centerX > float64(imageWidth)*0.8 {
		return "east"
	} else if centerY < float64(imageHeight)*0.2 {
		return "north"
	} else if centerY > float64(imageHeight)*0.8 {
		return "south"
	}
	
	// Default to nearest wall
	distToWest := centerX
	distToEast := float64(imageWidth) - centerX
	distToNorth := centerY
	distToSouth := float64(imageHeight) - centerY
	
	minDist := distToWest
	wall := "west"
	
	if distToEast < minDist {
		minDist = distToEast
		wall = "east"
	}
	if distToNorth < minDist {
		minDist = distToNorth
		wall = "north"
	}
	if distToSouth < minDist {
		wall = "south"
	}
	
	return wall
}

// Edge represents a detected edge in the image
type Edge struct {
	Start      Point2D
	End        Point2D
	Confidence float64
	Type       string // "horizontal", "vertical", "diagonal"
}

// Rectangle methods
func (r Rectangle) Width() float64 {
	return r.BottomRight.X - r.TopLeft.X
}

func (r Rectangle) Height() float64 {
	return r.BottomRight.Y - r.TopLeft.Y
}

func (r Rectangle) Center() Point2D {
	return Point2D{
		X: (r.TopLeft.X + r.BottomRight.X) / 2,
		Y: (r.TopLeft.Y + r.BottomRight.Y) / 2,
	}
}

func (r Rectangle) ToImageRect() image.Rectangle {
	return image.Rect(
		int(r.TopLeft.X),
		int(r.TopLeft.Y),
		int(r.BottomRight.X),
		int(r.BottomRight.Y),
	)
}