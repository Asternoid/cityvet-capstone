import API from '../api/axios';

export const getDashboardSummary = async () => {
  try {
    const response = await API.get('/health');
    return response?.data || { status: 'ok' };
  } catch (error) {
    return { status: 'fallback', message: error?.message || 'API unavailable' };
  }
};

export default API;
