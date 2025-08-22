#!/bin/bash

# Dependency Conflict Detection Script
# Detects circular dependencies and conflicting requirements between agents

set -e

echo "🔗 Checking dependency conflicts..."

# Define agent dependencies based on coordination plan
declare -A agent_dependencies
agent_dependencies["enhanced-ai-processing-core"]=""  # No dependencies
agent_dependencies["style-reference-selection"]="enhanced-ai-processing-core"
agent_dependencies["furniture-carousel"]="style-reference-selection"
agent_dependencies["custom-prompt"]="enhanced-ai-processing-core"

# Get current branch and agent type
current_branch=$(git rev-parse --abbrev-ref HEAD)

agent_type=""
if [[ $current_branch == *"enhanced-ai-processing-core"* ]]; then
    agent_type="enhanced-ai-processing-core"
elif [[ $current_branch == *"style-reference-selection"* ]]; then
    agent_type="style-reference-selection"
elif [[ $current_branch == *"furniture-carousel"* ]]; then
    agent_type="furniture-carousel"
elif [[ $current_branch == *"custom-prompt"* ]]; then
    agent_type="custom-prompt"
else
    echo "ℹ️ Branch $current_branch is not an agent branch, skipping dependency checks"
    exit 0
fi

echo "🤖 Agent: $agent_type"

# Function to find import statements
find_imports() {
    local directory="$1"
    if [[ -d "$directory" ]]; then
        find "$directory" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "^import.*from.*\.\./\.\./services" 2>/dev/null || true
    fi
}

# Function to extract service imports
extract_service_imports() {
    local file="$1"
    grep "^import.*from.*\.\./\.\./services" "$file" 2>/dev/null | sed -E "s/.*from.*['\"]\.\.\/\.\.\/services\/([^\/]+)\/.*/\1/" || true
}

# Check for circular dependencies
echo "🔄 Checking for circular dependencies..."

dependency_conflicts=false

# Map of service directory to agent
declare -A service_to_agent
service_to_agent["ai"]="enhanced-ai-processing-core"
service_to_agent["style"]="style-reference-selection"
service_to_agent["product"]="furniture-carousel"
service_to_agent["nlp"]="custom-prompt"

# Get agent's own service directories
case $agent_type in
    "enhanced-ai-processing-core")
        agent_dirs="mobile/src/services/ai mobile/src/utils/image-processing mobile/src/models"
        ;;
    "style-reference-selection")
        agent_dirs="mobile/src/services/style mobile/src/components/style mobile/src/screens/StyleSelection"
        ;;
    "furniture-carousel")
        agent_dirs="mobile/src/services/product mobile/src/components/carousel mobile/src/components/product mobile/src/screens/ProductSelection"
        ;;
    "custom-prompt")
        agent_dirs="mobile/src/services/nlp mobile/src/components/prompt mobile/src/screens/CustomPrompt"
        ;;
esac

echo "📂 Analyzing imports in agent directories: $agent_dirs"

all_imports=""
for dir in $agent_dirs; do
    if [[ -d "$dir" ]]; then
        files=$(find_imports "$dir")
        while IFS= read -r file; do
            if [[ -n "$file" ]]; then
                echo "  📄 $file"
                imports=$(extract_service_imports "$file")
                while IFS= read -r import_service; do
                    if [[ -n "$import_service" ]]; then
                        imported_agent="${service_to_agent[$import_service]}"
                        if [[ -n "$imported_agent" ]]; then
                            echo "    📥 Imports from: $import_service ($imported_agent)"
                            all_imports="$all_imports $imported_agent"
                        fi
                    fi
                done <<< "$imports"
            fi
        done <<< "$files"
    fi
done

# Check if imports violate dependency rules
echo ""
echo "🔍 Validating dependency rules..."

allowed_dependencies="${agent_dependencies[$agent_type]}"
echo "  Allowed dependencies for $agent_type: ${allowed_dependencies:-"(none)"}"

# Check each unique import
unique_imports=$(echo "$all_imports" | tr ' ' '\n' | sort -u | grep -v '^$' || true)

while IFS= read -r imported_agent; do
    if [[ -n "$imported_agent" ]]; then
        echo "  🔗 Found dependency: $agent_type → $imported_agent"
        
        # Check if this dependency is allowed
        if [[ -z "$allowed_dependencies" ]] && [[ -n "$imported_agent" ]]; then
            echo "    ❌ VIOLATION: $agent_type should not depend on any other agents"
            dependency_conflicts=true
        elif [[ -n "$allowed_dependencies" ]] && [[ "$allowed_dependencies" != *"$imported_agent"* ]]; then
            echo "    ❌ VIOLATION: $agent_type can only depend on: $allowed_dependencies"
            dependency_conflicts=true
        else
            echo "    ✅ ALLOWED: Dependency permitted by coordination rules"
        fi
    fi
done <<< "$unique_imports"

# Check for reverse dependencies (circular)
echo ""
echo "🔄 Checking for circular dependencies..."

case $agent_type in
    "enhanced-ai-processing-core")
        # Core should not import from any other agent services
        circular_services="style product nlp"
        ;;
    "style-reference-selection")
        # Style can import from AI core, but not from carousel or prompt
        circular_services="product nlp"
        ;;
    "furniture-carousel")
        # Carousel can import from style and AI, but not from prompt
        circular_services="nlp"
        ;;
    "custom-prompt")
        # Prompt can import from AI core, but not from style or carousel
        circular_services="style product"
        ;;
esac

echo "  🚫 Checking for prohibited imports: $circular_services"

while IFS= read -r imported_agent; do
    if [[ -n "$imported_agent" ]]; then
        case $imported_agent in
            "style-reference-selection")
                service="style"
                ;;
            "furniture-carousel")
                service="product"
                ;;
            "custom-prompt")
                service="nlp"
                ;;
            "enhanced-ai-processing-core")
                service="ai"
                ;;
        esac
        
        if [[ "$circular_services" == *"$service"* ]]; then
            echo "    ❌ CIRCULAR: $agent_type → $imported_agent creates circular dependency"
            dependency_conflicts=true
        fi
    fi
done <<< "$unique_imports"

# Check package.json dependencies
echo ""
echo "📦 Checking package dependencies..."

if [[ -f "mobile/package.json" ]]; then
    # Check for conflicting package versions
    package_conflicts=$(npm ls --depth=0 --parseable 2>&1 | grep "UNMET PEER DEPENDENCY\|npm ERR!" || true)
    if [[ -n "$package_conflicts" ]]; then
        echo "  ⚠️ Package dependency issues detected:"
        echo "$package_conflicts"
    else
        echo "  ✅ Package dependencies are consistent"
    fi
    
    # Check for duplicate dependencies
    duplicate_deps=$(npm ls --depth=0 --parseable 2>&1 | grep "extraneous\|invalid" || true)
    if [[ -n "$duplicate_deps" ]]; then
        echo "  ⚠️ Duplicate/extraneous dependencies detected:"
        echo "$duplicate_deps"
    fi
fi

# Generate dependency graph
echo ""
echo "📊 Current Dependency Graph:"
echo "  enhanced-ai-processing-core (Core) ← [no dependencies]"
echo "  style-reference-selection (Style) ← enhanced-ai-processing-core"
echo "  furniture-carousel (Carousel) ← style-reference-selection"
echo "  custom-prompt (Prompt) ← enhanced-ai-processing-core"

echo ""
echo "🔗 Actual Dependencies Found:"
case $agent_type in
    "enhanced-ai-processing-core")
        if [[ -z "$unique_imports" ]]; then
            echo "  ✅ enhanced-ai-processing-core ← (none)"
        else
            echo "  ❌ enhanced-ai-processing-core ← $unique_imports"
        fi
        ;;
    *)
        if [[ -n "$unique_imports" ]]; then
            echo "  $agent_type ← $unique_imports"
        else
            echo "  $agent_type ← (none)"
        fi
        ;;
esac

# Final assessment
if $dependency_conflicts; then
    echo ""
    echo "❌ DEPENDENCY CONFLICTS DETECTED!"
    echo "🔧 Resolution steps:"
    echo "  1. Review the dependency rules in AGENT-COORDINATION.md"
    echo "  2. Remove prohibited imports"
    echo "  3. Use dependency injection or events for loose coupling"
    echo "  4. Coordinate with Integration Manager for architectural changes"
    echo "  5. Consider creating shared interfaces in allowed directories"
    exit 1
else
    echo ""
    echo "✅ No dependency conflicts detected"
fi

echo ""
echo "📋 Dependency Check Summary:"
echo "  Agent: $agent_type"
echo "  Dependencies Found: $(echo "$unique_imports" | wc -w)"
echo "  Conflicts: $(if $dependency_conflicts; then echo "YES"; else echo "NO"; fi)"
echo "  Status: $(if $dependency_conflicts; then echo "❌ FAILED"; else echo "✅ PASSED"; fi)"