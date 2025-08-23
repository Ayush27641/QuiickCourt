const jwtService = require('../services/jwtService');
const supabaseService = require('../services/supabaseService');

class UserService {
  async register(userData) {
    try {
      // Hash password before saving
      userData.password = await jwtService.hashPassword(userData.password);
      
      // Normalize role format - convert ROLE_* to just the role name
      let normalizedRole = userData.role?.toUpperCase() || 'USER';
      if (normalizedRole.startsWith('ROLE_')) {
        normalizedRole = normalizedRole.replace('ROLE_', '');
      }
      
      // Use Supabase client instead of Sequelize
      const result = await supabaseService.insert('users', {
        email: userData.email,
        password: userData.password,
        first_name: userData.fullName?.split(' ')[0] || userData.fullName,
        last_name: userData.fullName?.split(' ').slice(1).join(' ') || '',
        role: normalizedRole,
        profile_image: userData.avatarUrl || null,
        phone: userData.phone || null,
        address: userData.address || null,
        city: userData.city || null,
        state: userData.state || null,
        country: userData.country || null,
        postal_code: userData.postal_code || null,
        date_of_birth: userData.date_of_birth || null,
        gender: userData.gender || null,
        is_verified: userData.verified || false,
        is_active: true
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Remove password from response
      const user = result.data[0];
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Use Supabase client instead of Sequelize
      const result = await supabaseService.select('users', '*', { email: email });
      
      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('User not found');
      }

      const user = result.data[0];
      const isValidPassword = await jwtService.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwtService.generateToken({
        email: user.email,
        role: user.role,
        fullName: `${user.first_name} ${user.last_name}`.trim()
      });

      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await supabaseService.select('users', '*', { email: email });
      
      if (result.success && result.data && result.data.length > 0) {
        const user = result.data[0];
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(email, updateData) {
    try {
      if (updateData.password) {
        updateData.password = await jwtService.hashPassword(updateData.password);
      }

      // First find the user to get their ID
      const userResult = await supabaseService.select('users', 'id', { email: email });
      if (!userResult.success || !userResult.data || userResult.data.length === 0) {
        throw new Error('User not found');
      }

      const userId = userResult.data[0].id;
      const result = await supabaseService.update('users', userId, updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return await this.findByEmail(email);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(email) {
    try {
      // First find the user to get their ID
      const userResult = await supabaseService.select('users', 'id', { email: email });
      if (!userResult.success || !userResult.data || userResult.data.length === 0) {
        return false;
      }

      const userId = userResult.data[0].id;
      const result = await supabaseService.delete('users', userId);
      return result.success;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const result = await supabaseService.select('users', 'id,email,first_name,last_name,role,is_verified,is_active,created_at');
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
