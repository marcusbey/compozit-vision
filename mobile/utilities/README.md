# 🔧 Mobile Utilities Directory

Collection of database utilities, testing scripts, and development tools for the mobile app.

## 📁 Directory Structure  

### `/database/`
**Database Management Utilities**
- `database-functions.sql` - Custom database functions
- `database-requirements-complete.sql` - Complete database requirements
- `supabase-schema.sql` - Main Supabase schema definition
- `populate-database.js` - Database population script
- `verify-schema.js` - Schema verification utility
- `update-stripe-ids.js` - Stripe integration ID updater

### `/testing/`
**Testing & Validation Utilities**
- `test-user-journey-flow.js` - Complete user journey testing
- `validate-gemini-integration.js` - Gemini AI integration validator
- `test-quick-check.sh` - Quick validation check script

### Root Utilities
- `start-web.sh` - Web development server starter
- `reset-welcome.js` - Reset welcome screen state

## 🎯 Common Usage Patterns

### Database Management
```bash
# Populate database with sample data
node utilities/database/populate-database.js

# Verify schema integrity
node utilities/database/verify-schema.js

# Update Stripe payment IDs
node utilities/database/update-stripe-ids.js
```

### Testing & Validation
```bash
# Full user journey test
node utilities/testing/test-user-journey-flow.js

# Validate Gemini integration
node utilities/testing/validate-gemini-integration.js

# Quick health check
bash utilities/testing/test-quick-check.sh
```

### Development Tools
```bash
# Start web development server
bash utilities/start-web.sh

# Reset welcome screen (for testing)
node utilities/reset-welcome.js
```

## 🔍 Utility Descriptions

### Database Utilities
- **populate-database.js**: Seeds database with initial data for development
- **verify-schema.js**: Ensures database schema matches requirements
- **update-stripe-ids.js**: Updates Stripe product/price IDs for payment integration

### Testing Utilities  
- **test-user-journey-flow.js**: Simulates complete user workflow from onboarding to results
- **validate-gemini-integration.js**: Tests Gemini AI API integration and responses
- **test-quick-check.sh**: Fast validation of core app functionality

### Development Utilities
- **start-web.sh**: Configured web server startup for browser testing
- **reset-welcome.js**: Resets user preferences to show welcome screens again

## ⚠️ Prerequisites

- **Node.js**: For all .js utilities
- **Bash**: For shell scripts (.sh files)
- **Environment Variables**: Proper .env configuration
- **Database Access**: Valid Supabase connection
- **API Keys**: Gemini, Stripe, etc. for respective utilities

## 📋 Migration Summary

**Moved from mobile root to organized structure:**
- 6 database management files → `/database/`
- 3 testing validation scripts → `/testing/`  
- 2 development utilities → root utilities
- Clear separation by function and purpose

This organization makes utilities easy to find and execute based on their purpose.

---
**Tip**: Run utilities from the mobile root directory for proper path resolution!