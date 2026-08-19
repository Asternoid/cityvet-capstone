const statusConfig = {
  pending_technician_confirmation: { label: 'Pending Confirmation', tone: 'bg-amber-light text-amber-warm' },
  technician_confirmed: { label: 'Technician Confirmed', tone: 'bg-green-light text-green-forest' },
  in_progress: { label: 'In Progress', tone: 'bg-teal-deep/10 text-teal-deep' },
  completed: { label: 'Completed', tone: 'bg-green-light text-green-forest' },
  no_show: { label: 'No-Show', tone: 'bg-red-light text-red-muted' },
  reassignment_needed: { label: 'Reassignment Needed', tone: 'bg-amber-light text-amber-warm' },
  cancelled: { label: 'Cancelled', tone: 'bg-off-white text-gray-mid' },
  confirmed: { label: 'Confirmed', tone: 'bg-green-light text-green-forest' },
  pending: { label: 'Pending', tone: 'bg-amber-light text-amber-warm' },
  urgent: { label: 'Urgent', tone: 'bg-red-light text-red-muted' },
  inProgress: { label: 'In Progress', tone: 'bg-teal-deep/10 text-teal-deep' },
  noShow: { label: 'No-Show', tone: 'bg-red-light text-red-muted' },
};

export default function StatusBadge({ status = 'default', children, className = '' }) {
  const config = statusConfig[status] || { label: status === 'default' ? 'Status' : status, tone: 'bg-off-white text-charcoal' };
  const label = children || config.label;

  return (
    <span className={`inline-flex items-center rounded-badge px-2.5 py-1 text-xs font-medium ${config.tone} ${className}`}>
      {label}
    </span>
  );
}
