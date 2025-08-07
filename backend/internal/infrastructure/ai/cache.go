package ai

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/compozit/vision/backend/internal/infrastructure/cache"
)

// Cache handles caching of AI rendering results
type Cache struct {
	redisCache cache.Cache
	memCache   *sync.Map
	ttl        time.Duration
}

// NewCache creates a new AI cache
func NewCache(redisCache cache.Cache) *Cache {
	return &Cache{
		redisCache: redisCache,
		memCache:   &sync.Map{},
		ttl:        15 * time.Minute, // 15-minute cache for AI results
	}
}

// GetRender retrieves a cached render result
func (c *Cache) GetRender(req *RenderRequest) (*RenderResult, bool) {
	key := c.generateRenderKey(req)
	
	// Try memory cache first
	if val, ok := c.memCache.Load(key); ok {
		if result, ok := val.(*RenderResult); ok {
			return result, true
		}
	}

	// Try Redis cache
	var result RenderResult
	err := c.redisCache.Get(key, &result)
	if err == nil {
		// Store in memory cache for faster access
		c.memCache.Store(key, &result)
		return &result, true
	}

	return nil, false
}

// SetRender caches a render result
func (c *Cache) SetRender(req *RenderRequest, result *RenderResult) error {
	key := c.generateRenderKey(req)
	
	// Store in memory cache
	c.memCache.Store(key, result)
	
	// Store in Redis cache
	return c.redisCache.Set(key, result, c.ttl)
}

// GetInpainting retrieves cached inpainting result
func (c *Cache) GetInpainting(req *InpaintingRequest) (*RenderResult, bool) {
	key := c.generateInpaintingKey(req)
	
	if val, ok := c.memCache.Load(key); ok {
		if result, ok := val.(*RenderResult); ok {
			return result, true
		}
	}

	var result RenderResult
	err := c.redisCache.Get(key, &result)
	if err == nil {
		c.memCache.Store(key, &result)
		return &result, true
	}

	return nil, false
}

// SetInpainting caches an inpainting result
func (c *Cache) SetInpainting(req *InpaintingRequest, result *RenderResult) error {
	key := c.generateInpaintingKey(req)
	
	c.memCache.Store(key, result)
	
	return c.redisCache.Set(key, result, c.ttl)
}

// GetStyleTransfer retrieves cached style transfer result
func (c *Cache) GetStyleTransfer(req *StyleTransferRequest) (*RenderResult, bool) {
	key := c.generateStyleTransferKey(req)
	
	if val, ok := c.memCache.Load(key); ok {
		if result, ok := val.(*RenderResult); ok {
			return result, true
		}
	}

	var result RenderResult
	err := c.redisCache.Get(key, &result)
	if err == nil {
		c.memCache.Store(key, &result)
		return &result, true
	}

	return nil, false
}

// SetStyleTransfer caches a style transfer result
func (c *Cache) SetStyleTransfer(req *StyleTransferRequest, result *RenderResult) error {
	key := c.generateStyleTransferKey(req)
	
	c.memCache.Store(key, result)
	
	return c.redisCache.Set(key, result, c.ttl)
}

// InvalidateUserCache invalidates all cache entries for a user
func (c *Cache) InvalidateUserCache(userID string) error {
	// Clear from memory cache
	c.memCache.Range(func(key, value interface{}) bool {
		if keyStr, ok := key.(string); ok {
			if contains(keyStr, userID) {
				c.memCache.Delete(key)
			}
		}
		return true
	})
	
	// Clear from Redis using pattern
	pattern := fmt.Sprintf("ai:*:%s:*", userID)
	return c.redisCache.Delete(pattern)
}

// ClearExpiredCache removes expired entries from memory cache
func (c *Cache) ClearExpiredCache() {
	// This should be called periodically
	c.memCache.Range(func(key, value interface{}) bool {
		if result, ok := value.(*RenderResult); ok {
			if result.CompletedAt != nil && time.Since(*result.CompletedAt) > c.ttl {
				c.memCache.Delete(key)
			}
		}
		return true
	})
}

// generateRenderKey creates a unique cache key for render requests
func (c *Cache) generateRenderKey(req *RenderRequest) string {
	// Create a deterministic key based on request parameters
	data := map[string]interface{}{
		"type":       req.Type,
		"style":      req.Style,
		"prompt":     req.Prompt,
		"parameters": req.Parameters,
		"input_image": req.InputImage,
	}
	
	jsonData, _ := json.Marshal(data)
	hash := md5.Sum(jsonData)
	
	return fmt.Sprintf("ai:render:%s:%s", req.UserID, hex.EncodeToString(hash[:]))
}

// generateInpaintingKey creates a unique cache key for inpainting requests
func (c *Cache) generateInpaintingKey(req *InpaintingRequest) string {
	data := map[string]interface{}{
		"base_image": req.BaseImage,
		"mask_image": req.MaskImage,
		"prompt":     req.Prompt,
		"strength":   req.Strength,
	}
	
	jsonData, _ := json.Marshal(data)
	hash := md5.Sum(jsonData)
	
	return fmt.Sprintf("ai:inpaint:%s", hex.EncodeToString(hash[:]))
}

// generateStyleTransferKey creates a unique cache key for style transfer requests
func (c *Cache) generateStyleTransferKey(req *StyleTransferRequest) string {
	data := map[string]interface{}{
		"content_image": req.ContentImage,
		"style":         req.Style,
		"strength":      req.Strength,
	}
	
	jsonData, _ := json.Marshal(data)
	hash := md5.Sum(jsonData)
	
	return fmt.Sprintf("ai:style:%s", hex.EncodeToString(hash[:]))
}

// contains checks if a string contains a substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[len(s)-len(substr):] == substr
}