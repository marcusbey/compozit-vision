# Compozit Vision - Technical Architecture

## System Overview

Compozit Vision follows a modern, cloud-native architecture optimized for rapid MVP development and future scalability. The system consists of a React Native mobile application, serverless backend APIs, AI/ML services, and a PostgreSQL database managed by Supabase.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile Clients                            │
│  ┌─────────────────┐              ┌─────────────────┐          │
│  │   iOS (React    │              │ Android (React  │          │
│  │     Native)     │              │    Native)      │          │
│  └────────┬────────┘              └────────┬────────┘          │
│           └──────────────┬──────────────────┘                   │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Vercel)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐        │
│  │   Auth API   │  │  Core API    │  │   ML API      │        │
│  │   (Go)       │  │   (Go)       │  │  (Python)     │        │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘        │
│         └─────────────────┼───────────────────┘                 │
└───────────────────────────┼─────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data & Services Layer                         │
│  ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │   Supabase     │  │   Replicate     │  │  Redis Cache   │  │
│  │  PostgreSQL    │  │   (AI Models)   │  │   (Vercel)     │  │
│  │  + Storage     │  │                 │  │                │  │
│  └────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend - Mobile Application
- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **UI Components**: React Native Elements + Custom
- **Image Processing**: React Native Image Picker, React Native Fast Image
- **API Client**: Axios with retry logic
- **Offline Support**: React Native MMKV for local storage

### Backend Services
- **API Framework**: Go with Gin/Fiber on Vercel Functions
- **ML Services**: Python FastAPI (deployed separately)
- **Authentication**: Supabase Auth (JWT-based)
- **Real-time**: Supabase Realtime for live updates
- **Task Queue**: Vercel Cron + Supabase Functions

### Data Layer
- **Primary Database**: Supabase (PostgreSQL)
- **Object Storage**: Supabase Storage for images
- **Cache**: Vercel KV (Redis) for hot data
- **CDN**: Vercel Edge Network for static assets

### AI/ML Pipeline
- **Image Generation**: Stable Diffusion via Replicate API
- **Object Detection**: YOLO v8 for furniture recognition
- **Room Analysis**: Custom CNN model
- **Style Transfer**: Neural style transfer models

## Core Components

### 1. Mobile Application Architecture

```
mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Camera/
│   │   ├── ImageViewer/
│   │   ├── ProductList/
│   │   └── CostBreakdown/
│   ├── screens/             # Screen components
│   │   ├── Home/
│   │   ├── Capture/
│   │   ├── Design/
│   │   ├── Projects/
│   │   └── Profile/
│   ├── services/            # API and external services
│   │   ├── api/
│   │   ├── auth/
│   │   ├── storage/
│   │   └── ai/
│   ├── stores/              # Zustand stores
│   │   ├── userStore.ts
│   │   ├── projectStore.ts
│   │   └── designStore.ts
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript definitions
├── ios/                     # iOS-specific code
├── android/                 # Android-specific code
└── package.json
```

#### Key Mobile Components

**Camera Module**
- Custom camera overlay for proper framing
- Real-time edge detection for room boundaries
- Multiple photo capture for panoramic views
- Image compression before upload

**Design Viewer**
- Split-screen comparison view
- Pinch-to-zoom functionality
- Product hotspot overlays
- Swipe navigation between variations

**Offline Capabilities**
- Local project storage with MMKV
- Image caching with Fast Image
- Sync queue for offline actions
- Progressive download of product data

### 2. Backend API Architecture

```
backend/
├── api/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── handlers/            # HTTP handlers
│   │   ├── auth.go
│   │   ├── projects.go
│   │   ├── designs.go
│   │   └── products.go
│   ├── middleware/          # Auth, logging, etc.
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── rateLimit.go
│   ├── models/              # Data models
│   │   ├── user.go
│   │   ├── project.go
│   │   └── product.go
│   ├── services/            # Business logic
│   │   ├── imageService.go
│   │   ├── aiService.go
│   │   └── costService.go
│   └── utils/               # Helpers
├── ml-services/             # Python ML services
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── processors/
│   │   └── utils/
│   └── requirements.txt
└── functions/               # Vercel Functions
    ├── api/
    └── vercel.json
```

#### API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

**Projects**
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Design Generation**
- `POST /api/designs/generate` - Generate new design
- `GET /api/designs/:id` - Get design details
- `POST /api/designs/:id/variations` - Create variations
- `GET /api/designs/:id/products` - Get product list

**Products**
- `GET /api/products/search` - Search products
- `GET /api/products/:id` - Get product details
- `GET /api/products/similar/:id` - Find similar items

### 3. Database Schema

```sql
-- Users table (managed by Supabase Auth)
-- Extends auth.users with profile data
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designs table
CREATE TABLE designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    original_image_url TEXT NOT NULL,
    enhanced_image_url TEXT,
    style TEXT NOT NULL,
    room_type TEXT,
    dimensions JSONB,
    ai_metadata JSONB,
    status TEXT DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    brand TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    dimensions JSONB,
    materials TEXT[],
    colors TEXT[],
    images TEXT[],
    vendor_data JSONB,
    availability_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design products junction table
CREATE TABLE design_products (
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    position JSONB, -- x, y coordinates in design
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (design_id, product_id)
);

-- Cost estimates table
CREATE TABLE cost_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    furniture_cost DECIMAL(10, 2),
    materials_cost DECIMAL(10, 2),
    labor_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    breakdown JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_designs_project_id ON designs(project_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
```

### 4. AI/ML Pipeline

#### Image Processing Flow
```
1. Image Upload → 2. Preprocessing → 3. Room Analysis → 4. Style Application → 5. Product Matching → 6. Result Generation
```

#### ML Service Architecture
```python
# ml-services/app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import replicate
from app.processors import RoomAnalyzer, ProductMatcher
from app.models import load_models

app = FastAPI()
room_analyzer = RoomAnalyzer()
product_matcher = ProductMatcher()

class DesignRequest(BaseModel):
    image_url: str
    style: str
    room_type: str
    preferences: dict

@app.post("/api/ml/generate-design")
async def generate_design(request: DesignRequest):
    # 1. Analyze room dimensions and layout
    room_data = await room_analyzer.analyze(request.image_url)
    
    # 2. Generate enhanced design using Replicate
    enhanced_image = await replicate.run(
        "stability-ai/stable-diffusion",
        input={
            "prompt": f"{request.style} interior design, {request.room_type}",
            "image": request.image_url,
            "strength": 0.7
        }
    )
    
    # 3. Detect furniture and match products
    products = await product_matcher.match(enhanced_image, room_data)
    
    return {
        "enhanced_image_url": enhanced_image,
        "room_data": room_data,
        "products": products
    }
```

### 5. Infrastructure & Deployment

#### Vercel Deployment Configuration
```json
{
  "functions": {
    "api/[...path].go": {
      "runtime": "go1.x",
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "REPLICATE_API_TOKEN": "@replicate-api-token"
  }
}
```

#### Environment Variables
```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
REPLICATE_API_TOKEN=your-replicate-token
REDIS_URL=your-redis-url
```

### 6. Security Architecture

#### Authentication Flow
1. User registers/logs in via Supabase Auth
2. JWT token issued with custom claims
3. Token stored securely in mobile app
4. All API requests include Bearer token
5. Middleware validates token on each request

#### Security Measures
- **API Rate Limiting**: 100 requests/minute per user
- **Image Upload Validation**: Max 10MB, only JPEG/PNG
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Whitelist mobile app origins
- **Secrets Management**: Environment variables in Vercel

#### Row Level Security (RLS) Policies
```sql
-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own projects
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);
```

### 7. Performance Optimization

#### Mobile App Optimization
- **Image Optimization**: Compress before upload, lazy loading
- **Code Splitting**: Dynamic imports for screens
- **Bundle Size**: Tree shaking, minimize dependencies
- **Caching Strategy**: Aggressive caching with versioning

#### Backend Optimization
- **Database**: Connection pooling, query optimization
- **Caching**: Redis for frequently accessed data
- **CDN**: Vercel Edge Network for static assets
- **API Response**: Pagination, field filtering

#### Monitoring & Observability
- **Error Tracking**: Sentry for mobile and backend
- **Performance**: Vercel Analytics
- **Uptime**: Vercel Status + custom health checks
- **Logs**: Vercel Logs + Supabase Logs

### 8. Scalability Considerations

#### Horizontal Scaling
- Stateless API design for easy scaling
- Vercel automatically scales functions
- Supabase handles database scaling
- CDN for global content delivery

#### Vertical Scaling
- Upgrade Vercel plan for more resources
- Increase Supabase compute units
- Optimize ML models for inference speed

#### Future Architecture Evolution
1. **Microservices**: Split monolithic API
2. **Event-Driven**: Add message queue (SQS/Pub-Sub)
3. **GraphQL**: For flexible client queries
4. **Edge Computing**: Process images at edge locations

## Development Workflow

### Local Development
```bash
# Mobile app
cd mobile
npm install
npm run ios     # or npm run android

# Backend API
cd backend/api
go mod download
go run cmd/server/main.go

# ML Services
cd backend/ml-services
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### CI/CD Pipeline
1. **Code Push**: Developer pushes to GitHub
2. **PR Checks**: Linting, tests, build verification
3. **Preview Deploy**: Vercel creates preview URL
4. **Merge to Main**: Automatic production deploy
5. **Mobile Release**: Fastlane for app store deployment

## Conclusion

This architecture provides a solid foundation for the Compozit Vision MVP while maintaining flexibility for future growth. The serverless approach minimizes operational overhead, while the modular design allows for easy feature additions and scaling as the user base grows.