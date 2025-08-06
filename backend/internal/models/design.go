package models

import (
	"time"

	"github.com/google/uuid"
)

type DesignStatus string

const (
	DesignStatusProcessing DesignStatus = "processing"
	DesignStatusCompleted  DesignStatus = "completed"
	DesignStatusFailed     DesignStatus = "failed"
)

type DesignStyle string

const (
	DesignStyleModern       DesignStyle = "modern"
	DesignStyleMinimalist   DesignStyle = "minimalist"
	DesignStyleTraditional  DesignStyle = "traditional"
	DesignStyleIndustrial   DesignStyle = "industrial"
	DesignStyleScandinavian DesignStyle = "scandinavian"
	DesignStyleBohemian     DesignStyle = "bohemian"
)

type Design struct {
	ID                uuid.UUID     `json:"id" db:"id"`
	ProjectID         uuid.UUID     `json:"project_id" db:"project_id"`
	UserID            uuid.UUID     `json:"user_id" db:"user_id"`
	Name              string        `json:"name" db:"name"`
	Description       *string       `json:"description" db:"description"`
	Style             DesignStyle   `json:"style" db:"style"`
	Status            DesignStatus  `json:"status" db:"status"`
	OriginalImageID   *uuid.UUID    `json:"original_image_id" db:"original_image_id"`
	GeneratedImageID  *uuid.UUID    `json:"generated_image_id" db:"generated_image_id"`
	ProcessingDetails interface{}   `json:"processing_details" db:"processing_details"`
	EstimatedCost     *float64      `json:"estimated_cost" db:"estimated_cost"`
	Currency          string        `json:"currency" db:"currency"`
	Metadata          interface{}   `json:"metadata" db:"metadata"`
	CreatedAt         time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time     `json:"updated_at" db:"updated_at"`
	DeletedAt         *time.Time    `json:"deleted_at,omitempty" db:"deleted_at"`

	// Relationships
	OriginalImage  *Image    `json:"original_image,omitempty"`
	GeneratedImage *Image    `json:"generated_image,omitempty"`
	Products       []Product `json:"products,omitempty"`
}

type CreateDesignRequest struct {
	ProjectID   uuid.UUID   `json:"project_id" binding:"required"`
	Name        string      `json:"name" binding:"required,min=1,max=100"`
	Description *string     `json:"description"`
	Style       DesignStyle `json:"style" binding:"required"`
}

type UpdateDesignRequest struct {
	Name        *string      `json:"name"`
	Description *string      `json:"description"`
	Style       *DesignStyle `json:"style"`
	Status      *DesignStatus `json:"status"`
}

type DesignResponse struct {
	ID               uuid.UUID     `json:"id"`
	ProjectID        uuid.UUID     `json:"project_id"`
	UserID           uuid.UUID     `json:"user_id"`
	Name             string        `json:"name"`
	Description      *string       `json:"description"`
	Style            DesignStyle   `json:"style"`
	Status           DesignStatus  `json:"status"`
	OriginalImageID  *uuid.UUID    `json:"original_image_id"`
	GeneratedImageID *uuid.UUID    `json:"generated_image_id"`
	EstimatedCost    *float64      `json:"estimated_cost"`
	Currency         string        `json:"currency"`
	ProductCount     int           `json:"product_count"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
}

func (d *Design) ToResponse() *DesignResponse {
	return &DesignResponse{
		ID:               d.ID,
		ProjectID:        d.ProjectID,
		UserID:           d.UserID,
		Name:             d.Name,
		Description:      d.Description,
		Style:            d.Style,
		Status:           d.Status,
		OriginalImageID:  d.OriginalImageID,
		GeneratedImageID: d.GeneratedImageID,
		EstimatedCost:    d.EstimatedCost,
		Currency:         d.Currency,
		ProductCount:     len(d.Products),
		CreatedAt:        d.CreatedAt,
		UpdatedAt:        d.UpdatedAt,
	}
}