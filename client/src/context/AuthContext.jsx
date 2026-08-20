import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      if (!supabase) {
        setUser(null);
        setRole(null);
        setToken(null);
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || null;
      setToken(accessToken);

      if (!session) {
        setUser(null);
        setRole(null);
        return null;
      }

      try {
        const response = await API.get('/auth/me');
        const currentUser = response.data?.user || response.data?.data || null;

        if (currentUser) {
          setUser(currentUser);
          setRole(currentUser.role || session.user?.role || 'client');
          return currentUser;
        }
      } catch (apiError) {
        console.warn('Unable to load /auth/me, falling back to Supabase session user.', apiError);
      }

      const fallbackUser = {
        id: session.user?.id,
        email: session.user?.email,
        role: session.user?.role || 'client',
      };
      setUser(fallbackUser);
      setRole(fallbackUser.role);
      return fallbackUser;
    } catch (error) {
      console.error('Failed to load user session:', error);
      setUser(null);
      setRole(null);
      setToken(null);
      return null;
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

  const login = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Authentication is not configured. Add the Supabase environment variables and try again.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await fetchCurrentUser();
    return data;
  }, [fetchCurrentUser]);

  const logout = useCallback(async () => {
    // Clear local access immediately so the UI cannot remain in the portal
    // while a network sign-out request is pending.
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('supabase_access_token');

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Remote sign-out failed; local session was cleared.', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, role, token, loading, login, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};