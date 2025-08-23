const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { adminClient } = require('../config/database');

// Placeholder for facility/venue routes
// These would typically include venue management, sports management, etc.

router.use(authenticateToken);

// Venue routes
router.get('/venues', async (req, res) => {
  try {
    const { data: venues, error } = await adminClient
      .from('venues')
      .select(`
        *,
        sports (*)
      `);

    if (error) throw error;
    
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

router.post('/venues', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'),
  async (req, res) => {
    try {
      const { ownerEmail } = req.query;
      const {
        name,
        description,
        address,
        isVerified = false,
        photoUrls = [],
        amenities = [],
        rating = null,
        ownerMail,
        sportIds = []
      } = req.body;

      const finalOwnerEmail = ownerEmail || ownerMail;

      if (!finalOwnerEmail) {
        return res.status(400).json({ error: 'Owner email is required' });
      }

      // Create the venue
      const { data: venue, error: venueError } = await adminClient
        .from('venues')
        .insert({
          name,
          description,
          address,
          owner_email: finalOwnerEmail,
          is_verified: isVerified,
          photo_urls: photoUrls,
          amenities,
          rating
        })
        .select()
        .single();

      if (venueError) throw venueError;

      res.status(201).json({
        message: 'Venue created successfully',
        venue
      });
    } catch (error) {
      console.error('Error creating venue:', error);
      res.status(500).json({ error: 'Failed to create venue' });
    }
  }
);

router.get('/venues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: venue, error } = await adminClient
      .from('venues')
      .select(`
        *,
        sports (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    res.status(200).json(venue);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

router.put('/venues/:id', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'),
  (req, res) => {
    res.status(200).json({ message: 'Update venue - Implementation pending' });
  }
);

router.delete('/venues/:id', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'),
  (req, res) => {
    res.status(200).json({ message: 'Delete venue - Implementation pending' });
  }
);

// Sports routes
router.get('/sports', (req, res) => {
  res.status(200).json({ message: 'Get all sports - Implementation pending' });
});

// Get sports by venue ID
router.get('/sports/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;
    
    const { data: sports, error } = await adminClient
      .from('sports')
      .select('*')
      .eq('venue_id', venueId);

    if (error) throw error;
    
    res.status(200).json(sports);
  } catch (error) {
    console.error('Error fetching venue sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

// Get sport by ID
router.get('/sports/:sportId', async (req, res) => {
  try {
    const { sportId } = req.params;
    
    const { data: sport, error } = await adminClient
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .single();

    if (error) throw error;
    
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found' });
    }
    
    res.status(200).json(sport);
  } catch (error) {
    console.error('Error fetching sport:', error);
    res.status(500).json({ error: 'Failed to fetch sport' });
  }
});

// Get venue sports details (specific sport at venue)
router.get('/venues/:venueId/sports/:sportId', async (req, res) => {
  try {
    const { venueId, sportId } = req.params;
    
    const { data: sport, error } = await adminClient
      .from('sports')
      .select(`
        *,
        venues (*)
      `)
      .eq('venue_id', venueId)
      .eq('id', sportId)
      .single();

    if (error) throw error;
    
    if (!sport) {
      return res.status(404).json({ error: 'Sport not found at this venue' });
    }
    
    res.status(200).json(sport);
  } catch (error) {
    console.error('Error fetching venue sport details:', error);
    res.status(500).json({ error: 'Failed to fetch sport details' });
  }
});

router.post('/sports', 
  authorizeRoles('ADMIN'),
  (req, res) => {
    res.status(201).json({ message: 'Create sport - Implementation pending' });
  }
);

// Get venues by owner email
router.get('/venues/allVenues/:ownerEmail', 
  authenticateToken,
  async (req, res) => {
    try {
      const { ownerEmail } = req.params;
      
      const { data: venues, error } = await adminClient
        .from('venues')
        .select(`
          *,
          sports (*)
        `)
        .eq('owner_email', ownerEmail);

      if (error) throw error;
      
      res.status(200).json(venues);
    } catch (error) {
      console.error('Error fetching owner venues:', error);
      res.status(500).json({ error: 'Failed to fetch venues' });
    }
  }
);

// Search venues
router.get('/venues/search', (req, res) => {
  res.status(200).json({ message: 'Search venues - Implementation pending' });
});

// Get venues by location
router.get('/venues/location/:city', (req, res) => {
    res.status(200).json({ message: 'Get venues by location - Implementation pending' });
});

// Comments routes (reviews for venues)
router.get('/comments/sport/:venueId', async (req, res) => {
  try {
    // For now, return empty array - would need comments table
    res.status(200).json([]);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.get('/comments/getRating/:venueId', async (req, res) => {
  try {
    // For now, return default rating - would need ratings table
    res.status(200).json({ averageRating: 4.5, totalReviews: 0 });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

router.post('/comments', async (req, res) => {
  try {
    // For now, just return success - would need comments table
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Earnings routes for facility owners
router.get('/earnings/:facilityOwnerEmail/monthly', 
  authenticateToken,
  authorizeRoles('FACILITY_OWNER', 'ADMIN'),
  async (req, res) => {
    try {
      // For now, return mock data - would need proper earnings calculation
      const mockEarnings = [
        { month: 'Jan', earnings: 5000 },
        { month: 'Feb', earnings: 6500 },
        { month: 'Mar', earnings: 7200 },
        { month: 'Apr', earnings: 8100 },
        { month: 'May', earnings: 7800 },
        { month: 'Jun', earnings: 9200 }
      ];
      res.status(200).json(mockEarnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      res.status(500).json({ error: 'Failed to fetch earnings' });
    }
  }
);

// Venue verification (for admin)
router.put('/venues/verify/:venueId', 
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { venueId } = req.params;
      
      const { error } = await adminClient
        .from('venues')
        .update({ verified: true })
        .eq('id', venueId);

      if (error) throw error;
      
      res.status(200).json({ message: 'Venue verified successfully' });
    } catch (error) {
      console.error('Error verifying venue:', error);
      res.status(500).json({ error: 'Failed to verify venue' });
    }
  }
);module.exports = router;
