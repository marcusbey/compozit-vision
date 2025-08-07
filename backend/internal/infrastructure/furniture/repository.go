package furniture

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/jmoiron/sqlx"
	
	"compozit-vision/internal/domain/entities"
	"compozit-vision/internal/domain/repositories"
	"compozit-vision/pkg/errors"
)

type furnitureRepository struct {
	db *sqlx.DB
}

// NewFurnitureRepository creates a new furniture repository instance
func NewFurnitureRepository(db *sqlx.DB) repositories.FurnitureRepository {
	return &furnitureRepository{db: db}
}

// Furniture Items CRUD

func (r *furnitureRepository) CreateFurnitureItem(ctx context.Context, item *entities.FurnitureItem) error {
	if item.ID == uuid.Nil {
		item.ID = uuid.New()
	}
	
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	
	query := `
		INSERT INTO furniture_items (
			id, sku, name, slug, description, brand_id, category_id, 
			style_tags, color_tags, material_tags, dimensions, price_range,
			features, care_instructions, assembly_required, assembly_time_minutes,
			availability_status, stock_quantity, lead_time_days, images, 
			thumbnail_url, model_3d_url, vendor_info, average_rating, 
			review_count, view_count, purchase_count, is_featured, is_active,
			created_at, updated_at
		) VALUES (
			:id, :sku, :name, :slug, :description, :brand_id, :category_id,
			:style_tags, :color_tags, :material_tags, :dimensions, :price_range,
			:features, :care_instructions, :assembly_required, :assembly_time_minutes,
			:availability_status, :stock_quantity, :lead_time_days, :images,
			:thumbnail_url, :model_3d_url, :vendor_info, :average_rating,
			:review_count, :view_count, :purchase_count, :is_featured, :is_active,
			:created_at, :updated_at
		)`
	
	_, err := r.db.NamedExecContext(ctx, query, item)
	if err != nil {
		if isDuplicateKeyError(err) {
			return errors.NewConflictError("furniture item with this SKU or slug already exists")
		}
		return errors.Wrap(err, "failed to create furniture item")
	}
	
	return nil
}

func (r *furnitureRepository) GetFurnitureItemByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureItem, error) {
	item := &entities.FurnitureItem{}
	
	query := `
		SELECT 
			fi.*,
			fb.name as brand_name,
			fc.name as category_name
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.id = $1 AND fi.is_active = true`
	
	row := r.db.QueryRowxContext(ctx, query, id)
	err := row.StructScan(item)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture item not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture item")
	}
	
	// Load relationships
	if err := r.loadFurnitureItemRelationships(ctx, item); err != nil {
		return nil, err
	}
	
	return item, nil
}

func (r *furnitureRepository) GetFurnitureItemBySlug(ctx context.Context, slug string) (*entities.FurnitureItem, error) {
	item := &entities.FurnitureItem{}
	
	query := `
		SELECT 
			fi.*,
			fb.name as brand_name,
			fc.name as category_name
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.slug = $1 AND fi.is_active = true`
	
	row := r.db.QueryRowxContext(ctx, query, slug)
	err := row.StructScan(item)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture item not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture item")
	}
	
	// Load relationships
	if err := r.loadFurnitureItemRelationships(ctx, item); err != nil {
		return nil, err
	}
	
	return item, nil
}

func (r *furnitureRepository) UpdateFurnitureItem(ctx context.Context, item *entities.FurnitureItem) error {
	item.UpdatedAt = time.Now()
	
	query := `
		UPDATE furniture_items SET
			sku = :sku, name = :name, slug = :slug, description = :description,
			brand_id = :brand_id, category_id = :category_id, style_tags = :style_tags,
			color_tags = :color_tags, material_tags = :material_tags, dimensions = :dimensions,
			price_range = :price_range, features = :features, care_instructions = :care_instructions,
			assembly_required = :assembly_required, assembly_time_minutes = :assembly_time_minutes,
			availability_status = :availability_status, stock_quantity = :stock_quantity,
			lead_time_days = :lead_time_days, images = :images, thumbnail_url = :thumbnail_url,
			model_3d_url = :model_3d_url, vendor_info = :vendor_info, average_rating = :average_rating,
			review_count = :review_count, view_count = :view_count, purchase_count = :purchase_count,
			is_featured = :is_featured, is_active = :is_active, updated_at = :updated_at
		WHERE id = :id`
	
	result, err := r.db.NamedExecContext(ctx, query, item)
	if err != nil {
		return errors.Wrap(err, "failed to update furniture item")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture item not found")
	}
	
	return nil
}

func (r *furnitureRepository) DeleteFurnitureItem(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE furniture_items SET is_active = false WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete furniture item")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture item not found")
	}
	
	return nil
}

func (r *furnitureRepository) ListFurnitureItems(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchResult, error) {
	// Set defaults
	filters.SetDefaultPagination()
	filters.SetDefaultSort()
	
	// Build query with filters
	query, args, err := r.buildFurnitureSearchQuery(filters)
	if err != nil {
		return nil, errors.Wrap(err, "failed to build search query")
	}
	
	// Execute query
	rows, err := r.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to execute search query")
	}
	defer rows.Close()
	
	items := []entities.FurnitureItemSummary{}
	for rows.Next() {
		var item entities.FurnitureItemSummary
		if err := rows.StructScan(&item); err != nil {
			return nil, errors.Wrap(err, "failed to scan furniture item")
		}
		items = append(items, item)
	}
	
	// Get total count
	totalCount, err := r.getFurnitureSearchCount(ctx, filters)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get search count")
	}
	
	// Get facets
	facets, err := r.getFurnitureSearchFacets(ctx, filters)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get search facets")
	}
	
	return &entities.FurnitureSearchResult{
		Items:      items,
		TotalCount: totalCount,
		Facets:     *facets,
		QueryTime:  0, // Would be measured in production
	}, nil
}

// Furniture Brands

func (r *furnitureRepository) CreateFurnitureBrand(ctx context.Context, brand *entities.FurnitureBrand) error {
	if brand.ID == uuid.Nil {
		brand.ID = uuid.New()
	}
	
	brand.CreatedAt = time.Now()
	brand.UpdatedAt = time.Now()
	
	query := `
		INSERT INTO furniture_brands (
			id, name, slug, description, logo_url, website_url, 
			quality_rating, price_tier, is_verified, created_at, updated_at
		) VALUES (
			:id, :name, :slug, :description, :logo_url, :website_url,
			:quality_rating, :price_tier, :is_verified, :created_at, :updated_at
		)`
	
	_, err := r.db.NamedExecContext(ctx, query, brand)
	if err != nil {
		if isDuplicateKeyError(err) {
			return errors.NewConflictError("brand with this name or slug already exists")
		}
		return errors.Wrap(err, "failed to create furniture brand")
	}
	
	return nil
}

func (r *furnitureRepository) GetFurnitureBrandByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureBrand, error) {
	brand := &entities.FurnitureBrand{}
	
	query := `SELECT * FROM furniture_brands WHERE id = $1`
	
	err := r.db.GetContext(ctx, brand, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture brand not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture brand")
	}
	
	return brand, nil
}

func (r *furnitureRepository) GetFurnitureBrandBySlug(ctx context.Context, slug string) (*entities.FurnitureBrand, error) {
	brand := &entities.FurnitureBrand{}
	
	query := `SELECT * FROM furniture_brands WHERE slug = $1`
	
	err := r.db.GetContext(ctx, brand, query, slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture brand not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture brand")
	}
	
	return brand, nil
}

func (r *furnitureRepository) UpdateFurnitureBrand(ctx context.Context, brand *entities.FurnitureBrand) error {
	brand.UpdatedAt = time.Now()
	
	query := `
		UPDATE furniture_brands SET
			name = :name, slug = :slug, description = :description, logo_url = :logo_url,
			website_url = :website_url, quality_rating = :quality_rating, price_tier = :price_tier,
			is_verified = :is_verified, updated_at = :updated_at
		WHERE id = :id`
	
	result, err := r.db.NamedExecContext(ctx, query, brand)
	if err != nil {
		return errors.Wrap(err, "failed to update furniture brand")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture brand not found")
	}
	
	return nil
}

func (r *furnitureRepository) DeleteFurnitureBrand(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM furniture_brands WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete furniture brand")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture brand not found")
	}
	
	return nil
}

func (r *furnitureRepository) ListFurnitureBrands(ctx context.Context, limit, offset int) ([]entities.FurnitureBrand, int, error) {
	brands := []entities.FurnitureBrand{}
	
	query := `
		SELECT * FROM furniture_brands 
		ORDER BY name 
		LIMIT $1 OFFSET $2`
	
	err := r.db.SelectContext(ctx, &brands, query, limit, offset)
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to list furniture brands")
	}
	
	// Get total count
	var totalCount int
	countQuery := `SELECT COUNT(*) FROM furniture_brands`
	err = r.db.GetContext(ctx, &totalCount, countQuery)
	if err != nil {
		return nil, 0, errors.Wrap(err, "failed to get brands count")
	}
	
	return brands, totalCount, nil
}

// Furniture Categories

func (r *furnitureRepository) CreateFurnitureCategory(ctx context.Context, category *entities.FurnitureCategory) error {
	if category.ID == uuid.Nil {
		category.ID = uuid.New()
	}
	
	category.CreatedAt = time.Now()
	category.UpdatedAt = time.Now()
	
	query := `
		INSERT INTO furniture_categories (
			id, name, slug, parent_id, description, icon_url, 
			search_keywords, display_order, is_active, created_at, updated_at
		) VALUES (
			:id, :name, :slug, :parent_id, :description, :icon_url,
			:search_keywords, :display_order, :is_active, :created_at, :updated_at
		)`
	
	_, err := r.db.NamedExecContext(ctx, query, category)
	if err != nil {
		if isDuplicateKeyError(err) {
			return errors.NewConflictError("category with this slug already exists")
		}
		return errors.Wrap(err, "failed to create furniture category")
	}
	
	return nil
}

func (r *furnitureRepository) GetFurnitureCategoryByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureCategory, error) {
	category := &entities.FurnitureCategory{}
	
	query := `SELECT * FROM furniture_categories WHERE id = $1 AND is_active = true`
	
	err := r.db.GetContext(ctx, category, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture category not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture category")
	}
	
	// Load parent and children
	if err := r.loadCategoryRelationships(ctx, category); err != nil {
		return nil, err
	}
	
	return category, nil
}

func (r *furnitureRepository) GetFurnitureCategoryBySlug(ctx context.Context, slug string) (*entities.FurnitureCategory, error) {
	category := &entities.FurnitureCategory{}
	
	query := `SELECT * FROM furniture_categories WHERE slug = $1 AND is_active = true`
	
	err := r.db.GetContext(ctx, category, query, slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.NewNotFoundError("furniture category not found")
		}
		return nil, errors.Wrap(err, "failed to get furniture category")
	}
	
	// Load parent and children
	if err := r.loadCategoryRelationships(ctx, category); err != nil {
		return nil, err
	}
	
	return category, nil
}

func (r *furnitureRepository) UpdateFurnitureCategory(ctx context.Context, category *entities.FurnitureCategory) error {
	category.UpdatedAt = time.Now()
	
	query := `
		UPDATE furniture_categories SET
			name = :name, slug = :slug, parent_id = :parent_id, description = :description,
			icon_url = :icon_url, search_keywords = :search_keywords, display_order = :display_order,
			is_active = :is_active, updated_at = :updated_at
		WHERE id = :id`
	
	result, err := r.db.NamedExecContext(ctx, query, category)
	if err != nil {
		return errors.Wrap(err, "failed to update furniture category")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture category not found")
	}
	
	return nil
}

func (r *furnitureRepository) DeleteFurnitureCategory(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE furniture_categories SET is_active = false WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete furniture category")
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get affected rows")
	}
	
	if rowsAffected == 0 {
		return errors.NewNotFoundError("furniture category not found")
	}
	
	return nil
}

func (r *furnitureRepository) ListFurnitureCategories(ctx context.Context, parentID *uuid.UUID) ([]entities.FurnitureCategory, error) {
	categories := []entities.FurnitureCategory{}
	
	var query string
	var args []interface{}
	
	if parentID != nil {
		query = `SELECT * FROM furniture_categories WHERE parent_id = $1 AND is_active = true ORDER BY display_order, name`
		args = []interface{}{*parentID}
	} else {
		query = `SELECT * FROM furniture_categories WHERE parent_id IS NULL AND is_active = true ORDER BY display_order, name`
		args = []interface{}{}
	}
	
	err := r.db.SelectContext(ctx, &categories, query, args...)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list furniture categories")
	}
	
	return categories, nil
}

func (r *furnitureRepository) GetCategoryHierarchy(ctx context.Context) ([]entities.FurnitureCategory, error) {
	categories := []entities.FurnitureCategory{}
	
	query := `
		WITH RECURSIVE category_tree AS (
			-- Base case: root categories
			SELECT id, name, slug, parent_id, description, icon_url, 
				   search_keywords, display_order, is_active, created_at, updated_at,
				   0 as level
			FROM furniture_categories 
			WHERE parent_id IS NULL AND is_active = true
			
			UNION ALL
			
			-- Recursive case: child categories
			SELECT c.id, c.name, c.slug, c.parent_id, c.description, c.icon_url,
				   c.search_keywords, c.display_order, c.is_active, c.created_at, c.updated_at,
				   ct.level + 1
			FROM furniture_categories c
			INNER JOIN category_tree ct ON c.parent_id = ct.id
			WHERE c.is_active = true
		)
		SELECT * FROM category_tree 
		ORDER BY level, display_order, name`
	
	err := r.db.SelectContext(ctx, &categories, query)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get category hierarchy")
	}
	
	return categories, nil
}

// Helper methods

func (r *furnitureRepository) loadFurnitureItemRelationships(ctx context.Context, item *entities.FurnitureItem) error {
	// Load brand
	if item.BrandID != nil {
		brand, err := r.GetFurnitureBrandByID(ctx, *item.BrandID)
		if err == nil {
			item.Brand = brand
		}
	}
	
	// Load category
	if item.CategoryID != nil {
		category, err := r.GetFurnitureCategoryByID(ctx, *item.CategoryID)
		if err == nil {
			item.Category = category
		}
	}
	
	// Load variations
	variations, err := r.GetVariationsByFurnitureID(ctx, item.ID)
	if err == nil {
		item.Variations = variations
	}
	
	// Load room compatibility
	compatibility, err := r.GetCompatibilityByFurnitureID(ctx, item.ID)
	if err == nil {
		item.RoomCompatibility = compatibility
	}
	
	return nil
}

func (r *furnitureRepository) loadCategoryRelationships(ctx context.Context, category *entities.FurnitureCategory) error {
	// Load parent
	if category.ParentID != nil {
		parent := &entities.FurnitureCategory{}
		query := `SELECT * FROM furniture_categories WHERE id = $1`
		err := r.db.GetContext(ctx, parent, query, *category.ParentID)
		if err == nil {
			category.Parent = parent
		}
	}
	
	// Load children
	children, err := r.ListFurnitureCategories(ctx, &category.ID)
	if err == nil {
		category.Children = children
	}
	
	return nil
}

func (r *furnitureRepository) buildFurnitureSearchQuery(filters entities.FurnitureSearchFilters) (string, []interface{}, error) {
	baseQuery := `
		SELECT 
			fi.id, fi.name, fi.slug, fi.description,
			fb.name as brand_name, fc.name as category_name,
			(fi.price_range->>'min')::numeric as price_min,
			(fi.price_range->>'max')::numeric as price_max,
			(fi.price_range->>'sale_price')::numeric as sale_price,
			fi.price_range->>'currency' as currency,
			fi.average_rating, fi.review_count, fi.thumbnail_url,
			fi.style_tags, fi.color_tags, fi.material_tags,
			fi.dimensions, fi.availability_status, fi.stock_quantity,
			fi.is_featured,
			CASE WHEN array_length(fi.images, 1) > 0 THEN true ELSE false END as has_images,
			CASE WHEN fi.model_3d_url IS NOT NULL THEN true ELSE false END as has_3d_model
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.is_active = true`
	
	conditions := []string{}
	args := []interface{}{}
	argIndex := 1
	
	// Add filters
	if filters.Query != nil && *filters.Query != "" {
		conditions = append(conditions, fmt.Sprintf("fi.search_vector @@ plainto_tsquery('english', $%d)", argIndex))
		args = append(args, *filters.Query)
		argIndex++
	}
	
	if len(filters.CategoryIDs) > 0 {
		conditions = append(conditions, fmt.Sprintf("fi.category_id = ANY($%d)", argIndex))
		args = append(args, pq.Array(filters.CategoryIDs))
		argIndex++
	}
	
	if len(filters.BrandIDs) > 0 {
		conditions = append(conditions, fmt.Sprintf("fi.brand_id = ANY($%d)", argIndex))
		args = append(args, pq.Array(filters.BrandIDs))
		argIndex++
	}
	
	if len(filters.StyleTags) > 0 {
		conditions = append(conditions, fmt.Sprintf("fi.style_tags && $%d", argIndex))
		args = append(args, pq.Array(filters.StyleTags))
		argIndex++
	}
	
	if len(filters.ColorTags) > 0 {
		conditions = append(conditions, fmt.Sprintf("fi.color_tags && $%d", argIndex))
		args = append(args, pq.Array(filters.ColorTags))
		argIndex++
	}
	
	if len(filters.MaterialTags) > 0 {
		conditions = append(conditions, fmt.Sprintf("fi.material_tags && $%d", argIndex))
		args = append(args, pq.Array(filters.MaterialTags))
		argIndex++
	}
	
	if filters.MinPrice != nil {
		conditions = append(conditions, fmt.Sprintf("(fi.price_range->>'min')::numeric >= $%d", argIndex))
		args = append(args, *filters.MinPrice)
		argIndex++
	}
	
	if filters.MaxPrice != nil {
		conditions = append(conditions, fmt.Sprintf("(fi.price_range->>'max')::numeric <= $%d", argIndex))
		args = append(args, *filters.MaxPrice)
		argIndex++
	}
	
	if filters.MinRating != nil {
		conditions = append(conditions, fmt.Sprintf("fi.average_rating >= $%d", argIndex))
		args = append(args, *filters.MinRating)
		argIndex++
	}
	
	if filters.InStockOnly {
		conditions = append(conditions, "fi.stock_quantity > 0")
	}
	
	if filters.FeaturedOnly {
		conditions = append(conditions, "fi.is_featured = true")
	}
	
	if len(filters.AvailabilityStatuses) > 0 {
		statusStrings := make([]string, len(filters.AvailabilityStatuses))
		for i, status := range filters.AvailabilityStatuses {
			statusStrings[i] = string(status)
		}
		conditions = append(conditions, fmt.Sprintf("fi.availability_status = ANY($%d)", argIndex))
		args = append(args, pq.Array(statusStrings))
		argIndex++
	}
	
	// Build final query
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}
	
	// Add sorting
	orderBy := r.buildOrderByClause(filters.SortBy, filters.Query)
	baseQuery += orderBy
	
	// Add pagination
	baseQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, filters.Limit, filters.Offset)
	
	return baseQuery, args, nil
}

func (r *furnitureRepository) buildOrderByClause(sortBy entities.FurnitureSortBy, query *string) string {
	switch sortBy {
	case entities.SortByRelevance:
		if query != nil && *query != "" {
			return " ORDER BY ts_rank(fi.search_vector, plainto_tsquery('english', $1)) DESC, fi.average_rating DESC"
		}
		return " ORDER BY fi.average_rating DESC, fi.review_count DESC"
	case entities.SortByPriceLow:
		return " ORDER BY (fi.price_range->>'min')::numeric ASC"
	case entities.SortByPriceHigh:
		return " ORDER BY (fi.price_range->>'max')::numeric DESC"
	case entities.SortByRating:
		return " ORDER BY fi.average_rating DESC, fi.review_count DESC"
	case entities.SortByPopularity:
		return " ORDER BY (fi.view_count + fi.purchase_count * 10) DESC"
	case entities.SortByNewest:
		return " ORDER BY fi.created_at DESC"
	case entities.SortByBrandName:
		return " ORDER BY fb.name ASC"
	case entities.SortByName:
		return " ORDER BY fi.name ASC"
	default:
		return " ORDER BY fi.average_rating DESC, fi.review_count DESC"
	}
}

func (r *furnitureRepository) getFurnitureSearchCount(ctx context.Context, filters entities.FurnitureSearchFilters) (int, error) {
	baseQuery := `
		SELECT COUNT(*)
		FROM furniture_items fi
		LEFT JOIN furniture_brands fb ON fi.brand_id = fb.id
		LEFT JOIN furniture_categories fc ON fi.category_id = fc.id
		WHERE fi.is_active = true`
	
	conditions := []string{}
	args := []interface{}{}
	argIndex := 1
	
	// Apply same filters as search query (simplified for count)
	if filters.Query != nil && *filters.Query != "" {
		conditions = append(conditions, fmt.Sprintf("fi.search_vector @@ plainto_tsquery('english', $%d)", argIndex))
		args = append(args, *filters.Query)
		argIndex++
	}
	
	// Add other filter conditions...
	// (Similar to buildFurnitureSearchQuery but simplified)
	
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}
	
	var count int
	err := r.db.GetContext(ctx, &count, baseQuery, args...)
	if err != nil {
		return 0, err
	}
	
	return count, nil
}

func (r *furnitureRepository) getFurnitureSearchFacets(ctx context.Context, filters entities.FurnitureSearchFilters) (*entities.FurnitureSearchFacets, error) {
	// This would implement facet calculation
	// For now, return empty facets
	return &entities.FurnitureSearchFacets{}, nil
}

func isDuplicateKeyError(err error) bool {
	if pqErr, ok := err.(*pq.Error); ok {
		return pqErr.Code == "23505" // unique_violation
	}
	return false
}

// Placeholder implementations for remaining methods
// These would need to be implemented based on the full interface

func (r *furnitureRepository) CreateFurnitureVariation(ctx context.Context, variation *entities.FurnitureVariation) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) GetFurnitureVariationByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureVariation, error) {
	// TODO: Implement
	return nil, nil
}

func (r *furnitureRepository) UpdateFurnitureVariation(ctx context.Context, variation *entities.FurnitureVariation) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) DeleteFurnitureVariation(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) GetVariationsByFurnitureID(ctx context.Context, furnitureID uuid.UUID) ([]entities.FurnitureVariation, error) {
	// TODO: Implement
	return nil, nil
}

func (r *furnitureRepository) CreateRoomCompatibility(ctx context.Context, compatibility *entities.RoomCompatibility) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) GetRoomCompatibilityByID(ctx context.Context, id uuid.UUID) (*entities.RoomCompatibility, error) {
	// TODO: Implement
	return nil, nil
}

func (r *furnitureRepository) UpdateRoomCompatibility(ctx context.Context, compatibility *entities.RoomCompatibility) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) DeleteRoomCompatibility(ctx context.Context, id uuid.UUID) error {
	// TODO: Implement
	return nil
}

func (r *furnitureRepository) GetCompatibilityByFurnitureID(ctx context.Context, furnitureID uuid.UUID) ([]entities.RoomCompatibility, error) {
	// TODO: Implement
	return nil, nil
}

func (r *furnitureRepository) GetCompatibilityByRoomType(ctx context.Context, roomType entities.RoomType, filters entities.FurnitureSearchFilters) ([]entities.FurnitureItemSummary, error) {
	// TODO: Implement
	return nil, nil
}

// Collection methods - placeholder implementations
func (r *furnitureRepository) CreateFurnitureCollection(ctx context.Context, collection *entities.FurnitureCollection) error {
	return nil
}

func (r *furnitureRepository) GetFurnitureCollectionByID(ctx context.Context, id uuid.UUID) (*entities.FurnitureCollection, error) {
	return nil, nil
}

func (r *furnitureRepository) GetFurnitureCollectionBySlug(ctx context.Context, slug string) (*entities.FurnitureCollection, error) {
	return nil, nil
}

func (r *furnitureRepository) UpdateFurnitureCollection(ctx context.Context, collection *entities.FurnitureCollection) error {
	return nil
}

func (r *furnitureRepository) DeleteFurnitureCollection(ctx context.Context, id uuid.UUID) error {
	return nil
}

func (r *furnitureRepository) ListFurnitureCollections(ctx context.Context, brandID *uuid.UUID, limit, offset int) ([]entities.FurnitureCollection, int, error) {
	return nil, 0, nil
}

func (r *furnitureRepository) AddItemToCollection(ctx context.Context, collectionID, furnitureItemID uuid.UUID, displayOrder int, isOptional bool) error {
	return nil
}

func (r *furnitureRepository) RemoveItemFromCollection(ctx context.Context, collectionID, furnitureItemID uuid.UUID) error {
	return nil
}

func (r *furnitureRepository) GetCollectionItems(ctx context.Context, collectionID uuid.UUID) ([]entities.FurnitureCollectionItem, error) {
	return nil, nil
}