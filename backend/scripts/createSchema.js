require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSchema() {
  try {
    console.log('🔧 Creating database schema in Supabase...');
    
    // Create users table
    console.log('👥 Creating users table...');
    const usersSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'facility_owner', 'admin')),
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
    `;
    
    const { data: usersData, error: usersError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'users');
    
    if (usersError || !usersData.length) {
      // Table doesn't exist, create it using raw SQL
      const { error } = await supabase.rpc('exec', { 
        sql: usersSQL 
      });
      
      if (error) {
        console.log('❌ Users table error:', error.message);
      } else {
        console.log('✅ Users table created successfully');
      }
    } else {
      console.log('✅ Users table already exists');
    }
    
    // Create sports table
    console.log('🏀 Creating sports table...');
    const sportsSQL = `
      CREATE TABLE IF NOT EXISTS public.sports (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: sportsError } = await supabase.rpc('exec', { 
      sql: sportsSQL 
    });
    
    if (sportsError) {
      console.log('❌ Sports table error:', sportsError.message);
    } else {
      console.log('✅ Sports table created successfully');
    }
    
    // Create venues table
    console.log('🏟️ Creating venues table...');
    const venuesSQL = `
      CREATE TABLE IF NOT EXISTS public.venues (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    `;
    
    const { error: venuesError } = await supabase.rpc('exec', { 
      sql: venuesSQL 
    });
    
    if (venuesError) {
      console.log('❌ Venues table error:', venuesError.message);
    } else {
      console.log('✅ Venues table created successfully');
    }
    
    // Create bookings table
    console.log('📅 Creating bookings table...');
    const bookingsSQL = `
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    `;
    
    const { error: bookingsError } = await supabase.rpc('exec', { 
      sql: bookingsSQL 
    });
    
    if (bookingsError) {
      console.log('❌ Bookings table error:', bookingsError.message);
    } else {
      console.log('✅ Bookings table created successfully');
    }
    
    // Create booking_slots table
    console.log('⏰ Creating booking_slots table...');
    const slotsSQL = `
      CREATE TABLE IF NOT EXISTS public.booking_slots (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
      );
    `;
    
    const { error: slotsError } = await supabase.rpc('exec', { 
      sql: slotsSQL 
    });
    
    if (slotsError) {
      console.log('❌ Booking slots table error:', slotsError.message);
    } else {
      console.log('✅ Booking slots table created successfully');
    }
    
    console.log('🎉 Database schema creation completed!');
    console.log('📋 Tables created: users, sports, venues, bookings, booking_slots');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error);
  }
}

createSchema();
