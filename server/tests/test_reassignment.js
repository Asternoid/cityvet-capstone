import assert from 'assert';
import { findReplacementTechnicians } from '../src/services/reassignment.service.js';

(async () => {
  try {
    const replacements = await findReplacementTechnicians({
      barangayId: 10,
      preferredDate: '2026-08-26',
      excludeTechnicianId: 'tech-1',
      technicianMap: [
        { technician_id: 'tech-1', barangay_id: 10, is_primary: true },
        { technician_id: 'tech-2', barangay_id: 10, is_primary: false },
        { technician_id: 'tech-3', barangay_id: 20, is_primary: true }
      ],
      leaveRequests: [
        { technician_id: 'tech-1', start_date: '2026-08-25', end_date: '2026-08-27', status: 'confirmed' }
      ],
      appointmentCounts: {
        'tech-2': { '2026-08-26': 1 },
        'tech-3': { '2026-08-26': 4 }
      },
      dailyCapacity: 3
    });

    assert.deepStrictEqual(replacements, ['tech-2']);
    console.log('Reassignment queue test passed');
    process.exit(0);
  } catch (error) {
    console.error('Reassignment queue test failed:', error.message);
    process.exit(2);
  }
})();
