# Backend Deployment Guide

This document provides detailed instructions for deploying the Compozit Vision backend API to various platforms.

## 🌐 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- Supabase project
- Git repository

### Step 1: Set Up Supabase Project

1. **Create a new Supabase project:**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Choose your organization
   # Set project name: "compozit-vision"
   # Set database password
   # Select region closest to your users
   ```

2. **Get your project credentials:**
   ```bash
   # Navigate to Settings > API
   # Copy these values:
   # - Project URL
   # - anon/public key
   # - service_role key (keep secret!)
   ```

3. **Set up the database:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy contents of backend/migrations/001_initial_schema.up.sql
   -- Copy contents of backend/migrations/002_rls_policies.up.sql
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project root:**
   ```bash
   # From /Users/marcusbey/Desktop/02-CS/05-Startup/compozit/app/compozit-vision/
   vercel deploy
   ```

4. **Set environment variables:**
   ```bash
   # Production environment
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   vercel env add DB_HOST production
   vercel env add DB_PORT production
   vercel env add DB_NAME production
   vercel env add DB_USER production
   vercel env add DB_PASSWORD production
   vercel env add JWT_SECRET production
   vercel env add CORS_ALLOWED_ORIGINS production
   
   # Preview environment (optional)
   vercel env add SUPABASE_URL preview
   # ... repeat for other variables
   
   # Development environment (optional)
   vercel env add SUPABASE_URL development
   # ... repeat for other variables
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Step 3: Verify Deployment

```bash
# Test your deployed API
curl https://your-app.vercel.app/health
curl https://your-app.vercel.app/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-06T19:55:36.874477Z",
  "version": "1.0.0",
  "services": {
    "api": "up",
    "database": "up"
  }
}
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM golang:1.21-alpine AS builder

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api cmd/api/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/api .

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./api"]
```

### Docker Compose (for local development)
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - GIN_MODE=release
      - ENVIRONMENT=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=compozit_vision
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Deploy

```bash
# Build the image
docker build -t compozit-vision-api .

# Run locally
docker run -p 8080:8080 --env-file .env compozit-vision-api

# Or with docker-compose
docker-compose up -d
```

## ☁️ Cloud Provider Deployments

### AWS Lambda (with AWS SAM)

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 512
    Runtime: go1.x

Resources:
  CompozitVisionAPI:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: backend/
      Handler: bootstrap
      Events:
        CatchAll:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
      Environment:
        Variables:
          SUPABASE_URL: !Ref SupabaseURL
          SUPABASE_ANON_KEY: !Ref SupabaseAnonKey
          DB_HOST: !Ref DBHost
          DB_PASSWORD: !Ref DBPassword
          # ... other environment variables

Parameters:
  SupabaseURL:
    Type: String
    Description: Supabase project URL
  SupabaseAnonKey:
    Type: String
    Description: Supabase anonymous key
  DBHost:
    Type: String
    Description: Database host
  DBPassword:
    Type: String
    NoEcho: true
    Description: Database password
```

```bash
# Build and deploy
sam build
sam deploy --guided
```

### Google Cloud Run

```bash
# Build and push to Google Container Registry
docker build -t gcr.io/PROJECT_ID/compozit-vision-api .
docker push gcr.io/PROJECT_ID/compozit-vision-api

# Deploy to Cloud Run
gcloud run deploy compozit-vision-api \
  --image gcr.io/PROJECT_ID/compozit-vision-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" \
  --port 8080
```

### Azure Container Instances

```bash
# Create resource group
az group create --name compozit-vision --location eastus

# Deploy container
az container create \
  --resource-group compozit-vision \
  --name compozit-vision-api \
  --image compozit-vision-api:latest \
  --ports 8080 \
  --environment-variables \
    SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --secure-environment-variables \
    DB_PASSWORD=$DB_PASSWORD \
    JWT_SECRET=$JWT_SECRET
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    
    - name: Install dependencies
      run: go mod download
    
    - name: Run tests
      run: go test -v ./...
    
    - name: Build
      run: go build -v ./cmd/api
    
    - name: Lint
      uses: golangci/golangci-lint-action@v3
      with:
        version: latest
        working-directory: backend

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Environment Secrets

Set these secrets in your GitHub repository:

```bash
# GitHub repository settings > Secrets and variables > Actions
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
```

## 🎯 Production Checklist

### Before Deployment

- [ ] Environment variables are set correctly
- [ ] Database migrations are applied
- [ ] Supabase RLS policies are enabled
- [ ] JWT secret is secure and random
- [ ] CORS origins are properly configured
- [ ] File upload limits are set
- [ ] Health checks are working
- [ ] Tests are passing
- [ ] Documentation is updated

### Security Checklist

- [ ] No hardcoded secrets in code
- [ ] Environment variables are properly secured
- [ ] Database uses SSL/TLS in production
- [ ] API rate limiting is configured (if applicable)
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] SQL injection prevention is in place
- [ ] XSS protection headers are set

### Performance Checklist

- [ ] Database indexes are optimized
- [ ] Connection pooling is configured
- [ ] Caching is implemented where appropriate
- [ ] File uploads are size-limited
- [ ] API responses are paginated
- [ ] Database queries are optimized
- [ ] Monitoring is set up

### Monitoring Setup

```bash
# Set up health check monitoring
# Example with Uptime Robot, Pingdom, or similar service

# Monitor these endpoints:
# - https://your-api.vercel.app/health
# - https://your-api.vercel.app/ready

# Alert on:
# - HTTP status codes != 200
# - Response time > 2 seconds
# - Database connection failures
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failures
```bash
# Check database credentials
# Verify firewall settings
# Confirm SSL requirements
# Test connection manually:
psql "postgresql://user:password@host:port/dbname?sslmode=require"
```

#### 2. CORS Errors
```bash
# Verify CORS_ALLOWED_ORIGINS includes your frontend domain
# Check preflight requests
# Ensure credentials are properly configured
```

#### 3. JWT Token Issues
```bash
# Verify JWT_SECRET is set
# Check token expiration
# Validate token format
# Confirm Supabase auth configuration
```

#### 4. File Upload Problems
```bash
# Check MAX_UPLOAD_SIZE setting
# Verify storage permissions
# Confirm file type validations
# Test with curl:
curl -X POST -F "file=@test.jpg" http://localhost:8080/api/v1/images/upload
```

### Debugging Commands

```bash
# View application logs
vercel logs your-deployment-url

# Test database connection
go run cmd/api/main.go

# Validate environment variables
printenv | grep -E "(SUPABASE|DB_|JWT_)"

# Test API endpoints
curl -v https://your-api.vercel.app/health
```

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Go Documentation](https://golang.org/doc/)
- [Gin Framework Documentation](https://gin-gonic.com/docs/)

---

**Need help?** Create an issue in the GitHub repository with:
- Deployment platform
- Error messages
- Configuration details (without secrets)
- Steps to reproduce