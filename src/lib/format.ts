export function relativeFromNow(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const mins = Math.max(1, Math.floor(diff / 60000));
  return `${mins} min${mins === 1 ? "" : "s"} ago`;
}

export function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(m?: number) {
  return m && m >= 1 && m <= 12 ? MONTHS[m - 1] : undefined;
}

export const MONTH_OPTIONS = MONTHS.map((name, i) => ({ value: String(i + 1), label: name }));
