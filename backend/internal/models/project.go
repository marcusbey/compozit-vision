package models

import (
	"time"

	"github.com/google/uuid"
)

type ProjectStatus string

const (
	ProjectStatusDraft     ProjectStatus = "draft"
	ProjectStatusActive    ProjectStatus = "active"
	ProjectStatusCompleted ProjectStatus = "completed"
	ProjectStatusArchived  ProjectStatus = "archived"
)

type Project struct {
	ID          uuid.UUID     `json:"id" db:"id"`
	UserID      uuid.UUID     `json:"user_id" db:"user_id"`
	Name        string        `json:"name" db:"name"`
	Description *string       `json:"description" db:"description"`
	Status      ProjectStatus `json:"status" db:"status"`
	Budget      *float64      `json:"budget" db:"budget"`
	Currency    string        `json:"currency" db:"currency"`
	Metadata    interface{}   `json:"metadata" db:"metadata"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at" db:"updated_at"`
	DeletedAt   *time.Time    `json:"deleted_at,omitempty" db:"deleted_at"`

	// Relationships
	Designs []Design `json:"designs,omitempty"`
}

type CreateProjectRequest struct {
	Name        string   `json:"name" binding:"required,min=1,max=100"`
	Description *string  `json:"description"`
	Budget      *float64 `json:"budget"`
	Currency    string   `json:"currency"`
}

type UpdateProjectRequest struct {
	Name        *string        `json:"name"`
	Description *string        `json:"description"`
	Status      *ProjectStatus `json:"status"`
	Budget      *float64       `json:"budget"`
	Currency    *string        `json:"currency"`
}

type ProjectResponse struct {
	ID          uuid.UUID     `json:"id"`
	UserID      uuid.UUID     `json:"user_id"`
	Name        string        `json:"name"`
	Description *string       `json:"description"`
	Status      ProjectStatus `json:"status"`
	Budget      *float64      `json:"budget"`
	Currency    string        `json:"currency"`
	DesignCount int           `json:"design_count"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

func (p *Project) ToResponse() *ProjectResponse {
	return &ProjectResponse{
		ID:          p.ID,
		UserID:      p.UserID,
		Name:        p.Name,
		Description: p.Description,
		Status:      p.Status,
		Budget:      p.Budget,
		Currency:    p.Currency,
		DesignCount: len(p.Designs),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}