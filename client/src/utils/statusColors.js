export const statusColors = {
  pending_technician_confirmation: 'bg-amber-light text-amber-warm',
  technician_confirmed: 'bg-green-light text-green-forest',
  in_progress: 'bg-teal-deep/10 text-teal-deep',
  completed: 'bg-green-light text-green-forest',
  no_show: 'bg-red-light text-red-muted',
  cancelled: 'bg-off-white text-gray-mid',
  reassignment_needed: 'bg-amber-light text-amber-warm',
  confirmed: 'bg-green-light text-green-forest',
  pending: 'bg-amber-light text-amber-warm',
  urgent: 'bg-red-light text-red-muted',
  inProgress: 'bg-teal-deep/10 text-teal-deep',
  noShow: 'bg-red-light text-red-muted',
  default: 'bg-off-white text-charcoal',
};

export function getStatusColor(status) {
  return statusColors[status] || statusColors.default;
}

export default statusColors;