package ai

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds configuration for the AI rendering system
type Config struct {
	// Replicate API configuration
	ReplicateToken string
	ReplicateURL   string

	// Model configurations
	QuickModelVersion    string
	DetailedModelVersion string
	InpaintingModelVersion string

	// Performance settings
	MaxConcurrentJobs int
	JobTimeout        time.Duration
	CacheExpiration   time.Duration

	// Quality settings
	DefaultWidth      int
	DefaultHeight     int
	QuickInferenceSteps    int
	DetailedInferenceSteps int
	
	// Optimization settings
	EnableCaching      bool
	EnableOptimization bool
	MaxFileSize        int64 // in bytes
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	config := &Config{
		// Default values
		ReplicateURL:           "https://api.replicate.com",
		QuickModelVersion:      "stability-ai/sdxl-turbo:latest",
		DetailedModelVersion:   "stability-ai/stable-diffusion-xl:latest",
		InpaintingModelVersion: "stability-ai/stable-diffusion-inpainting:latest",
		MaxConcurrentJobs:      5,
		JobTimeout:             5 * time.Minute,
		CacheExpiration:        15 * time.Minute,
		DefaultWidth:           1024,
		DefaultHeight:          1024,
		QuickInferenceSteps:    4,
		DetailedInferenceSteps: 50,
		EnableCaching:          true,
		EnableOptimization:     true,
		MaxFileSize:            10 << 20, // 10MB
	}

	// Load from environment
	if token := os.Getenv("REPLICATE_API_TOKEN"); token != "" {
		config.ReplicateToken = token
	}

	if url := os.Getenv("REPLICATE_URL"); url != "" {
		config.ReplicateURL = url
	}

	if model := os.Getenv("AI_QUICK_MODEL"); model != "" {
		config.QuickModelVersion = model
	}

	if model := os.Getenv("AI_DETAILED_MODEL"); model != "" {
		config.DetailedModelVersion = model
	}

	if jobs := os.Getenv("MAX_CONCURRENT_AI_JOBS"); jobs != "" {
		if j, err := strconv.Atoi(jobs); err == nil && j > 0 {
			config.MaxConcurrentJobs = j
		}
	}

	if timeout := os.Getenv("AI_JOB_TIMEOUT"); timeout != "" {
		if t, err := time.ParseDuration(timeout); err == nil {
			config.JobTimeout = t
		}
	}

	if cache := os.Getenv("AI_CACHE_EXPIRATION"); cache != "" {
		if c, err := time.ParseDuration(cache); err == nil {
			config.CacheExpiration = c
		}
	}

	if width := os.Getenv("AI_DEFAULT_WIDTH"); width != "" {
		if w, err := strconv.Atoi(width); err == nil && w > 0 {
			config.DefaultWidth = w
		}
	}

	if height := os.Getenv("AI_DEFAULT_HEIGHT"); height != "" {
		if h, err := strconv.Atoi(height); err == nil && h > 0 {
			config.DefaultHeight = h
		}
	}

	if steps := os.Getenv("AI_QUICK_STEPS"); steps != "" {
		if s, err := strconv.Atoi(steps); err == nil && s > 0 {
			config.QuickInferenceSteps = s
		}
	}

	if steps := os.Getenv("AI_DETAILED_STEPS"); steps != "" {
		if s, err := strconv.Atoi(steps); err == nil && s > 0 {
			config.DetailedInferenceSteps = s
		}
	}

	if caching := os.Getenv("ENABLE_AI_CACHING"); caching != "" {
		config.EnableCaching = caching == "true"
	}

	if opt := os.Getenv("ENABLE_AI_OPTIMIZATION"); opt != "" {
		config.EnableOptimization = opt == "true"
	}

	if size := os.Getenv("MAX_AI_FILE_SIZE"); size != "" {
		if s, err := strconv.ParseInt(size, 10, 64); err == nil && s > 0 {
			config.MaxFileSize = s
		}
	}

	return config
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.ReplicateToken == "" {
		return fmt.Errorf("REPLICATE_API_TOKEN is required")
	}

	if c.MaxConcurrentJobs <= 0 {
		return fmt.Errorf("MaxConcurrentJobs must be positive")
	}

	if c.JobTimeout <= 0 {
		return fmt.Errorf("JobTimeout must be positive")
	}

	if c.DefaultWidth <= 0 || c.DefaultHeight <= 0 {
		return fmt.Errorf("Default dimensions must be positive")
	}

	return nil
}