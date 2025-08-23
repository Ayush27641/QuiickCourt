#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs database synchronization and initial setup
 */

const sequelize = require('../src/config/database');
const models = require('../src/models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync all models
    await sequelize.sync({ force: process.argv.includes('--force') });
    console.log('✅ Database schema synchronized.');
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
