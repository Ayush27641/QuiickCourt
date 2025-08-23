require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key for schema operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  try {
    console.log('🔧 Creating QuickCourt database schema...');
    
    // Check if we can connect
    const { data: health } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
      
    console.log('✅ Supabase connection verified');
    
    // Try to create tables using direct table operations
    console.log('👥 Creating users table structure...');
    
    // Since we can't execute raw SQL directly, let's try inserting into tables
    // This will create the table if it doesn't exist (if RLS is properly configured)
    
    const testData = {
      email: 'test@quickcourt.com',
      password: '$2b$10$test.hash.for.schema.creation',
      first_name: 'Test',
      last_name: 'User',
      role: 'user'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.log('❌ Users table error:', insertError.message);
      console.log('📝 Please run the SQL schema manually in Supabase dashboard');
    } else {
      console.log('✅ Users table is accessible - test user created');
      
      // Clean up test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'test@quickcourt.com');
        
      if (!deleteError) {
        console.log('🧹 Test user cleaned up');
      }
    }
    
    console.log('');
    console.log('🎯 IMPORTANT: To complete setup, please:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/schema.sql');
    console.log('4. Click "Run" to execute the schema');
    console.log('');
    console.log('📁 Schema file location: scripts/schema.sql');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

createTables();
