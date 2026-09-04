/**
 * Compact timestamp used in conversation list items and message bubbles.
 *  - Today       -> "HH:mm"          (e.g. "14:32")
 *  - Yesterday   -> "Yesterday"
 *  - This week   -> weekday          (e.g. "Mon")
 *  - This year   -> "MMM D"          (e.g. "Mar 5")
 *  - Otherwise   -> "MMM D, YYYY"    (e.g. "Mar 5, 2024")
 */
export function formatChatTime(input: string | null | undefined): string {
  if (!input) {
    return '';
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const now = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Just now", "5m ago", "2h ago", "3d ago", or a fixed date. */
export function formatRelativeShort(input: string | null | undefined): string {
  if (!input) {
    return '';
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return formatChatTime(input);
  }
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return formatChatTime(input);
}
