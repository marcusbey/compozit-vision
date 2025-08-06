package models

import (
	"time"

	"github.com/google/uuid"
)

type ImageType string

const (
	ImageTypeOriginal  ImageType = "original"
	ImageTypeGenerated ImageType = "generated"
	ImageTypeProcessed ImageType = "processed"
)

type Image struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	ProjectID   *uuid.UUID `json:"project_id" db:"project_id"`
	DesignID    *uuid.UUID `json:"design_id" db:"design_id"`
	Type        ImageType `json:"type" db:"type"`
	FileName    string    `json:"file_name" db:"file_name"`
	FileSize    int64     `json:"file_size" db:"file_size"`
	MimeType    string    `json:"mime_type" db:"mime_type"`
	Width       int       `json:"width" db:"width"`
	Height      int       `json:"height" db:"height"`
	URL         string    `json:"url" db:"url"`
	ThumbnailURL *string   `json:"thumbnail_url" db:"thumbnail_url"`
	StoragePath string    `json:"storage_path" db:"storage_path"`
	Metadata    interface{} `json:"metadata" db:"metadata"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

type UploadImageRequest struct {
	ProjectID *uuid.UUID `form:"project_id"`
	DesignID  *uuid.UUID `form:"design_id"`
	Type      ImageType  `form:"type" binding:"required"`
}

type ImageResponse struct {
	ID           uuid.UUID  `json:"id"`
	UserID       uuid.UUID  `json:"user_id"`
	ProjectID    *uuid.UUID `json:"project_id"`
	DesignID     *uuid.UUID `json:"design_id"`
	Type         ImageType  `json:"type"`
	FileName     string     `json:"file_name"`
	FileSize     int64      `json:"file_size"`
	MimeType     string     `json:"mime_type"`
	Width        int        `json:"width"`
	Height       int        `json:"height"`
	URL          string     `json:"url"`
	ThumbnailURL *string    `json:"thumbnail_url"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (i *Image) ToResponse() *ImageResponse {
	return &ImageResponse{
		ID:           i.ID,
		UserID:       i.UserID,
		ProjectID:    i.ProjectID,
		DesignID:     i.DesignID,
		Type:         i.Type,
		FileName:     i.FileName,
		FileSize:     i.FileSize,
		MimeType:     i.MimeType,
		Width:        i.Width,
		Height:       i.Height,
		URL:          i.URL,
		ThumbnailURL: i.ThumbnailURL,
		CreatedAt:    i.CreatedAt,
		UpdatedAt:    i.UpdatedAt,
	}
}