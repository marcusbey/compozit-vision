package jobs

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/compozit/vision/backend/pkg/logger"
	"github.com/gorilla/websocket"
)

// WebSocketNotifier handles real-time job status updates via WebSocket
type WebSocketNotifier struct {
	connections map[string][]*websocket.Conn // userID -> connections
	mu          sync.RWMutex
	logger      logger.Logger
	upgrader    websocket.Upgrader
}

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type    string      `json:"type"`
	JobID   string      `json:"job_id,omitempty"`
	UserID  string      `json:"user_id,omitempty"`
	Data    interface{} `json:"data"`
}

// NewWebSocketNotifier creates a new WebSocket notifier
func NewWebSocketNotifier(logger logger.Logger) *WebSocketNotifier {
	return &WebSocketNotifier{
		connections: make(map[string][]*websocket.Conn),
		logger:      logger,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// Allow all origins in development
				// In production, implement proper origin checking
				return true
			},
		},
	}
}

// HandleWebSocket handles WebSocket connection upgrades
func (wsn *WebSocketNotifier) HandleWebSocket(w http.ResponseWriter, r *http.Request, userID string) error {
	// Upgrade HTTP connection to WebSocket
	conn, err := wsn.upgrader.Upgrade(w, r, nil)
	if err != nil {
		wsn.logger.Error("WebSocket upgrade failed", "error", err)
		return err
	}

	wsn.logger.Info("WebSocket connection established", "user_id", userID)

	// Add connection to user's connection list
	wsn.mu.Lock()
	wsn.connections[userID] = append(wsn.connections[userID], conn)
	wsn.mu.Unlock()

	// Send welcome message
	welcomeMsg := WebSocketMessage{
		Type: "connected",
		Data: map[string]string{
			"message": "Connected to job status updates",
		},
	}
	wsn.sendToConnection(conn, welcomeMsg)

	// Handle connection cleanup and message reading
	go wsn.handleConnection(conn, userID)

	return nil
}

// handleConnection manages a single WebSocket connection
func (wsn *WebSocketNotifier) handleConnection(conn *websocket.Conn, userID string) {
	defer func() {
		// Remove connection from list
		wsn.mu.Lock()
		connections := wsn.connections[userID]
		for i, c := range connections {
			if c == conn {
				wsn.connections[userID] = append(connections[:i], connections[i+1:]...)
				break
			}
		}
		
		// Clean up empty connection lists
		if len(wsn.connections[userID]) == 0 {
			delete(wsn.connections, userID)
		}
		wsn.mu.Unlock()

		conn.Close()
		wsn.logger.Info("WebSocket connection closed", "user_id", userID)
	}()

	// Set up ping/pong to keep connection alive
	conn.SetPongHandler(func(string) error {
		return nil
	})

	// Read messages (mainly for connection keep-alive)
	for {
		messageType, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				wsn.logger.Error("WebSocket read error", "error", err)
			}
			break
		}

		// Handle ping messages
		if messageType == websocket.PingMessage {
			conn.WriteMessage(websocket.PongMessage, []byte{})
		}
	}
}

// NotifyJobQueued notifies that a job has been queued
func (wsn *WebSocketNotifier) NotifyJobQueued(job *Job) {
	message := WebSocketMessage{
		Type:   "job_queued",
		JobID:  job.ID,
		UserID: job.UserID,
		Data: map[string]interface{}{
			"job": job,
		},
	}

	wsn.sendToUser(job.UserID, message)
}

// NotifyJobUpdated notifies that a job status has been updated
func (wsn *WebSocketNotifier) NotifyJobUpdated(job *Job) {
	message := WebSocketMessage{
		Type:   "job_updated",
		JobID:  job.ID,
		UserID: job.UserID,
		Data: map[string]interface{}{
			"job": job,
		},
	}

	wsn.sendToUser(job.UserID, message)
}

// NotifyJobProgress sends progress updates for a job
func (wsn *WebSocketNotifier) NotifyJobProgress(jobID, userID string, progress int, message string) {
	msg := WebSocketMessage{
		Type:   "job_progress",
		JobID:  jobID,
		UserID: userID,
		Data: map[string]interface{}{
			"progress": progress,
			"message":  message,
		},
	}

	wsn.sendToUser(userID, msg)
}

// NotifyJobCompleted notifies that a job has completed
func (wsn *WebSocketNotifier) NotifyJobCompleted(job *Job) {
	message := WebSocketMessage{
		Type:   "job_completed",
		JobID:  job.ID,
		UserID: job.UserID,
		Data: map[string]interface{}{
			"job":    job,
			"result": job.Result,
		},
	}

	wsn.sendToUser(job.UserID, message)
}

// NotifyJobFailed notifies that a job has failed
func (wsn *WebSocketNotifier) NotifyJobFailed(job *Job) {
	message := WebSocketMessage{
		Type:   "job_failed",
		JobID:  job.ID,
		UserID: job.UserID,
		Data: map[string]interface{}{
			"job":   job,
			"error": job.Error,
		},
	}

	wsn.sendToUser(job.UserID, message)
}

// sendToUser sends a message to all connections for a specific user
func (wsn *WebSocketNotifier) sendToUser(userID string, message WebSocketMessage) {
	wsn.mu.RLock()
	connections := wsn.connections[userID]
	wsn.mu.RUnlock()

	if len(connections) == 0 {
		wsn.logger.Debug("No WebSocket connections for user", "user_id", userID)
		return
	}

	wsn.logger.Debug("Sending WebSocket message to user", 
		"user_id", userID, 
		"message_type", message.Type,
		"connections", len(connections))

	// Send to all user connections
	for _, conn := range connections {
		wsn.sendToConnection(conn, message)
	}
}

// sendToConnection sends a message to a specific connection
func (wsn *WebSocketNotifier) sendToConnection(conn *websocket.Conn, message WebSocketMessage) {
	messageBytes, err := json.Marshal(message)
	if err != nil {
		wsn.logger.Error("Failed to marshal WebSocket message", "error", err)
		return
	}

	err = conn.WriteMessage(websocket.TextMessage, messageBytes)
	if err != nil {
		wsn.logger.Error("Failed to send WebSocket message", "error", err)
		// Connection is likely broken, it will be cleaned up by handleConnection
	}
}

// BroadcastSystemMessage sends a system message to all connected users
func (wsn *WebSocketNotifier) BroadcastSystemMessage(messageType string, data interface{}) {
	message := WebSocketMessage{
		Type: messageType,
		Data: data,
	}

	wsn.mu.RLock()
	defer wsn.mu.RUnlock()

	wsn.logger.Info("Broadcasting system message", 
		"type", messageType, 
		"total_users", len(wsn.connections))

	for userID, connections := range wsn.connections {
		for _, conn := range connections {
			wsn.sendToConnection(conn, message)
		}
		wsn.logger.Debug("System message sent to user", "user_id", userID)
	}
}

// GetActiveConnections returns the number of active connections
func (wsn *WebSocketNotifier) GetActiveConnections() int {
	wsn.mu.RLock()
	defer wsn.mu.RUnlock()

	total := 0
	for _, connections := range wsn.connections {
		total += len(connections)
	}

	return total
}

// GetConnectedUsers returns the number of unique connected users
func (wsn *WebSocketNotifier) GetConnectedUsers() int {
	wsn.mu.RLock()
	defer wsn.mu.RUnlock()

	return len(wsn.connections)
}