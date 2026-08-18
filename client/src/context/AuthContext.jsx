import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await API.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('supabase_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('supabase_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);