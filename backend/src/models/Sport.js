const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sport = sequelize.define('Sport', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  minPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  equipment: {
    type: DataTypes.JSON, // Array of required equipment
    defaultValue: []
  },
  rules: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING // URL to sport icon
  }
}, {
  tableName: 'Sport',
  timestamps: true
});

module.exports = Sport;
