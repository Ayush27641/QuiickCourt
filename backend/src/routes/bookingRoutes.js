const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { adminClient } = require('../config/database');

// All booking routes require authentication
router.use(authenticateToken);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Get user's bookings
router.get('/user/my-bookings', bookingController.getUserBookings);

// Get facility owner's bookings
router.get('/facility/my-bookings', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'), 
  bookingController.getFacilityBookings
);

// Update booking status
router.patch('/:id/status', bookingController.updateBookingStatus);

// Cancel booking
router.patch('/:id/cancel', bookingController.cancelBooking);

// Get available slots for a venue
router.get('/slots/available', bookingController.getAvailableSlots);

// Get booked slots for a venue and sport (used by frontend)
router.get('/slots', async (req, res) => {
  try {
    const { venueId, sportId } = req.query;
    
    if (!venueId || !sportId) {
      return res.status(400).json({ error: 'venueId and sportId are required' });
    }

    const { data: slots, error } = await adminClient
      .from('booking_slots')
      .select(`
        *,
        bookings!inner (venue_id, sport_id)
      `)
      .eq('bookings.venue_id', venueId)
      .eq('bookings.sport_id', sportId);

    if (error) throw error;

    // Transform for frontend compatibility
    const transformedSlots = slots.map(slot => ({
      ...slot,
      startDateTime: slot.start_time,
      endDateTime: slot.end_time
    }));

    res.status(200).json(transformedSlots);
  } catch (error) {
    console.error('Error fetching booking slots:', error);
    res.status(500).json({ error: 'Failed to fetch booking slots' });
  }
});

// Get booking statistics (for facility owners)
router.get('/statistics/overview', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'), 
  bookingController.getBookingStatistics
);

// Get bookings by owner email (for dashboard)
router.get('/getByOwner', async (req, res) => {
  try {
    const { ownerEmail } = req.query;
    
    if (!ownerEmail) {
      return res.status(400).json({ error: 'Owner email is required' });
    }

    // Get all venues owned by this facility owner
    const { data: venues, error: venuesError } = await adminClient
      .from('venues')
      .select('id')
      .eq('owner_email', ownerEmail);

    if (venuesError) throw venuesError;

    if (!venues || venues.length === 0) {
      return res.status(200).json([]);
    }

    const venueIds = venues.map(v => v.id);

    // Get all bookings for these venues
    const { data: bookings, error: bookingsError } = await adminClient
      .from('bookings')
      .select(`
        *,
        booking_slots (*)
      `)
      .in('venue_id', venueIds);

    if (bookingsError) throw bookingsError;

    // Transform booking_slots to slots for frontend compatibility
    const transformedBookings = bookings.map(booking => ({
      ...booking,
      slots: booking.booking_slots || [],
      venueId: booking.venue_id,
      sportId: booking.sport_id,
      userEmail: booking.user_email,
      totalPrice: booking.total_price,
      createdAt: booking.created_at
    }));

    res.status(200).json(transformedBookings);
  } catch (error) {
    console.error('Error fetching bookings by owner:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get monthly booking trends for facility owner
router.get('/monthlyTrends', async (req, res) => {
  try {
    const { ownerEmail } = req.query;
    
    if (!ownerEmail) {
      return res.status(400).json({ error: 'Owner email is required' });
    }

    // Get all venues owned by this facility owner
    const { data: venues, error: venuesError } = await adminClient
      .from('venues')
      .select('id')
      .eq('owner_email', ownerEmail);

    if (venuesError) throw venuesError;

    if (!venues || venues.length === 0) {
      // Return 12 months of zero data
      return res.status(200).json(Array(12).fill(0));
    }

    const venueIds = venues.map(v => v.id);

    // Get bookings for the current year, grouped by month
    const currentYear = new Date().getFullYear();
    const { data: bookings, error: bookingsError } = await adminClient
      .from('bookings')
      .select('created_at')
      .in('venue_id', venueIds)
      .gte('created_at', `${currentYear}-01-01`)
      .lt('created_at', `${currentYear + 1}-01-01`);

    if (bookingsError) throw bookingsError;

    // Count bookings by month
    const monthlyData = Array(12).fill(0);
    bookings.forEach(booking => {
      const month = new Date(booking.created_at).getMonth();
      monthlyData[month]++;
    });

    res.status(200).json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
});

module.exports = router;
