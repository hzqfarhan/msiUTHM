import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a time string (HH:mm or HH:mm:ss) to 12-hour format.
 */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format a date string to Malaysian locale.
 */
export function formatDateMY(date: string | Date): string {
  return new Date(date).toLocaleDateString('ms-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 jam lagi", "30 minit lagi").
 */
export function formatCountdown(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Sekarang';

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get or create an anonymous session ID for analytics.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('msi_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('msi_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Get today's date string in YYYY-MM-DD format for Malaysia timezone.
 */
export function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
}

/**
 * Parse a time string (HH:mm) into a Date object for today.
 */
export function timeToToday(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  now.setHours(h, m, 0, 0);
  return now;
}
