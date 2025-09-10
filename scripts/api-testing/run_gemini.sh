#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to mobile directory (2 levels up from scripts/api-testing)
cd "$SCRIPT_DIR/../../mobile"
node src/scripts/generateWithGeminiImages.js