#!/bin/bash

# Interface Breaking Changes Detection Script
# Monitors published interfaces for breaking changes between agents

set -e

echo "🔌 Checking interface breaking changes..."

# Define interface files for each agent
declare -A interface_files
interface_files["enhanced-ai-processing-core"]="mobile/src/services/ai/interfaces.ts mobile/src/services/ai/types.ts"
interface_files["style-reference-selection"]="mobile/src/services/style/interfaces.ts mobile/src/services/style/types.ts"
interface_files["furniture-carousel"]="mobile/src/services/product/interfaces.ts mobile/src/services/product/types.ts"
interface_files["custom-prompt"]="mobile/src/services/nlp/interfaces.ts mobile/src/services/nlp/types.ts"

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
    echo "ℹ️ Branch $current_branch is not an agent branch, skipping interface checks"
    exit 0
fi

echo "🤖 Agent: $agent_type"

# Check if we have interface files to analyze
interface_file_list="${interface_files[$agent_type]}"
if [[ -z "$interface_file_list" ]]; then
    echo "ℹ️ No interface files defined for agent $agent_type"
    exit 0
fi

breaking_changes_found=false

# Function to extract interface signatures
extract_interface_signatures() {
    local file="$1"
    if [[ -f "$file" ]]; then
        # Extract interface definitions, method signatures, and type definitions
        grep -E "^(export\s+)?(interface|type|enum|class)" "$file" || true
        grep -E "^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*[\(\:]" "$file" || true
    fi
}

# Function to check for breaking changes
check_breaking_changes() {
    local file="$1"
    local old_file="$2"
    
    echo "  📄 Analyzing $file"
    
    if [[ ! -f "$file" ]]; then
        echo "    ℹ️ New interface file"
        return
    fi
    
    if [[ ! -f "$old_file" ]]; then
        echo "    ℹ️ No previous version to compare"
        return
    fi
    
    # Extract signatures from both versions
    local current_signatures=$(extract_interface_signatures "$file")
    local old_signatures=$(extract_interface_signatures "$old_file")
    
    # Check for removed interfaces/methods
    while IFS= read -r old_line; do
        if [[ -n "$old_line" ]] && ! echo "$current_signatures" | grep -Fq "$old_line"; then
            echo "    ❌ BREAKING: Removed or changed - $old_line"
            breaking_changes_found=true
        fi
    done <<< "$old_signatures"
    
    # Check for new required parameters
    local current_methods=$(echo "$current_signatures" | grep -E "^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(" || true)
    local old_methods=$(echo "$old_signatures" | grep -E "^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(" || true)
    
    while IFS= read -r method_line; do
        if [[ -n "$method_line" ]]; then
            method_name=$(echo "$method_line" | sed -E 's/^\s*([a-zA-Z_][a-zA-Z0-9_]*).*/\1/')
            
            old_method_line=$(echo "$old_methods" | grep "^\s*$method_name\s*(" || true)
            if [[ -n "$old_method_line" ]]; then
                # Count required parameters (those without ? or default values)
                current_required=$(echo "$method_line" | grep -o '[^?:]*:' | wc -l || echo 0)
                old_required=$(echo "$old_method_line" | grep -o '[^?:]*:' | wc -l || echo 0)
                
                if [[ $current_required -gt $old_required ]]; then
                    echo "    ❌ BREAKING: Method $method_name has new required parameters"
                    breaking_changes_found=true
                fi
            fi
        fi
    done <<< "$current_methods"
}

echo "🔍 Checking for breaking changes in interfaces..."

# Create temporary directory for old versions
tmp_dir=$(mktemp -d)
trap "rm -rf $tmp_dir" EXIT

# Get the main branch version for comparison
if git rev-parse --verify origin/main >/dev/null 2>&1; then
    for interface_file in $interface_file_list; do
        if [[ -f "$interface_file" ]]; then
            # Get the old version from main branch
            old_interface_file="$tmp_dir/$(basename $interface_file)"
            git show "origin/main:$interface_file" > "$old_interface_file" 2>/dev/null || touch "$old_interface_file"
            
            check_breaking_changes "$interface_file" "$old_interface_file"
        fi
    done
else
    echo "ℹ️ No main branch found for comparison"
fi

# Check for interface documentation updates
echo ""
echo "📚 Checking interface documentation..."

for interface_file in $interface_file_list; do
    if [[ -f "$interface_file" ]]; then
        echo "  📄 $interface_file"
        
        # Check for proper documentation
        if ! grep -q "Published by:" "$interface_file"; then
            echo "    ⚠️ Missing 'Published by:' documentation"
        fi
        
        if ! grep -q "Last Updated:" "$interface_file"; then
            echo "    ⚠️ Missing 'Last Updated:' documentation"
        fi
        
        if ! grep -q "Dependencies:" "$interface_file"; then
            echo "    ⚠️ Missing 'Dependencies:' documentation"
        fi
        
        if ! grep -q "Usage Notes" "$interface_file"; then
            echo "    ⚠️ Missing 'Usage Notes' documentation"
        fi
        
        # Check if Last Updated is recent (within last 24 hours would be ideal)
        if grep -q "Last Updated:" "$interface_file"; then
            echo "    ✅ Documentation present"
        fi
    fi
done

# Generate interface change report
echo ""
echo "📋 Interface Change Report:"
echo "  Agent: $agent_type"
echo "  Branch: $current_branch"
echo "  Interface Files: $interface_file_list"

if $breaking_changes_found; then
    echo "  Breaking Changes: YES ❌"
    echo ""
    echo "🚨 BREAKING CHANGES DETECTED!"
    echo "🔧 Resolution steps:"
    echo "  1. Review interface changes with other agents"
    echo "  2. Implement deprecation warnings for removed features"
    echo "  3. Provide migration guide for breaking changes"
    echo "  4. Coordinate with Integration Manager"
    echo "  5. Update interface documentation"
    exit 1
else
    echo "  Breaking Changes: NO ✅"
    echo ""
    echo "✅ No breaking interface changes detected"
fi

# Check version compatibility
echo ""
echo "🏷️ Interface Version Compatibility:"
for interface_file in $interface_file_list; do
    if [[ -f "$interface_file" ]]; then
        version=$(grep -E "^\s*\*\s*@version" "$interface_file" | head -1 | sed -E 's/.*@version\s+([0-9.]+).*/\1/' || echo "unknown")
        echo "  $(basename $interface_file): v$version"
    fi
done