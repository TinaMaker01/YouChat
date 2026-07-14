import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string into a concise relative time string (e.g., "now", "2m", "1h", "Sun").
 * @param dateString - The ISO date string or timestamp.
 * @returns A formatted relative time string.
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';

  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates or extremely small differences
  if (diffInSeconds < 30) return 'now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    // Check if it's the same calendar day
    const isSameDay = now.toDateString() === date.toDateString();
    if (isSameDay) return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  // Older than a week
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
