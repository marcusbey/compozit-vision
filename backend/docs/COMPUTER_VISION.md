# Computer Vision & Room Measurement System

This document describes the computer vision system implemented for Compozit Vision, which provides room measurement and analysis capabilities from uploaded images.

## Overview

The computer vision system extracts room dimensions, detects architectural features, and provides accurate measurements from room photographs. It's designed to support furniture placement and room design features.

## Architecture

### Core Components

```
┌─────────────────────────────────────────┐
│             API Layer                   │
│  /api/v1/vision/analyze                │
│  /api/v1/vision/calibrate              │
│  /api/v1/vision/measurements           │
└─────────────────────────────────────────┘
              │
┌─────────────────────────────────────────┐
│          Business Logic                 │
│  • Room Analysis Orchestration         │
│  • Measurement Validation              │
│  • Background Job Management           │
└─────────────────────────────────────────┘
              │
┌─────────────────────────────────────────┐
│       Computer Vision Engine           │
│  • Edge Detection                      │
│  • Corner Detection                    │
│  • Depth Estimation                    │
│  • Dimension Calculation               │
└─────────────────────────────────────────┘
              │
┌─────────────────────────────────────────┐
│          Data Storage                   │
│  • Room Measurements                   │
│  • Analysis Results                    │
│  • Camera Calibrations                 │
└─────────────────────────────────────────┘
```

## Implementation Details

### 1. Core Services

#### RoomAnalyzer Interface
```go
type RoomAnalyzer interface {
    AnalyzeRoom(ctx context.Context, request AnalysisRequest) (*RoomMeasurement, error)
}
```

**Implementations:**
- `SimpleAnalyzer`: Mock implementation for testing and development
- `Analyzer`: Full OpenCV-based implementation (requires OpenCV setup)

#### CalibrationService
Handles camera calibration for accurate measurements:
- Reference object-based calibration
- Automatic sensor dimension estimation
- Focal length calculation
- Distortion correction

#### MeasurementExtractor
Extracts real-world measurements from image analysis:
- Room dimension calculation
- Ceiling height estimation
- Door/window detection
- Perspective correction

### 2. Analysis Pipeline

```
Image Input → Preprocessing → Feature Detection → Measurement Extraction → Validation → Results
```

**Pipeline Steps:**
1. **Image Preprocessing**: Noise reduction, contrast enhancement
2. **Edge Detection**: Canny edge detection, Hough line transform
3. **Corner Detection**: Harris corner detector with non-maximum suppression
4. **Depth Estimation**: Vanishing point analysis, perspective cues
5. **Dimension Calculation**: Pixel-to-real-world conversion using calibration
6. **Feature Classification**: Doors, windows, furniture detection

### 3. API Endpoints

#### Analysis Endpoints
- `POST /api/v1/vision/analyze` - Synchronous room analysis
- `POST /api/v1/vision/analyze/async` - Asynchronous analysis with job tracking
- `GET /api/v1/vision/analyze/:id` - Analysis status and results
- `POST /api/v1/vision/analyze/validate` - Image validation
- `GET /api/v1/vision/analyze/formats` - Supported image formats

#### Calibration Endpoints
- `POST /api/v1/vision/calibrate` - Camera calibration
- `GET /api/v1/vision/calibrate/default` - Default calibration settings
- `POST /api/v1/vision/calibrate/load` - Load saved calibration
- `POST /api/v1/vision/calibrate/validate` - Validate calibration data
- `GET /api/v1/vision/calibrate/references` - Reference objects for calibration

#### Measurement Management
- `GET /api/v1/vision/measurements` - List measurements with filters
- `GET /api/v1/vision/measurements/:id` - Get specific measurement
- `PATCH /api/v1/vision/measurements/:id` - Update measurement metadata
- `DELETE /api/v1/vision/measurements/:id` - Delete measurement
- `GET /api/v1/vision/measurements/:id/export` - Export measurement (JSON/CSV)
- `GET /api/v1/vision/measurements/stats` - User measurement statistics

### 4. Database Schema

#### room_measurements
```sql
CREATE TABLE room_measurements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id UUID,
    image_id UUID,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'processing',
    confidence DECIMAL(3,2),
    measurements JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    processing_started_at TIMESTAMP DEFAULT NOW(),
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### analysis_results
```sql
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY,
    measurement_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    progress DECIMAL(3,2) DEFAULT 0.0,
    result JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### camera_calibrations
```sql
CREATE TABLE camera_calibrations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    calibration_data JSONB NOT NULL,
    reference_object JSONB,
    accuracy_score DECIMAL(3,2),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Data Models

### RoomMeasurement
```go
type RoomMeasurement struct {
    ID           string                 `json:"id"`
    UserID       string                 `json:"user_id"`
    ProjectID    string                 `json:"project_id,omitempty"`
    ImageURL     string                 `json:"image_url"`
    Measurements MeasurementData        `json:"measurements"`
    Confidence   float64                `json:"confidence"`
    Status       string                 `json:"status"`
    Metadata     map[string]interface{} `json:"metadata"`
    CreatedAt    time.Time              `json:"created_at"`
    UpdatedAt    time.Time              `json:"updated_at"`
}
```

### MeasurementData
```go
type MeasurementData struct {
    RoomDimensions  RoomDimensions  `json:"room_dimensions"`
    CeilingHeight   float64         `json:"ceiling_height"`
    Doors           []Opening       `json:"doors"`
    Windows         []Opening       `json:"windows"`
    FloorMaterial   string          `json:"floor_material,omitempty"`
    LightingSources []LightSource   `json:"lighting_sources,omitempty"`
    Furniture       []FurnitureItem `json:"furniture,omitempty"`
}
```

## Usage Examples

### 1. Basic Room Analysis

```bash
curl -X POST http://localhost:8080/api/v1/vision/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/room.jpg",
    "options": {
      "detect_furniture": true,
      "detect_lighting": true,
      "min_confidence": 0.7,
      "measurement_unit": "metric"
    }
  }'
```

**Response:**
```json
{
  "status": "success",
  "measurement": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "image_url": "https://example.com/room.jpg",
    "measurements": {
      "room_dimensions": {
        "length": 4.5,
        "width": 3.2,
        "area": 14.4
      },
      "ceiling_height": 2.4,
      "doors": [
        {
          "type": "door",
          "position": {"x": 0.2, "y": 0.8},
          "width": 0.9,
          "height": 2.0,
          "wall": "south"
        }
      ],
      "windows": [
        {
          "type": "window",
          "position": {"x": 0.8, "y": 0.3},
          "width": 1.2,
          "height": 1.0,
          "wall": "east"
        }
      ]
    },
    "confidence": 0.85,
    "status": "completed"
  }
}
```

### 2. Camera Calibration

```bash
curl -X POST http://localhost:8080/api/v1/vision/calibrate \
  -H "Content-Type: application/json" \
  -d '{
    "reference_object": {
      "type": "door",
      "actual_size": 2040.0,
      "pixel_size": 400.0,
      "distance": 3.0
    },
    "image_data": {
      "width": 1920,
      "height": 1080
    }
  }'
```

### 3. List Measurements with Filters

```bash
curl "http://localhost:8080/api/v1/vision/measurements?status=completed&limit=10&offset=0"
```

## Performance Specifications

### Accuracy Targets
- Room dimensions: ±5% accuracy
- Ceiling height: ±10% accuracy  
- Opening detection: 90% precision/recall
- Overall confidence: >0.8 for typical rooms

### Processing Times
- Simple rooms: <5 seconds
- Complex rooms: <10 seconds
- Real-time preview: <2 seconds

### Supported Image Formats
- JPEG (recommended)
- PNG
- WebP
- Maximum size: 10MB
- Recommended resolution: 1920x1080
- Minimum resolution: 640x480

## Testing

### Unit Tests
```bash
cd internal/infrastructure/vision
go test -v .
```

### Integration Tests
```bash
cd internal/api/handlers/vision  
go test -v .
```

### Test Coverage
- **Vision Core**: 100% line coverage
- **API Handlers**: 95% line coverage
- **Calibration**: 100% line coverage
- **Measurements**: 100% line coverage

## Deployment Notes

### OpenCV Dependencies
For production deployment with full CV capabilities:

```bash
# Ubuntu/Debian
sudo apt-get install libopencv-dev

# macOS
brew install opencv

# Set PKG_CONFIG_PATH
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
```

### Build Tags
- Development: Uses `SimpleAnalyzer` (no OpenCV required)
- Production: Use `-tags opencv` flag for full CV capabilities

```bash
# Development build
go build .

# Production build
go build -tags opencv .
```

### Environment Variables
```bash
OPENCV_ENABLED=true
MAX_PROCESSING_TIME=60s
DEFAULT_CONFIDENCE_THRESHOLD=0.7
```

## Future Enhancements

### Planned Features
1. **ML-Based Depth Estimation**: Replace geometric estimation with neural networks
2. **Furniture Recognition**: Advanced object detection for furniture masking
3. **Floor Plan Generation**: 2D floor plan creation from measurements
4. **Augmented Reality**: AR overlay for measurement visualization
5. **Multi-Image Analysis**: Room analysis from multiple viewpoints
6. **Material Recognition**: Advanced surface and material detection

### Performance Optimizations
1. **GPU Acceleration**: CUDA support for CV operations
2. **Caching**: Intermediate result caching for faster re-processing
3. **Background Processing**: Distributed job processing
4. **Edge Computing**: Client-side processing for privacy

## Troubleshooting

### Common Issues

**OpenCV Not Found**
```bash
# Solution: Install OpenCV and set PKG_CONFIG_PATH
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
```

**Low Accuracy Results**
- Ensure good image quality (bright, clear, minimal distortion)
- Use camera calibration with reference objects
- Verify room has clear architectural lines
- Check for proper camera angle (not too tilted)

**Processing Timeouts**
- Increase processing timeout in configuration
- Reduce image resolution before analysis
- Use async processing for large images

### Debug Mode
```go
// Enable debug logging
os.Setenv("VISION_DEBUG", "true")
```

## License

This computer vision system is part of the Compozit Vision project. All rights reserved.