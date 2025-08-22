# Compozit Vision - Claude Development Guidelines

This document defines the development standards, clean architecture principles, and AI agent guidelines for the Compozit Vision project. All contributors and AI agents must follow these rules to maintain code quality and consistency.

## Table of Contents
1. [Clean Architecture Principles](#clean-architecture-principles)
2. [Clean Code Standards](#clean-code-standards)
3. [Git Branch Strategy](#git-branch-strategy)
4. [Testing Requirements](#testing-requirements)
5. [AI Agent Specialization](#ai-agent-specialization)
6. [MCP Integration Guidelines](#mcp-integration-guidelines)
7. [Code Review Checklist](#code-review-checklist)

## Clean Architecture Principles

### 1. Dependency Rule
The dependency rule states that source code dependencies must point only inward, toward higher-level policies.

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│     (React Native Components)           │
├─────────────────────────────────────────┤
│          Application Layer              │
│      (Business Logic, Use Cases)        │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│    (Entities, Domain Services)          │
├─────────────────────────────────────────┤
│        Infrastructure Layer             │
│    (APIs, Database, External Services)  │
└─────────────────────────────────────────┘
```

### 2. Layer Responsibilities

#### Presentation Layer (UI)
- React Native components and screens
- User input handling
- Display logic only
- No business logic

```typescript
// ✅ Good: Presentation logic only
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(product.id)}>
      <Text>{product.name}</Text>
      <Text>${product.price}</Text>
    </TouchableOpacity>
  );
};

// ❌ Bad: Business logic in component
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const calculateDiscount = () => {
    // Business logic should not be here
    return product.price * 0.9;
  };
};
```

#### Application Layer (Use Cases)
- Orchestrates business operations
- Implements use cases
- Coordinates between layers
- No UI or infrastructure concerns

```typescript
// ✅ Good: Clean use case
export class GenerateDesignUseCase {
  constructor(
    private imageRepository: IImageRepository,
    private aiService: IAIService,
    private productService: IProductService
  ) {}

  async execute(imageUrl: string, style: string): Promise<Design> {
    const processedImage = await this.imageRepository.process(imageUrl);
    const enhancedDesign = await this.aiService.generateDesign(processedImage, style);
    const products = await this.productService.matchProducts(enhancedDesign);
    
    return new Design(enhancedDesign, products);
  }
}
```

#### Domain Layer (Core Business)
- Business entities
- Business rules
- Domain services
- No external dependencies

```typescript
// ✅ Good: Pure domain entity
export class Project {
  constructor(
    private id: string,
    private name: string,
    private designs: Design[],
    private status: ProjectStatus
  ) {}

  addDesign(design: Design): void {
    if (this.status === ProjectStatus.COMPLETED) {
      throw new Error('Cannot add design to completed project');
    }
    this.designs.push(design);
  }

  calculateTotalCost(): number {
    return this.designs.reduce((total, design) => 
      total + design.estimatedCost, 0
    );
  }
}
```

#### Infrastructure Layer
- External service implementations
- Database access
- API clients
- File system operations

```typescript
// ✅ Good: Infrastructure implementation
export class SupabaseImageRepository implements IImageRepository {
  async upload(file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(`${Date.now()}-${file.name}`, file);
    
    if (error) throw new Error(error.message);
    return data.path;
  }
}
```

### 3. Dependency Injection

Always use dependency injection to maintain loose coupling:

```typescript
// ✅ Good: Dependencies injected
export class DesignService {
  constructor(
    private readonly imageRepo: IImageRepository,
    private readonly aiService: IAIService
  ) {}
}

// ❌ Bad: Direct instantiation
export class DesignService {
  private imageRepo = new SupabaseImageRepository(); // Tight coupling
}
```

## Clean Code Standards

### 1. Naming Conventions

#### TypeScript/JavaScript
```typescript
// Classes: PascalCase
class UserProfile { }

// Interfaces: PascalCase with 'I' prefix
interface IUserService { }

// Functions/Methods: camelCase
function calculateTotalCost() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;

// Files: kebab-case
// user-profile.service.ts
// design-generator.util.ts
```

#### Go
```go
// Exported: PascalCase
type UserService struct { }

// Unexported: camelCase
type userRepository struct { }

// Interfaces: -er suffix
type Reader interface { }

// Files: lowercase
// userservice.go
```

### 2. Function Design

#### Single Responsibility
```typescript
// ✅ Good: Does one thing
function calculatePrice(basePrice: number, taxRate: number): number {
  return basePrice * (1 + taxRate);
}

// ❌ Bad: Does multiple things
function processOrder(order: Order): void {
  // Validates order
  // Calculates price
  // Sends email
  // Updates inventory
  // Too many responsibilities!
}
```

#### Pure Functions
```typescript
// ✅ Good: Pure function
function addProduct(products: Product[], newProduct: Product): Product[] {
  return [...products, newProduct];
}

// ❌ Bad: Side effects
let products: Product[] = [];
function addProduct(newProduct: Product): void {
  products.push(newProduct); // Modifies external state
}
```

### 3. Error Handling

#### TypeScript/React Native
```typescript
// ✅ Good: Explicit error handling
export async function fetchUserProfile(userId: string): Promise<Result<UserProfile, Error>> {
  try {
    const response = await api.get(`/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: new Error(`Failed to fetch user: ${error.message}`) };
  }
}

// Using the result
const result = await fetchUserProfile(userId);
if (result.success) {
  setProfile(result.data);
} else {
  showError(result.error.message);
}
```

#### Go
```go
// ✅ Good: Error as return value
func GetUser(id string) (*User, error) {
    user, err := db.FindUser(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user %s: %w", id, err)
    }
    return user, nil
}
```

### 4. Code Organization

#### File Structure
```
src/
├── domain/              # Core business logic
│   ├── entities/
│   ├── services/
│   └── interfaces/
├── application/         # Use cases
│   ├── use-cases/
│   └── dto/
├── infrastructure/      # External concerns
│   ├── api/
│   ├── database/
│   └── services/
└── presentation/        # UI layer
    ├── screens/
    ├── components/
    └── hooks/
```

## Git Branch Strategy

### 1. Branch Naming Convention

```bash
# Feature branches
feature/add-image-upload
feature/implement-cost-calculator

# Bug fixes
bugfix/fix-camera-crash
bugfix/resolve-api-timeout

# Hotfixes (urgent production fixes)
hotfix/critical-auth-issue

# Release branches
release/v1.0.0

# Chore/maintenance
chore/update-dependencies
chore/refactor-api-client
```

### 2. Git Flow Process

```
main
  │
  ├── develop
  │     │
  │     ├── feature/user-authentication
  │     ├── feature/design-generation
  │     └── feature/product-search
  │
  ├── release/v1.0.0
  │
  └── hotfix/critical-bug
```

### 3. Branch Rules

#### Feature Development
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Work on feature
git add .
git commit -m "feat: implement user authentication"

# 3. Keep branch updated
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git rebase develop

# 4. Push and create PR
git push origin feature/your-feature-name
```

#### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Examples:
```bash
feat(auth): add biometric authentication support

fix(camera): resolve crash on Android 12 devices

refactor(api): optimize image upload performance
```

### 4. Pull Request Process

1. **Create PR with template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

2. **Review Requirements**:
- At least 1 code review approval
- All tests passing
- No merge conflicts
- Follows clean code standards

## Testing Requirements

### 1. Test Coverage Standards

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Image processing, API response times

### 2. Testing Pyramid

```
         /\
        /E2E\        5%
       /------\
      /  Integ  \    15%
     /----------\
    /    Unit    \   80%
   /--------------\
```

### 3. Test Structure

#### React Native Testing
```typescript
// ✅ Good: Comprehensive test
describe('ProductCard', () => {
  it('should display product information', () => {
    const product = mockProduct();
    const { getByText } = render(<ProductCard product={product} />);
    
    expect(getByText(product.name)).toBeTruthy();
    expect(getByText(`$${product.price}`)).toBeTruthy();
  });

  it('should call onSelect when pressed', () => {
    const onSelect = jest.fn();
    const product = mockProduct();
    const { getByTestId } = render(
      <ProductCard product={product} onSelect={onSelect} />
    );
    
    fireEvent.press(getByTestId('product-card'));
    expect(onSelect).toHaveBeenCalledWith(product.id);
  });
});
```

#### Go Testing
```go
func TestUserService_GetUser(t *testing.T) {
    // Arrange
    mockRepo := &MockUserRepository{}
    service := NewUserService(mockRepo)
    expectedUser := &User{ID: "123", Name: "John"}
    mockRepo.On("FindByID", "123").Return(expectedUser, nil)
    
    // Act
    user, err := service.GetUser("123")
    
    // Assert
    assert.NoError(t, err)
    assert.Equal(t, expectedUser, user)
    mockRepo.AssertExpectations(t)
}
```

### 4. Testing Commands

```bash
# Run all tests before committing
npm run test:unit
npm run test:integration
npm run test:e2e

# Go tests
go test ./...
go test -cover ./...

# Pre-push hook
npm run test:all && npm run lint
```

## AI Agent Specialization

### 1. Frontend/Design Agent

When implementing UI/UX features, configure your AI agent with:

```yaml
agent_config:
  role: "Frontend Developer & UI/UX Designer"
  expertise:
    - React Native development
    - Mobile UI patterns
    - Accessibility standards
    - Animation and gestures
    - Design systems
  
  context:
    - Current design system documentation
    - Figma/design files
    - Component library
    - Brand guidelines
  
  tools:
    - React Native DevTools
    - Flipper for debugging
    - Color contrast analyzers
    - Performance profilers
```

**Example prompt for frontend agent:**
```
You are a senior React Native developer with strong UI/UX design skills. 
You understand mobile design patterns, accessibility requirements, and 
performance optimization. Always consider:

1. Platform-specific guidelines (iOS HIG, Material Design)
2. Responsive design for different screen sizes
3. Touch target sizes (minimum 44x44 pts)
4. Loading states and error handling
5. Smooth animations (60 FPS)
```

### 2. Backend/API Agent

```yaml
agent_config:
  role: "Backend Engineer"
  expertise:
    - Go development
    - RESTful API design
    - Database optimization
    - Security best practices
    - Performance tuning
  
  context:
    - API documentation
    - Database schema
    - Service architecture
    - Security requirements
```

### 3. AI/ML Agent

```yaml
agent_config:
  role: "ML Engineer"
  expertise:
    - Computer vision
    - Image processing
    - Model optimization
    - Python/FastAPI
    - ML deployment
  
  context:
    - Model architectures
    - Training data specs
    - Performance benchmarks
    - Inference optimization
```

### 4. Testing Agent

```yaml
agent_config:
  role: "QA Engineer"
  expertise:
    - Test automation
    - Test strategy
    - Performance testing
    - Security testing
    - Accessibility testing
  
  context:
    - Test coverage reports
    - Bug history
    - User feedback
    - Performance metrics
```

## MCP Integration Guidelines

### 1. When to Use MCPs

Use Model Context Protocols when:
- Working with complex external systems
- Need specialized domain knowledge
- Integrating with third-party services
- Accessing real-time data

### 2. Recommended MCPs for Compozit Vision

#### Database MCP
```yaml
mcp: supabase-mcp
purpose: "Direct database access and real-time subscriptions"
use_cases:
  - Complex queries
  - Real-time updates
  - Database migrations
  - Performance monitoring
```

#### Design System MCP
```yaml
mcp: figma-mcp
purpose: "Sync design tokens and components"
use_cases:
  - Import color schemes
  - Update typography
  - Sync component specs
  - Export assets
```

#### Analytics MCP
```yaml
mcp: analytics-mcp
purpose: "User behavior and performance tracking"
use_cases:
  - Track user flows
  - Monitor performance
  - A/B testing
  - Conversion tracking
```

#### Image Processing MCP
```yaml
mcp: image-processing-mcp
purpose: "Advanced image manipulation"
use_cases:
  - Image optimization
  - Format conversion
  - Metadata extraction
  - Batch processing
```

### 3. MCP Implementation Pattern

```typescript
// Example: Using Supabase MCP for complex queries
export class EnhancedProductService {
  constructor(
    private supabaseMCP: ISupabaseMCP,
    private cacheMCP: ICacheMCP
  ) {}

  async findSimilarProducts(
    productId: string, 
    options: SimilarityOptions
  ): Promise<Product[]> {
    // Check cache first
    const cached = await this.cacheMCP.get(`similar:${productId}`);
    if (cached) return cached;

    // Use MCP for complex vector similarity search
    const products = await this.supabaseMCP.query({
      from: 'products',
      select: '*',
      vectorSearch: {
        column: 'embedding',
        similarTo: productId,
        threshold: options.threshold,
        limit: options.limit
      }
    });

    // Cache results
    await this.cacheMCP.set(`similar:${productId}`, products, 3600);
    
    return products;
  }
}
```

## Code Review Checklist

### Pre-Submission Checklist

- [ ] **Clean Architecture**
  - [ ] Dependencies point inward
  - [ ] No business logic in UI
  - [ ] Proper layer separation
  - [ ] Dependency injection used

- [ ] **Clean Code**
  - [ ] Functions do one thing
  - [ ] Meaningful names
  - [ ] No magic numbers
  - [ ] DRY principle followed
  - [ ] SOLID principles applied

- [ ] **Testing**
  - [ ] Unit tests written
  - [ ] Integration tests for APIs
  - [ ] Edge cases covered
  - [ ] Mocks properly used
  - [ ] Coverage > 80%

- [ ] **Performance**
  - [ ] No N+1 queries
  - [ ] Proper caching
  - [ ] Image optimization
  - [ ] Bundle size checked

- [ ] **Security**
  - [ ] Input validation
  - [ ] No hardcoded secrets
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] Authentication checked

- [ ] **Documentation**
  - [ ] Functions documented
  - [ ] Complex logic explained
  - [ ] API docs updated
  - [ ] README updated if needed

### Review Process

1. **Self Review**: Use checklist above
2. **Automated Checks**: Ensure CI passes
3. **Peer Review**: At least one approval
4. **Testing**: Manual testing of feature
5. **Merge**: Squash and merge to develop

## Development Commands Reference

```bash
# Development
npm run dev:mobile      # Start React Native
npm run dev:backend     # Start backend services
npm run dev:ml          # Start ML services

# Testing
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Linting
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix issues
npm run format          # Prettier format

# Building
npm run build:ios       # Build iOS app
npm run build:android   # Build Android app
npm run build:backend   # Build backend

# Git hooks (automatic)
pre-commit             # Lint and format
pre-push               # Run tests

# Feature development
./scripts/new-feature.sh feature-name  # Create new feature branch
./scripts/finish-feature.sh            # Merge feature to develop
```

## Continuous Improvement

This document is a living guide. Update it when:
- New patterns emerge
- Better practices are discovered
- Team decisions change standards
- Tools or technologies change

Last updated: [Current Date]
Version: 1.0.0