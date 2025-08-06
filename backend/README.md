# Compozit Vision Backend API

A comprehensive backend API for the Compozit Vision interior design platform, built with Go, Gin, and Supabase.

## 🏗️ Architecture Overview

This backend follows Clean Architecture principles with clear separation of concerns:

```
backend/
├── cmd/api/                # Application entrypoints
├── internal/               # Private application code
│   ├── config/            # Configuration management
│   ├── database/          # Database connection and utilities
│   ├── handlers/          # HTTP request handlers
│   ├── middleware/        # HTTP middleware
│   ├── models/            # Domain models and DTOs
│   └── services/          # Business logic interfaces
├── migrations/            # Database migrations
├── scripts/               # Development and deployment scripts
├── supabase/             # Supabase configuration and seeds
└── api/                  # Vercel serverless functions
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21 or later
- PostgreSQL (or Supabase account)
- (Optional) Supabase CLI for local development

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   go mod tidy
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations (if using direct PostgreSQL):**
   ```bash
   chmod +x scripts/migrate.sh
   ./scripts/migrate.sh up
   ./scripts/migrate.sh seed
   ```

5. **Start the development server:**
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

The API will be available at `http://localhost:8080`

## 🌐 API Endpoints

### Health Check Endpoints
- `GET /health` - Comprehensive health check with database status
- `GET /ready` - Readiness probe for Kubernetes/containers
- `GET /live` - Liveness probe for Kubernetes/containers

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete user account

### Project Endpoints
- `GET /api/v1/projects` - List user projects (paginated)
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Design Endpoints
- `GET /api/v1/designs` - List designs (with filtering)
- `POST /api/v1/designs` - Create new design
- `GET /api/v1/designs/:id` - Get design details
- `POST /api/v1/designs/:id/generate` - Generate AI design

### Image Endpoints
- `GET /api/v1/images` - List user images
- `POST /api/v1/images/upload` - Upload new image

### Product Endpoints
- `GET /api/v1/products` - List/search products
- `GET /api/v1/products/:id` - Get product details

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    budget DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Designs Table
```sql
CREATE TABLE designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    style VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    original_image_id UUID REFERENCES images(id),
    generated_image_id UUID REFERENCES images(id),
    estimated_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Images Table
```sql
CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    design_id UUID REFERENCES designs(id),
    type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    image_url TEXT,
    product_url TEXT,
    affiliate_url TEXT,
    availability BOOLEAN DEFAULT TRUE,
    match_confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Authentication & Authorization

### JWT Token Authentication
- All protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header
- Tokens are validated using Supabase Auth
- User ID is extracted from the token and available in request context

### Row Level Security (RLS)
- All tables have RLS policies enabled
- Users can only access their own data
- Products are publicly readable
- Service role has full access for admin operations

### Middleware Stack
1. **Recovery Middleware** - Panic recovery with graceful error responses
2. **CORS Middleware** - Cross-origin request handling
3. **Logging Middleware** - Request/response logging with request IDs
4. **Authentication Middleware** - JWT token validation (protected routes only)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 8080 | No |
| `GIN_MODE` | Gin framework mode | debug | No |
| `ENVIRONMENT` | Application environment | development | No |
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | Yes |
| `DB_HOST` | Database host | localhost | Yes |
| `DB_PORT` | Database port | 5432 | No |
| `DB_NAME` | Database name | postgres | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_SSL_MODE` | SSL mode | disable | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | http://localhost:3000 | No |
| `MAX_UPLOAD_SIZE` | Max file upload size | 10485760 (10MB) | No |
| `OPENAI_API_KEY` | OpenAI API key | - | No |
| `REPLICATE_API_TOKEN` | Replicate API token | - | No |

## 🚀 Deployment

### Vercel Deployment

1. **Configure vercel.json** (already included):
   ```json
   {
     "version": 2,
     "functions": {
       "backend/cmd/api/main.go": {
         "runtime": "go1.x"
       }
     },
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/backend/cmd/api/main.go"
       }
     ]
   }
   ```

2. **Set environment variables in Vercel:**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add DB_PASSWORD
   # ... add all required environment variables
   ```

3. **Deploy:**
   ```bash
   vercel deploy
   ```

### Docker Deployment

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o api cmd/api/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/api .
EXPOSE 8080
CMD ["./api"]
```

### Local Development with Supabase

1. **Install Supabase CLI:**
   ```bash
   npm install -g @supabase/cli
   ```

2. **Start Supabase locally:**
   ```bash
   cd supabase
   supabase start
   ```

3. **Run migrations:**
   ```bash
   supabase db push
   ```

4. **Start the API:**
   ```bash
   ./scripts/dev.sh
   ```

## 🧪 Testing

### Unit Tests
```bash
go test ./internal/...
```

### Integration Tests
```bash
go test -tags=integration ./tests/...
```

### API Tests with curl
```bash
# Health check
curl -X GET http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛠️ Development Scripts

### Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/dev.sh` | Start development server |
| `./scripts/migrate.sh up` | Run database migrations |
| `./scripts/migrate.sh down` | Rollback migrations |
| `./scripts/migrate.sh reset` | Reset and rerun migrations |
| `./scripts/migrate.sh seed` | Insert seed data |

### Adding New Migrations

1. **Create migration files:**
   ```bash
   # Create new migration
   migrate create -ext sql -dir migrations -seq add_new_table
   ```

2. **Edit the up and down files:**
   ```sql
   -- 003_add_new_table.up.sql
   CREATE TABLE new_table (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- 003_add_new_table.down.sql
   DROP TABLE IF EXISTS new_table;
   ```

3. **Run the migration:**
   ```bash
   ./scripts/migrate.sh up
   ```

## 📊 Monitoring & Observability

### Health Checks
- `/health` - Comprehensive health check
- `/ready` - Readiness probe
- `/live` - Liveness probe

### Logging
- Structured JSON logging
- Request ID tracking
- Error stack traces
- Performance metrics

### Metrics (Future Implementation)
- Request latency
- Error rates
- Database connection pool stats
- Memory and CPU usage

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Supabase Auth integration
- Password hashing with bcrypt

### Authorization
- Row Level Security (RLS) policies
- User-scoped data access
- Admin role separation

### Data Protection
- SQL injection prevention
- XSS protection headers
- CORS configuration
- Input validation
- File upload restrictions

### Best Practices
- Environment variable management
- Secure password policies
- API rate limiting (future)
- Audit logging (future)

## 🚧 Roadmap & TODOs

### Phase 1: Core Infrastructure ✅
- [x] Project structure setup
- [x] Database schema design
- [x] Basic CRUD operations
- [x] Authentication middleware
- [x] Deployment configuration

### Phase 2: Business Logic (Next)
- [ ] User service implementation
- [ ] Project management logic
- [ ] File upload handling
- [ ] Email notifications

### Phase 3: AI Integration
- [ ] OpenAI integration
- [ ] Image processing pipeline
- [ ] Design generation
- [ ] Product matching

### Phase 4: Advanced Features
- [ ] Real-time updates
- [ ] Webhooks
- [ ] Analytics
- [ ] Caching layer

## 🤝 Contributing

### Code Style
- Follow Go conventions and best practices
- Use `gofmt` for code formatting
- Add comprehensive tests
- Update documentation

### Pull Request Process
1. Create feature branch from `develop`
2. Follow commit message conventions
3. Add tests for new features
4. Update documentation
5. Submit PR with description

### Development Environment
```bash
# Install development tools
go install golang.org/x/tools/cmd/goimports@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run linter
golangci-lint run

# Format code
gofmt -w .
goimports -w .
```

## 📞 Support

For issues and questions:
- Create GitHub issues for bugs and feature requests
- Check existing documentation
- Review API endpoint specifications

---

**Built with ❤️ for Compozit Vision**