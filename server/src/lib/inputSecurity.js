import xss from 'xss';
import { z } from 'zod';

const plainTextOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

export const sanitizeText = (value) => (
  typeof value === 'string' ? xss(value.trim(), plainTextOptions).trim() : ''
);

const isCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const email = z.string().trim().toLowerCase().email().max(254);
const fullName = z.string().trim().min(2).max(100).regex(/^[\p{L}\s.'-]+$/u);
const date = z.string().refine(isCalendarDate, 'Invalid date.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const registrationSchema = z.object({
  email,
  password: z.string().min(8).max(128),
  fullName,
  contactNumber: z.string().trim().regex(/^09\d{9}$/),
  barangayId: z.coerce.number().int().positive(),
});

export const profileSchema = z.object({ fullName });

export const bookingSchema = z.object({
  serviceId: z.union([z.string(), z.number()]).transform(String).pipe(z.string().trim().min(1).max(100)),
  preferredDate: date,
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  animalDescription: z.string().max(200),
  concernRemarks: z.string().max(500).optional().default(''),
});

export const feedbackSchema = z.object({
  appointmentId: z.union([z.string(), z.number()]).transform(String).pipe(z.string().trim().min(1).max(100)),
  feedbackText: z.string().max(2000),
});

export const leaveRequestSchema = z.object({
  startDate: date,
  endDate: date,
  reason: z.string().max(1000),
});

export const validationError = (result, res, message = 'Please check the submitted details.') => {
  if (result.success) return null;
  return res.status(400).json({ success: false, error: message });
};
