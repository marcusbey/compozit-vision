// User Registration Handler
package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/supabase-community/supabase-go"
	"golang.org/x/crypto/bcrypt"
)

type SignUpRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	DisplayName string `json:"display_name,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
}

type SignUpResponse struct {
	User    UserResponse    `json:"user"`
	Session SessionResponse `json:"session"`
	Message string          `json:"message"`
}

type UserResponse struct {
	ID             string     `json:"id"`
	Email          string     `json:"email"`
	DisplayName    *string    `json:"display_name"`
	AvatarURL      *string    `json:"avatar_url"`
	PhoneNumber    *string    `json:"phone_number"`
	EmailVerified  bool       `json:"email_verified"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type SessionResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	DeviceID     string    `json:"device_id"`
}

type AuthHandler struct {
	supabase *supabase.Client
}

func NewAuthHandler(supabaseClient *supabase.Client) *AuthHandler {
	return &AuthHandler{
		supabase: supabaseClient,
	}
}

func (h *AuthHandler) SignUp(c *gin.Context) {
	var req SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate password strength
	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "weak_password",
			"message": "Password must be at least 8 characters long",
		})
		return
	}

	// Create user with Supabase Auth
	userData := map[string]interface{}{
		"email":    req.Email,
		"password": req.Password,
	}

	// Add optional metadata
	if req.DisplayName != "" {
		userData["options"] = map[string]interface{}{
			"data": map[string]interface{}{
				"display_name": req.DisplayName,
			},
		}
	}

	// Create user in Supabase
	resp, err := h.supabase.Auth.SignUp(userData)
	if err != nil {
		// Handle specific Supabase errors
		if supabaseErr, ok := err.(*supabase.Error); ok {
			switch supabaseErr.Code {
			case "user_already_exists":
				c.JSON(http.StatusConflict, gin.H{
					"error":   "email_exists",
					"message": "An account with this email already exists",
				})
			case "weak_password":
				c.JSON(http.StatusBadRequest, gin.H{
					"error":   "weak_password",
					"message": "Password does not meet security requirements",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "auth_error",
					"message": "Authentication service error",
					"details": supabaseErr.Message,
				})
			}
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "unknown_error",
			"message": "Failed to create account",
		})
		return
	}

	// Create user profile in our database
	userID := resp.User.ID
	profileErr := h.createUserProfile(userID, req.DisplayName, req.PhoneNumber)
	if profileErr != nil {
		// Log error but don't fail the request
		// The user account is created, profile can be updated later
	}

	// Generate device ID
	deviceID := uuid.New().String()

	// Build response
	response := SignUpResponse{
		User: UserResponse{
			ID:            resp.User.ID,
			Email:         resp.User.Email,
			DisplayName:   getStringPtr(req.DisplayName),
			AvatarURL:     nil,
			PhoneNumber:   getStringPtr(req.PhoneNumber),
			EmailVerified: resp.User.EmailConfirmedAt != nil,
			CreatedAt:     resp.User.CreatedAt,
			UpdatedAt:     resp.User.UpdatedAt,
		},
		Session: SessionResponse{
			AccessToken:  resp.Session.AccessToken,
			RefreshToken: resp.Session.RefreshToken,
			ExpiresAt:    time.Now().Add(time.Duration(resp.Session.ExpiresIn) * time.Second),
			DeviceID:     deviceID,
		},
		Message: "Account created successfully. Please check your email to verify your account.",
	}

	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) createUserProfile(userID, displayName, phoneNumber string) error {
	// Insert user profile
	profileData := map[string]interface{}{
		"user_id":      userID,
		"display_name": displayName,
		"phone_number": phoneNumber,
		"onboarding_completed": false,
		"tutorial_steps_completed": []string{},
	}

	_, err := h.supabase.From("user_profiles").Insert(profileData).Execute()
	if err != nil {
		return err
	}

	// Insert default user preferences
	preferencesData := map[string]interface{}{
		"user_id": userID,
		"design_styles": []string{},
		"preferred_room_types": []string{},
		"notification_settings": map[string]interface{}{
			"push":           true,
			"email":          true,
			"sms":            false,
			"project_updates": true,
			"marketing":      false,
		},
		"privacy_settings": map[string]interface{}{
			"share_projects": false,
			"public_profile": false,
			"analytics":      true,
		},
		"accessibility_settings": map[string]interface{}{
			"high_contrast": false,
			"font_size":     "medium",
			"reduce_motion": false,
		},
	}

	_, err = h.supabase.From("user_preferences").Insert(preferencesData).Execute()
	return err
}

func getStringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}