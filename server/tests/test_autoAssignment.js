import assert from 'assert';
import { runAutoAssignmentWithClient } from '../src/services/autoAssignment.service.js';

// Minimal mock Supabase client tailored to runAutoAssignment's usage
const createMockSupabase = ({ service, maps, leavesMap, appointmentCounts }) => {
  const makeBuilder = (table) => {
    const ctx = { table };
    const builder = {
      select: (...args) => { ctx.selectArgs = args; return builder; },
      eq: (key, val) => { ctx.eq = ctx.eq || {}; ctx.eq[key] = val; return builder; },
      lte: () => builder,
      gte: () => builder,
      not: () => builder,
      order: async () => {
        if (table === 'barangay_technician_map') return { data: maps, error: null };
        return { data: [], error: null };
      },
      single: async () => {
        if (table === 'services') return { data: service, error: null };
        if (table === 'appointments' && ctx._inserted) return { data: ctx._inserted, error: null };
        return { data: null, error: { message: 'not found' } };
      },
      maybeSingle: async () => ({ data: null, error: null }),
      insert: (arr) => { ctx._inserted = { ...arr[0], id: 'mock-apt-1' }; return builder; },
      then: async (resolve) => {
        if (table === 'appointments' && ctx.selectArgs && ctx.selectArgs[1] && ctx.selectArgs[1].head) {
          const techId = ctx.eq && ctx.eq.technician_id;
          const date = ctx.eq && ctx.eq.preferred_date;
          const count = (appointmentCounts[techId] && appointmentCounts[techId][date]) || 0;
          return resolve({ count });
        }
        return resolve({ data: [] });
      }
    };
    return builder;
  };

  return {
    from(table) { return makeBuilder(table); }
  };
};

(async () => {
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const mockSupabase = createMockSupabase({
    service: { id: 1, urgency_type: 'routine' },
    maps: [{ technician_id: 'tech-1', is_primary: true }],
    leavesMap: {},
    appointmentCounts: { 'tech-1': { [futureDate]: 2 } }
  });

  const params = {
    clientId: 'client-1',
    serviceId: 1,
    barangayId: 10,
    preferredDate: futureDate,
    preferredTime: '09:00 AM',
    animalDescription: 'small dog'
  };

  try {
    // quick pre-check: ensure mock returns the service row
    const svcCheck = await mockSupabase.from('services').select('*').eq('id', 1).single();
    console.log('Service check:', svcCheck);
    const result = await runAutoAssignmentWithClient(mockSupabase, params);
    console.log('Auto-assignment result:', result);
    assert.strictEqual(result.technician_id, 'tech-1');
    assert.strictEqual(result.estimated_service_date, futureDate);
    console.log('Auto-assignment test passed');
    process.exit(0);
  } catch (err) {
    console.error('Auto-assignment test failed:', err);
    process.exit(2);
  }
})();
