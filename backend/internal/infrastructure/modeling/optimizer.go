package modeling

import (
	"fmt"
	"os"
	"path/filepath"
)

// ModelOptimizer optimizes 3D models for web/mobile use
type ModelOptimizer struct {
	targetPolygons int
	targetFileSize int64 // in bytes
}

// NewModelOptimizer creates a new model optimizer
func NewModelOptimizer() *ModelOptimizer {
	return &ModelOptimizer{
		targetPolygons: 5000,     // Target polygon count for mobile
		targetFileSize: 5 << 20,  // 5MB target file size
	}
}

// OptimizationLevel represents different levels of optimization
type OptimizationLevel int

const (
	OptimizationLow    OptimizationLevel = iota // High quality, larger file
	OptimizationMedium                          // Balanced
	OptimizationHigh                            // Lower quality, smaller file
	OptimizationMobile                          // Optimized for mobile devices
)

// OptimizationOptions contains options for model optimization
type OptimizationOptions struct {
	Level           OptimizationLevel `json:"level"`
	TargetPolygons  int              `json:"target_polygons"`
	TargetFileSize  int64            `json:"target_file_size"`
	CompressTextures bool            `json:"compress_textures"`
	GenerateLODs    bool             `json:"generate_lods"`
	RemoveUnused    bool             `json:"remove_unused"`
}

// OptimizedModel represents an optimized 3D model
type OptimizedModel struct {
	URL           string                 `json:"url"`
	Path          string                 `json:"path"`
	Size          int64                  `json:"size"`
	VertexCount   int                    `json:"vertex_count"`
	PolygonCount  int                    `json:"polygon_count"`
	TextureSize   int                    `json:"texture_size"`
	LODLevels     []LODLevel             `json:"lod_levels,omitempty"`
	Metadata      map[string]interface{} `json:"metadata"`
}

// LODLevel represents a Level of Detail variant
type LODLevel struct {
	Level        int     `json:"level"`
	Distance     float32 `json:"distance"`
	PolygonRatio float32 `json:"polygon_ratio"`
	URL          string  `json:"url"`
	Size         int64   `json:"size"`
}

// OptimizeForMobile optimizes a 3D model specifically for mobile devices
func (mo *ModelOptimizer) OptimizeForMobile(model *Model) (*OptimizedModel, error) {
	options := OptimizationOptions{
		Level:           OptimizationMobile,
		TargetPolygons:  3000,  // Conservative for mobile
		TargetFileSize:  2 << 20, // 2MB for mobile
		CompressTextures: true,
		GenerateLODs:    true,
		RemoveUnused:    true,
	}

	return mo.OptimizeModel(model, options)
}

// OptimizeForWeb optimizes a 3D model for web browsers
func (mo *ModelOptimizer) OptimizeForWeb(model *Model) (*OptimizedModel, error) {
	options := OptimizationOptions{
		Level:           OptimizationMedium,
		TargetPolygons:  8000,
		TargetFileSize:  5 << 20, // 5MB for web
		CompressTextures: true,
		GenerateLODs:    false,   // Web can handle higher detail
		RemoveUnused:    true,
	}

	return mo.OptimizeModel(model, options)
}

// OptimizeModel optimizes a 3D model with custom options
func (mo *ModelOptimizer) OptimizeModel(model *Model, options OptimizationOptions) (*OptimizedModel, error) {
	// Create output filename
	dir := filepath.Dir(model.URL)
	ext := filepath.Ext(model.URL)
	base := filepath.Base(model.URL)
	name := base[:len(base)-len(ext)]
	
	optimizedPath := filepath.Join(dir, fmt.Sprintf("%s_optimized%s", name, ext))

	// Step 1: Reduce polygon count if needed
	reducedModel, err := mo.reducePolygons(model, options.TargetPolygons)
	if err != nil {
		return nil, fmt.Errorf("failed to reduce polygons: %w", err)
	}

	// Step 2: Compress textures if requested
	if options.CompressTextures {
		reducedModel, err = mo.compressTextures(reducedModel)
		if err != nil {
			return nil, fmt.Errorf("failed to compress textures: %w", err)
		}
	}

	// Step 3: Remove unused materials/textures
	if options.RemoveUnused {
		reducedModel, err = mo.removeUnusedAssets(reducedModel)
		if err != nil {
			return nil, fmt.Errorf("failed to remove unused assets: %w", err)
		}
	}

	// Step 4: Generate LOD levels if requested
	var lodLevels []LODLevel
	if options.GenerateLODs {
		lodLevels, err = mo.generateLODs(reducedModel, 3) // Generate 3 LOD levels
		if err != nil {
			return nil, fmt.Errorf("failed to generate LODs: %w", err)
		}
	}

	// Get file size
	fileInfo, err := os.Stat(reducedModel.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	// Calculate model statistics
	stats := mo.calculateModelStats(reducedModel)

	optimized := &OptimizedModel{
		URL:           reducedModel.URL,
		Path:          reducedModel.URL,
		Size:          fileInfo.Size(),
		VertexCount:   stats.VertexCount,
		PolygonCount:  stats.PolygonCount,
		TextureSize:   stats.TextureSize,
		LODLevels:     lodLevels,
		Metadata: map[string]interface{}{
			"optimization_level": options.Level,
			"original_size":      model.Size,
			"compression_ratio":  float64(fileInfo.Size()) / float64(model.Size),
			"polygon_reduction":  float64(stats.PolygonCount) / float64(mo.getOriginalPolygonCount(model)),
		},
	}

	return optimized, nil
}

// reducePolygons reduces the polygon count of a model
func (mo *ModelOptimizer) reducePolygons(model *Model, targetPolygons int) (*Model, error) {
	// This would typically use a mesh decimation algorithm
	// For now, we'll simulate the process
	
	originalPolygons := mo.getOriginalPolygonCount(model)
	if originalPolygons <= targetPolygons {
		// No reduction needed
		return model, nil
	}

	reductionRatio := float64(targetPolygons) / float64(originalPolygons)
	
	// Simulate polygon reduction
	// In a real implementation, this would use algorithms like:
	// - Quadric error metrics
	// - Edge collapse
	// - Vertex clustering
	
	reducedModel := &Model{
		URL:         model.URL,
		Size:        int64(float64(model.Size) * 0.7), // Simulate size reduction
		BoundingBox: model.BoundingBox,
	}

	return reducedModel, nil
}

// compressTextures compresses model textures
func (mo *ModelOptimizer) compressTextures(model *Model) (*Model, error) {
	// This would typically:
	// 1. Convert textures to compressed formats (DXT, ASTC, etc.)
	// 2. Reduce texture resolution
	// 3. Combine multiple textures into atlases
	
	compressedModel := &Model{
		URL:         model.URL,
		Size:        int64(float64(model.Size) * 0.5), // Simulate compression
		BoundingBox: model.BoundingBox,
	}

	return compressedModel, nil
}

// removeUnusedAssets removes unused materials, textures, and geometry
func (mo *ModelOptimizer) removeUnusedAssets(model *Model) (*Model, error) {
	// This would typically:
	// 1. Analyze which materials are actually used
	// 2. Remove unused textures
	// 3. Merge similar materials
	// 4. Remove invisible geometry
	
	cleanedModel := &Model{
		URL:         model.URL,
		Size:        int64(float64(model.Size) * 0.9), // Simulate cleanup
		BoundingBox: model.BoundingBox,
	}

	return cleanedModel, nil
}

// generateLODs creates multiple Level of Detail versions
func (mo *ModelOptimizer) generateLODs(model *Model, levels int) ([]LODLevel, error) {
	var lods []LODLevel
	
	for i := 1; i <= levels; i++ {
		ratio := 1.0 / float32(i+1) // Each LOD has fewer polygons
		distance := float32(i * 10) // Distance thresholds
		
		// Create LOD filename
		dir := filepath.Dir(model.URL)
		ext := filepath.Ext(model.URL)
		base := filepath.Base(model.URL)
		name := base[:len(base)-len(ext)]
		
		lodPath := filepath.Join(dir, fmt.Sprintf("%s_lod%d%s", name, i, ext))
		
		// Simulate LOD generation
		lodSize := int64(float32(model.Size) * ratio)
		
		lod := LODLevel{
			Level:        i,
			Distance:     distance,
			PolygonRatio: ratio,
			URL:          lodPath,
			Size:         lodSize,
		}
		
		lods = append(lods, lod)
	}
	
	return lods, nil
}

// calculateModelStats analyzes model to get statistics
func (mo *ModelOptimizer) calculateModelStats(model *Model) *ModelStatistics {
	// This would typically parse the 3D model file to get actual statistics
	// For now, we'll simulate based on file size
	
	// Rough estimation based on file size
	vertexCount := int(model.Size / 100)    // ~100 bytes per vertex (rough estimate)
	polygonCount := vertexCount / 3         // Assuming triangles
	textureSize := int(model.Size * 0.3)    // ~30% of file size for textures
	
	return &ModelStatistics{
		VertexCount:  vertexCount,
		PolygonCount: polygonCount,
		TextureSize:  textureSize,
	}
}

// getOriginalPolygonCount estimates original polygon count
func (mo *ModelOptimizer) getOriginalPolygonCount(model *Model) int {
	// Rough estimation for simulation
	return int(model.Size / 150) // ~150 bytes per polygon (rough estimate)
}

// ValidateOptimization checks if optimization meets requirements
func (mo *ModelOptimizer) ValidateOptimization(optimized *OptimizedModel, requirements OptimizationOptions) error {
	if optimized.Size > requirements.TargetFileSize {
		return fmt.Errorf("optimized file size %d exceeds target %d", optimized.Size, requirements.TargetFileSize)
	}
	
	if optimized.PolygonCount > requirements.TargetPolygons {
		return fmt.Errorf("optimized polygon count %d exceeds target %d", optimized.PolygonCount, requirements.TargetPolygons)
	}
	
	return nil
}

// GetOptimizationPreview returns preview information about what optimization would achieve
func (mo *ModelOptimizer) GetOptimizationPreview(model *Model, options OptimizationOptions) (*OptimizationPreview, error) {
	originalStats := mo.calculateModelStats(model)
	
	// Estimate optimization results
	estimatedPolygons := options.TargetPolygons
	if originalStats.PolygonCount < options.TargetPolygons {
		estimatedPolygons = originalStats.PolygonCount
	}
	
	estimatedSize := model.Size
	if options.CompressTextures {
		estimatedSize = int64(float64(estimatedSize) * 0.5)
	}
	if options.RemoveUnused {
		estimatedSize = int64(float64(estimatedSize) * 0.9)
	}
	
	preview := &OptimizationPreview{
		Original: OptimizationStats{
			FileSize:     model.Size,
			VertexCount:  originalStats.VertexCount,
			PolygonCount: originalStats.PolygonCount,
			TextureSize:  originalStats.TextureSize,
		},
		Optimized: OptimizationStats{
			FileSize:     estimatedSize,
			VertexCount:  estimatedPolygons * 3, // Rough estimate
			PolygonCount: estimatedPolygons,
			TextureSize:  int(float64(originalStats.TextureSize) * 0.5),
		},
		Savings: OptimizationSavings{
			FileSizeReduction: float64(model.Size-estimatedSize) / float64(model.Size) * 100,
			PolygonReduction:  float64(originalStats.PolygonCount-estimatedPolygons) / float64(originalStats.PolygonCount) * 100,
		},
	}
	
	return preview, nil
}

// Supporting structures
type ModelStatistics struct {
	VertexCount  int
	PolygonCount int
	TextureSize  int
}

type OptimizationPreview struct {
	Original  OptimizationStats   `json:"original"`
	Optimized OptimizationStats   `json:"optimized"`
	Savings   OptimizationSavings `json:"savings"`
}

type OptimizationStats struct {
	FileSize     int64 `json:"file_size"`
	VertexCount  int   `json:"vertex_count"`
	PolygonCount int   `json:"polygon_count"`
	TextureSize  int   `json:"texture_size"`
}

type OptimizationSavings struct {
	FileSizeReduction float64 `json:"file_size_reduction_percent"`
	PolygonReduction  float64 `json:"polygon_reduction_percent"`
}