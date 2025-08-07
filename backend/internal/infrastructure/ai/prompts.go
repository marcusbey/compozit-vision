package ai

import (
	"fmt"
	"strings"
)

// PromptBuilder builds optimized prompts for AI rendering
type PromptBuilder struct {
	stylePrompts map[StyleType]string
}

// NewPromptBuilder creates a new prompt builder
func NewPromptBuilder() *PromptBuilder {
	return &PromptBuilder{
		stylePrompts: initializeStylePrompts(),
	}
}

// BuildRoomPrompt creates a detailed prompt for room rendering
func (pb *PromptBuilder) BuildRoomPrompt(components PromptComponents) string {
	var parts []string

	// Base description
	parts = append(parts, fmt.Sprintf("A photorealistic interior design visualization of a %s", components.RoomType))

	// Style description
	if styleDesc, ok := pb.stylePrompts[StyleType(components.DesiredStyle)]; ok {
		parts = append(parts, styleDesc)
	}

	// Furniture and elements
	if len(components.FurnitureItems) > 0 {
		parts = append(parts, fmt.Sprintf("featuring %s", strings.Join(components.FurnitureItems, ", ")))
	}

	// Color scheme
	if len(components.ColorScheme) > 0 {
		parts = append(parts, fmt.Sprintf("with a %s color palette", strings.Join(components.ColorScheme, " and ")))
	}

	// Lighting
	if components.Lighting != "" {
		parts = append(parts, fmt.Sprintf("illuminated by %s", components.Lighting))
	}

	// Additional details
	if len(components.Additional) > 0 {
		parts = append(parts, strings.Join(components.Additional, ". "))
	}

	// Quality modifiers
	parts = append(parts, "8k resolution, highly detailed, professional architectural photography, interior design magazine quality")

	return strings.Join(parts, ", ")
}

// BuildInpaintingPrompt creates a prompt for furniture placement via inpainting
func (pb *PromptBuilder) BuildInpaintingPrompt(furnitureType string, style StyleType, context string) string {
	styleDesc := pb.stylePrompts[style]
	
	return fmt.Sprintf(
		"A %s in %s, seamlessly integrated into the existing room, maintaining consistent lighting and perspective, %s",
		furnitureType,
		styleDesc,
		context,
	)
}

// BuildNegativePrompt creates negative prompts to avoid common issues
func (pb *PromptBuilder) BuildNegativePrompt() string {
	return "blurry, distorted, unrealistic proportions, bad perspective, watermark, text, " +
		"low quality, amateur, CGI, artificial lighting, oversaturated, underexposed, " +
		"cluttered, messy, incomplete furniture, floating objects"
}

// BuildStyleTransferPrompt creates prompts for style transfer
func (pb *PromptBuilder) BuildStyleTransferPrompt(currentRoom string, targetStyle StyleType) string {
	styleDesc := pb.stylePrompts[targetStyle]
	
	return fmt.Sprintf(
		"Transform this %s into %s, maintaining the room layout and structure but updating " +
		"furniture, materials, colors, and decorative elements to match the new style. " +
		"Keep architectural features intact. Professional interior design quality.",
		currentRoom,
		styleDesc,
	)
}

// initializeStylePrompts creates style-specific prompt descriptions
func initializeStylePrompts() map[StyleType]string {
	return map[StyleType]string{
		StyleModern: "modern style with clean lines, neutral colors, minimalist furniture, " +
			"sleek materials like glass and metal, geometric shapes",
		
		StyleMinimalist: "minimalist design with extreme simplicity, monochromatic color scheme, " +
			"essential furniture only, lots of negative space, functional aesthetics",
		
		StyleScandinavian: "Scandinavian style with light wood furniture, white walls, " +
			"cozy textiles, natural materials, hygge atmosphere, soft neutral colors",
		
		StyleIndustrial: "industrial design with exposed brick, metal fixtures, " +
			"reclaimed wood, concrete elements, Edison bulb lighting, raw materials",
		
		StyleBohemian: "bohemian style with eclectic mix of patterns, vibrant colors, " +
			"vintage furniture, plants, tapestries, layered textiles, artistic elements",
		
		StyleTraditional: "traditional style with classic furniture, rich wood tones, " +
			"ornate details, formal symmetry, elegant fabrics, warm color palette",
		
		StyleContemporary: "contemporary design with current trends, mixed materials, " +
			"bold accents, comfortable furniture, balanced proportions, sophisticated palette",
		
		StyleRustic: "rustic style with natural wood, stone elements, warm earthy tones, " +
			"vintage accessories, cozy atmosphere, handcrafted furniture, organic textures",
	}
}

// OptimizePromptForModel adjusts prompt based on the AI model being used
func (pb *PromptBuilder) OptimizePromptForModel(prompt string, modelType string) string {
	switch modelType {
	case "stable-diffusion-xl":
		// SDXL performs better with more detailed, structured prompts
		return prompt + ", masterpiece, best quality, ultra-detailed"
	
	case "stable-diffusion-v1-5":
		// SD 1.5 needs more concise prompts
		if len(prompt) > 200 {
			// Truncate and keep most important parts
			parts := strings.Split(prompt, ",")
			if len(parts) > 10 {
				parts = parts[:10]
			}
			return strings.Join(parts, ",")
		}
		return prompt
	
	case "midjourney":
		// Midjourney style formatting
		return prompt + " --ar 16:9 --v 6 --style raw"
	
	default:
		return prompt
	}
}

// ExtractFurnitureContext analyzes room image to understand existing context
func (pb *PromptBuilder) ExtractFurnitureContext(roomAnalysis map[string]interface{}) string {
	var context []string
	
	if lighting, ok := roomAnalysis["lighting"].(string); ok {
		context = append(context, fmt.Sprintf("matching the %s lighting", lighting))
	}
	
	if flooring, ok := roomAnalysis["flooring"].(string); ok {
		context = append(context, fmt.Sprintf("complementing the %s flooring", flooring))
	}
	
	if colors, ok := roomAnalysis["dominant_colors"].([]string); ok && len(colors) > 0 {
		context = append(context, fmt.Sprintf("harmonizing with %s tones", strings.Join(colors[:2], " and ")))
	}
	
	return strings.Join(context, ", ")
}