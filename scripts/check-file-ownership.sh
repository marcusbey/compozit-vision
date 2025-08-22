#!/bin/bash

# File Ownership Conflict Detection Script
# Ensures agents only modify files within their designated boundaries

set -e

echo "🔍 Checking file ownership conflicts..."

# Define ownership matrix
declare -A ownership_matrix
ownership_matrix["mobile/src/services/ai/"]="enhanced-ai-processing-core"
ownership_matrix["mobile/src/utils/image-processing/"]="enhanced-ai-processing-core"
ownership_matrix["mobile/src/models/"]="enhanced-ai-processing-core"
ownership_matrix["mobile/src/components/style/"]="style-reference-selection"
ownership_matrix["mobile/src/screens/StyleSelection/"]="style-reference-selection"
ownership_matrix["mobile/src/services/style/"]="style-reference-selection"
ownership_matrix["mobile/src/components/carousel/"]="furniture-carousel"
ownership_matrix["mobile/src/components/product/"]="furniture-carousel"
ownership_matrix["mobile/src/screens/ProductSelection/"]="furniture-carousel"
ownership_matrix["mobile/src/services/product/"]="furniture-carousel"
ownership_matrix["mobile/src/components/prompt/"]="custom-prompt"
ownership_matrix["mobile/src/screens/CustomPrompt/"]="custom-prompt"
ownership_matrix["mobile/src/services/nlp/"]="custom-prompt"

# Get current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Extract agent type from branch name
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
    echo "ℹ️ Branch $current_branch is not an agent branch, skipping ownership checks"
    exit 0
fi

echo "📋 Agent: $agent_type"
echo "🌿 Branch: $current_branch"

# Get modified files in this branch (compared to main)
modified_files=$(git diff --name-only origin/main..HEAD 2>/dev/null || git diff --name-only HEAD~1..HEAD)

conflict_found=false

echo "📁 Checking modified files:"
while IFS= read -r file; do
    if [[ -z "$file" ]]; then
        continue
    fi
    
    echo "  📄 $file"
    
    # Check if this file falls under any ownership boundary
    file_owner=""
    for path in "${!ownership_matrix[@]}"; do
        if [[ "$file" == "$path"* ]]; then
            file_owner="${ownership_matrix[$path]}"
            break
        fi
    done
    
    # If file has an owner and it's not the current agent
    if [[ -n "$file_owner" && "$file_owner" != "$agent_type" ]]; then
        echo "    ❌ CONFLICT: File owned by $file_owner, but modified by $agent_type"
        conflict_found=true
    else
        echo "    ✅ OK: File ownership valid"
    fi
done <<< "$modified_files"

# Check for shared files (should be read-only)
shared_paths=(
    "mobile/src/types/"
    "mobile/src/constants/"
    "mobile/src/theme/"
    "mobile/src/navigation/"
    "mobile/src/config/"
)

echo "📚 Checking shared files (should be read-only):"
while IFS= read -r file; do
    if [[ -z "$file" ]]; then
        continue
    fi
    
    for shared_path in "${shared_paths[@]}"; do
        if [[ "$file" == "$shared_path"* ]]; then
            echo "  ❌ WARNING: Shared file modified - $file"
            echo "    💡 Shared files should only be modified through coordination"
        fi
    done
done <<< "$modified_files"

if $conflict_found; then
    echo ""
    echo "❌ FILE OWNERSHIP CONFLICTS DETECTED!"
    echo "🔧 Resolution steps:"
    echo "  1. Review the ownership matrix in AGENT-COORDINATION.md"
    echo "  2. Move changes to appropriate agent's files"
    echo "  3. Use read-only interfaces to access other agents' functionality"
    echo "  4. Coordinate with Integration Manager for exceptions"
    exit 1
else
    echo ""
    echo "✅ No file ownership conflicts detected"
fi

echo "📊 Summary:"
echo "  Agent: $agent_type"
echo "  Files modified: $(echo "$modified_files" | wc -l)"
echo "  Conflicts: $(if $conflict_found; then echo "YES"; else echo "NO"; fi)"