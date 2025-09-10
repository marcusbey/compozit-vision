#!/bin/bash

echo "🧹 Cleaning up empty numbered directories..."

# Remove empty directories
echo "Removing 05-image-refinement..."
rm -rf mobile/src/screens/05-image-refinement

echo "Removing 06-results..."
rm -rf mobile/src/screens/06-results

echo "Removing 07-dashboard..."
rm -rf mobile/src/screens/07-dashboard

echo "Removing 05-content-selection (unused screens)..."
rm -rf mobile/src/screens/05-content-selection

echo "Removing FurnitureSelection (unused screens)..."
rm -rf mobile/src/screens/FurnitureSelection

echo "✅ Cleanup completed!"
echo "📂 Remaining important files in 04-project-wizard should be moved manually to appropriate feature directories."