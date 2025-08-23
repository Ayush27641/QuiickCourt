const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expirationTime = process.env.JWT_EXPIRATION || '24h';
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expirationTime });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = new JwtService();
