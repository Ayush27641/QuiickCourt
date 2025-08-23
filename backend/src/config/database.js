const { Sequelize } = require('sequelize');

// Use Supabase connection if available, otherwise fallback to local PostgreSQL
const sequelize = new Sequelize({
  host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.SUPABASE_DB_PORT || process.env.DB_PORT) || 5432,
  database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'OdooHackathon2025',
  username: process.env.SUPABASE_DB_USER || process.env.DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'password',
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.SUPABASE_DB_HOST ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
