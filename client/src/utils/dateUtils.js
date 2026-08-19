export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return 'N/A';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-PH', options).format(date);
}

export function formatTime(value) {
  if (!value) return 'N/A';
  const [hours, minutes] = String(value).split(':');
  const parsedHours = Number(hours);
  const suffix = parsedHours >= 12 ? 'PM' : 'AM';
  const normalized = ((parsedHours + 11) % 12 + 1);
  return `${normalized}:${minutes || '00'} ${suffix}`;
}

export function formatAppointmentDateTime(date, time) {
  if (!date) return 'TBD';
  const formattedDate = formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' });
  return time ? `${formattedDate} • ${formatTime(time)}` : formattedDate;
}

export function isPastDate(value) {
  if (!value) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

export function getDefaultDateInputValue(daysFromNow = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export function formatStatusLabel(status) {
  if (!status) return 'Pending';
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default {
  formatDate,
  formatTime,
  formatAppointmentDateTime,
  isPastDate,
  getDefaultDateInputValue,
  formatStatusLabel,
};