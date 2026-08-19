import { useEffect, useState } from 'react';
import API from '../api/axios';

const fallbackAppointments = [
  { id: 'APT-2026-015', client: 'Juan dela Cruz', service: 'Rabies Vaccination', date: '2026-08-18', status: 'pending', technician: 'Dr. S. Cruz' },
  { id: 'APT-2026-118', client: 'Maria Santos', service: 'Deworming', date: '2026-08-18', status: 'confirmed', technician: 'A. Gomez' },
  { id: 'APT-2026-201', client: 'Leo Ramos', service: 'Treatment of Animals', date: '2026-08-19', status: 'urgent', technician: 'R. Lim' },
];

export default function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get('/health').catch(() => null);

        if (!response || !active) {
          setAppointments(fallbackAppointments);
          return;
        }

        setAppointments(response.data?.appointments || fallbackAppointments);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Unable to load appointments.');
        setAppointments(fallbackAppointments);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAppointments();

    return () => {
      active = false;
    };
  }, []);

  return { appointments, loading, error };
}
