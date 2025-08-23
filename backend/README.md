# OdooHackathon 2025 - Backend

A comprehensive Node.js/Express.js backend application converted from the original Java Spring Boot implementation. This backend provides a complete sports facility booking platform with features including user management, booking system, AI integration, real-time chat, and more.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Booking Management** - Complete booking system for sports facilities
- **AI Integration** - Powered by Ollama for recommendations and analysis
- **Real-time Communication** - Socket.IO for chat and notifications
- **Email Service** - Automated email notifications and confirmations
- **Task Scheduling** - Automated reminders and cleanup tasks
- **Payment Integration** - Stripe integration for secure payments
- **File Upload** - Support for images and documents

### Modules
- **User Registration & Management**
- **Facility & Venue Management**
- **Sports Management**
- **Booking & Slot Management**
- **Game Matching & Invitations**
- **Chat & Messaging**
- **Refund Management**
- **AI-Powered Recommendations**
- **WebSocket for Real-time Features**

## 🛠 Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **Payments**: Stripe
- **AI**: Ollama Integration
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, CORS
- **Task Scheduling**: node-cron
- **Testing**: Jest & Supertest

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- PostgreSQL database
- Ollama (for AI features)
- SMTP email service credentials
- Stripe account (for payments)

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=OdooHackathon2025
DB_USER=postgres
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# Socket Configuration
SOCKET_PORT=8000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Ollama AI Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:1b

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

```bash
# Make sure PostgreSQL is running
# Create the database
createdb OdooHackathon2025

# The application will automatically sync the database schema on startup
```

### 4. Ollama Setup (for AI features)

```bash
# Install Ollama (visit https://ollama.ai for installation instructions)

# Pull the required model
ollama pull gemma3:1b

# Start Ollama service
ollama serve
```

### 5. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8080`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── userController.js    # User management
│   │   ├── bookingController.js # Booking operations
│   │   └── aiController.js      # AI integration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Booking.js           # Booking model
│   │   ├── Venue.js             # Venue model
│   │   └── index.js             # Model associations
│   ├── routes/
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── bookingRoutes.js     # Booking endpoints
│   │   ├── aiRoutes.js          # AI endpoints
│   │   └── ...                  # Other route files
│   ├── services/
│   │   ├── userService.js       # User business logic
│   │   ├── bookingService.js    # Booking business logic
│   │   ├── emailService.js      # Email operations
│   │   ├── socketService.js     # WebSocket handling
│   │   ├── aiService.js         # AI integration
│   │   └── taskSchedulerService.js # Scheduled tasks
│   └── utils/
│       └── helpers.js           # Utility functions
├── tests/                       # Test files
├── .env                         # Environment variables
├── package.json                 # Dependencies and scripts
└── server.js                    # Main application entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/user/my-bookings` - Get user bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/slots/available` - Get available slots

### AI Features
- `POST /api/ai/recommendations/booking` - Get booking recommendations
- `POST /api/ai/recommendations/matching` - Get game matching suggestions
- `POST /api/ai/fitness/workout-plan` - Generate workout plan
- `POST /api/ai/chatbot` - Chat with AI assistant

### Facilities
- `GET /api/facilities/venues` - Get all venues
- `POST /api/facilities/venues` - Create venue (facility owners only)
- `GET /api/facilities/sports` - Get all sports

### Real-time Features
- WebSocket endpoint: `ws://localhost:8080/socket.io/`
- Events: `join_room`, `send_message`, `game_invitation`, etc.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs with salt rounds
- **Rate Limiting** - Protection against abuse
- **CORS Protection** - Cross-origin resource sharing configuration
- **Helmet** - Security headers
- **Input Validation** - Joi schema validation
- **SQL Injection Protection** - Sequelize ORM with parameterized queries

## 📊 Monitoring & Logging

- **Health Check Endpoint**: `GET /health`
- **Request Logging**: Morgan middleware
- **Error Handling**: Centralized error handling middleware
- **Task Monitoring**: Scheduled task status tracking

## 🔄 Scheduled Tasks

The application includes several automated tasks:

- **Booking Reminders**: Hourly check for upcoming bookings
- **Booking Cleanup**: Daily cleanup of expired bookings
- **Daily Reports**: Generate usage statistics

## 🚀 Deployment

### Environment Variables for Production

Make sure to set appropriate values for production:

```env
NODE_ENV=production
# Use secure JWT secret
JWT_SECRET=your_production_jwt_secret
# Use production database
DB_HOST=your_production_db_host
# Use production email service
EMAIL_HOST=your_production_smtp_host
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common issues

## 🔄 Migration from Java

This Node.js backend is a complete conversion of the original Java Spring Boot application, maintaining:

- ✅ All core functionalities
- ✅ Database schema compatibility
- ✅ API endpoint compatibility
- ✅ Security features
- ✅ Real-time capabilities
- ✅ AI integration
- ✅ Email services
- ✅ Task scheduling

The conversion provides better performance, easier deployment, and a more modern development experience while maintaining full feature parity with the original Java implementation.
