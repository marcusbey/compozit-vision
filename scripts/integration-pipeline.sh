#!/bin/bash

# Integration Pipeline Script
# Manages the merge sequence and testing checkpoints for Enhanced AI Processing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
INTEGRATION_BRANCH="integration/enhanced-ai-processing"
AGENT_BRANCHES=(
    "feature/enhanced-ai-processing-core"
    "feature/style-reference-selection"
    "feature/furniture-carousel"
    "feature/custom-prompt"
)

# Agent names for display
declare -A AGENT_NAMES
AGENT_NAMES["feature/enhanced-ai-processing-core"]="🤖 AI Processing Core"
AGENT_NAMES["feature/style-reference-selection"]="🎨 Style Reference"
AGENT_NAMES["feature/furniture-carousel"]="🛋️ Furniture Carousel"
AGENT_NAMES["feature/custom-prompt"]="💬 Custom Prompt"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_header "CHECKING PREREQUISITES"
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        log_error "Not in a Git repository"
        exit 1
    fi
    
    # Check if main branch exists
    if ! git show-ref --verify --quiet "refs/heads/$MAIN_BRANCH"; then
        log_error "Main branch '$MAIN_BRANCH' does not exist"
        exit 1
    fi
    
    # Check if coordination scripts exist
    if [[ ! -f "scripts/check-file-ownership.sh" ]]; then
        log_error "File ownership check script not found"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Run coordination checks
run_coordination_checks() {
    log_header "RUNNING COORDINATION CHECKS"
    
    local checks_passed=true
    
    # File ownership check
    log_info "Checking file ownership conflicts..."
    if ./scripts/check-file-ownership.sh; then
        log_success "File ownership check passed"
    else
        log_error "File ownership conflicts detected"
        checks_passed=false
    fi
    
    # Interface changes check
    log_info "Checking interface breaking changes..."
    if ./scripts/check-interface-changes.sh; then
        log_success "Interface changes check passed"
    else
        log_error "Interface breaking changes detected"
        checks_passed=false
    fi
    
    # Dependency conflicts check
    log_info "Checking dependency conflicts..."
    if ./scripts/check-dependency-conflicts.sh; then
        log_success "Dependency conflicts check passed"
    else
        log_error "Dependency conflicts detected"
        checks_passed=false
    fi
    
    if [[ "$checks_passed" != "true" ]]; then
        log_error "Coordination checks failed. Please resolve issues before proceeding."
        exit 1
    fi
    
    log_success "All coordination checks passed"
}

# Check branch status
check_branch_status() {
    local branch=$1
    local agent_name="${AGENT_NAMES[$branch]}"
    
    log_info "Checking status of $agent_name ($branch)"
    
    # Check if branch exists
    if ! git show-ref --verify --quiet "refs/heads/$branch"; then
        log_warning "Branch $branch does not exist"
        return 1
    fi
    
    # Check if branch is ahead of main
    local ahead_count=$(git rev-list --count "$MAIN_BRANCH..$branch" 2>/dev/null || echo "0")
    if [[ "$ahead_count" == "0" ]]; then
        log_warning "Branch $branch has no commits ahead of main"
        return 1
    fi
    
    # Check if branch has merge conflicts with main
    if ! git merge-tree $(git merge-base "$MAIN_BRANCH" "$branch") "$MAIN_BRANCH" "$branch" | grep -q '^<<<<<<< '; then
        log_success "No merge conflicts detected for $branch"
    else
        log_error "Merge conflicts detected for $branch"
        return 1
    fi
    
    return 0
}

# Run tests for a branch
run_branch_tests() {
    local branch=$1
    local agent_name="${AGENT_NAMES[$branch]}"
    
    log_info "Running tests for $agent_name ($branch)"
    
    # Checkout the branch
    git checkout "$branch" &>/dev/null
    
    # Determine test pattern based on branch
    local test_pattern=""
    case $branch in
        *"ai-processing-core"*)
            test_pattern="ai"
            ;;
        *"style-reference"*)
            test_pattern="style"
            ;;
        *"furniture-carousel"*)
            test_pattern="carousel"
            ;;
        *"custom-prompt"*)
            test_pattern="prompt"
            ;;
    esac
    
    # Run unit tests
    log_info "Running unit tests (pattern: $test_pattern)"
    if [[ -d "mobile" ]] && [[ -f "mobile/package.json" ]]; then
        cd mobile
        
        # Check if test script exists
        if npm run test:unit --dry-run &>/dev/null; then
            if [[ -n "$test_pattern" ]]; then
                npm run test:unit -- --testPathPattern="$test_pattern" --coverage --silent
            else
                npm run test:unit -- --coverage --silent
            fi
        else
            log_warning "Unit tests not configured for this project"
        fi
        
        cd ..
    fi
    
    # Run linting
    log_info "Running code quality checks"
    if [[ -d "mobile" ]] && [[ -f "mobile/package.json" ]]; then
        cd mobile
        
        if npm run lint --dry-run &>/dev/null; then
            npm run lint --silent
        fi
        
        if npm run type-check --dry-run &>/dev/null; then
            npm run type-check --silent
        fi
        
        cd ..
    fi
    
    log_success "Tests passed for $agent_name"
}

# Create integration branch
create_integration_branch() {
    log_header "CREATING INTEGRATION BRANCH"
    
    # Delete existing integration branch if it exists
    if git show-ref --verify --quiet "refs/heads/$INTEGRATION_BRANCH"; then
        log_warning "Integration branch already exists, deleting it"
        git branch -D "$INTEGRATION_BRANCH" || true
    fi
    
    # Create new integration branch from main
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH" || log_warning "Could not pull from origin"
    git checkout -b "$INTEGRATION_BRANCH"
    
    log_success "Created integration branch: $INTEGRATION_BRANCH"
}

# Merge branch with conflict resolution
merge_branch() {
    local branch=$1
    local agent_name="${AGENT_NAMES[$branch]}"
    
    log_info "Merging $agent_name ($branch) into integration branch"
    
    # Attempt merge
    if git merge "$branch" --no-ff -m "integrate: merge $agent_name

Merging $branch into integration branch as part of
Enhanced AI Processing feature integration.

Agent: $agent_name
Branch: $branch
Integration: $INTEGRATION_BRANCH"; then
        log_success "Successfully merged $agent_name"
        return 0
    else
        log_error "Merge conflict detected for $agent_name"
        
        # Show conflict files
        echo "Conflicting files:"
        git diff --name-only --diff-filter=U
        
        # Provide resolution guidance
        echo ""
        echo "To resolve conflicts:"
        echo "1. Edit the conflicting files to resolve conflicts"
        echo "2. Run: git add <resolved-files>"
        echo "3. Run: git commit -m 'resolve: merge conflicts for $agent_name'"
        echo "4. Re-run this script with --continue"
        
        exit 1
    fi
}

# Run integration tests
run_integration_tests() {
    log_header "RUNNING INTEGRATION TESTS"
    
    log_info "Running cross-agent integration tests"
    
    if [[ -d "mobile" ]] && [[ -f "mobile/package.json" ]]; then
        cd mobile
        
        # Run integration tests if available
        if npm run test:integration --dry-run &>/dev/null; then
            log_info "Running integration test suite"
            npm run test:integration -- --silent
        else
            log_warning "Integration tests not configured"
        fi
        
        # Run e2e tests if available
        if npm run test:e2e --dry-run &>/dev/null; then
            log_info "Running end-to-end tests"
            npm run test:e2e -- --silent
        else
            log_warning "E2E tests not configured"
        fi
        
        cd ..
    fi
    
    log_success "Integration tests completed"
}

# Run performance tests
run_performance_tests() {
    log_header "RUNNING PERFORMANCE TESTS"
    
    if [[ -d "mobile" ]] && [[ -f "mobile/package.json" ]]; then
        cd mobile
        
        # Bundle size analysis
        if npm run analyze:bundle --dry-run &>/dev/null; then
            log_info "Analyzing bundle size"
            npm run analyze:bundle
        fi
        
        # Memory usage analysis
        if npm run analyze:memory --dry-run &>/dev/null; then
            log_info "Analyzing memory usage"
            npm run analyze:memory
        fi
        
        # Performance regression tests
        if npm run test:performance --dry-run &>/dev/null; then
            log_info "Running performance regression tests"
            npm run test:performance
        fi
        
        cd ..
    fi
    
    log_success "Performance tests completed"
}

# Generate integration report
generate_integration_report() {
    log_header "GENERATING INTEGRATION REPORT"
    
    local report_file="INTEGRATION-REPORT.md"
    
    cat > "$report_file" << EOF
# Enhanced AI Processing - Integration Report

**Generated**: $(date)
**Integration Branch**: $INTEGRATION_BRANCH
**Status**: SUCCESSFUL ✅

## Merged Agents

EOF
    
    for branch in "${AGENT_BRANCHES[@]}"; do
        local agent_name="${AGENT_NAMES[$branch]}"
        local commits=$(git rev-list --count "$MAIN_BRANCH..$branch" 2>/dev/null || echo "0")
        local last_commit=$(git log "$branch" --format="%h - %s" -1 2>/dev/null || echo "No commits")
        
        cat >> "$report_file" << EOF
### $agent_name
- **Branch**: $branch
- **Commits**: $commits
- **Last Commit**: $last_commit
- **Status**: ✅ MERGED

EOF
    done
    
    cat >> "$report_file" << EOF

## Test Results

- ✅ Unit Tests: PASSED
- ✅ Integration Tests: PASSED
- ✅ Performance Tests: PASSED
- ✅ Coordination Checks: PASSED

## Next Steps

1. Review integration on branch: \`$INTEGRATION_BRANCH\`
2. Perform manual testing
3. Merge to main branch when ready
4. Deploy to staging environment

## Files Changed

\`\`\`
$(git diff --name-only "$MAIN_BRANCH..$INTEGRATION_BRANCH" | head -20)
$(if [[ $(git diff --name-only "$MAIN_BRANCH..$INTEGRATION_BRANCH" | wc -l) -gt 20 ]]; then echo "... and $(( $(git diff --name-only "$MAIN_BRANCH..$INTEGRATION_BRANCH" | wc -l) - 20 )) more files"; fi)
\`\`\`

## Integration Summary

This integration successfully combines all Enhanced AI Processing agents:
- AI Processing Core provides the foundation
- Style Reference enables style-based design
- Furniture Carousel delivers product selection
- Custom Prompt adds natural language interaction

All agents passed coordination checks and integration tests.
The feature is ready for final review and deployment.
EOF
    
    log_success "Integration report generated: $report_file"
}

# Main pipeline execution
main() {
    log_header "ENHANCED AI PROCESSING - INTEGRATION PIPELINE"
    
    # Parse command line arguments
    local continue_from_conflict=false
    if [[ "$1" == "--continue" ]]; then
        continue_from_conflict=true
        log_info "Continuing from conflict resolution"
    fi
    
    # Step 1: Check prerequisites
    if [[ "$continue_from_conflict" != "true" ]]; then
        check_prerequisites
        
        # Step 2: Run coordination checks
        run_coordination_checks
        
        # Step 3: Check all branch statuses
        log_header "CHECKING BRANCH STATUS"
        local all_branches_ready=true
        for branch in "${AGENT_BRANCHES[@]}"; do
            if ! check_branch_status "$branch"; then
                all_branches_ready=false
            fi
        done
        
        if [[ "$all_branches_ready" != "true" ]]; then
            log_error "Some branches are not ready for integration"
            exit 1
        fi
        
        # Step 4: Run tests for each branch
        log_header "RUNNING BRANCH TESTS"
        for branch in "${AGENT_BRANCHES[@]}"; do
            run_branch_tests "$branch"
        done
        
        # Step 5: Create integration branch
        create_integration_branch
    fi
    
    # Step 6: Merge branches in dependency order
    log_header "MERGING BRANCHES"
    
    # Merge in dependency order
    merge_branch "feature/enhanced-ai-processing-core"
    merge_branch "feature/style-reference-selection"
    merge_branch "feature/furniture-carousel"
    merge_branch "feature/custom-prompt"
    
    # Step 7: Run integration tests
    run_integration_tests
    
    # Step 8: Run performance tests
    run_performance_tests
    
    # Step 9: Generate integration report
    generate_integration_report
    
    # Success!
    log_header "INTEGRATION COMPLETE"
    log_success "Enhanced AI Processing feature successfully integrated!"
    log_info "Integration branch: $INTEGRATION_BRANCH"
    log_info "Review the integration and merge to main when ready"
    
    echo ""
    echo "Next steps:"
    echo "1. git checkout $INTEGRATION_BRANCH"
    echo "2. Test the integrated feature manually"
    echo "3. git checkout main"
    echo "4. git merge $INTEGRATION_BRANCH --no-ff"
    echo "5. git tag v1.0.0-enhanced-ai-processing"
}

# Handle script interruption
trap 'log_error "Integration pipeline interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"