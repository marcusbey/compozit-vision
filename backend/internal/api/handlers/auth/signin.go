// User Sign In Handler
package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/supabase-community/supabase-go"
)

type SignInRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	DeviceID string `json:"device_id,omitempty"`
}

type SignInResponse struct {
	User    UserResponse    `json:"user"`
	Session SessionResponse `json:"session"`
	Message string          `json:"message"`
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	var req SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Authenticate with Supabase
	credentials := map[string]interface{}{
		"email":    req.Email,
		"password": req.Password,
	}

	resp, err := h.supabase.Auth.SignInWithEmailAndPassword(credentials)
	if err != nil {
		// Handle specific Supabase errors
		if supabaseErr, ok := err.(*supabase.Error); ok {
			switch supabaseErr.Code {
			case "invalid_credentials":
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "invalid_credentials",
					"message": "Invalid email or password",
				})
			case "email_not_confirmed":
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "email_not_verified",
					"message": "Please verify your email address before signing in",
				})
			case "too_many_requests":
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error":   "rate_limit_exceeded",
					"message": "Too many sign-in attempts. Please try again later",
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
			"message": "Failed to sign in",
		})
		return
	}

	// Get or create device ID
	deviceID := req.DeviceID
	if deviceID == "" {
		deviceID = uuid.New().String()
	}

	// Update user session in database
	sessionErr := h.updateUserSession(resp.User.ID, deviceID, c.Request)
	if sessionErr != nil {
		// Log error but don't fail the request
		// Session tracking is not critical for authentication
	}

	// Get user profile information
	userProfile, profileErr := h.getUserProfile(resp.User.ID)
	var displayName *string
	var avatarURL *string
	var phoneNumber *string

	if profileErr == nil && userProfile != nil {
		displayName = userProfile.DisplayName
		avatarURL = userProfile.AvatarURL
		phoneNumber = userProfile.PhoneNumber
	}

	// Build response
	response := SignInResponse{
		User: UserResponse{
			ID:            resp.User.ID,
			Email:         resp.User.Email,
			DisplayName:   displayName,
			AvatarURL:     avatarURL,
			PhoneNumber:   phoneNumber,
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
		Message: "Sign in successful",
	}

	c.JSON(http.StatusOK, response)
}

type UserProfile struct {
	UserID      string  `json:"user_id"`
	DisplayName *string `json:"display_name"`
	AvatarURL   *string `json:"avatar_url"`
	PhoneNumber *string `json:"phone_number"`
}

func (h *AuthHandler) getUserProfile(userID string) (*UserProfile, error) {
	var profile UserProfile
	
	result, err := h.supabase.From("user_profiles").
		Select("user_id, display_name, avatar_url, phone_number").
		Eq("user_id", userID).
		Single().
		Execute()
	
	if err != nil {
		return nil, err
	}

	// Parse the result
	if err := result.Unmarshal(&profile); err != nil {
		return nil, err
	}

	return &profile, nil
}

func (h *AuthHandler) updateUserSession(userID, deviceID string, req *http.Request) error {
	// Extract device information from request
	userAgent := req.Header.Get("User-Agent")
	clientIP := req.Header.Get("X-Real-IP")
	if clientIP == "" {
		clientIP = req.Header.Get("X-Forwarded-For")
	}
	if clientIP == "" {
		clientIP = req.RemoteAddr
	}

	deviceInfo := map[string]interface{}{
		"user_agent": userAgent,
		"ip_address": clientIP,
		"platform":   req.Header.Get("X-Platform"),
		"app_version": req.Header.Get("X-App-Version"),
	}

	sessionData := map[string]interface{}{
		"user_id":     userID,
		"device_id":   deviceID,
		"device_info": deviceInfo,
		"last_active": time.Now(),
		"expires_at":  time.Now().Add(30 * 24 * time.Hour), // 30 days
	}

	// Upsert session (insert or update if exists)
	_, err := h.supabase.From("user_sessions").
		Upsert(sessionData).
		Match(map[string]interface{}{
			"user_id":   userID,
			"device_id": deviceID,
		}).
		Execute()

	return err
}