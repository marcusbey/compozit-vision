package furniture

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	
	"compozit-vision/internal/domain/entities"
	"compozit-vision/internal/domain/repositories"
	"compozit-vision/pkg/errors"
)

type furnitureSearchRepository struct {
	db *sqlx.DB
}

// NewFurnitureSearchRepository creates a new search repository instance
func NewFurnitureSearchRepository(db *sqlx.DB) repositories.FurnitureSearchRepository {
	return &furnitureSearchRepository{db: db}
}

func (r *furnitureSearchRepository) SearchFurniture(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchResult, error) {
	startTime := time.Now()
	
	// Set defaults
	filters.SetDefaultPagination()
	filters.SetDefaultSort()
	
	// Use the database function for complex search
	query := `
		SELECT 
			id, name, description, brand_name, category_name,
			price_min, price_max, average_rating, review_count,
			thumbnail_url, style_tags, color_tags, material_tags,
			relevance_score
		FROM search_furniture(
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		)`
	
	args := []interface{}{
		filters.Query,
		convertUUIDsToArray(filters.CategoryIDs),
		convertUUIDsToArray(filters.BrandIDs),
		pq.Array(filters.StyleTags),
		pq.Array(filters.ColorTags),
		pq.Array(filters.MaterialTags),
		filters.MinPrice,
		filters.MaxPrice,
		convertRoomTypesToArray(filters.RoomTypes),
		filters.MinRating,
		string(filters.SortBy),
		filters.Limit,
		filters.Offset,
	}
	
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to execute search query")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		var relevanceScore *float32
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.Description, &item.BrandName, &item.CategoryName,
			&item.PriceMin, &item.PriceMax, &item.AverageRating, &item.ReviewCount,
			&item.ThumbnailURL, pq.Array(&item.StyleTags), pq.Array(&item.ColorTags), 
			pq.Array(&item.MaterialTags), &relevanceScore,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan search result")
		}
		
		item.RelevanceScore = relevanceScore
		items = append(items, item)
	}
	
	// Get total count
	totalCount, err := r.getSearchResultCount(ctx, filters)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get search count")
	}
	
	// Get facets
	facets, err := r.GetSearchFacets(ctx, filters)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get search facets")
	}
	
	// Get search suggestions if query has low results
	suggestions := []string{}
	if len(items) < 3 && filters.Query != nil && *filters.Query != "" {
		suggestions, _ = r.SearchSuggestions(ctx, *filters.Query, 5)
	}
	
	queryTime := time.Since(startTime).Milliseconds()
	
	return &entities.FurnitureSearchResult{
		Items:       items,
		TotalCount:  totalCount,
		Facets:      *facets,
		QueryTime:   queryTime,
		Suggestions: suggestions,
	}, nil
}

func (r *furnitureSearchRepository) SearchSuggestions(ctx context.Context, query string, limit int) ([]string, error) {
	suggestions := []string{}
	
	// Search for similar furniture names
	nameQuery := `
		SELECT DISTINCT name
		FROM furniture_items
		WHERE is_active = true
		AND name ILIKE '%' || $1 || '%'
		ORDER BY similarity(name, $1) DESC
		LIMIT $2`
	
	err := r.db.SelectContext(ctx, &suggestions, nameQuery, query, limit/2)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get name suggestions")
	}
	
	// Search for similar style tags
	if len(suggestions) < limit {
		styleQuery := `
			SELECT DISTINCT unnest(style_tags) as suggestion
			FROM furniture_items
			WHERE is_active = true
			AND EXISTS (
				SELECT 1 FROM unnest(style_tags) as tag
				WHERE tag ILIKE '%' || $1 || '%'
			)
			LIMIT $2`
		
		var styleSuggestions []string
		err = r.db.SelectContext(ctx, &styleSuggestions, styleQuery, query, limit-len(suggestions))
		if err == nil {
			suggestions = append(suggestions, styleSuggestions...)
		}
	}
	
	return suggestions, nil
}

func (r *furnitureSearchRepository) GetSearchFacets(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchFacets, error) {
	facets := &entities.FurnitureSearchFacets{}
	
	// Build base query for facets
	baseQuery := `
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.is_active = true`
	
	// Apply existing filters (except the one we're faceting on)
	conditions := []string{}
	args := []interface{}{}
	argIndex := 1
	
	if filters.Query != nil && *filters.Query != "" {
		conditions = append(conditions, fmt.Sprintf("fi.search_vector @@ plainto_tsquery('english', $%d)", argIndex))
		args = append(args, *filters.Query)
		argIndex++
	}
	
	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " AND " + strings.Join(conditions, " AND ")
	}
	
	// Get category facets
	categoryQuery := `
		SELECT fc.name as label, fc.slug as value, COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND fc.id IS NOT NULL
		GROUP BY fc.id, fc.name, fc.slug
		ORDER BY count DESC
		LIMIT 20`
	
	err := r.db.SelectContext(ctx, &facets.Categories, categoryQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get category facets")
	}
	
	// Get brand facets
	brandQuery := `
		SELECT fb.name as label, fb.slug as value, COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND fb.id IS NOT NULL
		GROUP BY fb.id, fb.name, fb.slug
		ORDER BY count DESC
		LIMIT 20`
	
	err = r.db.SelectContext(ctx, &facets.Brands, brandQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get brand facets")
	}
	
	// Get style facets
	styleQuery := `
		SELECT 
			unnest(style_tags) as label,
			unnest(style_tags) as value,
			COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND array_length(style_tags, 1) > 0
		GROUP BY unnest(style_tags)
		ORDER BY count DESC
		LIMIT 15`
	
	err = r.db.SelectContext(ctx, &facets.Styles, styleQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get style facets")
	}
	
	// Get color facets
	colorQuery := `
		SELECT 
			unnest(color_tags) as label,
			unnest(color_tags) as value,
			COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND array_length(color_tags, 1) > 0
		GROUP BY unnest(color_tags)
		ORDER BY count DESC
		LIMIT 15`
	
	err = r.db.SelectContext(ctx, &facets.Colors, colorQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get color facets")
	}
	
	// Get material facets
	materialQuery := `
		SELECT 
			unnest(material_tags) as label,
			unnest(material_tags) as value,
			COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND array_length(material_tags, 1) > 0
		GROUP BY unnest(material_tags)
		ORDER BY count DESC
		LIMIT 15`
	
	err = r.db.SelectContext(ctx, &facets.Materials, materialQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get material facets")
	}
	
	// Get price range facets
	priceQuery := `
		SELECT 
			MIN((price_range->>'min')::numeric) as min_price,
			MAX((price_range->>'max')::numeric) as max_price
		` + baseQuery + whereClause
	
	var priceData struct {
		MinPrice float64 `db:"min_price"`
		MaxPrice float64 `db:"max_price"`
	}
	
	err = r.db.GetContext(ctx, &priceData, priceQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get price range")
	}
	
	facets.PriceRange = entities.PriceRangeFacet{
		Min: priceData.MinPrice,
		Max: priceData.MaxPrice,
		Ranges: generatePriceRanges(priceData.MinPrice, priceData.MaxPrice),
	}
	
	// Get rating facets
	ratingQuery := `
		SELECT 
			FLOOR(average_rating) as rating,
			COUNT(*)::int as count
		` + baseQuery + whereClause + `
		AND average_rating > 0
		GROUP BY FLOOR(average_rating)
		ORDER BY rating DESC`
	
	err = r.db.SelectContext(ctx, &facets.Ratings, ratingQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rating facets")
	}
	
	return facets, nil
}

func (r *furnitureSearchRepository) GetPersonalizedRecommendations(ctx context.Context, req entities.FurnitureRecommendationRequest) (*entities.FurnitureRecommendationResult, error) {
	// Use the database function for personalized recommendations
	query := `
		SELECT 
			id, name, brand_name, category_name, price,
			average_rating, thumbnail_url, recommendation_score
		FROM get_furniture_recommendations($1, $2, $3)`
	
	var roomType *string
	if req.RoomType != nil {
		roomTypeStr := string(*req.RoomType)
		roomType = &roomTypeStr
	}
	
	rows, err := r.db.QueryxContext(ctx, query, req.UserID, roomType, req.Limit)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get personalized recommendations")
	}
	defer rows.Close()
	
	items := []entities.RecommendedFurnitureItem{}
	for rows.Next() {
		var item entities.RecommendedFurnitureItem
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.BrandName, &item.CategoryName,
			&item.PriceMin, &item.AverageRating, &item.ThumbnailURL,
			&item.RecommendationScore,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan recommendation result")
		}
		
		// Generate recommendation reasons
		item.RecommendationReasons = r.generateRecommendationReasons(ctx, req.UserID, item.ID, item.RecommendationScore)
		
		items = append(items, item)
	}
	
	context := r.buildRecommendationContext(req)
	
	return &entities.FurnitureRecommendationResult{
		Items:                 items,
		RecommendationContext: context,
	}, nil
}

func (r *furnitureSearchRepository) GetSimilarFurniture(ctx context.Context, furnitureID uuid.UUID, limit int) ([]entities.FurnitureItemSummary, error) {
	// Get the source item's attributes
	sourceQuery := `
		SELECT style_tags, color_tags, material_tags, category_id, 
			   price_range->>'min' as min_price, price_range->>'max' as max_price
		FROM furniture_items
		WHERE id = $1 AND is_active = true`
	
	var source struct {
		StyleTags    pq.StringArray `db:"style_tags"`
		ColorTags    pq.StringArray `db:"color_tags"`
		MaterialTags pq.StringArray `db:"material_tags"`
		CategoryID   *uuid.UUID     `db:"category_id"`
		MinPrice     *string        `db:"min_price"`
		MaxPrice     *string        `db:"max_price"`
	}
	
	err := r.db.GetContext(ctx, &source, sourceQuery, furnitureID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get source furniture item")
	}
	
	// Find similar items using vector similarity
	similarQuery := `
		SELECT 
			fi.id, fi.name, fi.slug, fi.description,
			fb.name as brand_name, fc.name as category_name,
			(fi.price_range->>'min')::numeric as price_min,
			(fi.price_range->>'max')::numeric as price_max,
			fi.average_rating, fi.review_count, fi.thumbnail_url,
			fi.style_tags, fi.color_tags, fi.material_tags,
			fi.availability_status, fi.stock_quantity, fi.is_featured,
			(
				-- Calculate similarity score based on shared attributes
				COALESCE(array_length(fi.style_tags & $2, 1), 0) * 0.4 +
				COALESCE(array_length(fi.color_tags & $3, 1), 0) * 0.2 +
				COALESCE(array_length(fi.material_tags & $4, 1), 0) * 0.2 +
				CASE WHEN fi.category_id = $5 THEN 0.2 ELSE 0 END
			)::real as similarity_score
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.id != $1 
		AND fi.is_active = true 
		AND fi.availability_status = 'available'
		AND (
			fi.style_tags && $2 OR
			fi.color_tags && $3 OR
			fi.material_tags && $4 OR
			fi.category_id = $5
		)
		ORDER BY similarity_score DESC, fi.average_rating DESC
		LIMIT $6`
	
	args := []interface{}{
		furnitureID,
		pq.Array(source.StyleTags),
		pq.Array(source.ColorTags),
		pq.Array(source.MaterialTags),
		source.CategoryID,
		limit,
	}
	
	rows, err := r.db.QueryxContext(ctx, similarQuery, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get similar furniture")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		var similarityScore float32
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.Slug, &item.Description,
			&item.BrandName, &item.CategoryName, &item.PriceMin, &item.PriceMax,
			&item.AverageRating, &item.ReviewCount, &item.ThumbnailURL,
			pq.Array(&item.StyleTags), pq.Array(&item.ColorTags), pq.Array(&item.MaterialTags),
			&item.AvailabilityStatus, &item.StockQuantity, &item.IsFeatured,
			&similarityScore,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan similar furniture item")
		}
		
		item.RelevanceScore = &similarityScore
		items = append(items, item)
	}
	
	return items, nil
}

func (r *furnitureSearchRepository) GetTrendingFurniture(ctx context.Context, roomType *entities.RoomType, limit int) ([]entities.FurnitureItemSummary, error) {
	query := `
		SELECT 
			fi.id, fi.name, fi.slug, fi.description,
			fb.name as brand_name, fc.name as category_name,
			(fi.price_range->>'min')::numeric as price_min,
			(fi.price_range->>'max')::numeric as price_max,
			fi.average_rating, fi.review_count, fi.thumbnail_url,
			fi.style_tags, fi.color_tags, fi.material_tags,
			fi.availability_status, fi.stock_quantity, fi.is_featured,
			(fi.view_count * 0.3 + fi.purchase_count * 0.7)::real as trend_score
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.is_active = true 
		AND fi.availability_status = 'available'
		AND fi.created_at > NOW() - INTERVAL '30 days'`
	
	args := []interface{}{}
	argIndex := 1
	
	if roomType != nil {
		query += fmt.Sprintf(` AND EXISTS (
			SELECT 1 FROM furniture_room_compatibility frc
			WHERE frc.furniture_item_id = fi.id
			AND frc.room_type = $%d
		)`, argIndex)
		args = append(args, string(*roomType))
		argIndex++
	}
	
	query += fmt.Sprintf(` ORDER BY trend_score DESC, fi.average_rating DESC LIMIT $%d`, argIndex)
	args = append(args, limit)
	
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get trending furniture")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		var trendScore float32
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.Slug, &item.Description,
			&item.BrandName, &item.CategoryName, &item.PriceMin, &item.PriceMax,
			&item.AverageRating, &item.ReviewCount, &item.ThumbnailURL,
			pq.Array(&item.StyleTags), pq.Array(&item.ColorTags), pq.Array(&item.MaterialTags),
			&item.AvailabilityStatus, &item.StockQuantity, &item.IsFeatured,
			&trendScore,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan trending furniture item")
		}
		
		item.RelevanceScore = &trendScore
		items = append(items, item)
	}
	
	return items, nil
}

func (r *furnitureSearchRepository) GetFeaturedFurniture(ctx context.Context, categoryID *uuid.UUID, limit int) ([]entities.FurnitureItemSummary, error) {
	query := `
		SELECT 
			fi.id, fi.name, fi.slug, fi.description,
			fb.name as brand_name, fc.name as category_name,
			(fi.price_range->>'min')::numeric as price_min,
			(fi.price_range->>'max')::numeric as price_max,
			fi.average_rating, fi.review_count, fi.thumbnail_url,
			fi.style_tags, fi.color_tags, fi.material_tags,
			fi.availability_status, fi.stock_quantity, fi.is_featured
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.is_active = true 
		AND fi.is_featured = true
		AND fi.availability_status = 'available'`
	
	args := []interface{}{}
	argIndex := 1
	
	if categoryID != nil {
		query += fmt.Sprintf(` AND fi.category_id = $%d`, argIndex)
		args = append(args, *categoryID)
		argIndex++
	}
	
	query += fmt.Sprintf(` ORDER BY fi.average_rating DESC, fi.review_count DESC LIMIT $%d`, argIndex)
	args = append(args, limit)
	
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get featured furniture")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.Slug, &item.Description,
			&item.BrandName, &item.CategoryName, &item.PriceMin, &item.PriceMax,
			&item.AverageRating, &item.ReviewCount, &item.ThumbnailURL,
			pq.Array(&item.StyleTags), pq.Array(&item.ColorTags), pq.Array(&item.MaterialTags),
			&item.AvailabilityStatus, &item.StockQuantity, &item.IsFeatured,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan featured furniture item")
		}
		
		items = append(items, item)
	}
	
	return items, nil
}

func (r *furnitureSearchRepository) UpdateViewCount(ctx context.Context, furnitureID uuid.UUID) error {
	query := `UPDATE furniture_items SET view_count = view_count + 1 WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, furnitureID)
	return errors.Wrap(err, "failed to update view count")
}

func (r *furnitureSearchRepository) UpdatePurchaseCount(ctx context.Context, furnitureID uuid.UUID) error {
	query := `UPDATE furniture_items SET purchase_count = purchase_count + 1 WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query, furnitureID)
	return errors.Wrap(err, "failed to update purchase count")
}

func (r *furnitureSearchRepository) GetPopularFurniture(ctx context.Context, timeframe string, limit int) ([]entities.FurnitureItemSummary, error) {
	// This would implement popular furniture based on timeframe
	// For now, return based on all-time popularity
	return r.GetFeaturedFurniture(ctx, nil, limit)
}

func (r *furnitureSearchRepository) CheckRoomCompatibility(ctx context.Context, furnitureID uuid.UUID, roomDimensions entities.RoomDimensions, roomType entities.RoomType) (*entities.FurnitureCompatibilityCheck, error) {
	// Get furniture dimensions and compatibility rules
	query := `
		SELECT 
			fi.dimensions,
			frc.min_room_dimensions,
			frc.placement_rules,
			frc.suitability_score,
			frc.placement_notes
		FROM furniture_items fi
		LEFT JOIN furniture_room_compatibility frc ON fi.id = frc.furniture_item_id AND frc.room_type = $2
		WHERE fi.id = $1 AND fi.is_active = true`
	
	var compatibility struct {
		FurnitureDimensions string  `db:"dimensions"`
		MinRoomDimensions   *string `db:"min_room_dimensions"`
		PlacementRules      *string `db:"placement_rules"`
		SuitabilityScore    *int    `db:"suitability_score"`
		PlacementNotes      *string `db:"placement_notes"`
	}
	
	err := r.db.GetContext(ctx, &compatibility, query, furnitureID, string(roomType))
	if err != nil {
		return nil, errors.Wrap(err, "failed to get furniture compatibility data")
	}
	
	// Parse dimensions
	var furnitureDims entities.FurnitureDimensions
	err = json.Unmarshal([]byte(compatibility.FurnitureDimensions), &furnitureDims)
	if err != nil {
		return nil, errors.Wrap(err, "failed to parse furniture dimensions")
	}
	
	// Calculate basic compatibility
	compatibilityScore := 100
	issues := []entities.CompatibilityIssue{}
	suggestions := []entities.CompatibilitySuggestion{}
	
	// Check if furniture fits in room
	if furnitureDims.Length > roomDimensions.Length {
		compatibilityScore -= 30
		issues = append(issues, entities.CompatibilityIssue{
			Type:        entities.IssueTypeTooBig,
			Description: fmt.Sprintf("Furniture length (%.0fcm) exceeds room length (%.0fcm)", furnitureDims.Length, roomDimensions.Length),
			Severity:    entities.SeverityCritical,
		})
	}
	
	if furnitureDims.Width > roomDimensions.Width {
		compatibilityScore -= 30
		issues = append(issues, entities.CompatibilityIssue{
			Type:        entities.IssueTypeTooBig,
			Description: fmt.Sprintf("Furniture width (%.0fcm) exceeds room width (%.0fcm)", furnitureDims.Width, roomDimensions.Width),
			Severity:    entities.SeverityCritical,
		})
	}
	
	if furnitureDims.Height > roomDimensions.Height {
		compatibilityScore -= 20
		issues = append(issues, entities.CompatibilityIssue{
			Type:        entities.IssueTypeTooTall,
			Description: fmt.Sprintf("Furniture height (%.0fcm) exceeds room height (%.0fcm)", furnitureDims.Height, roomDimensions.Height),
			Severity:    entities.SeverityHigh,
		})
	}
	
	// Use database-stored suitability score if available
	if compatibility.SuitabilityScore != nil {
		compatibilityScore = *compatibility.SuitabilityScore
	}
	
	// Generate placement options
	placementOptions := r.generatePlacementOptions(furnitureDims, roomDimensions, roomType)
	
	return &entities.FurnitureCompatibilityCheck{
		FurnitureID:       furnitureID,
		RoomDimensions:    roomDimensions,
		RoomType:          roomType,
		CompatibilityScore: compatibilityScore,
		Issues:            issues,
		Suggestions:       suggestions,
		PlacementOptions:  placementOptions,
	}, nil
}

func (r *furnitureSearchRepository) GetRoomSuitableFurniture(ctx context.Context, roomDimensions entities.RoomDimensions, roomType entities.RoomType, filters entities.FurnitureSearchFilters) ([]entities.FurnitureItemSummary, error) {
	query := `
		SELECT DISTINCT
			fi.id, fi.name, fi.slug, fi.description,
			fb.name as brand_name, fc.name as category_name,
			(fi.price_range->>'min')::numeric as price_min,
			(fi.price_range->>'max')::numeric as price_max,
			fi.average_rating, fi.review_count, fi.thumbnail_url,
			fi.style_tags, fi.color_tags, fi.material_tags,
			fi.availability_status, fi.stock_quantity, fi.is_featured,
			COALESCE(frc.suitability_score, 50)::real as suitability_score
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		LEFT JOIN furniture_room_compatibility frc ON fi.id = frc.furniture_item_id AND frc.room_type = $1
		WHERE fi.is_active = true 
		AND fi.availability_status = 'available'
		-- Check if furniture fits in room
		AND (fi.dimensions->>'length')::numeric <= $2
		AND (fi.dimensions->>'width')::numeric <= $3
		AND (fi.dimensions->>'height')::numeric <= $4
		ORDER BY suitability_score DESC, fi.average_rating DESC
		LIMIT $5`
	
	rows, err := r.db.QueryxContext(ctx, query, 
		string(roomType),
		roomDimensions.Length,
		roomDimensions.Width,
		roomDimensions.Height,
		filters.Limit,
	)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get room suitable furniture")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		var suitabilityScore float32
		
		err := rows.Scan(
			&item.ID, &item.Name, &item.Slug, &item.Description,
			&item.BrandName, &item.CategoryName, &item.PriceMin, &item.PriceMax,
			&item.AverageRating, &item.ReviewCount, &item.ThumbnailURL,
			pq.Array(&item.StyleTags), pq.Array(&item.ColorTags), pq.Array(&item.MaterialTags),
			&item.AvailabilityStatus, &item.StockQuantity, &item.IsFeatured,
			&suitabilityScore,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan suitable furniture item")
		}
		
		item.RelevanceScore = &suitabilityScore
		items = append(items, item)
	}
	
	return items, nil
}

// Helper methods

func (r *furnitureSearchRepository) getSearchResultCount(ctx context.Context, filters entities.FurnitureSearchFilters) (int, error) {
	// Simplified count query - in production this would match the search query exactly
	query := `SELECT COUNT(*) FROM furniture_items WHERE is_active = true`
	
	var count int
	err := r.db.GetContext(ctx, &count, query)
	return count, err
}

func (r *furnitureSearchRepository) generateRecommendationReasons(ctx context.Context, userID uuid.UUID, furnitureID uuid.UUID, score float32) []entities.RecommendationReason {
	// This would analyze why an item was recommended
	reasons := []entities.RecommendationReason{}
	
	if score > 0.8 {
		reasons = append(reasons, entities.RecommendationReason{
			Type:        entities.ReasonStyleMatch,
			Description: "Matches your preferred style",
			Score:       score * 0.3,
		})
	}
	
	if score > 0.6 {
		reasons = append(reasons, entities.RecommendationReason{
			Type:        entities.ReasonHighRating,
			Description: "Highly rated by customers",
			Score:       score * 0.2,
		})
	}
	
	return reasons
}

func (r *furnitureSearchRepository) buildRecommendationContext(req entities.FurnitureRecommendationRequest) string {
	context := "Personalized recommendations"
	
	if req.RoomType != nil {
		context += fmt.Sprintf(" for %s", strings.ReplaceAll(string(*req.RoomType), "_", " "))
	}
	
	if len(req.StyleHints) > 0 {
		context += fmt.Sprintf(" with %s style", strings.Join(req.StyleHints, " and "))
	}
	
	return context
}

func (r *furnitureSearchRepository) generatePlacementOptions(furnitureDims entities.FurnitureDimensions, roomDims entities.RoomDimensions, roomType entities.RoomType) []entities.PlacementOption {
	options := []entities.PlacementOption{}
	
	// Center placement
	if furnitureDims.Length < roomDims.Length*0.8 && furnitureDims.Width < roomDims.Width*0.8 {
		options = append(options, entities.PlacementOption{
			Name:        "Center",
			Description: "Centered in the room",
			Score:       85,
			XPosition:   roomDims.Length / 2,
			YPosition:   roomDims.Width / 2,
			Rotation:    0,
			TrafficFlow: 90,
		})
	}
	
	// Against wall placement
	if furnitureDims.Width < roomDims.Width*0.9 {
		options = append(options, entities.PlacementOption{
			Name:        "Against Wall",
			Description: "Placed against the main wall",
			Score:       80,
			XPosition:   furnitureDims.Length / 2,
			YPosition:   roomDims.Width - furnitureDims.Width/2,
			Rotation:    0,
			TrafficFlow: 85,
		})
	}
	
	return options
}

func generatePriceRanges(min, max float64) []entities.PriceRangeOption {
	ranges := []entities.PriceRangeOption{}
	
	if max-min < 1000 {
		// Small range, create fewer buckets
		buckets := [][]float64{{min, max}}
		for _, bucket := range buckets {
			ranges = append(ranges, entities.PriceRangeOption{
				Label: fmt.Sprintf("$%.0f - $%.0f", bucket[0], bucket[1]),
				Min:   bucket[0],
				Max:   bucket[1],
				Count: 0, // Would be calculated from actual data
			})
		}
	} else {
		// Create logarithmic price ranges
		step := (max - min) / 5
		for i := 0; i < 5; i++ {
			rangeMin := min + float64(i)*step
			rangeMax := min + float64(i+1)*step
			if i == 4 {
				rangeMax = max
			}
			ranges = append(ranges, entities.PriceRangeOption{
				Label: fmt.Sprintf("$%.0f - $%.0f", rangeMin, rangeMax),
				Min:   rangeMin,
				Max:   rangeMax,
				Count: 0, // Would be calculated from actual data
			})
		}
	}
	
	return ranges
}

func convertUUIDsToArray(uuids []uuid.UUID) interface{} {
	if len(uuids) == 0 {
		return nil
	}
	return pq.Array(uuids)
}

func convertRoomTypesToArray(roomTypes []entities.RoomType) interface{} {
	if len(roomTypes) == 0 {
		return nil
	}
	
	strings := make([]string, len(roomTypes))
	for i, rt := range roomTypes {
		strings[i] = string(rt)
	}
	return pq.Array(strings)
}