import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../config/supabase';

// Create Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for Supabase queries
export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = async (callback) => {
    try {
      setLoading(true);
      setError(null);
      const result = await callback(supabase);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { query, loading, error };
};

// Custom hook for real-time subscriptions
export const useSupabaseSubscription = (table, callback, filters = {}) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        ...filters
      }, callback)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback, filters]);
};

// Custom hook for fetching data with real-time updates
export const useSupabaseData = (table, query = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let supabaseQuery = supabase.from(table).select('*');
      
      // Apply filters
      if (query.eq) {
        Object.entries(query.eq).forEach(([key, value]) => {
          supabaseQuery = supabaseQuery.eq(key, value);
        });
      }
      
      if (query.order) {
        supabaseQuery = supabaseQuery.order(query.order.column, { 
          ascending: query.order.ascending ?? true 
        });
      }
      
      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }
      
      const { data: result, error } = await supabaseQuery;
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [table, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscription
  useSupabaseSubscription(table, (payload) => {
    console.log('Real-time update:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setData(prev => [...prev, payload.new]);
        break;
      case 'UPDATE':
        setData(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
        break;
      case 'DELETE':
        setData(prev => prev.filter(item => item.id !== payload.old.id));
        break;
      default:
        // Refetch data for other events
        fetchData();
    }
  });

  return { data, loading, error, refetch: fetchData };
};

export default supabase;
