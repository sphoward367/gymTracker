import type { Timestamp } from 'firebase/firestore';

/**
 * Format a Firestore Timestamp or Date for display.
 * Returns "Today", "Yesterday", or a date string like "15 Feb" / "15 Feb 2024"
 */
export function formatDate(date: Date | Timestamp): string {
  const d = date instanceof Date ? date : date.toDate();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';

  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  if (year === now.getFullYear()) return `${day} ${month}`;
  return `${day} ${month} ${year}`;
}

/**
 * Format a date as a short label for grouping history entries.
 * Returns "Today", "Yesterday", "This Week", or "Month Year"
 */
export function formatDateGroup(date: Date | Timestamp): string {
  const d = date instanceof Date ? date : date.toDate();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  return d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

/**
 * Format workout duration in seconds as a human-readable string.
 * e.g. 3661 → "1h 1m" or 125 → "2m 5s"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0m 0s';
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Format total volume in kg.
 * e.g. 12500 → "12.5k kg" or 850 → "850 kg"
 */
export function formatVolume(volume: number): string {
  if (!isFinite(volume) || volume < 0) return '0 kg';
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
  return `${Math.round(volume)} kg`;
}

/**
 * Format a weight value. Omits trailing zeros.
 * e.g. 100 → "100", 102.5 → "102.5"
 */
export function formatWeight(weight: number): string {
  if (!isFinite(weight) || weight < 0) return '0';
  return weight % 1 === 0 ? String(weight) : weight.toFixed(1);
}

/** Compact chart axis label — always "D Mon", never "Today"/"Yesterday". */
export function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  return `${day} ${month}`;
}
