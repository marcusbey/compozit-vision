# AI & 3D Visualization System

This document describes the hybrid AI and 3D visualization system implemented for Compozit Vision. The system provides both rapid AI-generated previews and detailed 3D architectural models.

## Overview

The visualization system combines:

1. **Quick AI Rendering** - Photorealistic room previews in 2-5 seconds using Stable Diffusion XL Turbo
2. **Detailed 3D Modeling** - Precise architectural 3D models generated in 30-60 seconds using Blender
3. **Background Processing** - Non-blocking job queue system with real-time WebSocket updates
4. **Progressive Enhancement** - Users get quick previews while detailed models generate in background

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Renderer   │    │  3D Generator   │    │   Job Queue     │
│                 │    │                 │    │                 │
│ - Quick renders │    │ - Room geometry │    │ - Background    │
│ - Style transfer│    │ - Furniture     │    │   processing    │
│ - Inpainting    │    │ - Materials     │    │ - Progress      │
│                 │    │ - Lighting      │    │   tracking      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           WebSocket Notifier            │
         │         (Real-time Updates)             │
         └─────────────────────────────────────────┘
```

### File Structure

```
backend/internal/infrastructure/
├── ai/
│   ├── models.go           # AI-related data structures
│   ├── renderer.go         # Main AI rendering service
│   ├── prompts.go          # Prompt engineering and optimization
│   ├── cache.go           # Result caching system
│   └── config.go          # Configuration management
├── modeling/
│   ├── models.go          # 3D modeling data structures
│   ├── generator.go       # 3D model generation
│   ├── blender.go         # Blender integration
│   ├── optimizer.go       # Model optimization for mobile/web
│   └── exporter.go        # Export floor plans, elevations
└── application/jobs/
    ├── queue.go           # Job queue management
    ├── worker.go          # Background workers
    └── websocket.go       # Real-time notifications

scripts/blender/
├── generate_scene.py      # Main 3D scene generation
└── generate_thumbnail.py  # Thumbnail generation
```

## API Endpoints

### AI Rendering

#### Quick AI Rendering (2-5 seconds)
```http
POST /api/v1/visualization/ai/render/quick
Content-Type: application/json

{
  "project_id": "uuid",
  "input_image": "base64_or_url",
  "style": "modern",
  "room_type": "living_room",
  "prompt": "optional custom prompt"
}

Response:
{
  "job_id": "job_123",
  "status": "queued",
  "estimated_time": "2-5 seconds"
}
```

#### Detailed AI Rendering (10-30 seconds)
```http
POST /api/v1/visualization/ai/render/detailed
Content-Type: application/json

{
  "project_id": "uuid",
  "input_image": "base64_or_url",
  "style": "scandinavian",
  "room_type": "bedroom",
  "furniture_items": ["bed", "nightstand", "dresser"],
  "color_scheme": ["white", "light wood"],
  "lighting": "natural daylight"
}

Response:
{
  "job_id": "job_124",
  "status": "queued",
  "estimated_time": "10-30 seconds"
}
```

#### AI Inpainting (Furniture Placement)
```http
POST /api/v1/visualization/ai/render/inpainting
Content-Type: application/json

{
  "project_id": "uuid",
  "base_image": "room_image_url",
  "mask_image": "mask_highlighting_area",
  "prompt": "modern sofa in living room",
  "strength": 0.8,
  "guidance_scale": 7.5,
  "steps": 30
}
```

### 3D Modeling

#### Generate 3D Model (30-60 seconds)
```http
POST /api/v1/visualization/3d/model/generate
Content-Type: application/json

{
  "project_id": "uuid",
  "room": {
    "dimensions": {
      "length": 5.0,
      "width": 4.0,
      "height": 2.5
    },
    "walls": [...],
    "features": [...]
  },
  "furniture": [...],
  "lights": [...],
  "materials": [...]
}

Response:
{
  "job_id": "job_125",
  "status": "queued",
  "estimated_time": "30-60 seconds"
}
```

### Job Management

#### Get Job Status
```http
GET /api/v1/visualization/jobs/{job_id}

Response:
{
  "id": "job_123",
  "status": "completed",
  "progress": 100,
  "result": {
    "result_image_url": "https://...",
    "processing_time": 3.2
  }
}
```

#### WebSocket Connection for Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:8080/api/v1/visualization/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  if (update.type === 'job_updated') {
    // Update UI with job progress
    updateJobProgress(update.data.job);
  }
};
```

## Configuration

### Environment Variables

```bash
# AI Rendering
REPLICATE_API_TOKEN=your_token_here
MAX_CONCURRENT_AI_JOBS=5
AI_JOB_TIMEOUT=5m
AI_CACHE_EXPIRATION=15m
ENABLE_AI_CACHING=true

# 3D Modeling  
BLENDER_PATH=/path/to/blender
MAX_CONCURRENT_3D_JOBS=2
MODEL_OPTIMIZATION_ENABLED=true

# Job Queue
JOB_QUEUE_SIZE=100
MAX_RETRY_ATTEMPTS=3
WEBSOCKET_ENABLED=true

# Storage
MODEL_STORAGE_PATH=./uploads/models
THUMBNAIL_STORAGE_PATH=./uploads/thumbnails
```

## Database Tables

The system uses several database tables for job tracking and result storage:

- `rendering_jobs` - Background job tracking
- `visualizations` - Visualization results
- `scenes_3d` - 3D scene data
- `export_results` - Exported files
- `ai_cache` - AI result caching

See `database_schema.sql` for complete schema.

## Performance Characteristics

### AI Rendering Performance

| Type | Time | Quality | Use Case |
|------|------|---------|----------|
| Quick | 2-5s | Good | Immediate feedback |
| Detailed | 10-30s | High | Final presentations |
| Inpainting | 15-30s | High | Furniture placement |
| Style Transfer | 15-25s | High | Design variations |

### 3D Modeling Performance

| Component | Time | Output |
|-----------|------|--------|
| Room Generation | 10-20s | Basic geometry |
| Furniture Placement | 5-10s | Positioned models |
| Lighting Setup | 2-5s | Scene lighting |
| Material Application | 3-8s | Textured surfaces |
| Model Optimization | 5-15s | Mobile-ready file |
| **Total** | **30-60s** | **Complete 3D scene** |

### File Size Targets

- **Mobile 3D Models**: < 2MB, < 3K polygons
- **Web 3D Models**: < 5MB, < 8K polygons  
- **AI Renders**: 1024x1024 PNG, ~500KB-2MB
- **Thumbnails**: 512x512 PNG, ~100-300KB

## Integration Examples

### React Native Integration

```typescript
import { VisualizationService } from './services/visualization';

const generateQuickPreview = async (image: string, style: string) => {
  // Start quick AI rendering
  const job = await VisualizationService.renderQuick({
    input_image: image,
    style: style,
    room_type: 'living_room'
  });

  // Show immediate loading state
  setLoadingState('Generating preview...');

  // Listen for real-time updates
  const ws = new WebSocket(`${WS_URL}/visualization/ws`);
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    if (update.job_id === job.job_id) {
      if (update.type === 'job_completed') {
        setPreviewImage(update.data.result.result_image_url);
        setLoadingState(null);
        
        // Start background 3D generation
        start3DGeneration();
      }
    }
  };
};

const start3DGeneration = async () => {
  const job = await VisualizationService.generate3D({
    room: roomData,
    furniture: furnitureList
  });

  // Continue listening for 3D completion
  // Show progress indicator
  setProgress3D(0);
};
```

### Mobile 3D Viewer Integration

```typescript
import { Scene3D } from '@react-three/fiber/native';

const ModelViewer = ({ modelUrl }: { modelUrl: string }) => {
  return (
    <Canvas>
      <Scene3D>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <GLTFModel url={modelUrl} />
        <OrbitControls enablePan enableZoom enableRotate />
      </Scene3D>
    </Canvas>
  );
};
```

## Monitoring and Debugging

### Health Checks

```http
GET /api/v1/visualization/status

Response:
{
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "ai_renderer": "operational",
    "3d_modeling": "operational", 
    "job_queue": "operational"
  },
  "websocket": {
    "active_connections": 15,
    "connected_users": 8
  }
}
```

### Logging

The system provides structured logging for:

- Job lifecycle events
- Performance metrics
- Error tracking
- Cache hit rates
- WebSocket connection events

### Common Issues

1. **Slow AI Rendering**
   - Check Replicate API rate limits
   - Verify network connectivity
   - Monitor cache hit rates

2. **3D Generation Failures**
   - Ensure Blender is properly installed
   - Check Python script permissions
   - Verify room data validity

3. **WebSocket Disconnections**
   - Implement reconnection logic
   - Handle missed updates gracefully
   - Use job status polling as fallback

## Future Enhancements

1. **Advanced AI Features**
   - Multiple style mixing
   - Seasonal/lighting variations
   - Texture-specific inpainting

2. **3D Enhancements**
   - Physics simulation
   - Real-time collaboration
   - VR/AR export support

3. **Performance Optimizations**
   - Edge caching
   - Progressive model loading
   - Predictive pre-generation

4. **Integration Improvements**
   - Webhook notifications
   - Batch processing
   - API rate limiting

## Development Setup

1. Install dependencies:
```bash
# Install Blender
brew install blender  # macOS

# Install Python dependencies for scripts
pip install mathutils
```

2. Set environment variables:
```bash
export REPLICATE_API_TOKEN="your_token"
export BLENDER_PATH="/usr/local/bin/blender"
```

3. Run the system:
```bash
go run cmd/server/main.go
```

4. Test the endpoints:
```bash
# Quick AI render test
curl -X POST http://localhost:8080/api/v1/visualization/ai/render/quick \
  -H "Content-Type: application/json" \
  -d '{"input_image":"test.jpg","style":"modern","room_type":"bedroom"}'
```

The visualization system is designed to provide a seamless user experience with immediate feedback and progressive enhancement, while maintaining high quality output suitable for both mobile and professional use cases.