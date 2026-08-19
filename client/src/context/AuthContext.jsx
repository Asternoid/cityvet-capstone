import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      if (!supabase) {
        setUser(null);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }
      const res = await API.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to load user session:', err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      await fetchCurrentUser();
      if (mounted) setLoading(false);
    }

    loadSession();
    const subscription = supabase?.auth.onAuthStateChange(async () => {
      await fetchCurrentUser();
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.data?.subscription?.unsubscribe();
    };
  }, [fetchCurrentUser]);

  const logout = async () => {
    await supabase?.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);