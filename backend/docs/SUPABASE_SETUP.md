# Supabase Integration Setup Guide

This guide will help you set up Supabase integration for the QuickCourt project.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js installed
3. QuickCourt project dependencies installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `QuickCourt` or `OdooHackathon2025`
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Project API Keys**:
     - `anon` key (public key)
     - `service_role` key (secret key - keep this secure!)

3. Go to **Settings** → **Database** and copy:
   - **Host** (something like `db.xxxxx.supabase.co`)
   - **Database name** (usually `postgres`)
   - **Port** (usually `5432`)
   - **User** (usually `postgres`)
   - **Password** (the one you set during project creation)

## Step 3: Update Environment Variables

### Backend (.env file)

Update your `backend/.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Supabase Database Configuration (Direct PostgreSQL connection)
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-db-password
```

### Frontend (.env file)

Update your `frontend/.env` file:

```env
# Supabase Configuration for Frontend
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL
VITE_API_URL=http://localhost:8080
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `backend/scripts/supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create all the necessary tables, indexes, triggers, and sample data.

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**` for development
   - Enable the authentication providers you want (Email, Google, etc.)

## Step 6: Set Up Row Level Security (Optional)

The schema includes basic RLS policies, but you may want to customize them:

1. Go to **Authentication** → **Policies**
2. Review and modify the policies as needed
3. You can disable RLS for development by running:
   ```sql
   ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
   ```

## Step 7: Set Up Storage (Optional)

If you need file uploads:

1. Go to **Storage** in Supabase dashboard
2. Create buckets for:
   - `profile-images` (for user avatars)
   - `venue-images` (for venue photos)
   - `documents` (for any documents)

3. Set up storage policies for each bucket

## Step 8: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Check the console for any connection errors

## Features Available with Supabase Integration

### Backend Services
- `SupabaseService` - Complete service for database operations
- Authentication methods (signUp, signIn, signOut)
- Real-time subscriptions
- File upload capabilities
- Admin functions

### Frontend Services
- Supabase client configuration
- Ready for authentication integration
- Real-time updates
- File upload support

## Usage Examples

### Backend (Node.js)
```javascript
const supabaseService = require('./src/services/supabaseService');

// Sign up a new user
const result = await supabaseService.signUp('user@example.com', 'password');

// Insert data
const booking = await supabaseService.insert('bookings', {
  user_id: userId,
  venue_sport_id: venueId,
  booking_date: '2025-08-18'
});

// Subscribe to real-time changes
const subscription = supabaseService.subscribeToTable('bookings', (payload) => {
  console.log('Booking updated:', payload);
});
```

### Frontend (React)
```javascript
import { supabase } from './config/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});

// Query data
const { data: bookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', userId);
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure your Supabase credentials are correct
2. **RLS blocking queries**: Check your Row Level Security policies
3. **CORS errors**: Make sure your site URL is configured in Supabase Auth settings
4. **Schema errors**: Ensure the SQL script ran successfully without errors

### Useful Supabase Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- View RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Disable RLS for development (be careful!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

## Next Steps

1. Set up your Supabase project using this guide
2. Update the environment variables with your actual credentials
3. Run the database schema script
4. Test the connection
5. Start building your QuickCourt features!

For more information, visit the [Supabase Documentation](https://supabase.com/docs).
