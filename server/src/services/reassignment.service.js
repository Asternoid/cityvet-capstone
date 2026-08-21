export const findReplacementTechnicians = async ({
  barangayId,
  preferredDate,
  excludeTechnicianId,
  technicianMap,
  leaveRequests = [],
  appointmentCounts = {},
  dailyCapacity = 3,
}) => {
  const candidateIds = [...new Set(
    (technicianMap || [])
      .filter((mapping) => mapping.barangay_id === barangayId && mapping.technician_id !== excludeTechnicianId)
      .map((mapping) => mapping.technician_id)
  )];

  const isOnLeave = (technicianId) => {
    const date = preferredDate;
    return (leaveRequests || []).some((leave) => {
      if (leave.technician_id !== technicianId || leave.status !== 'confirmed') return false;
      return date >= leave.start_date && date <= leave.end_date;
    });
  };

  const eligible = candidateIds.filter((technicianId) => {
    if (isOnLeave(technicianId)) return false;

    const scheduled = appointmentCounts?.[technicianId]?.[preferredDate] || 0;
    return scheduled < dailyCapacity;
  });

  return eligible;
};

export default findReplacementTechnicians;
