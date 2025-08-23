// QuickCourt API & Schema Validation Report
// Generated: 2025-08-17

// DATABASE SCHEMA (Supabase PostgreSQL)
// Table: public.users
const DB_USER_SCHEMA = {
  id: "UUID DEFAULT gen_random_uuid() PRIMARY KEY",
  email: "VARCHAR(255) UNIQUE NOT NULL",
  password: "VARCHAR(255) NOT NULL", 
  first_name: "VARCHAR(100)",
  last_name: "VARCHAR(100)",
  phone: "VARCHAR(20)",
  role: "VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'FACILITY_OWNER', 'ADMIN'))",
  profile_image: "TEXT",
  date_of_birth: "DATE",
  gender: "VARCHAR(10)",
  address: "TEXT",
  city: "VARCHAR(100)",
  state: "VARCHAR(100)",
  country: "VARCHAR(100)",
  postal_code: "VARCHAR(20)",
  is_verified: "BOOLEAN DEFAULT FALSE",
  is_active: "BOOLEAN DEFAULT TRUE",
  created_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
  updated_at: "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
};

// BACKEND VALIDATION SCHEMA (Joi)
const BACKEND_VALIDATION = {
  registration: {
    email: "Joi.string().email().required()",
    password: "Joi.string().min(6).required()",
    fullName: "Joi.string().min(2).required()",
    avatarUrl: "Joi.string().uri().optional()",
    role: "Joi.string().valid('USER', 'FACILITY_OWNER', 'ADMIN', 'ROLE_USER', 'ROLE_FACILITY_OWNER', 'ROLE_ADMIN').optional()",
    verified: "Joi.boolean().optional()",
    phone: "Joi.string().optional()",
    address: "Joi.string().optional()",
    city: "Joi.string().optional()",
    state: "Joi.string().optional()",
    country: "Joi.string().optional()",
    postal_code: "Joi.string().optional()",
    date_of_birth: "Joi.date().optional()",
    gender: "Joi.string().optional()"
  },
  login: {
    email: "Joi.string().email().required()",
    password: "Joi.string().required()"
  }
};

// BACKEND FIELD MAPPING (Service Layer)
const BACKEND_FIELD_MAPPING = {
  // Frontend → Database
  "fullName": "first_name + last_name (split by space)",
  "avatarUrl": "profile_image",
  "role": "role (normalized: ROLE_USER → USER)",
  "verified": "is_verified",
  "phone": "phone",
  "address": "address", 
  "city": "city",
  "state": "state",
  "country": "country",
  "postal_code": "postal_code",
  "date_of_birth": "date_of_birth",
  "gender": "gender"
};

// DATABASE → FRONTEND MAPPING (getUserByEmail response)
const DB_TO_FRONTEND_MAPPING = {
  "first_name + last_name": "fullName",
  "first_name": "firstName", 
  "last_name": "lastName",
  "role": "role (with ROLE_ prefix: USER → ROLE_USER)",
  "profile_image": "profileImage",
  "is_verified": "isVerified",
  "is_active": "isActive",
  "date_of_birth": "dateOfBirth",
  "postal_code": "postalCode",
  "created_at": "createdAt",
  "updated_at": "updatedAt"
};

// FRONTEND FORM FIELDS (Registration)
const FRONTEND_REGISTRATION_FIELDS = {
  required: [
    "fullName",    // Maps to: first_name + last_name  
    "email",       // Maps to: email
    "password",    // Maps to: password (hashed)
    "role"         // Maps to: role (ROLE_USER → USER)
  ],
  optional: [
    "avatarUrl",   // Maps to: profile_image
    "verified"     // Maps to: is_verified
  ]
};

// API ENDPOINTS STATUS
const API_ENDPOINTS = {
  // User Management
  "POST /api/users/register": "✅ WORKING - Creates new user",
  "POST /api/users/login": "✅ WORKING - Authenticates user", 
  "GET /api/users/data/:email": "🔄 NEEDS TESTING - Get user by email",
  "GET /api/users/profile": "🔄 NEEDS TESTING - Get current user profile",
  "PUT /api/users/profile": "🔄 NEEDS TESTING - Update user profile",
  "DELETE /api/users/profile": "🔄 NEEDS TESTING - Delete user account",
  "GET /api/users/all": "🔄 NEEDS TESTING - Get all users (Admin only)",
  
  // Other endpoints from routes
  "GET /health": "✅ WORKING - Server health check",
  "POST /api/bookings/*": "❓ UNKNOWN - Booking endpoints",
  "GET /api/facilities/*": "❓ UNKNOWN - Facility endpoints", 
  "GET /api/games/*": "❓ UNKNOWN - Game endpoints",
  "GET /api/chat/*": "❓ UNKNOWN - Chat endpoints",
  "GET /api/refunds/*": "❓ UNKNOWN - Refund endpoints",
  "GET /api/ai/*": "❓ UNKNOWN - AI endpoints"
};

// KNOWN ISSUES TO FIX
const ISSUES_FOUND = [
  {
    issue: "Server stops when making requests",
    priority: "HIGH",
    description: "Backend server terminates unexpectedly during API calls",
    solution: "Investigate error handling and process management"
  },
  {
    issue: "GET /api/users/data/:email route not accessible", 
    priority: "HIGH",
    description: "Route returns 'Route not found' even though it's defined",
    solution: "Verify route registration and server restart"
  },
  {
    issue: "Missing field mappings in registration",
    priority: "MEDIUM", 
    description: "Optional fields (phone, address, etc.) not mapped in userService.register()",
    solution: "✅ FIXED - Added all field mappings"
  }
];

// FRONTEND API CALL PATTERNS
const FRONTEND_API_PATTERNS = {
  "UserLogin.jsx": {
    login: "POST /api/users/login",
    getUserData: "GET /api/users/data/${email}"
  },
  "UserRegister.jsx": {
    register: "POST /api/users/register"
  },
  "AdminLogin.jsx": {
    login: "POST /api/users/login", 
    getUserData: "GET /api/users/data/${email}"
  },
  "UserManagement.jsx": {
    getAllUsers: "GET /api/users/all"
  },
  "ProfilePage.jsx": {
    getUserData: "GET /api/users/data/${email}"
  }
};

console.log("QuickCourt Schema & API Validation Report Generated");
console.log("Status: Field mappings verified, some endpoints need testing");
console.log("Next: Test remaining API endpoints and fix server stability issues");
