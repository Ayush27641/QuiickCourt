const { supabase, supabaseAdmin } = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.client = supabase;
    this.adminClient = supabaseAdmin;
  }

  // Authentication methods
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUser(accessToken) {
    try {
      const { data, error } = await this.client.auth.getUser(accessToken);
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Database methods using Supabase client
  async insert(table, data) {
    try {
      // Use admin client for user operations to bypass RLS
      const client = table === 'users' ? this.adminClient : this.client;
      
      const { data: result, error } = await client
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async select(table, columns = '*', filters = {}) {
    try {
      // Use admin client for user operations to bypass RLS
      const client = table === 'users' ? this.adminClient : this.client;
      
      let query = client.from(table).select(columns);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(table, id, updates) {
    try {
      // Use admin client for user operations to bypass RLS
      const client = table === 'users' ? this.adminClient : this.client;
      
      const { data, error } = await client
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(table, id) {
    try {
      // Use admin client for user operations to bypass RLS
      const client = table === 'users' ? this.adminClient : this.client;
      
      const { error } = await client
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time subscriptions
  subscribeToTable(table, callback, filters = {}) {
    let subscription = this.client
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        ...filters
      }, callback);
    
    subscription.subscribe();
    return subscription;
  }

  // File storage methods
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFileUrl(bucket, path) {
    try {
      const { data } = this.client.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return { success: true, url: data.publicUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin methods (using service role key)
  async adminGetUsers() {
    try {
      const { data, error } = await this.adminClient.auth.admin.listUsers();
      if (error) throw error;
      return { success: true, users: data.users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async adminCreateUser(email, password, metadata = {}) {
    try {
      const { data, error } = await this.adminClient.auth.admin.createUser({
        email,
        password,
        user_metadata: metadata,
        email_confirm: true
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async adminDeleteUser(userId) {
    try {
      const { error } = await this.adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SupabaseService();
