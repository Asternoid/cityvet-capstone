import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

if (API.defaults.baseURL.includes('localhost:5173')) {
  API.defaults.baseURL = 'http://localhost:5000/api';
}

// Keep the API token in sync with the Supabase session.
API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase?.auth.getSession() || { data: {} };
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default API;