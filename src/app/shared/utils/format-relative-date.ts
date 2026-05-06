export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return diffHours === 0 ? 'hace poco' : `hace ${diffHours}h`;
  }

  if (diffDays === 1) {
    return 'ayer';
  }

  const month = d.toLocaleString('es', { month: 'short' });
  const day = d.getDate();
  return `${day} ${month}`;
}
