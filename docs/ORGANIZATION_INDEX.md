# Documentation and Scripts Organization Index

This document outlines the new organization structure for all documentation and script files in the compozit-vision project.

## 📁 Documentation Structure

### `/docs/project-docs/`
- **ASSET-CONSOLIDATION-PLAN.md** - Plan for consolidating project assets
- **ASSET-CONSOLIDATION-SUMMARY.md** - Summary of asset consolidation work  
- **CLEANUP-REPORT.md** - Report on project cleanup activities
- **MASONRY-GALLERY-SETUP.md** - Setup guide for masonry gallery
- **New-user-journey.md** - Documentation of new user journey flow
- **unused-screens.md** - Documentation of unused screens

### `/docs/mobile-docs/`
- **CAROUSEL-STABILITY-TEST.md** - Carousel component stability testing
- **COMPREHENSIVE-DESIGN-CATEGORIES.md** - Complete design category documentation
- **DYNAMIC-CONTEXT-ICONS-PRD.md** - Product requirements for dynamic context icons
- **DYNAMIC-ICONS-IMPLEMENTATION-STRATEGY.md** - Implementation strategy for dynamic icons
- **GET_NEW_API_KEY.md** - Guide for obtaining new API keys
- **IMAGE-COMBINATIONS-MATRIX.md** - Matrix of image combinations
- **MASONRY-GALLERY-PRD.md** - Product requirements for masonry gallery
- **MOTI-ANIMATION-GUIDE.md** - Guide for Moti animations
- **REFACTORING-SUMMARY.md** - Summary of refactoring work
- **SETUP_GEMINI_API.md** - Gemini API setup instructions
- **UNIFIED-SCREEN-PRD.md** - Product requirements for unified screen
- **backend-api-example.md** - Backend API usage examples

### `/docs/backend-docs/`
- **DEPLOYMENT.md** - Backend deployment instructions
- **PROJECT_STATUS.md** - Current project status
- **VISUALIZATION_README.md** - Visualization components documentation

### `/docs/web-docs/`
- **SEO-CHECKLIST.md** - SEO optimization checklist

## 🔧 Scripts Structure

### `/scripts/image-generation/`
- **create_placeholders.js** - Creates placeholder images
- **create_png_files.js** - Generates PNG files
- **manual_png_creator.js** - Manual PNG creation script
- **run-image-generator.js** - Main image generation runner
- **generate_images.py** - Python image generation script
- **run-generate.sh** - Shell script to run generation process
- **create-all-placeholders.js** - Creates all placeholder images (from mobile)
- **create-masonry-images.js** - Creates masonry layout images (from mobile)

### `/scripts/api-testing/`
- **execute_gemini.js** - Executes Gemini API calls
- **test-gemini-api.js** - Tests Gemini API functionality
- **execute_script.sh** - General script execution helper
- **run_gemini.sh** - Runs Gemini API tests
- **test-gemini-curl.sh** - cURL-based Gemini API tests

### `/scripts/cleanup/`
- **temp-cleanup-script.sh** - Temporary file cleanup
- **temp-cleanup-temp.sh** - Additional temp cleanup
- **temp-cleanup-final.py** - Final cleanup Python script
- **temp-cleanup.py** - Main cleanup Python script
- **test-dashboard-syntax.js** - Dashboard syntax testing

### `/mobile/scripts/`
- **test-fix-delete.js** - Mobile-specific test fixes (deletion)
- **test-fix.js** - Mobile-specific test fixes

## 🗂️ Archive Structure

### `/temp/archives/`
- **temp-04-project-wizard-to-delete/** - Old project wizard files (archived)
- **tree-maker/** - Tree generation utilities (archived)

## 📋 Remaining Core Files

These files remain in their original locations as they are essential project files:

### Root Level
- **README.md** - Main project documentation
- **CLAUDE.md** - Claude Code instructions

### Module READMEs  
- **mobile/README.md** - Mobile app documentation
- **backend/README.md** - Backend documentation
- **backend-vercel/README.md** - Vercel backend documentation
- **web/README.md** - Web application documentation
- **scripts/README.md** - Scripts documentation
- **docs/README.md** - Documentation overview
- **docs/CLAUDE.md** - Duplicate Claude instructions
- **docs/PRD-MCP-INTEGRATIONS.md** - MCP integrations PRD

### Module Configuration
- **mobile/babel.config.js** - Babel configuration
- **mobile/jest.config.js** - Jest test configuration
- **mobile/jest.gemini.config.js** - Gemini-specific Jest config
- **mobile/jest.setup.clean.js** - Jest clean setup
- **mobile/jest.setup.js** - Main Jest setup
- **web/postcss.config.js** - PostCSS configuration

## 🔍 Benefits of This Organization

1. **Clear Separation**: Documentation and scripts are clearly separated by function and scope
2. **Easy Navigation**: Related files are grouped together logically
3. **Reduced Clutter**: Root directory is cleaner with better organization
4. **Archive Management**: Old/temporary files are properly archived
5. **Module Scope**: Mobile-specific files remain within the mobile directory structure
6. **Maintained References**: Core project files remain in expected locations