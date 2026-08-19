import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useRealtime({
  table,
  event = '*',
  filter,
  onChange,
  enabled = true,
  schema = 'public',
}) {
  useEffect(() => {
    if (!enabled || !supabase || !table || typeof onChange !== 'function') {
      return undefined;
    }

    const channel = supabase.channel(`realtime:${table}`);

    channel.on('postgres_changes', { event, schema, table, filter }, (payload) => {
      onChange(payload);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, table, event, filter, onChange, schema]);
}