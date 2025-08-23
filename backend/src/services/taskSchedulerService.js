const cron = require('node-cron');
const { Booking, BookingSlot, User } = require('../models');
const emailService = require('./emailService');
const { Op } = require('sequelize');

class TaskSchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  init() {
    console.log('🕒 Initializing scheduled tasks...');
    
    // Send booking reminders every hour
    this.scheduleBookingReminders();
    
    // Cleanup expired bookings daily
    this.scheduleBookingCleanup();
    
    // Generate daily reports at midnight
    this.scheduleDailyReports();
    
    console.log('✅ Scheduled tasks initialized');
  }

  scheduleBookingReminders() {
    // Run every hour
    const job = cron.schedule('0 * * * *', async () => {
      try {
        console.log('⏰ Running booking reminder task...');
        await this.sendBookingReminders();
      } catch (error) {
        console.error('❌ Booking reminder task error:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('bookingReminders', job);
    job.start();
  }

  scheduleBookingCleanup() {
    // Run daily at 2 AM
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Running booking cleanup task...');
        await this.cleanupExpiredBookings();
      } catch (error) {
        console.error('❌ Booking cleanup task error:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('bookingCleanup', job);
    job.start();
  }

  scheduleDailyReports() {
    // Run daily at midnight
    const job = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('📊 Running daily reports task...');
        await this.generateDailyReports();
      } catch (error) {
        console.error('❌ Daily reports task error:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('dailyReports', job);
    job.start();
  }

  async sendBookingReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find bookings for tomorrow
      const upcomingBookings = await Booking.findAll({
        include: [
          {
            model: BookingSlot,
            as: 'slots',
            where: {
              date: {
                [Op.gte]: tomorrow,
                [Op.lt]: dayAfterTomorrow
              }
            }
          },
          {
            model: User,
            as: 'user',
            attributes: ['email', 'fullName']
          }
        ],
        where: {
          status: 'CONFIRMED'
        }
      });

      for (const booking of upcomingBookings) {
        try {
          const firstSlot = booking.slots[0];
          await emailService.sendBookingReminder(booking.userEmail, {
            userName: booking.user.fullName,
            facilityName: 'Your Booked Facility', // You'd get this from venue data
            date: firstSlot.date,
            time: `${firstSlot.startTime} - ${firstSlot.endTime}`
          });

          console.log(`📧 Reminder sent to ${booking.userEmail} for booking ${booking.id}`);
        } catch (emailError) {
          console.error(`❌ Failed to send reminder for booking ${booking.id}:`, emailError);
        }
      }

      console.log(`✅ Processed ${upcomingBookings.length} booking reminders`);
    } catch (error) {
      console.error('❌ Error in sendBookingReminders:', error);
    }
  }

  async cleanupExpiredBookings() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      // Update completed bookings
      const [updatedCount] = await Booking.update(
        { status: 'COMPLETED' },
        {
          where: {
            status: 'CONFIRMED'
          },
          include: [{
            model: BookingSlot,
            as: 'slots',
            where: {
              date: {
                [Op.lt]: yesterday
              }
            }
          }]
        }
      );

      console.log(`✅ Updated ${updatedCount} bookings to COMPLETED status`);
    } catch (error) {
      console.error('❌ Error in cleanupExpiredBookings:', error);
    }
  }

  async generateDailyReports() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get yesterday's statistics
      const stats = await this.getDailyStatistics(yesterday);
      
      // Log statistics (in a real app, you might send these to admins)
      console.log('📊 Daily Statistics for', yesterday.toDateString());
      console.log('- New bookings:', stats.newBookings);
      console.log('- Total revenue:', stats.totalRevenue);
      console.log('- Cancelled bookings:', stats.cancelledBookings);
      console.log('- New users:', stats.newUsers);

      // You could send this data to administrators via email or store in a reporting system
    } catch (error) {
      console.error('❌ Error in generateDailyReports:', error);
    }
  }

  async getDailyStatistics(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const [newBookings, totalRevenue, cancelledBookings, newUsers] = await Promise.all([
        Booking.count({
          where: {
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lte]: endOfDay
            }
          }
        }),
        Booking.sum('totalPrice', {
          where: {
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lte]: endOfDay
            },
            status: 'CONFIRMED'
          }
        }),
        Booking.count({
          where: {
            updatedAt: {
              [Op.gte]: startOfDay,
              [Op.lte]: endOfDay
            },
            status: 'CANCELLED'
          }
        }),
        User.count({
          where: {
            createdAt: {
              [Op.gte]: startOfDay,
              [Op.lte]: endOfDay
            }
          }
        })
      ]);

      return {
        newBookings: newBookings || 0,
        totalRevenue: totalRevenue || 0,
        cancelledBookings: cancelledBookings || 0,
        newUsers: newUsers || 0
      };
    } catch (error) {
      console.error('❌ Error getting daily statistics:', error);
      return {
        newBookings: 0,
        totalRevenue: 0,
        cancelledBookings: 0,
        newUsers: 0
      };
    }
  }

  // Manual task execution methods
  async runBookingReminders() {
    await this.sendBookingReminders();
  }

  async runBookingCleanup() {
    await this.cleanupExpiredBookings();
  }

  async runDailyReports() {
    await this.generateDailyReports();
  }

  // Stop all scheduled tasks
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`🛑 Stopped task: ${name}`);
    });
    this.jobs.clear();
  }

  // Get status of all jobs
  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        scheduled: job.scheduled || false
      };
    });
    return status;
  }
}

module.exports = new TaskSchedulerService();
