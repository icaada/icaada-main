const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const absolute = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** "5 minutes ago", "yesterday", or "12 Mar 2026" for anything older than a week. */
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return 'just now';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return absolute.format(date);
}

export const initialsOf = (text: string) =>
  text.split(/\s+/).filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
