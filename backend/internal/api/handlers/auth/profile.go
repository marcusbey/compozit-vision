// User Profile Management Handler
package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type GetProfileResponse struct {
	User        UserResponse        `json:"user"`
	Profile     UserProfileResponse `json:"profile"`
	Preferences UserPreferencesResponse `json:"preferences"`
}

type UserProfileResponse struct {
	DisplayName               *string   `json:"display_name"`
	AvatarURL                 *string   `json:"avatar_url"`
	PhoneNumber               *string   `json:"phone_number"`
	PreferredCurrency         string    `json:"preferred_currency"`
	Timezone                  string    `json:"timezone"`
	OnboardingCompleted       bool      `json:"onboarding_completed"`
	TutorialStepsCompleted    []string  `json:"tutorial_steps_completed"`
}

type UserPreferencesResponse struct {
	DesignStyles          []string                `json:"design_styles"`
	BudgetMin             *int                    `json:"budget_min"`
	BudgetMax             *int                    `json:"budget_max"`
	PreferredRoomTypes    []string                `json:"preferred_room_types"`
	NotificationSettings  map[string]interface{}  `json:"notification_settings"`
	PrivacySettings       map[string]interface{}  `json:"privacy_settings"`
	AccessibilitySettings map[string]interface{}  `json:"accessibility_settings"`
}

type UpdateProfileRequest struct {
	DisplayName       *string `json:"display_name"`
	PhoneNumber       *string `json:"phone_number"`
	PreferredCurrency *string `json:"preferred_currency"`
	Timezone          *string `json:"timezone"`
}

type UpdatePreferencesRequest struct {
	DesignStyles          *[]string               `json:"design_styles"`
	BudgetMin             *int                    `json:"budget_min"`
	BudgetMax             *int                    `json:"budget_max"`
	PreferredRoomTypes    *[]string               `json:"preferred_room_types"`
	NotificationSettings  *map[string]interface{} `json:"notification_settings"`
	PrivacySettings       *map[string]interface{} `json:"privacy_settings"`
	AccessibilitySettings *map[string]interface{} `json:"accessibility_settings"`
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id") // Set by auth middleware
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Authentication required",
		})
		return
	}

	// Get user from Supabase Auth
	user, err := h.supabase.Auth.GetUser(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "invalid_token",
			"message": "Invalid or expired token",
		})
		return
	}

	// Get user profile
	profile, err := h.getDetailedUserProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to retrieve user profile",
		})
		return
	}

	// Get user preferences
	preferences, err := h.getUserPreferences(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to retrieve user preferences",
		})
		return
	}

	response := GetProfileResponse{
		User: UserResponse{
			ID:            user.ID,
			Email:         user.Email,
			DisplayName:   profile.DisplayName,
			AvatarURL:     profile.AvatarURL,
			PhoneNumber:   profile.PhoneNumber,
			EmailVerified: user.EmailConfirmedAt != nil,
			CreatedAt:     user.CreatedAt,
			UpdatedAt:     user.UpdatedAt,
		},
		Profile:     *profile,
		Preferences: *preferences,
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Authentication required",
		})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Build update data
	updateData := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if req.DisplayName != nil {
		updateData["display_name"] = *req.DisplayName
	}
	if req.PhoneNumber != nil {
		updateData["phone_number"] = *req.PhoneNumber
	}
	if req.PreferredCurrency != nil {
		updateData["preferred_currency"] = *req.PreferredCurrency
	}
	if req.Timezone != nil {
		updateData["timezone"] = *req.Timezone
	}

	// Update profile in database
	_, err := h.supabase.From("user_profiles").
		Update(updateData).
		Eq("user_id", userID).
		Execute()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to update profile",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
}

func (h *AuthHandler) UpdatePreferences(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Authentication required",
		})
		return
	}

	var req UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Build update data
	updateData := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if req.DesignStyles != nil {
		updateData["design_styles"] = *req.DesignStyles
	}
	if req.BudgetMin != nil {
		updateData["budget_min"] = *req.BudgetMin
	}
	if req.BudgetMax != nil {
		updateData["budget_max"] = *req.BudgetMax
	}
	if req.PreferredRoomTypes != nil {
		updateData["preferred_room_types"] = *req.PreferredRoomTypes
	}
	if req.NotificationSettings != nil {
		updateData["notification_settings"] = *req.NotificationSettings
	}
	if req.PrivacySettings != nil {
		updateData["privacy_settings"] = *req.PrivacySettings
	}
	if req.AccessibilitySettings != nil {
		updateData["accessibility_settings"] = *req.AccessibilitySettings
	}

	// Update preferences in database
	_, err := h.supabase.From("user_preferences").
		Update(updateData).
		Eq("user_id", userID).
		Execute()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "database_error",
			"message": "Failed to update preferences",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Preferences updated successfully",
	})
}

func (h *AuthHandler) DeleteAccount(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Authentication required",
		})
		return
	}

	// Confirm password for security
	type DeleteAccountRequest struct {
		Password string `json:"password" binding:"required"`
	}

	var req DeleteAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "invalid_request",
			"message": "Password confirmation required",
		})
		return
	}

	// Get user email to verify password
	user, err := h.supabase.Auth.GetUser(c.GetHeader("Authorization"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "invalid_token",
			"message": "Invalid or expired token",
		})
		return
	}

	// Verify password by attempting sign in
	credentials := map[string]interface{}{
		"email":    user.Email,
		"password": req.Password,
	}

	_, authErr := h.supabase.Auth.SignInWithEmailAndPassword(credentials)
	if authErr != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "invalid_password",
			"message": "Incorrect password",
		})
		return
	}

	// Delete user account (cascading deletes will handle related data)
	err = h.supabase.Auth.Admin.DeleteUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "deletion_failed",
			"message": "Failed to delete account",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Account deleted successfully",
	})
}

func (h *AuthHandler) getDetailedUserProfile(userID string) (*UserProfileResponse, error) {
	var profile UserProfileResponse
	
	result, err := h.supabase.From("user_profiles").
		Select("*").
		Eq("user_id", userID).
		Single().
		Execute()
	
	if err != nil {
		return nil, err
	}

	if err := result.Unmarshal(&profile); err != nil {
		return nil, err
	}

	return &profile, nil
}

func (h *AuthHandler) getUserPreferences(userID string) (*UserPreferencesResponse, error) {
	var preferences UserPreferencesResponse
	
	result, err := h.supabase.From("user_preferences").
		Select("*").
		Eq("user_id", userID).
		Single().
		Execute()
	
	if err != nil {
		return nil, err
	}

	if err := result.Unmarshal(&preferences); err != nil {
		return nil, err
	}

	return &preferences, nil
}