import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const configuredBaseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '').endsWith('/api')
    ? configuredBaseUrl.replace(/\/$/, '')
    : `${configuredBaseUrl.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: apiBaseUrl,
});

// Keep the API token in sync with the Supabase session.
API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase?.auth.getSession() || { data: {} };
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default API;