# 🛠️ Scripts Directory

Professional organization of all development, database, and deployment scripts.

## 📁 Directory Structure

### `/database/`
**Database Setup & Management Scripts**
- `create-reference-system-tables-no-samples.sql` - **Main reference system schema** ⭐
- `essential-tables.sql` - Core application tables
- `populate-subscription-plans.sql` - Subscription plans data
- `mcp-database-setup.js` - MCP database integration
- `setup-reference-storage-fixed.sql` - Storage configuration
- `populate-space-mappings.sql` - Space mapping data
- `setup-database.js` - Main database setup script
- `create-ai-jobs-table.sql` - AI processing jobs table
- `create-enhanced-categories-table.sql` - Enhanced categories
- `create-project-wizard-tables.sql` - Project wizard tables

### `/development/`
**Development & Testing Utilities**
- `check-dependency-conflicts.sh` - Dependency conflict checker
- `integration-pipeline.sh` - Integration pipeline utilities
- `test-mcp-connections.js` - MCP connection testing
- `coordination-dashboard.js` - Development dashboard
- `check-file-ownership.sh` - File ownership verification
- `check-interface-changes.sh` - Interface change detection

### `/deployment/`
**Production Deployment Scripts**
- `setup-complete.js` - Complete setup verification

## 🎯 Quick Start Commands

### Database Setup
```bash
# Run the main reference system setup (recommended)
# Use Supabase Dashboard SQL Editor with:
scripts/database/create-reference-system-tables-no-samples.sql

# Alternative: Use Supabase CLI
supabase db execute -f scripts/database/create-reference-system-tables-no-samples.sql
```

### Development Testing
```bash
# Test MCP connections
node scripts/development/test-mcp-connections.js

# Check for dependency conflicts
bash scripts/development/check-dependency-conflicts.sh

# Run integration pipeline
bash scripts/development/integration-pipeline.sh
```

## ⚠️ Important Notes

### Database Scripts Priority
1. **Primary**: `database/create-reference-system-tables-no-samples.sql` - Use this one!
2. **Supporting**: Other SQL files for specific table additions
3. **Legacy**: Removed duplicate/obsolete scripts during cleanup

### Script Execution Order
1. Core database setup first
2. Populate subscription plans
3. Configure storage and mappings
4. Test connections and verify setup

## 🔧 Maintenance Guidelines

- **Database scripts**: Test on development environment first
- **Development scripts**: Keep them updated with dependency changes
- **Deployment scripts**: Version control for production releases

## 📋 Removed During Cleanup

The following duplicate/obsolete files were removed:
- Multiple `create-reference-system-tables*.sql` variants
- Duplicate database setup JavaScript files
- Obsolete crash-fix and emergency scripts
- Redundant table creation scripts

This cleanup reduced the scripts folder from 25+ files to 15 essential, organized files.

---
**Tip**: Always run scripts from the project root directory for proper path resolution.