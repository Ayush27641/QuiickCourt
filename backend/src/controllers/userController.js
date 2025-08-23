const userService = require('../services/userService');
const Joi = require('joi');

// Validation schemas
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).required(),
  avatarUrl: Joi.string().uri().optional(),
  role: Joi.string().valid('USER', 'FACILITY_OWNER', 'ADMIN', 'ROLE_USER', 'ROLE_FACILITY_OWNER', 'ROLE_ADMIN').optional(),
  verified: Joi.boolean().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  country: Joi.string().optional(),
  postal_code: Joi.string().optional(),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

class UserController {
  async register(req, res) {
    try {
      // Validate request body
      const { error, value } = registrationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      // Check if user already exists
      const existingUser = await userService.findByEmail(value.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already in use' });
      }

      // Register user
      const user = await userService.register(value);
      
      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Could not register user' });
    }
  }

  async login(req, res) {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const result = await userService.login(value.email, value.password);
      
      res.status(200).json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'User not found' || error.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  }

  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await userService.findByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data with role formatted for frontend
      const userData = {
        email: user.email,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        role: `ROLE_${user.role}`, // Convert USER to ROLE_USER for frontend
        phone: user.phone,
        profileImage: user.profile_image,
        isVerified: user.is_verified,
        isActive: user.is_active,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postal_code,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };

      res.status(200).json(userData);
    } catch (error) {
      console.error('Get user by email error:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const updateData = req.body;
      delete updateData.email; // Prevent email update
      
      const user = await userService.updateUser(req.user.email, updateData);
      
      res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  async deleteAccount(req, res) {
    try {
      const deleted = await userService.deleteUser(req.user.email);
      
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Failed to get users' });
    }
  }
}

module.exports = new UserController();
