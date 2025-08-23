const User = require('./User');
const Booking = require('./Booking');
const BookingSlot = require('./BookingSlot');
const Venue = require('./Venue');
const Sport = require('./Sport');

// Define associations
Booking.hasMany(BookingSlot, {
  foreignKey: 'booking_id',
  as: 'slots'
});

BookingSlot.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking'
});

// User associations
User.hasMany(Booking, {
  foreignKey: 'userEmail',
  sourceKey: 'email',
  as: 'userBookings'
});

User.hasMany(Booking, {
  foreignKey: 'facilityOwnerEmail',
  sourceKey: 'email',
  as: 'facilityBookings'
});

User.hasMany(Venue, {
  foreignKey: 'facilityOwnerEmail',
  sourceKey: 'email',
  as: 'venues'
});

// Booking associations
Booking.belongsTo(User, {
  foreignKey: 'userEmail',
  targetKey: 'email',
  as: 'user'
});

Booking.belongsTo(User, {
  foreignKey: 'facilityOwnerEmail',
  targetKey: 'email',
  as: 'facilityOwner'
});

Booking.belongsTo(Venue, {
  foreignKey: 'venueId',
  as: 'venue'
});

Booking.belongsTo(Sport, {
  foreignKey: 'sportId',
  as: 'sport'
});

// Venue associations
Venue.hasMany(Booking, {
  foreignKey: 'venueId',
  as: 'bookings'
});

Venue.belongsTo(User, {
  foreignKey: 'facilityOwnerEmail',
  targetKey: 'email',
  as: 'owner'
});

// Sport associations
Sport.hasMany(Booking, {
  foreignKey: 'sportId',
  as: 'bookings'
});

module.exports = {
  User,
  Booking,
  BookingSlot,
  Venue,
  Sport
};
