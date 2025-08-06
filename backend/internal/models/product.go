package models

import (
	"time"

	"github.com/google/uuid"
)

type ProductCategory string

const (
	ProductCategoryFurniture   ProductCategory = "furniture"
	ProductCategoryDecor       ProductCategory = "decor"
	ProductCategoryLighting    ProductCategory = "lighting"
	ProductCategoryTextiles    ProductCategory = "textiles"
	ProductCategoryArt         ProductCategory = "art"
	ProductCategoryStorage     ProductCategory = "storage"
	ProductCategoryElectronics ProductCategory = "electronics"
)

type Product struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	DesignID         *uuid.UUID      `json:"design_id" db:"design_id"`
	Name             string          `json:"name" db:"name"`
	Description      *string         `json:"description" db:"description"`
	Category         ProductCategory `json:"category" db:"category"`
	Brand            *string         `json:"brand" db:"brand"`
	Price            float64         `json:"price" db:"price"`
	Currency         string          `json:"currency" db:"currency"`
	ImageURL         *string         `json:"image_url" db:"image_url"`
	ProductURL       *string         `json:"product_url" db:"product_url"`
	AffiliateURL     *string         `json:"affiliate_url" db:"affiliate_url"`
	Dimensions       interface{}     `json:"dimensions" db:"dimensions"`
	Materials        []string        `json:"materials" db:"materials"`
	Colors           []string        `json:"colors" db:"colors"`
	Availability     bool            `json:"availability" db:"availability"`
	Rating           *float64        `json:"rating" db:"rating"`
	ReviewCount      *int            `json:"review_count" db:"review_count"`
	Tags             []string        `json:"tags" db:"tags"`
	Metadata         interface{}     `json:"metadata" db:"metadata"`
	MatchConfidence  *float64        `json:"match_confidence" db:"match_confidence"`
	RelevanceScore   *float64        `json:"relevance_score" db:"relevance_score"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at" db:"updated_at"`
	DeletedAt        *time.Time      `json:"deleted_at,omitempty" db:"deleted_at"`
}

type CreateProductRequest struct {
	DesignID        *uuid.UUID      `json:"design_id"`
	Name            string          `json:"name" binding:"required,min=1,max=200"`
	Description     *string         `json:"description"`
	Category        ProductCategory `json:"category" binding:"required"`
	Brand           *string         `json:"brand"`
	Price           float64         `json:"price" binding:"required,min=0"`
	Currency        string          `json:"currency" binding:"required"`
	ImageURL        *string         `json:"image_url"`
	ProductURL      *string         `json:"product_url"`
	AffiliateURL    *string         `json:"affiliate_url"`
	Materials       []string        `json:"materials"`
	Colors          []string        `json:"colors"`
	Tags            []string        `json:"tags"`
	MatchConfidence *float64        `json:"match_confidence"`
	RelevanceScore  *float64        `json:"relevance_score"`
}

type UpdateProductRequest struct {
	Name           *string          `json:"name"`
	Description    *string          `json:"description"`
	Category       *ProductCategory `json:"category"`
	Brand          *string          `json:"brand"`
	Price          *float64         `json:"price"`
	Currency       *string          `json:"currency"`
	ImageURL       *string          `json:"image_url"`
	ProductURL     *string          `json:"product_url"`
	AffiliateURL   *string          `json:"affiliate_url"`
	Materials      []string         `json:"materials"`
	Colors         []string         `json:"colors"`
	Availability   *bool            `json:"availability"`
	Tags           []string         `json:"tags"`
	RelevanceScore *float64         `json:"relevance_score"`
}

type ProductResponse struct {
	ID              uuid.UUID       `json:"id"`
	DesignID        *uuid.UUID      `json:"design_id"`
	Name            string          `json:"name"`
	Description     *string         `json:"description"`
	Category        ProductCategory `json:"category"`
	Brand           *string         `json:"brand"`
	Price           float64         `json:"price"`
	Currency        string          `json:"currency"`
	ImageURL        *string         `json:"image_url"`
	ProductURL      *string         `json:"product_url"`
	AffiliateURL    *string         `json:"affiliate_url"`
	Materials       []string        `json:"materials"`
	Colors          []string        `json:"colors"`
	Availability    bool            `json:"availability"`
	Rating          *float64        `json:"rating"`
	ReviewCount     *int            `json:"review_count"`
	Tags            []string        `json:"tags"`
	MatchConfidence *float64        `json:"match_confidence"`
	RelevanceScore  *float64        `json:"relevance_score"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

func (p *Product) ToResponse() *ProductResponse {
	return &ProductResponse{
		ID:              p.ID,
		DesignID:        p.DesignID,
		Name:            p.Name,
		Description:     p.Description,
		Category:        p.Category,
		Brand:           p.Brand,
		Price:           p.Price,
		Currency:        p.Currency,
		ImageURL:        p.ImageURL,
		ProductURL:      p.ProductURL,
		AffiliateURL:    p.AffiliateURL,
		Materials:       p.Materials,
		Colors:          p.Colors,
		Availability:    p.Availability,
		Rating:          p.Rating,
		ReviewCount:     p.ReviewCount,
		Tags:            p.Tags,
		MatchConfidence: p.MatchConfidence,
		RelevanceScore:  p.RelevanceScore,
		CreatedAt:       p.CreatedAt,
		UpdatedAt:       p.UpdatedAt,
	}
}