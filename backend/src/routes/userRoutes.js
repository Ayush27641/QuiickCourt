const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Get user data by email (for login/auth purposes)
router.get('/data/:email', authenticateToken, userController.getUserByEmail);

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.delete('/profile', authenticateToken, userController.deleteAccount);

// Admin only routes
router.get('/all', authenticateToken, authorizeRoles('ADMIN'), userController.getAllUsers);

module.exports = router;
