package modeling

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/compozit/vision/backend/pkg/logger"
)

// BlenderService handles Blender operations for 3D modeling
type BlenderService struct {
	logger        logger.Logger
	blenderPath   string
	scriptsPath   string
	outputPath    string
}

// BlenderSceneData represents data for Blender scene generation
type BlenderSceneData struct {
	Room      *RoomGeometry    `json:"room"`
	Furniture []*FurnitureModel `json:"furniture"`
	Lights    []*LightSetup    `json:"lights"`
	Materials []*Material      `json:"materials"`
}

// BlenderOutput represents the output from Blender rendering
type BlenderOutput struct {
	URL  string `json:"url"`
	Size int64  `json:"size"`
	Path string `json:"path"`
}

// NewBlenderService creates a new Blender service
func NewBlenderService(logger logger.Logger) *BlenderService {
	return &BlenderService{
		logger:      logger,
		blenderPath: getBlenderPath(),
		scriptsPath: "./scripts/blender",
		outputPath:  "./uploads/models",
	}
}

// RenderScene generates a complete 3D scene using Blender
func (b *BlenderService) RenderScene(ctx context.Context, sceneData *BlenderSceneData) (*BlenderOutput, error) {
	b.logger.Info("Starting Blender scene rendering")
	
	// Create temporary scene data file
	sceneFile, err := b.writeSceneData(sceneData)
	if err != nil {
		return nil, fmt.Errorf("failed to write scene data: %w", err)
	}
	defer os.Remove(sceneFile)

	// Generate output filename
	outputFile := filepath.Join(b.outputPath, fmt.Sprintf("scene_%d.glb", time.Now().UnixNano()))
	
	// Ensure output directory exists
	if err := os.MkdirAll(filepath.Dir(outputFile), 0755); err != nil {
		return nil, fmt.Errorf("failed to create output directory: %w", err)
	}

	// Run Blender script
	scriptPath := filepath.Join(b.scriptsPath, "generate_scene.py")
	cmd := exec.CommandContext(ctx, b.blenderPath,
		"--background",           // Run without GUI
		"--python", scriptPath,   // Run Python script
		"--",                     // Arguments separator
		"--scene_data", sceneFile,
		"--output", outputFile,
	)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	b.logger.Info("Executing Blender command", "cmd", cmd.String())

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("blender command failed: %w", err)
	}

	// Check if output file was created
	if _, err := os.Stat(outputFile); os.IsNotExist(err) {
		return nil, fmt.Errorf("blender did not generate output file")
	}

	// Get file size
	fileInfo, err := os.Stat(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	// Convert to URL (this would typically involve uploading to cloud storage)
	url, err := b.uploadModelFile(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to upload model file: %w", err)
	}

	b.logger.Info("Blender scene rendering completed", 
		"output_file", outputFile, 
		"file_size", fileInfo.Size())

	return &BlenderOutput{
		URL:  url,
		Size: fileInfo.Size(),
		Path: outputFile,
	}, nil
}

// GenerateThumbnail creates a thumbnail image of the 3D model
func (b *BlenderService) GenerateThumbnail(ctx context.Context, model *BlenderOutput) (string, error) {
	b.logger.Info("Generating thumbnail", "model", model.Path)

	outputFile := strings.Replace(model.Path, ".glb", "_thumb.png", 1)
	
	scriptPath := filepath.Join(b.scriptsPath, "generate_thumbnail.py")
	cmd := exec.CommandContext(ctx, b.blenderPath,
		"--background",
		"--python", scriptPath,
		"--",
		"--model", model.Path,
		"--output", outputFile,
		"--width", "512",
		"--height", "512",
	)

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("thumbnail generation failed: %w", err)
	}

	// Upload thumbnail
	url, err := b.uploadThumbnailFile(outputFile)
	if err != nil {
		return "", fmt.Errorf("failed to upload thumbnail: %w", err)
	}

	return url, nil
}

// RenderFloorPlan generates a 2D floor plan from 3D model
func (b *BlenderService) RenderFloorPlan(ctx context.Context, room *Room, outputFormat ExportFormat) (*BlenderOutput, error) {
	b.logger.Info("Generating floor plan")

	// Create room data file
	roomFile, err := b.writeRoomData(room)
	if err != nil {
		return nil, fmt.Errorf("failed to write room data: %w", err)
	}
	defer os.Remove(roomFile)

	// Determine output format
	var extension string
	switch outputFormat {
	case ExportFormatPNG:
		extension = ".png"
	case ExportFormatPDF:
		extension = ".pdf"
	case ExportFormatDWG:
		extension = ".dwg"
	default:
		extension = ".png"
	}

	outputFile := filepath.Join(b.outputPath, fmt.Sprintf("floorplan_%d%s", time.Now().UnixNano(), extension))

	scriptPath := filepath.Join(b.scriptsPath, "generate_floorplan.py")
	cmd := exec.CommandContext(ctx, b.blenderPath,
		"--background",
		"--python", scriptPath,
		"--",
		"--room_data", roomFile,
		"--output", outputFile,
		"--format", string(outputFormat),
	)

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("floor plan generation failed: %w", err)
	}

	fileInfo, err := os.Stat(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	url, err := b.uploadFloorPlanFile(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to upload floor plan: %w", err)
	}

	return &BlenderOutput{
		URL:  url,
		Size: fileInfo.Size(),
		Path: outputFile,
	}, nil
}

// OptimizeModel reduces model complexity for mobile/web use
func (b *BlenderService) OptimizeModel(ctx context.Context, inputModel string, targetLOD int) (*BlenderOutput, error) {
	b.logger.Info("Optimizing model for mobile", "input", inputModel, "lod", targetLOD)

	outputFile := strings.Replace(inputModel, ".glb", "_optimized.glb", 1)
	
	scriptPath := filepath.Join(b.scriptsPath, "optimize_model.py")
	cmd := exec.CommandContext(ctx, b.blenderPath,
		"--background",
		"--python", scriptPath,
		"--",
		"--input", inputModel,
		"--output", outputFile,
		"--lod", fmt.Sprintf("%d", targetLOD),
		"--target_polygons", "5000", // Target polygon count for mobile
	)

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("model optimization failed: %w", err)
	}

	fileInfo, err := os.Stat(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to get optimized file info: %w", err)
	}

	url, err := b.uploadModelFile(outputFile)
	if err != nil {
		return nil, fmt.Errorf("failed to upload optimized model: %w", err)
	}

	return &BlenderOutput{
		URL:  url,
		Size: fileInfo.Size(),
		Path: outputFile,
	}, nil
}

// writeSceneData writes scene data to a JSON file for Blender script
func (b *BlenderService) writeSceneData(sceneData *BlenderSceneData) (string, error) {
	tempFile := filepath.Join(os.TempDir(), fmt.Sprintf("scene_data_%d.json", time.Now().UnixNano()))
	
	// Convert to JSON and write to file
	// Implementation would serialize sceneData to JSON
	file, err := os.Create(tempFile)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// Write JSON data (simplified for example)
	_, err = file.WriteString(`{
		"room": {
			"dimensions": {"length": 5, "width": 4, "height": 2.5},
			"walls": []
		},
		"furniture": [],
		"lights": [],
		"materials": []
	}`)

	return tempFile, err
}

// writeRoomData writes room data for floor plan generation
func (b *BlenderService) writeRoomData(room *Room) (string, error) {
	tempFile := filepath.Join(os.TempDir(), fmt.Sprintf("room_data_%d.json", time.Now().UnixNano()))
	
	file, err := os.Create(tempFile)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// Write room data as JSON (simplified)
	_, err = file.WriteString(`{"room": {"dimensions": {"length": 5, "width": 4}}}`)

	return tempFile, err
}

// uploadModelFile uploads model file to cloud storage and returns URL
func (b *BlenderService) uploadModelFile(filePath string) (string, error) {
	// Implementation would upload to cloud storage (AWS S3, Google Cloud, etc.)
	// For now, return a local file URL
	filename := filepath.Base(filePath)
	return fmt.Sprintf("/api/models/%s", filename), nil
}

// uploadThumbnailFile uploads thumbnail file to cloud storage
func (b *BlenderService) uploadThumbnailFile(filePath string) (string, error) {
	filename := filepath.Base(filePath)
	return fmt.Sprintf("/api/thumbnails/%s", filename), nil
}

// uploadFloorPlanFile uploads floor plan file to cloud storage
func (b *BlenderService) uploadFloorPlanFile(filePath string) (string, error) {
	filename := filepath.Base(filePath)
	return fmt.Sprintf("/api/floorplans/%s", filename), nil
}

// getBlenderPath returns the path to Blender executable
func getBlenderPath() string {
	// Try common Blender installation paths
	paths := []string{
		"/Applications/Blender.app/Contents/MacOS/Blender",           // macOS
		"/usr/local/bin/blender",                                    // Linux/macOS Homebrew
		"/usr/bin/blender",                                          // Linux
		"C:\\Program Files\\Blender Foundation\\Blender\\blender.exe", // Windows
	}

	for _, path := range paths {
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	// Fallback to PATH
	return "blender"
}