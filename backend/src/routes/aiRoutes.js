const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public health check
router.get('/health', aiController.getHealthCheck);

// Protected routes - require authentication
router.use(authenticateToken);

// Booking recommendations
router.post('/recommendations/booking', aiController.getBookingRecommendations);

// Game matching suggestions
router.post('/recommendations/matching', aiController.getGameMatchingSuggestions);

// Facility management advice (facility owners only)
router.post('/advice/facility', 
  authorizeRoles('FACILITY_OWNER', 'ADMIN'), 
  aiController.getFacilityManagementAdvice
);

// Workout plan generation
router.post('/fitness/workout-plan', aiController.getWorkoutPlan);

// Sports analysis
router.post('/analysis/sports', aiController.getSportsAnalysis);

// Chatbot interface
router.post('/chatbot', aiController.chatbot);

module.exports = router;
