import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';

export default function useAdminData(endpoint, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(endpoint, { params });
      setData(response.data?.data ?? response.data ?? null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
