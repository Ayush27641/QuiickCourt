const { Booking, BookingSlot, Venue, Sport, User } = require('../models');
const emailService = require('./emailService');
const socketService = require('./socketService');

class BookingService {
  async createBooking(bookingData) {
    const transaction = await Booking.sequelize.transaction();
    
    try {
      const { slots, ...bookingDetails } = bookingData;
      
      // Calculate total price
      let totalPrice = 0;
      if (slots && slots.length > 0) {
        totalPrice = slots.reduce((sum, slot) => sum + parseFloat(slot.price || 0), 0);
      }
      
      // Create booking
      const booking = await Booking.create({
        ...bookingDetails,
        totalPrice
      }, { transaction });
      
      // Create booking slots
      if (slots && slots.length > 0) {
        const bookingSlots = slots.map(slot => ({
          ...slot,
          booking_id: booking.id
        }));
        
        await BookingSlot.bulkCreate(bookingSlots, { transaction });
      }
      
      await transaction.commit();
      
      // Fetch complete booking with associations
      const completeBooking = await this.getBookingById(booking.id);
      
      // Send confirmation email
      try {
        const venue = await Venue.findByPk(booking.venueId);
        const user = await User.findByPk(booking.userEmail);
        
        if (venue && user) {
          await emailService.sendBookingConfirmation(booking.userEmail, {
            userName: user.fullName,
            facilityName: venue.name,
            date: slots[0]?.date || 'TBD',
            time: `${slots[0]?.startTime || 'TBD'} - ${slots[0]?.endTime || 'TBD'}`,
            amount: totalPrice
          });
        }
        
        // Send socket notification
        socketService.emitToUser(booking.userEmail, 'booking_notification', {
          type: 'confirmed',
          bookingDetails: completeBooking,
          timestamp: new Date().toISOString()
        });
        
      } catch (emailError) {
        console.error('Failed to send booking confirmation:', emailError);
      }
      
      return completeBooking;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getBookingById(id) {
    try {
      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: BookingSlot,
            as: 'slots'
          },
          {
            model: Venue,
            as: 'venue'
          },
          {
            model: Sport,
            as: 'sport'
          },
          {
            model: User,
            as: 'user',
            attributes: ['email', 'fullName', 'avatarUrl']
          },
          {
            model: User,
            as: 'facilityOwner',
            attributes: ['email', 'fullName', 'avatarUrl']
          }
        ]
      });
      
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async getUserBookings(userEmail) {
    try {
      const bookings = await Booking.findAll({
        where: { userEmail },
        include: [
          {
            model: BookingSlot,
            as: 'slots'
          },
          {
            model: Venue,
            as: 'venue'
          },
          {
            model: Sport,
            as: 'sport'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async getFacilityBookings(facilityOwnerEmail) {
    try {
      const bookings = await Booking.findAll({
        where: { facilityOwnerEmail },
        include: [
          {
            model: BookingSlot,
            as: 'slots'
          },
          {
            model: Venue,
            as: 'venue'
          },
          {
            model: Sport,
            as: 'sport'
          },
          {
            model: User,
            as: 'user',
            attributes: ['email', 'fullName', 'avatarUrl']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return bookings;
    } catch (error) {
      throw error;
    }
  }

  async updateBookingStatus(id, status, userEmail) {
    try {
      const booking = await Booking.findByPk(id);
      
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Check if user has permission to update this booking
      if (booking.userEmail !== userEmail && booking.facilityOwnerEmail !== userEmail) {
        throw new Error('Unauthorized to update this booking');
      }
      
      booking.status = status;
      booking.updatedAt = new Date();
      await booking.save();
      
      // Send notification
      const notificationEmail = booking.userEmail === userEmail ? booking.facilityOwnerEmail : booking.userEmail;
      
      socketService.emitToUser(notificationEmail, 'booking_notification', {
        type: 'status_updated',
        bookingDetails: await this.getBookingById(id),
        newStatus: status,
        timestamp: new Date().toISOString()
      });
      
      return await this.getBookingById(id);
    } catch (error) {
      throw error;
    }
  }

  async cancelBooking(id, userEmail, reason = '') {
    try {
      const booking = await this.updateBookingStatus(id, 'CANCELLED', userEmail);
      
      // Additional cancellation logic can be added here
      // e.g., refund processing, penalty calculation, etc.
      
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableSlots(venueId, date) {
    try {
      // Get all bookings for the venue on the specified date
      const bookedSlots = await BookingSlot.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          where: { 
            venueId,
            status: 'CONFIRMED'
          }
        }],
        where: { date }
      });
      
      // Generate available slots (this is a simplified implementation)
      // In a real application, you'd consider venue operating hours, slot duration, etc.
      const allSlots = [];
      for (let hour = 6; hour <= 22; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        const isBooked = bookedSlots.some(slot => 
          slot.startTime <= startTime && slot.endTime > startTime
        );
        
        if (!isBooked) {
          allSlots.push({
            startTime,
            endTime,
            available: true
          });
        }
      }
      
      return allSlots;
    } catch (error) {
      throw error;
    }
  }

  async getBookingStatistics(facilityOwnerEmail) {
    try {
      const stats = await Booking.findAll({
        where: { facilityOwnerEmail },
        attributes: [
          [Booking.sequelize.fn('COUNT', Booking.sequelize.col('id')), 'totalBookings'],
          [Booking.sequelize.fn('SUM', Booking.sequelize.col('totalPrice')), 'totalRevenue'],
          [Booking.sequelize.fn('COUNT', Booking.sequelize.literal("CASE WHEN status = 'CONFIRMED' THEN 1 END")), 'confirmedBookings'],
          [Booking.sequelize.fn('COUNT', Booking.sequelize.literal("CASE WHEN status = 'CANCELLED' THEN 1 END")), 'cancelledBookings']
        ],
        raw: true
      });
      
      return stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BookingService();
