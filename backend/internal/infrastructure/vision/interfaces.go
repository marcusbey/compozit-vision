package vision

import (
	"context"
)

// RoomAnalyzer defines the interface for room analysis services
type RoomAnalyzer interface {
	AnalyzeRoom(ctx context.Context, request AnalysisRequest) (*RoomMeasurement, error)
}

// Ensure SimpleAnalyzer implements the interface
var _ RoomAnalyzer = (*SimpleAnalyzer)(nil)