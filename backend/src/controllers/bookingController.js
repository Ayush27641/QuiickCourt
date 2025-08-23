const bookingService = require('../services/bookingService');
const Joi = require('joi');

// Validation schemas
const createBookingSchema = Joi.object({
  sportId: Joi.number().integer().positive().required(),
  venueId: Joi.number().integer().positive().required(),
  facilityOwnerEmail: Joi.string().email().required(),
  slots: Joi.array().items(Joi.object({
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    date: Joi.date().iso().required(),
    price: Joi.number().positive().required()
  })).min(1).required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING').required()
});

class BookingController {
  async createBooking(req, res) {
    try {
      // Validate request body
      const { error, value } = createBookingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Add user email from authenticated user
      value.userEmail = req.user.email;

      const booking = await bookingService.createBooking(value);
      
      res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  }

  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const booking = await bookingService.getBookingById(parseInt(id));
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user has permission to view this booking
      if (booking.userEmail !== req.user.email && 
          booking.facilityOwnerEmail !== req.user.email && 
          req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized to view this booking' });
      }
      
      res.status(200).json({ booking });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({ message: 'Failed to get booking' });
    }
  }

  async getUserBookings(req, res) {
    try {
      const bookings = await bookingService.getUserBookings(req.user.email);
      
      res.status(200).json({ bookings });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({ message: 'Failed to get user bookings' });
    }
  }

  async getFacilityBookings(req, res) {
    try {
      const bookings = await bookingService.getFacilityBookings(req.user.email);
      
      res.status(200).json({ bookings });
    } catch (error) {
      console.error('Get facility bookings error:', error);
      res.status(500).json({ message: 'Failed to get facility bookings' });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = updateStatusSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const booking = await bookingService.updateBookingStatus(
        parseInt(id), 
        value.status, 
        req.user.email
      );
      
      res.status(200).json({
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      if (error.message === 'Booking not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to update this booking') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  }

  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const booking = await bookingService.cancelBooking(
        parseInt(id), 
        req.user.email, 
        reason
      );
      
      res.status(200).json({
        message: 'Booking cancelled successfully',
        booking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      if (error.message === 'Booking not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Unauthorized to update this booking') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to cancel booking' });
    }
  }

  async getAvailableSlots(req, res) {
    try {
      const { venueId, date } = req.query;
      
      if (!venueId || !date) {
        return res.status(400).json({ message: 'Venue ID and date are required' });
      }

      if (isNaN(venueId)) {
        return res.status(400).json({ message: 'Invalid venue ID' });
      }

      const slots = await bookingService.getAvailableSlots(parseInt(venueId), date);
      
      res.status(200).json({ slots });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({ message: 'Failed to get available slots' });
    }
  }

  async getBookingStatistics(req, res) {
    try {
      if (req.user.role !== 'FACILITY_OWNER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized to view statistics' });
      }

      const stats = await bookingService.getBookingStatistics(req.user.email);
      
      res.status(200).json({ statistics: stats });
    } catch (error) {
      console.error('Get booking statistics error:', error);
      res.status(500).json({ message: 'Failed to get booking statistics' });
    }
  }
}

module.exports = new BookingController();
