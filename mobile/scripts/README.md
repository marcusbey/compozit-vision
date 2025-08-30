# 🛠️ Mobile Scripts Directory

Organized collection of database setup, testing, and utility scripts for the mobile app.

## 📁 Directory Structure

### `/database/`
**Database Schema & Setup Scripts**
- `01-style-system-tables.sql` - Style system database tables
- `02-furniture-system-tables.sql` - Furniture system database tables  
- `03-subscription-system-tables.sql` - Subscription system tables
- `04-journey-content-tables.sql` - User journey content tables
- `create-favorites-tables.sql` - User favorites system tables

### `/setup/`
**Setup & Installation Scripts**
- `execute-database-setup.js` - Main database setup executor
- `quick-setup.js` - Quick setup script for development
- `setup-database-direct.js` - Direct database setup utility

### `/testing/`
**Testing & Verification Scripts**
- `test-user-journey.js` - User journey testing script
- `verify-database.js` - Database verification utility
- `verify-setup.js` - Setup verification script

## 🎯 Quick Start Commands

### Database Setup (Sequential)
```bash
# Step 1: Style System
supabase db execute -f scripts/database/01-style-system-tables.sql

# Step 2: Furniture System  
supabase db execute -f scripts/database/02-furniture-system-tables.sql

# Step 3: Subscription System
supabase db execute -f scripts/database/03-subscription-system-tables.sql

# Step 4: Journey Content
supabase db execute -f scripts/database/04-journey-content-tables.sql

# Step 5: Favorites System
supabase db execute -f scripts/database/create-favorites-tables.sql
```

### Automated Setup
```bash
# Quick setup for development
node scripts/setup/quick-setup.js

# Full database setup
node scripts/setup/execute-database-setup.js

# Direct setup (advanced)
node scripts/setup/setup-database-direct.js
```

### Testing & Verification
```bash
# Verify database setup
node scripts/testing/verify-database.js

# Verify complete setup
node scripts/testing/verify-setup.js

# Test user journey
node scripts/testing/test-user-journey.js
```

## ⚠️ Important Notes

### Execution Order
1. **Database schemas first** (01, 02, 03, 04 in order)
2. **Setup scripts second** (choose one setup method)
3. **Verification last** (test everything works)

### Requirements
- Supabase CLI installed and configured
- Node.js for JavaScript setup scripts
- Proper environment variables set (.env file)

## 🧹 Cleanup Summary

**Organized from 13 scattered files into:**
- 5 database schema files
- 3 setup utilities  
- 3 testing scripts
- Logical folder structure for easy navigation

**Removed during cleanup:**
- No duplicate files (all were unique and necessary)
- Moved documentation to @DOCS folder
- Clear separation between database, setup, and testing scripts

---
**Tip**: Always run verification scripts after setup to ensure everything works correctly!