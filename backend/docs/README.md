# QuickCourt Backend Documentation

This folder contains documentation and analysis files for the QuickCourt backend.

## Files

### 📄 SUPABASE_SETUP.md
Complete setup guide for configuring Supabase database with QuickCourt. Includes step-by-step instructions for:
- Database connection setup
- Environment variables configuration
- Table creation and schema setup

### 📊 VALIDATION_REPORT.js
Comprehensive analysis report of field mappings and API endpoints including:
- Database schema validation
- Frontend ↔ Backend field mapping verification
- API endpoint status and testing results
- Known issues and recommendations

## Database Scripts

Database setup scripts are located in `../scripts/`:
- `SETUP_DATABASE.sql` - Complete SQL schema for creating all tables
- `setupDatabase.js` - Node.js script for automated database setup
- `testDatabase.js` - Database connection and functionality testing
- `createSchema.js` - Schema creation utilities
- `checkSchema.js` - Schema validation tools

## Usage

1. **First Time Setup**: Follow instructions in `SUPABASE_SETUP.md`
2. **Database Creation**: Run the SQL from `../scripts/SETUP_DATABASE.sql` in Supabase SQL Editor
3. **Validation**: Check `VALIDATION_REPORT.js` for current system status
4. **Testing**: Use scripts in `../scripts/` folder for testing and validation

## File Organization

```
backend/
├── docs/           # Documentation files (this folder)
├── scripts/        # Database and utility scripts
├── src/            # Source code
├── tests/          # Test files
└── ...
```
