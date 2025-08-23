require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log('🧪 Testing QuickCourt database...');
    
    // Test 1: Check if tables exist
    console.log('📋 Checking tables...');
    
    const tables = ['users', 'sports', 'venues', 'bookings', 'booking_slots'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Table accessible`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // Test 2: Check sports data
    console.log('\n🏀 Checking sports data...');
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('*');
      
    if (sportsError) {
      console.log('❌ Sports data error:', sportsError.message);
    } else {
      console.log(`✅ Sports data: ${sports.length} sports available`);
      sports.forEach(sport => {
        console.log(`   ${sport.icon} ${sport.name}`);
      });
    }
    
    // Test 3: Test user registration simulation
    console.log('\n👤 Testing user operations...');
    const testUser = {
      email: 'testuser@quickcourt.com',
      password: 'hashedpassword123',
      first_name: 'Test',
      last_name: 'User',
      role: 'user'
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
      
    if (userError) {
      console.log('❌ User creation error:', userError.message);
    } else {
      console.log('✅ User creation: Success');
      console.log(`   Created user: ${userData[0].email}`);
      
      // Clean up test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'testuser@quickcourt.com');
        
      if (!deleteError) {
        console.log('🧹 Test user cleaned up');
      }
    }
    
    console.log('\n🎉 Database test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabase();
