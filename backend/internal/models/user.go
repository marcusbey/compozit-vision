package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uuid.UUID  `json:"id" db:"id"`
	Email             string     `json:"email" db:"email"`
	PasswordHash      string     `json:"-" db:"password_hash"`
	FirstName         *string    `json:"first_name" db:"first_name"`
	LastName          *string    `json:"last_name" db:"last_name"`
	Avatar            *string    `json:"avatar" db:"avatar"`
	EmailVerified     bool       `json:"email_verified" db:"email_verified"`
	EmailVerifiedAt   *time.Time `json:"email_verified_at" db:"email_verified_at"`
	SubscriptionTier  string     `json:"subscription_tier" db:"subscription_tier"`
	SubscriptionEndsAt *time.Time `json:"subscription_ends_at" db:"subscription_ends_at"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

type CreateUserRequest struct {
	Email     string  `json:"email" binding:"required,email"`
	Password  string  `json:"password" binding:"required,min=8"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateUserRequest struct {
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Avatar    *string `json:"avatar"`
}

type UserResponse struct {
	ID               uuid.UUID  `json:"id"`
	Email            string     `json:"email"`
	FirstName        *string    `json:"first_name"`
	LastName         *string    `json:"last_name"`
	Avatar           *string    `json:"avatar"`
	EmailVerified    bool       `json:"email_verified"`
	SubscriptionTier string     `json:"subscription_tier"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:               u.ID,
		Email:            u.Email,
		FirstName:        u.FirstName,
		LastName:         u.LastName,
		Avatar:           u.Avatar,
		EmailVerified:    u.EmailVerified,
		SubscriptionTier: u.SubscriptionTier,
		CreatedAt:        u.CreatedAt,
		UpdatedAt:        u.UpdatedAt,
	}
}