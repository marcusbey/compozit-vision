package furniture

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"compozit-vision/internal/domain/entities"
	"compozit-vision/internal/domain/repositories"
	"compozit-vision/pkg/errors"
)

type FurnitureHandler struct {
	furnitureRepo repositories.FurnitureRepository
	searchRepo    repositories.FurnitureSearchRepository
	userRepo      repositories.UserFurnitureRepository
}

func NewFurnitureHandler(
	furnitureRepo repositories.FurnitureRepository,
	searchRepo repositories.FurnitureSearchRepository,
	userRepo repositories.UserFurnitureRepository,
) *FurnitureHandler {
	return &FurnitureHandler{
		furnitureRepo: furnitureRepo,
		searchRepo:    searchRepo,
		userRepo:      userRepo,
	}
}

// Search and Discovery Endpoints

// SearchFurniture handles advanced furniture search with filters
// @Summary Search furniture items
// @Description Search furniture with advanced filters and sorting options
// @Tags furniture
// @Accept json
// @Produce json
// @Param query query string false "Search query"
// @Param category_ids query []string false "Category IDs to filter by"
// @Param brand_ids query []string false "Brand IDs to filter by"
// @Param style_tags query []string false "Style tags to filter by"
// @Param color_tags query []string false "Color tags to filter by"
// @Param material_tags query []string false "Material tags to filter by"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param room_types query []string false "Room types"
// @Param min_rating query number false "Minimum rating"
// @Param sort_by query string false "Sort by (relevance, price_low, price_high, rating, popularity, newest)"
// @Param limit query int false "Limit results" default(20)
// @Param offset query int false "Offset results" default(0)
// @Success 200 {object} entities.FurnitureSearchResult
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/search [get]
func (h *FurnitureHandler) SearchFurniture(c *gin.Context) {
	filters := entities.FurnitureSearchFilters{}
	
	// Parse query parameters
	if query := c.Query("query"); query != "" {
		filters.Query = &query
	}
	
	// Parse UUIDs for categories and brands
	if categoryIDsStr := c.Query("category_ids"); categoryIDsStr != "" {
		categoryIDs, err := parseUUIDs(categoryIDsStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid category IDs"))
			return
		}
		filters.CategoryIDs = categoryIDs
	}
	
	if brandIDsStr := c.Query("brand_ids"); brandIDsStr != "" {
		brandIDs, err := parseUUIDs(brandIDsStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid brand IDs"))
			return
		}
		filters.BrandIDs = brandIDs
	}
	
	// Parse string arrays
	filters.StyleTags = parseStringArray(c.Query("style_tags"))
	filters.ColorTags = parseStringArray(c.Query("color_tags"))
	filters.MaterialTags = parseStringArray(c.Query("material_tags"))
	
	// Parse room types
	if roomTypesStr := c.Query("room_types"); roomTypesStr != "" {
		roomTypes := []entities.RoomType{}
		for _, rtStr := range parseStringArray(roomTypesStr) {
			roomTypes = append(roomTypes, entities.RoomType(rtStr))
		}
		filters.RoomTypes = roomTypes
	}
	
	// Parse price filters
	if minPriceStr := c.Query("min_price"); minPriceStr != "" {
		minPrice, err := strconv.ParseFloat(minPriceStr, 64)
		if err == nil {
			filters.MinPrice = &minPrice
		}
	}
	
	if maxPriceStr := c.Query("max_price"); maxPriceStr != "" {
		maxPrice, err := strconv.ParseFloat(maxPriceStr, 64)
		if err == nil {
			filters.MaxPrice = &maxPrice
		}
	}
	
	// Parse rating filter
	if minRatingStr := c.Query("min_rating"); minRatingStr != "" {
		minRating, err := strconv.ParseFloat(minRatingStr, 64)
		if err == nil {
			filters.MinRating = &minRating
		}
	}
	
	// Parse boolean filters
	filters.InStockOnly = c.Query("in_stock_only") == "true"
	filters.FeaturedOnly = c.Query("featured_only") == "true"
	filters.HasImages = c.Query("has_images") == "true"
	filters.Has3DModel = c.Query("has_3d_model") == "true"
	filters.OnSaleOnly = c.Query("on_sale_only") == "true"
	
	// Parse sorting
	if sortBy := c.Query("sort_by"); sortBy != "" {
		filters.SortBy = entities.FurnitureSortBy(sortBy)
	}
	
	// Parse pagination
	if limitStr := c.Query("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err == nil && limit > 0 {
			filters.Limit = limit
		}
	}
	if filters.Limit == 0 {
		filters.Limit = 20
	}
	
	if offsetStr := c.Query("offset"); offsetStr != "" {
		offset, err := strconv.Atoi(offsetStr)
		if err == nil && offset >= 0 {
			filters.Offset = offset
		}
	}
	
	// Execute search
	result, err := h.searchRepo.SearchFurniture(c.Request.Context(), filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Search failed"))
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetFurnitureItem gets a single furniture item by ID
// @Summary Get furniture item by ID
// @Description Get detailed information about a furniture item
// @Tags furniture
// @Produce json
// @Param id path string true "Furniture Item ID"
// @Success 200 {object} entities.FurnitureItem
// @Failure 400 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/item/{id} [get]
func (h *FurnitureHandler) GetFurnitureItem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid furniture ID"))
		return
	}
	
	// Track view
	if userID := getUserIDFromContext(c); userID != uuid.Nil {
		go h.searchRepo.UpdateViewCount(c.Request.Context(), id)
		go h.trackUserInteraction(c.Request.Context(), userID, id, entities.InteractionTypeView)
	}
	
	item, err := h.furnitureRepo.GetFurnitureItemByID(c.Request.Context(), id)
	if err != nil {
		if errors.IsNotFound(err) {
			c.JSON(http.StatusNotFound, errors.NewNotFoundError("Furniture item not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get furniture item"))
		return
	}
	
	c.JSON(http.StatusOK, item)
}

// GetFurnitureItemBySlug gets a single furniture item by slug
// @Summary Get furniture item by slug
// @Description Get detailed information about a furniture item using its slug
// @Tags furniture
// @Produce json
// @Param slug path string true "Furniture Item Slug"
// @Success 200 {object} entities.FurnitureItem
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/item/slug/{slug} [get]
func (h *FurnitureHandler) GetFurnitureItemBySlug(c *gin.Context) {
	slug := c.Param("slug")
	
	item, err := h.furnitureRepo.GetFurnitureItemBySlug(c.Request.Context(), slug)
	if err != nil {
		if errors.IsNotFound(err) {
			c.JSON(http.StatusNotFound, errors.NewNotFoundError("Furniture item not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get furniture item"))
		return
	}
	
	// Track view
	if userID := getUserIDFromContext(c); userID != uuid.Nil {
		go h.searchRepo.UpdateViewCount(c.Request.Context(), item.ID)
		go h.trackUserInteraction(c.Request.Context(), userID, item.ID, entities.InteractionTypeView)
	}
	
	c.JSON(http.StatusOK, item)
}

// GetCategories returns the furniture category hierarchy
// @Summary Get furniture categories
// @Description Get hierarchical list of furniture categories
// @Tags furniture
// @Produce json
// @Param parent_id query string false "Parent Category ID"
// @Success 200 {array} entities.FurnitureCategory
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/categories [get]
func (h *FurnitureHandler) GetCategories(c *gin.Context) {
	var parentID *uuid.UUID
	if parentIDStr := c.Query("parent_id"); parentIDStr != "" {
		if id, err := uuid.Parse(parentIDStr); err == nil {
			parentID = &id
		}
	}
	
	var categories []entities.FurnitureCategory
	var err error
	
	if parentID == nil && c.Query("hierarchy") == "true" {
		categories, err = h.furnitureRepo.GetCategoryHierarchy(c.Request.Context())
	} else {
		categories, err = h.furnitureRepo.ListFurnitureCategories(c.Request.Context(), parentID)
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get categories"))
		return
	}
	
	c.JSON(http.StatusOK, categories)
}

// GetBrands returns furniture brands
// @Summary Get furniture brands
// @Description Get list of furniture brands
// @Tags furniture
// @Produce json
// @Param limit query int false "Limit results" default(50)
// @Param offset query int false "Offset results" default(0)
// @Success 200 {object} ListBrandsResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/brands [get]
func (h *FurnitureHandler) GetBrands(c *gin.Context) {
	limit := 50
	offset := 0
	
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}
	
	brands, total, err := h.furnitureRepo.ListFurnitureBrands(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get brands"))
		return
	}
	
	response := ListBrandsResponse{
		Brands:     brands,
		Total:      total,
		Limit:      limit,
		Offset:     offset,
	}
	
	c.JSON(http.StatusOK, response)
}

// Recommendation Endpoints

// GetRecommendations gets personalized furniture recommendations
// @Summary Get personalized recommendations
// @Description Get furniture recommendations based on user preferences
// @Tags furniture
// @Produce json
// @Param room_type query string false "Room type"
// @Param limit query int false "Limit results" default(10)
// @Success 200 {object} entities.FurnitureRecommendationResult
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/recommendations [get]
func (h *FurnitureHandler) GetRecommendations(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, errors.NewUnauthorizedError("Authentication required"))
		return
	}
	
	req := entities.FurnitureRecommendationRequest{
		UserID: userID,
		Limit:  10,
	}
	
	// Parse room type
	if roomTypeStr := c.Query("room_type"); roomTypeStr != "" {
		roomType := entities.RoomType(roomTypeStr)
		req.RoomType = &roomType
	}
	
	// Parse limit
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			req.Limit = limit
		}
	}
	
	recommendations, err := h.searchRepo.GetPersonalizedRecommendations(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get recommendations"))
		return
	}
	
	c.JSON(http.StatusOK, recommendations)
}

// GetSimilarFurniture gets furniture similar to a given item
// @Summary Get similar furniture
// @Description Get furniture items similar to the specified item
// @Tags furniture
// @Produce json
// @Param id path string true "Furniture Item ID"
// @Param limit query int false "Limit results" default(10)
// @Success 200 {array} entities.FurnitureItemSummary
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/similar/{id} [get]
func (h *FurnitureHandler) GetSimilarFurniture(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid furniture ID"))
		return
	}
	
	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	similar, err := h.searchRepo.GetSimilarFurniture(c.Request.Context(), id, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get similar furniture"))
		return
	}
	
	c.JSON(http.StatusOK, similar)
}

// GetTrendingFurniture gets trending furniture items
// @Summary Get trending furniture
// @Description Get currently trending furniture items
// @Tags furniture
// @Produce json
// @Param room_type query string false "Room type filter"
// @Param limit query int false "Limit results" default(20)
// @Success 200 {array} entities.FurnitureItemSummary
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/trending [get]
func (h *FurnitureHandler) GetTrendingFurniture(c *gin.Context) {
	var roomType *entities.RoomType
	if roomTypeStr := c.Query("room_type"); roomTypeStr != "" {
		rt := entities.RoomType(roomTypeStr)
		roomType = &rt
	}
	
	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	trending, err := h.searchRepo.GetTrendingFurniture(c.Request.Context(), roomType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get trending furniture"))
		return
	}
	
	c.JSON(http.StatusOK, trending)
}

// GetFeaturedFurniture gets featured furniture items
// @Summary Get featured furniture
// @Description Get featured furniture items
// @Tags furniture
// @Produce json
// @Param category_id query string false "Category ID filter"
// @Param limit query int false "Limit results" default(20)
// @Success 200 {array} entities.FurnitureItemSummary
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/featured [get]
func (h *FurnitureHandler) GetFeaturedFurniture(c *gin.Context) {
	var categoryID *uuid.UUID
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if id, err := uuid.Parse(categoryIDStr); err == nil {
			categoryID = &id
		}
	}
	
	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	featured, err := h.searchRepo.GetFeaturedFurniture(c.Request.Context(), categoryID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get featured furniture"))
		return
	}
	
	c.JSON(http.StatusOK, featured)
}

// Room Compatibility Endpoints

// CheckRoomCompatibility checks if furniture fits in a room
// @Summary Check room compatibility
// @Description Check if a furniture item is compatible with room dimensions
// @Tags furniture
// @Accept json
// @Produce json
// @Param id path string true "Furniture Item ID"
// @Param request body CheckCompatibilityRequest true "Room dimensions and type"
// @Success 200 {object} entities.FurnitureCompatibilityCheck
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/compatibility/{id} [post]
func (h *FurnitureHandler) CheckRoomCompatibility(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid furniture ID"))
		return
	}
	
	var req CheckCompatibilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid request body"))
		return
	}
	
	compatibility, err := h.searchRepo.CheckRoomCompatibility(
		c.Request.Context(),
		id,
		req.RoomDimensions,
		req.RoomType,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to check compatibility"))
		return
	}
	
	c.JSON(http.StatusOK, compatibility)
}

// GetRoomSuitableFurniture gets furniture suitable for room dimensions
// @Summary Get room suitable furniture
// @Description Get furniture that fits within specified room dimensions
// @Tags furniture
// @Accept json
// @Produce json
// @Param request body GetRoomSuitableRequest true "Room specifications"
// @Success 200 {array} entities.FurnitureItemSummary
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/room-suitable [post]
func (h *FurnitureHandler) GetRoomSuitableFurniture(c *gin.Context) {
	var req GetRoomSuitableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid request body"))
		return
	}
	
	// Set default filters if not provided
	if req.Filters.Limit == 0 {
		req.Filters.Limit = 20
	}
	
	suitable, err := h.searchRepo.GetRoomSuitableFurniture(
		c.Request.Context(),
		req.RoomDimensions,
		req.RoomType,
		req.Filters,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get suitable furniture"))
		return
	}
	
	c.JSON(http.StatusOK, suitable)
}

// User Interaction Endpoints

// AddToWishlist adds furniture to user's wishlist
// @Summary Add to wishlist
// @Description Add a furniture item to user's wishlist
// @Tags furniture
// @Accept json
// @Produce json
// @Param request body AddToWishlistRequest true "Wishlist item"
// @Success 201 {object} SuccessResponse
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/wishlist [post]
func (h *FurnitureHandler) AddToWishlist(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, errors.NewUnauthorizedError("Authentication required"))
		return
	}
	
	var req AddToWishlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid request body"))
		return
	}
	
	wishlistItem := &entities.UserFurnitureWishlist{
		ID:              uuid.New(),
		UserID:          userID,
		FurnitureItemID: req.FurnitureItemID,
		VariationID:     req.VariationID,
		Notes:           req.Notes,
		Priority:        req.Priority,
	}
	
	err := h.userRepo.AddToWishlist(c.Request.Context(), wishlistItem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to add to wishlist"))
		return
	}
	
	// Track user interaction
	go h.trackUserInteraction(c.Request.Context(), userID, req.FurnitureItemID, entities.InteractionTypeSave)
	
	c.JSON(http.StatusCreated, SuccessResponse{
		Message: "Item added to wishlist",
		Data:    map[string]interface{}{"wishlist_id": wishlistItem.ID},
	})
}

// GetWishlist gets user's wishlist
// @Summary Get user wishlist
// @Description Get user's furniture wishlist
// @Tags furniture
// @Produce json
// @Param limit query int false "Limit results" default(20)
// @Param offset query int false "Offset results" default(0)
// @Success 200 {object} GetWishlistResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/wishlist [get]
func (h *FurnitureHandler) GetWishlist(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, errors.NewUnauthorizedError("Authentication required"))
		return
	}
	
	limit := 20
	offset := 0
	
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}
	
	wishlist, total, err := h.userRepo.GetUserWishlist(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to get wishlist"))
		return
	}
	
	response := GetWishlistResponse{
		Items:  wishlist,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}
	
	c.JSON(http.StatusOK, response)
}

// RemoveFromWishlist removes item from user's wishlist
// @Summary Remove from wishlist
// @Description Remove a furniture item from user's wishlist
// @Tags furniture
// @Param furniture_id path string true "Furniture Item ID"
// @Param variation_id query string false "Variation ID"
// @Success 200 {object} SuccessResponse
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /api/furniture/wishlist/{furniture_id} [delete]
func (h *FurnitureHandler) RemoveFromWishlist(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == uuid.Nil {
		c.JSON(http.StatusUnauthorized, errors.NewUnauthorizedError("Authentication required"))
		return
	}
	
	furnitureIDStr := c.Param("furniture_id")
	furnitureID, err := uuid.Parse(furnitureIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, errors.NewBadRequestError("Invalid furniture ID"))
		return
	}
	
	var variationID *uuid.UUID
	if variationIDStr := c.Query("variation_id"); variationIDStr != "" {
		if id, err := uuid.Parse(variationIDStr); err == nil {
			variationID = &id
		}
	}
	
	err = h.userRepo.RemoveFromWishlist(c.Request.Context(), userID, furnitureID, variationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errors.NewInternalServerError("Failed to remove from wishlist"))
		return
	}
	
	c.JSON(http.StatusOK, SuccessResponse{
		Message: "Item removed from wishlist",
	})
}

// Helper methods

func (h *FurnitureHandler) trackUserInteraction(ctx context.Context, userID, furnitureID uuid.UUID, interactionType entities.InteractionType) {
	interaction := &entities.UserFurnitureInteraction{
		ID:               uuid.New(),
		UserID:           userID,
		FurnitureItemID:  furnitureID,
		InteractionType:  interactionType,
		InteractionData:  map[string]interface{}{"timestamp": time.Now()},
	}
	
	h.userRepo.CreateUserInteraction(ctx, interaction)
}

func getUserIDFromContext(c *gin.Context) uuid.UUID {
	if userIDStr, exists := c.Get("user_id"); exists {
		if userID, ok := userIDStr.(string); ok {
			if id, err := uuid.Parse(userID); err == nil {
				return id
			}
		}
	}
	return uuid.Nil
}

func parseUUIDs(input string) ([]uuid.UUID, error) {
	if input == "" {
		return nil, nil
	}
	
	parts := strings.Split(input, ",")
	uuids := make([]uuid.UUID, 0, len(parts))
	
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		
		id, err := uuid.Parse(part)
		if err != nil {
			return nil, err
		}
		uuids = append(uuids, id)
	}
	
	return uuids, nil
}

func parseStringArray(input string) []string {
	if input == "" {
		return nil
	}
	
	parts := strings.Split(input, ",")
	result := make([]string, 0, len(parts))
	
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	
	return result
}

// Response types

type ListBrandsResponse struct {
	Brands []entities.FurnitureBrand `json:"brands"`
	Total  int                       `json:"total"`
	Limit  int                       `json:"limit"`
	Offset int                       `json:"offset"`
}

type GetWishlistResponse struct {
	Items  []entities.UserFurnitureWishlist `json:"items"`
	Total  int                              `json:"total"`
	Limit  int                              `json:"limit"`
	Offset int                              `json:"offset"`
}

type SuccessResponse struct {
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data,omitempty"`
}

// Request types

type CheckCompatibilityRequest struct {
	RoomDimensions entities.RoomDimensions `json:"room_dimensions" binding:"required"`
	RoomType       entities.RoomType       `json:"room_type" binding:"required"`
}

type GetRoomSuitableRequest struct {
	RoomDimensions entities.RoomDimensions        `json:"room_dimensions" binding:"required"`
	RoomType       entities.RoomType              `json:"room_type" binding:"required"`
	Filters        entities.FurnitureSearchFilters `json:"filters"`
}

type AddToWishlistRequest struct {
	FurnitureItemID uuid.UUID  `json:"furniture_item_id" binding:"required"`
	VariationID     *uuid.UUID `json:"variation_id,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
	Priority        int        `json:"priority"`
}