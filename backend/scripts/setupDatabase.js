require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesDirectly() {
  console.log('🔧 Creating database tables in Supabase...');
  
  try {
    // Method 1: Create users table by attempting an insert and handling the error
    console.log('👥 Setting up users table...');
    
    // Try to create a dummy user to trigger table creation
    const testUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'setup@test.com',
      password: 'setup123',
      first_name: 'Setup',
      last_name: 'User',
      role: 'USER',
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // This approach uses Supabase's auto-table creation feature
    const { data: insertResult, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (insertError) {
      if (insertError.message.includes('relation "public.users" does not exist')) {
        console.log('❌ Users table does not exist. Please create it manually.');
        console.log('📋 Here\'s what to do:');
        console.log('1. Go to https://supabase.com/dashboard/project/' + process.env.SUPABASE_URL.split('//')[1].split('.')[0]);
        console.log('2. Go to SQL Editor');
        console.log('3. Run this SQL:');
        console.log('\n-- Create users table');
        console.log(`CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'FACILITY_OWNER', 'ADMIN')),
  profile_image TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sports table
CREATE TABLE public.sports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sports
INSERT INTO public.sports (name, description, icon) VALUES
  ('Basketball', 'Fast-paced team sport played on a court', '🏀'),
  ('Tennis', 'Racket sport played on a rectangular court', '🎾'),
  ('Football', 'Popular team sport played with a spherical ball', '⚽'),
  ('Badminton', 'Racket sport played with a shuttlecock', '🏸'),
  ('Cricket', 'Bat-and-ball game played between two teams', '🏏'),
  ('Volleyball', 'Team sport where teams are separated by a net', '🏐'),
  ('Swimming', 'Individual or team sport using the whole body', '🏊'),
  ('Table Tennis', 'Indoor sport also known as ping pong', '🏓');

-- Create venues table
CREATE TABLE public.venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  amenities TEXT[],
  images TEXT[],
  operating_hours JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id VARCHAR(255),
  booking_status VARCHAR(50) DEFAULT 'active' CHECK (booking_status IN ('active', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_slots table
CREATE TABLE public.booking_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, sport_id, date, start_time, end_time)
);`);
        console.log('\n4. Click "Run" to execute');
        console.log('\n⚠️  After creating tables, run this script again to test.');
      } else {
        console.log('❌ Insert error:', insertError.message);
      }
    } else {
      console.log('✅ Users table exists and working!');
      // Clean up test user
      await supabase.from('users').delete().eq('email', 'setup@test.com');
      console.log('🧹 Test data cleaned up');
    }
    
    // Test if we can access other tables
    const tablesToTest = ['sports', 'venues', 'bookings', 'booking_slots'];
    
    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: Table accessible`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createTablesDirectly();
