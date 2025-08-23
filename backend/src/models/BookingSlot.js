const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingSlot = sequelize.define('booking_slots', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Booking',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'booking_slots',
  timestamps: false
});

module.exports = BookingSlot;
