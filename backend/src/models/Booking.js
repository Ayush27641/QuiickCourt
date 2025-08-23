const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  sportId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  venueId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  facilityOwnerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING'),
    defaultValue: 'CONFIRMED'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  version: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  }
}, {
  tableName: 'Booking',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Booking;
